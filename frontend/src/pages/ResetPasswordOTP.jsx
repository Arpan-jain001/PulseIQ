import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const TIMEOUT_MS = 30_000;

const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const bar = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  return (
    <motion.div className="fixed z-[10000] bottom-5 right-5 w-[92%] max-w-sm"
      initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className={`h-[3px] w-full ${bar}`} />
        <div className="px-4 py-3 flex gap-3 items-start">
          <div className="h-9 w-9 rounded-xl bg-[#6366f1] text-white flex items-center justify-center text-xs font-black flex-shrink-0">PI</div>
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

export default function ResetPasswordOTP() {
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email") || "";
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const inputs = useRef([]);
  const abortRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (!email) navigate("/forgot-password");
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

  const handleOTPChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    setError("");
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleOTPKey = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((c, i) => { newOtp[i] = c; });
    setOtp(newOtp);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalOTP = otp.join("");
    if (finalOTP.length < 6) { setError("Enter the complete 6-digit OTP."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (isLoading) return;

    setIsLoading(true);
    setError("");
    abortRef.current = new AbortController();

    try {
      await axios.post(
        `${BASE_API_URL}/api/auth/reset-password-otp`,
        { email, otp: finalOTP, password },
        { signal: abortRef.current.signal, timeout: TIMEOUT_MS }
      );

      if (!isMountedRef.current) return;
      setSuccess(true);
      fireToast("success", "Password reset successful! Redirecting to login…");

      setTimeout(() => {
        if (isMountedRef.current) navigate("/login");
      }, 2000);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === "AbortError") return;
      const msg = err.response?.data?.message || "Reset failed. Please try again.";
      setError(msg);
      fireToast("error", msg);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const finalOTP = otp.join("");

  return (
    <>
      <Navbar />
      <AnimatePresence>
        {toast && <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}>
          <div className="rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(2,6,23,0.14)] border border-white/70 bg-white/60 backdrop-blur-xl p-8 sm:p-10 relative">

            <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-7 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Link>

            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
              className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
              <KeyRound className="w-6 h-6 text-indigo-600" />
            </motion.div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Reset Password</h2>
            <p className="text-sm text-slate-400 mb-1">Enter OTP sent to</p>
            <p className="text-sm font-bold text-indigo-600 mb-7">{email}</p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* OTP inputs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2.5">Enter OTP</label>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otp.map((d, i) => (
                    <motion.input key={i}
                      ref={(el) => (inputs.current[i] = el)}
                      value={d}
                      onChange={(e) => handleOTPChange(e.target.value, i)}
                      onKeyDown={(e) => handleOTPKey(e, i)}
                      maxLength={1} inputMode="numeric"
                      whileFocus={{ scale: 1.08 }}
                      className={`w-11 h-13 text-center text-lg font-black rounded-xl border-2 transition-all focus:outline-none bg-white/90 text-slate-900 ${
                        d ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"
                      } ${error ? "border-red-300" : ""}`}
                      disabled={isLoading || success}
                    />
                  ))}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">New Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="Min 8 characters"
                    className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all pr-12 text-sm shadow-sm"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required minLength={8} disabled={isLoading || success} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(p => !p)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                    className={`w-full bg-white/90 border rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all pr-12 text-sm shadow-sm ${
                      confirmPassword
                        ? passwordsMatch
                          ? "border-emerald-300 focus:ring-emerald-500/25 focus:border-emerald-400"
                          : "border-red-300 focus:ring-red-500/25 focus:border-red-400"
                        : "border-slate-200 focus:ring-indigo-500/25 focus:border-indigo-400"
                    }`}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    required disabled={isLoading || success} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {confirmPassword && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {passwordsMatch
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <span className="text-red-400 text-xs font-bold">✗</span>
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-sm text-red-500">❌ {error}</motion.p>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: isLoading || success ? 1 : 0.98 }}
                whileHover={{ scale: isLoading || success ? 1 : 1.01 }}
                type="submit"
                disabled={isLoading || success || finalOTP.length < 6}
                className="w-full py-3.5 mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black rounded-full transition-all shadow-lg shadow-indigo-200/60 hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed tracking-wide"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Resetting…</>
                ) : success ? (
                  <><CheckCircle2 className="w-4 h-4" />Done!</>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>

            {/* Success overlay */}
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-xl rounded-3xl">
                  <div className="text-center">
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.2, 1] }} transition={{ duration: 0.5 }}
                      className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <motion.path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
                      </svg>
                    </motion.div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Password Reset! 🔐</h3>
                    <p className="text-sm text-slate-500">Redirecting to login…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">Protected by PulseIQ Shield™</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}