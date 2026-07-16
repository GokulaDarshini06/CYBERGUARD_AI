import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { generateDatasets, predictFraudRisk } from './src/dataGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI client:', error);
  }
} else {
  console.log('GEMINI_API_KEY is not configured or holds default placeholder. Running in fallback mode.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Generate the datasets on startup
  console.log('Generating in-memory bank security datasets...');
  const { customers, securityLogs, transactions, quantumIndicators } = generateDatasets();
  console.log(`Successfully generated ${customers.length} customers, ${transactions.length} transactions, and ${securityLogs.length} security logs.`);

  // 1. API Endpoint: Return raw datasets and pre-computed global stats
  app.get('/api/data', (req, res) => {
    // Calculate global stats
    const totalCustomers = customers.length;
    const totalTransactions = transactions.length;
    const fraudCount = transactions.filter(t => t.is_fraud).length;

    // Linear pre-grouping to prevent O(N^2) lockups on large datasets
    const txsByCustomerId = new Map<string, typeof transactions>();
    transactions.forEach(t => {
      if (!txsByCustomerId.has(t.customer_id)) {
        txsByCustomerId.set(t.customer_id, []);
      }
      txsByCustomerId.get(t.customer_id)!.push(t);
    });

    const logsByCustomerId = new Map<string, typeof securityLogs[0]>();
    securityLogs.forEach(l => {
      logsByCustomerId.set(l.customer_id, l);
    });

    // Calculate dynamic average risk score
    let totalRiskScore = 0;
    let computedCount = 0;

    // Process using pre-grouped linear lookups
    customers.forEach(cust => {
      const log = logsByCustomerId.get(cust.customer_id);
      const custTxns = txsByCustomerId.get(cust.customer_id) || [];
      if (log && custTxns.length > 0) {
        const latestTx = custTxns[custTxns.length - 1];
        const resScore = predictFraudRisk(cust, latestTx, log);
        totalRiskScore += resScore.riskScore;
        computedCount++;
      }
    });

    const averageRiskScore = computedCount > 0 ? Math.round(totalRiskScore / computedCount) : 42;
    
    // Recent transactions (return latest 100 for responsive charting/lists)
    const recentTransactionsWithRisk = transactions.slice(-100).reverse().map(tx => {
      const cust = customers.find(c => c.customer_id === tx.customer_id);
      const log = logsByCustomerId.get(tx.customer_id);
      let prediction: { riskLevel: 'Low' | 'Medium' | 'High'; riskScore: number } = { riskLevel: 'Low', riskScore: 12 };
      if (cust && log) {
        prediction = predictFraudRisk(cust, tx, log);
      }
      return {
        ...tx,
        customer_name: cust ? cust.customer_name : 'Unknown Customer',
        risk_level: prediction.riskLevel,
        risk_score: prediction.riskScore,
      };
    });

    res.json({
      customers,
      securityLogs,
      transactions,
      stats: {
        total_customers: totalCustomers,
        total_transactions: totalTransactions,
        fraud_count: fraudCount,
        average_risk_score: averageRiskScore,
        system_health: averageRiskScore > 75 ? 'Critical' : averageRiskScore > 50 ? 'Degraded' : 'Optimal',
        recent_transactions: recentTransactionsWithRisk,
        quantum_indicators: quantumIndicators,
      }
    });
  });

  // 2. API Endpoint: Threat Prediction with Explainable AI via Gemini
  app.post('/api/predict', async (req, res) => {
    const { customerId, transactionId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    const customer = customers.find(c => c.customer_id === customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const securityLog = securityLogs.find(l => l.customer_id === customerId);
    if (!securityLog) {
      return res.status(404).json({ error: 'Security log not found' });
    }

    // Find requested transaction or default to latest
    const custTxns = transactions.filter(t => t.customer_id === customerId);
    if (custTxns.length === 0) {
      return res.status(404).json({ error: 'No transactions found for this customer' });
    }

    const transaction = transactionId 
      ? custTxns.find(t => t.transaction_id === transactionId) || custTxns[custTxns.length - 1]
      : custTxns[custTxns.length - 1];

    // 1. Calculate deterministic ML prediction
    const prediction = predictFraudRisk(customer!, transaction, securityLog);

    // 2. Query Gemini for professional Explainable AI correlation and mitigation recommendations
    let explanation = '';
    let recommendations: string[] = [];

    const prompt = `
You are an expert Cybersecurity Incident Responder and Bank Fraud AI Risk System.
Analyze this correlated transaction and security telemetry data:

[CUSTOMER DETAILS]
- Name: ${customer.customer_name} (ID: ${customer.customer_id})
- Account Number: ${customer.account_number}
- Account Type: ${customer.account_type}
- Branch: ${customer.branch}

[TRANSACTION DETAILS]
- Transaction ID: ${transaction.transaction_id}
- Amount: ₹${transaction.amount.toLocaleString()}
- Type: ${transaction.transaction_type}
- Beneficiary Account Status: ${transaction.beneficiary_status}
- Executed Hour: ${transaction.transaction_hour}:00
- Location: ${transaction.location}
- Initiating Device: ${transaction.device_type}

[CYBERSECURITY TELEMETRY LOGS]
- Failed Login Attempts: ${securityLog.failed_login_attempts}
- IP Address Reputation: ${securityLog.ip_reputation}
- VPN Connection Detected: ${securityLog.vpn_detected ? 'YES' : 'NO'}
- Unregistered/New Device: ${securityLog.new_device ? 'YES' : 'NO'}
- Location Mismatch/Rapid Change: ${securityLog.location_changed ? 'YES' : 'NO'}
- Concurrent/Multiple Sessions: ${securityLog.multiple_sessions ? 'YES' : 'NO'}

[MODEL ASSESSMENT]
- Calculated Risk Score: ${prediction.riskScore}/100
- Core Classification: ${prediction.riskLevel} Risk
- Flagged Anomalies: ${prediction.flaggedReasons.join(', ')}

Please provide:
1. Explainable AI Analysis (XAI): Write a professional 2-3 sentence technical justification correlating the transactional behaviour (amount, beneficiary, timing) with the security logs (VPN, location mismatch, IP reputation). Use serious banking SOC terminology.
2. Security Recommendations: Generate exactly 4 professional, bulleted mitigation actions for the SOC analyst to perform immediately. Each action should be actionable and starting with a clear action verb.

Your response MUST be in JSON format matching this schema:
{
  "explanation": "string describing the XAI report",
  "recommendations": ["Action 1", "Action 2", "Action 3", "Action 4"]
}
`;

    if (ai) {
      try {
        console.log('Attempting prediction generation via gemini-3.5-flash...');
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const resultText = response.text || '';
        const parsed = JSON.parse(resultText.trim());
        explanation = parsed.explanation || '';
        recommendations = parsed.recommendations || [];
      } catch (err: any) {
        console.warn('Gemini 3.5 Flash prediction failed (possibly high demand). Retrying with gemini-3.1-flash-lite...', err?.message || err);
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const resultText = response.text || '';
          const parsed = JSON.parse(resultText.trim());
          explanation = parsed.explanation || '';
          recommendations = parsed.recommendations || [];
          console.log('Fallback prediction generation via gemini-3.1-flash-lite succeeded.');
        } catch (liteErr: any) {
          console.error('Gemini 3.1 Flash Lite fallback failed as well:', liteErr?.message || liteErr);
        }
      }
    }

    // Fallback generation if Gemini is missing or failed
    if (!explanation) {
      if (prediction.riskLevel === 'High') {
        explanation = `Alert! High-probability risk of ${securityLog.new_device ? 'Account Takeover' : 'Insiders Threat/Fraud'}. Correlating ${securityLog.failed_login_attempts} failed login attempts with VPN usage and location mismatch from ${transaction.location} reveals a hostile login signature followed by an unauthorized transaction request to a ${transaction.beneficiary_status} beneficiary.`;
        recommendations = [
          'Instantly freeze the outbound transfer and place a hard lock on the customer account.',
          'Initiate Step-up Authentication via registered push notification and SMS.',
          'Terminate all active concurrent device sessions for this customer profile.',
          'Add the source IP address of the transaction to the institution firewall blocklist.'
        ];
      } else if (prediction.riskLevel === 'Medium') {
        explanation = `Moderate anomaly signature detected. The customer is initiating a transaction from location "${transaction.location}" using a ${securityLog.vpn_detected ? 'VPN proxy' : 'new device'} which deviates from historical patterns, though login credentials were valid on first attempt.`;
        recommendations = [
          'Flag the transaction for manual review in the SOC queue.',
          'Trigger an email/push alert to the user asking them to confirm the activity.',
          'Audit the user security logs for recent password changes or device registrations.',
          'Monitor the beneficiary account for immediate subsequent withdrawals.'
        ];
      } else {
        explanation = `Normal transactional profile confirmed. Security telemetry indicates low-risk indicators: safe IP reputation, zero failed login attempts, and transaction matching historical parameters from a trusted device and branch area.`;
        recommendations = [
          'Approve transaction and process transfer with standard security clearance.',
          'Log normal activity fingerprint to enhance future adaptive authentication models.',
          'No immediate SOC intervention required.',
          'Maintain regular real-time monitoring of user profile.'
        ];
      }
    }

    res.json({
      customer_id: customerId,
      risk_score: prediction.riskScore,
      risk_level: prediction.riskLevel,
      model_probability: prediction.probability,
      features: {
        score_from_telemetry: Math.round(prediction.riskScore * 0.6),
        score_from_transaction: Math.round(prediction.riskScore * 0.4),
        flagged_reasons: prediction.flaggedReasons,
      },
      explanation,
      recommendations,
    });
  });

  // Serve static files / integrate Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CyberGuard AI SOC Server running on port ${PORT}`);
  });
}

startServer();
