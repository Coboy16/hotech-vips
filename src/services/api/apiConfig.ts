export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

console.log("[apiConfig] API Base URL:", apiConfig.baseURL);
