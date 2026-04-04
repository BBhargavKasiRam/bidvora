const db = require("../config/db");

exports.createAuction = (req, res) => {
  const { title, description, starting_price, duration } = req.body;

  const end_time = new Date(Date.now() + duration * 1000);

  db.query(
    "INSERT INTO auctions (seller_id,title,description,starting_price,current_price,end_time) VALUES (?,?,?,?,?,?)",
    [1, title, description, starting_price, starting_price, end_time],
    (err) => {
      if (err) return res.send(err);
      res.send("Auction created");
    }
  );
};

exports.getAuctions = (req, res) => {
  db.query("SELECT * FROM auctions WHERE status='active'", (err, result) => {
    res.json(result);
  });
};
