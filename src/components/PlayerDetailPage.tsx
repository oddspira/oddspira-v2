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

const POSITION_BG_LABELS: Record<string, string> = {
  Goalkeeper: 'Вратар (GK)',
  Defender: 'Защитник (DF)',
  Midfielder: 'Полузащитник (MF)',
  Attacker: 'Нападател (FW)',
};

const PLAYER_DICT: Record<
  Language,
  {
    home: string;
    back: string;
    searchPlaceholder: string;
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
    tabStats: string;
    tabTransfers: string;
    tabTrophies: string;
    tabSidelined: string;
    seasonLabel: string;
    currentSeason: string;
  }
> = {
  bg: {
    home: 'Начало',
    back: '← Назад',
    searchPlaceholder: '🔍 Потърси всеки футболист по име...',
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
    tabStats: 'Статистика по турнири',
    tabTransfers: 'Трансферна история',
    tabTrophies: 'Трофеи и отличия',
    tabSidelined: 'Контузии и отсъствия',
    seasonLabel: 'Сезон:',
    currentSeason: 'Актуален',
  },
  en: {
    home: 'Home',
    back: '← Back',
    searchPlaceholder: '🔍 Search any player by name...',
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
    tabStats: 'Competition Stats',
    tabTransfers: 'Transfer History',
    tabTrophies: 'Trophies & Honours',
    tabSidelined: 'Injuries & Sidelined',
    seasonLabel: 'Season:',
    currentSeason: 'Current',
  },
  es: {
    home: 'Inicio',
    back: '← Volver',
    searchPlaceholder: '🔍 Buscar cualquier jugador...',
    nationality: 'Nacionalidad',
    age: 'Edad',
    yearsSuffix: 'a.',
    birthPlace: 'Lugar de nacimiento',
    height: 'Altura',
    weight: 'Peso',
    wonTrophies: 'trofeos ganados',
    matchesStarter: 'PARTIDOS (TITULAR)',
    goalsAssists: 'GOLES / ASISTENCIAS',
    shotsOnTarget: 'TIROS (A PUERTA)',
    keyPasses: 'PASES CLAVE',
    tabStats: 'Estadísticas por Torneo',
    tabTransfers: 'Historial de Fichajes',
    tabTrophies: 'Trofeos y Palmarés',
    tabSidelined: 'Lesiones y Bajas',
    seasonLabel: 'Temporada:',
    currentSeason: 'Actual',
  },
  de: {
    home: 'Start',
    back: '← Zurück',
    searchPlaceholder: '🔍 Spieler nach Namen suchen...',
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
    tabStats: 'Wettbewerbs-Statistik',
    tabTransfers: 'Transferhistorie',
    tabTrophies: 'Titel & Erfolge',
    tabSidelined: 'Verletzungen',
    seasonLabel: 'Saison:',
    currentSeason: 'Aktuell',
  },
  it: {
    home: 'Home',
    back: '← Indietro',
    searchPlaceholder: '🔍 Cerca qualsiasi giocatore...',
    nationality: 'Nazionalità',
    age: 'Età',
    yearsSuffix: 'a.',
    birthPlace: 'Luogo di nascita',
    height: 'Altezza',
    weight: 'Peso',
    wonTrophies: 'trofei vinti',
    matchesStarter: 'PRESENZE (TITOLARE)',
    goalsAssists: 'GOL / ASSIST',
    shotsOnTarget: 'TIRI (IN PORTA)',
    keyPasses: 'PASSAGGI CHIAVE',
    tabStats: 'Statistiche per Torneo',
    tabTransfers: 'Storico Trasferimenti',
    tabTrophies: 'Trofei e Palmarès',
    tabSidelined: 'Infortuni e Assenze',
    seasonLabel: 'Stagione:',
    currentSeason: 'Attuale',
  },
  pt: {
    home: 'Início',
    back: '← Voltar',
    searchPlaceholder: '🔍 Pesquisar qualquer jogador...',
    nationality: 'Nacionalidade',
    age: 'Idade',
    yearsSuffix: 'a.',
    birthPlace: 'Local de nascimento',
    height: 'Altura',
    weight: 'Peso',
    wonTrophies: 'troféus conquistados',
    matchesStarter: 'JOGOS (TITULAR)',
    goalsAssists: 'GOLS / ASSISTÊNCIAS',
    shotsOnTarget: 'CHUTES (NO GOL)',
    keyPasses: 'PASSES DECISIVOS',
    tabStats: 'Estatísticas por Torneio',
    tabTransfers: 'Histórico de Transferências',
    tabTrophies: 'Troféus e Títulos',
    tabSidelined: 'Lesões e Ausências',
    seasonLabel: 'Temporada:',
    currentSeason: 'Atual',
  },
  fr: {
    home: 'Accueil',
    back: '← Retour',
    searchPlaceholder: '🔍 Rechercher un joueur...',
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
    tabStats: 'Stats par Compétition',
    tabTransfers: 'Historique des Transferts',
    tabTrophies: 'Trophées et Palmarès',
    tabSidelined: 'Blessures et Absences',
    seasonLabel: 'Saison :',
    currentSeason: 'Actuelle',
  },
  tr: {
    home: 'Ana Sayfa',
    back: '← Geri',
    searchPlaceholder: '🔍 Oyuncu adına göre ara...',
    nationality: 'Uyruk',
    age: 'Yaş',
    yearsSuffix: 'y.',
    birthPlace: 'Doğum Yeri',
    height: 'Boy',
    weight: 'Kilo',
    wonTrophies: 'kazanılan kupa',
    matchesStarter: 'MAÇLAR (İLK 11)',
    goalsAssists: 'GOL / ASİST',
    shotsOnTarget: 'ŞUT (İSABETLİ)',
    keyPasses: 'KİLİT PAS',
    tabStats: 'Turnuva İstatistikleri',
    tabTransfers: 'Transfer Geçmişi',
    tabTrophies: 'Kupalar ve Başarılar',
    tabSidelined: 'Sakatlık Geçmişi',
    seasonLabel: 'Sezon:',
    currentSeason: 'Güncel',
  },
  pl: {
    home: 'Start',
    back: '← Wstecz',
    searchPlaceholder: '🔍 Szukaj piłkarza po nazwisku...',
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
    tabStats: 'Statystyki w Rozgrywkach',
    tabTransfers: 'Historia Transferów',
    tabTrophies: 'Trofea i Sukcesy',
    tabSidelined: 'Kontuzje i Absencje',
    seasonLabel: 'Sezon:',
    currentSeason: 'Aktualny',
  },
  el: {
    home: 'Αρχική',
    back: '← Πίσω',
    searchPlaceholder: '🔍 Αναζήτηση παίκτη...',
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
    tabStats: 'Στατιστικά ανά Διοργάνωση',
    tabTransfers: 'Ιστορικό Μεταγραφών',
    tabTrophies: 'Τρόπαια & Διακρίσεις',
    tabSidelined: 'Τραυματισμοί',
    seasonLabel: 'Σεζόν:',
    currentSeason: 'Τρέχουσα',
  },
  ro: {
    home: 'Acasă',
    back: '← Înapoi',
    searchPlaceholder: '🔍 Caută orice jucător...',
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
    tabStats: 'Statistici pe Competiții',
    tabTransfers: 'Istoric Transferuri',
    tabTrophies: 'Trofee și Palmares',
    tabSidelined: 'Accidentări',
    seasonLabel: 'Sezon:',
    currentSeason: 'Actual',
  },
  ru: {
    home: 'Главная',
    back: '← Назад',
    searchPlaceholder: '🔍 Поиск любого игрока по имени...',
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
    tabStats: 'Статистика по турнирам',
    tabTransfers: 'История трансферов',
    tabTrophies: 'Трофеи и награды',
    tabSidelined: 'Травмы и пропуски',
    seasonLabel: 'Сезон:',
    currentSeason: 'Текущий',
  },
};

function formatDateBg(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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
          throw new Error(errJson.error || 'Неуспешно зареждане на профила на футболиста');
        }
        const data: PlayerIntelResponse = await res.json();
        if (!cancelled) {
          setIntel(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Възникна грешка при зареждане на данните за футболиста.');
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
                    Търсене в глобалната база от футболисти...
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
                    Няма намерени футболисти за „{searchQuery}“ (пишете на латиница, напр. Saka, Haaland, Despodov)
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
                            hit.position,
                            hit.nationality,
                            hit.age ? `${hit.age} г.` : '',
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
                  {POSITION_BG_LABELS[displayPosition] || displayPosition}
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
                  title="Среден официален рейтинг за сезона"
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
                  🏥 Контузен / Извън групата
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
                  title="Отвори профила на клуба"
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
                  {player.birthDate ? ` (${formatDateBg(player.birthDate)})` : ''}
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
                Pen: {totals.penaltiesScored}
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
                Dribbles: {totals.dribblesSuccess}/{totals.dribblesAttempts}
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
                Duels: {totals.duelsWon}/{totals.duelsTotal}
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
          Зареждане на пълно досие, сезонна статистика, трансфери и трофеи за{' '}
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
            Можете да използвате търсачката горе вдясно, за да потърсите футболиста по официалното му име на латиница.
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
                  Сезонна статистика по първенства и турнири (
                  {intel?.season ? `${intel.season}/${String(intel.season + 1).slice(-2)}` : 'Актуален'})
                </div>
                <div style={{ fontSize: '12px', color: '#8f9cae' }}>
                  Кликни върху турнир или отбор, за да отвориш техния официален профил
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
                Няма записана статистика за избрания сезон. Избери друг сезон от бутоните горе вдясно (напр. 2024/25 или 2023/24).
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
                    <th style={{ padding: '10px 8px' }}>ТУРНИР</th>
                    <th style={{ padding: '10px 8px' }}>КЛУБ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>МАЧОВЕ (ТИТ.)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>МИНУТИ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>ГОЛОВЕ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>АСИСТ.</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>УДАРИ (ТОЧНИ)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>КЛЮЧ. ПАСОВЕ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>ДРИБЪЛИ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>ЕДИНОБОРСТВА</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>КАРТОНИ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>РЕЙТИНГ</th>
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
                            <div>{st.leagueName || 'Турнир'}</div>
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
                  ⚽ Атака & Завършващ удар
                </div>
                {[
                  { label: 'Отбелязани голове', value: totals.goals },
                  { label: 'Голови асистенции', value: totals.assists },
                  { label: 'Общо удари / Точни удари', value: `${totals.shotsTotal} / ${totals.shotsOn}` },
                  {
                    label: 'Точност на ударите',
                    value:
                      totals.shotsTotal > 0
                        ? `${Math.round((totals.shotsOn / totals.shotsTotal) * 100)}%`
                        : '0%',
                  },
                  {
                    label: 'Дузпи (Вкарани / Пропуснати)',
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
                  🎯 Креативност, Пасове & Дрибъл
                </div>
                {[
                  { label: 'Общо пасове', value: totals.passesTotal.toLocaleString() },
                  { label: 'Ключови пасове (Голови положения)', value: totals.passesKey },
                  {
                    label: 'Успешни дрибъли / Опити',
                    value: `${totals.dribblesSuccess} / ${totals.dribblesAttempts}`,
                  },
                  {
                    label: 'Успеваемост при дрибъл',
                    value:
                      totals.dribblesAttempts > 0
                        ? `${Math.round((totals.dribblesSuccess / totals.dribblesAttempts) * 100)}%`
                        : '0%',
                  },
                  { label: 'Спечелени фалове', value: totals.foulsDrawn },
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
                  🛡️ Защита, Единоборства & Дисциплина
                </div>
                {[
                  { label: 'Шпагати / Отнети топки', value: totals.tacklesTotal },
                  { label: 'Пресечени пасове (Interceptions)', value: totals.interceptions },
                  {
                    label: 'Спечелени единоборства',
                    value: `${totals.duelsWon} / ${totals.duelsTotal} (${
                      totals.duelsTotal > 0
                        ? Math.round((totals.duelsWon / totals.duelsTotal) * 100)
                        : 0
                    }%)`,
                  },
                  { label: 'Извършени нарушения', value: totals.foulsCommitted },
                  {
                    label: 'Жълти / Червени картони',
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
              Пълна трансферна история ({transfers.length})
            </div>
            <div style={{ fontSize: '12px', color: '#8f9cae' }}>
              Всички официални трансфери и наеми в кариерата на футболиста (кликни върху отбор за неговия профил)
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
              Няма регистрирани трансфери за този футболист.
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
                    📅 {formatDateBg(tr.date)}
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
                      <div style={{ fontSize: '10px', color: '#8f9cae' }}>ОТ КЛУБ</div>
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
                      <div style={{ fontSize: '10px', color: '#8f9cae' }}>В КЛУБ</div>
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
                      {tr.type || 'Трансфер'}
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
              Спечелени трофеи и отличия ({trophies.length})
            </div>
            <div style={{ fontSize: '12px', color: '#8f9cae' }}>
              Всички шампионски титли, купи и финали в кариерата на футболиста
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
              Няма регистрирани трофеи и финали за този футболист.
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
                      {isWinner ? 'Шампион' : tr.place}
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
              История на контузиите и наказанията ({sidelined.length})
            </div>
            <div style={{ fontSize: '12px', color: '#8f9cae' }}>
              Хронологичен архив на всички контузии, заболявания и дисциплинарни наказания
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
              Няма регистрирани контузии или наказания за този футболист.
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
                        Официално регистрирано отсъствие
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
                      От: <strong style={{ color: '#ffffff' }}>{formatDateBg(sd.start)}</strong>
                    </span>
                    <span>→</span>
                    <span>
                      До:{' '}
                      <strong style={{ color: '#ffffff' }}>
                        {sd.end ? formatDateBg(sd.end) : 'Активна'}
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
