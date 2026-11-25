import React, { useState, useEffect } from 'react';
import { Language, SelectedPlayerTarget } from '../types';
import { openTeamProfile, openPlayerProfile } from './TeamBadge';

interface PlayerCompetitionStat {
  leagueId: number | null;
  leagueName: string;
  leagueCountry: string;
  leagueLogo: string;
  season: number | null;
  teamId: number | null;
  teamName: string;
  teamLogo: string;
  position: string;
  number: number | null;
  captain: boolean;
  appearances: number;
  lineups: number;
  minutes: number;
  rating: string | number | null;
  subIn: number;
  subOut: number;
  bench: number;
  goals: number;
  conceded: number;
  assists: number;
  saves: number;
  shotsTotal: number;
  shotsOn: number;
  passesTotal: number;
  passesKey: number;
  passesAccuracy: number | null;
  tacklesTotal: number;
  tacklesBlocks?: number;
  blocks?: number;
  tacklesInterceptions?: number;
  interceptions?: number;
  duelsTotal: number;
  duelsWon: number;
  dribblesAttempts: number;
  dribblesSuccess: number;
  foulsDrawn: number;
  foulsCommitted: number;
  yellowCards: number;
  yellowRedCards: number;
  redCards: number;
  penaltiesWon: number;
  penaltiesCommitted: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  penaltiesSaved: number;
}

interface PlayerTransferItem {
  date: string;
  type: string;
  teamIn: { id: number | null; name: string; logo: string };
  teamOut: { id: number | null; name: string; logo: string };
}

interface PlayerTrophyItem {
  league: string;
  country: string;
  season: string;
  place: string;
}

interface PlayerSidelinedItem {
  type: string;
  start: string;
  end: string;
}

interface PlayerTotalsSummary {
  appearances: number;
  lineups: number;
  minutes: number;
  goals: number;
  assists: number;
  saves: number;
  conceded: number;
  shotsTotal: number;
  shotsOn: number;
  passesTotal: number;
  passesKey: number;
  tacklesTotal: number;
  interceptions: number;
  duelsTotal: number;
  duelsWon: number;
  dribblesAttempts: number;
  dribblesSuccess: number;
  foulsDrawn: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  avgRating: string | number | null;
}

interface PlayerIntelResponse {
  season: number;
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number | null;
    birthDate: string;
    birthPlace: string;
    birthCountry: string;
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
    position: string;
    number: number | null;
    currentTeam?: {
      id: number | null;
      name: string;
      logo: string;
    };
  };
  primaryTeam?: {
    id: number | null;
    name: string;
    logo: string;
  } | null;
  totals?: PlayerTotalsSummary;
  summary?: PlayerTotalsSummary;
  statistics?: PlayerCompetitionStat[];
  competitions?: PlayerCompetitionStat[];
  transfers: PlayerTransferItem[];
  trophies: PlayerTrophyItem[];
  sidelined: PlayerSidelinedItem[];
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
  height: string;
  weight: string;
}

interface PlayerDetailPageProps {
  language?: Language;
  target: SelectedPlayerTarget;
  onBack: () => void;
  onOpenLeague?: (leagueId: number, leagueName: string, country?: string) => void;
}

type SubTab = 'stats' | 'transfers' | 'trophies' | 'sidelined';

interface PlayerI18nEntry {
  home: string;
  back: string;
  searchPlaceholder: string;
  searchingGlobal: string;
  noPlayersFound: string;
  injuredBadge: string;
  nationality: string;
  age: string;
  yearsSuffix: string;
  birthPlace: string;
  height: string;
  weight: string;
  wonTrophies: string;
  matchesStarter: string;
  goalsAssists: string;
  shotsOnTarget: string;
  keyPasses: string;
  penScored: string;
  dribblesSub: string;
  duelsSub: string;
  tabStats: string;
  tabTransfers: string;
  tabTrophies: string;
  tabSidelined: string;
  seasonLabel: string;
  currentSeason: string;
  loadingDossier: string;
  errorSearchHint: string;
  seasonStatsTitle: string;
  seasonStatsSub: string;
  noStatsForSeason: string;
  thTournament: string;
  thClub: string;
  thMatches: string;
  thMinutes: string;
  thGoals: string;
  thAssists: string;
  thShots: string;
  thKeyPasses: string;
  thDribbles: string;
  thDuels: string;
  thCards: string;
  thRating: string;
  cardAttackTitle: string;
  rowGoalsScored: string;
  rowGoalAssists: string;
  rowShotsTotalOn: string;
  rowShotAccuracy: string;
  rowPenaltiesScoredMissed: string;
  cardPlaymakingTitle: string;
  rowTotalPasses: string;
  rowKeyPassesChances: string;
  rowDribblesSuccessAtt: string;
  rowDribbleSuccessRate: string;
  rowFoulsDrawn: string;
  cardDefenseTitle: string;
  rowTacklesTotal: string;
  rowInterceptions: string;
  rowDuelsWon: string;
  rowFoulsCommitted: string;
  rowYellowRedCards: string;
  transfersTitle: string;
  transfersSub: string;
  noTransfers: string;
  fromClub: string;
  toClub: string;
  transferDefault: string;
  trophiesTitle: string;
  trophiesSub: string;
  noTrophies: string;
  championBadge: string;
  sidelinedTitle: string;
  sidelinedSub: string;
  noSidelined: string;
  officialAbsence: string;
  fromDate: string;
  toDate: string;
  activeInjury: string;
  posGK: string;
  posDF: string;
  posMF: string;
  posFW: string;
}

const PLAYER_DICT: Record<Language, PlayerI18nEntry> = {
  bg: {
    home: 'Начало',
    back: '← Назад',
    searchPlaceholder: '🔍 Потърси всеки футболист по име...',
    searchingGlobal: 'Търсене в глобалната база от футболисти...',
    noPlayersFound: 'Няма намерени футболисти за',
    injuredBadge: '🏥 Контузен / Извън групата',
    nationality: 'Националност',
    age: 'Възраст',
    yearsSuffix: 'г.',
    birthPlace: 'Място на раждане',
    height: 'Ръст',
    weight: 'Тегло',
    wonTrophies: 'спечелени трофея',
    matchesStarter: 'МАЧОВЕ (ТИТУЛЯР)',
    goalsAssists: 'ГОЛОВЕ / АСИСТЕНЦИИ',
    shotsOnTarget: 'УДАРИ (ТОЧНИ)',
    keyPasses: 'КЛЮЧОВИ ПАСОВЕ',
    penScored: 'Дузпи',
    dribblesSub: 'Дрибъли',
    duelsSub: 'Единоборства',
    tabStats: 'Статистика по турнири',
    tabTransfers: 'Трансферна история',
    tabTrophies: 'Трофеи и отличия',
    tabSidelined: 'Контузии и отсъствия',
    seasonLabel: 'Сезон:',
    currentSeason: 'Актуален',
    loadingDossier: 'Зареждане на пълно досие, сезонна статистика, трансфери и трофеи за',
    errorSearchHint: 'Можете да използвате търсачката горе вдясно, за да потърсите футболиста по име на латиница.',
    seasonStatsTitle: 'Сезонна статистика по първенства и турнири',
    seasonStatsSub: 'Кликни върху турнир или отбор, за да отвориш техния официален профил',
    noStatsForSeason: 'Няма записана статистика за избрания сезон. Избери друг сезон от бутоните горе вдясно (напр. 2024/25 или 2023/24).',
    thTournament: 'ТУРНИР',
    thClub: 'КЛУБ',
    thMatches: 'МАЧОВЕ (ТИТ.)',
    thMinutes: 'МИНУТИ',
    thGoals: 'ГОЛОВЕ',
    thAssists: 'АСИСТ.',
    thShots: 'УДАРИ (ТОЧНИ)',
    thKeyPasses: 'КЛЮЧ. ПАСОВЕ',
    thDribbles: 'ДРИБЪЛИ',
    thDuels: 'ЕДИНОБОРСТВА',
    thCards: 'КАРТОНИ',
    thRating: 'РЕЙТИНГ',
    cardAttackTitle: '⚽ Атака & Завършващ удар',
    rowGoalsScored: 'Отбелязани голове',
    rowGoalAssists: 'Голови асистенции',
    rowShotsTotalOn: 'Общо удари / Точни удари',
    rowShotAccuracy: 'Точност на ударите',
    rowPenaltiesScoredMissed: 'Дузпи (Вкарани / Пропуснати)',
    cardPlaymakingTitle: '🎯 Креативност, Пасове & Дрибъл',
    rowTotalPasses: 'Общо пасове',
    rowKeyPassesChances: 'Ключови пасове (Голови положения)',
    rowDribblesSuccessAtt: 'Успешни дрибъли / Опити',
    rowDribbleSuccessRate: 'Успеваемост при дрибъл',
    rowFoulsDrawn: 'Спечелени фалове',
    cardDefenseTitle: '🛡️ Защита, Единоборства & Дисциплина',
    rowTacklesTotal: 'Шпагати / Отнети топки',
    rowInterceptions: 'Пресечени пасове',
    rowDuelsWon: 'Спечелени единоборства',
    rowFoulsCommitted: 'Извършени нарушения',
    rowYellowRedCards: 'Жълти / Червени картони',
    transfersTitle: 'Пълна трансферна история',
    transfersSub: 'Всички официални трансфери и наеми в кариерата на футболиста (кликни върху отбор за неговия профил)',
    noTransfers: 'Няма регистрирани трансфери за този футболист.',
    fromClub: 'ОТ КЛУБ',
    toClub: 'В КЛУБ',
    transferDefault: 'Трансфер',
    trophiesTitle: 'Спечелени трофеи и отличия',
    trophiesSub: 'Всички шампионски титли, купи и финали в кариерата на футболиста',
    noTrophies: 'Няма регистрирани трофеи и финали за този футболист.',
    championBadge: 'Шампион',
    sidelinedTitle: 'История на контузиите и наказанията',
    sidelinedSub: 'Хронологичен архив на всички контузии, заболявания и дисциплинарни наказания',
    noSidelined: 'Няма регистрирани контузии или наказания за този футболист.',
    officialAbsence: 'Официално регистрирано отсъствие',
    fromDate: 'От:',
    toDate: 'До:',
    activeInjury: 'Активна',
    posGK: 'Вратар (GK)',
    posDF: 'Защитник (DF)',
    posMF: 'Полузащитник (MF)',
    posFW: 'Нападател (FW)',
  },
  en: {
    home: 'Home',
    back: '← Back',
    searchPlaceholder: '🔍 Search any player by name...',
    searchingGlobal: 'Searching global player database...',
    noPlayersFound: 'No players found for',
    injuredBadge: '🏥 Injured / Sidelined',
    nationality: 'Nationality',
    age: 'Age',
    yearsSuffix: 'y',
    birthPlace: 'Place of Birth',
    height: 'Height',
    weight: 'Weight',
    wonTrophies: 'trophies won',
    matchesStarter: 'MATCHES (STARTER)',
    goalsAssists: 'GOALS / ASSISTS',
    shotsOnTarget: 'SHOTS (ON TARGET)',
    keyPasses: 'KEY PASSES',
    penScored: 'Penalties',
    dribblesSub: 'Dribbles',
    duelsSub: 'Duels',
    tabStats: 'Competition Stats',
    tabTransfers: 'Transfer History',
    tabTrophies: 'Trophies & Honours',
    tabSidelined: 'Injuries & Sidelined',
    seasonLabel: 'Season:',
    currentSeason: 'Current',
    loadingDossier: 'Loading official dossier, season statistics, transfers and trophies for',
    errorSearchHint: 'Use the search bar in the top right to search for any player by name.',
    seasonStatsTitle: 'Seasonal Statistics by League & Competition',
    seasonStatsSub: 'Click on any competition or club to open its official profile',
    noStatsForSeason: 'No recorded statistics for the selected season. Choose another season from the top-right buttons (e.g. 2024/25 or 2023/24).',
    thTournament: 'COMPETITION',
    thClub: 'CLUB',
    thMatches: 'APPS (START)',
    thMinutes: 'MINUTES',
    thGoals: 'GOALS',
    thAssists: 'ASSISTS',
    thShots: 'SHOTS (ON)',
    thKeyPasses: 'KEY PASSES',
    thDribbles: 'DRIBBLES',
    thDuels: 'DUELS',
    thCards: 'CARDS',
    thRating: 'RATING',
    cardAttackTitle: '⚽ Attacking & Finishing',
    rowGoalsScored: 'Goals Scored',
    rowGoalAssists: 'Goal Assists',
    rowShotsTotalOn: 'Total Shots / Shots on Target',
    rowShotAccuracy: 'Shot Accuracy',
    rowPenaltiesScoredMissed: 'Penalties (Scored / Missed)',
    cardPlaymakingTitle: '🎯 Playmaking, Passing & Dribbles',
    rowTotalPasses: 'Total Passes',
    rowKeyPassesChances: 'Key Passes (Chances Created)',
    rowDribblesSuccessAtt: 'Successful Dribbles / Attempts',
    rowDribbleSuccessRate: 'Dribble Success Rate',
    rowFoulsDrawn: 'Fouls Drawn',
    cardDefenseTitle: '🛡️ Defending, Duels & Discipline',
    rowTacklesTotal: 'Tackles Won',
    rowInterceptions: 'Interceptions',
    rowDuelsWon: 'Duels Won',
    rowFoulsCommitted: 'Fouls Committed',
    rowYellowRedCards: 'Yellow / Red Cards',
    transfersTitle: 'Complete Transfer History',
    transfersSub: 'All official transfers and loan moves in the player career (click any club to view its profile)',
    noTransfers: 'No recorded transfers for this player.',
    fromClub: 'FROM CLUB',
    toClub: 'TO CLUB',
    transferDefault: 'Transfer',
    trophiesTitle: 'Trophies & Career Honours',
    trophiesSub: 'All championship titles, domestic cups and finals in the player career',
    noTrophies: 'No recorded trophies or finals for this player.',
    championBadge: 'Winner',
    sidelinedTitle: 'Injury & Suspension History',
    sidelinedSub: 'Chronological archive of all recorded injuries, illnesses and suspensions',
    noSidelined: 'No recorded injuries or suspensions for this player.',
    officialAbsence: 'Officially recorded absence',
    fromDate: 'From:',
    toDate: 'To:',
    activeInjury: 'Active',
    posGK: 'Goalkeeper (GK)',
    posDF: 'Defender (DF)',
    posMF: 'Midfielder (MF)',
    posFW: 'Forward (FW)',
  },
  es: {
    home: 'Inicio',
    back: '← Volver',
    searchPlaceholder: '🔍 Buscar cualquier jugador...',
    searchingGlobal: 'Buscando en la base global de jugadores...',
    noPlayersFound: 'No se encontraron jugadores para',
    injuredBadge: '🏥 Lesionado / Baja',
    nationality: 'Nacionalidad',
    age: 'Edad',
    yearsSuffix: 'años',
    birthPlace: 'Lugar de nacimiento',
    height: 'Altura',
    weight: 'Peso',
    wonTrophies: 'trofeos ganados',
    matchesStarter: 'PARTIDOS (TITULAR)',
    goalsAssists: 'GOLES / ASISTENCIAS',
    shotsOnTarget: 'TIROS (A PUERTA)',
    keyPasses: 'PASES CLAVE',
    penScored: 'Penaltis',
    dribblesSub: 'Regates',
    duelsSub: 'Duelos',
    tabStats: 'Estadísticas por Torneo',
    tabTransfers: 'Historial de Fichajes',
    tabTrophies: 'Trofeos y Palmarés',
    tabSidelined: 'Lesiones y Bajas',
    seasonLabel: 'Temporada:',
    currentSeason: 'Actual',
    loadingDossier: 'Cargando perfil completo, estadísticas, fichajes y trofeos de',
    errorSearchHint: 'Puedes usar el buscador arriba a la derecha para buscar al jugador por su nombre.',
    seasonStatsTitle: 'Estadísticas de la Temporada por Competición',
    seasonStatsSub: 'Haz clic en cualquier torneo o club para abrir su perfil oficial',
    noStatsForSeason: 'No hay estadísticas registradas para la temporada seleccionada. Elige otra temporada arriba a la derecha.',
    thTournament: 'TORNEO',
    thClub: 'CLUB',
    thMatches: 'PART. (TIT.)',
    thMinutes: 'MINUTOS',
    thGoals: 'GOLES',
    thAssists: 'ASIST.',
    thShots: 'TIROS (PUERTA)',
    thKeyPasses: 'PASES CLAVE',
    thDribbles: 'REGATES',
    thDuels: 'DUELOS',
    thCards: 'TARJETAS',
    thRating: 'RATING',
    cardAttackTitle: '⚽ Ataque y Definición',
    rowGoalsScored: 'Goles Marcados',
    rowGoalAssists: 'Asistencias de Gol',
    rowShotsTotalOn: 'Tiros Totales / A Puerta',
    rowShotAccuracy: 'Precisión de Tiro',
    rowPenaltiesScoredMissed: 'Penaltis (Anotados / Fallados)',
    cardPlaymakingTitle: '🎯 Creación, Pases y Regates',
    rowTotalPasses: 'Pases Totales',
    rowKeyPassesChances: 'Pases Clave (Ocasiones)',
    rowDribblesSuccessAtt: 'Regates Exitosos / Intentos',
    rowDribbleSuccessRate: 'Éxito en Regates',
    rowFoulsDrawn: 'Faltas Recibidas',
    cardDefenseTitle: '🛡️ Defensa, Duelos y Disciplina',
    rowTacklesTotal: 'Entradas Ganadas',
    rowInterceptions: 'Intercepciones',
    rowDuelsWon: 'Duelos Ganados',
    rowFoulsCommitted: 'Faltas Cometidas',
    rowYellowRedCards: 'Tarjetas Amarillas / Rojas',
    transfersTitle: 'Historial Completo de Fichajes',
    transfersSub: 'Todos los traspasos y cesiones oficiales en la carrera del jugador',
    noTransfers: 'No hay traspasos registrados para este jugador.',
    fromClub: 'CLUB ORIGEN',
    toClub: 'CLUB DESTINO',
    transferDefault: 'Traspaso',
    trophiesTitle: 'Trofeos y Palmarés',
    trophiesSub: 'Todos los títulos de liga, copas y finales en la carrera del jugador',
    noTrophies: 'No hay trofeos registrados para este jugador.',
    championBadge: 'Campeón',
    sidelinedTitle: 'Historial de Lesiones y Sanciones',
    sidelinedSub: 'Archivo cronológico de todas las lesiones, bajas y sanciones',
    noSidelined: 'No hay lesiones registradas para este jugador.',
    officialAbsence: 'Ausencia oficial registrada',
    fromDate: 'Desde:',
    toDate: 'Hasta:',
    activeInjury: 'Activa',
    posGK: 'Portero (GK)',
    posDF: 'Defensa (DF)',
    posMF: 'Centrocampista (MF)',
    posFW: 'Delantero (FW)',
  },
  de: {
    home: 'Start',
    back: '← Zurück',
    searchPlaceholder: '🔍 Spieler nach Namen suchen...',
    searchingGlobal: 'Suche in der globalen Spielerdatenbank...',
    noPlayersFound: 'Keine Spieler gefunden für',
    injuredBadge: '🏥 Verletzt / Ausfall',
    nationality: 'Nationalität',
    age: 'Alter',
    yearsSuffix: 'J.',
    birthPlace: 'Geburtsort',
    height: 'Größe',
    weight: 'Gewicht',
    wonTrophies: 'gewonnene Titel',
    matchesStarter: 'SPIELE (STARTELF)',
    goalsAssists: 'TORE / VORLAGEN',
    shotsOnTarget: 'SCHÜSSE (AUFS TOR)',
    keyPasses: 'SCHLÜSSELPÄSSE',
    penScored: 'Elfmeter',
    dribblesSub: 'Dribblings',
    duelsSub: 'Zweikämpfe',
    tabStats: 'Wettbewerbs-Statistik',
    tabTransfers: 'Transferhistorie',
    tabTrophies: 'Titel & Erfolge',
    tabSidelined: 'Verletzungen',
    seasonLabel: 'Saison:',
    currentSeason: 'Aktuell',
    loadingDossier: 'Lade Spielerprofil, Saisonstatistiken, Transfers und Titel für',
    errorSearchHint: 'Nutzen Sie das Suchfeld oben rechts, um nach einem Spieler zu suchen.',
    seasonStatsTitle: 'Saisonstatistik nach Liga & Wettbewerb',
    seasonStatsSub: 'Klicken Sie auf einen Wettbewerb oder Verein, um das offizielle Profil zu öffnen',
    noStatsForSeason: 'Keine Statistiken für die gewählte Saison vorhanden. Wählen Sie oben rechts eine andere Saison (z.B. 2024/25).',
    thTournament: 'WETTBEWERB',
    thClub: 'VEREIN',
    thMatches: 'SPIELE (START)',
    thMinutes: 'MINUTEN',
    thGoals: 'TORE',
    thAssists: 'VORL.',
    thShots: 'SCHÜSSE (TOR)',
    thKeyPasses: 'KEY-PÄSSE',
    thDribbles: 'DRIBBLINGS',
    thDuels: 'ZWEIKÄMPFE',
    thCards: 'KARTEN',
    thRating: 'RATING',
    cardAttackTitle: '⚽ Angriff & Abschluss',
    rowGoalsScored: 'Erzielte Tore',
    rowGoalAssists: 'Torvorlagen',
    rowShotsTotalOn: 'Schüsse Gesamt / Aufs Tor',
    rowShotAccuracy: 'Schussgenauigkeit',
    rowPenaltiesScoredMissed: 'Elfmeter (Verwandelt / Verschossen)',
    cardPlaymakingTitle: '🎯 Spielaufbau, Pässe & Dribblings',
    rowTotalPasses: 'Pässe Gesamt',
    rowKeyPassesChances: 'Schlüsselpässe (Torvorbereitungen)',
    rowDribblesSuccessAtt: 'Erfolgreiche Dribblings / Versuche',
    rowDribbleSuccessRate: 'Dribbling-Erfolgsquote',
    rowFoulsDrawn: 'Gezogene Fouls',
    cardDefenseTitle: '🛡️ Defensive, Zweikämpfe & Disziplin',
    rowTacklesTotal: 'Tacklings',
    rowInterceptions: 'Abgefangene Bälle',
    rowDuelsWon: 'Gewonnene Zweikämpfe',
    rowFoulsCommitted: 'Begangene Fouls',
    rowYellowRedCards: 'Gelbe / Rote Karten',
    transfersTitle: 'Komplette Transferhistorie',
    transfersSub: 'Alle offiziellen Transfers und Leihen in der Spielerkarriere',
    noTransfers: 'Keine registrierten Transfers für diesen Spieler.',
    fromClub: 'ABGEBENDER KLUB',
    toClub: 'NEUER KLUB',
    transferDefault: 'Transfer',
    trophiesTitle: 'Titel & Erfolge',
    trophiesSub: 'Alle Meisterschaften, Pokalsiege und Finals in der Karriere',
    noTrophies: 'Keine registrierten Titel für diesen Spieler.',
    championBadge: 'Sieger',
    sidelinedTitle: 'Verletzungs- & Sperrenhistorie',
    sidelinedSub: 'Chronologisches Archiv aller Verletzungen und Sperren',
    noSidelined: 'Keine registrierten Verletzungen für diesen Spieler.',
    officialAbsence: 'Offiziell registrierter Ausfall',
    fromDate: 'Von:',
    toDate: 'Bis:',
    activeInjury: 'Aktiv',
    posGK: 'Torwart (GK)',
    posDF: 'Verteidiger (DF)',
    posMF: 'Mittelfeld (MF)',
    posFW: 'Stürmer (FW)',
  },
  it: {
    home: 'Home',
    back: '← Indietro',
    searchPlaceholder: '🔍 Cerca qualsiasi giocatore...',
    searchingGlobal: 'Ricerca nel database globale giocatori...',
    noPlayersFound: 'Nessun giocatore trovato per',
    injuredBadge: '🏥 Infortunato / Indisponibile',
    nationality: 'Nazionalità',
    age: 'Età',
    yearsSuffix: 'anni',
    birthPlace: 'Luogo di nascita',
    height: 'Altezza',
    weight: 'Peso',
    wonTrophies: 'trofei vinti',
    matchesStarter: 'PRESENZE (TITOLARE)',
    goalsAssists: 'GOL / ASSIST',
    shotsOnTarget: 'TIRI (IN PORTA)',
    keyPasses: 'PASSAGGI CHIAVE',
    penScored: 'Rigori',
    dribblesSub: 'Dribbling',
    duelsSub: 'Duelli',
    tabStats: 'Statistiche per Torneo',
    tabTransfers: 'Storico Trasferimenti',
    tabTrophies: 'Trofei e Palmarès',
    tabSidelined: 'Infortuni e Assenze',
    seasonLabel: 'Stagione:',
    currentSeason: 'Attuale',
    loadingDossier: 'Caricamento profilo completo, statistiche, trasferimenti e trofei per',
    errorSearchHint: 'Usa la barra di ricerca in alto a destra per cercare qualsiasi giocatore.',
    seasonStatsTitle: 'Statistiche Stagionali per Campionato e Coppa',
    seasonStatsSub: 'Clicca su un torneo o una squadra per aprire il profilo ufficiale',
    noStatsForSeason: 'Nessuna statistica registrata per la stagione selezionata. Scegli un’altra stagione in alto a destra.',
    thTournament: 'TORNEO',
    thClub: 'SQUADRA',
    thMatches: 'PRES. (TIT.)',
    thMinutes: 'MINUTI',
    thGoals: 'GOL',
    thAssists: 'ASSIST',
    thShots: 'TIRI (PORTA)',
    thKeyPasses: 'PASS. CHIAVE',
    thDribbles: 'DRIBBLING',
    thDuels: 'DUELLI',
    thCards: 'CARTELLINI',
    thRating: 'RATING',
    cardAttackTitle: '⚽ Attacco e Finalizzazione',
    rowGoalsScored: 'Gol Segnati',
    rowGoalAssists: 'Assist',
    rowShotsTotalOn: 'Tiri Totali / In Porta',
    rowShotAccuracy: 'Precisione Tiri',
    rowPenaltiesScoredMissed: 'Rigori (Segnati / Sbagliati)',
    cardPlaymakingTitle: '🎯 Regia, Passaggi e Dribbling',
    rowTotalPasses: 'Passaggi Totali',
    rowKeyPassesChances: 'Passaggi Chiave (Occasioni)',
    rowDribblesSuccessAtt: 'Dribbling Riusciti / Tentati',
    rowDribbleSuccessRate: '% Successo Dribbling',
    rowFoulsDrawn: 'Falli Subiti',
    cardDefenseTitle: '🛡️ Difesa, Duelli e Disciplina',
    rowTacklesTotal: 'Contrasti Vinti',
    rowInterceptions: 'Palloni Intercettati',
    rowDuelsWon: 'Duelli Vinti',
    rowFoulsCommitted: 'Falli Commessi',
    rowYellowRedCards: 'Cartellini Gialli / Rossi',
    transfersTitle: 'Storico Completo Trasferimenti',
    transfersSub: 'Tutti i trasferimenti ufficiali e i prestiti nella carriera del giocatore',
    noTransfers: 'Nessun trasferimento registrato per questo giocatore.',
    fromClub: 'DA SQUADRA',
    toClub: 'A SQUADRA',
    transferDefault: 'Trasferimento',
    trophiesTitle: 'Trofei e Palmarès',
    trophiesSub: 'Tutti i campionati, le coppe e le finali in carriera',
    noTrophies: 'Nessun trofeo registrato per questo giocatore.',
    championBadge: 'Vincitore',
    sidelinedTitle: 'Storico Infortuni e Squalifiche',
    sidelinedSub: 'Archivio cronologico di tutti gli infortuni e le squalifiche',
    noSidelined: 'Nessun infortunio registrato per questo giocatore.',
    officialAbsence: 'Assenza ufficiale registrata',
    fromDate: 'Dal:',
    toDate: 'Al:',
    activeInjury: 'Attivo',
    posGK: 'Portiere (GK)',
    posDF: 'Difensore (DF)',
    posMF: 'Centrocampista (MF)',
    posFW: 'Attaccante (FW)',
  },
  pt: {
    home: 'Início',
    back: '← Voltar',
    searchPlaceholder: '🔍 Pesquisar qualquer jogador...',
    searchingGlobal: 'Pesquisando no banco de dados global de jogadores...',
    noPlayersFound: 'Nenhum jogador encontrado para',
    injuredBadge: '🏥 Lesionado / Indisponível',
    nationality: 'Nacionalidade',
    age: 'Idade',
    yearsSuffix: 'anos',
    birthPlace: 'Local de nascimento',
    height: 'Altura',
    weight: 'Peso',
    wonTrophies: 'troféus conquistados',
    matchesStarter: 'JOGOS (TITULAR)',
    goalsAssists: 'GOLS / ASSISTÊNCIAS',
    shotsOnTarget: 'CHUTES (NO GOL)',
    keyPasses: 'PASSES DECISIVOS',
    penScored: 'Pênaltis',
    dribblesSub: 'Dribles',
    duelsSub: 'Duelos',
    tabStats: 'Estatísticas por Torneio',
    tabTransfers: 'Histórico de Transferências',
    tabTrophies: 'Troféus e Títulos',
    tabSidelined: 'Lesões e Ausências',
    seasonLabel: 'Temporada:',
    currentSeason: 'Atual',
    loadingDossier: 'Carregando perfil completo, estatísticas, transferências e troféus de',
    errorSearchHint: 'Use a busca no canto superior direito para procurar qualquer jogador.',
    seasonStatsTitle: 'Estatísticas da Temporada por Campeonato e Copa',
    seasonStatsSub: 'Clique em qualquer competição ou clube para abrir o perfil oficial',
    noStatsForSeason: 'Nenhuma estatística registrada para a temporada selecionada. Escolha outra temporada acima à direita.',
    thTournament: 'TORNEIO',
    thClub: 'CLUBE',
    thMatches: 'JOGOS (TIT.)',
    thMinutes: 'MINUTOS',
    thGoals: 'GOLS',
    thAssists: 'ASSIST.',
    thShots: 'CHUTES (GOL)',
    thKeyPasses: 'PASSES DEC.',
    thDribbles: 'DRIBLES',
    thDuels: 'DUELOS',
    thCards: 'CARTÕES',
    thRating: 'NOTA',
    cardAttackTitle: '⚽ Ataque e Finalização',
    rowGoalsScored: 'Gols Marcados',
    rowGoalAssists: 'Assistências',
    rowShotsTotalOn: 'Finalizações Totais / No Gol',
    rowShotAccuracy: 'Precisão de Finalização',
    rowPenaltiesScoredMissed: 'Pênaltis (Convertidos / Perdidos)',
    cardPlaymakingTitle: '🎯 Criação, Passes e Dribles',
    rowTotalPasses: 'Total de Passes',
    rowKeyPassesChances: 'Passes Decisivos (Chances)',
    rowDribblesSuccessAtt: 'Dribles Certos / Tentativas',
    rowDribbleSuccessRate: '% Sucesso em Dribles',
    rowFoulsDrawn: 'Faltas Sofridas',
    cardDefenseTitle: '🛡️ Defesa, Duelos e Disciplina',
    rowTacklesTotal: 'Desarmes',
    rowInterceptions: 'Interceptações',
    rowDuelsWon: 'Duelos Ganhos',
    rowFoulsCommitted: 'Faltas Cometidas',
    rowYellowRedCards: 'Cartões Amarelos / Vermelhos',
    transfersTitle: 'Histórico Completo de Transferências',
    transfersSub: 'Todas as transferências oficiais e empréstimos na carreira do jogador',
    noTransfers: 'Nenhuma transferência registrada para este jogador.',
    fromClub: 'CLUBE ORIGEM',
    toClub: 'CLUBE DESTINO',
    transferDefault: 'Transferência',
    trophiesTitle: 'Troféus e Títulos Conquistados',
    trophiesSub: 'Todos os títulos de liga, copas e finais na carreira do jogador',
    noTrophies: 'Nenhum troféu registrado para este jogador.',
    championBadge: 'Campeão',
    sidelinedTitle: 'Histórico de Lesões e Suspensões',
    sidelinedSub: 'Arquivo cronológico de todas as lesões e suspensões',
    noSidelined: 'Nenhuma lesão registrada para este jogador.',
    officialAbsence: 'Ausência oficial registrada',
    fromDate: 'De:',
    toDate: 'Até:',
    activeInjury: 'Ativa',
    posGK: 'Goleiro (GK)',
    posDF: 'Defensor (DF)',
    posMF: 'Meio-campista (MF)',
    posFW: 'Atacante (FW)',
  },
  fr: {
    home: 'Accueil',
    back: '← Retour',
    searchPlaceholder: '🔍 Rechercher un joueur...',
    searchingGlobal: 'Recherche dans la base mondiale de joueurs...',
    noPlayersFound: 'Aucun joueur trouvé pour',
    injuredBadge: '🏥 Blessé / Indisponible',
    nationality: 'Nationalité',
    age: 'Âge',
    yearsSuffix: 'ans',
    birthPlace: 'Lieu de naissance',
    height: 'Taille',
    weight: 'Poids',
    wonTrophies: 'trophées remportés',
    matchesStarter: 'MATCHS (TITULAIRE)',
    goalsAssists: 'BUTS / PASSES DÉC.',
    shotsOnTarget: 'TIRS (CADRÉS)',
    keyPasses: 'PASSES CLÉS',
    penScored: 'Penaltys',
    dribblesSub: 'Dribbles',
    duelsSub: 'Duels',
    tabStats: 'Stats par Compétition',
    tabTransfers: 'Historique des Transferts',
    tabTrophies: 'Trophées et Palmarès',
    tabSidelined: 'Blessures et Absences',
    seasonLabel: 'Saison :',
    currentSeason: 'Actuelle',
    loadingDossier: 'Chargement du profil officiel, des statistiques, transferts et trophées de',
    errorSearchHint: 'Utilisez la barre de recherche en haut à droite pour chercher un joueur par son nom.',
    seasonStatsTitle: 'Statistiques Saisonnières par Championnat et Coupe',
    seasonStatsSub: 'Cliquez sur une compétition ou un club pour ouvrir son profil officiel',
    noStatsForSeason: 'Aucune statistique enregistrée pour la saison sélectionnée. Choisissez une autre saison en haut à droite (ex. 2024/25).',
    thTournament: 'COMPÉTITION',
    thClub: 'CLUB',
    thMatches: 'MATCHS (TIT.)',
    thMinutes: 'MINUTES',
    thGoals: 'BUTS',
    thAssists: 'PASSES D.',
    thShots: 'TIRS (CADRÉS)',
    thKeyPasses: 'PASSES CLÉS',
    thDribbles: 'DRIBBLES',
    thDuels: 'DUELS',
    thCards: 'CARTONS',
    thRating: 'NOTE',
    cardAttackTitle: '⚽ Attaque & Finition',
    rowGoalsScored: 'Buts Marqués',
    rowGoalAssists: 'Passes Décisives',
    rowShotsTotalOn: 'Tirs Totaux / Tirs Cadrés',
    rowShotAccuracy: 'Précision des Tirs',
    rowPenaltiesScoredMissed: 'Penaltys (Marqués / Manqués)',
    cardPlaymakingTitle: '🎯 Création, Passes & Dribbles',
    rowTotalPasses: 'Passes Totales',
    rowKeyPassesChances: 'Passes Clés (Occasions Créées)',
    rowDribblesSuccessAtt: 'Dribbles Réussis / Tentés',
    rowDribbleSuccessRate: '% de Réussite aux Dribbles',
    rowFoulsDrawn: 'Fautes Subies',
    cardDefenseTitle: '🛡️ Défense, Duels & Discipline',
    rowTacklesTotal: 'Tacles Réussis',
    rowInterceptions: 'Interceptions',
    rowDuelsWon: 'Duels Gagnés',
    rowFoulsCommitted: 'Fautes Commises',
    rowYellowRedCards: 'Cartons Jaunes / Rouges',
    transfersTitle: 'Historique Complet des Transferts',
    transfersSub: 'Tous les transferts officiels et prêts dans la carrière du joueur (cliquez sur un club pour voir son profil)',
    noTransfers: 'Aucun transfert enregistré pour ce joueur.',
    fromClub: 'CLUB DÉPART',
    toClub: 'CLUB ARRIVÉE',
    transferDefault: 'Transfert',
    trophiesTitle: 'Trophées et Palmarès',
    trophiesSub: 'Tous les titres de champion, coupes et finales dans la carrière du joueur',
    noTrophies: 'Aucun trophée enregistré pour ce joueur.',
    championBadge: 'Vainqueur',
    sidelinedTitle: 'Historique des Blessures et Suspensions',
    sidelinedSub: 'Archive chronologique de toutes les blessures et suspensions',
    noSidelined: 'Aucune blessure ou suspension enregistrée pour ce joueur.',
    officialAbsence: 'Absence officiellement enregistrée',
    fromDate: 'Du :',
    toDate: 'Au :',
    activeInjury: 'Active',
    posGK: 'Gardien (GK)',
    posDF: 'Défenseur (DF)',
    posMF: 'Milieu (MF)',
    posFW: 'Attaquant (FW)',
  },
  tr: {
    home: 'Ana Sayfa',
    back: '← Geri',
    searchPlaceholder: '🔍 Oyuncu adına göre ara...',
    searchingGlobal: 'Küresel oyuncu veritabanında aranıyor...',
    noPlayersFound: 'Oyuncu bulunamadı:',
    injuredBadge: '🏥 Sakat / Kadro Dışı',
    nationality: 'Uyruk',
    age: 'Yaş',
    yearsSuffix: 'yaş',
    birthPlace: 'Doğum Yeri',
    height: 'Boy',
    weight: 'Kilo',
    wonTrophies: 'kazanılan kupa',
    matchesStarter: 'MAÇLAR (İLK 11)',
    goalsAssists: 'GOL / ASİST',
    shotsOnTarget: 'ŞUT (İSABETLİ)',
    keyPasses: 'KİLİT PAS',
    penScored: 'Penaltı',
    dribblesSub: 'Çalım',
    duelsSub: 'İkili Mücadele',
    tabStats: 'Turnuva İstatistikleri',
    tabTransfers: 'Transfer Geçmişi',
    tabTrophies: 'Kupalar ve Başarılar',
    tabSidelined: 'Sakatlık Geçmişi',
    seasonLabel: 'Sezon:',
    currentSeason: 'Güncel',
    loadingDossier: 'Oyuncu profili, sezon istatistikleri, transferler ve kupalar yükleniyor:',
    errorSearchHint: 'Sağ üstteki arama kutusunu kullanarak oyuncuyu adıyla arayabilirsiniz.',
    seasonStatsTitle: 'Lig ve Turnuvalara Göre Sezon İstatistikleri',
    seasonStatsSub: 'Resmi profilini açmak için herhangi bir turnuvaya veya kulübe tıklayın',
    noStatsForSeason: 'Seçilen sezon için kayıtlı istatistik bulunamadı. Sağ üstten başka bir sezon seçin (örn. 2024/25).',
    thTournament: 'TURNUVA',
    thClub: 'KULÜP',
    thMatches: 'MAÇ (İLK 11)',
    thMinutes: 'DAKİKA',
    thGoals: 'GOL',
    thAssists: 'ASİST',
    thShots: 'ŞUT (İSABET)',
    thKeyPasses: 'KİLİT PAS',
    thDribbles: 'ÇALIM',
    thDuels: 'İKİLİ MÜC.',
    thCards: 'KARTLAR',
    thRating: 'PUAN',
    cardAttackTitle: '⚽ Hücum ve Bitiricilik',
    rowGoalsScored: 'Atılan Goller',
    rowGoalAssists: 'Asistler',
    rowShotsTotalOn: 'Toplam Şut / İsabetli Şut',
    rowShotAccuracy: 'Şut İsabet Oranı',
    rowPenaltiesScoredMissed: 'Penaltılar (Atılan / Kaçan)',
    cardPlaymakingTitle: '🎯 Oyun Kurma, Pas ve Çalım',
    rowTotalPasses: 'Toplam Pas',
    rowKeyPassesChances: 'Kilit Pas (Gol Pozisyonu)',
    rowDribblesSuccessAtt: 'Başarılı Çalım / Deneme',
    rowDribbleSuccessRate: 'Çalım Başarı Oranı',
    rowFoulsDrawn: 'Kazanılan Faul',
    cardDefenseTitle: '🛡️ Savunma, İkili Mücadele ve Disiplin',
    rowTacklesTotal: 'Top Çalma',
    rowInterceptions: 'Pas Arası',
    rowDuelsWon: 'Kazanılan İkili Mücadele',
    rowFoulsCommitted: 'Yapılan Faul',
    rowYellowRedCards: 'Sarı / Kırmızı Kartlar',
    transfersTitle: 'Tüm Transfer Geçmişi',
    transfersSub: 'Oyuncunun kariyerindeki tüm resmi transferler ve kiralamalar',
    noTransfers: 'Bu oyuncu için kayıtlı transfer bulunamadı.',
    fromClub: 'ESKİ KULÜP',
    toClub: 'YENİ KULÜP',
    transferDefault: 'Transfer',
    trophiesTitle: 'Kazanılan Kupalar ve Başarılar',
    trophiesSub: 'Oyuncunun kariyerindeki tüm şampiyonluklar, kupalar ve finaller',
    noTrophies: 'Bu oyuncu için kayıtlı kupa bulunamadı.',
    championBadge: 'Şampiyon',
    sidelinedTitle: 'Sakatlık ve Ceza Geçmişi',
    sidelinedSub: 'Tüm sakatlıkların ve cezaların kronolojik arşivi',
    noSidelined: 'Bu oyuncu için kayıtlı sakatlık bulunamadı.',
    officialAbsence: 'Resmi kayıtlı eksiklik',
    fromDate: 'Başlangıç:',
    toDate: 'Bitiş:',
    activeInjury: 'Aktif',
    posGK: 'Kaleci (GK)',
    posDF: 'Defans (DF)',
    posMF: 'Orta Saha (MF)',
    posFW: 'Forvet (FW)',
  },
  pl: {
    home: 'Start',
    back: '← Wstecz',
    searchPlaceholder: '🔍 Szukaj piłkarza po nazwisku...',
    searchingGlobal: 'Wyszukiwanie w globalnej bazie piłkarzy...',
    noPlayersFound: 'Nie znaleziono piłkarzy dla',
    injuredBadge: '🏥 Kontuzjowany / Poza kadrą',
    nationality: 'Narodowość',
    age: 'Wiek',
    yearsSuffix: 'l.',
    birthPlace: 'Miejsce urodzenia',
    height: 'Wzrost',
    weight: 'Waga',
    wonTrophies: 'zdobyte trofea',
    matchesStarter: 'MECZE (1. SKŁAD)',
    goalsAssists: 'GOLE / ASYSTY',
    shotsOnTarget: 'STRZAŁY (CELNE)',
    keyPasses: 'KLUCZOWE PODANIA',
    penScored: 'Karne',
    dribblesSub: 'Dryblingi',
    duelsSub: 'Pojedynki',
    tabStats: 'Statystyki w Rozgrywkach',
    tabTransfers: 'Historia Transferów',
    tabTrophies: 'Trofea i Sukcesy',
    tabSidelined: 'Kontuzje i Absencje',
    seasonLabel: 'Sezon:',
    currentSeason: 'Aktualny',
    loadingDossier: 'Ładowanie pełnego profilu, statystyk sezonowych, transferów i trofeów dla',
    errorSearchHint: 'Użyj wyszukiwarki w prawym górnym rogu, aby wyszukać piłkarza po nazwisku.',
    seasonStatsTitle: 'Statystyki Sezonowe według Lig i Rozgrywek',
    seasonStatsSub: 'Kliknij na rozgrywki lub klub, aby otworzyć ich oficjalny profil',
    noStatsForSeason: 'Brak zapisanych statystyk dla wybranego sezonu. Wybierz inny sezon z przycisków w prawym górnym rogu (np. 2024/25).',
    thTournament: 'ROZGRYWKI',
    thClub: 'KLUB',
    thMatches: 'MECZE (1. SKŁ.)',
    thMinutes: 'MINUTY',
    thGoals: 'GOLE',
    thAssists: 'ASYSTY',
    thShots: 'STRZAŁY (CEL.)',
    thKeyPasses: 'KLUCZ. POD.',
    thDribbles: 'DRYBLINGI',
    thDuels: 'POJEDYNKI',
    thCards: 'KARTKI',
    thRating: 'OCENA',
    cardAttackTitle: '⚽ Atak i Wykończenie',
    rowGoalsScored: 'Strzelone Gole',
    rowGoalAssists: 'Asysty Bramkowe',
    rowShotsTotalOn: 'Strzały Ogółem / Celne',
    rowShotAccuracy: 'Celność Strzałów',
    rowPenaltiesScoredMissed: 'Rzuty Karne (Trafione / Nietrafione)',
    cardPlaymakingTitle: '🎯 Rozegranie, Podania i Drybling',
    rowTotalPasses: 'Podania Ogółem',
    rowKeyPassesChances: 'Kluczowe Podania (Okazje)',
    rowDribblesSuccessAtt: 'Udane Dryblingi / Próby',
    rowDribbleSuccessRate: 'Skuteczność Dryblingów',
    rowFoulsDrawn: 'Wywalczone Faule',
    cardDefenseTitle: '🛡️ Obrona, Pojedynki i Dyscyplina',
    rowTacklesTotal: 'Odbiory Piłki',
    rowInterceptions: 'Przechwyty',
    rowDuelsWon: 'Wygrane Pojedynki',
    rowFoulsCommitted: 'Popełnione Faule',
    rowYellowRedCards: 'Żółte / Czerwone Kartki',
    transfersTitle: 'Pełna Historia Transferów',
    transfersSub: 'Wszystkie oficjalne transfery i wypożyczenia w karierze zawodnika (kliknij klub, aby otworzyć profil)',
    noTransfers: 'Brak zarejestrowanych transferów dla tego zawodnika.',
    fromClub: 'Z KLUBU',
    toClub: 'DO KLUBU',
    transferDefault: 'Transfer',
    trophiesTitle: 'Zdobyte Trofea i Sukcesy',
    trophiesSub: 'Wszystkie tytuły mistrzowskie, puchary i finały w karierze zawodnika',
    noTrophies: 'Brak zarejestrowanych trofeów dla tego zawodnika.',
    championBadge: 'Mistrz',
    sidelinedTitle: 'Historia Kontuzji i Zawieszeń',
    sidelinedSub: 'Chronologiczne archiwum wszystkich kontuzji i zawieszeń',
    noSidelined: 'Brak zarejestrowanych kontuzji dla tego zawodnika.',
    officialAbsence: 'Oficjalnie zarejestrowana absencja',
    fromDate: 'Od:',
    toDate: 'Do:',
    activeInjury: 'Aktywna',
    posGK: 'Bramkarz (GK)',
    posDF: 'Obrońca (DF)',
    posMF: 'Pomocnik (MF)',
    posFW: 'Napastnik (FW)',
  },
  el: {
    home: 'Αρχική',
    back: '← Πίσω',
    searchPlaceholder: '🔍 Αναζήτηση παίκτη...',
    searchingGlobal: 'Αναζήτηση στην παγκόσμια βάση παικτών...',
    noPlayersFound: 'Δεν βρέθηκαν παίκτες για',
    injuredBadge: '🏥 Τραυματίας / Εκτός',
    nationality: 'Εθνικότητα',
    age: 'Ηλικία',
    yearsSuffix: 'ετ.',
    birthPlace: 'Τόπος γέννησης',
    height: 'Ύψος',
    weight: 'Βάρος',
    wonTrophies: 'τρόπαια',
    matchesStarter: 'ΑΓΩΝΕΣ (ΒΑΣΙΚΟΣ)',
    goalsAssists: 'ΓΚΟΛ / ΑΣΙΣΤ',
    shotsOnTarget: 'ΣΟΥΤ (ΣΤΗΝ ΕΣΤΙΑ)',
    keyPasses: 'ΠΑΣΕΣ ΚΛΕΙΔΙΑ',
    penScored: 'Πέναλτι',
    dribblesSub: 'Ντρίμπλες',
    duelsSub: 'Μονομαχίες',
    tabStats: 'Στατιστικά ανά Διοργάνωση',
    tabTransfers: 'Ιστορικό Μεταγραφών',
    tabTrophies: 'Τρόπαια & Διακρίσεις',
    tabSidelined: 'Τραυματισμοί',
    seasonLabel: 'Σεζόν:',
    currentSeason: 'Τρέχουσα',
    loadingDossier: 'Φόρτωση πλήρους προφίλ, στατιστικών, μεταγραφών και τροπαίων για',
    errorSearchHint: 'Χρησιμοποιήστε την αναζήτηση πάνω δεξιά για να βρείτε παίκτη με λατινικούς χαρακτήρες.',
    seasonStatsTitle: 'Στατιστικά Σεζόν ανά Πρωτάθλημα & Διοργάνωση',
    seasonStatsSub: 'Κάντε κλικ σε διοργάνωση ή ομάδα για να ανοίξετε το επίσημο προφίλ',
    noStatsForSeason: 'Δεν υπάρχουν στατιστικά για την επιλεγμένη σεζόν. Επιλέξτε άλλη σεζόν πάνω δεξιά.',
    thTournament: 'ΔΙΟΡΓΑΝΩΣΗ',
    thClub: 'ΟΜΑΔΑ',
    thMatches: 'ΑΓ. (ΒΑΣ.)',
    thMinutes: 'ΛΕΠΤΑ',
    thGoals: 'ΓΚΟΛ',
    thAssists: 'ΑΣΙΣΤ',
    thShots: 'ΣΟΥΤ (ΕΣΤΙΑ)',
    thKeyPasses: 'ΠΑΣΕΣ ΚΛ.',
    thDribbles: 'ΝΤΡΙΜΠΛΕΣ',
    thDuels: 'ΜΟΝΟΜΑΧΙΕΣ',
    thCards: 'ΚΑΡΤΕΣ',
    thRating: 'ΒΑΘΜΟΣ',
    cardAttackTitle: '⚽ Επίθεση & Εκτέλεση',
    rowGoalsScored: 'Γκολ',
    rowGoalAssists: 'Ασίστ',
    rowShotsTotalOn: 'Συνολικά Σουτ / Στην Εστία',
    rowShotAccuracy: 'Ευστοχία Σουτ',
    rowPenaltiesScoredMissed: 'Πέναλτι (Εύστοχα / Άστοχα)',
    cardPlaymakingTitle: '🎯 Δημιουργία, Πάσες & Ντρίμπλες',
    rowTotalPasses: 'Συνολικές Πάσες',
    rowKeyPassesChances: 'Πάσες Κλειδιά (Ευκαιρίες)',
    rowDribblesSuccessAtt: 'Επιτυχημένες Ντρίμπλες / Προσπάθειες',
    rowDribbleSuccessRate: '% Επιτυχίας Ντρίμπλας',
    rowFoulsDrawn: 'Κερδισμένα Φάουλ',
    cardDefenseTitle: '🛡️ Άμυνα, Μονομαχίες & Πειθαρχία',
    rowTacklesTotal: 'Τάκλιν',
    rowInterceptions: 'Κλεψίματα',
    rowDuelsWon: 'Κερδισμένες Μονομαχίες',
    rowFoulsCommitted: 'Φάουλ',
    rowYellowRedCards: 'Κίτρινες / Κόκκινες Κάρτες',
    transfersTitle: 'Πλήρες Ιστορικό Μεταγραφών',
    transfersSub: 'Όλες οι επίσημες μεταγραφές και δανεισμοί στην καριέρα του παίκτη',
    noTransfers: 'Δεν υπάρχουν καταγεγραμμένες μεταγραφές.',
    fromClub: 'ΑΠΟ ΟΜΑΔΑ',
    toClub: 'ΣΕ ΟΜΑΔΑ',
    transferDefault: 'Μεταγραφή',
    trophiesTitle: 'Τρόπαια & Διακρίσεις',
    trophiesSub: 'Όλοι οι τίτλοι πρωταθλήματος, κύπελλα και τελικοί στην καριέρα του παίκτη',
    noTrophies: 'Δεν υπάρχουν καταγεγραμμένα τρόπαια.',
    championBadge: 'Πρωταθλητής',
    sidelinedTitle: 'Ιστορικό Τραυματισμών & Απουσιών',
    sidelinedSub: 'Χρονολογικό αρχείο όλων των τραυματισμών και τιμωριών',
    noSidelined: 'Δεν υπάρχουν καταγεγραμμένοι τραυματισμοί.',
    officialAbsence: 'Επίσημα καταγεγραμμένη απουσία',
    fromDate: 'Από:',
    toDate: 'Έως:',
    activeInjury: 'Ενεργός',
    posGK: 'Τερματοφύλακας (GK)',
    posDF: 'Αμυντικός (DF)',
    posMF: 'Μέσος (MF)',
    posFW: 'Επιθετικός (FW)',
  },
  ro: {
    home: 'Acasă',
    back: '← Înapoi',
    searchPlaceholder: '🔍 Caută orice jucător...',
    searchingGlobal: 'Se caută în baza globală de jucători...',
    noPlayersFound: 'Niciun jucător găsit pentru',
    injuredBadge: '🏥 Accidentat / Indisponibil',
    nationality: 'Naționalitate',
    age: 'Vârstă',
    yearsSuffix: 'ani',
    birthPlace: 'Locul nașterii',
    height: 'Înălțime',
    weight: 'Greutate',
    wonTrophies: 'trofee câștigate',
    matchesStarter: 'MECIURI (TITULAR)',
    goalsAssists: 'GOLURI / PASE DEC.',
    shotsOnTarget: 'ȘUTURI (PE POARTĂ)',
    keyPasses: 'PASE CHEIE',
    penScored: 'Penalty-uri',
    dribblesSub: 'Driblinguri',
    duelsSub: 'Dueluri',
    tabStats: 'Statistici pe Competiții',
    tabTransfers: 'Istoric Transferuri',
    tabTrophies: 'Trofee și Palmares',
    tabSidelined: 'Accidentări',
    seasonLabel: 'Sezon:',
    currentSeason: 'Actual',
    loadingDossier: 'Se încarcă profilul oficial, statisticile, transferurile și trofeele pentru',
    errorSearchHint: 'Folosește bara de căutare din dreapta sus pentru a căuta orice jucător.',
    seasonStatsTitle: 'Statistici Sezoniere pe Ligi și Competiții',
    seasonStatsSub: 'Apasă pe o competiție sau echipă pentru a deschide profilul oficial',
    noStatsForSeason: 'Nu există statistici pentru sezonul selectat. Alege alt sezon din dreapta sus (ex. 2024/25).',
    thTournament: 'COMPETIȚIE',
    thClub: 'CLUB',
    thMatches: 'MECIURI (TIT.)',
    thMinutes: 'MINUTE',
    thGoals: 'GOLURI',
    thAssists: 'PASE D.',
    thShots: 'ȘUTURI (POARTĂ)',
    thKeyPasses: 'PASE CHEIE',
    thDribbles: 'DRIBLINGURI',
    thDuels: 'DUELURI',
    thCards: 'CARTONAȘE',
    thRating: 'NOTĂ',
    cardAttackTitle: '⚽ Atac și Finalizare',
    rowGoalsScored: 'Goluri Marcate',
    rowGoalAssists: 'Pase de Gol',
    rowShotsTotalOn: 'Șuturi Totale / Pe Poartă',
    rowShotAccuracy: 'Precizia Șuturilor',
    rowPenaltiesScoredMissed: 'Penalty-uri (Marcate / Ratate)',
    cardPlaymakingTitle: '🎯 Creație, Pase și Dribling',
    rowTotalPasses: 'Pase Totale',
    rowKeyPassesChances: 'Pase Cheie (Ocazii Create)',
    rowDribblesSuccessAtt: 'Driblinguri Reușite / Încercări',
    rowDribbleSuccessRate: '% Reușită Dribling',
    rowFoulsDrawn: 'Faulturi Obținute',
    cardDefenseTitle: '🛡️ Apărare, Dueluri și Disciplină',
    rowTacklesTotal: 'Deposedări',
    rowInterceptions: 'Intercepții',
    rowDuelsWon: 'Dueluri Câștigate',
    rowFoulsCommitted: 'Faulturi Comise',
    rowYellowRedCards: 'Cartonașe Galbene / Roșii',
    transfersTitle: 'Istoric Complet al Transferurilor',
    transfersSub: 'Toate transferurile oficiale și împrumuturile din cariera jucătorului',
    noTransfers: 'Niciun transfer înregistrat pentru acest jucător.',
    fromClub: 'DE LA CLUBUL',
    toClub: 'LA CLUBUL',
    transferDefault: 'Transfer',
    trophiesTitle: 'Trofee și Palmares',
    trophiesSub: 'Toate titlurile de campion, cupele și finalele din carieră',
    noTrophies: 'Niciun trofeu înregistrat pentru acest jucător.',
    championBadge: 'Campion',
    sidelinedTitle: 'Istoric Accidentări și Suspendări',
    sidelinedSub: 'Arhiva cronologică a tuturor accidentărilor și suspendărilor',
    noSidelined: 'Nicio accidentare înregistrată pentru acest jucător.',
    officialAbsence: 'Absență înregistrată oficial',
    fromDate: 'De la:',
    toDate: 'Până la:',
    activeInjury: 'Activă',
    posGK: 'Portar (GK)',
    posDF: 'Fundaș (DF)',
    posMF: 'Mijlocaș (MF)',
    posFW: 'Atacant (FW)',
  },
  ru: {
    home: 'Главная',
    back: '← Назад',
    searchPlaceholder: '🔍 Поиск любого игрока по имени...',
    searchingGlobal: 'Поиск в глобальной базе игроков...',
    noPlayersFound: 'Игроки не найдены по запросу',
    injuredBadge: '🏥 Травмирован / Вне заявки',
    nationality: 'Национальность',
    age: 'Возраст',
    yearsSuffix: 'л.',
    birthPlace: 'Место рождения',
    height: 'Рост',
    weight: 'Вес',
    wonTrophies: 'завоеванных трофеев',
    matchesStarter: 'МАТЧИ (В СТАРТЕ)',
    goalsAssists: 'ГОЛЫ / АССИСТЫ',
    shotsOnTarget: 'УДАРЫ (В СТВОР)',
    keyPasses: 'КЛЮЧЕВЫЕ ПАСЫ',
    penScored: 'Пенальти',
    dribblesSub: 'Дриблинг',
    duelsSub: 'Единоборства',
    tabStats: 'Статистика по турнирам',
    tabTransfers: 'История трансферов',
    tabTrophies: 'Трофеи и награды',
    tabSidelined: 'Травмы и пропуски',
    seasonLabel: 'Сезон:',
    currentSeason: 'Текущий',
    loadingDossier: 'Загрузка полного досье, сезонной статистики, трансферов и трофеев:',
    errorSearchHint: 'Используйте поиск справа вверху, чтобы найти игрока по имени на латинице.',
    seasonStatsTitle: 'Сезонная статистика по лигам и турнирам',
    seasonStatsSub: 'Нажмите на турнир или клуб, чтобы открыть его официальный профиль',
    noStatsForSeason: 'Нет статистики за выбранный сезон. Выберите другой сезон справа вверху (напр. 2024/25).',
    thTournament: 'ТУРНИР',
    thClub: 'КЛУБ',
    thMatches: 'МАТЧИ (СТАРТ)',
    thMinutes: 'МИНУТЫ',
    thGoals: 'ГОЛЫ',
    thAssists: 'АССИСТЫ',
    thShots: 'УДАРЫ (СТВОР)',
    thKeyPasses: 'КЛЮЧ. ПАСЫ',
    thDribbles: 'ДРИБЛИНГ',
    thDuels: 'ДУЭЛИ',
    thCards: 'КАРТОЧКИ',
    thRating: 'РЕЙТИНГ',
    cardAttackTitle: '⚽ Атака и Завершение',
    rowGoalsScored: 'Забитые голы',
    rowGoalAssists: 'Голевые передачи',
    rowShotsTotalOn: 'Всего ударов / В створ',
    rowShotAccuracy: 'Точность ударов',
    rowPenaltiesScoredMissed: 'Пенальти (Забито / Не забито)',
    cardPlaymakingTitle: '🎯 Созидание, Пасы и Дриблинг',
    rowTotalPasses: 'Всего передач',
    rowKeyPassesChances: 'Ключевые пасы (Голевые моменты)',
    rowDribblesSuccessAtt: 'Успешный дриблинг / Попытки',
    rowDribbleSuccessRate: '% Успешного дриблинга',
    rowFoulsDrawn: 'Заработано фолов',
    cardDefenseTitle: '🛡️ Защита, Единоборства и Дисциплина',
    rowTacklesTotal: 'Отборы мяча',
    rowInterceptions: 'Перехваты',
    rowDuelsWon: 'Выигранные единоборства',
    rowFoulsCommitted: 'Совершено фолов',
    rowYellowRedCards: 'Желтые / Красные карточки',
    transfersTitle: 'Полная история трансферов',
    transfersSub: 'Все официальные переходы и аренды в карьере игрока (нажмите на клуб для просмотра профиля)',
    noTransfers: 'Нет зарегистрированных трансферов для этого игрока.',
    fromClub: 'ИЗ КЛУБА',
    toClub: 'В КЛУБ',
    transferDefault: 'Трансфер',
    trophiesTitle: 'Трофеи и титулы',
    trophiesSub: 'Все чемпионские титулы, кубки и финалы в карьере игрока',
    noTrophies: 'Нет зарегистрированных трофеев для этого игрока.',
    championBadge: 'Чемпион',
    sidelinedTitle: 'История травм и дисквалификаций',
    sidelinedSub: 'Хронологический архив всех травм, болезней и дисквалификаций',
    noSidelined: 'Нет зарегистрированных травм для этого игрока.',
    officialAbsence: 'Официально зарегистрированный пропуск',
    fromDate: 'С:',
    toDate: 'По:',
    activeInjury: 'Активна',
    posGK: 'Вратарь (GK)',
    posDF: 'Защитник (DF)',
    posMF: 'Полузащитник (MF)',
    posFW: 'Нападающий (FW)',
  },
};

function formatDateByLang(dateStr: string, lang: Language): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  const d = String(parsed.getDate()).padStart(2, '0');
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const y = parsed.getFullYear();
  return lang === 'bg' ? `${d}.${m}.${y} г.` : `${d}.${m}.${y}`;
}

function formatHeight(val?: string | null): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  return /^\d+$/.test(trimmed) ? `${trimmed} cm` : trimmed;
}

function formatWeight(val?: string | null): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  return /^\d+$/.test(trimmed) ? `${trimmed} kg` : trimmed;
}

export const PlayerDetailPage: React.FC<PlayerDetailPageProps> = ({
  language = 'bg',
  target,
  onBack,
  onOpenLeague,
}) => {
  const pt = PLAYER_DICT[language] || PLAYER_DICT.en;
  const [intel, setIntel] = useState<PlayerIntelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>('stats');
  const [selectedSeason, setSelectedSeason] = useState<string>('auto');

  // Inline global player search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PlayerSearchHit[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);

  const translatePosition = (pos: string): string => {
    const p = pos.toLowerCase();
    if (p.includes('goal') || p === 'gk') return pt.posGK;
    if (p.includes('def') || p === 'df') return pt.posDF;
    if (p.includes('mid') || p === 'mf') return pt.posMF;
    if (p.includes('att') || p.includes('forw') || p === 'fw') return pt.posFW;
    return pos;
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPlayerIntel = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams();
        if (target.playerId) params.set('playerId', String(target.playerId));
        if (target.playerName) params.set('name', target.playerName);
        if (target.teamId) params.set('teamId', String(target.teamId));
        if (target.leagueId) params.set('leagueId', String(target.leagueId));
        if (selectedSeason !== 'auto') params.set('season', selectedSeason);

        const res = await fetch(`/api/football/player-intel?${params.toString()}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to load player profile');
        }
        const data: PlayerIntelResponse = await res.json();
        if (!cancelled) {
          setIntel(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Error loading player data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlayerIntel();
    return () => {
      cancelled = true;
    };
  }, [target.playerId, target.playerName, target.teamId, target.leagueId, selectedSeason]);

  // Debounced global player search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/football/player-search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!cancelled) {
          setSearchResults(Array.isArray(data?.players) ? data.players : []);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 320);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const player = intel?.player;
  const totals = intel?.totals || intel?.summary || null;
  const statistics = intel?.statistics || intel?.competitions || [];
  const transfers = intel?.transfers || [];
  const trophies = intel?.trophies || [];
  const sidelined = intel?.sidelined || [];

  const displayName = player?.name || target.playerName;
  const displayFullName =
    player?.firstname && player?.lastname
      ? `${player.firstname} ${player.lastname}`
      : displayName;
  const displayPhoto = player?.photo || target.playerPhoto || '';
  const displayPosition = player?.position || target.position || '';
  const displayNumber = player?.number ?? target.number ?? null;
  const currentTeamId =
    player?.currentTeam?.id || intel?.primaryTeam?.id || target.teamId || null;
  const currentTeamName =
    player?.currentTeam?.name || intel?.primaryTeam?.name || target.teamName || '';
  const currentTeamLogo =
    player?.currentTeam?.logo || intel?.primaryTeam?.logo || target.teamLogo || '';

  const displayHeight = formatHeight(player?.height);
  const displayWeight = formatWeight(player?.weight);

  const wonTrophiesCount = trophies.filter(
    (t) => t.place.toLowerCase().includes('winner') || t.place.includes('1')
  ).length;

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 0 64px',
      }}
    >
      {/* Top Breadcrumb + Inline Global Player Search + Back button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#8f9cae',
            flexWrap: 'wrap',
          }}
        >
          <span
            onClick={onBack}
            style={{
              cursor: 'pointer',
              color: '#cbd5e1',
            }}
          >
            {pt.home}
          </span>
          {currentTeamName && (
            <>
              <span>›</span>
              <span
                onClick={(e) =>
                  openTeamProfile(
                    {
                      teamId: currentTeamId || undefined,
                      teamName: currentTeamName,
                      teamLogo: currentTeamLogo || undefined,
                      leagueId: target.leagueId,
                      leagueName: target.leagueName,
                    },
                    e
                  )
                }
                style={{
                  cursor: 'pointer',
                  color: '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                {currentTeamLogo && (
                  <img
                    src={currentTeamLogo}
                    alt=""
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                  />
                )}
                {currentTeamName}
              </span>
            </>
          )}
          <span>›</span>
          <span style={{ color: '#ffffff', fontWeight: 800 }}>{displayName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Inline Global Player Search */}
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 200)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              placeholder={pt.searchPlaceholder}
              style={{
                width: '100%',
                background: '#0b111a',
                border: '1px solid #182434',
                borderRadius: '10px',
                padding: '8px 13px',
                color: '#f7f8fb',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            {searchDropdownOpen && searchQuery.trim().length >= 3 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  left: 0,
                  background: '#0b131e',
                  border: '1px solid #1f3147',
                  borderRadius: '12px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
                  zIndex: 60,
                  maxHeight: '340px',
                  overflowY: 'auto',
                  padding: '6px',
                }}
              >
                {searching ? (
                  <div
                    style={{
                      padding: '12px',
                      fontSize: '12px',
                      color: '#8f9cae',
                      textAlign: 'center',
                    }}
                  >
                    {pt.searchingGlobal}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div
                    style={{
                      padding: '12px',
                      fontSize: '12px',
                      color: '#8f9cae',
                      textAlign: 'center',
                    }}
                  >
                    {pt.noPlayersFound} „{searchQuery}“ (Saka, Haaland, Despodov)
                  </div>
                ) : (
                  searchResults.map((hit) => (
                    <div
                      key={hit.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchDropdownOpen(false);
                        setSearchQuery('');
                        openPlayerProfile({
                          playerId: hit.id,
                          playerName: hit.name,
                          playerPhoto: hit.photo,
                          position: hit.position,
                          number: hit.number,
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {hit.photo ? (
                        <img
                          src={hit.photo}
                          alt={hit.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            background: '#111c2a',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#111c2a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          ⚽
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {hit.name}
                          {hit.number ? (
                            <span
                              style={{
                                marginLeft: '6px',
                                fontSize: '11px',
                                color: '#43f08a',
                                fontFamily: 'monospace',
                              }}
                            >
                              #{hit.number}
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8f9cae' }}>
                          {[
                            hit.position ? translatePosition(hit.position) : '',
                            hit.nationality,
                            hit.age ? `${hit.age} ${pt.yearsSuffix}` : '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={onBack}
            style={{
              background: '#0b111a',
              border: '1px solid #182434',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#cbd5e1',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {pt.back}
          </button>
        </div>
      </div>

      {/* Hero Bio Card */}
      <div
        style={{
          background:
            'linear-gradient(135deg, #0b131e 0%, #0d1b2a 60%, rgba(67,240,138,0.08) 100%)',
          border: '1px solid #182434',
          borderRadius: '18px',
          padding: '28px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 14px 36px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
          {/* Player Portrait with Jersey Badge */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '104px',
                height: '104px',
                borderRadius: '50%',
                background: '#111c2a',
                border: '2px solid #43f08a',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              }}
            >
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#43f08a' }}>
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {displayNumber !== null && displayNumber !== undefined && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: '#43f08a',
                  color: '#04130b',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '2px solid #0b131e',
                }}
              >
                #{displayNumber}
              </div>
            )}
          </div>

          {/* Bio Details */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '8px',
              }}
            >
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {displayFullName}
              </h1>

              {displayPosition && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56,189,248,0.14)',
                    border: '1px solid rgba(56,189,248,0.35)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                  }}
                >
                  {translatePosition(displayPosition)}
                </span>
              )}

              {totals?.avgRating && (
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    color: '#04130b',
                    background:
                      Number(totals.avgRating) >= 7.2
                        ? '#43f08a'
                        : Number(totals.avgRating) >= 6.8
                        ? '#f59e0b'
                        : '#94A3B8',
                    padding: '3px 9px',
                    borderRadius: '6px',
                  }}
                >
                  ★ {Number(totals.avgRating).toFixed(2)}
                </span>
              )}

              {player?.injured && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#f87171',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    padding: '3px 9px',
                    borderRadius: '6px',
                  }}
                >
                  {pt.injuredBadge}
                </span>
              )}
            </div>

            {/* First Row of Bio Pills: Current Club, Nationality, Age, Birthdate */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                fontSize: '13px',
                color: '#cbd5e1',
                marginBottom: '8px',
              }}
            >
              {currentTeamName && (
                <span
                  onClick={(e) =>
                    openTeamProfile(
                      {
                        teamId: currentTeamId || undefined,
                        teamName: currentTeamName,
                        teamLogo: currentTeamLogo || undefined,
                      },
                      e
                    )
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1e2f44',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {currentTeamLogo && (
                    <img
                      src={currentTeamLogo}
                      alt=""
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                  )}
                  {currentTeamName}
                </span>
              )}

              {player?.nationality && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1a2738',
                  }}
                >
                  🌍 {pt.nationality}:{' '}
                  <strong style={{ color: '#ffffff' }}>{player.nationality}</strong>
                </span>
              )}

              {player?.age && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1a2738',
                  }}
                >
                  🎂 {pt.age}: <strong style={{ color: '#ffffff' }}>{player.age} {pt.yearsSuffix}</strong>
                  {player.birthDate ? ` (${formatDateByLang(player.birthDate, language)})` : ''}
                </span>
              )}
            </div>

            {/* Second Row of Bio Pills: Birthplace, Height, Weight, Career Trophies */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                fontSize: '12px',
                color: '#cbd5e1',
              }}
            >
              {(player?.birthPlace || player?.birthCountry) && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1a2738',
                  }}
                >
                  📍 {pt.birthPlace}:{' '}
                  <strong style={{ color: '#ffffff' }}>
                    {[player.birthPlace, player.birthCountry].filter(Boolean).join(', ')}
                  </strong>
                </span>
              )}

              {displayHeight && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1a2738',
                  }}
                >
                  📏 {pt.height}: <strong style={{ color: '#ffffff' }}>{displayHeight}</strong>
                </span>
              )}

              {displayWeight && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1a2738',
                  }}
                >
                  ⚖️ {pt.weight}: <strong style={{ color: '#ffffff' }}>{displayWeight}</strong>
                </span>
              )}

              {wonTrophiesCount > 0 && (
                <span
                  onClick={() => setActiveTab('trophies')}
                  style={{
                    background: 'rgba(245,158,11,0.14)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245,158,11,0.4)',
                    color: '#fbbf24',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🏆 {wonTrophiesCount} {pt.wonTrophies}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right KPI Quick Stats Summary */}
        {totals && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(118px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                background: '#080e16',
                border: '1px solid #182434',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#8f9cae', marginBottom: '4px', fontWeight: 700 }}>
                {pt.matchesStarter}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#ffffff',
                }}
              >
                {totals.appearances}{' '}
                <span style={{ fontSize: '13px', color: '#8f9cae' }}>({totals.lineups})</span>
              </div>
              <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                {totals.minutes.toLocaleString()} min
              </div>
            </div>

            <div
              style={{
                background: '#080e16',
                border: '1px solid #182434',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#8f9cae', marginBottom: '4px', fontWeight: 700 }}>
                {pt.goalsAssists}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#43f08a',
                }}
              >
                {totals.goals} <span style={{ color: '#8f9cae', fontSize: '14px' }}>/</span>{' '}
                <span style={{ color: '#38bdf8' }}>{totals.assists}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#8f9cae', marginTop: '4px' }}>
                {pt.penScored}: {totals.penaltiesScored}
              </div>
            </div>

            <div
              style={{
                background: '#080e16',
                border: '1px solid #182434',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#8f9cae', marginBottom: '4px', fontWeight: 700 }}>
                {pt.shotsOnTarget}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#ffffff',
                }}
              >
                {totals.shotsTotal}{' '}
                <span style={{ fontSize: '13px', color: '#43f08a' }}>
                  ({totals.shotsOn})
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#8f9cae', marginTop: '4px' }}>
                {pt.dribblesSub}: {totals.dribblesSuccess}/{totals.dribblesAttempts}
              </div>
            </div>

            <div
              style={{
                background: '#080e16',
                border: '1px solid #182434',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#8f9cae', marginBottom: '4px', fontWeight: 700 }}>
                {pt.keyPasses}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: '#fbbf24',
                }}
              >
                {totals.passesKey}
              </div>
              <div style={{ fontSize: '11px', color: '#8f9cae', marginTop: '4px' }}>
                {pt.duelsSub}: {totals.duelsWon}/{totals.duelsTotal}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs + Season Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '22px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {[
            {
              id: 'stats' as SubTab,
              label: `📊 ${pt.tabStats} (${statistics.length})`,
            },
            {
              id: 'transfers' as SubTab,
              label: `🔄 ${pt.tabTransfers} (${transfers.length})`,
            },
            {
              id: 'trophies' as SubTab,
              label: `🏆 ${pt.tabTrophies} (${trophies.length})`,
            },
            {
              id: 'sidelined' as SubTab,
              label: `🏥 ${pt.tabSidelined} (${sidelined.length})`,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? '#22c55e' : '#0b111a',
                  color: isActive ? '#04130b' : '#cbd5e1',
                  border: `1px solid ${isActive ? '#43f08a' : '#182434'}`,
                  borderRadius: '12px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Season Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#8f9cae', fontWeight: 700 }}>
            {pt.seasonLabel}
          </span>
          {[
            {
              key: 'auto',
              label: intel?.season
                ? `${pt.currentSeason} (${intel.season}/${String(intel.season + 1).slice(-2)})`
                : pt.currentSeason,
            },
            { key: '2025', label: '2025/26' },
            { key: '2024', label: '2024/25' },
            { key: '2023', label: '2023/24' },
          ].map((s) => {
            const isSel = selectedSeason === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSelectedSeason(s.key)}
                style={{
                  background: isSel ? 'rgba(67,240,138,0.16)' : '#0b111a',
                  color: isSel ? '#43f08a' : '#cbd5e1',
                  border: `1px solid ${isSel ? '#43f08a' : '#182434'}`,
                  borderRadius: '8px',
                  padding: '6px 11px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error states */}
      {loading && (
        <div
          style={{
            background: '#0b111a',
            border: '1px solid #182434',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            color: '#cbd5e1',
          }}
        >
          {pt.loadingDossier}{' '}
          <strong style={{ color: '#43f08a' }}>{displayName}</strong>...
        </div>
      )}

      {!loading && errorMsg && (
        <div
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            color: '#F87171',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
            {errorMsg}
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
            {pt.errorSearchHint}
          </div>
        </div>
      )}

      {/* TAB 1: COMPETITION STATISTICS */}
      {!loading && !errorMsg && activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Table Across Competitions */}
          <div
            style={{
              background: '#0b111a',
              border: '1px solid #182434',
              borderRadius: '16px',
              padding: '22px',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  {pt.seasonStatsTitle} (
                  {intel?.season ? `${intel.season}/${String(intel.season + 1).slice(-2)}` : pt.currentSeason})
                </div>
                <div style={{ fontSize: '12px', color: '#8f9cae' }}>
                  {pt.seasonStatsSub}
                </div>
              </div>
            </div>

            {statistics.length === 0 ? (
              <div
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  color: '#8f9cae',
                  fontSize: '13px',
                }}
              >
                {pt.noStatsForSeason}
              </div>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid #182434',
                      color: '#8f9cae',
                      fontSize: '11px',
                      textAlign: 'left',
                    }}
                  >
                    <th style={{ padding: '10px 8px' }}>{pt.thTournament}</th>
                    <th style={{ padding: '10px 8px' }}>{pt.thClub}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thMatches}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thMinutes}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thGoals}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thAssists}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thShots}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thKeyPasses}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thDribbles}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thDuels}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thCards}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>{pt.thRating}</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((st, idx) => (
                    <tr
                      key={`${st.leagueId}-${st.teamId}-${idx}`}
                      style={{
                        borderBottom: '1px solid #141f2e',
                      }}
                    >
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>
                        <div
                          onClick={() => {
                            if (st.leagueId && onOpenLeague) {
                              onOpenLeague(st.leagueId, st.leagueName, st.leagueCountry);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: st.leagueId && onOpenLeague ? 'pointer' : 'default',
                            color: '#ffffff',
                          }}
                        >
                          {st.leagueLogo && (
                            <img
                              src={st.leagueLogo}
                              alt=""
                              style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                            />
                          )}
                          <div>
                            <div>{st.leagueName || '—'}</div>
                            {st.leagueCountry && (
                              <div style={{ fontSize: '10px', color: '#8f9cae', fontWeight: 500 }}>
                                {st.leagueCountry}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <div
                          onClick={(e) =>
                            st.teamName &&
                            openTeamProfile(
                              {
                                teamId: st.teamId || undefined,
                                teamName: st.teamName,
                                teamLogo: st.teamLogo || undefined,
                                leagueId: st.leagueId || undefined,
                                leagueName: st.leagueName || undefined,
                              },
                              e
                            )
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            color: '#cbd5e1',
                            fontWeight: 600,
                          }}
                        >
                          {st.teamLogo && (
                            <img
                              src={st.teamLogo}
                              alt=""
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                            />
                          )}
                          {st.teamName || '—'}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {st.appearances}{' '}
                        <span style={{ color: '#8f9cae', fontWeight: 400 }}>
                          ({st.lineups})
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#cbd5e1',
                        }}
                      >
                        {st.minutes}'
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: st.goals > 0 ? '#43f08a' : '#8f9cae',
                        }}
                      >
                        {st.goals}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: st.assists > 0 ? '#38bdf8' : '#8f9cae',
                        }}
                      >
                        {st.assists}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#ffffff',
                        }}
                      >
                        {st.shotsTotal}{' '}
                        <span style={{ color: '#43f08a' }}>({st.shotsOn})</span>
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#fbbf24',
                          fontWeight: 700,
                        }}
                      >
                        {st.passesKey}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#cbd5e1',
                        }}
                      >
                        {st.dribblesSuccess}/{st.dribblesAttempts}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#cbd5e1',
                        }}
                      >
                        {st.duelsWon}/{st.duelsTotal}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                        }}
                      >
                        <span style={{ color: '#FACC15', fontWeight: 700 }}>
                          🟨 {st.yellowCards}
                        </span>{' '}
                        <span style={{ color: '#EF4444', fontWeight: 700, marginLeft: '4px' }}>
                          🟥 {st.redCards}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                        }}
                      >
                        {st.rating ? (
                          <span
                            style={{
                              background:
                                Number(st.rating) >= 7.2
                                  ? 'rgba(67,240,138,0.16)'
                                  : 'rgba(255,255,255,0.06)',
                              color:
                                Number(st.rating) >= 7.2 ? '#43f08a' : '#ffffff',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {Number(st.rating).toFixed(2)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detailed Quantitative Breakdown Cards (Attacking, Passing, Defensive, Discipline) */}
          {totals && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Card 1: Attacking & Finishing */}
              <div
                style={{
                  background: '#0b111a',
                  border: '1px solid #182434',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#43f08a',
                    marginBottom: '14px',
                  }}
                >
                  {pt.cardAttackTitle}
                </div>
                {[
                  { label: pt.rowGoalsScored, value: totals.goals },
                  { label: pt.rowGoalAssists, value: totals.assists },
                  { label: pt.rowShotsTotalOn, value: `${totals.shotsTotal} / ${totals.shotsOn}` },
                  {
                    label: pt.rowShotAccuracy,
                    value:
                      totals.shotsTotal > 0
                        ? `${Math.round((totals.shotsOn / totals.shotsTotal) * 100)}%`
                        : '0%',
                  },
                  {
                    label: pt.rowPenaltiesScoredMissed,
                    value: `${totals.penaltiesScored} / ${totals.penaltiesMissed}`,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < 4 ? '1px solid #141f2e' : 'none',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#cbd5e1' }}>{row.label}</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card 2: Playmaking & Dribbles */}
              <div
                style={{
                  background: '#0b111a',
                  border: '1px solid #182434',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#38bdf8',
                    marginBottom: '14px',
                  }}
                >
                  {pt.cardPlaymakingTitle}
                </div>
                {[
                  { label: pt.rowTotalPasses, value: totals.passesTotal.toLocaleString() },
                  { label: pt.rowKeyPassesChances, value: totals.passesKey },
                  {
                    label: pt.rowDribblesSuccessAtt,
                    value: `${totals.dribblesSuccess} / ${totals.dribblesAttempts}`,
                  },
                  {
                    label: pt.rowDribbleSuccessRate,
                    value:
                      totals.dribblesAttempts > 0
                        ? `${Math.round((totals.dribblesSuccess / totals.dribblesAttempts) * 100)}%`
                        : '0%',
                  },
                  { label: pt.rowFoulsDrawn, value: totals.foulsDrawn },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < 4 ? '1px solid #141f2e' : 'none',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#cbd5e1' }}>{row.label}</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card 3: Defensive & Duels */}
              <div
                style={{
                  background: '#0b111a',
                  border: '1px solid #182434',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#fbbf24',
                    marginBottom: '14px',
                  }}
                >
                  {pt.cardDefenseTitle}
                </div>
                {[
                  { label: pt.rowTacklesTotal, value: totals.tacklesTotal },
                  { label: pt.rowInterceptions, value: totals.interceptions },
                  {
                    label: pt.rowDuelsWon,
                    value: `${totals.duelsWon} / ${totals.duelsTotal} (${
                      totals.duelsTotal > 0
                        ? Math.round((totals.duelsWon / totals.duelsTotal) * 100)
                        : 0
                    }%)`,
                  },
                  { label: pt.rowFoulsCommitted, value: totals.foulsCommitted },
                  {
                    label: pt.rowYellowRedCards,
                    value: `${totals.yellowCards} 🟨 / ${totals.redCards} 🟥`,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < 4 ? '1px solid #141f2e' : 'none',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#cbd5e1' }}>{row.label}</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSFERS HISTORY */}
      {!loading && !errorMsg && activeTab === 'transfers' && (
        <div
          style={{
            background: '#0b111a',
            border: '1px solid #182434',
            borderRadius: '16px',
            padding: '22px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              {pt.transfersTitle} ({transfers.length})
            </div>
            <div style={{ fontSize: '12px', color: '#8f9cae' }}>
              {pt.transfersSub}
            </div>
          </div>

          {transfers.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: '#8f9cae',
                fontSize: '13px',
              }}
            >
              {pt.noTransfers}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transfers.map((tr, idx) => (
                <div
                  key={`${tr.date}-${idx}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr 40px 1fr 150px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#080e16',
                    border: '1px solid #15202e',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    📅 {formatDateByLang(tr.date, language)}
                  </div>

                  {/* Team Out */}
                  <div
                    onClick={(e) =>
                      tr.teamOut.name &&
                      openTeamProfile(
                        {
                          teamId: tr.teamOut.id || undefined,
                          teamName: tr.teamOut.name,
                          teamLogo: tr.teamOut.logo || undefined,
                        },
                        e
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: tr.teamOut.name ? 'pointer' : 'default',
                    }}
                  >
                    {tr.teamOut.logo && (
                      <img
                        src={tr.teamOut.logo}
                        alt=""
                        style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '10px', color: '#8f9cae' }}>{pt.fromClub}</div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {tr.teamOut.name || '—'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      color: '#43f08a',
                      fontSize: '16px',
                      fontWeight: 800,
                    }}
                  >
                    →
                  </div>

                  {/* Team In */}
                  <div
                    onClick={(e) =>
                      tr.teamIn.name &&
                      openTeamProfile(
                        {
                          teamId: tr.teamIn.id || undefined,
                          teamName: tr.teamIn.name,
                          teamLogo: tr.teamIn.logo || undefined,
                        },
                        e
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: tr.teamIn.name ? 'pointer' : 'default',
                    }}
                  >
                    {tr.teamIn.logo && (
                      <img
                        src={tr.teamIn.logo}
                        alt=""
                        style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '10px', color: '#8f9cae' }}>{pt.toClub}</div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#43f08a',
                        }}
                      >
                        {tr.teamIn.name || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Type / Fee */}
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(67,240,138,0.12)',
                        color: '#43f08a',
                        border: '1px solid rgba(67,240,138,0.3)',
                      }}
                    >
                      {tr.type || pt.transferDefault}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TROPHIES & HONOURS */}
      {!loading && !errorMsg && activeTab === 'trophies' && (
        <div
          style={{
            background: '#0b111a',
            border: '1px solid #182434',
            borderRadius: '16px',
            padding: '22px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              {pt.trophiesTitle} ({trophies.length})
            </div>
            <div style={{ fontSize: '12px', color: '#8f9cae' }}>
              {pt.trophiesSub}
            </div>
          </div>

          {trophies.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: '#8f9cae',
                fontSize: '13px',
              }}
            >
              {pt.noTrophies}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {trophies.map((tr, idx) => {
                const isWinner =
                  tr.place.toLowerCase().includes('winner') || tr.place.includes('1');
                return (
                  <div
                    key={`${tr.league}-${tr.season}-${idx}`}
                    style={{
                      background: isWinner
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, #080e16 100%)'
                        : '#080e16',
                      border: `1px solid ${
                        isWinner ? 'rgba(245,158,11,0.38)' : '#15202e'
                      }`,
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>{isWinner ? '🏆' : '🥈'}</div>
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#ffffff',
                          }}
                        >
                          {tr.league}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8f9cae' }}>
                          {[tr.country, tr.season].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isWinner
                          ? 'rgba(245,158,11,0.2)'
                          : 'rgba(255,255,255,0.06)',
                        color: isWinner ? '#fbbf24' : '#cbd5e1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isWinner ? pt.championBadge : tr.place}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SIDELINED / INJURIES HISTORY */}
      {!loading && !errorMsg && activeTab === 'sidelined' && (
        <div
          style={{
            background: '#0b111a',
            border: '1px solid #182434',
            borderRadius: '16px',
            padding: '22px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              {pt.sidelinedTitle} ({sidelined.length})
            </div>
            <div style={{ fontSize: '12px', color: '#8f9cae' }}>
              {pt.sidelinedSub}
            </div>
          </div>

          {sidelined.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: '#8f9cae',
                fontSize: '13px',
              }}
            >
              {pt.noSidelined}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sidelined.map((sd, idx) => (
                <div
                  key={`${sd.start}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#080e16',
                    border: '1px solid #15202e',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>🏥</span>
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {sd.type}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8f9cae' }}>
                        {pt.officialAbsence}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#cbd5e1',
                    }}
                  >
                    <span>
                      {pt.fromDate} <strong style={{ color: '#ffffff' }}>{formatDateByLang(sd.start, language)}</strong>
                    </span>
                    <span>→</span>
                    <span>
                      {pt.toDate}{' '}
                      <strong style={{ color: '#ffffff' }}>
                        {sd.end ? formatDateByLang(sd.end, language) : pt.activeInjury}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
