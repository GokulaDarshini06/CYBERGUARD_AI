import { useState, useEffect } from 'react';
import { Customer, Transaction, SecurityLog, RiskAnalysis } from '../types.ts';
import { ShieldCheck, ShieldAlert, Cpu, AlertCircle, RefreshCw, CheckCircle, Smartphone, Globe, Shield, Terminal, BookOpen, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ThreatPredictionProps {
  customers: Customer[];
  transactions: Transaction[];
  securityLogs: SecurityLog[];
  selectedCustomerId: string;
  selectedTransactionId: string;
  onCustomerChange: (id: string) => void;
}

export default function ThreatPrediction({
  customers,
  transactions,
  securityLogs,
  selectedCustomerId,
  selectedTransactionId,
  onCustomerChange,
}: ThreatPredictionProps) {
  const [activeCustId, setActiveCustId] = useState(selectedCustomerId || (customers[0]?.customer_id || ''));
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mitigationChecked, setMitigationChecked] = useState<Record<number, boolean>>({});

  // Sync state if prop changes
  useEffect(() => {
    if (selectedCustomerId) {
      setActiveCustId(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  // Fetch threat assessment from server-side machine learning + Gemini API
  const fetchPrediction = async (id: string, txnId?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setMitigationChecked({});
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: id,
          transactionId: txnId || undefined
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve AI Threat Assessment from SOC gateway.');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during dynamic telemetry prediction.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger whenever selected customer or target transaction ID changes
  useEffect(() => {
    fetchPrediction(activeCustId, selectedTransactionId);
  }, [activeCustId, selectedTransactionId]);

  const activeCustomer = customers.find(c => c.customer_id === activeCustId);
  const activeLogs = securityLogs.find(l => l.customer_id === activeCustId);
  const customerTxns = transactions.filter(t => t.customer_id === activeCustId);
  const latestTxn = selectedTransactionId 
    ? customerTxns.find(t => t.transaction_id === selectedTransactionId) || customerTxns[customerTxns.length - 1]
    : customerTxns[customerTxns.length - 1];

  const handleDropdownChange = (id: string) => {
    setActiveCustId(id);
    onCustomerChange(id);
  };

  const toggleMitigation = (index: number) => {
    setMitigationChecked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6" id="threat-prediction-view">
      {/* Dropdown selector */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <Cpu size={20} className="text-soc-accent" />
            AI-Driven Correlation Sandbox
          </h2>
          <p className="text-xs text-slate-400">Select any bank customer file to trigger real-time cybersecurity log correlation.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="customer-select" className="text-xs text-slate-400 font-mono whitespace-nowrap">AUDIT TARGET:</label>
          <select
            id="customer-select"
            value={activeCustId}
            onChange={(e) => handleDropdownChange(e.target.value)}
            className="w-full md:w-64 bg-slate-950 border border-soc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-soc-accent/70 font-mono"
          >
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.customer_id} - {c.customer_name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchPrediction(activeCustId, latestTxn?.transaction_id)}
            disabled={loading}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-soc-border rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Recalculate models"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-soc-accent' : ''} />
          </button>
        </div>
      </div>

      {activeCustomer && activeLogs && latestTxn ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Data Telemetry Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer & Transaction Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Customer Profile */}
              <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md space-y-4">
                <div className="border-b border-soc-border/60 pb-3 flex justify-between items-center">
                  <h3 className="font-display font-semibold text-white text-sm">Customer Profile</h3>
                  <span className="text-[10px] font-mono text-soc-accent bg-soc-accent/10 px-2 py-0.5 rounded">
                    {activeCustomer.account_type} Account
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Customer Name</p>
                    <p className="text-white font-medium mt-0.5">{activeCustomer.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Customer ID</p>
                    <p className="text-white font-mono mt-0.5">{activeCustomer.customer_id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Account Number</p>
                    <p className="text-slate-300 font-mono mt-0.5">{activeCustomer.account_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Home Branch</p>
                    <p className="text-slate-300 mt-0.5">{activeCustomer.branch}</p>
                  </div>
                </div>
              </div>

              {/* Box 2: Latest Transaction Behavior */}
              <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md space-y-4">
                <div className="border-b border-soc-border/60 pb-3 flex justify-between items-center">
                  <h3 className="font-display font-semibold text-white text-sm">Transactional Behaviour</h3>
                  <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                    ID: {latestTxn.transaction_id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Transaction Amount</p>
                    <p className="text-white font-bold text-sm mt-0.5">₹{latestTxn.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Transaction Type</p>
                    <p className="text-slate-300 mt-0.5">{latestTxn.transaction_type}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Location / Terminal</p>
                    <p className="text-slate-300 mt-0.5">{latestTxn.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Beneficiary status</p>
                    <span className={`inline-block mt-0.5 font-semibold ${
                      latestTxn.beneficiary_status === 'Suspicious' ? 'text-soc-alert' : latestTxn.beneficiary_status === 'New' ? 'text-yellow-400' : 'text-soc-success'
                    }`}>
                      {latestTxn.beneficiary_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Initiating Device</p>
                    <p className="text-slate-300 mt-0.5">{latestTxn.device_type}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Timestamp hour</p>
                    <p className="text-slate-300 font-mono mt-0.5">{latestTxn.transaction_hour}:00 UTC</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Cybersecurity Telemetry Log */}
            <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md">
              <div className="border-b border-soc-border/60 pb-3 mb-4">
                <h3 className="font-display font-semibold text-white text-sm">Cybersecurity Telemetry logs</h3>
                <p className="text-[11px] text-slate-400">Endpoint logs, IP reputations, session tokens, and geographical logs from customer authentication.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1 */}
                <div className="bg-slate-950/60 border border-soc-border/50 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activeLogs.failed_login_attempts >= 3 ? 'bg-soc-alert/15 text-soc-alert' : 'bg-slate-900 text-slate-400'}`}>
                    <Terminal size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Failed Logins</p>
                    <p className="text-sm font-semibold text-white mt-1">{activeLogs.failed_login_attempts} Attempts</p>
                    <span className={`inline-block text-[9px] mt-1 font-medium ${
                      activeLogs.failed_login_attempts >= 3 ? 'text-soc-alert' : 'text-slate-500'
                    }`}>
                      {activeLogs.failed_login_attempts >= 3 ? 'Anomaly: Login Attack' : 'Within normal limits'}
                    </span>
                  </div>
                </div>

                {/* 2 */}
                <div className="bg-slate-950/60 border border-soc-border/50 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activeLogs.ip_reputation === 'Malicious' ? 'bg-soc-alert/15 text-soc-alert' : activeLogs.ip_reputation === 'Risky' ? 'bg-yellow-400/15 text-yellow-400' : 'bg-soc-success/15 text-soc-success'}`}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">IP Reputation</p>
                    <p className="text-sm font-semibold text-white mt-1">{activeLogs.ip_reputation}</p>
                    <span className={`inline-block text-[9px] mt-1 font-medium ${
                      activeLogs.ip_reputation === 'Malicious' ? 'text-soc-alert' : activeLogs.ip_reputation === 'Risky' ? 'text-yellow-400' : 'text-soc-success'
                    }`}>
                      {activeLogs.ip_reputation === 'Safe' ? 'IP reputation verified' : 'Low-reputation proxy source'}
                    </span>
                  </div>
                </div>

                {/* 3 */}
                <div className="bg-slate-950/60 border border-soc-border/50 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activeLogs.new_device ? 'bg-yellow-400/15 text-yellow-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Hardware Fingerprint</p>
                    <p className="text-sm font-semibold text-white mt-1">{activeLogs.new_device ? 'New Device' : 'Recognized'}</p>
                    <span className={`inline-block text-[9px] mt-1 font-medium ${activeLogs.new_device ? 'text-yellow-400' : 'text-slate-500'}`}>
                      {activeLogs.new_device ? 'Unregistered MAC/IMEI' : 'Standard terminal profile'}
                    </span>
                  </div>
                </div>

                {/* 4 */}
                <div className="bg-slate-950/60 border border-soc-border/50 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activeLogs.vpn_detected ? 'bg-yellow-400/15 text-yellow-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">VPN / Proxy Detection</p>
                    <p className="text-sm font-semibold text-white mt-1">{activeLogs.vpn_detected ? 'DETECTED' : 'CLEAN'}</p>
                    <span className={`inline-block text-[9px] mt-1 font-medium ${activeLogs.vpn_detected ? 'text-yellow-400' : 'text-slate-500'}`}>
                      {activeLogs.vpn_detected ? 'Bypassing regional firewalls' : 'Direct ISP connection'}
                    </span>
                  </div>
                </div>

                {/* 5 */}
                <div className="bg-slate-950/60 border border-soc-border/50 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activeLogs.location_changed ? 'bg-soc-alert/15 text-soc-alert' : 'bg-slate-900 text-slate-400'}`}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Geographical Velocity</p>
                    <p className="text-sm font-semibold text-white mt-1">{activeLogs.location_changed ? 'Rapid Mismatch' : 'Stationary'}</p>
                    <span className={`inline-block text-[9px] mt-1 font-medium ${activeLogs.location_changed ? 'text-soc-alert' : 'text-slate-500'}`}>
                      {activeLogs.location_changed ? 'Impossible travel warning' : 'Matches home area'}
                    </span>
                  </div>
                </div>

                {/* 6 */}
                <div className="bg-slate-950/60 border border-soc-border/50 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activeLogs.multiple_sessions ? 'bg-soc-alert/15 text-soc-alert' : 'bg-slate-900 text-slate-400'}`}>
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Concurrent Sessions</p>
                    <p className="text-sm font-semibold text-white mt-1">{activeLogs.multiple_sessions ? 'Multiple Active' : 'Single Session'}</p>
                    <span className={`inline-block text-[9px] mt-1 font-medium ${activeLogs.multiple_sessions ? 'text-soc-alert' : 'text-slate-500'}`}>
                      {activeLogs.multiple_sessions ? 'Risk of Session Hijacking' : 'Exclusive user session'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: AI Risk Engine Predictions & recommendations */}
          <div className="space-y-6">
            
            {/* AI Risk Score Ring / Meter Card */}
            <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col items-center justify-center">
              <h3 className="w-full text-left font-display font-semibold text-white text-sm border-b border-soc-border/60 pb-3 mb-5 flex items-center gap-2">
                <Cpu size={16} className="text-soc-accent" />
                AI Model Prediction
              </h3>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="animate-spin text-soc-accent" size={40} />
                  <p className="text-xs text-slate-400 font-mono">Running predictive ML coefficients...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center space-y-2">
                  <AlertCircle size={36} className="mx-auto text-soc-alert" />
                  <p className="text-xs text-slate-300 font-mono">Error generating predictions.</p>
                  <p className="text-[10px] text-slate-500">{error}</p>
                </div>
              ) : analysis ? (
                <div className="w-full text-center space-y-5">
                  
                  {/* Gauge */}
                  <div className="relative flex items-center justify-center h-36">
                    {/* Ring background */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        className="stroke-slate-900 fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        className={`fill-none transition-all duration-1000 ${
                          analysis.risk_level === 'High' 
                            ? 'stroke-soc-alert' 
                            : analysis.risk_level === 'Medium' 
                            ? 'stroke-yellow-400' 
                            : 'stroke-soc-success'
                        }`}
                        strokeWidth="10"
                        strokeDasharray={326.7}
                        strokeDashoffset={326.7 - (326.7 * analysis.risk_score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-display font-bold text-white font-mono">{analysis.risk_score}%</span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">RISK INDEX</span>
                    </div>
                  </div>

                  {/* Classification Badge */}
                  <div className="flex flex-col items-center">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-display font-bold text-xs border uppercase tracking-wider ${
                      analysis.risk_level === 'High'
                        ? 'bg-soc-alert/15 text-soc-alert border-soc-alert/40'
                        : analysis.risk_level === 'Medium'
                        ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/40'
                        : 'bg-soc-success/15 text-soc-success border-soc-success/40'
                    }`}>
                      {analysis.risk_level === 'High' ? (
                        <ShieldAlert size={14} className="animate-bounce" />
                      ) : (
                        <ShieldCheck size={14} />
                      )}
                      {analysis.risk_level} RISK THREAT
                    </span>
                    <p className="text-[11px] text-slate-400 mt-2 font-mono">
                      Logistic regression model matched anomalies.
                    </p>
                  </div>

                  {/* Core Anomalies List */}
                  {analysis.features.flagged_reasons.length > 0 && (
                    <div className="text-left bg-slate-950/60 border border-soc-border/50 rounded-lg p-3 space-y-2">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <AlertTriangle size={12} className="text-yellow-400" />
                        anomalous vectors detected ({analysis.features.flagged_reasons.length}):
                      </p>
                      <ul className="text-[10px] font-mono text-slate-300 list-disc list-inside space-y-1">
                        {analysis.features.flagged_reasons.slice(0, 3).map((r, ri) => (
                          <li key={ri} className="truncate">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No predictions generated.
                </div>
              )}
            </div>

            {/* Explainable AI Block */}
            <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="font-display font-semibold text-white text-sm flex items-center gap-2 border-b border-soc-border/60 pb-3">
                <BookOpen size={16} className="text-soc-accent" />
                Explainable AI (XAI) Reason
              </h4>
              {loading ? (
                <div className="py-6 space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-800 rounded w-4/5"></div>
                </div>
              ) : analysis ? (
                <div className="bg-slate-950/40 border border-soc-border/40 rounded-lg p-3 font-mono text-xs text-slate-300 leading-relaxed">
                  <span className="text-soc-accent font-semibold block mb-1.5">GEMINI DEEP REASONING:</span>
                  {analysis.explanation}
                </div>
              ) : (
                <p className="text-slate-500 text-xs font-mono">Run prediction to fetch XAI report.</p>
              )}
            </div>

            {/* Actionable Recommendations Checklists */}
            <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="font-display font-semibold text-white text-sm flex items-center gap-2 border-b border-soc-border/60 pb-3">
                <CheckCircle size={16} className="text-soc-success" />
                SOC Playbook Actions
              </h4>
              {loading ? (
                <div className="py-6 space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                </div>
              ) : analysis ? (
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, rIdx) => {
                    const isChecked = !!mitigationChecked[rIdx];
                    return (
                      <div 
                        key={rIdx}
                        onClick={() => toggleMitigation(rIdx)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-soc-success/5 border-soc-success/40 text-slate-400' 
                            : 'bg-slate-950/40 border-soc-border/30 hover:border-soc-accent/30 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by click of container
                          className="mt-0.5 rounded border-slate-700 text-soc-success focus:ring-soc-success/50 h-3.5 w-3.5"
                        />
                        <span className={`text-[11px] font-sans leading-tight ${isChecked ? 'line-through' : ''}`}>
                          {rec}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-xs font-mono">Pending correlation trigger.</p>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-soc-card border border-soc-border rounded-xl font-mono">
          Loading core banking files...
        </div>
      )}
    </div>
  );
}
