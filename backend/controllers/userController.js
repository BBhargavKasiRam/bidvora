const db = require("../config/db");

exports.getMediators = (req, res) => {
  db.query(
    "SELECT id, name, email, profile_image, rating, items_sold FROM users WHERE role = 'mediator'",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
};
