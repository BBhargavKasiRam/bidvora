import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Video, Search, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AuctionCard } from "../components/AuctionCard";

export const MediatorDashboard = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      api.get(`/auctions?mediator_id=${user.id}`).then(setAuctions).finally(() => setLoading(false));
    }
  }, [user]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/auctions/${id}/mediator-status`, { status });
      setAuctions(auctions.map(a => a.id === id ? { ...a, mediator_status: status } : a));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pendingAuctions = auctions.filter(a => a.mediator_status === 'pending');
  const acceptedAuctions = auctions.filter(a => a.mediator_status === 'accepted' || !a.mediator_status);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <header className="mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl font-serif mb-6 tracking-tight"
        >
          Mediator <span className="text-gold italic">Studio</span>
        </motion.h1>
        <p className="text-ink/60 font-light tracking-widest uppercase text-xs">
          Your Assigned Auctions Ready for Broadcast
        </p>
      </header>

      {pendingAuctions.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-ink/40 mb-6 border-b border-ink/10 pb-4">Pending Invitations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {pendingAuctions.map(auction => (
              <div key={auction.id} className="relative opacity-80 scale-95">
                <AuctionCard auction={auction} />
                <div className="mt-4 p-4 border border-ink/10 bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink/60 bg-gold/10 px-3 py-2 border border-gold/30">
                    <span>Offered Commission:</span>
                    <span className="text-gold text-sm">{Number(auction.mediator_commission || 0)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(auction.id, 'accepted')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-ink text-white text-[10px] uppercase tracking-widest font-bold hover:bg-gold transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusChange(auction.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-ink/10 text-ink text-[10px] uppercase tracking-widest font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs uppercase tracking-widest font-bold text-ink/40 mb-6 border-b border-ink/10 pb-4">Active Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {acceptedAuctions.map(auction => (
            <div key={auction.id} className="relative">
              <AuctionCard auction={auction} />
              <div className="mt-4 p-4 border border-ink/10 bg-white">
                <Link 
                  to={`/auction/${auction.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-red-700 transition"
                >
                  <Video className="w-4 h-4" /> Go to Studio Room
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {acceptedAuctions.length === 0 && pendingAuctions.length === 0 && (
          <div className="text-center py-32 border border-dashed border-ink/10 bg-white/50">
            <Search className="w-12 h-12 text-ink/20 mx-auto mb-4" />
            <p className="text-ink/40 font-serif italic text-2xl">No auctions have been assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
