import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(`${BASE_API_URL}/api/auth/forgot-password`, {
        email,
      });

      setMsg("Reset link + OTP sent 🚀");

      setTimeout(() => {
        navigate(`/reset-password-otp?email=${email}`);
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          Forgot Password 🔐
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email to receive OTP & reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold flex justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Send Reset"}
          </button>
        </form>

        {msg && (
          <p className="text-center text-sm mt-4 text-indigo-600">{msg}</p>
        )}
      </motion.div>
    </div>
  );
}