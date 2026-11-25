import React, { useEffect, useState, useMemo } from 'react';
import { ActiveTab, Language, Match, SelectedTeamTarget } from '../types';
import {
  TeamBadge,
  LeagueBadge,
  openTeamProfile,
  openPlayerProfile,
  openCompetitionLeague,
  registerMatchLogos,
} from './TeamBadge';

interface TeamIntelVenue {
  id: number | null;
  name: string;
  city: string | null;
  address: string | null;
  capacity: number | null;
  surface: string | null;
  image: string | null;
}

interface TeamIntelCoach {
  id: number;
  name: string;
  age: number | null;
  nationality: string | null;
  photo: string;
}

interface TeamIntelPlayer {
  id: number;
  name: string;
  age: number | null;
  number: number | null;
  position: string;
  photo: string;
}

interface TeamStandingSplit {
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
}

interface TeamStandingRow {
  rank: number;
  teamId?: number;
  club: string;
  clubLogo?: string;
  description?: string | null;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  home?: TeamStandingSplit;
  away?: TeamStandingSplit;
}

interface TeamFixtureItem {
  fixtureId: string;
  timestamp: number;
  date: string;
  time: string;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
  minute?: number;
  leagueId?: number;
  league: string;
  leagueLogo?: string;
  round?: string;
  homeTeamId?: number;
  homeTeam: string;
  homeLogo?: string;
  awayTeamId?: number;
  awayTeam: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  result?: 'W' | 'D' | 'L';
}

interface RealStatsSummary {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  sampleMatchesCount: number;
  cleanSheets: number;
  failedToScore: number;
  bttsCount: number;
  over25Count: number;
  bttsPercent: number | null;
  over25Percent: number | null;
  cleanSheetPercent: number | null;
}

interface TeamIntelResponse {
  configured: boolean;
  found: boolean;
  team?: {
    id: number;
    name: string;
    code: string | null;
    country: string | null;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  league?: {
    id: number | null;
    name: string;
    country: string | null;
    logo: string | null;
    seasonLabel: string;
  } | null;
  venue?: TeamIntelVenue | null;
  coach?: TeamIntelCoach | null;
  squad?: TeamIntelPlayer[];
  standings?: TeamStandingRow[];
  teamStanding?: TeamStandingRow | null;
  recentMatches?: TeamFixtureItem[];
  upcomingMatches?: TeamFixtureItem[];
  realStatsSummary?: RealStatsSummary | null;
}

interface PastFixtureModalIntel {
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
}

interface TeamDetailPageProps {
  language: Language;
  target: SelectedTeamTarget;
  allMatches: Match[];
  onBack: () => void;
  onSelectMatch: (match: Match) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

interface TeamI18n {
  tabOverview: string;
  tabStandings: string;
  tabSquad: string;
  tabMatches: string;
  posGK: string;
  posDF: string;
  posMF: string;
  posFW: string;
  clickMatchDetails: string;
  thClub: string;
  thForm: string;
  selectedBadge: string;
  home: string;
  back: string;
  founded: string;
  seats: string;
  coach: string;
  last5Matches: string;
  playedWdl: string;
  goalsDiff: string;
  avg: string;
  over25Goals: string;
  matchesUnit: string;
  bttsRate: string;
  cleanSheets: string;
  loadingClub: string;
  recentOfficialMatches: string;
  clickMatchOrTeamHint: string;
  allMatchesLink: string;
  upcomingScheduled: string;
  officialScheduleSub: string;
  leagueStandingsTitle: string;
  viewFullTable: string;
  homeAwayTitle: string;
  homeRecord: string;
  awayRecord: string;
  goalsLabel: string;
  clubStadium: string;
  capacityLabel: string;
  officialClubSquad: string;
  registeredPlayersSub: string;
  viewAllPlayers: string;
  yearsShort: string;
  fullStandingsTitle: string;
  clickAnyTeamSub: string;
  filterOverall: string;
  filterHome: string;
  filterAway: string;
  headCoachLabel: string;
  searchPlayerPlaceholder: string;
  filterAll: string;
  filterGK: string;
  filterDEF: string;
  filterMID: string;
  filterATT: string;
  yearsOld: string;
  recentFinishedTitle: string;
  upcomingFixturesTitle: string;
  finalScore: string;
  loadingTimeline: string;
  possession: string;
  shotsOnTarget: string;
  corners: string;
  yellowCards: string;
}

const TEAM_DICT: Record<Language, TeamI18n> = {
  bg: {
    tabOverview: 'Преглед на отбора',
    tabStandings: 'Класиране',
    tabSquad: 'Играчи & Състав',
    tabMatches: 'Мачове',
    posGK: 'Вратар',
    posDF: 'Защитник',
    posMF: 'Полузащитник',
    posFW: 'Нападател',
    clickMatchDetails: 'Кликни за детайли от мача ↗',
    thClub: 'Отбор',
    thForm: 'Форма',
    selectedBadge: 'ИЗБРАН',
    home: 'Начало',
    back: '← Назад',
    founded: 'Основан:',
    seats: 'места',
    coach: 'Треньор:',
    last5Matches: 'Последни 5 мача:',
    playedWdl: 'Мачове (W-D-L)',
    goalsDiff: 'Голова разлика',
    avg: 'ср.',
    over25Goals: 'Над 2.5 Гола',
    matchesUnit: 'мача',
    bttsRate: 'Гол/Гол (BTTS)',
    cleanSheets: 'Сухи мрежи:',
    loadingClub: 'Зареждане на официален профил за',
    recentOfficialMatches: 'Последни официални мачове',
    clickMatchOrTeamHint: 'Кликни на мач за хронология или върху отбор за неговия профил',
    allMatchesLink: 'Всички мачове ›',
    upcomingScheduled: 'Предстоящи мачове по програма',
    officialScheduleSub: 'Официална програма по кръгове и турнири',
    leagueStandingsTitle: 'Позиция в класирането',
    viewFullTable: 'Виж пълното класиране ›',
    homeAwayTitle: 'Представяне Домакин vs Гост (Официална статистика)',
    homeRecord: 'Като Домакин',
    awayRecord: 'Като Гост',
    goalsLabel: 'Голове:',
    clubStadium: 'Стадион на клуба',
    capacityLabel: 'Капацитет:',
    officialClubSquad: 'Официален състав на отбора',
    registeredPlayersSub: 'Картотекирани играчи за текущия сезон (кликни на играч за пълна статистика)',
    viewAllPlayers: 'Виж всички играчи ›',
    yearsShort: 'г.',
    fullStandingsTitle: 'Пълно класиране',
    clickAnyTeamSub: 'Кликни върху който и да е отбор в таблицата, за да отвориш неговата страница',
    filterOverall: 'Общо',
    filterHome: 'Домакин',
    filterAway: 'Гост',
    headCoachLabel: 'Старши треньор:',
    searchPlayerPlaceholder: 'Търси играч или номер...',
    filterAll: 'Всички',
    filterGK: 'Вратари',
    filterDEF: 'Защитници',
    filterMID: 'Халфове',
    filterATT: 'Нападатели',
    yearsOld: 'години',
    recentFinishedTitle: 'Последни изиграни срещи',
    upcomingFixturesTitle: 'Предстоящи мачове',
    finalScore: 'КРАЕН РЕЗУЛТАТ',
    loadingTimeline: 'Зареждане на официална хронология на мача...',
    possession: 'Владеене',
    shotsOnTarget: 'Удари (Точни)',
    corners: 'Корнери',
    yellowCards: 'Жълти картони',
  },
  en: {
    tabOverview: 'Club Overview',
    tabStandings: 'Standings',
    tabSquad: 'Squad & Players',
    tabMatches: 'Matches',
    posGK: 'Goalkeeper',
    posDF: 'Defender',
    posMF: 'Midfielder',
    posFW: 'Forward',
    clickMatchDetails: 'Click for match details ↗',
    thClub: 'Club',
    thForm: 'Form',
    selectedBadge: 'SELECTED',
    home: 'Home',
    back: '← Back',
    founded: 'Founded:',
    seats: 'seats',
    coach: 'Coach:',
    last5Matches: 'Last 5 matches:',
    playedWdl: 'Played (W-D-L)',
    goalsDiff: 'Goals (GF:GA)',
    avg: 'avg',
    over25Goals: 'Over 2.5 Goals',
    matchesUnit: 'matches',
    bttsRate: 'BTTS Rate',
    cleanSheets: 'Clean sheets:',
    loadingClub: 'Loading official profile for',
    recentOfficialMatches: 'Recent Official Matches',
    clickMatchOrTeamHint: 'Click a match for timeline or a team name for its profile',
    allMatchesLink: 'All matches ›',
    upcomingScheduled: 'Upcoming Scheduled Fixtures',
    officialScheduleSub: 'Official schedule by round and competition',
    leagueStandingsTitle: 'League Standings',
    viewFullTable: 'View full table ›',
    homeAwayTitle: 'Home vs Away Performance (Official)',
    homeRecord: 'Home Record',
    awayRecord: 'Away Record',
    goalsLabel: 'Goals:',
    clubStadium: 'Club Stadium',
    capacityLabel: 'Capacity:',
    officialClubSquad: 'Official Club Squad',
    registeredPlayersSub: 'Registered squad players for the current season (click any player for full stats)',
    viewAllPlayers: 'View all players ›',
    yearsShort: 'yrs',
    fullStandingsTitle: 'Full Standings',
    clickAnyTeamSub: 'Click any team in the table to open its dedicated profile page',
    filterOverall: 'Overall',
    filterHome: 'Home',
    filterAway: 'Away',
    headCoachLabel: 'Head Coach:',
    searchPlayerPlaceholder: 'Search player or #...',
    filterAll: 'All',
    filterGK: 'GK',
    filterDEF: 'DEF',
    filterMID: 'MID',
    filterATT: 'ATT',
    yearsOld: 'years old',
    recentFinishedTitle: 'Recent Finished Matches',
    upcomingFixturesTitle: 'Upcoming Fixtures',
    finalScore: 'FINAL SCORE',
    loadingTimeline: 'Loading official match timeline...',
    possession: 'Possession',
    shotsOnTarget: 'Shots (On Target)',
    corners: 'Corners',
    yellowCards: 'Yellow Cards',
  },
  es: {
    tabOverview: 'Resumen del Club',
    tabStandings: 'Clasificación',
    tabSquad: 'Plantilla',
    tabMatches: 'Partidos',
    posGK: 'Portero',
    posDF: 'Defensa',
    posMF: 'Centrocampista',
    posFW: 'Delantero',
    clickMatchDetails: 'Clic para detalles del partido ↗',
    thClub: 'Equipo',
    thForm: 'Forma',
    selectedBadge: 'SELECCIONADO',
    home: 'Inicio',
    back: '← Volver',
    founded: 'Fundado:',
    seats: 'asientos',
    coach: 'Entrenador:',
    last5Matches: 'Últimos 5 partidos:',
    playedWdl: 'Partidos (V-E-D)',
    goalsDiff: 'Goles (GF:GC)',
    avg: 'prom.',
    over25Goals: 'Más de 2.5 Goles',
    matchesUnit: 'partidos',
    bttsRate: 'Ambos Marcan',
    cleanSheets: 'Porterías a cero:',
    loadingClub: 'Cargando perfil oficial de',
    recentOfficialMatches: 'Últimos Partidos Oficiales',
    clickMatchOrTeamHint: 'Haz clic en un partido para ver la cronología o en un club para su perfil',
    allMatchesLink: 'Todos los partidos ›',
    upcomingScheduled: 'Próximos Partidos Programados',
    officialScheduleSub: 'Calendario oficial por jornada y competición',
    leagueStandingsTitle: 'Posición en la Tabla',
    viewFullTable: 'Ver tabla completa ›',
    homeAwayTitle: 'Rendimiento Local vs Visitante (Oficial)',
    homeRecord: 'Como Local',
    awayRecord: 'Como Visitante',
    goalsLabel: 'Goles:',
    clubStadium: 'Estadio del Club',
    capacityLabel: 'Capacidad:',
    officialClubSquad: 'Plantilla Oficial del Club',
    registeredPlayersSub: 'Jugadores inscritos en la temporada actual (clic en un jugador para sus estadísticas)',
    viewAllPlayers: 'Ver todos los jugadores ›',
    yearsShort: 'a.',
    fullStandingsTitle: 'Clasificación Completa',
    clickAnyTeamSub: 'Haz clic en cualquier equipo de la tabla para abrir su perfil',
    filterOverall: 'Total',
    filterHome: 'Local',
    filterAway: 'Visitante',
    headCoachLabel: 'Entrenador:',
    searchPlayerPlaceholder: 'Buscar jugador o dorsal...',
    filterAll: 'Todos',
    filterGK: 'POR',
    filterDEF: 'DEF',
    filterMID: 'MED',
    filterATT: 'DEL',
    yearsOld: 'años',
    recentFinishedTitle: 'Últimos Partidos Jugados',
    upcomingFixturesTitle: 'Próximos Partidos',
    finalScore: 'RESULTADO FINAL',
    loadingTimeline: 'Cargando cronología oficial del partido...',
    possession: 'Posesión',
    shotsOnTarget: 'Tiros (A Puerta)',
    corners: 'Córners',
    yellowCards: 'Tarjetas Amarillas',
  },
  de: {
    tabOverview: 'Vereinsübersicht',
    tabStandings: 'Tabelle',
    tabSquad: 'Kader & Spieler',
    tabMatches: 'Spiele',
    posGK: 'Torwart',
    posDF: 'Verteidiger',
    posMF: 'Mittelfeld',
    posFW: 'Stürmer',
    clickMatchDetails: 'Klicken für Spieldetails ↗',
    thClub: 'Verein',
    thForm: 'Form',
    selectedBadge: 'GEWÄHLT',
    home: 'Start',
    back: '← Zurück',
    founded: 'Gegründet:',
    seats: 'Plätze',
    coach: 'Trainer:',
    last5Matches: 'Letzte 5 Spiele:',
    playedWdl: 'Spiele (S-U-N)',
    goalsDiff: 'Tore (GF:GA)',
    avg: 'Ø',
    over25Goals: 'Über 2.5 Tore',
    matchesUnit: 'Spiele',
    bttsRate: 'BTTS-Quote',
    cleanSheets: 'Zu-Null-Spiele:',
    loadingClub: 'Lade offizielles Vereinsprofil für',
    recentOfficialMatches: 'Letzte Offizielle Spiele',
    clickMatchOrTeamHint: 'Klicken Sie auf ein Spiel für den Verlauf oder auf einen Verein für das Profil',
    allMatchesLink: 'Alle Spiele ›',
    upcomingScheduled: 'Anstehende Spiele',
    officialScheduleSub: 'Offizieller Spielplan nach Spieltag und Wettbewerb',
    leagueStandingsTitle: 'Tabellenplatz',
    viewFullTable: 'Komplette Tabelle ›',
    homeAwayTitle: 'Heim- vs. Auswärtsbilanz (Offiziell)',
    homeRecord: 'Heimbilanz',
    awayRecord: 'Auswärtsbilanz',
    goalsLabel: 'Tore:',
    clubStadium: 'Vereinsstadion',
    capacityLabel: 'Kapazität:',
    officialClubSquad: 'Offizieller Vereinskader',
    registeredPlayersSub: 'Registrierte Spieler der aktuellen Saison (Spieler anklicken für Statistiken)',
    viewAllPlayers: 'Alle Spieler ansehen ›',
    yearsShort: 'J.',
    fullStandingsTitle: 'Komplette Tabelle',
    clickAnyTeamSub: 'Klicken Sie auf ein Team in der Tabelle, um das Vereinsprofil zu öffnen',
    filterOverall: 'Gesamt',
    filterHome: 'Heim',
    filterAway: 'Auswärts',
    headCoachLabel: 'Cheftrainer:',
    searchPlayerPlaceholder: 'Spieler oder # suchen...',
    filterAll: 'Alle',
    filterGK: 'TW',
    filterDEF: 'ABW',
    filterMID: 'MIT',
    filterATT: 'ANG',
    yearsOld: 'Jahre',
    recentFinishedTitle: 'Letzte Beendete Spiele',
    upcomingFixturesTitle: 'Anstehende Spiele',
    finalScore: 'ENDERGEBNIS',
    loadingTimeline: 'Lade offiziellen Spielverlauf...',
    possession: 'Ballbesitz',
    shotsOnTarget: 'Schüsse (Aufs Tor)',
    corners: 'Ecken',
    yellowCards: 'Gelbe Karten',
  },
  it: {
    tabOverview: 'Panoramica Club',
    tabStandings: 'Classifica',
    tabSquad: 'Rosa & Giocatori',
    tabMatches: 'Partite',
    posGK: 'Portiere',
    posDF: 'Difensore',
    posMF: 'Centrocampista',
    posFW: 'Attaccante',
    clickMatchDetails: 'Clicca per dettagli partita ↗',
    thClub: 'Squadra',
    thForm: 'Forma',
    selectedBadge: 'SELEZIONATO',
    home: 'Home',
    back: '← Indietro',
    founded: 'Fondato:',
    seats: 'posti',
    coach: 'Allenatore:',
    last5Matches: 'Ultime 5 partite:',
    playedWdl: 'Partite (V-N-P)',
    goalsDiff: 'Gol (GF:GS)',
    avg: 'media',
    over25Goals: 'Over 2.5 Gol',
    matchesUnit: 'partite',
    bttsRate: 'Goal/Goal (BTTS)',
    cleanSheets: 'Reti inviolate:',
    loadingClub: 'Caricamento profilo ufficiale per',
    recentOfficialMatches: 'Ultime Partite Ufficiali',
    clickMatchOrTeamHint: 'Clicca su una partita per la cronologia o su una squadra per il profilo',
    allMatchesLink: 'Tutte le partite ›',
    upcomingScheduled: 'Prossime Partite in Programma',
    officialScheduleSub: 'Calendario ufficiale per giornata e competizione',
    leagueStandingsTitle: 'Posizione in Classifica',
    viewFullTable: 'Vedi classifica completa ›',
    homeAwayTitle: 'Rendimento Casa vs Trasferta (Ufficiale)',
    homeRecord: 'In Casa',
    awayRecord: 'In Trasferta',
    goalsLabel: 'Gol:',
    clubStadium: 'Stadio del Club',
    capacityLabel: 'Capienza:',
    officialClubSquad: 'Rosa Ufficiale della Squadra',
    registeredPlayersSub: 'Giocatori tesserati per la stagione attuale (clicca su un giocatore per le statistiche)',
    viewAllPlayers: 'Vedi tutti i giocatori ›',
    yearsShort: 'a.',
    fullStandingsTitle: 'Classifica Completa',
    clickAnyTeamSub: 'Clicca su qualsiasi squadra nella tabella per aprire il profilo',
    filterOverall: 'Totale',
    filterHome: 'Casa',
    filterAway: 'Trasferta',
    headCoachLabel: 'Allenatore:',
    searchPlayerPlaceholder: 'Cerca giocatore o #...',
    filterAll: 'Tutti',
    filterGK: 'POR',
    filterDEF: 'DIF',
    filterMID: 'CEN',
    filterATT: 'ATT',
    yearsOld: 'anni',
    recentFinishedTitle: 'Ultime Partite Giocate',
    upcomingFixturesTitle: 'Prossime Partite',
    finalScore: 'RISULTATO FINALE',
    loadingTimeline: 'Caricamento cronologia ufficiale della partita...',
    possession: 'Possesso',
    shotsOnTarget: 'Tiri (In Porta)',
    corners: 'Corner',
    yellowCards: 'Cartellini Gialli',
  },
  pt: {
    tabOverview: 'Visão Geral do Clube',
    tabStandings: 'Classificação',
    tabSquad: 'Elenco & Jogadores',
    tabMatches: 'Partidas',
    posGK: 'Goleiro',
    posDF: 'Defensor',
    posMF: 'Meio-campista',
    posFW: 'Atacante',
    clickMatchDetails: 'Clique para detalhes da partida ↗',
    thClub: 'Clube',
    thForm: 'Forma',
    selectedBadge: 'SELECIONADO',
    home: 'Início',
    back: '← Voltar',
    founded: 'Fundado:',
    seats: 'lugares',
    coach: 'Treinador:',
    last5Matches: 'Últimos 5 jogos:',
    playedWdl: 'Jogos (V-E-D)',
    goalsDiff: 'Gols (GP:GC)',
    avg: 'méd.',
    over25Goals: 'Mais de 2.5 Gols',
    matchesUnit: 'jogos',
    bttsRate: 'Ambas Marcam',
    cleanSheets: 'Jogos sem sofrer:',
    loadingClub: 'Carregando perfil oficial de',
    recentOfficialMatches: 'Últimas Partidas Oficiais',
    clickMatchOrTeamHint: 'Clique em uma partida para a cronologia ou em um clube para o perfil',
    allMatchesLink: 'Todas as partidas ›',
    upcomingScheduled: 'Próximas Partidas Agendadas',
    officialScheduleSub: 'Calendário oficial por rodada e competição',
    leagueStandingsTitle: 'Posição na Classificação',
    viewFullTable: 'Ver tabela completa ›',
    homeAwayTitle: 'Desempenho Casa vs Fora (Oficial)',
    homeRecord: 'Em Casa',
    awayRecord: 'Fora',
    goalsLabel: 'Gols:',
    clubStadium: 'Estádio do Clube',
    capacityLabel: 'Capacidade:',
    officialClubSquad: 'Elenco Oficial do Clube',
    registeredPlayersSub: 'Jogadores inscritos na temporada atual (clique em um jogador para estatísticas)',
    viewAllPlayers: 'Ver todos os jogadores ›',
    yearsShort: 'a.',
    fullStandingsTitle: 'Classificação Completa',
    clickAnyTeamSub: 'Clique em qualquer clube na tabela para abrir o perfil',
    filterOverall: 'Geral',
    filterHome: 'Casa',
    filterAway: 'Fora',
    headCoachLabel: 'Treinador:',
    searchPlayerPlaceholder: 'Buscar jogador ou nº...',
    filterAll: 'Todos',
    filterGK: 'GOL',
    filterDEF: 'DEF',
    filterMID: 'MEI',
    filterATT: 'ATA',
    yearsOld: 'anos',
    recentFinishedTitle: 'Últimas Partidas Encerradas',
    upcomingFixturesTitle: 'Próximas Partidas',
    finalScore: 'PLACAR FINAL',
    loadingTimeline: 'Carregando cronologia oficial da partida...',
    possession: 'Posse',
    shotsOnTarget: 'Chutes (No Gol)',
    corners: 'Escanteios',
    yellowCards: 'Cartões Amarelos',
  },
  fr: {
    tabOverview: 'Aperçu du Club',
    tabStandings: 'Classement',
    tabSquad: 'Effectif & Joueurs',
    tabMatches: 'Matchs',
    posGK: 'Gardien',
    posDF: 'Défenseur',
    posMF: 'Milieu',
    posFW: 'Attaquant',
    clickMatchDetails: 'Cliquez pour les détails du match ↗',
    thClub: 'Club',
    thForm: 'Forme',
    selectedBadge: 'SÉLECTIONNÉ',
    home: 'Accueil',
    back: '← Retour',
    founded: 'Fondé :',
    seats: 'places',
    coach: 'Entraîneur :',
    last5Matches: '5 derniers matchs :',
    playedWdl: 'Matchs (V-N-D)',
    goalsDiff: 'Buts (BP:BC)',
    avg: 'moy.',
    over25Goals: 'Plus de 2.5 Buts',
    matchesUnit: 'matchs',
    bttsRate: 'Les Deux Marquent',
    cleanSheets: 'Clean sheets :',
    loadingClub: 'Chargement du profil officiel pour',
    recentOfficialMatches: 'Derniers Matchs Officiels',
    clickMatchOrTeamHint: 'Cliquez sur un match pour la chronologie ou sur un club pour son profil',
    allMatchesLink: 'Tous les matchs ›',
    upcomingScheduled: 'Prochains Matchs Programmés',
    officialScheduleSub: 'Calendrier officiel par journée et compétition',
    leagueStandingsTitle: 'Position au Classement',
    viewFullTable: 'Voir le classement complet ›',
    homeAwayTitle: 'Performance Domicile vs Extérieur (Officiel)',
    homeRecord: 'À Domicile',
    awayRecord: 'À l’Extérieur',
    goalsLabel: 'Buts :',
    clubStadium: 'Stade du Club',
    capacityLabel: 'Capacité :',
    officialClubSquad: 'Effectif Officiel du Club',
    registeredPlayersSub: 'Joueurs inscrits pour la saison actuelle (cliquez sur un joueur pour ses statistiques)',
    viewAllPlayers: 'Voir tous les joueurs ›',
    yearsShort: 'ans',
    fullStandingsTitle: 'Classement Complet',
    clickAnyTeamSub: 'Cliquez sur n’importe quel club du tableau pour ouvrir son profil',
    filterOverall: 'Général',
    filterHome: 'Domicile',
    filterAway: 'Extérieur',
    headCoachLabel: 'Entraîneur :',
    searchPlayerPlaceholder: 'Rechercher un joueur ou n°...',
    filterAll: 'Tous',
    filterGK: 'GAR',
    filterDEF: 'DÉF',
    filterMID: 'MIL',
    filterATT: 'ATT',
    yearsOld: 'ans',
    recentFinishedTitle: 'Derniers Matchs Joués',
    upcomingFixturesTitle: 'Prochains Matchs',
    finalScore: 'SCORE FINAL',
    loadingTimeline: 'Chargement de la chronologie officielle du match...',
    possession: 'Possession',
    shotsOnTarget: 'Tirs (Cadrés)',
    corners: 'Corners',
    yellowCards: 'Cartons Jaunes',
  },
  tr: {
    tabOverview: 'Kulüp Özeti',
    tabStandings: 'Puan Durumu',
    tabSquad: 'Kadro & Oyuncular',
    tabMatches: 'Maçlar',
    posGK: 'Kaleci',
    posDF: 'Defans',
    posMF: 'Orta Saha',
    posFW: 'Forvet',
    clickMatchDetails: 'Maç detayları için tıklayın ↗',
    thClub: 'Kulüp',
    thForm: 'Form',
    selectedBadge: 'SEÇİLİ',
    home: 'Ana Sayfa',
    back: '← Geri',
    founded: 'Kuruluş:',
    seats: 'kapasite',
    coach: 'Teknik Direktör:',
    last5Matches: 'Son 5 maç:',
    playedWdl: 'Maçlar (G-B-M)',
    goalsDiff: 'Goller (AG:YG)',
    avg: 'ort.',
    over25Goals: '2.5 Üst Gol',
    matchesUnit: 'maç',
    bttsRate: 'KG Var (BTTS)',
    cleanSheets: 'Gol yemeden:',
    loadingClub: 'Resmi kulüp profili yükleniyor:',
    recentOfficialMatches: 'Son Resmi Maçlar',
    clickMatchOrTeamHint: 'Akış için maça veya profili için takım adına tıklayın',
    allMatchesLink: 'Tüm maçlar ›',
    upcomingScheduled: 'Yaklaşan Maçlar',
    officialScheduleSub: 'Hafta ve turnuvaya göre resmi fikstür',
    leagueStandingsTitle: 'Lig Puan Durumu',
    viewFullTable: 'Tüm tabloyu gör ›',
    homeAwayTitle: 'İç Saha vs Deplasman Performansı',
    homeRecord: 'İç Saha',
    awayRecord: 'Deplasman',
    goalsLabel: 'Goller:',
    clubStadium: 'Kulüp Stadyumu',
    capacityLabel: 'Kapasite:',
    officialClubSquad: 'Resmi Kulüp Kadrosu',
    registeredPlayersSub: 'Mevcut sezon kadrosu (istatistikler için oyuncuya tıklayın)',
    viewAllPlayers: 'Tüm oyuncuları gör ›',
    yearsShort: 'y.',
    fullStandingsTitle: 'Tam Puan Durumu',
    clickAnyTeamSub: 'Profilini açmak için tablodaki herhangi bir takıma tıklayın',
    filterOverall: 'Genel',
    filterHome: 'İç Saha',
    filterAway: 'Deplasman',
    headCoachLabel: 'Teknik Direktör:',
    searchPlayerPlaceholder: 'Oyuncu veya numara ara...',
    filterAll: 'Tümü',
    filterGK: 'KL',
    filterDEF: 'DF',
    filterMID: 'OS',
    filterATT: 'FV',
    yearsOld: 'yaş',
    recentFinishedTitle: 'Son Oynanan Maçlar',
    upcomingFixturesTitle: 'Gelecek Maçlar',
    finalScore: 'MAÇ SONUCU',
    loadingTimeline: 'Resmi maç akışı yükleniyor...',
    possession: 'Topla Oynama',
    shotsOnTarget: 'Şut (İsabetli)',
    corners: 'Korner',
    yellowCards: 'Sarı Kart',
  },
  pl: {
    tabOverview: 'Przegląd Klubu',
    tabStandings: 'Tabela',
    tabSquad: 'Kadra i Piłkarze',
    tabMatches: 'Mecze',
    posGK: 'Bramkarz',
    posDF: 'Obrońca',
    posMF: 'Pomocnik',
    posFW: 'Napastnik',
    clickMatchDetails: 'Kliknij po szczegóły meczu ↗',
    thClub: 'Klub',
    thForm: 'Forma',
    selectedBadge: 'WYBRANY',
    home: 'Start',
    back: '← Wstecz',
    founded: 'Założony:',
    seats: 'miejsc',
    coach: 'Trener:',
    last5Matches: 'Ostatnie 5 meczów:',
    playedWdl: 'Mecze (Z-R-P)',
    goalsDiff: 'Bramki (BZ:BS)',
    avg: 'śr.',
    over25Goals: 'Powyżej 2.5 Gola',
    matchesUnit: 'meczów',
    bttsRate: 'BTTS (Obie strzelą)',
    cleanSheets: 'Czyste konta:',
    loadingClub: 'Ładowanie oficjalnego profilu dla',
    recentOfficialMatches: 'Ostatnie Oficjalne Mecze',
    clickMatchOrTeamHint: 'Kliknij mecz, aby zobaczyć przebieg, lub nazwę klubu, aby otworzyć profil',
    allMatchesLink: 'Wszystkie mecze ›',
    upcomingScheduled: 'Nadchodzące Mecze',
    officialScheduleSub: 'Oficjalny terminarz według kolejek i rozgrywek',
    leagueStandingsTitle: 'Pozycja w Tabeli',
    viewFullTable: 'Zobacz pełną tabelę ›',
    homeAwayTitle: 'Bilans Dom vs Wyjazd (Oficjalny)',
    homeRecord: 'U Siebie',
    awayRecord: 'Na Wyjeździe',
    goalsLabel: 'Bramki:',
    clubStadium: 'Stadion Klubu',
    capacityLabel: 'Pojemność:',
    officialClubSquad: 'Oficjalna Kadra Klubu',
    registeredPlayersSub: 'Zarejestrowani piłkarze na obecny sezon (kliknij piłkarza po pełne statystyki)',
    viewAllPlayers: 'Zobacz wszystkich piłkarzy ›',
    yearsShort: 'l.',
    fullStandingsTitle: 'Pełna Tabela',
    clickAnyTeamSub: 'Kliknij dowolną drużynę w tabeli, aby otworzyć jej profil',
    filterOverall: 'Ogółem',
    filterHome: 'Dom',
    filterAway: 'Wyjazd',
    headCoachLabel: 'Trener:',
    searchPlayerPlaceholder: 'Szukaj piłkarza lub nr...',
    filterAll: 'Wszyscy',
    filterGK: 'BR',
    filterDEF: 'OBR',
    filterMID: 'POM',
    filterATT: 'NAP',
    yearsOld: 'lat',
    recentFinishedTitle: 'Ostatnie Rozegrane Mecze',
    upcomingFixturesTitle: 'Nadchodzące Mecze',
    finalScore: 'WYNIK KOŃCOWY',
    loadingTimeline: 'Ładowanie oficjalnego przebiegu meczu...',
    possession: 'Posiadanie',
    shotsOnTarget: 'Strzały (Celne)',
    corners: 'Rzuty rożne',
    yellowCards: 'Żółte Kartki',
  },
  el: {
    tabOverview: 'Επισκόπηση Ομάδας',
    tabStandings: 'Βαθμολογία',
    tabSquad: 'Ρόστερ & Παίκτες',
    tabMatches: 'Αγώνες',
    posGK: 'Τερματοφύλακας',
    posDF: 'Αμυντικός',
    posMF: 'Μέσος',
    posFW: 'Επιθετικός',
    clickMatchDetails: 'Κλικ για λεπτομέρειες αγώνα ↗',
    thClub: 'Ομάδα',
    thForm: 'Φόρμα',
    selectedBadge: 'ΕΠΙΛΕΓΜΕΝΗ',
    home: 'Αρχική',
    back: '← Πίσω',
    founded: 'Ίδρυση:',
    seats: 'θέσεις',
    coach: 'Προπονητής:',
    last5Matches: 'Τελευταίοι 5 αγώνες:',
    playedWdl: 'Αγώνες (Ν-Ι-Η)',
    goalsDiff: 'Γκολ (Υπέρ:Κατά)',
    avg: 'μ.ο.',
    over25Goals: 'Over 2.5 Γκολ',
    matchesUnit: 'αγώνες',
    bttsRate: 'Goal/Goal (BTTS)',
    cleanSheets: 'Καθαρές εστίες:',
    loadingClub: 'Φόρτωση επίσημου προφίλ για',
    recentOfficialMatches: 'Τελευταίοι Επίσημοι Αγώνες',
    clickMatchOrTeamHint: 'Κάντε κλικ σε αγώνα για ροή ή σε ομάδα για το προφίλ της',
    allMatchesLink: 'Όλοι οι αγώνες ›',
    upcomingScheduled: 'Επερχόμενοι Αγώνες',
    officialScheduleSub: 'Επίσημο πρόγραμμα ανά αγωνιστική',
    leagueStandingsTitle: 'Θέση στη Βαθμολογία',
    viewFullTable: 'Πλήρης βαθμολογία ›',
    homeAwayTitle: 'Επίδοση Εντός vs Εκτός',
    homeRecord: 'Εντός Έδρας',
    awayRecord: 'Εκτός Έδρας',
    goalsLabel: 'Γκολ:',
    clubStadium: 'Γήπεδο Ομάδας',
    capacityLabel: 'Χωρητικότητα:',
    officialClubSquad: 'Επίσημο Ρόστερ Ομάδας',
    registeredPlayersSub: 'Δηλωμένοι παίκτες για την τρέχουσα σεζόν (κλικ σε παίκτη για στατιστικά)',
    viewAllPlayers: 'Όλοι οι παίκτες ›',
    yearsShort: 'ετ.',
    fullStandingsTitle: 'Πλήρης Βαθμολογία',
    clickAnyTeamSub: 'Κάντε κλικ σε οποιαδήποτε ομάδα στον πίνακα για το προφίλ της',
    filterOverall: 'Σύνολο',
    filterHome: 'Εντός',
    filterAway: 'Εκτός',
    headCoachLabel: 'Προπονητής:',
    searchPlayerPlaceholder: 'Αναζήτηση παίκτη ή #...',
    filterAll: 'Όλοι',
    filterGK: 'ΤΕΡ',
    filterDEF: 'ΑΜΥ',
    filterMID: 'ΜΕΣ',
    filterATT: 'ΕΠΙ',
    yearsOld: 'ετών',
    recentFinishedTitle: 'Τελευταίοι Αγώνες',
    upcomingFixturesTitle: 'Επερχόμενοι Αγώνες',
    finalScore: 'ΤΕΛΙΚΟ ΣΚΟΡ',
    loadingTimeline: 'Φόρτωση επίσημης ροής αγώνα...',
    possession: 'Κατοχή',
    shotsOnTarget: 'Σουτ (Εστία)',
    corners: 'Κόρνερ',
    yellowCards: 'Κίτρινες Κάρτες',
  },
  ro: {
    tabOverview: 'Prezentare Club',
    tabStandings: 'Clasament',
    tabSquad: 'Lot & Jucători',
    tabMatches: 'Meciuri',
    posGK: 'Portar',
    posDF: 'Fundaș',
    posMF: 'Mijlocaș',
    posFW: 'Atacant',
    clickMatchDetails: 'Apasă pentru detalii meci ↗',
    thClub: 'Echipă',
    thForm: 'Formă',
    selectedBadge: 'SELECTAT',
    home: 'Acasă',
    back: '← Înapoi',
    founded: 'Fondat:',
    seats: 'locuri',
    coach: 'Antrenor:',
    last5Matches: 'Ultimele 5 meciuri:',
    playedWdl: 'Meciuri (V-E-Î)',
    goalsDiff: 'Goluri (GM:GP)',
    avg: 'med.',
    over25Goals: 'Peste 2.5 Goluri',
    matchesUnit: 'meciuri',
    bttsRate: 'Ambele Marchează',
    cleanSheets: 'Fără gol primit:',
    loadingClub: 'Se încarcă profilul oficial pentru',
    recentOfficialMatches: 'Ultimele Meciuri Oficiale',
    clickMatchOrTeamHint: 'Apasă pe un meci pentru cronologie sau pe o echipă pentru profil',
    allMatchesLink: 'Toate meciurile ›',
    upcomingScheduled: 'Meciuri Următoare',
    officialScheduleSub: 'Program oficial pe etape și competiții',
    leagueStandingsTitle: 'Poziția în Clasament',
    viewFullTable: 'Vezi clasamentul complet ›',
    homeAwayTitle: 'Performanță Acasă vs Deplasare (Oficial)',
    homeRecord: 'Acasă',
    awayRecord: 'Deplasare',
    goalsLabel: 'Goluri:',
    clubStadium: 'Stadionul Clubului',
    capacityLabel: 'Capacitate:',
    officialClubSquad: 'Lotul Oficial al Clubului',
    registeredPlayersSub: 'Jucători înregistrați în sezonul actual (apasă pe un jucător pentru statistici)',
    viewAllPlayers: 'Vezi toți jucătorii ›',
    yearsShort: 'ani',
    fullStandingsTitle: 'Clasament Complet',
    clickAnyTeamSub: 'Apasă pe orice echipă din tabel pentru a deschide profilul',
    filterOverall: 'Total',
    filterHome: 'Acasă',
    filterAway: 'Deplasare',
    headCoachLabel: 'Antrenor principal:',
    searchPlayerPlaceholder: 'Caută jucător sau nr...',
    filterAll: 'Toți',
    filterGK: 'POR',
    filterDEF: 'FUN',
    filterMID: 'MIJ',
    filterATT: 'ATA',
    yearsOld: 'ani',
    recentFinishedTitle: 'Ultimele Meciuri Jucate',
    upcomingFixturesTitle: 'Meciuri Următoare',
    finalScore: 'SCOR FINAL',
    loadingTimeline: 'Se încarcă cronologia oficială a meciului...',
    possession: 'Posesie',
    shotsOnTarget: 'Șuturi (Pe Poartă)',
    corners: 'Cornere',
    yellowCards: 'Cartonașe Galbene',
  },
  ru: {
    tabOverview: 'Обзор клуба',
    tabStandings: 'Таблица',
    tabSquad: 'Состав и игроки',
    tabMatches: 'Матчи',
    posGK: 'Вратарь',
    posDF: 'Защитник',
    posMF: 'Полузащитник',
    posFW: 'Нападающий',
    clickMatchDetails: 'Нажмите для деталей матча ↗',
    thClub: 'Клуб',
    thForm: 'Форма',
    selectedBadge: 'ВЫБРАН',
    home: 'Главная',
    back: '← Назад',
    founded: 'Основан:',
    seats: 'мест',
    coach: 'Тренер:',
    last5Matches: 'Последние 5 матчей:',
    playedWdl: 'Матчи (В-Н-П)',
    goalsDiff: 'Голы (ЗГ:ПГ)',
    avg: 'ср.',
    over25Goals: 'Тотал Б 2.5',
    matchesUnit: 'матчей',
    bttsRate: 'Обе забьют (BTTS)',
    cleanSheets: 'Сухие матчи:',
    loadingClub: 'Загрузка официального профиля клуба',
    recentOfficialMatches: 'Последние официальные матчи',
    clickMatchOrTeamHint: 'Нажмите на матч для хронологии или на клуб для открытия профиля',
    allMatchesLink: 'Все матчи ›',
    upcomingScheduled: 'Предстоящие матчи по расписанию',
    officialScheduleSub: 'Официальный календарь по турам и турнирам',
    leagueStandingsTitle: 'Позиция в таблице',
    viewFullTable: 'Вся таблица ›',
    homeAwayTitle: 'Статистика Дома vs На выезде',
    homeRecord: 'Дома',
    awayRecord: 'На выезде',
    goalsLabel: 'Голы:',
    clubStadium: 'Стадион клуба',
    capacityLabel: 'Вместимость:',
    officialClubSquad: 'Официальный состав клуба',
    registeredPlayersSub: 'Заявленные игроки текущего сезона (нажмите на игрока для полной статистики)',
    viewAllPlayers: 'Все игроки ›',
    yearsShort: 'л.',
    fullStandingsTitle: 'Полная таблица',
    clickAnyTeamSub: 'Нажмите на любую команду в таблице, чтобы открыть ее страницу',
    filterOverall: 'Всего',
    filterHome: 'Дома',
    filterAway: 'В гостях',
    headCoachLabel: 'Главный тренер:',
    searchPlayerPlaceholder: 'Поиск игрока или №...',
    filterAll: 'Все',
    filterGK: 'ВР',
    filterDEF: 'ЗАЩ',
    filterMID: 'ПЗ',
    filterATT: 'НАП',
    yearsOld: 'лет',
    recentFinishedTitle: 'Последние сыгранные матчи',
    upcomingFixturesTitle: 'Предстоящие матчи',
    finalScore: 'ИТОГОВЫЙ СЧЕТ',
    loadingTimeline: 'Загрузка официальной хронологии матча...',
    possession: 'Владение',
    shotsOnTarget: 'Удары (В створ)',
    corners: 'Угловые',
    yellowCards: 'Желтые карточки',
  },
};

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({
  language,
  target,
  allMatches,
  onBack,
  onSelectMatch,
  setActiveTab,
}) => {
  const tt = TEAM_DICT[language] || TEAM_DICT.en;
  const [loading, setLoading] = useState<boolean>(true);
  const [intel, setIntel] = useState<TeamIntelResponse | null>(null);
  const [subTab, setSubTab] = useState<'overview' | 'standings' | 'squad' | 'matches'>('overview');
  const [standingsMode, setStandingsMode] = useState<'all' | 'home' | 'away'>('all');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [playerSearch, setPlayerSearch] = useState<string>('');

  // Modal state when clicking a form dot or a past match
  const [selectedFixture, setSelectedFixture] = useState<TeamFixtureItem | null>(null);
  const [fixtureModalIntel, setFixtureModalIntel] = useState<PastFixtureModalIntel | null>(null);
  const [fixtureModalLoading, setFixtureModalLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSubTab('overview');

    const params = new URLSearchParams();
    if (target.teamId) params.set('teamId', String(target.teamId));
    if (target.teamName) params.set('name', target.teamName);
    if (target.leagueId) params.set('leagueId', String(target.leagueId));

    fetch(`/api/football/team-intel?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TeamIntelResponse | null) => {
        if (!active) return;
        setIntel(data);
        setLoading(false);

        if (data?.found) {
          // Register all team & league logos in global registry
          const toRegister: Array<{
            homeTeam?: string;
            awayTeam?: string;
            homeLogo?: string;
            awayLogo?: string;
            league?: string;
            leagueLogo?: string;
          }> = [];
          if (data.team?.name && data.team?.logo) {
            toRegister.push({
              homeTeam: data.team.name,
              homeLogo: data.team.logo,
              league: data.league?.name,
              leagueLogo: data.league?.logo || undefined,
            });
          }
          for (const row of data.standings || []) {
            if (row.club && row.clubLogo) {
              toRegister.push({ homeTeam: row.club, homeLogo: row.clubLogo });
            }
          }
          for (const fx of [...(data.recentMatches || []), ...(data.upcomingMatches || [])]) {
            toRegister.push({
              homeTeam: fx.homeTeam,
              homeLogo: fx.homeLogo,
              awayTeam: fx.awayTeam,
              awayLogo: fx.awayLogo,
              league: fx.league,
              leagueLogo: fx.leagueLogo,
            });
          }
          registerMatchLogos(toRegister);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [target.teamId, target.teamName, target.leagueId]);

  // Fetch deep fixture events/stats when user clicks a past match or W/D/L dot
  useEffect(() => {
    if (!selectedFixture?.fixtureId) {
      setFixtureModalIntel(null);
      return;
    }
    let active = true;
    setFixtureModalLoading(true);
    const rawId = selectedFixture.fixtureId.replace(/^api-/, '');
    fetch(`/api/football/match-intel/${rawId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          setFixtureModalIntel(data?.found ? data : null);
          setFixtureModalLoading(false);
        }
      })
      .catch(() => {
        if (active) setFixtureModalLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedFixture]);

  const teamName = intel?.team?.name || target.teamName;
  const teamLogo = intel?.team?.logo || target.teamLogo;
  const teamId = intel?.team?.id || target.teamId;

  const standings = intel?.standings || [];
  const squad = intel?.squad || [];
  const recentMatches = intel?.recentMatches || [];
  const upcomingMatches = intel?.upcomingMatches || [];
  const venue = intel?.venue || null;
  const coach = intel?.coach || null;
  const statsSummary = intel?.realStatsSummary || null;
  const teamStanding = intel?.teamStanding || null;

  const hasStandings = standings.length > 0;
  const hasSquad = squad.length > 0;
  const hasMatches = recentMatches.length > 0 || upcomingMatches.length > 0;

  // Dynamic Navigation Tabs — strictly hiding any tab for which API-Football has no data
  const navTabs = useMemo(() => {
    return [
      {
        key: 'overview' as const,
        label: tt.tabOverview,
        icon: '🛡️',
        visible: true,
      },
      {
        key: 'standings' as const,
        label: `${tt.tabStandings} (${standings.length})`,
        icon: '🏆',
        visible: hasStandings,
      },
      {
        key: 'squad' as const,
        label: `${tt.tabSquad} (${squad.length})`,
        icon: '👕',
        visible: hasSquad,
      },
      {
        key: 'matches' as const,
        label: `${tt.tabMatches} (${recentMatches.length + upcomingMatches.length})`,
        icon: '📅',
        visible: hasMatches,
      },
    ].filter((t) => t.visible);
  }, [tt, hasStandings, hasSquad, hasMatches, standings.length, squad.length, recentMatches.length, upcomingMatches.length]);

  const positionLabel = (pos: string) => {
    const p = pos.toLowerCase();
    if (p.includes('goal')) return tt.posGK;
    if (p.includes('def')) return tt.posDF;
    if (p.includes('mid')) return tt.posMF;
    if (p.includes('att') || p.includes('forw')) return tt.posFW;
    return pos;
  };

  const filteredSquad = useMemo(() => {
    return squad.filter((p) => {
      if (posFilter !== 'ALL' && p.position.toLowerCase() !== posFilter.toLowerCase()) {
        return false;
      }
      if (
        playerSearch.trim() &&
        !p.name.toLowerCase().includes(playerSearch.trim().toLowerCase()) &&
        String(p.number || '') !== playerSearch.trim()
      ) {
        return false;
      }
      return true;
    });
  }, [squad, posFilter, playerSearch]);

  const handleFixtureClick = (fx: TeamFixtureItem) => {
    // Check if this fixture is currently in allMatches (live or today's feed)
    const inLiveFeed = allMatches.find(
      (m) =>
        m.id === fx.fixtureId ||
        (m.homeTeam.toLowerCase() === fx.homeTeam.toLowerCase() &&
          m.awayTeam.toLowerCase() === fx.awayTeam.toLowerCase())
    );
    if (inLiveFeed && fx.status !== 'FINISHED') {
      onSelectMatch(inLiveFeed);
      return;
    }
    setSelectedFixture(fx);
  };

  // Interactive W/D/L Form Pills (hover shows match tooltip, click opens match modal)
  const renderFormPills = (matchesList: TeamFixtureItem[]) => {
    const last5 = matchesList.slice(0, 5);
    if (last5.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {last5.map((m, idx) => {
          const res = m.result || 'D';
          return (
            <div key={m.fixtureId || idx} className="relative group">
              <button
                type="button"
                onClick={() => handleFixtureClick(m)}
                className={`w-6 h-6 rounded-md text-[10px] font-mono font-black flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ring-1 ring-white/15 hover:ring-[#43f08a] ${
                  res === 'W'
                    ? 'bg-[#10b981] text-[#04130b]'
                    : res === 'D'
                    ? 'bg-[#475569] text-white'
                    : 'bg-[#ef4444] text-white'
                }`}
              >
                {res}
              </button>

              {/* Rich Hover Tooltip */}
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-[260px] rounded-xl bg-[#070d15] border border-[#22c55e]/50 px-3 py-2 shadow-2xl text-left">
                <div className="text-[10px] font-mono text-[#8f9cae] flex items-center justify-between gap-3">
                  <span>{m.date}</span>
                  <span className="text-[#43f08a] truncate max-w-[130px]">{m.league}</span>
                </div>
                <div className="text-xs font-extrabold text-white mt-0.5">
                  {m.homeTeam}{' '}
                  <span className="text-[#43f08a] font-mono px-1">
                    {m.homeScore}-{m.awayScore}
                  </span>{' '}
                  {m.awayTeam}
                </div>
                <div className="text-[9px] font-mono text-[#43f08a] mt-1">
                  {tt.clickMatchDetails}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStandingsTable = (compact = false) => {
    if (!hasStandings) return null;

    // Sort/compute rows according to standingsMode ('all' | 'home' | 'away')
    const computedRows = standings.map((row) => {
      if (standingsMode === 'home' && row.home) {
        const gd = row.home.gf - row.home.ga;
        const pts = row.home.w * 3 + row.home.d;
        return {
          ...row,
          p: row.home.p,
          w: row.home.w,
          d: row.home.d,
          l: row.home.l,
          gf: row.home.gf,
          ga: row.home.ga,
          gd: gd > 0 ? `+${gd}` : String(gd),
          pts,
        };
      }
      if (standingsMode === 'away' && row.away) {
        const gd = row.away.gf - row.away.ga;
        const pts = row.away.w * 3 + row.away.d;
        return {
          ...row,
          p: row.away.p,
          w: row.away.w,
          d: row.away.d,
          l: row.away.l,
          gf: row.away.gf,
          ga: row.away.ga,
          gd: gd > 0 ? `+${gd}` : String(gd),
          pts,
        };
      }
      return row;
    });

    if (standingsMode !== 'all') {
      computedRows.sort((a, b) => b.pts - a.pts || Number(b.gd) - Number(a.gd) || b.gf - a.gf);
    }

    let rowsToDisplay = computedRows;
    if (compact && computedRows.length > 8) {
      const idx = computedRows.findIndex(
        (r) =>
          (teamId && r.teamId === teamId) ||
          r.club.toLowerCase() === teamName.toLowerCase()
      );
      if (idx !== -1) {
        const start = Math.max(0, Math.min(idx - 3, computedRows.length - 8));
        rowsToDisplay = computedRows.slice(start, start + 8);
      } else {
        rowsToDisplay = computedRows.slice(0, 8);
      }
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#162232] text-[10px] font-mono text-[#8f9cae] uppercase">
              <th className="py-2 pl-2 pr-1 w-8">#</th>
              <th className="py-2 px-2">{tt.thClub}</th>
              <th className="py-2 px-1.5 text-center">P</th>
              {!compact && (
                <>
                  <th className="py-2 px-1.5 text-center">W</th>
                  <th className="py-2 px-1.5 text-center">D</th>
                  <th className="py-2 px-1.5 text-center">L</th>
                  <th className="py-2 px-2 text-center">GF:GA</th>
                </>
              )}
              <th className="py-2 px-1.5 text-center">GD</th>
              <th className="py-2 px-2 text-center text-white">PTS</th>
              {!compact && (
                <th className="py-2 pl-2 pr-2 text-right">{tt.thForm}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#131e2c]">
            {rowsToDisplay.map((row, idx) => {
              const isCurrentTeam =
                (teamId && row.teamId === teamId) ||
                row.club.toLowerCase() === teamName.toLowerCase();
              const displayRank = standingsMode === 'all' ? row.rank : idx + 1;

              return (
                <tr
                  key={`${row.rank}-${row.club}`}
                  onClick={() =>
                    openTeamProfile({
                      teamId: row.teamId,
                      teamName: row.club,
                      teamLogo: row.clubLogo,
                      leagueId: intel?.league?.id || undefined,
                      leagueName: intel?.league?.name,
                    })
                  }
                  className={`transition-colors cursor-pointer ${
                    isCurrentTeam
                      ? 'bg-[#0f291e]/90 border-l-2 border-l-[#43f08a]'
                      : 'hover:bg-[#0e1622]'
                  }`}
                >
                  <td className="py-2.5 pl-2 pr-1 font-mono text-[11px] font-bold text-[#8f9cae]">
                    {displayRank}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamBadge
                        name={row.club}
                        logoUrl={row.clubLogo}
                        teamId={row.teamId}
                        size="sm"
                      />
                      <span
                        className={`truncate hover:underline ${
                          isCurrentTeam
                            ? 'font-extrabold text-[#43f08a]'
                            : 'font-semibold text-white'
                        }`}
                      >
                        {row.club}
                      </span>
                      {isCurrentTeam && (
                        <span className="px-1.5 py-0.5 rounded bg-[#22c55e]/20 border border-[#22c55e]/40 text-[9px] font-mono font-bold text-[#43f08a] shrink-0">
                          {tt.selectedBadge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                    {row.p}
                  </td>
                  {!compact && (
                    <>
                      <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                        {row.w}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                        {row.d}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                        {row.l}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-400">
                        {row.gf}:{row.ga}
                      </td>
                    </>
                  )}
                  <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                    {row.gd}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-black text-[#43f08a]">
                    {row.pts}
                  </td>
                  {!compact && (
                    <td className="py-2.5 pl-2 pr-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {(row.form || []).map((f, fIdx) => {
                          // For the currently viewed team, map directly to its recentMatches (oldest to newest of last 5)
                          const last5Chrono = isCurrentTeam
                            ? [...recentMatches.slice(0, 5)].reverse()
                            : [];
                          const offset = (row.form || []).length - last5Chrono.length;
                          const matchedFx =
                            isCurrentTeam && fIdx - offset >= 0
                              ? last5Chrono[fIdx - offset]
                              : undefined;

                          return (
                            <button
                              key={fIdx}
                              type="button"
                              title={
                                matchedFx
                                  ? `${matchedFx.date}: ${matchedFx.homeTeam} ${matchedFx.homeScore}-${matchedFx.awayScore} ${matchedFx.awayTeam}`
                                  : `${row.club} (${f})`
                              }
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (matchedFx) {
                                  handleFixtureClick(matchedFx);
                                  return;
                                }
                                try {
                                  const qs = new URLSearchParams();
                                  if (row.teamId) qs.set('teamId', String(row.teamId));
                                  qs.set('teamName', row.club);
                                  if (intel?.league?.id) qs.set('leagueId', String(intel.league.id));
                                  const res = await fetch(`/api/football/team-intel?${qs.toString()}`);
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (Array.isArray(data?.recentMatches) && data.recentMatches.length > 0) {
                                      const chrono: TeamFixtureItem[] = [...data.recentMatches.slice(0, 5)].reverse();
                                      const off = (row.form || []).length - chrono.length;
                                      const pick =
                                        (fIdx - off >= 0 && fIdx - off < chrono.length
                                          ? chrono[fIdx - off]
                                          : undefined) ||
                                        chrono.find((m) => m.result === f) ||
                                        chrono[chrono.length - 1];
                                      if (pick) {
                                        setSelectedFixture(pick);
                                        return;
                                      }
                                    }
                                  }
                                } catch {
                                  // fallback to opening team profile
                                }
                                openTeamProfile({
                                  teamId: row.teamId,
                                  teamName: row.club,
                                  teamLogo: row.clubLogo,
                                  leagueId: intel?.league?.id || undefined,
                                  leagueName: intel?.league?.name,
                                });
                              }}
                              className={`w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center transition-transform hover:scale-125 hover:ring-2 hover:ring-white/80 cursor-pointer ${
                                f === 'W'
                                  ? 'bg-[#10b981] text-[#04130b]'
                                  : f === 'D'
                                  ? 'bg-[#475569] text-white'
                                  : 'bg-[#ef4444] text-white'
                              }`}
                            >
                              {f}
                            </button>
                          );
                        })}
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
            {tt.home}
          </button>
          {intel?.team?.country && (
            <>
              <span className="text-neutral-600">›</span>
              <span className="inline-flex items-center gap-1 text-neutral-300">
                <span>🌍</span>
                <span>{intel.team.country}</span>
              </span>
            </>
          )}
          {intel?.league?.name && (
            <>
              <span className="text-neutral-600">›</span>
              <button
                type="button"
                onClick={(e) =>
                  openCompetitionLeague(
                    {
                      leagueId: intel.league?.id || undefined,
                      leagueName: intel.league?.name || undefined,
                    },
                    e
                  )
                }
                className="hover:text-white transition-colors cursor-pointer"
              >
                {intel.league.name}
              </button>
            </>
          )}
          <span className="text-neutral-600">›</span>
          <span className="text-white font-semibold">{teamName}</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl border border-[#1e2d40] bg-[#0b131d] hover:border-[#43f08a]/60 text-xs font-semibold text-[#43f08a] transition-colors cursor-pointer"
        >
          {tt.back}
        </button>
      </div>

      {/* =================================================================== */}
      {/* HERO CLUB PROFILE HEADER BANNER */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#1a2938] bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] p-5 sm:p-7 relative overflow-visible shadow-2xl">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 40%, rgba(34, 197, 94, 0.30) 0%, transparent 65%), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 22px 22px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Club Emblem + Identity + Metadata Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <TeamBadge
              name={teamName}
              logoUrl={teamLogo}
              teamId={teamId}
              clickable={false}
              size="lg"
              className="w-20 h-20 text-lg rounded-2xl shrink-0"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {teamName}
                </h1>
                {intel?.team?.code && (
                  <span className="px-2 py-0.5 rounded-md bg-[#111d2b] border border-[#223549] font-mono text-xs font-bold text-[#8f9cae]">
                    {intel.team.code}
                  </span>
                )}
                {teamStanding && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#0f291e] border border-[#22c55e]/50 font-mono text-xs font-extrabold text-[#43f08a]">
                    #{teamStanding.rank} {intel?.league?.name ? `· ${intel.league.name}` : ''}
                  </span>
                )}
              </div>

              {/* Metadata Pills — strictly showing ONLY fields that exist in API-Football */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                {intel?.league?.name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <LeagueBadge
                      name={intel.league.name}
                      logoUrl={intel.league.logo || undefined}
                      size="xs"
                    />
                    <span className="font-semibold text-white">{intel.league.name}</span>
                    {intel.league.seasonLabel && (
                      <span className="text-[#8f9cae] font-mono">
                        ({intel.league.seasonLabel})
                      </span>
                    )}
                  </span>
                )}

                {intel?.team?.country && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <span>🌍</span>
                    <span>{intel.team.country}</span>
                  </span>
                )}

                {intel?.team?.founded && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a] font-mono">
                    <span>🏛️</span>
                    <span>
                      {tt.founded}{' '}
                      <strong className="text-white">{intel.team.founded}</strong>
                    </span>
                  </span>
                )}

                {venue?.name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <span>🏟️</span>
                    <strong className="text-white">{venue.name}</strong>
                    {venue.city && <span className="text-[#8f9cae]">({venue.city})</span>}
                    {venue.capacity && (
                      <span className="font-mono text-[#43f08a]">
                        · {venue.capacity.toLocaleString('en-US')} {tt.seats}
                      </span>
                    )}
                  </span>
                )}

                {coach?.name && (
                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <span>👔</span>
                    <span className="text-[#8f9cae]">{tt.coach}</span>
                    <strong className="text-white">{coach.name}</strong>
                    {coach.nationality && (
                      <span className="text-[#8f9cae]">({coach.nationality})</span>
                    )}
                  </span>
                )}
              </div>

              {/* Last 5 Matches Interactive Form Dots */}
              {recentMatches.length > 0 && (
                <div className="pt-1 flex items-center gap-2.5">
                  <span className="text-[11px] font-mono text-[#8f9cae] uppercase">
                    {tt.last5Matches}
                  </span>
                  {renderFormPills(recentMatches)}
                </div>
              )}
            </div>
          </div>

          {/* Right: Season Snapshot KPI Strip (ONLY if real stats exist) */}
          {statsSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                  {tt.playedWdl}
                </span>
                <span className="text-lg font-black font-mono text-white mt-0.5 block">
                  {statsSummary.played}
                </span>
                <span className="text-[11px] font-mono text-[#43f08a]">
                  {statsSummary.wins}W · {statsSummary.draws}D · {statsSummary.losses}L
                </span>
              </div>

              <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                  {tt.goalsDiff}
                </span>
                <span className="text-lg font-black font-mono text-white mt-0.5 block">
                  {statsSummary.goalsFor}:{statsSummary.goalsAgainst}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {statsSummary.avgGoalsFor} / {statsSummary.avgGoalsAgainst} {tt.avg}
                </span>
              </div>

              {statsSummary.over25Percent !== null && (
                <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                  <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                    {tt.over25Goals}
                  </span>
                  <span className="text-lg font-black font-mono text-[#43f08a] mt-0.5 block">
                    {statsSummary.over25Percent}%
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {statsSummary.over25Count}/{statsSummary.sampleMatchesCount} {tt.matchesUnit}
                  </span>
                </div>
              )}

              {statsSummary.bttsPercent !== null && (
                <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                  <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                    {tt.bttsRate}
                  </span>
                  <span className="text-lg font-black font-mono text-cyan-400 mt-0.5 block">
                    {statsSummary.bttsPercent}%
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {tt.cleanSheets} {statsSummary.cleanSheets}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* SUB-NAVIGATION TABS (ONLY TABS WITH REAL API DATA ARE RENDERED) */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-[#162232] pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {navTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                subTab === tab.key
                  ? 'bg-[#22c55e] text-[#04130b] shadow-lg shadow-[#22c55e]/20'
                  : 'bg-[#0b111a] border border-[#182434] text-[#8f9cae] hover:text-white hover:border-[#2a3c54]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* LOADING SKELETON */}
      {/* =================================================================== */}
      {loading && (
        <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-10 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#43f08a] border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">
            {tt.loadingClub} {teamName}...
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 1: CLUB OVERVIEW (ONLY RENDERS PANELS WITH REAL API DATA) */}
      {/* =================================================================== */}
      {!loading && subTab === 'overview' && (
        <div className="space-y-5">
          {/* TOP ROW: Recent Results + Upcoming Fixtures + Home/Away or Stadium */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* PANEL A: Recent Finished Matches (if available) */}
            {recentMatches.length > 0 && (
              <div
                className={`${
                  upcomingMatches.length > 0 ? 'lg:col-span-6' : 'lg:col-span-8'
                } rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4`}
              >
                <div className="flex items-center justify-between border-b border-[#162232] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {tt.recentOfficialMatches}
                    </h3>
                    <p className="text-[11px] text-[#8f9cae]">
                      {tt.clickMatchOrTeamHint}
                    </p>
                  </div>
                  {recentMatches.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setSubTab('matches')}
                      className="text-xs text-[#43f08a] hover:underline cursor-pointer"
                    >
                      {tt.allMatchesLink}
                    </button>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  {recentMatches.slice(0, 6).map((m) => (
                    <div
                      key={m.fixtureId}
                      onClick={() => handleFixtureClick(m)}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                            m.result === 'W'
                              ? 'bg-[#10b981] text-[#04130b]'
                              : m.result === 'D'
                              ? 'bg-[#475569] text-white'
                              : 'bg-[#ef4444] text-white'
                          }`}
                        >
                          {m.result}
                        </span>
                        <div className="text-[10px] font-mono text-[#8f9cae] w-16 shrink-0">
                          <div>{m.date}</div>
                          <div className="truncate text-[9px]">{m.league}</div>
                        </div>
                      </div>

                      {/* Teams & Score */}
                      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={(e) =>
                            openTeamProfile(
                              {
                                teamId: m.homeTeamId,
                                teamName: m.homeTeam,
                                teamLogo: m.homeLogo,
                                leagueId: m.leagueId,
                                leagueName: m.league,
                              },
                              e
                            )
                          }
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <span className="truncate max-w-[110px]">{m.homeTeam}</span>
                          <TeamBadge
                            name={m.homeTeam}
                            logoUrl={m.homeLogo}
                            teamId={m.homeTeamId}
                            size="sm"
                          />
                        </button>

                        <span className="px-2 py-0.5 rounded bg-[#121d2b] border border-[#1e2f44] font-mono font-black text-white shrink-0">
                          {m.homeScore} - {m.awayScore}
                        </span>

                        <button
                          type="button"
                          onClick={(e) =>
                            openTeamProfile(
                              {
                                teamId: m.awayTeamId,
                                teamName: m.awayTeam,
                                teamLogo: m.awayLogo,
                                leagueId: m.leagueId,
                                leagueName: m.league,
                              },
                              e
                            )
                          }
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            !m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <TeamBadge
                            name={m.awayTeam}
                            logoUrl={m.awayLogo}
                            teamId={m.awayTeamId}
                            size="sm"
                          />
                          <span className="truncate max-w-[110px]">{m.awayTeam}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL B: Upcoming Scheduled Fixtures (ONLY if API returns upcoming matches) */}
            {upcomingMatches.length > 0 && (
              <div
                className={`${
                  recentMatches.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'
                } rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4`}
              >
                <div className="flex items-center justify-between border-b border-[#162232] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {tt.upcomingScheduled}
                    </h3>
                    <p className="text-[11px] text-[#8f9cae]">
                      {tt.officialScheduleSub}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#0f291e] border border-[#22c55e]/40 text-[10px] font-mono font-bold text-[#43f08a]">
                    {upcomingMatches.length} {tt.matchesUnit}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {upcomingMatches.slice(0, 6).map((m) => (
                    <div
                      key={m.fixtureId}
                      onClick={() => handleFixtureClick(m)}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="text-[10px] font-mono text-[#8f9cae] w-24 shrink-0">
                        <div className="text-neutral-200 font-bold">{m.date}</div>
                        <div className="truncate text-[9px] text-[#43f08a]">
                          {m.round || m.league}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={(e) =>
                            openTeamProfile(
                              {
                                teamId: m.homeTeamId,
                                teamName: m.homeTeam,
                                teamLogo: m.homeLogo,
                                leagueId: m.leagueId,
                                leagueName: m.league,
                              },
                              e
                            )
                          }
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <span className="truncate max-w-[115px]">{m.homeTeam}</span>
                          <TeamBadge
                            name={m.homeTeam}
                            logoUrl={m.homeLogo}
                            teamId={m.homeTeamId}
                            size="sm"
                          />
                        </button>

                        <span className="px-2 py-0.5 rounded bg-[#101c2a] border border-[#1d3046] font-mono font-bold text-amber-400 text-[11px] shrink-0">
                          {m.status === 'LIVE'
                            ? `LIVE ${m.homeScore}-${m.awayScore}`
                            : m.time || 'VS'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) =>
                            openTeamProfile(
                              {
                                teamId: m.awayTeamId,
                                teamName: m.awayTeam,
                                teamLogo: m.awayLogo,
                                leagueId: m.leagueId,
                                leagueName: m.league,
                              },
                              e
                            )
                          }
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            !m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <TeamBadge
                            name={m.awayTeam}
                            logoUrl={m.awayLogo}
                            teamId={m.awayTeamId}
                            size="sm"
                          />
                          <span className="truncate max-w-[115px]">{m.awayTeam}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECOND ROW: League Standings Preview + Home/Away Breakdown & Venue */}
          {(hasStandings || venue || teamStanding) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {hasStandings && (
                <div
                  className={`${
                    venue || teamStanding ? 'lg:col-span-7' : 'lg:col-span-12'
                  } rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4`}
                >
                  <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {intel?.league?.name && (
                        <LeagueBadge
                          name={intel.league.name}
                          logoUrl={intel.league.logo || undefined}
                          size="sm"
                        />
                      )}
                      <h3 className="text-sm font-extrabold text-white">
                        {tt.leagueStandingsTitle} — {intel?.league?.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSubTab('standings')}
                      className="text-xs font-bold text-[#43f08a] hover:underline cursor-pointer"
                    >
                      {tt.viewFullTable}
                    </button>
                  </div>

                  {renderStandingsTable(true)}
                </div>
              )}

              {/* Right Column: Official Home vs Away Split + Stadium Card */}
              {(teamStanding || venue) && (
                <div
                  className={`${
                    hasStandings ? 'lg:col-span-5' : 'lg:col-span-12'
                  } flex flex-col justify-between gap-5`}
                >
                  {/* Home vs Away Split from Official Standings */}
                  {teamStanding?.home && teamStanding?.away && (
                    <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl">
                      <h3 className="text-sm font-extrabold text-white border-b border-[#162232] pb-2.5">
                        {tt.homeAwayTitle}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#080e16] border border-[#162232] space-y-1.5">
                          <div className="text-[10px] font-mono text-[#43f08a] uppercase font-bold">
                            🏠 {tt.homeRecord}
                          </div>
                          <div className="text-base font-black font-mono text-white">
                            {teamStanding.home.w}W - {teamStanding.home.d}D -{' '}
                            {teamStanding.home.l}L
                          </div>
                          <div className="text-[11px] font-mono text-[#8f9cae]">
                            {tt.goalsLabel}{' '}
                            <strong className="text-white">
                              {teamStanding.home.gf}:{teamStanding.home.ga}
                            </strong>{' '}
                            ({teamStanding.home.p} {tt.matchesUnit})
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#080e16] border border-[#162232] space-y-1.5">
                          <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                            ✈️ {tt.awayRecord}
                          </div>
                          <div className="text-base font-black font-mono text-white">
                            {teamStanding.away.w}W - {teamStanding.away.d}D -{' '}
                            {teamStanding.away.l}L
                          </div>
                          <div className="text-[11px] font-mono text-[#8f9cae]">
                            {tt.goalsLabel}{' '}
                            <strong className="text-white">
                              {teamStanding.away.gf}:{teamStanding.away.ga}
                            </strong>{' '}
                            ({teamStanding.away.p} {tt.matchesUnit})
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Official Stadium & Venue Card (ONLY if API-Football provides venue) */}
                  {venue && (
                    <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3 shadow-xl flex-1">
                      <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
                        <h3 className="text-sm font-extrabold text-white">
                          🏟️ {tt.clubStadium}
                        </h3>
                        {venue.surface && (
                          <span className="px-2 py-0.5 rounded bg-[#0f291e] border border-[#22c55e]/40 text-[10px] font-mono text-[#43f08a] uppercase">
                            {venue.surface}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {venue.image && (
                          <img
                            src={venue.image}
                            alt={venue.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-full sm:w-32 h-24 rounded-xl object-cover border border-[#1e2d40] shrink-0"
                          />
                        )}
                        <div className="space-y-1 text-xs">
                          <div className="text-base font-extrabold text-white">
                            {venue.name}
                          </div>
                          {venue.city && (
                            <div className="text-[#8f9cae]">
                              📍 {venue.city}
                              {venue.address ? ` · ${venue.address}` : ''}
                            </div>
                          )}
                          {venue.capacity && (
                            <div className="text-neutral-300 font-mono pt-1">
                              👥 {tt.capacityLabel}{' '}
                              <strong className="text-[#43f08a]">
                                {venue.capacity.toLocaleString('en-US')}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* THIRD ROW: Official Squad Preview (ONLY if API returns squad players) */}
          {hasSquad && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    👕 {tt.officialClubSquad} ({squad.length})
                  </h3>
                  <p className="text-[11px] text-[#8f9cae]">
                    {tt.registeredPlayersSub}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubTab('squad')}
                  className="text-xs font-bold text-[#43f08a] hover:underline cursor-pointer"
                >
                  {tt.viewAllPlayers}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {squad.slice(0, 12).map((player) => (
                  <div
                    key={player.id || player.name}
                    onClick={(e) =>
                      openPlayerProfile(
                        {
                          playerId: player.id || undefined,
                          playerName: player.name,
                          playerPhoto: player.photo || undefined,
                          teamId: teamId || undefined,
                          teamName,
                          teamLogo: teamLogo || undefined,
                          leagueId: intel?.league?.id || undefined,
                          leagueName: intel?.league?.name || undefined,
                          position: player.position,
                          number: player.number,
                        },
                        e
                      )
                    }
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 hover:bg-[#0c1521] transition-all cursor-pointer group"
                  >
                    <img
                      src={player.photo}
                      alt={player.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-10 h-10 rounded-full object-cover bg-[#111c2a] border border-[#22354a] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-white group-hover:text-[#43f08a] transition-colors truncate">
                          {player.name}
                        </span>
                        {player.number && (
                          <span className="px-1.5 py-0.5 rounded bg-[#111d2c] border border-[#21344a] font-mono text-[10px] font-bold text-[#43f08a]">
                            #{player.number}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8f9cae] flex items-center gap-2 mt-0.5">
                        <span>{positionLabel(player.position)}</span>
                        {player.age && (
                          <>
                            <span>·</span>
                            <span className="font-mono">
                              {player.age} {tt.yearsShort}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: FULL LEAGUE STANDINGS WITH ALL / HOME / AWAY FILTER */}
      {/* =================================================================== */}
      {!loading && subTab === 'standings' && hasStandings && (
        <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              {intel?.league?.name && (
                <LeagueBadge
                  name={intel.league.name}
                  logoUrl={intel.league.logo || undefined}
                  size="md"
                />
              )}
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {intel?.league?.name} — {tt.fullStandingsTitle}
                </h3>
                <p className="text-xs text-[#8f9cae]">
                  {tt.clickAnyTeamSub}
                </p>
              </div>
            </div>

            {/* All / Home / Away Switcher */}
            <div className="flex items-center gap-1.5 bg-[#080e16] p-1 rounded-xl border border-[#162232]">
              {[
                { key: 'all' as const, label: tt.filterOverall },
                { key: 'home' as const, label: tt.filterHome },
                { key: 'away' as const, label: tt.filterAway },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setStandingsMode(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    standingsMode === m.key
                      ? 'bg-[#22c55e] text-[#04130b]'
                      : 'text-[#8f9cae] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {renderStandingsTable(false)}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: FULL SQUAD & PLAYERS BY POSITION */}
      {/* =================================================================== */}
      {!loading && subTab === 'squad' && hasSquad && (
        <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#162232] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">
                👕 {teamName} — {tt.officialClubSquad} ({squad.length})
              </h3>
              {coach?.name && (
                <p className="text-xs text-[#8f9cae] mt-0.5">
                  {tt.headCoachLabel}{' '}
                  <strong className="text-white">{coach.name}</strong>
                  {coach.nationality ? ` (${coach.nationality})` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder={tt.searchPlayerPlaceholder}
                className="px-3 py-1.5 rounded-xl bg-[#080e16] border border-[#1a293a] text-xs text-white placeholder-[#8f9cae] focus:outline-none focus:border-[#43f08a]"
              />

              {[
                { key: 'ALL', label: tt.filterAll },
                { key: 'Goalkeeper', label: tt.filterGK },
                { key: 'Defender', label: tt.filterDEF },
                { key: 'Midfielder', label: tt.filterMID },
                { key: 'Attacker', label: tt.filterATT },
              ].map((pf) => (
                <button
                  key={pf.key}
                  type="button"
                  onClick={() => setPosFilter(pf.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    posFilter === pf.key
                      ? 'bg-[#22c55e] text-[#04130b]'
                      : 'bg-[#080e16] border border-[#162232] text-[#8f9cae] hover:text-white'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSquad.map((player) => (
              <div
                key={player.id || player.name}
                onClick={(e) =>
                  openPlayerProfile(
                    {
                      playerId: player.id || undefined,
                      playerName: player.name,
                      playerPhoto: player.photo || undefined,
                      teamId: teamId || undefined,
                      teamName,
                      teamLogo: teamLogo || undefined,
                      leagueId: intel?.league?.id || undefined,
                      leagueName: intel?.league?.name || undefined,
                      position: player.position,
                      number: player.number,
                    },
                    e
                  )
                }
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 hover:bg-[#0c1521] transition-all cursor-pointer group"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-12 h-12 rounded-full object-cover bg-[#111c2a] border border-[#22354a] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-extrabold text-white group-hover:text-[#43f08a] transition-colors truncate">
                      {player.name}
                    </span>
                    {player.number && (
                      <span className="px-2 py-0.5 rounded-md bg-[#111d2c] border border-[#21344a] font-mono text-xs font-black text-[#43f08a]">
                        #{player.number}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8f9cae] flex items-center gap-2 mt-1">
                    <span className="text-neutral-300 font-semibold">
                      {positionLabel(player.position)}
                    </span>
                    {player.age && (
                      <>
                        <span>·</span>
                        <span className="font-mono">
                          {player.age} {tt.yearsOld}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: ALL RECENT & UPCOMING MATCHES */}
      {/* =================================================================== */}
      {!loading && subTab === 'matches' && hasMatches && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recentMatches.length > 0 && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl">
              <h3 className="text-sm font-extrabold text-white border-b border-[#162232] pb-2.5">
                {tt.recentFinishedTitle} ({recentMatches.length})
              </h3>
              <div className="space-y-2">
                {recentMatches.map((m) => (
                  <div
                    key={m.fixtureId}
                    onClick={() => handleFixtureClick(m)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                          m.result === 'W'
                            ? 'bg-[#10b981] text-[#04130b]'
                            : m.result === 'D'
                            ? 'bg-[#475569] text-white'
                            : 'bg-[#ef4444] text-white'
                        }`}
                      >
                        {m.result}
                      </span>
                      <div className="text-[10px] font-mono text-[#8f9cae]">
                        <div>{m.date}</div>
                        <div className="text-[9px]">{m.league}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: m.homeTeamId,
                              teamName: m.homeTeam,
                              teamLogo: m.homeLogo,
                              leagueId: m.leagueId,
                              leagueName: m.league,
                            },
                            e
                          )
                        }
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <span>{m.homeTeam}</span>
                        <TeamBadge
                          name={m.homeTeam}
                          logoUrl={m.homeLogo}
                          teamId={m.homeTeamId}
                          size="sm"
                        />
                      </button>

                      <span className="px-2 py-0.5 rounded bg-[#121d2b] font-mono font-black text-white">
                        {m.homeScore} - {m.awayScore}
                      </span>

                      <button
                        type="button"
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: m.awayTeamId,
                              teamName: m.awayTeam,
                              teamLogo: m.awayLogo,
                              leagueId: m.leagueId,
                              leagueName: m.league,
                            },
                            e
                          )
                        }
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <TeamBadge
                          name={m.awayTeam}
                          logoUrl={m.awayLogo}
                          teamId={m.awayTeamId}
                          size="sm"
                        />
                        <span>{m.awayTeam}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingMatches.length > 0 && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl">
              <h3 className="text-sm font-extrabold text-white border-b border-[#162232] pb-2.5">
                {tt.upcomingFixturesTitle} ({upcomingMatches.length})
              </h3>
              <div className="space-y-2">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.fixtureId}
                    onClick={() => handleFixtureClick(m)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="text-[10px] font-mono text-[#8f9cae]">
                      <div className="text-white font-bold">{m.date}</div>
                      <div className="text-[9px] text-[#43f08a]">{m.round || m.league}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: m.homeTeamId,
                              teamName: m.homeTeam,
                              teamLogo: m.homeLogo,
                              leagueId: m.leagueId,
                              leagueName: m.league,
                            },
                            e
                          )
                        }
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <span>{m.homeTeam}</span>
                        <TeamBadge
                          name={m.homeTeam}
                          logoUrl={m.homeLogo}
                          teamId={m.homeTeamId}
                          size="sm"
                        />
                      </button>

                      <span className="px-2 py-0.5 rounded bg-[#101c2a] font-mono font-bold text-amber-400">
                        {m.time || 'VS'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) =>
                          openTeamProfile(
                            {
                              teamId: m.awayTeamId,
                              teamName: m.awayTeam,
                              teamLogo: m.awayLogo,
                              leagueId: m.leagueId,
                              leagueName: m.league,
                            },
                            e
                          )
                        }
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <TeamBadge
                          name={m.awayTeam}
                          logoUrl={m.awayLogo}
                          teamId={m.awayTeamId}
                          size="sm"
                        />
                        <span>{m.awayTeam}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL WINDOW: MATCH DETAILS WHEN CLICKING A FORM DOT OR PAST MATCH */}
      {/* =================================================================== */}
      {selectedFixture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedFixture(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#1f3347] bg-[#081018] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#162232] bg-[#0b1520]">
              <div className="flex items-center gap-2 text-xs text-neutral-200 font-semibold">
                <LeagueBadge
                  name={fixtureModalIntel?.league || selectedFixture.league}
                  logoUrl={selectedFixture.leagueLogo}
                  size="xs"
                />
                <span>{fixtureModalIntel?.league || selectedFixture.league}</span>
                <span className="text-neutral-500">·</span>
                <span className="font-mono text-[#43f08a]">
                  {fixtureModalIntel?.date || selectedFixture.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFixture(null)}
                className="w-7 h-7 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-neutral-300 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] border-b border-[#162232]">
              <div className="grid grid-cols-11 gap-3 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <TeamBadge
                    name={selectedFixture.homeTeam}
                    logoUrl={fixtureModalIntel?.homeLogo || selectedFixture.homeLogo}
                    teamId={selectedFixture.homeTeamId}
                    size="md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextTarget = {
                        teamId: selectedFixture.homeTeamId,
                        teamName: selectedFixture.homeTeam,
                        teamLogo: selectedFixture.homeLogo,
                      };
                      setSelectedFixture(null);
                      openTeamProfile(nextTarget);
                    }}
                    className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] text-left leading-tight cursor-pointer"
                  >
                    {selectedFixture.homeTeam}
                  </button>
                </div>

                <div className="col-span-3 text-center">
                  <div className="inline-block rounded-xl border border-[#1f3144] bg-[#060b12]/90 px-4 py-2">
                    <div className="text-[10px] font-mono font-bold text-[#43f08a] uppercase">
                      {fixtureModalIntel?.halftimeScore ||
                        (selectedFixture.status === 'FINISHED'
                          ? tt.finalScore
                          : selectedFixture.time)}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {selectedFixture.status === 'SCHEDULED'
                        ? 'VS'
                        : `${fixtureModalIntel?.homeScore ?? selectedFixture.homeScore} - ${
                            fixtureModalIntel?.awayScore ?? selectedFixture.awayScore
                          }`}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-end gap-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      const nextTarget = {
                        teamId: selectedFixture.awayTeamId,
                        teamName: selectedFixture.awayTeam,
                        teamLogo: selectedFixture.awayLogo,
                      };
                      setSelectedFixture(null);
                      openTeamProfile(nextTarget);
                    }}
                    className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] text-right leading-tight cursor-pointer"
                  >
                    {selectedFixture.awayTeam}
                  </button>
                  <TeamBadge
                    name={selectedFixture.awayTeam}
                    logoUrl={fixtureModalIntel?.awayLogo || selectedFixture.awayLogo}
                    teamId={selectedFixture.awayTeamId}
                    size="md"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
              {fixtureModalLoading ? (
                <div className="py-8 text-center text-xs text-[#8f9cae] font-mono">
                  {tt.loadingTimeline}
                </div>
              ) : (
                <>
                  {fixtureModalIntel?.events && fixtureModalIntel.events.length > 0 ? (
                    <div className="space-y-1.5">
                      {fixtureModalIntel.events.map((ev, idx) => (
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
                      {selectedFixture.homeTeam} {selectedFixture.homeScore} -{' '}
                      {selectedFixture.awayScore} {selectedFixture.awayTeam}
                    </div>
                  )}

                  {fixtureModalIntel?.hasRealStats && fixtureModalIntel.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs pt-2 border-t border-[#162232]">
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          {tt.possession}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.possessionHome}% -{' '}
                          {fixtureModalIntel.stats.possessionAway}%
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          {tt.shotsOnTarget}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.shotsHome} (
                          {fixtureModalIntel.stats.shotsOnTargetHome}) -{' '}
                          {fixtureModalIntel.stats.shotsAway} (
                          {fixtureModalIntel.stats.shotsOnTargetAway})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          {tt.corners}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.cornersHome} -{' '}
                          {fixtureModalIntel.stats.cornersAway}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          🟨 {tt.yellowCards}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.yellowCardsHome} -{' '}
                          {fixtureModalIntel.stats.yellowCardsAway}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
