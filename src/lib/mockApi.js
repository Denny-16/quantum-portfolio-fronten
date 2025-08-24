// src/lib/mockApi.js

// Simulate API delay
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// --- Sample asset sets by dataset ---
const ASSETS = {
  nifty50: ["Reliance", "HDFC Bank", "Infosys", "TCS", "ICICI Bank", "HUL", "Bharti Airtel"],
  nasdaq: ["Apple", "Microsoft", "Amazon", "Google", "Tesla", "Nvidia", "Meta"],
  crypto: ["Bitcoin", "Ethereum", "Solana", "Cardano", "Polkadot", "BNB", "XRP"],
  default: ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"],
};

// --- Mock functions ---
export async function fetchEfficientFrontier({ riskLevel, constraints, threshold }) {
  await delay(400);
  // just generate dummy frontier points
  const base = riskLevel === "low" ? 5 : riskLevel === "medium" ? 10 : 20;
  return Array.from({ length: 8 }, (_, i) => ({
    risk: base + i * 2,
    return: base / 2 + i * 1.5,
  }));
}

export async function fetchSharpeComparison() {
  await delay(300);
  return [
    { name: "Classical", value: 1.1 },
    { name: "Quantum", value: 1.35 },
    { name: "Hybrid", value: 1.42 },
  ];
}

export async function runQAOASelection({ constraints, threshold }) {
  await delay(500);
  // Return top 5 bitstrings
  return [
    { bits: "00111", p: 0.21, expRet: 0.093, risk: 0.113, constraints: "OK" },
    { bits: "11100", p: 0.20, expRet: 0.088, risk: 0.092, constraints: "OK" },
    { bits: "10101", p: 0.19, expRet: 0.097, risk: 0.117, constraints: "ESG excluded" },
    { bits: "11010", p: 0.18, expRet: 0.092, risk: 0.095, constraints: "ESG excluded" },
    { bits: "10011", p: 0.13, expRet: 0.090, risk: 0.096, constraints: "OK" },
  ];
}

export async function fetchAllocation({ topBits, hybrid, threshold, dataset }) {
  await delay(400);

  const assets = ASSETS[dataset] || ASSETS.default;
  const slice = assets.slice(0, 5); // only take 5 for simplicity

  const weights = Array.from({ length: slice.length }, () =>
    Math.max(5, Math.random() * 40)
  );
  const sum = weights.reduce((a, b) => a + b, 0);

  return slice.map((name, i) => ({
    name,
    value: Math.round((weights[i] / sum) * 100),
  }));
}

export async function backtestEvolution({ freq, hybrid, initialEquity, timeHorizon }) {
  await delay(500);
  const steps = timeHorizon || 12;
  let q = initialEquity;
  let c = initialEquity * 0.95;

  return Array.from({ length: steps }, (_, i) => {
    q *= 1 + (Math.random() * 0.04 - 0.01); // random fluctuation
    c *= 1 + (Math.random() * 0.03 - 0.01);
    return {
      time: `Day ${i + 1}`,
      Quantum: Math.round(q),
      Classical: Math.round(c),
    };
  });
}

export async function stressSim({ lastQuantum, lastClassical, stress }) {
  await delay(300);
  const { ratesBps, oilPct, techPct, fxPct } = stress;
  const factor = 1 - (ratesBps / 10000 + oilPct / 100 + techPct / 100 + fxPct / 100) * 0.5;

  return [
    { name: "Quantum", value: Math.round(lastQuantum * factor) },
    { name: "Classical", value: Math.round(lastClassical * factor) },
  ];
}
