import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [mediators, setMediators] = useState([]);
  const [selectedMediator, setSelectedMediator] = useState("");

  useEffect(() => {
    api.get("/users/auctioneers").then(setMediators).catch(console.error);
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
    if (loading) return; // Prevent duplicate clicks

    // 🔥 TITLE VALIDATION (UPDATED)
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

    // 🔥 IMAGE MANDATORY
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

          {/* TITLE */}
          <input
            type="text"
            value={title}
            placeholder="Auction Title"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b text-3xl p-4 outline-none"
          />

          {/* DESCRIPTION */}
          <textarea
            value={description}
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-4 h-40"
          />

          {/* IMAGE */}
          <div
            onClick={() => fileInputRef.current.click()}
            className="border p-6 cursor-pointer"
          >
            {preview ? (
              <img src={preview} className="w-full h-64 object-contain" />
            ) : (
              <p>Upload Image</p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-serif mb-2">Assign Auctioneer</h3>
            <p className="text-xs text-ink/50 uppercase tracking-widest font-bold mb-4">Select an expert to manage and host your consignment</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediators.length === 0 && <p className="text-sm italic text-ink/50">No auctioneers available.</p>}
              {mediators.map(m => (
                <div 
                  key={m.id}
                  onClick={() => { setSelectedMediator(m.id); setError(""); }}
                  className={`p-4 border cursor-pointer transition-all ${selectedMediator === m.id ? 'border-gold bg-gold/5 shadow-md' : 'border-ink/10 hover:border-ink/30 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-paper border border-ink/10 flex items-center justify-center overflow-hidden">
                      {m.profile_image ? (
                        <img src={m.profile_image} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-xl">{m.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{m.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-ink/40 mt-1">
                        Rating: {Number(m.rating).toFixed(1)} ★ • Sold: {m.items_sold}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="Starting Price"
            className="w-full border p-4"
          />

          {/* DURATION */}
          <input
            type="number"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="Duration (hours)"
            className="w-full border p-4"
          />

          <button
            disabled={loading}
            className={`w-full py-5 text-[10px] uppercase tracking-[0.4em] font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
              loading ? "bg-ink/50 cursor-not-allowed" : "bg-ink text-paper hover:bg-gold"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
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