import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or missing reset token. Please request a new one.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", { email, token, newPassword: password });
      setMessage(res.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full p-14 rounded-2xl bg-white border border-ink/5 shadow-xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif mb-2">Create New Password</h2>
          <p className="text-xs uppercase tracking-widest text-ink/60">Enter your new password below</p>
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
            {message} <br/> Redirecting to login...
          </div>
        )}

        {(!error || error.includes("Passwords")) && !message && token && email && (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                New Password
              </label>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-ink/10 py-5 text-xl outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-b border-ink/10 py-5 text-xl outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <Link to="/login" className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
        
        {(!token || !email) && (
            <div className="text-center mt-8">
              <Link to="/forgot-password" className="text-xs uppercase tracking-widest font-bold text-ink hover:text-gold">
                Request New Link
              </Link>
            </div>
        )}
      </div>
    </div>
  );
};
