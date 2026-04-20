const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  let { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  email = email.trim().toLowerCase().replace(/\s+/g, "");

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length > 0) return res.status(400).json({ message: "Email already registered" });
    res.json({ message: "OK" });
  });
};

// (checkLoginEmail remains same)