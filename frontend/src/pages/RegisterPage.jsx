import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password, role });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-12 bg-white border border-ink/5 shadow-2xl">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif mb-2">Join Bidvora</h2>
        <p className="text-xs uppercase tracking-widest text-ink/40">Become part of the elite collector circle</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full border-b border-ink/10 py-3 focus:border-gold outline-none transition-colors font-light text-lg"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full border-b border-ink/10 py-3 focus:border-gold outline-none transition-colors font-light text-lg"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full border-b border-ink/10 py-3 focus:border-gold outline-none transition-colors font-light text-lg"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">Account Type</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            className="w-full border-b border-ink/10 py-3 focus:border-gold outline-none transition-colors font-light bg-transparent text-lg"
          >
            <option value="buyer">Buyer / Collector</option>
            <option value="seller">Seller / Curator</option>
          </select>
        </div>
        <button className="w-full py-5 bg-ink text-paper text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-colors font-bold shadow-xl shadow-ink/10">
          Create Account
        </button>
      </form>
    </div>
  );
};
