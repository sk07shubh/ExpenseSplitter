# Bill Spitter - Updated Version

## What changed

- Signup requires a payment QR image.
- QR images are stored as small Base64 data URIs in MongoDB for this simple learning project.
- The home screen groups shared expenses into friend cards.
- Each friend card shows the total amount currently owed to that friend.
- The header shows the total remaining amount the logged-in user owes.
- Tapping **Pay** opens the friend's QR image.
- Tapping **I Paid** changes each matching unpaid share to `requested`.
- The person who originally paid sees payment requests and can approve them.
- A share changes to `paid` only after approval, so it remains in the debtor's balance until then.
- Repeated expenses with the same friend are aggregated automatically.
- Styling was changed lightly to a simple purple theme.

## Install

From `myApp`:

```bash
npm install
npx expo start
```

The Expo SDK 57 image picker dependency is `expo-image-picker@~57.0.20`. Expo's SDK 57 documentation lists that as the recommended version.

From `expense-backend`:

```bash
npm install
node server.js
```

Keep your existing `.env` locally. Do not commit it. A template is provided as `.env.example`.

## Important data note

This version deliberately keeps QR storage simple so it is easy to understand while learning. Production apps would normally store images in object storage and save only the image URL in MongoDB.

## Payment flow

```text
Debtor opens friend card
        ↓
Pay
        ↓
Friend QR opens
        ↓
Debtor pays outside the app
        ↓
I Paid
        ↓
Backend: pending → requested
        ↓
Creditor sees Payment request
        ↓
Approve
        ↓
Backend: requested → paid
        ↓
Debtor's amount is removed from remaining balance
```
