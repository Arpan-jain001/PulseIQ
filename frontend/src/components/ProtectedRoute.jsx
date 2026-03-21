import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth.js";

// ─── Loading spinner ──────────────────────────────────────────────────────────
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo mark */}
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 bg-indigo-600 rounded-xl"
          animate={{ rotate: [45, 135, 225, 315, 405] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-[3px] bg-slate-50 dark:bg-slate-950 rounded-[9px]" />
        <div className="absolute inset-[6px] bg-indigo-600 rounded-lg" />
      </div>
      <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
        Checking access…
      </p>
    </motion.div>
  </div>
);

/**
 * ProtectedRoute — guards routes by auth + optional role check
 *
 * Usage:
 *   <ProtectedRoute>                          → any logged-in user
 *   <ProtectedRoute allowedRoles={["ADMIN"]}> → specific role only
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "Please log in to continue." }}
        replace
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard instead of a generic /unauthorized
    const fallback =
      user.role === "SUPER_ADMIN"
        ? "/admin-dashboard"
        : user.role === "ORGANIZER"
        ? "/organizer-dashboard"
        : "/dashboard";

    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;