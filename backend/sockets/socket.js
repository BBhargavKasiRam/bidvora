module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("joinAuction", (auctionId) => {
      socket.join(auctionId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
