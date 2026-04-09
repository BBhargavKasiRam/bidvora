import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [duration, setDuration] = useState("3600");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auctions", { 
        title, 
        description, 
        starting_price: Number(startingPrice), 
        duration: Number(duration) 
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-16 bg-white border border-ink/5 shadow-2xl">
      <header className="mb-12">
        <h2 className="text-5xl font-serif mb-4">Curate New Auction</h2>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Provide the details for your masterpiece</p>
      </header>

      {error && (
        <div className="mb-10 p-4 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">Item Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full border-b border-ink/10 py-4 text-2xl focus:border-gold outline-none transition-colors font-serif placeholder:text-ink/10"
            placeholder="e.g. 18th Century French Tapestry"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">Provenance & Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-ink/10 p-6 h-48 focus:border-gold outline-none transition-colors font-light leading-relaxed resize-none text-lg"
            placeholder="Detail the history, condition, and significance..."
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">Starting Valuation ($)</label>
            <input 
              type="number" 
              value={startingPrice} 
              onChange={e => setStartingPrice(e.target.value)}
              className="w-full border-b border-ink/10 py-4 focus:border-gold outline-none transition-colors font-mono text-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">Auction Duration</label>
            <select 
              value={duration} 
              onChange={e => setDuration(e.target.value)}
              className="w-full border-b border-ink/10 py-4 focus:border-gold outline-none transition-colors font-light bg-transparent text-xl"
            >
              <option value="3600">1 Hour (Flash Auction)</option>
              <option value="86400">24 Hours (Standard)</option>
              <option value="259200">3 Days (Extended)</option>
              <option value="604800">7 Days (Premium)</option>
            </select>
          </div>
        </div>
        <button className="w-full py-6 bg-ink text-paper text-[10px] uppercase tracking-[0.5em] hover:bg-gold transition-colors font-bold shadow-2xl shadow-ink/20">
          Launch Auction
        </button>
      </form>
    </div>
  );
};
