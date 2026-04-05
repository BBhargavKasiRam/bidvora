import API from "../api/axios";

export const fetchAuctions = () => {
  return API.get("/auctions");
};

export const createAuction = (data) => {
  return API.post("/auctions", data);
};