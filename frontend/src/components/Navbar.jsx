import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 px-4 md:px-8 glass-strong shadow-soft"
            : "py-5 px-6 md:px-8 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-primary rounded-xl rotate-45 group-hover:rotate-[135deg] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]" />
              <div className="absolute inset-[3px] bg-background rounded-[9px] rotate-45" />
              <div className="absolute inset-[6px] bg-primary rounded-lg rotate-45" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              PulseIQ
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-secondary/80 backdrop-blur-sm rounded-full px-1.5 py-1">
            {["Features", "How It Works", "Use Cases", "Team"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-all duration-300"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className="px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full hover:opacity-90 transition-all shadow-soft"
              >
                Start Free →
              </motion.button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-2"
          >
            {mobileOpen ? (
              <X strokeWidth={1.5} size={22} />
            ) : (
              <Menu strokeWidth={1.5} size={22} />
            )}
          </button>
        </div>
      </motion.nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-[64px] left-0 right-0 z-40 glass-strong shadow-medium p-6 flex flex-col gap-3 md:hidden"
        >
          {["Features", "How It Works", "Use Cases", "Team"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors font-medium"
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
            <Link
              to="/login"
              className="text-center py-3 text-muted-foreground font-medium rounded-xl hover:bg-secondary transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-center py-3 bg-foreground text-background font-semibold rounded-full"
            >
              Start Free →
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;