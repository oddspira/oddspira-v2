/**
 * Oddspira Quantitative Modeling Library
 * Implements Poisson Distribution, Dixon-Coles Bivariate Adjustment,
 * Multiplicative No-Vig De-margin, Expected Value (EV), and Kelly Criterion.
 */

import { PoissonDistributionOutput } from '../types';

/** Factorial computation with cache */
const factCache: number[] = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];
export function factorial(n: number): number {
  if (n < 0) return 1;
  if (n < factCache.length) return factCache[n];
  let res = factCache[factCache.length - 1];
  for (let i = factCache.length; i <= n; i++) {
    res *= i;
    factCache[i] = res;
  }
  return res;
}

/** Poisson Probability Mass Function: P(k; λ) = (λ^k * e^-λ) / k! */
export function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Dixon-Coles adjustment parameter tau(x, y, lambda, mu, rho)
 * Accounts for interdependence in low-scoring football outcomes (0-0, 1-0, 0-1, 1-1).
 */
export function dixonColesTau(x: number, y: number, lambda: number, mu: number, rho: number = -0.11): number {
  if (x === 0 && y === 0) {
    return 1 - lambda * mu * rho;
  } else if (x === 0 && y === 1) {
    return 1 + lambda * rho;
  } else if (x === 1 && y === 0) {
    return 1 + mu * rho;
  } else if (x === 1 && y === 1) {
    return 1 - rho;
  }
  return 1;
}

/**
 * Calculate 6x6 Bivariate Poisson matrix and composite betting probabilities
 */
export function computePoissonMatrix(
  homeXg: number,
  awayXg: number,
  useDixonColes: boolean = true
): PoissonDistributionOutput {
  const maxGoals = 5;
  const matrix: number[][] = [];
  const rho = -0.11;

  let totalProb = 0;
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let over15Prob = 0;
  let over25Prob = 0;
  let over35Prob = 0;
  let bttsProb = 0;

  const scoreList: { score: string; prob: number }[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    const row: number[] = [];
    for (let a = 0; a <= maxGoals; a++) {
      let p = poissonPMF(h, homeXg) * poissonPMF(a, awayXg);
      if (useDixonColes) {
        const tau = dixonColesTau(h, a, homeXg, awayXg, rho);
        p = Math.max(0, p * tau);
      }
      row.push(p);
      totalProb += p;

      if (h > a) homeWinProb += p;
      else if (h === a) drawProb += p;
      else awayWinProb += p;

      const totalGoals = h + a;
      if (totalGoals > 1.5) over15Prob += p;
      if (totalGoals > 2.5) over25Prob += p;
      if (totalGoals > 3.5) over35Prob += p;
      if (h > 0 && a > 0) bttsProb += p;

      scoreList.push({ score: `${h}-${a}`, prob: p });
    }
    matrix.push(row);
  }

  // Normalize if tail beyond 5 goals cut off
  if (totalProb > 0) {
    homeWinProb /= totalProb;
    drawProb /= totalProb;
    awayWinProb /= totalProb;
    over15Prob /= totalProb;
    over25Prob /= totalProb;
    over35Prob /= totalProb;
    bttsProb /= totalProb;

    for (let r = 0; r <= maxGoals; r++) {
      for (let c = 0; c <= maxGoals; c++) {
        matrix[r][c] = matrix[r][c] / totalProb;
      }
    }
  }

  scoreList.sort((a, b) => b.prob - a.prob);

  const fairOdds = {
    home: homeWinProb > 0 ? Number((1 / homeWinProb).toFixed(2)) : 99,
    draw: drawProb > 0 ? Number((1 / drawProb).toFixed(2)) : 99,
    away: awayWinProb > 0 ? Number((1 / awayWinProb).toFixed(2)) : 99,
    over25: over25Prob > 0 ? Number((1 / over25Prob).toFixed(2)) : 99,
    under25: (1 - over25Prob) > 0 ? Number((1 / (1 - over25Prob)).toFixed(2)) : 99,
    bttsYes: bttsProb > 0 ? Number((1 / bttsProb).toFixed(2)) : 99,
    bttsNo: (1 - bttsProb) > 0 ? Number((1 / (1 - bttsProb)).toFixed(2)) : 99,
  };

  return {
    matrix,
    homeWinProb,
    drawProb,
    awayWinProb,
    over15Prob,
    over25Prob,
    over35Prob,
    bttsProb,
    mostLikelyScores: scoreList.slice(0, 5),
    fairOdds,
  };
}

/** Multiplicative No-Vig Fair Odds (Strip Bookmaker Overround) */
export function removeVig3Way(oddsHome: number, oddsDraw: number, oddsAway: number) {
  const sumInv = (1 / oddsHome) + (1 / oddsDraw) + (1 / oddsAway);
  const marginPercent = (sumInv - 1) * 100;

  const fairProbHome = (1 / oddsHome) / sumInv;
  const fairProbDraw = (1 / oddsDraw) / sumInv;
  const fairProbAway = (1 / oddsAway) / sumInv;

  return {
    marginPercent: Number(marginPercent.toFixed(2)),
    fairProbHome,
    fairProbDraw,
    fairProbAway,
    fairOddsHome: Number((1 / fairProbHome).toFixed(2)),
    fairOddsDraw: Number((1 / fairProbDraw).toFixed(2)),
    fairOddsAway: Number((1 / fairProbAway).toFixed(2)),
  };
}

/** Expected Value (EV %) calculation */
export function calculateExpectedValue(fairProbability: number, bookmakerDecimalOdds: number): number {
  if (fairProbability <= 0 || bookmakerDecimalOdds <= 1) return 0;
  // EV = (P * Odds) - 1
  const ev = (fairProbability * bookmakerDecimalOdds) - 1;
  return Number((ev * 100).toFixed(2));
}

/**
 * Kelly Criterion Staking Formula
 * f* = (b * p - q) / b
 * where b = odds - 1, p = win probability, q = 1 - p
 */
export function calculateKellyStake(
  winProbability: number,
  decimalOdds: number,
  fraction: number = 0.5 // Default Half-Kelly for conservative bankroll preservation
): number {
  if (decimalOdds <= 1 || winProbability <= 0) return 0;
  const b = decimalOdds - 1;
  const p = winProbability;
  const q = 1 - p;

  const fStar = (b * p - q) / b;
  if (fStar <= 0) return 0;

  const adjusted = fStar * fraction;
  // Cap at 15% max stake to protect bankroll
  return Number(Math.min(adjusted * 100, 15).toFixed(2));
}
