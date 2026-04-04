const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.send("No token");

  const decoded = jwt.verify(token, "secret");
  req.user = decoded;

  next();
};
