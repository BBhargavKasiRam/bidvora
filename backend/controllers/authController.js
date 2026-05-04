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

    const validRoles = ['buyer', 'consignor', 'auctioneer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role || "buyer"]
    );
    
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 LOGIN
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase().replace(/\s+/g, "");

    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = results[0];

    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }

    if (user.is_google_user && !user.password) {
        return res.status(400).json({ message: "This account uses Google Login. Please sign in with Google." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const SECRET = process.env.JWT_SECRET || "secret";

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    let { email, name, profile_image, uid } = req.body;
    email = email.trim().toLowerCase().replace(/\s+/g, "");

    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    let user = results[0];
    const SECRET = process.env.JWT_SECRET || "secret";

    if (user) {
      // Existing user: Update profile image if they don't have one
      if (!user.profile_image && profile_image) {
        await db.query("UPDATE users SET profile_image = ?, is_google_user = 1 WHERE id = ?", [profile_image, user.id]);
        user.profile_image = profile_image;
      } else {
        await db.query("UPDATE users SET is_google_user = 1 WHERE id = ?", [user.id]);
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        SECRET,
        { expiresIn: "1d" }
      );

      const { password: _, ...userWithoutPassword } = user;
      return res.json({ token, user: userWithoutPassword });
    } else {
      // New user: Create account
      const [result] = await db.query(
        "INSERT INTO users (name, email, profile_image, role, is_google_user) VALUES (?, ?, ?, ?, ?)",
        [name, email, profile_image, "buyer", 1]
      );
      
      const newId = result.insertId;
      const token = jwt.sign(
        { id: newId, role: "buyer" },
        SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: { id: newId, name, email, role: "buyer", profile_image }
      });
    }
  } catch (err) {
    console.error("Google Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 CHECK REGISTER EMAIL
exports.checkRegisterEmail = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    email = email.trim().toLowerCase();

    const [result] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (result.length > 0) return res.status(400).json({ message: "Email already registered" });
    return res.json({ message: "OK" });
  } catch (error) {
    console.error("Check Register Email error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🔥 CHECK LOGIN EMAIL
exports.checkLoginEmail = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    email = email.trim().toLowerCase().replace(/\s+/g, "");

    const [result] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (result.length === 0) return res.status(400).json({ message: "Email not registered" });
    res.json({ message: "OK" });
  } catch (err) {
    console.error("Check Login Email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.user.id;
    
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

    let imageUrl = null;
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) return res.status(400).json({ message: "Only image files are allowed" });
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );
    if (existing.length > 0) return res.status(400).json({ message: "Email already in use" });

    let sql = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
    let params = [name, email, role || "buyer", userId];

    if (imageUrl) {
      sql = "UPDATE users SET name = ?, email = ?, role = ?, profile_image = ? WHERE id = ?";
      params = [name, email, role || "buyer", imageUrl, userId];
    }

    await db.query(sql, params);
    
    const [results] = await db.query("SELECT id, name, email, role, profile_image FROM users WHERE id = ?", [userId]);
    res.json({ message: "Profile updated successfully", user: results[0] });
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

// 🔥 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [results] = await db.query("SELECT id, name FROM users WHERE email = ?", [email]);
    if (results.length === 0) return res.status(404).json({ message: "Email not found" });

    const user = results[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expires = new Date(Date.now() + 3600000);

    await db.query(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?",
      [hashedToken, expires, user.id]
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "noreply.bidvora@gmail.com", 
        pass: process.env.EMAIL_PASS || "your-app-password" 
      }
    });

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
      res.json({ message: "Email could not be sent. If in dev mode, use this link: " + resetUrl });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ message: "All fields are required" });

    const [results] = await db.query(
      "SELECT id, password_reset_token, password_reset_expires FROM users WHERE email = ?",
      [email]
    );
    
    if (results.length === 0) return res.status(400).json({ message: "Invalid request" });

    const user = results[0];
    if (!user.password_reset_token || !user.password_reset_expires) return res.status(400).json({ message: "Invalid or expired reset token" });
    if (new Date() > new Date(user.password_reset_expires)) return res.status(400).json({ message: "Reset token has expired" });

    const isValidToken = await bcrypt.compare(token, user.password_reset_token);
    if (!isValidToken) return res.status(400).json({ message: "Invalid reset token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );
    
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};