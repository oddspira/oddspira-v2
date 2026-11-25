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

export interface SelectedTeamTarget {
  teamId?: number;
  teamName: string;
  teamLogo?: string;
  leagueId?: number;
  leagueName?: string;
}

export interface SelectedPlayerTarget {
  playerId?: number;
  playerName: string;
  playerPhoto?: string;
  teamId?: number;
  teamName?: string;
  teamLogo?: string;
  leagueId?: number;
  leagueName?: string;
  position?: string;
  number?: number | null;
}

export interface MultiMarketOddsSnapshot {
  ft1x2: {
    home: number;
    draw: number;
    away: number;
  };
  doubleChance: {
    homeDraw: number; // 1X
    homeAway: number; // 12
    drawAway: number; // X2
  };
  goalsOU: {
    over15: number;
    under15: number;
    over25: number;
    under25: number;
    over35: number;
    under35: number;
  };
  firstHalf: {
    home: number;
    draw: number;
    away: number;
    over05: number;
    under05: number;
    over15: number;
    under15: number;
  };
  cornersOU: {
    over85: number;
    under85: number;
    over95: number;
    under95: number;
    over105: number;
    under105: number;
  };
  cardsOU: {
    over35: number;
    under35: number;
    over45: number;
    under45: number;
  };
  btts: {
    yes: number;
    no: number;
  };
}

export interface OddsHistoryEntry {
  id: number;
  recordedAt: number;
  timeLabel: string;
  isLive: boolean;
  isOpening: boolean;
  bookmaker: string;
  markets: MultiMarketOddsSnapshot;
}

export interface DroppingOddsMarketAlert {
  marketGroup: 'ft1x2' | 'doubleChance' | 'goalsOU' | 'firstHalf' | 'cornersOU' | 'cardsOU' | 'btts';
  marketKey: string;
  labelKey: string;
  openingOdds: number;
  currentOdds: number;
  dropPercent: number; // Positive means odds dropped (e.g. +8.4 means -8.4% drop)
  isSteamMove: boolean;
}

export interface BookmakerComparisonRow {
  id: string;
  name: string;
  tier: 'SHARP' | 'EXCHANGE' | 'SOFT';
  payoutPercent: number; // e.g. 97.9%
  marginPercent: number; // e.g. 2.1%
  isDirectFeed: boolean;
  markets: MultiMarketOddsSnapshot;
}

export interface Match {
  id: string;
  leagueId?: number;
  league: string;
  leagueCountry: string;
  leagueRound?: string;
  leagueLogo?: string;
  leagueFlag?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  halftimeScore?: string;
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
  droppingOdds?: {
    marketKey: string;
    labelKey: string;
    openingOdds: number;
    currentOdds: number;
    dropPercent: number;
    isSteamMove: boolean;
    snapshotsCount: number;
  };
  venue?: string;
  referee?: string;
  hasRealStats?: boolean;
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
  fixtureId?: string;
  market: string;
  selection: string;
  odds: number;
  stake: number;
  modelFairProb: number;
  evPercent: number;
  status: 'WON' | 'LOST' | 'PENDING' | 'VOID' | 'CASHOUT';
  pnl: number;
  settledScore?: string;
  autoSettled?: boolean;
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
