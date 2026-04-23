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
    const { title, description, starting_price, duration } = req.body;

    if (!title || !description || !starting_price || !duration) {
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
      (seller_id, title, description, starting_price, current_price, end_time, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [seller_id, title, description, startPrice, startPrice, end_time, imageUrl],
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
  db.query(
    `SELECT a.*, u.name AS seller_name 
     FROM auctions a 
     JOIN users u ON a.seller_id = u.id`,
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error fetching" });
      res.json(result);
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
      if (err || result.length === 0)
        return res.status(404).json({ message: "Not found" });

      res.json(result[0]);
    }
  );
};