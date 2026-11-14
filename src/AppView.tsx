/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActiveTab, BetRecord, Language, Match } from './types';
import { initialBets, initialMatches } from './data/mockMatches';
import { Header } from './components/Header';
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
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
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
      showToast(`✓ Успешна регистрация! Добре дошли в Oddspira, ${user.name}!`);
    } else {
      showToast(`✓ Добре дошли отново, ${user.name}!`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('oddspira_token');
    setAuthToken(null);
    setCurrentUser(null);
    showToast('✓ Излязохте успешно от профила си.');
  };

  const handleTabChange = (tab: ActiveTab) => {
    setSelectedMatchId(null);
    setActiveTab(tab);
    const routeMap: Partial<Record<ActiveTab, string>> = {
      home: '/',
      live: '/live',
      competitions: '/leagues',
      analysis: '/analysis',
      bets: '/bets',
      tools: '/tools',
      learn: '/guides',
    };
    const nextPath = routeMap[tab] || '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMatchPage = (match: Match) => {
    setSelectedMatchId(match.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeDetailMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId) || null
    : null;

  // Dynamic Client-Side SEO & OpenGraph Meta Tag Updater
  useEffect(() => {
    const seoTitles: Partial<Record<ActiveTab, string>> = {
      home: 'Oddspira — Математически Спортен Анализ, +EV Скенер & Кели Калкулатор',
      live: 'Мачове на Живо & +EV Коефициенти в Реално Време | Oddspira',
      competitions: 'Футболни Първенства & xG Рейтинги на Отборите | Oddspira',
      analysis: 'Интерактивен Център за Мач Анализ, Тактическо Игрище & 5D Радар | Oddspira',
      bets: 'Моите Залози & Автоматизирано Управление на Банката | Oddspira',
      tools: 'Калкулатори за Залози: Поасон, No-Vig, Критерий на Кели & Дъчинг | Oddspira',
      learn: 'Quant Академия: Научи +EV, Модела на Поасон, Dixon-Coles & CLV | Oddspira',
    };

    const nextTitle = activeDetailMatch
      ? `${activeDetailMatch.homeTeam} vs ${activeDetailMatch.awayTeam} — Математически +EV Анализ & Поасон Прогноза | Oddspira`
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
  }, [activeTab, activeDetailMatch, language]);

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
    <div className="min-h-screen flex flex-col bg-[#070b11] text-[#f7f8fb] selection:bg-[#43f08a] selection:text-[#070b11] font-sans antialiased">
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
      />

      {/* Hero Showcase (displayed ONLY on the Main Homepage 'home' when no match page is open) */}
      {isHomeTab && !activeDetailMatch && (
        <HeroShowcase
          language={language}
          setActiveTab={handleTabChange}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />
      )}

      {/* Primary Workspace Viewport (Identical max-w-[1440px] container matching Hero and Navbar) */}
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Main Section Content */}
        <div>
          {/* Dedicated Match Detail Page when a match is clicked */}
          {activeDetailMatch ? (
            <MatchDetailPage
              language={language}
              match={activeDetailMatch}
              allMatches={matches}
              onBack={() => setSelectedMatchId(null)}
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
                />
              )}

              {/* 5. Инструменти */}
              {(activeTab === 'tools' || activeTab === 'calculators') && (
                <CalculatorsHub language={language} />
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
