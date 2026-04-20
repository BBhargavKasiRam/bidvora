import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer", // Default role
  });

  const [error, setError] = useState("");
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
        const msg = err.response?.data?.message || err.message || "Something went wrong";
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
      <div className="max-w-xl w-full p-14 rounded-2xl bg-white border border-ink/5 shadow-xl">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-serif">Join Bidvora</h2>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form className="space-y-10">
          <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
            {step === 1 && (
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Full Name</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value.trimStart() }); setError(""); }}
                  className="w-full border-b border-ink/10 py-5 text-xl outline-none"
                />
              </div>
            )}
            {step === 2 && (
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Email Address</label>
                <input
                  autoFocus
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value.trimStart() }); setError(""); }}
                  className="w-full border-b border-ink/10 py-5 text-xl outline-none"
                />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
                    className="w-full border-b border-ink/10 py-4 text-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setError(""); }}
                    className="w-full border-b border-ink/10 py-4 text-xl outline-none"
                  />
                </div>

                {/* ROLE SELECTION ADDED HERE */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/40 block mb-3 font-bold">I want to...</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "buyer" })}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border transition-all duration-300 ${
                        form.role === "buyer" 
                        ? "bg-ink text-white border-ink" 
                        : "bg-white text-ink/40 border-ink/10 hover:border-ink/30"
                      }`}
                    >
                      Buy Items
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "seller" })}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border transition-all duration-300 ${
                        form.role === "seller" 
                        ? "bg-ink text-white border-ink" 
                        : "bg-white text-ink/40 border-ink/10 hover:border-ink/30"
                      }`}
                    >
                      Sell Items
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="text-xs uppercase tracking-widest text-ink/60">Back</button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="ml-auto px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition"
            >
              {loading ? "Please wait..." : step < 3 ? "Next" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};