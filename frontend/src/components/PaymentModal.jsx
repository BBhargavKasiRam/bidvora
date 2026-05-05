import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, CreditCard, Globe, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

// Initialize Stripe with a placeholder if VITE_STRIPE_PUBLIC_KEY is not set
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const CheckoutForm = ({ order, currency, amount, onSuccess, onCancel, isMock }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Create PaymentIntent on the backend
      const { clientSecret, mock } = await api.post("/payments/create-intent", {
        auctionId: order.id,
        currency: currency.code,
      });

      if (mock) {
        // Simulate a delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Record transaction in database even for mock
        await api.post("/payments/confirm-payment", {
          auctionId: order.id,
          paymentIntentId: "mock_pi_" + Date.now()
        });
        
        onSuccess({ id: "mock_pi_" + Date.now() });
        return;
      }

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: "Valued Collector",
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // Record transaction in database
        await api.post("/payments/confirm-payment", {
          auctionId: order.id,
          paymentIntentId: result.paymentIntent.id
        });
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="p-6 bg-surface border border-white/5 rounded-xl shadow-inner shadow-black/50">
        <div className="flex justify-between items-center mb-6">
          <label className="text-[10px] uppercase tracking-widest font-bold text-ink/60">Card Details</label>
          <div className="flex gap-2">
            <Lock className="w-3 h-3 text-accent glow-text" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-accent">Secure Encrypted</span>
          </div>
        </div>
        
        <div className="px-4 py-6 bg-paper rounded-lg border border-white/5">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': { color: '#6b7280' },
                  fontFamily: 'Inter, sans-serif',
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-red-500/10 text-red-400 text-xs items-center border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isMock && (
        <div className="p-4 bg-accent/10 text-accent text-[10px] uppercase tracking-widest font-bold flex gap-3 items-center border border-accent/20 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p>Sandbox Mode: Payment will be simulated (no real charge).</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-4 text-[10px] uppercase tracking-widest font-bold border border-white/10 hover:bg-white/5 transition-all disabled:opacity-50 rounded-xl text-ink/70"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-[2] py-4 glass-button bg-accent/20 border-accent/50 text-accent text-[10px] uppercase tracking-widest font-bold hover:bg-accent hover:text-surface hover:glow-accent transition-all relative overflow-hidden group disabled:opacity-50 rounded-xl"
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            `Pay ${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} Now`
          )}
        </button>
      </div>
    </form>
  );
};

export const PaymentModal = ({ isOpen, onClose, order }) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen || !order) return;

    const fetchCurrencies = async () => {
      try {
        const data = await api.get("/payments/currencies");
        setCurrencies(data);
        const usd = data.find(c => c.code === "USD");
        setSelectedCurrency(usd);
        setConvertedAmount(Number(order.price));
      } catch (err) {
        console.error("Failed to fetch currencies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [isOpen, order?.price]);

  const handleCurrencySelect = async (currency) => {
    if (!order) return;
    setSelectedCurrency(currency);
    setShowCurrencyDropdown(false);
    try {
      const data = await api.get(`/payments/convert?amount=${order.price}&currency=${currency.code}`);
      setConvertedAmount(data.converted);
    } catch (err) {
      console.error("Conversion failed:", err);
    }
  };

  const handleSuccess = (paymentIntent) => {
    // Broadcast to live chat
    getSocket().emit("sendChatMessage", {
      auctionId: order.id,
      userId: null,
      message: `A collector has just secured this acquisition with a successful payment!`,
      isSystemMessage: true,
      user: { name: "System", role: "system" }
    });

    setIsPaid(true);
    setTimeout(() => {
      onClose();
      setIsPaid(false);
    }, 3000);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 md:p-12 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-lg relative h-fit border border-white/10 overflow-hidden"
      >
        <div className="sticky top-0 z-20 p-8 border-b border-white/5 flex justify-between items-center bg-surface/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/50 text-accent flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-ink">Secure Checkout</h2>
              <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Auction Acquisition</p>
            </div>
          </div>
          {!isPaid && (
            <button 
              onClick={onClose} 
              className="flex items-center gap-2 px-4 py-2 glass-button text-ink/70 text-[10px] uppercase tracking-widest font-bold hover:text-red-400 hover:border-red-400/50 transition-all"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          )}
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {isPaid ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-accent/20 border border-accent/50 rounded-full flex items-center justify-center mx-auto mb-8 text-accent shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-serif mb-4 text-ink glow-text">Payment Successful</h3>
                <p className="text-ink/60 text-sm font-light max-w-xs mx-auto">
                  Your acquisition of <strong className="text-accent">{order.title}</strong> has been secured. Our curators will begin shipment processing shortly.
                </p>
              </motion.div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-accent glow-text" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent/70 animate-pulse">Initializing Secure Gateway</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                {/* Summary */}
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-2xl font-serif font-bold mb-1 text-ink">{order.title}</h4>
                    <p className="text-xs text-ink/50 font-light">Original price: ${Number(order.price).toLocaleString()} USD</p>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="flex items-center gap-2 px-4 py-2 glass-button text-[10px] uppercase tracking-widest font-bold text-ink/80 hover:text-accent hover:border-accent/50 transition-all"
                    >
                      <Globe className="w-4 h-4 text-accent" />
                      {selectedCurrency?.code}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showCurrencyDropdown ? "rotate-180" : ""}`} />
                    </button>
                    
                    {showCurrencyDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-white/10 shadow-2xl rounded-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                        {currencies.map(c => (
                          <button
                            key={c.code}
                            onClick={() => handleCurrencySelect(c)}
                            className="w-full px-6 py-4 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                          >
                            <div>
                              <span className="text-[10px] font-bold text-ink group-hover:text-accent">{c.code}</span>
                              <p className="text-[9px] text-ink/50 uppercase tracking-tighter">{c.name}</p>
                            </div>
                            <span className="text-xs font-serif italic text-ink/40">{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                   <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/50">Total Payment Due</p>
                   <div className="text-right">
                     <span className="text-5xl font-serif font-bold text-accent glow-text">
                       {selectedCurrency?.symbol}{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </span>
                   </div>
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    order={order} 
                    currency={selectedCurrency} 
                    amount={convertedAmount}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                    isMock={!import.meta.env.VITE_STRIPE_PUBLIC_KEY}
                  />
                </Elements>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-6 opacity-30 grayscale">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-ink/20 font-bold leading-relaxed">
                    By clicking "Pay Now", you authorize Bidvora to process this transaction securely. <br />
                    Taxes and insurance are included in the final amount.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
