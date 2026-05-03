const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bidvora/profiles" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// 🔐 REGISTER
exports.register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    email = email.trim().toLowerCase().replace(/\s+/g, "");

    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.length > 0) return res.status(400).json({ message: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashed, role || "buyer"],
        (err) => {
          if (err) return res.status(500).json({ message: "Server error" });
          res.json({ message: "User registered successfully" });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 LOGIN (Optimized & Role Included)
exports.login = (req, res) => {
  let { email, password } = req.body;
  email = email.trim().toLowerCase().replace(/\s+/g, "");

  // Query specific user by email instead of fetching all
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    
    const user = results[0];

    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const SECRET = process.env.JWT_SECRET || "secret";

    // Include ID and Role in the token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    // Remove password from user object before sending to frontend
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword, // Now contains 'role'
    });
  });
};

// 🔥 CHECK REGISTER EMAIL
exports.checkRegisterEmail = (req, res) => {
  try {
    console.log("Incoming body:", req.body); // 🔍 debug

    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    email = email.trim().toLowerCase();

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          console.error("DB ERROR:", err); // 🔥 VERY IMPORTANT
          return res.status(500).json({ message: "Database error" });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: "Email already registered" });
        }

        return res.json({ message: "OK" });
      }
    );
  } catch (error) {
    console.error("SERVER ERROR:", error); // 🔥 VERY IMPORTANT
    return res.status(500).json({ message: "Server error" });
  }
};

// 🔥 CHECK LOGIN EMAIL
exports.checkLoginEmail = (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  email = email.trim().toLowerCase().replace(/\s+/g, "");

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0) {
      return res.status(400).json({ message: "Email not registered" });
    }

    res.json({ message: "OK" });
  });
};

// 🔐 UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;
  
  console.log(`[updateProfile] User ${userId} updating profile`, { name, email, hasFile: !!req.file });

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    let imageUrl = null;

    if (req.file) {
      console.log(`[updateProfile] File detected, uploading to Cloudinary...`);
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image files are allowed" });
      }
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      console.log(`[updateProfile] Cloudinary upload successful:`, imageUrl);
    }

    // Check if email is already taken by another user
    db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.length > 0) return res.status(400).json({ message: "Email already in use" });

        let sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        let params = [name, email, userId];

        if (imageUrl) {
          sql = "UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?";
          params = [name, email, imageUrl, userId];
        }

        db.query(sql, params, (err) => {
          if (err) return res.status(500).json({ message: "Server error" });
          
          // Fetch updated user
          db.query("SELECT id, name, email, role, profile_image FROM users WHERE id = ?", [userId], (err, results) => {
             if (err) return res.status(500).json({ message: "Server error" });
             res.json({ message: "Profile updated successfully", user: results[0] });
          });
        });
      }
    );
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};