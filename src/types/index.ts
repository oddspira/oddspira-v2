export type Language = 'bg' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'fr' | 'tr' | 'pl' | 'el' | 'ro' | 'ru';

export type ActiveTab =
  | 'home'
  | 'live'
  | 'competitions'
  | 'analysis'
  | 'bets'
  | 'tools'
  | 'learn'
  | 'vip'
  | 'matches'
  | 'poisson'
  | 'calculators'
  | 'bankroll'
  | 'architecture';

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
}

export interface MatchFairProbabilities {
  homeProb: number;     // e.g. 0.54 (54%)
  drawProb: number;     // e.g. 0.24 (24%)
  awayProb: number;     // e.g. 0.22 (22%)
  fairHomeOdds: number; // 1 / homeProb
  fairDrawOdds: number;
  fairAwayOdds: number;
  over25Prob: number;
  under25Prob: number;
  bttsProb: number;     // Both teams to score
  expectedGoalsHome: number; // xG
  expectedGoalsAway: number;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'var' | 'corner' | 'shot';
  team: 'home' | 'away';
  description: string;
}

export interface Match {
  id: string;
  league: string;
  leagueCountry: string;
  leagueLogo?: string;
  leagueFlag?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
  minute?: number;
  startTime: string;
  bookmakerOdds: MatchOdds;
  fairOdds: MatchFairProbabilities;
  valueBetDetected?: {
    selection: 'home' | 'draw' | 'away' | 'over25';
    edgePercent: number; // e.g. +7.4%
    evPercent: number;
    recommendedStakeKelly: number;
  };
  venue?: string;
  referee?: string;
  events: MatchEvent[];
  stats: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    cornersHome: number;
    cornersAway: number;
    dangerousAttacksHome: number;
    dangerousAttacksAway: number;
    foulsHome?: number;
    foulsAway?: number;
    yellowCardsHome?: number;
    yellowCardsAway?: number;
    redCardsHome?: number;
    redCardsAway?: number;
    offsidesHome?: number;
    offsidesAway?: number;
    savesHome?: number;
    savesAway?: number;
    passesHome?: number;
    passesAway?: number;
  };
}

export interface BetRecord {
  id: string;
  date: string;
  match: string;
  market: string;
  selection: string;
  odds: number;
  stake: number;
  modelFairProb: number;
  evPercent: number;
  status: 'WON' | 'LOST' | 'PENDING' | 'VOID' | 'CASHOUT';
  pnl: number;
}

export interface PoissonMatrixCell {
  homeGoals: number;
  awayGoals: number;
  probability: number;
}

export interface PoissonDistributionOutput {
  matrix: number[][]; // 6x6 (0 to 5 goals)
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over15Prob: number;
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  mostLikelyScores: { score: string; prob: number }[];
  fairOdds: {
    home: number;
    draw: number;
    away: number;
    over25: number;
    under25: number;
    bttsYes: number;
    bttsNo: number;
  };
}
