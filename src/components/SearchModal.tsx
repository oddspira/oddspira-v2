import React, { useState, useEffect, useRef } from 'react';
import { Match, ActiveTab, Language } from '../types';
import { TeamBadge, openTeamProfile, openPlayerProfile } from './TeamBadge';

interface SearchModalProps {
  language?: Language;
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectMatch?: (match: Match) => void;
}

interface PlayerSearchHit {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  nationality: string;
  position: string;
  number: number | null;
  photo: string;
}

interface SearchI18n {
  placeholder: string;
  playersHeading: string;
  searching: string;
  yearsSuffix: string;
  playerProfileBtn: string;
  openPlayerDirect: string;
  openPlayerDirectSub: string;
  openBtn: string;
  teamsHeading: string;
  teamProfileBtn: string;
  searchTeamGlobal: string;
  searchTeamGlobalSub: string;
  matchesHeading: string;
  detailsBtn: string;
  sectionsHeading: string;
  footerLeft: string;
  footerRight: string;
  links: { title: string; tab: ActiveTab; icon: string; desc: string }[];
}

const SEARCH_DICT: Record<Language, SearchI18n> = {
  bg: {
    placeholder: 'Търсене на футболист (Saka, Haaland, Despodov), отбор (Arsenal, Levski) или мач...',
    playersHeading: 'Футболисти — Официален профил, статистика, трансфери и трофеи',
    searching: 'Търсене...',
    yearsSuffix: 'г.',
    playerProfileBtn: 'Профил на играча →',
    openPlayerDirect: 'Отвори профил на футболист',
    openPlayerDirectSub: 'Сезонна статистика по турнири, трансферна история, спечелени трофеи и контузии',
    openBtn: 'Отвори ↗',
    teamsHeading: 'Отбори — Официален профил, класиране и състав',
    teamProfileBtn: 'Профил на отбора →',
    searchTeamGlobal: 'Потърси отбор в глобалната база:',
    searchTeamGlobalSub: 'Отваря официална страница със стадион, треньор, класиране, играчи и мачове',
    matchesHeading: 'Спортни срещи',
    detailsBtn: 'Детайли →',
    sectionsHeading: 'Секции на платформата',
    footerLeft: 'Бързо търсене в Oddspira',
    footerRight: 'Натиснете [ESC] за затваряне',
    links: [
      { title: 'На живо', tab: 'live', icon: '⚡', desc: 'Текущи мачове и симулация в реално време' },
      { title: 'Състезания', tab: 'competitions', icon: '🏆', desc: 'Всички световни лиги и турнири' },
      { title: 'Анализ', tab: 'analysis', icon: '📊', desc: 'Двумерен Poisson & Dixon-Coles калкулатор' },
      { title: 'Моите залози', tab: 'bets', icon: '💼', desc: 'Управление на личната банка и P&L' },
      { title: 'Инструменти', tab: 'tools', icon: '📐', desc: '+EV стойност, Kelly критерий и No-Vig' },
      { title: 'Научи', tab: 'learn', icon: '📚', desc: 'Математически основи и формули' },
    ],
  },
  en: {
    placeholder: 'Search player (Saka, Haaland, Despodov), club (Arsenal, Real Madrid) or match...',
    playersHeading: 'Players — Official profile, season stats, transfers & trophies',
    searching: 'Searching...',
    yearsSuffix: 'y',
    playerProfileBtn: 'Player Profile →',
    openPlayerDirect: 'Open player profile',
    openPlayerDirectSub: 'Seasonal competition stats, transfer history, trophies won and injuries',
    openBtn: 'Open ↗',
    teamsHeading: 'Clubs — Official profile, standings & squad',
    teamProfileBtn: 'Club Profile →',
    searchTeamGlobal: 'Search club in global database:',
    searchTeamGlobalSub: 'Opens official page with stadium, head coach, standings, squad and fixtures',
    matchesHeading: 'Fixtures',
    detailsBtn: 'Details →',
    sectionsHeading: 'Platform Sections',
    footerLeft: 'Oddspira Quick Search',
    footerRight: 'Press [ESC] to close',
    links: [
      { title: 'Live', tab: 'live', icon: '⚡', desc: 'Real-time live matches and simulations' },
      { title: 'Competitions', tab: 'competitions', icon: '🏆', desc: 'Global leagues and tournaments' },
      { title: 'Analysis', tab: 'analysis', icon: '📊', desc: 'Bivariate Poisson & Dixon-Coles engine' },
      { title: 'My Bets', tab: 'bets', icon: '💼', desc: 'Bankroll tracker and P&L analytics' },
      { title: 'Tools', tab: 'tools', icon: '📐', desc: '+EV value, Kelly criterion & No-Vig' },
      { title: 'Learn', tab: 'learn', icon: '📚', desc: 'Quantitative fundamentals & formulas' },
    ],
  },
  es: {
    placeholder: 'Buscar jugador (Saka, Haaland), equipo (Arsenal, Real Madrid) o partido...',
    playersHeading: 'Jugadores — Perfil oficial, estadísticas, fichajes y trofeos',
    searching: 'Buscando...',
    yearsSuffix: 'a.',
    playerProfileBtn: 'Perfil del Jugador →',
    openPlayerDirect: 'Abrir perfil del jugador',
    openPlayerDirectSub: 'Estadísticas por torneo, historial de fichajes, trofeos y lesiones',
    openBtn: 'Abrir ↗',
    teamsHeading: 'Equipos — Perfil oficial, clasificación y plantilla',
    teamProfileBtn: 'Perfil del Club →',
    searchTeamGlobal: 'Buscar equipo en la base global:',
    searchTeamGlobalSub: 'Abre la página oficial con estadio, entrenador, clasificación y plantilla',
    matchesHeading: 'Partidos',
    detailsBtn: 'Detalles →',
    sectionsHeading: 'Secciones de la Plataforma',
    footerLeft: 'Búsqueda rápida en Oddspira',
    footerRight: 'Pulsa [ESC] para cerrar',
    links: [
      { title: 'En Vivo', tab: 'live', icon: '⚡', desc: 'Partidos en directo y simulación en tiempo real' },
      { title: 'Competiciones', tab: 'competitions', icon: '🏆', desc: 'Ligas y torneos mundiales' },
      { title: 'Análisis', tab: 'analysis', icon: '📊', desc: 'Motor Poisson bivariado y Dixon-Coles' },
      { title: 'Mis Apuestas', tab: 'bets', icon: '💼', desc: 'Gestión de bankroll y P&L' },
      { title: 'Herramientas', tab: 'tools', icon: '📐', desc: 'Valor +EV, Criterio de Kelly y No-Vig' },
      { title: 'Aprender', tab: 'learn', icon: '📚', desc: 'Fundamentos matemáticos y fórmulas' },
    ],
  },
  de: {
    placeholder: 'Spieler (Saka, Haaland), Verein (Arsenal, Bayern) oder Spiel suchen...',
    playersHeading: 'Spieler — Offizielles Profil, Statistik, Transfers & Titel',
    searching: 'Suche...',
    yearsSuffix: 'J.',
    playerProfileBtn: 'Spielerprofil →',
    openPlayerDirect: 'Spielerprofil öffnen',
    openPlayerDirectSub: 'Saisonstatistik nach Wettbewerb, Transferhistorie, Titel und Verletzungen',
    openBtn: 'Öffnen ↗',
    teamsHeading: 'Vereine — Offizielles Profil, Tabelle & Kader',
    teamProfileBtn: 'Vereinsprofil →',
    searchTeamGlobal: 'Verein in globaler Datenbank suchen:',
    searchTeamGlobalSub: 'Öffnet offizielle Seite mit Stadion, Trainer, Tabelle, Kader und Spielen',
    matchesHeading: 'Spiele',
    detailsBtn: 'Details →',
    sectionsHeading: 'Plattform-Bereiche',
    footerLeft: 'Oddspira Schnellsuche',
    footerRight: '[ESC] zum Schließen drücken',
    links: [
      { title: 'Live', tab: 'live', icon: '⚡', desc: 'Aktuelle Live-Spiele und Echtzeit-Simulation' },
      { title: 'Wettbewerbe', tab: 'competitions', icon: '🏆', desc: 'Weltweite Ligen und Turniere' },
      { title: 'Analyse', tab: 'analysis', icon: '📊', desc: 'Bivariater Poisson & Dixon-Coles Rechner' },
      { title: 'Meine Wetten', tab: 'bets', icon: '💼', desc: 'Bankroll-Management und P&L' },
      { title: 'Tools', tab: 'tools', icon: '📐', desc: '+EV Value, Kelly-Kriterium & No-Vig' },
      { title: 'Lernen', tab: 'learn', icon: '📚', desc: 'Mathematische Grundlagen & Formeln' },
    ],
  },
  it: {
    placeholder: 'Cerca giocatore (Saka, Haaland), squadra (Arsenal, Milan) o partita...',
    playersHeading: 'Giocatori — Profilo ufficiale, statistiche, trasferimenti e trofei',
    searching: 'Ricerca...',
    yearsSuffix: 'a.',
    playerProfileBtn: 'Profilo Giocatore →',
    openPlayerDirect: 'Apri profilo giocatore',
    openPlayerDirectSub: 'Statistiche stagionali, storico trasferimenti, trofei vinti e infortuni',
    openBtn: 'Apri ↗',
    teamsHeading: 'Squadre — Profilo ufficiale, classifica e rosa',
    teamProfileBtn: 'Profilo Squadra →',
    searchTeamGlobal: 'Cerca squadra nel database globale:',
    searchTeamGlobalSub: 'Apre la pagina ufficiale con stadio, allenatore, classifica, rosa e partite',
    matchesHeading: 'Partite',
    detailsBtn: 'Dettagli →',
    sectionsHeading: 'Sezioni della Piattaforma',
    footerLeft: 'Ricerca rapida Oddspira',
    footerRight: 'Premi [ESC] per chiudere',
    links: [
      { title: 'Live', tab: 'live', icon: '⚡', desc: 'Partite in tempo reale e simulazioni' },
      { title: 'Campionati', tab: 'competitions', icon: '🏆', desc: 'Lighe e tornei mondiali' },
      { title: 'Analisi', tab: 'analysis', icon: '📊', desc: 'Calcolatore Poisson & Dixon-Coles' },
      { title: 'Le Mie Scommesse', tab: 'bets', icon: '💼', desc: 'Gestione bankroll e P&L' },
      { title: 'Strumenti', tab: 'tools', icon: '📐', desc: 'Valore +EV, Criterio di Kelly e No-Vig' },
      { title: 'Impara', tab: 'learn', icon: '📚', desc: 'Fondamenti matematici e formule' },
    ],
  },
  pt: {
    placeholder: 'Pesquisar jogador (Saka, Haaland), clube (Arsenal, Real Madrid) ou jogo...',
    playersHeading: 'Jogadores — Perfil oficial, estatísticas, transferências e troféus',
    searching: 'Pesquisando...',
    yearsSuffix: 'a.',
    playerProfileBtn: 'Perfil do Jogador →',
    openPlayerDirect: 'Abrir perfil do jogador',
    openPlayerDirectSub: 'Estatísticas por torneio, histórico de transferências, troféus e lesões',
    openBtn: 'Abrir ↗',
    teamsHeading: 'Clubes — Perfil oficial, classificação e elenco',
    teamProfileBtn: 'Perfil do Clube →',
    searchTeamGlobal: 'Pesquisar clube na base global:',
    searchTeamGlobalSub: 'Abre página oficial com estádio, treinador, classificação, elenco e jogos',
    matchesHeading: 'Partidas',
    detailsBtn: 'Detalhes →',
    sectionsHeading: 'Seções da Plataforma',
    footerLeft: 'Pesquisa rápida Oddspira',
    footerRight: 'Pressione [ESC] para fechar',
    links: [
      { title: 'Ao Vivo', tab: 'live', icon: '⚡', desc: 'Partidas ao vivo e simulação em tempo real' },
      { title: 'Competições', tab: 'competitions', icon: '🏆', desc: 'Ligas e torneios mundiais' },
      { title: 'Análise', tab: 'analysis', icon: '📊', desc: 'Motor Poisson bivariado e Dixon-Coles' },
      { title: 'Minhas Apostas', tab: 'bets', icon: '💼', desc: 'Gestão de banca e P&L' },
      { title: 'Ferramentas', tab: 'tools', icon: '📐', desc: 'Valor +EV, Critério de Kelly e No-Vig' },
      { title: 'Aprender', tab: 'learn', icon: '📚', desc: 'Fundamentos matemáticos e fórmulas' },
    ],
  },
  fr: {
    placeholder: 'Rechercher un joueur (Saka, Haaland), un club (Arsenal, PSG) ou un match...',
    playersHeading: 'Joueurs — Profil officiel, statistiques, transferts et trophées',
    searching: 'Recherche...',
    yearsSuffix: 'ans',
    playerProfileBtn: 'Profil du Joueur →',
    openPlayerDirect: 'Ouvrir le profil du joueur',
    openPlayerDirectSub: 'Statistiques par compétition, historique des transferts, trophées et blessures',
    openBtn: 'Ouvrir ↗',
    teamsHeading: 'Clubs — Profil officiel, classement et effectif',
    teamProfileBtn: 'Profil du Club →',
    searchTeamGlobal: 'Rechercher un club dans la base mondiale :',
    searchTeamGlobalSub: 'Ouvre la page officielle avec stade, entraîneur, classement, effectif et matchs',
    matchesHeading: 'Matchs',
    detailsBtn: 'Détails →',
    sectionsHeading: 'Sections de la Plateforme',
    footerLeft: 'Recherche rapide Oddspira',
    footerRight: 'Appuyez sur [ESC] pour fermer',
    links: [
      { title: 'En Direct', tab: 'live', icon: '⚡', desc: 'Matchs en direct et simulation en temps réel' },
      { title: 'Championnats', tab: 'competitions', icon: '🏆', desc: 'Ligues et tournois mondiaux' },
      { title: 'Analyse', tab: 'analysis', icon: '📊', desc: 'Calculateur Poisson bivarié & Dixon-Coles' },
      { title: 'Mes Paris', tab: 'bets', icon: '💼', desc: 'Gestion de bankroll et P&L' },
      { title: 'Outils', tab: 'tools', icon: '📐', desc: 'Valeur +EV, Critère de Kelly et No-Vig' },
      { title: 'Guides', tab: 'learn', icon: '📚', desc: 'Fondamentaux mathématiques et formules' },
    ],
  },
  tr: {
    placeholder: 'Oyuncu (Saka, Haaland), kulüp (Arsenal, Galatasaray) veya maç ara...',
    playersHeading: 'Oyuncular — Resmi profil, istatistikler, transferler ve kupalar',
    searching: 'Aranıyor...',
    yearsSuffix: 'y.',
    playerProfileBtn: 'Oyuncu Profili →',
    openPlayerDirect: 'Oyuncu profilini aç',
    openPlayerDirectSub: 'Turnuva istatistikleri, transfer geçmişi, kazanılan kupalar ve sakatlıklar',
    openBtn: 'Aç ↗',
    teamsHeading: 'Kulüpler — Resmi profil, puan durumu ve kadro',
    teamProfileBtn: 'Kulüp Profili →',
    searchTeamGlobal: 'Küresel veritabanında kulüp ara:',
    searchTeamGlobalSub: 'Stadyum, teknik direktör, puan durumu, kadro ve maçları içeren resmi sayfayı açar',
    matchesHeading: 'Maçlar',
    detailsBtn: 'Detaylar →',
    sectionsHeading: 'Platform Bölümleri',
    footerLeft: 'Oddspira Hızlı Arama',
    footerRight: 'Kapatmak için [ESC] tuşuna basın',
    links: [
      { title: 'Canlı', tab: 'live', icon: '⚡', desc: 'Canlı maçlar ve gerçek zamanlı simülasyon' },
      { title: 'Ligler', tab: 'competitions', icon: '🏆', desc: 'Dünya ligleri ve turnuvalar' },
      { title: 'Analiz', tab: 'analysis', icon: '📊', desc: 'Poisson ve Dixon-Coles hesaplayıcı' },
      { title: 'Bahislerim', tab: 'bets', icon: '💼', desc: 'Kasa yönetimi ve P&L analizi' },
      { title: 'Araçlar', tab: 'tools', icon: '📐', desc: '+EV değer, Kelly kriteri ve No-Vig' },
      { title: 'Rehber', tab: 'learn', icon: '📚', desc: 'Matematiksel temeller ve formüller' },
    ],
  },
  pl: {
    placeholder: 'Szukaj piłkarza (Saka, Haaland), klubu (Arsenal, Lech) lub meczu...',
    playersHeading: 'Piłkarze — Oficjalny profil, statystyki, transfery i trofea',
    searching: 'Szukanie...',
    yearsSuffix: 'l.',
    playerProfileBtn: 'Profil Piłkarza →',
    openPlayerDirect: 'Otwórz profil piłkarza',
    openPlayerDirectSub: 'Statystyki sezonowe, historia transferów, zdobyte trofea i kontuzje',
    openBtn: 'Otwórz ↗',
    teamsHeading: 'Kluby — Oficjalny profil, tabela i kadra',
    teamProfileBtn: 'Profil Klubu →',
    searchTeamGlobal: 'Szukaj klubu w globalnej bazie:',
    searchTeamGlobalSub: 'Otwiera oficjalną stronę ze stadionem, trenerem, tabelą, kadrą i meczami',
    matchesHeading: 'Mecze',
    detailsBtn: 'Szczegóły →',
    sectionsHeading: 'Sekcje Platformy',
    footerLeft: 'Szybkie wyszukiwanie Oddspira',
    footerRight: 'Naciśnij [ESC], aby zamknąć',
    links: [
      { title: 'Na Żywo', tab: 'live', icon: '⚡', desc: 'Mecze na żywo i symulacje w czasie rzeczywistym' },
      { title: 'Ligi', tab: 'competitions', icon: '🏆', desc: 'Światowe ligi i turnieje' },
      { title: 'Analiza', tab: 'analysis', icon: '📊', desc: 'Kalkulator Poissona i Dixon-Coles' },
      { title: 'Moje Zakłady', tab: 'bets', icon: '💼', desc: 'Zarządzanie budżetem i P&L' },
      { title: 'Narzędzia', tab: 'tools', icon: '📐', desc: 'Wartość +EV, Kryterium Kelly’ego i No-Vig' },
      { title: 'Poradniki', tab: 'learn', icon: '📚', desc: 'Podstawy matematyczne i wzory' },
    ],
  },
  el: {
    placeholder: 'Αναζήτηση παίκτη (Saka, Haaland), ομάδας (Arsenal, Olympiacos) ή αγώνα...',
    playersHeading: 'Παίκτες — Επίσημο προφίλ, στατιστικά, μεταγραφές & τρόπαια',
    searching: 'Αναζήτηση...',
    yearsSuffix: 'ετ.',
    playerProfileBtn: 'Προφίλ Παίκτη →',
    openPlayerDirect: 'Άνοιγμα προφίλ παίκτη',
    openPlayerDirectSub: 'Στατιστικά σεζόν, ιστορικό μεταγραφών, τρόπαια και τραυματισμοί',
    openBtn: 'Άνοιγμα ↗',
    teamsHeading: 'Ομάδες — Επίσημο προφίλ, βαθμολογία & ρόστερ',
    teamProfileBtn: 'Προφίλ Ομάδας →',
    searchTeamGlobal: 'Αναζήτηση ομάδας στην παγκόσμια βάση:',
    searchTeamGlobalSub: 'Ανοίγει επίσημη σελίδα με γήπεδο, προπονητή, βαθμολογία, ρόστερ και αγώνες',
    matchesHeading: 'Αγώνες',
    detailsBtn: 'Λεπτομέρειες →',
    sectionsHeading: 'Ενότητες Πλατφόρμας',
    footerLeft: 'Γρήγορη αναζήτηση Oddspira',
    footerRight: 'Πατήστε [ESC] για κλείσιμο',
    links: [
      { title: 'Live', tab: 'live', icon: '⚡', desc: 'Ζωντανοί αγώνες και προσομοίωση σε πραγματικό χρόνο' },
      { title: 'Πρωταθλήματα', tab: 'competitions', icon: '🏆', desc: 'Παγκόσμια πρωταθλήματα και τουρνουά' },
      { title: 'Ανάλυση', tab: 'analysis', icon: '📊', desc: 'Υπολογιστής Poisson & Dixon-Coles' },
      { title: 'Τα Στοιχήματά μου', tab: 'bets', icon: '💼', desc: 'Διαχείριση κάβας και P&L' },
      { title: 'Εργαλεία', tab: 'tools', icon: '📐', desc: 'Αξία +EV, Κριτήριο Kelly & No-Vig' },
      { title: 'Οδηγοί', tab: 'learn', icon: '📚', desc: 'Μαθηματικές βάσεις και τύποι' },
    ],
  },
  ro: {
    placeholder: 'Caută jucător (Saka, Haaland), echipă (Arsenal, FCSB) sau meci...',
    playersHeading: 'Jucători — Profil oficial, statistici, transferuri și trofee',
    searching: 'Se caută...',
    yearsSuffix: 'ani',
    playerProfileBtn: 'Profil Jucător →',
    openPlayerDirect: 'Deschide profilul jucătorului',
    openPlayerDirectSub: 'Statistici pe competiții, istoric transferuri, trofee și accidentări',
    openBtn: 'Deschide ↗',
    teamsHeading: 'Echipe — Profil oficial, clasament și lot',
    teamProfileBtn: 'Profil Club →',
    searchTeamGlobal: 'Caută echipa în baza globală:',
    searchTeamGlobalSub: 'Deschide pagina oficială cu stadion, antrenor, clasament, lot și meciuri',
    matchesHeading: 'Meciuri',
    detailsBtn: 'Detalii →',
    sectionsHeading: 'Secțiunile Platformei',
    footerLeft: 'Căutare rapidă Oddspira',
    footerRight: 'Apasă [ESC] pentru a închide',
    links: [
      { title: 'Live', tab: 'live', icon: '⚡', desc: 'Meciuri live și simulare în timp real' },
      { title: 'Competiții', tab: 'competitions', icon: '🏆', desc: 'Ligi și turnee mondiale' },
      { title: 'Analiză', tab: 'analysis', icon: '📊', desc: 'Calculator Poisson & Dixon-Coles' },
      { title: 'Pariurile Mele', tab: 'bets', icon: '💼', desc: 'Gestionarea băncii și P&L' },
      { title: 'Instrumente', tab: 'tools', icon: '📐', desc: 'Valoare +EV, Criteriul Kelly și No-Vig' },
      { title: 'Ghiduri', tab: 'learn', icon: '📚', desc: 'Fundamente matematice și formule' },
    ],
  },
  ru: {
    placeholder: 'Поиск игрока (Saka, Haaland), клуба (Arsenal, Real Madrid) или матча...',
    playersHeading: 'Футболисты — Официальный профиль, статистика, трансферы и трофеи',
    searching: 'Поиск...',
    yearsSuffix: 'л.',
    playerProfileBtn: 'Профиль игрока →',
    openPlayerDirect: 'Открыть профиль игрока',
    openPlayerDirectSub: 'Сезонная статистика по турнирам, история трансферов, трофеи и травмы',
    openBtn: 'Открыть ↗',
    teamsHeading: 'Клубы — Официальный профиль, таблица и состав',
    teamProfileBtn: 'Профиль клуба →',
    searchTeamGlobal: 'Найти клуб в глобальной базе:',
    searchTeamGlobalSub: 'Открывает официальную страницу со стадионом, тренером, таблицей и составом',
    matchesHeading: 'Матчи',
    detailsBtn: 'Детали →',
    sectionsHeading: 'Разделы платформы',
    footerLeft: 'Быстрый поиск Oddspira',
    footerRight: 'Нажмите [ESC] для закрытия',
    links: [
      { title: 'Лайв', tab: 'live', icon: '⚡', desc: 'Текущие матчи и симуляция в реальном времени' },
      { title: 'Лиги', tab: 'competitions', icon: '🏆', desc: 'Мировые лиги и турниры' },
      { title: 'Анализ', tab: 'analysis', icon: '📊', desc: 'Двумерный калькулятор Пуассона и Dixon-Coles' },
      { title: 'Мои Ставки', tab: 'bets', icon: '💼', desc: 'Управление банком и P&L' },
      { title: 'Инструменты', tab: 'tools', icon: '📐', desc: '+EV ценность, критерий Келли и No-Vig' },
      { title: 'База знаний', tab: 'learn', icon: '📚', desc: 'Математические основы и формулы' },
    ],
  },
};

export const SearchModal: React.FC<SearchModalProps> = ({
  language = 'bg',
  isOpen,
  onClose,
  matches,
  setActiveTab,
  onSelectMatch,
}) => {
  const t = SEARCH_DICT[language] || SEARCH_DICT.en;
  const [query, setQuery] = useState('');
  const [playerHits, setPlayerHits] = useState<PlayerSearchHit[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setPlayerHits([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (q.length < 3) {
      setPlayerHits([]);
      setSearchingPlayers(false);
      return;
    }
    let cancelled = false;
    setSearchingPlayers(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/football/player-search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!cancelled) {
          setPlayerHits(Array.isArray(data?.players) ? data.players.slice(0, 8) : []);
        }
      } catch {
        if (!cancelled) setPlayerHits([]);
      } finally {
        if (!cancelled) setSearchingPlayers(false);
      }
    }, 320);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingFixtures = trimmed
    ? matches.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(trimmed) ||
          m.awayTeam.toLowerCase().includes(trimmed) ||
          m.league.toLowerCase().includes(trimmed)
      )
    : matches.slice(0, 6);

  // Extract unique matching teams from today's fixtures
  const matchingTeamsMap = new Map<
    string,
    { teamId?: number; teamName: string; teamLogo?: string; leagueId?: number; leagueName?: string }
  >();
  if (trimmed.length >= 2) {
    for (const m of matches) {
      if (m.homeTeam.toLowerCase().includes(trimmed)) {
        matchingTeamsMap.set(m.homeTeam.toLowerCase(), {
          teamId: m.homeTeamId,
          teamName: m.homeTeam,
          teamLogo: m.homeLogo,
          leagueId: m.leagueId,
          leagueName: m.league,
        });
      }
      if (m.awayTeam.toLowerCase().includes(trimmed)) {
        matchingTeamsMap.set(m.awayTeam.toLowerCase(), {
          teamId: m.awayTeamId,
          teamName: m.awayTeam,
          teamLogo: m.awayLogo,
          leagueId: m.leagueId,
          leagueName: m.league,
        });
      }
    }
  }
  const matchingTeams = Array.from(matchingTeamsMap.values()).slice(0, 6);

  const filteredLinks = trimmed
    ? t.links.filter(
        (l) =>
          l.title.toLowerCase().includes(trimmed) ||
          l.desc.toLowerCase().includes(trimmed)
      )
    : t.links;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#070b11] border border-[#1b2230] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1b2230]">
          <svg
            className="w-5 h-5 text-[#8f9cae] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim().length >= 2) {
                if (matchingTeams.length > 0) {
                  openTeamProfile(matchingTeams[0]);
                } else if (playerHits.length > 0) {
                  openPlayerProfile({
                    playerId: playerHits[0].id,
                    playerName: playerHits[0].name,
                    playerPhoto: playerHits[0].photo,
                    position: playerHits[0].position,
                    number: playerHits[0].number,
                  });
                } else {
                  openTeamProfile({ teamName: query.trim() });
                }
                onClose();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder={t.placeholder}
            className="w-full bg-transparent text-[#f7f8fb] placeholder-[#8f9cae] text-sm focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#8f9cae] hover:text-[#f7f8fb] px-2 py-1 rounded bg-[#0f1522] border border-[#1b2230] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Quick Links */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Football Players Section */}
          {trimmed.length >= 3 && (
            <div>
              <div className="text-xs font-mono text-sky-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                <span>{t.playersHeading}</span>
                {searchingPlayers && <span className="text-[11px] text-[#8f9cae]">{t.searching}</span>}
              </div>
              <div className="space-y-1.5">
                {playerHits.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={(e) => {
                      openPlayerProfile(
                        {
                          playerId: pl.id,
                          playerName: pl.name,
                          playerPhoto: pl.photo,
                          position: pl.position,
                          number: pl.number,
                        },
                        e
                      );
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0b131e] hover:bg-[#111c2d] border border-[#1b293d] hover:border-sky-500/40 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {pl.photo ? (
                        <img
                          src={pl.photo}
                          alt={pl.name}
                          className="w-9 h-9 rounded-full object-cover bg-[#111c2a] border border-[#22354a] shrink-0"
                        />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-bold shrink-0">
                          ⚽
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                          {pl.name}
                          {pl.number ? (
                            <span className="ml-1.5 text-xs font-mono text-[#43f08a]">
                              #{pl.number}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] font-mono text-[#8f9cae] truncate">
                          {[
                            pl.position,
                            pl.nationality,
                            pl.age ? `${pl.age} ${t.yearsSuffix}` : '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-lg shrink-0">
                      {t.playerProfileBtn}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={(e) => {
                    openPlayerProfile({ playerName: query.trim() }, e);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/30 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center text-xs font-bold">
                      ⚽
                    </span>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-sky-300 block">
                        {t.openPlayerDirect} „{query.trim()}“
                      </span>
                      <span className="text-[11px] text-[#8f9cae] block">
                        {t.openPlayerDirectSub}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-300 shrink-0">
                    {t.openBtn}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Team Profiles Section */}
          {trimmed.length >= 2 && (
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                <span>{t.teamsHeading}</span>
              </div>
              <div className="space-y-1.5">
                {matchingTeams.map((tm) => (
                  <button
                    key={tm.teamName}
                    type="button"
                    onClick={(e) => {
                      openTeamProfile(tm, e);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0b131e] hover:bg-[#111c2d] border border-[#1b293d] hover:border-emerald-500/40 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <TeamBadge
                        name={tm.teamName}
                        logoUrl={tm.teamLogo}
                        teamId={tm.teamId}
                        size="sm"
                      />
                      <div>
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors block">
                          {tm.teamName}
                        </span>
                        {tm.leagueName && (
                          <span className="text-[11px] font-mono text-[#8f9cae] block">
                            {tm.leagueName}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      {t.teamProfileBtn}
                    </span>
                  </button>
                ))}

                {/* Direct Lookup for ANY team worldwide */}
                <button
                  type="button"
                  onClick={(e) => {
                    openTeamProfile({ teamName: query.trim() }, e);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-xs font-bold">
                      🔎
                    </span>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-emerald-300 block">
                        {t.searchTeamGlobal} „{query.trim()}“
                      </span>
                      <span className="text-[11px] text-[#8f9cae] block">
                        {t.searchTeamGlobalSub}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 shrink-0">
                    {t.openBtn}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Matches */}
          {matchingFixtures.length > 0 && (
            <div>
              <div className="text-xs font-mono text-[#8f9cae] uppercase tracking-wider px-2 mb-2">
                {t.matchesHeading} ({matchingFixtures.length})
              </div>
              <div className="space-y-1.5">
                {matchingFixtures.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveTab('live');
                      if (onSelectMatch) onSelectMatch(m);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#0f1522] border border-transparent hover:border-[#1b2230] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <TeamBadge name={m.homeTeam} logoUrl={m.homeLogo} teamId={m.homeTeamId} size="sm" />
                        <span className="text-sm font-semibold text-[#f7f8fb]">
                          {m.homeTeam}
                        </span>
                      </div>
                      <span className="text-xs text-[#8f9cae] font-mono">vs</span>
                      <div className="flex items-center gap-1.5">
                        <TeamBadge name={m.awayTeam} logoUrl={m.awayLogo} teamId={m.awayTeamId} size="sm" />
                        <span className="text-sm font-semibold text-[#f7f8fb]">
                          {m.awayTeam}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8f9cae] hidden sm:inline">
                        {m.league}
                      </span>
                      {m.valueBetDetected && (
                        <span className="text-[11px] font-mono font-bold text-[#43f08a] bg-[#43f08a]/10 px-2 py-0.5 rounded border border-[#43f08a]/30">
                          +{m.valueBetDetected.evPercent}% EV
                        </span>
                      )}
                      <span className="text-xs text-[#43f08a] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {t.detailsBtn}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <div>
            <div className="text-xs font-mono text-[#8f9cae] uppercase tracking-wider px-2 mb-2">
              {t.sectionsHeading}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLinks.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    onClose();
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#0f1522] border border-transparent hover:border-[#1b2230] transition-colors text-left cursor-pointer group"
                >
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-[#f7f8fb] group-hover:text-[#43f08a] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#8f9cae] mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#05080c] border-t border-[#1b2230] flex items-center justify-between text-[11px] font-mono text-[#8f9cae]">
          <span>{t.footerLeft}</span>
          <span>{t.footerRight}</span>
        </div>
      </div>
    </div>
  );
};
