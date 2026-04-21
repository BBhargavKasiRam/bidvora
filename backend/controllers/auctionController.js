const db = require("../config/db");

// ✅ CREATE AUCTION
exports.createAuction = (req, res) => {
  const { title, description, starting_price, duration } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !description || !starting_price || !duration) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const seller_id = req.user.id;
  const startPrice = Number(starting_price);
  const end_time = new Date(Date.now() + Number(duration) * 1000);

  db.query(
    `INSERT INTO auctions (seller_id, title, description, starting_price, current_price, end_time, image) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [seller_id, title, description, startPrice, startPrice, end_time, image],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error creating auction" });
      return res.status(201).json({ message: "Created successfully", auctionId: result.insertId });
    }
  );
};

// ✅ UPDATE AUCTION (With "Closed" check and Price editing)
exports.updateAuction = (req, res) => {
  const { id } = req.params;
  const { title, description, current_price } = req.body;
  const seller_id = req.user.id;
  const newImage = req.file ? req.file.filename : null;

  // 1. First, check if the auction is already closed
  db.query("SELECT end_time, seller_id FROM auctions WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Auction not found" });

    const auction = results[0];
    const isEnded = new Date(auction.end_time) <= new Date();

    // ✅ REJECT EDIT IF AUCTION ENDED
    if (isEnded) {
      return res.status(403).json({ message: "This auction is closed and cannot be edited." });
    }

    // ✅ REJECT IF NOT THE OWNER
    if (auction.seller_id !== seller_id) {
      return res.status(403).json({ message: "Unauthorized to edit this listing." });
    }

    // 2. Prepare update query
    let sql;
    let params;
    const priceNum = Number(current_price);

    if (newImage) {
      sql = `UPDATE auctions SET title = ?, description = ?, current_price = ?, image = ? WHERE id = ?`;
      params = [title, description, priceNum, newImage, id];
    } else {
      sql = `UPDATE auctions SET title = ?, description = ?, current_price = ? WHERE id = ?`;
      params = [title, description, priceNum, id];
    }

    db.query(sql, params, (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      return res.json({ message: "Listing updated successfully" });
    });
  });
};

// ✅ GET ALL AUCTIONS
exports.getAuctions = (req, res) => {
  db.query(`SELECT a.*, u.name AS seller_name FROM auctions a JOIN users u ON a.seller_id = u.id`, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching" });
    res.json(result);
  });
};

// ✅ GET SINGLE AUCTION
exports.getAuctionById = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT a.*, u.name AS seller_name FROM auctions a JOIN users u ON a.seller_id = u.id WHERE a.id = ?`, [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ message: "Not found" });
    const auction = result[0];
    db.query(`SELECT b.*, u.name AS user_name FROM bids b JOIN users u ON b.user_id = u.id WHERE b.auction_id = ? ORDER BY b.amount DESC`, [id], (err, bids) => {
      auction.bids = bids || [];
      res.json(auction);
    });
  });
};