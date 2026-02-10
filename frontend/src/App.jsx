import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 4000);
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });

      const data = await res.json();

      if (data.success) {
        setStatus("");
        e.target.reset();
        showToast("success", "✅ Form submitted successfully! 🚀");
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white flex items-center justify-center px-5 py-12">
      
      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 120, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl
              ${
                toast.type === "success"
                  ? "bg-green-500/15 border-green-400/30 text-green-200"
                  : "bg-red-500/15 border-red-400/30 text-red-200"
              }`}
          >
            <p className="font-semibold text-sm">{toast.message}</p>
            <p className="text-xs opacity-80 mt-1">
              PulseIQ Notification System
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="absolute inset-0">
        <div className="absolute -top-52 -left-52 w-[650px] h-[650px] bg-cyan-500/20 blur-[160px] rounded-full"></div>
        <div className="absolute top-20 -right-52 w-[650px] h-[650px] bg-purple-500/20 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-500/10 blur-[170px] rounded-full"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:70px_70px]"></div>

      {/* Floating Dots */}
      <FloatingDot className="top-20 left-16 w-3 h-3 bg-cyan-400" delay={0} />
      <FloatingDot className="bottom-40 left-28 w-2 h-2 bg-blue-400" delay={0.5} />
      <FloatingDot className="top-36 right-20 w-4 h-4 bg-purple-400" delay={0.3} />
      <FloatingDot className="bottom-28 right-40 w-3 h-3 bg-cyan-300" delay={0.8} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7 sm:p-12"
      >
        {/* Top Badge */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/10 shadow-lg"
          >
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <p className="text-sm font-semibold tracking-wide text-white/90">
              PulseIQ • AI Analytics SaaS Platform
            </p>
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-8 text-center text-4xl sm:text-6xl font-extrabold leading-tight"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            PulseIQ
          </span>{" "}
          is Launching Soon 🚀
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-5 text-center text-base sm:text-lg text-white/70 max-w-3xl mx-auto"
        >
          PulseIQ is an{" "}
          <span className="text-white/90 font-semibold">
            AI-powered SaaS analytics platform
          </span>{" "}
          that helps companies understand website & app user behaviour, track
          events, analyze funnels, and generate smart insights to improve
          conversion rate.
        </motion.p>

        {/* Highlight Chips */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-10 flex flex-wrap gap-3 justify-center"
        >
          <Chip text="📊 DAU / MAU Analytics" />
          <Chip text="📌 Funnel Drop Analysis" />
          <Chip text="🔁 Retention Tracking" />
          <Chip text="⚡ Real-time Events" />
          <Chip text="🤖 AI Suggestions" />
          <Chip text="💬 AI Chatbot Dashboard" />
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <FeatureCard
            title="Realtime User Tracking"
            desc="Track page views, button clicks, checkout drop-offs & exam exits."
            icon="⚡"
          />

          <FeatureCard
            title="Funnel + Conversion Reports"
            desc="Know exactly where users leave your website or application."
            icon="📌"
          />

          <FeatureCard
            title="AI Insights + Smart Alerts"
            desc="PulseIQ automatically detects issues and suggests improvements."
            icon="🤖"
          />
        </motion.div>

        {/* Web3Forms Form */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-14"
        >
          <p className="text-center text-white/70 text-sm sm:text-base font-medium">
            Join the Waitlist & Get Early Access 👇
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-2xl mx-auto space-y-4"
          >
            <input
              type="hidden"
              name="access_key"
              value="7204ba5c-6385-4e57-bdc7-d4bf451f23c7"
            />

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 outline-none focus:border-cyan-400/60 text-white placeholder:text-white/40"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 outline-none focus:border-cyan-400/60 text-white placeholder:text-white/40"
            />

            <textarea
              name="message"
              placeholder="Message (Example: I want PulseIQ for my website analytics)"
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 outline-none focus:border-purple-400/60 text-white placeholder:text-white/40 resize-none"
            ></textarea>

            <button
              type="submit"
              className="w-full px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:opacity-90 transition"
            >
              Submit Request 🚀
            </button>

            {status && (
              <p className="text-center text-sm text-white/70">{status}</p>
            )}
          </form>
        </motion.div>

        {/* Animated Chip Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-44 h-44 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shadow-xl"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/5 blur-xl"></div>

            <div className="relative w-24 h-24 rounded-xl border border-white/20 bg-slate-950/50 flex items-center justify-center">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                IQ
              </span>
            </div>

            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-cyan-400/40"></div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-purple-400/40"></div>
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[2px] h-24 bg-blue-400/40"></div>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-[2px] h-24 bg-purple-400/40"></div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-14 text-center text-sm text-white/50"
        >
          © {new Date().getFullYear()}{" "}
          <span className="text-white/70 font-semibold">PulseIQ</span>. All rights
          reserved.
        </motion.div>
      </motion.div>
    </div>
  );
}

/* Components */

function Chip({ text }) {
  return (
    <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/80 shadow-md">
      {text}
    </div>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 220 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl"
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 text-lg font-bold text-white/90">{title}</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FloatingDot({ className, delay }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[1px] opacity-70 ${className}`}
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
