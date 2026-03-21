import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import { UseCases, TeamSection, CTASection, Footer } from "@/components/LandingComponents";

const TickerBar = () => {
  const items = ["Real-Time Analytics", "AI Insights", "Funnel Analysis", "RBAC Security", "Event Tracking", "Session Analytics", "Retention Curves", "NL Queries", "EdTech Analytics", "Multi-Tenant SaaS"];
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-3 bg-[#04080f] border-y border-[#0d2140]">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 text-[10px] text-[#3d6080] uppercase tracking-widest shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="w-1 h-1 rounded-full bg-[#00e5ff] inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const Index = () => (
  <div className="min-h-screen bg-[#020408] text-[#e8f4ff] overflow-x-hidden">
    <Navbar />
    <main>
      <Hero />
      <TickerBar />
      <Features />
      <HowItWorks />
      <UseCases />
      <TeamSection />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default Index;