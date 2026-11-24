import React, { useEffect, useState } from 'react';
import { ActiveTab, Language, Match } from '../types';
import { registerMatchLogos, TeamBadge, openTeamProfile } from './TeamBadge';

interface CompetitionsViewProps {
  language?: Language;
  matches: Match[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCompetition?: (leagueName: string) => void;
  onOpenMatch?: (match: Match) => void;
  initialLeagueTarget?: { leagueKey?: string; leagueId?: number; leagueName?: string } | null;
}

interface FormMatchDetail {
  id: string;
  date: string;
  homeTeamId?: number;
  homeTeam: string;
  homeLogo?: string;
  awayTeamId?: number;
  awayTeam: string;
  awayLogo?: string;
  homeGoals: number;
  awayGoals: number;
  opponent: string;
  opponentLogo?: string;
  isHome: boolean;
  result: 'W' | 'D' | 'L';
}

interface StandingRow {
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
  gd: string;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  formDetails?: FormMatchDetail[];
}

interface TopScorerRow {
  rank: number;
  name: string;
  photo?: string;
  teamId?: number;
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
  homeTeamId?: number;
  homeTeam: string;
  homeLogo?: string;
  awayTeamId?: number;
  awayTeam: string;
  awayLogo?: string;
  time: string;
}

interface RecentResultRow {
  id: string;
  dayLabel: string;
  homeTeamId?: number;
  homeTeam: string;
  homeLogo?: string;
  awayTeamId?: number;
  awayTeam: string;
  awayLogo?: string;
  homeGoals: number;
  awayGoals: number;
  status: string;
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
  recentResults?: RecentResultRow[];
  glance: LeagueGlanceData | null;
}

interface GlobalCatalogLeague {
  apiLeagueId: number;
  name: string;
  country: string;
  countryCode: string | null;
  type: 'domestic' | 'continental';
  rawType: string;
  logo: string;
  season: number | string;
}

const createLeagueEntry = (
  id: string,
  apiLeagueId: number,
  name: string,
  country: string,
  flag: string,
  season: string,
  region: LeagueHubData['region'],
  type: LeagueHubData['type'] = 'domestic'
): LeagueHubData => ({
  id,
  apiLeagueId,
  name,
  country,
  flag,
  season,
  region,
  type,
  standings: [],
  topScorers: [],
  upcomingFixtures: [],
  glance: null,
});

// Top 50 Most Popular Football Leagues & Tournaments Worldwide
const LEAGUES_DATABASE: Record<string, LeagueHubData> = {
  'premier-league': createLeagueEntry('premier-league', 39, 'Premier League', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '2025/26', 'europe', 'domestic'),
  'la-liga': createLeagueEntry('la-liga', 140, 'La Liga', 'Spain', '🇪🇸', '2025/26', 'europe', 'domestic'),
  'serie-a': createLeagueEntry('serie-a', 135, 'Serie A', 'Italy', '🇮🇹', '2025/26', 'europe', 'domestic'),
  bundesliga: createLeagueEntry('bundesliga', 78, 'Bundesliga', 'Germany', '🇩🇪', '2025/26', 'europe', 'domestic'),
  'ligue-1': createLeagueEntry('ligue-1', 61, 'Ligue 1', 'France', '🇫🇷', '2025/26', 'europe', 'domestic'),
  ucl: createLeagueEntry('ucl', 2, 'UEFA Champions League', 'Europe', '🇪🇺', '2025/26', 'europe', 'continental'),
  uel: createLeagueEntry('uel', 3, 'UEFA Europa League', 'Europe', '🇪🇺', '2025/26', 'europe', 'continental'),
  uecl: createLeagueEntry('uecl', 848, 'UEFA Conference League', 'Europe', '🇪🇺', '2025/26', 'europe', 'continental'),
  'bulgaria-first': createLeagueEntry('bulgaria-first', 172, 'Първа лига (efbet Лига)', 'Bulgaria', '🇧🇬', '2025/26', 'europe', 'domestic'),
  'bulgaria-second': createLeagueEntry('bulgaria-second', 173, 'Втора лига (България)', 'Bulgaria', '🇧🇬', '2025/26', 'europe', 'domestic'),
  'bulgaria-cup': createLeagueEntry('bulgaria-cup', 174, 'Купа на България', 'Bulgaria', '🇧🇬', '2025/26', 'europe', 'domestic'),
  eredivisie: createLeagueEntry('eredivisie', 88, 'Eredivisie', 'Netherlands', '🇳🇱', '2025/26', 'europe', 'domestic'),
  'primeira-liga': createLeagueEntry('primeira-liga', 94, 'Primeira Liga', 'Portugal', '🇵🇹', '2025/26', 'europe', 'domestic'),
  'super-lig': createLeagueEntry('super-lig', 203, 'Süper Lig', 'Turkey', '🇹🇷', '2025/26', 'europe', 'domestic'),
  championship: createLeagueEntry('championship', 40, 'Championship', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '2025/26', 'europe', 'domestic'),
  'fa-cup': createLeagueEntry('fa-cup', 45, 'FA Cup', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '2025/26', 'europe', 'domestic'),
  'la-liga-2': createLeagueEntry('la-liga-2', 141, 'LaLiga 2', 'Spain', '🇪🇸', '2025/26', 'europe', 'domestic'),
  'serie-b': createLeagueEntry('serie-b', 136, 'Serie B', 'Italy', '🇮🇹', '2025/26', 'europe', 'domestic'),
  '2-bundesliga': createLeagueEntry('2-bundesliga', 79, '2. Bundesliga', 'Germany', '🇩🇪', '2025/26', 'europe', 'domestic'),
  'ligue-2': createLeagueEntry('ligue-2', 62, 'Ligue 2', 'France', '🇫🇷', '2025/26', 'europe', 'domestic'),
  'belgium-pro': createLeagueEntry('belgium-pro', 144, 'Jupiler Pro League', 'Belgium', '🇧🇪', '2025/26', 'europe', 'domestic'),
  'scotland-premiership': createLeagueEntry('scotland-premiership', 179, 'Premiership', 'Scotland', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '2025/26', 'europe', 'domestic'),
  'greece-super-league': createLeagueEntry('greece-super-league', 197, 'Super League 1', 'Greece', '🇬🇷', '2025/26', 'europe', 'domestic'),
  'austria-bundesliga': createLeagueEntry('austria-bundesliga', 218, 'Austrian Bundesliga', 'Austria', '🇦🇹', '2025/26', 'europe', 'domestic'),
  'switzerland-super-league': createLeagueEntry('switzerland-super-league', 207, 'Swiss Super League', 'Switzerland', '🇨🇭', '2025/26', 'europe', 'domestic'),
  'denmark-superliga': createLeagueEntry('denmark-superliga', 119, 'Superliga', 'Denmark', '🇩🇰', '2025/26', 'europe', 'domestic'),
  'poland-ekstraklasa': createLeagueEntry('poland-ekstraklasa', 106, 'Ekstraklasa', 'Poland', '🇵🇱', '2025/26', 'europe', 'domestic'),
  'czech-first-league': createLeagueEntry('czech-first-league', 345, 'Chance Liga', 'Czech-Republic', '🇨🇿', '2025/26', 'europe', 'domestic'),
  'romania-liga-1': createLeagueEntry('romania-liga-1', 283, 'SuperLiga', 'Romania', '🇷🇴', '2025/26', 'europe', 'domestic'),
  'serbia-super-liga': createLeagueEntry('serbia-super-liga', 286, 'Super Liga', 'Serbia', '🇷🇸', '2025/26', 'europe', 'domestic'),
  'croatia-hnl': createLeagueEntry('croatia-hnl', 210, 'HNL', 'Croatia', '🇭🇷', '2025/26', 'europe', 'domestic'),
  'norway-eliteserien': createLeagueEntry('norway-eliteserien', 103, 'Eliteserien', 'Norway', '🇳🇴', '2025', 'europe', 'domestic'),
  'sweden-allsvenskan': createLeagueEntry('sweden-allsvenskan', 113, 'Allsvenskan', 'Sweden', '🇸🇪', '2025', 'europe', 'domestic'),
  'ukraine-premier': createLeagueEntry('ukraine-premier', 333, 'Premier League', 'Ukraine', '🇺🇦', '2025/26', 'europe', 'domestic'),
  'hungary-nb1': createLeagueEntry('hungary-nb1', 271, 'NB I', 'Hungary', '🇭🇺', '2025/26', 'europe', 'domestic'),
  'cyprus-first': createLeagueEntry('cyprus-first', 318, '1. Division', 'Cyprus', '🇨🇾', '2025/26', 'europe', 'domestic'),
  'copa-libertadores': createLeagueEntry('copa-libertadores', 13, 'Copa Libertadores', 'South America', '🌎', '2025', 'south_america', 'continental'),
  'copa-sudamericana': createLeagueEntry('copa-sudamericana', 11, 'Copa Sudamericana', 'South America', '🌎', '2025', 'south_america', 'continental'),
  brasileirao: createLeagueEntry('brasileirao', 71, 'Brasileirão Série A', 'Brazil', '🇧🇷', '2025', 'south_america', 'domestic'),
  'argentina-primera': createLeagueEntry('argentina-primera', 128, 'Liga Profesional', 'Argentina', '🇦🇷', '2025', 'south_america', 'domestic'),
  'colombia-primera-a': createLeagueEntry('colombia-primera-a', 239, 'Primera A', 'Colombia', '🇨🇴', '2025', 'south_america', 'domestic'),
  'chile-primera': createLeagueEntry('chile-primera', 265, 'Primera División', 'Chile', '🇨🇱', '2025', 'south_america', 'domestic'),
  mls: createLeagueEntry('mls', 253, 'MLS', 'USA', '🇺🇸', '2025', 'north_america', 'domestic'),
  'liga-mx': createLeagueEntry('liga-mx', 262, 'Liga MX', 'Mexico', '🇲🇽', '2025/26', 'north_america', 'domestic'),
  'saudi-pro': createLeagueEntry('saudi-pro', 307, 'Saudi Pro League', 'Saudi-Arabia', '🇸🇦', '2025/26', 'asia', 'domestic'),
  'j1-league': createLeagueEntry('j1-league', 98, 'J1 League', 'Japan', '🇯🇵', '2025', 'asia', 'domestic'),
  'k-league-1': createLeagueEntry('k-league-1', 292, 'K League 1', 'South-Korea', '🇰🇷', '2025', 'asia', 'domestic'),
  'a-league': createLeagueEntry('a-league', 188, 'A-League', 'Australia', '🇦🇺', '2025/26', 'asia', 'domestic'),
  'egypt-premier': createLeagueEntry('egypt-premier', 233, 'Egyptian Premier League', 'Egypt', '🇪🇬', '2025/26', 'africa', 'domestic'),
  'morocco-botola': createLeagueEntry('morocco-botola', 200, 'Botola Pro', 'Morocco', '🇲🇦', '2025/26', 'africa', 'domestic'),
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
    trustMainSub: '100% безплатно · Данни в реално време · Квантова математическа архитектура',
    trust1Title: 'Обновяване на живо',
    trust1Sub: 'Винаги актуални данни',
    trust2Title: 'Разширена аналитика',
    trust2Sub: 'По-дълбоки +EV сигнали',
    trust3Title: 'Глобално покритие',
    trust3Sub: '88+ футболни лиги',
    trust4Title: 'Проверени данни',
    trust4Sub: 'Официални футболни статистики',
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
  initialLeagueTarget,
}) => {
  const t = (DICT as Record<string, typeof DICT.en>)[language] || DICT.en;

  const [selectedLeagueKey, setSelectedLeagueKey] = useState<string>('premier-league');
  const [customLeagueOverride, setCustomLeagueOverride] = useState<{
    apiLeagueId: number;
    name: string;
    country: string;
    flag: string;
  } | null>(null);
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

  // "Всички лиги" (All Leagues Directory Modal) & Full Global Catalog state
  const [showAllLeaguesModal, setShowAllLeaguesModal] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [modalCountryFilter, setModalCountryFilter] = useState<string>('all');
  const [modalVisibleLimit, setModalVisibleLimit] = useState<number>(90);
  const [modalRegionFilter, setModalRegionFilter] = useState<
    'all' | 'top50' | 'europe' | 'south_america' | 'north_america' | 'asia' | 'africa' | 'today'
  >('all');
  const [featuredPage, setFeaturedPage] = useState<number>(0);

  // Full Global Catalog of all active professional leagues & cups worldwide (cached 24h on backend)
  const [globalCatalog, setGlobalCatalog] = useState<{
    totalLeagues: number;
    totalCountries: number;
    countries: Array<{ name: string; count: number }>;
    leagues: GlobalCatalogLeague[];
  }>({
    totalLeagues: 0,
    totalCountries: 0,
    countries: [],
    leagues: [],
  });

  useEffect(() => {
    let active = true;
    fetch('/api/football/leagues-catalog')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.leagues)) {
          setGlobalCatalog({
            totalLeagues: Number(data.totalLeagues) || data.leagues.length,
            totalCountries: Number(data.totalCountries) || (data.countries?.length ?? 0),
            countries: Array.isArray(data.countries) ? data.countries : [],
            leagues: data.leagues,
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Floating hover tooltip state for W/D/L form badges in Standings & Form tables
  const [hoveredFormBadge, setHoveredFormBadge] = useState<{
    row: StandingRow;
    badgeIdx: number;
    resultChar: 'W' | 'D' | 'L';
    matchDetail?: FormMatchDetail;
    rect: { top: number; left: number };
  } | null>(null);

  // On-demand cache of last 5 finished matches per team (fallback if league-intel cache hasn't hydrated formDetails yet)
  const [teamFormCache, setTeamFormCache] = useState<Record<string, FormMatchDetail[]>>({});

  // Dedicated Match Details Modal Window when clicking any W/D/L badge or past match in Състезания
  const [selectedPastMatchModal, setSelectedPastMatchModal] = useState<{
    match: FormMatchDetail;
    teamRow?: StandingRow;
    badgeIdx?: number;
    loadingTeamMatches?: boolean;
  } | null>(null);
  const [pastMatchModalIntel, setPastMatchModalIntel] = useState<{
    found?: boolean;
    date?: string;
    league?: string;
    leagueRound?: string | null;
    homeTeam?: string;
    awayTeam?: string;
    homeLogo?: string;
    awayLogo?: string;
    homeScore?: number;
    awayScore?: number;
    halftimeScore?: string;
    venue?: string | null;
    referee?: string | null;
    hasRealStats?: boolean;
    stats?: {
      possessionHome: number;
      possessionAway: number;
      shotsHome: number;
      shotsAway: number;
      shotsOnTargetHome: number;
      shotsOnTargetAway: number;
      cornersHome: number;
      cornersAway: number;
      yellowCardsHome: number;
      yellowCardsAway: number;
    } | null;
    events?: Array<{
      min: string;
      team: 'home' | 'away';
      icon: string;
      title: string;
      sub: string;
      highlight?: boolean;
    }>;
  } | null>(null);
  const [pastMatchModalLoading, setPastMatchModalLoading] = useState<boolean>(false);

  const selectBuiltInLeague = (key: string) => {
    setCustomLeagueOverride(null);
    setSelectedLeagueKey(key);
  };

  const selectAnyLeague = (info: {
    apiLeagueId: number;
    name: string;
    country: string;
    flag?: string;
  }) => {
    const builtIn = Object.values(LEAGUES_DATABASE).find(
      (l) => l.apiLeagueId === info.apiLeagueId
    );
    if (builtIn) {
      selectBuiltInLeague(builtIn.id);
    } else {
      setCustomLeagueOverride({
        apiLeagueId: info.apiLeagueId,
        name: info.name,
        country: info.country,
        flag: info.flag || '🌍',
      });
    }
  };

  // Sync with initialLeagueTarget when navigated from Homepage Popular Leagues, TeamDetailPage, or MatchDetailPage
  useEffect(() => {
    if (!initialLeagueTarget) return;
    const keyAliases: Record<string, string> = {
      epl: 'premier-league',
      'premier-league': 'premier-league',
      laliga: 'la-liga',
      'la-liga': 'la-liga',
      seriea: 'serie-a',
      'serie-a': 'serie-a',
      bundesliga: 'bundesliga',
      ucl: 'ucl',
      uel: 'uel',
      uecl: 'uecl',
      'ligue-1': 'ligue-1',
      eredivisie: 'eredivisie',
      'primeira-liga': 'primeira-liga',
      'bulgaria-first': 'bulgaria-first',
    };
    if (initialLeagueTarget.leagueKey && keyAliases[initialLeagueTarget.leagueKey]) {
      selectBuiltInLeague(keyAliases[initialLeagueTarget.leagueKey]);
      return;
    }
    if (initialLeagueTarget.leagueId) {
      selectAnyLeague({
        apiLeagueId: initialLeagueTarget.leagueId,
        name: initialLeagueTarget.leagueName || `League #${initialLeagueTarget.leagueId}`,
        country: 'International',
        flag: '🏆',
      });
      return;
    }
    if (initialLeagueTarget.leagueName) {
      const norm = initialLeagueTarget.leagueName.toLowerCase();
      const foundByName = Object.values(LEAGUES_DATABASE).find(
        (l) =>
          l.name.toLowerCase().includes(norm) ||
          norm.includes(l.name.toLowerCase())
      );
      if (foundByName) {
        selectBuiltInLeague(foundByName.id);
      }
    }
  }, [initialLeagueTarget]);

  const rawBaseLeague = LEAGUES_DATABASE[selectedLeagueKey] || LEAGUES_DATABASE['premier-league'];
  const baseLeague: LeagueHubData = customLeagueOverride
    ? {
        ...rawBaseLeague,
        id: `custom-${customLeagueOverride.apiLeagueId}`,
        apiLeagueId: customLeagueOverride.apiLeagueId,
        name: customLeagueOverride.name,
        country: customLeagueOverride.country,
        flag: customLeagueOverride.flag,
        standings: [],
        topScorers: [],
        upcomingFixtures: [],
        recentResults: [],
        glance: null,
      }
    : rawBaseLeague;
  const [liveLeagueIntel, setLiveLeagueIntel] = useState<{
    leagueId: number;
    seasonLabel?: string;
    standings: StandingRow[];
    topScorers: TopScorerRow[];
    upcomingFixtures: UpcomingFixtureRow[];
    recentResults: RecentResultRow[];
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
          for (const fx of [...(data.upcomingFixtures || []), ...(data.recentResults || [])]) {
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
            recentResults: Array.isArray(data.recentResults) ? data.recentResults : [],
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
    recentResults:
      isLiveIntelReady
        ? liveLeagueIntel.recentResults
        : [],
    glance: isLiveIntelReady ? liveLeagueIntel.glance : baseLeague.glance,
  };

  // All 50 Popular Leagues derived directly from LEAGUES_DATABASE
  const featuredLeaguesList = Object.values(LEAGUES_DATABASE).map((lg) => ({
    key: lg.id,
    apiLeagueId: lg.apiLeagueId,
    name: lg.name,
    country: lg.country,
    flag: lg.flag,
    type: lg.type,
    region: lg.region,
    season: lg.season,
    badgeBorder: 'border-emerald-400/35',
    logoUrl: `/api/football/media/leagues/${lg.apiLeagueId}.png`,
  }));

  // Popular Leagues by Region derived from the Top 50 leagues
  const allRegionalLeagues = featuredLeaguesList.map((lg) => ({
    key: lg.key,
    name: lg.name,
    country: lg.country,
    season: lg.season,
    region: lg.region,
    logoUrl: lg.logoUrl,
  }));

  const regionalLeagues = allRegionalLeagues.filter((rl) => rl.region === activeRegion).slice(0, 6);

  const handleOpenFixtureMatch = (
    fixture: UpcomingFixtureRow & { homeGoals?: number; awayGoals?: number; status?: 'FINISHED' | 'SCHEDULED' }
  ) => {
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

    const scoreParts =
      typeof fixture.time === 'string' && fixture.time.includes('-')
        ? fixture.time.split('-').map((s) => Number(s.trim()))
        : [];
    const parsedHomeScore =
      typeof fixture.homeGoals === 'number'
        ? fixture.homeGoals
        : scoreParts.length === 2 && !Number.isNaN(scoreParts[0])
        ? scoreParts[0]
        : 0;
    const parsedAwayScore =
      typeof fixture.awayGoals === 'number'
        ? fixture.awayGoals
        : scoreParts.length === 2 && !Number.isNaN(scoreParts[1])
        ? scoreParts[1]
        : 0;
    const isFinished =
      fixture.status === 'FINISHED' ||
      typeof fixture.homeGoals === 'number' ||
      (scoreParts.length === 2 && !Number.isNaN(scoreParts[0]) && !Number.isNaN(scoreParts[1]));

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
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
      status: isFinished ? 'FINISHED' : 'SCHEDULED',
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

  const getTeamCacheKey = (row: StandingRow) =>
    `${activeLeague.apiLeagueId}:${row.teamId || row.club.toLowerCase()}`;

  const getResolvedFormDetails = (row: StandingRow): FormMatchDetail[] => {
    if (Array.isArray(row.formDetails) && row.formDetails.length > 0) {
      return row.formDetails;
    }
    const key = getTeamCacheKey(row);
    return teamFormCache[key] || [];
  };

  // Fetch last 5 finished matches for a team on demand if formDetails wasn't pre-populated
  const ensureTeamFormDetails = async (row: StandingRow): Promise<FormMatchDetail[]> => {
    const existing = getResolvedFormDetails(row);
    if (existing.length > 0) return existing;

    const key = getTeamCacheKey(row);
    try {
      const qs = new URLSearchParams();
      if (row.teamId) qs.set('teamId', String(row.teamId));
      qs.set('teamName', row.club);
      qs.set('leagueId', String(activeLeague.apiLeagueId));
      const res = await fetch(`/api/football/team-intel?${qs.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data?.found || !Array.isArray(data.recentMatches) || data.recentMatches.length === 0) {
        return [];
      }
      // data.recentMatches are newest-first; take top 5 and reverse to oldest-first (matching row.form left-to-right)
      const mapped: FormMatchDetail[] = data.recentMatches
        .slice(0, 5)
        .reverse()
        .map((m: {
          fixtureId: string;
          date: string;
          round?: string;
          homeTeamId?: number;
          homeTeam: string;
          homeLogo?: string;
          awayTeamId?: number;
          awayTeam: string;
          awayLogo?: string;
          homeScore: number | null;
          awayScore: number | null;
          isHome?: boolean;
          result?: 'W' | 'D' | 'L' | null;
        }) => {
          const isHome =
            typeof m.isHome === 'boolean'
              ? m.isHome
              : m.homeTeam.toLowerCase() === row.club.toLowerCase();
          const hg = Number(m.homeScore ?? 0);
          const ag = Number(m.awayScore ?? 0);
          const result: 'W' | 'D' | 'L' =
            m.result ||
            (hg === ag ? 'D' : (isHome ? hg > ag : ag > hg) ? 'W' : 'L');
          return {
            id: m.fixtureId,
            date: m.round ? `${m.date} · ${m.round}` : m.date,
            homeTeamId: m.homeTeamId,
            homeTeam: m.homeTeam,
            homeLogo: m.homeLogo,
            awayTeamId: m.awayTeamId,
            awayTeam: m.awayTeam,
            awayLogo: m.awayLogo,
            homeGoals: hg,
            awayGoals: ag,
            opponent: isHome ? m.awayTeam : m.homeTeam,
            opponentLogo: isHome ? m.awayLogo : m.homeLogo,
            isHome,
            result,
          };
        });

      setTeamFormCache((prev) => ({ ...prev, [key]: mapped }));
      return mapped;
    } catch {
      return [];
    }
  };

  // Load deep match events & statistics whenever selectedPastMatchModal changes
  useEffect(() => {
    const rawId = selectedPastMatchModal?.match?.id?.replace(/^api-/, '');
    if (!rawId || rawId.startsWith('pending-')) {
      setPastMatchModalIntel(null);
      setPastMatchModalLoading(false);
      return;
    }
    let active = true;
    setPastMatchModalLoading(true);
    fetch(`/api/football/match-intel/${rawId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active) {
          setPastMatchModalIntel(data?.found ? data : null);
          setPastMatchModalLoading(false);
        }
      })
      .catch(() => {
        if (active) setPastMatchModalLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedPastMatchModal?.match?.id]);

  // Open the Past Match Details Modal Window when clicking a W/D/L badge
  const handleFormBadgeClick = async (
    row: StandingRow,
    badgeIdx: number,
    resultChar: 'W' | 'D' | 'L',
    initialMatchDetail?: FormMatchDetail
  ) => {
    setHoveredFormBadge(null);
    if (initialMatchDetail) {
      setSelectedPastMatchModal({
        match: initialMatchDetail,
        teamRow: row,
        badgeIdx,
      });
      return;
    }

    // Open modal immediately in loading state while resolving the exact match from API-Football
    setSelectedPastMatchModal({
      match: {
        id: `pending-${row.club}-${badgeIdx}`,
        date: activeLeague.season,
        homeTeamId: row.teamId,
        homeTeam: row.club,
        homeLogo: row.clubLogo,
        awayTeam: 'Съперник',
        homeGoals: 0,
        awayGoals: 0,
        opponent: 'Съперник',
        isHome: true,
        result: resultChar,
      },
      teamRow: row,
      badgeIdx,
      loadingTeamMatches: true,
    });

    const fetchedDetails = await ensureTeamFormDetails(row);
    if (fetchedDetails.length > 0) {
      const offset = row.form.length - fetchedDetails.length;
      const detailIdx = badgeIdx - offset;
      const picked =
        (detailIdx >= 0 && detailIdx < fetchedDetails.length
          ? fetchedDetails[detailIdx]
          : undefined) ||
        fetchedDetails.find((d) => d.result === resultChar) ||
        fetchedDetails[fetchedDetails.length - 1];

      setSelectedPastMatchModal({
        match: picked,
        teamRow: row,
        badgeIdx,
        loadingTeamMatches: false,
      });
    } else {
      setSelectedPastMatchModal(null);
      openTeamProfile({
        teamId: row.teamId,
        teamName: row.club,
        teamLogo: row.clubLogo,
        leagueId: activeLeague.apiLeagueId,
        leagueName: activeLeague.name,
      });
    }
  };

  // Interactive Form Badges renderer with instant hover match popover & click-to-open Match Modal Window
  const renderInteractiveFormBadges = (
    row: StandingRow,
    align: 'right' | 'center' = 'right'
  ) => {
    const details = getResolvedFormDetails(row);
    // Align details from the right (most recent match = last badge)
    const offset = row.form.length - details.length;

    return (
      <div
        className={`flex items-center ${
          align === 'center' ? 'justify-center' : 'justify-end'
        } gap-1`}
        onClick={(e) => e.stopPropagation()}
      >
        {row.form.map((f, i) => {
          const detailIdx = i - offset;
          const matchDetail =
            detailIdx >= 0 && detailIdx < details.length ? details[detailIdx] : undefined;

          return (
            <button
              key={i}
              type="button"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const currentTop = rect.top;
                const currentLeft = rect.left + rect.width / 2;
                setHoveredFormBadge({
                  row: { ...row, formDetails: details },
                  badgeIdx: i,
                  resultChar: f,
                  matchDetail,
                  rect: {
                    top: currentTop,
                    left: currentLeft,
                  },
                });
                if (details.length === 0) {
                  ensureTeamFormDetails(row).then((loaded) => {
                    if (loaded.length > 0) {
                      const newOffset = row.form.length - loaded.length;
                      const newIdx = i - newOffset;
                      const resolvedMatch =
                        newIdx >= 0 && newIdx < loaded.length ? loaded[newIdx] : undefined;
                      setHoveredFormBadge((prev) =>
                        prev && prev.row.club === row.club && prev.badgeIdx === i
                          ? {
                              ...prev,
                              row: { ...row, formDetails: loaded },
                              matchDetail: resolvedMatch,
                            }
                          : prev
                      );
                    }
                  });
                }
              }}
              onMouseLeave={() => setHoveredFormBadge(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleFormBadgeClick(row, i, f, matchDetail);
              }}
              className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center transition-transform hover:scale-125 hover:ring-2 hover:ring-white/80 cursor-pointer ${
                f === 'W'
                  ? 'bg-[#10b981] text-[#04130b]'
                  : f === 'D'
                  ? 'bg-[#334155] text-white'
                  : 'bg-[#ef4444] text-white'
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
    );
  };

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
              {
                val:
                  globalCatalog.totalLeagues > 0
                    ? `${globalCatalog.totalLeagues}+`
                    : '750+',
                label: t.kpi1,
                icon: '🌐',
              },
              {
                val:
                  globalCatalog.totalCountries > 0
                    ? String(globalCatalog.totalCountries)
                    : '150+',
                label: t.kpi2,
                icon: '🏳️',
              },
              { val: String(matches.length || 45), label: t.kpi3, icon: '📈' },
              { val: String(Object.keys(LEAGUES_DATABASE).length), label: t.kpi4, icon: '🔥' },
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
      {/* ROW 2: SEARCH & FILTER CONTROLS BAR (CONNECTED TO FULL CATALOG)     */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#172332] bg-[#0a1018] p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input across Top 50 + All Global Professional Leagues */}
            <div className="relative min-w-[230px] flex-1 sm:flex-initial sm:w-72">
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
                className="w-full rounded-xl border border-[#1c2a3b] bg-[#0d1520] pl-9 pr-7 py-2 text-xs text-white placeholder-[#64748b] focus:border-[#43f08a] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* All Countries Dropdown (Populated with all countries from Global Catalog) */}
            <select
              value={countryFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCountryFilter(val);
                if (val === 'all') return;
                const topMatch = Object.values(LEAGUES_DATABASE).find(
                  (l) => l.country.toLowerCase() === val.toLowerCase()
                );
                if (topMatch) {
                  selectBuiltInLeague(topMatch.id);
                } else {
                  const globalMatch = globalCatalog.leagues.find(
                    (g) => g.country.toLowerCase() === val.toLowerCase()
                  );
                  if (globalMatch) {
                    selectAnyLeague({
                      apiLeagueId: globalMatch.apiLeagueId,
                      name: globalMatch.name,
                      country: globalMatch.country,
                    });
                  }
                }
              }}
              className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3.5 py-2 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer max-w-[210px]"
            >
              <option value="all">
                🌐 {t.allCountries}{' '}
                {globalCatalog.totalCountries > 0 ? `(${globalCatalog.totalCountries})` : ''}
              </option>
              {globalCatalog.countries.length > 0 ? (
                globalCatalog.countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))
              ) : (
                <>
                  <option value="Bulgaria">🇧🇬 Bulgaria</option>
                  <option value="England">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</option>
                  <option value="Spain">🇪🇸 Spain</option>
                  <option value="Italy">🇮🇹 Italy</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="France">🇫🇷 France</option>
                  <option value="Turkey">🇹🇷 Turkey</option>
                  <option value="Europe">🇪🇺 Europe</option>
                </>
              )}
            </select>

            {/* All Competition Types */}
            <select
              value={compTypeFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCompTypeFilter(val);
                setFeaturedPage(0);
                if (val === 'continental' && LEAGUES_DATABASE[selectedLeagueKey]?.type !== 'continental') {
                  selectBuiltInLeague('ucl');
                } else if (val === 'domestic' && LEAGUES_DATABASE[selectedLeagueKey]?.type !== 'domestic') {
                  selectBuiltInLeague('premier-league');
                }
              }}
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

            {/* Open Full Catalog Button */}
            <button
              type="button"
              onClick={() => setShowAllLeaguesModal(true)}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-[#0d1f18] hover:border-[#43f08a] text-xs font-bold text-[#43f08a] flex items-center gap-1.5 cursor-pointer"
            >
              <span>⊞</span>
              <span>
                {t.viewAllLeagues} (
                {globalCatalog.totalLeagues > 0 ? globalCatalog.totalLeagues : '750+'})
              </span>
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

        {/* INSTANT SEARCH & COUNTRY RESULTS FROM FULL GLOBAL CATALOG */}
        {(searchQuery.trim().length > 0 || countryFilter !== 'all') && (() => {
          const q = searchQuery.trim().toLowerCase();
          const topIds = new Set(Object.values(LEAGUES_DATABASE).map((l) => l.apiLeagueId));

          const matchingTop50 = Object.values(LEAGUES_DATABASE).filter((lg) => {
            if (compTypeFilter !== 'all' && lg.type !== compTypeFilter) return false;
            if (countryFilter !== 'all' && lg.country.toLowerCase() !== countryFilter.toLowerCase()) {
              return false;
            }
            if (q) {
              return (
                lg.name.toLowerCase().includes(q) ||
                lg.country.toLowerCase().includes(q)
              );
            }
            return true;
          });

          const matchingGlobal = globalCatalog.leagues.filter((g) => {
            if (topIds.has(g.apiLeagueId)) return false;
            if (compTypeFilter !== 'all' && g.type !== compTypeFilter) return false;
            if (countryFilter !== 'all' && g.country.toLowerCase() !== countryFilter.toLowerCase()) {
              return false;
            }
            if (q) {
              return (
                g.name.toLowerCase().includes(q) ||
                g.country.toLowerCase().includes(q)
              );
            }
            return true;
          });

          const combinedResults = [
            ...matchingTop50.map((lg) => ({
              apiLeagueId: lg.apiLeagueId,
              name: lg.name,
              country: lg.country,
              flag: lg.flag,
              season: lg.season,
              isTop50: true,
              builtInKey: lg.id,
            })),
            ...matchingGlobal.map((g) => ({
              apiLeagueId: g.apiLeagueId,
              name: g.name,
              country: g.country,
              flag: '🌍',
              season: String(g.season),
              isTop50: false,
              builtInKey: undefined,
            })),
          ];

          return (
            <div className="pt-2.5 border-t border-[#162232] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">
                  Намерени първенства в световния каталог: {combinedResults.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setModalSearchQuery(searchQuery);
                    setModalCountryFilter(countryFilter);
                    setShowAllLeaguesModal(true);
                  }}
                  className="text-[11px] font-bold text-[#43f08a] hover:underline cursor-pointer"
                >
                  Отвори всички в голям прозорец →
                </button>
              </div>

              {combinedResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-1">
                  {combinedResults.slice(0, 36).map((item) => {
                    const isSelected = activeLeague.apiLeagueId === item.apiLeagueId;
                    return (
                      <button
                        key={item.apiLeagueId}
                        type="button"
                        onClick={() => {
                          if (item.builtInKey) {
                            selectBuiltInLeague(item.builtInKey);
                          } else {
                            selectAnyLeague({
                              apiLeagueId: item.apiLeagueId,
                              name: item.name,
                              country: item.country,
                              flag: item.flag,
                            });
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-[#43f08a] bg-[#0e231b]'
                            : 'border-[#1a2636] bg-[#0d1520] hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/95 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={`/api/football/media/leagues/${item.apiLeagueId}.png`}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-extrabold text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-[#8f9cae] truncate">
                            {item.country} {item.isTop50 ? '· ★ Топ 50' : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-3 text-xs text-[#8f9cae]">
                  Няма намерени първенства за това търсене.
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* =================================================================== */}
      {/* ROW 3: TOP 50 FEATURED LEAGUES HORIZONTAL RIBBON                    */}
      {/* =================================================================== */}
      {(() => {
        const filteredTop50 = featuredLeaguesList.filter((item) => {
          if (compTypeFilter !== 'all' && item.type !== compTypeFilter) return false;
          return true;
        });
        const pageSize = 10;
        const totalPages = Math.max(1, Math.ceil(filteredTop50.length / pageSize));
        const safePage = Math.min(featuredPage, totalPages - 1);
        const visibleSlice = filteredTop50.slice(
          safePage * pageSize,
          safePage * pageSize + pageSize
        );

        return (
          <div className="rounded-2xl border border-[#172332] bg-[#0a1018] p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                <span className="text-[#43f08a]">☆</span>
                <span>
                  {t.featuredLeagues} (Топ {Object.keys(LEAGUES_DATABASE).length} в света)
                </span>
                <span className="text-[11px] font-mono text-[#8f9cae] font-normal">
                  · Страница {safePage + 1} от {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setFeaturedPage((p) => (p - 1 + totalPages) % totalPages)
                  }
                  title="Предишни 10 водещи лиги"
                  className="px-2.5 h-6 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-xs text-neutral-300 flex items-center justify-center cursor-pointer"
                >
                  ‹ Предишни
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedPage((p) => (p + 1) % totalPages)}
                  title="Следващи 10 водещи лиги"
                  className="px-2.5 h-6 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-xs text-neutral-300 flex items-center justify-center cursor-pointer"
                >
                  Следващи ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-11 gap-2.5">
              {visibleSlice.map((lg, idx) => {
                const isSelected = !customLeagueOverride && selectedLeagueKey === lg.key;
                return (
                  <button
                    key={`${lg.key}-${idx}`}
                    type="button"
                    onClick={() => selectBuiltInLeague(lg.key)}
                    className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-[#43f08a] bg-[#0e231b] shadow-md shadow-[#22c55e]/10'
                        : 'border-[#1a2636] bg-[#0d1520] hover:border-[#2c4059]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl bg-white/95 border ${lg.badgeBorder} flex items-center justify-center p-1 shadow-sm shrink-0`}
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

              {/* View all leagues directory modal button */}
              <button
                type="button"
                onClick={() => setShowAllLeaguesModal(true)}
                className="rounded-xl border border-emerald-500/40 bg-[#0d1f18] hover:bg-[#122b22] hover:border-[#43f08a] p-2.5 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.12)]"
              >
                <span className="text-base text-[#43f08a]">⊞</span>
                <span className="text-[11px] font-extrabold text-[#43f08a]">
                  {t.viewAllLeagues} ›
                </span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* ROW 4: MAIN 4-PANEL LEAGUE HUB (Standings 5 | Top Scorers 2 | Upcoming 3 | Glance 2) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1 (Left 5 cols): Active League Standings & 6 Sub-Tabs */}
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
                value={customLeagueOverride ? `custom-${customLeagueOverride.apiLeagueId}` : selectedLeagueKey}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('custom-')) return;
                  selectBuiltInLeague(val);
                }}
                className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3 py-1.5 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer max-w-[190px]"
              >
                {customLeagueOverride && (
                  <option value={`custom-${customLeagueOverride.apiLeagueId}`}>
                    {customLeagueOverride.flag} {customLeagueOverride.name} ({customLeagueOverride.country})
                  </option>
                )}
                {Object.values(LEAGUES_DATABASE).map((lg) => (
                  <option key={lg.id} value={lg.id}>
                    {lg.flag} {lg.name} ({lg.country})
                  </option>
                ))}
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

            {/* SUB-TAB 1: STANDINGS */}
            {hubSubTab === 'standings' && (
              <div className="overflow-x-auto">
                {displayedStandings.length > 0 ? (
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
                          onClick={() =>
                            openTeamProfile({
                              teamId: row.teamId,
                              teamName: row.club,
                              teamLogo: row.clubLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            })
                          }
                          className="hover:bg-[#0e1622] transition-colors cursor-pointer group"
                          title={`${row.club} — Отвори профила на отбора`}
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
                                teamId={row.teamId}
                                size="sm"
                                className="w-5 h-5 text-[8px]"
                              />
                              <span className="font-bold text-white group-hover:text-[#43f08a] group-hover:underline truncate max-w-[125px] transition-colors">
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
                            {renderInteractiveFormBadges(row, 'right')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : isLiveIntelReady ? (
                  <div className="py-8 px-4 text-center space-y-3">
                    <div className="text-xs text-neutral-300 font-semibold">
                      Този турнир се провежда във фаза на директни елиминации или все още няма публикувано таблично класиране за избрания сезон.
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setHubSubTab('results')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-[#43f08a] cursor-pointer"
                      >
                        Виж Резултати ({activeLeague.recentResults?.length || 0}) →
                      </button>
                      <button
                        type="button"
                        onClick={() => setHubSubTab('fixtures')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0e1622] border border-[#1e2d40] text-xs font-bold text-neutral-200 cursor-pointer"
                      >
                        Виж Програма ({activeLeague.upcomingFixtures.length}) →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#8f9cae] font-mono">
                    Зареждане на официалното класиране за {activeLeague.name}...
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: UPCOMING FIXTURES */}
            {hubSubTab === 'fixtures' && (
              <div className="divide-y divide-[#141f2e] max-h-96 overflow-y-auto pr-1">
                {activeLeague.upcomingFixtures.length > 0 ? (
                  activeLeague.upcomingFixtures.map((fx) => (
                    <div
                      key={fx.id}
                      onClick={() => handleOpenFixtureMatch(fx)}
                      className="py-2.5 px-2 hover:bg-[#0e1622] rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: fx.homeTeamId,
                              teamName: fx.homeTeam,
                              teamLogo: fx.homeLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            },
                            e
                          )
                        }
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        <TeamBadge
                          name={fx.homeTeam}
                          logoUrl={fx.homeLogo}
                          teamId={fx.homeTeamId}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-white hover:text-[#43f08a] hover:underline truncate">
                          {fx.homeTeam}
                        </span>
                      </div>

                      <div className="text-center shrink-0 px-2">
                        <span className="px-2 py-0.5 rounded bg-[#131d2a] border border-[#1f2e42] font-mono text-[11px] font-bold text-[#43f08a] block">
                          {fx.time}
                        </span>
                        <span className="text-[9px] text-[#8f9cae] block mt-0.5">{fx.dayLabel}</span>
                      </div>

                      <div
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: fx.awayTeamId,
                              teamName: fx.awayTeam,
                              teamLogo: fx.awayLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            },
                            e
                          )
                        }
                        className="flex items-center justify-end gap-2 flex-1 min-w-0"
                      >
                        <span className="text-xs font-bold text-white hover:text-[#43f08a] hover:underline truncate">
                          {fx.awayTeam}
                        </span>
                        <TeamBadge
                          name={fx.awayTeam}
                          logoUrl={fx.awayLogo}
                          teamId={fx.awayTeamId}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[#8f9cae]">
                    Няма предстоящи мачове за този период.
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: RECENT RESULTS */}
            {hubSubTab === 'results' && (
              <div className="divide-y divide-[#141f2e] max-h-96 overflow-y-auto pr-1">
                {activeLeague.recentResults && activeLeague.recentResults.length > 0 ? (
                  activeLeague.recentResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() =>
                        setSelectedPastMatchModal({
                          match: {
                            id: res.id,
                            date: res.dayLabel,
                            homeTeamId: res.homeTeamId,
                            homeTeam: res.homeTeam,
                            homeLogo: res.homeLogo,
                            awayTeamId: res.awayTeamId,
                            awayTeam: res.awayTeam,
                            awayLogo: res.awayLogo,
                            homeGoals: res.homeGoals,
                            awayGoals: res.awayGoals,
                            opponent: res.awayTeam,
                            opponentLogo: res.awayLogo,
                            isHome: true,
                            result:
                              res.homeGoals > res.awayGoals
                                ? 'W'
                                : res.homeGoals < res.awayGoals
                                ? 'L'
                                : 'D',
                          },
                        })
                      }
                      className="py-2.5 px-2 hover:bg-[#0e1622] rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: res.homeTeamId,
                              teamName: res.homeTeam,
                              teamLogo: res.homeLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            },
                            e
                          )
                        }
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        <TeamBadge
                          name={res.homeTeam}
                          logoUrl={res.homeLogo}
                          teamId={res.homeTeamId}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-white hover:text-[#43f08a] hover:underline truncate">
                          {res.homeTeam}
                        </span>
                      </div>

                      <div className="text-center shrink-0 px-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#131d2a] border border-emerald-500/30 font-mono text-xs font-black text-white block">
                          {res.homeGoals} - {res.awayGoals}
                        </span>
                        <span className="text-[9px] text-[#8f9cae] block mt-0.5">{res.dayLabel}</span>
                      </div>

                      <div
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: res.awayTeamId,
                              teamName: res.awayTeam,
                              teamLogo: res.awayLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            },
                            e
                          )
                        }
                        className="flex items-center justify-end gap-2 flex-1 min-w-0"
                      >
                        <span className="text-xs font-bold text-white hover:text-[#43f08a] hover:underline truncate">
                          {res.awayTeam}
                        </span>
                        <TeamBadge
                          name={res.awayTeam}
                          logoUrl={res.awayLogo}
                          teamId={res.awayTeamId}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[#8f9cae]">
                    Зареждане на последните официални резултати...
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: FORM TABLE (Sorted by Last 5 Form Points) */}
            {hubSubTab === 'form' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-[#64748b] border-b border-[#162232]">
                      <th className="py-2 pr-2">#</th>
                      <th className="py-2 pr-3">{t.clubCol}</th>
                      <th className="py-2 px-2 text-center">Форма (5 мача)</th>
                      <th className="py-2 pl-2 text-right">Точки (Форма)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141f2e] font-mono text-[11px]">
                    {[...activeLeague.standings]
                      .map((r) => ({
                        ...r,
                        formPts: r.form.reduce((acc, f) => acc + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0),
                      }))
                      .sort((a, b) => b.formPts - a.formPts || b.pts - a.pts)
                      .slice(0, showFullTable ? 25 : 8)
                      .map((row, idx) => (
                        <tr
                          key={row.club}
                          onClick={() =>
                            openTeamProfile({
                              teamId: row.teamId,
                              teamName: row.club,
                              teamLogo: row.clubLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            })
                          }
                          className="hover:bg-[#0e1622] transition-colors cursor-pointer group"
                        >
                          <td className="py-2.5 pr-2 font-bold text-neutral-400">{idx + 1}</td>
                          <td className="py-2.5 pr-3 font-sans">
                            <div className="flex items-center gap-2">
                              <TeamBadge
                                name={row.club}
                                logoUrl={row.clubLogo}
                                teamId={row.teamId}
                                size="sm"
                                className="w-5 h-5"
                              />
                              <span className="font-bold text-white group-hover:text-[#43f08a] group-hover:underline truncate">
                                {row.club}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2">
                            {renderInteractiveFormBadges(row, 'center')}
                          </td>
                          <td className="py-2.5 pl-2 text-right font-black text-[#43f08a]">
                            {row.formPts} / 15 т.
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TAB 5: TEAM OFFENSIVE & DEFENSIVE STATS */}
            {hubSubTab === 'stats' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-[#64748b] border-b border-[#162232]">
                      <th className="py-2 pr-3">{t.clubCol}</th>
                      <th className="py-2 px-1.5 text-center">Голове/Мач</th>
                      <th className="py-2 px-1.5 text-center">Допуснати/Мач</th>
                      <th className="py-2 pl-2 text-right">% Победи</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141f2e] font-mono text-[11px]">
                    {[...activeLeague.standings]
                      .sort((a, b) => b.gf / Math.max(1, b.p) - a.gf / Math.max(1, a.p))
                      .slice(0, showFullTable ? 25 : 8)
                      .map((row) => {
                        const gpm = (row.gf / Math.max(1, row.p)).toFixed(2);
                        const gapm = (row.ga / Math.max(1, row.p)).toFixed(2);
                        const winPct = Math.round((row.w / Math.max(1, row.p)) * 100);
                        return (
                          <tr
                            key={row.club}
                            onClick={() =>
                              openTeamProfile({
                                teamId: row.teamId,
                                teamName: row.club,
                                teamLogo: row.clubLogo,
                                leagueId: activeLeague.apiLeagueId,
                                leagueName: activeLeague.name,
                              })
                            }
                            className="hover:bg-[#0e1622] transition-colors cursor-pointer group"
                          >
                            <td className="py-2.5 pr-3 font-sans">
                              <div className="flex items-center gap-2">
                                <TeamBadge
                                  name={row.club}
                                  logoUrl={row.clubLogo}
                                  teamId={row.teamId}
                                  size="sm"
                                  className="w-5 h-5"
                                />
                                <span className="font-bold text-white group-hover:text-[#43f08a] group-hover:underline truncate">
                                  {row.club}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-1.5 text-center font-bold text-[#43f08a]">
                              {gpm}
                            </td>
                            <td className="py-2.5 px-1.5 text-center text-neutral-300">{gapm}</td>
                            <td className="py-2.5 pl-2 text-right font-bold text-white">
                              {winPct}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TAB 6: +EV QUANTITATIVE INSIGHTS */}
            {hubSubTab === 'insights' && (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>Stochastic League Edge — {activeLeague.name}</span>
                    <span className="font-mono">{activeLeague.glance?.goalsPerMatch || '2.72'} гола/мач</span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Математически анализ на база официалното класиране и голова ефективност за сезона.
                  </p>
                </div>

                {activeLeague.upcomingFixtures.slice(0, 4).map((fx) => {
                  const homeRow = activeLeague.standings.find((s) => s.club === fx.homeTeam);
                  const awayRow = activeLeague.standings.find((s) => s.club === fx.awayTeam);
                  const homeGpm = homeRow ? homeRow.gf / Math.max(1, homeRow.p) : 1.45;
                  const awayGpm = awayRow ? awayRow.gf / Math.max(1, awayRow.p) : 1.2;
                  const projTotal = (homeGpm + awayGpm).toFixed(2);
                  return (
                    <div
                      key={fx.id}
                      onClick={() => handleOpenFixtureMatch(fx)}
                      className="p-3 rounded-xl border border-[#1a2636] bg-[#0d1520] hover:border-emerald-500/40 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {fx.homeTeam} vs {fx.awayTeam}
                        </div>
                        <div className="text-[10px] text-[#8f9cae] mt-0.5">
                          {fx.dayLabel} · Прогнозни голове (λ):{' '}
                          <span className="text-emerald-400 font-mono font-bold">{projTotal}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 shrink-0">
                        Poisson Анализ →
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
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
                      <button
                        type="button"
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: sc.teamId,
                              teamName: sc.club,
                              teamLogo: sc.clubLogo,
                              leagueId: activeLeague.apiLeagueId,
                              leagueName: activeLeague.name,
                            },
                            e
                          )
                        }
                        className="hover:text-[#43f08a] hover:underline cursor-pointer"
                      >
                        {sc.club}
                      </button>
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
                    <div
                      onClick={(e) =>
                        openTeamProfile(
                          {
                            teamId: fx.homeTeamId,
                            teamName: fx.homeTeam,
                            teamLogo: fx.homeLogo,
                            leagueId: activeLeague.apiLeagueId,
                            leagueName: activeLeague.name,
                          },
                          e
                        )
                      }
                      className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="font-bold text-white hover:text-[#43f08a] hover:underline truncate">
                        {fx.homeTeam}
                      </span>
                      <TeamBadge
                        name={fx.homeTeam}
                        logoUrl={fx.homeLogo}
                        teamId={fx.homeTeamId}
                        size="sm"
                        className="w-5 h-5 text-[8px]"
                      />
                    </div>

                    <span className="px-2 py-0.5 rounded bg-[#131d2a] border border-[#1f2e42] font-mono text-[11px] font-bold text-neutral-200 shrink-0">
                      {fx.time}
                    </span>

                    <div
                      onClick={(e) =>
                        openTeamProfile(
                          {
                            teamId: fx.awayTeamId,
                            teamName: fx.awayTeam,
                            teamLogo: fx.awayLogo,
                            leagueId: activeLeague.apiLeagueId,
                            leagueName: activeLeague.name,
                          },
                          e
                        )
                      }
                      className="flex items-center justify-end gap-1.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <TeamBadge
                        name={fx.awayTeam}
                        logoUrl={fx.awayLogo}
                        teamId={fx.awayTeamId}
                        size="sm"
                        className="w-5 h-5 text-[8px]"
                      />
                      <span className="font-bold text-white hover:text-[#43f08a] hover:underline truncate">
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

      {/* =================================================================== */}
      {/* FLOATING HOVER TOOLTIP FOR STANDINGS / FORM W-D-L BADGES            */}
      {/* =================================================================== */}
      {hoveredFormBadge && (
        <div
          style={{
            top: Math.max(16, hoveredFormBadge.rect.top - 12),
            left: Math.min(
              typeof window !== 'undefined' ? window.innerWidth - 170 : 800,
              Math.max(170, hoveredFormBadge.rect.left)
            ),
          }}
          className="fixed z-50 -translate-x-1/2 -translate-y-full pointer-events-none w-72 rounded-2xl border border-emerald-500/40 bg-[#070d15]/98 p-3.5 shadow-[0_18px_45px_rgba(0,0,0,0.85)] backdrop-blur-md space-y-2.5"
        >
          {/* Header: Team + Form Summary */}
          <div className="flex items-center justify-between border-b border-[#182638] pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <TeamBadge
                name={hoveredFormBadge.row.club}
                logoUrl={hoveredFormBadge.row.clubLogo}
                teamId={hoveredFormBadge.row.teamId}
                size="sm"
                className="w-5 h-5"
              />
              <span className="text-xs font-extrabold text-white truncate">
                {hoveredFormBadge.row.club}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                hoveredFormBadge.resultChar === 'W'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : hoveredFormBadge.resultChar === 'D'
                  ? 'bg-slate-700/60 text-slate-200 border border-slate-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {hoveredFormBadge.resultChar === 'W'
                ? 'ПОБЕДА (+3 т.)'
                : hoveredFormBadge.resultChar === 'D'
                ? 'РАВЕНСТВО (+1 т.)'
                : 'ЗАГУБА (0 т.)'}
            </span>
          </div>

          {/* Hovered Specific Match Detail (if available from API-Football last 55 league matches) */}
          {hoveredFormBadge.matchDetail ? (
            <div className="rounded-xl bg-[#0c1623] border border-[#1d2e44] p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8f9cae]">
                <span>{hoveredFormBadge.matchDetail.date}</span>
                <span className="text-emerald-400">
                  {hoveredFormBadge.matchDetail.isHome ? 'Домакин' : 'Гост'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <TeamBadge
                    name={hoveredFormBadge.matchDetail.homeTeam}
                    logoUrl={hoveredFormBadge.matchDetail.homeLogo}
                    teamId={hoveredFormBadge.matchDetail.homeTeamId}
                    size="sm"
                    className="w-4 h-4"
                  />
                  <span className="font-bold text-white truncate">
                    {hoveredFormBadge.matchDetail.homeTeam}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#142234] border border-emerald-500/30 font-mono font-black text-white text-xs shrink-0">
                  {hoveredFormBadge.matchDetail.homeGoals} : {hoveredFormBadge.matchDetail.awayGoals}
                </span>
                <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1">
                  <span className="font-bold text-white truncate">
                    {hoveredFormBadge.matchDetail.awayTeam}
                  </span>
                  <TeamBadge
                    name={hoveredFormBadge.matchDetail.awayTeam}
                    logoUrl={hoveredFormBadge.matchDetail.awayLogo}
                    teamId={hoveredFormBadge.matchDetail.awayTeamId}
                    size="sm"
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* Last 5 Matches History List */}
          {hoveredFormBadge.row.formDetails && hoveredFormBadge.row.formDetails.length > 0 ? (
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] block">
                Последни мачове в лигата:
              </span>
              {hoveredFormBadge.row.formDetails.map((md, idx) => (
                <div
                  key={md.id || idx}
                  className={`flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded ${
                    hoveredFormBadge.matchDetail?.id === md.id
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                      : 'text-neutral-300'
                  }`}
                >
                  <span className="truncate max-w-[165px]">
                    {md.homeTeam} vs {md.awayTeam}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-white">
                      {md.homeGoals}:{md.awayGoals}
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded text-[8px] font-black flex items-center justify-center ${
                        md.result === 'W'
                          ? 'bg-[#10b981] text-[#04130b]'
                          : md.result === 'D'
                          ? 'bg-[#334155] text-white'
                          : 'bg-[#ef4444] text-white'
                      }`}
                    >
                      {md.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-neutral-300 font-mono">
              Форма (последни 5 мача):{' '}
              <span className="text-emerald-400 font-bold">
                {hoveredFormBadge.row.form.filter((x) => x === 'W').length}П -{' '}
                {hoveredFormBadge.row.form.filter((x) => x === 'D').length}Р -{' '}
                {hoveredFormBadge.row.form.filter((x) => x === 'L').length}З
              </span>
            </div>
          )}

          <div className="text-[10px] text-emerald-400 font-mono text-center pt-1 border-t border-[#182638]">
            Кликни за детайли за мача / отбора →
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ВСИЧКИ ЛИГИ И ПЪРВЕНСТВА (TOP 50 + FULL GLOBAL CATALOG)      */}
      {/* =================================================================== */}
      {showAllLeaguesModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAllLeaguesModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[88vh] rounded-2xl border border-[#1d2e42] bg-[#080e17] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#182434] flex items-center justify-between gap-4 bg-[#0a121d]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  🏆
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    Всички лиги и турнири — Пълен световен каталог (
                    {globalCatalog.totalLeagues > 0 ? `${globalCatalog.totalLeagues}+` : '750+'}{' '}
                    първенства)
                  </h2>
                  <p className="text-xs text-[#8f9cae]">
                    Топ 50 най-популярни лиги в света + всички професионални национални първенства и купи от{' '}
                    {globalCatalog.totalCountries > 0 ? globalCatalog.totalCountries : 150}+ държави
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllLeaguesModal(false)}
                className="w-8 h-8 rounded-xl bg-[#131d2b] border border-[#223247] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Search, Country Dropdown & Filter Tabs */}
            <div className="px-6 py-3.5 border-b border-[#162232] bg-[#09101a] space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[230px]">
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => {
                      setModalSearchQuery(e.target.value);
                      setModalVisibleLimit(90);
                    }}
                    placeholder="Търси сред всички първенства и държави по света (напр. Serie A, България, Brazil, Segunda, Cup)..."
                    className="w-full rounded-xl border border-[#1e2d42] bg-[#0d1624] px-3.5 py-2 text-xs text-white placeholder-[#64748b] focus:border-[#43f08a] focus:outline-none"
                  />
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Modal Country Filter */}
                <select
                  value={modalCountryFilter}
                  onChange={(e) => {
                    setModalCountryFilter(e.target.value);
                    setModalVisibleLimit(90);
                  }}
                  className="rounded-xl border border-[#1e2d42] bg-[#0d1624] px-3.5 py-2 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer"
                >
                  <option value="all">
                    🌐 Всички държави ({globalCatalog.totalCountries || 150})
                  </option>
                  {globalCatalog.countries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { key: 'all', label: '🌐 Всички първенства' },
                  { key: 'top50', label: '★ Топ 50 Най-популярни' },
                  { key: 'europe', label: 'Европа' },
                  { key: 'south_america', label: 'Южна Америка' },
                  { key: 'north_america', label: 'Сев. Америка' },
                  { key: 'asia', label: 'Азия' },
                  { key: 'africa', label: 'Африка' },
                  { key: 'today', label: '🔥 С мачове днес' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setModalRegionFilter(tab.key as typeof modalRegionFilter);
                      setModalVisibleLimit(90);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                      modalRegionFilter === tab.key
                        ? 'bg-[#0f291e] border border-[#22c55e]/60 text-[#43f08a]'
                        : 'bg-[#0e1622] border border-[#1a2636] text-[#8f9cae] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Section 1 (Top 50 Popular Leagues) + Section 2 (Full Global Catalog) */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Top 50 Most Popular Leagues in LEAGUES_DATABASE */}
              {(() => {
                const filteredTop50 = Object.values(LEAGUES_DATABASE).filter((lg) => {
                  if (
                    modalCountryFilter !== 'all' &&
                    lg.country.toLowerCase() !== modalCountryFilter.toLowerCase()
                  ) {
                    return false;
                  }
                  if (modalRegionFilter === 'today') {
                    const hasToday = matches.some(
                      (m) =>
                        m.leagueId === lg.apiLeagueId ||
                        m.league.toLowerCase() === lg.name.toLowerCase()
                    );
                    if (!hasToday) return false;
                  } else if (
                    modalRegionFilter !== 'all' &&
                    modalRegionFilter !== 'top50' &&
                    lg.region !== modalRegionFilter
                  ) {
                    return false;
                  }
                  if (modalSearchQuery.trim()) {
                    const q = modalSearchQuery.toLowerCase();
                    return (
                      lg.name.toLowerCase().includes(q) ||
                      lg.country.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                if (filteredTop50.length === 0) return null;

                return (
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-3 flex items-center justify-between">
                      <span>
                        ★ Топ {Object.keys(LEAGUES_DATABASE).length} най-популярни първенства в света ({filteredTop50.length})
                      </span>
                      <span>Пълно класиране, програма, резултати & статистика</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredTop50.map((lg) => {
                        const isCurrent =
                          !customLeagueOverride && selectedLeagueKey === lg.id;
                        const todayCount = matches.filter(
                          (m) =>
                            m.leagueId === lg.apiLeagueId ||
                            m.league.toLowerCase() === lg.name.toLowerCase()
                        ).length;

                        return (
                          <button
                            key={lg.id}
                            type="button"
                            onClick={() => {
                              selectBuiltInLeague(lg.id);
                              setShowAllLeaguesModal(false);
                              window.scrollTo({ top: 260, behavior: 'smooth' });
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                              isCurrent
                                ? 'border-[#43f08a] bg-[#0e231b] shadow-lg'
                                : 'border-[#1a2636] bg-[#0c1420] hover:border-emerald-500/50 hover:bg-[#101b2b]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white/95 border border-white/20 p-1.5 flex items-center justify-center shrink-0">
                                <img
                                  src={`/api/football/media/leagues/${lg.apiLeagueId}.png`}
                                  alt={lg.name}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-[#43f08a] transition-colors truncate">
                                  {lg.name}
                                </div>
                                <div className="text-[11px] text-[#8f9cae] truncate">
                                  {lg.flag} {lg.country} · {lg.season}
                                </div>
                                {todayCount > 0 && (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-300">
                                    {todayCount} мача днес
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#43f08a] shrink-0">
                              Отвори →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Section 2: Full Global Catalog of All Professional Leagues & Cups Worldwide */}
              {modalRegionFilter !== 'top50' &&
                (() => {
                  const builtInIds = new Set(
                    Object.values(LEAGUES_DATABASE).map((l) => l.apiLeagueId)
                  );
                  const todayCountByLeague = new Map<number, number>();
                  for (const m of matches) {
                    if (m.leagueId) {
                      todayCountByLeague.set(
                        m.leagueId,
                        (todayCountByLeague.get(m.leagueId) || 0) + 1
                      );
                    }
                  }

                  // Merge globalCatalog.leagues with any active leagues from today's live feed
                  const catalogList: GlobalCatalogLeague[] =
                    globalCatalog.leagues.length > 0
                      ? globalCatalog.leagues
                      : Array.from(
                          new Map(
                            matches
                              .filter((m) => m.leagueId)
                              .map((m) => [
                                m.leagueId!,
                                {
                                  apiLeagueId: m.leagueId!,
                                  name: m.league,
                                  country: m.leagueCountry || 'International',
                                  countryCode: null,
                                  type: 'domestic' as const,
                                  rawType: 'League',
                                  logo: `/api/football/media/leagues/${m.leagueId}.png`,
                                  season: '2025/26',
                                },
                              ])
                          ).values()
                        );

                  const filteredCatalog = catalogList.filter((g) => {
                    if (builtInIds.has(g.apiLeagueId)) return false;
                    if (
                      modalCountryFilter !== 'all' &&
                      g.country.toLowerCase() !== modalCountryFilter.toLowerCase()
                    ) {
                      return false;
                    }
                    if (modalRegionFilter === 'today') {
                      if (!todayCountByLeague.has(g.apiLeagueId)) return false;
                    }
                    if (modalSearchQuery.trim()) {
                      const q = modalSearchQuery.toLowerCase();
                      return (
                        g.name.toLowerCase().includes(q) ||
                        g.country.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  });

                  if (filteredCatalog.length === 0) return null;

                  const displayedCatalog = filteredCatalog.slice(0, modalVisibleLimit);

                  return (
                    <div className="space-y-3">
                      <div className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center justify-between">
                        <span>
                          🌐 Пълен световен каталог по държави ({filteredCatalog.length} професионални лиги и купи)
                        </span>
                        <span>Зареждане на живо при избор</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {displayedCatalog.map((xlg) => {
                          const todayCount = todayCountByLeague.get(xlg.apiLeagueId) || 0;
                          const isSelected = activeLeague.apiLeagueId === xlg.apiLeagueId;
                          return (
                            <button
                              key={xlg.apiLeagueId}
                              type="button"
                              onClick={() => {
                                selectAnyLeague({
                                  apiLeagueId: xlg.apiLeagueId,
                                  name: xlg.name,
                                  country: xlg.country,
                                  flag: '🌍',
                                });
                                setShowAllLeaguesModal(false);
                                window.scrollTo({ top: 260, behavior: 'smooth' });
                              }}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                                isSelected
                                  ? 'border-[#43f08a] bg-[#0e231b]'
                                  : 'border-[#1a2636] bg-[#0c1420] hover:border-sky-400/50 hover:bg-[#101b2b]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-white/95 p-1 flex items-center justify-center shrink-0">
                                  <img
                                    src={`/api/football/media/leagues/${xlg.apiLeagueId}.png`}
                                    alt={xlg.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white group-hover:text-sky-300 truncate">
                                    {xlg.name}
                                  </div>
                                  <div className="text-[10px] text-[#8f9cae] truncate">
                                    {xlg.country} · {xlg.rawType === 'Cup' ? 'Купа' : 'Първенство'}
                                    {todayCount > 0 ? ` · 🔥 ${todayCount} мача днес` : ''}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono font-bold text-sky-400 shrink-0">
                                Отвори →
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {filteredCatalog.length > modalVisibleLimit && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setModalVisibleLimit((prev) => prev + 120)}
                            className="px-5 py-2.5 rounded-xl border border-sky-400/40 bg-[#0d1826] hover:border-sky-400 text-xs font-bold text-sky-300 cursor-pointer transition-colors"
                          >
                            Покажи още първенства ({filteredCatalog.length - modalVisibleLimit} оставащи) ↓
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ПРОЗОРЕЦ С ДЕТАЙЛИ ЗА ИЗМИНАЛ МАЧ (PAST MATCH DETAILS MODAL) */}
      {/* =================================================================== */}
      {selectedPastMatchModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPastMatchModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-[#1f3347] bg-[#081018] shadow-2xl overflow-hidden"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#162232] bg-[#0b1520]">
              <div className="flex items-center gap-2 text-xs text-neutral-200 font-semibold min-w-0">
                <div className="w-6 h-6 rounded-md bg-white/95 p-0.5 flex items-center justify-center shrink-0">
                  <img
                    src={`/api/football/media/leagues/${activeLeague.apiLeagueId}.png`}
                    alt={activeLeague.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="truncate">{pastMatchModalIntel?.league || activeLeague.name}</span>
                <span className="text-neutral-500">·</span>
                <span className="font-mono text-[#43f08a] truncate">
                  {pastMatchModalIntel?.date || selectedPastMatchModal.match.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPastMatchModal(null)}
                className="w-7 h-7 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-neutral-300 hover:text-white flex items-center justify-center text-sm cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Interactive Switcher for Team's Last 5 Matches (if opened from a team's W/D/L form badge) */}
            {selectedPastMatchModal.teamRow && (
              <div className="px-5 py-2.5 bg-[#09121c] border-b border-[#15202e] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <TeamBadge
                    name={selectedPastMatchModal.teamRow.club}
                    logoUrl={selectedPastMatchModal.teamRow.clubLogo}
                    teamId={selectedPastMatchModal.teamRow.teamId}
                    size="sm"
                    className="w-5 h-5"
                  />
                  <span className="font-bold text-white">
                    {selectedPastMatchModal.teamRow.club}
                  </span>
                  <span className="text-[11px] text-[#8f9cae]">— последни мачове:</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(() => {
                    const row = selectedPastMatchModal.teamRow;
                    const resolvedList = getResolvedFormDetails(row);
                    const offset = row.form.length - resolvedList.length;
                    return row.form.map((f, idx) => {
                      const dIdx = idx - offset;
                      const md =
                        dIdx >= 0 && dIdx < resolvedList.length ? resolvedList[dIdx] : undefined;
                      const isActive =
                        selectedPastMatchModal.badgeIdx === idx ||
                        (md && md.id === selectedPastMatchModal.match.id);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleFormBadgeClick(row, idx, f, md)}
                          title={md ? `${md.homeTeam} ${md.homeGoals}:${md.awayGoals} ${md.awayTeam}` : f}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black flex items-center gap-1 transition-all cursor-pointer ${
                            isActive
                              ? 'ring-2 ring-[#43f08a] scale-105'
                              : 'opacity-75 hover:opacity-100'
                          } ${
                            f === 'W'
                              ? 'bg-[#10b981] text-[#04130b]'
                              : f === 'D'
                              ? 'bg-[#334155] text-white'
                              : 'bg-[#ef4444] text-white'
                          }`}
                        >
                          <span>{f}</span>
                          {md && (
                            <span className="text-[9px] font-bold opacity-90">
                              ({md.homeGoals}:{md.awayGoals})
                            </span>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Match Scoreboard Banner */}
            <div className="p-6 bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] border-b border-[#162232]">
              {selectedPastMatchModal.loadingTeamMatches ? (
                <div className="py-6 text-center text-xs font-mono text-[#43f08a]">
                  Зареждане на изминалия мач на {selectedPastMatchModal.teamRow?.club}...
                </div>
              ) : (
                <div className="grid grid-cols-11 gap-3 items-center">
                  {/* Home Team */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <TeamBadge
                      name={selectedPastMatchModal.match.homeTeam}
                      logoUrl={pastMatchModalIntel?.homeLogo || selectedPastMatchModal.match.homeLogo}
                      teamId={selectedPastMatchModal.match.homeTeamId}
                      size="md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const target = {
                          teamId: selectedPastMatchModal.match.homeTeamId,
                          teamName: selectedPastMatchModal.match.homeTeam,
                          teamLogo:
                            pastMatchModalIntel?.homeLogo || selectedPastMatchModal.match.homeLogo,
                          leagueId: activeLeague.apiLeagueId,
                          leagueName: activeLeague.name,
                        };
                        setSelectedPastMatchModal(null);
                        openTeamProfile(target);
                      }}
                      className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] hover:underline text-left leading-tight truncate cursor-pointer"
                    >
                      {selectedPastMatchModal.match.homeTeam}
                    </button>
                  </div>

                  {/* Final Score Box */}
                  <div className="col-span-3 text-center">
                    <div className="inline-block rounded-xl border border-[#1f3144] bg-[#060b12]/90 px-4 py-2">
                      <div className="text-[10px] font-mono font-bold text-[#43f08a] uppercase">
                        {pastMatchModalIntel?.halftimeScore || 'КРАЕН РЕЗУЛТАТ'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                        {pastMatchModalIntel?.homeScore ?? selectedPastMatchModal.match.homeGoals} -{' '}
                        {pastMatchModalIntel?.awayScore ?? selectedPastMatchModal.match.awayGoals}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="col-span-4 flex items-center justify-end gap-3 text-right min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        const target = {
                          teamId: selectedPastMatchModal.match.awayTeamId,
                          teamName: selectedPastMatchModal.match.awayTeam,
                          teamLogo:
                            pastMatchModalIntel?.awayLogo || selectedPastMatchModal.match.awayLogo,
                          leagueId: activeLeague.apiLeagueId,
                          leagueName: activeLeague.name,
                        };
                        setSelectedPastMatchModal(null);
                        openTeamProfile(target);
                      }}
                      className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] hover:underline text-right leading-tight truncate cursor-pointer"
                    >
                      {selectedPastMatchModal.match.awayTeam}
                    </button>
                    <TeamBadge
                      name={selectedPastMatchModal.match.awayTeam}
                      logoUrl={pastMatchModalIntel?.awayLogo || selectedPastMatchModal.match.awayLogo}
                      teamId={selectedPastMatchModal.match.awayTeamId}
                      size="md"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Match Events Timeline & Official Statistics */}
            <div className="p-5 max-h-[52vh] overflow-y-auto space-y-4">
              {pastMatchModalLoading || selectedPastMatchModal.loadingTeamMatches ? (
                <div className="py-8 text-center text-xs text-[#8f9cae] font-mono">
                  Зареждане на официална хронология и статистика за мача...
                </div>
              ) : (
                <>
                  {pastMatchModalIntel?.events && pastMatchModalIntel.events.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] mb-1">
                        Хронология на събитията (Голове, Картони, Смени):
                      </div>
                      {pastMatchModalIntel.events.map((ev, idx) => (
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
                    <div className="p-3 rounded-xl border border-[#15202e] bg-[#0b121c] text-xs text-[#8f9cae] text-center">
                      Официален краен резултат:{' '}
                      <strong className="text-white">
                        {selectedPastMatchModal.match.homeTeam}{' '}
                        {selectedPastMatchModal.match.homeGoals} -{' '}
                        {selectedPastMatchModal.match.awayGoals}{' '}
                        {selectedPastMatchModal.match.awayTeam}
                      </strong>
                    </div>
                  )}

                  {pastMatchModalIntel?.hasRealStats && pastMatchModalIntel.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs pt-2 border-t border-[#162232]">
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">Владеене</span>
                        <span className="font-bold text-white">
                          {pastMatchModalIntel.stats.possessionHome}% -{' '}
                          {pastMatchModalIntel.stats.possessionAway}%
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">Удари (Точни)</span>
                        <span className="font-bold text-white">
                          {pastMatchModalIntel.stats.shotsHome} (
                          {pastMatchModalIntel.stats.shotsOnTargetHome}) -{' '}
                          {pastMatchModalIntel.stats.shotsAway} (
                          {pastMatchModalIntel.stats.shotsOnTargetAway})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">Корнери</span>
                        <span className="font-bold text-white">
                          {pastMatchModalIntel.stats.cornersHome} -{' '}
                          {pastMatchModalIntel.stats.cornersAway}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">🟨 Жълти картони</span>
                        <span className="font-bold text-white">
                          {pastMatchModalIntel.stats.yellowCardsHome} -{' '}
                          {pastMatchModalIntel.stats.yellowCardsAway}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer: Open Full MatchDetailPage or Team Profile */}
            {!selectedPastMatchModal.loadingTeamMatches && (
              <div className="px-5 py-3.5 bg-[#0a121d] border-t border-[#162232] flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const row = selectedPastMatchModal.teamRow;
                    setSelectedPastMatchModal(null);
                    openTeamProfile({
                      teamId: row?.teamId || selectedPastMatchModal.match.homeTeamId,
                      teamName: row?.club || selectedPastMatchModal.match.homeTeam,
                      teamLogo: row?.clubLogo || selectedPastMatchModal.match.homeLogo,
                      leagueId: activeLeague.apiLeagueId,
                      leagueName: activeLeague.name,
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a]/50 text-xs font-bold text-neutral-200 hover:text-white cursor-pointer transition-colors"
                >
                  🛡️ Профил на {selectedPastMatchModal.teamRow?.club || selectedPastMatchModal.match.homeTeam}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const md = selectedPastMatchModal.match;
                    setSelectedPastMatchModal(null);
                    handleOpenFixtureMatch({
                      id: md.id,
                      dayLabel: md.date,
                      homeTeamId: md.homeTeamId,
                      homeTeam: md.homeTeam,
                      homeLogo: md.homeLogo,
                      awayTeamId: md.awayTeamId,
                      awayTeam: md.awayTeam,
                      awayLogo: md.awayLogo,
                      homeGoals: md.homeGoals,
                      awayGoals: md.awayGoals,
                      status: 'FINISHED',
                      time: `${md.homeGoals} - ${md.awayGoals}`,
                    });
                  }}
                  className="px-4 py-2 rounded-xl border border-[#22c55e] bg-[#0f291e] hover:bg-[#22c55e] text-[#43f08a] hover:text-[#04130b] text-xs font-extrabold cursor-pointer transition-all"
                >
                  Отвори Пълен +EV & Поасон Анализ на Мача →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

