import React, { useEffect, useState } from 'react';
import { ActiveTab, BetRecord, Language, Match } from '../types';
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
  it: {
    pageTitle: 'Partite Live',
    pageSub: 'Segui ogni momento, trova valore (+EV) e aggiungi scommesse in pochi secondi.',
    badgeRealtime: 'Dati in tempo reale',
    badgeAnalytics: 'Analisi avanzate',
    badgeTrusted: 'Scelto dagli analisti',
    liveUpdates: 'Aggiornamenti live',
    liveMatchesStat: 'Partite Live',
    acrossLeagues: 'In 23 campionati',
    goalAlerts: 'Avvisi Gol',
    last15Min: 'Ultimi 15 min',
    trackedBets: 'Scommesse Seguite',
    acrossMarkets: 'In tutti i mercati',
    lastUpdated: 'Ultimo Aggiornamento',
    justNow: 'Proprio ora',
    allMatches: 'Tutte le Partite',
    liveNow: 'Live Ora',
    upcoming: 'In Programma',
    finished: 'Terminate',
    favorites: 'Preferiti',
    searchPlaceholder: 'Cerca squadre o campionati...',
    allCountries: 'Tutti i Paesi',
    allLeagues: 'Tutti i Campionati',
    allTimes: 'Tutti gli Orari',
    allMarkets: 'Tutti i Mercati',
    compact: 'Compatto',
    soundAlerts: 'Avvisi Sonori',
    featuredMatch: 'PARTITA IN EVIDENZA',
    momentum: 'MOMENTUM',
    liveStats: 'STATISTICHE LIVE',
    possession: 'Possesso Palla',
    shotsOnTarget: 'Tiri in Porta',
    dangerousAttacks: 'Attacchi Pericolosi',
    addBet: 'Aggiungi',
    matchDetails: 'Dettagli ›',
    details: 'Dettagli ›',
    colLeagueMatch: 'CAMPIONATO & PARTITA',
    colScore: 'RISULTATO',
    colMarkets: 'MERCATI',
    colXg: 'xG',
    colPos: 'POSS',
    colDangerous: 'ATTACCHI PERICOLOSI',
    quickBetSlip: 'Schedina Rapida',
    combinedOdds: 'Quota Totale',
    stakeLabel: 'Puntata (€)',
    potentialPayout: 'Vincita Potenziale',
    saveToMyBets: 'Salva in Le Mie Scommesse',
    myBetsTitle: 'Le Mie Scommesse',
    viewAll: 'Vedi Tutte',
    tabLive: 'Attive',
    tabCashOut: 'Cash Out',
    tabSettled: 'Chiuse',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Puntata',
    payoutText: 'Vincita',
    addSelectionBtn: '+ Aggiungi selezione alla schedina',
    smarterTitle: 'Scommesse più intelligenti iniziano con strumenti migliori.',
    smarterSub: 'Ottieni vantaggio matematico (+EV), avvisi live e analisi approfondite.',
    feat1Title: 'Dati in tempo reale',
    feat1Sub: 'Aggiornamenti ultra-rapidi',
    feat2Title: 'Analisi avanzate',
    feat2Sub: 'xG, momentum e Poisson',
    feat3Title: 'Avvisi personalizzati',
    feat3Sub: 'Non perdere valore +EV',
    exploreTools: 'Esplora Strumenti',
    emptySlip: 'Clicca su una quota (1, X, 2) per aggiungere una selezione.',
    directMyBetsBtn: '+ Salva in Le Mie Scommesse',
    modalClose: 'Chiudi',
    modalMarketsTitle: 'Mercati Disponibili (Salva in Le Mie Scommesse)',
  },
  pt: {
    pageTitle: 'Jogos Ao Vivo',
    pageSub: 'Acompanhe cada momento, encontre valor (+EV) e adicione apostas em segundos.',
    badgeRealtime: 'Dados em tempo real',
    badgeAnalytics: 'Análise avançada',
    badgeTrusted: 'Confiado por analistas',
    liveUpdates: 'Atualização em tempo real',
    liveMatchesStat: 'Jogos Ao Vivo',
    acrossLeagues: 'Em 23 ligas',
    goalAlerts: 'Alertas de Golo',
    last15Min: 'Últimos 15 min',
    trackedBets: 'Apostas Seguidas',
    acrossMarkets: 'Em todos os mercados',
    lastUpdated: 'Última Atualização',
    justNow: 'Agora mesmo',
    allMatches: 'Todos os Jogos',
    liveNow: 'Ao Vivo Agora',
    upcoming: 'Próximos',
    finished: 'Terminados',
    favorites: 'Favoritos',
    searchPlaceholder: 'Buscar equipas ou ligas...',
    allCountries: 'Todos os Países',
    allLeagues: 'Todas as Ligas',
    allTimes: 'Todos os Horários',
    allMarkets: 'Todos os Mercados',
    compact: 'Compacto',
    soundAlerts: 'Alertas Sonoros',
    featuredMatch: 'JOGO EM DESTAQUE',
    momentum: 'MOMENTUM',
    liveStats: 'ESTATÍSTICAS AO VIVO',
    possession: 'Posse de Bola',
    shotsOnTarget: 'Remates à Baliza',
    dangerousAttacks: 'Ataques Perigosos',
    addBet: 'Apostar',
    matchDetails: 'Detalhes ›',
    details: 'Detalhes ›',
    colLeagueMatch: 'LIGA & JOGO',
    colScore: 'PLACAR',
    colMarkets: 'MERCADOS',
    colXg: 'xG',
    colPos: 'POS',
    colDangerous: 'ATAQUES PERIGOSOS',
    quickBetSlip: 'Boletim Rápido',
    combinedOdds: 'Odd Combinada',
    stakeLabel: 'Valor (€)',
    potentialPayout: 'Retorno Potencial',
    saveToMyBets: 'Guardar em Minhas Apostas',
    myBetsTitle: 'Minhas Apostas',
    viewAll: 'Ver Todas',
    tabLive: 'Ativas',
    tabCashOut: 'Cash Out',
    tabSettled: 'Resolvidas',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Valor',
    payoutText: 'Retorno',
    addSelectionBtn: '+ Adicionar seleção ao boletim',
    smarterTitle: 'Apostas mais inteligentes começam com ferramentas melhores.',
    smarterSub: 'Obtenha vantagem matemática (+EV), alertas ao vivo e análise avançada.',
    feat1Title: 'Dados em tempo real',
    feat1Sub: 'Atualizações ultrarrápidas',
    feat2Title: 'Análise avançada',
    feat2Sub: 'xG, momentum e Poisson',
    feat3Title: 'Alertas personalizados',
    feat3Sub: 'Nunca perca valor +EV',
    exploreTools: 'Explorar Ferramentas',
    emptySlip: 'Clique numa odd (1, X, 2) para adicionar ao boletim.',
    directMyBetsBtn: '+ Guardar em Minhas Apostas',
    modalClose: 'Fechar',
    modalMarketsTitle: 'Mercados Disponíveis (Guardar em Minhas Apostas)',
  },
  fr: {
    pageTitle: 'Matchs en Direct',
    pageSub: 'Suivez chaque instant, détectez la valeur (+EV) et ajoutez vos paris en quelques secondes.',
    badgeRealtime: 'Données en temps réel',
    badgeAnalytics: 'Analytique avancée',
    badgeTrusted: 'Approuvé par les analystes',
    liveUpdates: 'Mises à jour en direct',
    liveMatchesStat: 'Matchs en Direct',
    acrossLeagues: 'Dans 23 championnats',
    goalAlerts: 'Alertes Buts',
    last15Min: '15 dernières min',
    trackedBets: 'Paris Suivis',
    acrossMarkets: 'Sur tous les marchés',
    lastUpdated: 'Dernière Mise à Jour',
    justNow: 'À l’instant',
    allMatches: 'Tous les Matchs',
    liveNow: 'En Direct',
    upcoming: 'À Venir',
    finished: 'Terminés',
    favorites: 'Favoris',
    searchPlaceholder: 'Rechercher équipes ou ligues...',
    allCountries: 'Tous les Pays',
    allLeagues: 'Toutes les Ligues',
    allTimes: 'Tous les Horaires',
    allMarkets: 'Tous les Marchés',
    compact: 'Compact',
    soundAlerts: 'Alertes Sonores',
    featuredMatch: 'MATCH À LA UNE',
    momentum: 'MOMENTUM',
    liveStats: 'STATS EN DIRECT',
    possession: 'Possession',
    shotsOnTarget: 'Tirs Cadrés',
    dangerousAttacks: 'Attaques Dangereuses',
    addBet: 'Ajouter',
    matchDetails: 'Détails ›',
    details: 'Détails ›',
    colLeagueMatch: 'LIGUE & MATCH',
    colScore: 'SCORE',
    colMarkets: 'MARCHÉS',
    colXg: 'xG',
    colPos: 'POSS',
    colDangerous: 'ATTAQUES DANGEREUSES',
    quickBetSlip: 'Ticket Rapide',
    combinedOdds: 'Cote Combinée',
    stakeLabel: 'Mise (€)',
    potentialPayout: 'Gain Potentiel',
    saveToMyBets: 'Enregistrer dans Mes Paris',
    myBetsTitle: 'Mes Paris',
    viewAll: 'Voir Tout',
    tabLive: 'En Cours',
    tabCashOut: 'Cash Out',
    tabSettled: 'Terminés',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Mise',
    payoutText: 'Gain',
    addSelectionBtn: '+ Ajouter une sélection au ticket',
    smarterTitle: 'Des paris plus intelligents commencent par de meilleurs outils.',
    smarterSub: 'Obtenez un avantage mathématique (+EV), des alertes live et des analyses.',
    feat1Title: 'Données en temps réel',
    feat1Sub: 'Mises à jour ultra-rapides',
    feat2Title: 'Analytique avancée',
    feat2Sub: 'xG, momentum & Poisson',
    feat3Title: 'Alertes personnalisées',
    feat3Sub: 'Ne manquez aucune value',
    exploreTools: 'Explorer les Outils',
    emptySlip: 'Cliquez sur une cote (1, X, 2) pour ajouter une sélection.',
    directMyBetsBtn: '+ Enregistrer dans Mes Paris',
    modalClose: 'Fermer',
    modalMarketsTitle: 'Marchés Disponibles (Enregistrer dans Mes Paris)',
  },
  tr: {
    pageTitle: 'Canlı Maçlar',
    pageSub: 'Her anı takip edin, +EV değerini yakalayın ve bahislerinizi saniyeler içinde ekleyin.',
    badgeRealtime: 'Gerçek zamanlı veri',
    badgeAnalytics: 'Gelişmiş analitik',
    badgeTrusted: 'Analistlerin tercihi',
    liveUpdates: 'Canlı güncellemeler',
    liveMatchesStat: 'Canlı Maçlar',
    acrossLeagues: '23 Ligde',
    goalAlerts: 'Gol Bildirimleri',
    last15Min: 'Son 15 dakika',
    trackedBets: 'Takip Edilen Bahisler',
    acrossMarkets: 'Tüm marketlerde',
    lastUpdated: 'Son Güncelleme',
    justNow: 'Az önce',
    allMatches: 'Tüm Maçlar',
    liveNow: 'Şimdi Canlı',
    upcoming: 'Yaklaşanlar',
    finished: 'Bitenler',
    favorites: 'Favoriler',
    searchPlaceholder: 'Takım veya lig ara...',
    allCountries: 'Tüm Ülkeler',
    allLeagues: 'Tüm Ligler',
    allTimes: 'Tüm Saatler',
    allMarkets: 'Tüm Marketler',
    compact: 'Kompakt',
    soundAlerts: 'Sesli Bildirim',
    featuredMatch: 'ÖNE ÇIKAN CANLI MAÇ',
    momentum: 'MOMENTUM',
    liveStats: 'CANLI İSTATİSTİK',
    possession: 'Topa Sahip Olma',
    shotsOnTarget: 'İsabetli Şut',
    dangerousAttacks: 'Tehlikeli Atak',
    addBet: 'Bahis Ekle',
    matchDetails: 'Detaylar ›',
    details: 'Detaylar ›',
    colLeagueMatch: 'LİG & MAÇ',
    colScore: 'SKOR',
    colMarkets: 'MARKETLER',
    colXg: 'xG',
    colPos: 'TOP',
    colDangerous: 'TEHLİKELİ ATAKLAR',
    quickBetSlip: 'Hızlı Kupon',
    combinedOdds: 'Toplam Oran',
    stakeLabel: 'Tutar (€)',
    potentialPayout: 'Olası Kazanç',
    saveToMyBets: 'Bahislerime Kaydet',
    myBetsTitle: 'Bahislerim',
    viewAll: 'Tümünü Gör',
    tabLive: 'Aktif',
    tabCashOut: 'Bahis Bozdur',
    tabSettled: 'Sonuçlanan',
    cashOutBtn: 'BOZDUR',
    stakeText: 'Tutar',
    payoutText: 'Kazanç',
    addSelectionBtn: '+ Tablodan oran seçin',
    smarterTitle: 'Daha akıllı bahisler daha akıllı araçlarla başlar.',
    smarterSub: 'Matematiksel avantaj (+EV), canlı bildirimler ve derin analitik elde edin.',
    feat1Title: 'Gerçek zamanlı veri',
    feat1Sub: 'Ultra hızlı güncelleme',
    feat2Title: 'Gelişmiş analitik',
    feat2Sub: 'xG, momentum ve Poisson',
    feat3Title: 'Özel bildirimler',
    feat3Sub: '+EV fırsatlarını kaçırmayın',
    exploreTools: 'Araçları Keşfet',
    emptySlip: 'Seçim eklemek için herhangi bir orana (1, X, 2) tıklayın.',
    directMyBetsBtn: '+ Doğrudan Bahislerime Kaydet',
    modalClose: 'Kapat',
    modalMarketsTitle: 'Mevcut Marketler (Bahislerime Kaydet)',
  },
  pl: {
    pageTitle: 'Mecze na Żywo',
    pageSub: 'Śledź każdy moment, odkrywaj wartość (+EV) i dodawaj zakłady w kilka sekund.',
    badgeRealtime: 'Dane w czasie rzeczywistym',
    badgeAnalytics: 'Zaawansowana analityka',
    badgeTrusted: 'Zaufany przez analityków',
    liveUpdates: 'Aktualizacje na żywo',
    liveMatchesStat: 'Mecze na Żywo',
    acrossLeagues: 'W 23 ligach',
    goalAlerts: 'Alerty Bramkowe',
    last15Min: 'Ostatnie 15 min',
    trackedBets: 'Śledzone Zakłady',
    acrossMarkets: 'Na wszystkich rynkach',
    lastUpdated: 'Ostatnia Aktualizacja',
    justNow: 'Przed chwilą',
    allMatches: 'Wszystkie Mecze',
    liveNow: 'Teraz na Żywo',
    upcoming: 'Nadchodzące',
    finished: 'Zakończone',
    favorites: 'Ulubione',
    searchPlaceholder: 'Szukaj drużyn lub lig...',
    allCountries: 'Wszystkie Kraje',
    allLeagues: 'Wszystkie Ligi',
    allTimes: 'Wszystkie Godziny',
    allMarkets: 'Wszystkie Rynki',
    compact: 'Kompaktowy',
    soundAlerts: 'Alerty Dźwiękowe',
    featuredMatch: 'MECZ DNIA NA ŻYWO',
    momentum: 'MOMENTUM',
    liveStats: 'STATYSTYKI NA ŻYWO',
    possession: 'Posiadanie Piłki',
    shotsOnTarget: 'Celne Strzały',
    dangerousAttacks: 'Groźne Ataki',
    addBet: 'Dodaj Zakład',
    matchDetails: 'Szczegóły ›',
    details: 'Szczegóły ›',
    colLeagueMatch: 'LIGA I MECZ',
    colScore: 'WYNIK',
    colMarkets: 'RYNKI',
    colXg: 'xG',
    colPos: 'POS',
    colDangerous: 'GROŹNE ATAKI',
    quickBetSlip: 'Szybki Kupon',
    combinedOdds: 'Kurs Całkowity',
    stakeLabel: 'Stawka (€)',
    potentialPayout: 'Potencjalna Wygrana',
    saveToMyBets: 'Zapisz w Moich Zakładach',
    myBetsTitle: 'Moje Zakłady',
    viewAll: 'Zobacz Wszystkie',
    tabLive: 'Aktywne',
    tabCashOut: 'Cash Out',
    tabSettled: 'Rozliczone',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Stawka',
    payoutText: 'Wygrana',
    addSelectionBtn: '+ Dodaj selekcję do kuponu',
    smarterTitle: 'Mądrzejsze zakłady zaczynają się od mądrzejszych narzędzi.',
    smarterSub: 'Zyskaj przewagę matematyczną (+EV), alerty na żywo i głęboką analitykę.',
    feat1Title: 'Dane na żywo',
    feat1Sub: 'Błyskawiczne aktualizacje',
    feat2Title: 'Zaawansowana analityka',
    feat2Sub: 'xG, momentum i Poisson',
    feat3Title: 'Własne alerty',
    feat3Sub: 'Nie przegap wartości +EV',
    exploreTools: 'Odkryj Narzędzia',
    emptySlip: 'Kliknij dowolny kurs (1, X, 2), aby dodać selekcję.',
    directMyBetsBtn: '+ Zapisz w Moich Zakładach',
    modalClose: 'Zamknij',
    modalMarketsTitle: 'Dostępne Rynki (Zapisz w Moich Zakładach)',
  },
  el: {
    pageTitle: 'Αγώνες Ζωντανά',
    pageSub: 'Παρακολουθήστε κάθε στιγμή, βρείτε αξία (+EV) και προσθέστε στοιχήματα.',
    badgeRealtime: 'Δεδομένα σε πραγματικό χρόνο',
    badgeAnalytics: 'Προηγμένη αναλυτική',
    badgeTrusted: 'Εμπιστοσύνη αναλυτών',
    liveUpdates: 'Ζωντανές ενημερώσεις',
    liveMatchesStat: 'Αγώνες Ζωντανά',
    acrossLeagues: 'Σε 23 πρωταθλήματα',
    goalAlerts: 'Ειδοποιήσεις Γκολ',
    last15Min: 'Τελευταία 15 λεπτά',
    trackedBets: 'Στοιχήματα',
    acrossMarkets: 'Σε όλες τις αγορές',
    lastUpdated: 'Τελευταία Ενημέρωση',
    justNow: 'Μόλις τώρα',
    allMatches: 'Όλοι οι Αγώνες',
    liveNow: 'Ζωντανά Τώρα',
    upcoming: 'Προσεχείς',
    finished: 'Τελικοί',
    favorites: 'Αγαπημένα',
    searchPlaceholder: 'Αναζήτηση ομάδας ή λίγκας...',
    allCountries: 'Όλες οι Χώρες',
    allLeagues: 'Όλα τα Πρωταθλήματα',
    allTimes: 'Όλες οι Ώρες',
    allMarkets: 'Όλες οι Αγορές',
    compact: 'Συμπαγές',
    soundAlerts: 'Ηχητικές Ειδοποιήσεις',
    featuredMatch: 'ΚΟΡΥΦΑΙΟΣ ΑΓΩΝΑΣ LIVE',
    momentum: 'ΜΟΜΕΝΤΟΥΜ',
    liveStats: 'ΣΤΑΤΙΣΤΙΚΑ LIVE',
    possession: 'Κατοχή Μπάλας',
    shotsOnTarget: 'Σουτ στην Εστία',
    dangerousAttacks: 'Επικίνδυνες Επιθέσεις',
    addBet: 'Προσθήκη',
    matchDetails: 'Λεπτομέρειες ›',
    details: 'Λεπτομέρειες ›',
    colLeagueMatch: 'ΛΙΓΚΑ & ΑΓΩΝΑΣ',
    colScore: 'ΣΚΟΡ',
    colMarkets: 'ΑΓΟΡΕΣ',
    colXg: 'xG',
    colPos: 'ΚΑΤ',
    colDangerous: 'ΕΠΙΚΙΝΔΥΝΕΣ ΕΠΙΘΕΣΕΙΣ',
    quickBetSlip: 'Γρήγορο Δελτίο',
    combinedOdds: 'Συνολική Απόδοση',
    stakeLabel: 'Ποντάρισμα (€)',
    potentialPayout: 'Πιθανή Επιστροφή',
    saveToMyBets: 'Αποθήκευση στα Στοιχήματά μου',
    myBetsTitle: 'Τα Στοιχήματά μου',
    viewAll: 'Προβολή Όλων',
    tabLive: 'Ενεργά',
    tabCashOut: 'Cash Out',
    tabSettled: 'Διευθετημένα',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Ποντάρισμα',
    payoutText: 'Επιστροφή',
    addSelectionBtn: '+ Επιλέξτε απόδοση από τον πίνακα',
    smarterTitle: 'Τα πιο έξυπνα στοιχήματα ξεκινούν με πιο έξυπνα εργαλεία.',
    smarterSub: 'Αποκτήστε μαθηματικό πλεονέκτημα (+EV) και ζωντανές αναλύσεις.',
    feat1Title: 'Δεδομένα live',
    feat1Sub: 'Ταχύτατη ενημέρωση',
    feat2Title: 'Προηγμένη ανάλυση',
    feat2Sub: 'xG, μομέντουμ & Poisson',
    feat3Title: 'Ειδοποιήσεις',
    feat3Sub: 'Μην χάνετε αξία +EV',
    exploreTools: 'Εργαλεία Ανάλυσης',
    emptySlip: 'Κάντε κλικ σε μια απόδοση (1, X, 2) για προσθήκη.',
    directMyBetsBtn: '+ Αποθήκευση στα Στοιχήματά μου',
    modalClose: 'Κλείσιμο',
    modalMarketsTitle: 'Διαθέσιμες Αγορές (Αποθήκευση στα Στοιχήματά μου)',
  },
  ro: {
    pageTitle: 'Meciuri Live',
    pageSub: 'Urmărește fiecare moment, descoperă valoare (+EV) și adaugă pariuri în câteva secunde.',
    badgeRealtime: 'Date în timp real',
    badgeAnalytics: 'Analitică avansată',
    badgeTrusted: 'Apreciat de analiști',
    liveUpdates: 'Actualizare în timp real',
    liveMatchesStat: 'Meciuri Live',
    acrossLeagues: 'În 23 de campionate',
    goalAlerts: 'Alerte de Gol',
    last15Min: 'Ultimele 15 min',
    trackedBets: 'Pariuri Urmărite',
    acrossMarkets: 'Pe toate piețele',
    lastUpdated: 'Ultima Actualizare',
    justNow: 'Chiar acum',
    allMatches: 'Toate Meciurile',
    liveNow: 'Live Acum',
    upcoming: 'Următoarele',
    finished: 'Finalizate',
    favorites: 'Favorite',
    searchPlaceholder: 'Caută echipe sau campionate...',
    allCountries: 'Toate Țările',
    allLeagues: 'Toate Ligile',
    allTimes: 'Toate Orele',
    allMarkets: 'Toate Piețele',
    compact: 'Compact',
    soundAlerts: 'Alerte Sonore',
    featuredMatch: 'MECIUL ZILEI LIVE',
    momentum: 'MOMENTUM',
    liveStats: 'STATISTICI LIVE',
    possession: 'Posesie',
    shotsOnTarget: 'Șuturi pe Poartă',
    dangerousAttacks: 'Atacuri Periculoase',
    addBet: 'Adaugă Pariu',
    matchDetails: 'Detalii ›',
    details: 'Detalii ›',
    colLeagueMatch: 'LIGĂ & MECI',
    colScore: 'SCOR',
    colMarkets: 'PIEȚE',
    colXg: 'xG',
    colPos: 'POS',
    colDangerous: 'ATACURI PERICULOASE',
    quickBetSlip: 'Bilet Rapid',
    combinedOdds: 'Cotă Totală',
    stakeLabel: 'Miză (€)',
    potentialPayout: 'Câștig Potențial',
    saveToMyBets: 'Salvează în Pariurile Mele',
    myBetsTitle: 'Pariurile Mele',
    viewAll: 'Vezi Toate',
    tabLive: 'Active',
    tabCashOut: 'Cash Out',
    tabSettled: 'Decise',
    cashOutBtn: 'CASH OUT',
    stakeText: 'Miză',
    payoutText: 'Câștig',
    addSelectionBtn: '+ Adaugă selecție pe bilet',
    smarterTitle: 'Pariurile mai inteligente încep cu instrumente mai inteligente.',
    smarterSub: 'Obține avantaj matematic (+EV), alerte live și analitică avansată.',
    feat1Title: 'Date în timp real',
    feat1Sub: 'Actualizări ultra-rapide',
    feat2Title: 'Analitică avansată',
    feat2Sub: 'xG, momentum și Poisson',
    feat3Title: 'Alerte personalizate',
    feat3Sub: 'Nu rata valoarea +EV',
    exploreTools: 'Explorează Instrumente',
    emptySlip: 'Apasă pe orice cotă (1, X, 2) pentru a adăuga o selecție.',
    directMyBetsBtn: '+ Salvează în Pariurile Mele',
    modalClose: 'Închide',
    modalMarketsTitle: 'Piețe Disponibile (Salvează în Pariurile Mele)',
  },
  ru: {
    pageTitle: 'Матчи в лайве',
    pageSub: 'Следите за каждым моментом, находите перевес (+EV) и добавляйте ставки за секунды.',
    badgeRealtime: 'Данные в реальном времени',
    badgeAnalytics: 'Продвинутая аналитика',
    badgeTrusted: 'Выбор аналитиков',
    liveUpdates: 'Обновление в реальном времени',
    liveMatchesStat: 'Матчи в лайве',
    acrossLeagues: 'В 23 турнирах',
    goalAlerts: 'Голы в лайве',
    last15Min: 'Последние 15 мин',
    trackedBets: 'Отслеживаемые ставки',
    acrossMarkets: 'По всем рынкам',
    lastUpdated: 'Обновлено',
    justNow: 'Только что',
    allMatches: 'Все матчи',
    liveNow: 'Сейчас в лайве',
    upcoming: 'Предстоящие',
    finished: 'Завершённые',
    favorites: 'Избранное',
    searchPlaceholder: 'Поиск команд или лиг...',
    allCountries: 'Все страны',
    allLeagues: 'Все лиги',
    allTimes: 'Все часы',
    allMarkets: 'Все рынки',
    compact: 'Компактно',
    soundAlerts: 'Звуковые сигналы',
    featuredMatch: 'ГЛАВНЫЙ МАТЧ LIVE',
    momentum: 'ИМПУЛЬС ИГРЫ',
    liveStats: 'ЛАЙВ-СТАТИСТИКА',
    possession: 'Владение мячом',
    shotsOnTarget: 'Удары в створ',
    dangerousAttacks: 'Опасные атаки',
    addBet: 'В купон',
    matchDetails: 'Детали ›',
    details: 'Детали ›',
    colLeagueMatch: 'ЛИГА И МАТЧ',
    colScore: 'СЧЁТ',
    colMarkets: 'РЫНКИ (1X2)',
    colXg: 'xG',
    colPos: 'ВЛАД.',
    colDangerous: 'ОПАСНЫЕ АТАКИ',
    quickBetSlip: 'Быстрый купон',
    combinedOdds: 'Общий кэф',
    stakeLabel: 'Сумма (€)',
    potentialPayout: 'Возможная выплата',
    saveToMyBets: 'Сохранить в Мои Ставки',
    myBetsTitle: 'Мои Ставки',
    viewAll: 'Все',
    tabLive: 'Активные',
    tabCashOut: 'Кэшаут',
    tabSettled: 'Рассчитанные',
    cashOutBtn: 'КЭШАУТ',
    stakeText: 'Ставка',
    payoutText: 'Выплата',
    addSelectionBtn: '+ Выберите коэффициент в таблице',
    smarterTitle: 'Умные ставки начинаются с умных инструментов.',
    smarterSub: 'Получите математический перевес (+EV), лайв-сигналы и глубокую аналитику.',
    feat1Title: 'Данные в лайве',
    feat1Sub: 'Мгновенное обновление',
    feat2Title: 'Продвинутая аналитика',
    feat2Sub: 'xG, импульс и Пуассон',
    feat3Title: 'Персональные сигналы',
    feat3Sub: 'Не упускайте +EV валуй',
    exploreTools: 'Открыть инструменты',
    emptySlip: 'Нажмите на коэффициент (1, X, 2), чтобы добавить исход в купон.',
    directMyBetsBtn: '+ Сохранить в Мои Ставки',
    modalClose: 'Закрыть',
    modalMarketsTitle: 'Доступные рынки (Сохранить в Мои Ставки)',
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

  const droppingMarketLabels: Record<string, Record<string, string>> = {
    bg: {
      homeWin: '1 (Домакин)',
      draw: 'X (Равен)',
      awayWin: '2 (Гост)',
      dc1X: '1X (Двоен шанс)',
      dc12: '12 (Двоен шанс)',
      dcX2: 'X2 (Двоен шанс)',
      over15: 'Над 1.5 Гола',
      under15: 'Под 1.5 Гола',
      over25: 'Над 2.5 Гола',
      under25: 'Под 2.5 Гола',
      over35: 'Над 3.5 Гола',
      under35: 'Под 3.5 Гола',
      fhHome: '1-во ПП — 1',
      fhDraw: '1-во ПП — X',
      fhAway: '1-во ПП — 2',
      fhOver05: '1-во ПП Над 0.5',
      fhUnder05: '1-во ПП Под 0.5',
      fhOver15: '1-во ПП Над 1.5',
      fhUnder15: '1-во ПП Под 1.5',
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
    en: {
      homeWin: '1 (Home)',
      draw: 'X (Draw)',
      awayWin: '2 (Away)',
      dc1X: '1X (Double Chance)',
      dc12: '12 (Double Chance)',
      dcX2: 'X2 (Double Chance)',
      over15: 'Over 1.5 Goals',
      under15: 'Under 1.5 Goals',
      over25: 'Over 2.5 Goals',
      under25: 'Under 2.5 Goals',
      over35: 'Over 3.5 Goals',
      under35: 'Under 3.5 Goals',
      fhHome: '1st Half — 1',
      fhDraw: '1st Half — X',
      fhAway: '1st Half — 2',
      fhOver05: '1st Half Over 0.5',
      fhUnder05: '1st Half Under 0.5',
      fhOver15: '1st Half Over 1.5',
      fhUnder15: '1st Half Under 1.5',
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
      bttsYes: 'BTTS — Yes',
      bttsNo: 'BTTS — No',
    },
    es: {
      homeWin: '1 (Local)',
      draw: 'X (Empate)',
      awayWin: '2 (Visitante)',
      dc1X: '1X (Doble Oport.)',
      dc12: '12 (Doble Oport.)',
      dcX2: 'X2 (Doble Oport.)',
      over15: 'Más de 1.5 Goles',
      under15: 'Menos de 1.5 Goles',
      over25: 'Más de 2.5 Goles',
      under25: 'Menos de 2.5 Goles',
      over35: 'Más de 3.5 Goles',
      under35: 'Menos de 3.5 Goles',
      fhHome: '1ª Mitad — 1',
      fhDraw: '1ª Mitad — X',
      fhAway: '1ª Mitad — 2',
      fhOver05: '1ª Mitad +0.5',
      fhUnder05: '1ª Mitad -0.5',
      fhOver15: '1ª Mitad +1.5',
      fhUnder15: '1ª Mitad -1.5',
      cornersOver85: 'Córners +8.5',
      cornersUnder85: 'Córners -8.5',
      cornersOver95: 'Córners +9.5',
      cornersUnder95: 'Córners -9.5',
      cornersOver105: 'Córners +10.5',
      cornersUnder105: 'Córners -10.5',
      cardsOver35: 'Tarjetas +3.5',
      cardsUnder35: 'Tarjetas -3.5',
      cardsOver45: 'Tarjetas +4.5',
      cardsUnder45: 'Tarjetas -4.5',
      bttsYes: 'Ambos Marcan — Sí',
      bttsNo: 'Ambos Marcan — No',
    },
    de: {
      homeWin: '1 (Heim)',
      draw: 'X (Remis)',
      awayWin: '2 (Gast)',
      dc1X: '1X (Doppelte Chance)',
      dc12: '12 (Doppelte Chance)',
      dcX2: 'X2 (Doppelte Chance)',
      over15: 'Über 1.5 Tore',
      under15: 'Unter 1.5 Tore',
      over25: 'Über 2.5 Tore',
      under25: 'Unter 2.5 Tore',
      over35: 'Über 3.5 Tore',
      under35: 'Unter 3.5 Tore',
      fhHome: '1. HZ — 1',
      fhDraw: '1. HZ — X',
      fhAway: '1. HZ — 2',
      fhOver05: '1. HZ Über 0.5',
      fhUnder05: '1. HZ Unter 0.5',
      fhOver15: '1. HZ Über 1.5',
      fhUnder15: '1. HZ Unter 1.5',
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
      bttsYes: 'BTTS — Ja',
      bttsNo: 'BTTS — Nein',
    },
    it: {
      homeWin: '1 (Casa)',
      draw: 'X (Pareggio)',
      awayWin: '2 (Ospite)',
      dc1X: '1X (Doppia Chance)',
      dc12: '12 (Doppia Chance)',
      dcX2: 'X2 (Doppia Chance)',
      over15: 'Over 1.5 Gol',
      under15: 'Under 1.5 Gol',
      over25: 'Over 2.5 Gol',
      under25: 'Under 2.5 Gol',
      over35: 'Over 3.5 Gol',
      under35: 'Under 3.5 Gol',
      fhHome: '1° Tempo — 1',
      fhDraw: '1° Tempo — X',
      fhAway: '1° Tempo — 2',
      fhOver05: '1° Tempo Over 0.5',
      fhUnder05: '1° Tempo Under 0.5',
      fhOver15: '1° Tempo Over 1.5',
      fhUnder15: '1° Tempo Under 1.5',
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
      bttsYes: 'Goal/Goal — Sì',
      bttsNo: 'No Goal',
    },
    pt: {
      homeWin: '1 (Casa)',
      draw: 'X (Empate)',
      awayWin: '2 (Fora)',
      dc1X: '1X (Hipótese Dupla)',
      dc12: '12 (Hipótese Dupla)',
      dcX2: 'X2 (Hipótese Dupla)',
      over15: 'Mais de 1.5 Golos',
      under15: 'Menos de 1.5 Golos',
      over25: 'Mais de 2.5 Golos',
      under25: 'Menos de 2.5 Golos',
      over35: 'Mais de 3.5 Golos',
      under35: 'Menos de 3.5 Golos',
      fhHome: '1ª Parte — 1',
      fhDraw: '1ª Parte — X',
      fhAway: '1ª Parte — 2',
      fhOver05: '1ª Parte +0.5',
      fhUnder05: '1ª Parte -0.5',
      fhOver15: '1ª Parte +1.5',
      fhUnder15: '1ª Parte -1.5',
      cornersOver85: 'Cantos +8.5',
      cornersUnder85: 'Cantos -8.5',
      cornersOver95: 'Cantos +9.5',
      cornersUnder95: 'Cantos -9.5',
      cornersOver105: 'Cantos +10.5',
      cornersUnder105: 'Cantos -10.5',
      cardsOver35: 'Cartões +3.5',
      cardsUnder35: 'Cartões -3.5',
      cardsOver45: 'Cartões +4.5',
      cardsUnder45: 'Cartões -4.5',
      bttsYes: 'Ambas Marcam — Sim',
      bttsNo: 'Ambas Marcam — Não',
    },
    fr: {
      homeWin: '1 (Domicile)',
      draw: 'X (Nul)',
      awayWin: '2 (Extérieur)',
      dc1X: '1X (Double Chance)',
      dc12: '12 (Double Chance)',
      dcX2: 'X2 (Double Chance)',
      over15: 'Plus de 1.5 Buts',
      under15: 'Moins de 1.5 Buts',
      over25: 'Plus de 2.5 Buts',
      under25: 'Moins de 2.5 Buts',
      over35: 'Plus de 3.5 Buts',
      under35: 'Moins de 3.5 Buts',
      fhHome: '1ère MT — 1',
      fhDraw: '1ère MT — X',
      fhAway: '1ère MT — 2',
      fhOver05: '1ère MT +0.5',
      fhUnder05: '1ère MT -0.5',
      fhOver15: '1ère MT +1.5',
      fhUnder15: '1ère MT -1.5',
      cornersOver85: 'Corners +8.5',
      cornersUnder85: 'Corners -8.5',
      cornersOver95: 'Corners +9.5',
      cornersUnder95: 'Corners -9.5',
      cornersOver105: 'Corners +10.5',
      cornersUnder105: 'Corners -10.5',
      cardsOver35: 'Cartons +3.5',
      cardsUnder35: 'Cartons -3.5',
      cardsOver45: 'Cartons +4.5',
      cardsUnder45: 'Cartons -4.5',
      bttsYes: 'LDEM — Oui',
      bttsNo: 'LDEM — Non',
    },
    tr: {
      homeWin: 'MS 1 (Ev)',
      draw: 'MS X (Beraberlik)',
      awayWin: 'MS 2 (Deplasman)',
      dc1X: '1X (Çifte Şans)',
      dc12: '12 (Çifte Şans)',
      dcX2: 'X2 (Çifte Şans)',
      over15: '1.5 Üst',
      under15: '1.5 Alt',
      over25: '2.5 Üst',
      under25: '2.5 Alt',
      over35: '3.5 Üst',
      under35: '3.5 Alt',
      fhHome: 'İY 1',
      fhDraw: 'İY X',
      fhAway: 'İY 2',
      fhOver05: 'İY 0.5 Üst',
      fhUnder05: 'İY 0.5 Alt',
      fhOver15: 'İY 1.5 Üst',
      fhUnder15: 'İY 1.5 Alt',
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
      bttsYes: 'KG Var',
      bttsNo: 'KG Yok',
    },
    pl: {
      homeWin: '1 (Gospodarz)',
      draw: 'X (Remis)',
      awayWin: '2 (Gość)',
      dc1X: '1X (Podwójna szansa)',
      dc12: '12 (Podwójna szansa)',
      dcX2: 'X2 (Podwójna szansa)',
      over15: 'Powyżej 1.5 Gola',
      under15: 'Poniżej 1.5 Gola',
      over25: 'Powyżej 2.5 Gola',
      under25: 'Poniżej 2.5 Gola',
      over35: 'Powyżej 3.5 Gola',
      under35: 'Poniżej 3.5 Gola',
      fhHome: '1. Połowa — 1',
      fhDraw: '1. Połowa — X',
      fhAway: '1. Połowa — 2',
      fhOver05: '1. Połowa +0.5',
      fhUnder05: '1. Połowa -0.5',
      fhOver15: '1. Połowa +1.5',
      fhUnder15: '1. Połowa -1.5',
      cornersOver85: 'Rożne +8.5',
      cornersUnder85: 'Rożne -8.5',
      cornersOver95: 'Rożne +9.5',
      cornersUnder95: 'Rożne -9.5',
      cornersOver105: 'Rożne +10.5',
      cornersUnder105: 'Rożne -10.5',
      cardsOver35: 'Kartki +3.5',
      cardsUnder35: 'Kartki -3.5',
      cardsOver45: 'Kartki +4.5',
      cardsUnder45: 'Kartki -4.5',
      bttsYes: 'BTTS — Tak',
      bttsNo: 'BTTS — Nie',
    },
    el: {
      homeWin: '1 (Άσος)',
      draw: 'X (Ισοπαλία)',
      awayWin: '2 (Διπλό)',
      dc1X: '1X (Διπλή Ευκαιρία)',
      dc12: '12 (Διπλή Ευκαιρία)',
      dcX2: 'X2 (Διπλή Ευκαιρία)',
      over15: 'Over 1.5 Γκολ',
      under15: 'Under 1.5 Γκολ',
      over25: 'Over 2.5 Γκολ',
      under25: 'Under 2.5 Γκολ',
      over35: 'Over 3.5 Γκολ',
      under35: 'Under 3.5 Γκολ',
      fhHome: '1ο Ημίχρονο — 1',
      fhDraw: '1ο Ημίχρονο — X',
      fhAway: '1ο Ημίχρονο — 2',
      fhOver05: '1ο Ημ. Over 0.5',
      fhUnder05: '1ο Ημ. Under 0.5',
      fhOver15: '1ο Ημ. Over 1.5',
      fhUnder15: '1ο Ημ. Under 1.5',
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
      bttsYes: 'Goal/Goal — Ναι',
      bttsNo: 'No Goal',
    },
    ro: {
      homeWin: '1 (Gazde)',
      draw: 'X (Egal)',
      awayWin: '2 (Oaspeți)',
      dc1X: '1X (Șansă Dublă)',
      dc12: '12 (Șansă Dublă)',
      dcX2: 'X2 (Șansă Dublă)',
      over15: 'Peste 1.5 Goluri',
      under15: 'Sub 1.5 Goluri',
      over25: 'Peste 2.5 Goluri',
      under25: 'Sub 2.5 Goluri',
      over35: 'Peste 3.5 Goluri',
      under35: 'Sub 3.5 Goluri',
      fhHome: '1-a Repriză — 1',
      fhDraw: '1-a Repriză — X',
      fhAway: '1-a Repriză — 2',
      fhOver05: '1-a Rep. Peste 0.5',
      fhUnder05: '1-a Rep. Sub 0.5',
      fhOver15: '1-a Rep. Peste 1.5',
      fhUnder15: '1-a Rep. Sub 1.5',
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
      bttsYes: 'GG — Da',
      bttsNo: 'GG — Nu',
    },
    ru: {
      homeWin: 'П1 (Хозяева)',
      draw: 'X (Ничья)',
      awayWin: 'П2 (Гости)',
      dc1X: '1X (Двойной шанс)',
      dc12: '12 (Двойной шанс)',
      dcX2: 'X2 (Двойной шанс)',
      over15: 'ТБ 1.5 Гола',
      under15: 'ТМ 1.5 Гола',
      over25: 'ТБ 2.5 Гола',
      under25: 'ТМ 2.5 Гола',
      over35: 'ТБ 3.5 Гола',
      under35: 'ТМ 3.5 Гола',
      fhHome: '1-й Тайм — П1',
      fhDraw: '1-й Тайм — X',
      fhAway: '1-й Тайм — П2',
      fhOver05: '1-й Тайм ТБ 0.5',
      fhUnder05: '1-й Тайм ТМ 0.5',
      fhOver15: '1-й Тайм ТБ 1.5',
      fhUnder15: '1-й Тайм ТМ 1.5',
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
      bttsYes: 'Обе забьют — Да',
      bttsNo: 'Обе забьют — Нет',
    },
  };

  const baseDroppingUi = (
    {
      bg: {
        tabLabel: '📉 Падащи коеф.',
        marketOption: '📉 Падащи коеф. (Pre-Match Steam)',
        steamBadge: '🔥 STEAM СРИВ',
        dropBadge: '📉 ПАДАЩ КОЕФ.',
        tooltip: 'Предмачово движение (Отварящ → Текущ коеф.). Кликни за пълната графика по пазари (1X2, Голове, ПП, Корнери, Картони)',
      },
      en: {
        tabLabel: '📉 Dropping Odds',
        marketOption: '📉 Dropping Odds (Pre-Match Steam)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 DROPPING',
        tooltip: 'Pre-match movement (Opening → Current odds). Click for full multi-market chart (1X2, Goals, 1H, Corners, Cards)',
      },
      es: {
        tabLabel: '📉 Cuotas a la Baja',
        marketOption: '📉 Cuotas a la Baja (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 BAJANDO',
        tooltip: 'Movimiento pre-partido (Cuota inicial → actual). Clic para ver el gráfico completo por mercados',
      },
      de: {
        tabLabel: '📉 Fallende Quoten',
        marketOption: '📉 Fallende Quoten (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 FALLEND',
        tooltip: 'Pre-Match Quotenbewegung (Startquote → Aktuell). Klicken für den vollständigen Quotenverlauf',
      },
      it: {
        tabLabel: '📉 Quote in Calo',
        marketOption: '📉 Quote in Calo (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 IN CALO',
        tooltip: 'Movimento pre-partita (Quota iniziale → attuale). Clicca per il grafico completo dei mercati',
      },
      pt: {
        tabLabel: '📉 Odds em Queda',
        marketOption: '📉 Odds em Queda (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 EM QUEDA',
        tooltip: 'Movimento pré-jogo (Odd inicial → atual). Clique para o gráfico completo de mercados',
      },
      fr: {
        tabLabel: '📉 Cotes en Baisse',
        marketOption: '📉 Cotes en Baisse (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 EN BAISSE',
        tooltip: 'Mouvement pré-match (Cote initiale → actuelle). Cliquez pour le graphique complet des marchés',
      },
      tr: {
        tabLabel: '📉 Düşen Oranlar',
        marketOption: '📉 Düşen Oranlar (Dropping Odds)',
        steamBadge: '🔥 SERT DÜŞÜŞ',
        dropBadge: '📉 DÜŞÜYOR',
        tooltip: 'Maç önü oran hareketi (Açılış → Güncel oran). Tüm market grafiği için tıklayın',
      },
      pl: {
        tabLabel: '📉 Spadające Kursy',
        marketOption: '📉 Spadające Kursy (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 SPADEK',
        tooltip: 'Ruch przedmeczowy (Kurs otwarcia → obecny). Kliknij, aby zobaczyć pełny wykres rynków',
      },
      el: {
        tabLabel: '📉 Πτώση Αποδόσεων',
        marketOption: '📉 Πτώση Αποδόσεων (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 ΠΤΩΣΗ',
        tooltip: 'Κίνηση pre-match (Αρχική → Τρέχουσα απόδοση). Κάντε κλικ για το πλήρες γράφημα αγορών',
      },
      ro: {
        tabLabel: '📉 Cote în Scădere',
        marketOption: '📉 Cote în Scădere (Dropping Odds)',
        steamBadge: '🔥 STEAM MOVE',
        dropBadge: '📉 ÎN SCĂDERE',
        tooltip: 'Mișcare pre-meci (Cotă deschidere → actuală). Click pentru graficul complet pe piețe',
      },
      ru: {
        tabLabel: '📉 Падающие кэфы',
        marketOption: '📉 Падающие кэфы (Dropping Odds)',
        steamBadge: '🔥 ПРОГРУЗ',
        dropBadge: '📉 ПАДЕНИЕ',
        tooltip: 'Доматчевое движение (Открытие → Текущий кэф). Нажмите для полного графика по всем рынкам',
      },
    } as Record<string, { tabLabel: string; marketOption: string; steamBadge: string; dropBadge: string; tooltip: string }>
  )[language] || {
    tabLabel: '📉 Dropping Odds',
    marketOption: '📉 Dropping Odds & Steam Moves',
    steamBadge: '🔥 STEAM MOVE',
    dropBadge: '📉 DROPPING',
    tooltip: 'Opening → Current odds. Click for full multi-market chart',
  };

  const droppingUi = {
    ...baseDroppingUi,
    labels: droppingMarketLabels[language] || droppingMarketLabels.en,
  };

  const isPrematchDroppingMatch = (m: Match): boolean =>
    Boolean(
      m.droppingOdds &&
        m.status !== 'LIVE' &&
        m.droppingOdds.dropPercent >= 2.0 &&
        m.droppingOdds.dropPercent <= 35.0
    );

  const openMatchView = (m: Match) => {
    if (onOpenMatch) {
      onOpenMatch(m);
    } else {
      setDetailMatch(m);
    }
  };

  // Filter states matching the reference screenshot
  const [statusTab, setStatusTab] = useState<'all' | 'live' | 'upcoming' | 'finished' | 'favorites' | 'dropping'>('all');
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
          // Never mutate real API-Football fixtures with client-side random simulation
          if (String(m.id).startsWith('api-') || m.status !== 'LIVE' || !m.minute) return m;
          const nextMin = m.minute >= 89 ? 89 : m.minute + (Math.random() < 0.35 ? 1 : 0);
          const addAttack = Math.random() < 0.45;
          const isHome = Math.random() < m.stats.possessionHome / 100;

          const updatedStats = {
            ...m.stats,
            dangerousAttacksHome:
              addAttack && isHome ? m.stats.dangerousAttacksHome + 1 : m.stats.dangerousAttacksHome,
            dangerousAttacksAway:
              addAttack && !isHome ? m.stats.dangerousAttacksAway + 1 : m.stats.dangerousAttacksAway,
          };

          return {
            ...m,
            minute: nextMin,
            stats: updatedStats,
          };
        })
      );
    }, 5000);

    return () => clearInterval(simInterval);
  }, [setMatches]);

  // Featured Match (Prefer a LIVE match with verified official optical statistics, otherwise first LIVE match or first match in feed)
  const featuredMatch =
    matches.find((m) => m.status === 'LIVE' && m.hasRealStats) ||
    matches.find((m) => m.status === 'LIVE') ||
    matches[0];

  // Dynamic 100% Real Counters from the active matches feed (Zero Lies)
  const totalMatchesCount = matches.length;
  const liveMatchesCount = matches.filter((m) => m.status === 'LIVE').length;
  const upcomingMatchesCount = matches.filter((m) => m.status === 'SCHEDULED').length;
  const finishedMatchesCount = matches.filter((m) => m.status === 'FINISHED').length;
  const droppingMatchesCount = matches.filter((m) => isPrematchDroppingMatch(m)).length;
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
    if (statusTab === 'dropping' && !isPrematchDroppingMatch(m)) return false;

    if (countryFilter !== 'all' && m.leagueCountry !== countryFilter) return false;
    if (leagueFilter !== 'all' && m.league !== leagueFilter) return false;
    if (timeFilter === 'live' && m.status !== 'LIVE') return false;
    if (timeFilter === 'upcoming' && m.status !== 'SCHEDULED') return false;
    if (marketFilter === 'value' && !m.valueBetDetected) return false;
    if (marketFilter === 'dropping' && !isPrematchDroppingMatch(m)) return false;

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
          title={`${teamName} — Официален профил, класиране и форма`}
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

            <button
              type="button"
              onClick={() => setStatusTab('dropping')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'dropping'
                  ? 'bg-rose-500/15 border border-rose-500/60 text-rose-400 shadow-sm'
                  : 'text-[#8f9cae] hover:text-rose-300 border border-transparent'
              }`}
            >
              <span>{droppingUi.tabLabel}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-mono text-[10px]">
                {droppingMatchesCount}
              </span>
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
                <option value="dropping">{droppingUi.marketOption}</option>
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

          {/* 4. FEATURED MATCH SPOTLIGHT CARD */}
          {featuredMatch && (() => {
            const isFeatLive = featuredMatch.status === 'LIVE';
            const isFeatFinished = featuredMatch.status === 'FINISHED';
            const hasFeatStarted = isFeatLive || isFeatFinished;
            const hasFeatRealStats =
              hasFeatStarted &&
              (!String(featuredMatch.id).startsWith('api-') || Boolean(featuredMatch.hasRealStats));

            const featTitle = isFeatLive
              ? t.featuredMatch
              : ({
                  bg: 'ВОДЕЩ ПРЕДСТОЯЩ МАЧ (PRE-MATCH)',
                  en: 'FEATURED UPCOMING MATCH (PRE-MATCH)',
                  es: 'PARTIDO DESTACADO PRÓXIMO (PRE-PARTIDO)',
                  de: 'TOP KOMMENDES SPIEL (PRE-MATCH)',
                  it: 'BIG MATCH IN PROGRAMMA (PRE-PARTITA)',
                  pt: 'JOGO EM DESTAQUE (PRÉ-JOGO)',
                  fr: 'MATCH À L’AFFICHE (PRÉ-MATCH)',
                  tr: 'ÖNE ÇIKAN GELECEK MAÇ (MAÇ ÖNCESİ)',
                  pl: 'HIT DNIA PRZED MECZEM (PRE-MATCH)',
                  el: 'ΚΟΡΥΦΑΙΟΣ ΕΠΕΡΧΟΜΕΝΟΣ ΑΓΩΝΑΣ (PRE-MATCH)',
                  ro: 'MECIUL ZILEI ÎN CURÂND (PRE-MECI)',
                  ru: 'ГЛАВНЫЙ ПРЕДСТОЯЩИЙ МАТЧ (ПРЕМАТЧ)',
                }[language] || 'FEATURED UPCOMING MATCH');

            const preMatchModelTitle =
              ({
                bg: 'МАТЕМАТИЧЕСКА ПРОГНОЗА (1X2)',
                en: 'PRE-MATCH WIN PROBABILITY (1X2)',
                es: 'PROBABILIDAD DEL MODELO (1X2)',
                de: 'MODELL-WAHRSCHEINLICHKEIT (1X2)',
                it: 'PROBABILITÀ MODELLO (1X2)',
                pt: 'PROBABILIDADE DO MODELO (1X2)',
                fr: 'PROBABILITÉS DU MODÈLE (1X2)',
                tr: 'MAÇ ÖNCESİ MODEL OLASILIĞI (1X2)',
                pl: 'PRAWDOPODOBIEŃSTWO MODELU (1X2)',
                el: 'ΠΙΘΑΝΟΤΗΤΕΣ ΜΟΝΤΕΛΟΥ (1X2)',
                ro: 'PROBABILITĂȚI MODEL (1X2)',
                ru: 'ВЕРОЯТНОСТИ МОДЕЛИ (1X2)',
              }[language] || 'PRE-MATCH WIN PROBABILITY');

            const preMatchMetricsTitle =
              ({
                bg: 'ПРОГНОЗНИ ПОКАЗАТЕЛИ (90\')',
                en: 'PRE-MATCH PROJECTIONS (90\')',
                es: 'PROYECCIONES PRE-PARTIDO (90\')',
                de: 'PRE-MATCH PROGNOSEN (90\')',
                it: 'PROIEZIONI PRE-PARTITA (90\')',
                pt: 'PROJEÇÕES PRÉ-JOGO (90\')',
                fr: 'PROJECTIONS PRÉ-MATCH (90\')',
                tr: 'MAÇ ÖNCESİ BEKLENTİLER (90\')',
                pl: 'PROGNOZA PRZEDMECZOWA (90\')',
                el: 'ΠΡΟΒΛΕΨΕΙΣ ΠΡΙΝ ΤΗ ΣΕΝΤΡΑ (90\')',
                ro: 'PROIECȚII PRE-MECI (90\')',
                ru: 'ПРОГНОЗНЫЕ ПОКАЗАТЕЛИ (90\')',
              }[language] || 'PRE-MATCH PROJECTIONS');

            const xgH = featuredMatch.fairOdds.expectedGoalsHome;
            const xgA = featuredMatch.fairOdds.expectedGoalsAway;
            const xgTotal = Math.max(0.1, xgH + xgA);
            const xgHomePct = Math.round((xgH / xgTotal) * 100);

            const sotH = featuredMatch.stats.shotsOnTargetHome ?? 0;
            const sotA = featuredMatch.stats.shotsOnTargetAway ?? 0;
            const sotTotal = Math.max(1, sotH + sotA);
            const sotHomePct = sotH + sotA > 0 ? Math.round((sotH / sotTotal) * 100) : 50;

            const daH = featuredMatch.stats.dangerousAttacksHome ?? 0;
            const daA = featuredMatch.stats.dangerousAttacksAway ?? 0;
            const daTot = Math.max(1, daH + daA);
            const daHomePct = daH + daA > 0 ? Math.round((daH / daTot) * 100) : 50;

            const p1Pct = Math.round(featuredMatch.fairOdds.homeProb * 100);
            const pXPct = Math.round(featuredMatch.fairOdds.drawProb * 100);
            const p2Pct = Math.max(1, 100 - p1Pct - pXPct);
            const o25Pct = Math.round(featuredMatch.fairOdds.over25Prob * 100);
            const bttsPct = Math.round(featuredMatch.fairOdds.bttsProb * 100);

            return (
              <div className="rounded-2xl border border-[#1d563a] bg-gradient-to-r from-[#091914] via-[#0b151e] to-[#0a121a] p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.65)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Col 1-5: Featured Match Scoreboard & Goal Scorers */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#43f08a] block">
                          {featTitle}
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
                        {isFeatLive
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
                            title={featuredMatch.homeTeam}
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

                      {/* Center Score (or VS if Pre-Match) */}
                      <div className="text-center px-2 shrink-0">
                        <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
                          {hasFeatStarted
                            ? `${featuredMatch.homeScore} - ${featuredMatch.awayScore}`
                            : 'VS'}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#14202e] border border-[#233549] text-[10px] font-mono text-neutral-300">
                          {hasFeatStarted
                            ? featuredMatch.halftimeScore ||
                              `LIVE ${featuredMatch.minute || 1}'`
                            : `PRE-MATCH · ${featuredMatch.startTime}`}
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
                            title={featuredMatch.awayTeam}
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

                  {/* Col 6-8: LIVE MOMENTUM (ONLY when real optical stats exist) OR 1X2 MODEL PROBABILITIES */}
                  <div className="lg:col-span-3 rounded-xl bg-[#081018]/90 border border-[#162332] p-3">
                    {hasFeatRealStats ? (
                      <>
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
                          <line x1="0" y1="40" x2="200" y2="40" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1="100" y1="5" x2="100" y2="70" stroke="#1e293b" strokeWidth="1" />
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
                          <circle cx="128" cy="24" r="3.5" fill="#facc15" stroke="#070b11" strokeWidth="1.5" />
                        </svg>
                        <div className="flex justify-between text-[10px] font-mono text-[#64748b] mt-1 px-1">
                          <span>0&apos;</span>
                          <span>HT</span>
                          <span>90&apos;</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2.5 py-0.5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] text-center">
                          {preMatchModelTitle}
                        </div>
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-neutral-300">
                            <span className="truncate max-w-[110px]">1 · {featuredMatch.homeTeam}</span>
                            <span className="text-[#43f08a] font-bold">
                              {p1Pct}% (@{featuredMatch.bookmakerOdds.home.toFixed(2)})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-neutral-300">
                            <span>X · {language === 'bg' ? 'Равенство' : 'Draw'}</span>
                            <span className="text-amber-300 font-bold">
                              {pXPct}% (@{featuredMatch.bookmakerOdds.draw.toFixed(2)})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-neutral-300">
                            <span className="truncate max-w-[110px]">2 · {featuredMatch.awayTeam}</span>
                            <span className="text-cyan-300 font-bold">
                              {p2Pct}% (@{featuredMatch.bookmakerOdds.away.toFixed(2)})
                            </span>
                          </div>
                        </div>
                        {/* 3-segment probability bar */}
                        <div className="h-2 rounded-full bg-[#162230] overflow-hidden flex gap-0.5">
                          <div className="bg-[#43f08a] h-full" style={{ width: `${p1Pct}%` }} />
                          <div className="bg-amber-400 h-full" style={{ width: `${pXPct}%` }} />
                          <div className="bg-cyan-400 h-full" style={{ width: `${p2Pct}%` }} />
                        </div>
                        <div className="text-[9px] font-mono text-[#64748b] text-center">
                          {hasFeatStarted
                            ? language === 'bg'
                              ? 'Официален резултат и коефициенти на живо (без оптична статистика)'
                              : 'Official live score & odds (no optical stats for this league)'
                            : language === 'bg'
                            ? 'Моментумът на живо стартира в ' + featuredMatch.startTime
                            : `Live momentum starts at ${featuredMatch.startTime}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Col 9-10: LIVE STATS (ONLY when official optical stats exist) OR MODEL PROJECTIONS */}
                  <div className="lg:col-span-2 space-y-2 text-[11px]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f9cae] text-center mb-1">
                      {hasFeatRealStats ? t.liveStats : preMatchMetricsTitle}
                    </div>
                    {/* xG (Live xG or Projected 90' xG) */}
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                        <span className="font-bold text-white">{xgH.toFixed(2)}</span>
                        <span className="text-[#8f9cae]">
                          {hasFeatRealStats ? 'xG' : language === 'bg' ? 'Прогн. xG' : 'Proj. xG'}
                        </span>
                        <span className="font-bold text-white">{xgA.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                        <div className="bg-[#43f08a] h-full" style={{ width: `${xgHomePct}%` }} />
                        <div className="bg-neutral-500 h-full" style={{ width: `${100 - xgHomePct}%` }} />
                      </div>
                    </div>

                    {hasFeatRealStats ? (
                      <>
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
                            <span className="font-bold text-white">{sotH}</span>
                            <span className="text-[#8f9cae] truncate px-1">{t.shotsOnTarget}</span>
                            <span className="font-bold text-white">{sotA}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                            <div className="bg-[#43f08a] h-full" style={{ width: `${sotHomePct}%` }} />
                            <div className="bg-neutral-500 h-full" style={{ width: `${100 - sotHomePct}%` }} />
                          </div>
                        </div>

                        {/* Dangerous Attacks */}
                        <div>
                          <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                            <span className="font-bold text-white">{daH}</span>
                            <span className="text-[#8f9cae] truncate px-1">{t.dangerousAttacks}</span>
                            <span className="font-bold text-white">{daA}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                            <div className="bg-[#43f08a] h-full" style={{ width: `${daHomePct}%` }} />
                            <div className="bg-neutral-500 h-full" style={{ width: `${100 - daHomePct}%` }} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Over / Under 2.5 Probability */}
                        <div>
                          <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                            <span className="font-bold text-[#43f08a]">{o25Pct}%</span>
                            <span className="text-[#8f9cae] truncate px-1">
                              {language === 'bg' ? 'Над / Под 2.5' : 'Over / Under 2.5'}
                            </span>
                            <span className="font-bold text-neutral-300">{100 - o25Pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                            <div className="bg-[#43f08a] h-full" style={{ width: `${o25Pct}%` }} />
                            <div className="bg-neutral-500 h-full" style={{ width: `${100 - o25Pct}%` }} />
                          </div>
                        </div>

                        {/* BTTS Yes / No Probability */}
                        <div>
                          <div className="flex justify-between font-mono text-[10px] text-neutral-300 mb-0.5">
                            <span className="font-bold text-[#43f08a]">{bttsPct}%</span>
                            <span className="text-[#8f9cae] truncate px-1">
                              {language === 'bg' ? 'Гол/Гол (Да/Не)' : 'BTTS (Yes/No)'}
                            </span>
                            <span className="font-bold text-neutral-300">{100 - bttsPct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#162230] overflow-hidden flex">
                            <div className="bg-[#43f08a] h-full" style={{ width: `${bttsPct}%` }} />
                            <div className="bg-neutral-500 h-full" style={{ width: `${100 - bttsPct}%` }} />
                          </div>
                        </div>

                        {/* Status notice */}
                        <div className="pt-0.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-[#111c28] border border-[#1e2f42] font-mono text-[9px] text-amber-300">
                            {hasFeatStarted
                              ? language === 'bg'
                                ? 'НЯМА ОПТИЧНА СТАТИСТИКА'
                                : 'NO OPTICAL STATS'
                              : language === 'bg'
                              ? `Старт в ${featuredMatch.startTime} · Очаква начало`
                              : `Kickoff ${featuredMatch.startTime} · Pre-Match`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Col 11-12: Action Buttons (Add Bet & Match Details) */}
                  <div className="lg:col-span-2 flex flex-row lg:flex-col gap-2.5 justify-end">
                    <button
                      type="button"
                      onClick={() => handleDirectAddBet(featuredMatch)}
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
            );
          })()}

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
              const isFinished = match.status === 'FINISHED';
              const hasStarted = isLive || isFinished;
              const hasRowRealStats =
                hasStarted &&
                (!String(match.id).startsWith('api-') || Boolean(match.hasRealStats));
              const isFav = favorites.includes(match.id);
              const picked = selectedRowMarket[match.id];
              const extraMarkets = EXTRA_MARKETS_COUNT[match.id] || 112;
              const posHome = hasRowRealStats ? (match.stats.possessionHome || 50) : 0;
              const posAway = hasRowRealStats ? (match.stats.possessionAway || 50) : 0;
              const daHome = hasRowRealStats ? (match.stats.dangerousAttacksHome ?? 0) : 0;
              const daAway = hasRowRealStats ? (match.stats.dangerousAttacksAway ?? 0) : 0;
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
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-[#8f9cae]">
                          <LeagueBadge
                            name={match.league}
                            logoUrl={match.leagueLogo}
                            size="xs"
                          />
                          <span className="truncate">
                            {match.leagueCountry ? `${match.leagueCountry} · ` : ''}
                            {match.league}
                          </span>
                          {isPrematchDroppingMatch(match) && match.droppingOdds && (
                            <span
                              title={droppingUi.tooltip}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-extrabold text-[9px] ${
                                match.droppingOdds.isSteamMove
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/35'
                              }`}
                            >
                              <span>
                                {match.droppingOdds.isSteamMove
                                  ? droppingUi.steamBadge
                                  : droppingUi.dropBadge}
                              </span>
                              <span>
                                ({droppingUi.labels[match.droppingOdds.labelKey] || match.droppingOdds.labelKey}:{' '}
                                {match.droppingOdds.openingOdds.toFixed(2)} →{' '}
                                {match.droppingOdds.currentOdds.toFixed(2)} / -
                                {match.droppingOdds.dropPercent.toFixed(1)}%)
                              </span>
                            </span>
                          )}
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
                            title={match.homeTeam}
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
                            title={match.awayTeam}
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
                          <span>{hasStarted ? match.homeScore : '–'}</span>
                          <span>{hasStarted ? match.awayScore : '–'}</span>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded bg-[#131d2a] text-[9px] font-mono text-[#8f9cae] truncate max-w-[90px] uppercase">
                        {match.halftimeScore || (isLive ? `LIVE ${match.minute || 1}'` : t.upcoming)}
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
                    <div
                      className="lg:col-span-1 flex lg:flex-col justify-center gap-1.5 font-mono text-[11px]"
                      title={
                        hasStarted
                          ? 'Live Expected Goals (xG)'
                          : language === 'bg'
                          ? 'Прогнозно xG за целия мач (90 мин.)'
                          : 'Pre-Match Projected 90m xG'
                      }
                    >
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

                    {/* Col 10: POS Circular Donut (ONLY rendered when official real optical stats exist!) */}
                    <div className="lg:col-span-1 flex items-center justify-center gap-1.5">
                      {hasRowRealStats ? (
                        <>
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
                        </>
                      ) : (
                        <div
                          className="text-center font-mono text-[10px] text-[#64748b]"
                          title={
                            hasStarted
                              ? language === 'bg'
                                ? 'Няма официална оптична статистика за тази дивизия'
                                : 'No official optical statistics for this division'
                              : language === 'bg'
                              ? 'Владеенето на топката е налично след началото на мача'
                              : 'Possession stats available after kickoff'
                          }
                        >
                          <span className="block text-neutral-500 font-bold">— / —</span>
                          <span className="block text-[9px] text-[#475569]">
                            {hasStarted
                              ? language === 'bg'
                                ? 'НЯМА ДАННИ'
                                : 'NO STATS'
                              : 'PRE-MATCH'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Col 11-12: Dangerous Attacks + Add Bet / Details Buttons */}
                    <div className="lg:col-span-2 flex items-center justify-between gap-2">
                      {/* Dangerous Attacks Bar (ONLY rendered when official real optical stats exist!) */}
                      {hasRowRealStats ? (
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
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center font-mono text-[10px] text-[#64748b] flex-1"
                          title={
                            hasStarted
                              ? language === 'bg'
                                ? 'Математически вероятности (няма оптични данни за атаки)'
                                : 'Model probabilities (no optical attack data)'
                              : language === 'bg'
                              ? 'Опасните атаки се отчитат на живо след старта на мача'
                              : 'Dangerous attacks tracked live after kickoff'
                          }
                        >
                          <span className="text-neutral-400 font-semibold">
                            O2.5: {(match.fairOdds.over25Prob * 100).toFixed(0)}%
                          </span>
                          <span className="text-[9px] text-[#475569]">
                            BTTS: {(match.fairOdds.bttsProb * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

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
              {(() => {
                const dynOver25Odd = Number(
                  Math.min(
                    4.5,
                    Math.max(1.22, (1 / Math.max(0.18, detailMatch.fairOdds.over25Prob)) * 0.945)
                  ).toFixed(2)
                );
                const dynBttsOdd = Number(
                  Math.min(
                    4.5,
                    Math.max(1.22, (1 / Math.max(0.18, detailMatch.fairOdds.bttsProb)) * 0.945)
                  ).toFixed(2)
                );
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleDirectAddBet(
                          detailMatch,
                          'Over 2.5 Goals',
                          dynOver25Odd,
                          'Total Goals'
                        );
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
                      <span className="text-base font-mono font-black text-[#43f08a]">
                        @{dynOver25Odd.toFixed(2)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleDirectAddBet(
                          detailMatch,
                          'BTTS — Yes',
                          dynBttsOdd,
                          'Both Teams To Score'
                        );
                        setDetailMatch(null);
                      }}
                      className="p-3 rounded-xl border border-[#1e2d40] bg-[#0e1723] hover:border-[#43f08a] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">
                          Both Teams To Score (Yes)
                        </div>
                        <div className="text-[10px] text-[#43f08a] font-mono">
                          Poisson Prob: {(detailMatch.fairOdds.bttsProb * 100).toFixed(0)}%
                        </div>
                      </div>
                      <span className="text-base font-mono font-black text-[#43f08a]">
                        @{dynBttsOdd.toFixed(2)}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
