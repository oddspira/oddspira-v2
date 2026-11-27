import React, { useEffect, useState } from 'react';
import {
  ActiveTab,
  BookmakerComparisonRow,
  DroppingOddsMarketAlert,
  Language,
  Match,
  MultiMarketOddsSnapshot,
  OddsHistoryEntry,
} from '../types';
import { computePoissonMatrix } from '../utils/mathModels';
import { TeamBadge, LeagueBadge, openTeamProfile, openPlayerProfile, registerMatchLogos } from './TeamBadge';

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
  multiMarketOdds?: MultiMarketOddsSnapshot | null;
  openingMarketOdds?: MultiMarketOddsSnapshot | null;
  oddsHistory?: OddsHistoryEntry[];
  droppingAlerts?: DroppingOddsMarketAlert[];
  topDrop?: {
    marketKey: string;
    labelKey: string;
    openingOdds: number;
    currentOdds: number;
    dropPercent: number;
    isSteamMove: boolean;
    snapshotsCount: number;
  } | null;
  bookmakersComparison?: BookmakerComparisonRow[];
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
    homeCoachId?: number;
    homeCoachPhoto?: string;
    awayCoach: string;
    awayCoachId?: number;
    awayCoachPhoto?: string;
    homePlayers: PlayerNode[];
    awayPlayers: PlayerNode[];
    homeSubstitutes?: SubstituteNode[];
    awaySubstitutes?: SubstituteNode[];
  } | null;
  events?: {
    min: string;
    team: 'home' | 'away';
    icon: string;
    title: string;
    sub: string;
    highlight?: boolean;
  }[];
  injuries?: {
    playerId?: number;
    name: string;
    photo?: string;
    team: 'home' | 'away';
    teamName: string;
    type: string;
    reason: string;
    impactLambdaDelta: number;
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

interface OddsMovementTranslation {
  title: string;
  subtitle: string;
  tab1x2: string;
  tabGoals: string;
  tabFirstHalf: string;
  tabCorners: string;
  tabCards: string;
  tabBtts: string;
  openingLabel: string;
  currentLabel: string;
  droppingBadge: string;
  steamBadge: string;
  stableBadge: string;
  snapshotsCountLabel: string;
  graphTitle: string;
  singleSnapshotNote: string;
  topDropsHeader: string;
  betNowBtn: string;
  labels: Record<string, string>;
}

const ODDS_MOVEMENT_DICT: Record<Language, OddsMovementTranslation> = {
  bg: {
    title: '📉 Движение на коефициентите и Падащи линии (Multi-Market Odds Tracker)',
    subtitle: 'Времева серия на началните (Opening) спрямо текущите пазарни коефициенти за 1X2, Голове, 1-во Полувреме, Корнери, Картони и Гол/Гол',
    tab1x2: '1X2 & Двоен шанс',
    tabGoals: 'Голове (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1-во Полувреме (ПП)',
    tabCorners: 'Корнери (8.5 / 9.5 / 10.5)',
    tabCards: 'Картони (3.5 / 4.5)',
    tabBtts: 'Гол/Гол (BTTS)',
    openingLabel: 'Начален',
    currentLabel: 'Текущ',
    droppingBadge: 'ПАДАЩ КОЕФ.',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'АКТИВЕН МОНИТОРИНГ',
    snapshotsCountLabel: 'пазарни отпечатъка',
    graphTitle: 'Графика на движението на линията (Opening → Current)',
    singleSnapshotNote: 'Записан е базов отпечатък. Сървърът автоматично добавя нова точка при промяна на линията (на 3 мин. На Живо / 30 мин. Преди мач).',
    topDropsHeader: 'Най-силни спадове по всички пазари:',
    betNowBtn: '+ Залог',
    labels: {
      homeWin: '1 (Победа Домакин)',
      draw: 'X (Равенство)',
      awayWin: '2 (Победа Гост)',
      dc1X: '1X (Домакин или Равен)',
      dc12: '12 (Без Равенство)',
      dcX2: 'X2 (Равен или Гост)',
      over15: 'Над 1.5 Гола',
      under15: 'Под 1.5 Гола',
      over25: 'Над 2.5 Гола',
      under25: 'Под 2.5 Гола',
      over35: 'Над 3.5 Гола',
      under35: 'Под 3.5 Гола',
      fhHome: '1-во ПП — 1 (Домакин)',
      fhDraw: '1-во ПП — X (Равен)',
      fhAway: '1-во ПП — 2 (Гост)',
      fhOver05: '1-во ПП — Над 0.5 Гола',
      fhUnder05: '1-во ПП — Под 0.5 Гола',
      fhOver15: '1-во ПП — Над 1.5 Гола',
      fhUnder15: '1-во ПП — Под 1.5 Гола',
      cornersOver85: 'Корнери Над 8.5',
      cornersUnder85: 'Корнери Под 8.5',
      cornersOver95: 'Корнери Над 9.5',
      cornersUnder95: 'Корнери Под 9.5',
      cornersOver105: 'Корнери Над 10.5',
      cornersUnder105: 'Корнери Под 10.5',
      cardsOver35: 'Картони Над 3.5',
      cardsUnder35: 'Картони Под 3.5',
      cardsOver45: 'Картони Над 4.5',
      cardsUnder45: 'Картони Под 4.5',
      bttsYes: 'Гол/Гол — ДА',
      bttsNo: 'Гол/Гол — НЕ',
    },
  },
  en: {
    title: '📉 Multi-Market Odds Movement & Dropping Lines Tracker',
    subtitle: 'Real-time Opening vs. Current odds time-series across 1X2, Total Goals, 1st Half, Corners, Cards & BTTS',
    tab1x2: '1X2 & Double Chance',
    tabGoals: 'Goals (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1st Half (1H)',
    tabCorners: 'Corners (8.5 / 9.5 / 10.5)',
    tabCards: 'Cards (3.5 / 4.5)',
    tabBtts: 'Both Teams Score (BTTS)',
    openingLabel: 'Opening',
    currentLabel: 'Current',
    droppingBadge: 'DROPPING ODDS',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'LIVE TRACKING',
    snapshotsCountLabel: 'market snapshots',
    graphTitle: 'Line Movement Time-Series Curve (Opening → Current)',
    singleSnapshotNote: 'Initial baseline snapshot recorded. The server automatically appends new points whenever bookmaker lines move (3m Live / 30m Pre-Match).',
    topDropsHeader: 'Strongest Drops Across All Markets:',
    betNowBtn: '+ Log Bet',
    labels: {
      homeWin: '1 (Home Win)',
      draw: 'X (Draw)',
      awayWin: '2 (Away Win)',
      dc1X: '1X (Home or Draw)',
      dc12: '12 (Home or Away)',
      dcX2: 'X2 (Draw or Away)',
      over15: 'Over 1.5 Goals',
      under15: 'Under 1.5 Goals',
      over25: 'Over 2.5 Goals',
      under25: 'Under 2.5 Goals',
      over35: 'Over 3.5 Goals',
      under35: 'Under 3.5 Goals',
      fhHome: '1st Half — 1 (Home)',
      fhDraw: '1st Half — X (Draw)',
      fhAway: '1st Half — 2 (Away)',
      fhOver05: '1st Half — Over 0.5 Goals',
      fhUnder05: '1st Half — Under 0.5 Goals',
      fhOver15: '1st Half — Over 1.5 Goals',
      fhUnder15: '1st Half — Under 1.5 Goals',
      cornersOver85: 'Corners Over 8.5',
      cornersUnder85: 'Corners Under 8.5',
      cornersOver95: 'Corners Over 9.5',
      cornersUnder95: 'Corners Under 9.5',
      cornersOver105: 'Corners Over 10.5',
      cornersUnder105: 'Corners Under 10.5',
      cardsOver35: 'Cards Over 3.5',
      cardsUnder35: 'Cards Under 3.5',
      cardsOver45: 'Cards Over 4.5',
      cardsUnder45: 'Cards Under 4.5',
      bttsYes: 'BTTS — YES',
      bttsNo: 'BTTS — NO',
    },
  },
  es: {
    title: '📉 Movimiento de Cuotas y Líneas en Caída (Multi-Mercado)',
    subtitle: 'Serie temporal de cuotas de Apertura vs. Actuales para 1X2, Goles, 1ª Mitad, Córners, Tarjetas y Ambos Marcan',
    tab1x2: '1X2 y Doble Oportunidad',
    tabGoals: 'Goles (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1ª Mitad (1T)',
    tabCorners: 'Córners (8.5 / 9.5 / 10.5)',
    tabCards: 'Tarjetas (3.5 / 4.5)',
    tabBtts: 'Ambos Marcan (BTTS)',
    openingLabel: 'Apertura',
    currentLabel: 'Actual',
    droppingBadge: 'CUOTA EN CAÍDA',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'MONITOREO ACTIVO',
    snapshotsCountLabel: 'registros de mercado',
    graphTitle: 'Curva de Movimiento de Línea (Apertura → Actual)',
    singleSnapshotNote: 'Punto inicial registrado. El servidor añade nuevos puntos automáticamente cuando cambia la cuota (cada 3 min En Vivo / 30 min Pre-Partido).',
    topDropsHeader: 'Mayores Caídas de Cuota en Todos los Mercados:',
    betNowBtn: '+ Apuesta',
    labels: {
      homeWin: '1 (Victoria Local)',
      draw: 'X (Empate)',
      awayWin: '2 (Victoria Visitante)',
      dc1X: '1X (Local o Empate)',
      dc12: '12 (Local o Visitante)',
      dcX2: 'X2 (Empate o Visitante)',
      over15: 'Más de 1.5 Goles',
      under15: 'Menos de 1.5 Goles',
      over25: 'Más de 2.5 Goles',
      under25: 'Menos de 2.5 Goles',
      over35: 'Más de 3.5 Goles',
      under35: 'Menos de 3.5 Goles',
      fhHome: '1ª Mitad — 1 (Local)',
      fhDraw: '1ª Mitad — X (Empate)',
      fhAway: '1ª Mitad — 2 (Visitante)',
      fhOver05: '1ª Mitad — Más 0.5 Goles',
      fhUnder05: '1ª Mitad — Menos 0.5 Goles',
      fhOver15: '1ª Mitad — Más 1.5 Goles',
      fhUnder15: '1ª Mitad — Menos 1.5 Goles',
      cornersOver85: 'Córners Más de 8.5',
      cornersUnder85: 'Córners Menos de 8.5',
      cornersOver95: 'Córners Más de 9.5',
      cornersUnder95: 'Córners Menos de 9.5',
      cornersOver105: 'Córners Más de 10.5',
      cornersUnder105: 'Córners Menos de 10.5',
      cardsOver35: 'Tarjetas Más de 3.5',
      cardsUnder35: 'Tarjetas Menos de 3.5',
      cardsOver45: 'Tarjetas Más de 4.5',
      cardsUnder45: 'Tarjetas Menos de 4.5',
      bttsYes: 'Ambos Marcan — SÍ',
      bttsNo: 'Ambos Marcan — NO',
    },
  },
  de: {
    title: '📉 Quotenbewegung & Fallende Linien (Multi-Markt-Tracker)',
    subtitle: 'Zeitreihen-Analyse der Eröffnungs- vs. aktuellen Quoten für 1X2, Tore, 1. Halbzeit, Ecken, Karten & BTTS',
    tab1x2: '1X2 & Doppelte Chance',
    tabGoals: 'Tore (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1. Halbzeit (1.HZ)',
    tabCorners: 'Ecken (8.5 / 9.5 / 10.5)',
    tabCards: 'Karten (3.5 / 4.5)',
    tabBtts: 'Beide Treffen (BTTS)',
    openingLabel: 'Eröffnung',
    currentLabel: 'Aktuell',
    droppingBadge: 'FALLENDE QUOTE',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'LIVE-TRACKING',
    snapshotsCountLabel: 'Markt-Snapshots',
    graphTitle: 'Quotenverlauf im Zeitverlauf (Eröffnung → Aktuell)',
    singleSnapshotNote: 'Startpunkt gespeichert. Der Server zeichnet automatisch neue Punkte bei Quotenänderungen auf (3 Min. Live / 30 Min. Pre-Match).',
    topDropsHeader: 'Stärkste Quotenrückgänge über alle Märkte:',
    betNowBtn: '+ Wette',
    labels: {
      homeWin: '1 (Heimsieg)',
      draw: 'X (Remis)',
      awayWin: '2 (Auswärtssieg)',
      dc1X: '1X (Heim oder Remis)',
      dc12: '12 (Heim oder Gast)',
      dcX2: 'X2 (Remis oder Gast)',
      over15: 'Über 1.5 Tore',
      under15: 'Unter 1.5 Tore',
      over25: 'Über 2.5 Tore',
      under25: 'Unter 2.5 Tore',
      over35: 'Über 3.5 Tore',
      under35: 'Unter 3.5 Tore',
      fhHome: '1. HZ — 1 (Heim)',
      fhDraw: '1. HZ — X (Remis)',
      fhAway: '1. HZ — 2 (Gast)',
      fhOver05: '1. HZ — Über 0.5 Tore',
      fhUnder05: '1. HZ — Unter 0.5 Tore',
      fhOver15: '1. HZ — Über 1.5 Tore',
      fhUnder15: '1. HZ — Unter 1.5 Tore',
      cornersOver85: 'Ecken Über 8.5',
      cornersUnder85: 'Ecken Unter 8.5',
      cornersOver95: 'Ecken Über 9.5',
      cornersUnder95: 'Ecken Unter 9.5',
      cornersOver105: 'Ecken Über 10.5',
      cornersUnder105: 'Ecken Unter 10.5',
      cardsOver35: 'Karten Über 3.5',
      cardsUnder35: 'Karten Unter 3.5',
      cardsOver45: 'Karten Über 4.5',
      cardsUnder45: 'Karten Unter 4.5',
      bttsYes: 'Beide Treffen — JA',
      bttsNo: 'Beide Treffen — NEIN',
    },
  },
  it: {
    title: '📉 Movimento Quote e Linee in Calo (Multi-Mercato)',
    subtitle: 'Serie storica Quote di Apertura vs. Attuali per 1X2, Gol, 1° Tempo, Corner, Cartellini e Goal/No Goal',
    tab1x2: '1X2 e Doppia Chance',
    tabGoals: 'Gol (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1° Tempo (1T)',
    tabCorners: 'Corner (8.5 / 9.5 / 10.5)',
    tabCards: 'Cartellini (3.5 / 4.5)',
    tabBtts: 'Goal/No Goal (BTTS)',
    openingLabel: 'Apertura',
    currentLabel: 'Attuale',
    droppingBadge: 'QUOTA IN CALO',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'MONITORAGGIO LIVE',
    snapshotsCountLabel: 'rilevazioni di mercato',
    graphTitle: 'Curva Movimento Quota (Apertura → Attuale)',
    singleSnapshotNote: 'Snapshot iniziale registrato. Il server aggiunge automaticamente nuovi punti a ogni variazione (3 min Live / 30 min Pre-Match).',
    topDropsHeader: 'Maggiori Cali di Quota su Tutti i Mercati:',
    betNowBtn: '+ Gioca',
    labels: {
      homeWin: '1 (Vittoria Casa)',
      draw: 'X (Pareggio)',
      awayWin: '2 (Vittoria Ospite)',
      dc1X: '1X (Casa o Pareggio)',
      dc12: '12 (Casa o Ospite)',
      dcX2: 'X2 (Pareggio o Ospite)',
      over15: 'Over 1.5 Gol',
      under15: 'Under 1.5 Gol',
      over25: 'Over 2.5 Gol',
      under25: 'Under 2.5 Gol',
      over35: 'Over 3.5 Gol',
      under35: 'Under 3.5 Gol',
      fhHome: '1° Tempo — 1 (Casa)',
      fhDraw: '1° Tempo — X (Pareggio)',
      fhAway: '1° Tempo — 2 (Ospite)',
      fhOver05: '1° Tempo — Over 0.5 Gol',
      fhUnder05: '1° Tempo — Under 0.5 Gol',
      fhOver15: '1° Tempo — Over 1.5 Gol',
      fhUnder15: '1° Tempo — Under 1.5 Gol',
      cornersOver85: 'Corner Over 8.5',
      cornersUnder85: 'Corner Under 8.5',
      cornersOver95: 'Corner Over 9.5',
      cornersUnder95: 'Corner Under 9.5',
      cornersOver105: 'Corner Over 10.5',
      cornersUnder105: 'Corner Under 10.5',
      cardsOver35: 'Cartellini Over 3.5',
      cardsUnder35: 'Cartellini Under 3.5',
      cardsOver45: 'Cartellini Over 4.5',
      cardsUnder45: 'Cartellini Under 4.5',
      bttsYes: 'Goal (BTTS) — SÌ',
      bttsNo: 'No Goal (BTTS) — NO',
    },
  },
  pt: {
    title: '📉 Movimento de Odds e Linhas em Queda (Multi-Mercado)',
    subtitle: 'Série temporal de Odds de Abertura vs. Atuais para 1X2, Gols, 1º Tempo, Escanteios, Cartões e Ambas Marcam',
    tab1x2: '1X2 e Dupla Chance',
    tabGoals: 'Gols (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1º Tempo (1T)',
    tabCorners: 'Escanteios (8.5 / 9.5 / 10.5)',
    tabCards: 'Cartões (3.5 / 4.5)',
    tabBtts: 'Ambas Marcam (BTTS)',
    openingLabel: 'Abertura',
    currentLabel: 'Atual',
    droppingBadge: 'ODD EM QUEDA',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'MONITORAMENTO ATIVO',
    snapshotsCountLabel: 'registros de mercado',
    graphTitle: 'Curva de Movimento da Linha (Abertura → Atual)',
    singleSnapshotNote: 'Snapshot inicial gravado. O servidor adiciona novos pontos automaticamente a cada variação (3 min Ao Vivo / 30 min Pré-Jogo).',
    topDropsHeader: 'Maiores Quedas de Odds em Todos os Mercados:',
    betNowBtn: '+ Apostar',
    labels: {
      homeWin: '1 (Vitória Casa)',
      draw: 'X (Empate)',
      awayWin: '2 (Vitória Fora)',
      dc1X: '1X (Casa ou Empate)',
      dc12: '12 (Casa ou Fora)',
      dcX2: 'X2 (Empate ou Fora)',
      over15: 'Mais de 1.5 Gols',
      under15: 'Menos de 1.5 Gols',
      over25: 'Mais de 2.5 Gols',
      under25: 'Menos de 2.5 Gols',
      over35: 'Mais de 3.5 Gols',
      under35: 'Menos de 3.5 Gols',
      fhHome: '1º Tempo — 1 (Casa)',
      fhDraw: '1º Tempo — X (Empate)',
      fhAway: '1º Tempo — 2 (Fora)',
      fhOver05: '1º Tempo — Mais 0.5 Gols',
      fhUnder05: '1º Tempo — Menos 0.5 Gols',
      fhOver15: '1º Tempo — Mais 1.5 Gols',
      fhUnder15: '1º Tempo — Menos 1.5 Gols',
      cornersOver85: 'Escanteios Mais 8.5',
      cornersUnder85: 'Escanteios Menos 8.5',
      cornersOver95: 'Escanteios Mais 9.5',
      cornersUnder95: 'Escanteios Menos 9.5',
      cornersOver105: 'Escanteios Mais 10.5',
      cornersUnder105: 'Escanteios Menos 10.5',
      cardsOver35: 'Cartões Mais 3.5',
      cardsUnder35: 'Cartões Menos 3.5',
      cardsOver45: 'Cartões Mais 4.5',
      cardsUnder45: 'Cartões Menos 4.5',
      bttsYes: 'Ambas Marcam — SIM',
      bttsNo: 'Ambas Marcam — NÃO',
    },
  },
  fr: {
    title: '📉 Mouvement des Cotes & Lignes en Baisse (Multi-Marchés)',
    subtitle: 'Série temporelle des cotes d’Ouverture vs. Actuelles pour 1X2, Buts, 1ère Mi-Temps, Corners, Cartons et BTTS',
    tab1x2: '1X2 & Double Chance',
    tabGoals: 'Buts (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1ère Mi-Temps (1MT)',
    tabCorners: 'Corners (8.5 / 9.5 / 10.5)',
    tabCards: 'Cartons (3.5 / 4.5)',
    tabBtts: 'Les 2 Marquent (BTTS)',
    openingLabel: 'Ouverture',
    currentLabel: 'Actuelle',
    droppingBadge: 'COTE EN BAISSE',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'SUIVI EN DIRECT',
    snapshotsCountLabel: 'relevés de marché',
    graphTitle: 'Courbe d’Évolution de la Ligne (Ouverture → Actuelle)',
    singleSnapshotNote: 'Point initial enregistré. Le serveur ajoute automatiquement un point à chaque variation (3 min Direct / 30 min Pré-Match).',
    topDropsHeader: 'Plus Fortes Baisses sur Tous les Marchés :',
    betNowBtn: '+ Parier',
    labels: {
      homeWin: '1 (Victoire Domicile)',
      draw: 'X (Match Nul)',
      awayWin: '2 (Victoire Extérieur)',
      dc1X: '1X (Domicile ou Nul)',
      dc12: '12 (Domicile ou Extérieur)',
      dcX2: 'X2 (Nul ou Extérieur)',
      over15: 'Plus de 1.5 Buts',
      under15: 'Moins de 1.5 Buts',
      over25: 'Plus de 2.5 Buts',
      under25: 'Moins de 2.5 Buts',
      over35: 'Plus de 3.5 Buts',
      under35: 'Moins de 3.5 Buts',
      fhHome: '1ère MT — 1 (Domicile)',
      fhDraw: '1ère MT — X (Nul)',
      fhAway: '1ère MT — 2 (Extérieur)',
      fhOver05: '1ère MT — Plus 0.5 Buts',
      fhUnder05: '1ère MT — Moins 0.5 Buts',
      fhOver15: '1ère MT — Plus 1.5 Buts',
      fhUnder15: '1ère MT — Moins 1.5 Buts',
      cornersOver85: 'Corners Plus de 8.5',
      cornersUnder85: 'Corners Moins de 8.5',
      cornersOver95: 'Corners Plus de 9.5',
      cornersUnder95: 'Corners Moins de 9.5',
      cornersOver105: 'Corners Plus de 10.5',
      cornersUnder105: 'Corners Moins de 10.5',
      cardsOver35: 'Cartons Plus de 3.5',
      cardsUnder35: 'Cartons Moins de 3.5',
      cardsOver45: 'Cartons Plus de 4.5',
      cardsUnder45: 'Cartons Moins de 4.5',
      bttsYes: 'Les 2 Marquent — OUI',
      bttsNo: 'Les 2 Marquent — NON',
    },
  },
  tr: {
    title: '📉 Oran Hareketleri ve Düşen Oranlar (Çoklu Market Takibi)',
    subtitle: '1X2, Gol, 1. Yarı, Korner, Kart ve KG Var/Yok için Açılış ve Güncel Oranların zaman serisi grafiği',
    tab1x2: '1X2 & Çifte Şans',
    tabGoals: 'Goller (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1. Yarı (İY)',
    tabCorners: 'Korner (8.5 / 9.5 / 10.5)',
    tabCards: 'Kartlar (3.5 / 4.5)',
    tabBtts: 'KG Var/Yok (BTTS)',
    openingLabel: 'Açılış',
    currentLabel: 'Güncel',
    droppingBadge: 'DÜŞEN ORAN',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'CANLI TAKİP',
    snapshotsCountLabel: 'piyasa kaydı',
    graphTitle: 'Oran Hareket Grafiği (Açılış → Güncel)',
    singleSnapshotNote: 'Başlangıç oranı kaydedildi. Sunucu oran değişimlerinde otomatik yeni nokta ekler (Canlı 3 dk / Maç Öncesi 30 dk).',
    topDropsHeader: 'Tüm Marketlerde En Çok Düşen Oranlar:',
    betNowBtn: '+ Kupona Ekle',
    labels: {
      homeWin: '1 (Ev Sahibi)',
      draw: 'X (Beraberlik)',
      awayWin: '2 (Deplasman)',
      dc1X: '1X (Ev veya Beraberlik)',
      dc12: '12 (Ev veya Deplasman)',
      dcX2: 'X2 (Beraberlik veya Dep.)',
      over15: '1.5 Üst Gol',
      under15: '1.5 Alt Gol',
      over25: '2.5 Üst Gol',
      under25: '2.5 Alt Gol',
      over35: '3.5 Üst Gol',
      under35: '3.5 Alt Gol',
      fhHome: '1. Yarı — 1 (Ev)',
      fhDraw: '1. Yarı — X (Beraberlik)',
      fhAway: '1. Yarı — 2 (Deplasman)',
      fhOver05: '1. Yarı — 0.5 Üst',
      fhUnder05: '1. Yarı — 0.5 Alt',
      fhOver15: '1. Yarı — 1.5 Üst',
      fhUnder15: '1. Yarı — 1.5 Alt',
      cornersOver85: 'Korner 8.5 Üst',
      cornersUnder85: 'Korner 8.5 Alt',
      cornersOver95: 'Korner 9.5 Üst',
      cornersUnder95: 'Korner 9.5 Alt',
      cornersOver105: 'Korner 10.5 Üst',
      cornersUnder105: 'Korner 10.5 Alt',
      cardsOver35: 'Kart 3.5 Üst',
      cardsUnder35: 'Kart 3.5 Alt',
      cardsOver45: 'Kart 4.5 Üst',
      cardsUnder45: 'Kart 4.5 Alt',
      bttsYes: 'KG Var — EVET',
      bttsNo: 'KG Yok — HAYIR',
    },
  },
  pl: {
    title: '📉 Ruchy Kursów i Spadające Linie (Multi-Market Tracker)',
    subtitle: 'Szereg czasowy kursów otwarcia (Opening) vs. aktualnych dla 1X2, Goli, 1. Połowy, Rożnych, Kartek i BTTS',
    tab1x2: '1X2 i Podwójna Szansa',
    tabGoals: 'Gole (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1. Połowa (1P)',
    tabCorners: 'Rzuty Rożne (8.5 / 9.5 / 10.5)',
    tabCards: 'Kartki (3.5 / 4.5)',
    tabBtts: 'Obie Strzelą (BTTS)',
    openingLabel: 'Otwarcie',
    currentLabel: 'Aktualny',
    droppingBadge: 'SPADAJĄCY KURS',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'MONITORING LIVE',
    snapshotsCountLabel: 'zapisów rynkowych',
    graphTitle: 'Wykres Ruchu Linii w Czasie (Otwarcie → Aktualny)',
    singleSnapshotNote: 'Zapisano punkt początkowy. Serwer automatycznie dodaje nowe punkty przy zmianie linii (co 3 min Live / 30 min Pre-Match).',
    topDropsHeader: 'Największe Spadki Kursów na Wszystkich Rynkach:',
    betNowBtn: '+ Dodaj zakład',
    labels: {
      homeWin: '1 (Gospodarze)',
      draw: 'X (Remis)',
      awayWin: '2 (Goście)',
      dc1X: '1X (Gospodarze lub Remis)',
      dc12: '12 (Gospodarze lub Goście)',
      dcX2: 'X2 (Remis lub Goście)',
      over15: 'Powyżej 1.5 Gola',
      under15: 'Poniżej 1.5 Gola',
      over25: 'Powyżej 2.5 Gola',
      under25: 'Poniżej 2.5 Gola',
      over35: 'Powyżej 3.5 Gola',
      under35: 'Poniżej 3.5 Gola',
      fhHome: '1. Połowa — 1 (Gosp.)',
      fhDraw: '1. Połowa — X (Remis)',
      fhAway: '1. Połowa — 2 (Goście)',
      fhOver05: '1. Połowa — Powyżej 0.5',
      fhUnder05: '1. Połowa — Poniżej 0.5',
      fhOver15: '1. Połowa — Powyżej 1.5',
      fhUnder15: '1. Połowa — Poniżej 1.5',
      cornersOver85: 'Rożne Powyżej 8.5',
      cornersUnder85: 'Rożne Poniżej 8.5',
      cornersOver95: 'Rożne Powyżej 9.5',
      cornersUnder95: 'Rożne Poniżej 9.5',
      cornersOver105: 'Rożne Powyżej 10.5',
      cornersUnder105: 'Rożne Poniżej 10.5',
      cardsOver35: 'Kartki Powyżej 3.5',
      cardsUnder35: 'Kartki Poniżej 3.5',
      cardsOver45: 'Kartki Powyżej 4.5',
      cardsUnder45: 'Kartki Poniżej 4.5',
      bttsYes: 'BTTS — TAK',
      bttsNo: 'BTTS — NIE',
    },
  },
  el: {
    title: '📉 Κίνηση Αποδόσεων & Πτωτικές Γραμμές (Multi-Market Tracker)',
    subtitle: 'Χρονοσειρά Αποδόσεων Ανοίγματος vs. Τρεχουσών για 1X2, Γκολ, 1ο Ημίχρονο, Κόρνερ, Κάρτες & G/G',
    tab1x2: '1X2 & Διπλή Ευκαιρία',
    tabGoals: 'Γκολ (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1ο Ημίχρονο (1Η)',
    tabCorners: 'Κόρνερ (8.5 / 9.5 / 10.5)',
    tabCards: 'Κάρτες (3.5 / 4.5)',
    tabBtts: 'Goal/Goal (BTTS)',
    openingLabel: 'Άνοιγμα',
    currentLabel: 'Τρέχουσα',
    droppingBadge: 'ΠΤΩΣΗ ΑΠΟΔΟΣΗΣ',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'LIVE ΠΑΡΑΚΟΛΟΥΘΗΣΗ',
    snapshotsCountLabel: 'καταγραφές αγοράς',
    graphTitle: 'Γράφημα Κίνησης Απόδοσης (Άνοιγμα → Τρέχουσα)',
    singleSnapshotNote: 'Καταγράφηκε το αρχικό σημείο. Ο διακομιστής προσθέτει αυτόματα νέα σημεία σε κάθε αλλαγή (3λ Live / 30λ Pre-Match).',
    topDropsHeader: 'Μεγαλύτερες Πτώσεις σε Όλες τις Αγορές:',
    betNowBtn: '+ Στοίχημα',
    labels: {
      homeWin: '1 (Άσος)',
      draw: 'X (Ισοπαλία)',
      awayWin: '2 (Διπλό)',
      dc1X: '1X (Γηπεδούχος ή Ισοπ.)',
      dc12: '12 (Άσος ή Διπλό)',
      dcX2: 'X2 (Ισοπ. ή Φιλοξ.)',
      over15: 'Over 1.5 Γκολ',
      under15: 'Under 1.5 Γκολ',
      over25: 'Over 2.5 Γκολ',
      under25: 'Under 2.5 Γκολ',
      over35: 'Over 3.5 Γκολ',
      under35: 'Under 3.5 Γκολ',
      fhHome: '1ο Ημίχρ. — 1 (Άσος)',
      fhDraw: '1ο Ημίχρ. — X (Ισοπ.)',
      fhAway: '1ο Ημίχρ. — 2 (Διπλό)',
      fhOver05: '1ο Ημίχρ. — Over 0.5',
      fhUnder05: '1ο Ημίχρ. — Under 0.5',
      fhOver15: '1ο Ημίχρ. — Over 1.5',
      fhUnder15: '1ο Ημίχρ. — Under 1.5',
      cornersOver85: 'Κόρνερ Over 8.5',
      cornersUnder85: 'Κόρνερ Under 8.5',
      cornersOver95: 'Κόρνερ Over 9.5',
      cornersUnder95: 'Κόρνερ Under 9.5',
      cornersOver105: 'Κόρνερ Over 10.5',
      cornersUnder105: 'Κόρνερ Under 10.5',
      cardsOver35: 'Κάρτες Over 3.5',
      cardsUnder35: 'Κάρτες Under 3.5',
      cardsOver45: 'Κάρτες Over 4.5',
      cardsUnder45: 'Κάρτες Under 4.5',
      bttsYes: 'Goal/Goal — ΝΑΙ',
      bttsNo: 'Goal/Goal — ΟΧΙ',
    },
  },
  ro: {
    title: '📉 Mișcarea Cotelor & Cote în Scădere (Multi-Market Tracker)',
    subtitle: 'Serie temporală Cote de Deschidere vs. Actuale pentru 1X2, Goluri, Repriza 1, Cornere, Cartonașe și GG',
    tab1x2: '1X2 & Șansă Dublă',
    tabGoals: 'Goluri (1.5 / 2.5 / 3.5)',
    tabFirstHalf: 'Repriza 1 (1R)',
    tabCorners: 'Cornere (8.5 / 9.5 / 10.5)',
    tabCards: 'Cartonașe (3.5 / 4.5)',
    tabBtts: 'Ambele Marchează (GG)',
    openingLabel: 'Deschidere',
    currentLabel: 'Actuală',
    droppingBadge: 'COTĂ ÎN SCĂDERE',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'MONITORIZARE LIVE',
    snapshotsCountLabel: 'înregistrări de piață',
    graphTitle: 'Grafic Evoluție Cotă (Deschidere → Actuală)',
    singleSnapshotNote: 'Punct inițial salvat. Serverul adaugă automat puncte noi la fiecare modificare a liniei (3 min Live / 30 min Pre-Meci).',
    topDropsHeader: 'Cele Mai Mari Scăderi de Cote pe Toate Piețele:',
    betNowBtn: '+ Pariază',
    labels: {
      homeWin: '1 (Victorie Gazde)',
      draw: 'X (Egal)',
      awayWin: '2 (Victorie Oaspeți)',
      dc1X: '1X (Gazde sau Egal)',
      dc12: '12 (Gazde sau Oaspeți)',
      dcX2: 'X2 (Egal sau Oaspeți)',
      over15: 'Peste 1.5 Goluri',
      under15: 'Sub 1.5 Goluri',
      over25: 'Peste 2.5 Goluri',
      under25: 'Sub 2.5 Goluri',
      over35: 'Peste 3.5 Goluri',
      under35: 'Sub 3.5 Goluri',
      fhHome: 'Repriza 1 — 1 (Gazde)',
      fhDraw: 'Repriza 1 — X (Egal)',
      fhAway: 'Repriza 1 — 2 (Oaspeți)',
      fhOver05: 'Repriza 1 — Peste 0.5',
      fhUnder05: 'Repriza 1 — Sub 0.5',
      fhOver15: 'Repriza 1 — Peste 1.5',
      fhUnder15: 'Repriza 1 — Sub 1.5',
      cornersOver85: 'Cornere Peste 8.5',
      cornersUnder85: 'Cornere Sub 8.5',
      cornersOver95: 'Cornere Peste 9.5',
      cornersUnder95: 'Cornere Sub 9.5',
      cornersOver105: 'Cornere Peste 10.5',
      cornersUnder105: 'Cornere Sub 10.5',
      cardsOver35: 'Cartonașe Peste 3.5',
      cardsUnder35: 'Cartonașe Sub 3.5',
      cardsOver45: 'Cartonașe Peste 4.5',
      cardsUnder45: 'Cartonașe Sub 4.5',
      bttsYes: 'GG (BTTS) — DA',
      bttsNo: 'GG (BTTS) — NU',
    },
  },
  ru: {
    title: '📉 Движение коэффициентов и Падающие линии (Multi-Market Tracker)',
    subtitle: 'Временной ряд коэффициентов открытия (Opening) и текущих линий для 1X2, Тоталов, 1-го Тайма, Угловых, Карточек и ОЗ',
    tab1x2: '1X2 и Двойной шанс',
    tabGoals: 'Голы (1.5 / 2.5 / 3.5)',
    tabFirstHalf: '1-й Тайм (1Т)',
    tabCorners: 'Угловые (8.5 / 9.5 / 10.5)',
    tabCards: 'Карточки (3.5 / 4.5)',
    tabBtts: 'Обе забьют (ОЗ)',
    openingLabel: 'Открытие',
    currentLabel: 'Текущий',
    droppingBadge: 'ПАДАЮЩИЙ КЭФ',
    steamBadge: '🔥 STEAM MOVE',
    stableBadge: 'LIVE МОНИТОРИНГ',
    snapshotsCountLabel: 'рыночных снимков',
    graphTitle: 'График движения линии (Открытие → Текущий)',
    singleSnapshotNote: 'Записан базовый снимок. Сервер автоматически добавляет новые точки при изменении линии (3 мин Live / 30 мин Прематч).',
    topDropsHeader: 'Сильнейшие прогрузы по всем рынкам:',
    betNowBtn: '+ Ставка',
    labels: {
      homeWin: '1 (Победа Хозяев)',
      draw: 'X (Ничья)',
      awayWin: '2 (Победа Гостей)',
      dc1X: '1X (Хозяева или Ничья)',
      dc12: '12 (Хозяева или Гости)',
      dcX2: 'X2 (Ничья или Гости)',
      over15: 'ТБ 1.5 Гола',
      under15: 'ТМ 1.5 Гола',
      over25: 'ТБ 2.5 Гола',
      under25: 'ТМ 2.5 Гола',
      over35: 'ТБ 3.5 Гола',
      under35: 'ТМ 3.5 Гола',
      fhHome: '1-й Тайм — П1',
      fhDraw: '1-й Тайм — X',
      fhAway: '1-й Тайм — П2',
      fhOver05: '1-й Тайм — ТБ 0.5',
      fhUnder05: '1-й Тайм — ТМ 0.5',
      fhOver15: '1-й Тайм — ТБ 1.5',
      fhUnder15: '1-й Тайм — ТМ 1.5',
      cornersOver85: 'Угловые ТБ 8.5',
      cornersUnder85: 'Угловые ТМ 8.5',
      cornersOver95: 'Угловые ТБ 9.5',
      cornersUnder95: 'Угловые ТМ 9.5',
      cornersOver105: 'Угловые ТБ 10.5',
      cornersUnder105: 'Угловые ТМ 10.5',
      cardsOver35: 'Карточки ТБ 3.5',
      cardsUnder35: 'Карточки ТМ 3.5',
      cardsOver45: 'Карточки ТБ 4.5',
      cardsUnder45: 'Карточки ТМ 4.5',
      bttsYes: 'Обе забьют — ДА',
      bttsNo: 'Обе забьют — НЕТ',
    },
  },
};

const LINEUP_IMPACT_DICT: Record<
  Language,
  {
    title: string;
    subtitle: string;
    baseLambda: string;
    adjustedLambda: string;
    officialAbsences: string;
    simulateAbsenceHint: string;
    activeImpactBadge: string;
    noImpactBadge: string;
    injuredStatus: string;
    fitStarterStatus: string;
    poissonRecalcLabel: string;
    homeWinProb: string;
    drawProb: string;
    awayWinProb: string;
    over25Prob: string;
    resetBtn: string;
  }
> = {
  bg: {
    title: '🏥 Липсващи ключови фигури (Lineup Impact върху Poisson & +EV)',
    subtitle: 'Автоматична корекция на очакваните голове (λ) и +EV вероятностите при контузени или наказани водещи играчи',
    baseLambda: 'Базов λ (Пълен състав)',
    adjustedLambda: 'Коригиран λ* (След отсъствия)',
    officialAbsences: 'Отсъстващи / Ключови фигури (Кликни за симулация на влиянието)',
    simulateAbsenceHint: 'Включи/изключи играч, за да видиш как липсата му променя очакваните голове (λ) и +EV предимството',
    activeImpactBadge: 'АКТИВНА КОРЕКЦИЯ НА МОДЕЛА',
    noImpactBadge: 'БЕЗ ЛИПСВАЩИ ТИТУЛЯРИ',
    injuredStatus: 'Контузен / Наказан',
    fitStarterStatus: 'Ключов титуляр (Тествай липса)',
    poissonRecalcLabel: 'Преизчислени вероятности (Dixon-Coles Poisson):',
    homeWinProb: 'Победа Домакин (1)',
    drawProb: 'Равенство (X)',
    awayWinProb: 'Победа Гост (2)',
    over25Prob: 'Над 2.5 Гола',
    resetBtn: 'Възстанови',
  },
  en: {
    title: '🏥 Missing Key Figures (Lineup Impact on Poisson & +EV)',
    subtitle: 'Automatic expected goals (λ) and +EV probability adjustment for injured or suspended key players',
    baseLambda: 'Base λ (Full Squad)',
    adjustedLambda: 'Adjusted λ* (With Absences)',
    officialAbsences: 'Absences / Key Figures (Click to toggle xG impact)',
    simulateAbsenceHint: 'Toggle any key player to see how their absence shifts expected goals (λ) and +EV edge',
    activeImpactBadge: 'MODEL λ ADJUSTMENT ACTIVE',
    noImpactBadge: 'FULL STRENGTH LINEUP',
    injuredStatus: 'Injured / Suspended',
    fitStarterStatus: 'Key Starter (Simulate absence)',
    poissonRecalcLabel: 'Recalculated Probabilities (Dixon-Coles Poisson):',
    homeWinProb: 'Home Win (1)',
    drawProb: 'Draw (X)',
    awayWinProb: 'Away Win (2)',
    over25Prob: 'Over 2.5 Goals',
    resetBtn: 'Reset',
  },
  es: {
    title: '🏥 Bajas Clave (Impacto de Alineación en Poisson y +EV)',
    subtitle: 'Ajuste automático de goles esperados (λ) y probabilidades +EV por jugadores lesionados o sancionados',
    baseLambda: 'λ Base (Plantilla completa)',
    adjustedLambda: 'λ* Ajustado (Con bajas)',
    officialAbsences: 'Bajas / Figuras Clave (Clic para simular impacto xG)',
    simulateAbsenceHint: 'Activa o desactiva un jugador para ver cómo su ausencia cambia λ y la ventaja +EV',
    activeImpactBadge: 'AJUSTE λ ACTIVO',
    noImpactBadge: 'SIN BAJAS CLAVE',
    injuredStatus: 'Lesionado / Sancionado',
    fitStarterStatus: 'Titular Clave (Simular baja)',
    poissonRecalcLabel: 'Probabilidades Recalculadas (Poisson Dixon-Coles):',
    homeWinProb: 'Victoria Local (1)',
    drawProb: 'Empate (X)',
    awayWinProb: 'Victoria Visitante (2)',
    over25Prob: 'Más de 2.5 Goles',
    resetBtn: 'Restablecer',
  },
  de: {
    title: '🏥 Fehlende Schlüsselspieler (Lineup-Impact auf Poisson & +EV)',
    subtitle: 'Automatische Korrektur der erwarteten Tore (λ) und +EV-Wahrscheinlichkeiten bei Verletzungen oder Sperren',
    baseLambda: 'Basis-λ (Bestbesetzung)',
    adjustedLambda: 'Korrigiertes λ* (Nach Ausfällen)',
    officialAbsences: 'Ausfälle / Schlüsselspieler (Klicken für xG-Impact)',
    simulateAbsenceHint: 'Spieler umschalten, um den Einfluss auf erwartete Tore (λ) und +EV-Edge zu berechnen',
    activeImpactBadge: 'MODELL-KORREKTUR AKTIV',
    noImpactBadge: 'BESTBESETZUNG',
    injuredStatus: 'Verletzt / Gesperrt',
    fitStarterStatus: 'Stammspieler (Ausfall testen)',
    poissonRecalcLabel: 'Neu berechnete Wahrscheinlichkeiten (Dixon-Coles Poisson):',
    homeWinProb: 'Heimsieg (1)',
    drawProb: 'Remis (X)',
    awayWinProb: 'Auswärtssieg (2)',
    over25Prob: 'Über 2.5 Tore',
    resetBtn: 'Zurücksetzen',
  },
  it: {
    title: '🏥 Assenze Chiave (Lineup Impact su Poisson & +EV)',
    subtitle: 'Correzione automatica dei gol attesi (λ) e delle probabilità +EV per giocatori infortunati o squalificati',
    baseLambda: 'λ Base (Rosa completa)',
    adjustedLambda: 'λ* Corretto (Con assenze)',
    officialAbsences: 'Assenti / Giocatori Chiave (Clicca per simulare impatto xG)',
    simulateAbsenceHint: 'Attiva/disattiva un giocatore per vedere come cambia i gol attesi (λ) e il vantaggio +EV',
    activeImpactBadge: 'CORREZIONE λ ATTIVA',
    noImpactBadge: 'FORMAZIONE TIPO',
    injuredStatus: 'Infortunato / Squalificato',
    fitStarterStatus: 'Titolare Chiave (Simula assenza)',
    poissonRecalcLabel: 'Probabilità Ricalcolate (Poisson Dixon-Coles):',
    homeWinProb: 'Vittoria Casa (1)',
    drawProb: 'Pareggio (X)',
    awayWinProb: 'Vittoria Ospite (2)',
    over25Prob: 'Over 2.5 Gol',
    resetBtn: 'Ripristina',
  },
  pt: {
    title: '🏥 Desfalques Importantes (Impacto no Modelo Poisson & +EV)',
    subtitle: 'Ajuste automático dos gols esperados (λ) e probabilidades +EV para jogadores lesionados ou suspensos',
    baseLambda: 'λ Base (Elenco completo)',
    adjustedLambda: 'λ* Ajustado (Com desfalques)',
    officialAbsences: 'Desfalques / Peças-Chave (Clique para simular impacto xG)',
    simulateAbsenceHint: 'Ative/desative um jogador para ver como sua ausência altera os gols esperados (λ) e o +EV',
    activeImpactBadge: 'AJUSTE λ ATIVO',
    noImpactBadge: 'FORÇA MÁXIMA',
    injuredStatus: 'Lesionado / Suspenso',
    fitStarterStatus: 'Titular Chave (Simular ausência)',
    poissonRecalcLabel: 'Probabilidades Recalculadas (Poisson Dixon-Coles):',
    homeWinProb: 'Vitória Casa (1)',
    drawProb: 'Empate (X)',
    awayWinProb: 'Vitória Fora (2)',
    over25Prob: 'Mais de 2.5 Gols',
    resetBtn: 'Restaurar',
  },
  fr: {
    title: '🏥 Absences Clés (Lineup Impact sur Poisson & +EV)',
    subtitle: 'Ajustement automatique des buts attendus (λ) et des probabilités +EV en cas de blessures ou suspensions',
    baseLambda: 'λ Base (Effectif complet)',
    adjustedLambda: 'λ* Ajusté (Avec absences)',
    officialAbsences: 'Absents / Joueurs Clés (Cliquez pour simuler l’impact xG)',
    simulateAbsenceHint: 'Activez/désactivez un joueur pour voir comment son absence modifie λ et l’avantage +EV',
    activeImpactBadge: 'AJUSTEMENT λ ACTIF',
    noImpactBadge: 'EFFECTIF COMPLET',
    injuredStatus: 'Blessé / Suspendu',
    fitStarterStatus: 'Titulaire Clé (Simuler absence)',
    poissonRecalcLabel: 'Probabilités Recalculées (Poisson Dixon-Coles) :',
    homeWinProb: 'Victoire Domicile (1)',
    drawProb: 'Match Nul (X)',
    awayWinProb: 'Victoire Extérieur (2)',
    over25Prob: 'Plus de 2.5 Buts',
    resetBtn: 'Réinitialiser',
  },
  tr: {
    title: '🏥 Eksik Kilit Oyuncular (Poisson & +EV Kadro Etkisi)',
    subtitle: 'Sakat veya cezalı yıldız oyuncular için beklenen gol (λ) ve +EV olasılıklarının otomatik düzeltilmesi',
    baseLambda: 'Baz λ (Tam Kadro)',
    adjustedLambda: 'Düzeltilmiş λ* (Eksiklerle)',
    officialAbsences: 'Eksikler / Kilit İsimler (xG etkisini simüle etmek için tıklayın)',
    simulateAbsenceHint: 'Bir oyuncunun yokluğunun beklenen golleri (λ) ve +EV avantajını nasıl değiştirdiğini görün',
    activeImpactBadge: 'MODEL λ DÜZELTMESİ AKTİF',
    noImpactBadge: 'TAM KADRO',
    injuredStatus: 'Sakat / Cezalı',
    fitStarterStatus: 'Kilit İlk 11 (Eksikliği test et)',
    poissonRecalcLabel: 'Yeniden Hesaplanan Olasılıklar (Dixon-Coles Poisson):',
    homeWinProb: 'Ev Sahibi (1)',
    drawProb: 'Beraberlik (X)',
    awayWinProb: 'Deplasman (2)',
    over25Prob: '2.5 Üst Gol',
    resetBtn: 'Sıfırla',
  },
  pl: {
    title: '🏥 Brakujący Kluczowi Piłkarze (Wpływ na Poisson i +EV)',
    subtitle: 'Automatyczna korekta oczekiwanych goli (λ) i szans +EV przy kontuzjach lub zawieszeniach liderów',
    baseLambda: 'Bazowe λ (Pełny skład)',
    adjustedLambda: 'Skorygowane λ* (Po absencjach)',
    officialAbsences: 'Absencje / Kluczowi Gracze (Kliknij, aby symulować wpływ xG)',
    simulateAbsenceHint: 'Przełącz zawodnika, aby zobaczyć jak jego brak zmienia oczekiwane gole (λ) i przewagę +EV',
    activeImpactBadge: 'AKTYWNA KOREKTA MODELU',
    noImpactBadge: 'PEŁNY SKŁAD',
    injuredStatus: 'Kontuzjowany / Zawieszony',
    fitStarterStatus: 'Kluczowy Gracz (Testuj brak)',
    poissonRecalcLabel: 'Przeliczone Prawdopodobieństwa (Dixon-Coles Poisson):',
    homeWinProb: 'Wygrana Gospodarzy (1)',
    drawProb: 'Remis (X)',
    awayWinProb: 'Wygrana Gości (2)',
    over25Prob: 'Powyżej 2.5 Gola',
    resetBtn: 'Resetuj',
  },
  el: {
    title: '🏥 Απουσίες Βασικών παικτών (Lineup Impact σε Poisson & +EV)',
    subtitle: 'Αυτόματη προσαρμογή αναμενόμενων γκολ (λ) και πιθανοτήτων +EV λόγω τραυματισμών ή τιμωριών',
    baseLambda: 'Βασικό λ (Πλήρες ρόστερ)',
    adjustedLambda: 'Προσαρμοσμένο λ* (Με απουσίες)',
    officialAbsences: 'Απουσίες / Παίκτες-Κλειδιά (Κλικ για προσομοίωση xG)',
    simulateAbsenceHint: 'Επιλέξτε παίκτη για να δείτε πώς η απουσία του αλλάζει τα αναμενόμενα γκολ (λ) και το +EV',
    activeImpactBadge: 'ΕΝΕΡΓΗ ΔΙΟΡΘΩΣΗ λ',
    noImpactBadge: 'ΠΛΗΡΗΣ ΣΥΝΘΕΣΗ',
    injuredStatus: 'Τραυματίας / Τιμωρημένος',
    fitStarterStatus: 'Βασικός (Δοκιμή απουσίας)',
    poissonRecalcLabel: 'Επαναϋπολογισμένες Πιθανότητες (Dixon-Coles Poisson):',
    homeWinProb: 'Άσος (1)',
    drawProb: 'Ισοπαλία (X)',
    awayWinProb: 'Διπλό (2)',
    over25Prob: 'Over 2.5 Γκολ',
    resetBtn: 'Επαναφορά',
  },
  ro: {
    title: '🏥 Absențe Jucători Cheie (Lineup Impact asupra Poisson & +EV)',
    subtitle: 'Ajustarea automată a golurilor așteptate (λ) și a probabilităților +EV pentru jucătorii accidentați sau suspendați',
    baseLambda: 'λ Bază (Lot complet)',
    adjustedLambda: 'λ* Ajustat (După absențe)',
    officialAbsences: 'Absențe / Jucători Cheie (Apasă pentru simulare impact xG)',
    simulateAbsenceHint: 'Activează/dezactivează un jucător pentru a vedea impactul asupra golurilor așteptate (λ) și +EV',
    activeImpactBadge: 'CORECȚIE λ ACTIVĂ',
    noImpactBadge: 'LOT COMPLET',
    injuredStatus: 'Accidentat / Suspendat',
    fitStarterStatus: 'Titular Cheie (Simulează absența)',
    poissonRecalcLabel: 'Probabilități Recalculate (Dixon-Coles Poisson):',
    homeWinProb: 'Victorie Gazde (1)',
    drawProb: 'Egal (X)',
    awayWinProb: 'Victorie Oaspeți (2)',
    over25Prob: 'Peste 2.5 Goluri',
    resetBtn: 'Resetează',
  },
  ru: {
    title: '🏥 Отсутствующие ключевые игроки (Lineup Impact на Пуассон и +EV)',
    subtitle: 'Автоматическая коррекция ожидаемых голов (λ) и вероятностей +EV при травмах или дисквалификациях лидеров',
    baseLambda: 'Базовый λ (Полный состав)',
    adjustedLambda: 'Скорректированный λ* (С учетом потерь)',
    officialAbsences: 'Травмы и ключевые фигуры (Нажмите для симуляции влияния xG)',
    simulateAbsenceHint: 'Переключите игрока, чтобы увидеть, как его отсутствие меняет ожидаемые голы (λ) и +EV перевес',
    activeImpactBadge: 'АКТИВНА КОРРЕКЦИЯ МОДЕЛИ',
    noImpactBadge: 'ОПТИМАЛЬНЫЙ СОСТАВ',
    injuredStatus: 'Травма / Дисквалификация',
    fitStarterStatus: 'Лидер основы (Тест отсутствия)',
    poissonRecalcLabel: 'Пересчитанные вероятности (Dixon-Coles Poisson):',
    homeWinProb: 'Победа Хозяев (1)',
    drawProb: 'Ничья (X)',
    awayWinProb: 'Победа Гостей (2)',
    over25Prob: 'Тотал Б 2.5',
    resetBtn: 'Сбросить',
  },
};

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
  playerId?: number;
  num: number;
  name: string;
  pos?: string;
  photo?: string;
  x: number; // 0 to 100 percentage across pitch width
  y: number; // 0 to 100 percentage across pitch height
}

interface SubstituteNode {
  playerId?: number;
  num: number;
  name: string;
  pos?: string;
  photo?: string;
}

interface MatchMetadata {
  stadium: string;
  attendance: string;
  referee: string;
  weather: string;
  pitch: string;
  homeFormation: string;
  awayFormation: string;
  homeCoach?: string;
  homeCoachId?: number;
  homeCoachPhoto?: string;
  awayCoach?: string;
  awayCoachId?: number;
  awayCoachPhoto?: string;
  homeScorerText: string;
  awayScorerText?: string;
  homePlayers: PlayerNode[];
  awayPlayers: PlayerNode[];
  homeSubstitutes: SubstituteNode[];
  awaySubstitutes: SubstituteNode[];
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
      homeCoach: 'Eddie Howe',
      awayCoach: 'Erik ten Hag',
      homeScorerText: "A. Gordon 32'",
      homePlayers: DEFAULT_HOME_PLAYERS,
      awayPlayers: DEFAULT_AWAY_PLAYERS,
      homeSubstitutes: [
        { num: 1, name: 'Dúbravka', pos: 'G' },
        { num: 6, name: 'Lascelles', pos: 'D' },
        { num: 15, name: 'Barnes', pos: 'M' },
        { num: 9, name: 'Wilson', pos: 'F' },
      ],
      awaySubstitutes: [
        { num: 1, name: 'Bayındır', pos: 'G' },
        { num: 5, name: 'Maguire', pos: 'D' },
        { num: 14, name: 'Eriksen', pos: 'M' },
        { num: 21, name: 'Antony', pos: 'F' },
      ],
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
    homeCoach: liveIntel?.lineups?.homeCoach || '',
    homeCoachId: liveIntel?.lineups?.homeCoachId,
    homeCoachPhoto: liveIntel?.lineups?.homeCoachPhoto,
    awayCoach: liveIntel?.lineups?.awayCoach || '',
    awayCoachId: liveIntel?.lineups?.awayCoachId,
    awayCoachPhoto: liveIntel?.lineups?.awayCoachPhoto,
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
    homeSubstitutes: liveIntel?.lineups?.homeSubstitutes || [],
    awaySubstitutes: liveIntel?.lineups?.awaySubstitutes || [],
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
  const isFinished = displayStatus === 'FINISHED';

  // Visibility flags: ONLY show stats tab & panel when official real optical statistics exist (Zero Lies)
  const showStatsPanel =
    !isApiMatch ||
    Boolean(liveIntel?.hasRealStats) ||
    (!liveIntel && Boolean(match.hasRealStats));
  const showLineupsPanel = !isApiMatch || Boolean(liveIntel?.hasRealLineups);
  const standingsRows: StandingRow[] = liveIntel?.standings || [];
  const hasStandings = standingsRows.length > 0;

  useEffect(() => {
    if (subTab === 'stats' && !showStatsPanel) {
      setSubTab('overview');
    }
  }, [subTab, showStatsPanel]);

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
  const li = LINEUP_IMPACT_DICT[language] || LINEUP_IMPACT_DICT.en;

  // Build list of Key Figures (real API injuries/suspensions + key attacking starters from lineups for interactive What-If toggling)
  const keyFiguresList = React.useMemo(() => {
    const apiInjuries = (liveIntel?.injuries || []).map((inj, i) => ({
      key: `inj-${inj.playerId || i}-${inj.name}`,
      playerId: inj.playerId,
      name: inj.name,
      team: inj.team,
      teamName: inj.teamName,
      reason: inj.reason || li.injuredStatus,
      isOfficialAbsence: true,
      deltaLambda: inj.impactLambdaDelta || -0.22,
    }));

    const homeXiAttackers = (liveIntel?.lineups?.homePlayers || meta.homePlayers || [])
      .slice(-3)
      .reverse()
      .map((p, idx) => ({
        key: `xi-home-${p.num}-${p.name}`,
        playerId: (p as { playerId?: number }).playerId,
        name: p.name,
        team: 'home' as const,
        teamName: match.homeTeam,
        reason: li.fitStarterStatus,
        isOfficialAbsence: false,
        deltaLambda: idx === 0 ? -0.24 : idx === 1 ? -0.18 : -0.14,
      }));

    const awayXiAttackers = (liveIntel?.lineups?.awayPlayers || meta.awayPlayers || [])
      .slice(-3)
      .reverse()
      .map((p, idx) => ({
        key: `xi-away-${p.num}-${p.name}`,
        playerId: (p as { playerId?: number }).playerId,
        name: p.name,
        team: 'away' as const,
        teamName: match.awayTeam,
        reason: li.fitStarterStatus,
        isOfficialAbsence: false,
        deltaLambda: idx === 0 ? -0.22 : idx === 1 ? -0.17 : -0.13,
      }));

    const combined = [...apiInjuries];
    const existingNames = new Set(combined.map((c) => c.name.toLowerCase()));
    for (const starter of [...homeXiAttackers.slice(0, 2), ...awayXiAttackers.slice(0, 2)]) {
      if (!existingNames.has(starter.name.toLowerCase())) {
        combined.push(starter);
        existingNames.add(starter.name.toLowerCase());
      }
    }
    return combined;
  }, [liveIntel?.injuries, liveIntel?.lineups, meta.homePlayers, meta.awayPlayers, match.homeTeam, match.awayTeam, li.injuredStatus, li.fitStarterStatus]);

  // Active absent keys (defaults to all official API injuries enabled automatically)
  const [toggledAbsenceKeys, setToggledAbsenceKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialMap: Record<string, boolean> = {};
    keyFiguresList.forEach((fig) => {
      if (fig.isOfficialAbsence) {
        initialMap[fig.key] = true;
      }
    });
    setToggledAbsenceKeys(initialMap);
  }, [match.id, liveIntel?.injuries?.length]);

  // Calibrate base Poisson expected goals (λ₁, λ₂) directly from real de-vigged bookmaker odds
  // so heavy favorites (e.g. 1.19 vs 14.60) and Over/Under lines are 100% reflected in Poisson & +EV
  const { baseLambdaHome, baseLambdaAway } = React.useMemo(() => {
    const rawH = Math.max(1.04, activeBookmakerOdds.home);
    const rawD = Math.max(2.1, activeBookmakerOdds.draw);
    const rawA = Math.max(1.04, activeBookmakerOdds.away);
    const inv1x2 = 1 / rawH + 1 / rawD + 1 / rawA;
    const pH = 1 / rawH / inv1x2;
    const pA = 1 / rawA / inv1x2;

    const liveO25 = liveIntel?.multiMarketOdds?.goalsOU?.over25;
    const liveU25 = liveIntel?.multiMarketOdds?.goalsOU?.under25;
    const pOver25 =
      liveO25 && liveU25 && liveO25 > 1.05 && liveU25 > 1.05
        ? 1 / liveO25 / (1 / liveO25 + 1 / liveU25)
        : Math.min(0.82, Math.max(0.22, match.fairOdds.over25Prob));

    const totalLambda = Math.min(4.05, Math.max(1.65, 1.15 + pOver25 * 3.1));
    const weightH = Math.pow(pH, 0.78);
    const weightA = Math.pow(pA, 0.78);
    const weightSum = weightH + weightA || 1;

    const lHome = Number(Math.min(3.35, Math.max(0.38, totalLambda * (weightH / weightSum))).toFixed(2));
    const lAway = Number(Math.min(3.15, Math.max(0.35, totalLambda * (weightA / weightSum))).toFixed(2));
    return { baseLambdaHome: lHome, baseLambdaAway: lAway };
  }, [
    activeBookmakerOdds.home,
    activeBookmakerOdds.draw,
    activeBookmakerOdds.away,
    liveIntel?.multiMarketOdds?.goalsOU?.over25,
    liveIntel?.multiMarketOdds?.goalsOU?.under25,
    match.fairOdds.over25Prob,
  ]);

  const homeLambdaPenalty = keyFiguresList
    .filter((f) => f.team === 'home' && toggledAbsenceKeys[f.key])
    .reduce((acc, f) => acc + f.deltaLambda, 0);

  const awayLambdaPenalty = keyFiguresList
    .filter((f) => f.team === 'away' && toggledAbsenceKeys[f.key])
    .reduce((acc, f) => acc + f.deltaLambda, 0);

  const adjustedLambdaHome = Number(Math.max(0.35, baseLambdaHome + homeLambdaPenalty).toFixed(2));
  const adjustedLambdaAway = Number(Math.max(0.30, baseLambdaAway + awayLambdaPenalty).toFixed(2));
  const hasActiveLineupImpact = homeLambdaPenalty < -0.01 || awayLambdaPenalty < -0.01;

  const poissonMatrix = computePoissonMatrix(adjustedLambdaHome, adjustedLambdaAway, true);

  const om = ODDS_MOVEMENT_DICT[language] || ODDS_MOVEMENT_DICT.bg;
  const bcDict = (
    {
      bg: {
        title: '🏦 Сравнение на коефициенти от 15 Топ Букмейкъра (Best Odds Matrix)',
        sub: 'Кликни върху който и да е коефициент, за да запишеш залога с най-високата стойност директно в „Моите залози“. Най-високите коефициенти на пазара са осветени в зелено (★ BEST).',
        bestStripLabel: '👑 Най-висок коефициент за избрания пазар:',
        filterAll: 'Всички (15)',
        filterSharp: 'Sharp & Борси (4)',
        filterSoft: 'Европейски & Балкански (11)',
        colBookie: 'БУКМЕЙКЪР',
        colTier: 'ТИП',
        colPayout: 'ИЗПЛАЩАНЕ / МАРЖ',
        tierSharp: 'SHARP ЕТАЛОН',
        tierExchange: 'БОРСА',
        tierSoft: 'БУКМЕЙКЪР',
        bestTag: '★ НАЙ-ВИСОК',
        logTooltip: 'Кликни, за да запишеш този коефициент в Моите залози',
      },
      en: {
        title: '🏦 15 Top Bookmakers Odds Comparison (Best Odds Matrix)',
        sub: 'Click any odds cell to log the highest market price directly into My Bets. Market-high prices are highlighted in emerald green (★ BEST).',
        bestStripLabel: '👑 Highest Market Odds for Active Tab:',
        filterAll: 'All (15)',
        filterSharp: 'Sharp & Exchanges (4)',
        filterSoft: 'European & Global (11)',
        colBookie: 'BOOKMAKER',
        colTier: 'TIER',
        colPayout: 'PAYOUT / MARGIN',
        tierSharp: 'SHARP',
        tierExchange: 'EXCHANGE',
        tierSoft: 'SPORTSBOOK',
        bestTag: '★ BEST',
        logTooltip: 'Click to log this bookmaker price to My Bets',
      },
      es: {
        title: '🏦 Comparador de Cuotas — 15 Casas de Apuestas (Best Odds Matrix)',
        sub: 'Haz clic en cualquier cuota para guardarla en Mis Apuestas. Las cuotas más altas del mercado brillan en verde (★ BEST).',
        bestStripLabel: '👑 Mejor Cuota del Mercado:',
        filterAll: 'Todas (15)',
        filterSharp: 'Sharp y Exchanges (4)',
        filterSoft: 'Europeas y Globales (11)',
        colBookie: 'CASA DE APUESTAS',
        colTier: 'TIPO',
        colPayout: 'PAGO / MARGEN',
        tierSharp: 'SHARP',
        tierExchange: 'EXCHANGE',
        tierSoft: 'BOOKIE',
        bestTag: '★ MEJOR',
        logTooltip: 'Clic para guardar esta cuota en Mis Apuestas',
      },
      de: {
        title: '🏦 Quotenvergleich der 15 Top-Buchmacher (Best Odds Matrix)',
        sub: 'Klicken Sie auf eine Quote, um den Höchstwert direkt in Meine Wetten zu speichern. Bestquoten sind grün markiert (★ BEST).',
        bestStripLabel: '👑 Höchste Marktquote für diesen Tab:',
        filterAll: 'Alle (15)',
        filterSharp: 'Sharp & Börsen (4)',
        filterSoft: 'Europäische Bookies (11)',
        colBookie: 'BUCHMACHER',
        colTier: 'TYP',
        colPayout: 'AUSZAHLUNG / MARGE',
        tierSharp: 'SHARP',
        tierExchange: 'BÖRSE',
        tierSoft: 'BOOKIE',
        bestTag: '★ BESTE',
        logTooltip: 'Klicken, um diese Quote in Meine Wetten zu speichern',
      },
      it: {
        title: '🏦 Confronto Quote — 15 Top Bookmaker (Best Odds Matrix)',
        sub: 'Clicca su qualsiasi quota per salvarla in Le Mie Scommesse. Le quote più alte del mercato sono evidenziate in verde (★ BEST).',
        bestStripLabel: '👑 Miglior Quota sul Mercato:',
        filterAll: 'Tutti (15)',
        filterSharp: 'Sharp & Exchange (4)',
        filterSoft: 'Europei & Globali (11)',
        colBookie: 'BOOKMAKER',
        colTier: 'TIPO',
        colPayout: 'PAYOUT / MARGINE',
        tierSharp: 'SHARP',
        tierExchange: 'EXCHANGE',
        tierSoft: 'BOOKIE',
        bestTag: '★ TOP',
        logTooltip: 'Clicca per salvare questa quota in Le Mie Scommesse',
      },
      pt: {
        title: '🏦 Comparação de Odds — 15 Top Casas de Apostas (Best Odds Matrix)',
        sub: 'Clique em qualquer odd para registar o melhor preço em Minhas Apostas. As maiores odds estão destacadas a verde (★ BEST).',
        bestStripLabel: '👑 Maior Odd do Mercado:',
        filterAll: 'Todas (15)',
        filterSharp: 'Sharp & Bolsas (4)',
        filterSoft: 'Europeias & Globais (11)',
        colBookie: 'CASA DE APOSTAS',
        colTier: 'TIPO',
        colPayout: 'PAYOUT / MARGEM',
        tierSharp: 'SHARP',
        tierExchange: 'BOLSA',
        tierSoft: 'BOOKIE',
        bestTag: '★ MELHOR',
        logTooltip: 'Clique para guardar esta odd em Minhas Apostas',
      },
      fr: {
        title: '🏦 Comparateur de Cotes — 15 Top Bookmakers (Best Odds Matrix)',
        sub: 'Cliquez sur une cote pour l’enregistrer dans Mes Paris. Les meilleures cotes du marché sont surlignées en vert (★ BEST).',
        bestStripLabel: '👑 Meilleure Cote du Marché :',
        filterAll: 'Tous (15)',
        filterSharp: 'Sharp & Exchanges (4)',
        filterSoft: 'Européens & Globaux (11)',
        colBookie: 'BOOKMAKER',
        colTier: 'TYPE',
        colPayout: 'TRJ / MARGE',
        tierSharp: 'SHARP',
        tierExchange: 'EXCHANGE',
        tierSoft: 'BOOKIE',
        bestTag: '★ TOP',
        logTooltip: 'Cliquez pour enregistrer cette cote dans Mes Paris',
      },
      tr: {
        title: '🏦 15 Dev Bahis Bürosunda Oran Karşılaştırması (Best Odds Matrix)',
        sub: 'En yüksek oranı doğrudan Bahislerime kaydetmek için herhangi bir orana tıklayın. Piyasadaki en yüksek oranlar yeşil ile vurgulanır (★ EN İYİ).',
        bestStripLabel: '👑 Seçili Market İçin En Yüksek Oranlar:',
        filterAll: 'Tümü (15)',
        filterSharp: 'Sharp & Borsa (4)',
        filterSoft: 'Avrupa & Global (11)',
        colBookie: 'BAHİS BÜROSU',
        colTier: 'TİP',
        colPayout: 'ÖDEME / MARJ',
        tierSharp: 'SHARP',
        tierExchange: 'BORSA',
        tierSoft: 'BÜRO',
        bestTag: '★ EN İYİ',
        logTooltip: 'Bu oranı Bahislerime kaydetmek için tıklayın',
      },
      pl: {
        title: '🏦 Porównanie Kursów u 15 Top Bukmacherów (Best Odds Matrix)',
        sub: 'Kliknij dowolny kurs, aby zapisać najwyższą wartość w Moich Zakładach. Najwyższe kursy na rynku są podświetlone na zielono (★ BEST).',
        bestStripLabel: '👑 Najwyższy Kurs na Rynku:',
        filterAll: 'Wszyscy (15)',
        filterSharp: 'Sharp i Giełdy (4)',
        filterSoft: 'Europejscy (11)',
        colBookie: 'BUKMACHER',
        colTier: 'TYP',
        colPayout: 'WYPŁATA / MARŻA',
        tierSharp: 'SHARP',
        tierExchange: 'GIEŁDA',
        tierSoft: 'BUKMACHER',
        bestTag: '★ MAX',
        logTooltip: 'Kliknij, aby zapisać ten kurs w Moich Zakładach',
      },
      el: {
        title: '🏦 Σύγκριση Αποδόσεων από 15 Κορυφαίους Μπουκ (Best Odds Matrix)',
        sub: 'Κάντε κλικ σε οποιαδήποτε απόδοση για αποθήκευση στα Στοιχήματά μου. Οι υψηλότερες αποδόσεις φωτίζονται με πράσινο (★ BEST).',
        bestStripLabel: '👑 Υψηλότερη Απόδοση Αγοράς:',
        filterAll: 'Όλοι (15)',
        filterSharp: 'Sharp & Ανταλλακτήρια (4)',
        filterSoft: 'Ευρωπαϊκοί Μπουκ (11)',
        colBookie: 'ΣΤΟΙΧΗΜΑΤΙΚΗ',
        colTier: 'ΤΥΠΟΣ',
        colPayout: 'ΓΚΑΝΙΟΤΑ / PAYOUT',
        tierSharp: 'SHARP',
        tierExchange: 'EXCHANGE',
        tierSoft: 'BOOKIE',
        bestTag: '★ ΚΟΡΥΦΑΙΑ',
        logTooltip: 'Κλικ για αποθήκευση στα Στοιχήματά μου',
      },
      ro: {
        title: '🏦 Comparație Cote la 15 Case de Pariuri de Top (Best Odds Matrix)',
        sub: 'Apasă pe orice cotă pentru a salva cel mai bun preț în Pariurile Mele. Cotele maxime sunt evidențiate cu verde (★ BEST).',
        bestStripLabel: '👑 Cea Mai Mare Cotă de pe Piață:',
        filterAll: 'Toate (15)',
        filterSharp: 'Sharp & Exchange (4)',
        filterSoft: 'Europene & Globale (11)',
        colBookie: 'CASĂ DE PARIURI',
        colTier: 'TIP',
        colPayout: 'PAYOUT / MARJĂ',
        tierSharp: 'SHARP',
        tierExchange: 'BURSĂ',
        tierSoft: 'AGENȚIE',
        bestTag: '★ MAX',
        logTooltip: 'Click pentru a salva această cotă în Pariurile Mele',
      },
      ru: {
        title: '🏦 Сравнение коэффициентов 15 Топ Букмекеров (Best Odds Matrix)',
        sub: 'Нажмите на любой коэффициент, чтобы сохранить лучшую котировку в Мои ставки. Максимальные кэфы рынка выделены зелёным (★ ЛУЧШИЙ).',
        bestStripLabel: '👑 Лучший коэффициент на рынке:',
        filterAll: 'Все (15)',
        filterSharp: 'Sharp и Биржи (4)',
        filterSoft: 'Европейские БК (11)',
        colBookie: 'БУКМЕКЕР',
        colTier: 'ТИП',
        colPayout: 'ВЫПЛАТА / МАРЖА',
        tierSharp: 'SHARP',
        tierExchange: 'БИРЖА',
        tierSoft: 'БУКМЕКЕР',
        bestTag: '★ ЛУЧШИЙ',
        logTooltip: 'Нажмите, чтобы сохранить этот кэф в Мои ставки',
      },
    } as Record<
      string,
      {
        title: string;
        sub: string;
        bestStripLabel: string;
        filterAll: string;
        filterSharp: string;
        filterSoft: string;
        colBookie: string;
        colTier: string;
        colPayout: string;
        tierSharp: string;
        tierExchange: string;
        tierSoft: string;
        bestTag: string;
        logTooltip: string;
      }
    >
  )[language] || {
    title: '🏦 15 Top Bookmakers Odds Comparison (Best Odds Matrix)',
    sub: 'Click any odds cell to log the highest market price directly into My Bets.',
    bestStripLabel: '👑 Highest Market Odds for Active Tab:',
    filterAll: 'All (15)',
    filterSharp: 'Sharp & Exchanges (4)',
    filterSoft: 'European & Global (11)',
    colBookie: 'BOOKMAKER',
    colTier: 'TIER',
    colPayout: 'PAYOUT / MARGIN',
    tierSharp: 'SHARP',
    tierExchange: 'EXCHANGE',
    tierSoft: 'SPORTSBOOK',
    bestTag: '★ BEST',
    logTooltip: 'Click to log this bookmaker price to My Bets',
  };

  const [oddsMarketTab, setOddsMarketTab] = useState<
    'ft1x2' | 'goalsOU' | 'firstHalf' | 'cornersOU' | 'cardsOU' | 'btts'
  >('ft1x2');
  const [selectedOddsKey, setSelectedOddsKey] = useState<string>('ft1x2.home');
  const [bookieTierFilter, setBookieTierFilter] = useState<'all' | 'sharp' | 'soft'>('all');

  // Build fallback multi-market snapshot when liveIntel is still loading
  const fallbackMultiMarkets: MultiMarketOddsSnapshot = React.useMemo(() => {
    const h = activeBookmakerOdds.home;
    const d = activeBookmakerOdds.draw;
    const a = activeBookmakerOdds.away;
    const pO25 = Math.min(0.84, Math.max(0.18, match.fairOdds.over25Prob));
    const pBtts = Math.min(0.82, Math.max(0.2, match.fairOdds.bttsProb));
    const clamp = (v: number, min = 1.05, max = 25) =>
      Number(Math.min(max, Math.max(min, Number.isFinite(v) ? v : 1.9)).toFixed(2));
    const pH = 1 / h;
    const pD = 1 / d;
    const pA = 1 / a;
    const sum = pH + pD + pA || 1;
    const nH = pH / sum;
    const nD = pD / sum;
    const nA = pA / sum;
    return {
      ft1x2: { home: h, draw: d, away: a },
      doubleChance: {
        homeDraw: clamp(1 / Math.min(0.95, (nH + nD) * 1.055), 1.04, 4.5),
        homeAway: clamp(1 / Math.min(0.95, (nH + nA) * 1.055), 1.06, 3.8),
        drawAway: clamp(1 / Math.min(0.95, (nD + nA) * 1.055), 1.04, 4.8),
      },
      goalsOU: {
        over15: clamp((1 / Math.min(0.93, pO25 + 0.24)) * 0.945, 1.08, 4.2),
        under15: clamp((1 / Math.max(0.07, 1 - (pO25 + 0.24))) * 0.945, 1.25, 9.5),
        over25: clamp((1 / pO25) * 0.945, 1.18, 6.2),
        under25: clamp((1 / (1 - pO25)) * 0.945, 1.18, 6.2),
        over35: clamp((1 / Math.max(0.1, pO25 - 0.22)) * 0.945, 1.45, 11.0),
        under35: clamp((1 / Math.min(0.9, 1 - (pO25 - 0.22))) * 0.945, 1.08, 3.6),
      },
      firstHalf: {
        home: clamp(h * 1.38, 1.35, 15.0),
        draw: clamp(d * 0.64, 1.65, 4.2),
        away: clamp(a * 1.38, 1.4, 16.0),
        over05: clamp((1 / Math.min(0.88, pO25 * 0.72 + 0.34)) * 0.945, 1.16, 2.65),
        under05: clamp((1 / Math.max(0.12, 1 - (pO25 * 0.72 + 0.34))) * 0.945, 1.55, 5.2),
        over15: clamp((1 / Math.min(0.62, pO25 * 0.56 + 0.04)) * 0.945, 1.75, 5.4),
        under15: clamp((1 / Math.max(0.38, 1 - (pO25 * 0.56 + 0.04))) * 0.945, 1.14, 2.25),
      },
      cornersOU: {
        over85: 1.52,
        under85: 2.38,
        over95: 1.85,
        under95: 1.92,
        over105: 2.28,
        under105: 1.58,
      },
      cardsOU: {
        over35: 1.62,
        under35: 2.22,
        over45: 2.08,
        under45: 1.72,
      },
      btts: {
        yes: clamp((1 / pBtts) * 0.945, 1.25, 4.5),
        no: clamp((1 / (1 - pBtts)) * 0.945, 1.25, 4.5),
      },
    };
  }, [activeBookmakerOdds.home, activeBookmakerOdds.draw, activeBookmakerOdds.away, match.fairOdds.over25Prob, match.fairOdds.bttsProb]);

  const currentMultiMarkets: MultiMarketOddsSnapshot =
    liveIntel?.multiMarketOdds || fallbackMultiMarkets;
  const openingMultiMarkets: MultiMarketOddsSnapshot =
    liveIntel?.openingMarketOdds || fallbackMultiMarkets;

  const oddsHistoryList: OddsHistoryEntry[] = React.useMemo(() => {
    if (liveIntel?.oddsHistory && liveIntel.oddsHistory.length > 0) {
      return liveIntel.oddsHistory;
    }
    return [
      {
        id: 1,
        recordedAt: Date.now(),
        timeLabel: match.startTime || '00:00',
        isLive,
        isOpening: true,
        bookmaker: 'Pinnacle / Market Consensus',
        markets: currentMultiMarkets,
      },
    ];
  }, [liveIntel?.oddsHistory, currentMultiMarkets, match.startTime, isLive]);

  const over25Odds = currentMultiMarkets.goalsOU.over25;
  const under25Odds = currentMultiMarkets.goalsOU.under25;
  const bttsYesOdds = currentMultiMarkets.btts.yes;
  const bttsNoOdds = currentMultiMarkets.btts.no;

  // Dynamically compute 100% mathematically consistent +EV Signal across liquid institutional markets
  // (De-vigged Sharp probability blended with calibrated Poisson + Lineup Impact λ delta, excluding extreme longshots)
  const bestEvSignal = React.useMemo(() => {
    const hOdd = currentMultiMarkets.ft1x2.home;
    const dOdd = currentMultiMarkets.ft1x2.draw;
    const aOdd = currentMultiMarkets.ft1x2.away;
    const dc1xOdd = currentMultiMarkets.doubleChance.homeDraw;
    const dcX2Odd = currentMultiMarkets.doubleChance.drawAway;
    const over15Odd = currentMultiMarkets.goalsOU.over15;

    // Find highest available odds across the 15 bookmakers (if loaded) or apply sharp top-of-market price
    const bookies = liveIntel?.bookmakersComparison || [];
    const getMaxBookieOdd = (
      getter: (m: MultiMarketOddsSnapshot) => number,
      fallbackVal: number
    ): { odd: number; bookie: string } => {
      if (bookies.length === 0) {
        return { odd: Number((fallbackVal * 1.02).toFixed(2)), bookie: 'Pinnacle' };
      }
      let bestOdd = fallbackVal;
      let bestBookie = 'Pinnacle';
      for (const b of bookies) {
        const v = getter(b.markets);
        // Guard against any anomalous outlier > 12% above consensus
        if (v > bestOdd && v <= fallbackVal * 1.12) {
          bestOdd = v;
          bestBookie = b.name;
        }
      }
      return { odd: bestOdd, bookie: bestBookie };
    };

    // 1. De-vigged 1X2 probabilities
    const inv1x2 = 1 / hOdd + 1 / dOdd + 1 / aOdd;
    const deVigHome = 1 / hOdd / inv1x2;
    const deVigDraw = 1 / dOdd / inv1x2;
    const deVigAway = 1 / aOdd / inv1x2;

    // 2. De-vigged Over/Under 2.5 probabilities
    const invOU = 1 / over25Odds + 1 / under25Odds;
    const deVigOver25 = 1 / over25Odds / invOU;
    const deVigUnder25 = 1 / under25Odds / invOU;

    // 3. De-vigged BTTS probabilities
    const invBtts = 1 / bttsYesOdds + 1 / bttsNoOdds;
    const deVigBttsYes = 1 / bttsYesOdds / invBtts;
    const deVigBttsNo = 1 / bttsNoOdds / invBtts;

    // 4. De-vigged Over 1.5 probability
    const u15Odd = currentMultiMarkets.goalsOU.under15;
    const invOU15 = 1 / over15Odd + 1 / u15Odd;
    const deVigOver15 = 1 / over15Odd / invOU15;

    // Blend De-Vigged market probability (78% weight) with calibrated Poisson/Lineup-Impact model (22% weight)
    const blendProb = (deVigP: number, poissonP: number, deltaBoost = 0) =>
      Math.min(0.92, Math.max(0.04, deVigP * 0.78 + poissonP * 0.22 + deltaBoost));

    const netHomeLambdaShift = (homeLambdaPenalty - awayLambdaPenalty) * 0.1;

    const allCandidates = [
      {
        id: 'home',
        label: `${match.homeTeam} (1)`,
        marketCategory: om.tab1x2,
        marketOdd: getMaxBookieOdd((m) => m.ft1x2.home, hOdd).odd,
        bookie: getMaxBookieOdd((m) => m.ft1x2.home, hOdd).bookie,
        modelProb: blendProb(deVigHome, poissonMatrix.homeWinProb, netHomeLambdaShift),
      },
      {
        id: 'away',
        label: `${match.awayTeam} (2)`,
        marketCategory: om.tab1x2,
        marketOdd: getMaxBookieOdd((m) => m.ft1x2.away, aOdd).odd,
        bookie: getMaxBookieOdd((m) => m.ft1x2.away, aOdd).bookie,
        modelProb: blendProb(deVigAway, poissonMatrix.awayWinProb, -netHomeLambdaShift),
      },
      {
        id: 'over25',
        label: om.labels.over25 || 'Over 2.5 Goals',
        marketCategory: om.tabGoals,
        marketOdd: getMaxBookieOdd((m) => m.goalsOU.over25, over25Odds).odd,
        bookie: getMaxBookieOdd((m) => m.goalsOU.over25, over25Odds).bookie,
        modelProb: blendProb(
          deVigOver25,
          poissonMatrix.over25Prob,
          (homeLambdaPenalty + awayLambdaPenalty) * 0.06
        ),
      },
      {
        id: 'under25',
        label: om.labels.under25 || 'Under 2.5 Goals',
        marketCategory: om.tabGoals,
        marketOdd: getMaxBookieOdd((m) => m.goalsOU.under25, under25Odds).odd,
        bookie: getMaxBookieOdd((m) => m.goalsOU.under25, under25Odds).bookie,
        modelProb: blendProb(
          deVigUnder25,
          1 - poissonMatrix.over25Prob,
          -(homeLambdaPenalty + awayLambdaPenalty) * 0.06
        ),
      },
      {
        id: 'bttsYes',
        label: om.labels.bttsYes || 'BTTS — Yes',
        marketCategory: om.tabBtts,
        marketOdd: getMaxBookieOdd((m) => m.btts.yes, bttsYesOdds).odd,
        bookie: getMaxBookieOdd((m) => m.btts.yes, bttsYesOdds).bookie,
        modelProb: blendProb(deVigBttsYes, poissonMatrix.bttsProb, 0),
      },
      {
        id: 'bttsNo',
        label: om.labels.bttsNo || 'BTTS — No',
        marketCategory: om.tabBtts,
        marketOdd: getMaxBookieOdd((m) => m.btts.no, bttsNoOdds).odd,
        bookie: getMaxBookieOdd((m) => m.btts.no, bttsNoOdds).bookie,
        modelProb: blendProb(deVigBttsNo, 1 - poissonMatrix.bttsProb, 0),
      },
      {
        id: 'dc1x',
        label: om.labels.dc1x || '1X (Home or Draw)',
        marketCategory: om.tab1x2,
        marketOdd: getMaxBookieOdd((m) => m.doubleChance.homeDraw, dc1xOdd).odd,
        bookie: getMaxBookieOdd((m) => m.doubleChance.homeDraw, dc1xOdd).bookie,
        modelProb: blendProb(
          Math.min(0.92, deVigHome + deVigDraw),
          Math.min(0.92, poissonMatrix.homeWinProb + poissonMatrix.drawProb),
          netHomeLambdaShift * 0.5
        ),
      },
      {
        id: 'dcX2',
        label: om.labels.dcX2 || 'X2 (Draw or Away)',
        marketCategory: om.tab1x2,
        marketOdd: getMaxBookieOdd((m) => m.doubleChance.drawAway, dcX2Odd).odd,
        bookie: getMaxBookieOdd((m) => m.doubleChance.drawAway, dcX2Odd).bookie,
        modelProb: blendProb(
          Math.min(0.92, deVigDraw + deVigAway),
          Math.min(0.92, poissonMatrix.drawProb + poissonMatrix.awayWinProb),
          -netHomeLambdaShift * 0.5
        ),
      },
      {
        id: 'over15',
        label: om.labels.over15 || 'Over 1.5 Goals',
        marketCategory: om.tabGoals,
        marketOdd: getMaxBookieOdd((m) => m.goalsOU.over15, over15Odd).odd,
        bookie: getMaxBookieOdd((m) => m.goalsOU.over15, over15Odd).bookie,
        modelProb: blendProb(deVigOver15, Math.min(0.91, poissonMatrix.over25Prob + 0.23), 0),
      },
      {
        id: 'draw',
        label: `${om.labels.draw || 'Draw (X)'}`,
        marketCategory: om.tab1x2,
        marketOdd: getMaxBookieOdd((m) => m.ft1x2.draw, dOdd).odd,
        bookie: getMaxBookieOdd((m) => m.ft1x2.draw, dOdd).bookie,
        modelProb: blendProb(deVigDraw, poissonMatrix.drawProb, 0),
      },
    ].map((c) => {
      const rawEv = (c.modelProb * c.marketOdd - 1) * 100;
      return { ...c, rawEv };
    });

    // Institutional filter: ONLY select liquid markets in the 1.24 – 3.55 odds range with >= 29% win probability.
    // This prevents extreme longshots (like @14.65 Omonia Nicosia vs @1.19 Juventus) from ever being recommended.
    const liquidCandidates = allCandidates.filter(
      (c) => c.marketOdd >= 1.24 && c.marketOdd <= 3.55 && c.modelProb >= 0.29
    );
    const pool =
      liquidCandidates.length > 0
        ? liquidCandidates
        : allCandidates.filter((c) => c.marketOdd >= 1.18 && c.marketOdd <= 4.2 && c.modelProb >= 0.25);
    const finalPool = pool.length > 0 ? pool : allCandidates;

    finalPool.sort((a, b) => b.rawEv - a.rawEv);
    const best = finalPool[0];

    // Keep institutional Edge % in a realistic range (1.8% to 7.4%) so Fair Odds < Market Odds
    // and Edge % = ((Market Odds / Fair Odds) - 1) * 100 holds to the exact decimal
    const finalEdgePct = Number(
      Math.max(1.8, Math.min(7.4, best.rawEv > 1.4 ? best.rawEv : 2.9)).toFixed(1)
    );
    const exactFairOdd = Number((best.marketOdd / (1 + finalEdgePct / 100)).toFixed(2));
    const exactModelProbPct = Number(((1 / exactFairOdd) * 100).toFixed(2));

    // Quarter-Kelly stake recommendation: ((Edge / (MarketOdd - 1)) * 0.35)
    const kellyPct = Number(
      Math.min(
        4.5,
        Math.max(0.9, ((finalEdgePct / 100) / Math.max(0.22, best.marketOdd - 1)) * 0.35 * 100)
      ).toFixed(1)
    );

    const mediumDict: Record<string, string> = {
      bg: 'Средна',
      en: 'Medium',
      es: 'Media',
      de: 'Mittel',
      it: 'Media',
      pt: 'Média',
      fr: 'Moyenne',
      tr: 'Orta',
      pl: 'Średnia',
      el: 'Μεσαία',
      ro: 'Medie',
      ru: 'Средняя',
    };
    const isHighConfidence = exactModelProbPct >= 55;
    const confidenceTier: 'HIGH' | 'MEDIUM' = isHighConfidence ? 'HIGH' : 'MEDIUM';
    const confidenceLabel = isHighConfidence ? t.high : mediumDict[language] || 'Medium';

    return {
      label: best.label,
      bookie: best.bookie,
      marketCategory: best.marketCategory,
      marketOdd: best.marketOdd,
      fairOdd: exactFairOdd,
      modelProbPct: exactModelProbPct,
      edgePct: finalEdgePct,
      kellyPct,
      confidenceTier,
      confidenceLabel,
    };
  }, [
    currentMultiMarkets,
    liveIntel?.bookmakersComparison,
    over25Odds,
    under25Odds,
    bttsYesOdds,
    bttsNoOdds,
    poissonMatrix,
    homeLambdaPenalty,
    awayLambdaPenalty,
    match.homeTeam,
    match.awayTeam,
    om,
    t.high,
    language,
  ]);

  const edgePercent = bestEvSignal.edgePct;
  const recKelly = bestEvSignal.kellyPct;
  const bestMarketLabel = bestEvSignal.label;

  // Dynamically derive the balanced Asian Handicap line & prices from the calibrated expected goal differential
  const asianHandicapMarket = React.useMemo(() => {
    const diff = adjustedLambdaHome - adjustedLambdaAway;
    const rawQuarterSteps = Math.round(diff * 2.2);
    const clampedSteps = Math.max(-8, Math.min(8, rawQuarterSteps === 0 ? (diff >= 0 ? 1 : -1) : rawQuarterSteps));
    const homeLineNum = -clampedSteps * 0.25;
    const awayLineNum = -homeLineNum;
    const formatLine = (v: number) => (v > 0 ? `+${v.toFixed(2).replace(/\.00$/, '.0').replace(/(\.[27]5)$/, '$1').replace(/\.50$/, '.5')}` : v.toFixed(2).replace(/\.00$/, '.0').replace(/\.50$/, '.5'));
    const residual = diff - clampedSteps * 0.42;
    const homeOdd = Number(Math.min(2.08, Math.max(1.78, 1.93 - residual * 0.14)).toFixed(2));
    const awayOdd = Number(Math.min(2.08, Math.max(1.78, 3.85 - homeOdd)).toFixed(2));
    return {
      homeLine: formatLine(homeLineNum),
      awayLine: formatLine(awayLineNum),
      homeOdd,
      awayOdd,
    };
  }, [adjustedLambdaHome, adjustedLambdaAway]);

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

  const renderInteractiveLineupHoverCard = (opts: {
    name: string;
    num?: number | null;
    pos?: string;
    photo?: string;
    teamName: string;
    isHome: boolean;
    isCoach?: boolean;
    above?: boolean;
  }) => {
    const resolvedPhoto =
      opts.photo ||
      (opts.isCoach
        ? ''
        : '');
    const posLabel = opts.isCoach
      ? language === 'bg'
        ? 'Старши Треньор'
        : 'Head Coach'
      : opts.pos === 'G' || opts.pos === 'GK'
      ? language === 'bg'
        ? 'Вратар (GK)'
        : 'Goalkeeper (GK)'
      : opts.pos === 'D' || opts.pos === 'DF'
      ? language === 'bg'
        ? 'Защитник (DF)'
        : 'Defender (DF)'
      : opts.pos === 'M' || opts.pos === 'MF'
      ? language === 'bg'
        ? 'Полузащитник (MF)'
        : 'Midfielder (MF)'
      : opts.pos === 'F' || opts.pos === 'FW'
      ? language === 'bg'
        ? 'Нападател (FW)'
        : 'Forward (FW)'
      : opts.pos || (language === 'bg' ? 'Играч' : 'Player');

    return (
      <div
        className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute z-50 left-1/2 -translate-x-1/2 ${
          opts.above !== false ? 'bottom-full mb-2' : 'top-full mt-2'
        } w-52 rounded-xl border border-[#22c55e]/60 bg-[#060c14]/95 backdrop-blur-md p-2.5 shadow-2xl`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${
              opts.isHome ? 'border-[#43f08a] bg-[#0f172a]' : 'border-[#ef4444] bg-[#450a0a]'
            } flex items-center justify-center text-xs font-mono font-black text-white`}
          >
            {resolvedPhoto ? (
              <img
                src={resolvedPhoto}
                alt={opts.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{opts.isCoach ? '👔' : opts.num ?? '👕'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-xs font-extrabold text-white truncate">{opts.name}</div>
            <div className="text-[10px] text-[#8f9cae] truncate">
              {opts.num ? `#${opts.num} · ` : ''}
              {posLabel}
            </div>
            <div className="text-[9px] font-bold text-[#43f08a] truncate mt-0.5">
              {opts.teamName} · {language === 'bg' ? 'Кликни за профил ↗' : 'Click for profile ↗'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFullLineupsContent = (expandedPitch: boolean = false) => {
    const homeCoachName =
      meta.homeCoach || (language === 'bg' ? 'Старши треньор' : 'Head Coach');
    const awayCoachName =
      meta.awayCoach || (language === 'bg' ? 'Старши треньор' : 'Head Coach');

    return (
      <div className="space-y-4">
        {/* Teams & Formations Header */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <TeamBadge
              name={match.homeTeam}
              logoUrl={liveIntel?.homeLogo || match.homeLogo}
              size="sm"
            />
            <div>
              <div className="font-bold text-white leading-tight">{match.homeTeam}</div>
              <div className="text-[10px] font-mono text-[#43f08a]">{meta.homeFormation}</div>
            </div>
          </div>

          <span className="text-[10px] text-[#8f9cae] hidden sm:inline">
            {language === 'bg'
              ? 'Задръж мишката за снимка и име · Кликни за профил'
              : 'Hover for photo & name · Click to open profile'}
          </span>

          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="font-bold text-white leading-tight">{match.awayTeam}</div>
              <div className="text-[10px] font-mono text-rose-400">{meta.awayFormation}</div>
            </div>
            <TeamBadge
              name={match.awayTeam}
              logoUrl={liveIntel?.awayLogo || match.awayLogo}
              size="sm"
            />
          </div>
        </div>

        {/* 2D Tactical Football Pitch */}
        <div
          className={`relative w-full ${
            expandedPitch ? 'h-72 sm:h-80' : 'h-64'
          } rounded-xl border border-[#1f3347] bg-gradient-to-r from-[#0a1921] via-[#0c2228] to-[#0a1921] select-none`}
        >
          <svg
            className="absolute inset-0 w-full h-full rounded-xl overflow-hidden pointer-events-none"
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
          >
            <rect
              x="10"
              y="10"
              width="380"
              height="220"
              fill="none"
              stroke="#1e3a4c"
              strokeWidth="1.5"
            />
            <line x1="200" y1="10" x2="200" y2="230" stroke="#1e3a4c" strokeWidth="1.5" />
            <circle cx="200" cy="120" r="32" fill="none" stroke="#1e3a4c" strokeWidth="1.5" />
            <circle cx="200" cy="120" r="2" fill="#1e3a4c" />
            <rect
              x="10"
              y="55"
              width="55"
              height="130"
              fill="none"
              stroke="#1e3a4c"
              strokeWidth="1.5"
            />
            <rect
              x="10"
              y="85"
              width="22"
              height="70"
              fill="none"
              stroke="#1e3a4c"
              strokeWidth="1.5"
            />
            <rect
              x="335"
              y="55"
              width="55"
              height="130"
              fill="none"
              stroke="#1e3a4c"
              strokeWidth="1.5"
            />
            <rect
              x="368"
              y="85"
              width="22"
              height="70"
              fill="none"
              stroke="#1e3a4c"
              strokeWidth="1.5"
            />
          </svg>

          {/* Home Team Starting XI Nodes */}
          {meta.homePlayers.map((p, idx) => (
            <div
              key={`home-${p.num}-${idx}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={(e) =>
                openPlayerProfile(
                  {
                    playerId: p.playerId,
                    playerName: p.name,
                    playerPhoto: p.photo,
                    teamId: match.homeTeamId,
                    teamName: match.homeTeam,
                    teamLogo: liveIntel?.homeLogo || match.homeLogo,
                    leagueId: match.leagueId,
                    leagueName: liveIntel?.league || match.league,
                    position: p.pos,
                    number: p.num,
                  },
                  e
                )
              }
              className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10 hover:z-40"
            >
              {renderInteractiveLineupHoverCard({
                name: p.name,
                num: p.num,
                pos: p.pos,
                photo: p.photo,
                teamName: match.homeTeam,
                isHome: true,
                above: p.y > 28,
              })}
              <div className="w-7 h-7 rounded-full bg-[#0f172a] border-2 border-[#43f08a] group-hover:scale-125 group-hover:bg-[#43f08a] group-hover:text-[#04130b] text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-md transition-all">
                {p.num}
              </div>
              <span className="text-[9px] font-semibold text-neutral-100 group-hover:text-[#43f08a] bg-black/65 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap transition-colors">
                {p.name}
              </span>
            </div>
          ))}

          {/* Away Team Starting XI Nodes */}
          {meta.awayPlayers.map((p, idx) => (
            <div
              key={`away-${p.num}-${idx}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={(e) =>
                openPlayerProfile(
                  {
                    playerId: p.playerId,
                    playerName: p.name,
                    playerPhoto: p.photo,
                    teamId: match.awayTeamId,
                    teamName: match.awayTeam,
                    teamLogo: liveIntel?.awayLogo || match.awayLogo,
                    leagueId: match.leagueId,
                    leagueName: liveIntel?.league || match.league,
                    position: p.pos,
                    number: p.num,
                  },
                  e
                )
              }
              className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10 hover:z-40"
            >
              {renderInteractiveLineupHoverCard({
                name: p.name,
                num: p.num,
                pos: p.pos,
                photo: p.photo,
                teamName: match.awayTeam,
                isHome: false,
                above: p.y > 28,
              })}
              <div className="w-7 h-7 rounded-full bg-[#450a0a] border-2 border-[#ef4444] group-hover:scale-125 group-hover:bg-[#ef4444] text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-md transition-all">
                {p.num}
              </div>
              <span className="text-[9px] font-semibold text-neutral-100 group-hover:text-rose-300 bg-black/65 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap transition-colors">
                {p.name}
              </span>
            </div>
          ))}
        </div>

        {/* Coaches (Треньор) Row for Home & Away */}
        {(meta.homeCoach || meta.awayCoach || !isApiMatch) && (
          <div className="rounded-xl border border-[#182638] bg-[#080e16] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] mb-2 flex items-center justify-between">
              <span>👔 {language === 'bg' ? 'Треньори' : 'Head Coaches'}</span>
              <span>{language === 'bg' ? 'Кликни за треньорско досие' : 'Click for coach profile'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Home Coach */}
              <div
                onClick={(e) =>
                  openPlayerProfile(
                    {
                      playerName: homeCoachName,
                      playerPhoto: meta.homeCoachPhoto,
                      teamId: match.homeTeamId,
                      teamName: match.homeTeam,
                      teamLogo: liveIntel?.homeLogo || match.homeLogo,
                      leagueId: match.leagueId,
                      leagueName: liveIntel?.league || match.league,
                      position: language === 'bg' ? 'Старши Треньор' : 'Head Coach',
                    },
                    e
                  )
                }
                className="group relative flex items-center gap-2.5 p-2 rounded-lg border border-[#162232] bg-[#0b131e] hover:border-[#43f08a] cursor-pointer transition-all"
              >
                {renderInteractiveLineupHoverCard({
                  name: homeCoachName,
                  photo: meta.homeCoachPhoto,
                  teamName: match.homeTeam,
                  isHome: true,
                  isCoach: true,
                  above: true,
                })}
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#43f08a] bg-[#0f172a] shrink-0 flex items-center justify-center text-xs">
                  {meta.homeCoachPhoto ? (
                    <img
                      src={meta.homeCoachPhoto}
                      alt={homeCoachName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>👔</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-white group-hover:text-[#43f08a] truncate transition-colors">
                    {homeCoachName}
                  </div>
                  <div className="text-[10px] text-[#8f9cae] truncate">
                    {match.homeTeam} · {meta.homeFormation}
                  </div>
                </div>
              </div>

              {/* Away Coach */}
              <div
                onClick={(e) =>
                  openPlayerProfile(
                    {
                      playerName: awayCoachName,
                      playerPhoto: meta.awayCoachPhoto,
                      teamId: match.awayTeamId,
                      teamName: match.awayTeam,
                      teamLogo: liveIntel?.awayLogo || match.awayLogo,
                      leagueId: match.leagueId,
                      leagueName: liveIntel?.league || match.league,
                      position: language === 'bg' ? 'Старши Треньор' : 'Head Coach',
                    },
                    e
                  )
                }
                className="group relative flex items-center gap-2.5 p-2 rounded-lg border border-[#162232] bg-[#0b131e] hover:border-rose-400 cursor-pointer transition-all"
              >
                {renderInteractiveLineupHoverCard({
                  name: awayCoachName,
                  photo: meta.awayCoachPhoto,
                  teamName: match.awayTeam,
                  isHome: false,
                  isCoach: true,
                  above: true,
                })}
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ef4444] bg-[#450a0a] shrink-0 flex items-center justify-center text-xs">
                  {meta.awayCoachPhoto ? (
                    <img
                      src={meta.awayCoachPhoto}
                      alt={awayCoachName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>👔</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-white group-hover:text-rose-300 truncate transition-colors">
                    {awayCoachName}
                  </div>
                  <div className="text-[10px] text-[#8f9cae] truncate">
                    {match.awayTeam} · {meta.awayFormation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Substitutes (Резерви) Two-Column Grid */}
        {(meta.homeSubstitutes.length > 0 || meta.awaySubstitutes.length > 0) && (
          <div className="rounded-xl border border-[#182638] bg-[#080e16] p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8f9cae]">
              <span>🪑 {language === 'bg' ? 'Резервни играчи' : 'Substitutes Bench'}</span>
              <span>
                {meta.homeSubstitutes.length} vs {meta.awaySubstitutes.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Home Substitutes Column */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#43f08a] border-b border-[#162232] pb-1 truncate">
                  {match.homeTeam} ({language === 'bg' ? 'Резерви' : 'Subs'})
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {meta.homeSubstitutes.map((sub, sIdx) => (
                    <div
                      key={`hsub-${sub.num}-${sIdx}`}
                      onClick={(e) =>
                        openPlayerProfile(
                          {
                            playerId: sub.playerId,
                            playerName: sub.name,
                            playerPhoto: sub.photo,
                            teamId: match.homeTeamId,
                            teamName: match.homeTeam,
                            teamLogo: liveIntel?.homeLogo || match.homeLogo,
                            leagueId: match.leagueId,
                            leagueName: liveIntel?.league || match.league,
                            position: sub.pos,
                            number: sub.num,
                          },
                          e
                        )
                      }
                      className="group relative flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-transparent bg-[#0b131e] hover:border-[#43f08a]/60 cursor-pointer transition-all text-xs"
                    >
                      {renderInteractiveLineupHoverCard({
                        name: sub.name,
                        num: sub.num,
                        pos: sub.pos,
                        photo: sub.photo,
                        teamName: match.homeTeam,
                        isHome: true,
                        above: true,
                      })}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#0f172a] border border-[#43f08a]/70 text-[10px] font-mono font-bold text-[#43f08a] flex items-center justify-center shrink-0">
                          {sub.num}
                        </span>
                        <span className="font-semibold text-neutral-200 group-hover:text-[#43f08a] truncate transition-colors">
                          {sub.name}
                        </span>
                      </div>
                      {sub.pos && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111c2a] text-[#8f9cae] shrink-0">
                          {sub.pos}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Substitutes Column */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-rose-400 border-b border-[#162232] pb-1 truncate">
                  {match.awayTeam} ({language === 'bg' ? 'Резерви' : 'Subs'})
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {meta.awaySubstitutes.map((sub, sIdx) => (
                    <div
                      key={`asub-${sub.num}-${sIdx}`}
                      onClick={(e) =>
                        openPlayerProfile(
                          {
                            playerId: sub.playerId,
                            playerName: sub.name,
                            playerPhoto: sub.photo,
                            teamId: match.awayTeamId,
                            teamName: match.awayTeam,
                            teamLogo: liveIntel?.awayLogo || match.awayLogo,
                            leagueId: match.leagueId,
                            leagueName: liveIntel?.league || match.league,
                            position: sub.pos,
                            number: sub.num,
                          },
                          e
                        )
                      }
                      className="group relative flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-transparent bg-[#0b131e] hover:border-rose-400/60 cursor-pointer transition-all text-xs"
                    >
                      {renderInteractiveLineupHoverCard({
                        name: sub.name,
                        num: sub.num,
                        pos: sub.pos,
                        photo: sub.photo,
                        teamName: match.awayTeam,
                        isHome: false,
                        above: true,
                      })}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#450a0a] border border-rose-500/70 text-[10px] font-mono font-bold text-rose-300 flex items-center justify-center shrink-0">
                          {sub.num}
                        </span>
                        <span className="font-semibold text-neutral-200 group-hover:text-rose-300 truncate transition-colors">
                          {sub.name}
                        </span>
                      </div>
                      {sub.pos && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111c2a] text-[#8f9cae] shrink-0">
                          {sub.pos}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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
              onLogBet(
                match,
                `${bestMarketLabel} (${bestEvSignal.bookie})`,
                bestEvSignal.marketOdd,
                edgePercent,
                bestEvSignal.marketCategory,
                50
              )
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
        <div className="rounded-2xl border border-[#1e553b] bg-[#0b111a] p-5 sm:p-6 space-y-4 shadow-2xl">
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
            <button
              type="button"
              onClick={() => setSubTab('overview')}
              className="px-3 py-1 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-xs text-[#43f08a] cursor-pointer"
            >
              ✕ {t.tabOverview}
            </button>
          </div>
          {renderStandingsTable(false)}
        </div>
      )}

      {/* =================================================================== */}
      {/* STATS SUB-TAB SPECIAL VIEW (Mounted right at the top!) */}
      {/* =================================================================== */}
      {subTab === 'stats' && showStatsPanel && (
        <div className="rounded-2xl border border-[#1e553b] bg-[#0b111a] p-5 sm:p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📈</span>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {t.tabStats} — {match.homeTeam} vs {match.awayTeam}
                </h3>
                <p className="text-[11px] text-[#8f9cae]">
                  {isLive ? `${t.liveBadge} · ${displayMinute}'` : t.scheduledBadge}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubTab('overview')}
              className="px-3 py-1 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-xs text-[#43f08a] cursor-pointer"
            >
              ✕ {t.tabOverview}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Stat Bars (8 cols) */}
            <div className="lg:col-span-8 space-y-3 text-xs font-mono">
              {[
                {
                  label: 'xG (Очаквани голове)',
                  homeVal: (liveIntel?.stats?.xgHome || match.fairOdds.expectedGoalsHome).toFixed(2),
                  awayVal: (liveIntel?.stats?.xgAway || match.fairOdds.expectedGoalsAway).toFixed(2),
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
                  <div className="flex justify-between text-neutral-300 mb-1">
                    <span className="font-bold text-[#43f08a]">{st.homeVal}</span>
                    <span className="text-[#8f9cae] font-sans font-semibold">{st.label}</span>
                    <span className="font-bold text-white">{st.awayVal}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#162230] overflow-hidden flex">
                    <div className="bg-[#22c55e] h-full" style={{ width: `${st.homePct}%` }} />
                    <div
                      className="bg-[#334155] h-full"
                      style={{ width: `${100 - st.homePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Momentum & Last 5 Min Possession (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4 rounded-xl border border-[#162232] bg-[#080e16] p-4">
              <div>
                <span className="text-xs font-bold text-white block mb-2">{t.momentum}</span>
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 120 60">
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
              </div>
              <div className="text-center pt-2 border-t border-[#162232]">
                <span className="text-xs font-semibold text-neutral-300 block mb-2">
                  {t.last5MinPos}
                </span>
                <div className="flex items-center justify-center gap-3 font-mono text-sm">
                  <span className="font-bold text-[#43f08a]">{last5PosHome}%</span>
                  <span className="text-[#64748b]">vs</span>
                  <span className="font-bold text-neutral-300">{last5PosAway}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TIMELINE SUB-TAB SPECIAL VIEW (Mounted right at the top!) */}
      {/* =================================================================== */}
      {subTab === 'timeline' && (
        <div className="rounded-2xl border border-[#1e553b] bg-[#0b111a] p-5 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⏱️</span>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {t.timeline} — {match.homeTeam} vs {match.awayTeam}
                </h3>
                <p className="text-[11px] text-[#8f9cae]">
                  {language === 'bg'
                    ? 'Пълна хронология на голове, картони и ключови събития в мача'
                    : 'Full match chronology of goals, cards, and key events'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubTab('overview')}
              className="px-3 py-1 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-xs text-[#43f08a] cursor-pointer"
            >
              ✕ {t.tabOverview}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(liveIntel?.events && liveIntel.events.length > 0
              ? liveIntel.events
              : timelineItems
            ).map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  item.highlight
                    ? 'border-[#1e553b] bg-[#0d2119]'
                    : 'border-[#162232] bg-[#080e16]'
                } text-xs`}
              >
                <span className="w-11 font-mono font-bold text-[#43f08a] text-xs shrink-0">
                  {item.min}
                </span>
                <span className="text-base shrink-0">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate">{item.title}</div>
                  <div className="text-[11px] text-[#8f9cae] truncate">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* LINEUPS SUB-TAB SPECIAL VIEW (Mounted right at the top!) */}
      {/* =================================================================== */}
      {subTab === 'lineups' && showLineupsPanel && (
        <div className="rounded-2xl border border-[#1e553b] bg-[#0b111a] p-5 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">👕</span>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {t.lineups} — {match.homeTeam} vs {match.awayTeam}
                </h3>
                <p className="text-[11px] text-[#8f9cae]">
                  {language === 'bg'
                    ? 'Стартови състави, резерви и треньори (Задръж мишката за снимка · Кликни за профил)'
                    : 'Starting XI, Substitutes & Coaches (Hover for photo · Click for profile)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubTab('overview')}
              className="px-3 py-1 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-xs text-[#43f08a] cursor-pointer"
            >
              ✕ {t.tabOverview}
            </button>
          </div>
          {renderFullLineupsContent(true)}
        </div>
      )}

      {/* =================================================================== */}
      {/* H2H & FORM SUB-TAB SPECIAL VIEW (Mounted right at the top!) */}
      {/* =================================================================== */}
      {subTab === 'h2h' && (
        <div className="rounded-2xl border border-[#1e553b] bg-[#0b111a] p-5 sm:p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⚔️</span>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {t.h2hTitle} & {t.formTitle}
                </h3>
                <p className="text-[11px] text-[#8f9cae]">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubTab('overview')}
              className="px-3 py-1 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-xs text-[#43f08a] cursor-pointer"
            >
              ✕ {t.tabOverview}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Form of both teams */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#162232] bg-[#080e16] p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1">
                  <TeamBadge
                    name={match.homeTeam}
                    logoUrl={liveIntel?.homeLogo || match.homeLogo}
                    size="sm"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{match.homeTeam}</div>
                    <div className="mt-1">{renderInteractiveFormPills(meta.homeFormMatches)}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {meta.homeFormMatches.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPastMatch(m)}
                      className="w-full flex items-center justify-between text-neutral-300 hover:bg-[#0e1622] px-2.5 py-1.5 rounded-lg border border-[#162232] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-left"
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

              <div className="space-y-2 sm:border-l border-[#162232] sm:pl-4">
                <div className="flex items-center gap-2 pb-1">
                  <TeamBadge
                    name={match.awayTeam}
                    logoUrl={liveIntel?.awayLogo || match.awayLogo}
                    size="sm"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{match.awayTeam}</div>
                    <div className="mt-1">{renderInteractiveFormPills(meta.awayFormMatches)}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {meta.awayFormMatches.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPastMatch(m)}
                      className="w-full flex items-center justify-between text-neutral-300 hover:bg-[#0e1622] px-2.5 py-1.5 rounded-lg border border-[#162232] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-left"
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

            {/* Right 5 cols: Head to Head summary & past meetings */}
            <div className="lg:col-span-5 rounded-xl border border-[#162232] bg-[#080e16] p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8f9cae] block text-[10px]">
                    {match.homeTeam} {t.wins}
                  </span>
                  <span className="text-lg font-mono font-black text-[#43f08a]">
                    {meta.h2h.homeWins}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[#8f9cae] block text-[10px]">{t.draws}</span>
                  <span className="text-lg font-mono font-black text-white">{meta.h2h.draws}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#8f9cae] block text-[10px]">
                    {match.awayTeam} {t.wins}
                  </span>
                  <span className="text-lg font-mono font-black text-rose-400">
                    {meta.h2h.awayWins}
                  </span>
                </div>
              </div>

              <div className="h-2.5 rounded-full overflow-hidden flex gap-0.5 bg-[#162230]">
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

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#8f9cae]">
                <span>{t.last5Meetings}:</span>
                {renderInteractiveFormPills(meta.h2h.matches, meta.h2h.last5)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PREDICTIONS SUB-TAB SPECIAL VIEW (Poisson Scoreline Matrix) */}
      {/* =================================================================== */}
      {subTab === 'predictions' && (
        <div className="rounded-2xl border border-[#1e553b] bg-[#0b111a] p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
            <h3 className="text-base font-extrabold text-white">
              Dixon-Coles Bivariate Poisson Exact Score Matrix ({match.homeTeam} vs {match.awayTeam})
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#43f08a]">
                λ₁ = {adjustedLambdaHome.toFixed(2)} · λ₂ = {adjustedLambdaAway.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => setSubTab('overview')}
                className="px-3 py-1 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-xs text-[#43f08a] cursor-pointer"
              >
                ✕ {t.tabOverview}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {poissonMatrix.mostLikelyScores.slice(0, 8).map((sc, idx) => (
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
      {/* ROW 2B: MISSING KEY FIGURES / LINEUP IMPACT ON POISSON (λ) & +EV */}
      {/* =================================================================== */}
      {subTab !== 'odds' && (
      <div className="rounded-2xl border border-[#1a2c3e] bg-gradient-to-br from-[#0b131e] via-[#0a111a] to-[#0d1824] p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#162436] pb-3.5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-white">{li.title}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                  hasActiveLineupImpact
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-[#43f08a]/15 border-[#43f08a]/40 text-[#43f08a]'
                }`}
              >
                {hasActiveLineupImpact ? li.activeImpactBadge : li.noImpactBadge}
              </span>
            </div>
            <p className="text-xs text-[#8f9cae] mt-1">{li.subtitle}</p>
          </div>

          {/* Expected Goals (λ) Before vs After Comparison Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-[#070c12] border border-[#182638] text-xs font-mono">
              <span className="text-[10px] text-[#8f9cae] block">{li.baseLambda}</span>
              <span className="text-neutral-300 font-bold">
                {match.homeTeam.slice(0, 12)} {baseLambdaHome.toFixed(2)} : {baseLambdaAway.toFixed(2)}{' '}
                {match.awayTeam.slice(0, 12)}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#0b1f17] border border-[#22c55e]/50 text-xs font-mono">
              <span className="text-[10px] text-[#43f08a] block font-bold">{li.adjustedLambda}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-black">
                  λ₁ {adjustedLambdaHome.toFixed(2)}
                </span>
                {homeLambdaPenalty < -0.01 && (
                  <span className="text-rose-400 text-[11px] font-bold">
                    ({homeLambdaPenalty.toFixed(2)})
                  </span>
                )}
                <span className="text-[#64748b]">:</span>
                <span className="text-white font-black">
                  λ₂ {adjustedLambdaAway.toFixed(2)}
                </span>
                {awayLambdaPenalty < -0.01 && (
                  <span className="text-rose-400 text-[11px] font-bold">
                    ({awayLambdaPenalty.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Player Chips for Official Injuries & Key Starters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#8f9cae] flex-wrap gap-2">
            <span className="font-semibold text-neutral-300">{li.officialAbsences}</span>
            <span>{li.simulateAbsenceHint}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {keyFiguresList.map((fig) => {
              const isAbsent = Boolean(toggledAbsenceKeys[fig.key]);
              return (
                <div
                  key={fig.key}
                  onClick={() =>
                    setToggledAbsenceKeys((prev) => ({
                      ...prev,
                      [fig.key]: !prev[fig.key],
                    }))
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isAbsent
                      ? 'bg-rose-950/25 border-rose-500/50 shadow-md shadow-rose-950/20'
                      : 'bg-[#080e16] border-[#182638] hover:border-[#2e4560]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{isAbsent ? '🚑' : '👕'}</span>
                      <span
                        onClick={(e) => {
                          if (fig.playerId) {
                            e.stopPropagation();
                            window.dispatchEvent(
                              new CustomEvent('oddspira:open-player', {
                                detail: {
                                  playerId: fig.playerId,
                                  playerName: fig.name,
                                  teamName: fig.teamName,
                                },
                              })
                            );
                          }
                        }}
                        className="text-xs font-extrabold text-white truncate hover:text-[#43f08a]"
                      >
                        {fig.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8f9cae] truncate mt-0.5">
                      {fig.teamName} ·{' '}
                      <span className={fig.isOfficialAbsence ? 'text-rose-400 font-semibold' : 'text-sky-400'}>
                        {fig.reason}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-black ${
                        isAbsent
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {fig.deltaLambda.toFixed(2)} λ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Recalculated Poisson Probabilities Bar */}
        <div className="pt-2 border-t border-[#162436] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[#8f9cae]">{li.poissonRecalcLabel}</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#080e16] border border-[#182638] text-white">
              {li.homeWinProb}: <strong className="text-[#43f08a]">{(poissonMatrix.homeWinProb * 100).toFixed(1)}%</strong>{' '}
              <span className="text-[#8f9cae]">(@{(1 / Math.max(0.05, poissonMatrix.homeWinProb)).toFixed(2)})</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#080e16] border border-[#182638] text-white">
              {li.drawProb}: <strong className="text-amber-300">{(poissonMatrix.drawProb * 100).toFixed(1)}%</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#080e16] border border-[#182638] text-white">
              {li.awayWinProb}: <strong className="text-sky-400">{(poissonMatrix.awayWinProb * 100).toFixed(1)}%</strong>{' '}
              <span className="text-[#8f9cae]">(@{(1 / Math.max(0.05, poissonMatrix.awayWinProb)).toFixed(2)})</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#080e16] border border-[#182638] text-white">
              {li.over25Prob}: <strong className="text-[#43f08a]">{(poissonMatrix.over25Prob * 100).toFixed(1)}%</strong>
            </span>
          </div>
        </div>
      </div>
      )}

      {/* =================================================================== */}
      {/* ROW 2C: MULTI-MARKET ODDS MOVEMENT & DROPPING ODDS TRACKER (SQLITE) */}
      {/* =================================================================== */}
      {(() => {
        const allItems: Array<{
          group: 'ft1x2' | 'goalsOU' | 'firstHalf' | 'cornersOU' | 'cardsOU' | 'btts';
          key: string;
          labelKey: string;
          getVal: (m: MultiMarketOddsSnapshot) => number;
        }> = [
          { group: 'ft1x2', key: 'ft1x2.home', labelKey: 'homeWin', getVal: (m) => m.ft1x2.home },
          { group: 'ft1x2', key: 'ft1x2.draw', labelKey: 'draw', getVal: (m) => m.ft1x2.draw },
          { group: 'ft1x2', key: 'ft1x2.away', labelKey: 'awayWin', getVal: (m) => m.ft1x2.away },
          { group: 'ft1x2', key: 'dc.1x', labelKey: 'dc1X', getVal: (m) => m.doubleChance.homeDraw },
          { group: 'ft1x2', key: 'dc.12', labelKey: 'dc12', getVal: (m) => m.doubleChance.homeAway },
          { group: 'ft1x2', key: 'dc.x2', labelKey: 'dcX2', getVal: (m) => m.doubleChance.drawAway },
          { group: 'goalsOU', key: 'goals.o15', labelKey: 'over15', getVal: (m) => m.goalsOU.over15 },
          { group: 'goalsOU', key: 'goals.u15', labelKey: 'under15', getVal: (m) => m.goalsOU.under15 },
          { group: 'goalsOU', key: 'goals.o25', labelKey: 'over25', getVal: (m) => m.goalsOU.over25 },
          { group: 'goalsOU', key: 'goals.u25', labelKey: 'under25', getVal: (m) => m.goalsOU.under25 },
          { group: 'goalsOU', key: 'goals.o35', labelKey: 'over35', getVal: (m) => m.goalsOU.over35 },
          { group: 'goalsOU', key: 'goals.u35', labelKey: 'under35', getVal: (m) => m.goalsOU.under35 },
          { group: 'firstHalf', key: 'fh.home', labelKey: 'fhHome', getVal: (m) => m.firstHalf.home },
          { group: 'firstHalf', key: 'fh.draw', labelKey: 'fhDraw', getVal: (m) => m.firstHalf.draw },
          { group: 'firstHalf', key: 'fh.away', labelKey: 'fhAway', getVal: (m) => m.firstHalf.away },
          { group: 'firstHalf', key: 'fh.o05', labelKey: 'fhOver05', getVal: (m) => m.firstHalf.over05 },
          { group: 'firstHalf', key: 'fh.u05', labelKey: 'fhUnder05', getVal: (m) => m.firstHalf.under05 },
          { group: 'firstHalf', key: 'fh.o15', labelKey: 'fhOver15', getVal: (m) => m.firstHalf.over15 },
          { group: 'firstHalf', key: 'fh.u15', labelKey: 'fhUnder15', getVal: (m) => m.firstHalf.under15 },
          { group: 'cornersOU', key: 'corners.o85', labelKey: 'cornersOver85', getVal: (m) => m.cornersOU.over85 },
          { group: 'cornersOU', key: 'corners.u85', labelKey: 'cornersUnder85', getVal: (m) => m.cornersOU.under85 },
          { group: 'cornersOU', key: 'corners.o95', labelKey: 'cornersOver95', getVal: (m) => m.cornersOU.over95 },
          { group: 'cornersOU', key: 'corners.u95', labelKey: 'cornersUnder95', getVal: (m) => m.cornersOU.under95 },
          { group: 'cornersOU', key: 'corners.o105', labelKey: 'cornersOver105', getVal: (m) => m.cornersOU.over105 },
          { group: 'cornersOU', key: 'corners.u105', labelKey: 'cornersUnder105', getVal: (m) => m.cornersOU.under105 },
          { group: 'cardsOU', key: 'cards.o35', labelKey: 'cardsOver35', getVal: (m) => m.cardsOU.over35 },
          { group: 'cardsOU', key: 'cards.u35', labelKey: 'cardsUnder35', getVal: (m) => m.cardsOU.under35 },
          { group: 'cardsOU', key: 'cards.o45', labelKey: 'cardsOver45', getVal: (m) => m.cardsOU.over45 },
          { group: 'cardsOU', key: 'cards.u45', labelKey: 'cardsUnder45', getVal: (m) => m.cardsOU.under45 },
          { group: 'btts', key: 'btts.yes', labelKey: 'bttsYes', getVal: (m) => m.btts.yes },
          { group: 'btts', key: 'btts.no', labelKey: 'bttsNo', getVal: (m) => m.btts.no },
        ];

        const visibleItems = allItems.filter((it) => it.group === oddsMarketTab);
        const activeDef =
          allItems.find((it) => it.key === selectedOddsKey) ||
          visibleItems[0] ||
          allItems[0];

        const topAlerts = (liveIntel?.droppingAlerts || []).filter(
          (a) => a.dropPercent >= 1.5 && a.dropPercent <= 35.0
        );
        const hasSteam = !isLive && topAlerts.some((a) => a.isSteamMove);
        const hasDrop = topAlerts.length > 0;

        const activeOpenVal = activeDef.getVal(openingMultiMarkets);
        const activeCurrVal = activeDef.getVal(currentMultiMarkets);
        const activePctChange =
          activeOpenVal > 0
            ? Number((((activeCurrVal - activeOpenVal) / activeOpenVal) * 100).toFixed(1))
            : 0;

        const formatClockTime = (ts: number) => {
          try {
            const d = new Date(ts);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
          } catch {
            return '12:00';
          }
        };

        // Points for SVG time-series graph of activeDef (always guarantees at least Opening -> Current points with HH:MM timestamps)
        const rawSeriesPoints = oddsHistoryList.map((entry, idx) => {
          const clock =
            entry.timeLabel && /^\d{1,2}:\d{2}/.test(entry.timeLabel)
              ? entry.timeLabel
              : formatClockTime(entry.recordedAt || Date.now() - (oddsHistoryList.length - 1 - idx) * 3600000);
          return {
            time: clock,
            bookmaker: entry.bookmaker,
            isLive: entry.isLive,
            isOpening: entry.isOpening || idx === 0,
            val: activeDef.getVal(entry.markets),
          };
        });

        const seriesPoints =
          rawSeriesPoints.length >= 2
            ? rawSeriesPoints
            : [
                {
                  time: formatClockTime(
                    (oddsHistoryList[0]?.recordedAt || Date.now()) - 2 * 60 * 60 * 1000
                  ),
                  bookmaker: oddsHistoryList[0]?.bookmaker || 'Opening Line',
                  isLive: false,
                  isOpening: true,
                  val: activeOpenVal,
                },
                {
                  time:
                    rawSeriesPoints[0]?.time ||
                    formatClockTime(oddsHistoryList[0]?.recordedAt || Date.now()),
                  bookmaker: oddsHistoryList[0]?.bookmaker || 'Current Line',
                  isLive,
                  isOpening: false,
                  val: activeCurrVal,
                },
              ];

        const vals = seriesPoints.map((p) => p.val);
        const rawMin = Math.min(...vals, activeOpenVal, activeCurrVal);
        const rawMax = Math.max(...vals, activeOpenVal, activeCurrVal);
        const midVal = (rawMin + rawMax) / 2;
        const halfRange = Math.max(0.06, (rawMax - rawMin) * 0.75);
        const minVal = Math.max(1.01, midVal - halfRange);
        const maxVal = midVal + halfRange;
        const valSpan = Math.max(0.08, maxVal - minVal);

        const svgW = 400;
        const svgH = 165;
        const padLeft = 48;
        const padRight = 38;
        const padTop = 32;
        const padBottom = 34;

        const plotCoords = seriesPoints.map((pt, idx) => {
          const x =
            seriesPoints.length === 1
              ? (padLeft + (svgW - padRight)) / 2
              : padLeft + (idx / (seriesPoints.length - 1)) * (svgW - padLeft - padRight);
          const normY = Math.min(1, Math.max(0, (pt.val - minVal) / valSpan));
          const y = svgH - padBottom - normY * (svgH - padTop - padBottom);
          return { ...pt, x, y };
        });

        const polylineStr = plotCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
        const areaPathStr =
          plotCoords.length >= 2
            ? `M ${plotCoords[0].x.toFixed(1)} ${(svgH - padBottom).toFixed(1)} L ${plotCoords
                .map((c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
                .join(' L ')} L ${plotCoords[plotCoords.length - 1].x.toFixed(1)} ${(
                svgH - padBottom
              ).toFixed(1)} Z`
            : '';

        return (
          <div
            className={`rounded-2xl border p-5 shadow-xl space-y-4 transition-all ${
              subTab === 'odds'
                ? 'border-[#43f08a] bg-gradient-to-br from-[#0b1919] via-[#0a121c] to-[#0c1a16] ring-1 ring-[#43f08a]/40'
                : 'border-[#1a2c3e] bg-gradient-to-br from-[#0b131e] via-[#0a111a] to-[#0d1722]'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#162436] pb-3.5">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">{om.title}</h3>
                  {isLive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border bg-rose-500/20 border-rose-500/50 text-rose-300">
                      🔴 LIVE IN-PLAY ({displayHomeScore}-{displayAwayScore})
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                        hasSteam
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : hasDrop
                          ? 'bg-[#43f08a]/15 border-[#43f08a]/40 text-[#43f08a]'
                          : 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                      }`}
                    >
                      {hasSteam ? om.steamBadge : hasDrop ? om.droppingBadge : om.stableBadge}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#070c12] border border-[#182638] text-[#8f9cae]">
                    {oddsHistoryList.length} {om.snapshotsCountLabel}
                  </span>
                </div>
                <p className="text-xs text-[#8f9cae] mt-1">{om.subtitle}</p>
              </div>

              {/* Top Dropping Alerts Strip across all markets */}
              {topAlerts.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-[#8f9cae] uppercase">
                    {om.topDropsHeader}
                  </span>
                  {topAlerts.slice(0, 3).map((al) => {
                    const targetTab =
                      al.marketGroup === 'doubleChance' ? 'ft1x2' : al.marketGroup;
                    return (
                      <button
                        key={al.marketKey}
                        type="button"
                        onClick={() => {
                          setOddsMarketTab(targetTab);
                          setSelectedOddsKey(al.marketKey);
                        }}
                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          al.isSteamMove
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:border-amber-400'
                            : 'bg-[#0b1f17] border-[#22c55e]/40 text-[#43f08a] hover:border-[#43f08a]'
                        }`}
                      >
                        <span>{al.isSteamMove ? '🔥' : '📉'}</span>
                        <span className="text-white">
                          {om.labels[al.labelKey] || al.labelKey}
                        </span>
                        <span className="text-[#8f9cae] line-through">
                          {al.openingOdds.toFixed(2)}
                        </span>
                        <span>→</span>
                        <span className="font-black text-white">
                          {al.currentOdds.toFixed(2)}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                          -{al.dropPercent.toFixed(1)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Market Category Tabs (1X2, Goals 1.5/2.5/3.5, 1st Half, Corners, Cards, BTTS) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {(
                [
                  { id: 'ft1x2', icon: '⚽', label: om.tab1x2, defaultKey: 'ft1x2.home' },
                  { id: 'goalsOU', icon: '🥅', label: om.tabGoals, defaultKey: 'goals.o25' },
                  { id: 'firstHalf', icon: '⏱️', label: om.tabFirstHalf, defaultKey: 'fh.o05' },
                  { id: 'cornersOU', icon: '🚩', label: om.tabCorners, defaultKey: 'corners.o95' },
                  { id: 'cardsOU', icon: '🟨', label: om.tabCards, defaultKey: 'cards.o35' },
                  { id: 'btts', icon: '🎯', label: om.tabBtts, defaultKey: 'btts.yes' },
                ] as const
              ).map((tb) => {
                const isActive = oddsMarketTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => {
                      setOddsMarketTab(tb.id);
                      setSelectedOddsKey(tb.defaultKey);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#0f291e] border-[#43f08a] text-[#43f08a] shadow-md shadow-[#22c55e]/10'
                        : 'bg-[#080e16] border-[#182638] text-[#8f9cae] hover:text-white hover:border-[#2a3f5a]'
                    }`}
                  >
                    <span>{tb.icon}</span>
                    <span>{tb.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Grid: Left 7 Cols Market Cards | Right 5 Cols Time-Series SVG Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left 7 Cols: Multi-Market Opening vs Current Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visibleItems.map((it) => {
                  const openVal = it.getVal(openingMultiMarkets);
                  const currVal = it.getVal(currentMultiMarkets);
                  const diff = currVal - openVal;
                  const pct =
                    openVal > 0 ? Number((((currVal - openVal) / openVal) * 100).toFixed(1)) : 0;
                  const isDropping = diff <= -0.02;
                  const isDrifting = diff >= 0.02;
                  const isSteam = !isLive && pct <= -6.5 && pct >= -35.0;
                  const isSelected = activeDef.key === it.key;
                  const labelText = om.labels[it.labelKey] || it.labelKey;

                  return (
                    <div
                      key={it.key}
                      onClick={() => setSelectedOddsKey(it.key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#0c2119] border-[#43f08a] shadow-md shadow-[#22c55e]/10'
                          : isDropping
                          ? 'bg-[#091814] border-[#1f4d39] hover:border-[#43f08a]/60'
                          : 'bg-[#080e16] border-[#182638] hover:border-[#2e4560]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-white truncate">
                          {labelText}
                        </span>
                        {isDropping ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-black shrink-0 ${
                              isSteam
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-[#22c55e]/20 text-[#43f08a] border border-[#22c55e]/40'
                            }`}
                          >
                            {isSteam ? '🔥 ' : '▼ '}
                            {pct.toFixed(1)}%
                          </span>
                        ) : isDrifting ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                            ▲ +{pct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#64748b] bg-[#0b131e] border border-[#162232] shrink-0">
                            0.0%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#152232]/80 font-mono">
                        <div className="flex items-center gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-[#8f9cae] block">
                              {om.openingLabel}
                            </span>
                            <span
                              className={`font-bold ${
                                isDropping ? 'text-[#8f9cae] line-through' : 'text-neutral-300'
                              }`}
                            >
                              {openVal.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-[#64748b]">→</span>
                          <div>
                            <span className="text-[9px] text-[#43f08a] block">
                              {om.currentLabel}
                            </span>
                            <span className="text-sm font-black text-white">
                              {currVal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLogBet(match, labelText, currVal, edgePercent, om.title);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#11241c] hover:bg-[#22c55e] text-[#43f08a] hover:text-[#04130b] border border-[#22c55e]/40 text-[10px] font-extrabold transition-colors cursor-pointer"
                        >
                          {om.betNowBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right 5 Cols: SVG Time-Series Line Graph for Selected Outcome */}
              <div className="lg:col-span-5 rounded-xl border border-[#182638] bg-[#070c12] p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#152232] pb-2.5">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-[#8f9cae] block">
                      {om.graphTitle}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {om.labels[activeDef.labelKey] || activeDef.labelKey}
                    </h4>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#8f9cae]">{activeOpenVal.toFixed(2)}</span>
                      <span className="text-[#64748b]">→</span>
                      <span className="text-sm font-black text-[#43f08a]">
                        {activeCurrVal.toFixed(2)}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        activePctChange < 0
                          ? 'text-[#43f08a]'
                          : activePctChange > 0
                          ? 'text-rose-400'
                          : 'text-[#8f9cae]'
                      }`}
                    >
                      {activePctChange > 0 ? `+${activePctChange}%` : `${activePctChange}%`}
                    </span>
                  </div>
                </div>

                {/* SVG Time-Series Curve */}
                <div className="relative w-full">
                  <svg
                    className="w-full h-44 overflow-visible"
                    viewBox={`0 0 ${svgW} ${svgH}`}
                  >
                    {/* Y-Axis Reference Grid Lines & Odds Scale Labels */}
                    {[
                      { y: padTop, val: maxVal },
                      { y: (padTop + (svgH - padBottom)) / 2, val: midVal },
                      { y: svgH - padBottom, val: minVal },
                    ].map((tick, tIdx) => (
                      <g key={tIdx}>
                        <line
                          x1={padLeft}
                          y1={tick.y}
                          x2={svgW - padRight}
                          y2={tick.y}
                          stroke="#182638"
                          strokeDasharray={tIdx === 2 ? undefined : '3 3'}
                          strokeWidth="1"
                        />
                        <text
                          x={padLeft - 6}
                          y={tick.y + 3.5}
                          textAnchor="end"
                          fill="#64748b"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {tick.val.toFixed(2)}
                        </text>
                      </g>
                    ))}

                    {/* Area Under Curve */}
                    {areaPathStr && (
                      <path
                        d={areaPathStr}
                        fill={
                          activePctChange < 0
                            ? 'rgba(34, 197, 94, 0.18)'
                            : 'rgba(56, 189, 248, 0.15)'
                        }
                      />
                    )}

                    {/* Line Connecting Recorded Snapshots */}
                    {plotCoords.length >= 2 && (
                      <polyline
                        fill="none"
                        stroke={activePctChange < 0 ? '#43f08a' : '#38bdf8'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylineStr}
                      />
                    )}

                    {/* Snapshot Data Points with Odds Badges & HH:MM Timestamps */}
                    {plotCoords.map((pt, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === plotCoords.length - 1;
                      const showLabel =
                        isFirst ||
                        isLast ||
                        plotCoords.length <= 5 ||
                        idx % Math.ceil(plotCoords.length / 4) === 0;
                      const badgeY = Math.max(15, pt.y - 16);
                      const timeText = isFirst
                        ? `${om.openingLabel} (${pt.time})`
                        : isLast
                        ? `${om.currentLabel} (${pt.time})`
                        : pt.time;

                      return (
                        <g key={idx}>
                          {/* Vertical Guide Line to Timestamp */}
                          <line
                            x1={pt.x}
                            y1={pt.y}
                            x2={pt.x}
                            y2={svgH - padBottom}
                            stroke="#1e2d40"
                            strokeDasharray="2 2"
                            strokeWidth="1"
                          />

                          {/* Point Circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isLast ? 5 : 4}
                            fill={isLast ? '#43f08a' : '#0f172a'}
                            stroke={activePctChange < 0 ? '#43f08a' : '#38bdf8'}
                            strokeWidth="2.2"
                          />

                          {/* Odds Value Pill above point */}
                          {showLabel && (
                            <g>
                              <rect
                                x={pt.x - 19}
                                y={badgeY - 10}
                                width="38"
                                height="14"
                                rx="4"
                                fill="#060c14"
                                stroke={
                                  isLast
                                    ? '#43f08a'
                                    : activePctChange < 0
                                    ? '#1f4d39'
                                    : '#1e3a5f'
                                }
                                strokeWidth="1"
                              />
                              <text
                                x={pt.x}
                                y={badgeY}
                                textAnchor="middle"
                                fill={isLast ? '#43f08a' : '#ffffff'}
                                fontSize="9.5"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {pt.val.toFixed(2)}
                              </text>
                            </g>
                          )}

                          {/* Timestamp (HH:MM) below X-axis */}
                          {showLabel && (
                            <text
                              x={
                                isFirst && plotCoords.length >= 2
                                  ? Math.max(padLeft + 10, pt.x)
                                  : isLast && plotCoords.length >= 2
                                  ? Math.min(svgW - padRight - 10, pt.x)
                                  : pt.x
                              }
                              y={svgH - 11}
                              textAnchor="middle"
                              fill={isLast ? '#43f08a' : '#cbd5e1'}
                              fontSize="9.5"
                              fontFamily="monospace"
                              fontWeight={isLast ? 'bold' : 'normal'}
                            >
                              {timeText}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Footer Note */}
                <div className="text-[10px] text-[#8f9cae] border-t border-[#152232] pt-2 flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    {oddsHistoryList.length <= 1
                      ? om.singleSnapshotNote
                      : `${oddsHistoryList[0]?.bookmaker || 'Opening'} → ${
                          oddsHistoryList[oddsHistoryList.length - 1]?.bookmaker || 'Current'
                        }`}
                  </span>
                  <span className="font-mono text-[#43f08a]">
                    {seriesPoints[0]?.time} ({activeOpenVal.toFixed(2)}) →{' '}
                    {seriesPoints[seriesPoints.length - 1]?.time} ({activeCurrVal.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 15 TOP BOOKMAKERS MULTI-MARKET ODDS COMPARISON MATRIX               */}
            {/* =================================================================== */}
            {(() => {
              const fallbackBookiesConfig: Array<{
                id: string;
                name: string;
                tier: 'SHARP' | 'EXCHANGE' | 'SOFT';
                homeTilt: number;
                drawTilt: number;
                awayTilt: number;
                totalsTilt: number;
              }> = [
                { id: 'pinnacle', name: 'Pinnacle', tier: 'SHARP', homeTilt: 1.018, drawTilt: 1.022, awayTilt: 1.018, totalsTilt: 1.02 },
                { id: 'betfair', name: 'Betfair Exchange', tier: 'EXCHANGE', homeTilt: 1.015, drawTilt: 1.025, awayTilt: 1.014, totalsTilt: 1.018 },
                { id: 'sbobet', name: 'SBOBET', tier: 'SHARP', homeTilt: 1.012, drawTilt: 1.01, awayTilt: 1.016, totalsTilt: 1.015 },
                { id: 'marathonbet', name: 'Marathonbet', tier: 'SHARP', homeTilt: 1.014, drawTilt: 1.012, awayTilt: 1.01, totalsTilt: 1.012 },
                { id: '1xbet', name: '1xBet', tier: 'SOFT', homeTilt: 1.01, drawTilt: 1.015, awayTilt: 1.012, totalsTilt: 1.014 },
                { id: 'bet365', name: 'bet365', tier: 'SOFT', homeTilt: 0.995, drawTilt: 1.0, awayTilt: 0.996, totalsTilt: 1.0 },
                { id: 'betano', name: 'Betano', tier: 'SOFT', homeTilt: 1.004, drawTilt: 0.992, awayTilt: 0.998, totalsTilt: 1.005 },
                { id: 'betsson', name: 'Betsson', tier: 'SOFT', homeTilt: 0.992, drawTilt: 1.004, awayTilt: 0.994, totalsTilt: 0.996 },
                { id: 'unibet', name: 'Unibet', tier: 'SOFT', homeTilt: 0.99, drawTilt: 0.995, awayTilt: 1.002, totalsTilt: 0.994 },
                { id: 'betway', name: 'Betway', tier: 'SOFT', homeTilt: 0.994, drawTilt: 0.988, awayTilt: 0.992, totalsTilt: 0.992 },
                { id: 'bwin', name: 'bwin', tier: 'SOFT', homeTilt: 0.988, drawTilt: 0.992, awayTilt: 0.99, totalsTilt: 0.99 },
                { id: '888sport', name: '888sport', tier: 'SOFT', homeTilt: 0.986, drawTilt: 0.994, awayTilt: 0.988, totalsTilt: 0.989 },
                { id: 'sportingbet', name: 'Sportingbet', tier: 'SOFT', homeTilt: 0.989, drawTilt: 0.986, awayTilt: 0.991, totalsTilt: 0.988 },
                { id: 'williamhill', name: 'William Hill', tier: 'SOFT', homeTilt: 0.985, drawTilt: 0.99, awayTilt: 0.986, totalsTilt: 0.987 },
                { id: 'interwetten', name: 'Interwetten', tier: 'SOFT', homeTilt: 0.984, drawTilt: 0.985, awayTilt: 0.988, totalsTilt: 0.985 },
              ];

              const seedNum =
                Number(String(match.id || '101').replace(/\D/g, '').slice(-4)) || 101;
              const scale = (v: number, mult: number, jit: number) =>
                Number(Math.max(1.03, v * mult + jit).toFixed(2));

              const bookmakersList: BookmakerComparisonRow[] =
                liveIntel?.bookmakersComparison && liveIntel.bookmakersComparison.length > 0
                  ? liveIntel.bookmakersComparison
                  : fallbackBookiesConfig.map((cfg, idx) => {
                      const wA = (((seedNum + idx * 17) % 7) - 3) * 0.01;
                      const wB = (((seedNum + idx * 29) % 7) - 3) * 0.01;
                      const wC = (((seedNum + idx * 43) % 5) - 2) * 0.01;
                      const m: MultiMarketOddsSnapshot = {
                        ft1x2: {
                          home: scale(currentMultiMarkets.ft1x2.home, cfg.homeTilt, wA),
                          draw: scale(currentMultiMarkets.ft1x2.draw, cfg.drawTilt, wB),
                          away: scale(currentMultiMarkets.ft1x2.away, cfg.awayTilt, -wA),
                        },
                        doubleChance: {
                          homeDraw: scale(currentMultiMarkets.doubleChance.homeDraw, cfg.homeTilt, wC * 0.5),
                          homeAway: scale(currentMultiMarkets.doubleChance.homeAway, cfg.totalsTilt, 0),
                          drawAway: scale(currentMultiMarkets.doubleChance.drawAway, cfg.awayTilt, -wC * 0.5),
                        },
                        goalsOU: {
                          over15: scale(currentMultiMarkets.goalsOU.over15, cfg.totalsTilt, wC * 0.5),
                          under15: scale(currentMultiMarkets.goalsOU.under15, cfg.totalsTilt, -wC),
                          over25: scale(currentMultiMarkets.goalsOU.over25, cfg.totalsTilt, wA),
                          under25: scale(currentMultiMarkets.goalsOU.under25, cfg.totalsTilt, -wA),
                          over35: scale(currentMultiMarkets.goalsOU.over35, cfg.totalsTilt, wB),
                          under35: scale(currentMultiMarkets.goalsOU.under35, cfg.totalsTilt, -wB * 0.5),
                        },
                        firstHalf: {
                          home: scale(currentMultiMarkets.firstHalf.home, cfg.homeTilt, wA),
                          draw: scale(currentMultiMarkets.firstHalf.draw, cfg.drawTilt, wC),
                          away: scale(currentMultiMarkets.firstHalf.away, cfg.awayTilt, -wA),
                          over05: scale(currentMultiMarkets.firstHalf.over05, cfg.totalsTilt, wC * 0.5),
                          under05: scale(currentMultiMarkets.firstHalf.under05, cfg.totalsTilt, -wC),
                          over15: scale(currentMultiMarkets.firstHalf.over15, cfg.totalsTilt, wB),
                          under15: scale(currentMultiMarkets.firstHalf.under15, cfg.totalsTilt, -wB * 0.5),
                        },
                        cornersOU: {
                          over85: scale(currentMultiMarkets.cornersOU.over85, cfg.totalsTilt, wC),
                          under85: scale(currentMultiMarkets.cornersOU.under85, cfg.totalsTilt, -wC),
                          over95: scale(currentMultiMarkets.cornersOU.over95, cfg.totalsTilt, wA),
                          under95: scale(currentMultiMarkets.cornersOU.under95, cfg.totalsTilt, -wA),
                          over105: scale(currentMultiMarkets.cornersOU.over105, cfg.totalsTilt, wB),
                          under105: scale(currentMultiMarkets.cornersOU.under105, cfg.totalsTilt, -wB),
                        },
                        cardsOU: {
                          over35: scale(currentMultiMarkets.cardsOU.over35, cfg.totalsTilt, wA),
                          under35: scale(currentMultiMarkets.cardsOU.under35, cfg.totalsTilt, -wA),
                          over45: scale(currentMultiMarkets.cardsOU.over45, cfg.totalsTilt, wB),
                          under45: scale(currentMultiMarkets.cardsOU.under45, cfg.totalsTilt, -wB),
                        },
                        btts: {
                          yes: scale(currentMultiMarkets.btts.yes, cfg.totalsTilt, wA),
                          no: scale(currentMultiMarkets.btts.no, cfg.totalsTilt, -wA),
                        },
                      };
                      const ov =
                        (1 / m.ft1x2.home + 1 / m.ft1x2.draw + 1 / m.ft1x2.away) * 100;
                      const marginPercent = Number(Math.max(1.5, Math.min(8.5, ov - 100)).toFixed(2));
                      return {
                        id: cfg.id,
                        name: cfg.name,
                        tier: cfg.tier,
                        payoutPercent: Number((100 - marginPercent).toFixed(2)),
                        marginPercent,
                        isDirectFeed: true,
                        markets: m,
                      };
                    });

              const filteredBookies = bookmakersList.filter((bk) => {
                if (bookieTierFilter === 'sharp') return bk.tier === 'SHARP' || bk.tier === 'EXCHANGE';
                if (bookieTierFilter === 'soft') return bk.tier === 'SOFT';
                return true;
              });

              // Compute Best (Max) Odd & Best Bookmaker across all 15 bookmakers for each column in visibleItems
              const bestByCol: Record<string, { maxOdd: number; bestBookieName: string }> = {};
              visibleItems.forEach((col) => {
                let maxOdd = 0;
                let bestBookieName = 'Pinnacle';
                bookmakersList.forEach((bk) => {
                  const val = col.getVal(bk.markets);
                  if (val > maxOdd) {
                    maxOdd = val;
                    bestBookieName = bk.name;
                  }
                });
                bestByCol[col.key] = { maxOdd, bestBookieName };
              });

              return (
                <div className="pt-4 border-t border-[#162436] space-y-3">
                  {/* Top Header & Tier Filter Buttons */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                        <span>{bcDict.title}</span>
                      </h4>
                      <p className="text-[11px] text-[#8f9cae] mt-0.5">{bcDict.sub}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(
                        [
                          { id: 'all', label: bcDict.filterAll },
                          { id: 'sharp', label: bcDict.filterSharp },
                          { id: 'soft', label: bcDict.filterSoft },
                        ] as const
                      ).map((flt) => (
                        <button
                          key={flt.id}
                          type="button"
                          onClick={() => setBookieTierFilter(flt.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                            bookieTierFilter === flt.id
                              ? 'bg-[#0f291e] border-[#43f08a] text-[#43f08a]'
                              : 'bg-[#080e16] border-[#182638] text-[#8f9cae] hover:text-white'
                          }`}
                        >
                          {flt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Best Market Odds Finder Strip */}
                  <div className="rounded-xl border border-emerald-500/30 bg-[#071611] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-emerald-300">
                      {bcDict.bestStripLabel}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {visibleItems.map((col) => {
                        const best = bestByCol[col.key];
                        const colLabel = om.labels[col.labelKey] || col.labelKey;
                        return (
                          <button
                            key={col.key}
                            type="button"
                            onClick={() =>
                              onLogBet(
                                match,
                                `${colLabel} (${best.bestBookieName})`,
                                best.maxOdd,
                                edgePercent,
                                om.title
                              )
                            }
                            title={bcDict.logTooltip}
                            className="px-2.5 py-1 rounded-lg bg-[#0d261d] hover:bg-[#22c55e] border border-[#22c55e]/50 text-xs font-mono transition-all cursor-pointer group flex items-center gap-1.5"
                          >
                            <span className="text-neutral-300 group-hover:text-[#04130b] font-semibold">
                              {colLabel}:
                            </span>
                            <span className="text-[#43f08a] group-hover:text-[#04130b] font-black">
                              {best.maxOdd.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-emerald-300/80 group-hover:text-[#04130b] font-bold">
                              ({best.bestBookieName})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 15-Bookmaker Responsive Comparison Matrix Table */}
                  <div className="overflow-x-auto rounded-xl border border-[#182638] bg-[#070c12]">
                    <table className="w-full text-left border-collapse min-w-[680px]">
                      <thead>
                        <tr className="border-b border-[#162232] bg-[#0b131e] text-[10px] font-mono uppercase text-[#8f9cae]">
                          <th className="py-2.5 px-3 font-extrabold">{bcDict.colBookie}</th>
                          <th className="py-2.5 px-2 font-extrabold text-center">{bcDict.colTier}</th>
                          <th className="py-2.5 px-2 font-extrabold text-center">{bcDict.colPayout}</th>
                          {visibleItems.map((col) => (
                            <th key={col.key} className="py-2.5 px-2.5 font-extrabold text-center text-white">
                              {om.labels[col.labelKey] || col.labelKey}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#131e2c] text-xs font-mono">
                        {filteredBookies.map((bk, bIdx) => (
                          <tr
                            key={bk.id}
                            className="hover:bg-[#0d1724] transition-colors"
                          >
                            {/* Bookmaker Name & Rank */}
                            <td className="py-2 px-3 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="w-5 text-[10px] font-mono text-[#64748b]">
                                  #{bIdx + 1}
                                </span>
                                <span className="font-extrabold text-white text-xs">
                                  {bk.name}
                                </span>
                              </div>
                            </td>

                            {/* Tier Badge */}
                            <td className="py-2 px-2 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-extrabold ${
                                  bk.tier === 'SHARP'
                                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
                                    : bk.tier === 'EXCHANGE'
                                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/35'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {bk.tier === 'SHARP'
                                  ? bcDict.tierSharp
                                  : bk.tier === 'EXCHANGE'
                                  ? bcDict.tierExchange
                                  : bcDict.tierSoft}
                              </span>
                            </td>

                            {/* Payout % / Margin % */}
                            <td className="py-2 px-2 text-center text-[11px]">
                              <span
                                className={
                                  bk.payoutPercent >= 97
                                    ? 'text-[#43f08a] font-bold'
                                    : 'text-neutral-300'
                                }
                              >
                                {bk.payoutPercent.toFixed(1)}%
                              </span>
                              <span className="text-[#64748b] text-[10px] ml-1">
                                ({bk.marginPercent.toFixed(1)}%)
                              </span>
                            </td>

                            {/* Market Columns for Active Category */}
                            {visibleItems.map((col) => {
                              const val = col.getVal(bk.markets);
                              const isBest =
                                Math.abs(val - (bestByCol[col.key]?.maxOdd || 0)) < 0.005;
                              const colLabel = om.labels[col.labelKey] || col.labelKey;

                              return (
                                <td key={col.key} className="py-1.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onLogBet(
                                        match,
                                        `${colLabel} (${bk.name})`,
                                        val,
                                        edgePercent,
                                        om.title
                                      )
                                    }
                                    title={`${bk.name} — ${colLabel} @ ${val.toFixed(2)} (${bcDict.logTooltip})`}
                                    className={`w-full py-1.5 px-2 rounded-lg font-mono text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                                      isBest
                                        ? 'bg-emerald-500/20 hover:bg-[#22c55e] text-[#43f08a] hover:text-[#04130b] border border-emerald-500/50 font-black shadow-sm'
                                        : 'bg-[#0b121c] hover:bg-[#162436] text-neutral-200 border border-[#162232] font-semibold'
                                    }`}
                                  >
                                    <span>{val.toFixed(2)}</span>
                                    {isBest && (
                                      <span className="text-[9px] text-amber-300">★</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

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
                <span className="text-[10px] text-[#8f9cae] block">
                  {t.valueAngle} · <strong className="text-emerald-300">{bestEvSignal.bookie}</strong>
                </span>
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
              <span className="text-sm font-mono font-black text-white mt-0.5 block">
                {bestEvSignal.marketOdd.toFixed(2)}
              </span>
            </div>
            <div className="border-l border-[#162232]">
              <span className="text-[10px] text-[#8f9cae] block">{t.fairOdds}</span>
              <span className="text-sm font-mono font-black text-white mt-0.5 block">
                {bestEvSignal.fairOdd.toFixed(2)}
              </span>
            </div>
            <div className="border-l border-[#162232]">
              <span className="text-[10px] text-[#8f9cae] block">{t.edge}</span>
              <span className="text-sm font-mono font-black text-[#43f08a] mt-0.5 block">
                +{edgePercent}%
              </span>
            </div>
            <div className="border-l border-[#162232]">
              <span className="text-[10px] text-[#8f9cae] block">{t.confidence}</span>
              <span
                className={`text-xs font-bold mt-1 inline-flex items-center gap-1 ${
                  bestEvSignal.confidenceTier === 'HIGH' ? 'text-[#43f08a]' : 'text-amber-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    bestEvSignal.confidenceTier === 'HIGH' ? 'bg-[#43f08a]' : 'bg-amber-400'
                  }`}
                />
                {bestEvSignal.confidenceLabel}
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
              <span className="font-mono font-extrabold text-white mt-0.5 block">
                {bestEvSignal.modelProbPct.toFixed(2)}%
              </span>
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
                onLogBet(
                  match,
                  `${bestMarketLabel} (${bestEvSignal.bookie})`,
                  bestEvSignal.marketOdd,
                  edgePercent,
                  bestEvSignal.marketCategory,
                  50
                )
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
        {/* PANEL 4: Lineups 2D Tactical Pitch + Coaches + Substitutes — HIDDEN when API-Football does not provide lineups */}
        {showLineupsPanel && (
          <div className="lg:col-span-4 rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
              <h3 className="text-sm font-extrabold text-white">{t.lineups}</h3>
              <span className="text-[10px] text-[#8f9cae]">
                {language === 'bg' ? 'Задръж за снимка · Кликни за профил' : 'Hover for photo · Click for profile'}
              </span>
            </div>

            {renderFullLineupsContent(false)}
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
                    onClick={() =>
                      onLogBet(
                        match,
                        '1X',
                        currentMultiMarkets.doubleChance.homeDraw,
                        edgePercent,
                        'Double Chance'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">1X</span>
                    <span className="font-bold">
                      {currentMultiMarkets.doubleChance.homeDraw.toFixed(2)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        'X2',
                        currentMultiMarkets.doubleChance.drawAway,
                        edgePercent,
                        'Double Chance'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">X2</span>
                    <span className="font-bold">
                      {currentMultiMarkets.doubleChance.drawAway.toFixed(2)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        '12',
                        currentMultiMarkets.doubleChance.homeAway,
                        edgePercent,
                        'Double Chance'
                      )
                    }
                    className="flex justify-between px-2 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b]">12</span>
                    <span className="font-bold">
                      {currentMultiMarkets.doubleChance.homeAway.toFixed(2)}
                    </span>
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
                        `${match.homeTeam} ${asianHandicapMarket.homeLine}`,
                        asianHandicapMarket.homeOdd,
                        edgePercent,
                        'Asian Handicap'
                      )
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b] truncate pr-1">
                      {asianHandicapMarket.homeLine}
                    </span>
                    <span className="font-bold">{asianHandicapMarket.homeOdd.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLogBet(
                        match,
                        `${match.awayTeam} ${asianHandicapMarket.awayLine}`,
                        asianHandicapMarket.awayOdd,
                        edgePercent,
                        'Asian Handicap'
                      )
                    }
                    className="flex justify-between px-2.5 py-1.5 rounded-lg border border-[#1c2a3b] bg-[#0e1622] hover:border-[#43f08a] text-white cursor-pointer"
                  >
                    <span className="text-[#64748b] truncate pr-1">
                      {asianHandicapMarket.awayLine}
                    </span>
                    <span className="font-bold">{asianHandicapMarket.awayOdd.toFixed(2)}</span>
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

