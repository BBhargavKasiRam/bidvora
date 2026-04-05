import { Link } from "react-router-dom";

function AuctionCard({ auction }) {
  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h3>{auction.title}</h3>
      <p>{auction.description}</p>

      <Link to={`/auction/${auction._id}`}>
        <button>View</button>
      </Link>
    </div>
  );
}

export default AuctionCard;