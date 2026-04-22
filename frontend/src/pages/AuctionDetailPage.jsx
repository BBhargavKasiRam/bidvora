import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Camera,
  Save,
  X,
  Edit3,
  Maximize2,
  Gavel,
  TrendingUp,
  ArrowLeft,
  History,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// --- CountdownTimer sub-component ---
const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      setIsUrgent(diff < 5 * 60 * 1000); // < 5 min
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return (
    <span className={`font-mono font-bold ${isUrgent ? "text-red-500 animate-pulse" : "text-gold"}`}>
      {timeLeft}
    </span>
  );
};

// --- BidHistory sub-component ---
const BidHistory = ({ bids }) => {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-ink/10">
        <Gavel className="w-8 h-8 text-ink/10 mx-auto mb-3" />
        <p className="text-sm font-serif italic text-ink/40">No bids placed yet.</p>
        <p className="text-[10px] uppercase tracking-widest text-ink/20 mt-1">Be the first to bid</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {bids.map((bid, idx) => (
        <motion.div
          key={bid.id || idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
          className={`flex items-center justify-between p-3 border ${
            idx === 0 ? "border-gold/30 bg-gold/5" : "border-ink/5 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0 ? "bg-gold text-ink" : "bg-paper text-ink/40 border border-ink/10"
              }`}
            >
              {idx === 0 ? "★" : idx + 1}
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide">{bid.user_name || "Bidder"}</p>
              <p className="text-[9px] text-ink/40 uppercase tracking-widest">
                {bid.created_at
                  ? new Date(bid.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-lg font-serif font-bold ${idx === 0 ? "text-gold" : "text-ink"}`}
            >
              ${Number(bid.amount).toLocaleString()}
            </span>
            {idx === 0 && (
              <p className="text-[8px] uppercase tracking-widest text-gold font-bold">Leading</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================
export const AuctionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [auction, setAuction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", current_price: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  const fetchAuction = async () => {
    try {
      const data = await api.get(`/auctions/${id}`);
      setAuction(data);
      setEditForm({
        title: data.title,
        description: data.description,
        current_price: data.current_price,
      });
      setImagePreview(data.image || null);
    } catch {
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
    setError("");
    setSuccess("");
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

  const handleBid = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amount = Number(bidAmount);
    if (!amount || amount <= Number(auction.current_price)) {
      setError(`Bid must be higher than $${Number(auction.current_price).toLocaleString()}`);
      return;
    }
    try {
      setBidLoading(true);
      await api.post("/bids", { auction_id: Number(id), amount });
      setSuccess("Bid placed successfully!");
      setBidAmount("");
      fetchAuction();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Bid failed");
    } finally {
      setBidLoading(false);
    }
  };

  const isSeller = user && auction && user.id === auction.seller_id;
  const isBuyer = user && auction && user.id !== auction.seller_id;
  const isEnded = auction && new Date(auction.end_time) <= new Date();
  const minBid = auction ? Number(auction.current_price) + 1 : 1;

  if (!auction) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── SELLER VIEW ─────────────────────────────────────────
  if (isSeller) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-16 font-sans text-ink">
        {/* Lightbox */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-10 cursor-zoom-out"
            >
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={imagePreview}
                className="max-w-full max-h-full object-contain"
                alt="Full view"
              />
              <button className="absolute top-10 right-10 text-paper hover:text-gold transition-colors">
                <X size={40} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back */}
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink/40 hover:text-gold transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left — image + description */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold ${
                  isEnded ? "bg-ink text-paper" : "bg-gold text-ink"
                }`}
              >
                {isEnded ? "Auction Ended" : "Live Auction"}
              </span>
              <span className="text-[10px] text-ink/40 font-mono uppercase tracking-widest">
                Lot #{auction.id?.toString().padStart(4, "0")}
              </span>
            </div>

            {isEditing ? (
              <input
                className="text-5xl font-serif w-full bg-transparent border-b border-gold/30 outline-none pb-2 focus:border-gold"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            ) : (
              <h1 className="text-5xl font-serif leading-tight tracking-tight">{auction.title}</h1>
            )}

            {/* Image */}
            <div
              onClick={() => !isEditing && imagePreview && setIsModalOpen(true)}
              className={`relative group aspect-video bg-paper border border-ink/5 overflow-hidden shadow-sm ${
                !isEditing && imagePreview ? "cursor-zoom-in" : ""
              }`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isEditing ? "brightness-50 scale-105" : ""
                  }`}
                  alt="Auction"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/20">
                  No image
                </div>
              )}
              {isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current.click();
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-paper z-20"
                >
                  <Camera className="w-10 h-10 mb-2" />
                  <span className="text-xs uppercase tracking-[0.3em] font-bold">Change Image</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    accept="image/*"
                  />
                </button>
              )}
            </div>

            {/* Description */}
            {isEditing ? (
              <textarea
                className="w-full text-lg text-ink/70 font-light leading-relaxed border-l-4 border-gold/20 pl-6 bg-transparent outline-none h-36 focus:border-gold"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            ) : (
              <p className="text-lg text-ink/70 font-light leading-relaxed border-l-4 border-gold/20 pl-6 whitespace-pre-wrap">
                {auction.description}
              </p>
            )}
          </div>

          {/* Right — sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-ink/10 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold" />

              {/* Price */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                  Current Valuation
                </span>
                {isEditing ? (
                  <div className="flex items-baseline gap-1 border-b border-gold pb-1">
                    <span className="text-3xl font-serif text-ink/30">$</span>
                    <input
                      type="number"
                      className="text-5xl font-serif font-bold w-full bg-transparent outline-none"
                      value={editForm.current_price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, current_price: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <div className="text-5xl font-serif font-bold tracking-tighter">
                    ${Number(auction.current_price).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className="mb-6 p-4 bg-paper border border-ink/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink/50">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Time Left</span>
                </div>
                <CountdownTimer endTime={auction.end_time} />
              </div>

              {/* Seller insights */}
              {!isEditing && (
                <div className="mb-6 p-4 bg-paper border border-ink/5">
                  <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-3">
                    Seller Insights
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-ink/40">Starting Price</span>
                      <span className="font-bold">${Number(auction.starting_price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-ink/40">Total Gained</span>
                      <span className="font-bold text-gold">
                        +${(Number(auction.current_price) - Number(auction.starting_price)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-ink/40">Total Bids</span>
                      <span className="font-bold">{auction.bids?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {(error || success) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-4 p-3 text-[10px] flex items-start gap-2 uppercase font-bold border-l-2 ${
                      error
                        ? "bg-red-50 text-red-600 border-red-600"
                        : "bg-green-50 text-green-600 border-green-600"
                    }`}
                  >
                    {error ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                    <span>{error || success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Seller actions */}
              {!isEnded ? (
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-all font-bold flex items-center justify-center gap-2"
                      >
                        <Save size={13} /> Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          fetchAuction();
                        }}
                        className="w-full py-3 border border-ink/10 text-[10px] uppercase tracking-[0.4em] font-bold flex items-center justify-center gap-2 hover:bg-ink/5 transition"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-4 border border-ink/10 text-[10px] uppercase tracking-[0.4em] hover:bg-ink hover:text-paper transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Edit3 size={13} /> Edit Listing
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-ink/5 text-[9px] text-ink/40 uppercase tracking-[0.3em] font-bold text-center border border-dashed border-ink/10">
                  Lot closed — modifications restricted
                </div>
              )}
            </div>

            {/* Curator card */}
            <div className="p-6 border border-ink/10 bg-white/50 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-gold border border-ink/5 shadow-inner">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-ink/40 font-bold mb-0.5">
                  Curated By
                </p>
                <p className="font-serif text-xl">{auction.seller_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bid History for seller */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-gold" />
            <h2 className="text-2xl font-serif">Bid History</h2>
            <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold ml-2">
              {auction.bids?.length || 0} bids
            </span>
          </div>
          <BidHistory bids={auction.bids} />
        </div>
      </div>
    );
  }

  // ─── BUYER / PUBLIC VIEW ──────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-8 py-16 font-sans text-ink">
      {/* Lightbox */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-10 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={imagePreview}
              className="max-w-full max-h-full object-contain"
              alt="Full view"
            />
            <button className="absolute top-10 right-10 text-paper hover:text-gold transition-colors">
              <X size={40} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back */}
      <Link
        to="/gallery"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink/40 hover:text-gold transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── LEFT: image + details ── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold ${
                isEnded ? "bg-ink text-paper" : "bg-gold text-ink"
              }`}
            >
              {isEnded ? "Auction Ended" : "Live Auction"}
            </span>
            <span className="text-[10px] text-ink/40 font-mono uppercase tracking-widest">
              Lot #{auction.id?.toString().padStart(4, "0")}
            </span>
          </div>

          <h1 className="text-6xl font-serif leading-[1.1] tracking-tight">{auction.title}</h1>

          {/* Image */}
          {imagePreview && (
            <div
              onClick={() => setIsModalOpen(true)}
              className="relative group aspect-video bg-paper border border-ink/5 overflow-hidden shadow-sm cursor-zoom-in"
            >
              <img
                src={imagePreview}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={auction.title}
              />
              <div className="absolute top-3 right-3 p-1.5 bg-ink/60 text-paper opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-xl text-ink/70 font-light leading-relaxed border-l-4 border-gold/20 pl-8 whitespace-pre-wrap">
            {auction.description}
          </p>

          {/* Curator */}
          <div className="flex items-center gap-4 p-5 border border-ink/8 bg-white/60">
            <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-gold border border-ink/5">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-ink/40 font-bold">
                Curated By
              </p>
              <p className="font-serif text-lg">{auction.seller_name}</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: bid panel ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price + timer card */}
          <div className="bg-white border border-ink/10 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />

            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-widest text-ink/40 block mb-1 font-bold">
                Current Bid
              </span>
              <div className="text-5xl font-serif font-bold tracking-tighter">
                ${Number(auction.current_price).toLocaleString()}
              </div>
              {auction.bids?.length > 0 && (
                <p className="text-[10px] text-ink/40 mt-1 uppercase tracking-widest">
                  {auction.bids.length} bid{auction.bids.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Timer */}
            <div className="mb-6 p-4 bg-paper border border-ink/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink/50">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Ends In</span>
              </div>
              <CountdownTimer endTime={auction.end_time} />
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-4 p-3 text-[10px] flex items-start gap-2 uppercase font-bold border-l-2 ${
                    error
                      ? "bg-red-50 text-red-600 border-red-600"
                      : "bg-green-50 text-green-600 border-green-600"
                  }`}
                >
                  {error ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                  <span>{error || success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bid form — buyers only, active auctions */}
            {!isEnded && isBuyer && (
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">
                    Your Bid (min ${minBid.toLocaleString()})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 font-serif text-xl">
                      $
                    </span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      className="w-full border border-ink/10 pl-10 pr-4 py-4 font-mono text-2xl bg-paper/30 outline-none focus:border-gold transition-colors"
                      placeholder={minBid.toString()}
                      min={minBid}
                      required
                    />
                  </div>
                </div>

                {/* Quick bid buttons */}
                <div className="flex gap-2">
                  {[minBid, minBid + 50, minBid + 100].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBidAmount(v.toString())}
                      className="flex-1 py-2 border border-ink/10 text-[9px] uppercase tracking-widest font-bold hover:border-gold hover:text-gold transition-colors"
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={bidLoading}
                  className="w-full py-5 bg-ink text-paper text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-colors font-bold shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Gavel className="w-4 h-4" />
                  {bidLoading ? "Placing Bid…" : "Place Bid"}
                </button>

                <p className="text-[9px] text-ink/30 text-center leading-relaxed">
                  By placing a bid you agree to purchase if you win. All bids are binding.
                </p>
              </form>
            )}

            {/* Not logged in */}
            {!user && !isEnded && (
              <div className="text-center space-y-3">
                <p className="text-sm text-ink/50 font-light">Sign in to place a bid</p>
                <Link
                  to="/login"
                  className="block w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-colors font-bold text-center"
                >
                  Login to Bid
                </Link>
              </div>
            )}

            {/* Ended state */}
            {isEnded && (
              <div className="p-5 bg-ink/5 border border-dashed border-ink/10 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">
                  This auction has ended
                </p>
                {auction.bids?.length > 0 && (
                  <p className="text-sm font-serif text-ink/60 mt-2">
                    Won by{" "}
                    <span className="font-bold text-gold">{auction.bids[0].user_name}</span> for{" "}
                    <span className="font-bold">
                      ${Number(auction.bids[0].amount).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Trending indicator */}
          {!isEnded && auction.bids?.length > 2 && (
            <div className="flex items-center gap-3 p-4 border border-gold/20 bg-gold/5">
              <TrendingUp className="w-4 h-4 text-gold" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-gold">
                Hot auction — {auction.bids.length} active bids
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── BID HISTORY (full width below) ── */}
      <div className="mt-16 pt-12 border-t border-ink/5">
        <div className="flex items-center gap-3 mb-8">
          <History className="w-5 h-5 text-gold" />
          <h2 className="text-3xl font-serif">Bid History</h2>
          <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold ml-2 mt-1">
            {auction.bids?.length || 0} bids total
          </span>
        </div>
        <BidHistory bids={auction.bids} />
      </div>
    </div>
  );
};