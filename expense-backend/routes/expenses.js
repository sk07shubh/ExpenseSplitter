const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function getSettlement(expense, userId) {
  return expense.settlements.find((item) => item.user._id.toString() === userId);
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { description, amount, participantIds, qrImage, expenseDate } = req.body;
    const participants = [...new Set((participantIds || []).filter(Boolean).map(String))];
    if (!description || !amount || participants.length < 2 || !qrImage || !expenseDate) {
      return res.status(400).json({ error: "Description, amount, QR image and at least one friend are required" });
    }
    if (!participants.includes(req.userId)) participants.push(req.userId);
    const settlements = participants.filter((id) => id !== req.userId).map((user) => ({ user, status: "pending" }));
    const newExpense = new Expense({
  description: description.trim(),
  amount: Number(amount),
  expenseDate: new Date(expenseDate),
  qrImage,
  paidBy: req.userId,
  splitAmong: participants,
  settlements
});
    await newExpense.save();
    res.json(newExpense);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ $or: [{ paidBy: req.userId }, { splitAmong: req.userId }] })
      .populate("paidBy", "name email")
      .populate("splitAmong", "name email")
      .populate("settlements.user", "name email")
      .sort({ createdAt: -1 });

    const perExpense = expenses.map((exp) => {
      const share = exp.amount / exp.splitAmong.length;
      const isPayer = exp.paidBy._id.toString() === req.userId;
      const settlement = getSettlement(exp, req.userId);
      const unpaidParticipants = exp.settlements.filter((item) => item.status !== "paid").length;
      const paidParticipants = exp.settlements.length - unpaidParticipants;
      let historyStatus = "paid";
      if (isPayer) historyStatus = unpaidParticipants === 0 ? "settled" : "collecting";
      else if (settlement?.status === "paid") historyStatus = "paid";
      else if (settlement?.status === "requested") historyStatus = "awaiting approval";
      else historyStatus = "to pay";
      return { _id: exp._id, description: exp.description, amount: exp.amount, share, qrImage: exp.qrImage, paidBy: exp.paidBy, splitAmong: exp.splitAmong, settlementStatus: isPayer ? "paid" : settlement?.status || "pending", isPayer, isSettled: isPayer || settlement?.status === "paid", historyStatus, participantCount: exp.splitAmong.length, paidParticipants, unpaidParticipants, createdAt: exp.createdAt,expenseDate: exp.expenseDate, };
    });

    const outstanding = perExpense.filter((item) => !item.isSettled && !item.isPayer);
    const friendMap = new Map();
    for (const item of outstanding) {
      const id = item.paidBy._id.toString();
      const current = friendMap.get(id) || { _id: id, name: item.paidBy.name, email: item.paidBy.email, qrImage: item.qrImage, amount: 0, expenseIds: [] };
      current.amount += item.share; current.expenseIds.push(item._id); current.qrImage = item.qrImage; friendMap.set(id, current);
    }

    const owedToMe = new Map();
    for (const exp of expenses.filter((e) => e.paidBy._id.toString() === req.userId)) {
      const share = exp.amount / exp.splitAmong.length;
      for (const settlement of exp.settlements) {
        if (settlement.status === "paid") continue;
        const id = settlement.user._id.toString();
        const current = owedToMe.get(id) || { _id: id, name: settlement.user.name, email: settlement.user.email, amount: 0 };
        current.amount += share; owedToMe.set(id, current);
      }
    }

    const friendIds = new Set([...friendMap.keys(), ...owedToMe.keys()]);
    const friends = [...friendIds].map((id) => {
      const youOwe = friendMap.get(id); const theyOwe = owedToMe.get(id);
      return { _id: id, name: youOwe?.name || theyOwe?.name, email: youOwe?.email || theyOwe?.email, youOwe: youOwe?.amount || 0, theyOwe: theyOwe?.amount || 0, expenseIds: youOwe?.expenseIds || [], qrImage: youOwe?.qrImage || null, hasRequestedPayment: outstanding.some((item) => item.paidBy._id.toString() === id && item.settlementStatus === "requested") };
    });

    const totalOutstanding = outstanding.reduce((sum, item) => sum + item.share, 0);
    const paymentRequests = [];
    for (const exp of expenses.filter((e) => e.paidBy._id.toString() === req.userId)) {
      const share = exp.amount / exp.splitAmong.length;
      for (const settlement of exp.settlements) if (settlement.status === "requested") paymentRequests.push({ expenseId: exp._id, description: exp.description, amount: share, from: settlement.user, requestedAt: settlement.requestedAt, createdAt: exp.createdAt });
    }
    res.json({ expenses: perExpense, friends, owedToMe: [...owedToMe.values()], paymentRequests, totalOutstanding });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/request-payment", authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: "Friend is required" });
    const expenses = await Expense.find({ paidBy: friendId, splitAmong: req.userId });
    let changed = 0;
    for (const expense of expenses) {
      const settlement = expense.settlements.find((item) => item.user.toString() === req.userId);
      if (settlement && settlement.status === "pending") { settlement.status = "requested"; settlement.requestedAt = new Date(); changed++; await expense.save(); }
    }
    if (!changed) return res.status(400).json({ error: "There is no unpaid amount for this friend" });
    res.json({ message: "Payment request sent" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/:id/approve-payment", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, paidBy: req.userId });
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    const settlement = expense.settlements.find((item) => item.user.toString() === req.body.userId);
    if (!settlement || settlement.status !== "requested") return res.status(400).json({ error: "No payment request found" });
    settlement.status = "paid"; settlement.approvedAt = new Date(); await expense.save();
    res.json({ message: "Payment approved" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
