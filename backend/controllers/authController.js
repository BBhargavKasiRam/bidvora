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

// 🔐 SEND REGISTER OTP
exports.sendRegisterOTP = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    email = email.trim().toLowerCase().replace(/\s+/g, "");

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Upsert into registration_otps
    await db.query(
      "INSERT INTO registration_otps (email, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?",
      [email, hashedOTP, expires, hashedOTP, expires]
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

    try {
      await transporter.sendMail({
        from: '"Bidvora Support" <support@bidvora.com>',
        to: email,
        subject: "Your Registration OTP",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Welcome to Bidvora!</h2>
            <p>You are almost there. Use the OTP below to complete your registration:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D4AF37;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
              This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        `
      });
      res.json({ message: "OTP sent to your email" });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
      res.json({ message: "OTP could not be sent. If in dev mode, use this OTP: " + otp });
    }
  } catch (err) {
    console.error("Send register OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 REGISTER
exports.register = async (req, res) => {
  try {
    let { name, email, password, role, otp } = req.body;
    email = email.trim().toLowerCase().replace(/\s+/g, "");

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const validRoles = ['buyer', 'consignor', 'auctioneer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

    const [otpResults] = await db.query("SELECT otp, expires_at FROM registration_otps WHERE email = ?", [email]);
    if (otpResults.length === 0) return res.status(400).json({ message: "No OTP requested for this email" });

    const registrationOtpData = otpResults[0];
    if (new Date() > new Date(registrationOtpData.expires_at)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isValid = await bcrypt.compare(otp, registrationOtpData.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role || "buyer"]
    );
    
    // Clean up OTP
    await db.query("DELETE FROM registration_otps WHERE email = ?", [email]);

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

// 🔐 SOCIAL LOGIN (Google, Microsoft, Facebook)
exports.socialLogin = async (req, res) => {
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
        { expiresIn: "7d" }
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
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: { id: newId, name, email, role: "buyer", profile_image }
      });
    }
  } catch (err) {
    console.error("Social Login error:", err);
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

// 🔥 FORGOT PASSWORD (OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [results] = await db.query("SELECT id, name FROM users WHERE email = ?", [email]);
    if (results.length === 0) return res.status(404).json({ message: "Email not found" });

    const user = results[0];
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60000); // 10 minutes

    await db.query(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?",
      [hashedOTP, expires, user.id]
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

    try {
      await transporter.sendMail({
        from: '"Bidvora Support" <support@bidvora.com>',
        to: email,
        subject: "Your Password Reset OTP",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Password Reset</h2>
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Use the OTP below to proceed:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D4AF37;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
              This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        `
      });
      res.json({ message: "OTP sent to your email" });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
      res.json({ message: "OTP could not be sent. If in dev mode, use this OTP: " + otp });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const [results] = await db.query(
      "SELECT id, password_reset_token, password_reset_expires FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) return res.status(400).json({ message: "Invalid request" });

    const user = results[0];
    if (!user.password_reset_token || !user.password_reset_expires) {
      return res.status(400).json({ message: "No OTP requested for this email" });
    }

    if (new Date() > new Date(user.password_reset_expires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isValid = await bcrypt.compare(otp, user.password_reset_token);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields are required" });

    const [results] = await db.query(
      "SELECT id, password_reset_token, password_reset_expires FROM users WHERE email = ?",
      [email]
    );
    
    if (results.length === 0) return res.status(400).json({ message: "Invalid request" });

    const user = results[0];
    if (!user.password_reset_token || !user.password_reset_expires) return res.status(400).json({ message: "Invalid or expired reset token" });
    if (new Date() > new Date(user.password_reset_expires)) return res.status(400).json({ message: "Reset token has expired" });

    const isValid = await bcrypt.compare(otp, user.password_reset_token);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

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