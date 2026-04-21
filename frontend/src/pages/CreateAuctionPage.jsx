import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Upload, Camera, Clock, X, ChevronDown } from "lucide-react";
import { api } from "../lib/api"; // ✅ IMPORTANT

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationHours, setDurationHours] = useState("");

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

    if (!title.trim() || title.trim().length < 3)
      return setError("Title must be at least 3 characters");

    if (description.trim().length < 10)
      return setError("Description must be at least 10 characters");

    if (!startingPrice || Number(startingPrice) <= 0)
      return setError("Reserve price must be a positive number");

    if (!durationHours || Number(durationHours) <= 0)
      return setError("Please specify a valid duration");

    try {
      setError("");

      const durationSeconds = Math.floor(Number(durationHours) * 3600);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("starting_price", startingPrice);
      formData.append("duration", durationSeconds);

      // ✅ Works perfectly with Cloudinary backend
      if (image) formData.append("image", image);

      await api.post("/auctions", formData); // ✅ FIXED

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-20 px-4 font-sans text-ink">
      <div className="max-w-4xl mx-auto bg-white border border-ink/10 shadow-2xl p-12 lg:p-20 relative">

        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]"></div>

        <header className="mb-16 border-b border-ink/5 pb-10">
          <h2 className="text-6xl font-serif mb-4 tracking-tight">Create Listing</h2>
          <p className="text-[11px] uppercase tracking-[0.4em] text-ink/60 font-bold">
            Curate a new entry for the BIDVORA collection
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
          <div onClick={() => fileInputRef.current.click()} className="border p-6 cursor-pointer">
            {preview ? (
              <img src={preview} className="w-full h-64 object-contain" />
            ) : (
              <p>Upload Image</p>
            )}
            <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} />
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

          <button className="w-full bg-black text-white p-4">
            Create Auction
          </button>
        </form>
      </div>
    </div>
  );
};