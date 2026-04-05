"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import API from "../../../services/api";

export default function AuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState({});
  const [bid, setBid] = useState("");

  const load = () => {
    API.get("/auctions").then(res => {
      const found = res.data.find(a => a.id == id);
      setAuction(found);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const placeBid = () => {
    API.post("/bids", {
      auction_id: id,
      amount: bid
    }).then(() => {
      alert("Bid placed!");
      load();
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{auction.title}</h1>

      <p>{auction.description}</p>

      <p className="text-green-600 text-xl">
        ₹{auction.current_price}
      </p>

      <input
        type="number"
        placeholder="Enter bid"
        className="border p-2 mt-4"
        onChange={e => setBid(e.target.value)}
      />

      <button
        onClick={placeBid}
        className="bg-blue-500 text-white px-4 py-2 ml-2"
      >
        Place Bid
      </button>
    </div>
  );
}