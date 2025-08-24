// src/lib/mockApi.js
// Frontend-only mock API with small randomized logic

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// deterministic-ish random with seed
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export async function fetchEfficientFrontier({ risk = 5, constraints = {}, seed = 42 }) {
  const rnd = mulberry32(seed + Math.round(risk * 10));
  await sleep(300);
  const base = [
    { risk: 5, return: 6 },
    { risk: 8, return: 8 },
    { risk: 11, return: 9.5 },
    { risk: 14, return: 10.2 },
    { risk: 17, return: 10.5 },
  ];
  const esgPenalty = constraints.esgExclude ? 0.1 : 0;
  const capPenalty = Object.values(constraints.sectorCaps || {}).reduce((a, b) => a + b, 0) / 1000;
  return base.map((p) => ({
    risk: p.risk,
    return: +(p.return * (0.9 + risk * 0.02) - esgPenalty - capPenalty + rnd()).toFixed(2),
  }));
}

export async function fetchSharpeComparison({ seed = 7 }) {
  const rnd = mulberry32(seed);
  await sleep(200);
  const quantum = +(0.8 + rnd() * 0.2).toFixed(2);
  const classical = +(quantum - (0.12 + rnd() * 0.08)).toFixed(2);
  return [
    { name: "Quantum", value: Math.max(0.4, quantum) },
    { name: "Classical", value: Math.max(0.3, classical) },
  ];
}

export async function runQAOASelection({ constraints = {}, seed = 99 }) {
  const rnd = mulberry32(seed + (constraints.esgExclude ? 13 : 0));
  await sleep(400);
  const raw = Array.from({ length: 6 }, () => 0.1 + rnd() * 0.3);
  const sum = raw.reduce((a, b) => a + b, 0);
  const probs = raw.map((x) => x / sum);
  const bits = ["10101", "11100", "11010", "10011", "01101", "00111"];
  const rows = bits.map((b, i) => ({
    bits: b,
    p: +probs[i].toFixed(2),
    expRet: +(8.5 + rnd() * 3).toFixed(1),
    risk: +(8 + rnd() * 4).toFixed(1),
    constraints: rnd() > 0.8 ? "Sector>cap" : rnd() > 0.9 ? "ESG excluded" : "OK",
  }));
  return rows.sort((a, b) => b.p - a.p);
}

export async function fetchAllocation({ topBits = "10101", hybrid = true, seed = 21 }) {
  const rnd = mulberry32(seed + (hybrid ? 1 : 0) + topBits.length);
  await sleep(250);
  const q = 35 + Math.floor(rnd() * 10);
  const c = 20 + Math.floor(rnd() * 10);
  const e = 20 + Math.floor(rnd() * 10);
  const spy = clamp(100 - (q + c + e), 5, 40);
  return [
    { name: "QAOA-based", value: q },
    { name: "Classical Max-Sh", value: c },
    { name: "Equal-Weight", value: e },
    { name: "SPY", value: spy },
  ];
}

export async function backtestEvolution({
  freq = "Monthly",
  hybrid = true,
  initialEquity = 100000,
  timeHorizon = 30, // days
} = {}) {
  // deterministic seeds so it feels stable but reactive to inputs
  const seedBase =
    (freq === "Monthly" ? 13 : 29) +
    (hybrid ? 7 : 3) +
    Math.floor(initialEquity / 1000) +
    Number(timeHorizon || 0);

  let seedQ = seedBase + 17;
  let seedC = seedBase + 5;

  function randQ() { seedQ = (seedQ * 1103515245 + 12345) % 2147483647; return (seedQ / 2147483647) - 0.5; }
  function randC() { seedC = (seedC * 1664525 + 1013904223) % 2147483647; return (seedC / 2147483647) - 0.5; }

  const days = Math.max(2, Math.min(365, Number(timeHorizon) || 30)); // cap 365
  const data = [];
  let q = initialEquity;
  let c = initialEquity;

  // daily drift/vol; hybrid slightly improves risk-adjusted profile
  const driftQ = (freq === "Monthly" ? 0.0005 : 0.00045) + (hybrid ? 0.00005 : 0);
  const driftC = (freq === "Monthly" ? 0.00035 : 0.00033);
  const volQ   = (freq === "Monthly" ? 0.008 : 0.0075) * (hybrid ? 0.9 : 1.0);
  const volC   = (freq === "Monthly" ? 0.0065 : 0.006);

  for (let d = 1; d <= days; d++) {
    q = q * (1 + driftQ + volQ * randQ());
    c = c * (1 + driftC + volC * randC());
    if (q < initialEquity * 0.6) q = initialEquity * 0.6;
    if (c < initialEquity * 0.6) c = initialEquity * 0.6;

    data.push({
      time: `Day ${d}`,
      Quantum: Math.round(q),
      Classical: Math.round(c),
    });
  }

  await new Promise(r => setTimeout(r, 200));
  return data;
}


export async function stressSim({ lastQuantum, lastClassical, stress, seed = 77 }) {
  const rnd = mulberry32(seed);
  await sleep(200);
  const qImpact =
    -0.002 * stress.ratesBps + 0.003 * stress.oilPct + -0.9 * (stress.techPct / 100) + 0.1 * (stress.fxPct / 100) +
    (rnd() - 0.5) * 0.02;
  const cImpact =
    -0.002 * stress.ratesBps + 0.002 * stress.oilPct + -0.7 * (stress.techPct / 100) + 0.05 * (stress.fxPct / 100) +
    (rnd() - 0.5) * 0.02;
  const clampPct = (x) => clamp(x, -0.2, 0.2);
  const qPct = clampPct(qImpact);
  const cPct = clampPct(cImpact);
  return [
    { name: "Quantum", value: Math.round(lastQuantum * (1 + qPct)) },
    { name: "Classical", value: Math.round(lastClassical * (1 + cPct)) },
  ];
}
