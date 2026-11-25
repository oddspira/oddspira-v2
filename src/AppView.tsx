/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActiveTab, BetRecord, Language, Match, SelectedTeamTarget, SelectedPlayerTarget } from './types';
import { initialBets, initialMatches } from './data/mockMatches';
import { Header } from './components/Header';
import { registerMatchLogos } from './components/TeamBadge';
import { HeroShowcase } from './components/HeroShowcase';
import { HomeBentoGrid } from './components/HomeBentoGrid';
import { LiveMatchesBoard } from './components/LiveMatchesBoard';
import { CompetitionsView } from './components/CompetitionsView';
import { MasterAnalysisDashboard } from './components/MasterAnalysisDashboard';
import { PoissonEngine } from './components/PoissonEngine';
import { CalculatorsHub } from './components/CalculatorsHub';
import { BankrollTracker } from './components/BankrollTracker';
import { LearnView } from './components/LearnView';
import { VipSection } from './components/VipSection';
import { SearchModal } from './components/SearchModal';
import { JoinOddspiraModal, UserProfile } from './components/JoinOddspiraModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AdminControlModal } from './components/AdminControlModal';
import {
  LegalComplianceModal,
  CookieConsentBanner,
  LegalTab,
} from './components/LegalComplianceModal';
import { MatchDetailPage } from './components/MatchDetailPage';
import { TeamDetailPage } from './components/TeamDetailPage';
import { PlayerDetailPage } from './components/PlayerDetailPage';
import { Footer } from './components/Footer';

export default function AppView() {
  const [language, setLanguage] = useState<Language>('bg');
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/analysis')) return 'analysis';
    if (path.startsWith('/live')) return 'live';
    if (path.startsWith('/leagues') || path.startsWith('/competitions')) return 'competitions';
    if (path.startsWith('/bets')) return 'bets';
    if (path.startsWith('/tools')) return 'tools';
    return 'home';
  });
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedCustomMatch, setSelectedCustomMatch] = useState<Match | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<SelectedTeamTarget | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayerTarget | null>(null);
  const [initialLeagueTarget, setInitialLeagueTarget] = useState<{
    leagueKey?: string;
    leagueId?: number;
    leagueName?: string;
  } | null>(null);
  const [initialTool, setInitialTool] = useState<
    'ev' | 'poisson' | 'novig' | 'kelly' | 'dutching'
  >('ev');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const cached = localStorage.getItem('oddspira_live_matches_v8');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          registerMatchLogos(parsed);
          return parsed;
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    registerMatchLogos(initialMatches);
    return initialMatches;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authenticated User & Token State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('oddspira_token');
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [adminUnlockedViaUrl] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === '1';
  });

  const OWNER_EMAILS = ['oddspira@gmail.com', 'golemboi9@gmail.com'];
  const isOwnerAdmin =
    adminUnlockedViaUrl ||
    Boolean(
      currentUser &&
        (currentUser.role === 'admin' ||
          OWNER_EMAILS.includes(currentUser.email.trim().toLowerCase()))
    );

  // Secret Owner Keyboard Shortcut: Ctrl + Shift + A opens Admin Panel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const tabToPath = (tab: ActiveTab): string => {
    const routeMap: Partial<Record<ActiveTab, string>> = {
      home: '/',
      live: '/live',
      competitions: '/leagues',
      analysis: '/analysis',
      bets: '/bets',
      tools: '/tools',
      learn: '/guides',
    };
    return routeMap[tab] || '/';
  };

  // Helper to hydrate deep-linked /match/:id from server if not in live matches array
  const hydrateDeepLinkedMatch = (rawMatchId: string) => {
    const cleanNum = rawMatchId.replace(/^api-/, '');
    const fullId = /^\d+$/.test(cleanNum) ? `api-${cleanNum}` : rawMatchId;
    setSelectedMatchId(fullId);

    const existing = matches.find(
      (m) => m.id === fullId || m.id === rawMatchId || m.id.replace(/^api-/, '') === cleanNum
    );
    if (existing) {
      setSelectedCustomMatch(existing);
      return;
    }

    fetch(`/api/football/match-intel/${encodeURIComponent(cleanNum)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.found) {
          const hydrated: Match = {
            id: data.fixtureId || fullId,
            leagueId: data.leagueId,
            league: data.league || 'Football',
            leagueCountry: data.leagueCountry || '',
            leagueRound: data.leagueRound || undefined,
            homeTeamId: data.homeTeamId,
            awayTeamId: data.awayTeamId,
            homeTeam: data.homeTeam || 'Home',
            awayTeam: data.awayTeam || 'Away',
            homeLogo: data.homeLogo,
            awayLogo: data.awayLogo,
            homeScore: Number(data.homeScore ?? 0),
            awayScore: Number(data.awayScore ?? 0),
            halftimeScore: data.halftimeScore,
            status: data.status || 'SCHEDULED',
            minute: data.minute,
            startTime: data.date || '20:00',
            bookmakerOdds: data.liveBookmakerOdds || { home: 2.1, draw: 3.4, away: 3.3 },
            fairOdds: {
              homeProb: 0.46,
              drawProb: 0.27,
              awayProb: 0.27,
              fairHomeOdds: 2.17,
              fairDrawOdds: 3.7,
              fairAwayOdds: 3.7,
              over25Prob: 0.54,
              under25Prob: 0.46,
              bttsProb: 0.52,
              expectedGoalsHome: 1.52,
              expectedGoalsAway: 1.18,
            },
            venue: data.venue || undefined,
            referee: data.referee || undefined,
            hasRealStats: data.hasRealStats,
            events: [],
            stats: data.stats || {
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
            },
          };
          registerMatchLogos([hydrated]);
          setSelectedCustomMatch(hydrated);
        }
      })
      .catch(() => {});
  };

  // Parse initial URL & browser Back/Forward (popstate) for /player/:id, /team/:id, /match/:id
  useEffect(() => {
    const syncStateFromLocation = () => {
      const path = window.location.pathname;
      const lower = path.toLowerCase();

      const playerMatch = path.match(/^\/player\/([^/?#]+)/i);
      if (playerMatch) {
        const rawParam = decodeURIComponent(playerMatch[1]);
        const isNum = /^\d+$/.test(rawParam);
        setSelectedTeam(null);
        setSelectedMatchId(null);
        setSelectedCustomMatch(null);
        setSelectedPlayer({
          playerId: isNum ? Number(rawParam) : undefined,
          playerName: isNum ? `Player #${rawParam}` : rawParam,
        });
        return;
      }

      const teamMatch = path.match(/^\/team\/([^/?#]+)/i);
      if (teamMatch) {
        const rawParam = decodeURIComponent(teamMatch[1]);
        const isNum = /^\d+$/.test(rawParam);
        setSelectedPlayer(null);
        setSelectedMatchId(null);
        setSelectedCustomMatch(null);
        setSelectedTeam({
          teamId: isNum ? Number(rawParam) : undefined,
          teamName: isNum ? `Club #${rawParam}` : rawParam,
        });
        return;
      }

      const matchUrlMatch = path.match(/^\/match\/([^/?#]+)/i);
      if (matchUrlMatch) {
        const rawParam = decodeURIComponent(matchUrlMatch[1]);
        setSelectedPlayer(null);
        setSelectedTeam(null);
        hydrateDeepLinkedMatch(rawParam);
        return;
      }

      // Standard Top-Level Section Routes
      setSelectedPlayer(null);
      setSelectedTeam(null);
      setSelectedMatchId(null);
      setSelectedCustomMatch(null);
      if (lower.startsWith('/analysis')) setActiveTab('analysis');
      else if (lower.startsWith('/live')) setActiveTab('live');
      else if (lower.startsWith('/leagues') || lower.startsWith('/competitions')) setActiveTab('competitions');
      else if (lower.startsWith('/bets')) setActiveTab('bets');
      else if (lower.startsWith('/tools')) setActiveTab('tools');
      else if (lower.startsWith('/guides') || lower.startsWith('/learn')) setActiveTab('learn');
      else setActiveTab('home');
    };

    syncStateFromLocation();
    window.addEventListener('popstate', syncStateFromLocation);
    return () => window.removeEventListener('popstate', syncStateFromLocation);
  }, []);

  // Global listeners for opening a dedicated Team Profile page, Player Profile page, Competition League, or Calculator Tool
  useEffect(() => {
    const onOpenTeamEvent = (e: Event) => {
      const custom = e as CustomEvent<SelectedTeamTarget>;
      if (custom.detail && (custom.detail.teamName || custom.detail.teamId)) {
        setSelectedPlayer(null);
        setSelectedTeam(custom.detail);
        const slug = custom.detail.teamId
          ? String(custom.detail.teamId)
          : encodeURIComponent(custom.detail.teamName);
        const targetUrl = `/team/${slug}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, '', targetUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    const onOpenPlayerEvent = (e: Event) => {
      const custom = e as CustomEvent<SelectedPlayerTarget>;
      if (custom.detail && (custom.detail.playerName || custom.detail.playerId)) {
        setSelectedPlayer(custom.detail);
        const slug = custom.detail.playerId
          ? String(custom.detail.playerId)
          : encodeURIComponent(custom.detail.playerName);
        const targetUrl = `/player/${slug}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, '', targetUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    const onOpenLeagueEvent = (e: Event) => {
      const custom = e as CustomEvent<{
        leagueKey?: string;
        leagueId?: number;
        leagueName?: string;
      }>;
      if (custom.detail) {
        setInitialLeagueTarget({ ...custom.detail });
        setSelectedPlayer(null);
        setSelectedTeam(null);
        setSelectedMatchId(null);
        setSelectedCustomMatch(null);
        setActiveTab('competitions');
        if (window.location.pathname !== '/leagues') {
          window.history.pushState({}, '', '/leagues');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    const onOpenToolEvent = (e: Event) => {
      const custom = e as CustomEvent<{
        toolKey: 'ev' | 'poisson' | 'novig' | 'kelly' | 'dutching';
      }>;
      if (custom.detail?.toolKey) {
        setInitialTool(custom.detail.toolKey);
        setSelectedPlayer(null);
        setSelectedTeam(null);
        setSelectedMatchId(null);
        setSelectedCustomMatch(null);
        setActiveTab('tools');
        if (window.location.pathname !== '/tools') {
          window.history.pushState({}, '', '/tools');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('oddspira:open-team', onOpenTeamEvent);
    window.addEventListener('oddspira:open-player', onOpenPlayerEvent);
    window.addEventListener('oddspira:open-league', onOpenLeagueEvent);
    window.addEventListener('oddspira:open-tool', onOpenToolEvent);
    return () => {
      window.removeEventListener('oddspira:open-team', onOpenTeamEvent);
      window.removeEventListener('oddspira:open-player', onOpenPlayerEvent);
      window.removeEventListener('oddspira:open-league', onOpenLeagueEvent);
      window.removeEventListener('oddspira:open-tool', onOpenToolEvent);
    };
  }, []);

  // Hydrate Live & Today's Matches from API-Football v3 when FOOTBALL_API_KEY is configured on server
  useEffect(() => {
    let active = true;
    const loadLiveFootballFeed = () => {
      fetch('/api/football/live-feed')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.configured && Array.isArray(data.matches) && data.matches.length > 0) {
            registerMatchLogos(data.matches);
            setMatches(data.matches);
            try {
              localStorage.setItem('oddspira_live_matches_v8', JSON.stringify(data.matches));
            } catch {
              // ignore storage quota errors
            }
          }
        })
        .catch(() => {});
    };

    loadLiveFootballFeed();
    const timer = setInterval(loadLiveFootballFeed, 180 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Bankroll Bets State with LocalStorage + SQL Server Sync
  const [bets, setBets] = useState<BetRecord[]>(() => {
    const saved = localStorage.getItem('oddspira_bets_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialBets;
      }
    }
    return initialBets;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Restore session & load user's bets from SQL database on startup
  useEffect(() => {
    if (!authToken) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          return fetch('/api/bets', {
            headers: { Authorization: `Bearer ${authToken}` },
          });
        }
        return null;
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((betData) => {
        if (betData && Array.isArray(betData.bets) && betData.bets.length > 0) {
          setBets(betData.bets);
        }
      })
      .catch(() => {
        localStorage.removeItem('oddspira_token');
        setAuthToken(null);
        setCurrentUser(null);
      });
  }, [authToken]);

  // Persist bets locally and sync to server SQL database when logged in
  useEffect(() => {
    localStorage.setItem('oddspira_bets_v2', JSON.stringify(bets));
    if (authToken && currentUser) {
      fetch('/api/bets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ bets }),
      }).catch(() => {});
    }
  }, [bets, authToken, currentUser]);

  const handleAuthSuccess = (user: UserProfile, token: string, isNewUser: boolean) => {
    localStorage.setItem('oddspira_token', token);
    setAuthToken(token);
    setCurrentUser(user);

    if (isNewUser) {
      // Sync current bets into the newly created user's SQL account
      fetch('/api/bets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bets }),
      }).catch(() => {});
      showToast(
        language === 'bg'
          ? `✓ Успешна регистрация! Добре дошли в Oddspira, ${user.name}!`
          : `✓ Welcome to Oddspira, ${user.name}!`
      );
    } else {
      showToast(
        language === 'bg'
          ? `✓ Добре дошли отново, ${user.name}!`
          : `✓ Welcome back, ${user.name}!`
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('oddspira_token');
    setAuthToken(null);
    setCurrentUser(null);
    showToast(
      language === 'bg'
        ? '✓ Излязохте успешно от профила си.'
        : '✓ Signed out successfully.'
    );
  };

  const handleTabChange = (tab: ActiveTab) => {
    setSelectedMatchId(null);
    setSelectedCustomMatch(null);
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setActiveTab(tab);
    const nextPath = tabToPath(tab);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMatchPage = (match: Match) => {
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setSelectedMatchId(match.id);
    setSelectedCustomMatch(match);
    const rawSlug = String(match.id || '').replace(/^api-/, '');
    const targetUrl = `/match/${encodeURIComponent(rawSlug)}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeDetailMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId) || selectedCustomMatch || null
    : null;

  // Dynamic Client-Side SEO & OpenGraph Meta Tag Updater
  useEffect(() => {
    const isBg = language === 'bg';
    const isRu = language === 'ru';
    const seoTitles: Partial<Record<ActiveTab, string>> = isBg
      ? {
          home: 'Oddspira — Математически Спортен Анализ, +EV Скенер & Кели Калкулатор',
          live: 'Мачове на Живо & +EV Коефициенти в Реално Време | Oddspira',
          competitions: 'Футболни Първенства & xG Рейтинги на Отборите | Oddspira',
          analysis: 'Интерактивен Център за Мач Анализ, Тактическо Игрище & 5D Радар | Oddspira',
          bets: 'Моите Залози & Автоматизирано Управление на Банката | Oddspira',
          tools: 'Калкулатори за Залози: Поасон, No-Vig, Критерий на Кели & Дъчинг | Oddspira',
          learn: 'Quant Академия: Научи +EV, Модела на Поасон, Dixon-Coles & CLV | Oddspira',
        }
      : isRu
      ? {
          home: 'Oddspira — Количественный спортивный анализ, +EV сканер & Калькулятор Келли',
          live: 'Лайв-матчи & +EV коэффициенты в реальном времени | Oddspira',
          competitions: 'Футбольные лиги, таблицы & xG рейтинги | Oddspira',
          analysis: 'Центр анализа матчей, Тактическое поле & 5D Радар | Oddspira',
          bets: 'Мои ставки & Управление банком | Oddspira',
          tools: 'Калькуляторы ставок: Пуассон, No-Vig, Критерий Келли & Датчинг | Oddspira',
          learn: 'Quant Академия: +EV, модель Пуассона, Dixon-Coles & CLV | Oddspira',
        }
      : {
          home: 'Oddspira — Quantitative Sports Analytics, +EV Scanner & Kelly Calculator',
          live: 'Live Matches & Real-Time +EV Odds | Oddspira',
          competitions: 'Football Leagues, Standings & Team xG Ratings | Oddspira',
          analysis: 'Interactive Match Analysis Hub, Tactical Pitch & 5D Radar | Oddspira',
          bets: 'My Bets & Automated Bankroll Tracker | Oddspira',
          tools: 'Betting Calculators: Poisson, No-Vig, Kelly Criterion & Dutching | Oddspira',
          learn: 'Quant Academy: Master +EV, Poisson Model, Dixon-Coles & CLV | Oddspira',
        };

    const playerSuffix: Record<Language, string> = {
      bg: 'Официален Профил, Сезонна Статистика, Трансфери & Трофеи',
      en: 'Official Profile, Season Stats, Transfers & Trophies',
      es: 'Perfil Oficial, Estadísticas, Fichajes y Trofeos',
      de: 'Offizielles Profil, Saisonstatistik, Transfers & Titel',
      it: 'Profilo Ufficiale, Statistiche, Trasferimenti e Trofei',
      pt: 'Perfil Oficial, Estatísticas, Transferências e Troféus',
      fr: 'Profil Officiel, Statistiques, Transferts et Trophées',
      tr: 'Resmi Profil, Sezon İstatistikleri, Transferler ve Kupalar',
      pl: 'Oficjalny Profil, Statystyki Sezonowe, Transfery i Trofea',
      el: 'Επίσημο Προφίλ, Στατιστικά, Μεταγραφές & Τρόπαια',
      ro: 'Profil Oficial, Statistici, Transferuri și Trofee',
      ru: 'Официальный профиль, статистика, трансферы и трофеи',
    };

    const teamSuffix: Record<Language, string> = {
      bg: 'Официален Профил, Класиране, Играчи & Статистика',
      en: 'Official Club Profile, Standings, Squad & Stats',
      es: 'Perfil Oficial del Club, Clasificación y Plantilla',
      de: 'Offizielles Vereinsprofil, Tabelle, Kader & Statistik',
      it: 'Profilo Ufficiale Club, Classifica, Rosa e Statistiche',
      pt: 'Perfil Oficial do Clube, Classificação e Elenco',
      fr: 'Profil Officiel du Club, Classement, Effectif et Stats',
      tr: 'Resmi Kulüp Profili, Puan Durumu, Kadro ve İstatistikler',
      pl: 'Oficjalny Profil Klubu, Tabela, Kadra i Statystyki',
      el: 'Επίσημο Προφίλ Ομάδας, Βαθμολογία & Ρόστερ',
      ro: 'Profil Oficial Club, Clasament, Lot și Statistici',
      ru: 'Официальный профиль клуба, таблица, состав и статистика',
    };

    const nextTitle = selectedPlayer
      ? `${selectedPlayer.playerName} — ${playerSuffix[language] || playerSuffix.en} | Oddspira`
      : selectedTeam
      ? `${selectedTeam.teamName} — ${teamSuffix[language] || teamSuffix.en} | Oddspira`
      : activeDetailMatch
      ? `${activeDetailMatch.homeTeam} vs ${activeDetailMatch.awayTeam} — +EV & Poisson Analysis | Oddspira`
      : seoTitles[activeTab] || seoTitles.home!;

    document.title = nextTitle;
    document.documentElement.lang = language;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', nextTitle);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', nextTitle);

    const canonical = document.getElementById('canonical-link');
    if (canonical) {
      canonical.setAttribute('href', window.location.origin + window.location.pathname);
    }
  }, [activeTab, activeDetailMatch, selectedTeam, selectedPlayer, language]);

  const handleLogBetFromMatch = (
    match: Match,
    selection: string,
    odds: number,
    ev: number,
    market: string = 'Full Time Result',
    stake: number = 50
  ) => {
    const newBet: BetRecord = {
      id: `bet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      fixtureId: match.id,
      market,
      selection,
      odds,
      stake,
      modelFairProb: Number(((1 / odds) * (1 + ev / 100)).toFixed(2)),
      evPercent: ev,
      status: 'PENDING',
      pnl: 0,
    };

    setBets((prev) => [newBet, ...prev]);
    const toastDict: Record<Language, string> = {
      bg: `✓ Добавен залог: ${selection} (@${odds.toFixed(2)}) директно в Моите залози!`,
      en: `✓ Bet added: ${selection} (@${odds.toFixed(2)}) directly to My Bets!`,
      es: `✓ Apuesta añadida: ${selection} (@${odds.toFixed(2)}) en Mis Apuestas!`,
      de: `✓ Wette hinzugefügt: ${selection} (@${odds.toFixed(2)}) in Meine Wetten!`,
      it: `✓ Scommessa aggiunta: ${selection} (@${odds.toFixed(2)}) in Le Mie Scommesse!`,
      pt: `✓ Aposta adicionada: ${selection} (@${odds.toFixed(2)}) em Minhas Apostas!`,
      fr: `✓ Pari ajouté : ${selection} (@${odds.toFixed(2)}) dans Mes Paris !`,
      tr: `✓ Bahis eklendi: ${selection} (@${odds.toFixed(2)}) Bahislerim bölümüne kaydedildi!`,
      pl: `✓ Dodano zakład: ${selection} (@${odds.toFixed(2)}) do Moje Zakłady!`,
      el: `✓ Προστέθηκε στοίχημα: ${selection} (@${odds.toFixed(2)}) στα Στοιχήματά μου!`,
      ro: `✓ Pariu adăugat: ${selection} (@${odds.toFixed(2)}) în Pariurile Mele!`,
      ru: `✓ Ставка добавлена: ${selection} (@${odds.toFixed(2)}) в Мои Ставки!`,
    };
    showToast(toastDict[language] || toastDict.en);
  };

  // Automatic & On-Demand Bet Settlement Engine
  const handleAutoSettleBets = async (silent: boolean = false): Promise<number> => {
    const hasPending = bets.some((b) => b.status === 'PENDING');
    if (!hasPending) {
      if (!silent) {
        showToast(
          language === 'bg'
            ? '✓ Няма чакащи (PENDING) залози за автоматично уреждане.'
            : '✓ No PENDING bets waiting for auto-settlement.'
        );
      }
      return 0;
    }

    try {
      const finishedMatches = matches
        .filter((m) => m.status === 'FINISHED')
        .map((m) => ({
          id: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
        }));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch('/api/bets/auto-settle', {
        method: 'POST',
        headers,
        body: JSON.stringify({ bets, finishedMatches }),
      });

      if (!res.ok) return 0;
      const data = await res.json();
      if (data?.ok && Number(data.settledCount) > 0 && Array.isArray(data.bets)) {
        setBets(data.bets);
        const count = Number(data.settledCount);
        showToast(
          language === 'bg'
            ? `⚡ Автоматично уредени ${count} завършили залога (PnL & ROI са обновени)!`
            : `⚡ Auto-settled ${count} finished bet(s) (PnL & ROI updated)!`
        );
        return count;
      } else if (!silent) {
        showToast(
          language === 'bg'
            ? 'ℹ Все още няма приключили мачове за чакащите ви залози.'
            : 'ℹ No finished matches found yet for your pending bets.'
        );
      }
    } catch {
      // ignore network error
    }
    return 0;
  };

  // Automatically check and settle PENDING bets whenever live matches feed updates
  useEffect(() => {
    const hasPending = bets.some((b) => b.status === 'PENDING');
    if (!hasPending) return;
    const timer = setTimeout(() => {
      handleAutoSettleBets(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [matches.length]);

  const handleNewsletterSubscribe = async (email: string) => {
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignore network error and still confirm to user
    }
    showToast((subscribeToastLabels[language] || subscribeToastLabels.en)(email));
  };

  const isHomeTab = activeTab === 'home';
  const isLiveTab = activeTab === 'live' || activeTab === 'matches';

  const subscribeToastLabels: Record<Language, (email: string) => string> = {
    bg: (email) => `✓ Успешен абонамент за седмичните +EV анализи (${email})!`,
    en: (email) => `✓ Subscribed to weekly +EV value picks (${email})!`,
    es: (email) => `✓ Suscrito a las selecciones +EV semanales (${email})!`,
    de: (email) => `✓ Erfolgreich für wöchentliche +EV-Picks angemeldet (${email})!`,
    it: (email) => `✓ Iscritto alle selezioni +EV settimanali (${email})!`,
    pt: (email) => `✓ Inscrito nas seleções +EV semanais (${email})!`,
    fr: (email) => `✓ Abonné aux sélections +EV hebdomadaires (${email}) !`,
    tr: (email) => `✓ Haftalık +EV analiz bültenine abone olundu (${email})!`,
    pl: (email) => `✓ Zapisano do cotygodniowych analiz +EV (${email})!`,
    el: (email) => `✓ Επιτυχής εγγραφή στις εβδομαδιαίες +EV αναλύσεις (${email})!`,
    ro: (email) => `✓ Abonat cu succes la analizele săptămânale +EV (${email})!`,
    ru: (email) => `✓ Вы подписаны на еженедельные +EV разборы (${email})!`,
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#070b11] text-[#f7f8fb] selection:bg-[#43f08a] selection:text-[#070b11] font-sans antialiased">
      {/* Top Bar with user-specified menu order and aesthetics */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        language={language}
        setLanguage={setLanguage}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenAdmin={isOwnerAdmin ? () => setIsAdminOpen(true) : undefined}
        currentUser={currentUser}
        onLogout={handleLogout}
        matches={matches}
        onOpenMatch={handleOpenMatchPage}
      />

      {/* Hero Showcase (displayed ONLY on the Main Homepage 'home' when no match, team, or player page is open) */}
      {isHomeTab && !activeDetailMatch && !selectedTeam && !selectedPlayer && (
        <HeroShowcase
          language={language}
          setActiveTab={handleTabChange}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />
      )}

      {/* Primary Workspace Viewport (Identical max-w-[1440px] container matching Hero and Navbar) */}
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0">
        {/* Main Section Content */}
        <div>
          {/* Dedicated Player Profile Page when any player is clicked or searched */}
          {selectedPlayer ? (
            <PlayerDetailPage
              language={language}
              target={selectedPlayer}
              onBack={() => {
                setSelectedPlayer(null);
                const fallbackPath = selectedTeam
                  ? `/team/${selectedTeam.teamId || encodeURIComponent(selectedTeam.teamName)}`
                  : activeDetailMatch
                  ? `/match/${activeDetailMatch.id.replace(/^api-/, '')}`
                  : tabToPath(activeTab);
                if (window.location.pathname !== fallbackPath) {
                  window.history.pushState({}, '', fallbackPath);
                }
              }}
              onOpenLeague={(leagueId, leagueName) => {
                setInitialLeagueTarget({ leagueId, leagueName });
                setSelectedPlayer(null);
                setSelectedTeam(null);
                setSelectedMatchId(null);
                setSelectedCustomMatch(null);
                setActiveTab('competitions');
                if (window.location.pathname !== '/leagues') {
                  window.history.pushState({}, '', '/leagues');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : selectedTeam ? (
            <TeamDetailPage
              language={language}
              target={selectedTeam}
              allMatches={matches}
              onBack={() => {
                setSelectedTeam(null);
                const fallbackPath = activeDetailMatch
                  ? `/match/${activeDetailMatch.id.replace(/^api-/, '')}`
                  : tabToPath(activeTab);
                if (window.location.pathname !== fallbackPath) {
                  window.history.pushState({}, '', fallbackPath);
                }
              }}
              onSelectMatch={handleOpenMatchPage}
              setActiveTab={handleTabChange}
            />
          ) : activeDetailMatch ? (
            <MatchDetailPage
              language={language}
              match={activeDetailMatch}
              allMatches={matches}
              onBack={() => {
                setSelectedMatchId(null);
                setSelectedCustomMatch(null);
                const fallbackPath = tabToPath(activeTab);
                if (window.location.pathname !== fallbackPath) {
                  window.history.pushState({}, '', fallbackPath);
                }
              }}
              onSelectMatch={handleOpenMatchPage}
              onLogBet={handleLogBetFromMatch}
              setActiveTab={handleTabChange}
            />
          ) : (
            <>
              {/* 0. Главна страница (Homepage) */}
              {isHomeTab && (
                <HomeBentoGrid
                  language={language}
                  matches={matches}
                  bets={bets}
                  setActiveTab={handleTabChange}
                  onLogBet={handleLogBetFromMatch}
                  onViewAllMatches={() => handleTabChange('live')}
                  onOpenMatch={handleOpenMatchPage}
                  onSubscribe={handleNewsletterSubscribe}
                />
              )}

              {/* 1. На живо (Dedicated Live Matches Page matching screenshot 1:1) */}
              {isLiveTab && (
                <LiveMatchesBoard
                  language={language}
                  matches={matches}
                  setMatches={setMatches}
                  onLogBet={handleLogBetFromMatch}
                  bets={bets}
                  setBets={setBets}
                  setActiveTab={handleTabChange}
                  onOpenMatch={handleOpenMatchPage}
                />
              )}

              {/* 2. Състезания */}
              {activeTab === 'competitions' && (
                <CompetitionsView
                  language={language}
                  matches={matches}
                  setActiveTab={handleTabChange}
                  onOpenMatch={handleOpenMatchPage}
                  initialLeagueTarget={initialLeagueTarget}
                />
              )}

              {/* 3. Анализ — Unified 9-Panel Bloomberg-Style Master Analysis Dashboard (/analysis) */}
              {activeTab === 'analysis' && (
                <MasterAnalysisDashboard
                  language={language}
                  matches={matches}
                  onLogBet={handleLogBetFromMatch}
                  onOpenMatch={handleOpenMatchPage}
                />
              )}

              {/* Classic Poisson Simulator view if accessed via 'poisson' sub-route */}
              {activeTab === 'poisson' && <PoissonEngine language={language} />}

              {/* 4. Моите залози */}
              {(activeTab === 'bets' || activeTab === 'bankroll') && (
                <BankrollTracker
                  language={language}
                  bets={bets}
                  setBets={setBets}
                  matches={matches}
                  onAutoSettle={() => handleAutoSettleBets(false)}
                />
              )}

              {/* 5. Инструменти */}
              {(activeTab === 'tools' || activeTab === 'calculators') && (
                <CalculatorsHub language={language} initialTool={initialTool} />
              )}

              {/* 6. Научи */}
              {activeTab === 'learn' && (
                <LearnView language={language} setActiveTab={handleTabChange} />
              )}

              {/* 7. join oddspira / VIP */}
              {activeTab === 'vip' && (
                <VipSection language={language} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Interactive Global Search Modal */}
      <SearchModal
        language={language}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        matches={matches}
        setActiveTab={handleTabChange}
        onSelectMatch={handleOpenMatchPage}
      />

      {/* Real SQL-Backed Registration & Login Modal */}
      <JoinOddspiraModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        language={language}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Architecture Blueprint Modal */}
      <ArchitectureModal
        language={language}
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Admin, Monetization, Brevo Email & OVHcloud Control Modal */}
      <AdminControlModal
        language={language}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Legal, GDPR, 18+ Responsible Gaming & Stripe SaaS Compliance Modal */}
      <LegalComplianceModal
        language={language}
        isOpen={legalModalTab !== null}
        initialTab={legalModalTab || 'terms'}
        onClose={() => setLegalModalTab(null)}
      />

      {/* GDPR & 18+ Cookie Consent Banner */}
      <CookieConsentBanner
        language={language}
        onOpenPrivacy={() => setLegalModalTab('privacy')}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#0c1612] border border-[#43f08a] text-[#43f08a] text-xs font-mono shadow-2xl animate-fade-in flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer
        language={language}
        setActiveTab={handleTabChange}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
      />
    </div>
  );
}
