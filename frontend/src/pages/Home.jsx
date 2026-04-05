import { useEffect, useState } from "react";
import { fetchAuctions } from "../services/auctionService";
import AuctionCard from "../components/AuctionCard";

function Home() {
  const [auctions, setAuctions] = useState([]);

useEffect(() => {
  const load = async () => {
    try {
      const res = await fetchAuctions();

      console.log("API:", res.data); // 👈 keep this for debugging

      // ✅ FIX HERE
      if (Array.isArray(res.data)) {
        setAuctions(res.data);
      } else if (Array.isArray(res.data.data)) {
        setAuctions(res.data.data);
      } else {
        setAuctions([]);
      }

    } catch (err) {
      console.error(err);
    }
  };

  load();
}, []);

  return (
    <div>
      <h1>All Auctions</h1>

      {auctions.map((a) => (
        <AuctionCard key={a._id} auction={a} />
      ))}
    </div>
  );
}

export default Home;