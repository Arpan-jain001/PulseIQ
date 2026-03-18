import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  ChevronRight,
  Database,
  Layout
} from 'lucide-react';

const LandingPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* --- Navigation --- */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-blue-900">PulseIQ</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#architecture" className="hover:text-blue-600 transition">Architecture</a>
          <a href="#tech" className="hover:text-blue-600 transition">Tech Stack</a>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Get Started
        </button>
      </nav>

      {/* --- Hero Section --- */}
      <header className="max-w-7xl mx-auto px-8 py-20 text-center">
        <motion.div {...fadeIn}>
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
            AI-Powered Analytics SaaS
          </span>
          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
            Understand the <span className="text-blue-600">Why</span> <br /> 
            Behind Every Click.
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            PulseIQ transforms raw interaction data into actionable intelligence. 
            Empower your business with AI-driven behavioral insights and real-time tracking.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition">
              Launch Dashboard <ChevronRight size={20} />
            </button>
            <button className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-slate-200 hover:bg-slate-100 transition">
              View Documentation
            </button>
          </div>
        </motion.div>
      </header>

      {/* --- Problem/Solution Grid --- */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Activity className="text-blue-600" />}
              title="Real-Time Tracking"
              desc="Monitor DAU/MAU, page visits, and custom events as they happen with zero latency."
            />
            <FeatureCard 
              icon={<BrainCircuit className="text-purple-600" />}
              title="AI Insight Engine"
              desc="Automated suggestions to optimize conversion funnels and detect user behavior anomalies."
            />
            <FeatureCard 
              icon={<MessageSquare className="text-emerald-600" />}
              title="Natural Language Queries"
              desc="Chat with your data. Use our AI chatbot to ask 'Why did checkout drop by 20% today?'"
            />
          </div>
        </div>
      </section>

      {/* --- Product Architecture --- */}
      <section id="architecture" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Enterprise-Ready Architecture</h2>
          <div className="relative border-l-2 border-blue-200 ml-4 space-y-12">
            <Step number="1" title="Company Registration" desc="Create secure workspaces with Role-Based Access Control (RBAC)." />
            <Step number="2" title="API Key Generation" desc="Secure unique keys for your projects to ensure data isolation." />
            <Step number="3" title="Script Integration" desc="One-line snippet to capture clicks, forms, and transactions." />
            <Step number="4" title="AI Processing" desc="Data flows through our MERN-powered analytics engine for behavioral interpretation." />
          </div>
        </div>
      </section>

      {/* --- Tech Stack Table --- */}
      <section id="tech" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Built with Modern Tech</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">Layer</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Technology</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <TableRow layer="Frontend" tech="React + Tailwind CSS + Framer Motion" />
                <TableRow layer="Backend" tech="Node.js + Express.js" />
                <TableRow layer="Database" tech="MongoDB (NoSQL)" />
                <TableRow layer="AI Integration" tech="Gemini API / OpenAI" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- Team & Footer --- */}
      <footer className="bg-slate-900 text-slate-300 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-white text-2xl font-bold mb-4 italic">ऋते ज्ञानान्न मुक्तिः</h3>
              <p className="max-w-sm">
                PulseIQ: Redefining digital analytics for EdTech, E-commerce, and SaaS.
                Developed at GLA University, Mathura.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-bold mb-4">Project Lead</h4>
                <p>Arpan Jain</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Core Team</h4>
                <ul className="space-y-1 text-sm">
                  <li>Aryan Gupta</li>
                  <li>Girraj Singh</li>
                  <li>Khushi Malhotra</li>
                  <li>Radhika Gupta</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            © 2026 PulseIQ Analytics. Under the supervision of Mr. Shiv Kumar Verma.
          </div>
        </div>
      </footer>
    </div>
  );
};

/* --- Helper Components --- */

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition group">
    <div className="mb-6 p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-blue-50 transition">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="relative pl-10">
    <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200">
      {number}
    </div>
    <h4 className="text-xl font-bold text-slate-900">{title}</h4>
    <p className="text-slate-600 mt-1">{desc}</p>
  </div>
);

const TableRow = ({ layer, tech }) => (
  <tr className="hover:bg-slate-50 transition">
    <td className="px-6 py-4 font-semibold text-blue-700">{layer}</td>
    <td className="px-6 py-4 text-slate-600">{tech}</td>
  </tr>
);

export default LandingPage;