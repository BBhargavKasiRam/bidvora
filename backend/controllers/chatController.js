const db = require("../config/db");

exports.getChatHistory = (req, res) => {
  const auctionId = req.params.auctionId;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;

  const query = `
    SELECT 
      cm.id, 
      cm.auction_id, 
      cm.user_id, 
      cm.message, 
      cm.is_system_message, 
      cm.created_at,
      u.name as user_name,
      u.role as user_role
    FROM chat_messages cm
    LEFT JOIN users u ON cm.user_id = u.id
    WHERE cm.auction_id = ?
    ORDER BY cm.created_at ASC
    LIMIT ?
  `;

  db.query(query, [auctionId, limit], (err, results) => {
    if (err) {
      console.error("Error fetching chat history:", err);
      return res.status(500).json({ message: "Server error fetching chat history" });
    }
    
    // Check for muted users in this room to communicate back to frontend
    db.query("SELECT user_id FROM muted_users WHERE auction_id = ?", [auctionId], (err, mutedResults) => {
        if (err) {
           return res.status(500).json({ message: "Server error fetching muted status" });
        }
        
        const mutedUsers = mutedResults.map(r => r.user_id);
        
        res.json({
            messages: results,
            mutedUsers: mutedUsers
        });
    });
  });
};
