const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

    const validRoles = ['buyer', 'seller', 'mediator'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

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

// 🔥 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  db.query("SELECT id, name FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "Email not found" });

    const user = results[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    // Token expires in 1 hour
    const expires = new Date(Date.now() + 3600000);

    db.query(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?",
      [hashedToken, expires, user.id],
      async (err) => {
        if (err) return res.status(500).json({ message: "Server error" });

        // Send email
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER || "noreply.bidvora@gmail.com", 
            pass: process.env.EMAIL_PASS || "your-app-password" 
          }
        });

        // Use ethereal if no env variables set for testing
        // You might want to use a real email service in production
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${email}`;
        
        try {
          await transporter.sendMail({
            from: '"Bidvora Support" <support@bidvora.com>',
            to: email,
            subject: "Password Reset Request",
            html: `<p>Hi ${user.name},</p><p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a><p>This link will expire in 1 hour.</p>`
          });
          res.json({ message: "Password reset link sent to your email" });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
          // For demo/development purposes if email fails to send, return the token in response
          res.json({ message: "Email could not be sent. If in dev mode, use this link: " + resetUrl });
        }
      }
    );
  });
};

// 🔥 RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: "All fields are required" });

  db.query(
    "SELECT id, password_reset_token, password_reset_expires FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) return res.status(400).json({ message: "Invalid request" });

      const user = results[0];
      
      if (!user.password_reset_token || !user.password_reset_expires) {
         return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      if (new Date() > new Date(user.password_reset_expires)) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      const isValidToken = await bcrypt.compare(token, user.password_reset_token);
      if (!isValidToken) return res.status(400).json({ message: "Invalid reset token" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
        [hashedPassword, user.id],
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to reset password" });
          res.json({ message: "Password reset successfully" });
        }
      );
    }
  );
};