import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";

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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || title.length < 3)
      return setError("Title must be at least 3 characters");

    if (description.trim().length < 10)
      return setError("Description must be at least 10 characters");

    if (!startingPrice || Number(startingPrice) <= 0)
      return setError("Invalid price");

    if (!durationHours || Number(durationHours) <= 0)
      return setError("Invalid duration");

    // 🔥 Image required
    if (!image) {
      return setError("Please upload an image");
    }

    try {
      setError("");

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("starting_price", startingPrice);
      formData.append("duration", Number(durationHours) * 3600);
      formData.append("image", image);

      await api.post("/auctions", formData);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl mb-6">Create Auction</h2>

      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
        />

        <textarea
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />

        <div onClick={() => fileInputRef.current.click()} className="border p-4 cursor-pointer">
          {preview ? <img src={preview} className="h-40" /> : "Upload Image (Required)"}
          <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} />
        </div>

        <input
          type="number"
          placeholder="Starting Price"
          onChange={(e) => setStartingPrice(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="number"
          placeholder="Duration (hours)"
          onChange={(e) => setDurationHours(e.target.value)}
          className="border p-2 w-full"
        />

        <button className="bg-black text-white p-3 w-full">
          Create Auction
        </button>

      </form>
    </div>
  );
};