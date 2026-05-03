const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// 🔥 Upload helper
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bidvora" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ✅ CREATE AUCTION (IMAGE MANDATORY)
exports.createAuction = async (req, res) => {
  try {
    const { title, description, starting_price, duration, mediator_id } = req.body;

    if (!title || !description || !starting_price || !duration || !mediator_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔥 Image is REQUIRED
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required to create an auction",
      });
    }

    // 🔐 Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }

    const seller_id = req.user.id;
    const startPrice = Number(starting_price);
    const end_time = new Date(Date.now() + Number(duration) * 1000);

    // 🔥 Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);
    const imageUrl = result.secure_url;

    db.query(
      `INSERT INTO auctions 
      (seller_id, mediator_id, title, description, starting_price, current_price, end_time, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [seller_id, mediator_id, title, description, startPrice, startPrice, end_time, imageUrl],
      (err, result) => {
        if (err) {
          console.error("DB ERROR:", err);
          return res.status(500).json({ message: "Error creating auction" });
        }
        return res.status(201).json({
          message: "Created successfully",
          auctionId: result.insertId,
        });
      }
    );

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ✅ UPDATE AUCTION (IMAGE OPTIONAL)
exports.updateAuction = (req, res) => {
  const { id } = req.params;
  const { title, description, current_price } = req.body;
  const seller_id = req.user.id;

  db.query(
    "SELECT end_time, seller_id FROM auctions WHERE id = ?",
    [id],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Auction not found" });

      const auction = results[0];
      const isEnded = new Date(auction.end_time) <= new Date();

      if (isEnded) {
        return res.status(403).json({
          message: "This auction is closed and cannot be edited.",
        });
      }

      if (auction.seller_id !== seller_id) {
        return res.status(403).json({
          message: "Unauthorized to edit this listing.",
        });
      }

      try {
        let imageUrl = null;

        // 🔥 Upload new image if provided
        if (req.file) {
          if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({
              message: "Only image files are allowed",
            });
          }
          const result = await uploadToCloudinary(req.file.buffer);
          imageUrl = result.secure_url;
        }

        let sql;
        let params;
        const priceNum = Number(current_price);

        if (imageUrl) {
          sql = `UPDATE auctions SET title = ?, description = ?, current_price = ?, image = ? WHERE id = ?`;
          params = [title, description, priceNum, imageUrl, id];
        } else {
          sql = `UPDATE auctions SET title = ?, description = ?, current_price = ? WHERE id = ?`;
          params = [title, description, priceNum, id];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("UPDATE ERROR:", err);
            return res.status(500).json({ message: "Update failed" });
          }
          return res.json({ message: "Listing updated successfully" });
        });

      } catch (err) {
        console.error("UPLOAD ERROR:", err);
        res.status(500).json({ message: "Upload failed" });
      }
    }
  );
};

// ✅ GET ALL AUCTIONS
exports.getAuctions = (req, res) => {
  const { status, seller_id, mediator_id } = req.query;
  let query = `SELECT a.*, u.name AS seller_name FROM auctions a JOIN users u ON a.seller_id = u.id WHERE 1=1`;
  let params = [];

  if (status === 'active') {
    query += ` AND a.end_time > NOW()`;
  } else if (status === 'ended') {
    query += ` AND a.end_time <= NOW()`;
  }

  if (seller_id) {
    query += ` AND a.seller_id = ?`;
    params.push(seller_id);
  }

  if (mediator_id) {
    query += ` AND a.mediator_id = ?`;
    params.push(mediator_id);
  }

  query += ` ORDER BY a.created_at DESC`;

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching" });
    res.json(result);
  });
};

// ✅ GET SINGLE AUCTION (Updated to include Bid History)
exports.getAuctionById = (req, res) => {
  const { id } = req.params;

  // 1. Fetch the auction details
  db.query(
    `SELECT a.*, u.name AS seller_name 
     FROM auctions a 
     JOIN users u ON a.seller_id = u.id 
     WHERE a.id = ?`,
    [id],
    (err, auctionResults) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (auctionResults.length === 0)
        return res.status(404).json({ message: "Auction not found" });

      const auction = auctionResults[0];

      // 2. Fetch the bid history for this auction
      db.query(
        `SELECT b.*, u.name AS user_name 
         FROM bids b 
         JOIN users u ON b.user_id = u.id 
         WHERE b.auction_id = ? 
         ORDER BY b.amount DESC`,
        [id],
        (err, bidResults) => {
          if (err) {
            console.error("BIDS FETCH ERROR:", err);
            auction.bids = []; // Return empty array if error
          } else {
            auction.bids = bidResults;
          }
          
          // Return the combined object
          res.json(auction);
        }
      );
    }
  );
};

// ✅ DELETE AUCTION
exports.deleteAuction = (req, res) => {
  const { id } = req.params;
  const seller_id = req.user.id;

  // 1. Verify auction exists and belongs to the user
  db.query(
    "SELECT seller_id, end_time FROM auctions WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Auction not found" });

      if (results[0].seller_id !== seller_id) {
        return res.status(403).json({
          message: "Unauthorized to delete this listing.",
        });
      }

      const isEnded = new Date(results[0].end_time) <= new Date();
      if (!isEnded) {
        return res.status(403).json({
          message: "Cannot delete an active auction. Wait until it ends.",
        });
      }

      // 2. Delete related records first (manual cascade)
      const deleteBids = "DELETE FROM bids WHERE auction_id = ?";
      const deleteTransactions = "DELETE FROM transactions WHERE auction_id = ?";
      const deleteWatchlist = "DELETE FROM watchlist WHERE auction_id = ?";
      const deleteMedia = "DELETE FROM media WHERE auction_id = ?";
      const deleteAuction = "DELETE FROM auctions WHERE id = ?";

      db.query(deleteBids, [id], (err) => {
        if (err) console.error("Error deleting bids:", err);
        db.query(deleteTransactions, [id], (err) => {
          if (err) console.error("Error deleting transactions:", err);
          db.query(deleteWatchlist, [id], (err) => {
            if (err) console.error("Error deleting watchlist:", err);
            db.query(deleteMedia, [id], (err) => {
              if (err) console.error("Error deleting media:", err);
              db.query(deleteAuction, [id], (err) => {
                if (err) {
                  console.error("Error deleting auction:", err);
                  return res.status(500).json({ message: "Delete failed" });
                }
                return res.json({ message: "Listing deleted successfully" });
              });
            });
          });
        });
      });
    }
  );
};

// ✅ ASSIGN MEDIATOR
exports.assignMediator = (req, res) => {
  const { id } = req.params;
  const { mediator_id, commission } = req.body;
  const seller_id = req.user.id;

  db.query(
    "SELECT seller_id FROM auctions WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "Auction not found" });
      if (results[0].seller_id !== seller_id) return res.status(403).json({ message: "Unauthorized" });

      db.query(
        "UPDATE auctions SET mediator_id = ?, mediator_status = 'pending', mediator_commission = ? WHERE id = ?",
        [mediator_id, commission || 0, id],
        (err) => {
          if (err) return res.status(500).json({ message: "Update failed" });
          res.json({ message: "Mediator assigned successfully. Waiting for acceptance." });
        }
      );
    }
  );
};

// ✅ CLOSE AUCTION (MEDIATOR ONLY)
exports.closeAuction = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query(
    "SELECT mediator_id FROM auctions WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "Auction not found" });
      if (results[0].mediator_id !== user_id) return res.status(403).json({ message: "Unauthorized: Only the assigned mediator can lock the auction" });

      db.query(
        "UPDATE auctions SET end_time = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        (err) => {
          if (err) return res.status(500).json({ message: "Update failed" });
          res.json({ message: "Auction locked successfully" });
        }
      );
    }
  );
};

// ✅ UPDATE MEDIATOR STATUS (Accept / Reject)
exports.updateMediatorStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'
  const user_id = req.user.id;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  db.query(
    "UPDATE auctions SET mediator_status = ? WHERE id = ? AND mediator_id = ?",
    [status, id, user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      if (results.affectedRows === 0) return res.status(403).json({ message: "Unauthorized or auction not found" });
      res.json({ message: `Assignment ${status}` });
    }
  );
};

// ✅ GET MEDIATOR MESSAGES
exports.getMediatorMessages = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  // Check if user is seller or mediator
  db.query("SELECT seller_id, mediator_id FROM auctions WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Auction not found" });
    const auction = results[0];
    if (user_id !== auction.seller_id && user_id !== auction.mediator_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    db.query(
      `SELECT m.*, u.name as sender_name 
       FROM mediator_messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.auction_id = ? ORDER BY m.created_at ASC`,
      [id],
      (err, messages) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(messages);
      }
    );
  });
};

// ✅ SEND MEDIATOR MESSAGE
exports.sendMediatorMessage = (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user_id = req.user.id;

  if (!message || !message.trim()) return res.status(400).json({ message: "Message is required" });

  db.query("SELECT seller_id, mediator_id FROM auctions WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Auction not found" });
    const auction = results[0];
    if (user_id !== auction.seller_id && user_id !== auction.mediator_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    db.query(
      "INSERT INTO mediator_messages (auction_id, sender_id, message) VALUES (?, ?, ?)",
      [id, user_id, message],
      (err) => {
        if (err) return res.status(500).json({ message: "Failed to send message" });
        res.status(201).json({ message: "Message sent" });
      }
    );
  });
};