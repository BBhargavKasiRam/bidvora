import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Clock, ChevronRight } from "lucide-react";

export const AuctionCard = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.end_time).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.end_time]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white border border-ink/5 p-6 hover:border-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink/40">By {auction.seller_name}</span>
        <div className="flex items-center gap-1 text-gold">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-mono font-medium">{timeLeft}</span>
        </div>
      </div>
      
      <h3 className="text-xl font-serif mb-2 group-hover:text-gold transition-colors">{auction.title}</h3>
      <p className="text-sm text-ink/60 line-clamp-2 mb-6 font-light leading-relaxed">{auction.description}</p>
      
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-ink/40 block mb-1">Current Bid</span>
          <span className="text-2xl font-serif font-bold">${auction.current_price.toLocaleString()}</span>
        </div>
        <Link 
          to={`/auction/${auction.id}`}
          className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
};
