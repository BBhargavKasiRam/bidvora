import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ added

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ STRONG EMAIL REGEX
  const emailRegex =
    /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateStep = () => {
    if (step === 1) {
      const email = form.email.trim();

      if (!email) return "Email is required";
      if (!emailRegex.test(email))
        return "Enter valid email";
    }

    if (step === 2) {
      if (!form.password) return "Password is required";
    }

    return null;
  };

  const handleNext = async () => {
    if (loading) return; // ✅ prevent spam

    const err = validateStep();

    if (err) {
      setError(err + " "); // ✅ always show error
      return;
    }

    setError("");

    // STEP CHANGE
    if (step === 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(2);
        setAnimating(false);
      }, 200);
      return;
    }

    // LOGIN
    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      login(res.token, res.user);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials";

      setError(msg + " ");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");

    setAnimating(true);

    setTimeout(() => {
      setStep(1);
      setAnimating(false);
    }, 200);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4 overflow-hidden">

      <div className="max-w-xl w-full p-14 rounded-2xl bg-white border border-ink/5 shadow-xl">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif mb-2">Welcome Back</h2>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-10"
        >

          <div
            className={`transition-all duration-200 ${
              animating
                ? "opacity-0 translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >

            {/* EMAIL */}
            {step === 1 && (
              <input
                autoFocus
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({
                    ...form,
                    email: e.target.value.trimStart(), // ✅ trim
                  });
                  setError("");
                }}
                className="w-full border-b border-ink/10 py-4 text-lg outline-none"
              />
            )}

            {/* PASSWORD */}
            {step === 2 && (
              <input
                autoFocus
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setError("");
                }}
                className="w-full border-b border-ink/10 py-4 text-lg outline-none"
              />
            )}
          </div>

          <div className="flex justify-between items-center">
            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-xs uppercase tracking-widest text-ink/60"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading} // ✅ block spam
              className="ml-auto px-10 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] rounded-full hover:bg-gold transition"
            >
              {loading
                ? "Please wait..."
                : step === 1
                ? "Next"
                : "Login"}
            </button>
          </div>

        </form>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink/40">
          New to Bidvora?{" "}
          <Link
            to="/register"
            className="text-ink font-bold hover:text-gold transition-colors"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};