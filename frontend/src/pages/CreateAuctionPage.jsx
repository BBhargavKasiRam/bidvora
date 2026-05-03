import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Search, User, Briefcase, Star, Info } from "lucide-react";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [mediators, setMediators] = useState([]);
  const [selectedMediator, setSelectedMediator] = useState("");
  const [commission, setCommission] = useState("5");

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      formData.append("mediator_id", selectedMediator);
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

          <div className="space-y-6 pt-10 border-t border-ink/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-serif mb-2">Assign Auctioneer</h3>
                <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">Select an expert to manage and host your consignment</p>
              </div>
              
              <div className="relative group max-w-xs w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-paper/50 border border-ink/10 pl-11 pr-4 py-3 text-xs outline-none focus:border-gold transition-all rounded-full"
                />
              </div>
            </div>

            <div className="relative min-h-[200px]">
              {isSearching ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] z-10">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {mediators.length === 0 && !isSearching && (
                  <div className="col-span-full py-12 text-center border border-dashed border-ink/10 bg-paper/30">
                    <User className="w-10 h-10 text-ink/10 mx-auto mb-3" />
                    <p className="text-sm italic text-ink/40">No auctioneers found matching your criteria.</p>
                  </div>
                )}
                {mediators.map(m => (
                  <motion.div 
                    layout
                    key={m.id}
                    onClick={() => { setSelectedMediator(m.id); setError(""); }}
                    className={`p-6 border cursor-pointer transition-all relative overflow-hidden group ${
                      selectedMediator === m.id 
                        ? 'border-gold bg-gold/5 shadow-lg ring-1 ring-gold' 
                        : 'border-ink/10 hover:border-ink/30 bg-white hover:shadow-md'
                    }`}
                  >
                    {selectedMediator === m.id && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-gold text-white p-1 rounded-full"
                      >
                        <Star className="w-3 h-3 fill-current" />
                      </motion.div>
                    )}

                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-paper border-2 border-gold/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                          {m.profile_image ? (
                            <img src={m.profile_image} className="w-full h-full object-cover" alt={m.name} />
                          ) : (
                            <span className="font-serif text-2xl text-gold/40">{m.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Available" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-serif text-lg leading-tight mb-1">{m.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gold">
                            <Star className="w-3 h-3 fill-current" />
                            {Number(m.rating).toFixed(1)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-ink/10" />
                          <span className="flex items-center gap-1 text-[10px] font-bold text-ink/40">
                            <Briefcase className="w-3 h-3" />
                            {m.items_sold} Sold
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-ink/5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-ink/30 font-bold">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" /> Professional Auctioneer
                      </div>
                      {selectedMediator === m.id && (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gold">Selected</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {selectedMediator && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold/5 border border-gold/20 p-6 rounded-xl mt-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-gold uppercase tracking-widest mb-1">Proposed Agreement</h4>
                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Set the commission percentage for the auctioneer</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-serif font-bold text-gold">%</span>
                    <input 
                      type="number"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      className="w-24 bg-white border border-gold/30 p-3 text-lg font-serif font-bold text-gold outline-none focus:border-gold"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex items-start gap-2 text-ink/40">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  <p className="text-[9px] uppercase tracking-wider font-bold">
                    This commission will be paid to the auctioneer automatically upon successful completion and payment of the auction.
                  </p>
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
            disabled={loading}
            className={`w-full py-6 text-[11px] uppercase tracking-[0.5em] font-bold transition-all shadow-2xl flex items-center justify-center gap-4 rounded-full ${
              loading ? "bg-ink/50 cursor-not-allowed" : "bg-ink text-paper hover:bg-gold"
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