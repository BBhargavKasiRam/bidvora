import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle, signInWithMicrosoft, signInWithFacebook } from "../lib/firebase";

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
    otp: "",
  });

  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return "Name is required";
      if (form.name.trim().length < 3) return "Minimum 3 characters required";
    }
    if (step === 2) {
      const email = form.email.trim();
      if (!email) return "Email is required";
      if (!emailRegex.test(email)) return "Enter valid email";
    }
    if (step === 3) {
      if (!form.password) return "Password is required";
      if (!passwordRegex.test(form.password))
        return "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";
      if (!form.confirmPassword) return "Confirm your password";
      if (form.password !== form.confirmPassword) return "Passwords do not match";
      if (!form.role) return "Please select an account type";
    }
    return null;
  };

  const handleNext = async () => {
    if (loading) return;

    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setError("");

    if (step === 2) {
      try {
        setLoading(true);
        await api.post("/auth/check-register-email", {
          email: form.email.trim().toLowerCase(),
        });

        setAnimating(true);
        setTimeout(() => {
          setStep(3);
          setAnimating(false);
        }, 200);

      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Email already registered";
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 3) {
      try {
        setLoading(true);
        await api.post("/auth/send-register-otp", {
          email: form.email.trim().toLowerCase(),
        });

        setAnimating(true);
        setTimeout(() => {
          setStep(4);
          setAnimating(false);
        }, 200);

      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to send OTP";
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step < 4) {
      setAnimating(true);
      setTimeout(() => {
        setStep((prev) => prev + 1);
        setAnimating(false);
      }, 200);
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        otp: form.otp,
      });
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (providerName) => {
    if (socialLoading) return;
    try {
      setSocialLoading(providerName);
      setError("");
      
      let socialUser;
      if (providerName === 'google') socialUser = await signInWithGoogle();
      else if (providerName === 'microsoft') socialUser = await signInWithMicrosoft();
      else if (providerName === 'facebook') socialUser = await signInWithFacebook();
      
      const res = await api.post("/auth/social-login", {
        email: socialUser.email,
        name: socialUser.displayName,
        profile_image: socialUser.photoURL,
        uid: socialUser.uid
      });

      login(res.token, res.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(`${providerName.charAt(0).toUpperCase() + providerName.slice(1)} account connection failed.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleBack = () => {
    if (loading) return;
    setError("");
    setAnimating(true);
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setAnimating(false);
    }, 200);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center relative px-4 overflow-hidden">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="max-w-xl w-full p-14 glass-card relative overflow-hidden z-10 shadow-[0_20px_60px_rgba(42,35,24,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40"></div>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-serif text-ink letterpress">Join Bidvora</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-bold mt-2">Create your professional profile</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-4 border-red-600 rounded-r">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSocialSignup('google')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-ink/10 text-ink shadow-[0_2px_8px_rgba(42,35,24,0.08)] hover:shadow-[0_4px_16px_rgba(42,35,24,0.12)] hover:border-ink/20 transition-all hover-lift group rounded-lg"
            >
              {socialLoading === 'google' ? (
                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              )}
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink/70 group-hover:text-ink transition-colors">
                Register with Google
              </span>
            </button>

            <button
              onClick={() => handleSocialSignup('microsoft')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#2F2F2F] border border-[#2F2F2F] text-white shadow-[0_2px_8px_rgba(47,47,47,0.2)] hover:shadow-[0_4px_16px_rgba(47,47,47,0.4)] transition-all hover-lift group rounded-lg"
            >
              {socialLoading === 'microsoft' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-5 h-5" alt="Microsoft" />
              )}
              <span className="text-[10px] uppercase tracking-widest font-bold text-white transition-colors">
                Register with Microsoft
              </span>
            </button>

            <button
              onClick={() => handleSocialSignup('facebook')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#1877F2] border border-[#1877F2] text-white shadow-[0_2px_8px_rgba(24,119,242,0.2)] hover:shadow-[0_4px_16px_rgba(24,119,242,0.4)] transition-all hover-lift group rounded-lg"
            >
              {socialLoading === 'facebook' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-5 h-5 filter invert" alt="Facebook" />
              )}
              <span className="text-[10px] uppercase tracking-widest font-bold text-white transition-colors">
                Register with Facebook
              </span>
            </button>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-ink/10"></div>
            <span className="flex-shrink mx-4 text-[9px] uppercase tracking-widest font-bold text-ink/40">or sign up manually</span>
            <div className="flex-grow border-t border-ink/10"></div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
            <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-x-4" : "opacity-100"}`}>
              {step === 1 && (
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Full Name</label>
                  <input
                    autoFocus
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value.trimStart() });
                      setError("");
                    }}
                    className="w-full border-b border-ink/20 py-5 text-xl bg-transparent outline-none focus:border-gold transition-colors text-ink"
                  />
                </div>
              )}

              {step === 2 && (
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Email Address</label>
                  <input
                    autoFocus
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value.trimStart() });
                      setError("");
                    }}
                    className="w-full border-b border-ink/20 py-5 text-xl bg-transparent outline-none focus:border-gold transition-colors text-ink"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => {
                            setForm({ ...form, password: e.target.value });
                            setError("");
                          }}
                          className="w-full border-b border-ink/20 py-4 pr-10 text-xl bg-transparent outline-none focus:border-gold transition-colors text-ink"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ink/40 hover:text-gold transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Confirm</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(e) => {
                            setForm({ ...form, confirmPassword: e.target.value });
                            setError("");
                          }}
                          className="w-full border-b border-ink/20 py-4 pr-10 text-xl bg-transparent outline-none focus:border-gold transition-colors text-ink"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ink/40 hover:text-gold transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-ink/50 block mb-4 font-bold">Select Account Purpose</label>
                    <div className="flex gap-4">
                      {['buyer', 'consignor', 'auctioneer'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`flex-1 py-3 text-[9px] uppercase tracking-widest font-bold border rounded transition-all ${
                            form.role === r ? "bg-gold text-white border-gold shadow-[0_4px_12px_rgba(197,160,89,0.3)]" : "text-ink/50 border-ink/15 hover:border-gold/40 hover:text-ink bg-white"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-6">
                  <div className="mb-8">
                    <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Verification Code</label>
                    <p className="text-[10px] uppercase tracking-widest text-ink/60 mb-6">Sent to {form.email}</p>
                    <input
                      autoFocus
                      type="text"
                      maxLength={6}
                      value={form.otp}
                      onChange={(e) => {
                        setForm({ ...form, otp: e.target.value.replace(/\D/g, "") });
                        setError("");
                      }}
                      placeholder="000000"
                      className="w-full border-b border-ink/20 py-5 text-4xl tracking-[0.5em] text-center bg-transparent outline-none focus:border-gold transition-colors font-serif text-ink"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              {step > 1 && (
                <button type="button" onClick={handleBack} className="text-xs uppercase tracking-widest text-ink/60 font-bold hover:text-gold transition-colors">
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="ml-auto px-10 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-all font-bold shadow-[0_4px_16px_rgba(42,35,24,0.2)] hover:shadow-[0_6px_20px_rgba(197,160,89,0.4)] flex items-center justify-center gap-2 rounded"
              >
                {loading && <div className="w-3 h-3 border border-paper border-t-transparent rounded-full animate-spin" />}
                {step < 3 ? "Next" : step === 3 ? "Send OTP" : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-12 text-center text-[10px] uppercase tracking-widest text-ink/50 font-bold">
          Already have an account?{" "}
          <Link to="/login" className="text-gold font-bold hover:underline transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};