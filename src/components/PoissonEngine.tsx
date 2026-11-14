import { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/i18n';
import { calculateExpectedValue, calculateKellyStake, computePoissonMatrix } from '../utils/mathModels';

export function PoissonEngine({ language }: { language: Language }) {
  const t = translations[language];

  // Parameters
  const [homeXg, setHomeXg] = useState<number>(1.85);
  const [awayXg, setAwayXg] = useState<number>(1.20);
  const [useDixonColes, setUseDixonColes] = useState<boolean>(true);

  // Market odds input for EV test
  const [marketOddsHome, setMarketOddsHome] = useState<number>(2.20);
  const [marketOddsDraw, setMarketOddsDraw] = useState<number>(3.50);
  const [marketOddsAway, setMarketOddsAway] = useState<number>(3.80);
  const [marketOddsOver25, setMarketOddsOver25] = useState<number>(1.95);

  const [selectedScore, setSelectedScore] = useState<{ h: number; a: number; prob: number } | null>(null);

  const output = computePoissonMatrix(homeXg, awayXg, useDixonColes);

  // EV calculations
  const homeEv = calculateExpectedValue(output.homeWinProb, marketOddsHome);
  const drawEv = calculateExpectedValue(output.drawProb, marketOddsDraw);
  const awayEv = calculateExpectedValue(output.awayWinProb, marketOddsAway);
  const over25Ev = calculateExpectedValue(output.over25Prob, marketOddsOver25);

  const presets = [
    { name: 'Man City vs Real Madrid', h: 1.85, a: 1.25, oH: 2.15, oD: 3.40, oA: 3.75 },
    { name: 'Bayern vs Dortmund', h: 2.60, a: 1.45, oH: 1.70, oD: 4.30, oA: 4.60 },
    { name: 'Barcelona vs Atletico', h: 1.40, a: 0.95, oH: 1.95, oD: 3.50, oA: 4.20 },
    { name: 'Defensive Derby (Low xG)', h: 1.05, a: 0.90, oH: 2.45, oD: 3.00, oA: 3.30 },
  ];

  return (
    <div className="space-y-8">
      {/* Header and explanation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span>STOCHASTIC_MODEL_POISSON_BIVARIATE</span>
            <span aria-hidden="true">·</span>
            <span>DIXON-COLES MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.poissonTitle}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            {t.poissonDesc}
          </p>
        </div>

        {/* Presets buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setHomeXg(p.h);
                setAwayXg(p.a);
                setMarketOddsHome(p.oH);
                setMarketOddsDraw(p.oD);
                setMarketOddsAway(p.oA);
              }}
              className="text-xs px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/60 text-neutral-300 hover:text-white transition-colors font-mono"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls + Visuals + Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders, Options & Dixon Coles (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider font-mono">
              Model Inputs (Expected Goals)
            </h3>

            {/* Home xG */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">{t.homeXgLabel}</span>
                <span className="text-emerald-400 font-bold tabular-nums text-sm">{homeXg.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.05"
                value={homeXg}
                onChange={(e) => setHomeXg(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0.20 (Defensive)</span>
                <span>2.00 (Average)</span>
                <span>4.00 (Elite)</span>
              </div>
            </div>

            {/* Away xG */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">{t.awayXgLabel}</span>
                <span className="text-emerald-400 font-bold tabular-nums text-sm">{awayXg.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.05"
                value={awayXg}
                onChange={(e) => setAwayXg(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0.20</span>
                <span>2.00</span>
                <span>4.00</span>
              </div>
            </div>

            {/* Dixon Coles Toggle */}
            <div className="pt-3 border-t border-neutral-800/80">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDixonColes}
                  onChange={(e) => setUseDixonColes(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-neutral-300">
                  {t.dixonColesToggle}
                </span>
              </label>
            </div>
          </div>

          {/* Stochastic Surface Preview Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            <div className="aspect-video relative bg-neutral-950">
              <img
                src="/assets/academy/xg-pitch.jpg"
                alt="Poisson probability 3D surface plot"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 text-[11px] font-mono text-neutral-300">
                <span>Bivariate Density: λ1={homeXg.toFixed(1)} · λ2={awayXg.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 6x6 Scoreline Probability Heatmap + Outcomes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 6x6 Matrix Table */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                {t.scoreProbMatrix} (Home Goals vs Away Goals)
              </h3>
              <span className="text-xs text-neutral-400 font-mono">Click cell to inspect</span>
            </div>

            <div className="min-w-[420px]">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-mono text-neutral-400 border border-neutral-800 bg-neutral-950">
                      H \ A
                    </th>
                    {[0, 1, 2, 3, 4, 5].map((a) => (
                      <th
                        key={a}
                        className="p-2 text-xs font-mono text-neutral-300 border border-neutral-800 bg-neutral-950"
                      >
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5].map((h) => (
                    <tr key={h}>
                      <th className="p-2 text-xs font-mono text-neutral-300 border border-neutral-800 bg-neutral-950">
                        {h}
                      </th>
                      {[0, 1, 2, 3, 4, 5].map((a) => {
                        const prob = output.matrix[h][a];
                        const pct = prob * 100;
                        const isSelected = selectedScore?.h === h && selectedScore?.a === a;
                        // Intensity calculation for emerald background
                        const alpha = Math.min(prob * 7, 0.85);

                        return (
                          <td
                            key={a}
                            onClick={() => setSelectedScore({ h, a, prob })}
                            style={{
                              backgroundColor: `rgba(16, 185, 129, ${alpha})`,
                            }}
                            className={`p-2.5 text-xs font-mono border border-neutral-800/80 cursor-pointer transition-all hover:scale-105 hover:z-10 ${
                              isSelected
                                ? 'ring-2 ring-emerald-300 font-bold text-white'
                                : pct > 10
                                ? 'text-white font-bold'
                                : 'text-neutral-200'
                            }`}
                          >
                            <span className="tabular-nums block">{pct.toFixed(1)}%</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedScore && (
              <div className="mt-4 p-3 rounded-lg bg-neutral-950 border border-emerald-500/40 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300">
                  Selected Scoreline:{' '}
                  <strong className="text-white text-sm">
                    {selectedScore.h} - {selectedScore.a}
                  </strong>
                </span>
                <span className="text-emerald-400">
                  Probability: {(selectedScore.prob * 100).toFixed(2)}% (Fair Odds:{' '}
                  {(1 / selectedScore.prob).toFixed(2)})
                </span>
              </div>
            )}
          </div>

          {/* Outcomes & +EV Comparison Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1X2 Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
              <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">
                {t.prob1X2}
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Home (1):</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 tabular-nums">
                      {(output.homeWinProb * 100).toFixed(1)}%
                    </span>
                    <span className="text-neutral-500 text-[11px] ml-1.5">@{output.fairOdds.home}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Draw (X):</span>
                  <div className="text-right">
                    <span className="font-bold text-neutral-200 tabular-nums">
                      {(output.drawProb * 100).toFixed(1)}%
                    </span>
                    <span className="text-neutral-500 text-[11px] ml-1.5">@{output.fairOdds.draw}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Away (2):</span>
                  <div className="text-right">
                    <span className="font-bold text-neutral-300 tabular-nums">
                      {(output.awayWinProb * 100).toFixed(1)}%
                    </span>
                    <span className="text-neutral-500 text-[11px] ml-1.5">@{output.fairOdds.away}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Over/Under Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
              <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">
                {t.goalsMarket}
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Over 1.5 Goals:</span>
                  <span className="font-bold text-neutral-200 tabular-nums">
                    {(output.over15Prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Over 2.5 Goals:</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 tabular-nums">
                      {(output.over25Prob * 100).toFixed(1)}%
                    </span>
                    <span className="text-neutral-500 text-[11px] ml-1.5">@{output.fairOdds.over25}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Over 3.5 Goals:</span>
                  <span className="font-bold text-neutral-300 tabular-nums">
                    {(output.over35Prob * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* BTTS & Top Scores */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
              <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">
                {t.bttsLabel}
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">BTTS Yes:</span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    {(output.bttsProb * 100).toFixed(1)}% (@{output.fairOdds.bttsYes})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">BTTS No:</span>
                  <span className="font-bold text-neutral-300 tabular-nums">
                    {((1 - output.bttsProb) * 100).toFixed(1)}% (@{output.fairOdds.bttsNo})
                  </span>
                </div>
                <div className="pt-1 border-t border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 block mb-1">Top Scores:</span>
                  <div className="flex gap-2">
                    {output.mostLikelyScores.slice(0, 3).map((s) => (
                      <span key={s.score} className="px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-200 text-[11px]">
                        {s.score} ({(s.prob * 100).toFixed(1)}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookmaker EV Tester Strip */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-mono">
                  Live Market Expected Value (+EV) Auditor
                </h4>
                <p className="text-xs text-neutral-400">
                  Compare your bookmaker odds against the calculated Poisson fair probabilities to find value.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Home Odds (1)</span>
                  <span className="text-neutral-500">Fair: {output.fairOdds.home}</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={marketOddsHome}
                  onChange={(e) => setMarketOddsHome(parseFloat(e.target.value) || 1)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white tabular-nums mb-1"
                />
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-neutral-800">
                  <span className="text-neutral-400">EV:</span>
                  <span className={`font-bold ${homeEv > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {homeEv > 0 ? `+${homeEv}%` : `${homeEv}%`}
                  </span>
                </div>
                {homeEv > 0 && (
                  <div className="text-[10px] text-emerald-400 mt-1">
                    Kelly Stake: {calculateKellyStake(output.homeWinProb, marketOddsHome, 0.5)}%
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Draw Odds (X)</span>
                  <span className="text-neutral-500">Fair: {output.fairOdds.draw}</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={marketOddsDraw}
                  onChange={(e) => setMarketOddsDraw(parseFloat(e.target.value) || 1)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white tabular-nums mb-1"
                />
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-neutral-800">
                  <span className="text-neutral-400">EV:</span>
                  <span className={`font-bold ${drawEv > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drawEv > 0 ? `+${drawEv}%` : `${drawEv}%`}
                  </span>
                </div>
                {drawEv > 0 && (
                  <div className="text-[10px] text-emerald-400 mt-1">
                    Kelly Stake: {calculateKellyStake(output.drawProb, marketOddsDraw, 0.5)}%
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Away Odds (2)</span>
                  <span className="text-neutral-500">Fair: {output.fairOdds.away}</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={marketOddsAway}
                  onChange={(e) => setMarketOddsAway(parseFloat(e.target.value) || 1)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white tabular-nums mb-1"
                />
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-neutral-800">
                  <span className="text-neutral-400">EV:</span>
                  <span className={`font-bold ${awayEv > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {awayEv > 0 ? `+${awayEv}%` : `${awayEv}%`}
                  </span>
                </div>
                {awayEv > 0 && (
                  <div className="text-[10px] text-emerald-400 mt-1">
                    Kelly Stake: {calculateKellyStake(output.awayWinProb, marketOddsAway, 0.5)}%
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Over 2.5 Odds</span>
                  <span className="text-neutral-500">Fair: {output.fairOdds.over25}</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={marketOddsOver25}
                  onChange={(e) => setMarketOddsOver25(parseFloat(e.target.value) || 1)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white tabular-nums mb-1"
                />
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-neutral-800">
                  <span className="text-neutral-400">EV:</span>
                  <span className={`font-bold ${over25Ev > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {over25Ev > 0 ? `+${over25Ev}%` : `${over25Ev}%`}
                  </span>
                </div>
                {over25Ev > 0 && (
                  <div className="text-[10px] text-emerald-400 mt-1">
                    Kelly Stake: {calculateKellyStake(output.over25Prob, marketOddsOver25, 0.5)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
