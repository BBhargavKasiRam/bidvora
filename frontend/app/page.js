"use client";

import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Home() {
  const [auctions, setAuctions] = useState([]);

  const fetchAuctions = () => {
    API.get("/auctions").then(res =>{
      console.log(res.data);
      setAuctions(res.data)
    });
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-6 grid md:grid-cols-3 gap-6">
        {Array.isArray(auctions) && auctions.map(a => (
          <div key={a.id} className="bg-white p-4 shadow rounded-xl">
            <h2 className="font-bold text-lg">{a.title}</h2>
            <p>{a.description}</p>

            <p className="text-green-600 font-bold">
              ₹{a.current_price}
            </p>

            <a href={`/auction/${a.id}`}>
              <button className="bg-blue-500 text-white w-full mt-2 py-2 rounded">
                View Auction
              </button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}