const API_BASE = "http://localhost:5000/api";

export const api = {
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

    const text = await res.text(); // ✅ read raw response

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(text || "Server returned invalid response");
    }

    // ✅ ADDED: better debug (optional but useful)
    if (!res.ok) {
      console.error("API POST ERROR:", result); // 🔥 ADD
      throw new Error(result.message || result.error || "Something went wrong");
    }

    return result;
  },

  get: async (endpoint) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const text = await res.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(text || "Server returned invalid response");
    }

    // ✅ ADDED: better debug (optional but useful)
    if (!res.ok) {
      console.error("API GET ERROR:", result); // 🔥 ADD
      throw new Error(result.message || result.error || "Something went wrong");
    }

    return result;
  },
};