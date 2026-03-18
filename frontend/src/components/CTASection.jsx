import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  // States for Form & Toast
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("⏳ Submitting...");

    const formData = new FormData(e.target);
    formData.append("access_key", "7204ba5c-6385-4e57-bdc7-d4bf451f23c7");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: json,
      });

      const data = await res.json();
      if (data.success) {
        setStatus("");
        e.target.reset();
        showToast("success", "✅ Success! Welcome to the waitlist. 🚀");
      } else {
        setStatus("");
        showToast("error", "❌ Submission failed. Try again!");
      }
    } catch (error) {
      setStatus("");
      showToast("error", "❌ Network error. Please try later!");
    }
  };

  return (
    <section className="py-28 px-6 relative overflow-hidden" ref={ref}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-10 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              toast.type === "success" 
                ? "bg-green-500/20 border-green-500/50 text-green-200" 
                : "bg-red-500/20 border-red-500/50 text-red-200"
            }`}
          >
            <p className="font-bold text-sm">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="rounded-[3rem] border border-border bg-background/80 backdrop-blur-xl p-8 md:p-16 text-center shadow-2xl overflow-hidden relative">
          
          <div className="relative z-10">
            {/* Sparkle Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 mx-auto mb-8 flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Stop guessing.<br />
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Start knowing.</span>
            </h2>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-foreground text-background font-bold rounded-full flex items-center gap-2 shadow-xl"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <button className="px-8 py-4 bg-secondary border border-border text-foreground font-bold rounded-full hover:bg-secondary/80 transition-all">
                Book a Demo
              </button>
            </div>

            {/* --- Waitlist Form Section --- */}
            <div className="pt-12 border-t border-border/50">
              <p className="text-muted-foreground text-sm font-medium mb-6 uppercase tracking-widest">
                Join the Waitlist & Get Early Access
              </p>

              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                    className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border outline-none focus:border-primary/50 text-foreground transition-all"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border outline-none focus:border-primary/50 text-foreground transition-all"
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  required
                  rows="3"
                  className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border outline-none focus:border-primary/50 text-foreground resize-none transition-all"
                ></textarea>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={status !== ""}
                  className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {status ? status : "Reserve Your Spot 🚀"}
                </motion.button>
              </form>
            </div>

            {/* Animated Logo */}
            <div className="mt-20 flex justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative w-28 h-28 rounded-3xl border border-primary/20 bg-primary/5 flex items-center justify-center backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                <span className="relative text-2xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">IQ</span>
              </motion.div>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;