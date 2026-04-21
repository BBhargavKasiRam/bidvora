import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Upload, Camera, Clock, X, ChevronDown } from "lucide-react";

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationHours, setDurationHours] = useState(""); // Unified input for hours
  
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Logical Validations
    if (!title.trim() || title.trim().length < 3) return setError("Title must be at least 3 characters");
    if (description.trim().length < 10) return setError("Description must be at least 10 characters");
    
    // Ensure price and duration are positive
    if (!startingPrice || Number(startingPrice) <= 0) {
      setError("Reserve price must be a positive number");
      return;
    }
    if (!durationHours || Number(durationHours) <= 0) {
      setError("Please specify a valid duration (e.g., 12.5)");
      return;
    }

    try {
      setError("");
      // Converts user hours (12.5) to seconds (45000) for backend
      const durationSeconds = Math.floor(Number(durationHours) * 3600);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("starting_price", startingPrice);
      formData.append("duration", durationSeconds);
      
      // ✅ IMAGE IS NOW OPTIONAL (logic only appends if it exists)
      if (image) formData.append("image", image);

      await fetch("http://localhost:5000/api/auctions", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      navigate("/");
    } catch (err) {
      setError("Upload failed. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-20 px-4 font-sans text-ink text-ink">
      <div className="max-w-4xl mx-auto bg-white border border-ink/10 shadow-2xl p-12 lg:p-20 relative">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]"></div>

        <header className="mb-16 border-b border-ink/5 pb-10">
          <h2 className="text-6xl font-serif mb-4 tracking-tight">Create Listing</h2>
          <p className="text-[11px] uppercase tracking-[0.4em] text-ink/60 font-bold">Curate a new entry for the BIDVORA collection</p>
        </header>

        {error && (
          <div className="mb-12 p-5 bg-red-50 text-red-700 text-[11px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 border-l-4 border-red-600">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-16">
          
          {/* Title and Description */}
          <div className="space-y-12">
            <div className="space-y-4">
              <label className="text-[14px] uppercase tracking-[0.3em] text-ink/70 font-bold block">Object Title</label>
              <input type="text" value={title} placeholder="e.g. Vintage Leica M3 Camera" onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border-b border-ink/20 py-4 text-4xl font-serif outline-none focus:border-[#C5A059] transition-colors placeholder:text-ink/30" required />
            </div>
            <div className="space-y-4">
              <label className="text-[14px] uppercase tracking-[0.3em] text-ink/70 font-bold block">Provenance & Details</label>
              <textarea value={description} placeholder="Describe the condition, history, and rarity..." onChange={(e) => setDescription(e.target.value)} className="w-full bg-black/[0.03] border border-ink/10 p-8 h-56 font-light text-xl leading-relaxed outline-none focus:border-[#C5A059]/40 transition-colors resize-none placeholder:text-ink/30" required />
            </div>
          </div>

          {/* Optional Visual Asset */}
          <div className="space-y-6 pt-10 border-t border-ink/5">
            <div>
              <h3 className="text-3xl font-serif mb-2 text-ink">Visual Asset</h3>
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 font-bold">Exhibition image (Optional)</p>
            </div>
            <div onClick={() => fileInputRef.current.click()} className="relative group aspect-video border-2 border-dashed border-ink/20 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden bg-paper/30 hover:bg-black/[0.02] hover:border-[#C5A059]/50">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase font-bold"><Camera className="mr-2" size={16} /> Change Asset</div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setImage(null); }} className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 shadow-md"><X size={14} /></button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-500"><Upload className="text-[#C5A059] w-6 h-6" /></div>
                  <p className="text-xs italic font-serif text-ink/50 uppercase tracking-widest">Add imagery</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-ink/10">
            {/* PRICE */}
            <div className="space-y-4">
              <label className="text-[14px] uppercase tracking-[0.3em] text-ink/70 font-bold block">Reserve Price (USD)</label>
              <div className="relative border-b border-ink/20">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-serif text-ink/20">$</span>
                <input type="number" min="0.1" step="0.1" value={startingPrice} placeholder="0" onChange={(e) => setStartingPrice(e.target.value)} className="w-full bg-transparent py-4 pl-10 text-4xl font-serif font-bold outline-none focus:border-[#C5A059] text-ink placeholder:text-ink/10 appearance-none" required />
              </div>
            </div>

            {/* ✅ AUCTION DURATION (ELEGANT COMBO INPUT) */}
            <div className="space-y-4">
              <label className="text-[14px] uppercase tracking-[0.3em] text-ink/70 font-bold block flex items-center gap-2">
                <Clock size={14} className="text-[#C5A059]" /> Auction Duration (Hours)
              </label>
              <div className="relative border-b border-ink/20 flex items-center bg-transparent group">
                {/* Numeric Manual Input (Allows 12.5) */}
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1"
                  placeholder="e.g. 12.5"
                  value={durationHours} 
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full bg-transparent py-4 text-4xl font-serif font-bold outline-none focus:border-[#C5A059] text-ink placeholder:text-ink/20 appearance-none"
                  required
                />
                
                {/* Styled Preset Picker */}
                <div className="relative h-full border-l border-ink/10 px-4 flex items-center cursor-pointer hover:bg-black/[0.02]">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] uppercase font-bold text-ink/30 mb-1">Presets</span>
                        <ChevronDown size={16} className="text-[#C5A059]" />
                    </div>
                    {/* Hidden Native Select for reliable cross-browser dropdown UI */}
                    <select 
                        onChange={(e) => setDurationHours(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                        <option value="" disabled selected>Quick Select</option>
                        <option value="1">1 Hour</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours (1 Day)</option>
                        <option value="72">72 Hours (3 Days)</option>
                        <option value="168">168 Hours (1 Week)</option>
                    </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12">
            <button className="w-full py-8 bg-black text-white text-[11px] uppercase tracking-[0.7em] font-bold shadow-2xl hover:bg-[#C5A059] transition-all duration-700">
              Launch Public Auction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};