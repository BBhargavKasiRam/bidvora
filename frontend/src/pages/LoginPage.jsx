import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.token, res.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-12 bg-white border border-ink/5 shadow-2xl">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif mb-2">Welcome Back</h2>
        <p className="text-xs uppercase tracking-widest text-ink/40">Enter your credentials to enter the hub</p>
      </div>
      
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
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
        <button className="w-full py-5 bg-ink text-paper text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-colors font-bold shadow-xl shadow-ink/10">
          Authenticate
        </button>
      </form>
      
      <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink/40">
        New to Bidvora? <Link to="/register" className="text-ink font-bold hover:text-gold transition-colors">Create an account</Link>
      </p>
    </div>
  );
};
