import React, { useMemo } from "react";
import Skeleton from "./Skeleton.js";
import EmptyState from "./EmptyState.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const Card = ({ title, children }) => (
  <div className="bg-[#0f1422] border border-zinc-800/70 rounded-2xl p-4 shadow-sm">
    {title ? <h3 className="text-[15px] md:text-lg font-semibold mb-2">{title}</h3> : null}
    {children}
  </div>
);

function pct(n, d) {
  if (!d || d === 0) return "0%";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function toPct(v, digits = 1) {
  return `${Number(v).toFixed(digits)}%`;
}

export default function InsightsPanel({ loading, topBits, sharpeData, alloc, evolution, useHybrid }) {
  const evoSummary = useMemo(() => {
    if (!Array.isArray(evolution) || evolution.length < 2) return null;
    const first = evolution[0];
    const last = evolution[evolution.length - 1];
    const qGain = last.Quantum - first.Quantum;
    const cGain = last.Classical - first.Classical;
    const qPct = ((qGain / first.Quantum) * 100);
    const cPct = ((cGain / first.Classical) * 100);
    const adv = qPct - cPct;
    return {
      qStart: first.Quantum, qEnd: last.Quantum, qPct,
      cStart: first.Classical, cEnd: last.Classical, cPct,
      advantagePct: adv,
    };
  }, [evolution]);

  const bestSharpe = useMemo(() => {
    if (!Array.isArray(sharpeData) || !sharpeData.length) return null;
    return sharpeData.reduce((a, b) => (b.value > a.value ? b : a));
  }, [sharpeData]);

  const esgViolationRate = useMemo(() => {
    if (!Array.isArray(topBits) || !topBits.length) return 0;
    const viol = topBits.filter(b => (b.constraints || "").toLowerCase().includes("esg")).length;
    return (viol / topBits.length) * 100;
  }, [topBits]);

  const concentration = useMemo(() => {
    // HHI-like: sum(w^2). alloc values are in %
    if (!Array.isArray(alloc) || !alloc.length) return null;
    const weights = alloc.map(a => (Number(a.value) || 0) / 100);
    const hhi = weights.reduce((s, w) => s + w * w, 0); // 0..1
    // express as % concentration (higher = more concentrated)
    return hhi * 100;
  }, [alloc]);

  const top5Weights = useMemo(() => {
    if (!Array.isArray(alloc) || !alloc.length) return [];
    const sorted = [...alloc].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5);
    return sorted.map(x => ({ name: x.name, value: Number(x.value) || 0 }));
  }, [alloc]);

  const bitProbData = useMemo(() => {
    if (!Array.isArray(topBits)) return [];
    // show top 6 bitstrings by probability
    return [...topBits]
      .sort((a, b) => (b.p || 0) - (a.p || 0))
      .slice(0, 6)
      .map(x => ({ bits: x.bits, prob: Number((x.p || 0) * 100).toFixed(1) }));
  }, [topBits]);

  // Narrative text
  const narrative = useMemo(() => {
    const lines = [];
    if (evoSummary) {
      const adv = evoSummary.advantagePct;
      lines.push(
        `Over this backtest, Quantum ${adv >= 0 ? "outperformed" : "underperformed"} Classical by ${toPct(Math.abs(adv), 1)}.`,
      );
    }
    if (bestSharpe) {
      lines.push(`The best Sharpe among models is **${bestSharpe.name}** at ${bestSharpe.value.toFixed(2)}.`);
    }
    if (concentration != null) {
      lines.push(`Allocation concentration (HHI) is about ${concentration.toFixed(1)} — ${concentration > 25 ? "fairly concentrated" : "well diversified"}.`);
    }
    if (esgViolationRate > 0) {
      lines.push(`${toPct(esgViolationRate, 1)} of top measured portfolios violate the ESG filter.`);
    } else if (topBits?.length) {
      lines.push(`All top measured portfolios satisfy the ESG constraint.`);
    }
    if (useHybrid) {
      lines.push(`Hybrid mode is ON — subset by QAOA, weights by a classical solver.`);
    }
    return lines;
  }, [evoSummary, bestSharpe, concentration, esgViolationRate, useHybrid]);

  const nothingYet = !topBits?.length && !sharpeData?.length && !alloc?.length && !evolution?.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left column: Takeaways + KPIs */}
      <div className="space-y-6 xl:col-span-2">
        <Card title="Key Takeaways">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : nothingYet ? (
            <EmptyState title="No insights yet" subtitle="Apply constraints or adjust controls to generate results." />
          ) : (
            <ul className="list-disc pl-5 text-sm space-y-1 leading-6">
              {narrative.map((t, i) => (
                <li key={i} className="text-zinc-300" dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
              ))}
            </ul>
          )}
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card title="Hybrid Advantage">
            {evoSummary ? (
              <div className={`text-xl font-semibold ${evoSummary.advantagePct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {toPct(evoSummary.advantagePct, 1)}
              </div>
            ) : <Skeleton className="h-8 w-24" />}
            <div className="text-xs text-zinc-400 mt-1">Quantum vs Classical total return</div>
          </Card>

          <Card title="Best Sharpe">
            {bestSharpe ? (
              <>
                <div className="text-xl font-semibold">{bestSharpe.value.toFixed(2)}</div>
                <div className="text-xs text-zinc-400 mt-1">{bestSharpe.name}</div>
              </>
            ) : <Skeleton className="h-8 w-24" />}
          </Card>

          <Card title="Allocation Concentration">
            {concentration != null ? (
              <div className="text-xl font-semibold">{concentration.toFixed(1)}%</div>
            ) : <Skeleton className="h-8 w-24" />}
            <div className="text-xs text-zinc-400 mt-1">HHI × 100 (higher = concentrated)</div>
          </Card>

          <Card title="ESG Violations">
            <div className="text-xl font-semibold">{toPct(esgViolationRate, 1)}</div>
            <div className="text-xs text-zinc-400 mt-1">of top measured portfolios</div>
          </Card>
        </div>

        <Card title="Narrative (for your talk)">
          <p className="text-sm text-zinc-300">
            {narrative.length
              ? narrative.join(" ")
              : "Tune risk, rebalancing, and constraints to see a short summary of what changed, which model leads on Sharpe, and whether portfolios remain diversified and ESG-compliant."}
          </p>
        </Card>
      </div>

      {/* Right column: Mini charts */}
      <div className="space-y-6">
        <Card title="Top QAOA Bitstrings (Probability)">
          <div className="h-[220px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : !bitProbData.length ? (
              <EmptyState title="No measurements" subtitle="Apply constraints to generate QAOA candidates." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bitProbData} margin={{ top: 10, right: 10, left: 0, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="bits" stroke="#a1a1aa" tickMargin={6} />
                  <YAxis stroke="#a1a1aa" width={40} />
                  <Tooltip />
                  <Bar dataKey="prob" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2">Bars show measurement probability (%) for the most likely portfolios.</div>
        </Card>

        <Card title="Top 5 Weights">
          <div className="h-[220px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : !top5Weights.length ? (
              <EmptyState title="No allocation" subtitle="Apply constraints to compute weights." />
            ) : (
              <ul className="text-sm space-y-2">
                {top5Weights.map((w, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-zinc-300">{w.name}</span>
                    <span className="font-medium">{w.value.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2">Largest asset weights in the current allocation.</div>
        </Card>
      </div>
    </div>
  );
}
