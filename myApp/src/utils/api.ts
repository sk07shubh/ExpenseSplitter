import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: replace with YOUR computer's LAN IP (see backend README)
// Do not use "localhost" - your phone can't reach your computer's localhost.
const API_URL = "https://expensesplitter-dfc4.onrender.com";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
