import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.message);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full p-14 rounded-2xl bg-white border border-ink/5 shadow-xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif mb-2">Reset Password</h2>
          <p className="text-xs uppercase tracking-widest text-ink/60">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-8 p-4 bg-green-50 text-green-700 text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-green-600">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                Email Address
              </label>
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-ink/10 py-5 text-xl outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <Link to="/login" className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink">
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Link"}
              </button>
            </div>
          </form>
        )}
        {message && (
            <div className="text-center mt-8">
              <Link to="/login" className="text-xs uppercase tracking-widest font-bold text-ink hover:text-gold">
                Back to Login
              </Link>
            </div>
        )}
      </div>
    </div>
  );
};
