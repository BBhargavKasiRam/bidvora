import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Gavel, Shield, Zap, Globe, ArrowRight } from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-ink/40 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Art" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-20 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-6 block">Est. 2026</span>
            <h1 className="text-8xl md:text-9xl font-serif text-paper mb-8 tracking-tighter leading-none">
              The Art of <br />
              <span className="italic">Acquisition</span>
            </h1>
            <p className="text-paper/70 text-lg font-light tracking-widest uppercase mb-12 max-w-2xl mx-auto leading-relaxed">
              Access the world's most exclusive auctions. Rare masterpieces, timeless treasures, and digital artifacts curated for the discerning collector.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link 
                to="/register" 
                className="px-12 py-5 bg-gold text-ink text-xs uppercase tracking-[0.3em] font-bold hover:bg-paper transition-all rounded-full flex items-center gap-3 group"
              >
                Join the Circle
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-12 py-5 border border-paper/30 text-paper text-xs uppercase tracking-[0.3em] font-bold hover:bg-paper/10 transition-all rounded-full"
              >
                Member Login
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-gold/50" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-paper flex items-center justify-center text-gold rounded-2xl shadow-inner">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif">Verified Provenance</h3>
              <p className="text-ink/50 font-light leading-relaxed">
                Every item listed on Bidvora undergoes a rigorous multi-stage authentication process by world-class experts.
              </p>
            </motion.div>
            
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-paper flex items-center justify-center text-gold rounded-2xl shadow-inner">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif">Real-Time Bidding</h3>
              <p className="text-ink/50 font-light leading-relaxed">
                Our proprietary low-latency engine ensures that every bid is recorded instantly, providing a seamless competitive experience.
              </p>
            </motion.div>
            
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-paper flex items-center justify-center text-gold rounded-2xl shadow-inner">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif">Global Logistics</h3>
              <p className="text-ink/50 font-light leading-relaxed">
                White-glove delivery to over 180 countries. We handle the complexities of international shipping and insurance.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-40 px-8 bg-paper text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-gold text-6xl font-serif mb-8 block">"</span>
          <h2 className="text-5xl md:text-6xl font-serif italic leading-tight mb-12">
            Value is not determined by the price paid, but by the rarity of the moment captured.
          </h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mb-6" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink/40">The Bidvora Manifesto</p>
        </div>
      </section>
    </div>
  );
};
