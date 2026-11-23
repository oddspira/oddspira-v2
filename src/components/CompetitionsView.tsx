import React, { useEffect, useState } from 'react';
import { ActiveTab, Language, Match } from '../types';
import { registerMatchLogos, TeamBadge } from './TeamBadge';

interface CompetitionsViewProps {
  language?: Language;
  matches: Match[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCompetition?: (leagueName: string) => void;
  onOpenMatch?: (match: Match) => void;
}

interface StandingRow {
  rank: number;
  club: string;
  clubLogo?: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string;
  pts: number;
  form: ('W' | 'D' | 'L')[];
}

interface TopScorerRow {
  rank: number;
  name: string;
  photo?: string;
  club: string;
  clubLogo?: string;
  goals: number;
  assists?: number;
  yellowCards?: number;
  initials: string;
  avatarGradient: string;
}

interface UpcomingFixtureRow {
  id: string;
  dayLabel: string;
  homeTeam: string;
  homeLogo?: string;
  awayTeam: string;
  awayLogo?: string;
  time: string;
}

interface LeagueGlanceData {
  matchesPlayed: string;
  goalsScored: string;
  goalsPerMatch: string;
  winsDraws?: string;
  bestAttack?: string;
  bestDefense?: string;
  teamsCount?: string;
}

interface LeagueHubData {
  id: string;
  apiLeagueId: number;
  name: string;
  country: string;
  flag: string;
  season: string;
  region: 'europe' | 'south_america' | 'north_america' | 'asia' | 'africa';
  type: 'domestic' | 'continental';
  standings: StandingRow[];
  topScorers: TopScorerRow[];
  upcomingFixtures: UpcomingFixtureRow[];
  glance: LeagueGlanceData | null;
}

const LEAGUES_DATABASE: Record<string, LeagueHubData> = {
  'premier-league': {
    id: 'premier-league',
    apiLeagueId: 39,
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  'la-liga': {
    id: 'la-liga',
    apiLeagueId: 140,
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  'serie-a': {
    id: 'serie-a',
    apiLeagueId: 135,
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  bundesliga: {
    id: 'bundesliga',
    apiLeagueId: 78,
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  ucl: {
    id: 'ucl',
    apiLeagueId: 2,
    name: 'UEFA Champions League',
    country: 'Europe',
    flag: '🇪🇺',
    season: '2025/26',
    region: 'europe',
    type: 'continental',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  'copa-libertadores': {
    id: 'copa-libertadores',
    apiLeagueId: 13,
    name: 'Copa Libertadores',
    country: 'South America',
    flag: '🌎',
    season: '2025',
    region: 'south_america',
    type: 'continental',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  'ligue-1': {
    id: 'ligue-1',
    apiLeagueId: 61,
    name: 'Ligue 1',
    country: 'France',
    flag: '🇫🇷',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  eredivisie: {
    id: 'eredivisie',
    apiLeagueId: 88,
    name: 'Eredivisie',
    country: 'Netherlands',
    flag: '🇳🇱',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  'primeira-liga': {
    id: 'primeira-liga',
    apiLeagueId: 94,
    name: 'Primeira Liga',
    country: 'Portugal',
    flag: '🇵🇹',
    season: '2025/26',
    region: 'europe',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  'argentina-primera': {
    id: 'argentina-primera',
    apiLeagueId: 128,
    name: 'Liga Profesional',
    country: 'Argentina',
    flag: '🇦🇷',
    season: '2025',
    region: 'south_america',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  brasileirao: {
    id: 'brasileirao',
    apiLeagueId: 71,
    name: 'Brasileirão Série A',
    country: 'Brazil',
    flag: '🇧🇷',
    season: '2025',
    region: 'south_america',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
  mls: {
    id: 'mls',
    apiLeagueId: 253,
    name: 'MLS',
    country: 'United States',
    flag: '🇺🇸',
    season: '2025',
    region: 'north_america',
    type: 'domestic',
    standings: [],
    topScorers: [],
    upcomingFixtures: [],
    glance: null,
  },
};

const DICT = {
  bg: {
    eyebrow: 'ГЛОБАЛЕН ФУТБОЛ. ПО-УМНИ АНАЛИЗИ.',
    heroTitle1: 'Разгледай Лигите.',
    heroTitle2: 'Всяко класиране. Всяка статистика. Навсякъде.',
    heroSub:
      'Класирания на живо, програма, форма и разширена статистика за футболните лиги по целия свят. Задвижвано от данни. Създадено за умни решения.',
    kpi1: 'Лиги по света',
    kpi2: 'Покрити държави',
    kpi3: 'Мачове на живо днес',
    kpi4: 'Водещи турнири',
    searchPlaceholder: 'Търсене на лиги...',
    allCountries: 'Всички държави',
    allCompTypes: 'Всички видове турнири',
    domesticLeague: 'Национални първенства',
    continentalCup: 'Континентални купи',
    moreFilters: 'Още филтри',
    resetFilters: 'Нулирай филтрите',
    featuredLeagues: 'Водещи първенства',
    viewAllLeagues: 'Всички лиги',
    changeLeague: 'Смени лигата',
    tabStandings: 'Класиране',
    tabFixtures: 'Програма',
    tabResults: 'Резултати',
    tabForm: 'Форма',
    tabStats: 'Статистика',
    tabInsights: '+EV Анализи',
    clubCol: 'Клуб',
    formCol: 'Форма',
    viewFullStandings: 'Виж пълното класиране',
    collapseStandings: 'Свий класирането',
    topScorers: 'Голмайстори',
    viewAll: 'Виж всички',
    goalsLabel: 'Гола',
    upcomingFixtures: 'Предстоящи мачове',
    leagueAtGlance: 'Статистика на лигата',
    matchesPlayed: 'Изиграни мачове',
    goalsScored: 'Отбелязани голове',
    goalsPerMatch: 'Голове на мач',
    cleanSheets: 'Сухи мрежи',
    yellowCards: 'Жълти картони',
    redCards: 'Червени картони',
    avgPossession: 'Средно владеене',
    popularByRegion: 'Популярни лиги по регион',
    regEurope: 'Европа',
    regSouthAmerica: 'Южна Америка',
    regNorthAmerica: 'Северна Америка',
    regAsia: 'Азия',
    regAfrica: 'Африка',
    viewLeague: 'Разгледай лигата',
    trustMainTitle: 'Доверен от анализатори по цял свят',
    trustMainSub: '100% безплатно · Данни в реално време · API-Sports готова архитектура',
    trust1Title: 'Обновяване на живо',
    trust1Sub: 'Винаги актуални данни',
    trust2Title: 'Разширена аналитика',
    trust2Sub: 'По-дълбоки +EV сигнали',
    trust3Title: 'Глобално покритие',
    trust3Sub: '88+ футболни лиги',
    trust4Title: 'Проверени данни',
    trust4Sub: 'Официални API източници',
    exploreTools: 'Разгледай Инструменти',
  },
  en: {
    eyebrow: 'GLOBAL FOOTBALL. SMARTER INSIGHTS.',
    heroTitle1: 'Explore Leagues.',
    heroTitle2: 'Every table. Every stat. Everywhere.',
    heroSub:
      'Live standings, fixtures, form and advanced stats for football leagues around the world. Powered by data. Built for smarter decisions.',
    kpi1: 'Leagues Worldwide',
    kpi2: 'Countries Covered',
    kpi3: 'Live Fixtures Today',
    kpi4: 'Trending Competitions',
    searchPlaceholder: 'Search leagues...',
    allCountries: 'All Countries',
    allCompTypes: 'All Competition Types',
    domesticLeague: 'Domestic Leagues',
    continentalCup: 'Continental Cups',
    moreFilters: 'More Filters',
    resetFilters: 'Reset Filters',
    featuredLeagues: 'Featured Leagues',
    viewAllLeagues: 'View all leagues',
    changeLeague: 'Change League',
    tabStandings: 'Standings',
    tabFixtures: 'Fixtures',
    tabResults: 'Results',
    tabForm: 'Form',
    tabStats: 'Stats',
    tabInsights: 'Insights',
    clubCol: 'Club',
    formCol: 'Form',
    viewFullStandings: 'View full standings',
    collapseStandings: 'Show top 5',
    topScorers: 'Top Scorers',
    viewAll: 'View all',
    goalsLabel: 'Goals',
    upcomingFixtures: 'Upcoming Fixtures',
    leagueAtGlance: 'League at a Glance',
    matchesPlayed: 'Matches Played',
    goalsScored: 'Goals Scored',
    goalsPerMatch: 'Goals per Match',
    cleanSheets: 'Clean Sheets',
    yellowCards: 'Yellow Cards',
    redCards: 'Red Cards',
    avgPossession: 'Avg. Possession',
    popularByRegion: 'Popular Leagues by Region',
    regEurope: 'Europe',
    regSouthAmerica: 'South America',
    regNorthAmerica: 'North America',
    regAsia: 'Asia',
    regAfrica: 'Africa',
    viewLeague: 'View league',
    trustMainTitle: 'Trusted by bettors worldwide',
    trustMainSub: '100% free · No sign up · Real-time data',
    trust1Title: 'Real-time Updates',
    trust1Sub: 'Live data, always',
    trust2Title: 'Advanced Analytics',
    trust2Sub: 'Deeper insights',
    trust3Title: 'Global Coverage',
    trust3Sub: '88+ leagues',
    trust4Title: 'Data You Can Trust',
    trust4Sub: 'Verified sources',
    exploreTools: 'Explore Tools',
  },
  es: {
    eyebrow: 'FÚTBOL GLOBAL. ANÁLISIS MÁS INTELIGENTES.',
    heroTitle1: 'Explora las Ligas.',
    heroTitle2: 'Cada tabla. Cada estadística. En todas partes.',
    heroSub:
      'Clasificaciones en vivo, calendario, forma y estadísticas avanzadas de las ligas de fútbol de todo el mundo. Impulsado por datos.',
    kpi1: 'Ligas en el Mundo',
    kpi2: 'Países Cubiertos',
    kpi3: 'Partidos Hoy en Vivo',
    kpi4: 'Torneos en Tendencia',
    searchPlaceholder: 'Buscar ligas...',
    allCountries: 'Todos los Países',
    allCompTypes: 'Todos los Torneos',
    domesticLeague: 'Ligas Nacionales',
    continentalCup: 'Copas Continentales',
    moreFilters: 'Más Filtros',
    resetFilters: 'Restablecer Filtros',
    featuredLeagues: 'Ligas Destacadas',
    viewAllLeagues: 'Ver todas las ligas',
    changeLeague: 'Cambiar Liga',
    tabStandings: 'Clasificación',
    tabFixtures: 'Calendario',
    tabResults: 'Resultados',
    tabForm: 'Forma',
    tabStats: 'Stats',
    tabInsights: 'Insights',
    clubCol: 'Club',
    formCol: 'Forma',
    viewFullStandings: 'Ver clasificación completa',
    collapseStandings: 'Mostrar top 5',
    topScorers: 'Máximos Goleadores',
    viewAll: 'Ver todos',
    goalsLabel: 'Goles',
    upcomingFixtures: 'Próximos Partidos',
    leagueAtGlance: 'Resumen de la Liga',
    matchesPlayed: 'Partidos Jugados',
    goalsScored: 'Goles Marcados',
    goalsPerMatch: 'Goles por Partido',
    cleanSheets: 'Porterías a Cero',
    yellowCards: 'Tarjetas Amarillas',
    redCards: 'Tarjetas Rojas',
    avgPossession: 'Posesión Media',
    popularByRegion: 'Ligas Populares por Región',
    regEurope: 'Europa',
    regSouthAmerica: 'Sudamérica',
    regNorthAmerica: 'Norteamérica',
    regAsia: 'Asia',
    regAfrica: 'África',
    viewLeague: 'Ver liga',
    trustMainTitle: 'Confiado por apostadores de todo el mundo',
    trustMainSub: '100% gratis · Datos en tiempo real',
    trust1Title: 'Actualización en Vivo',
    trust1Sub: 'Datos en directo siempre',
    trust2Title: 'Analítica Avanzada',
    trust2Sub: 'Insights más profundos',
    trust3Title: 'Cobertura Global',
    trust3Sub: '88+ ligas',
    trust4Title: 'Datos Confiables',
    trust4Sub: 'Fuentes verificadas',
    exploreTools: 'Explorar Herramientas',
  },
  de: {
    eyebrow: 'GLOBALER FUSSBALL. SMARTERE INSIGHTS.',
    heroTitle1: 'Ligen entdecken.',
    heroTitle2: 'Jede Tabelle. Jede Statistik. Überall.',
    heroSub:
      'Live-Tabellen, Spielpläne, Formkurven und erweiterte Statistiken für Fußballligen weltweit. Datengetrieben für klügere Entscheidungen.',
    kpi1: 'Ligen Weltweit',
    kpi2: 'Abgedeckte Länder',
    kpi3: 'Live-Spiele Heute',
    kpi4: 'Trend-Wettbewerbe',
    searchPlaceholder: 'Ligen suchen...',
    allCountries: 'Alle Länder',
    allCompTypes: 'Alle Wettbewerbstypen',
    domesticLeague: 'Nationale Ligen',
    continentalCup: 'Kontinentalpokale',
    moreFilters: 'Mehr Filter',
    resetFilters: 'Filter zurücksetzen',
    featuredLeagues: 'Top-Ligen',
    viewAllLeagues: 'Alle Ligen ansehen',
    changeLeague: 'Liga wechseln',
    tabStandings: 'Tabelle',
    tabFixtures: 'Spielplan',
    tabResults: 'Ergebnisse',
    tabForm: 'Form',
    tabStats: 'Statistik',
    tabInsights: 'Insights',
    clubCol: 'Verein',
    formCol: 'Form',
    viewFullStandings: 'Komplette Tabelle ansehen',
    collapseStandings: 'Top 5 anzeigen',
    topScorers: 'Torjäger',
    viewAll: 'Alle ansehen',
    goalsLabel: 'Tore',
    upcomingFixtures: 'Anstehende Spiele',
    leagueAtGlance: 'Liga im Überblick',
    matchesPlayed: 'Gespielte Partien',
    goalsScored: 'Erzielte Tore',
    goalsPerMatch: 'Tore pro Spiel',
    cleanSheets: 'Zu-Null-Spiele',
    yellowCards: 'Gelbe Karten',
    redCards: 'Rote Karten',
    avgPossession: 'Ø Ballbesitz',
    popularByRegion: 'Beliebte Ligen nach Region',
    regEurope: 'Europa',
    regSouthAmerica: 'Südamerika',
    regNorthAmerica: 'Nordamerika',
    regAsia: 'Asien',
    regAfrica: 'Afrika',
    viewLeague: 'Liga ansehen',
    trustMainTitle: 'Weltweit von Sportwettern geschätzt',
    trustMainSub: '100% kostenlos · Echtzeit-Daten',
    trust1Title: 'Echtzeit-Updates',
    trust1Sub: 'Immer Live-Daten',
    trust2Title: 'Erweiterte Analytik',
    trust2Sub: 'Tiefere Einblicke',
    trust3Title: 'Globale Abdeckung',
    trust3Sub: '88+ Ligen',
    trust4Title: 'Verlässliche Daten',
    trust4Sub: 'Verifizierte Quellen',
    exploreTools: 'Tools entdecken',
  },
};

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({
  language = 'bg',
  matches,
  setActiveTab,
  onOpenMatch,
}) => {
  const t = (DICT as Record<string, typeof DICT.en>)[language] || DICT.en;

  const [selectedLeagueKey, setSelectedLeagueKey] = useState<string>('premier-league');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [compTypeFilter, setCompTypeFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('auto');
  const [hubSubTab, setHubSubTab] = useState<
    'standings' | 'fixtures' | 'results' | 'form' | 'stats' | 'insights'
  >('standings');
  const [showFullTable, setShowFullTable] = useState<boolean>(false);
  const [activeRegion, setActiveRegion] = useState<
    'europe' | 'south_america' | 'north_america' | 'asia' | 'africa'
  >('europe');

  const baseLeague = LEAGUES_DATABASE[selectedLeagueKey] || LEAGUES_DATABASE['premier-league'];
  const [liveLeagueIntel, setLiveLeagueIntel] = useState<{
    leagueId: number;
    seasonLabel?: string;
    standings: StandingRow[];
    topScorers: TopScorerRow[];
    upcomingFixtures: UpcomingFixtureRow[];
    glance: LeagueGlanceData | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/football/league-intel/${baseLeague.apiLeagueId}?season=${encodeURIComponent(seasonFilter)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.configured) {
          const logoRegistrations: {
            homeTeam: string;
            awayTeam: string;
            homeLogo?: string;
            awayLogo?: string;
          }[] = [];
          for (const row of data.standings || []) {
            if (row.club && row.clubLogo) {
              logoRegistrations.push({
                homeTeam: row.club,
                awayTeam: row.club,
                homeLogo: row.clubLogo,
                awayLogo: row.clubLogo,
              });
            }
          }
          for (const sc of data.topScorers || []) {
            if (sc.club && sc.clubLogo) {
              logoRegistrations.push({
                homeTeam: sc.club,
                awayTeam: sc.club,
                homeLogo: sc.clubLogo,
                awayLogo: sc.clubLogo,
              });
            }
          }
          for (const fx of data.upcomingFixtures || []) {
            if (fx.homeTeam && fx.homeLogo) {
              logoRegistrations.push({
                homeTeam: fx.homeTeam,
                awayTeam: fx.homeTeam,
                homeLogo: fx.homeLogo,
                awayLogo: fx.homeLogo,
              });
            }
            if (fx.awayTeam && fx.awayLogo) {
              logoRegistrations.push({
                homeTeam: fx.awayTeam,
                awayTeam: fx.awayTeam,
                homeLogo: fx.awayLogo,
                awayLogo: fx.awayLogo,
              });
            }
          }
          if (logoRegistrations.length > 0) {
            registerMatchLogos(logoRegistrations);
          }
          setLiveLeagueIntel({
            leagueId: baseLeague.apiLeagueId,
            seasonLabel: data.seasonLabel || baseLeague.season,
            standings: Array.isArray(data.standings) ? data.standings : [],
            topScorers: Array.isArray(data.topScorers) ? data.topScorers : [],
            upcomingFixtures: Array.isArray(data.upcomingFixtures) ? data.upcomingFixtures : [],
            glance: data.glance || null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [baseLeague.apiLeagueId, seasonFilter]);

  const isLiveIntelReady = liveLeagueIntel?.leagueId === baseLeague.apiLeagueId;

  const activeLeague: LeagueHubData = {
    ...baseLeague,
    season:
      isLiveIntelReady && liveLeagueIntel?.seasonLabel
        ? liveLeagueIntel.seasonLabel
        : baseLeague.season,
    standings:
      isLiveIntelReady && liveLeagueIntel.standings.length > 0
        ? liveLeagueIntel.standings
        : baseLeague.standings,
    topScorers:
      isLiveIntelReady && liveLeagueIntel.topScorers.length > 0
        ? liveLeagueIntel.topScorers
        : baseLeague.topScorers,
    upcomingFixtures:
      isLiveIntelReady
        ? liveLeagueIntel.upcomingFixtures
        : baseLeague.upcomingFixtures,
    glance: isLiveIntelReady ? liveLeagueIntel.glance : baseLeague.glance,
  };

  // Featured Leagues Carousel Items with Official API-Sports League Emblems
  const featuredLeaguesList = [
    {
      key: 'premier-league',
      name: 'Premier League',
      country: 'England',
      badgeBg: 'from-[#3d0c52] to-[#20032c]',
      badgeBorder: 'border-purple-400/40',
      logoUrl: '/api/football/media/leagues/39.png',
    },
    {
      key: 'la-liga',
      name: 'La Liga',
      country: 'Spain',
      badgeBg: 'from-[#7f1d1d] to-[#310a0a]',
      badgeBorder: 'border-red-500/40',
      logoUrl: '/api/football/media/leagues/140.png',
    },
    {
      key: 'serie-a',
      name: 'Serie A',
      country: 'Italy',
      badgeBg: 'from-[#0369a1] to-[#082f49]',
      badgeBorder: 'border-sky-400/40',
      logoUrl: '/api/football/media/leagues/135.png',
    },
    {
      key: 'bundesliga',
      name: 'Bundesliga',
      country: 'Germany',
      badgeBg: 'from-[#b91c1c] to-[#450a0a]',
      badgeBorder: 'border-red-500/40',
      logoUrl: '/api/football/media/leagues/78.png',
    },
    {
      key: 'ucl',
      name: 'UEFA Champions League',
      country: 'Europe',
      badgeBg: 'from-[#1e3a8a] to-[#0f172a]',
      badgeBorder: 'border-blue-400/40',
      logoUrl: '/api/football/media/leagues/2.png',
    },
    {
      key: 'copa-libertadores',
      name: 'Copa Libertadores',
      country: 'South America',
      badgeBg: 'from-[#78350f] to-[#271003]',
      badgeBorder: 'border-amber-400/40',
      logoUrl: '/api/football/media/leagues/13.png',
    },
    {
      key: 'ligue-1',
      name: 'Ligue 1',
      country: 'France',
      badgeBg: 'from-[#1e293b] to-[#090d16]',
      badgeBorder: 'border-emerald-400/40',
      logoUrl: '/api/football/media/leagues/61.png',
    },
    {
      key: 'eredivisie',
      name: 'Eredivisie',
      country: 'Netherlands',
      badgeBg: 'from-[#1e1b4b] to-[#090a1a]',
      badgeBorder: 'border-indigo-400/40',
      logoUrl: '/api/football/media/leagues/88.png',
    },
  ];

  // Popular Leagues by Region cards with Official API-Sports League Emblems
  const regionalLeagues = [
    {
      key: 'primeira-liga',
      name: 'Primeira Liga',
      country: 'Portugal',
      season: '2025/26',
      region: 'europe',
      crestBg: 'from-emerald-800 to-red-900',
      logoUrl: '/api/football/media/leagues/94.png',
    },
    {
      key: 'ligue-1',
      name: 'Ligue 1',
      country: 'France',
      season: '2025/26',
      region: 'europe',
      crestBg: 'from-slate-800 to-slate-950',
      logoUrl: '/api/football/media/leagues/61.png',
    },
    {
      key: 'eredivisie',
      name: 'Eredivisie',
      country: 'Netherlands',
      season: '2025/26',
      region: 'europe',
      crestBg: 'from-blue-900 to-indigo-950',
      logoUrl: '/api/football/media/leagues/88.png',
    },
    {
      key: 'argentina-primera',
      name: 'Liga Profesional',
      country: 'Argentina',
      season: '2025',
      region: 'south_america',
      crestBg: 'from-sky-600 to-amber-700',
      logoUrl: '/api/football/media/leagues/128.png',
    },
    {
      key: 'brasileirao',
      name: 'Brasileirão Série A',
      country: 'Brazil',
      season: '2025',
      region: 'south_america',
      crestBg: 'from-yellow-500 to-emerald-900',
      logoUrl: '/api/football/media/leagues/71.png',
    },
    {
      key: 'mls',
      name: 'MLS',
      country: 'United States',
      season: '2025',
      region: 'north_america',
      crestBg: 'from-red-700 to-blue-950',
      logoUrl: '/api/football/media/leagues/253.png',
    },
  ];

  const handleOpenFixtureMatch = (fixture: UpcomingFixtureRow) => {
    if (!onOpenMatch) return;
    const found =
      matches.find((m) => m.id === fixture.id) ||
      matches.find(
        (m) =>
          m.homeTeam.toLowerCase() === fixture.homeTeam.toLowerCase() &&
          m.awayTeam.toLowerCase() === fixture.awayTeam.toLowerCase()
      );

    if (found) {
      onOpenMatch(found);
      return;
    }

    // Build a real Match object for API-Football fixture ID so MatchDetailPage fetches its live telemetry
    const constructedMatch: Match = {
      id: fixture.id,
      league: activeLeague.name,
      leagueCountry: activeLeague.country,
      leagueLogo: `/api/football/media/leagues/${activeLeague.apiLeagueId}.png`,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeLogo: fixture.homeLogo,
      awayLogo: fixture.awayLogo,
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED',
      startTime: fixture.dayLabel,
      hasRealStats: false,
      bookmakerOdds: { home: 2.1, draw: 3.4, away: 3.3 },
      fairOdds: {
        homeProb: 0.45,
        drawProb: 0.27,
        awayProb: 0.28,
        fairHomeOdds: 2.22,
        fairDrawOdds: 3.7,
        fairAwayOdds: 3.57,
        over25Prob: 0.54,
        under25Prob: 0.46,
        bttsProb: 0.52,
        expectedGoalsHome: 1.45,
        expectedGoalsAway: 1.15,
      },
      events: [],
      stats: {
        possessionHome: 50,
        possessionAway: 50,
        shotsHome: 0,
        shotsAway: 0,
        shotsOnTargetHome: 0,
        shotsOnTargetAway: 0,
        cornersHome: 0,
        cornersAway: 0,
        dangerousAttacksHome: 0,
        dangerousAttacksAway: 0,
        foulsHome: 0,
        foulsAway: 0,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 0,
        redCardsAway: 0,
      },
    };
    onOpenMatch(constructedMatch);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCountryFilter('all');
    setCompTypeFilter('all');
    setSeasonFilter('auto');
  };

  const displayedStandings = showFullTable
    ? activeLeague.standings
    : activeLeague.standings.slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* =================================================================== */}
      {/* ROW 1: HERO BANNER WITH 4 KPI CARDS & WIREFRAME GLOBE */}
      {/* =================================================================== */}
      <div className="relative rounded-2xl border border-[#172434] bg-gradient-to-r from-[#060b12] via-[#09151d] to-[#061812] p-6 lg:p-7 overflow-hidden shadow-2xl">
        {/* Decorative Wireframe Globe & Emerald Glow on the Right */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 w-96 h-96 rounded-full bg-[#22c55e]/15 blur-3xl"
          aria-hidden="true"
        />
        <svg
          className="pointer-events-none absolute right-0 top-0 h-full w-80 text-[#43f08a]/15 hidden lg:block"
          viewBox="0 0 300 200"
          fill="none"
        >
          <circle cx="240" cy="110" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="240" cy="110" r="85" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="240" cy="110" rx="55" ry="110" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="240" cy="110" rx="110" ry="45" stroke="currentColor" strokeWidth="1" />
          <line x1="130" y1="110" x2="350" y2="110" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          {/* Left Headline (5 cols) */}
          <div className="xl:col-span-5 space-y-2">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#43f08a] block">
              {t.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-white block">{t.heroTitle1}</span>
              <span className="text-[#43f08a] block">{t.heroTitle2}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-lg pt-1 leading-relaxed">
              {t.heroSub}
            </p>
          </div>

          {/* Right 4 Metric Cards (7 cols) */}
          <div className="xl:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { val: '88+', label: t.kpi1, icon: '🌐' },
              { val: '42', label: t.kpi2, icon: '🏳️' },
              { val: '112', label: t.kpi3, icon: '📈' },
              { val: '6', label: t.kpi4, icon: '🔥' },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#1b2c3b] bg-[#0a131c]/90 p-4 flex items-center gap-3.5 shadow-lg backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#0e261c] border border-[#22c55e]/40 flex items-center justify-center text-base text-[#43f08a] shrink-0">
                  {kpi.icon}
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono block leading-none">
                    {kpi.val}
                  </span>
                  <span className="text-[11px] text-[#8f9cae] leading-tight block mt-1">
                    {kpi.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 2: SEARCH & FILTER CONTROLS BAR */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#172332] bg-[#0a1018] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[210px] flex-1 sm:flex-initial sm:w-64">
            <svg
              className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-[#1c2a3b] bg-[#0d1520] pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#64748b] focus:border-[#43f08a] focus:outline-none"
            />
          </div>

          {/* All Countries */}
          <select
            value={countryFilter}
            onChange={(e) => {
              const val = e.target.value;
              setCountryFilter(val);
              if (val === 'England') setSelectedLeagueKey('premier-league');
              if (val === 'Spain') setSelectedLeagueKey('la-liga');
              if (val === 'Italy') setSelectedLeagueKey('serie-a');
              if (val === 'Germany') setSelectedLeagueKey('bundesliga');
              if (val === 'Europe') setSelectedLeagueKey('ucl');
            }}
            className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3.5 py-2 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer"
          >
            <option value="all">🌐 {t.allCountries}</option>
            <option value="England">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</option>
            <option value="Spain">🇪🇸 Spain</option>
            <option value="Italy">🇮🇹 Italy</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Europe">🇪🇺 Europe (UEFA)</option>
          </select>

          {/* All Competition Types */}
          <select
            value={compTypeFilter}
            onChange={(e) => setCompTypeFilter(e.target.value)}
            className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3.5 py-2 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer"
          >
            <option value="all">🏆 {t.allCompTypes}</option>
            <option value="domestic">{t.domesticLeague}</option>
            <option value="continental">{t.continentalCup}</option>
          </select>

          {/* Season Selector */}
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3.5 py-2 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer"
          >
            <option value="auto">📅 Текущ сезон (Актуален)</option>
            <option value="2025">📅 2025/26</option>
            <option value="2024">📅 2024/25</option>
            <option value="2023">📅 2023/24</option>
          </select>

          {/* More Filters */}
          <button
            type="button"
            onClick={() => setShowFullTable(!showFullTable)}
            className="px-3.5 py-2 rounded-xl border border-[#1c2a3b] bg-[#0d1520] hover:border-[#43f08a]/50 text-xs text-neutral-200 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎛️</span>
            <span>{t.moreFilters}</span>
          </button>
        </div>

        {/* Reset Filters */}
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-xs text-[#8f9cae] hover:text-white flex items-center gap-1.5 px-2 py-1 cursor-pointer"
        >
          <span>↻</span>
          <span>{t.resetFilters}</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* ROW 3: FEATURED LEAGUES HORIZONTAL RIBBON */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#172332] bg-[#0a1018] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <span className="text-[#43f08a]">☆</span>
            <span>{t.featuredLeagues}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const keys = Object.keys(LEAGUES_DATABASE);
                const idx = keys.indexOf(selectedLeagueKey);
                const prev = keys[(idx - 1 + keys.length) % keys.length];
                setSelectedLeagueKey(prev);
              }}
              className="w-6 h-6 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-xs text-neutral-300 flex items-center justify-center cursor-pointer"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => {
                const keys = Object.keys(LEAGUES_DATABASE);
                const idx = keys.indexOf(selectedLeagueKey);
                const next = keys[(idx + 1) % keys.length];
                setSelectedLeagueKey(next);
              }}
              className="w-6 h-6 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-xs text-neutral-300 flex items-center justify-center cursor-pointer"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {featuredLeaguesList
            .filter((item) =>
              searchQuery.trim()
                ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.country.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            )
            .map((lg, idx) => {
              const isSelected = selectedLeagueKey === lg.key;
              return (
                <button
                  key={`${lg.name}-${idx}`}
                  type="button"
                  onClick={() => setSelectedLeagueKey(lg.key)}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'border-[#43f08a] bg-[#0e231b] shadow-md shadow-[#22c55e]/10'
                      : 'border-[#1a2636] bg-[#0d1520] hover:border-[#2c4059]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-white/95 border ${lg.badgeBorder} flex items-center justify-center p-1.5 shadow-sm shrink-0`}
                  >
                    <img
                      src={lg.logoUrl}
                      alt={lg.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-white truncate">{lg.name}</div>
                    <div className="text-[10px] text-[#8f9cae] truncate">{lg.country}</div>
                    <div className="inline-flex items-center gap-1 text-[10px] text-[#43f08a] font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#43f08a]" />
                      <span>Live</span>
                    </div>
                  </div>
                </button>
              );
            })}

          {/* 9th Card: View all leagues */}
          <button
            type="button"
            onClick={() => setShowFullTable(!showFullTable)}
            className="rounded-xl border border-[#1a2636] bg-[#0d1520] hover:border-[#43f08a]/50 p-3 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all"
          >
            <span className="text-base text-neutral-300">⊞</span>
            <span className="text-[11px] font-bold text-white">{t.viewAllLeagues} ›</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 4: MAIN 4-PANEL LEAGUE HUB (Standings 5 | Top Scorers 2.5 | Upcoming 2.5 | Glance 2) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1 (Left 5 cols): Active League Standings & Sub-Tabs */}
        <div className="xl:col-span-5 rounded-2xl border border-[#182434] bg-[#0a1018] p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            {/* League Header + Change League Dropdown */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/95 border border-white/20 flex items-center justify-center p-1 shadow-sm shrink-0">
                  <img
                    src={`/api/football/media/leagues/${activeLeague.apiLeagueId}.png`}
                    alt={activeLeague.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-white">{activeLeague.name}</h2>
                  <span className="text-xs text-[#8f9cae]">
                    {activeLeague.flag} {activeLeague.country} · {activeLeague.season}
                  </span>
                </div>
              </div>

              <select
                value={selectedLeagueKey}
                onChange={(e) => setSelectedLeagueKey(e.target.value)}
                className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3 py-1.5 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer"
              >
                <option value="premier-league">Premier League</option>
                <option value="la-liga">La Liga</option>
                <option value="serie-a">Serie A</option>
                <option value="bundesliga">Bundesliga</option>
                <option value="ucl">Champions League</option>
                <option value="ligue-1">Ligue 1</option>
                <option value="eredivisie">Eredivisie</option>
                <option value="primeira-liga">Primeira Liga</option>
                <option value="copa-libertadores">Copa Libertadores</option>
                <option value="argentina-primera">Liga Profesional (ARG)</option>
                <option value="brasileirao">Brasileirão Série A</option>
                <option value="mls">MLS</option>
              </select>
            </div>

            {/* 6 Sub-tabs: Standings | Fixtures | Results | Form | Stats | Insights */}
            <div className="flex items-center gap-4 border-b border-[#162232] text-xs overflow-x-auto no-scrollbar">
              {[
                { key: 'standings', label: t.tabStandings },
                { key: 'fixtures', label: t.tabFixtures },
                { key: 'results', label: t.tabResults },
                { key: 'form', label: t.tabForm },
                { key: 'stats', label: t.tabStats },
                { key: 'insights', label: t.tabInsights },
              ].map((tb) => {
                const active = hubSubTab === tb.key;
                return (
                  <button
                    key={tb.key}
                    type="button"
                    onClick={() => setHubSubTab(tb.key as typeof hubSubTab)}
                    className={`pb-2.5 font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                      active ? 'text-[#43f08a] font-bold' : 'text-[#8f9cae] hover:text-white'
                    }`}
                  >
                    {tb.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#43f08a] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-[#64748b] border-b border-[#162232]">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-3">{t.clubCol}</th>
                    <th className="py-2 px-1.5 text-center">P</th>
                    <th className="py-2 px-1.5 text-center">W</th>
                    <th className="py-2 px-1.5 text-center">D</th>
                    <th className="py-2 px-1.5 text-center">L</th>
                    <th className="py-2 px-1.5 text-center">GF</th>
                    <th className="py-2 px-1.5 text-center">GA</th>
                    <th className="py-2 px-1.5 text-center">GD</th>
                    <th className="py-2 px-2 text-center text-white">Pts</th>
                    <th className="py-2 pl-2 text-right">{t.formCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141f2e] font-mono text-[11px]">
                  {displayedStandings.map((row) => (
                    <tr
                      key={row.rank}
                      className="hover:bg-[#0e1622] transition-colors"
                    >
                      <td className="py-2.5 pr-2 font-bold text-neutral-300">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-0.5 h-3.5 rounded-full bg-[#43f08a]" />
                          {row.rank}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-sans">
                        <div className="flex items-center gap-2">
                          <TeamBadge
                            name={row.club}
                            logoUrl={row.clubLogo}
                            size="sm"
                            className="w-5 h-5 text-[8px]"
                          />
                          <span className="font-bold text-white truncate max-w-[125px]">
                            {row.club}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.p}</td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.w}</td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.d}</td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.l}</td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.gf}</td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.ga}</td>
                      <td className="py-2.5 px-1.5 text-center text-neutral-300">{row.gd}</td>
                      <td className="py-2.5 px-2 text-center font-black text-white">{row.pts}</td>
                      <td className="py-2.5 pl-2">
                        <div className="flex items-center justify-end gap-1">
                          {row.form.map((f, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                                f === 'W'
                                  ? 'bg-[#10b981] text-[#04130b]'
                                  : f === 'D'
                                  ? 'bg-[#334155] text-white'
                                  : 'bg-[#ef4444] text-white'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom View Full Standings Link */}
          <button
            type="button"
            onClick={() => setShowFullTable(!showFullTable)}
            className="pt-3 border-t border-[#162232] w-full text-center text-xs font-semibold text-neutral-300 hover:text-[#43f08a] transition-colors cursor-pointer"
          >
            {showFullTable ? t.collapseStandings : `${t.viewFullStandings} →`}
          </button>
        </div>

        {/* PANEL 2 (Center-Left 2 cols): Top Scorers */}
        <div className="xl:col-span-2 rounded-2xl border border-[#182434] bg-[#0a1018] p-4 flex flex-col justify-between shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
            <h3 className="text-sm font-extrabold text-white">{t.topScorers}</h3>
            <button
              type="button"
              onClick={() => setShowFullTable(!showFullTable)}
              className="text-[11px] font-semibold text-[#43f08a] hover:underline cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="divide-y divide-[#141f2e] flex-1 flex flex-col justify-around">
            {activeLeague.topScorers.slice(0, 5).map((sc) => (
              <div key={sc.rank} className="py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-[#8f9cae] w-3">{sc.rank}</span>
                  {sc.photo ? (
                    <img
                      src={sc.photo}
                      alt={sc.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 bg-[#0d1520]"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${sc.avatarGradient} border border-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0`}
                    >
                      {sc.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{sc.name}</div>
                    <div className="text-[10px] text-[#8f9cae] truncate">
                      {sc.club}
                      {typeof sc.assists === 'number' && sc.assists > 0
                        ? ` · ${sc.assists} асист.`
                        : ''}
                      {typeof sc.yellowCards === 'number' && sc.yellowCards > 0
                        ? ` · 🟨 ${sc.yellowCards}`
                        : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-black text-white block leading-none">
                    {sc.goals}
                  </span>
                  <span className="text-[9px] text-[#8f9cae]">{t.goalsLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 3 (Center-Right 3 cols): Upcoming Fixtures */}
        <div className="xl:col-span-3 rounded-2xl border border-[#182434] bg-[#0a1018] p-4 flex flex-col justify-between shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
            <h3 className="text-sm font-extrabold text-white">{t.upcomingFixtures}</h3>
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className="text-[11px] font-semibold text-[#43f08a] hover:underline cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="divide-y divide-[#141f2e] flex-1 flex flex-col justify-around">
            {activeLeague.upcomingFixtures.length > 0 ? (
              activeLeague.upcomingFixtures.map((fx) => (
                <div
                  key={fx.id}
                  onClick={() => handleOpenFixtureMatch(fx)}
                  className="py-2 space-y-1.5 hover:bg-[#0e1622] rounded-lg px-1.5 transition-colors cursor-pointer group"
                >
                  <span className="text-[10px] text-[#8f9cae] block">{fx.dayLabel}</span>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="font-bold text-white group-hover:text-[#43f08a] truncate">
                        {fx.homeTeam}
                      </span>
                      <TeamBadge
                        name={fx.homeTeam}
                        logoUrl={fx.homeLogo}
                        size="sm"
                        className="w-5 h-5 text-[8px]"
                      />
                    </div>

                    <span className="px-2 py-0.5 rounded bg-[#131d2a] border border-[#1f2e42] font-mono text-[11px] font-bold text-neutral-200 shrink-0">
                      {fx.time}
                    </span>

                    <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
                      <TeamBadge
                        name={fx.awayTeam}
                        logoUrl={fx.awayLogo}
                        size="sm"
                        className="w-5 h-5 text-[8px]"
                      />
                      <span className="font-bold text-white group-hover:text-[#43f08a] truncate">
                        {fx.awayTeam}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#8f9cae]">
                Няма обявени предстоящи мачове в API за този период.
              </div>
            )}
          </div>
        </div>

        {/* PANEL 4 (Right 2 cols): League at a Glance (100% Real Calculated Stats from Standings) */}
        {activeLeague.glance && (
          <div className="xl:col-span-2 rounded-2xl border border-[#182434] bg-[#0a1018] p-4 flex flex-col justify-between shadow-xl space-y-3">
            <div className="border-b border-[#162232] pb-2.5">
              <h3 className="text-sm font-extrabold text-white">{t.leagueAtGlance}</h3>
            </div>

            <div className="divide-y divide-[#141f2e] text-xs flex-1 flex flex-col justify-around">
              {[
                { label: t.matchesPlayed, val: activeLeague.glance.matchesPlayed },
                { label: t.goalsScored, val: activeLeague.glance.goalsScored },
                { label: t.goalsPerMatch, val: activeLeague.glance.goalsPerMatch },
                ...(activeLeague.glance.winsDraws
                  ? [{ label: 'Победи / Равенства', val: activeLeague.glance.winsDraws }]
                  : []),
                ...(activeLeague.glance.bestAttack
                  ? [{ label: 'Най-силна атака', val: activeLeague.glance.bestAttack }]
                  : []),
                ...(activeLeague.glance.bestDefense
                  ? [{ label: 'Най-здрава защита', val: activeLeague.glance.bestDefense }]
                  : []),
              ].map((item, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-[#8f9cae] text-[11px] shrink-0">{item.label}</span>
                  <span className="font-mono font-black text-white text-right truncate">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* ROW 5: POPULAR LEAGUES BY REGION */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#172332] bg-[#0a1018] p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Region Selector (2 cols) */}
        <div className="lg:col-span-2 space-y-2.5 pr-2 lg:border-r border-[#162232]">
          <h3 className="text-xs font-extrabold text-white">{t.popularByRegion}</h3>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {[
              { key: 'europe', label: t.regEurope },
              { key: 'south_america', label: t.regSouthAmerica },
              { key: 'north_america', label: t.regNorthAmerica },
              { key: 'asia', label: t.regAsia },
              { key: 'africa', label: t.regAfrica },
            ].map((reg) => {
              const active = activeRegion === reg.key;
              return (
                <button
                  key={reg.key}
                  type="button"
                  onClick={() => setActiveRegion(reg.key as typeof activeRegion)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0f291e] border border-[#22c55e]/60 text-[#43f08a]'
                      : 'text-[#8f9cae] hover:text-white'
                  }`}
                >
                  {reg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 6 Regional League Cards (10 cols) */}
        <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {regionalLeagues.map((rl, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#1a2636] bg-[#0d1520] hover:border-[#43f08a]/50 p-3 flex flex-col justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/95 border border-white/20 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                  <img
                    src={rl.logoUrl}
                    alt={rl.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-white truncate">{rl.name}</div>
                  <div className="text-[10px] text-[#8f9cae] truncate">{rl.country}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-neutral-400 font-mono">{rl.season}</span>
                    <span className="inline-flex items-center gap-1 text-[#43f08a] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#43f08a]" />
                      Live
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedLeagueKey(rl.key);
                  window.scrollTo({ top: 260, behavior: 'smooth' });
                }}
                className="w-full py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0a1018] hover:border-[#43f08a]/50 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {t.viewLeague} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 6: BOTTOM TRUST & TOOLS BANNER */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#193829] bg-gradient-to-r from-[#081511] via-[#0a131c] to-[#091813] p-4 sm:p-5 flex flex-col xl:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#0f291e] border border-[#22c55e]/50 flex items-center justify-center text-[#43f08a] shrink-0">
            🛡️
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">{t.trustMainTitle}</div>
            <div className="text-[11px] text-[#8f9cae]">{t.trustMainSub}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {[
            { icon: '⏱️', title: t.trust1Title, sub: t.trust1Sub },
            { icon: '📈', title: t.trust2Title, sub: t.trust2Sub },
            { icon: '🌐', title: t.trust3Title, sub: t.trust3Sub },
            { icon: '✅', title: t.trust4Title, sub: t.trust4Sub },
          ].map((tr, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-base">{tr.icon}</span>
              <div>
                <div className="text-xs font-bold text-white">{tr.title}</div>
                <div className="text-[10px] text-[#8f9cae]">{tr.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className="px-5 py-2.5 rounded-xl border border-[#22c55e] bg-[#0f291e] hover:bg-[#22c55e] text-[#43f08a] hover:text-[#04130b] font-extrabold text-xs transition-all cursor-pointer shrink-0"
        >
          {t.exploreTools} →
        </button>
      </div>
    </div>
  );
};
