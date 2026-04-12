const db = require("../config/db");

exports.createAuction = (req, res) => {
  const { title, description, starting_price, duration } = req.body;
  const seller_id = req.user.id;

  const end_time = new Date(Date.now() + duration * 1000);

  db.query(
    "INSERT INTO auctions (seller_id,title,description,starting_price,current_price,end_time) VALUES (?,?,?,?,?,?)",
    [seller_id, title, description, starting_price, starting_price, end_time],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error creating auction" });
      }

      res.json({ message: "Auction created successfully" });
    }
  );
};

exports.getAuctions = (req, res) => {
  db.query(
    "SELECT a.*, u.name as seller_name FROM auctions a JOIN users u ON a.seller_id = u.id",
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

exports.getAuctionById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT a.*, u.name as seller_name FROM auctions a JOIN users u ON a.seller_id = u.id WHERE a.id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ error: "Auction not found" });

      const auction = result[0];

      db.query(
        "SELECT b.*, u.name as user_name FROM bids b JOIN users u ON b.user_id = u.id WHERE b.auction_id = ? ORDER BY b.amount DESC",
        [id],
        (err, bids) => {
          if (err) return res.status(500).json({ error: err.message });
          auction.bids = bids;
          res.json(auction);
        }
      );
    }
  );
};
