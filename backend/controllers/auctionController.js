const db = require("../config/db");

exports.createAuction = (req, res) => {
  const { title, description, starting_price, duration } = req.body;

  const end_time = new Date(Date.now() + duration * 1000);

  db.query(
    "INSERT INTO auctions (seller_id,title,description,starting_price,current_price,end_time) VALUES (?,?,?,?,?,?)",
    [1, title, description, starting_price, starting_price, end_time],
    (err) => {
      if (err) {
        console.log(err);
        return res.send("Error creating auction");
      }

      res.send("Auction created successfully");
    }
  );
};

exports.getAuctions = (req, res) => {
  db.query("SELECT * FROM auctions", (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
};
