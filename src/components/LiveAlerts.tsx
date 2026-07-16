import { useState, useEffect } from 'react';
import { Customer, Transaction, SecurityLog } from '../types.ts';
import { predictFraudRisk } from '../dataGenerator.ts';
import { ShieldAlert, ShieldCheck, ShieldAlert as AlertIcon, AlertTriangle, Play, RefreshCw, Radio, CheckCircle, Flame, Server, UserCheck, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveAlertsProps {
  customers: Customer[];
  transactions: Transaction[];
  securityLogs: SecurityLog[];
}

interface AlertItem {
  id: string;
  customer: Customer;
  transaction: Transaction;
  logs: SecurityLog;
  riskScore: number;
  threatType: string;
  status: 'Pending' | 'Mitigated' | 'Overridden';
}

export default function LiveAlerts({ customers, transactions, securityLogs }: LiveAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [mitigatedCount, setMitigatedCount] = useState(0);

  // Parse and build high-risk alerts on component mount
  useEffect(() => {
    const highRiskAlerts: AlertItem[] = [];

    // Filter transactions that are high-risk (either flagged as fraud or scoring >= 70)
    transactions.forEach(tx => {
      const cust = customers.find(c => c.customer_id === tx.customer_id);
      const log = securityLogs.find(l => l.customer_id === tx.customer_id);

      if (cust && log) {
        const prediction = predictFraudRisk(cust, tx, log);
        
        // Let's pull high risk ones
        if (prediction.riskLevel === 'High' || tx.is_fraud) {
          let threatType = 'Anomalous Transaction';
          if (log.failed_login_attempts >= 3 && log.new_device) {
            threatType = 'Credential Stuffing & Account Takeover (ATO)';
          } else if (log.vpn_detected && log.location_changed) {
            threatType = 'Geographical Velocity Breach & VPN Proxy Bypass';
          } else if (log.ip_reputation === 'Malicious') {
            threatType = 'High-Risk Malicious Node Access';
          } else if (tx.amount > 20000) {
            threatType = 'Extreme Out-of-Profile Transaction Volume';
          }

          highRiskAlerts.push({
            id: `ALT-${tx.transaction_id}`,
            customer: cust,
            transaction: tx,
            logs: log,
            riskScore: prediction.riskScore,
            threatType,
            status: 'Pending'
          });
        }
      }
    });

    // Sort by risk score descending
    setAlerts(highRiskAlerts.sort((a, b) => b.riskScore - a.riskScore));
  }, [customers, transactions, securityLogs]);

  const handleMitigate = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Mitigated' } : a));
    setMitigatedCount(c => c + 1);
  };

  const handleOverride = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Overridden' } : a));
    setMitigatedCount(c => c + 1);
  };

  const pendingAlerts = alerts.filter(a => a.status === 'Pending');
  const resolvedAlerts = alerts.filter(a => a.status !== 'Pending');

  return (
    <div className="space-y-6" id="live-alerts-view">
      
      {/* Alert Banner / Flashing Beacon */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-soc-alert/10 to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-soc-alert/15 text-soc-alert">
              <span className="absolute inline-flex h-full w-full rounded-xl bg-soc-alert opacity-20 animate-ping" />
              <Radio size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                Active Threat Broadcast Feed
              </h2>
              <p className="text-xs text-slate-400">
                Correlating real-time network session indicators. Action required for High Risk breaches.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-lg border border-soc-border">
            <div className="text-center px-2">
              <p className="text-[9px] font-mono text-slate-500 uppercase">UNRESOLVED</p>
              <p className="text-lg font-bold font-mono text-soc-alert">{pendingAlerts.length}</p>
            </div>
            <div className="h-8 w-[1px] bg-soc-border" />
            <div className="text-center px-2">
              <p className="text-[9px] font-mono text-slate-500 uppercase">RESOLVED</p>
              <p className="text-lg font-bold font-mono text-soc-success">{resolvedAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Alarm Feeds */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Flame size={16} className="text-soc-alert animate-bounce" />
            Priority Threat Queue ({pendingAlerts.length})
          </h3>

          <AnimatePresence>
            {pendingAlerts.length > 0 ? (
              pendingAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                  className="bg-soc-card border-l-4 border-l-soc-alert border border-soc-border rounded-xl p-5 shadow-lg relative"
                >
                  {/* Alert Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-soc-border/40 pb-3 mb-4">
                    <div>
                      <span className="text-[9px] font-mono bg-soc-alert/10 text-soc-alert font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        {alert.id} • RISK SCORE: {alert.riskScore}%
                      </span>
                      <h4 className="text-sm font-display font-bold text-white mt-1.5">{alert.threatType}</h4>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <span className="text-slate-400">Target User: </span>
                      <span className="text-white font-semibold">{alert.customer.customer_name}</span>
                    </div>
                  </div>

                  {/* Core Correlation Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                    
                    {/* Column A: Transaction behavior */}
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-soc-border/40 space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Anomalous Payload</p>
                      <p><span className="text-slate-500">TXN ID:</span> <span className="text-white">{alert.transaction.transaction_id}</span></p>
                      <p><span className="text-slate-500">Amount:</span> <span className="text-soc-alert font-bold">₹{alert.transaction.amount.toLocaleString()}</span></p>
                      <p><span className="text-slate-500">Beneficiary:</span> <span className="text-yellow-400">{alert.transaction.beneficiary_status} Account</span></p>
                      <p><span className="text-slate-500">Terminal:</span> <span>{alert.transaction.location} / {alert.transaction.device_type}</span></p>
                    </div>

                    {/* Column B: Telemetry Logs */}
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-soc-border/40 space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Security Telemetry</p>
                      <p><span className="text-slate-500">Failed Logins:</span> <span className="text-white">{alert.logs.failed_login_attempts} Attempts</span></p>
                      <p><span className="text-slate-500">IP Rep:</span> <span className="text-soc-alert">{alert.logs.ip_reputation}</span></p>
                      <p><span className="text-slate-500">VPN Node:</span> <span className="text-yellow-400">{alert.logs.vpn_detected ? 'Active' : 'None'}</span></p>
                      <p><span className="text-slate-500">Geo Travel:</span> <span className="text-soc-alert">{alert.logs.location_changed ? 'Velocity Breach' : 'Stationary'}</span></p>
                    </div>

                  </div>

                  {/* Recommended Playbook Actions */}
                  <div className="mt-4 bg-slate-900/60 border border-soc-border/60 rounded-lg p-3 text-[11px]">
                    <span className="text-soc-accent font-mono uppercase font-bold block mb-1">Recommended Response:</span>
                    <ul className="list-disc list-inside text-slate-300 font-sans space-y-1">
                      <li>Lock credentials and terminate all active user sessions immediately.</li>
                      <li>Initiate hard freeze on outbound payload ₹{alert.transaction.amount.toLocaleString()} pending customer video audit.</li>
                    </ul>
                  </div>

                  {/* Control Actions */}
                  <div className="mt-4 flex flex-wrap justify-end gap-2 pt-3 border-t border-soc-border/40">
                    <button
                      onClick={() => handleOverride(alert.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-soc-border rounded-lg text-xs font-mono transition-colors"
                    >
                      Override (False Positive)
                    </button>
                    <button
                      onClick={() => handleMitigate(alert.id)}
                      className="px-4 py-1.5 bg-soc-alert hover:bg-red-600 text-white rounded-lg text-xs font-mono font-bold shadow-lg shadow-soc-alert/15 transition-all flex items-center gap-1"
                    >
                      <ShieldCheck size={14} />
                      Mitigate (Execute Block)
                    </button>
                  </div>

                </motion.div>
              ))
            ) : (
              <div className="bg-soc-card border border-soc-border rounded-xl p-8 text-center text-slate-500 font-mono flex flex-col items-center justify-center space-y-2">
                <CheckCircle size={36} className="text-soc-success animate-bounce" />
                <p className="text-white font-semibold">Zero Critical Alarms Pending</p>
                <p className="text-xs">All high-risk correlation triggers are clear or resolved.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Alert Logs & Audited history */}
        <div className="space-y-6">
          
          {/* Active Status Log Console */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-display font-semibold text-white border-b border-soc-border pb-3 flex items-center gap-2">
              <Server size={16} className="text-soc-accent" />
              SOC Incident Response Log
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {resolvedAlerts.length > 0 ? (
                resolvedAlerts.map(alert => (
                  <div key={alert.id} className="bg-slate-950/60 border border-soc-border/50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{alert.id}</span>
                      <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        alert.status === 'Mitigated' ? 'bg-soc-success/15 text-soc-success' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.status === 'Mitigated' ? 'MITIGATED' : 'DISMISSED'}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans leading-tight">
                      Account <span className="text-white font-semibold">{alert.customer.customer_name}</span> has been locked and transfer frozen.
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 text-right">
                      Mitigated Risk: {alert.riskScore}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-600 font-mono text-xs">
                  Awaiting threat resolution actions...
                </div>
              )}
            </div>
          </div>

          {/* Incident playbook guidelines */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-display font-semibold text-white border-b border-soc-border pb-3 flex items-center gap-2">
              <UserCheck size={16} className="text-soc-accent" />
              Standard Incident Playbooks
            </h3>
            <div className="space-y-3 text-[11px] leading-relaxed text-slate-400">
              <div className="border-l-2 border-soc-accent pl-2">
                <span className="text-white font-mono font-bold block">1. LOCKOUT_RULE_8:</span>
                If IP reputation is "Malicious" AND failed login attempts &gt; 3, auto-freeze all outbound ACH requests.
              </div>
              <div className="border-l-2 border-soc-accent pl-2">
                <span className="text-white font-mono font-bold block">2. GEOGRAPHY_VELOCITY_3:</span>
                If location changed = TRUE with transaction location outside standard branch boundary, request MFA verify.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
