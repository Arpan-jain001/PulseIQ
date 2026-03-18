import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="grid md:grid-cols-4 gap-10 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-primary rounded-lg rotate-45" />
                <div className="absolute inset-[2px] bg-background rounded-[6px] rotate-45" />
                <div className="absolute inset-[5px] bg-primary rounded-md rotate-45" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                PulseIQ
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered analytics platform transforming data into intelligent decisions.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">
              Product
            </h4>
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
              <span className="text-sm text-muted-foreground">Pricing — Soon</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">
              Company
            </h4>
            <div className="flex flex-col gap-3">
              <a href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</a>
              <span className="text-sm text-muted-foreground">Blog — Soon</span>
              <span className="text-sm text-muted-foreground">Careers</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">
              Account
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
              <span className="text-sm text-muted-foreground">Documentation — Soon</span>
            </div>
          </div>

        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-rose fill-rose" />{" "}
            by Arpan Jain & Team
          </p>

          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} PulseIQ. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;