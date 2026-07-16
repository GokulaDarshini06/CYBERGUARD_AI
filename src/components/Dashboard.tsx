import { useState } from 'react';
import { Customer, Transaction, SecurityLog, DashboardStats } from '../types.ts';
import { Users, CreditCard, ShieldAlert, HeartPulse, ShieldCheck, Activity, Search, ExternalLink, ArrowUpRight, Clock, MapPin, Tablet } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: DashboardStats;
  customers: Customer[];
  transactions: Transaction[];
  securityLogs: SecurityLog[];
  onInvestigate: (customerId: string, transactionId: string) => void;
}

export default function Dashboard({ stats, customers, transactions, securityLogs, onInvestigate }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter recent transactions
  const filteredTxns = stats.recent_transactions.filter(tx => 
    tx.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-soc-card border border-soc-border rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-soc-accent/10 to-transparent pointer-events-none" />
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-soc-accent animate-pulse" size={28} />
            SOC Real-Time Stream Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Correlating transactional payloads with continuous security telemetry stream.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-soc-border rounded-lg px-4 py-2 font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-soc-success animate-ping" />
          <span className="text-slate-300">SYSTEM STATE:</span>
          <span className="text-soc-success font-semibold">ACTIVE LOGGING</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md hover:border-soc-accent/50 transition-colors"
          id="stat-total-customers"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Customers</span>
            <div className="p-2 bg-slate-900 rounded-lg text-soc-accent">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-bold text-white">{stats.total_customers}</span>
            <p className="text-xs text-soc-success mt-1">100% active KYC verified</p>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md hover:border-soc-accent/50 transition-colors"
          id="stat-total-transactions"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Transactions</span>
            <div className="p-2 bg-slate-900 rounded-lg text-soc-accent">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-bold text-white">{stats.total_transactions}</span>
            <p className="text-xs text-slate-400 mt-1">Real-time processing queue</p>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md hover:border-soc-accent/50 transition-colors"
          id="stat-fraud-count"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Fraud Detected</span>
            <div className="p-2 bg-slate-900 rounded-lg text-soc-alert">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-bold text-soc-alert">{stats.fraud_count}</span>
            <p className="text-xs text-soc-alert mt-1 font-mono">CRITICAL MITIGATED</p>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md hover:border-soc-accent/50 transition-colors"
          id="stat-avg-risk-score"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Average Risk Score</span>
            <div className="p-2 bg-slate-900 rounded-lg text-yellow-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-display font-bold ${
              stats.average_risk_score > 70 ? 'text-soc-alert' : stats.average_risk_score > 35 ? 'text-yellow-400' : 'text-soc-success'
            }`}>{stats.average_risk_score}%</span>
            <p className="text-xs text-slate-400 mt-1">Adaptive dynamic index</p>
          </div>
        </motion.div>

        {/* Card 5 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md hover:border-soc-accent/50 transition-colors col-span-1 sm:col-span-2 lg:col-span-1"
          id="stat-system-health"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">System Health</span>
            <div className="p-2 bg-slate-900 rounded-lg text-soc-success">
              <HeartPulse size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-display font-bold text-white flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${stats.system_health === 'Optimal' ? 'bg-soc-success' : 'bg-soc-alert'} animate-pulse`} />
              {stats.system_health}
            </span>
            <p className="text-xs text-slate-400 mt-2">All API routes responding</p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area: Recent Transactions */}
      <div className="bg-soc-card border border-soc-border rounded-xl shadow-xl overflow-hidden" id="recent-transactions-container">
        {/* Table Filter & Search */}
        <div className="p-5 border-b border-soc-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40">
          <div>
            <h2 className="text-lg font-display font-semibold text-white">Live Cybersecurity Transaction Ledger</h2>
            <p className="text-xs text-slate-400">Showing the latest banking actions correlated with IP and device reputation scores.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search ID, name, location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-soc-border rounded-lg py-2 pl-9 pr-4 text-slate-200 text-xs focus:outline-none focus:border-soc-accent/70 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-soc-border bg-slate-950/50 text-slate-400 font-mono">
                <th className="p-4">TXN / CUST ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Beneficiary</th>
                <th className="p-4">Geo-Location</th>
                <th className="p-4">Time / Hour</th>
                <th className="p-4 text-center">Threat Risk</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/40">
              {filteredTxns.length > 0 ? (
                filteredTxns.map((tx, idx) => {
                  return (
                    <tr 
                      key={tx.transaction_id} 
                      className={`hover:bg-slate-900/50 transition-colors ${
                        tx.is_fraud ? 'bg-soc-alert/5 hover:bg-soc-alert/10' : ''
                      }`}
                    >
                      <td className="p-4 font-mono">
                        <div className="text-white font-semibold">{tx.transaction_id}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">{tx.customer_id}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {tx.customer_name}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-900 text-slate-300 border border-soc-border/80 rounded px-2 py-0.5 font-mono text-[10px]">
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-medium ${
                          tx.beneficiary_status === 'Suspicious' ? 'text-soc-alert' : tx.beneficiary_status === 'New' ? 'text-yellow-400' : 'text-soc-success'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            tx.beneficiary_status === 'Suspicious' ? 'bg-soc-alert animate-ping' : tx.beneficiary_status === 'New' ? 'bg-yellow-400' : 'bg-soc-success'
                          }`} />
                          {tx.beneficiary_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin size={12} className="text-slate-500" />
                          <span>{tx.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <Clock size={12} className="text-slate-600" />
                          <span>{String(tx.transaction_hour).padStart(2, '0')}:00</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          tx.risk_level === 'High' 
                            ? 'bg-soc-alert/10 text-soc-alert border-soc-alert/30' 
                            : tx.risk_level === 'Medium' 
                            ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' 
                            : 'bg-soc-success/10 text-soc-success border-soc-success/30'
                        }`}>
                          {tx.risk_level} ({tx.risk_score}%)
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onInvestigate(tx.customer_id, tx.transaction_id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium font-display px-3 py-1 rounded-md transition-all ${
                            tx.is_fraud
                              ? 'bg-soc-alert hover:bg-red-600 text-white shadow-lg shadow-soc-alert/25'
                              : 'bg-soc-accent/10 hover:bg-soc-accent hover:text-black text-soc-accent border border-soc-accent/20 hover:border-transparent'
                          }`}
                        >
                          <span>Analyze Threat</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-mono">
                    No transaction entries match the current SOC query parameter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
