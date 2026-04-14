const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔐 REGISTER
exports.register = async (req, res) => {
  console.log("REGISTER API HIT");

  try {
    let { name, email, password, role } = req.body;

    email = email.trim().toLowerCase();

    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hashed, role],
      (err, result) => {

        console.log("DB ERROR:", err);

        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              message: "Email already registered",
            });
          }

          return res.status(500).json({
            message: err.message,
          });
        }

        res.json({
          message: "User registered successfully",
        });
      }
    );

  } catch (error) {
    console.log("SERVER ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


// 🔐 LOGIN
exports.login = (req, res) => {
  console.log("LOGIN API HIT");

  let { email, password } = req.body;

  email = email.trim().toLowerCase();

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {

      if (err) {
        return res.status(500).json({
          message: "Server error",
        });
      }

      if (result.length === 0) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      const user = result[0];

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword,
      });
    }
  );
};


// 🔍 CHECK EMAIL (🔥 THIS FIXES YOUR ERROR)
exports.checkEmail = (req, res) => {
  let { email } = req.body;

  email = email.trim().toLowerCase();

  db.query(
    "SELECT id FROM users WHERE email=?",
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

      res.json({
        message: "OK",
      });
    }
  );
};