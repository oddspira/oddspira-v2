import React, { useState } from 'react';
import { ActiveTab, Language, Match } from '../types';
import { computePoissonMatrix } from '../utils/mathModels';
import { TeamBadge } from './TeamBadge';

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
  homeFormMatches: { opp: string; res: 'W' | 'D' | 'L'; score: string }[];
  awayFormMatches: { opp: string; res: 'W' | 'D' | 'L'; score: string }[];
  h2h: { homeWins: number; draws: number; awayWins: number; last5: ('W' | 'D' | 'L')[] };
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

const getMatchMetadata = (match: Match): MatchMetadata => {
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
        { opp: 'vs Brighton', res: 'W', score: '4-1' },
        { opp: '@ Everton', res: 'W', score: '1-0' },
        { opp: 'vs Arsenal', res: 'D', score: '1-1' },
        { opp: '@ Spurs', res: 'W', score: '3-2' },
        { opp: 'vs Aston Villa', res: 'L', score: '1-2' },
      ],
      awayFormMatches: [
        { opp: 'vs Chelsea', res: 'W', score: '2-1' },
        { opp: '@ Crystal Palace', res: 'D', score: '1-1' },
        { opp: 'vs Brentford', res: 'L', score: '0-2' },
        { opp: '@ Burnley', res: 'W', score: '3-1' },
        { opp: 'vs Liverpool', res: 'D', score: '2-2' },
      ],
      h2h: { homeWins: 9, draws: 10, awayWins: 15, last5: ['D', 'L', 'W', 'D', 'W'] },
    };
  }

  if (id === 'match-leverkusen-roma') {
    return {
      stadium: 'BayArena, Leverkusen',
      attendance: '30,210',
      referee: 'Daniele Orsato',
      weather: '16°C, Clear',
      pitch: 'Excellent',
      homeFormation: '3-4-2-1',
      awayFormation: '4-3-3',
      homeScorerText: "F. Wirtz 21', P. Schick 34'",
      awayScorerText: "P. Dybala 56'",
      homePlayers: [
        { num: 1, name: 'Hrádecký', x: 7, y: 50 },
        { num: 12, name: 'Tapsoba', x: 19, y: 24 },
        { num: 4, name: 'Tah', x: 18, y: 50 },
        { num: 3, name: 'Hincapié', x: 19, y: 76 },
        { num: 30, name: 'Frimpong', x: 33, y: 18 },
        { num: 34, name: 'Xhaka', x: 31, y: 40 },
        { num: 8, name: 'Andrich', x: 31, y: 60 },
        { num: 20, name: 'Grimaldo', x: 33, y: 82 },
        { num: 10, name: 'Wirtz', x: 44, y: 32 },
        { num: 14, name: 'Schick', x: 46, y: 50 },
        { num: 7, name: 'Hofmann', x: 44, y: 68 },
      ],
      awayPlayers: [
        { num: 99, name: 'Svilar', x: 93, y: 50 },
        { num: 19, name: 'Çelik', x: 80, y: 18 },
        { num: 23, name: 'Mancini', x: 82, y: 38 },
        { num: 5, name: 'Ndicka', x: 82, y: 62 },
        { num: 69, name: 'Angeliño', x: 80, y: 82 },
        { num: 4, name: 'Cristante', x: 67, y: 30 },
        { num: 16, name: 'Paredes', x: 68, y: 50 },
        { num: 7, name: 'Pellegrini', x: 67, y: 70 },
        { num: 21, name: 'Dybala', x: 56, y: 24 },
        { num: 90, name: 'Lukaku', x: 54, y: 50 },
        { num: 92, name: 'El Shaarawy', x: 56, y: 76 },
      ],
      homeFormMatches: [
        { opp: 'vs Stuttgart', res: 'W', score: '2-1' },
        { opp: '@ Dortmund', res: 'D', score: '1-1' },
        { opp: 'vs West Ham', res: 'W', score: '2-0' },
        { opp: 'vs Bremen', res: 'W', score: '5-0' },
        { opp: '@ Atalanta', res: 'L', score: '0-3' },
      ],
      awayFormMatches: [
        { opp: 'vs AC Milan', res: 'W', score: '2-1' },
        { opp: '@ Bologna', res: 'L', score: '1-3' },
        { opp: '@ Napoli', res: 'D', score: '2-2' },
        { opp: 'vs Udinese', res: 'W', score: '2-1' },
        { opp: 'vs Juventus', res: 'D', score: '1-1' },
      ],
      h2h: { homeWins: 2, draws: 3, awayWins: 2, last5: ['D', 'W', 'L', 'D', 'W'] },
    };
  }

  return {
    stadium: `${match.homeTeam} Arena, ${match.leagueCountry}`,
    attendance: '48,920',
    referee: 'Michael Oliver',
    weather: '15°C, Clear',
    pitch: 'Excellent',
    homeFormation: '4-3-3',
    awayFormation: '4-2-3-1',
    homeScorerText:
      match.homeScore > 0
        ? match.events.find((e) => e.type === 'goal' && e.team === 'home')?.description.slice(0, 22) ||
          `${match.homeTeam} 24'`
        : 'Pre-Match Model Active',
    homePlayers: DEFAULT_HOME_PLAYERS,
    awayPlayers: DEFAULT_AWAY_PLAYERS,
    homeFormMatches: [
      { opp: 'vs Villa', res: 'W', score: '3-1' },
      { opp: '@ Brighton', res: 'W', score: '2-0' },
      { opp: 'vs Spurs', res: 'D', score: '2-2' },
      { opp: '@ Everton', res: 'W', score: '1-0' },
      { opp: 'vs City', res: 'L', score: '1-2' },
    ],
    awayFormMatches: [
      { opp: 'vs Fulham', res: 'W', score: '2-1' },
      { opp: '@ Palace', res: 'D', score: '1-1' },
      { opp: 'vs West Ham', res: 'L', score: '0-2' },
      { opp: '@ Wolves', res: 'W', score: '3-1' },
      { opp: 'vs Newcastle', res: 'D', score: '1-1' },
    ],
    h2h: { homeWins: 11, draws: 8, awayWins: 12, last5: ['W', 'D', 'L', 'W', 'D'] },
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
  const meta = getMatchMetadata(match);

  const [subTab, setSubTab] = useState<
    'overview' | 'stats' | 'timeline' | 'lineups' | 'h2h' | 'odds' | 'predictions'
  >('overview');
  const [isTracked, setIsTracked] = useState<boolean>(false);

  const isLive = match.status === 'LIVE';
  const posHome = match.stats.possessionHome || 56;
  const posAway = match.stats.possessionAway || 44;
  const shotsHome = match.stats.shotsHome || 7;
  const shotsAway = match.stats.shotsAway || 6;
  const sotHome = match.stats.shotsOnTargetHome || 3;
  const sotAway = match.stats.shotsOnTargetAway || 2;
  const cornersHome = match.stats.cornersHome || 4;
  const cornersAway = match.stats.cornersAway || 2;
  const foulsHome = 8;
  const foulsAway = 10;
  const yellowHome = 1;
  const yellowAway = 2;

  const over25Odds = 1.78;
  const under25Odds = 2.05;
  const bttsYesOdds = 1.65;
  const bttsNoOdds = 2.25;

  const edgePercent = match.valueBetDetected?.edgePercent || 12.47;
  const recKelly = match.valueBetDetected?.recommendedStakeKelly || 2.5;
  const bestMarketLabel =
    match.valueBetDetected?.selection === 'over25'
      ? 'Over 2.5 Goals'
      : match.valueBetDetected?.selection === 'draw'
      ? 'Draw (X)'
      : `${match.homeTeam} Win`;

  const poissonMatrix = computePoissonMatrix(
    match.fairOdds.expectedGoalsHome,
    match.fairOdds.expectedGoalsAway,
    true
  );

  // Timeline events (either match.events or rich fallback matching the screenshot)
  const timelineItems =
    match.id === 'match-newcastle-manutd' || match.events.length === 0
      ? [
          {
            min: "67'",
            icon: '🟨',
            title: 'Bruno Fernandes',
            sub: 'Yellow Card',
          },
          {
            min: "63'",
            icon: '🔄',
            title: 'Substitution',
            sub: 'R. Højlund ↔ M. Rashford',
          },
          {
            min: "45'+2",
            icon: '⏱️',
            title: 'Half Time',
            sub: `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`,
          },
          {
            min: "32'",
            icon: '⚽',
            title: 'GOAL!',
            sub: `A. Gordon   1 - 0`,
            highlight: true,
          },
          {
            min: "18'",
            icon: '🟨',
            title: 'S. Longstaff',
            sub: 'Yellow Card',
          },
          {
            min: "8'",
            icon: '🚩',
            title: 'K. Trippier',
            sub: 'Corner',
          },
        ]
      : match.events.map((ev) => ({
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
        }));

  const relatedMatches = allMatches.filter((m) => m.id !== match.id).slice(0, 4);

  const renderFormPills = (pills: ('W' | 'D' | 'L')[]) => (
    <div className="flex items-center gap-1">
      {pills.map((r, i) => (
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

  // Donut math for Last 5 Min Possession (62% / 38%)
  const rDonut = 18;
  const cDonut = 2 * Math.PI * rDonut;
  const stroke62 = 0.62 * cDonut;

  const h2hTotal = meta.h2h.homeWins + meta.h2h.draws + meta.h2h.awayWins;

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
            <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
            <span>{match.leagueCountry}</span>
          </span>
          <span className="text-neutral-600">›</span>
          <button
            type="button"
            onClick={() => setActiveTab('competitions')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {match.league}
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
        <div className="xl:col-span-8 rounded-2xl border border-[#1a2938] bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Subtle dot grid & emerald stadium glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
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
              <span>⚽</span>
              <span>{match.league}</span>
              <span className="text-neutral-500">·</span>
              <span className="text-[#94a3b8] font-normal">{t.matchweek}</span>
            </div>
            <div className="text-[11px] text-[#8f9cae] flex items-center justify-center gap-3">
              <span>📍 {meta.stadium}</span>
              <span>·</span>
              <span>👥 {meta.attendance}</span>
            </div>
          </div>

          {/* Center 3-Column Scoreboard */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-11 gap-4 items-center my-5">
            {/* Home Team (4 cols) */}
            <div className="sm:col-span-4 flex items-center justify-center sm:justify-start gap-4">
              <TeamBadge name={match.homeTeam} size="lg" className="w-16 h-16 text-base rounded-2xl" />
              <div className="space-y-1.5">
                <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {match.homeTeam}
                </h1>
                {renderFormPills(['W', 'W', 'D', 'W', 'L'])}
                <div className="text-xs text-neutral-300 pt-1 flex items-center gap-1.5 font-mono">
                  <span>{meta.homeScorerText}</span>
                  {match.homeScore > 0 && <span className="text-[#43f08a]">⚽</span>}
                </div>
              </div>
            </div>

            {/* Center Score Box (3 cols) */}
            <div className="sm:col-span-3 flex justify-center">
              <div className="rounded-2xl border border-[#1f3144] bg-[#060b12]/90 px-7 py-3.5 text-center shadow-inner min-w-[150px]">
                {isLive ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#43f08a] mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-ping" />
                    <span>LIVE {match.minute}&apos;</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono font-bold text-amber-400 mb-1">
                    {match.startTime}
                  </div>
                )}
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider tabular-nums">
                  {match.homeScore} - {match.awayScore}
                </div>
                <div className="text-[11px] font-mono text-[#8f9cae] mt-1">
                  {isLive ? `HT ${Math.min(match.homeScore, 1)} - 0` : 'PRE-MATCH'}
                </div>
              </div>
            </div>

            {/* Away Team (4 cols) */}
            <div className="sm:col-span-4 flex items-center justify-center sm:justify-end gap-4 text-right">
              <div className="space-y-1.5 flex flex-col items-end">
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {match.awayTeam}
                </h2>
                {renderFormPills(['W', 'D', 'L', 'W', 'D'])}
                {meta.awayScorerText && (
                  <div className="text-xs text-neutral-300 pt-1 flex items-center gap-1.5 font-mono">
                    <span className="text-[#43f08a]">⚽</span>
                    <span>{meta.awayScorerText}</span>
                  </div>
                )}
              </div>
              <TeamBadge name={match.awayTeam} size="lg" className="w-16 h-16 text-base rounded-2xl" />
            </div>
          </div>

          {/* Bottom Referee & Weather Info */}
          <div className="relative z-10 text-center text-[11px] text-[#8f9cae] border-t border-[#172434]/80 pt-3">
            <span>
              {t.referee}: <strong className="text-neutral-300">{meta.referee}</strong>
            </span>
            <span className="mx-2.5">·</span>
            <span>
              {t.weather}: <strong className="text-neutral-300">{meta.weather}</strong>
            </span>
            <span className="mx-2.5">·</span>
            <span>
              {t.pitch}: <strong className="text-neutral-300">{meta.pitch}</strong>
            </span>
          </div>
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
                      match.bookmakerOdds.home,
                      edgePercent,
                      'Full Time Result'
                    )
                  }
                  className="py-2 px-1 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">1</span>
                  <span className="font-bold text-white">{match.bookmakerOdds.home.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(
                      match,
                      'Draw (X)',
                      match.bookmakerOdds.draw,
                      edgePercent,
                      'Full Time Result'
                    )
                  }
                  className="py-2 px-1 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">X</span>
                  <span className="font-bold text-white">{match.bookmakerOdds.draw.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLogBet(
                      match,
                      match.awayTeam,
                      match.bookmakerOdds.away,
                      edgePercent,
                      'Full Time Result'
                    )
                  }
                  className="py-2 px-1 rounded-lg border border-[#1d2b3c] bg-[#0e1622] hover:border-[#43f08a] text-center cursor-pointer transition-colors"
                >
                  <span className="text-[#64748b] block text-[9px]">2</span>
                  <span className="font-bold text-white">{match.bookmakerOdds.away.toFixed(2)}</span>
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
      {/* ROW 2: SUB-NAVIGATION TABS BAR */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-[#162230] bg-[#090f17] px-3 py-1.5 text-xs font-semibold">
        {[
          { key: 'overview', label: t.tabOverview, icon: '📊' },
          { key: 'stats', label: t.tabStats, icon: '📈' },
          { key: 'timeline', label: t.tabTimeline, icon: '⏱️' },
          { key: 'lineups', label: t.tabLineups, icon: '👕' },
          { key: 'h2h', label: t.tabH2H, icon: '⚔️' },
          { key: 'odds', label: t.tabOdds, icon: '🎯' },
          { key: 'predictions', label: t.tabPredictions, icon: '🧠' },
        ].map((item) => {
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
      {/* ROW 3: MATCH OVERVIEW (4) | TIMELINE (4) | BETTING INSIGHTS (4) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: Match Overview (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3">
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
                <TeamBadge name={match.homeTeam} size="sm" />
                <span className="text-2xl font-black text-white font-mono">{match.homeScore}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TeamBadge name={match.awayTeam} size="sm" />
                <span className="text-2xl font-black text-white font-mono">{match.awayScore}</span>
              </div>
            </div>

            {/* Center 8 Stat Bars (6 cols) */}
            <div className="col-span-6 space-y-2 text-[10px] font-mono">
              {[
                {
                  label: 'xG',
                  homeVal: match.fairOdds.expectedGoalsHome.toFixed(2),
                  awayVal: match.fairOdds.expectedGoalsAway.toFixed(2),
                  homePct: 68,
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
                  homePct: (foulsHome / (foulsHome + foulsAway)) * 100,
                },
                {
                  label: `🟨 ${t.yellowCards}`,
                  homeVal: yellowHome,
                  awayVal: yellowAway,
                  homePct: 33,
                },
                {
                  label: `🟥 ${t.redCards}`,
                  homeVal: 0,
                  awayVal: 0,
                  homePct: 50,
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
              {/* Momentum Mini Chart */}
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

              {/* Last 5 Min Possession Donut */}
              <div className="text-center">
                <span className="text-[10px] font-semibold text-neutral-300 block mb-1.5">
                  {t.last5MinPos}
                </span>
                <div className="flex items-center justify-center gap-2 font-mono text-xs">
                  <span className="font-bold text-white">62%</span>
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r={rDonut} fill="none" stroke="#334155" strokeWidth="5" />
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
                  <span className="font-bold text-neutral-300">38%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
      {/* ROW 4: LINEUPS (4) | FORM & H2H (4) | TOP MARKETS & RELATED (4) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 4: Lineups 2D Tactical Pitch (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">{t.lineups}</h3>
          </div>

          {/* Teams & Formations Header */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <TeamBadge name={match.homeTeam} size="sm" />
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
              <TeamBadge name={match.awayTeam} size="sm" />
            </div>
          </div>

          {/* 2D Tactical Football Pitch */}
          <div className="relative w-full h-64 rounded-xl border border-[#1f3347] bg-gradient-to-r from-[#0a1921] via-[#0c2228] to-[#0a1921] overflow-hidden select-none">
            {/* Pitch markings SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
              {/* Outer border */}
              <rect x="10" y="10" width="380" height="220" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
              {/* Halfway line */}
              <line x1="200" y1="10" x2="200" y2="230" stroke="#1e3a4c" strokeWidth="1.5" />
              {/* Center circle */}
              <circle cx="200" cy="120" r="32" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
              <circle cx="200" cy="120" r="2" fill="#1e3a4c" />
              {/* Left penalty box */}
              <rect x="10" y="55" width="55" height="130" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
              <rect x="10" y="85" width="22" height="70" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
              {/* Right penalty box */}
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

        {/* PANEL 5: Form & Head to Head (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5">
          {/* Form Card */}
          <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl flex-1">
            <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
              <h3 className="text-sm font-extrabold text-white">{t.formTitle}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Home Form Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1">
                  <TeamBadge name={match.homeTeam} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                      {match.homeTeam}
                    </div>
                    <div className="mt-0.5">{renderFormPills(['W', 'W', 'D', 'W', 'L'])}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {meta.homeFormMatches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-neutral-300">
                      <span className="text-[#8f9cae] truncate">{m.opp}</span>
                      <div className="flex items-center gap-1.5 font-mono">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Form Column */}
              <div className="space-y-2 border-l border-[#162232] pl-3">
                <div className="flex items-center gap-2 pb-1">
                  <TeamBadge name={match.awayTeam} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                      {match.awayTeam}
                    </div>
                    <div className="mt-0.5">{renderFormPills(['W', 'D', 'L', 'W', 'D'])}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {meta.awayFormMatches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-neutral-300">
                      <span className="text-[#8f9cae] truncate">{m.opp}</span>
                      <div className="flex items-center gap-1.5 font-mono">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Head to Head Card */}
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
              {renderFormPills(meta.h2h.last5)}
            </div>
          </div>
        </div>

        {/* PANEL 6: Top Markets Table & Related Fixtures (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5">
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
                        match.bookmakerOdds.home,
                        edgePercent,
                        'Full Time Result'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">1</span>
                    <span className="font-bold">{match.bookmakerOdds.home.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        'Draw (X)',
                        match.bookmakerOdds.draw,
                        edgePercent,
                        'Full Time Result'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">X</span>
                    <span className="font-bold">{match.bookmakerOdds.draw.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        match.awayTeam,
                        match.bookmakerOdds.away,
                        edgePercent,
                        'Full Time Result'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">2</span>
                    <span className="font-bold">{match.bookmakerOdds.away.toFixed(2)}</span>
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
                    onClick={() => onLogBet(match, 'BTTS — Yes', 1.65, 6.4, 'Both Teams to Score')}
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">Yes</span>
                    <span className="font-bold">1.65</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogBet(match, 'BTTS — No', 2.25, 3.5, 'Both Teams to Score')}
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">No</span>
                    <span className="font-bold">2.25</span>
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
                      onLogBet(match, 'Over 2.5 Goals', 1.78, edgePercent, 'Over/Under 2.5')
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">Over</span>
                    <span className="font-bold">1.78</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(match, 'Under 2.5 Goals', 2.05, 4.0, 'Over/Under 2.5')
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">Under</span>
                    <span className="font-bold">2.05</span>
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
                    <TeamBadge name={rm.homeTeam} size="sm" />
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
                    <TeamBadge name={rm.awayTeam} size="sm" />
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
    </div>
  );
};
