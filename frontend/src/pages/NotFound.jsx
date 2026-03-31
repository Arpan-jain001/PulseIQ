import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      {/* 🌌 Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#a5b4fc_0%,transparent_40%),radial-gradient(circle_at_80%_10%,#c084fc_0%,transparent_40%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />

      {/* ✨ Stars */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* 🚀 Floating Glow */}
      <motion.div
        className="absolute w-72 h-72 bg-purple-500 rounded-full blur-[120px] opacity-20"
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* 🧑‍🚀 Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative z-10 text-center max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10"
      >

        {/* 🔥 404 Animated */}
        <motion.h1
          className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-4"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          404
        </motion.h1>

        <h2 className="text-xl font-bold text-white mb-2">
          Lost in Space 🚀
        </h2>

        <p className="text-sm text-slate-300 mb-6">
          The page you're looking for drifted into the void.
        </p>

        {/* 🎮 Buttons */}
        <div className="flex gap-3 justify-center">

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white font-semibold backdrop-blur"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg"
          >
            <Home size={16} />
            Home
          </motion.button>

        </div>

        {/* 👇 Floating Emoji (Astronaut vibe) */}
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🧑‍🚀
        </motion.div>

      </motion.div>
    </div>
  );
};

export default NotFound;