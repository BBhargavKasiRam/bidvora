"use client";

import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Dashboard() {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    API.get("/bids").then(res => setBids(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Bids</h1>

      {bids.map(b => (
        <div key={b.id} className="bg-white p-3 mb-2 shadow">
          Auction {b.auction_id} → ₹{b.amount}
        </div>
      ))}
    </div>
  );
}