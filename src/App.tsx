import { useState, useEffect } from 'react';
import { Customer, Transaction, SecurityLog, DashboardStats } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ThreatPrediction from './components/ThreatPrediction.tsx';
import Analytics from './components/Analytics.tsx';
import LiveAlerts from './components/LiveAlerts.tsx';
import About from './components/About.tsx';
import QuantumMonitoring from './components/QuantumMonitoring.tsx';
import { Activity, Cpu, BarChart3, Radio, Info, Shield, Menu, X, RefreshCw, AlertCircle, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type PageType = 'dashboard' | 'threat-prediction' | 'analytics' | 'live-alerts' | 'quantum-monitoring' | 'about';

export default function App() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Bank Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Drilldown coordination state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');

  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchBankData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failure retrieving active SOC datastream. Verify port 3000 mapping.');
      }
      const data = await response.json();
      setCustomers(data.customers);
      setTransactions(data.transactions);
      setSecurityLogs(data.securityLogs);
      setStats(data.stats);

      // Pre-select first customer for Sandbox page
      if (data.customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(data.customers[0].customer_id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Fatal connection failure connecting to back-end socket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, []);

  // Handle drilling down from Dashboard or Live Alerts into Threat Sandbox
  const handleInvestigate = (customerId: string, transactionId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedTransactionId(transactionId);
    setActivePage('threat-prediction');
  };

  // Navigations array
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'threat-prediction', name: 'Threat Sandbox', icon: Cpu },
    { id: 'analytics', name: 'Behavioural Analytics', icon: BarChart3 },
    { id: 'live-alerts', name: 'Live Alarm Broadcasts', icon: Radio },
    { id: 'quantum-monitoring', name: 'Quantum Risks', icon: Binary },
    { id: 'about', name: 'Technical Brief', icon: Info },
  ] as const;

  return (
    <div className="min-h-screen bg-soc-bg text-soc-text font-sans flex flex-col antialiased">
      
      {/* Top Navbar Header */}
      <header className="bg-soc-card/90 backdrop-blur-md border-b border-soc-border/60 sticky top-0 z-40 px-4 py-3.5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-soc-accent/10 rounded-lg text-soc-accent border border-soc-accent/20">
            <Shield size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-white font-display font-bold tracking-tight text-base sm:text-lg flex items-center gap-1.5">
              CYBERGUARD AI
              <span className="text-[9px] font-mono font-normal bg-soc-accent/15 text-soc-accent border border-soc-accent/30 rounded px-1.5 py-0.5 tracking-wider uppercase">
                SOC v2.6
              </span>
            </span>
            <p className="hidden sm:block text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
              FinSpark Banking Cybersecurity Portal
            </p>
          </div>
        </div>

        {/* Desktop Nav Selection */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-soc-accent text-slate-950 font-bold shadow-lg shadow-soc-accent/15'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon size={14} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Right Info Section */}
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchBankData}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-soc-border hover:border-slate-700 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            title="Reload telemetry feed"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-soc-accent' : ''} />
            <span className="hidden sm:inline">RELOAD CONSOLE</span>
          </button>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-900 border border-soc-border rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-soc-card border-b border-soc-border/60 absolute top-[57px] left-0 w-full z-30 lg:hidden flex flex-col p-4 gap-2 shadow-2xl"
          >
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg text-xs font-medium tracking-tight text-left transition-all ${
                    isActive
                      ? 'bg-soc-accent text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon size={15} />
                  {item.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Render area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-x-hidden">
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="animate-spin text-soc-accent" size={42} />
            <div className="text-center space-y-1">
              <p className="text-white font-medium">Synchronizing Secure SOC Stream</p>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                Correlating customer transaction records with IP registries...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-soc-card border border-soc-alert/30 rounded-xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-xl">
            <div className="p-3 bg-soc-alert/15 text-soc-alert rounded-full w-max mx-auto border border-soc-alert/30">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-display font-semibold text-white">Stream Sync Failed</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">{error}</p>
            </div>
            <button
              onClick={fetchBankData}
              className="px-5 py-2 bg-soc-alert hover:bg-red-600 text-white rounded-lg text-xs font-mono font-bold shadow-lg shadow-soc-alert/20 transition-all cursor-pointer"
            >
              RETRY SOC CONNECTION
            </button>
          </div>
        ) : stats ? (
          <div className="h-full">
            {activePage === 'dashboard' && (
              <Dashboard
                stats={stats}
                customers={customers}
                transactions={transactions}
                securityLogs={securityLogs}
                onInvestigate={handleInvestigate}
              />
            )}
            {activePage === 'threat-prediction' && (
              <ThreatPrediction
                customers={customers}
                transactions={transactions}
                securityLogs={securityLogs}
                selectedCustomerId={selectedCustomerId}
                selectedTransactionId={selectedTransactionId}
                onCustomerChange={(id) => setSelectedCustomerId(id)}
              />
            )}
            {activePage === 'analytics' && (
              <Analytics
                customers={customers}
                transactions={transactions}
                securityLogs={securityLogs}
              />
            )}
            {activePage === 'live-alerts' && (
              <LiveAlerts
                customers={customers}
                transactions={transactions}
                securityLogs={securityLogs}
              />
            )}
            {activePage === 'quantum-monitoring' && (
              <QuantumMonitoring quantumIndicators={stats.quantum_indicators} />
            )}
            {activePage === 'about' && <About />}
          </div>
        ) : null}
      </main>

      {/* Footer System Diagnostics */}
      <footer className="bg-slate-950/60 border-t border-soc-border/40 py-3.5 px-4 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 CYBERGUARD AI INC. DESIGNED FOR FINSPARK'26 NATIONAL CYBERSECURITY HACKATHON.</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-soc-success animate-ping" />
            SOC STREAM: ONLINE
          </span>
          <span>•</span>
          <span>CLASSIFIER: LOGISTIC_REGRESSION_SIM</span>
          <span>•</span>
          <span>EXPLAINER: GEMINI-3.5-FLASH</span>
        </div>
      </footer>

    </div>
  );
}
