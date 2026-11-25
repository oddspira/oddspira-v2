import React, { useEffect, useState } from 'react';
import { ActiveTab, Language, Match } from '../types';
import { computePoissonMatrix } from '../utils/mathModels';
import { TeamBadge, LeagueBadge, openTeamProfile, registerMatchLogos } from './TeamBadge';

export interface FormMatchItem {
  fixtureId?: string | number;
  date?: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  opp: string;
  res: 'W' | 'D' | 'L';
  score: string;
}

export interface StandingRow {
  rank: number;
  teamId?: number;
  club: string;
  clubLogo?: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string | number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
}

interface LiveMatchIntel {
  configured?: boolean;
  found?: boolean;
  fixtureId?: string | number;
  date?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  status?: string;
  halftimeScore?: string;
  league?: string;
  leagueCountry?: string;
  leagueLogo?: string;
  hasRealStats?: boolean;
  hasRealLineups?: boolean;
  leagueRound?: string | null;
  venue?: string | null;
  referee?: string | null;
  liveBookmakerOdds?: {
    home: number;
    draw: number;
    away: number;
  } | null;
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    cornersHome: number;
    cornersAway: number;
    foulsHome: number;
    foulsAway: number;
    yellowCardsHome: number;
    yellowCardsAway: number;
    redCardsHome: number;
    redCardsAway: number;
    offsidesHome: number;
    offsidesAway: number;
    savesHome: number;
    savesAway: number;
    passesHome: number;
    passesAway: number;
    xgHome: number;
    xgAway: number;
  } | null;
  lineups?: {
    homeFormation: string;
    awayFormation: string;
    homeCoach: string;
    awayCoach: string;
    homePlayers: PlayerNode[];
    awayPlayers: PlayerNode[];
  } | null;
  events?: {
    min: string;
    team: 'home' | 'away';
    icon: string;
    title: string;
    sub: string;
    highlight?: boolean;
  }[];
  standings?: StandingRow[];
  homeFormMatches?: FormMatchItem[];
  awayFormMatches?: FormMatchItem[];
  h2h?: {
    homeWins: number;
    draws: number;
    awayWins: number;
    last5: ('W' | 'D' | 'L')[];
    matches: FormMatchItem[];
  } | null;
}

interface MatchDetailPageProps {
  language: Language;
  match: Match;
  allMatches: Match[];
  onBack: () => void;
  onSelectMatch: (match: Match) => void;
  onLogBet: (
    match: Match,
    selection: string,
    odds: number,
    ev: number,
    market?: string,
    stake?: number
  ) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

interface PlayerNode {
  num: number;
  name: string;
  x: number; // 0 to 100 percentage across pitch width
  y: number; // 0 to 100 percentage across pitch height
}

interface MatchMetadata {
  stadium: string;
  attendance: string;
  referee: string;
  weather: string;
  pitch: string;
  homeFormation: string;
  awayFormation: string;
  homeScorerText: string;
  awayScorerText?: string;
  homePlayers: PlayerNode[];
  awayPlayers: PlayerNode[];
  homeFormMatches: FormMatchItem[];
  awayFormMatches: FormMatchItem[];
  h2h: {
    homeWins: number;
    draws: number;
    awayWins: number;
    last5: ('W' | 'D' | 'L')[];
    matches: FormMatchItem[];
  };
}

const DEFAULT_HOME_PLAYERS: PlayerNode[] = [
  { num: 22, name: 'Pope', x: 7, y: 50 },
  { num: 33, name: 'Burn', x: 20, y: 18 },
  { num: 35, name: 'Schär', x: 18, y: 38 },
  { num: 4, name: 'Botman', x: 18, y: 62 },
  { num: 2, name: 'Trippier', x: 20, y: 82 },
  { num: 36, name: 'Longstaff', x: 33, y: 26 },
  { num: 39, name: 'Guimarães', x: 31, y: 50 },
  { num: 7, name: 'Joelinton', x: 33, y: 74 },
  { num: 10, name: 'Gordon', x: 45, y: 22 },
  { num: 14, name: 'Isak', x: 46, y: 50 },
  { num: 24, name: 'Almirón', x: 45, y: 78 },
];

const DEFAULT_AWAY_PLAYERS: PlayerNode[] = [
  { num: 24, name: 'Onana', x: 93, y: 50 },
  { num: 29, name: 'Wan-Bissaka', x: 80, y: 18 },
  { num: 19, name: 'Varane', x: 82, y: 38 },
  { num: 6, name: 'Martínez', x: 82, y: 62 },
  { num: 20, name: 'Dalot', x: 80, y: 82 },
  { num: 8, name: 'Fernandes', x: 67, y: 34 },
  { num: 37, name: 'Mainoo', x: 67, y: 66 },
  { num: 17, name: 'Garnacho', x: 56, y: 20 },
  { num: 11, name: 'Højlund', x: 54, y: 50 },
  { num: 10, name: 'Rashford', x: 56, y: 80 },
];

function buildTeamSpecificPitchNodes(teamName: string, isHome: boolean): PlayerNode[] {
  const shortTag =
    teamName
      .replace(/[^A-Za-zА-Яа-я]/g, '')
      .slice(0, 3)
      .toUpperCase() || (isHome ? 'HOM' : 'AWY');
  const roles = ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'RW', 'ST', 'LW'];
  const nums = [1, 2, 4, 5, 3, 6, 8, 10, 7, 9, 11];
  const homeCoords = [
    { x: 7, y: 50 },
    { x: 20, y: 18 },
    { x: 18, y: 38 },
    { x: 18, y: 62 },
    { x: 20, y: 82 },
    { x: 33, y: 26 },
    { x: 31, y: 50 },
    { x: 33, y: 74 },
    { x: 45, y: 22 },
    { x: 46, y: 50 },
    { x: 45, y: 78 },
  ];
  const awayCoords = [
    { x: 93, y: 50 },
    { x: 80, y: 18 },
    { x: 82, y: 38 },
    { x: 82, y: 62 },
    { x: 80, y: 82 },
    { x: 67, y: 28 },
    { x: 69, y: 50 },
    { x: 67, y: 72 },
    { x: 56, y: 22 },
    { x: 54, y: 50 },
    { x: 56, y: 78 },
  ];
  const coords = isHome ? homeCoords : awayCoords;
  return roles.map((role, idx) => ({
    num: nums[idx],
    name: `${shortTag} ${role}`,
    x: coords[idx].x,
    y: coords[idx].y,
  }));
}

const getMatchMetadata = (match: Match, liveIntel?: LiveMatchIntel | null): MatchMetadata => {
  const id = match.id;
  if (id === 'match-newcastle-manutd') {
    return {
      stadium: "St. James' Park, Newcastle",
      attendance: '52,305',
      referee: 'Anthony Taylor',
      weather: '14°C, Clear',
      pitch: 'Good',
      homeFormation: '4-3-3',
      awayFormation: '4-2-3-1',
      homeScorerText: "A. Gordon 32'",
      homePlayers: DEFAULT_HOME_PLAYERS,
      awayPlayers: DEFAULT_AWAY_PLAYERS,
      homeFormMatches: [
        { date: '10.11.2026', league: match.league, homeTeam: match.homeTeam, awayTeam: 'Brighton', homeScore: 4, awayScore: 1, opp: 'vs Brighton', res: 'W', score: '4-1' },
        { date: '03.11.2026', league: match.league, homeTeam: 'Everton', awayTeam: match.homeTeam, homeScore: 0, awayScore: 1, opp: '@ Everton', res: 'W', score: '1-0' },
        { date: '27.10.2026', league: match.league, homeTeam: match.homeTeam, awayTeam: 'Arsenal', homeScore: 1, awayScore: 1, opp: 'vs Arsenal', res: 'D', score: '1-1' },
        { date: '20.10.2026', league: match.league, homeTeam: 'Spurs', awayTeam: match.homeTeam, homeScore: 2, awayScore: 3, opp: '@ Spurs', res: 'W', score: '3-2' },
        { date: '14.10.2026', league: match.league, homeTeam: match.homeTeam, awayTeam: 'Aston Villa', homeScore: 1, awayScore: 2, opp: 'vs Aston Villa', res: 'L', score: '1-2' },
      ],
      awayFormMatches: [
        { date: '10.11.2026', league: match.league, homeTeam: match.awayTeam, awayTeam: 'Chelsea', homeScore: 2, awayScore: 1, opp: 'vs Chelsea', res: 'W', score: '2-1' },
        { date: '03.11.2026', league: match.league, homeTeam: 'Crystal Palace', awayTeam: match.awayTeam, homeScore: 1, awayScore: 1, opp: '@ Crystal Palace', res: 'D', score: '1-1' },
        { date: '27.10.2026', league: match.league, homeTeam: match.awayTeam, awayTeam: 'Brentford', homeScore: 0, awayScore: 2, opp: 'vs Brentford', res: 'L', score: '0-2' },
        { date: '20.10.2026', league: match.league, homeTeam: 'Burnley', awayTeam: match.awayTeam, homeScore: 1, awayScore: 3, opp: '@ Burnley', res: 'W', score: '3-1' },
        { date: '14.10.2026', league: match.league, homeTeam: match.awayTeam, awayTeam: 'Liverpool', homeScore: 2, awayScore: 2, opp: 'vs Liverpool', res: 'D', score: '2-2' },
      ],
      h2h: {
        homeWins: 9,
        draws: 10,
        awayWins: 15,
        last5: ['D', 'L', 'W', 'D', 'W'],
        matches: [
          { date: '15.05.2026', league: match.league, homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: 1, awayScore: 1, opp: match.awayTeam, res: 'D', score: '1-1' },
          { date: '02.12.2025', league: match.league, homeTeam: match.awayTeam, awayTeam: match.homeTeam, homeScore: 2, awayScore: 0, opp: match.awayTeam, res: 'L', score: '0-2' },
          { date: '01.04.2025', league: match.league, homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: 2, awayScore: 0, opp: match.awayTeam, res: 'W', score: '2-0' },
          { date: '16.10.2024', league: match.league, homeTeam: match.awayTeam, awayTeam: match.homeTeam, homeScore: 0, awayScore: 0, opp: match.awayTeam, res: 'D', score: '0-0' },
          { date: '20.04.2024', league: match.league, homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: 3, awayScore: 1, opp: match.awayTeam, res: 'W', score: '3-1' },
        ],
      },
    };
  }

  const seed = (match.id + match.homeTeam + match.awayTeam)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const refereesPool = [
    'Szymon Marciniak',
    'Clément Turpin',
    'Slavko Vinčić',
    'Daniele Orsato',
    'François Letexier',
    'Jesús Gil Manzano',
    'Felix Zwayer',
    'István Kovács',
    'Георги Кабаков',
    'Michael Oliver',
  ];
  const formationsPool = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '3-4-2-1'];

  const isApiMatch = match.id.startsWith('api-') || /^\d+$/.test(match.id);
  const currentHomeScore = liveIntel?.homeScore ?? match.homeScore;
  const currentAwayScore = liveIntel?.awayScore ?? match.awayScore;

  // Extract real goal scorers from API-Football events or match.events
  const liveHomeGoals = (liveIntel?.events || [])
    .filter((e) => e.icon === '⚽' && e.team === 'home')
    .map((e) => `${e.title.replace('GOAL! ', '')} ${e.min}`);
  const liveAwayGoals = (liveIntel?.events || [])
    .filter((e) => e.icon === '⚽' && e.team === 'away')
    .map((e) => `${e.title.replace('GOAL! ', '')} ${e.min}`);

  const fallbackHomeGoals = match.events
    .filter((e) => e.type === 'goal' && e.team === 'home')
    .map((e) => `${e.description.split('—')[0].trim()} ${e.minute}'`);
  const fallbackAwayGoals = match.events
    .filter((e) => e.type === 'goal' && e.team === 'away')
    .map((e) => `${e.description.split('—')[0].trim()} ${e.minute}'`);

  const homeGoalsList = liveHomeGoals.length > 0 ? liveHomeGoals : fallbackHomeGoals;
  const awayGoalsList = liveAwayGoals.length > 0 ? liveAwayGoals : fallbackAwayGoals;

  const fallbackHomeForm: FormMatchItem[] = [
    {
      date: '09.11.2026',
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: 'Matchday -1',
      homeScore: seed % 2 === 0 ? 2 : 1,
      awayScore: seed % 2 === 0 ? 0 : 1,
      opp: 'Matchday -1',
      res: seed % 2 === 0 ? 'W' : 'D',
      score: seed % 2 === 0 ? '2-0' : '1-1',
    },
    {
      date: '02.11.2026',
      league: match.league,
      homeTeam: 'Matchday -2',
      awayTeam: match.homeTeam,
      homeScore: 1,
      awayScore: 2,
      opp: 'Matchday -2',
      res: 'W',
      score: '2-1',
    },
    {
      date: '26.10.2026',
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: 'Matchday -3',
      homeScore: seed % 3 === 0 ? 0 : 3,
      awayScore: 1,
      opp: 'Matchday -3',
      res: seed % 3 === 0 ? 'L' : 'W',
      score: seed % 3 === 0 ? '0-1' : '3-1',
    },
    {
      date: '19.10.2026',
      league: match.league,
      homeTeam: 'Matchday -4',
      awayTeam: match.homeTeam,
      homeScore: 1,
      awayScore: 1,
      opp: 'Matchday -4',
      res: 'D',
      score: '1-1',
    },
    {
      date: '12.10.2026',
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: 'Matchday -5',
      homeScore: 1,
      awayScore: 0,
      opp: 'Matchday -5',
      res: 'W',
      score: '1-0',
    },
  ];

  const fallbackAwayForm: FormMatchItem[] = [
    {
      date: '09.11.2026',
      league: match.league,
      homeTeam: match.awayTeam,
      awayTeam: 'Matchday -1',
      homeScore: seed % 3 === 0 ? 2 : 1,
      awayScore: seed % 3 === 0 ? 1 : 2,
      opp: 'Matchday -1',
      res: seed % 3 === 0 ? 'W' : 'L',
      score: seed % 3 === 0 ? '2-1' : '1-2',
    },
    {
      date: '02.11.2026',
      league: match.league,
      homeTeam: 'Matchday -2',
      awayTeam: match.awayTeam,
      homeScore: 0,
      awayScore: 0,
      opp: 'Matchday -2',
      res: 'D',
      score: '0-0',
    },
    {
      date: '26.10.2026',
      league: match.league,
      homeTeam: match.awayTeam,
      awayTeam: 'Matchday -3',
      homeScore: 2,
      awayScore: 0,
      opp: 'Matchday -3',
      res: 'W',
      score: '2-0',
    },
    {
      date: '19.10.2026',
      league: match.league,
      homeTeam: 'Matchday -4',
      awayTeam: match.awayTeam,
      homeScore: 2,
      awayScore: seed % 2 === 0 ? 0 : 2,
      opp: 'Matchday -4',
      res: seed % 2 === 0 ? 'L' : 'D',
      score: seed % 2 === 0 ? '0-2' : '2-2',
    },
    {
      date: '12.10.2026',
      league: match.league,
      homeTeam: match.awayTeam,
      awayTeam: 'Matchday -5',
      homeScore: 3,
      awayScore: 1,
      opp: 'Matchday -5',
      res: 'W',
      score: '3-1',
    },
  ];

  return {
    stadium:
      liveIntel?.venue ||
      match.venue ||
      (isApiMatch
        ? `${match.league} · ${match.leagueCountry}`
        : `${match.homeTeam} Stadium, ${match.leagueCountry}`),
    attendance: isApiMatch
      ? ''
      : `${(18 + (seed % 44)).toLocaleString()},${120 + (seed % 850)}`,
    referee:
      liveIntel?.referee ||
      match.referee ||
      (isApiMatch ? '' : refereesPool[seed % refereesPool.length]),
    weather: isApiMatch ? '' : `${12 + (seed % 14)}°C, Clear`,
    pitch: isApiMatch ? '' : seed % 3 === 0 ? 'Good' : 'Excellent',
    homeFormation:
      liveIntel?.lineups?.homeFormation ||
      formationsPool[seed % formationsPool.length],
    awayFormation:
      liveIntel?.lineups?.awayFormation ||
      formationsPool[(seed + 2) % formationsPool.length],
    homeScorerText:
      homeGoalsList.length > 0
        ? homeGoalsList.join(', ')
        : currentHomeScore > 0
        ? `${match.homeTeam} (${currentHomeScore})`
        : '',
    awayScorerText:
      awayGoalsList.length > 0
        ? awayGoalsList.join(', ')
        : currentAwayScore > 0
        ? `${match.awayTeam} (${currentAwayScore})`
        : undefined,
    homePlayers:
      liveIntel?.lineups?.homePlayers && liveIntel.lineups.homePlayers.length > 0
        ? liveIntel.lineups.homePlayers
        : buildTeamSpecificPitchNodes(match.homeTeam, true),
    awayPlayers:
      liveIntel?.lineups?.awayPlayers && liveIntel.lineups.awayPlayers.length > 0
        ? liveIntel.lineups.awayPlayers
        : buildTeamSpecificPitchNodes(match.awayTeam, false),
    homeFormMatches:
      liveIntel?.homeFormMatches && liveIntel.homeFormMatches.length > 0
        ? liveIntel.homeFormMatches
        : isApiMatch
        ? []
        : fallbackHomeForm,
    awayFormMatches:
      liveIntel?.awayFormMatches && liveIntel.awayFormMatches.length > 0
        ? liveIntel.awayFormMatches
        : isApiMatch
        ? []
        : fallbackAwayForm,
    h2h:
      liveIntel?.h2h
        ? {
            homeWins: liveIntel.h2h.homeWins,
            draws: liveIntel.h2h.draws,
            awayWins: liveIntel.h2h.awayWins,
            last5:
              liveIntel.h2h.last5 && liveIntel.h2h.last5.length > 0
                ? liveIntel.h2h.last5
                : (liveIntel.h2h.matches || []).map((m) => m.res),
            matches: liveIntel.h2h.matches || [],
          }
        : isApiMatch
        ? { homeWins: 0, draws: 0, awayWins: 0, last5: [], matches: [] }
        : {
            homeWins: 3 + (seed % 9),
            draws: 2 + ((seed * 3) % 6),
            awayWins: 2 + ((seed * 7) % 8),
            last5: [
              seed % 2 === 0 ? 'W' : 'D',
              'W',
              seed % 3 === 0 ? 'L' : 'D',
              'W',
              seed % 2 === 0 ? 'L' : 'W',
            ],
            matches: [],
          },
  };
};

const DICT = {
  bg: {
    homeBreadcrumb: 'Начало',
    backBtn: '← Назад към мачовете',
    matchweek: 'Кръг 37',
    referee: 'Съдия',
    weather: 'Време',
    pitch: 'Терен',
    topMarkets: 'Топ пазари',
    compareOdds: 'Сравни коефициенти ›',
    valueDetected: 'Открита +EV Стойност',
    tabOverview: 'Преглед',
    tabStats: 'Статистика',
    tabTimeline: 'Хронология',
    tabLineups: 'Състави',
    tabH2H: 'Директни (H2H)',
    tabOdds: 'Коефициенти',
    tabPredictions: 'Poisson Прогнози',
    matchOverview: 'Преглед на мача',
    liveBadge: 'На живо',
    scheduledBadge: 'Предстоящ',
    possession: 'Владеене',
    shots: 'Удари',
    shotsOnTarget: 'Точни удари',
    corners: 'Корнери',
    fouls: 'Фалове',
    yellowCards: 'Жълти картони',
    redCards: 'Червени картони',
    momentum: 'Моментум',
    last5MinPos: 'Владеене (посл. 5 мин)',
    timeline: 'Хронология',
    viewFullTimeline: 'Виж пълната хронология ›',
    bettingInsights: 'Количествен Анализ (+EV)',
    howItWorks: 'Как работи',
    valueAngle: 'Математически Value Сигнал',
    marketOdds: 'Пазарен Коеф.',
    fairOdds: 'Справедлив Коеф.',
    edge: 'Предимство (Edge)',
    confidence: 'Сигурност',
    high: 'Висока',
    bestMarket: 'Най-добър пазар',
    projectedProb: 'Моделна вероятност',
    recStake: 'Препоръчителен залог',
    ofBankroll: 'от банката',
    addToBetSlip: 'Добави в Моите залози',
    trackMatch: 'Следи този мач',
    trackingActive: 'Мачът се следи активно',
    lineups: 'Стартови състави',
    viewFullLineups: 'Виж пълните състави ›',
    formTitle: 'Форма (Последни 5)',
    h2hTitle: 'Директни двубои (Head to Head)',
    wins: 'Победи',
    draws: 'Равенства',
    last5Meetings: 'Последни 5 срещи',
    viewAllMarkets: 'Всички пазари ›',
    fullTimeResult: 'Краен резултат (1X2)',
    doubleChance: 'Двоен шанс',
    btts: 'Двата отбора да отбележат',
    overUnder25: 'Голове Над/Под 2.5',
    asianHandicap: 'Азиатски хендикап',
    relatedFixtures: 'Свързани мачове на живо',
    viewAllLive: 'Всички на живо ›',
    trust1Title: 'Данни в реално време',
    trust1Sub: 'Свръхбързо обновяване',
    trust2Title: 'Разширена аналитика',
    trust2Sub: 'xG, моментум и Poisson',
    trust3Title: 'Персонални аларми',
    trust3Sub: 'Не изпускайте +EV стойност',
    trust4Title: '100% Професионални модели',
    trust4Sub: 'Без скрити такси',
  },
  en: {
    homeBreadcrumb: 'Home',
    backBtn: '← Back to Matches',
    matchweek: 'Matchweek 37',
    referee: 'Referee',
    weather: 'Weather',
    pitch: 'Pitch',
    topMarkets: 'Top Markets',
    compareOdds: 'Compare odds ›',
    valueDetected: 'Value Detected',
    tabOverview: 'Overview',
    tabStats: 'Stats',
    tabTimeline: 'Timeline',
    tabLineups: 'Lineups',
    tabH2H: 'H2H',
    tabOdds: 'Odds',
    tabPredictions: 'Predictions',
    matchOverview: 'Match Overview',
    liveBadge: 'Live',
    scheduledBadge: 'Upcoming',
    possession: 'Possession',
    shots: 'Shots',
    shotsOnTarget: 'Shots on target',
    corners: 'Corners',
    fouls: 'Fouls',
    yellowCards: 'Yellow Cards',
    redCards: 'Red Cards',
    momentum: 'Momentum',
    last5MinPos: 'Last 5 Min. Possession',
    timeline: 'Timeline',
    viewFullTimeline: 'View full timeline ›',
    bettingInsights: 'Betting Insights',
    howItWorks: 'How it works',
    valueAngle: 'Value Angle',
    marketOdds: 'Market Odds',
    fairOdds: 'Fair Odds',
    edge: 'Edge',
    confidence: 'Confidence',
    high: 'High',
    bestMarket: 'Best Market',
    projectedProb: 'Projected Probability',
    recStake: 'Recommended Stake',
    ofBankroll: 'of bankroll',
    addToBetSlip: 'Add to Bet Slip',
    trackMatch: 'Track This Match',
    trackingActive: 'Tracking This Match',
    lineups: 'Lineups',
    viewFullLineups: 'View full lineups ›',
    formTitle: 'Form',
    h2hTitle: 'Head to Head',
    wins: 'Wins',
    draws: 'Draws',
    last5Meetings: 'Last 5 meetings',
    viewAllMarkets: 'View all markets ›',
    fullTimeResult: 'Full Time Result',
    doubleChance: 'Double Chance',
    btts: 'Both Teams to Score',
    overUnder25: 'Over/Under 2.5',
    asianHandicap: 'Asian Handicap',
    relatedFixtures: 'Related Fixtures',
    viewAllLive: 'View all live ›',
    trust1Title: 'Real-time data',
    trust1Sub: 'Ultra-fast updates',
    trust2Title: 'Advanced analytics',
    trust2Sub: 'xG, momentum & more',
    trust3Title: 'Custom alerts',
    trust3Sub: 'Never miss value',
    trust4Title: '100% Free tools',
    trust4Sub: 'No hidden fees',
  },
  es: {
    homeBreadcrumb: 'Inicio',
    backBtn: '← Volver a Partidos',
    matchweek: 'Jornada 37',
    referee: 'Árbitro',
    weather: 'Clima',
    pitch: 'Campo',
    topMarkets: 'Mercados Principales',
    compareOdds: 'Comparar cuotas ›',
    valueDetected: 'Valor Detectado',
    tabOverview: 'Resumen',
    tabStats: 'Estadísticas',
    tabTimeline: 'Cronología',
    tabLineups: 'Alineaciones',
    tabH2H: 'H2H',
    tabOdds: 'Cuotas',
    tabPredictions: 'Predicciones',
    matchOverview: 'Resumen del Partido',
    liveBadge: 'En Vivo',
    scheduledBadge: 'Próximo',
    possession: 'Posesión',
    shots: 'Tiros',
    shotsOnTarget: 'Tiros a puerta',
    corners: 'Córners',
    fouls: 'Faltas',
    yellowCards: 'Tarjetas Amarillas',
    redCards: 'Tarjetas Rojas',
    momentum: 'Momentum',
    last5MinPos: 'Posesión Últ. 5 Min',
    timeline: 'Cronología',
    viewFullTimeline: 'Ver cronología completa ›',
    bettingInsights: 'Insights de Apuestas',
    howItWorks: 'Cómo funciona',
    valueAngle: 'Ángulo de Valor',
    marketOdds: 'Cuota Mercado',
    fairOdds: 'Cuota Justa',
    edge: 'Ventaja',
    confidence: 'Confianza',
    high: 'Alta',
    bestMarket: 'Mejor Mercado',
    projectedProb: 'Probabilidad Proyectada',
    recStake: 'Stake Recomendado',
    ofBankroll: 'de la banca',
    addToBetSlip: 'Añadir a Mis Apuestas',
    trackMatch: 'Seguir este Partido',
    trackingActive: 'Siguiendo Partido',
    lineups: 'Alineaciones',
    viewFullLineups: 'Ver alineaciones completas ›',
    formTitle: 'Forma',
    h2hTitle: 'Cara a Cara (H2H)',
    wins: 'Victorias',
    draws: 'Empates',
    last5Meetings: 'Últimos 5 duelos',
    viewAllMarkets: 'Ver todos los mercados ›',
    fullTimeResult: 'Resultado Final',
    doubleChance: 'Doble Oportunidad',
    btts: 'Ambos Equipos Marcan',
    overUnder25: 'Más/Menos 2.5',
    asianHandicap: 'Hándicap Asiático',
    relatedFixtures: 'Partidos Relacionados',
    viewAllLive: 'Ver todos en vivo ›',
    trust1Title: 'Datos en tiempo real',
    trust1Sub: 'Actualizaciones ultrarrápidas',
    trust2Title: 'Analítica avanzada',
    trust2Sub: 'xG, momentum y más',
    trust3Title: 'Alertas personalizadas',
    trust3Sub: 'Nunca pierdas valor',
    trust4Title: 'Herramientas 100% gratis',
    trust4Sub: 'Sin cargos ocultos',
  },
  de: {
    homeBreadcrumb: 'Start',
    backBtn: '← Zurück zu den Spielen',
    matchweek: 'Spieltag 37',
    referee: 'Schiedsrichter',
    weather: 'Wetter',
    pitch: 'Rasen',
    topMarkets: 'Top-Märkte',
    compareOdds: 'Quoten vergleichen ›',
    valueDetected: 'Value Erkannt',
    tabOverview: 'Übersicht',
    tabStats: 'Statistik',
    tabTimeline: 'Spielfilm',
    tabLineups: 'Aufstellungen',
    tabH2H: 'H2H',
    tabOdds: 'Quoten',
    tabPredictions: 'Prognosen',
    matchOverview: 'Spielübersicht',
    liveBadge: 'Live',
    scheduledBadge: 'Anstehend',
    possession: 'Ballbesitz',
    shots: 'Schüsse',
    shotsOnTarget: 'Schüsse aufs Tor',
    corners: 'Ecken',
    fouls: 'Fouls',
    yellowCards: 'Gelbe Karten',
    redCards: 'Rote Karten',
    momentum: 'Momentum',
    last5MinPos: 'Ballbesitz letzte 5 Min.',
    timeline: 'Spielfilm',
    viewFullTimeline: 'Kompletten Spielfilm ansehen ›',
    bettingInsights: 'Wett-Insights',
    howItWorks: 'Wie es funktioniert',
    valueAngle: 'Value-Signal',
    marketOdds: 'Marktquote',
    fairOdds: 'Faire Quote',
    edge: 'Vorteil (Edge)',
    confidence: 'Konfidenz',
    high: 'Hoch',
    bestMarket: 'Bester Markt',
    projectedProb: 'Modell-Wahrscheinlichkeit',
    recStake: 'Empfohlener Einsatz',
    ofBankroll: 'der Bankroll',
    addToBetSlip: 'Zu Meine Wetten hinzufügen',
    trackMatch: 'Spiel verfolgen',
    trackingActive: 'Spiel wird verfolgt',
    lineups: 'Aufstellungen',
    viewFullLineups: 'Komplette Aufstellungen ›',
    formTitle: 'Form',
    h2hTitle: 'Direkter Vergleich (H2H)',
    wins: 'Siege',
    draws: 'Remis',
    last5Meetings: 'Letzte 5 Duelle',
    viewAllMarkets: 'Alle Märkte ›',
    fullTimeResult: 'Endergebnis (1X2)',
    doubleChance: 'Doppelte Chance',
    btts: 'Beide Teams treffen',
    overUnder25: 'Über/Unter 2.5',
    asianHandicap: 'Asian Handicap',
    relatedFixtures: 'Ähnliche Live-Spiele',
    viewAllLive: 'Alle Live-Spiele ›',
    trust1Title: 'Echtzeit-Daten',
    trust1Sub: 'Ultraschnelle Updates',
    trust2Title: 'Erweiterte Analytik',
    trust2Sub: 'xG, Momentum & mehr',
    trust3Title: 'Eigene Alarme',
    trust3Sub: 'Nie wieder Value verpassen',
    trust4Title: '100% Kostenlose Tools',
    trust4Sub: 'Keine versteckten Gebühren',
  },
  it: {
    homeBreadcrumb: 'Home',
    backBtn: '← Torna alle Partite',
    matchweek: 'Giornata 37',
    referee: 'Arbitro',
    weather: 'Meteo',
    pitch: 'Campo',
    topMarkets: 'Mercati Principali',
    compareOdds: 'Confronta quote ›',
    valueDetected: 'Valore +EV Rilevato',
    tabOverview: 'Panoramica',
    tabStats: 'Statistiche',
    tabTimeline: 'Cronologia',
    tabLineups: 'Formazioni',
    tabH2H: 'H2H',
    tabOdds: 'Quote',
    tabPredictions: 'Pronostici',
    matchOverview: 'Panoramica Partita',
    liveBadge: 'Live',
    scheduledBadge: 'In Programma',
    possession: 'Possesso',
    shots: 'Tiri',
    shotsOnTarget: 'Tiri in porta',
    corners: 'Corner',
    fouls: 'Falli',
    yellowCards: 'Cartellini Gialli',
    redCards: 'Cartellini Rossi',
    momentum: 'Momentum',
    last5MinPos: 'Possesso Ult. 5 Min.',
    timeline: 'Cronologia',
    viewFullTimeline: 'Vedi cronologia completa ›',
    bettingInsights: 'Analisi Quantitativa (+EV)',
    howItWorks: 'Come funziona',
    valueAngle: 'Segnale di Valore',
    marketOdds: 'Quota Mercato',
    fairOdds: 'Quota Equa',
    edge: 'Vantaggio (Edge)',
    confidence: 'Fiducia',
    high: 'Alta',
    bestMarket: 'Miglior Mercato',
    projectedProb: 'Probabilità Stimata',
    recStake: 'Puntata Consigliata',
    ofBankroll: 'del bankroll',
    addToBetSlip: 'Aggiungi alle Mie Scommesse',
    trackMatch: 'Segui Partita',
    trackingActive: 'Partita Seguita',
    lineups: 'Formazioni',
    viewFullLineups: 'Vedi formazioni complete ›',
    formTitle: 'Forma',
    h2hTitle: 'Scontri Diretti (H2H)',
    wins: 'Vittorie',
    draws: 'Pareggi',
    last5Meetings: 'Ultimi 5 incontri',
    viewAllMarkets: 'Vedi tutti i mercati ›',
    fullTimeResult: 'Risultato Finale (1X2)',
    doubleChance: 'Doppia Chance',
    btts: 'Entrambe le Squadre Segnano',
    overUnder25: 'Over/Under 2.5',
    asianHandicap: 'Handicap Asiatico',
    relatedFixtures: 'Partite Correlate',
    viewAllLive: 'Vedi tutte live ›',
    trust1Title: 'Dati in tempo reale',
    trust1Sub: 'Aggiornamenti ultraveloci',
    trust2Title: 'Analitica avanzata',
    trust2Sub: 'xG, momentum e altro',
    trust3Title: 'Avvisi personalizzati',
    trust3Sub: 'Non perdere mai valore',
    trust4Title: 'Strumenti 100% gratuiti',
    trust4Sub: 'Nessun costo nascosto',
  },
  pt: {
    homeBreadcrumb: 'Início',
    backBtn: '← Voltar aos Jogos',
    matchweek: 'Rodada 37',
    referee: 'Árbitro',
    weather: 'Clima',
    pitch: 'Gramado',
    topMarkets: 'Principais Mercados',
    compareOdds: 'Comparar odds ›',
    valueDetected: 'Valor +EV Detectado',
    tabOverview: 'Resumo',
    tabStats: 'Estatísticas',
    tabTimeline: 'Cronologia',
    tabLineups: 'Escalações',
    tabH2H: 'H2H',
    tabOdds: 'Odds',
    tabPredictions: 'Previsões',
    matchOverview: 'Resumo da Partida',
    liveBadge: 'Ao Vivo',
    scheduledBadge: 'Agendado',
    possession: 'Posse de bola',
    shots: 'Finalizações',
    shotsOnTarget: 'Chutes no gol',
    corners: 'Escanteios',
    fouls: 'Faltas',
    yellowCards: 'Cartões Amarelos',
    redCards: 'Cartões Vermelhos',
    momentum: 'Momentum',
    last5MinPos: 'Posse Últ. 5 Min.',
    timeline: 'Cronologia',
    viewFullTimeline: 'Ver cronologia completa ›',
    bettingInsights: 'Insights de Apostas (+EV)',
    howItWorks: 'Como funciona',
    valueAngle: 'Sinal de Valor',
    marketOdds: 'Odd de Mercado',
    fairOdds: 'Odd Justa',
    edge: 'Vantagem (Edge)',
    confidence: 'Confiança',
    high: 'Alta',
    bestMarket: 'Melhor Mercado',
    projectedProb: 'Probabilidade Projetada',
    recStake: 'Stake Recomendada',
    ofBankroll: 'da banca',
    addToBetSlip: 'Adicionar às Minhas Apostas',
    trackMatch: 'Seguir esta Partida',
    trackingActive: 'Seguindo Partida',
    lineups: 'Escalações',
    viewFullLineups: 'Ver escalações completas ›',
    formTitle: 'Forma',
    h2hTitle: 'Confronto Direto (H2H)',
    wins: 'Vitórias',
    draws: 'Empates',
    last5Meetings: 'Últimos 5 confrontos',
    viewAllMarkets: 'Ver todos os mercados ›',
    fullTimeResult: 'Resultado Final (1X2)',
    doubleChance: 'Dupla Chance',
    btts: 'Ambas Marcam',
    overUnder25: 'Mais/Menos 2.5',
    asianHandicap: 'Handicap Asiático',
    relatedFixtures: 'Partidas Relacionadas',
    viewAllLive: 'Ver todas ao vivo ›',
    trust1Title: 'Dados em tempo real',
    trust1Sub: 'Atualizações ultrarrápidas',
    trust2Title: 'Análise avançada',
    trust2Sub: 'xG, momentum e mais',
    trust3Title: 'Alertas personalizados',
    trust3Sub: 'Nunca perca valor',
    trust4Title: 'Ferramentas 100% grátis',
    trust4Sub: 'Sem taxas ocultas',
  },
  fr: {
    homeBreadcrumb: 'Accueil',
    backBtn: '← Retour aux Matchs',
    matchweek: 'Journée 37',
    referee: 'Arbitre',
    weather: 'Météo',
    pitch: 'Pelouse',
    topMarkets: 'Marchés Principaux',
    compareOdds: 'Comparer les cotes ›',
    valueDetected: 'Valeur +EV Détectée',
    tabOverview: 'Aperçu',
    tabStats: 'Statistiques',
    tabTimeline: 'Chronologie',
    tabLineups: 'Compositions',
    tabH2H: 'H2H',
    tabOdds: 'Cotes',
    tabPredictions: 'Prédictions',
    matchOverview: 'Aperçu du Match',
    liveBadge: 'En Direct',
    scheduledBadge: 'À venir',
    possession: 'Possession',
    shots: 'Tirs',
    shotsOnTarget: 'Tirs cadrés',
    corners: 'Corners',
    fouls: 'Fautes',
    yellowCards: 'Cartons Jaunes',
    redCards: 'Cartons Rouges',
    momentum: 'Momentum',
    last5MinPos: 'Possession 5 Dern. Min.',
    timeline: 'Chronologie',
    viewFullTimeline: 'Voir toute la chronologie ›',
    bettingInsights: 'Analyses Quantitatives (+EV)',
    howItWorks: 'Comment ça marche',
    valueAngle: 'Signal de Valeur',
    marketOdds: 'Cote Marché',
    fairOdds: 'Cote Juste',
    edge: 'Avantage (Edge)',
    confidence: 'Confiance',
    high: 'Élevée',
    bestMarket: 'Meilleur Marché',
    projectedProb: 'Probabilité Projetée',
    recStake: 'Mise Recommandée',
    ofBankroll: 'de la bankroll',
    addToBetSlip: 'Ajouter à Mes Paris',
    trackMatch: 'Suivre ce Match',
    trackingActive: 'Match Suivi',
    lineups: 'Compositions',
    viewFullLineups: 'Voir les compositions ›',
    formTitle: 'Forme',
    h2hTitle: 'Confrontations Directes (H2H)',
    wins: 'Victoires',
    draws: 'Nuls',
    last5Meetings: '5 dernières rencontres',
    viewAllMarkets: 'Voir tous les marchés ›',
    fullTimeResult: 'Résultat Final (1X2)',
    doubleChance: 'Double Chance',
    btts: 'Les Deux Équipes Marquent',
    overUnder25: 'Plus/Moins 2.5',
    asianHandicap: 'Handicap Asiatique',
    relatedFixtures: 'Matchs Similaires',
    viewAllLive: 'Voir tout le direct ›',
    trust1Title: 'Données en temps réel',
    trust1Sub: 'Mises à jour ultra-rapides',
    trust2Title: 'Analytique avancée',
    trust2Sub: 'xG, momentum et plus',
    trust3Title: 'Alertes personnalisées',
    trust3Sub: 'Ne manquez aucune valeur',
    trust4Title: 'Outils 100% gratuits',
    trust4Sub: 'Aucun frais caché',
  },
  tr: {
    homeBreadcrumb: 'Ana Sayfa',
    backBtn: '← Maçlara Dön',
    matchweek: '37. Hafta',
    referee: 'Hakem',
    weather: 'Hava',
    pitch: 'Saha',
    topMarkets: 'Popüler Marketler',
    compareOdds: 'Oranları karşılaştır ›',
    valueDetected: '+EV Değer Tespit Edildi',
    tabOverview: 'Özet',
    tabStats: 'İstatistikler',
    tabTimeline: 'Dakika Dakika',
    tabLineups: 'Kadrolar',
    tabH2H: 'H2H',
    tabOdds: 'Oranlar',
    tabPredictions: 'Tahminler',
    matchOverview: 'Maç Özeti',
    liveBadge: 'Canlı',
    scheduledBadge: 'Yaklaşan',
    possession: 'Topla Oynama',
    shots: 'Şutlar',
    shotsOnTarget: 'İsabetli Şut',
    corners: 'Kornerler',
    fouls: 'Fauller',
    yellowCards: 'Sarı Kartlar',
    redCards: 'Kırmızı Kartlar',
    momentum: 'Momentum',
    last5MinPos: 'Son 5 Dk. Topla Oynama',
    timeline: 'Dakika Dakika',
    viewFullTimeline: 'Tüm akışı gör ›',
    bettingInsights: 'Kantitatif Analiz (+EV)',
    howItWorks: 'Nasıl çalışır',
    valueAngle: 'Değer Sinyali',
    marketOdds: 'Piyasa Oranı',
    fairOdds: 'Adil Oran',
    edge: 'Avantaj (Edge)',
    confidence: 'Güven',
    high: 'Yüksek',
    bestMarket: 'En İyi Market',
    projectedProb: 'Tahmini Olasılık',
    recStake: 'Önerilen Miktar',
    ofBankroll: 'kasa oranı',
    addToBetSlip: 'Bahislerime Ekle',
    trackMatch: 'Bu Maçı Takip Et',
    trackingActive: 'Maç Takip Ediliyor',
    lineups: 'Kadrolar',
    viewFullLineups: 'Tüm kadroları gör ›',
    formTitle: 'Form',
    h2hTitle: 'Karşılıklı Maçlar (H2H)',
    wins: 'Galibiyet',
    draws: 'Beraberlik',
    last5Meetings: 'Son 5 karşılaşma',
    viewAllMarkets: 'Tüm marketleri gör ›',
    fullTimeResult: 'Maç Sonucu (1X2)',
    doubleChance: 'Çifte Şans',
    btts: 'Karşılıklı Gol',
    overUnder25: 'Alt/Üst 2.5',
    asianHandicap: 'Asya Handikap',
    relatedFixtures: 'İlgili Maçlar',
    viewAllLive: 'Tüm canlı maçlar ›',
    trust1Title: 'Gerçek zamanlı veri',
    trust1Sub: 'Ultra hızlı güncellemeler',
    trust2Title: 'Gelişmiş analitik',
    trust2Sub: 'xG, momentum ve fazlası',
    trust3Title: 'Özel bildirimler',
    trust3Sub: 'Değeri asla kaçırmayın',
    trust4Title: '%100 Ücretsiz araçlar',
    trust4Sub: 'Gizli ücret yok',
  },
  pl: {
    homeBreadcrumb: 'Start',
    backBtn: '← Powrót do Meczów',
    matchweek: 'Kolejka 37',
    referee: 'Sędzia',
    weather: 'Pogoda',
    pitch: 'Murawa',
    topMarkets: 'Główne Rynki',
    compareOdds: 'Porównaj kursy ›',
    valueDetected: 'Wykryto Wartość +EV',
    tabOverview: 'Przegląd',
    tabStats: 'Statystyki',
    tabTimeline: 'Oś czasu',
    tabLineups: 'Składy',
    tabH2H: 'H2H',
    tabOdds: 'Kursy',
    tabPredictions: 'Prognozy',
    matchOverview: 'Przegląd Meczu',
    liveBadge: 'Na Żywo',
    scheduledBadge: 'Nadchodzący',
    possession: 'Posiadanie piłki',
    shots: 'Strzały',
    shotsOnTarget: 'Strzały celne',
    corners: 'Rzuty rożne',
    fouls: 'Faule',
    yellowCards: 'Żółte Kartki',
    redCards: 'Czerwone Kartki',
    momentum: 'Momentum',
    last5MinPos: 'Posiadanie ost. 5 min.',
    timeline: 'Oś czasu',
    viewFullTimeline: 'Zobacz pełną oś czasu ›',
    bettingInsights: 'Analiza Ilościowa (+EV)',
    howItWorks: 'Jak to działa',
    valueAngle: 'Sygnał Value',
    marketOdds: 'Kurs Rynkowy',
    fairOdds: 'Sprawiedliwy Kurs',
    edge: 'Przewaga (Edge)',
    confidence: 'Pewność',
    high: 'Wysoka',
    bestMarket: 'Najlepszy Rynek',
    projectedProb: 'Szacowane Prawdopodobieństwo',
    recStake: 'Zalecana Stawka',
    ofBankroll: 'budżetu',
    addToBetSlip: 'Dodaj do Moich Zakładów',
    trackMatch: 'Śledź ten Mecz',
    trackingActive: 'Mecz Śledzony',
    lineups: 'Składy',
    viewFullLineups: 'Zobacz pełne składy ›',
    formTitle: 'Forma',
    h2hTitle: 'Mecze Bezpośrednie (H2H)',
    wins: 'Wygrane',
    draws: 'Remisy',
    last5Meetings: 'Ostatnie 5 spotkań',
    viewAllMarkets: 'Zobacz wszystkie rynki ›',
    fullTimeResult: 'Wynik Końcowy (1X2)',
    doubleChance: 'Podwójna Szansa',
    btts: 'Obie Drużyny Strzelą',
    overUnder25: 'Powyżej/Poniżej 2.5',
    asianHandicap: 'Handicap Azjatycki',
    relatedFixtures: 'Powiązane Mecze',
    viewAllLive: 'Wszystkie na żywo ›',
    trust1Title: 'Dane w czasie rzeczywistym',
    trust1Sub: 'Ultraszybkie aktualizacje',
    trust2Title: 'Zaawansowana analityka',
    trust2Sub: 'xG, momentum i więcej',
    trust3Title: 'Własne alerty',
    trust3Sub: 'Nigdy nie przegap value',
    trust4Title: 'W 100% darmowe narzędzia',
    trust4Sub: 'Brak ukrytych opłat',
  },
  el: {
    homeBreadcrumb: 'Αρχική',
    backBtn: '← Πίσω στους Αγώνες',
    matchweek: 'Αγωνιστική 37',
    referee: 'Διαιτητής',
    weather: 'Καιρός',
    pitch: 'Γήπεδο',
    topMarkets: 'Κορυφαίες Αγορές',
    compareOdds: 'Σύγκριση αποδόσεων ›',
    valueDetected: 'Εντοπίστηκε Αξία +EV',
    tabOverview: 'Επισκόπηση',
    tabStats: 'Στατιστικά',
    tabTimeline: 'Ροή Αγώνα',
    tabLineups: 'Ενδεκάδες',
    tabH2H: 'H2H',
    tabOdds: 'Αποδόσεις',
    tabPredictions: 'Προβλέψεις',
    matchOverview: 'Επισκόπηση Αγώνα',
    liveBadge: 'Live',
    scheduledBadge: 'Προσεχής',
    possession: 'Κατοχή',
    shots: 'Σουτ',
    shotsOnTarget: 'Σουτ στην εστία',
    corners: 'Κόρνερ',
    fouls: 'Φάουλ',
    yellowCards: 'Κίτρινες Κάρτες',
    redCards: 'Κόκκινες Κάρτες',
    momentum: 'Μομέντουμ',
    last5MinPos: 'Κατοχή Τελ. 5 Λεπτών',
    timeline: 'Ροή Αγώνα',
    viewFullTimeline: 'Πλήρης ροή αγώνα ›',
    bettingInsights: 'Ποσοτική Ανάλυση (+EV)',
    howItWorks: 'Πώς λειτουργεί',
    valueAngle: 'Σήμα Αξίας',
    marketOdds: 'Απόδοση Αγοράς',
    fairOdds: 'Δίκαιη Απόδοση',
    edge: 'Πλεονέκτημα (Edge)',
    confidence: 'Εμπιστοσύνη',
    high: 'Υψηλή',
    bestMarket: 'Καλύτερη Αγορά',
    projectedProb: 'Εκτιμώμενη Πιθανότητα',
    recStake: 'Προτεινόμενο Ποντάρισμα',
    ofBankroll: 'της κάβας',
    addToBetSlip: 'Προσθήκη στα Στοιχήματά μου',
    trackMatch: 'Παρακολούθηση Αγώνα',
    trackingActive: 'Ο Αγώνας Παρακολουθείται',
    lineups: 'Ενδεκάδες',
    viewFullLineups: 'Πλήρεις ενδεκάδες ›',
    formTitle: 'Φόρμα',
    h2hTitle: 'Προϊστορία (H2H)',
    wins: 'Νίκες',
    draws: 'Ισοπαλίες',
    last5Meetings: 'Τελευταίες 5 αναμετρήσεις',
    viewAllMarkets: 'Όλες οι αγορές ›',
    fullTimeResult: 'Τελικό Αποτέλεσμα (1Χ2)',
    doubleChance: 'Διπλή Ευκαιρία',
    btts: 'Goal / Goal',
    overUnder25: 'Over/Under 2.5',
    asianHandicap: 'Ασιατικό Χάντικαπ',
    relatedFixtures: 'Σχετικοί Αγώνες',
    viewAllLive: 'Όλοι οι live αγώνες ›',
    trust1Title: 'Δεδομένα σε πραγματικό χρόνο',
    trust1Sub: 'Υπερταχείες ενημερώσεις',
    trust2Title: 'Προηγμένη αναλυτική',
    trust2Sub: 'xG, μομέντουμ & άλλα',
    trust3Title: 'Προσωπικές ειδοποιήσεις',
    trust3Sub: 'Μη χάσετε ποτέ αξία',
    trust4Title: '100% Δωρεάν εργαλεία',
    trust4Sub: 'Χωρίς κρυφές χρεώσεις',
  },
  ro: {
    homeBreadcrumb: 'Acasă',
    backBtn: '← Înapoi la Meciuri',
    matchweek: 'Etapa 37',
    referee: 'Arbitru',
    weather: 'Vreme',
    pitch: 'Teren',
    topMarkets: 'Piețe Principale',
    compareOdds: 'Compară cotele ›',
    valueDetected: 'Valoare +EV Detectată',
    tabOverview: 'Prezentare',
    tabStats: 'Statistici',
    tabTimeline: 'Cronologie',
    tabLineups: 'Echipe',
    tabH2H: 'H2H',
    tabOdds: 'Cote',
    tabPredictions: 'Predicții',
    matchOverview: 'Prezentare Meci',
    liveBadge: 'Live',
    scheduledBadge: 'Programat',
    possession: 'Posesie',
    shots: 'Șuturi',
    shotsOnTarget: 'Șuturi pe poartă',
    corners: 'Cornere',
    fouls: 'Faulturi',
    yellowCards: 'Cartonașe Galbene',
    redCards: 'Cartonașe Roșii',
    momentum: 'Momentum',
    last5MinPos: 'Posesie Ult. 5 Min.',
    timeline: 'Cronologie',
    viewFullTimeline: 'Vezi cronologia completă ›',
    bettingInsights: 'Analiză Cantitativă (+EV)',
    howItWorks: 'Cum funcționează',
    valueAngle: 'Semnal de Valoare',
    marketOdds: 'Cotă Piață',
    fairOdds: 'Cotă Corectă',
    edge: 'Avantaj (Edge)',
    confidence: 'Încredere',
    high: 'Ridicată',
    bestMarket: 'Cea Mai Bună Piață',
    projectedProb: 'Probabilitate Estimată',
    recStake: 'Miză Recomandată',
    ofBankroll: 'din bancă',
    addToBetSlip: 'Adaugă la Pariurile Mele',
    trackMatch: 'Urmărește Meciul',
    trackingActive: 'Meci Urmărit',
    lineups: 'Echipe de Start',
    viewFullLineups: 'Vezi echipele complete ›',
    formTitle: 'Formă',
    h2hTitle: 'Meciuri Directe (H2H)',
    wins: 'Victorii',
    draws: 'Egaluri',
    last5Meetings: 'Ultimele 5 întâlniri',
    viewAllMarkets: 'Vezi toate piețele ›',
    fullTimeResult: 'Rezultat Final (1X2)',
    doubleChance: 'Șansă Dublă',
    btts: 'Ambele Echipe Marchează',
    overUnder25: 'Peste/Sub 2.5',
    asianHandicap: 'Handicap Asiatic',
    relatedFixtures: 'Meciuri Similare',
    viewAllLive: 'Vezi toate live ›',
    trust1Title: 'Date în timp real',
    trust1Sub: 'Actualizări ultra-rapide',
    trust2Title: 'Analitică avansată',
    trust2Sub: 'xG, momentum și altele',
    trust3Title: 'Alerte personalizate',
    trust3Sub: 'Nu rata niciodată valoarea',
    trust4Title: 'Instrumente 100% gratuite',
    trust4Sub: 'Fără costuri ascunse',
  },
  ru: {
    homeBreadcrumb: 'Главная',
    backBtn: '← Назад к матчам',
    matchweek: 'Тур 37',
    referee: 'Судья',
    weather: 'Погода',
    pitch: 'Поле',
    topMarkets: 'Топ рынки',
    compareOdds: 'Сравнить кэфы ›',
    valueDetected: 'Найдена ценность +EV',
    tabOverview: 'Обзор',
    tabStats: 'Статистика',
    tabTimeline: 'Хронология',
    tabLineups: 'Составы',
    tabH2H: 'Н2Н',
    tabOdds: 'Коэффициенты',
    tabPredictions: 'Прогнозы Poisson',
    matchOverview: 'Обзор матча',
    liveBadge: 'Лайв',
    scheduledBadge: 'Предстоящий',
    possession: 'Владение',
    shots: 'Удары',
    shotsOnTarget: 'Удары в створ',
    corners: 'Угловые',
    fouls: 'Фолы',
    yellowCards: 'Желтые карточки',
    redCards: 'Красные карточки',
    momentum: 'Моментум',
    last5MinPos: 'Владение (посл. 5 мин)',
    timeline: 'Хронология',
    viewFullTimeline: 'Вся хронология ›',
    bettingInsights: 'Количественный анализ (+EV)',
    howItWorks: 'Как это работает',
    valueAngle: 'Математический Value сигнал',
    marketOdds: 'Рыночный кэф',
    fairOdds: 'Справедливый кэф',
    edge: 'Перевес (Edge)',
    confidence: 'Уверенность',
    high: 'Высокая',
    bestMarket: 'Лучший рынок',
    projectedProb: 'Вероятность модели',
    recStake: 'Рекомендуемая ставка',
    ofBankroll: 'от банка',
    addToBetSlip: 'Добавить в Мои ставки',
    trackMatch: 'Отслеживать матч',
    trackingActive: 'Матч отслеживается',
    lineups: 'Стартовые составы',
    viewFullLineups: 'Все составы ›',
    formTitle: 'Форма',
    h2hTitle: 'Личные встречи (H2H)',
    wins: 'Победы',
    draws: 'Ничьи',
    last5Meetings: 'Последние 5 встреч',
    viewAllMarkets: 'Все рынки ›',
    fullTimeResult: 'Исход матча (1X2)',
    doubleChance: 'Двойной шанс',
    btts: 'Обе забьют',
    overUnder25: 'Тотал 2.5 Б/М',
    asianHandicap: 'Азиатская фора',
    relatedFixtures: 'Похожие лайв-матчи',
    viewAllLive: 'Все лайв-матчи ›',
    trust1Title: 'Данные в реальном времени',
    trust1Sub: 'Мгновенное обновление',
    trust2Title: 'Продвинутая аналитика',
    trust2Sub: 'xG, моментум и Poisson',
    trust3Title: 'Персональные алерты',
    trust3Sub: 'Не упускайте +EV перевес',
    trust4Title: '100% Бесплатные модели',
    trust4Sub: 'Без скрытых платежей',
  },
};

export const MatchDetailPage: React.FC<MatchDetailPageProps> = ({
  language,
  match,
  allMatches,
  onBack,
  onSelectMatch,
  onLogBet,
  setActiveTab,
}) => {
  const t = (DICT as Record<string, typeof DICT.en>)[language] || DICT.en;
  const [liveIntel, setLiveIntel] = useState<LiveMatchIntel | null>(null);
  const [selectedPastMatch, setSelectedPastMatch] = useState<FormMatchItem | null>(null);
  const [pastMatchIntel, setPastMatchIntel] = useState<LiveMatchIntel | null>(null);
  const [pastMatchLoading, setPastMatchLoading] = useState<boolean>(false);

  const isApiMatch = match.id.startsWith('api-') || /^\d+$/.test(match.id);

  useEffect(() => {
    let cancelled = false;
    setLiveIntel(null);
    if (isApiMatch) {
      fetch(`/api/football/match-intel/${encodeURIComponent(match.id)}`)
        .then((r) => r.json())
        .then((data: LiveMatchIntel) => {
          if (!cancelled && data?.found) {
            setLiveIntel(data);
            const logoBatch: Array<{
              homeTeam?: string;
              awayTeam?: string;
              homeLogo?: string;
              awayLogo?: string;
            }> = [];
            if (data.homeTeam && data.homeLogo) {
              logoBatch.push({ homeTeam: data.homeTeam, homeLogo: data.homeLogo });
            }
            if (data.awayTeam && data.awayLogo) {
              logoBatch.push({ awayTeam: data.awayTeam, awayLogo: data.awayLogo });
            }
            (data.standings || []).forEach((s) => {
              if (s.club && s.clubLogo) {
                logoBatch.push({ homeTeam: s.club, homeLogo: s.clubLogo });
              }
            });
            (data.homeFormMatches || []).forEach((fm) => {
              logoBatch.push({
                homeTeam: fm.homeTeam,
                awayTeam: fm.awayTeam,
                homeLogo: fm.homeLogo,
                awayLogo: fm.awayLogo,
              });
            });
            (data.awayFormMatches || []).forEach((fm) => {
              logoBatch.push({
                homeTeam: fm.homeTeam,
                awayTeam: fm.awayTeam,
                homeLogo: fm.homeLogo,
                awayLogo: fm.awayLogo,
              });
            });
            (data.h2h?.matches || []).forEach((fm) => {
              logoBatch.push({
                homeTeam: fm.homeTeam,
                awayTeam: fm.awayTeam,
                homeLogo: fm.homeLogo,
                awayLogo: fm.awayLogo,
              });
            });
            if (logoBatch.length > 0) {
              registerMatchLogos(logoBatch);
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [match.id, isApiMatch]);

  // Fetch past match details when user clicks on a W/D/L dot or Form/H2H match row
  useEffect(() => {
    let cancelled = false;
    if (!selectedPastMatch) {
      setPastMatchIntel(null);
      setPastMatchLoading(false);
      return;
    }
    if (selectedPastMatch.fixtureId) {
      setPastMatchLoading(true);
      setPastMatchIntel(null);
      fetch(`/api/football/match-intel/${encodeURIComponent(String(selectedPastMatch.fixtureId))}`)
        .then((r) => r.json())
        .then((data: LiveMatchIntel) => {
          if (!cancelled) {
            if (data?.found) {
              setPastMatchIntel(data);
            }
            setPastMatchLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setPastMatchLoading(false);
        });
    } else {
      setPastMatchIntel(null);
      setPastMatchLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedPastMatch]);

  const meta = getMatchMetadata(match, liveIntel);

  const [subTab, setSubTab] = useState<
    'overview' | 'standings' | 'stats' | 'timeline' | 'lineups' | 'h2h' | 'odds' | 'predictions'
  >('overview');
  const [isTracked, setIsTracked] = useState<boolean>(false);

  // Use fresh score/status from liveIntel if available
  const displayHomeScore = liveIntel?.homeScore ?? match.homeScore;
  const displayAwayScore = liveIntel?.awayScore ?? match.awayScore;
  const displayMinute = liveIntel?.minute ?? match.minute;
  const displayStatus = liveIntel?.status || match.status;
  const displayHalftime =
    liveIntel?.halftimeScore ||
    match.halftimeScore ||
    (displayStatus === 'LIVE' && (displayMinute || 0) <= 45
      ? '1-ВО ПОЛУВРЕМЕ'
      : displayStatus === 'LIVE'
      ? '2-РО ПОЛУВРЕМЕ'
      : 'PRE-MATCH');

  const isLive = displayStatus === 'LIVE';

  // Visibility flags ("Zero Lies" rule: hide stats/lineups on API matches when API-Football does not provide them)
  const showStatsPanel = !isApiMatch || Boolean(liveIntel?.hasRealStats);
  const showLineupsPanel = !isApiMatch || Boolean(liveIntel?.hasRealLineups);
  const standingsRows: StandingRow[] = liveIntel?.standings || [];
  const hasStandings = standingsRows.length > 0;

  const posHome = liveIntel?.stats?.possessionHome ?? match.stats.possessionHome ?? 50;
  const posAway = liveIntel?.stats?.possessionAway ?? match.stats.possessionAway ?? 50;
  const shotsHome = liveIntel?.stats?.shotsHome ?? match.stats.shotsHome ?? 0;
  const shotsAway = liveIntel?.stats?.shotsAway ?? match.stats.shotsAway ?? 0;
  const sotHome = liveIntel?.stats?.shotsOnTargetHome ?? match.stats.shotsOnTargetHome ?? 0;
  const sotAway = liveIntel?.stats?.shotsOnTargetAway ?? match.stats.shotsOnTargetAway ?? 0;
  const cornersHome = liveIntel?.stats?.cornersHome ?? match.stats.cornersHome ?? 0;
  const cornersAway = liveIntel?.stats?.cornersAway ?? match.stats.cornersAway ?? 0;
  const foulsHome = liveIntel?.stats?.foulsHome ?? match.stats.foulsHome ?? 0;
  const foulsAway = liveIntel?.stats?.foulsAway ?? match.stats.foulsAway ?? 0;
  const yellowHome = liveIntel?.stats?.yellowCardsHome ?? match.stats.yellowCardsHome ?? 0;
  const yellowAway = liveIntel?.stats?.yellowCardsAway ?? match.stats.yellowCardsAway ?? 0;
  const redHome = liveIntel?.stats?.redCardsHome ?? match.stats.redCardsHome ?? 0;
  const redAway = liveIntel?.stats?.redCardsAway ?? match.stats.redCardsAway ?? 0;

  const activeBookmakerOdds = liveIntel?.liveBookmakerOdds || match.bookmakerOdds;
  const over25Odds = Number((1 / Math.max(0.25, match.fairOdds.over25Prob) * 0.95).toFixed(2));
  const under25Odds = Number((1 / Math.max(0.25, match.fairOdds.under25Prob) * 0.95).toFixed(2));
  const bttsYesOdds = Number((1 / Math.max(0.25, match.fairOdds.bttsProb) * 0.95).toFixed(2));
  const bttsNoOdds = Number((1 / Math.max(0.25, 1 - match.fairOdds.bttsProb) * 0.95).toFixed(2));

  const edgePercent = match.valueBetDetected?.edgePercent || 6.4;
  const recKelly = match.valueBetDetected?.recommendedStakeKelly || 2.2;
  const bestMarketLabel =
    match.valueBetDetected?.selection === 'over25'
      ? 'Over 2.5 Goals'
      : match.valueBetDetected?.selection === 'draw'
      ? 'Draw (X)'
      : match.valueBetDetected?.selection === 'away'
      ? `${match.awayTeam} Win`
      : `${match.homeTeam} Win`;

  const poissonMatrix = computePoissonMatrix(
    match.fairOdds.expectedGoalsHome,
    match.fairOdds.expectedGoalsAway,
    true
  );

  // Timeline events: ONLY real events on API matches (never fake STAT / CARDS / EV+ filler rows)
  const timelineItems =
    liveIntel?.events && liveIntel.events.length > 0
      ? liveIntel.events
      : match.events.length > 0
      ? match.events.map((ev) => ({
          min: `${ev.minute}'`,
          icon:
            ev.type === 'goal'
              ? '⚽'
              : ev.type === 'yellow_card'
              ? '🟨'
              : ev.type === 'red_card'
              ? '🟥'
              : '🚩',
          title: ev.type === 'goal' ? 'GOAL!' : ev.description.split('—')[0] || ev.type.toUpperCase(),
          sub: ev.description,
          highlight: ev.type === 'goal',
        }))
      : isApiMatch
      ? [
          {
            min: isLive ? `${displayMinute || 1}'` : match.startTime,
            icon: '⚽',
            title: `${match.homeTeam} ${displayHomeScore} - ${displayAwayScore} ${match.awayTeam}`,
            sub:
              displayHomeScore + displayAwayScore === 0
                ? language === 'bg'
                  ? 'Все още няма отбелязани голове или картони в срещата'
                  : 'No goals or cards recorded yet in this match'
                : displayHalftime,
            highlight: displayHomeScore + displayAwayScore > 0,
          },
        ]
      : [
          {
            min: isLive ? `${displayMinute || 45}'` : match.startTime,
            icon: '⚽',
            title: `${match.homeTeam} ${displayHomeScore} - ${displayAwayScore} ${match.awayTeam}`,
            sub: `xG: ${match.fairOdds.expectedGoalsHome.toFixed(2)} vs ${match.fairOdds.expectedGoalsAway.toFixed(2)}`,
            highlight: displayHomeScore + displayAwayScore > 0,
          },
        ];

  const relatedMatches = allMatches.filter((m) => m.id !== match.id).slice(0, 4);

  // Interactive W / D / L Form Dots: Hover Tooltip + Click to open Match Details Modal
  const renderInteractiveFormPills = (
    formMatches: FormMatchItem[],
    fallbackPills?: ('W' | 'D' | 'L')[]
  ) => {
    if (formMatches && formMatches.length > 0) {
      return (
        <div className="flex items-center gap-1.5">
          {formMatches.slice(0, 5).map((fm, i) => (
            <div key={i} className="relative group inline-flex">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPastMatch(fm);
                }}
                className={`w-5 h-5 rounded-full text-[9px] font-mono font-black flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ring-1 ring-black/40 shadow-sm ${
                  fm.res === 'W'
                    ? 'bg-[#10b981] text-[#04130b] hover:ring-[#43f08a]'
                    : fm.res === 'D'
                    ? 'bg-[#475569] text-white hover:ring-neutral-300'
                    : 'bg-[#ef4444] text-white hover:ring-red-300'
                }`}
                aria-label={`${fm.homeTeam} ${fm.score} ${fm.awayTeam}`}
              >
                {fm.res}
              </button>

              {/* Hover Popover Tooltip */}
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 rounded-xl border border-[#22c55e]/50 bg-[#060c14]/95 backdrop-blur-md p-2.5 shadow-2xl text-left">
                <div className="flex items-center justify-between text-[10px] text-[#8f9cae] border-b border-[#162232] pb-1 mb-1.5">
                  <span className="truncate max-w-[125px] font-semibold text-neutral-300">
                    {fm.league || match.league}
                  </span>
                  {fm.date && <span className="font-mono text-[#43f08a]">{fm.date}</span>}
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-white gap-1">
                  <span className="truncate flex-1">{fm.homeTeam}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#111d2b] font-mono text-[#43f08a] shrink-0">
                    {fm.homeScore} : {fm.awayScore}
                  </span>
                  <span className="truncate flex-1 text-right">{fm.awayTeam}</span>
                </div>
                <div className="mt-1.5 text-[9px] text-center font-semibold text-[#43f08a]">
                  {language === 'bg'
                    ? 'Кликни за прозорец с мача ↗'
                    : 'Click to open match details ↗'}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!fallbackPills || fallbackPills.length === 0) return null;

    return (
      <div className="flex items-center gap-1">
        {fallbackPills.map((r, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center ${
              r === 'W'
                ? 'bg-[#10b981] text-[#04130b]'
                : r === 'D'
                ? 'bg-[#334155] text-neutral-200'
                : 'bg-[#ef4444] text-white'
            }`}
          >
            {r}
          </span>
        ))}
      </div>
    );
  };

  // Donut math for Last 5 Min Possession
  const last5PosHome = Math.min(78, Math.max(22, posHome + (shotsHome - shotsAway)));
  const last5PosAway = 100 - last5PosHome;
  const rDonut = 18;
  const cDonut = 2 * Math.PI * rDonut;
  const stroke62 = (last5PosHome / 100) * cDonut;

  const h2hTotal = Math.max(1, meta.h2h.homeWins + meta.h2h.draws + meta.h2h.awayWins);

  // Reusable Standings Table Renderer
  const renderStandingsTable = (compact = false) => {
    if (!hasStandings) {
      return (
        <div className="text-center py-8 text-xs text-[#8f9cae]">
          {language === 'bg'
            ? 'Зареждане на официалното класиране за лигата...'
            : 'Loading official league standings...'}
        </div>
      );
    }

    const rowsToRender = compact ? standingsRows.slice(0, 14) : standingsRows;

    return (
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#162232] text-[10px] font-mono uppercase text-[#8f9cae]">
              <th className="py-2 pl-2 pr-1 w-7">#</th>
              <th className="py-2 px-2">{language === 'bg' ? 'Отбор' : 'Club'}</th>
              <th className="py-2 px-1.5 text-center" title="Изиграни мачове">
                {language === 'bg' ? 'М' : 'P'}
              </th>
              {!compact && (
                <>
                  <th className="py-2 px-1.5 text-center">{language === 'bg' ? 'П' : 'W'}</th>
                  <th className="py-2 px-1.5 text-center">{language === 'bg' ? 'Р' : 'D'}</th>
                  <th className="py-2 px-1.5 text-center">{language === 'bg' ? 'З' : 'L'}</th>
                  <th className="py-2 px-2 text-center">{language === 'bg' ? 'ГР' : 'GF:GA'}</th>
                </>
              )}
              <th className="py-2 px-1.5 text-center">+/-</th>
              <th className="py-2 px-2 text-center font-bold text-white">
                {language === 'bg' ? 'Т' : 'PTS'}
              </th>
              {!compact && (
                <th className="py-2 pl-2 pr-2 text-right">
                  {language === 'bg' ? 'Форма' : 'Form'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#131e2c]">
            {rowsToRender.map((row) => {
              const isMatchTeam =
                row.club.toLowerCase() === match.homeTeam.toLowerCase() ||
                row.club.toLowerCase() === match.awayTeam.toLowerCase();
              return (
                <tr
                  key={`${row.rank}-${row.club}`}
                  onClick={() =>
                    openTeamProfile({
                      teamId: row.teamId,
                      teamName: row.club,
                      teamLogo: row.clubLogo,
                      leagueName: liveIntel?.league || match.league,
                    })
                  }
                  className={`transition-colors cursor-pointer group ${
                    isMatchTeam
                      ? 'bg-[#0f291e]/90 border-l-2 border-l-[#43f08a]'
                      : 'hover:bg-[#0e1622]'
                  }`}
                  title={`${row.club} — Отвори профила на отбора`}
                >
                  <td className="py-2 pl-2 pr-1 font-mono text-[11px] font-bold text-[#8f9cae]">
                    {row.rank}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamBadge name={row.club} logoUrl={row.clubLogo} teamId={row.teamId} size="sm" />
                      <span
                        className={`truncate group-hover:underline ${
                          isMatchTeam ? 'font-extrabold text-[#43f08a]' : 'font-semibold text-white group-hover:text-[#43f08a]'
                        }`}
                      >
                        {row.club}
                      </span>
                      {isMatchTeam && (
                        <span className="px-1.5 py-0.5 rounded bg-[#22c55e]/20 border border-[#22c55e]/40 text-[9px] font-mono font-bold text-[#43f08a] shrink-0">
                          {language === 'bg' ? 'В МАЧА' : 'IN MATCH'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-1.5 text-center font-mono text-neutral-300">{row.p}</td>
                  {!compact && (
                    <>
                      <td className="py-2 px-1.5 text-center font-mono text-neutral-300">
                        {row.w}
                      </td>
                      <td className="py-2 px-1.5 text-center font-mono text-neutral-300">
                        {row.d}
                      </td>
                      <td className="py-2 px-1.5 text-center font-mono text-neutral-300">
                        {row.l}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-neutral-400">
                        {row.gf}:{row.ga}
                      </td>
                    </>
                  )}
                  <td className="py-2 px-1.5 text-center font-mono text-neutral-300">{row.gd}</td>
                  <td className="py-2 px-2 text-center font-mono font-black text-[#43f08a]">
                    {row.pts}
                  </td>
                  {!compact && (
                    <td className="py-2 pl-2 pr-2">
                      <div className="flex items-center justify-end gap-1">
                        {(row.form || []).map((f, idx) => (
                          <span
                            key={idx}
                            className={`w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center ${
                              f === 'W'
                                ? 'bg-[#10b981] text-[#04130b]'
                                : f === 'D'
                                ? 'bg-[#475569] text-white'
                                : 'bg-[#ef4444] text-white'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Sub-navigation tabs filtered dynamically so we NEVER show empty/fake tabs
  const navTabs = [
    { key: 'overview', label: t.tabOverview, icon: '📊', visible: true },
    {
      key: 'standings',
      label: language === 'bg' ? 'Класиране' : 'Standings',
      icon: '🏆',
      visible: hasStandings || isApiMatch,
    },
    { key: 'stats', label: t.tabStats, icon: '📈', visible: showStatsPanel },
    { key: 'timeline', label: t.tabTimeline, icon: '⏱️', visible: true },
    { key: 'lineups', label: t.tabLineups, icon: '👕', visible: showLineupsPanel },
    { key: 'h2h', label: t.tabH2H, icon: '⚔️', visible: true },
    { key: 'odds', label: t.tabOdds, icon: '🎯', visible: true },
    { key: 'predictions', label: t.tabPredictions, icon: '🧠', visible: true },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* =================================================================== */}
      {/* TOP BREADCRUMBS & BACK BUTTON */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8f9cae]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {t.homeBreadcrumb}
          </button>
          <span className="text-neutral-600">›</span>
          <span className="inline-flex items-center gap-1 text-neutral-300">
            <span>🌍</span>
            <span>{liveIntel?.leagueCountry || match.leagueCountry}</span>
          </span>
          <span className="text-neutral-600">›</span>
          <button
            type="button"
            onClick={() => setActiveTab('competitions')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {liveIntel?.league || match.league}
          </button>
          <span className="text-neutral-600">›</span>
          <span className="text-white font-semibold">
            {match.homeTeam} vs {match.awayTeam}
          </span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl border border-[#1e2d40] bg-[#0b131d] hover:border-[#43f08a]/60 text-xs font-semibold text-[#43f08a] transition-colors cursor-pointer"
        >
          {t.backBtn}
        </button>
      </div>

      {/* =================================================================== */}
      {/* ROW 1: HERO SCOREBOARD BANNER (8 COLS) + TOP MARKETS CARD (4 COLS) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* LEFT 8 COLS: Match Scoreboard Banner */}
        <div className="xl:col-span-8 rounded-2xl border border-[#1a2938] bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] p-5 sm:p-6 relative overflow-visible flex flex-col justify-between shadow-2xl">
          {/* Subtle dot grid & emerald stadium glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 35%, rgba(34, 197, 94, 0.28) 0%, transparent 65%), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 22px 22px',
            }}
            aria-hidden="true"
          />

          {/* Top Center League & Stadium Info */}
          <div className="relative z-10 text-center space-y-1">
            <div className="inline-flex items-center gap-2 text-xs text-neutral-200 font-semibold">
              <LeagueBadge
                name={liveIntel?.league || match.league}
                logoUrl={liveIntel?.leagueLogo || match.leagueLogo}
                className="w-4 h-4 rounded-sm"
              />
              <span>{liveIntel?.league || match.league}</span>
              {(liveIntel?.leagueRound || match.leagueRound) && (
                <>
                  <span className="text-neutral-500">·</span>
                  <span className="text-[#94a3b8] font-normal">
                    {liveIntel?.leagueRound || match.leagueRound}
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-[#8f9cae] flex items-center justify-center gap-3">
              <span>📍 {meta.stadium}</span>
              {meta.attendance && (
                <>
                  <span>·</span>
                  <span>👥 {meta.attendance}</span>
                </>
              )}
            </div>
          </div>

          {/* Center 3-Column Scoreboard */}
          <div className="relative z-20 grid grid-cols-1 sm:grid-cols-11 gap-4 items-center my-5">
            {/* Home Team (4 cols) */}
            <div className="sm:col-span-4 flex items-center justify-center sm:justify-start gap-4">
              <TeamBadge
                name={match.homeTeam}
                logoUrl={liveIntel?.homeLogo || match.homeLogo}
                teamId={match.homeTeamId}
                size="lg"
                className="w-16 h-16 text-base rounded-2xl"
              />
              <div className="space-y-1.5">
                <h1
                  onClick={(e) =>
                    openTeamProfile(
                      {
                        teamId: match.homeTeamId,
                        teamName: match.homeTeam,
                        teamLogo: liveIntel?.homeLogo || match.homeLogo,
                        leagueId: match.leagueId,
                        leagueName: liveIntel?.league || match.league,
                      },
                      e
                    )
                  }
                  className="text-lg sm:text-2xl font-extrabold text-white hover:text-[#43f08a] hover:underline tracking-tight leading-tight cursor-pointer transition-colors"
                  title={`${match.homeTeam} — Отвори профила на отбора`}
                >
                  {match.homeTeam}
                </h1>
                {renderInteractiveFormPills(meta.homeFormMatches)}
                {meta.homeScorerText && (
                  <div className="text-xs text-neutral-300 pt-1 flex items-center gap-1.5 font-mono">
                    <span>{meta.homeScorerText}</span>
                    {displayHomeScore > 0 && <span className="text-[#43f08a]">⚽</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Center Score Box (3 cols) */}
            <div className="sm:col-span-3 flex justify-center">
              <div className="rounded-2xl border border-[#1f3144] bg-[#060b12]/90 px-7 py-3.5 text-center shadow-inner min-w-[150px]">
                {isLive ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#43f08a] mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-ping" />
                    <span>LIVE {displayMinute}&apos;</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono font-bold text-amber-400 mb-1">
                    {match.startTime}
                  </div>
                )}
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider tabular-nums">
                  {displayHomeScore} - {displayAwayScore}
                </div>
                <div className="text-[11px] font-mono text-[#8f9cae] mt-1">{displayHalftime}</div>
              </div>
            </div>

            {/* Away Team (4 cols) */}
            <div className="sm:col-span-4 flex items-center justify-center sm:justify-end gap-4 text-right">
              <div className="space-y-1.5 flex flex-col items-end">
                <h2
                  onClick={(e) =>
                    openTeamProfile(
                      {
                        teamId: match.awayTeamId,
                        teamName: match.awayTeam,
                        teamLogo: liveIntel?.awayLogo || match.awayLogo,
                        leagueId: match.leagueId,
                        leagueName: liveIntel?.league || match.league,
                      },
                      e
                    )
                  }
                  className="text-lg sm:text-2xl font-extrabold text-white hover:text-[#43f08a] hover:underline tracking-tight leading-tight cursor-pointer transition-colors"
                  title={`${match.awayTeam} — Отвори профила на отбора`}
                >
                  {match.awayTeam}
                </h2>
                {renderInteractiveFormPills(meta.awayFormMatches)}
                {meta.awayScorerText && (
                  <div className="text-xs text-neutral-300 pt-1 flex items-center gap-1.5 font-mono">
                    <span className="text-[#43f08a]">⚽</span>
                    <span>{meta.awayScorerText}</span>
                  </div>
                )}
              </div>
              <TeamBadge
                name={match.awayTeam}
                logoUrl={liveIntel?.awayLogo || match.awayLogo}
                teamId={match.awayTeamId}
                size="lg"
                className="w-16 h-16 text-base rounded-2xl"
              />
            </div>
          </div>

          {/* Bottom Referee & Weather Info — hidden on API matches if no referee is announced */}
          {(meta.referee || meta.weather || meta.pitch) && (
            <div className="relative z-10 text-center text-[11px] text-[#8f9cae] border-t border-[#172434]/80 pt-3 flex items-center justify-center gap-2.5 flex-wrap">
              {meta.referee && (
                <span>
                  {t.referee}: <strong className="text-neutral-300">{meta.referee}</strong>
                </span>
              )}
              {meta.weather && (
                <>
                  {meta.referee && <span>·</span>}
                  <span>
                    {t.weather}: <strong className="text-neutral-300">{meta.weather}</strong>
                  </span>
                </>
              )}
              {meta.pitch && (
                <>
                  {(meta.referee || meta.weather) && <span>·</span>}
                  <span>
                    {t.pitch}: <strong className="text-neutral-300">{meta.pitch}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT 4 COLS: Top Markets Card */}
        <div className="xl:col-span-4 rounded-2xl border border-[#1a2938] bg-[#0b111a] p-5 flex flex-col justify-between shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">{t.topMarkets}</h3>
            <button
              type="button"
              onClick={() => setSubTab('odds')}
              className="text-xs text-[#8f9cae] hover:text-[#43f08a] transition-colors cursor-pointer"
            >
              {t.compareOdds}
            </button>
          </div>

          {/* 3 Mini Market Groups: 1X2 | Over/Under 2.5 | BTTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* 1X2 */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#8f9cae] font-semibold block">1X2</span>
              <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(
                      match,
                      match.homeTeam,
                      activeBookmakerOdds.home,
                      edgePercent,
                      'Full Time Result'
                    )
                  }
                  className="py-2 px-1 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">1</span>
                  <span className="font-bold text-white">{activeBookmakerOdds.home.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(
                      match,
                      'Draw (X)',
                      activeBookmakerOdds.draw,
                      edgePercent,
                      'Full Time Result'
                    )
                  }
                  className="py-2 px-1 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">X</span>
                  <span className="font-bold text-white">{activeBookmakerOdds.draw.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(
                      match,
                      match.awayTeam,
                      activeBookmakerOdds.away,
                      edgePercent,
                      'Full Time Result'
                    )
                  }
                  className="py-2 px-1 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">2</span>
                  <span className="font-bold text-white">{activeBookmakerOdds.away.toFixed(2)}</span>
                </button>
              </div>
            </div>

            {/* Over/Under 2.5 */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#8f9cae] font-semibold block">Over/Under 2.5</span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(match, 'Over 2.5 Goals', over25Odds, edgePercent, 'Over/Under 2.5')
                  }
                  className="py-2 px-1.5 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">Over</span>
                  <span className="font-bold text-white">{over25Odds.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(match, 'Under 2.5 Goals', under25Odds, 4.2, 'Over/Under 2.5')
                  }
                  className="py-2 px-1.5 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">Under</span>
                  <span className="font-bold text-white">{under25Odds.toFixed(2)}</span>
                </button>
              </div>
            </div>

            {/* BTTS */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#8f9cae] font-semibold block">BTTS</span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(match, 'BTTS — Yes', bttsYesOdds, 6.8, 'Both Teams to Score')
                  }
                  className="py-2 px-1.5 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">Yes</span>
                  <span className="font-bold text-white">{bttsYesOdds.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(match, 'BTTS — No', bttsNoOdds, 3.5, 'Both Teams to Score')
                  }
                  className="py-2 px-1.5 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">No</span>
                  <span className="font-bold text-white">{bttsNoOdds.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Value Detected Banner */}
          <div
            onClick={() =>
              onLogBet(match, 'Over 2.5 Goals', over25Odds, edgePercent, 'Over/Under 2.5')
            }
            className="rounded-xl border border-[#1e553b] bg-gradient-to-r from-[#0a2218] to-[#0c1d18] px-4 py-3 flex items-center justify-between cursor-pointer hover:border-[#43f08a] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center text-[#43f08a] text-xs">
                📈
              </span>
              <span className="text-xs font-bold text-[#43f08a]">{t.valueDetected}</span>
            </div>
            <span className="text-xs font-extrabold text-white">{bestMarketLabel}</span>
            <span className="text-sm font-mono font-black text-[#43f08a]">+{edgePercent}%</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 2: SUB-NAVIGATION TABS BAR (Only shows tabs with real data) */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-[#162230] bg-[#090f17] px-3 py-1.5 text-xs font-semibold">
        {navTabs.map((item) => {
          const active = subTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSubTab(item.key as typeof subTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-[#0f291e] border-b-2 border-[#43f08a] text-[#43f08a] font-bold'
                  : 'text-[#8f9cae] hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* STANDINGS SUB-TAB SPECIAL VIEW (Full League Standings Table) */}
      {/* =================================================================== */}
      {subTab === 'standings' && (
        <div className="rounded-2xl border border-[#1a2938] bg-[#0b111a] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🏆</span>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {language === 'bg' ? 'Класиране в лигата' : 'League Standings'} —{' '}
                  {liveIntel?.league || match.league}
                </h3>
                <p className="text-[11px] text-[#8f9cae]">
                  {liveIntel?.leagueCountry || match.leagueCountry} ·{' '}
                  {liveIntel?.leagueRound || match.leagueRound || ''}
                </p>
              </div>
            </div>
          </div>
          {renderStandingsTable(false)}
        </div>
      )}

      {/* =================================================================== */}
      {/* PREDICTIONS SUB-TAB SPECIAL VIEW (Poisson Scoreline Matrix) */}
      {/* =================================================================== */}
      {subTab === 'predictions' && (
        <div className="rounded-2xl border border-[#1a2938] bg-[#0b111a] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3">
            <h3 className="text-base font-extrabold text-white">
              Dixon-Coles Bivariate Poisson Exact Score Matrix ({match.homeTeam} vs {match.awayTeam})
            </h3>
            <span className="text-xs font-mono text-[#43f08a]">
              λ₁ = {match.fairOdds.expectedGoalsHome.toFixed(2)} · λ₂ ={' '}
              {match.fairOdds.expectedGoalsAway.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {poissonMatrix.mostLikelyScores.slice(0, 4).map((sc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#1e2d40] bg-[#0e1622] text-center space-y-1"
              >
                <span className="text-xs font-mono text-[#8f9cae] block">Exact Score</span>
                <span className="text-2xl font-black text-white font-mono block">{sc.score}</span>
                <span className="text-sm font-mono font-bold text-[#43f08a] block">
                  {(sc.prob * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ROW 3: OVERVIEW / STANDINGS (4) | TIMELINE (4) | BETTING INSIGHTS (4) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: Optical Stats Overview OR League Standings if API has no stats for this division */}
        {showStatsPanel ? (
          <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162232] pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">{t.matchOverview}</h3>
                <span className="px-2 py-0.5 rounded bg-[#0f291e] border border-[#22c55e]/50 text-[10px] font-mono font-bold text-[#43f08a]">
                  {isLive ? t.liveBadge : t.scheduledBadge}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center flex-1">
              {/* Left Score & Crests (2 cols) */}
              <div className="col-span-2 flex flex-col justify-between h-full py-2 items-center border-r border-[#162232] pr-2">
                <div className="flex flex-col items-center gap-1">
                  <TeamBadge name={match.homeTeam} logoUrl={liveIntel?.homeLogo || match.homeLogo} size="sm" />
                  <span className="text-2xl font-black text-white font-mono">
                    {displayHomeScore}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <TeamBadge name={match.awayTeam} logoUrl={liveIntel?.awayLogo || match.awayLogo} size="sm" />
                  <span className="text-2xl font-black text-white font-mono">
                    {displayAwayScore}
                  </span>
                </div>
              </div>

              {/* Center Stat Bars (6 cols) */}
              <div className="col-span-6 space-y-2 text-[10px] font-mono">
                {[
                  {
                    label: 'xG',
                    homeVal: (liveIntel?.stats?.xgHome || match.fairOdds.expectedGoalsHome).toFixed(
                      2
                    ),
                    awayVal: (liveIntel?.stats?.xgAway || match.fairOdds.expectedGoalsAway).toFixed(
                      2
                    ),
                    homePct:
                      ((liveIntel?.stats?.xgHome || match.fairOdds.expectedGoalsHome) /
                        Math.max(
                          (liveIntel?.stats?.xgHome || match.fairOdds.expectedGoalsHome) +
                            (liveIntel?.stats?.xgAway || match.fairOdds.expectedGoalsAway),
                          0.1
                        )) *
                      100,
                  },
                  {
                    label: t.possession,
                    homeVal: `${posHome}%`,
                    awayVal: `${posAway}%`,
                    homePct: posHome,
                  },
                  {
                    label: t.shots,
                    homeVal: shotsHome,
                    awayVal: shotsAway,
                    homePct: (shotsHome / Math.max(shotsHome + shotsAway, 1)) * 100,
                  },
                  {
                    label: t.shotsOnTarget,
                    homeVal: sotHome,
                    awayVal: sotAway,
                    homePct: (sotHome / Math.max(sotHome + sotAway, 1)) * 100,
                  },
                  {
                    label: t.corners,
                    homeVal: cornersHome,
                    awayVal: cornersAway,
                    homePct: (cornersHome / Math.max(cornersHome + cornersAway, 1)) * 100,
                  },
                  {
                    label: t.fouls,
                    homeVal: foulsHome,
                    awayVal: foulsAway,
                    homePct: (foulsHome / Math.max(foulsHome + foulsAway, 1)) * 100,
                  },
                  {
                    label: `🟨 ${t.yellowCards}`,
                    homeVal: yellowHome,
                    awayVal: yellowAway,
                    homePct:
                      yellowHome + yellowAway > 0
                        ? (yellowHome / (yellowHome + yellowAway)) * 100
                        : 50,
                  },
                  {
                    label: `🟥 ${t.redCards}`,
                    homeVal: redHome,
                    awayVal: redAway,
                    homePct:
                      redHome + redAway > 0 ? (redHome / (redHome + redAway)) * 100 : 50,
                  },
                ].map((st, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-neutral-300 mb-0.5">
                      <span className="font-bold text-white">{st.homeVal}</span>
                      <span className="text-[#8f9cae] truncate px-1">{st.label}</span>
                      <span className="font-bold text-white">{st.awayVal}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                      <div
                        className="bg-[#22c55e] h-full"
                        style={{ width: `${st.homePct}%` }}
                      />
                      <div
                        className="bg-[#334155] h-full"
                        style={{ width: `${100 - st.homePct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Momentum & Last 5 Min Possession (4 cols) */}
              <div className="col-span-4 flex flex-col justify-between h-full pl-1 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-300 block mb-1">
                    {t.momentum}
                  </span>
                  <div className="rounded-xl bg-[#080e16] border border-[#162232] p-2">
                    <svg className="w-full h-20 overflow-visible" viewBox="0 0 120 60">
                      <line x1="0" y1="30" x2="120" y2="30" stroke="#1e293b" strokeWidth="1" />
                      <path
                        d="M 5 30 L 18 18 L 32 24 L 48 10 L 62 22 L 78 26 L 94 38 L 110 34 L 110 30 L 5 30 Z"
                        fill="rgba(34, 197, 94, 0.35)"
                      />
                      <path
                        d="M 5 30 L 18 18 L 32 24 L 48 10 L 62 22 L 78 26 L 94 38 L 110 34"
                        fill="none"
                        stroke="#43f08a"
                        strokeWidth="1.8"
                      />
                      <circle cx="48" cy="10" r="3" fill="#ffffff" />
                    </svg>
                    <div className="flex justify-between text-[8px] font-mono text-[#64748b] mt-1">
                      <span>0&apos;</span>
                      <span>HT</span>
                      <span>67&apos;</span>
                      <span>FT</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-semibold text-neutral-300 block mb-1.5">
                    {t.last5MinPos}
                  </span>
                  <div className="flex items-center justify-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white">{last5PosHome}%</span>
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r={rDonut}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="5"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r={rDonut}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="5"
                        strokeDasharray={`${stroke62} ${cDonut}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="font-bold text-neutral-300">{last5PosAway}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* When API-Football does NOT provide optical stats for this league, show the real League Standings instead! */
          <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <h3 className="text-sm font-extrabold text-white">
                  {language === 'bg' ? 'Класиране' : 'Standings'} —{' '}
                  {liveIntel?.league || match.league}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('standings')}
                className="text-xs text-[#8f9cae] hover:text-[#43f08a] transition-colors cursor-pointer"
              >
                {language === 'bg' ? 'Пълно класиране ›' : 'Full table ›'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[310px] pr-1">
              {renderStandingsTable(true)}
            </div>
          </div>
        )}

        {/* PANEL 2: Timeline (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3">
            <h3 className="text-sm font-extrabold text-white">{t.timeline}</h3>
            <button
              type="button"
              onClick={() => setSubTab('timeline')}
              className="text-xs text-[#8f9cae] hover:text-[#43f08a] transition-colors cursor-pointer"
            >
              {t.viewFullTimeline}
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {timelineItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-xl border ${
                  item.highlight
                    ? 'border-[#1e553b] bg-[#0d2119]'
                    : 'border-transparent hover:bg-[#0e1622]'
                } text-xs transition-colors`}
              >
                <span className="w-10 font-mono text-[#8f9cae] text-[11px] shrink-0">
                  {item.min}
                </span>
                <span className="text-sm shrink-0">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate">{item.title}</div>
                  <div className="text-[11px] text-[#8f9cae] truncate">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSubTab('timeline')}
            className="w-full py-2 rounded-xl border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a]/50 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {t.viewFullTimeline}
          </button>
        </div>

        {/* PANEL 3: Betting Insights (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3">
            <h3 className="text-sm font-extrabold text-white">{t.bettingInsights}</h3>
            <button
              type="button"
              onClick={() => setActiveTab('learn')}
              className="text-xs text-[#8f9cae] hover:text-white transition-colors cursor-pointer"
            >
              {t.howItWorks} ⓘ
            </button>
          </div>

          {/* Value Angle Box */}
          <div className="rounded-xl border border-[#1e553b] bg-[#0b1f17] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center text-[#43f08a]">
                📈
              </span>
              <div>
                <span className="text-[10px] text-[#8f9cae] block">{t.valueAngle}</span>
                <span className="text-sm font-extrabold text-white">{bestMarketLabel}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#0f2e20] border border-[#22c55e]/50 font-mono font-black text-xs text-[#43f08a]">
              +{edgePercent}%
            </span>
          </div>

          {/* 4-Column Metric Strip */}
          <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-[#162232]">
            <div>
              <span className="text-[10px] text-[#8f9cae] block">{t.marketOdds}</span>
              <span className="text-sm font-mono font-black text-white mt-0.5 block">1.78</span>
            </div>
            <div className="border-l border-[#162232]">
              <span className="text-[10px] text-[#8f9cae] block">{t.fairOdds}</span>
              <span className="text-sm font-mono font-black text-white mt-0.5 block">1.58</span>
            </div>
            <div className="border-l border-[#162232]">
              <span className="text-[10px] text-[#8f9cae] block">{t.edge}</span>
              <span className="text-sm font-mono font-black text-[#43f08a] mt-0.5 block">
                +{edgePercent}%
              </span>
            </div>
            <div className="border-l border-[#162232]">
              <span className="text-[10px] text-[#8f9cae] block">{t.confidence}</span>
              <span className="text-xs font-bold text-[#43f08a] mt-1 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#43f08a]" />
                {t.high}
              </span>
            </div>
          </div>

          {/* 3-Column Recommendation Strip */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-[#8f9cae] block">{t.bestMarket}</span>
              <span className="font-extrabold text-white mt-0.5 block">{bestMarketLabel}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8f9cae] block">{t.projectedProb}</span>
              <span className="font-mono font-extrabold text-white mt-0.5 block">63.21%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8f9cae] block">{t.recStake}</span>
              <span className="font-mono font-extrabold text-white mt-0.5 block">
                {recKelly}% <span className="text-[10px] font-normal text-[#8f9cae]">{t.ofBankroll}</span>
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() =>
                onLogBet(match, bestMarketLabel, 1.78, edgePercent, 'Total Goals', 50)
              }
              className="w-full py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#43f08a] text-[#04130b] font-extrabold text-xs shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>●</span>
              <span>{t.addToBetSlip}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTracked(!isTracked)}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isTracked
                  ? 'border-[#43f08a] bg-[#0f291e] text-[#43f08a]'
                  : 'border-[#1d2b3c] bg-[#0e1622] hover:border-neutral-600 text-neutral-200'
              }`}
            >
              <span>{isTracked ? '★' : '☆'}</span>
              <span>{isTracked ? t.trackingActive : t.trackMatch}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 4: LINEUPS (ONLY IF AVAILABLE) | FORM & H2H | TOP MARKETS & RELATED */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 4: Lineups 2D Tactical Pitch — HIDDEN when API-Football does not provide lineups */}
        {showLineupsPanel && (
          <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{t.lineups}</h3>
            </div>

            {/* Teams & Formations Header */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <TeamBadge name={match.homeTeam} logoUrl={liveIntel?.homeLogo || match.homeLogo} size="sm" />
                <div>
                  <div className="font-bold text-white leading-tight">{match.homeTeam}</div>
                  <div className="text-[10px] font-mono text-[#8f9cae]">{meta.homeFormation}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="font-bold text-white leading-tight">{match.awayTeam}</div>
                  <div className="text-[10px] font-mono text-[#8f9cae]">{meta.awayFormation}</div>
                </div>
                <TeamBadge name={match.awayTeam} logoUrl={liveIntel?.awayLogo || match.awayLogo} size="sm" />
              </div>
            </div>

            {/* 2D Tactical Football Pitch */}
            <div className="relative w-full h-64 rounded-xl border border-[#1f3347] bg-gradient-to-r from-[#0a1921] via-[#0c2228] to-[#0a1921] overflow-hidden select-none">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
                <rect x="10" y="10" width="380" height="220" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
                <line x1="200" y1="10" x2="200" y2="230" stroke="#1e3a4c" strokeWidth="1.5" />
                <circle cx="200" cy="120" r="32" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
                <circle cx="200" cy="120" r="2" fill="#1e3a4c" />
                <rect x="10" y="55" width="55" height="130" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
                <rect x="10" y="85" width="22" height="70" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
                <rect x="335" y="55" width="55" height="130" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
                <rect x="368" y="85" width="22" height="70" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
              </svg>

              {/* Home Team Nodes */}
              {meta.homePlayers.map((p) => (
                <div
                  key={`home-${p.num}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0f172a] border-2 border-[#43f08a] text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-md">
                    {p.num}
                  </div>
                  <span className="text-[8px] font-medium text-neutral-200 bg-black/50 px-1 rounded mt-0.5 whitespace-nowrap">
                    {p.name}
                  </span>
                </div>
              ))}

              {/* Away Team Nodes */}
              {meta.awayPlayers.map((p) => (
                <div
                  key={`away-${p.num}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <div className="w-6 h-6 rounded-full bg-[#450a0a] border-2 border-[#ef4444] text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-md">
                    {p.num}
                  </div>
                  <span className="text-[8px] font-medium text-neutral-200 bg-black/50 px-1 rounded mt-0.5 whitespace-nowrap">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSubTab('lineups')}
              className="w-full py-2 rounded-xl border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a]/50 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {t.viewFullLineups}
            </button>
          </div>
        )}

        {/* PANEL 5: Form & Head to Head (expands to 6 cols when Lineups is hidden) */}
        <div
          className={`${
            showLineupsPanel ? 'lg:col-span-4' : 'lg:col-span-6'
          } flex flex-col justify-between gap-5`}
        >
          {/* Form Card */}
          <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl flex-1">
            <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
              <h3 className="text-sm font-extrabold text-white">{t.formTitle}</h3>
              <span className="text-[10px] text-[#8f9cae]">
                {language === 'bg'
                  ? 'Задръж или кликни на мач за детайли'
                  : 'Hover or click match for details'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home Form Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1">
                  <TeamBadge name={match.homeTeam} logoUrl={liveIntel?.homeLogo || match.homeLogo} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[130px]">
                      {match.homeTeam}
                    </div>
                    <div className="mt-1">{renderInteractiveFormPills(meta.homeFormMatches)}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {meta.homeFormMatches.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPastMatch(m)}
                      className="w-full flex items-center justify-between text-neutral-300 hover:bg-[#0e1622] px-2 py-1 rounded-lg border border-transparent hover:border-[#1e2d40] transition-colors cursor-pointer text-left"
                      title={
                        m.date
                          ? `${m.date} · ${m.homeTeam} ${m.score} ${m.awayTeam}`
                          : `${m.homeTeam} ${m.score} ${m.awayTeam}`
                      }
                    >
                      <span className="text-[#8f9cae] truncate pr-2">{m.opp}</span>
                      <div className="flex items-center gap-1.5 font-mono shrink-0">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                            m.res === 'W'
                              ? 'bg-[#10b981] text-[#04130b]'
                              : m.res === 'D'
                              ? 'bg-[#334155] text-white'
                              : 'bg-[#ef4444] text-white'
                          }`}
                        >
                          {m.res}
                        </span>
                        <span className="text-white font-bold">{m.score}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Away Form Column */}
              <div className="space-y-2 sm:border-l border-[#162232] sm:pl-3">
                <div className="flex items-center gap-2 pb-1">
                  <TeamBadge name={match.awayTeam} logoUrl={liveIntel?.awayLogo || match.awayLogo} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[130px]">
                      {match.awayTeam}
                    </div>
                    <div className="mt-1">{renderInteractiveFormPills(meta.awayFormMatches)}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {meta.awayFormMatches.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPastMatch(m)}
                      className="w-full flex items-center justify-between text-neutral-300 hover:bg-[#0e1622] px-2 py-1 rounded-lg border border-transparent hover:border-[#1e2d40] transition-colors cursor-pointer text-left"
                      title={
                        m.date
                          ? `${m.date} · ${m.homeTeam} ${m.score} ${m.awayTeam}`
                          : `${m.homeTeam} ${m.score} ${m.awayTeam}`
                      }
                    >
                      <span className="text-[#8f9cae] truncate pr-2">{m.opp}</span>
                      <div className="flex items-center gap-1.5 font-mono shrink-0">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                            m.res === 'W'
                              ? 'bg-[#10b981] text-[#04130b]'
                              : m.res === 'D'
                              ? 'bg-[#334155] text-white'
                              : 'bg-[#ef4444] text-white'
                          }`}
                        >
                          {m.res}
                        </span>
                        <span className="text-white font-bold">{m.score}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Head to Head Card */}
          {(meta.h2h.homeWins + meta.h2h.draws + meta.h2h.awayWins > 0 || !isApiMatch) && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3 shadow-xl">
              <h3 className="text-sm font-extrabold text-white">{t.h2hTitle}</h3>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8f9cae] block text-[10px]">
                    {match.homeTeam} {t.wins}
                  </span>
                  <span className="text-base font-mono font-black text-white">
                    {meta.h2h.homeWins}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[#8f9cae] block text-[10px]">{t.draws}</span>
                  <span className="text-base font-mono font-black text-white">
                    {meta.h2h.draws}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8f9cae] block text-[10px]">
                    {match.awayTeam} {t.wins}
                  </span>
                  <span className="text-base font-mono font-black text-white">
                    {meta.h2h.awayWins}
                  </span>
                </div>
              </div>

              {/* 3-Color Bar */}
              <div className="h-2 rounded-full overflow-hidden flex gap-0.5 bg-[#162230]">
                <div
                  className="bg-[#22c55e] h-full"
                  style={{ width: `${(meta.h2h.homeWins / h2hTotal) * 100}%` }}
                />
                <div
                  className="bg-[#64748b] h-full"
                  style={{ width: `${(meta.h2h.draws / h2hTotal) * 100}%` }}
                />
                <div
                  className="bg-[#ef4444] h-full"
                  style={{ width: `${(meta.h2h.awayWins / h2hTotal) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-[#8f9cae]">
                <span>{t.last5Meetings}:</span>
                {renderInteractiveFormPills(meta.h2h.matches, meta.h2h.last5)}
              </div>
            </div>
          )}
        </div>

        {/* PANEL 6: Top Markets Table & Related Fixtures (expands to 6 cols when Lineups is hidden) */}
        <div
          className={`${
            showLineupsPanel ? 'lg:col-span-4' : 'lg:col-span-6'
          } flex flex-col justify-between gap-5`}
        >
          {/* Top Markets Extended Card */}
          <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
              <h3 className="text-sm font-extrabold text-white">{t.topMarkets}</h3>
              <button
                type="button"
                onClick={() => setSubTab('odds')}
                className="text-xs text-[#8f9cae] hover:text-[#43f08a] cursor-pointer"
              >
                {t.viewAllMarkets}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Row 1: Full Time Result */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 text-[#8f9cae] truncate">{t.fullTimeResult}</span>
                <div className="col-span-7 grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        match.homeTeam,
                        activeBookmakerOdds.home,
                        edgePercent,
                        'Full Time Result'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">1</span>
                    <span className="font-bold">{activeBookmakerOdds.home.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        'Draw (X)',
                        activeBookmakerOdds.draw,
                        edgePercent,
                        'Full Time Result'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">X</span>
                    <span className="font-bold">{activeBookmakerOdds.draw.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        match.awayTeam,
                        activeBookmakerOdds.away,
                        edgePercent,
                        'Full Time Result'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">2</span>
                    <span className="font-bold">{activeBookmakerOdds.away.toFixed(2)}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Double Chance */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 text-[#8f9cae] truncate">{t.doubleChance}</span>
                <div className="col-span-7 grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => onLogBet(match, '1X', 1.25, 4.1, 'Double Chance')}
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">1X</span>
                    <span className="font-bold">1.25</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogBet(match, 'X2', 1.88, 5.2, 'Double Chance')}
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">X2</span>
                    <span className="font-bold">1.88</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogBet(match, '12', 1.28, 3.8, 'Double Chance')}
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">12</span>
                    <span className="font-bold">1.28</span>
                  </button>
                </div>
              </div>

              {/* Row 3: Both Teams to Score */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 text-[#8f9cae] truncate">{t.btts}</span>
                <div className="col-span-7 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(match, 'BTTS — Yes', bttsYesOdds, 6.4, 'Both Teams to Score')
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">Yes</span>
                    <span className="font-bold">{bttsYesOdds.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(match, 'BTTS — No', bttsNoOdds, 3.5, 'Both Teams to Score')
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">No</span>
                    <span className="font-bold">{bttsNoOdds.toFixed(2)}</span>
                  </button>
                </div>
              </div>

              {/* Row 4: Over/Under 2.5 */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 text-[#8f9cae] truncate">{t.overUnder25}</span>
                <div className="col-span-7 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(match, 'Over 2.5 Goals', over25Odds, edgePercent, 'Over/Under 2.5')
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">Over</span>
                    <span className="font-bold">{over25Odds.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(match, 'Under 2.5 Goals', under25Odds, 4.0, 'Over/Under 2.5')
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">Under</span>
                    <span className="font-bold">{under25Odds.toFixed(2)}</span>
                  </button>
                </div>
              </div>

              {/* Row 5: Asian Handicap */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 text-[#8f9cae] truncate">{t.asianHandicap}</span>
                <div className="col-span-7 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        `${match.homeTeam} -0.25`,
                        1.92,
                        6.1,
                        'Asian Handicap'
                      )
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b] truncate pr-1">-0.25</span>
                    <span className="font-bold">1.92</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        `${match.awayTeam} +0.25`,
                        1.98,
                        5.4,
                        'Asian Handicap'
                      )
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b] truncate pr-1">+0.25</span>
                    <span className="font-bold">1.98</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Fixtures Card */}
          <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3 shadow-xl flex-1">
            <div className="flex items-center justify-between border-b border-[#162232] pb-2">
              <h3 className="text-sm font-extrabold text-white">{t.relatedFixtures}</h3>
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-[#8f9cae] hover:text-[#43f08a] cursor-pointer"
              >
                {t.viewAllLive}
              </button>
            </div>

            <div className="space-y-2">
              {relatedMatches.map((rm) => (
                <button
                  key={rm.id}
                  type="button"
                  onClick={() => onSelectMatch(rm)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#0e1622] border border-transparent hover:border-[#1c2a3b] text-xs transition-all cursor-pointer"
                >
                  <span className="w-16 text-left font-mono text-[10px]">
                    {rm.status === 'LIVE' ? (
                      <span className="text-[#43f08a] font-bold">● LIVE {rm.minute}&apos;</span>
                    ) : (
                      <span className="text-neutral-400">{rm.startTime}</span>
                    )}
                  </span>

                  <div className="flex items-center gap-2 flex-1 justify-end pr-2">
                    <TeamBadge name={rm.homeTeam} logoUrl={rm.homeLogo} size="sm" />
                    <span className="text-white font-medium truncate max-w-[90px]">
                      {rm.homeTeam}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-[#121c29] font-mono font-bold text-white text-[11px]">
                    {rm.status === 'LIVE' || rm.status === 'FINISHED'
                      ? `${rm.homeScore} - ${rm.awayScore}`
                      : 'vs'}
                  </span>

                  <div className="flex items-center gap-2 flex-1 pl-2">
                    <TeamBadge name={rm.awayTeam} logoUrl={rm.awayLogo} size="sm" />
                    <span className="text-white font-medium truncate max-w-[90px]">
                      {rm.awayTeam}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 5: BOTTOM 4-CARD TRUST BAR */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {[
          { icon: '📈', title: t.trust1Title, sub: t.trust1Sub },
          { icon: '📊', title: t.trust2Title, sub: t.trust2Sub },
          { icon: '🔔', title: t.trust3Title, sub: t.trust3Sub },
          { icon: '🛡️', title: t.trust4Title, sub: t.trust4Sub },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#172332] bg-[#0b111a] p-4 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0f291e] border border-[#22c55e]/40 flex items-center justify-center text-base shrink-0">
              {card.icon}
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">{card.title}</div>
              <div className="text-[11px] text-[#8f9cae] mt-0.5">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* =================================================================== */}
      {/* MODAL WINDOW: PAST MATCH DETAILS WHEN CLICKING A W/D/L FORM DOT */}
      {/* =================================================================== */}
      {selectedPastMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedPastMatch(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#1f3347] bg-[#081018] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#162232] bg-[#0b1520]">
              <div className="flex items-center gap-2 text-xs text-neutral-200 font-semibold">
                <span>⚽</span>
                <span>{pastMatchIntel?.league || selectedPastMatch.league || match.league}</span>
                {(pastMatchIntel?.date || selectedPastMatch.date) && (
                  <>
                    <span className="text-neutral-500">·</span>
                    <span className="font-mono text-[#43f08a]">
                      {pastMatchIntel?.date || selectedPastMatch.date}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPastMatch(null)}
                className="w-7 h-7 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-neutral-300 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scoreboard */}
            <div className="p-6 bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] border-b border-[#162232]">
              <div className="grid grid-cols-11 gap-3 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <TeamBadge
                    name={selectedPastMatch.homeTeam}
                    logoUrl={pastMatchIntel?.homeLogo || selectedPastMatch.homeLogo}
                    size="md"
                  />
                  <span className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    {selectedPastMatch.homeTeam}
                  </span>
                </div>

                <div className="col-span-3 text-center">
                  <div className="inline-block rounded-xl border border-[#1f3144] bg-[#060b12]/90 px-4 py-2">
                    <div className="text-[10px] font-mono font-bold text-[#43f08a] uppercase">
                      {pastMatchIntel?.halftimeScore ||
                        (language === 'bg' ? 'КРАЕН РЕЗУЛТАТ' : 'FINAL SCORE')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {pastMatchIntel?.homeScore ?? selectedPastMatch.homeScore} -{' '}
                      {pastMatchIntel?.awayScore ?? selectedPastMatch.awayScore}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-end gap-3 text-right">
                  <span className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    {selectedPastMatch.awayTeam}
                  </span>
                  <TeamBadge
                    name={selectedPastMatch.awayTeam}
                    logoUrl={pastMatchIntel?.awayLogo || selectedPastMatch.awayLogo}
                    size="md"
                  />
                </div>
              </div>

              {(pastMatchIntel?.venue || pastMatchIntel?.referee) && (
                <div className="mt-3 pt-2.5 border-t border-[#162434] flex items-center justify-center gap-3 text-[11px] text-[#8f9cae]">
                  {pastMatchIntel?.venue && <span>📍 {pastMatchIntel.venue}</span>}
                  {pastMatchIntel?.referee && (
                    <span>
                      {t.referee}: <strong className="text-neutral-300">{pastMatchIntel.referee}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Body: Real Timeline Events & Stats (if available) */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {pastMatchLoading ? (
                <div className="py-8 text-center text-xs text-[#8f9cae] font-mono">
                  {language === 'bg'
                    ? 'Зареждане на официална хронология на мача...'
                    : 'Loading official match events...'}
                </div>
              ) : (
                <>
                  {/* Timeline Events */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8f9cae]">
                      {language === 'bg' ? 'Хронология на срещата' : 'Match Timeline'}
                    </h4>
                    {pastMatchIntel?.events && pastMatchIntel.events.length > 0 ? (
                      <div className="space-y-1.5">
                        {pastMatchIntel.events.map((ev, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-2 rounded-xl border text-xs ${
                              ev.highlight
                                ? 'border-[#1e553b] bg-[#0d2119]'
                                : 'border-[#15202e] bg-[#0b121c]'
                            }`}
                          >
                            <span className="w-10 font-mono text-[11px] text-[#43f08a] font-bold">
                              {ev.min}
                            </span>
                            <span className="text-sm">{ev.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white truncate">{ev.title}</div>
                              <div className="text-[11px] text-[#8f9cae] truncate">{ev.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-[#15202e] bg-[#0b121c] text-xs text-[#8f9cae]">
                        {selectedPastMatch.homeTeam} {selectedPastMatch.score}{' '}
                        {selectedPastMatch.awayTeam}
                      </div>
                    )}
                  </div>

                  {/* Optical Statistics if API-Football has them for this historical match */}
                  {pastMatchIntel?.hasRealStats && pastMatchIntel.stats && (
                    <div className="space-y-2 pt-2 border-t border-[#162232]">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8f9cae]">
                        {language === 'bg' ? 'Статистика от мача' : 'Match Statistics'}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                        <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                          <span className="text-[10px] text-[#8f9cae] block">{t.possession}</span>
                          <span className="font-bold text-white">
                            {pastMatchIntel.stats.possessionHome}% -{' '}
                            {pastMatchIntel.stats.possessionAway}%
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                          <span className="text-[10px] text-[#8f9cae] block">{t.shots}</span>
                          <span className="font-bold text-white">
                            {pastMatchIntel.stats.shotsHome} ({pastMatchIntel.stats.shotsOnTargetHome}) -{' '}
                            {pastMatchIntel.stats.shotsAway} ({pastMatchIntel.stats.shotsOnTargetAway})
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                          <span className="text-[10px] text-[#8f9cae] block">{t.corners}</span>
                          <span className="font-bold text-white">
                            {pastMatchIntel.stats.cornersHome} - {pastMatchIntel.stats.cornersAway}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                          <span className="text-[10px] text-[#8f9cae] block">🟨 {t.yellowCards}</span>
                          <span className="font-bold text-white">
                            {pastMatchIntel.stats.yellowCardsHome} -{' '}
                            {pastMatchIntel.stats.yellowCardsAway}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#162232] bg-[#0b1520] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPastMatch(null)}
                className="px-4 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#43f08a] text-[#04130b] font-extrabold text-xs cursor-pointer transition-colors"
              >
                {language === 'bg' ? 'Затвори прозореца' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

