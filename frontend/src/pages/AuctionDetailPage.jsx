import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Clock, TrendingUp, AlertCircle, CheckCircle2, UserPlus, Camera, Save, X, Edit3, Maximize2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const AuctionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // States
  const [auction, setAuction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // For Lightbox
  const [editForm, setEditForm] = useState({ title: "", description: "", current_price: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAuction = async () => {
    try {
      const data = await api.get(`/auctions/${id}`);
      setAuction(data);
      setEditForm({ 
        title: data.title, 
        description: data.description, 
        current_price: data.current_price 
      });
      
      if (data.image) {
        const fullImageUrl = data.image.startsWith('http') 
          ? data.image 
          : `http://localhost:5000/uploads/${data.image}`;
        setImagePreview(fullImageUrl);
      }
    } catch (err) {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchAuction();
    let interval;
    if (!isEditing) interval = setInterval(fetchAuction, 5000);
    return () => clearInterval(interval);
  }, [id, isEditing]);

  const handleUpdate = async () => {
    setError(""); setSuccess("");
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("current_price", editForm.current_price);
      if (selectedFile) formData.append("image", selectedFile);

      await api.put(`/auctions/${id}`, formData);
      setIsEditing(false);
      setSuccess("Listing updated successfully.");
      fetchAuction();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const isSeller = user && auction && user.id === auction.seller_id;
  const isEnded = auction && new Date(auction.end_time) <= new Date();

  if (!auction) return null;

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-20 font-sans text-ink">
      
      {/* Lightbox Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-10 cursor-zoom-out"
          >
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={imagePreview} className="max-w-full max-h-full object-contain" alt="Full view" />
            <button className="absolute top-10 right-10 text-paper hover:text-gold transition-colors"><X size={40} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (Left) */}
      <div className="lg:col-span-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-4 mb-8">
            <span className={`px-4 py-1 ${isEnded ? 'bg-ink' : 'bg-gold'} text-paper text-[10px] uppercase tracking-[0.2em] font-bold`}>
              {isEnded ? 'Auction Ended' : 'Live Auction'}
            </span>
            <span className="text-[10px] text-ink/40 uppercase tracking-widest font-mono">Lot #{auction.id.toString().padStart(4, '0')}</span>
          </div>
          
          {isEditing ? (
            <input className="text-7xl font-serif mb-10 w-full bg-transparent border-b border-gold/30 outline-none pb-2 focus:border-gold" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
          ) : (
            <h1 className="text-7xl font-serif mb-10 leading-[1.1] tracking-tight">{auction.title}</h1>
          )}

          <div onClick={() => !isEditing && setIsModalOpen(true)} className={`relative group mb-16 aspect-video bg-white border border-ink/5 overflow-hidden shadow-sm ${!isEditing ? 'cursor-zoom-in' : ''}`}>
            <img src={imagePreview} className={`w-full h-full object-contain transition-all duration-500 ${isEditing ? 'brightness-50 scale-105' : ''}`} alt="Auction" />
            {isEditing && (
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} className="absolute inset-0 flex flex-col items-center justify-center text-paper z-20">
                <Camera className="w-12 h-12 mb-3" />
                <span className="text-xs uppercase tracking-[0.3em] font-bold">Change Master Image</span>
                <input type="file" ref={fileInputRef} hidden onChange={(e) => {
                   const file = e.target.files[0];
                   if (file) { setSelectedFile(file); setImagePreview(URL.createObjectURL(file)); }
                }} accept="image/*" />
              </button>
            )}
          </div>
          
          <div className="prose prose-ink max-w-none mb-16">
            {isEditing ? (
              <textarea className="w-full text-2xl text-ink/70 font-light leading-relaxed italic border-l-4 border-gold/20 pl-8 bg-transparent outline-none h-48 focus:border-gold" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            ) : (
              <p className="text-2xl text-ink/70 font-light leading-relaxed italic border-l-4 border-gold/20 pl-8 whitespace-pre-wrap">{auction.description}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sidebar (Right) - FIXED UI */}
      <div className="lg:col-span-1">
        <div className="sticky top-32 space-y-10">
          <div className="bg-white border border-ink/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
            
            {/* VALUATION BLOCK */}
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-widest text-ink/40 block mb-3 font-bold">Current Valuation</span>
              {isEditing ? (
                <div className="flex items-baseline gap-2 border-b border-gold pb-1">
                    <span className="text-4xl font-serif font-bold text-ink/30">$</span>
                    <input type="number" className="text-6xl font-serif font-bold tracking-tighter w-full bg-transparent outline-none" value={editForm.current_price} onChange={e => setEditForm({...editForm, current_price: e.target.value})} />
                </div>
              ) : (
                <div className="text-6xl font-serif font-bold tracking-tighter">
                    ${Number(auction.current_price).toLocaleString()}
                </div>
              )}
            </div>
            
            {/* STATUS BLOCK */}
            <div className="mb-12 p-5 bg-paper border border-ink/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-ink/60">
                <Clock className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Status</span>
              </div>
              <span className={`text-xs font-mono font-bold ${isEnded ? 'text-ink' : 'text-gold'}`}>
                {isEnded ? "CLOSED" : "ACTIVE"}
              </span>
            </div>

            {/* SELLER INSIGHTS BLOCK - Hidden when editing to keep it clean like your screen */}
            {isSeller && !isEditing && (
              <div className="mb-10 p-6 bg-paper border border-ink/5">
                <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-4">Seller Insights</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-light text-ink/40">Starting Price</span>
                    <span className="font-bold text-ink">${auction.starting_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-light text-ink/40">Total Increment</span>
                    <span className="font-bold text-gold">
                      +${(auction.current_price - auction.starting_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* FEEDBACK NOTIFICATIONS */}
            <AnimatePresence>
              {(error || success) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 text-[10px] flex items-start gap-2 uppercase font-bold border-l-2 ${error ? 'bg-red-50 text-red-600 border-red-600' : 'bg-green-50 text-green-600 border-green-600'}`}>
                  {error ? <AlertCircle size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
                  <span>{error || success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTIONS Logic */}
            {isSeller && !isEnded ? (
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <button onClick={handleUpdate} className="w-full py-6 bg-ink text-paper text-[10px] uppercase tracking-[0.5em] hover:bg-gold transition-all font-bold flex items-center justify-center gap-2">
                      <Save size={14} /> Save Changes
                    </button>
                    <button onClick={() => { setIsEditing(false); fetchAuction(); }} className="w-full py-4 border border-ink/10 text-[10px] uppercase tracking-[0.5em] font-bold flex items-center justify-center gap-2">
                      <X size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full py-6 border border-ink/10 text-[10px] uppercase tracking-[0.5em] hover:bg-ink hover:text-paper transition-all font-bold flex items-center justify-center gap-2">
                    <Edit3 size={14} /> Edit Listing
                  </button>
                )}
              </div>
            ) : isEnded ? (
              <div className="p-6 bg-ink/5 text-[9px] text-ink/40 uppercase tracking-[0.3em] font-bold text-center border border-dashed border-ink/10">
                Lot closed. Modifications restricted.
              </div>
            ) : (
              !isEnded && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api.post("/bids", { auction_id: Number(id), amount: Number(bidAmount) });
                    setSuccess("Bid accepted."); setBidAmount(""); fetchAuction();
                  } catch (err) { setError(err.response?.data?.message); }
                }} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">Your Bid Offer</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/30 font-serif text-2xl">$</span>
                      <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="w-full border border-ink/10 pl-12 pr-6 py-6 font-mono text-3xl bg-paper/30 outline-none focus:border-gold" placeholder={(Number(auction.current_price) + 1).toString()} required />
                    </div>
                  </div>
                  <button className="w-full py-6 bg-ink text-paper text-[10px] uppercase tracking-[0.5em] hover:bg-gold transition-colors font-bold shadow-2xl">Place Bid Offer</button>
                </form>
              )
            )}
          </div>

          {/* CURATOR CARD */}
          <div className="p-10 border border-ink/10 bg-white/50 flex items-center gap-8">
            <div className="w-14 h-14 rounded-full bg-paper flex items-center justify-center text-gold border border-ink/5 shadow-inner">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-ink/40 font-bold mb-1">Curated By</p>
              <p className="font-serif text-2xl">{auction.seller_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};