import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  const [cooldown, setCooldown] = useState(false);

  // ⏱️ TIMER
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifyOTP = async () => {
    try {
      await axios.post(`${BASE_API_URL}/api/auth/verify-email-otp`, {
        email,
        otp,
      });
      alert("Verified ✅");
    } catch (err) {
      alert(err.response?.data?.message);
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
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 to-purple-200">
      <motion.div
        className="backdrop-blur-xl bg-white/40 border border-white/30 p-10 rounded-3xl shadow-2xl w-[380px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-bold text-center mb-5">
          Verify OTP 🔐
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full mb-3 p-3 rounded-xl border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          className="w-full mb-4 p-3 rounded-xl border text-center tracking-[10px] text-lg"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={verifyOTP}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl mb-3"
        >
          Verify OTP
        </button>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
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
    </div>
  );
}