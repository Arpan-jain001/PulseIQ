import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ added

  const handleReset = async () => {
    if (!password) return;

    try {
      setLoading(true);

      await axios.post(`${BASE_API_URL}/api/auth/reset-password/${token}`, {
        password,
      });

      // ✅ SUCCESS FLOW
      setShowSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* ✅ SUCCESS OVERLAY */}
      {showSuccess && <SuccessOverlay />}

      <div className="relative min-h-screen flex items-center justify-center px-4 py-10 pt-28 overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative w-full max-w-md"
        >
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl p-8">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                Reset Password 🔐
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Enter your new password below
              </p>
            </div>

            {/* Password Input */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 pr-12 text-sm shadow-sm"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Updating...
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 mt-6">
              Protected by PulseIQ Shield™
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ✅ SUCCESS ANIMATION COMPONENT */
const SuccessOverlay = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="w-[90%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 text-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24">
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
      </div>

      <h3 className="text-lg font-black text-slate-900">
        Password Updated 🎉
      </h3>

      <p className="text-sm text-slate-400 mt-1">
        Redirecting to login...
      </p>

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
);