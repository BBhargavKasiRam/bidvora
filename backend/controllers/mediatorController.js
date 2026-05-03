const db = require("../config/db");

// Verify mediator middleware logic (could be moved to middleware/authMiddleware.js, but kept simple here)
const verifyMediator = (req, res, next) => {
  if (req.user && req.user.role === 'mediator') {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Mediator access required." });
  }
};

// Fetch active auctions and flagged auctions for Mediator Dashboard
exports.getAuctions = (req, res) => {
  const query = `
    SELECT 
      a.id, a.title, a.current_price, a.status, a.end_time,
      u.name as seller_name,
      (SELECT COUNT(*) FROM mediator_actions ma WHERE ma.auction_id = a.id AND ma.action_type = 'flag_auction') as flag_count
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    WHERE a.status = 'active'
    ORDER BY flag_count DESC, a.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching auctions for mediator:", err);
      return res.status(500).json({ message: "Server error fetching auctions" });
    }
    res.json(results);
  });
};

// Log a mediator action (used for actions not fully real-time or to supplement socket actions)
exports.logAction = (req, res) => {
  const { auctionId, actionType, targetUserId, note } = req.body;
  const mediatorId = req.user.id;

  const query = `
    INSERT INTO mediator_actions (auction_id, mediator_id, action_type, target_user_id, note)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [auctionId, mediatorId, actionType, targetUserId || null, note || null], (err, result) => {
    if (err) {
      console.error("Error logging mediator action:", err);
      return res.status(500).json({ message: "Server error logging action" });
    }
    res.json({ message: "Action logged successfully", actionId: result.insertId });
  });
};

exports.verifyMediator = verifyMediator;
