const db = require("../config/db");

exports.getMediators = (req, res) => {
  const { search } = req.query;
  let sql = "SELECT id, name, email, profile_image, rating, items_sold FROM users WHERE role = 'auctioneer'";
  let params = [];

  if (search) {
    sql += " AND name LIKE ?";
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};
