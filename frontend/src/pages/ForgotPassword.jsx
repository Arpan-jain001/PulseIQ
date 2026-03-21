import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, ArrowLeft, Mail, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const TIMEOUT_MS = 30_000;

// ─── Toast ────────────────────────────────────────────────────────────────────
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const bar = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  return (
    <motion.div
      className="fixed z-[10000] bottom-5 right-5 w-[92%] max-w-sm"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className={`h-[3px] w-full ${bar}`} />
        <div className="px-4 py-3 flex gap-3 items-start">
          <div className="h-9 w-9 rounded-xl bg-[#6366f1] text-white flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0">PI</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><span>{badge}</span><span>PulseIQ</span></div>
            <div className="text-sm text-slate-600 mt-0.5">{message}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none mt-0.5">×</button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const abortRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const fireToast = useCallback((type, message) => {
    if (!isMountedRef.current) return;
    setToast({ type, message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 3500);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      await axios.post(
        `${BASE_API_URL}/api/auth/forgot-password`,
        { email },
        { signal: abortRef.current.signal, timeout: TIMEOUT_MS }
      );

      if (!isMountedRef.current) return;
      setSent(true);
      fireToast("success", "Reset link & OTP sent! Check your email.");

      setTimeout(() => {
        if (isMountedRef.current)
          navigate(`/reset-password-otp?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === "AbortError") return;
      if (err.code === "ECONNABORTED") {
        fireToast("error", "⏱ Request timed out. Please try again.");
      } else {
        fireToast("error", err.response?.data?.message || "Something went wrong");
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <AnimatePresence>
        {toast && <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .animate-gradient { animation: gradientMove 7s ease infinite; }
      `}</style>

      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <div className="rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(2,6,23,0.14)] border border-white/70 bg-white/60 backdrop-blur-xl p-8 sm:p-10">
            {/* Back link */}
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-7 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Login
            </Link>

            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm"
            >
              <Mail className="w-6 h-6 text-indigo-600" />
            </motion.div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Forgot Password?</h2>
            <p className="text-sm text-slate-400 mb-7 leading-relaxed">
              Enter your email and we'll send you a reset link + OTP.
            </p>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="text-4xl mb-3">📬</div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Email Sent!</h3>
                  <p className="text-sm text-slate-500 mb-1">Reset link & OTP sent to:</p>
                  <p className="text-sm font-bold text-indigo-600">{email}</p>
                  <p className="text-xs text-slate-400 mt-3">Redirecting to OTP page…</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all text-sm shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black rounded-full transition-all shadow-lg shadow-indigo-200/60 hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed tracking-wide"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                    ) : (
                      <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Protected by PulseIQ Shield™ — Enterprise Grade Security
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}