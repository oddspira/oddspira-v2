import React, { useEffect, useState } from 'react';
import { ActiveTab, BetRecord, Language, Match } from '../types';
import { computePoissonMatrix } from '../utils/mathModels';
import { TeamBadge, LeagueBadge, openTeamProfile } from './TeamBadge';

interface LiveMatchesBoardProps {
  language: Language;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  onLogBet: (match: Match, selection: string, odds: number, ev: number, market?: string, stake?: number) => void;
  bets?: BetRecord[];
  setBets?: React.Dispatch<React.SetStateAction<BetRecord[]>>;
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenMatch?: (match: Match) => void;
}

interface SlipItem {
  id: string;
  matchId: string;
  matchTitle: string;
  market: string;
  selection: string;
  odds: number;
  evPercent: number;
}

const TEAM_FORMS: Record<string, ('W' | 'D' | 'L')[]> = {
  'Bayer Leverkusen': ['W', 'W', 'D', 'W', 'L'],
  'AS Roma': ['W', 'L', 'D', 'W', 'D'],
  'Man City': ['W', 'W', 'W', 'D', 'W'],
  'Young Boys': ['L', 'D', 'L', 'W', 'L'],
  'Real Madrid': ['W', 'W', 'W', 'W', 'W'],
  Villarreal: ['W', 'D', 'L', 'W', 'D'],
  Liverpool: ['W', 'W', 'D', 'W', 'W'],
  Tottenham: ['D', 'L', 'W', 'L', 'D'],
  'AC Milan': ['W', 'D', 'L', 'W', 'W'],
  Atalanta: ['W', 'W', 'D', 'L', 'W'],
  Arsenal: ['W', 'W', 'W', 'D', 'W'],
  Chelsea: ['D', 'W', 'L', 'W', 'D'],
  Barcelona: ['W', 'W', 'L', 'W', 'W'],
  Juventus: ['W', 'D', 'D', 'W', 'W'],
  'Bayern Munich': ['W', 'W', 'W', 'W', 'D'],
  Dortmund: ['W', 'L', 'W', 'D', 'W'],
  'Sporting CP': ['W', 'W', 'W', 'W', 'W'],
  'Sturm Graz': ['L', 'W', 'D', 'L', 'W'],
};

const EXTRA_MARKETS_COUNT: Record<string, number> = {
  'match-mancity-youngboys': 128,
  'match-realmadrid-villarreal': 132,
  'match-liverpool-tottenham': 115,
  'match-milan-atalanta': 110,
  'match-arsenal-chelsea': 124,
  'match-barca-real': 138,
  'match-milan-juve': 118,
  'match-bayern-dortmund': 129,
  'match-sporting-sturm': 94,
};

const HT_SCORES: Record<string, string> = {
  'match-leverkusen-roma': 'HT 1-0',
  'match-mancity-youngboys': 'HT 1-0',
  'match-realmadrid-villarreal': 'HT 2-1',
  'match-liverpool-tottenham': 'HT 1-1',
  'match-milan-atalanta': 'HT 0-0',
  'match-sporting-sturm': 'HT 1-0',
};

const DICT = {
  bg: {
    pageTitle: 'Мачове на живо',
    pageSub: 'Следете всеки момент, откривайте стойност (+EV) и добавяйте залози директно в Моите залози.',
    badgeRealtime: 'Данни в реално време',
    badgeAnalytics: 'Разширена аналитика',
    badgeTrusted: 'Доверен от анализатори',
    liveUpdates: 'Обновяване в реално време',
    liveMatchesStat: 'Мачове на живо',
    acrossLeagues: 'В 23 първенства',
    goalAlerts: 'Известия за гол',
    last15Min: 'Последните 15 мин',
    trackedBets: 'Следени залози',
    acrossMarkets: 'Във всички пазари',
    lastUpdated: 'Последно обновено',
    justNow: 'Току-що',
    allMatches: 'Всички мачове',
    liveNow: 'На живо сега',
    upcoming: 'Предстоящи днес',
    finished: 'Завършили',
    favorites: 'Любими',
    searchPlaceholder: 'Търсене на отбор или лига...',
    allCountries: 'Всички държави',
    allLeagues: 'Всички лиги',
    allTimes: 'Всички часове',
    allMarkets: 'Всички пазари',
    compact: 'Компактен',
    soundAlerts: 'Звукови известия',
    featuredMatch: 'ВОДЕЩ МАЧ НА ЖИВО',
    momentum: 'МОМЕНТУМ НА МАЧА',
    liveStats: 'СТАТИСТИКА НА ЖИВО',
    possession: 'Владеене на топката',
    shotsOnTarget: 'Точни удари',
    dangerousAttacks: 'Опасни атаки',
    addBet: 'Добави залог',
    matchDetails: 'Детайли ›',
    details: 'Детайли ›',
    colLeagueMatch: 'ЛИГА & МАЧ',
    colScore: 'РЕЗУЛТАТ',
    colMarkets: 'ПАЗАРИ (1X2)',
    colXg: 'xG',
    colPos: 'ВЛАД.',
    colDangerous: 'ОПАСНИ АТАКИ',
    quickBetSlip: 'Бърз фиш (Bet Slip)',
    combinedOdds: 'Общ коефициент',
    stakeLabel: 'Залог (€)',
    potentialPayout: 'Потенциална печалба',
    saveToMyBets: 'Запиши в Моите залози',
    myBetsTitle: 'Моите залози',
    viewAll: 'Виж всички',
    tabLive: 'Активни',
    tabCashOut: 'Кешаут',
    tabSettled: 'Уредени',
    cashOutBtn: 'КЕШАУТ',
    stakeText: 'Залог',
    payoutText: 'Изплащане',
    addSelectionBtn: '+ Избери коефициент от таблицата',
    smarterTitle: 'По-умните залози започват с по-умни инструменти.',
    smarterSub: 'Получете математическо предимство (+EV), известия на живо и дълбока аналитика.',
    feat1Title: 'Данни в реално време',
    feat1Sub: 'Свръхбързо обновяване',
    feat2Title: 'Разширена аналитика',
    feat2Sub: 'xG, моментум и Poisson',
    feat3Title: 'Персонални аларми',
    feat3Sub: 'Не изпускайте +EV стойност',
    exploreTools: 'Разгледай Инструменти',
    emptySlip: 'Кликнете върху коефициент (1, X, 2) или „Добави залог“, за да добавите селекция.',
    directMyBetsBtn: '+ Запиши директно в Моите залози',
    modalClose: 'Затвори',
    modalMarketsTitle: 'Налични пазари за залог (Директно към Моите залози)',
  },
  en: {
    pageTitle: 'Live Matches',
    pageSub: 'Follow every moment, spot value, and add bets in seconds.',
    badgeRealtime: 'Real-time data',
    badgeAnalytics: 'Advanced analytics',
    badgeTrusted: 'Trusted by bettors',
    liveUpdates: 'Real-time updates',
    liveMatchesStat: 'Live Matches',
    acrossLeagues: 'Across 23 Leagues',
    goalAlerts: 'Goal Alerts',
    last15Min: 'Last 15 minutes',
    trackedBets: 'Tracked Bets',
    acrossMarkets: 'Across all markets',
    lastUpdated: 'Last Updated',
    justNow: 'Just now',
    allMatches: 'All Matches',
    liveNow: 'Live Now',
    upcoming: 'Upcoming',
    finished: 'Finished',
    favorites: 'Favorites',
    searchPlaceholder: 'Search teams or leagues...',
    allCountries: 'All Countries',
    allLeagues: 'All Leagues',
    allTimes: 'All Times',
    allMarkets: 'All Markets',
    compact: 'Compact',
    soundAlerts: 'Sound Alerts',
    featuredMatch: 'FEATURED MATCH',
    momentum: 'MOMENTUM',
    liveStats: 'LIVE STATS',
    possession: 'Possession',
    shotsOnTarget: 'Shots on Target',
    dangerousAttacks: 'Dangerous Attacks',
    addBet: 'Add Bet',
    matchDetails: 'Match Details ›',
    details: 'Details ›',
    colLeagueMatch: 'LEAGUE & MATCH',
    colScore: 'SCORE',
    colMarkets: 'MARKETS',
    colXg: 'xG',
    colPos: 'POS',
    colDangerous: 'DANGEROUS ATTACKS',
    quickBetSlip: 'Quick Bet Slip',
    combinedOdds: 'Combined Odds',
    stakeLabel: 'Stake ($)',
    potentialPayout: 'Potential Payout',
    saveToMyBets: 'Review & Save to My Bets',
    myBetsTitle: 'My Bets',
    viewAll: 'View All',
    tabLive: 'Live',
    tabCashOut: 'Cash Out',
    tabSettled: 'Settled',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Stake',
    payoutText: 'Payout',
    addSelectionBtn: '+ Add selection to betslip',
    smarterTitle: 'Smarter bets start with smarter tools.',
    smarterSub: 'Get edge-driven insights, live alerts, and powerful analytics.',
    feat1Title: 'Real-time data',
    feat1Sub: 'Ultra-fast updates',
    feat2Title: 'Advanced analytics',
    feat2Sub: 'xG, momentum & more',
    feat3Title: 'Custom alerts',
    feat3Sub: 'Never miss value',
    exploreTools: 'Explore Tools',
    emptySlip: 'Click any odds button (1, X, 2) or "Add Bet" to add a selection.',
    directMyBetsBtn: '+ Save Directly to My Bets',
    modalClose: 'Close',
    modalMarketsTitle: 'Available Markets (1-Click Add to My Bets)',
  },
  es: {
    pageTitle: 'Partidos en Vivo',
    pageSub: 'Sigue cada momento, detecta valor y añade apuestas en segundos.',
    badgeRealtime: 'Datos en tiempo real',
    badgeAnalytics: 'Analítica avanzada',
    badgeTrusted: 'Confiado por apostadores',
    liveUpdates: 'Actualización en vivo',
    liveMatchesStat: 'Partidos en Vivo',
    acrossLeagues: 'En 23 Ligas',
    goalAlerts: 'Alertas de Gol',
    last15Min: 'Últimos 15 minutos',
    trackedBets: 'Apuestas Seguidas',
    acrossMarkets: 'En todos los mercados',
    lastUpdated: 'Última Actualización',
    justNow: 'Ahora mismo',
    allMatches: 'Todos los Partidos',
    liveNow: 'En Vivo Ahora',
    upcoming: 'Próximos',
    finished: 'Finalizados',
    favorites: 'Favoritos',
    searchPlaceholder: 'Buscar equipos o ligas...',
    allCountries: 'Todos los Países',
    allLeagues: 'Todas las Ligas',
    allTimes: 'Todos los Horarios',
    allMarkets: 'Todos los Mercados',
    compact: 'Compacto',
    soundAlerts: 'Alertas de Sonido',
    featuredMatch: 'PARTIDO DESTACADO',
    momentum: 'MOMENTUM',
    liveStats: 'STATS EN VIVO',
    possession: 'Posesión',
    shotsOnTarget: 'Tiros a Puerta',
    dangerousAttacks: 'Ataques Peligrosos',
    addBet: 'Añadir Apuesta',
    matchDetails: 'Detalles ›',
    details: 'Detalles ›',
    colLeagueMatch: 'LIGA Y PARTIDO',
    colScore: 'MARCADOR',
    colMarkets: 'MERCADOS',
    colXg: 'xG',
    colPos: 'POS',
    colDangerous: 'ATAQUES PELIGROSOS',
    quickBetSlip: 'Boleto Rápido',
    combinedOdds: 'Cuota Combinada',
    stakeLabel: 'Importe ($)',
    potentialPayout: 'Pago Potencial',
    saveToMyBets: 'Guardar en Mis Apuestas',
    myBetsTitle: 'Mis Apuestas',
    viewAll: 'Ver Todo',
    tabLive: 'En Vivo',
    tabCashOut: 'Cash Out',
    tabSettled: 'Resueltas',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Importe',
    payoutText: 'Pago',
    addSelectionBtn: '+ Añadir selección al boleto',
    smarterTitle: 'Apuestas más inteligentes empiezan con mejores herramientas.',
    smarterSub: 'Obtén ventaja estadística, alertas en vivo y analítica avanzada.',
    feat1Title: 'Datos en tiempo real',
    feat1Sub: 'Actualizaciones ultrarrápidas',
    feat2Title: 'Analítica avanzada',
    feat2Sub: 'xG, momentum y más',
    feat3Title: 'Alertas personalizadas',
    feat3Sub: 'Nunca pierdas valor',
    exploreTools: 'Explorar Herramientas',
    emptySlip: 'Haz clic en cualquier cuota (1, X, 2) o en "Añadir Apuesta".',
    directMyBetsBtn: '+ Guardar directo en Mis Apuestas',
    modalClose: 'Cerrar',
    modalMarketsTitle: 'Mercados Disponibles (Guardar en Mis Apuestas)',
  },
  de: {
    pageTitle: 'Live-Spiele',
    pageSub: 'Verfolgen Sie jeden Moment, erkennen Sie Value und fügen Sie Wetten in Sekunden hinzu.',
    badgeRealtime: 'Echtzeit-Daten',
    badgeAnalytics: 'Erweiterte Analytik',
    badgeTrusted: 'Von Profis genutzt',
    liveUpdates: 'Echtzeit-Updates',
    liveMatchesStat: 'Live-Spiele',
    acrossLeagues: 'Über 23 Ligen',
    goalAlerts: 'Tor-Alarme',
    last15Min: 'Letzte 15 Minuten',
    trackedBets: 'Verfolgte Wetten',
    acrossMarkets: 'Über alle Märkte',
    lastUpdated: 'Zuletzt aktualisiert',
    justNow: 'Gerade eben',
    allMatches: 'Alle Spiele',
    liveNow: 'Jetzt Live',
    upcoming: 'Anstehend',
    finished: 'Beendet',
    favorites: 'Favoriten',
    searchPlaceholder: 'Teams oder Ligen suchen...',
    allCountries: 'Alle Länder',
    allLeagues: 'Alle Ligen',
    allTimes: 'Alle Zeiten',
    allMarkets: 'Alle Märkte',
    compact: 'Kompakt',
    soundAlerts: 'Ton-Alarme',
    featuredMatch: 'TOP-SPIEL LIVE',
    momentum: 'MOMENTUM',
    liveStats: 'LIVE-STATS',
    possession: 'Ballbesitz',
    shotsOnTarget: 'Schüsse aufs Tor',
    dangerousAttacks: 'Gefährliche Angriffe',
    addBet: 'Wette hinzufügen',
    matchDetails: 'Spieldetails ›',
    details: 'Details ›',
    colLeagueMatch: 'LIGA & SPIEL',
    colScore: 'STAND',
    colMarkets: 'MÄRKTE',
    colXg: 'xG',
    colPos: 'BALL',
    colDangerous: 'GEFÄHRLICHE ANGRIFFE',
    quickBetSlip: 'Schnell-Wettschein',
    combinedOdds: 'Gesamtquote',
    stakeLabel: 'Einsatz ($)',
    potentialPayout: 'Mögliche Auszahlung',
    saveToMyBets: 'In Meine Wetten speichern',
    myBetsTitle: 'Meine Wetten',
    viewAll: 'Alle ansehen',
    tabLive: 'Live',
    tabCashOut: 'Cash Out',
    tabSettled: 'Abgerechnet',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Einsatz',
    payoutText: 'Auszahlung',
    addSelectionBtn: '+ Auswahl zum Wettschein hinzufügen',
    smarterTitle: 'Intelligentere Wetten beginnen mit intelligenteren Tools.',
    smarterSub: 'Erhalten Sie +EV-Einblicke, Live-Alarme und leistungsstarke Analysen.',
    feat1Title: 'Echtzeit-Daten',
    feat1Sub: 'Ultraschnelle Updates',
    feat2Title: 'Erweiterte Analytik',
    feat2Sub: 'xG, Momentum & mehr',
    feat3Title: 'Eigene Alarme',
    feat3Sub: 'Nie wieder Value verpassen',
    exploreTools: 'Tools entdecken',
    emptySlip: 'Klicken Sie auf eine Quote (1, X, 2) oder auf „Wette hinzufügen“.',
    directMyBetsBtn: '+ Direkt in Meine Wetten speichern',
    modalClose: 'Schließen',
    modalMarketsTitle: 'Verfügbare Märkte (Direkt zu Meine Wetten)',
  },
};

export function LiveMatchesBoard({
  language,
  matches,
  setMatches,
  onLogBet,
  bets = [],
  setBets,
  setActiveTab,
  onOpenMatch,
}: LiveMatchesBoardProps) {
  const t = (DICT as Record<string, typeof DICT.en>)[language] || DICT.en;

  const openMatchView = (m: Match) => {
    if (onOpenMatch) {
      onOpenMatch(m);
    } else {
      setDetailMatch(m);
    }
  };

  // Filter states matching the reference screenshot
  const [statusTab, setStatusTab] = useState<'all' | 'live' | 'upcoming' | 'finished' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(['match-mancity-youngboys', 'match-liverpool-tottenham']);

  // Live clock & seconds counter
  const [clockStr, setClockStr] = useState<string>('10:32:18');
  const [featuredSeconds, setFeaturedSeconds] = useState<number>(24);

  // Selected odds per match row for highlighting & 1-click Add Bet
  const [selectedRowMarket, setSelectedRowMarket] = useState<
    Record<string, { selectionKey: '1' | 'X' | '2'; label: string; odds: number; market: string }>
  >({
    'match-mancity-youngboys': {
      selectionKey: '1',
      label: 'Man City',
      odds: 1.22,
      market: 'Full Time Result',
    },
  });

  // Quick Bet Slip state (initialized with the 3 items from the reference screenshot)
  const [slipOpen, setSlipOpen] = useState<boolean>(true);
  const [slipStake, setSlipStake] = useState<number>(100);
  const [slipItems, setSlipItems] = useState<SlipItem[]>([
    {
      id: 'slip-1',
      matchId: 'match-leverkusen-roma',
      matchTitle: 'Bayer Leverkusen vs AS Roma',
      market: 'Total Goals',
      selection: 'Over 2.5 Goals',
      odds: 1.78,
      evPercent: 10.4,
    },
    {
      id: 'slip-2',
      matchId: 'match-mancity-youngboys',
      matchTitle: 'Man City vs Young Boys',
      market: 'Full Time Result',
      selection: 'Man City',
      odds: 1.32,
      evPercent: 6.9,
    },
    {
      id: 'slip-3',
      matchId: 'match-sporting-sturm',
      matchTitle: 'Sporting CP vs Sturm Graz',
      market: 'Total Goals',
      selection: 'Over 1.5 Goals',
      odds: 1.45,
      evPercent: 7.3,
    },
  ]);

  // My Bets sidebar sub-tab ('live' | 'cashout' | 'settled')
  const [myBetsTab, setMyBetsTab] = useState<'live' | 'cashout' | 'settled'>('live');

  // Detailed Match Modal
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [slipSyncedWithLive, setSlipSyncedWithLive] = useState<boolean>(false);

  // Sync initial Quick Bet Slip with top 3 real matches when real API-Football fixtures load
  useEffect(() => {
    if (slipSyncedWithLive || matches.length === 0) return;
    const hasRealApiFixtures = matches.some((m) => /^\d+$/.test(String(m.id).replace(/^apif-/, '')));
    if (!hasRealApiFixtures) return;
    const topReal = matches.slice(0, 3);
    if (topReal.length > 0) {
      setSlipItems(
        topReal.map((m, idx) => ({
          id: `slip-real-${m.id}-${idx}`,
          matchId: m.id,
          matchTitle: `${m.homeTeam} vs ${m.awayTeam}`,
          market: m.valueBetDetected ? 'Value Edge (1X2)' : 'Full Time Result',
          selection:
            m.valueBetDetected?.selection === 'away'
              ? m.awayTeam
              : m.valueBetDetected?.selection === 'draw'
              ? 'Draw (X)'
              : m.homeTeam,
          odds:
            m.valueBetDetected?.selection === 'away'
              ? m.bookmakerOdds.away
              : m.valueBetDetected?.selection === 'draw'
              ? m.bookmakerOdds.draw
              : m.bookmakerOdds.home,
          evPercent: m.valueBetDetected?.evPercent || 4.5,
        }))
      );
      setSlipSyncedWithLive(true);
    }
  }, [matches, slipSyncedWithLive]);

  // Live ticking clock & real-time match simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setClockStr(`${hh}:${mm}:${ss}`);
      setFeaturedSeconds((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const simInterval = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (m.status !== 'LIVE' || !m.minute) return m;
          const nextMin = m.minute >= 89 ? 63 : m.minute + (Math.random() < 0.35 ? 1 : 0);
          const addAttack = Math.random() < 0.45;
          const isHome = Math.random() < m.stats.possessionHome / 100;

          const updatedStats = {
            ...m.stats,
            dangerousAttacksHome:
              addAttack && isHome ? m.stats.dangerousAttacksHome + 1 : m.stats.dangerousAttacksHome,
            dangerousAttacksAway:
              addAttack && !isHome ? m.stats.dangerousAttacksAway + 1 : m.stats.dangerousAttacksAway,
          };

          const remaining = Math.max((90 - nextMin) / 90, 0.08);
          const l1 = Math.max(m.fairOdds.expectedGoalsHome * remaining, 0.12);
          const l2 = Math.max(m.fairOdds.expectedGoalsAway * remaining, 0.1);
          const matrix = computePoissonMatrix(l1, l2, true);

          return {
            ...m,
            minute: nextMin,
            stats: updatedStats,
            fairOdds: {
              ...m.fairOdds,
              homeProb: matrix.homeWinProb,
              drawProb: matrix.drawProb,
              awayProb: matrix.awayWinProb,
            },
          };
        })
      );
    }, 5000);

    return () => clearInterval(simInterval);
  }, [setMatches]);

  // Featured Match (First LIVE match or first match in feed)
  const featuredMatch =
    matches.find((m) => m.status === 'LIVE') ||
    matches[0];

  // Dynamic 100% Real Counters from the active matches feed (Zero Lies)
  const totalMatchesCount = matches.length;
  const liveMatchesCount = matches.filter((m) => m.status === 'LIVE').length;
  const upcomingMatchesCount = matches.filter((m) => m.status === 'SCHEDULED').length;
  const finishedMatchesCount = matches.filter((m) => m.status === 'FINISHED').length;
  const activeLeaguesCount = new Set(
    matches.map((m) => `${m.leagueCountry || ''}:${m.league || ''}`)
  ).size;
  const totalGoalsInFeed = matches.reduce(
    (sum, m) => sum + (Number(m.homeScore) || 0) + (Number(m.awayScore) || 0),
    0
  );
  const favMatchesCount = favorites.filter((id) => matches.some((m) => m.id === id)).length;

  // Table matches matching active tab & filters 1:1 with the tab badge counter
  const countries = Array.from(new Set(matches.map((m) => m.leagueCountry)));
  const leagues = Array.from(new Set(matches.map((m) => m.league)));

  const tableMatches = matches.filter((m) => {
    if (statusTab === 'live' && m.status !== 'LIVE') return false;
    if (statusTab === 'upcoming' && m.status !== 'SCHEDULED') return false;
    if (statusTab === 'finished' && m.status !== 'FINISHED') return false;
    if (statusTab === 'favorites' && !favorites.includes(m.id)) return false;

    if (countryFilter !== 'all' && m.leagueCountry !== countryFilter) return false;
    if (leagueFilter !== 'all' && m.league !== leagueFilter) return false;
    if (timeFilter === 'live' && m.status !== 'LIVE') return false;
    if (timeFilter === 'upcoming' && m.status !== 'SCHEDULED') return false;
    if (marketFilter === 'value' && !m.valueBetDetected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.homeTeam} ${m.awayTeam} ${m.league} ${m.leagueCountry}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  const toggleFavorite = (matchId: string) => {
    setFavorites((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  // Click on 1, X, 2 odds button in a match row: selects it & adds/updates in Quick Bet Slip
  const handleSelectOdd = (
    match: Match,
    selectionKey: '1' | 'X' | '2',
    label: string,
    odds: number
  ) => {
    setSelectedRowMarket((prev) => ({
      ...prev,
      [match.id]: {
        selectionKey,
        label,
        odds,
        market: 'Full Time Result',
      },
    }));

    const ev = match.valueBetDetected?.evPercent || 5.4;
    const matchTitle = `${match.homeTeam} vs ${match.awayTeam}`;

    setSlipItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.matchId === match.id);
      const newItem: SlipItem = {
        id: `slip-${match.id}-${Date.now()}`,
        matchId: match.id,
        matchTitle,
        market: 'Full Time Result',
        selection: label,
        odds,
        evPercent: ev,
      };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });
  };

  // Click "Add Bet" on a match row or Featured Match:
  // Logs the bet DIRECTLY into "Моите залози" (My Bets) AND ensures it's visible in the sidebar!
  const handleDirectAddBet = (
    match: Match,
    customSelection?: string,
    customOdds?: number,
    customMarket?: string
  ) => {
    const picked = selectedRowMarket[match.id];
    const selection =
      customSelection ||
      picked?.label ||
      (match.valueBetDetected?.selection === 'over25'
        ? 'Over 2.5 Goals'
        : match.valueBetDetected?.selection === 'draw'
        ? 'Draw (X)'
        : match.homeTeam);
    const odds =
      customOdds ||
      picked?.odds ||
      (match.valueBetDetected?.selection === 'draw'
        ? match.bookmakerOdds.draw
        : match.bookmakerOdds.home);
    const market =
      customMarket ||
      picked?.market ||
      (match.valueBetDetected?.selection === 'over25' ? 'Total Goals' : 'Full Time Result');
    const ev = match.valueBetDetected?.evPercent || 6.2;

    // 1. Add directly to "Моите залози" (AppView bets state + SQL DB sync)
    onLogBet(match, selection, odds, ev, market, 50);

    // 2. Also add/update in Quick Bet Slip so user sees it in both places
    const matchTitle = `${match.homeTeam} vs ${match.awayTeam}`;
    setSlipItems((prev) => {
      if (prev.some((i) => i.matchId === match.id && i.selection === selection)) return prev;
      return [
        {
          id: `slip-${Date.now()}`,
          matchId: match.id,
          matchTitle,
          market,
          selection,
          odds,
          evPercent: ev,
        },
        ...prev,
      ];
    });

    setMyBetsTab('live');
  };

  // Save all Quick Bet Slip items directly into "Моите залози" (My Bets)
  const handleSaveSlipToMyBets = () => {
    if (slipItems.length === 0) return;

    const perBetStake = Math.max(Math.round(slipStake / slipItems.length), 25);
    slipItems.forEach((item) => {
      const foundMatch =
        matches.find((m) => m.id === item.matchId) || {
          id: item.matchId,
          league: 'UEFA Europa League',
          leagueCountry: 'Europe',
          homeTeam: item.matchTitle.split(' vs ')[0] || 'Home',
          awayTeam: item.matchTitle.split(' vs ')[1] || 'Away',
          homeScore: 0,
          awayScore: 0,
          status: 'LIVE' as const,
          startTime: 'LIVE',
          bookmakerOdds: { home: item.odds, draw: 3.5, away: 4.2 },
          fairOdds: {
            homeProb: 0.55,
            drawProb: 0.25,
            awayProb: 0.2,
            fairHomeOdds: 1.8,
            fairDrawOdds: 4.0,
            fairAwayOdds: 5.0,
            over25Prob: 0.6,
            under25Prob: 0.4,
            bttsProb: 0.55,
            expectedGoalsHome: 1.5,
            expectedGoalsAway: 1.1,
          },
          events: [],
          stats: {
            possessionHome: 50,
            possessionAway: 50,
            shotsHome: 5,
            shotsAway: 5,
            shotsOnTargetHome: 2,
            shotsOnTargetAway: 2,
            cornersHome: 3,
            cornersAway: 3,
            dangerousAttacksHome: 20,
            dangerousAttacksAway: 20,
          },
        };

      onLogBet(foundMatch, item.selection, item.odds, item.evPercent, item.market, perBetStake);
    });

    setMyBetsTab('live');
  };

  // Cash out an active bet in My Bets sidebar -> updates status & PnL in "Моите залози"
  const handleCashOutBet = (betId: string, cashOutAmount: number) => {
    if (!setBets) return;
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId) return b;
        const profit = Number((cashOutAmount - b.stake).toFixed(2));
        return {
          ...b,
          status: 'WON',
          pnl: profit,
        };
      })
    );
  };

  const combinedOdds =
    slipItems.length > 0
      ? Number(slipItems.reduce((acc, item) => acc * item.odds, 1).toFixed(2))
      : 0;
  const potentialPayout = Number((combinedOdds * slipStake).toFixed(2));

  const liveBetsList = bets.filter((b) => b.status === 'PENDING');
  const settledBetsList = bets.filter((b) => b.status !== 'PENDING');
  const displayedMyBets =
    myBetsTab === 'settled' ? settledBetsList : liveBetsList;

  const renderFormBadges = (
    teamName: string,
    teamId?: number,
    teamLogo?: string,
    leagueId?: number,
    leagueName?: string
  ) => {
    const knownForm = TEAM_FORMS[teamName];
    if (!knownForm) {
      return (
        <button
          type="button"
          onClick={(e) =>
            openTeamProfile({ teamId, teamName, teamLogo, leagueId, leagueName }, e)
          }
          className="px-1.5 py-0.5 rounded bg-[#101c2a] hover:bg-emerald-500/15 border border-[#1e2f44] hover:border-emerald-500/40 text-[9px] font-mono text-emerald-400 transition-colors cursor-pointer shrink-0"
          title={`${teamName} — Официален профил, класиране и форма от API-Football`}
        >
          {language === 'bg' ? 'Профил ↗' : 'Profile ↗'}
        </button>
      );
    }
    return (
      <div
        onClick={(e) =>
          openTeamProfile({ teamId, teamName, teamLogo, leagueId, leagueName }, e)
        }
        className="flex items-center gap-1 cursor-pointer"
        title={`${teamName} — Профил и форма`}
      >
        {knownForm.map((res, idx) => (
          <span
            key={idx}
            className={`w-3.5 h-3.5 rounded-full text-[8px] font-mono font-black flex items-center justify-center ${
              res === 'W'
                ? 'bg-[#10b981] text-[#04130b]'
                : res === 'D'
                ? 'bg-[#334155] text-neutral-200'
                : 'bg-[#ef4444] text-white'
            }`}
          >
            {res}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* =================================================================== */}
      {/* MAIN 12-COLUMN LIVE WORKSPACE: Left (9 cols) + Right Bet Slip & My Bets (3 cols) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* =============================================================== */}
        {/* LEFT COLUMN (9 COLS): Header Banner, Filters, Featured Match, Live Table */}
        {/* =============================================================== */}
        <div className="xl:col-span-9 space-y-4">
          {/* 1. TOP BANNER: Compact Full-Width Heading + 5-Column LIVE Real-time Telemetry Bar */}
          <div className="relative rounded-2xl border border-[#172231] bg-gradient-to-r from-[#070d15] via-[#0b1520] to-[#081018] p-4 sm:p-5 overflow-hidden shadow-2xl space-y-4">
            {/* Stadium ambient glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/3 w-96 h-56 rounded-full bg-emerald-500/10 blur-3xl"
              aria-hidden="true"
            />

            {/* Row 1: Title & Subtitle on Left + 3 Trust Badges on Right */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t.pageTitle}
                </h1>
                <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
                  {t.pageSub}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 text-xs text-neutral-300 shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#43f08a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
                  </svg>
                  <span>{t.badgeRealtime}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#43f08a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>{t.badgeAnalytics}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#43f08a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{t.badgeTrusted}</span>
                </span>
              </div>
            </div>

            {/* Row 2: Full-Width 5-Column LIVE Real-Time Telemetry Bar */}
            <div className="relative z-10 w-full rounded-xl border border-[#1c2b3b] bg-[#0b131d]/95 px-4 py-3 grid grid-cols-2 sm:grid-cols-5 gap-4 items-center shadow-inner">
              {/* Col 1: LIVE sparkline */}
              <div className="pr-2 border-r border-[#1a2636]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#43f08a] animate-pulse" />
                  <span className="text-sm font-black text-white tracking-wide">LIVE</span>
                </div>
                <span className="text-[10px] text-[#8f9cae] block mt-0.5">{t.liveUpdates}</span>
                <svg className="w-20 h-4 mt-1" viewBox="0 0 80 20">
                  <path
                    d="M0 16 L12 12 L24 15 L36 8 L48 11 L62 4 L78 7"
                    fill="none"
                    stroke="#43f08a"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Col 2: Real Live Matches Count */}
              <div className="pr-2 sm:border-r border-[#1a2636]">
                <span className="text-[10px] text-[#8f9cae] block">{t.liveMatchesStat}</span>
                <span className="text-xl font-black text-white font-mono tabular-nums block my-0.5">
                  {liveMatchesCount}
                </span>
                <span className="text-[10px] text-[#64748b] block">
                  {language === 'bg'
                    ? `В ${activeLeaguesCount} първенства`
                    : `Across ${activeLeaguesCount} Leagues`}
                </span>
              </div>

              {/* Col 3: Real Goals in Feed */}
              <div className="pr-2 border-r border-[#1a2636]">
                <span className="text-[10px] text-[#8f9cae] block">{t.goalAlerts}</span>
                <span className="text-xl font-black text-white font-mono tabular-nums block my-0.5">
                  {totalGoalsInFeed}
                </span>
                <span className="text-[10px] text-[#64748b] block">
                  {language === 'bg' ? 'Отбелязани в мачовете' : t.last15Min}
                </span>
              </div>

              {/* Col 4: Real Tracked Bets Count */}
              <div className="pr-2 sm:border-r border-[#1a2636]">
                <span className="text-[10px] text-[#8f9cae] block">{t.trackedBets}</span>
                <span className="text-xl font-black text-white font-mono tabular-nums block my-0.5">
                  {bets.length}
                </span>
                <span className="text-[10px] text-[#64748b] block">{t.acrossMarkets}</span>
              </div>

              {/* Col 5: Last Updated */}
              <div>
                <span className="text-[10px] text-[#8f9cae] block">{t.lastUpdated}</span>
                <span className="text-base sm:text-lg font-black text-white font-mono tabular-nums block my-0.5">
                  {clockStr}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#43f08a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43f08a]" />
                  {t.justNow}
                </span>
              </div>
            </div>
          </div>

          {/* 2. STATUS FILTER TABS ROW (Real Dynamic Counts matching table rows 1:1) */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#16202e] bg-[#0a1018] p-2">
            <button
              type="button"
              onClick={() => setStatusTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'all'
                  ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white shadow-sm'
                  : 'text-[#8f9cae] hover:text-white border border-transparent'
              }`}
            >
              <span>{t.allMatches}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#16a34a]/30 text-[#43f08a] font-mono text-[10px]">
                {totalMatchesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('live')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'live'
                  ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white shadow-sm'
                  : 'text-[#8f9cae] hover:text-white border border-transparent'
              }`}
            >
              <span>{t.liveNow}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#16202e] text-neutral-300 font-mono text-[10px]">
                {liveMatchesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('upcoming')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'upcoming'
                  ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white shadow-sm'
                  : 'text-[#8f9cae] hover:text-white border border-transparent'
              }`}
            >
              <span>{t.upcoming}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#16202e] text-neutral-300 font-mono text-[10px]">
                {upcomingMatchesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('finished')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'finished'
                  ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white shadow-sm'
                  : 'text-[#8f9cae] hover:text-white border border-transparent'
              }`}
            >
              <span>{t.finished}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#16202e] text-neutral-300 font-mono text-[10px]">
                {finishedMatchesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('favorites')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'favorites'
                  ? 'bg-[#0f291e] border border-[#22c55e]/60 text-[#43f08a] shadow-sm'
                  : 'text-[#8f9cae] hover:text-white border border-transparent'
              }`}
            >
              <span>★</span>
              <span>{t.favorites}</span>
              {favMatchesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#16202e] text-[#43f08a] font-mono text-[10px]">
                  {favMatchesCount}
                </span>
              )}
            </button>
          </div>

          {/* 3. SEARCH, DROPDOWNS & COMPACT / SOUND CONTROLS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search Box */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-xl border border-[#1a2636] bg-[#0b1119] pl-3.5 pr-8 py-2 text-xs text-white placeholder-[#64748b] focus:border-[#43f08a] focus:outline-none"
                />
                <svg
                  className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* All Countries */}
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="rounded-xl border border-[#1a2636] bg-[#0b1119] px-3 py-2 text-xs text-neutral-300 focus:border-[#43f08a] focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allCountries}</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* All Leagues */}
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="rounded-xl border border-[#1a2636] bg-[#0b1119] px-3 py-2 text-xs text-neutral-300 focus:border-[#43f08a] focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allLeagues}</option>
                {leagues.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              {/* All Times */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-xl border border-[#1a2636] bg-[#0b1119] px-3 py-2 text-xs text-neutral-300 focus:border-[#43f08a] focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allTimes}</option>
                <option value="live">{t.liveNow}</option>
                <option value="upcoming">{t.upcoming}</option>
              </select>

              {/* All Markets */}
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="rounded-xl border border-[#1a2636] bg-[#0b1119] px-3 py-2 text-xs text-neutral-300 focus:border-[#43f08a] focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allMarkets}</option>
                <option value="value">+EV Value Markets</option>
              </select>
            </div>

            {/* Right Controls: Compact & Sound Alerts */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCompact(!isCompact)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  isCompact
                    ? 'border-[#43f08a] bg-[#0f291e] text-[#43f08a]'
                    : 'border-[#1f3b2c] bg-[#0b1613] text-neutral-200 hover:border-[#43f08a]/50'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-[#43f08a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
                </svg>
                <span>{t.compact}</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundAlerts(!soundAlerts)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1a2636] bg-[#0b1119] text-xs text-neutral-300 cursor-pointer"
              >
                <span>🔔 {t.soundAlerts}</span>
                <span
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                    soundAlerts ? 'bg-[#22c55e] justify-end' : 'bg-neutral-700 justify-start'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow" />
                </span>
              </button>
            </div>
          </div>

          {/* 4. FEATURED MATCH SPOTLIGHT CARD (Bayer Leverkusen 2 - 1 AS Roma) */}
          {featuredMatch && (
            <div className="rounded-2xl border border-[#1d563a] bg-gradient-to-r from-[#091914] via-[#0b151e] to-[#0a121a] p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.65)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Col 1-5: Featured Match Scoreboard & Goal Scorers */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#43f08a] block">
                        {t.featuredMatch}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-0.5">
                        <LeagueBadge
                          name={featuredMatch.league}
                          logoUrl={featuredMatch.leagueLogo}
                          size="sm"
                        />
                        <span className="font-semibold">{featuredMatch.league}</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-[#43f08a] tabular-nums">
                      {featuredMatch.status === 'LIVE'
                        ? `${featuredMatch.minute || 1}:${String(featuredSeconds).padStart(2, '0')}`
                        : featuredMatch.startTime}
                    </span>
                  </div>

                  {/* Teams & Big Score (Clickable to open MatchDetailPage) */}
                  <div
                    onClick={() => openMatchView(featuredMatch)}
                    className="flex items-center justify-between gap-2 pt-1 cursor-pointer group"
                  >
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5">
                      <TeamBadge
                        name={featuredMatch.homeTeam}
                        logoUrl={featuredMatch.homeLogo}
                        teamId={featuredMatch.homeTeamId}
                        size="md"
                      />
                      <div>
                        <div
                          onClick={(e) =>
                            openTeamProfile(
                              {
                                teamId: featuredMatch.homeTeamId,
                                teamName: featuredMatch.homeTeam,
                                teamLogo: featuredMatch.homeLogo,
                                leagueId: featuredMatch.leagueId,
                                leagueName: featuredMatch.league,
                              },
                              e
                            )
                          }
                          className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] hover:underline transition-colors leading-tight cursor-pointer"
                          title={`${featuredMatch.homeTeam} — Профил на отбора`}
                        >
                          {featuredMatch.homeTeam}
                        </div>
                        <div className="mt-1">
                          {renderFormBadges(
                            featuredMatch.homeTeam,
                            featuredMatch.homeTeamId,
                            featuredMatch.homeLogo,
                            featuredMatch.leagueId,
                            featuredMatch.league
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Center Score */}
                    <div className="text-center px-2 shrink-0">
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
                        {featuredMatch.homeScore} - {featuredMatch.awayScore}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#14202e] border border-[#233549] text-[10px] font-mono text-neutral-300">
                        {featuredMatch.halftimeScore ||
                          (featuredMatch.status === 'LIVE'
                            ? `LIVE ${featuredMatch.minute || 1}'`
                            : featuredMatch.startTime)}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 text-right">
                      <div>
                        <div
                          onClick={(e) =>
                            openTeamProfile(
                              {
                                teamId: featuredMatch.awayTeamId,
                                teamName: featuredMatch.awayTeam,
                                teamLogo: featuredMatch.awayLogo,
                                leagueId: featuredMatch.leagueId,
                                leagueName: featuredMatch.league,
                              },
                              e
                            )
                          }
                          className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] hover:underline transition-colors leading-tight cursor-pointer"
                          title={`${featuredMatch.awayTeam} — Профил на отбора`}
                        >
                          {featuredMatch.awayTeam}
                        </div>
                        <div className="mt-1 flex justify-end">
                          {renderFormBadges(
                            featuredMatch.awayTeam,
                            featuredMatch.awayTeamId,
                            featuredMatch.awayLogo,
                            featuredMatch.leagueId,
                            featuredMatch.league
                          )}
                        </div>
                      </div>
                      <TeamBadge
                        name={featuredMatch.awayTeam}
                        logoUrl={featuredMatch.awayLogo}
                        teamId={featuredMatch.awayTeamId}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Real Match Events Strip (only rendered when real events exist!) */}
                  {featuredMatch.events && featuredMatch.events.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070d13]/90 border border-[#162230] text-[11px] text-neutral-300 font-mono">
                      {featuredMatch.events.slice(0, 3).map((ev, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="text-neutral-600">|</span>}
                          <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                            <span>
                              {ev.type === 'goal'
                                ? '⚽'
                                : ev.type === 'red_card'
                                ? '🟥'
                                : ev.type === 'yellow_card'
                                ? '🟨'
                                : '⚡'}
                            </span>
                            <span>
                              {ev.minute}&apos; {ev.description.replace(/^Гол:\s*/i, '')}
                            </span>
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Col 6-8: MOMENTUM Chart */}
                <div className="lg:col-span-3 rounded-xl bg-[#081018]/90 border border-[#162332] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] text-center mb-1.5">
                    {t.momentum}
                  </div>
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 200 80">
                    <defs>
                      <linearGradient id="momGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="200" y2="40" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="100" y1="5" x2="100" y2="70" stroke="#1e293b" strokeWidth="1" />
                    {/* Momentum area & curve */}
                    <path
                      d="M 10 40 L 25 22 L 42 32 L 58 16 L 75 28 L 95 20 L 112 30 L 128 24 L 145 54 L 162 46 L 180 34 L 180 40 L 10 40 Z"
                      fill="url(#momGrad)"
                    />
                    <path
                      d="M 10 40 L 25 22 L 42 32 L 58 16 L 75 28 L 95 20 L 112 30 L 128 24 L 145 54 L 162 46 L 180 34"
                      fill="none"
                      stroke="#43f08a"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Active point */}
                    <circle cx="128" cy="24" r="3.5" fill="#facc15" stroke="#070b11" strokeWidth="1.5" />
                  </svg>
                  <div className="flex justify-between text-[10px] font-mono text-[#64748b] mt-1 px-1">
                    <span>0&apos;</span>
                    <span>HT</span>
                    <span>90&apos;</span>
                  </div>
                </div>

                {/* Col 9-10: LIVE STATS */}
                <div className="lg:col-span-2 space-y-2 text-[11px]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] text-center mb-1">
                    {t.liveStats}
                  </div>
                  {/* xG */}
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                      <span className="font-bold text-white">
                        {featuredMatch.fairOdds.expectedGoalsHome.toFixed(2)}
                      </span>
                      <span className="text-[#8f9cae]">xG</span>
                      <span className="font-bold text-white">
                        {featuredMatch.fairOdds.expectedGoalsAway.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                      <div className="bg-[#43f08a] h-full" style={{ width: '64%' }} />
                      <div className="bg-neutral-500 h-full" style={{ width: '36%' }} />
                    </div>
                  </div>

                  {/* Possession */}
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                      <span className="font-bold text-white">{featuredMatch.stats.possessionHome}%</span>
                      <span className="text-[#8f9cae] truncate px-1">{t.possession}</span>
                      <span className="font-bold text-white">{featuredMatch.stats.possessionAway}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                      <div
                        className="bg-[#43f08a] h-full"
                        style={{ width: `${featuredMatch.stats.possessionHome}%` }}
                      />
                      <div
                        className="bg-neutral-500 h-full"
                        style={{ width: `${featuredMatch.stats.possessionAway}%` }}
                      />
                    </div>
                  </div>

                  {/* Shots on Target */}
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                      <span className="font-bold text-white">{featuredMatch.stats.shotsOnTargetHome}</span>
                      <span className="text-[#8f9cae] truncate px-1">{t.shotsOnTarget}</span>
                      <span className="font-bold text-white">{featuredMatch.stats.shotsOnTargetAway}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                      <div className="bg-[#43f08a] h-full" style={{ width: '71%' }} />
                      <div className="bg-neutral-500 h-full" style={{ width: '29%' }} />
                    </div>
                  </div>

                  {/* Dangerous Attacks */}
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                      <span className="font-bold text-white">{featuredMatch.stats.dangerousAttacksHome}</span>
                      <span className="text-[#8f9cae] truncate px-1">{t.dangerousAttacks}</span>
                      <span className="font-bold text-white">{featuredMatch.stats.dangerousAttacksAway}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                      <div className="bg-[#43f08a] h-full" style={{ width: '62%' }} />
                      <div className="bg-neutral-500 h-full" style={{ width: '38%' }} />
                    </div>
                  </div>
                </div>

                {/* Col 11-12: Action Buttons (Add Bet & Match Details) */}
                <div className="lg:col-span-2 flex flex-row lg:flex-col gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleDirectAddBet(
                        featuredMatch,
                        'Over 2.5 Goals',
                        1.78,
                        'Total Goals'
                      )
                    }
                    className="flex-1 lg:w-full py-2.5 px-4 rounded-xl bg-[#22c55e] hover:bg-[#43f08a] text-[#04130b] font-extrabold text-xs shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer text-center"
                  >
                    {t.addBet}
                  </button>
                  <button
                    type="button"
                    onClick={() => openMatchView(featuredMatch)}
                    className="flex-1 lg:w-full py-2.5 px-4 rounded-xl border border-[#223246] bg-[#0d1622] hover:border-[#43f08a]/50 text-neutral-200 font-semibold text-xs transition-all cursor-pointer text-center"
                  >
                    {t.matchDetails}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. LIVE & TODAY'S MATCHES TABLE */}
          <div className="space-y-2.5">
            {/* Table Column Headers (Hidden on mobile, shown on lg) */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] border-b border-[#16202e]">
              <div className="col-span-3">{t.colLeagueMatch}</div>
              <div className="col-span-1 text-center">{t.colScore}</div>
              <div className="col-span-4 text-center">{t.colMarkets}</div>
              <div className="col-span-1 text-center">{t.colXg}</div>
              <div className="col-span-1 text-center">{t.colPos}</div>
              <div className="col-span-2 text-left pl-2">{t.colDangerous}</div>
            </div>

            {/* Match Rows */}
            {tableMatches.map((match) => {
              const isLive = match.status === 'LIVE';
              const isFav = favorites.includes(match.id);
              const picked = selectedRowMarket[match.id];
              const extraMarkets = EXTRA_MARKETS_COUNT[match.id] || 112;
              const posHome = match.stats.possessionHome || 54;
              const posAway = match.stats.possessionAway || 46;
              const daHome = match.stats.dangerousAttacksHome || 28;
              const daAway = match.stats.dangerousAttacksAway || 19;
              const daTotal = Math.max(daHome + daAway, 1);

              // SVG Donut math
              const radius = 15;
              const circumference = 2 * Math.PI * radius;
              const homeStroke = (posHome / 100) * circumference;

              return (
                <div
                  key={match.id}
                  className={`rounded-2xl border border-[#172332] bg-[#0b111a]/95 hover:border-[#24384f] transition-all ${
                    isCompact ? 'p-3' : 'p-4'
                  } shadow-md`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Col 1-3: Star, League, Teams & Form Badges */}
                    <div className="lg:col-span-3 flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(match.id)}
                        className={`mt-4 text-base transition-colors cursor-pointer ${
                          isFav ? 'text-[#43f08a]' : 'text-[#475569] hover:text-neutral-300'
                        }`}
                        title={t.favorites}
                      >
                        {isFav ? '★' : '☆'}
                      </button>

                      <div
                        onClick={() => openMatchView(match)}
                        className="flex-1 min-w-0 space-y-1.5 cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#8f9cae]">
                          <LeagueBadge
                            name={match.league}
                            logoUrl={match.leagueLogo}
                            size="xs"
                          />
                          <span className="truncate">
                            {match.leagueCountry ? `${match.leagueCountry} · ` : ''}
                            {match.league}
                          </span>
                        </div>

                        {/* Home Team Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            onClick={(e) =>
                              openTeamProfile(
                                {
                                  teamId: match.homeTeamId,
                                  teamName: match.homeTeam,
                                  teamLogo: match.homeLogo,
                                  leagueId: match.leagueId,
                                  leagueName: match.league,
                                },
                                e
                              )
                            }
                            className="flex items-center gap-2 min-w-0 cursor-pointer"
                            title={`${match.homeTeam} — Профил на отбора`}
                          >
                            <TeamBadge
                              name={match.homeTeam}
                              logoUrl={match.homeLogo}
                              teamId={match.homeTeamId}
                              size="sm"
                            />
                            <span className="text-xs sm:text-sm font-bold text-white hover:text-[#43f08a] hover:underline transition-colors truncate">
                              {match.homeTeam}
                            </span>
                          </div>
                          {!isCompact &&
                            renderFormBadges(
                              match.homeTeam,
                              match.homeTeamId,
                              match.homeLogo,
                              match.leagueId,
                              match.league
                            )}
                        </div>

                        {/* Away Team Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            onClick={(e) =>
                              openTeamProfile(
                                {
                                  teamId: match.awayTeamId,
                                  teamName: match.awayTeam,
                                  teamLogo: match.awayLogo,
                                  leagueId: match.leagueId,
                                  leagueName: match.league,
                                },
                                e
                              )
                            }
                            className="flex items-center gap-2 min-w-0 cursor-pointer"
                            title={`${match.awayTeam} — Профил на отбора`}
                          >
                            <TeamBadge
                              name={match.awayTeam}
                              logoUrl={match.awayLogo}
                              teamId={match.awayTeamId}
                              size="sm"
                            />
                            <span className="text-xs sm:text-sm font-bold text-white hover:text-[#43f08a] hover:underline transition-colors truncate">
                              {match.awayTeam}
                            </span>
                          </div>
                          {!isCompact &&
                            renderFormBadges(
                              match.awayTeam,
                              match.awayTeamId,
                              match.awayLogo,
                              match.leagueId,
                              match.league
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Col 4: SCORE & LIVE MINUTE */}
                    <div
                      onClick={() => openMatchView(match)}
                      className="lg:col-span-1 flex lg:flex-col items-center justify-between lg:justify-center gap-1 border-y lg:border-y-0 py-2 lg:py-0 border-[#16202e] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          {isLive ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#43f08a]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#43f08a] animate-ping" />
                                LIVE
                              </span>
                              <span className="block text-[11px] font-mono text-neutral-300 tabular-nums">
                                {match.minute || 1}&apos;
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-amber-400">
                              {match.startTime}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-center font-mono font-black text-sm sm:text-base text-white tabular-nums pl-1">
                          <span>{match.homeScore}</span>
                          <span>{match.awayScore}</span>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded bg-[#131d2a] text-[9px] font-mono text-[#8f9cae] truncate max-w-[90px]">
                        {match.halftimeScore || (isLive ? `LIVE ${match.minute || 1}'` : 'ДНЕС')}
                      </span>
                    </div>

                    {/* Col 5-8: 1X2 MARKETS + EXTRA MARKETS PILL */}
                    <div className="lg:col-span-4 flex items-center justify-center gap-1.5">
                      {/* 1 (Home) */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectOdd(match, '1', match.homeTeam, match.bookmakerOdds.home)
                        }
                        className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          picked?.selectionKey === '1'
                            ? 'border-[#43f08a] bg-[#0f291e] text-white shadow-sm'
                            : 'border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a]/50 text-white'
                        }`}
                      >
                        <span className="text-[#64748b]">1</span>
                        <span className="font-bold tabular-nums">
                          {match.bookmakerOdds.home.toFixed(2)}
                        </span>
                      </button>

                      {/* X (Draw) */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectOdd(match, 'X', 'Draw (X)', match.bookmakerOdds.draw)
                        }
                        className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          picked?.selectionKey === 'X'
                            ? 'border-[#43f08a] bg-[#0f291e] text-white shadow-sm'
                            : 'border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a]/50 text-white'
                        }`}
                      >
                        <span className="text-[#64748b]">X</span>
                        <span className="font-bold tabular-nums">
                          {match.bookmakerOdds.draw.toFixed(2)}
                        </span>
                      </button>

                      {/* 2 (Away) */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectOdd(match, '2', match.awayTeam, match.bookmakerOdds.away)
                        }
                        className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          picked?.selectionKey === '2'
                            ? 'border-[#43f08a] bg-[#0f291e] text-white shadow-sm'
                            : 'border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a]/50 text-white'
                        }`}
                      >
                        <span className="text-[#64748b]">2</span>
                        <span className="font-bold tabular-nums">
                          {match.bookmakerOdds.away.toFixed(2)}
                        </span>
                      </button>

                      {/* +128 More Markets */}
                      <button
                        type="button"
                        onClick={() => openMatchView(match)}
                        className="px-2 py-2 rounded-xl border border-[#1c2a3b] bg-[#0c131d] hover:border-[#43f08a]/40 text-[11px] font-mono text-[#8f9cae] hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        +{extraMarkets}
                      </button>
                    </div>

                    {/* Col 9: xG Bars */}
                    <div className="lg:col-span-1 flex lg:flex-col justify-center gap-1.5 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold w-8 text-right tabular-nums">
                          {match.fairOdds.expectedGoalsHome.toFixed(2)}
                        </span>
                        <div className="w-10 h-1.5 rounded-full bg-[#162230] overflow-hidden">
                          <div
                            className="h-full bg-[#43f08a]"
                            style={{
                              width: `${Math.min(
                                (match.fairOdds.expectedGoalsHome / 3) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400 w-8 text-right tabular-nums">
                          {match.fairOdds.expectedGoalsAway.toFixed(2)}
                        </span>
                        <div className="w-10 h-1.5 rounded-full bg-[#162230] overflow-hidden">
                          <div
                            className="h-full bg-neutral-500"
                            style={{
                              width: `${Math.min(
                                (match.fairOdds.expectedGoalsAway / 3) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Col 10: POS Circular Donut */}
                    <div className="lg:col-span-1 flex items-center justify-center gap-1.5">
                      <svg className="w-9 h-9 -rotate-90 shrink-0" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="3.8"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="3.8"
                          strokeDasharray={`${homeStroke} ${circumference}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="text-[10px] font-mono leading-tight">
                        <span className="block font-bold text-white">{posHome}%</span>
                        <span className="block text-[#64748b]">{posAway}%</span>
                      </div>
                    </div>

                    {/* Col 11-12: Dangerous Attacks + Add Bet / Details Buttons */}
                    <div className="lg:col-span-2 flex items-center justify-between gap-2">
                      {/* Dangerous Attacks Bar */}
                      <div className="flex items-center gap-1.5 font-mono text-[11px] flex-1">
                        <span className="font-bold text-white tabular-nums">{daHome}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[#162230] overflow-hidden flex min-w-[36px]">
                          <div
                            className="bg-[#43f08a] h-full"
                            style={{ width: `${(daHome / daTotal) * 100}%` }}
                          />
                          <div
                            className="bg-neutral-600 h-full"
                            style={{ width: `${(daAway / daTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-neutral-400 tabular-nums">{daAway}</span>
                      </div>

                      {/* Action Buttons: Add Bet (Direct to My Bets) & Details */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDirectAddBet(match)}
                          className="px-3 py-1.5 rounded-lg border border-[#22c55e]/60 bg-[#0f291e] hover:bg-[#22c55e] text-[#43f08a] hover:text-[#04130b] font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap"
                        >
                          {t.addBet}
                        </button>
                        <button
                          type="button"
                          onClick={() => openMatchView(match)}
                          className="px-3 py-1 rounded-lg border border-[#1c2a3b] bg-[#0c131d] hover:border-neutral-600 text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t.details}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =============================================================== */}
        {/* RIGHT SIDEBAR COLUMN (3 COLS): Quick Bet Slip & My Bets */}
        {/* =============================================================== */}
        <div className="xl:col-span-3 space-y-5 xl:sticky xl:top-20">
          {/* CARD 1: Quick Bet Slip */}
          <div className="rounded-2xl border border-[#182434] bg-[#0a1018] p-4 shadow-2xl space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#16202e] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">{t.quickBetSlip}</h3>
                <span className="px-2 py-0.5 rounded-md bg-[#22c55e] text-[#04130b] font-mono font-black text-xs">
                  {slipItems.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSlipOpen(!slipOpen)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                {slipOpen ? '▲' : '▼'}
              </button>
            </div>

            {slipOpen && (
              <>
                {slipItems.length === 0 ? (
                  <p className="text-xs text-[#8f9cae] py-4 text-center">{t.emptySlip}</p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                    {slipItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#1a2636] bg-[#0e1622] p-3 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">⚽</span>
                            <span className="text-xs font-extrabold text-white">
                              {item.selection}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-white tabular-nums">
                              {item.odds.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSlipItems((prev) => prev.filter((x) => x.id !== item.id))
                              }
                              className="text-neutral-500 hover:text-red-400 text-xs cursor-pointer"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-[#8f9cae] mt-1 pl-5">
                          <span className="block">{item.market}</span>
                          <span className="block text-neutral-400">{item.matchTitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stake Input & Combined Summary */}
                {slipItems.length > 0 && (
                  <div className="pt-2 border-t border-[#16202e] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8f9cae]">{t.stakeLabel}</span>
                      <div className="flex items-center gap-1">
                        {[50, 100, 200].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setSlipStake(amt)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                              slipStake === amt
                                ? 'bg-[#22c55e] text-[#04130b] font-bold'
                                : 'bg-[#121c29] text-neutral-300 hover:text-white'
                            }`}
                          >
                            €{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8f9cae]">{t.combinedOdds}</span>
                      <span className="font-mono font-extrabold text-white text-sm tabular-nums">
                        {combinedOdds.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8f9cae]">{t.potentialPayout}</span>
                      <span className="font-mono font-black text-[#43f08a] text-base tabular-nums">
                        €{potentialPayout.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSlipToMyBets}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#22c55e] hover:bg-[#43f08a] text-[#04130b] font-extrabold text-xs shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer"
                    >
                      {t.saveToMyBets}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CARD 2: My Bets (Directly synced with "Моите залози") */}
          <div className="rounded-2xl border border-[#182434] bg-[#0a1018] p-4 shadow-2xl space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{t.myBetsTitle}</h3>
              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab('bets')}
                  className="text-xs font-semibold text-[#8f9cae] hover:text-[#43f08a] transition-colors cursor-pointer"
                >
                  {t.viewAll}
                </button>
              )}
            </div>

            {/* 3 Sub-tabs: Live | Cash Out | Settled */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0e1622] border border-[#16202e] text-xs">
              <button
                type="button"
                onClick={() => setMyBetsTab('live')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  myBetsTab === 'live'
                    ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white'
                    : 'text-[#8f9cae] hover:text-white'
                }`}
              >
                <span>{t.tabLive}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#22c55e] text-[#04130b] font-mono text-[10px] font-black">
                  {liveBetsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMyBetsTab('cashout')}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  myBetsTab === 'cashout'
                    ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white'
                    : 'text-[#8f9cae] hover:text-white'
                }`}
              >
                <span>{t.tabCashOut}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#1a2636] text-neutral-300 font-mono text-[10px]">
                  {Math.min(liveBetsList.length, 2)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMyBetsTab('settled')}
                className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  myBetsTab === 'settled'
                    ? 'bg-[#0f291e] border border-[#22c55e]/60 text-white'
                    : 'text-[#8f9cae] hover:text-white'
                }`}
              >
                {t.tabSettled}
              </button>
            </div>

            {/* Active / Settled Bets List */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-0.5">
              {displayedMyBets.slice(0, 5).map((bet, index) => {
                const cashOutVal = Number((bet.stake * (1 + 0.368)).toFixed(2));
                const fullPayout = Number((bet.stake * bet.odds).toFixed(2));

                return (
                  <div
                    key={bet.id}
                    className="rounded-xl border border-[#1a2636] bg-[#0e1622] p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">⚽</span>
                        <span className="text-xs font-extrabold text-white">
                          {bet.selection}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-white tabular-nums">
                        {bet.odds.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#8f9cae] pl-5">
                      <span className="block">{bet.market}</span>
                      <span className="block text-neutral-300">{bet.match}</span>
                    </div>

                    {bet.status === 'PENDING' ? (
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#162232] text-[11px]">
                        {index === 0 || myBetsTab === 'cashout' ? (
                          <button
                            type="button"
                            onClick={() => handleCashOutBet(bet.id, cashOutVal)}
                            className="px-2.5 py-1 rounded-lg border border-[#22c55e]/50 bg-[#0f291e] hover:bg-[#22c55e] text-[#43f08a] hover:text-[#04130b] font-mono font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            {t.cashOutBtn} €{cashOutVal.toFixed(2)}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#43f08a]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#43f08a] animate-ping" />
                            LIVE
                          </span>
                        )}

                        <div className="text-right font-mono text-[10px] text-neutral-300">
                          <span className="block">
                            {t.stakeText} €{bet.stake.toFixed(2)}
                          </span>
                          {index !== 0 && (
                            <span className="block text-white font-semibold">
                              {t.payoutText} €{fullPayout.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#162232] text-[10px] font-mono">
                        <span
                          className={
                            bet.status === 'WON' ? 'text-[#43f08a] font-bold' : 'text-red-400 font-bold'
                          }
                        >
                          {bet.status}
                        </span>
                        <span
                          className={
                            bet.pnl >= 0 ? 'text-[#43f08a] font-bold' : 'text-red-400 font-bold'
                          }
                        >
                          {bet.pnl >= 0 ? `+€${bet.pnl.toFixed(2)}` : `-€${Math.abs(bet.pnl).toFixed(2)}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Dashed Add Selection Button */}
            <button
              type="button"
              onClick={() => {
                if (featuredMatch) {
                  setDetailMatch(featuredMatch);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#243548] hover:border-[#43f08a]/60 bg-[#0c131d]/60 text-xs text-[#8f9cae] hover:text-white transition-colors cursor-pointer"
            >
              {t.addSelectionBtn}
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* BOTTOM BANNER STRIP: Smarter bets start with smarter tools. */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#193829] bg-gradient-to-r from-[#081511] via-[#0a131c] to-[#091813] p-5 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0f291e] border border-[#22c55e]/50 flex items-center justify-center text-[#43f08a] shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#43f08a]">
              {t.smarterTitle}
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">{t.smarterSub}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0e2019] border border-[#1f4231] flex items-center justify-center text-[#43f08a]">
              📈
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.feat1Title}</div>
              <div className="text-[11px] text-[#8f9cae]">{t.feat1Sub}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0e2019] border border-[#1f4231] flex items-center justify-center text-[#43f08a]">
              📊
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.feat2Title}</div>
              <div className="text-[11px] text-[#8f9cae]">{t.feat2Sub}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0e2019] border border-[#1f4231] flex items-center justify-center text-[#43f08a]">
              🔔
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.feat3Title}</div>
              <div className="text-[11px] text-[#8f9cae]">{t.feat3Sub}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('tools')}
          className="px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#43f08a] text-[#04130b] font-extrabold text-xs sm:text-sm shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer shrink-0 flex items-center gap-2"
        >
          <span>{t.exploreTools}</span>
          <span>→</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* MATCH DETAILS & 1-CLICK MARKETS MODAL */}
      {/* =================================================================== */}
      {detailMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-[#1e2d40] bg-[#091018] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#162232] pb-4">
              <div>
                <span className="text-[11px] font-mono text-[#43f08a] uppercase font-bold">
                  {detailMatch.league} · {detailMatch.status === 'LIVE' ? `LIVE ${detailMatch.minute}'` : detailMatch.startTime}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {detailMatch.homeTeam} {detailMatch.homeScore} - {detailMatch.awayScore} {detailMatch.awayTeam}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailMatch(null)}
                className="px-2.5 py-1 rounded-lg bg-[#111b27] text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ {t.modalClose}
              </button>
            </div>

            {/* Markets Grid for Direct Logging into My Bets */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-[#8f9cae] font-bold">
                {t.modalMarketsTitle}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleDirectAddBet(
                      detailMatch,
                      detailMatch.homeTeam,
                      detailMatch.bookmakerOdds.home,
                      'Full Time Result'
                    );
                    setDetailMatch(null);
                  }}
                  className="p-3 rounded-xl border border-[#1e2d40] bg-[#0e1723] hover:border-[#43f08a] text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between text-xs text-[#8f9cae]">
                    <span>1 ({detailMatch.homeTeam})</span>
                    <span className="text-[#43f08a] font-mono">
                      {(detailMatch.fairOdds.homeProb * 100).toFixed(0)}% Fair
                    </span>
                  </div>
                  <div className="text-lg font-mono font-black text-white mt-1 group-hover:text-[#43f08a]">
                    @{detailMatch.bookmakerOdds.home.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-[#43f08a] font-semibold mt-1 block">
                    {t.directMyBetsBtn}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDirectAddBet(
                      detailMatch,
                      'Draw (X)',
                      detailMatch.bookmakerOdds.draw,
                      'Full Time Result'
                    );
                    setDetailMatch(null);
                  }}
                  className="p-3 rounded-xl border border-[#1e2d40] bg-[#0e1723] hover:border-[#43f08a] text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between text-xs text-[#8f9cae]">
                    <span>X (Draw)</span>
                    <span className="text-[#43f08a] font-mono">
                      {(detailMatch.fairOdds.drawProb * 100).toFixed(0)}% Fair
                    </span>
                  </div>
                  <div className="text-lg font-mono font-black text-white mt-1 group-hover:text-[#43f08a]">
                    @{detailMatch.bookmakerOdds.draw.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-[#43f08a] font-semibold mt-1 block">
                    {t.directMyBetsBtn}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDirectAddBet(
                      detailMatch,
                      detailMatch.awayTeam,
                      detailMatch.bookmakerOdds.away,
                      'Full Time Result'
                    );
                    setDetailMatch(null);
                  }}
                  className="p-3 rounded-xl border border-[#1e2d40] bg-[#0e1723] hover:border-[#43f08a] text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between text-xs text-[#8f9cae]">
                    <span>2 ({detailMatch.awayTeam})</span>
                    <span className="text-[#43f08a] font-mono">
                      {(detailMatch.fairOdds.awayProb * 100).toFixed(0)}% Fair
                    </span>
                  </div>
                  <div className="text-lg font-mono font-black text-white mt-1 group-hover:text-[#43f08a]">
                    @{detailMatch.bookmakerOdds.away.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-[#43f08a] font-semibold mt-1 block">
                    {t.directMyBetsBtn}
                  </span>
                </button>
              </div>

              {/* Totals & BTTS Markets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleDirectAddBet(detailMatch, 'Over 2.5 Goals', 1.78, 'Total Goals');
                    setDetailMatch(null);
                  }}
                  className="p-3 rounded-xl border border-[#1e2d40] bg-[#0e1723] hover:border-[#43f08a] flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white">Over 2.5 Goals</div>
                    <div className="text-[10px] text-[#43f08a] font-mono">
                      Poisson Prob: {(detailMatch.fairOdds.over25Prob * 100).toFixed(0)}%
                    </div>
                  </div>
                  <span className="text-base font-mono font-black text-[#43f08a]">@1.78</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDirectAddBet(detailMatch, 'BTTS — Yes', 1.72, 'Both Teams To Score');
                    setDetailMatch(null);
                  }}
                  className="p-3 rounded-xl border border-[#1e2d40] bg-[#0e1723] hover:border-[#43f08a] flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white">Both Teams To Score (Yes)</div>
                    <div className="text-[10px] text-[#43f08a] font-mono">
                      Poisson Prob: {(detailMatch.fairOdds.bttsProb * 100).toFixed(0)}%
                    </div>
                  </div>
                  <span className="text-base font-mono font-black text-[#43f08a]">@1.72</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
