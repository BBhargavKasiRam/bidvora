import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const CreateAuctionPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [duration, setDuration] = useState("3600");
  const [error, setError] = useState("");

  // ✅ ADDED
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDATION (unchanged)
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    if (!/[a-zA-Z]/.test(title)) {
      setError("Title must contain meaningful text");
      return;
    }

    if (/^\d+$/.test(title.trim())) {
      setError("Title cannot be only numbers");
      return;
    }

    if (/^(.)\1+$/.test(title.trim())) {
      setError("Title looks invalid");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    if (!startingPrice || Number(startingPrice) <= 0) {
      setError("Starting price must be greater than 0");
      return;
    }

    if (!duration || Number(duration) <= 0) {
      setError("Invalid auction duration");
      return;
    }

    try {
      setError("");

      // ✅ REPLACED API CALL WITH FORM DATA
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("starting_price", startingPrice);
      formData.append("duration", duration);

      if (image) {
        formData.append("image", image);
      }

      await fetch("http://localhost:5000/api/auctions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      navigate("/");
    } catch (err) {
      setError("Upload failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-16 bg-white border border-ink/5 shadow-2xl">
      <header className="mb-12">
        <h2 className="text-5xl font-serif mb-4">Create New Auction</h2>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
          Provide the details for your masterpiece
        </p>
      </header>

      {error && (
        <div className="mb-10 p-4 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 border-l-2 border-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* TITLE */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">
            Item Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            className="w-full border-b border-ink/10 py-4 text-2xl"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError("");
            }}
            className="w-full border p-4 h-40"
            required
          />
        </div>

        {/* ✅ IMAGE INPUT (ADDED HERE) */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 block font-bold">
            Upload Image
          </label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {/* PRICE & DURATION */}
        <div className="grid grid-cols-2 gap-6">
          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="Price"
          />

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="3600">1 Hour</option>
            <option value="86400">24 Hours</option>
            <option value="259200">3 Days</option>
            <option value="604800">7 Days</option>
          </select>
        </div>

        <button className="w-full py-4 bg-black text-white">
          Launch Auction
        </button>
      </form>
    </div>
  );
};