import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, MailCheck } from "lucide-react";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputs = useRef([]);

  // ❌ redirect if no email
  useEffect(() => {
    if (!email) navigate("/login");
  }, []);

  // ⏳ TIMER
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 🔥 OTP INPUT HANDLER (NEXT LEVEL UX)
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const finalOTP = otp.join("");

  // ✅ VERIFY
  const verifyOTP = async () => {
    try {
      setLoading(true);

      await axios.post(`${BASE_API_URL}/api/auth/verify-email-otp`, {
        email,
        otp: finalOTP,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND
  const resendOTP = async () => {
    try {
      await axios.post(`${BASE_API_URL}/api/auth/resend-verification`, {
        email,
      });
      setTimer(60);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      {/* 🌈 BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100" />
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,#6366f1_0%,transparent_40%),radial-gradient(circle_at_80%_30%,#a855f7_0%,transparent_40%)]" />

      {/* 💎 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_30px_80px_rgba(0,0,0,0.1)] p-8"
      >
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center"
          >
            <MailCheck className="text-indigo-600" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Verify Your Email
        </h2>

        <p className="text-sm text-center text-gray-500 mt-2">
          Enter OTP sent to
        </p>

        <motion.p
          className="text-center font-semibold text-indigo-600 mt-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {email}
        </motion.p>

        {/* 🔢 OTP INPUT */}
        <div className="flex justify-between gap-2 mt-6">
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              whileFocus={{ scale: 1.1 }}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white/80"
            />
          ))}
        </div>

        {/* 🔘 VERIFY BUTTON */}
        <button
          onClick={verifyOTP}
          disabled={loading || finalOTP.length < 6}
          className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold flex justify-center items-center gap-2 hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
        </button>

        {/* 🔁 RESEND */}
        <p className="text-center mt-4 text-sm text-gray-500">
          {timer > 0 ? (
            <span>Resend in {timer}s</span>
          ) : (
            <span
              onClick={resendOTP}
              className="text-indigo-600 cursor-pointer font-semibold hover:underline"
            >
              Resend OTP
            </span>
          )}
        </p>

        {/* ✅ SUCCESS ANIMATION */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-3xl"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold text-gray-700">
                  Email Verified!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;