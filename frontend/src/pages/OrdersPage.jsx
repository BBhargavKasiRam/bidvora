import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Truck, CheckCircle, ExternalLink, Trophy, Clock } from "lucide-react";
import { api } from "../lib/api";

const STATUS_MAP = {
  Processing: { color: "bg-gold", label: "Processing" },
  Shipped: { color: "bg-green-500", label: "Shipped" },
  Delivered: { color: "bg-emerald-600", label: "Delivered" },
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get("/orders");
        setOrders(data);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <header className="mb-20">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4 block">
          Acquisition History
        </span>
        <h1 className="text-6xl font-serif tracking-tight">My Orders</h1>
        {orders.length > 0 && (
          <p className="mt-4 text-ink/40 text-sm font-light">
            {orders.length} winning acquisition{orders.length !== 1 ? "s" : ""}
          </p>
        )}
      </header>

      {error && (
        <div className="mb-10 p-4 bg-red-50 text-red-600 text-[11px] uppercase tracking-widest font-bold border-l-2 border-red-600">
          {error}
        </div>
      )}

      <div className="space-y-12">
        <AnimatePresence>
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white border border-ink/5 p-10 flex flex-col lg:flex-row gap-12 hover:border-gold/30 transition-all shadow-xl group"
            >
              {/* Image */}
              <div className="w-full lg:w-64 h-64 bg-paper overflow-hidden flex-shrink-0 relative">
                {order.image ? (
                  <img
                    src={order.image}
                    alt={order.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/20">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                {/* Winner badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-ink text-[9px] uppercase tracking-[0.2em] font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Won
                </div>
              </div>

              {/* Details */}
              <div className="grow flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-2">
                        Auction #{order.id.toString().padStart(4, "0")}
                      </span>
                      <h3 className="text-3xl font-serif group-hover:text-gold transition-colors">
                        {order.title}
                      </h3>
                      <p className="text-sm text-ink/50 mt-1 font-light">
                        Sold by {order.seller_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-2">
                        Winning Bid
                      </span>
                      <span className="text-3xl font-serif font-bold text-gold">
                        ${Number(order.price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-12 flex-wrap">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-2">
                        Won On
                      </p>
                      <p className="text-sm font-light">
                        {new Date(order.won_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-2">
                        Auction Ended
                      </p>
                      <p className="text-sm font-light">
                        {new Date(order.end_time).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-2">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gold">
                          Processing
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-2">
                        Savings
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        Started at ${Number(order.starting_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mt-10">
                  <button className="flex items-center gap-3 px-8 py-3 bg-ink text-paper text-[10px] uppercase tracking-widest font-bold hover:bg-gold transition-colors">
                    <Truck className="w-4 h-4" />
                    Track Shipment
                  </button>
                  <button className="flex items-center gap-3 px-8 py-3 border border-ink/10 text-[10px] uppercase tracking-widest font-bold hover:bg-ink hover:text-paper transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && orders.length === 0 && (
          <div className="text-center py-40 border border-dashed border-ink/10 bg-white/50">
            <Trophy className="w-16 h-16 text-ink/10 mx-auto mb-6" />
            <p className="text-2xl font-serif italic text-ink/40 mb-4">
              No winning bids yet.
            </p>
            <p className="text-[10px] uppercase tracking-widest text-ink/30">
              Start bidding to build your collection
            </p>
          </div>
        )}
      </div>
    </div>
  );
};