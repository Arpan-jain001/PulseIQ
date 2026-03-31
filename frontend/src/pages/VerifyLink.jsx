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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-10 text-center shadow-xl"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Email Verified 🎉</h2>
            <p className="text-sm text-slate-400 mt-2">
              Redirecting to login...
            </p>
          </motion.div>
        )}

        {/* ❌ ERROR */}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-10 text-center shadow-xl"
          >
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">
              Invalid or Expired Link
            </h2>
            <p className="text-sm text-slate-400 mt-2 mb-4">
              Please request a new verification email
            </p>

            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition"
            >
              Go to Login
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default VerifyLink;