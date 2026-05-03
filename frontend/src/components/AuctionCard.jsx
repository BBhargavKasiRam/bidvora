import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Clock, ChevronRight, Edit3, Video } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuctionCard = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const { user } = useAuth();

  const isSeller = user && auction && user.id === auction.seller_id;
  const isEnded = auction && new Date(auction.end_time) <= new Date();

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
      className="group bg-white border border-ink/5 p-6 hover:border-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5 flex flex-col"
    >
      {/* Auction image if exists */}
      {auction.image && (
        <div className="relative w-full aspect-[4/3] mb-6 overflow-hidden bg-paper">
          <img
            src={auction.image}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          {!isEnded && auction.mediator_id && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-[8px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-lg z-10 rounded-full">
              <Video className="w-3 h-3" />
              Live Stream
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink/40">
          By {auction.seller_name}
        </span>
        <div className="flex items-center gap-1 text-gold">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-mono font-medium">{timeLeft}</span>
        </div>
      </div>

      <h3 className="text-2xl font-serif leading-tight mb-3 group-hover:text-gold transition-colors">
        {auction.title}
      </h3>
      <p className="text-sm text-ink/60 line-clamp-2 mb-4 font-light leading-relaxed flex-1">
        {auction.description}
      </p>

      <div className="mb-4">
        <span className="text-[10px] uppercase tracking-widest text-ink/40 block mb-1">
          Current Bid
        </span>
        <span className="text-2xl font-serif font-bold">
          ${Number(auction.current_price).toLocaleString()}
        </span>
      </div>

      {/* Role-based action buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        {isSeller && !isEnded && (
          <Link
            to={`/auction/${auction.id}?edit=true`}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-ink/10 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-ink hover:text-paper hover:border-ink transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Listing
          </Link>
        )}

        <Link
          to={`/auction/${auction.id}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-ink text-paper text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-all group/btn shadow-md hover:shadow-xl"
        >
          See Auction
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};