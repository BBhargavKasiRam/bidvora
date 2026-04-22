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

    // ✅ Only images allowed
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    // ✅ Max 5MB
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

    if (!title.trim() || title.trim().length < 3)
      return setError("Title must be at least 3 characters");

    if (description.trim().length < 10)
      return setError("Description must be at least 10 characters");

    if (!startingPrice || Number(startingPrice) <= 0)
      return setError("Reserve price must be a positive number");

    if (!durationHours || Number(durationHours) <= 0)
      return setError("Please specify a valid duration");

    // 🔥 Image is mandatory
    if (!image) {
      return setError("Please upload an image for the auction");
    }

    try {
      setError("");

      const durationSeconds = Math.floor(Number(durationHours) * 3600);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("starting_price", startingPrice);
      formData.append("duration", durationSeconds);
      formData.append("image", image); // ✅ Always required

      await api.post("/auctions", formData);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white p-10 shadow">

        <h2 className="text-4xl mb-6">Create Listing</h2>

        {error && (
          <div className="mb-4 text-red-600 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3"
          />

          <textarea
            value={description}
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-3"
          />

          {/* IMAGE */}
          <div
            onClick={() => fileInputRef.current.click()}
            className="border p-6 cursor-pointer text-center"
          >
            {preview ? (
              <img src={preview} className="w-full h-64 object-contain" />
            ) : (
              <p>Click to upload image (Required)</p>
            )}
            <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} />
          </div>

          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="Starting Price"
            className="w-full border p-3"
          />

          <input
            type="number"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="Duration (hours)"
            className="w-full border p-3"
          />

          <button className="w-full bg-black text-white p-3">
            {image ? "Create Auction" : "Upload Image to Continue"}
          </button>

        </form>
      </div>
    </div>
  );
};