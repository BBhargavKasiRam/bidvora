const db = require("../config/db");

// ✅ CREATE AUCTION (WITH IMAGE)
exports.createAuction = (req, res) => {
  const body = req.body || {};

  const title = body.title;
  const description = body.description;
  const starting_price = body.starting_price;
  const duration = body.duration;

  const image = req.file ? req.file.filename : null;

  console.log("BODY:", body);
  console.log("FILE:", req.file);

  // ✅ REQUIRED
  if (!title || !description || !starting_price || !duration) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // ✅ TITLE VALIDATION
  const cleanTitle = title.trim();

  if (cleanTitle.length < 3) {
    return res.status(400).json({ message: "Title too short" });
  }

  if (!/[a-zA-Z]/.test(cleanTitle)) {
    return res.status(400).json({ message: "Title must contain letters" });
  }

  if (/^\d+$/.test(cleanTitle)) {
    return res.status(400).json({ message: "Title cannot be only numbers" });
  }

  if (/^(.)\1+$/.test(cleanTitle)) {
    return res.status(400).json({ message: "Invalid title" });
  }

  // ✅ DESCRIPTION
  const cleanDescription = description.trim();

  if (cleanDescription.length < 10) {
    return res.status(400).json({ message: "Description too short" });
  }

  // ✅ AUTH
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const seller_id = req.user.id;

  // ✅ NUMBERS
  const startPrice = Number(starting_price);
  const dur = Number(duration);

  if (isNaN(startPrice) || startPrice <= 0) {
    return res.status(400).json({ message: "Invalid starting price" });
  }

  if (isNaN(dur) || dur <= 0) {
    return res.status(400).json({ message: "Invalid duration" });
  }

  const end_time = new Date(Date.now() + dur * 1000);

  db.query(
    `INSERT INTO auctions 
     (seller_id, title, description, starting_price, current_price, end_time, image) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      seller_id,
      cleanTitle,
      cleanDescription,
      startPrice,
      startPrice,
      end_time,
      image,
    ],
    (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Error creating auction" });
      }

      return res.status(201).json({
        message: "Auction created successfully",
        auctionId: result.insertId,
      });
    }
  );
};

// ✅ GET ALL AUCTIONS (FOR GALLERY)
exports.getAuctions = (req, res) => {
  db.query(
    `SELECT a.*, u.name AS seller_name 
     FROM auctions a 
     JOIN users u ON a.seller_id = u.id`,
    (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Error fetching auctions" });
      }

      return res.status(200).json(result);
    }
  );
};

// ✅ GET SINGLE AUCTION
exports.getAuctionById = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT a.*, u.name AS seller_name 
     FROM auctions a 
     JOIN users u ON a.seller_id = u.id 
     WHERE a.id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Error fetching auction" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Auction not found" });
      }

      const auction = result[0];

      // optional: bids
      db.query(
        `SELECT b.*, u.name AS user_name 
         FROM bids b 
         JOIN users u ON b.user_id = u.id 
         WHERE b.auction_id = ? 
         ORDER BY b.amount DESC`,
        [id],
        (err, bids) => {
          if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).json({ message: "Error fetching bids" });
          }

          auction.bids = bids;
          return res.json(auction);
        }
      );
    }
  );
};