import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Mail, ShieldCheck, Lock } from "lucide-react";
import { api } from "../lib/api";

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");
    
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Please enter the 6-digit OTP");
    
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/verify-otp", { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", { email, otp, newPassword: password });
      setMessage(res.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full p-10 md:p-14 rounded-2xl bg-white border border-ink/5 shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-ink/5">
          <div 
            className="h-full bg-gold transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
            {step === 1 && <Mail size={32} />}
            {step === 2 && <ShieldCheck size={32} />}
            {step === 3 && <Lock size={32} />}
          </div>
          <h2 className="text-4xl font-serif mb-2">
            {step === 1 && "Reset Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "New Password"}
          </h2>
          <p className="text-xs uppercase tracking-widest text-ink/60">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a secure new password"}
          </p>
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

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-10">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                Email Address
              </label>
              <input
                autoFocus
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border-b border-ink/10 py-5 text-xl outline-none focus:border-gold transition-colors"
              />
            </div>

            <div className="flex justify-between items-center">
              <Link to="/login" className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink">
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition disabled:opacity-50 shadow-lg shadow-ink/20"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-10">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                Verification Code
              </label>
              <input
                autoFocus
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full border-b border-ink/10 py-5 text-4xl tracking-[0.5em] text-center outline-none focus:border-gold transition-colors font-serif"
              />
            </div>

            <div className="flex justify-between items-center">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink"
              >
                Change Email
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition disabled:opacity-50 shadow-lg shadow-ink/20"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-10">
            <div className="space-y-8">
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                  New Password
                </label>
                <div className="relative">
                  <input
                    autoFocus
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-ink/10 py-4 pr-12 text-xl outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ink/40 hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-b border-ink/10 py-4 text-xl outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition disabled:opacity-50 shadow-lg shadow-ink/20"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
