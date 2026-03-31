import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  const [cooldown, setCooldown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error
  const [errorMsg, setErrorMsg] = useState("");

  // ⏱️ TIMER
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifyOTP = async () => {
    try {
      setLoading(true);

      await axios.post(`${BASE_API_URL}/api/auth/verify-email-otp`, {
        email,
        otp,
      });

      setStatus("success");

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (cooldown) return;

    try {
      await axios.post(`${BASE_API_URL}/api/auth/resend-verification`, {
        email,
      });

      setTimer(60);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />

      {/* MAIN CARD */}
      <motion.div
        className="relative w-full max-w-md rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-2xl p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-black text-center mb-6 text-slate-900">
          Verify OTP 🔐
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter email"
          className="w-full mb-3 p-3 rounded-xl border border-slate-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* OTP */}
        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          className="w-full mb-4 p-3 rounded-xl border border-slate-200 text-center tracking-[10px] text-lg"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {/* BUTTON */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={verifyOTP}
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold mb-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </motion.button>

        {/* TIMER */}
        <div className="flex justify-between text-sm text-slate-500">
          <span>
            {timer > 0 ? `Resend in ${timer}s` : "You can resend now"}
          </span>

          <button
            onClick={resendOTP}
            disabled={cooldown || timer > 0}
            className="text-indigo-600 font-semibold disabled:opacity-40"
          >
            Resend
          </button>
        </div>
      </motion.div>

      {/* ✅ SUCCESS */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center shadow-2xl"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-xl font-black">Verified 🎉</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your email is verified
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❌ ERROR */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center shadow-2xl"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-xl font-black text-red-500">
                Error ❌
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {errorMsg}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}