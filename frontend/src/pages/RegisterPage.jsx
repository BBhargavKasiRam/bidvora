import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ added

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ STRONG EMAIL REGEX
  const emailRegex =
    /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return "Name is required";
      if (form.name.trim().length < 3)
        return "Minimum 3 characters required";
    }

    if (step === 2) {
      const email = form.email.trim();

      if (!email) return "Email is required";
      if (!emailRegex.test(email))
        return "Enter valid email (example@gmail.com)";
    }

    if (step === 3) {
      if (!form.password) return "Password is required";

      if (!passwordRegex.test(form.password))
        return "8+ chars, upper, lower, number, special char";

      if (!form.confirmPassword)
        return "Confirm your password";

      if (form.password !== form.confirmPassword)
        return "Passwords do not match";
    }

    return null;
  };

  const handleNext = async () => {
    if (loading) return; // ✅ prevent spam click

    const err = validateStep();

    if (err) {
      setError(err + " "); // ✅ always re-render
      return;
    }

    setError("");

    if (step < 3) {
      setAnimating(true);

      setTimeout(() => {
        setStep((prev) => prev + 1);
        setAnimating(false);
      }, 200);

      return;
    }

    // ✅ FINAL SUBMIT
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
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
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

          <div
            className={`transition-all duration-200 ${
              animating
                ? "opacity-0 translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >

            {step === 1 && (
              <input
                autoFocus
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value.trimStart() }); // ✅ trim
                  setError("");
                }}
                className="w-full border-b border-ink/10 py-4 text-lg outline-none"
              />
            )}

            {step === 2 && (
              <input
                autoFocus
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value.trimStart() }); // ✅ trim
                  setError("");
                }}
                className="w-full border-b border-ink/10 py-4 text-lg outline-none"
              />
            )}

            {step === 3 && (
              <>
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

                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      confirmPassword: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full border-b border-ink/10 py-4 text-lg outline-none"
                />
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            {step > 1 && (
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
              disabled={loading} // ✅ prevent spam
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
