import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const emailRegex =
    /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateStep = () => {
    if (step === 1) {
      const email = form.email.trim();

      if (!email) return "Email is required";
      if (!emailRegex.test(email)) return "Enter valid email";
    }

    if (step === 2) {
      if (!form.password) return "Password is required";
    }

    return null;
  };

  const handleNext = async () => {
    if (loading) return;

    const err = validateStep();
    if (err) {
      setError(err + " ");
      return;
    }

    setError("");

    // 🔥 STEP 1 → CHECK EMAIL FIRST
    if (step === 1) {
      try {
        setLoading(true);

        await api.post("/auth/check-login-email", {
          email: form.email.trim().toLowerCase(),
        });

        // ✅ ONLY IF EMAIL EXISTS → GO TO PASSWORD
        setAnimating(true);
        setTimeout(() => {
          setStep(2);
          setAnimating(false);
        }, 200);

      } catch (err) {
        let msg = "Email not registered";

        if (err && err.message && !err.message.includes("JSON")) {
          msg = err.message;
        }

        setError(msg + " "); // ❌ stay on email
      } finally {
        setLoading(false);
      }

      return;
    }

    // 🔥 STEP 2 → LOGIN
    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      login(res.token, res.user);
      navigate("/");

    } catch (err) {
      let msg = "Login failed";

      if (err && err.message && !err.message.includes("JSON")) {
        msg = err.message;
      }

      setError(msg + " ");

      // 🔥 KEEP USER ON CORRECT STEP
      if (msg.toLowerCase().includes("email")) {
        setStep(1);
      } else if (msg.toLowerCase().includes("password")) {
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return;

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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-10">

          <div className={`transition-all duration-200 ${
            animating ? "opacity-0 translate-x-4" : "opacity-100"
          }`}>

            {/* EMAIL */}
            {step === 1 && (
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                  Email Address
                </label>
                <input
                  autoFocus
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      email: e.target.value.trimStart(),
                    });
                    setError("");
                  }}
                  className="w-full border-b border-ink/10 py-5 text-xl outline-none"
                />
              </div>
            )}

            {/* PASSWORD */}
            {step === 2 && (
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                  Password
                </label>
                <input
                  autoFocus
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setError("");
                  }}
                  className="w-full border-b border-ink/10 py-5 text-xl outline-none"
                />
              </div>
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
              disabled={loading}
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