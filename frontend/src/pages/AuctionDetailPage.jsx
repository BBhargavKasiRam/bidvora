import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Clock, TrendingUp, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const AuctionDetailPage = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAuction = async () => {
    try {
      const data = await api.get(`/auctions/${id}`);
      setAuction(data);
    } catch (err) {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchAuction();
    const interval = setInterval(fetchAuction, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setError("");
    setSuccess("");
    try {
      await api.post("/bids", { auction_id: Number(id), amount: Number(bidAmount) });
      setSuccess("Bid accepted. You are the current high bidder.");
      setBidAmount("");
      fetchAuction();
    } catch (err) {
      setError(err.message);
    }
  };

  const isSeller = user && auction && user.id === auction.seller_id;
  const isEnded = auction && new Date(auction.end_time) <= new Date();

  if (!auction) return null;

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-20">
      <div className="lg:col-span-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <span className={`px-4 py-1 ${isEnded ? 'bg-ink' : 'bg-gold'} text-paper text-[10px] uppercase tracking-[0.2em] font-bold`}>
              {isEnded ? 'Auction Ended' : 'Live Auction'}
            </span>
            <span className="text-[10px] text-ink/40 uppercase tracking-widest font-mono">Lot #{auction.id.toString().padStart(4, '0')}</span>
          </div>
          
          <h1 className="text-7xl font-serif mb-10 leading-[1.1] tracking-tight">{auction.title}</h1>
          
          <div className="prose prose-ink max-w-none mb-16">
            <p className="text-2xl text-ink/70 font-light leading-relaxed italic border-l-4 border-gold/20 pl-8">
              {auction.description}
            </p>
          </div>
          
          <div className="border-t border-ink/10 pt-16">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gold" />
                {isSeller ? "Bid Management" : "Bidding History"}
              </h3>
              {isSeller && (
                <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                  {auction.bids?.length || 0} Total Offers
                </span>
              )}
            </div>
            <div className="space-y-6">
              {auction.bids?.map((bid) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={bid.id} 
                  className={`flex justify-between items-center p-6 bg-white border ${bid.amount === auction.current_price ? 'border-gold shadow-lg shadow-gold/5' : 'border-ink/5'} hover:border-gold/30 transition-all`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-bold">
                      {bid.user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold uppercase tracking-widest">{bid.user_name}</p>
                        {bid.amount === auction.current_price && (
                          <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">HIGH BIDDER</span>
                        )}
                      </div>
                      <p className="text-[10px] text-ink/40 uppercase tracking-widest mt-1">{new Date(bid.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-serif font-bold text-gold">${bid.amount.toLocaleString()}</span>
                </motion.div>
              ))}
              {(!auction.bids || auction.bids.length === 0) && (
                <div className="text-center py-16 border border-dashed border-ink/10 bg-white/30">
                  <p className="text-ink/40 italic font-serif text-xl">No bids have been recorded for this lot.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-32 space-y-10">
          <div className="bg-white border border-ink/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
            
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-widest text-ink/40 block mb-3 font-bold">
                {isEnded ? "Final Valuation" : "Current Valuation"}
              </span>
              <div className="text-6xl font-serif font-bold tracking-tighter">${auction.current_price.toLocaleString()}</div>
            </div>
            
            <div className="mb-12 p-5 bg-paper border border-ink/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-ink/60">
                <Clock className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Status</span>
              </div>
              <span className={`text-xs font-mono font-bold ${isEnded ? 'text-ink' : 'text-gold'}`}>
                {isEnded ? "CLOSED" : "ACTIVE"}
              </span>
            </div>

            {isSeller ? (
              <div className="space-y-6">
                <div className="p-6 bg-paper border border-ink/5">
                  <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-4">Seller Insights</p>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-light">Starting Price</span>
                      <span className="font-bold">${auction.starting_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-light">Total Increment</span>
                      <span className="font-bold text-green-600">+${(auction.current_price - auction.starting_price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-6 border border-ink/10 text-[10px] uppercase tracking-[0.5em] hover:bg-ink hover:text-paper transition-all font-bold">
                  Edit Listing
                </button>
              </div>
            ) : isEnded ? (
              <div className="text-center p-8 bg-paper border border-ink/5">
                <p className="text-xl font-serif italic mb-4">This auction has concluded.</p>
                {user && auction.bids?.[0]?.user_id === user.id ? (
                  <div className="space-y-6">
                    <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold">Congratulations! You won this lot.</p>
                    <button 
                      onClick={() => navigate("/orders")}
                      className="w-full py-4 bg-gold text-ink text-[10px] uppercase tracking-widest font-bold hover:bg-ink hover:text-paper transition-all"
                    >
                      Complete Acquisition
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] uppercase tracking-widest text-ink/40">Better luck next time.</p>
                )}
              </div>
            ) : (
              <>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-4 bg-red-50 text-red-600 text-[10px] flex items-center gap-2 uppercase tracking-widest font-bold border-l-2 border-red-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-4 bg-green-50 text-green-600 text-[10px] flex items-center gap-2 uppercase tracking-widest font-bold border-l-2 border-green-600"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </motion.div>
                )}

                <form onSubmit={handleBid} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">Your Bid Offer</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/30 font-serif text-2xl">$</span>
                      <input 
                        type="number" 
                        value={bidAmount} 
                        onChange={e => setBidAmount(e.target.value)}
                        className="w-full border border-ink/10 pl-12 pr-6 py-6 focus:border-gold outline-none transition-colors font-mono text-3xl bg-paper/30"
                        placeholder={(auction.current_price + 1).toString()}
                        required
                      />
                    </div>
                  </div>
                  <button className="w-full py-6 bg-ink text-paper text-[10px] uppercase tracking-[0.5em] hover:bg-gold transition-colors font-bold shadow-2xl shadow-ink/20">
                    Place Bid Offer
                  </button>
                </form>
              </>
            )}
            
            <p className="mt-8 text-[9px] text-ink/30 text-center uppercase tracking-[0.2em] leading-relaxed">
              All bids are legally binding. <br/> Transaction fees may apply upon winning.
            </p>
          </div>

          <div className="p-10 border border-ink/10 bg-white/50 flex items-center gap-8 group hover:border-gold/30 transition-colors">
            <div className="w-14 h-14 rounded-full bg-paper flex items-center justify-center text-gold border border-ink/5 shadow-inner group-hover:scale-110 transition-transform">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-ink/40 font-bold mb-1">Curated By</p>
              <p className="font-serif text-2xl group-hover:text-gold transition-colors">{auction.seller_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
