import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      <div className="min-h-screen flex items-center justify-center px-4 pt-20 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          
          <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-medium p-8 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-primary rounded-lg rotate-45" />
                  <div className="absolute inset-[2px] bg-background rounded-[6px] rotate-45" />
                  <div className="absolute inset-[5px] bg-primary rounded-md rotate-45" />
                </div>
                <span className="font-display font-bold tracking-tight">
                  PulseIQ
                </span>
              </Link>

              <h2 className="text-2xl font-display font-bold text-foreground">
                Welcome back
              </h2>

              <p className="text-muted-foreground text-sm mt-2">
                Sign in to your analytics dashboard
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 pr-11 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded border-border accent-primary w-4 h-4" />
                  Remember me
                </label>

                <a href="#" className="text-sm text-primary hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                type="submit"
                className="w-full py-3.5 bg-foreground text-background font-bold rounded-full transition-all shadow-soft flex items-center justify-center gap-2 text-sm"
              >
                Sign In
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </motion.button>

            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-semibold transition-colors">
                Sign up free
              </Link>
            </p>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground/50">
                Protected by PulseIQ Shield™ — Enterprise Grade Security
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;