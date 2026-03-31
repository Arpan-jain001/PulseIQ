import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const VerifyLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`${BASE_API_URL}/api/auth/verify-email/${token}`);
        setStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      {/* Background same as login */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />

      <AnimatePresence mode="wait">

        {/* 🔄 LOADING */}
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-10 text-center shadow-xl"
          >
            <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Verifying your email...</h2>
            <p className="text-sm text-slate-400 mt-2">Please wait a moment</p>
          </motion.div>
        )}

        {/* ✅ SUCCESS */}
        {status === "success" && (
  <motion.div
    key="success"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
  >
    <motion.div
      className="w-[90%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 text-center"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {/* Animated Tick */}
      <motion.div
        className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4"
        initial={{ scale: 0.5 }}
        animate={{ scale: [0.5, 1.2, 1] }}
        transition={{ duration: 0.5 }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24">
          <motion.path
            d="M20 6L9 17l-5-5"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4 }}
          />
        </svg>
      </motion.div>

      <h3 className="text-xl font-black text-slate-900">
        Email Verified 🎉
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Redirecting to login...
      </p>

      {/* Progress Bar */}
      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2 }}
        />
      </div>
    </motion.div>
  </motion.div>
)}

        {/* ❌ ERROR */}
        {status === "error" && (
  <motion.div
    key="error"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
  >
    <motion.div
      className="w-[90%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 text-center"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {/* ❌ Animated Cross */}
      <motion.div
        className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4"
        initial={{ scale: 0.5 }}
        animate={{ scale: [0.5, 1.2, 1] }}
        transition={{ duration: 0.5 }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24">
          <motion.path
            d="M6 6L18 18M6 18L18 6"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4 }}
          />
        </svg>
      </motion.div>

      <h3 className="text-xl font-black text-slate-900">
        Link Expired ❌
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Please request a new verification email
      </p>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate("/login")}
        className="mt-5 w-full py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold shadow-lg"
      >
        Go to Login
      </motion.button>
    </motion.div>
  </motion.div>
)}

      </AnimatePresence>
    </div>
  );
};

export default VerifyLink;