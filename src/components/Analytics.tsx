import { 
  ResponsiveContainer, 
  AreaChart, Area, 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Customer, Transaction, SecurityLog } from '../types.ts';
import { predictFraudRisk } from '../dataGenerator.ts';
import { BarChart3, TrendingUp, Compass, Clock, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsProps {
  customers: Customer[];
  transactions: Transaction[];
  securityLogs: SecurityLog[];
}

export default function Analytics({ customers, transactions, securityLogs }: AnalyticsProps) {
  
  // 1. Fraud Distribution Data (Clean vs Fraudulent)
  const fraudCount = transactions.filter(t => t.is_fraud).length;
  const cleanCount = transactions.length - fraudCount;
  const fraudDistributionData = [
    { name: 'Authorized Transfers', value: cleanCount, color: '#00E676' },
    { name: 'Fraud Suspicion', value: fraudCount, color: '#FF5252' }
  ];

  // 2. Risk Distribution Data (Low, Medium, High count)
  let lowCount = 0;
  let medCount = 0;
  let highCount = 0;

  customers.forEach(cust => {
    const log = securityLogs.find(l => l.customer_id === cust.customer_id)!;
    const custTxns = transactions.filter(t => t.customer_id === cust.customer_id);
    if (custTxns.length > 0) {
      const latestTx = custTxns[custTxns.length - 1];
      const prediction = predictFraudRisk(cust, latestTx, log);
      if (prediction.riskLevel === 'High') highCount++;
      else if (prediction.riskLevel === 'Medium') medCount++;
      else lowCount++;
    }
  });

  const riskDistributionData = [
    { name: 'Low Risk', count: lowCount, fill: '#00E676' },
    { name: 'Medium Risk', count: medCount, fill: '#FFC107' },
    { name: 'High Risk', count: highCount, fill: '#FF5252' }
  ];

  // 3. Transactions by Location (Top Locations)
  const locationCounts: Record<string, number> = {};
  transactions.forEach(t => {
    locationCounts[t.location] = (locationCounts[t.location] || 0) + 1;
  });
  const locationData = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 locations

  // 4. Transactions by Hour (0 to 23)
  const hourCounts: Record<number, { hour: number; total: number; fraud: number }> = {};
  // Initialize hours 0 to 23
  for (let h = 0; h < 24; h++) {
    hourCounts[h] = { hour: h, total: 0, fraud: 0 };
  }
  transactions.forEach(t => {
    const hr = t.transaction_hour;
    if (hourCounts[hr]) {
      hourCounts[hr].total += 1;
      if (t.is_fraud) {
        hourCounts[hr].fraud += 1;
      }
    }
  });
  const hourlyData = Object.values(hourCounts).map(d => ({
    hour: `${String(d.hour).padStart(2, '0')}:00`,
    'Total Volume': d.total,
    'Fraud Volume': d.fraud
  }));

  // 5. Transaction Trend (Last 25 transactions chronological progression)
  const last25Txns = transactions.slice(-25).map((t, idx) => ({
    idx: `#${t.transaction_id}`,
    Amount: t.amount,
    isFraud: t.is_fraud
  }));

  return (
    <div className="space-y-6" id="analytics-view">
      
      {/* Title */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-lg">
        <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-soc-accent" />
          Banking Security Telemetry & Behavioural Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Aggregated and segmented analytics correlating user behavior trends with anomalous signal metrics.
        </p>
      </div>

      {/* Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Fraud Distribution */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-soc-success" />
              Fraud Allocation Ratio
            </h3>
            <p className="text-[11px] text-slate-400">Ratio of system-wide cleared transactions vs confirmed fraud attempts.</p>
          </div>
          <div className="h-56 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fraudDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fraudDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E2E5D', borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Profile Distribution */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 mb-1">
              <Activity size={16} className="text-soc-accent" />
              Customer Risk Profile Count
            </h3>
            <p className="text-[11px] text-slate-400">Customer audit distribution segmented by correlated risk category.</p>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2E5D" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E2E5D', borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Transactions by Location */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 mb-1">
              <Compass size={16} className="text-soc-accent" />
              Geographic Transaction Load
            </h3>
            <p className="text-[11px] text-slate-400">Total processed actions sorted by global geolocational terminals.</p>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2E5D" opacity={0.3} />
                <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis dataKey="location" type="category" stroke="#64748B" fontSize={10} tickLine={false} width={75} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E2E5D', borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="count" fill="#00C2FF" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 4: Hourly Load & Anomalies */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 mb-1">
              <Clock size={16} className="text-soc-accent" />
              Temporal Volume Allocation (24H Timeline)
            </h3>
            <p className="text-[11px] text-slate-400">Correlation of total transaction volume with malicious activity spikes by hour.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00C2FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5252" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF5252" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2E5D" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={9} />
                <YAxis stroke="#64748B" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E2E5D', borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Total Volume" stroke="#00C2FF" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Fraud Volume" stroke="#FF5252" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 bg-slate-950/40 p-3 rounded-lg border border-soc-border/40 text-[11px] font-mono text-slate-400">
            <span className="text-soc-alert font-bold">INSIGHT:</span> High-risk anomalous volumes spike dramatically between <span className="text-white">23:00 and 04:00</span>, while normal business volume remains concentrated in the standard daytime hours. This indicates potential automated ATO (Account Takeover) credential stuffing.
          </div>
        </div>

        {/* Chart 5: Chronological Transaction Amounts */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-5 shadow-md">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-soc-accent" />
              Chronological Payload Stream (Last 25 Transactions)
            </h3>
            <p className="text-[11px] text-slate-400">Scatter trend displaying individual transaction payload amounts and malicious indicators.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last25Txns} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2E5D" opacity={0.3} />
                <XAxis dataKey="idx" stroke="#64748B" fontSize={9} />
                <YAxis stroke="#64748B" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E2E5D', borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line 
                  type="monotone" 
                  dataKey="Amount" 
                  stroke="#00C2FF" 
                  strokeWidth={2.5} 
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isFraud) {
                      return (
                        <circle cx={cx} cy={cy} r={6} fill="#FF5252" stroke="#FFFFFF" strokeWidth={1.5} />
                      );
                    }
                    return (
                      <circle cx={cx} cy={cy} r={3.5} fill="#00C2FF" />
                    );
                  }}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 bg-slate-950/40 p-3 rounded-lg border border-soc-border/40 text-[11px] font-mono text-slate-400 flex justify-between items-center">
            <span><span className="text-soc-accent font-bold">LEGEND:</span> <span className="inline-block h-2 w-2 rounded-full bg-[#00C2FF] mr-1" /> Approved  /  <span className="inline-block h-3 w-3 rounded-full bg-[#FF5252] border border-white mr-1" /> Fraud Flagged Payload</span>
            <span className="text-[10px] text-slate-500">Real-time adaptive threshold model</span>
          </div>
        </div>

      </div>

    </div>
  );
}
