import { useParams } from "react-router-dom";
import { useState } from "react";
import { placeBid } from "../services/bidService";

function AuctionDetails() {
  const { id } = useParams();
  const [amount, setAmount] = useState("");

  const handleBid = async () => {
    try {
      await placeBid({ auctionId: id, amount });
      alert("Bid placed");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Auction Details</h2>

      <input
        type="number"
        placeholder="Enter bid"
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handleBid}>Place Bid</button>
    </div>
  );
}

export default AuctionDetails;