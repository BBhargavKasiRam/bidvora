import API from "../api/axios";

export const placeBid = (data) => {
  return API.post("/bids", data);
};