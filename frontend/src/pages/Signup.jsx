import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const Signup = () => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          
          <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-medium p-8 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />

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
                Create your account
              </h2>

              <p className="text-muted-foreground text-sm mt-2">
                Start your free trial — no credit card required
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Arpan"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jain"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-sm"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your company"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Work Email
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
                    placeholder="Min 8 characters"
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

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground pt-1">
                {["Free 14-day trial", "No credit card", "Cancel anytime"].map((b) => (
                  <span key={b} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald" strokeWidth={1.5} />
                    {b}
                  </span>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                type="submit"
                className="w-full py-3.5 bg-foreground text-background font-bold rounded-full transition-all shadow-soft flex items-center justify-center gap-2 text-sm"
              >
                Create Account
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </motion.button>

            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">
                Sign in
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

export default Signup;