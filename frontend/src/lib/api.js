// Pointing to your local Express backend running on port 5000
const API_BASE = "http://localhost:5000/api";

export const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.message || error.error || "Something went wrong"
      );
    }

    return res.json();
  },

  post: async (endpoint, data) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();

      // 🔥 FIXED ERROR HANDLING
      throw new Error(
        error.message || error.error || "Something went wrong"
      );
    }

    return res.json();
  },
};