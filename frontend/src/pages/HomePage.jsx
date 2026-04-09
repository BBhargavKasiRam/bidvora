import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { AuctionCard } from "../components/AuctionCard";

export const HomePage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auctions").then(setAuctions).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <header className="mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl font-serif mb-6 tracking-tight"
        >
          Bidvora <span className="text-gold italic">Elite</span>
        </motion.h1>
        <p className="text-ink/60 font-light tracking-widest uppercase text-xs">
          The Premier Destination for Rare Acquisitions
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {auctions.map(auction => (
          <div key={auction.id}>
            <AuctionCard auction={auction} />
          </div>
        ))}
      </div>
      
      {auctions.length === 0 && (
        <div className="text-center py-32 border border-dashed border-ink/10 bg-white/50">
          <Search className="w-12 h-12 text-ink/20 mx-auto mb-4" />
          <p className="text-ink/40 font-serif italic text-2xl">The gallery is currently empty.</p>
          <p className="text-xs uppercase tracking-widest text-ink/30 mt-2">Check back soon for new arrivals</p>
        </div>
      )}
    </div>
  );
};
