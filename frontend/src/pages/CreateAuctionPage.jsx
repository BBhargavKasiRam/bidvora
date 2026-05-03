import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Search, User, Briefcase, Star, Info, Check, ChevronDown } from "lucide-react";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [mediators, setMediators] = useState([]);
  const [selectedMediator, setSelectedMediator] = useState(null);
  const [commission, setCommission] = useState("5");

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAuctioneers = async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/users/auctioneers?search=${searchTerm}`);
        setMediators(response);
      } catch (err) {
        console.error("Failed to fetch auctioneers", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchAuctioneers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [loading, setLoading] = useState(false);
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
    if (loading) return; 

    const titleRegex = /^[A-Za-z ]+$/;

    if (!title.trim() || title.trim().length < 3)
      return setError("Title must be at least 3 characters");

    if (!titleRegex.test(title.trim()))
      return setError("Title must contain only alphabets (no numbers or special characters)");

    if (description.trim().length < 10)
      return setError("Description must be at least 10 characters");

    if (!startingPrice || Number(startingPrice) <= 0)
      return setError("Reserve price must be a positive number");

    if (!durationHours || Number(durationHours) <= 0)
      return setError("Please specify a valid duration");

    if (!image) {
      return setError("Please upload an image");
    }

    if (!selectedMediator) {
      return setError("Please select an auctioneer to manage your consignment");
    }

    try {
      setLoading(true);
      setError("");

      const durationSeconds = Math.floor(Number(durationHours) * 3600);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("starting_price", startingPrice);
      formData.append("duration", durationSeconds);
      formData.append("mediator_id", selectedMediator.id);
      formData.append("commission", commission);
      formData.append("image", image);

      await api.post("/auctions", formData);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-20 px-4 font-sans text-ink">
      <div className="max-w-4xl mx-auto bg-white border border-ink/10 shadow-2xl p-12 lg:p-20 relative">

        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]"></div>

        <header className="mb-16 border-b border-ink/5 pb-10">
          <h2 className="text-6xl font-serif mb-4 tracking-tight">Create Consignment</h2>
          <p className="text-[11px] uppercase tracking-[0.4em] text-ink/60 font-bold">
            Submit a new entry for the BIDVORA collection
          </p>
        </header>

        {error && (
          <div className="mb-12 p-5 bg-red-50 text-red-700 text-[11px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 border-l-4 border-red-600">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-16">

          <input
            type="text"
            value={title}
            placeholder="Auction Title"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b text-3xl p-4 outline-none focus:border-gold transition-colors"
          />

          <textarea
            value={description}
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-ink/10 p-6 h-40 outline-none focus:border-gold transition-colors font-light leading-relaxed"
          />

          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-ink/10 p-10 cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition-all text-center group"
          >
            {preview ? (
              <div className="relative aspect-video max-h-80 mx-auto">
                <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                  Change Image
                </div>
              </div>
            ) : (
              <div className="py-10">
                <p className="text-ink/40 uppercase tracking-widest text-xs font-bold">Click to upload high-resolution product image</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-6 pt-10 border-t border-ink/5 relative" ref={dropdownRef}>
            <h3 className="text-3xl font-serif mb-2">Assign Auctioneer</h3>
            <p className="text-xs text-ink/40 uppercase tracking-widest font-bold mb-4">Search for a professional partner to host your auction</p>
            
            <div className="relative group">
              <div className={`flex items-center gap-4 p-4 border transition-all rounded-xl ${showDropdown ? 'border-gold ring-4 ring-gold/5 shadow-lg' : 'border-ink/10 bg-paper/30'}`}>
                <Search className={`w-5 h-5 ${showDropdown ? 'text-gold' : 'text-ink/20'}`} />
                <input 
                  type="text"
                  placeholder="Type name to find auctioneers..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="flex-1 bg-transparent outline-none text-lg font-serif placeholder:text-ink/20"
                />
                {selectedMediator && !showDropdown && (
                  <div className="flex items-center gap-2 bg-gold/10 px-3 py-1.5 rounded-full border border-gold/20">
                    <Check className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{selectedMediator.name}</span>
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-ink/20 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute z-50 left-0 right-0 top-full bg-white border border-gold/20 shadow-2xl rounded-2xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-ink/5 bg-paper/50 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-ink/30">Top Professionals</span>
                      {isSearching && <div className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {mediators.length === 0 && !isSearching && (
                        <div className="py-12 text-center">
                          <User className="w-10 h-10 text-ink/5 mx-auto mb-2" />
                          <p className="text-xs text-ink/30 font-bold uppercase tracking-widest">No auctioneers found</p>
                        </div>
                      )}
                      
                      {mediators.map((m, idx) => (
                        <div 
                          key={m.id}
                          onClick={() => {
                            setSelectedMediator(m);
                            setSearchTerm("");
                            setShowDropdown(false);
                            setError("");
                          }}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gold/5 group ${idx !== mediators.length - 1 ? 'border-b border-ink/5' : ''}`}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-gold/20 overflow-hidden group-hover:border-gold transition-colors">
                              {m.profile_image ? (
                                <img src={m.profile_image} className="w-full h-full object-cover" alt={m.name} />
                              ) : (
                                <div className="w-full h-full bg-paper flex items-center justify-center text-gold font-serif text-xl">
                                  {m.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            {idx < 3 && !searchTerm && (
                              <div className="absolute -top-1 -right-1 bg-gold text-white text-[8px] font-bold px-1 rounded shadow-sm">TOP</div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-serif text-lg leading-none">{m.name}</p>
                              {m.rating >= 4.5 && <Star className="w-3 h-3 text-gold fill-current" />}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 text-gold" /> {Number(m.rating).toFixed(1)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-ink/10" />
                              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest flex items-center gap-1">
                                <Briefcase className="w-2.5 h-2.5" /> {m.items_sold} Sold
                              </span>
                              <span className="w-1 h-1 rounded-full bg-ink/10" />
                              <span className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                {m.total_assignments} Clients
                              </span>
                            </div>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-gold text-white p-1 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {selectedMediator && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold/5 border border-gold/20 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6"
              >
                <div className="w-16 h-16 rounded-full border-2 border-gold overflow-hidden shrink-0 shadow-lg">
                  {selectedMediator.profile_image ? (
                    <img src={selectedMediator.profile_image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-paper flex items-center justify-center text-gold font-serif text-2xl">
                      {selectedMediator.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-serif mb-1">Partnering with {selectedMediator.name}</h4>
                  <p className="text-[9px] text-ink/40 font-bold uppercase tracking-[0.2em]">
                    Setting up a professional consignment agreement
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gold/30 shadow-sm">
                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-ink/40 mb-0.5">Commission</p>
                    <p className="text-[8px] uppercase tracking-widest font-bold text-gold">Proposed</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      className="w-16 text-2xl font-serif font-bold text-gold outline-none text-center"
                      min="0"
                      max="100"
                    />
                    <span className="text-2xl font-serif font-bold text-gold">%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-ink/5 pt-10">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">Reserve Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 font-serif text-xl">$</span>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="0"
                  className="w-full border border-ink/10 pl-10 pr-4 py-4 font-mono text-xl outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-ink/40 block mb-2 font-bold">Auction Duration</label>
              <div className="relative">
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="24"
                  className="w-full border border-ink/10 px-4 py-4 font-mono text-xl outline-none focus:border-gold transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 text-xs font-bold uppercase tracking-widest">Hours</span>
              </div>
            </div>
          </div>

          <button
            disabled={loading || !selectedMediator}
            className={`w-full py-6 text-[11px] uppercase tracking-[0.5em] font-bold transition-all shadow-2xl flex items-center justify-center gap-4 rounded-full ${
              loading || !selectedMediator ? "bg-ink/50 cursor-not-allowed" : "bg-ink text-paper hover:bg-gold"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Consignment"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};