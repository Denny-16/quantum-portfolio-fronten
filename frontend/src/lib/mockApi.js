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

// --- Stress Testing (new, threshold-aware) ---
// inputs:
//  - alloc: [{ name, value } ...]  value = weight percent (0..100)
//  - initialEquity: number (₹)
//  - threshold: number (%)  e.g., 60 means 60% of initialEquity is the ruin line
//  - stress: { ratesBps, oilPct, techPct, fxPct }  sliders from UI
// returns:
//  {
//    bars: [{ name, value } ...],   // value = equity after worst-case stress for that stock
//    ruinLine: number               // absolute equity threshold (₹)
//  }
export async function stressSim({ alloc = [], initialEquity = 100000, threshold = 60, stress }) {
  const sectorOf = (nm) => {
    const n = (nm || "").toLowerCase();
    if (n.includes("oil") || n.includes("coal") || n.includes("petro") || n.includes("energy")) return "energy";
    if (n.includes("tech") || n.includes("it") || n.includes("software") || n.includes("airtel")) return "tech";
    if (n.includes("bank") || n.includes("finance")) return "finance";
    if (n.includes("auto")) return "auto";
    if (n.includes("pharma") || n.includes("lab") || n.includes("health")) return "health";
    return "other";
  };

  const { ratesBps = 0, oilPct = 0, techPct = 0, fxPct = 0 } = stress || {};

  const base = { energy: 0.10, tech: 0.12, finance: 0.08, auto: 0.07, health: 0.05, other: 0.06 };

  const ratesHit  = Math.max(0, ratesBps) / 10000; // 200 bps -> 0.02
  const oilShock  = oilPct / 100;
  const techShock = techPct / 100;
  const fxShock   = Math.abs(fxPct) / 100 * 0.3;

  const bars = (alloc || []).map(a => {
    const w = (Number(a.value) || 0) / 100;
    const name = a.name || "Asset";
    const sec = sectorOf(name);
    let stressFactor = base[sec] ?? base.other;

    if (sec === "finance") stressFactor += ratesHit * 0.8 + fxShock * 0.2;
    if (sec === "tech")    stressFactor += ratesHit * 0.3 + Math.max(0, -techShock) * 0.6 + fxShock * 0.1;
    if (sec === "energy")  stressFactor += Math.max(0, oilShock) * 0.7 + fxShock * 0.1;
    if (sec === "auto")    stressFactor += ratesHit * 0.2 + fxShock * 0.2;
    if (sec === "health")  stressFactor += ratesHit * 0.1;

    stressFactor = Math.max(0.02, Math.min(0.35, stressFactor));
    const equityAfter = initialEquity * w * (1 - stressFactor);
    return { name, value: Math.max(0, Math.round(equityAfter)) };
  });

  const ruinLine = Math.round((Number(threshold) || 0) / 100 * initialEquity);
  await new Promise(r => setTimeout(r, 250));
  return { bars, ruinLine };
}
