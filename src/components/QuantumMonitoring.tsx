import { useState, useEffect } from 'react';
import { QuantumThreatIndicator } from '../types.ts';
import { ShieldCheck, ShieldAlert, KeyRound, Cpu, AlertTriangle, RefreshCw, Radio, HardDriveDownload, Sparkles, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuantumMonitoringProps {
  quantumIndicators?: QuantumThreatIndicator[];
}

export default function QuantumMonitoring({ quantumIndicators = [] }: QuantumMonitoringProps) {
  const [indicators, setIndicators] = useState<QuantumThreatIndicator[]>([]);
  const [upgradedNodes, setUpgradedNodes] = useState<string[]>([]);
  const [mitigationLog, setMitigationLog] = useState<string[]>([]);

  useEffect(() => {
    if (quantumIndicators.length > 0) {
      setIndicators(quantumIndicators);
    }
  }, [quantumIndicators]);

  // Handle live quantum-safe cryptosystem migration
  const handleUpgradeNode = (nodeId: string) => {
    setUpgradedNodes(prev => [...prev, nodeId]);
    setIndicators(prev => prev.map(ind => {
      if (ind.node_id === nodeId) {
        return {
          ...ind,
          protocol: 'Kyber-1024 / TLS 1.3 (PQ)',
          asymmetric_key_type: 'Kyber-1024',
          encryption_strength: 'Post-Quantum Safe',
          harvest_flag: false,
          threat_level: 'Low',
          entropy_score: 0.98
        };
      }
      return ind;
    }));
    setMitigationLog(prev => [
      `[${new Date().toLocaleTimeString()}] INFRASTRUCTURE SECURED: Migrated ${nodeId} to Kyber-1024 Key Encapsulation (FIPS 203).`,
      ...prev
    ]);
  };

  const handleUpgradeAll = () => {
    const vulnerableNodes = indicators
      .filter(i => i.encryption_strength !== 'Post-Quantum Safe')
      .map(i => i.node_id);

    setUpgradedNodes(prev => [...prev, ...vulnerableNodes]);
    setIndicators(prev => prev.map(ind => ({
      ...ind,
      protocol: ind.asymmetric_key_type.includes('Kyber') || ind.asymmetric_key_type.includes('Dilithium') 
        ? ind.protocol 
        : 'Kyber-1024 / TLS 1.3 (PQ)',
      asymmetric_key_type: 'Kyber-1024',
      encryption_strength: 'Post-Quantum Safe',
      harvest_flag: false,
      threat_level: 'Low',
      entropy_score: 0.98
    })));

    setMitigationLog(prev => [
      `[${new Date().toLocaleTimeString()}] MASTER MIGRATION COMPLETE: All regional gateway nodes upgraded to NIST Post-Quantum Cryptographic Standards.`,
      ...prev
    ]);
  };

  const totalVulnerable = indicators.filter(i => i.encryption_strength !== 'Post-Quantum Safe').length;
  const totalHarvestThreats = indicators.filter(i => i.harvest_flag).length;
  const avgEntropy = indicators.length > 0
    ? (indicators.reduce((acc, curr) => acc + curr.entropy_score, 0) / indicators.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6" id="quantum-monitoring-view">
      
      {/* Dynamic Header */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-soc-accent/10 to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-soc-accent/15 text-soc-accent border border-soc-accent/25">
              <span className="absolute inline-flex h-full w-full rounded-xl bg-soc-accent opacity-20 animate-ping" />
              <Binary size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                Quantum Cryptographic Threat Monitor
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating "Harvest-Now-Decrypt-Later" (HNDL) vectors and migrating asymmetric infrastructure to NIST PQC standards.
              </p>
            </div>
          </div>
          {totalVulnerable > 0 ? (
            <button
              onClick={handleUpgradeAll}
              className="px-4 py-2 bg-soc-accent hover:bg-sky-400 text-slate-950 font-display font-bold text-xs rounded-lg transition-all shadow-lg shadow-soc-accent/15 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} className="animate-bounce" />
              UPGRADE ALL TO POST-QUANTUM
            </button>
          ) : (
            <div className="px-4 py-2 bg-soc-success/10 text-soc-success border border-soc-success/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} />
              NIST PQC MIGRATED
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-soc-card p-5 rounded-xl border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">HNDL Passive Harvest Flares</span>
            <span className={`text-2xl font-mono font-bold mt-1.5 block ${totalHarvestThreats > 0 ? 'text-soc-alert' : 'text-soc-success'}`}>
              {totalHarvestThreats} Suspected Nodes
            </span>
            <span className="text-[9px] text-slate-500 mt-1 block">Asymmetric keys passively captured at edge gateways.</span>
          </div>
          <div className={`p-3 rounded-lg ${totalHarvestThreats > 0 ? 'bg-soc-alert/10 text-soc-alert' : 'bg-soc-success/10 text-soc-success'}`}>
            <HardDriveDownload size={22} className={totalHarvestThreats > 0 ? 'animate-bounce' : ''} />
          </div>
        </div>

        <div className="bg-soc-card p-5 rounded-xl border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Outdated Crypto-Standards</span>
            <span className="text-2xl font-mono text-white font-bold mt-1.5 block">
              {totalVulnerable} / {indicators.length} TLS Nodes
            </span>
            <span className="text-[9px] text-slate-500 mt-1 block">Active endpoints utilizing vulnerable pre-quantum cryptography.</span>
          </div>
          <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-lg">
            <KeyRound size={22} />
          </div>
        </div>

        <div className="bg-soc-card p-5 rounded-xl border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Encrypted Stream Entropy Score</span>
            <span className="text-2xl font-mono text-soc-success font-bold mt-1.5 block">
              {avgEntropy} Avg
            </span>
            <span className="text-[9px] text-slate-500 mt-1 block">Low entropy suggests high payload structure (bulk telemetry egress).</span>
          </div>
          <div className="p-3 bg-soc-success/10 text-soc-success rounded-lg">
            <Cpu size={22} />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Intercept Table */}
        <div className="lg:col-span-2 space-y-4 bg-soc-card border border-soc-border rounded-xl p-5">
          <div className="flex justify-between items-center border-b border-soc-border pb-3">
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio size={16} className="text-soc-accent" />
              Regional Gateway Encrypted Traffic Stream
            </h3>
            <span className="text-[9px] font-mono text-slate-500">REALTIME TELEMETRY FEED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-soc-border/50 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5">Gateway Node ID</th>
                  <th className="py-2.5">Key Exchange Protocol</th>
                  <th className="py-2.5">Vulnerability State</th>
                  <th className="py-2.5">Egress Capture (GB)</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((ind) => (
                  <tr key={ind.node_id} className="border-b border-soc-border/30 hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        ind.threat_level === 'High' ? 'bg-soc-alert animate-ping' : ind.threat_level === 'Medium' ? 'bg-yellow-400' : 'bg-soc-success'
                      }`} />
                      {ind.node_id}
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{ind.protocol}</div>
                      <span className="text-[9px] text-slate-500">Asymmetric: {ind.asymmetric_key_type}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 font-bold text-[9px] px-2 py-0.5 rounded ${
                        ind.encryption_strength === 'Highly Vulnerable' 
                          ? 'bg-soc-alert/10 text-soc-alert border border-soc-alert/20' 
                          : ind.encryption_strength === 'Vulnerable'
                            ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                            : 'bg-soc-success/10 text-soc-success border border-soc-success/20'
                      }`}>
                        {ind.encryption_strength === 'Highly Vulnerable' && <AlertTriangle size={10} />}
                        {ind.encryption_strength}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{ind.egress_size_gb} GB</span>
                        {ind.harvest_flag && (
                          <span className="text-[9px] bg-soc-alert/15 text-soc-alert px-1.5 rounded font-sans uppercase font-bold tracking-tight animate-pulse">HNDL Captured</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500">Entropy Score: {ind.entropy_score}</span>
                    </td>
                    <td className="py-3 text-right">
                      {ind.encryption_strength !== 'Post-Quantum Safe' ? (
                        <button
                          onClick={() => handleUpgradeNode(ind.node_id)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-soc-accent text-slate-400 hover:text-slate-950 border border-soc-border hover:border-transparent rounded text-[10px] font-sans font-bold transition-all cursor-pointer"
                        >
                          PQ Upgrade
                        </button>
                      ) : (
                        <span className="text-soc-success text-[10px] font-sans font-bold">Safe</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Explainer and Mitigation Log */}
        <div className="space-y-6">
          {/* Explainable AI Block */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-display font-semibold text-white border-b border-soc-border pb-3 flex items-center gap-2">
              <Cpu size={16} className="text-soc-accent animate-pulse" />
              Harvest-Now-Decrypt-Later (HNDL) Threat Vector
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Hostile threat actors are aggressively executing bulk egress network intercepts on financial transaction streams. Because standard RSA-2048 and ECDSA exchange keys cannot resist cryptographic decryption once a sufficiently coherent Quantum Computer emerges (CRQC), adversary states are archiving this encrypted data today to decrypt in the future.
            </p>
            <div className="bg-slate-950/50 p-3.5 border border-soc-border rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-soc-accent font-bold block uppercase tracking-wider">Mitigation Blueprint:</span>
              <p className="text-[11px] text-slate-300 font-sans">
                Deploying NIST-vetted **Post-Quantum Cryptography (PQC)** such as Kyber-1024 for key exchange and Dilithium-5 for session signatures is critical to neutralizing the retro-active decryption threat immediately.
              </p>
            </div>
          </div>

          {/* Infrastructure Action log */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-display font-semibold text-white border-b border-soc-border pb-3 flex items-center gap-2">
              <binary size={16} className="text-soc-accent" />
              PQC Migration Logs
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {mitigationLog.length > 0 ? (
                mitigationLog.map((log, index) => (
                  <div key={index} className="text-[10px] font-mono text-soc-success leading-normal border-l border-soc-success/30 pl-2">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-600 font-mono text-xs">
                  Awaiting key upgrade procedures...
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
