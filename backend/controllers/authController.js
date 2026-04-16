

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 REGISTER
exports.register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    email = email.trim().toLowerCase().replace(/\s+/g, "");

    // ✅ Check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Server error" });
        }

        if (result.length > 0) {
          return res.status(400).json({
            message: "Email already registered",
          });
        }

        const hashed = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
          [name, email, hashed, role],
          (err) => {
            if (err) {
              return res.status(500).json({
                message: "Server error",
              });
            }

            res.json({
              message: "User registered successfully",
            });
          }
        );
      }
    );
  } catch {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// 🔐 LOGIN
exports.login = (req, res) => {
  let { email, password } = req.body;

  email = email.trim().toLowerCase().replace(/\s+/g, "");

  db.query("SELECT * FROM users", async (err, users) => {
    if (err) {
      return res.status(500).json({
        message: "Server error",
      });
    }

    const user = users.find(
      (u) => u.email.trim().toLowerCase() === email
    );

    if (!user) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    // ✅ ADDED (ensure same secret everywhere)
    const SECRET = process.env.JWT_SECRET || "secret";

    const token = jwt.sign(
      { id: user.id },
      SECRET, // ✅ FIXED
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  });
};

// 🔥 CHECK LOGIN EMAIL (unchanged)
exports.checkLoginEmail = (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email required",
    });
  }

  email = email.trim().toLowerCase().replace(/\s+/g, "");

  db.query("SELECT id, email FROM users", (err, users) => {
    if (err) {
      return res.status(500).json({
        message: "Server error",
      });
    }

    const found = users.find(
      (u) => u.email.trim().toLowerCase() === email
    );

    if (!found) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    res.json({ message: "OK" });
  });
};

// 🔥 NEW: CHECK REGISTER EMAIL
exports.checkRegisterEmail = (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email required",
    });
  }

  email = email.trim().toLowerCase().replace(/\s+/g, "");

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      res.json({ message: "OK" });
    }
  );
};