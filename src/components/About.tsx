import { Shield, ShieldAlert, Cpu, Brain, Network, Database, Layers } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6" id="about-view">
      
      {/* Hero Banner */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-soc-accent/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-soc-accent bg-soc-accent/10 px-3 py-1 rounded-full border border-soc-accent/20">
            FinSpark'26 Hackathon Presentation
          </span>
          <h2 className="text-3xl font-display font-bold tracking-tight text-white">
            CyberGuard AI: Dynamic Transaction & Cyber Telemetry Correlation
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            Our platform tackles the national banking cybersecurity challenge: **AI-Driven Correlation of Cybersecurity Telemetry & Transactional Behaviour**. By joining these historically siloed streams—endpoint security metrics and core financial transaction logs—we establish a unified protective shield against brute-forcing, compromised routing, insider threats, and account takeover (ATO) attacks.
          </p>
        </div>
      </div>

      {/* Grid: Problem Statement and Architectural Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box 1: The Problem */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-6 shadow-md space-y-4">
          <h3 className="font-display font-semibold text-white text-base flex items-center gap-2 border-b border-soc-border pb-3">
            <ShieldAlert className="text-soc-alert" size={20} />
            The Cyber-Finance Squeeze
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            Standard anti-fraud tools monitor transaction metrics (like amounts, frequencies, and locations). Meanwhile, cybersecurity tools monitor network logs (like login attempts, IP reputations, and sessions). 
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">
            Hackers exploit this gap by logging in with compromised credentials (low security alerts) and immediately siphoning funds in uncharacteristic transaction bursts (low fraud alerts). By correlating both channels in real-time, we create a multidimensional security profile that immediately captures these hybrid attacks.
          </p>
        </div>

        {/* Box 2: The Core Machine Learning Model */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-6 shadow-md space-y-4">
          <h3 className="font-display font-semibold text-white text-base flex items-center gap-2 border-b border-soc-border pb-3">
            <Brain className="text-soc-accent" size={20} />
            Mathematical Threat Modeling (Logistic Regression)
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            Our backend integrates a mathematical correlation and scoring engine, modeling the performance of a scikit-learn Logistic Regression / Random Forest classification pipeline.
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">
            By assigning rigorous regression weights to cybersecurity parameters (failed logins, VPN detection, IP reputation, MAC velocity) and transaction parameters (volume deviation, beneficiary status, temporal offsets), the model outputs an absolute Risk Score (0-100%).
          </p>
        </div>

      </div>

      {/* Features Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-display font-semibold text-slate-400 uppercase tracking-wider">
          Platform Features
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md space-y-2">
            <div className="p-2.5 bg-slate-950 text-soc-accent rounded-lg w-max">
              <Network size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Continuous Correlation</h4>
            <p className="text-slate-400 text-xs leading-normal">
              Direct ingestion and real-time mapping of network logs and core banking transactions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md space-y-2">
            <div className="p-2.5 bg-slate-950 text-soc-accent rounded-lg w-max">
              <Cpu size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Explainable AI (XAI)</h4>
            <p className="text-slate-400 text-xs leading-normal">
              Utilizes Gemini to translate complex numerical model parameters into plain-text SOC explanations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md space-y-2">
            <div className="p-2.5 bg-slate-950 text-soc-accent rounded-lg w-max">
              <Shield size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Mitigation Playbooks</h4>
            <p className="text-slate-400 text-xs leading-normal">
              Provides step-by-step actionable recommendations for SOC analysts, based on security levels.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md space-y-2">
            <div className="p-2.5 bg-slate-950 text-soc-accent rounded-lg w-max">
              <Layers size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Rich SOC Visualization</h4>
            <p className="text-slate-400 text-xs leading-normal">
              High-fidelity Recharts dashlets mapping transaction trends, risk distributions, and geolocations.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack List */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-6 shadow-md space-y-4">
        <h3 className="font-display font-semibold text-white text-base flex items-center gap-2 border-b border-soc-border pb-3">
          <Database className="text-soc-accent" size={20} />
          Technology Stack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-soc-border/50">
            <span className="text-soc-accent font-bold block mb-1">FRONTEND RENDERER:</span>
            React 19 & TypeScript with modern functional state hooks.
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-soc-border/50">
            <span className="text-soc-accent font-bold block mb-1">STYLING ENGINE:</span>
            Tailwind CSS with Space Grotesk / JetBrains Mono typography.
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-soc-border/50">
            <span className="text-soc-accent font-bold block mb-1">AI & EXPLAINABILITY:</span>
            Google Gemini API (using gemini-3.5-flash for detailed cyber justifications).
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-soc-border/50">
            <span className="text-soc-accent font-bold block mb-1">ANALYTICS FRAMEWORK:</span>
            Recharts engine for fully responsive dashboards.
          </div>
        </div>
      </div>

    </div>
  );
}
