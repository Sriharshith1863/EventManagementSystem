// src/utils/fetchWithRefresh.js
export const fetchWithRefresh = async (url, options = {}) => {
  options.credentials = "include";

  let res = await fetch(url, options);

  if (res.status === 407) {
    // Try refresh
    const refresh = await fetch("http://localhost:3000/api/auth/refresh-access-token", {
      method: "GET",
      credentials: "include",
    });

    if (refresh.ok) {
      // Retry original request
      res = await fetch(url, options);
    } else {
      // Still failed → return original 401
      const error = new Error("Session expired. Please log in again.");
      error.statusCode = 407;
      throw error;
    }
  }

  return res;
};
