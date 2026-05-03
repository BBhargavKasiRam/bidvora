import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle } from "../lib/firebase";

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
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

    if (step < 3) {
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
      });
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (googleLoading) return;
    try {
      setGoogleLoading(true);
      setError("");
      const googleUser = await signInWithGoogle();
      
      const res = await api.post("/auth/google-login", {
        email: googleUser.email,
        name: googleUser.displayName,
        profile_image: googleUser.photoURL,
        uid: googleUser.uid
      });

      login(res.token, res.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Google account connection failed.");
    } finally {
      setGoogleLoading(false);
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
    <div className="h-[calc(100vh-80px)] bg-white flex items-center justify-center px-4 overflow-hidden">
      <div className="max-w-xl w-full p-14 rounded-2xl bg-white border border-ink/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-serif">Join Bidvora</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-bold mt-2">Create your professional profile</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 border border-ink/10 hover:bg-paper transition-all group"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            )}
            <span className="text-[10px] uppercase tracking-widest font-bold text-ink/60 group-hover:text-ink">
              Register with Google
            </span>
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-ink/5"></div>
            <span className="flex-shrink mx-4 text-[9px] uppercase tracking-widest font-bold text-ink/20">or sign up manually</span>
            <div className="flex-grow border-t border-ink/5"></div>
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
                    className="w-full border-b border-ink/10 py-5 text-xl outline-none focus:border-gold transition-colors"
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
                    className="w-full border-b border-ink/10 py-5 text-xl outline-none focus:border-gold transition-colors"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Password</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value });
                          setError("");
                        }}
                        className="w-full border-b border-ink/10 py-4 text-xl outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Confirm</label>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => {
                          setForm({ ...form, confirmPassword: e.target.value });
                          setError("");
                        }}
                        className="w-full border-b border-ink/10 py-4 text-xl outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-4 font-bold">Select Account Purpose</label>
                    <div className="flex gap-4">
                      {['buyer', 'consignor', 'auctioneer'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`flex-1 py-3 text-[9px] uppercase tracking-widest font-bold border transition-all ${
                            form.role === r ? "bg-ink text-white border-ink shadow-lg" : "text-ink/40 border-ink/10 hover:border-ink/20"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              {step > 1 && (
                <button type="button" onClick={handleBack} className="text-xs uppercase tracking-widest text-ink/60 font-bold hover:text-ink">
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="ml-auto px-10 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold shadow-xl flex items-center justify-center gap-2"
              >
                {loading && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
                {step < 3 ? "Next" : "Complete"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-12 text-center text-[10px] uppercase tracking-widest text-ink/40 font-bold">
          Already have an account?{" "}
          <Link to="/login" className="text-ink hover:text-gold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};