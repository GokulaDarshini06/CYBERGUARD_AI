import { Customer, Transaction, SecurityLog, QuantumThreatIndicator } from './types.ts';

// Helper for random items
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));

export function generateDatasets() {
  const customerFirstNames = [
    'Aarav', 'Aditi', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Karan', 'Ananya', 'Sanjay', 'Deepika',
    'Kunal', 'Siddharth', 'Sneha', 'Amit', 'Pooja', 'Rajesh', 'Meera', 'Abhishek', 'Tanvi', 'Devendra',
    'Arjun', 'Isha', 'Kabir', 'Riya', 'Rahul', 'Pranav', 'Shreya', 'Yash', 'Divya', 'Varun',
    'Vijay', 'Sunita', 'Anil', 'Gita', 'Harish', 'Lata', 'Suresh', 'Kiran', 'Ramesh', 'Asha',
    'Manish', 'Komal', 'Alok', 'Ritu', 'Nitin', 'Nidhi', 'Saurabh', 'Jyoti', 'Pankaj', 'Sapna'
  ];

  const customerLastNames = [
    'Sharma', 'Patel', 'Mehta', 'Iyer', 'Singh', 'Reddy', 'Johar', 'Gupta', 'Dutt', 'Rao',
    'Kapoor', 'Roy', 'Deshmukh', 'Trivedi', 'Hegde', 'Kumar', 'Nair', 'Bose', 'Joshi', 'Yadav',
    'Choudhury', 'Sen', 'Pillai', 'Banerjee', 'Chatterjee', 'Verma', 'Mishra', 'Pandey', 'Saxena', 'Agrawal',
    'Kulkarni', 'Joshi', 'Bhat', 'Shetty', 'Menon', 'Prasad', 'Das', 'Malhotra', 'Mehra', 'Sari'
  ];

  const branches = [
    'Mumbai Fort', 'Delhi Connaught Place', 'Bangalore Whitefield', 'Kolkata Park Street', 
    'Chennai Anna Salai', 'Hyderabad HITEC City', 'Pune Hinjewadi', 'Ahmedabad SG Highway',
    'Gurugram Cyber City', 'Noida Sector 62'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Gurugram', 'Noida',
    'London', 'New York', 'Singapore', 'Dubai', 'Tokyo', 'Zurich', 'Frankfurt', 'Amsterdam'
  ];

  const customers: Customer[] = [];
  const securityLogs: SecurityLog[] = [];
  const transactions: Transaction[] = [];

  // 1. Generate 5000+ Customers and their corresponding Security Logs
  // Pre-generate lists for blazing-fast indexing and mapping
  for (let i = 1; i <= 5100; i++) {
    const id = `CUST${String(i).padStart(4, '0')}`;
    const name = `${randomChoice(customerFirstNames)} ${randomChoice(customerLastNames)}`;
    const accountType = randomChoice<Customer['account_type']>(['Savings', 'Checking', 'Premium', 'Corporate']);
    const accNum = `${randomRange(1000000000, 9999999999)}`;
    const branch = randomChoice(branches);

    customers.push({
      customer_id: id,
      customer_name: name,
      account_number: accNum,
      account_type: accountType,
      branch: branch,
    });

    // Create realistic cybersecurity telemetry for each of the 5,100 customers
    // 88% Safe, 8% Neutral/Suspicious, 4% Compromised/High Risk
    let failedLogins = 0;
    let newDevice = false;
    let ipRep: SecurityLog['ip_reputation'] = 'Safe';
    let vpn = false;
    let locChanged = false;
    let multiSessions = false;

    const roll = Math.random();
    if (roll < 0.04) {
      // High Compromise / Threat Scenario
      failedLogins = randomRange(3, 8);
      newDevice = true;
      ipRep = randomChoice<SecurityLog['ip_reputation']>(['Risky', 'Malicious']);
      vpn = Math.random() > 0.2;
      locChanged = true;
      multiSessions = Math.random() > 0.4;
    } else if (roll < 0.12) {
      // Moderate / Suspicious Behavior
      failedLogins = randomRange(1, 2);
      newDevice = Math.random() > 0.5;
      ipRep = 'Neutral';
      vpn = Math.random() > 0.6;
      locChanged = Math.random() > 0.5;
      multiSessions = false;
    } else {
      // Safe Customer Profile
      failedLogins = randomChoice([0, 0, 0, 0, 1]);
      newDevice = false;
      ipRep = 'Safe';
      vpn = false;
      locChanged = false;
      multiSessions = false;
    }

    securityLogs.push({
      customer_id: id,
      failed_login_attempts: failedLogins,
      new_device: newDevice,
      ip_reputation: ipRep,
      vpn_detected: vpn,
      location_changed: locChanged,
      multiple_sessions: multiSessions,
    });
  }

  // 2. Generate 10,000+ Transactions mapped to these customers
  // We distribute 10,250 transactions across the generated customers to guarantee meeting requirements.
  let txnIdCounter = 10001;
  const numCustomers = customers.length;

  for (let i = 0; i < 10250; i++) {
    const txId = `TXN${txnIdCounter++}`;
    // Associate with a customer (distributing reasonably so high-risk customers have suspicious transactions)
    const custIndex = i % numCustomers;
    const cust = customers[custIndex];
    const log = securityLogs[custIndex];

    const type = randomChoice<Transaction['transaction_type']>(['UPI', 'NEFT', 'RTGS', 'IMPS', 'ATM']);
    
    // Default amounts: NEFT and RTGS are large, UPI and ATM are smaller
    let amount = 0;
    if (type === 'RTGS') {
      amount = randomRange(200000, 1000000); // Larger sums for real-time gross settlement
    } else if (type === 'NEFT') {
      amount = randomRange(10000, 199999);
    } else if (type === 'IMPS') {
      amount = randomRange(1000, 50000);
    } else if (type === 'ATM') {
      amount = randomChoice([2000, 5000, 10000, 20000]);
    } else {
      // UPI (High volume, smaller to moderate amounts)
      amount = randomRange(100, 15000);
    }

    let beneficiary: Transaction['beneficiary_status'] = 'Trusted';
    let hour = randomChoice([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]); // Primarily business/day hours
    let loc = cust.branch.replace(' Fort', '').replace(' Connaught Place', '').replace(' Whitefield', '').replace(' Park Street', '').replace(' Anna Salai', '').replace(' HITEC City', '').replace(' Hinjewadi', '').replace(' SG Highway', '').replace(' Cyber City', '').replace(' Sector 62', '');
    let device = randomChoice<Transaction['device_type']>(['Mobile', 'Desktop', 'ATM']);
    let isFraud = false;

    // Introduce high-risk patterns aligned with security log flags to represent compromised logins siphoning funds
    if (log.ip_reputation === 'Malicious' || log.failed_login_attempts >= 3) {
      isFraud = Math.random() > 0.2; // High probability of fraud correlation
      if (isFraud) {
        amount = type === 'RTGS' ? randomRange(800000, 2500000) : randomRange(150000, 450000); // Unusually high amount
        beneficiary = 'Suspicious';
        hour = randomChoice([0, 1, 2, 3, 4, 5]); // Unusual hour (midnight to early hours)
        loc = randomChoice(locations.filter(l => l !== loc)); // Geographical anomaly
        device = 'Mobile';
      }
    } else if (log.vpn_detected && log.location_changed) {
      isFraud = Math.random() > 0.6; // High VPN/Velocity anomaly
      if (isFraud) {
        amount = randomRange(75000, 250000);
        beneficiary = 'New';
        hour = randomChoice([23, 0, 1]);
        loc = 'Unknown Proxy Server';
        device = 'Tablet';
      }
    }

    transactions.push({
      transaction_id: txId,
      customer_id: cust.customer_id,
      amount: amount,
      transaction_type: type,
      beneficiary_status: beneficiary,
      transaction_hour: hour,
      location: loc,
      device_type: device,
      is_fraud: isFraud,
    });
  }

  // 3. Generate 15-20 Quantum Threat Indicators (Bonus Feature)
  const quantumProtocols = ['TLS 1.2', 'SSHv2', 'Kyber-1024', 'Dilithium-5', 'TLS 1.3 with X25519', 'IPsec with RSA-2048'];
  const quantumAsymmetricKeys = ['RSA-2048', 'ECDSA-256', 'Kyber-1024', 'Dilithium-5'];
  const quantumNodes = ['MUM-GATE-01', 'DEL-GATE-02', 'BLR-CORE-05', 'HYD-EDGE-01', 'MAA-BACKUP-03', 'PNQ-SW-02', 'SGP-OUT-01'];

  const quantumIndicators: QuantumThreatIndicator[] = [];
  for (let q = 1; q <= 20; q++) {
    const nodeId = randomChoice(quantumNodes);
    const keyType = randomChoice(quantumAsymmetricKeys);
    
    let protocol = 'TLS 1.3';
    let strength: QuantumThreatIndicator['encryption_strength'] = 'Vulnerable';
    let harvestFlag = false;
    let threatLevel: QuantumThreatIndicator['threat_level'] = 'Low';

    if (keyType === 'RSA-2048') {
      protocol = randomChoice(['TLS 1.2', 'SSHv2', 'IPsec']);
      strength = 'Highly Vulnerable';
      harvestFlag = Math.random() > 0.3; // High chance of HNDL
      threatLevel = 'High';
    } else if (keyType === 'ECDSA-256') {
      protocol = 'TLS 1.3 (Classic ECDH)';
      strength = 'Vulnerable';
      harvestFlag = Math.random() > 0.5;
      threatLevel = 'Medium';
    } else {
      // Kyber / Dilithium (PQC algorithms)
      protocol = keyType === 'Kyber-1024' ? 'TLS 1.3 (Kyber Draft)' : 'SSHv3 (Dilithium Draft)';
      strength = 'Post-Quantum Safe';
      harvestFlag = false; // Post-Quantum secure against retro-decryption
      threatLevel = 'Low';
    }

    const entropy = strength === 'Post-Quantum Safe' ? randomFloat(0.85, 0.99) : randomFloat(0.40, 0.75);
    const egress = harvestFlag ? randomFloat(10, 150) : randomFloat(0.1, 5);

    quantumIndicators.push({
      node_id: nodeId,
      protocol: protocol,
      encryption_strength: strength,
      asymmetric_key_type: keyType as any,
      harvest_flag: harvestFlag,
      entropy_score: entropy,
      egress_size_gb: egress,
      threat_level: threatLevel,
      last_intercept_timestamp: new Date(Date.now() - q * 4500000).toISOString()
    });
  }

  return { customers, securityLogs, transactions, quantumIndicators };
}

/**
 * Simulates a trained Scikit-Learn Logistic Regression & Random Forest feature-weight correlation.
 * Models the math logic exactly as a trained binary classifier would on correlated feature arrays.
 */
export function predictFraudRisk(customer: Customer, transaction: Transaction, securityLog: SecurityLog) {
  // We model this using logarithmic odds weights calibrated to transaction & cybersecurity metrics
  let logOdds = -2.8; // Base baseline intercept (indicates low base-rate fraud)

  // 1. Cybersecurity Telemetry Features (Strong regression indicators for Account Takeover / Brute-force)
  logOdds += securityLog.failed_login_attempts * 0.55; // Brute force weighting
  if (securityLog.new_device) logOdds += 1.1; // Logged in from new device
  if (securityLog.vpn_detected) logOdds += 0.9; // Masked via commercial VPN node
  if (securityLog.location_changed) logOdds += 1.3; // High geographic velocity change
  if (securityLog.multiple_sessions) logOdds += 0.8; // Concurrent double-login sessions

  if (securityLog.ip_reputation === 'Malicious') logOdds += 2.4; // Flagged botnet/cyber-intel node
  else if (securityLog.ip_reputation === 'Risky') logOdds += 1.2;
  else if (securityLog.ip_reputation === 'Neutral') logOdds += 0.4;

  // 2. Transaction Behavioral Features
  if (transaction.beneficiary_status === 'Suspicious') logOdds += 2.0; // Recipient is flagged mule
  else if (transaction.beneficiary_status === 'New') logOdds += 0.7; // Recipient is unverified

  // Temporal/Out-of-Hours multiplier (11 PM - 5 AM is risky for transfers)
  if (transaction.transaction_hour >= 23 || transaction.transaction_hour <= 5) {
    logOdds += 1.1;
  }

  // Payment channel & volume specific anomaly calculations
  if (transaction.transaction_type === 'RTGS' && transaction.amount > 1200000) {
    logOdds += 1.8; // High-value wire anomaly
  } else if (transaction.transaction_type === 'UPI' && transaction.amount > 12000) {
    logOdds += 1.4; // Exceeds typical micro-payment velocity profiles
  } else if (transaction.amount > 300000) {
    logOdds += 1.6;
  } else if (transaction.amount > 50000) {
    logOdds += 0.9;
  }

  // Location offset calculation: check if payment occurred outside home branch city bounds
  const branchCity = customer.branch.split(' ')[0];
  if (transaction.location !== 'ATM' && !transaction.location.toLowerCase().includes(branchCity.toLowerCase())) {
    logOdds += 0.8; // Geographic transactional velocity breach
  }

  // Calculate binary logit probability
  const probability = 1 / (1 + Math.exp(-logOdds));
  const riskScore = Math.round(probability * 100);

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (riskScore >= 70) riskLevel = 'High';
  else if (riskScore >= 35) riskLevel = 'Medium';

  // Feature importance explanation array (Model-independent local explanation like LIME)
  const flaggedReasons: string[] = [];
  if (securityLog.failed_login_attempts >= 3) {
    flaggedReasons.push(`Credential stuffing indicators: ${securityLog.failed_login_attempts} failed authorization audits.`);
  } else if (securityLog.failed_login_attempts > 0) {
    flaggedReasons.push(`Elevated failed authorization: ${securityLog.failed_login_attempts} logged attempts.`);
  }
  if (securityLog.vpn_detected) flaggedReasons.push('Commercial routing overlay (VPN/Proxy bypass) discovered.');
  if (securityLog.new_device) flaggedReasons.push('First-time hardware footprint detected during payout request.');
  if (securityLog.location_changed) flaggedReasons.push('MAC address and GPS velocity correlation anomaly (Geographic Velocity Breach).');
  if (securityLog.multiple_sessions) flaggedReasons.push('Active concurrent session handles running on multiple remote terminals.');
  if (securityLog.ip_reputation === 'Malicious') flaggedReasons.push('Gateway IP classified under active hacker-group malicious botnets.');
  if (securityLog.ip_reputation === 'Risky') flaggedReasons.push('Source IP identified with high Tor exit-node or blacklisted reputation.');
  if (transaction.beneficiary_status === 'Suspicious') flaggedReasons.push('Beneficiary bank account listed in national anti-fraud database of fraudulent mule accounts.');
  if (transaction.beneficiary_status === 'New') flaggedReasons.push('Target account created within the last 72 hours (Mule indicator).');
  if (transaction.amount > 100000) {
    flaggedReasons.push(`Extreme payload deviation: ₹${transaction.amount.toLocaleString()} exceeds average behavioral ceiling.`);
  }
  if (transaction.transaction_hour >= 23 || transaction.transaction_hour <= 5) {
    flaggedReasons.push(`Nocturnal transaction: Executed at anomalous time index (${transaction.transaction_hour}:00 IST).`);
  }

  return {
    riskScore,
    riskLevel,
    probability,
    flaggedReasons
  };
}
