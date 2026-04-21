import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, Truck, CheckCircle, ExternalLink, Search } from "lucide-react";
import { api } from "../lib/api";

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking orders for now until backend is updated
    const fetchOrders = async () => {
      try {
        // In a real app, we'd have a /orders endpoint
        // For now, we'll simulate some data
        setTimeout(() => {
          setOrders([
            {
              id: "ORD-8821",
              title: "Vintage Rolex Submariner",
              price: 12500,
              status: "Processing",
              date: "2026-03-15",
              image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400"
            },
            {
              id: "ORD-7742",
              title: "Abstract Oil on Canvas",
              price: 3200,
              status: "Shipped",
              date: "2026-02-28",
              image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400"
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error(err);
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
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4 block">Acquisition History</span>
        <h1 className="text-6xl font-serif tracking-tight">My Orders</h1>
      </header>

      <div className="space-y-12">
        {orders.map((order) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={order.id} 
            className="bg-white border border-ink/5 p-10 flex flex-col lg:flex-row gap-12 hover:border-gold/30 transition-all shadow-xl group"
          >
            <div className="w-full lg:w-64 h-64 bg-paper overflow-hidden">
              <img 
                src={order.image} 
                alt={order.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="grow flex flex-col justify-between py-2">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-2">Order ID: {order.id}</span>
                    <h3 className="text-3xl font-serif group-hover:text-gold transition-colors">{order.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-2">Winning Bid</span>
                    <span className="text-3xl font-serif font-bold">${order.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-12">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-2">Purchase Date</p>
                    <p className="text-sm font-light">{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${order.status === 'Shipped' ? 'bg-green-500' : 'bg-gold'}`} />
                      <p className="text-sm font-bold uppercase tracking-widest">{order.status}</p>
                    </div>
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

        {orders.length === 0 && (
          <div className="text-center py-40 border border-dashed border-ink/10 bg-white/50">
            <Package className="w-16 h-16 text-ink/10 mx-auto mb-6" />
            <p className="text-2xl font-serif italic text-ink/40 mb-4">No acquisitions found.</p>
            <p className="text-[10px] uppercase tracking-widest text-ink/30">Start bidding to build your collection</p>
          </div>
        )}
      </div>
    </div>
  );
};
