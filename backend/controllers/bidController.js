const db = require("../config/db");

exports.placeBid = (req, res) => {
  const { auction_id, amount } = req.body;

  db.query("SELECT * FROM auctions WHERE id=?", [auction_id], (err, result) => {

    if (err) return res.send(err);

    if (result.length === 0) {
      return res.send("Auction not found");
    }

    const auction = result[0];

    if (amount <= auction.current_price) {
      return res.send("Bid too low");
    }

    // update price
    db.query("UPDATE auctions SET current_price=? WHERE id=?", [amount, auction_id]);

    // anti-sniping
    const now = new Date();
    const remaining = new Date(auction.end_time) - now;

    if (remaining < 30000) {
      const newTime = new Date(new Date(auction.end_time).getTime() + 60000);
      db.query("UPDATE auctions SET end_time=? WHERE id=?", [newTime, auction_id]);
    }

    // insert bid
    db.query(
      "INSERT INTO bids (auction_id,user_id,amount) VALUES (?,?,?)",
      [auction_id, req.user.id, amount]
    );

    res.json({ message: "Bid placed successfully" });
  });
};
