import React, { useState } from 'react';
import { ActiveTab, Language, Match } from '../types';
import { TeamBadge } from './TeamBadge';

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
  club: string;
  goals: number;
  initials: string;
  avatarGradient: string;
}

interface UpcomingFixtureRow {
  id: string;
  dayLabel: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
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
  glance: {
    matchesPlayed: string;
    goalsScored: string;
    goalsPerMatch: string;
    cleanSheets: string;
    yellowCards: string;
    redCards: string;
    avgPossession: string;
  };
}

const LEAGUES_DATABASE: Record<string, LeagueHubData> = {
  'premier-league': {
    id: 'premier-league',
    apiLeagueId: 39,
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    season: '2024/25',
    region: 'europe',
    type: 'domestic',
    standings: [
      { rank: 1, club: 'Manchester City', p: 37, w: 27, d: 7, l: 3, gf: 93, ga: 33, gd: '+60', pts: 88, form: ['W', 'W', 'D', 'W', 'W'] },
      { rank: 2, club: 'Arsenal', p: 37, w: 25, d: 7, l: 5, gf: 72, ga: 28, gd: '+44', pts: 82, form: ['W', 'W', 'W', 'D', 'L'] },
      { rank: 3, club: 'Liverpool', p: 37, w: 24, d: 9, l: 4, gf: 85, ga: 41, gd: '+44', pts: 81, form: ['W', 'D', 'W', 'W', 'W'] },
      { rank: 4, club: 'Aston Villa', p: 37, w: 20, d: 8, l: 9, gf: 76, ga: 56, gd: '+20', pts: 68, form: ['W', 'W', 'L', 'D', 'W'] },
      { rank: 5, club: 'Tottenham Hotspur', p: 37, w: 19, d: 6, l: 12, gf: 71, ga: 61, gd: '+10', pts: 63, form: ['W', 'L', 'D', 'W', 'W'] },
      { rank: 6, club: 'Chelsea', p: 37, w: 17, d: 9, l: 11, gf: 75, ga: 62, gd: '+13', pts: 60, form: ['W', 'W', 'W', 'W', 'D'] },
      { rank: 7, club: 'Newcastle United', p: 37, w: 17, d: 6, l: 14, gf: 81, ga: 60, gd: '+21', pts: 57, form: ['W', 'W', 'D', 'W', 'L'] },
      { rank: 8, club: 'Manchester United', p: 37, w: 17, d: 6, l: 14, gf: 55, ga: 58, gd: '-3', pts: 57, form: ['W', 'D', 'L', 'W', 'D'] },
    ],
    topScorers: [
      { rank: 1, name: 'Erling Haaland', club: 'Manchester City', goals: 27, initials: 'EH', avatarGradient: 'from-sky-500 to-blue-900' },
      { rank: 2, name: 'Cole Palmer', club: 'Chelsea', goals: 21, initials: 'CP', avatarGradient: 'from-blue-600 to-indigo-950' },
      { rank: 3, name: 'Mohamed Salah', club: 'Liverpool', goals: 18, initials: 'MS', avatarGradient: 'from-red-600 to-rose-950' },
      { rank: 4, name: 'Ollie Watkins', club: 'Aston Villa', goals: 16, initials: 'OW', avatarGradient: 'from-fuchsia-800 to-slate-900' },
      { rank: 5, name: 'Heung-min Son', club: 'Tottenham Hotspur', goals: 15, initials: 'HS', avatarGradient: 'from-slate-600 to-slate-950' },
    ],
    upcomingFixtures: [
      { id: 'fix-epl-1', dayLabel: 'Tomorrow', homeTeam: 'Man City', awayTeam: 'Arsenal', time: '17:30' },
      { id: 'fix-epl-2', dayLabel: 'Sun, May 19', homeTeam: 'Liverpool', awayTeam: 'Aston Villa', time: '16:00' },
      { id: 'match-arsenal-chelsea', dayLabel: 'Sun, May 19', homeTeam: 'Tottenham', awayTeam: 'Chelsea', time: '18:30' },
      { id: 'match-newcastle-manutd', dayLabel: 'Mon, May 20', homeTeam: 'Newcastle United', awayTeam: 'Manchester United', time: '20:00' },
    ],
    glance: {
      matchesPlayed: '370',
      goalsScored: '1,048',
      goalsPerMatch: '2.83',
      cleanSheets: '118',
      yellowCards: '1,405',
      redCards: '52',
      avgPossession: '54.1%',
    },
  },
  'la-liga': {
    id: 'la-liga',
    apiLeagueId: 140,
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    season: '2024/25',
    region: 'europe',
    type: 'domestic',
    standings: [
      { rank: 1, club: 'Real Madrid', p: 36, w: 29, d: 6, l: 1, gf: 83, ga: 22, gd: '+61', pts: 93, form: ['W', 'W', 'W', 'W', 'W'] },
      { rank: 2, club: 'Barcelona', p: 36, w: 24, d: 7, l: 5, gf: 74, ga: 43, gd: '+31', pts: 79, form: ['W', 'W', 'L', 'W', 'W'] },
      { rank: 3, club: 'Girona', p: 36, w: 23, d: 6, l: 7, gf: 75, ga: 45, gd: '+30', pts: 75, form: ['W', 'D', 'L', 'W', 'W'] },
      { rank: 4, club: 'Atlético Madrid', p: 36, w: 23, d: 4, l: 9, gf: 68, ga: 39, gd: '+29', pts: 73, form: ['W', 'W', 'W', 'W', 'L'] },
      { rank: 5, club: 'Athletic Club', p: 36, w: 17, d: 11, l: 8, gf: 57, ga: 36, gd: '+21', pts: 62, form: ['L', 'D', 'W', 'L', 'D'] },
      { rank: 6, club: 'Villarreal', p: 36, w: 14, d: 9, l: 13, gf: 60, ga: 60, gd: '0', pts: 51, form: ['W', 'D', 'L', 'W', 'D'] },
    ],
    topScorers: [
      { rank: 1, name: 'Jude Bellingham', club: 'Real Madrid', goals: 23, initials: 'JB', avatarGradient: 'from-amber-500 to-slate-900' },
      { rank: 2, name: 'Robert Lewandowski', club: 'Barcelona', goals: 20, initials: 'RL', avatarGradient: 'from-blue-700 to-rose-900' },
      { rank: 3, name: 'Alexander Sørloth', club: 'Villarreal', goals: 19, initials: 'AS', avatarGradient: 'from-yellow-500 to-blue-950' },
      { rank: 4, name: 'Antoine Griezmann', club: 'Atlético Madrid', goals: 16, initials: 'AG', avatarGradient: 'from-red-600 to-indigo-950' },
      { rank: 5, name: 'Vinícius Júnior', club: 'Real Madrid', goals: 15, initials: 'VJ', avatarGradient: 'from-amber-400 to-slate-900' },
    ],
    upcomingFixtures: [
      { id: 'match-barca-real', dayLabel: 'Tomorrow', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', time: '21:00' },
      { id: 'match-realmadrid-villarreal', dayLabel: 'Sun, May 19', homeTeam: 'Real Madrid', awayTeam: 'Villarreal', time: '20:00' },
      { id: 'fix-esp-3', dayLabel: 'Sun, May 19', homeTeam: 'Atlético Madrid', awayTeam: 'Osasuna', time: '18:30' },
      { id: 'fix-esp-4', dayLabel: 'Mon, May 20', homeTeam: 'Athletic Club', awayTeam: 'Sevilla', time: '21:00' },
    ],
    glance: {
      matchesPlayed: '360',
      goalsScored: '942',
      goalsPerMatch: '2.62',
      cleanSheets: '134',
      yellowCards: '1,620',
      redCards: '68',
      avgPossession: '53.4%',
    },
  },
  'serie-a': {
    id: 'serie-a',
    apiLeagueId: 135,
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    season: '2024/25',
    region: 'europe',
    type: 'domestic',
    standings: [
      { rank: 1, club: 'Inter Milan', p: 36, w: 29, d: 5, l: 2, gf: 86, ga: 19, gd: '+67', pts: 92, form: ['W', 'W', 'L', 'W', 'D'] },
      { rank: 2, club: 'AC Milan', p: 36, w: 22, d: 8, l: 6, gf: 72, ga: 43, gd: '+29', pts: 74, form: ['W', 'D', 'L', 'W', 'W'] },
      { rank: 3, club: 'Bologna', p: 36, w: 18, d: 13, l: 5, gf: 51, ga: 27, gd: '+24', pts: 67, form: ['W', 'D', 'D', 'W', 'D'] },
      { rank: 4, club: 'Juventus', p: 36, w: 18, d: 13, l: 5, gf: 49, ga: 28, gd: '+21', pts: 67, form: ['D', 'D', 'D', 'D', 'D'] },
      { rank: 5, club: 'Atalanta', p: 35, w: 19, d: 6, l: 10, gf: 65, ga: 39, gd: '+26', pts: 63, form: ['W', 'W', 'W', 'W', 'D'] },
      { rank: 6, club: 'AS Roma', p: 36, w: 17, d: 9, l: 10, gf: 63, ga: 44, gd: '+19', pts: 60, form: ['L', 'D', 'D', 'W', 'L'] },
    ],
    topScorers: [
      { rank: 1, name: 'Lautaro Martínez', club: 'Inter Milan', goals: 24, initials: 'LM', avatarGradient: 'from-blue-700 to-slate-950' },
      { rank: 2, name: 'Dušan Vlahović', club: 'Juventus', goals: 16, initials: 'DV', avatarGradient: 'from-neutral-600 to-neutral-950' },
      { rank: 3, name: 'Olivier Giroud', club: 'AC Milan', goals: 14, initials: 'OG', avatarGradient: 'from-red-700 to-neutral-950' },
      { rank: 4, name: 'Paulo Dybala', club: 'AS Roma', goals: 13, initials: 'PD', avatarGradient: 'from-rose-800 to-amber-900' },
      { rank: 5, name: 'Marcus Thuram', club: 'Inter Milan', goals: 13, initials: 'MT', avatarGradient: 'from-sky-700 to-slate-950' },
    ],
    upcomingFixtures: [
      { id: 'match-milan-juve', dayLabel: 'Tomorrow', homeTeam: 'AC Milan', awayTeam: 'Juventus', time: '18:45' },
      { id: 'match-milan-atalanta', dayLabel: 'Sun, May 19', homeTeam: 'AC Milan', awayTeam: 'Atalanta', time: '20:45' },
      { id: 'fix-ita-3', dayLabel: 'Sun, May 19', homeTeam: 'Inter Milan', awayTeam: 'Lazio', time: '19:00' },
      { id: 'fix-ita-4', dayLabel: 'Mon, May 20', homeTeam: 'AS Roma', awayTeam: 'Genoa', time: '20:45' },
    ],
    glance: {
      matchesPlayed: '360',
      goalsScored: '912',
      goalsPerMatch: '2.53',
      cleanSheets: '142',
      yellowCards: '1,488',
      redCards: '49',
      avgPossession: '52.8%',
    },
  },
  bundesliga: {
    id: 'bundesliga',
    apiLeagueId: 78,
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    season: '2024/25',
    region: 'europe',
    type: 'domestic',
    standings: [
      { rank: 1, club: 'Bayer Leverkusen', p: 33, w: 27, d: 6, l: 0, gf: 87, ga: 23, gd: '+64', pts: 87, form: ['W', 'W', 'D', 'D', 'W'] },
      { rank: 2, club: 'Bayern Munich', p: 33, w: 23, d: 3, l: 7, gf: 92, ga: 41, gd: '+51', pts: 72, form: ['W', 'L', 'W', 'W', 'W'] },
      { rank: 3, club: 'VfB Stuttgart', p: 33, w: 22, d: 4, l: 7, gf: 74, ga: 39, gd: '+35', pts: 70, form: ['W', 'W', 'D', 'L', 'W'] },
      { rank: 4, club: 'RB Leipzig', p: 33, w: 19, d: 7, l: 7, gf: 75, ga: 37, gd: '+38', pts: 64, form: ['D', 'D', 'W', 'W', 'W'] },
      { rank: 5, club: 'Dortmund', p: 33, w: 17, d: 9, l: 7, gf: 64, ga: 43, gd: '+21', pts: 60, form: ['L', 'W', 'L', 'D', 'W'] },
    ],
    topScorers: [
      { rank: 1, name: 'Harry Kane', club: 'Bayern Munich', goals: 36, initials: 'HK', avatarGradient: 'from-red-600 to-rose-950' },
      { rank: 2, name: 'Serhou Guirassy', club: 'VfB Stuttgart', goals: 26, initials: 'SG', avatarGradient: 'from-red-500 to-neutral-900' },
      { rank: 3, name: 'Loïs Openda', club: 'RB Leipzig', goals: 24, initials: 'LO', avatarGradient: 'from-rose-600 to-blue-950' },
      { rank: 4, name: 'Deniz Undav', club: 'VfB Stuttgart', goals: 18, initials: 'DU', avatarGradient: 'from-red-700 to-slate-900' },
      { rank: 5, name: 'Florian Wirtz', club: 'Bayer Leverkusen', goals: 11, initials: 'FW', avatarGradient: 'from-red-600 to-black' },
    ],
    upcomingFixtures: [
      { id: 'match-bayern-dortmund', dayLabel: 'Tomorrow', homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', time: '20:30' },
      { id: 'match-leverkusen-roma', dayLabel: 'Sun, May 19', homeTeam: 'Bayer Leverkusen', awayTeam: 'Augsburg', time: '16:30' },
      { id: 'fix-ger-3', dayLabel: 'Sun, May 19', homeTeam: 'Stuttgart', awayTeam: 'Gladbach', time: '16:30' },
      { id: 'fix-ger-4', dayLabel: 'Sun, May 19', homeTeam: 'RB Leipzig', awayTeam: 'Frankfurt', time: '16:30' },
    ],
    glance: {
      matchesPlayed: '297',
      goalsScored: '958',
      goalsPerMatch: '3.22',
      cleanSheets: '84',
      yellowCards: '1,180',
      redCards: '41',
      avgPossession: '54.9%',
    },
  },
  ucl: {
    id: 'ucl',
    apiLeagueId: 2,
    name: 'UEFA Champions League',
    country: 'Europe',
    flag: '🇪🇺',
    season: '2024/25',
    region: 'europe',
    type: 'continental',
    standings: [
      { rank: 1, club: 'Real Madrid', p: 12, w: 9, d: 3, l: 0, gf: 26, ga: 14, gd: '+12', pts: 30, form: ['W', 'D', 'W', 'D', 'W'] },
      { rank: 2, club: 'Dortmund', p: 12, w: 7, d: 3, l: 2, gf: 17, ga: 9, gd: '+8', pts: 24, form: ['W', 'W', 'W', 'L', 'W'] },
      { rank: 3, club: 'Bayern Munich', p: 12, w: 7, d: 3, l: 2, gf: 21, ga: 13, gd: '+8', pts: 24, form: ['L', 'D', 'W', 'D', 'W'] },
      { rank: 4, club: 'Paris Saint-Germain', p: 12, w: 5, d: 2, l: 5, gf: 19, ga: 15, gd: '+4', pts: 17, form: ['L', 'L', 'W', 'L', 'W'] },
      { rank: 5, club: 'Manchester City', p: 10, w: 8, d: 2, l: 0, gf: 28, ga: 13, gd: '+15', pts: 26, form: ['D', 'D', 'W', 'W', 'W'] },
    ],
    topScorers: [
      { rank: 1, name: 'Harry Kane', club: 'Bayern Munich', goals: 8, initials: 'HK', avatarGradient: 'from-red-600 to-slate-900' },
      { rank: 2, name: 'Kylian Mbappé', club: 'Paris Saint-Germain', goals: 8, initials: 'KM', avatarGradient: 'from-blue-700 to-red-900' },
      { rank: 3, name: 'Erling Haaland', club: 'Manchester City', goals: 6, initials: 'EH', avatarGradient: 'from-sky-500 to-blue-900' },
      { rank: 4, name: 'Antoine Griezmann', club: 'Atlético Madrid', goals: 6, initials: 'AG', avatarGradient: 'from-red-600 to-indigo-950' },
      { rank: 5, name: 'Vinícius Júnior', club: 'Real Madrid', goals: 5, initials: 'VJ', avatarGradient: 'from-amber-500 to-slate-900' },
    ],
    upcomingFixtures: [
      { id: 'match-mancity-youngboys', dayLabel: 'Tomorrow', homeTeam: 'Man City', awayTeam: 'Young Boys', time: '21:00' },
      { id: 'match-barca-real', dayLabel: 'Sat, Jun 1', homeTeam: 'Dortmund', awayTeam: 'Real Madrid', time: '21:00' },
      { id: 'match-leverkusen-roma', dayLabel: 'Wed, May 22', homeTeam: 'Bayer Leverkusen', awayTeam: 'AS Roma', time: '21:00' },
      { id: 'match-arsenal-chelsea', dayLabel: 'Tue, May 28', homeTeam: 'Arsenal', awayTeam: 'Bayern Munich', time: '21:00' },
    ],
    glance: {
      matchesPlayed: '124',
      goalsScored: '372',
      goalsPerMatch: '3.00',
      cleanSheets: '46',
      yellowCards: '492',
      redCards: '18',
      avgPossession: '55.6%',
    },
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
  const [seasonFilter, setSeasonFilter] = useState<string>('2024/25');
  const [hubSubTab, setHubSubTab] = useState<
    'standings' | 'fixtures' | 'results' | 'form' | 'stats' | 'insights'
  >('standings');
  const [showFullTable, setShowFullTable] = useState<boolean>(false);
  const [activeRegion, setActiveRegion] = useState<
    'europe' | 'south_america' | 'north_america' | 'asia' | 'africa'
  >('europe');

  const activeLeague = LEAGUES_DATABASE[selectedLeagueKey] || LEAGUES_DATABASE['premier-league'];

  // Featured Leagues Carousel Items matching the screenshot 1:1
  const featuredLeaguesList = [
    {
      key: 'premier-league',
      name: 'Premier League',
      country: 'England',
      badgeBg: 'from-[#3d0c52] to-[#20032c]',
      badgeBorder: 'border-purple-400/40',
      icon: '🦁',
    },
    {
      key: 'la-liga',
      name: 'La Liga',
      country: 'Spain',
      badgeBg: 'from-[#7f1d1d] to-[#310a0a]',
      badgeBorder: 'border-red-500/40',
      icon: '⚡',
    },
    {
      key: 'serie-a',
      name: 'Serie A',
      country: 'Italy',
      badgeBg: 'from-[#0369a1] to-[#082f49]',
      badgeBorder: 'border-sky-400/40',
      icon: 'A',
    },
    {
      key: 'bundesliga',
      name: 'Bundesliga',
      country: 'Germany',
      badgeBg: 'from-[#b91c1c] to-[#450a0a]',
      badgeBorder: 'border-red-500/40',
      icon: '⚽',
    },
    {
      key: 'ucl',
      name: 'UEFA Champions League',
      country: 'Europe',
      badgeBg: 'from-[#1e3a8a] to-[#0f172a]',
      badgeBorder: 'border-blue-400/40',
      icon: '★',
    },
    {
      key: 'premier-league',
      name: 'Copa Libertadores',
      country: 'South America',
      badgeBg: 'from-[#78350f] to-[#271003]',
      badgeBorder: 'border-amber-400/40',
      icon: '🏆',
    },
    {
      key: 'la-liga',
      name: 'Ligue 1',
      country: 'France',
      badgeBg: 'from-[#1e293b] to-[#090d16]',
      badgeBorder: 'border-emerald-400/40',
      icon: 'L1',
    },
    {
      key: 'serie-a',
      name: 'Eredivisie',
      country: 'Netherlands',
      badgeBg: 'from-[#1e1b4b] to-[#090a1a]',
      badgeBorder: 'border-indigo-400/40',
      icon: 'e',
    },
  ];

  // Popular Leagues by Region cards matching the screenshot 1:1
  const regionalLeagues = [
    {
      key: 'premier-league',
      name: 'Primeira Liga',
      country: 'Portugal',
      season: '2024/25',
      region: 'europe',
      crestBg: 'from-emerald-800 to-red-900',
      crestText: 'LP',
    },
    {
      key: 'la-liga',
      name: 'Ligue 1',
      country: 'France',
      season: '2024/25',
      region: 'europe',
      crestBg: 'from-slate-800 to-slate-950',
      crestText: 'L1',
    },
    {
      key: 'serie-a',
      name: 'Eredivisie',
      country: 'Netherlands',
      season: '2024/25',
      region: 'europe',
      crestBg: 'from-blue-900 to-indigo-950',
      crestText: 'E',
    },
    {
      key: 'bundesliga',
      name: 'Primeira Division',
      country: 'Argentina',
      season: '2024',
      region: 'south_america',
      crestBg: 'from-sky-600 to-amber-700',
      crestText: 'AFA',
    },
    {
      key: 'ucl',
      name: 'Brasileirão Série A',
      country: 'Brazil',
      season: '2024',
      region: 'south_america',
      crestBg: 'from-yellow-500 to-emerald-900',
      crestText: 'CBF',
    },
    {
      key: 'premier-league',
      name: 'MLS',
      country: 'United States',
      season: '2024',
      region: 'north_america',
      crestBg: 'from-red-700 to-blue-950',
      crestText: 'MLS',
    },
  ];

  const handleOpenFixtureMatch = (fixture: UpcomingFixtureRow) => {
    if (!onOpenMatch) return;
    const found =
      matches.find((m) => m.id === fixture.id) ||
      matches.find(
        (m) =>
          m.homeTeam.toLowerCase().includes(fixture.homeTeam.toLowerCase()) ||
          m.awayTeam.toLowerCase().includes(fixture.awayTeam.toLowerCase())
      ) ||
      matches[0];

    if (found) {
      onOpenMatch(found);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCountryFilter('all');
    setCompTypeFilter('all');
    setSeasonFilter('2024/25');
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

          {/* Season 2024/25 */}
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="rounded-xl border border-[#1c2a3b] bg-[#0d1520] px-3.5 py-2 text-xs text-neutral-200 focus:border-[#43f08a] focus:outline-none cursor-pointer"
          >
            <option value="2024/25">📅 2024/25</option>
            <option value="2025/26">📅 2025/26</option>
            <option value="2023/24">📅 2023/24</option>
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
              const isSelected = selectedLeagueKey === lg.key && idx < 5;
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
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lg.badgeBg} border ${lg.badgeBorder} flex items-center justify-center text-sm font-black text-white shrink-0`}
                  >
                    {lg.icon}
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3d0c52] to-[#20032c] border border-purple-400/40 flex items-center justify-center text-sm">
                  🦁
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
                          <TeamBadge name={row.club} size="sm" className="w-5 h-5 text-[8px]" />
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
            {activeLeague.topScorers.map((sc) => (
              <div key={sc.rank} className="py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-[#8f9cae] w-3">{sc.rank}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${sc.avatarGradient} border border-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0`}
                  >
                    {sc.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{sc.name}</div>
                    <div className="text-[10px] text-[#8f9cae] truncate">{sc.club}</div>
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
            {activeLeague.upcomingFixtures.map((fx) => (
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
                    <TeamBadge name={fx.homeTeam} size="sm" className="w-5 h-5 text-[8px]" />
                  </div>

                  <span className="px-2 py-0.5 rounded bg-[#131d2a] border border-[#1f2e42] font-mono text-[11px] font-bold text-neutral-200 shrink-0">
                    {fx.time}
                  </span>

                  <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
                    <TeamBadge name={fx.awayTeam} size="sm" className="w-5 h-5 text-[8px]" />
                    <span className="font-bold text-white group-hover:text-[#43f08a] truncate">
                      {fx.awayTeam}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 4 (Right 2 cols): League at a Glance */}
        <div className="xl:col-span-2 rounded-2xl border border-[#182434] bg-[#0a1018] p-4 flex flex-col justify-between shadow-xl space-y-3">
          <div className="border-b border-[#162232] pb-2.5">
            <h3 className="text-sm font-extrabold text-white">{t.leagueAtGlance}</h3>
          </div>

          <div className="divide-y divide-[#141f2e] text-xs flex-1 flex flex-col justify-around">
            {[
              { label: t.matchesPlayed, val: activeLeague.glance.matchesPlayed },
              { label: t.goalsScored, val: activeLeague.glance.goalsScored },
              { label: t.goalsPerMatch, val: activeLeague.glance.goalsPerMatch },
              { label: t.cleanSheets, val: activeLeague.glance.cleanSheets },
              { label: t.yellowCards, val: activeLeague.glance.yellowCards },
              { label: t.redCards, val: activeLeague.glance.redCards },
            ].map((item, i) => (
              <div key={i} className="py-1.5 flex items-center justify-between">
                <span className="text-[#8f9cae] text-[11px]">{item.label}</span>
                <span className="font-mono font-black text-white">{item.val}</span>
              </div>
            ))}
          </div>

          {/* Bottom Avg. Possession + Sparkline */}
          <div className="pt-2 border-t border-[#162232]">
            <span className="text-[10px] text-[#8f9cae] block">{t.avgPossession}</span>
            <div className="flex items-end justify-between gap-2 mt-1">
              <span className="text-lg font-mono font-black text-white leading-none">
                {activeLeague.glance.avgPossession}
              </span>
              <svg className="w-24 h-7 overflow-visible" viewBox="0 0 90 26">
                <path
                  d="M0 22 L12 18 L24 20 L36 14 L48 16 L60 9 L74 12 L88 4"
                  fill="none"
                  stroke="#43f08a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="88" cy="4" r="2.5" fill="#43f08a" />
              </svg>
            </div>
          </div>
        </div>
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
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rl.crestBg} border border-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0`}
                >
                  {rl.crestText}
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
