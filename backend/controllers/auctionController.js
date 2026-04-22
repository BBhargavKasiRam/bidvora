const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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

exports.createAuction = async (req, res) => {
  try {
    const { title, description, starting_price, duration } = req.body;

    if (!title || !description || !starting_price || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔥 Image mandatory
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required to create an auction",
      });
    }

    // 🔐 File type validation
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }

    const seller_id = req.user.id;
    const startPrice = Number(starting_price);
    const end_time = new Date(Date.now() + Number(duration) * 1000);

    // 🔥 Upload image
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

// (बाकी code same रहेगा — updateAuction, getAuctions, etc.)