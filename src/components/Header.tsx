import { useState } from 'react';
import { ActiveTab, Language, Match } from '../types';
import { BrandLogo } from './BrandLogo';
import { UserProfile } from './JoinOddspiraModal';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenSearch: () => void;
  onOpenJoinModal: () => void;
  onOpenAdmin?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  matches?: Match[];
  onOpenMatch?: (match: Match) => void;
}

export function Header({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenSearch,
  onOpenJoinModal,
  onOpenAdmin,
  currentUser,
  onLogout,
  matches = [],
  onOpenMatch,
}: HeaderProps) {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oddspira_read_alerts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Build real notifications from live matches and +EV signals in today's feed
  const liveNotifications = matches
    .filter((m) => m.status === 'LIVE' || Boolean(m.valueBetDetected))
    .slice(0, 6)
    .map((m) => {
      const ev = m.valueBetDetected?.evPercent || 5.4;
      const sel = m.valueBetDetected?.selection;
      const pickName =
        sel === 'home'
          ? `1 (${m.homeTeam})`
          : sel === 'away'
          ? `2 (${m.awayTeam})`
          : sel === 'draw'
          ? 'Равенство (X)'
          : 'Над 2.5 Гола';
      const pickOdd =
        sel === 'home'
          ? m.bookmakerOdds.home
          : sel === 'away'
          ? m.bookmakerOdds.away
          : sel === 'draw'
          ? m.bookmakerOdds.draw
          : Number((1 / Math.max(0.25, m.fairOdds.over25Prob * 1.05)).toFixed(2));
      const fairOdd =
        sel === 'home'
          ? m.fairOdds.fairHomeOdds
          : sel === 'away'
          ? m.fairOdds.fairAwayOdds
          : sel === 'draw'
          ? m.fairOdds.fairDrawOdds
          : Number((1 / Math.max(0.2, m.fairOdds.over25Prob)).toFixed(2));

      const isLive = m.status === 'LIVE';
      return {
        id: `alert-${m.id}-${m.homeScore}-${m.awayScore}`,
        matchObj: m,
        tag: isLive
          ? `🟢 НА ЖИВО ${m.minute || 1}' (${m.homeScore} - ${m.awayScore})`
          : `⚡ +${ev.toFixed(1)}% +EV СИГНАЛ`,
        match: `${m.homeTeam} vs ${m.awayTeam}`,
        league: m.league,
        pick: `${pickName} · Коеф. @${pickOdd.toFixed(2)} (Справедлив @${fairOdd.toFixed(2)})`,
        time: isLive ? 'Сега' : m.startTime,
      };
    });

  const unreadAlerts = liveNotifications.filter((al) => !readAlertIds.includes(al.id));
  const unreadCount = unreadAlerts.length;

  const markAlertRead = (id: string) => {
    setReadAlertIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id].slice(-60);
      try {
        localStorage.setItem('oddspira_read_alerts_v1', JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const markAllAlertsRead = () => {
    const allIds = liveNotifications.map((a) => a.id);
    setReadAlertIds((prev) => {
      const next = Array.from(new Set([...prev, ...allIds])).slice(-60);
      try {
        localStorage.setItem('oddspira_read_alerts_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };
  const handleGoHome = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLiveActive = activeTab === 'live' || activeTab === 'matches';
  const isCompetitionsActive = activeTab === 'competitions';
  const isAnalysisActive = activeTab === 'analysis' || activeTab === 'poisson';
  const isBetsActive = activeTab === 'bets' || activeTab === 'bankroll';
  const isToolsActive = activeTab === 'tools' || activeTab === 'calculators';
  const isLearnActive = activeTab === 'learn';

  const navDict: Record<
    Language,
    {
      tagline: string;
      live: string;
      competitions: string;
      analysis: string;
      bets: string;
      tools: string;
      learn: string;
      search: string;
      logout: string;
      homeTitle: string;
      searchTitle: string;
      alertsTitle: string;
      markRead: string;
      noAlerts: string;
    }
  > = {
    bg: {
      tagline: 'По-умни залози. По-добри резултати.',
      live: 'На живо',
      competitions: 'Състезания',
      analysis: 'Анализ',
      bets: 'Моите залози',
      tools: 'Инструменти',
      learn: 'Научи',
      search: 'Търсене',
      logout: 'Изход',
      homeTitle: 'Oddspira — Начална страница',
      searchTitle: 'Търсене на мач, отбор или футболист',
      alertsTitle: '⚡ ИЗВЕСТИЯ НА ЖИВО & +EV СИГНАЛИ',
      markRead: 'Прочетени ✓',
      noAlerts: 'Няма нови известия в момента.',
    },
    en: {
      tagline: 'Smarter bets. Better results.',
      live: 'Live',
      competitions: 'Leagues',
      analysis: 'Analysis',
      bets: 'My Bets',
      tools: 'Tools',
      learn: 'Guides',
      search: 'Search',
      logout: 'Log out',
      homeTitle: 'Oddspira — Home',
      searchTitle: 'Search matches, teams or players',
      alertsTitle: '⚡ LIVE ALERTS & +EV SIGNALS',
      markRead: 'Mark read ✓',
      noAlerts: 'No new alerts right now.',
    },
    es: {
      tagline: 'Apuestas más inteligentes. Mejores resultados.',
      live: 'En Vivo',
      competitions: 'Ligas',
      analysis: 'Análisis',
      bets: 'Mis Apuestas',
      tools: 'Herramientas',
      learn: 'Guías',
      search: 'Buscar',
      logout: 'Salir',
      homeTitle: 'Oddspira — Inicio',
      searchTitle: 'Buscar partido, equipo o jugador',
      alertsTitle: '⚡ ALERTAS EN VIVO Y SEÑALES +EV',
      markRead: 'Leídas ✓',
      noAlerts: 'No hay nuevas alertas en este momento.',
    },
    de: {
      tagline: 'Intelligentere Wetten. Bessere Ergebnisse.',
      live: 'Live',
      competitions: 'Ligen',
      analysis: 'Analyse',
      bets: 'Meine Wetten',
      tools: 'Tools',
      learn: 'Guides',
      search: 'Suche',
      logout: 'Abmelden',
      homeTitle: 'Oddspira — Startseite',
      searchTitle: 'Spiel, Verein oder Spieler suchen',
      alertsTitle: '⚡ LIVE-ALERTS & +EV-SIGNALE',
      markRead: 'Gelesen ✓',
      noAlerts: 'Derzeit keine neuen Benachrichtigungen.',
    },
    it: {
      tagline: 'Scommesse più intelligenti. Risultati migliori.',
      live: 'Live',
      competitions: 'Campionati',
      analysis: 'Analisi',
      bets: 'Le Mie Scommesse',
      tools: 'Strumenti',
      learn: 'Guide',
      search: 'Cerca',
      logout: 'Esci',
      homeTitle: 'Oddspira — Home',
      searchTitle: 'Cerca partita, squadra o giocatore',
      alertsTitle: '⚡ AVVISI LIVE E SEGNALI +EV',
      markRead: 'Letti ✓',
      noAlerts: 'Nessun nuovo avviso al momento.',
    },
    pt: {
      tagline: 'Apostas mais inteligentes. Melhores resultados.',
      live: 'Ao Vivo',
      competitions: 'Ligas',
      analysis: 'Análise',
      bets: 'Minhas Apostas',
      tools: 'Ferramentas',
      learn: 'Guias',
      search: 'Buscar',
      logout: 'Sair',
      homeTitle: 'Oddspira — Início',
      searchTitle: 'Buscar jogo, equipa ou jogador',
      alertsTitle: '⚡ ALERTAS AO VIVO E SINAIS +EV',
      markRead: 'Lidos ✓',
      noAlerts: 'Sem novos alertas no momento.',
    },
    fr: {
      tagline: 'Des paris plus intelligents. De meilleurs résultats.',
      live: 'En Direct',
      competitions: 'Championnats',
      analysis: 'Analyse',
      bets: 'Mes Paris',
      tools: 'Outils',
      learn: 'Guides',
      search: 'Rechercher',
      logout: 'Déconnexion',
      homeTitle: 'Oddspira — Accueil',
      searchTitle: 'Rechercher un match, club ou joueur',
      alertsTitle: '⚡ ALERTES EN DIRECT & SIGNAUX +EV',
      markRead: 'Lus ✓',
      noAlerts: 'Aucune nouvelle alerte pour le moment.',
    },
    tr: {
      tagline: 'Daha akıllı bahisler. Daha iyi sonuçlar.',
      live: 'Canlı',
      competitions: 'Ligler',
      analysis: 'Analiz',
      bets: 'Bahislerim',
      tools: 'Araçlar',
      learn: 'Rehber',
      search: 'Ara',
      logout: 'Çıkış',
      homeTitle: 'Oddspira — Ana Sayfa',
      searchTitle: 'Maç, takım veya oyuncu ara',
      alertsTitle: '⚡ CANLI BİLDİRİMLER & +EV SİNYALLERİ',
      markRead: 'Okundu ✓',
      noAlerts: 'Şu anda yeni bildirim yok.',
    },
    pl: {
      tagline: 'Mądrzejsze zakłady. Lepsze wyniki.',
      live: 'Na Żywo',
      competitions: 'Ligi',
      analysis: 'Analiza',
      bets: 'Moje Zakłady',
      tools: 'Narzędzia',
      learn: 'Poradniki',
      search: 'Szukaj',
      logout: 'Wyloguj',
      homeTitle: 'Oddspira — Strona główna',
      searchTitle: 'Szukaj meczu, klubu lub piłkarza',
      alertsTitle: '⚡ POWIADOMIENIA NA ŻYWO I SYGNAŁY +EV',
      markRead: 'Przeczytane ✓',
      noAlerts: 'Brak nowych powiadomień.',
    },
    el: {
      tagline: 'Πιο έξυπνα στοιχήματα. Καλύτερα αποτελέσματα.',
      live: 'Ζωντανά',
      competitions: 'Πρωταθλήματα',
      analysis: 'Ανάλυση',
      bets: 'Τα Στοιχήματά μου',
      tools: 'Εργαλεία',
      learn: 'Οδηγοί',
      search: 'Αναζήτηση',
      logout: 'Έξοδος',
      homeTitle: 'Oddspira — Αρχική',
      searchTitle: 'Αναζήτηση αγώνα, ομάδας ή παίκτη',
      alertsTitle: '⚡ ΖΩΝΤΑΝΕΣ ΕΙΔΟΠΟΙΗΣΕΙΣ & ΣΗΜΑΤΑ +EV',
      markRead: 'Αναγνωσμένα ✓',
      noAlerts: 'Δεν υπάρχουν νέες ειδοποιήσεις.',
    },
    ro: {
      tagline: 'Pariuri mai inteligente. Rezultate mai bune.',
      live: 'Live',
      competitions: 'Campionate',
      analysis: 'Analiză',
      bets: 'Pariurile Mele',
      tools: 'Instrumente',
      learn: 'Ghiduri',
      search: 'Caută',
      logout: 'Ieșire',
      homeTitle: 'Oddspira — Acasă',
      searchTitle: 'Caută meci, echipă sau jucător',
      alertsTitle: '⚡ ALERTE LIVE ȘI SEMNALE +EV',
      markRead: 'Citite ✓',
      noAlerts: 'Nu există alerte noi în acest moment.',
    },
    ru: {
      tagline: 'Умные ставки. Лучшие результаты.',
      live: 'Лайв',
      competitions: 'Лиги',
      analysis: 'Анализ',
      bets: 'Мои Ставки',
      tools: 'Инструменты',
      learn: 'База знаний',
      search: 'Поиск',
      logout: 'Выход',
      homeTitle: 'Oddspira — Главная',
      searchTitle: 'Поиск матча, клуба или игрока',
      alertsTitle: '⚡ ЛАЙВ-УВЕДОМЛЕНИЯ И +EV СИГНАЛЫ',
      markRead: 'Прочитано ✓',
      noAlerts: 'Новых уведомлений пока нет.',
    },
  };

  const t = navDict[language] || navDict.en;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b11] border-b border-[#18202c] select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 h-[68px] sm:h-[74px] flex items-center justify-between gap-2 xl:gap-4">
        {/* Oddspira Brand Logo with translated tagline (Directly returns to home page) */}
        <button
          onClick={handleGoHome}
          className="flex items-center text-left whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity duration-150 focus:outline-none cursor-pointer"
          title={t.homeTitle}
        >
          <BrandLogo showSubtitle={false} tagline={t.tagline} className="h-9 sm:h-10 xl:h-11" />
        </button>

        {/* Desktop Navigation Links: Evenly spaced between Logo and Search */}
        <nav className="hidden lg:flex items-center justify-evenly flex-1 min-w-0 px-1 xl:px-4 h-full text-[13px] xl:text-sm font-medium gap-1 xl:gap-2">
          {/* 1. На живо */}
          <button
            onClick={() => setActiveTab('live')}
            className={`relative h-full flex items-center px-1.5 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              isLiveActive ? 'text-[#43f08a] font-semibold' : 'text-[#8f9cae] hover:text-[#f7f8fb]'
            }`}
          >
            <span>{t.live}</span>
            {isLiveActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#43f08a] rounded-t-sm" />
            )}
          </button>

          {/* 2. Състезания */}
          <button
            onClick={() => setActiveTab('competitions')}
            className={`relative h-full flex items-center px-1.5 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              isCompetitionsActive ? 'text-[#43f08a] font-semibold' : 'text-[#8f9cae] hover:text-[#f7f8fb]'
            }`}
          >
            <span>{t.competitions}</span>
            {isCompetitionsActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#43f08a] rounded-t-sm" />
            )}
          </button>

          {/* 3. Анализ */}
          <button
            onClick={() => setActiveTab('analysis')}
            className={`relative h-full flex items-center px-1.5 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              isAnalysisActive ? 'text-[#43f08a] font-semibold' : 'text-[#8f9cae] hover:text-[#f7f8fb]'
            }`}
          >
            <span>{t.analysis}</span>
            {isAnalysisActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#43f08a] rounded-t-sm" />
            )}
          </button>

          {/* 4. Моите залози */}
          <button
            onClick={() => setActiveTab('bets')}
            className={`relative h-full flex items-center px-1.5 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              isBetsActive ? 'text-[#43f08a] font-semibold' : 'text-[#8f9cae] hover:text-[#f7f8fb]'
            }`}
          >
            <span>{t.bets}</span>
            {isBetsActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#43f08a] rounded-t-sm" />
            )}
          </button>

          {/* 5. Инструменти */}
          <button
            onClick={() => setActiveTab('tools')}
            className={`relative h-full flex items-center px-1.5 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              isToolsActive ? 'text-[#43f08a] font-semibold' : 'text-[#8f9cae] hover:text-[#f7f8fb]'
            }`}
          >
            <span>{t.tools}</span>
            {isToolsActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#43f08a] rounded-t-sm" />
            )}
          </button>

          {/* 6. Научи */}
          <button
            onClick={() => setActiveTab('learn')}
            className={`relative h-full flex items-center px-1.5 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              isLearnActive ? 'text-[#43f08a] font-semibold' : 'text-[#8f9cae] hover:text-[#f7f8fb]'
            }`}
          >
            <span>{t.learn}</span>
            {isLearnActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#43f08a] rounded-t-sm" />
            )}
          </button>
        </nav>

        {/* Right Side: Търсене → Известия → Админ → Език → JOIN ODDSPIRA */}
        <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
          {/* Търсене */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-[#8f9cae] hover:text-[#f7f8fb] hover:bg-[#0f1522] border border-transparent hover:border-[#1b2230] transition-colors duration-150 cursor-pointer"
            title={t.searchTitle}
          >
            <svg
              className="w-4 h-4 text-[#8f9cae]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden 2xl:inline text-xs font-medium">{t.search}</span>
          </button>

          {/* Live Value Alerts Bell (Connected to Real Live & +EV Matches) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAlertsOpen((prev) => !prev)}
              className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#0c1420] hover:bg-[#131f33] border border-[#1e293b] text-xs font-mono text-white cursor-pointer"
              title="Известия за мачове на живо и +EV сигнали"
            >
              <span>🔔</span>
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-[#43f08a] text-[#04130a] text-[10px] font-black">
                  {unreadCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-[#1a2636] text-[#8f9cae] text-[10px] font-bold">
                  0
                </span>
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0b0f19] border border-[#43f08a]/50 shadow-2xl p-3.5 z-50 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#1c283d] pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#43f08a]">
                    {t.alertsTitle} ({unreadCount})
                  </span>
                  <div className="flex items-center gap-2.5">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAlertsRead}
                        className="text-[10px] font-semibold text-[#43f08a] hover:underline cursor-pointer"
                      >
                        {t.markRead}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAlertsOpen(false)}
                      className="text-xs text-[#8f9cae] hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {liveNotifications.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                    {liveNotifications.map((al) => {
                      const isRead = readAlertIds.includes(al.id);
                      return (
                        <div
                          key={al.id}
                          onClick={() => {
                            markAlertRead(al.id);
                            setIsAlertsOpen(false);
                            if (onOpenMatch) {
                              onOpenMatch(al.matchObj);
                            } else {
                              setActiveTab('live');
                            }
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            isRead
                              ? 'bg-[#0b101b]/70 border-[#162030] opacity-70 hover:opacity-100'
                              : 'bg-[#0e1624] hover:bg-[#152036] border-[#22354e]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#43f08a] font-bold">{al.tag}</span>
                            <span className="text-[#64748b]">{al.time}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <div className="text-xs font-bold text-white truncate">{al.match}</div>
                            <span className="text-[10px] text-[#8f9cae] shrink-0">{al.league}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#cbd5e1] mt-0.5">{al.pick}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#8f9cae]">
                    {t.noAlerts}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin / Monetization / Brevo Control Button */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-2 py-1.5 rounded-lg bg-[#0d1f18] hover:bg-[#132e23] border border-[#43f08a]/40 text-[11px] font-mono font-bold text-[#43f08a] transition-colors cursor-pointer whitespace-nowrap"
              title="Admin, Monetization, Brevo & OVHcloud Control"
            >
              ⚙️ Admin
            </button>
          )}

          {/* Език Dropdown (12 Global Football Analytics & Betting Languages) */}
          <div className="relative inline-flex items-center">
            <select
              aria-label="Language selection"
              title="Select Platform Language (12 Global Markets)"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-[#070b11] border border-[#1e2638] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-[#f7f8fb] focus:outline-none focus:border-[#43f08a] cursor-pointer hover:border-[#2a374d] transition-colors duration-150"
            >
              <option value="bg">БГ · Български</option>
              <option value="en">EN · English</option>
              <option value="es">ES · Español</option>
              <option value="de">DE · Deutsch</option>
              <option value="it">IT · Italiano</option>
              <option value="pt">PT · Português</option>
              <option value="fr">FR · Français</option>
              <option value="tr">TR · Türkçe</option>
              <option value="pl">PL · Polski</option>
              <option value="el">EL · Ελληνικά</option>
              <option value="ro">RO · Română</option>
              <option value="ru">RU · Русский</option>
            </select>
          </div>

          {/* AUTHENTICATED USER PROFILE OR JOIN ODDSPIRA CTA */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('bets')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0c1512] border border-emerald-500/40 text-xs font-semibold text-white hover:border-emerald-400 transition-colors cursor-pointer"
                title={t.bets}
              >
                <span className="w-5 h-5 rounded-full bg-[#43f08a] text-[#05130b] font-black text-[10px] flex items-center justify-center uppercase shrink-0">
                  {currentUser.name.charAt(0)}
                </span>
                <span className="max-w-[85px] xl:max-w-[110px] truncate">{currentUser.name}</span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2 py-1.5 rounded-lg bg-[#111926] border border-[#1e293b] hover:border-red-500/40 text-[11px] font-medium text-neutral-400 hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t.logout}
                </button>
              )}
            </div>
          ) : (
            <div className="relative group shrink-0">
              {/* Ambient Breathing Emerald Glow Halo */}
              <div
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#43f08a] via-[#3fe384] to-[#2cd873] opacity-40 group-hover:opacity-100 blur-md transition-all duration-300 pointer-events-none"
                aria-hidden="true"
              />

              {/* Main Interactive Button with Specular Rim & Shimmer */}
              <button
                onClick={onOpenJoinModal}
                className="relative px-4 sm:px-5 py-2 rounded-xl font-black text-xs sm:text-sm text-[#05130b] bg-gradient-to-r from-[#43f08a] via-[#3fe384] to-[#2cd873] hover:from-[#56f498] hover:to-[#38e07e] transition-all duration-200 whitespace-nowrap cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_3px_12px_rgba(67,240,138,0.4)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_5px_20px_rgba(67,240,138,0.55)] flex items-center gap-1.5 overflow-hidden active:scale-95 uppercase"
              >
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <span className="relative z-10 tracking-tight font-extrabold uppercase text-[11px] sm:text-xs">
                  JOIN ODDSPIRA
                </span>
                <span className="relative z-10 text-xs sm:text-sm font-black transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden flex items-center justify-between overflow-x-auto no-scrollbar px-4 py-2 bg-[#05080c] border-t border-[#18202c] text-xs">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors duration-150 cursor-pointer ${
            isLiveActive ? 'text-[#43f08a] font-bold border-b border-[#43f08a]' : 'text-[#8f9cae]'
          }`}
        >
          {t.live}
        </button>
        <button
          onClick={() => setActiveTab('competitions')}
          className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors duration-150 cursor-pointer ${
            isCompetitionsActive ? 'text-[#43f08a] font-bold border-b border-[#43f08a]' : 'text-[#8f9cae]'
          }`}
        >
          {t.competitions}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors duration-150 cursor-pointer ${
            isAnalysisActive ? 'text-[#43f08a] font-bold border-b border-[#43f08a]' : 'text-[#8f9cae]'
          }`}
        >
          {t.analysis}
        </button>
        <button
          onClick={() => setActiveTab('bets')}
          className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors duration-150 cursor-pointer ${
            isBetsActive ? 'text-[#43f08a] font-bold border-b border-[#43f08a]' : 'text-[#8f9cae]'
          }`}
        >
          {t.bets}
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors duration-150 cursor-pointer ${
            isToolsActive ? 'text-[#43f08a] font-bold border-b border-[#43f08a]' : 'text-[#8f9cae]'
          }`}
        >
          {t.tools}
        </button>
        <button
          onClick={() => setActiveTab('learn')}
          className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors duration-150 cursor-pointer ${
            isLearnActive ? 'text-[#43f08a] font-bold border-b border-[#43f08a]' : 'text-[#8f9cae]'
          }`}
        >
          {t.learn}
        </button>
      </div>
    </header>
  );
}
