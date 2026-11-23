import React, { useState, useEffect } from 'react';
import { ActiveTab, BetRecord, Language, Match } from '../types';
import { TeamBadge, LeagueBadge, openTeamProfile, openCompetitionLeague, openCalculatorTool } from './TeamBadge';

interface TopMatchesSectionProps {
  language: Language;
  matches: Match[];
  bets?: BetRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onLogBet?: (match: Match, selection: string, odds: number, ev: number) => void;
  onViewAllMatches?: () => void;
  onOpenMatch?: (match: Match) => void;
  onSubscribe?: (email: string) => void;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  category: 'epl' | 'laliga' | 'bundesliga' | 'ucl';
  link?: string;
}

interface GuideCardItem {
  id: string;
  badge: string;
  title: string;
  desc: string;
  readMore: string;
  fullText: string;
  type: 'value' | 'ev' | 'poisson';
}

export function TopMatchesSection({
  language,
  matches,
  bets = [],
  setActiveTab,
  onLogBet,
  onViewAllMatches,
  onOpenMatch,
  onSubscribe,
}: TopMatchesSectionProps) {
  const [selectedStatsMatch, setSelectedStatsMatch] = useState<Match | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideCardItem | null>(null);
  const [activeLeagueDot, setActiveLeagueDot] = useState<number>(0);
  const [emailInput, setEmailInput] = useState<string>('');
  const [liveRssNews, setLiveRssNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/live/news')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!active || !json?.ok || !Array.isArray(json.items)) return;
        const mapped: NewsItem[] = json.items.slice(0, 4).map((it: any, i: number) => {
          const cats: Array<'epl' | 'laliga' | 'bundesliga' | 'ucl'> = ['epl', 'laliga', 'bundesliga', 'ucl'];
          let timeLabel = 'LIVE RSS';
          if (it.pubDate) {
            const diffMin = Math.max(1, Math.round((Date.now() - new Date(it.pubDate).getTime()) / 60000));
            if (!Number.isNaN(diffMin)) {
              timeLabel = diffMin < 60 ? `${diffMin}m` : `${Math.round(diffMin / 60)}h`;
            }
          }
          return {
            id: `rss-${i}`,
            title: String(it.title || ''),
            source: String(it.source || 'BBC Sport'),
            time: timeLabel,
            summary: String(it.description || it.title || ''),
            category: cats[i % cats.length],
            link: it.link ? String(it.link) : undefined,
          };
        });
        if (mapped.length > 0) setLiveRssNews(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Select the 4 highest-profile matches today (prioritizing major 1st-division leagues over reserve/2nd-tier matches)
  const homeMatchIds = [
    'match-arsenal-chelsea',
    'match-barca-real',
    'match-milan-juve',
    'match-bayern-dortmund',
  ];
  const filteredHome = homeMatchIds
    .map((id) => matches.find((m) => m.id === id))
    .filter((m): m is Match => Boolean(m));

  const isEliteFirstDivision = (m: Match): boolean => {
    const lg = (m.league || '').toLowerCase();
    const ctry = (m.leagueCountry || '').toLowerCase();
    const teams = `${m.homeTeam} ${m.awayTeam}`.toLowerCase();
    if (/\bii\b|\biii\b|\bu1[5-9]\b|\bu2[0-3]\b|reserve|second league|2\.|ligue 2|division 1|serie c|third/i.test(`${lg} ${teams}`)) {
      return false;
    }
    return (
      lg === 'premier league' && ['england', 'scotland', 'egypt'].includes(ctry) ||
      lg === 'la liga' ||
      lg === 'laliga' ||
      lg === 'serie a' ||
      lg === 'bundesliga' ||
      (lg === 'ligue 1' && ctry === 'france') ||
      lg.includes('champions league') ||
      lg.includes('europa league') ||
      lg.includes('conference league') ||
      (lg === 'first league' && ctry === 'bulgaria') ||
      lg === 'super league 1' ||
      lg === 'süper lig' ||
      lg === 'primeira liga' ||
      lg === 'eredivisie' ||
      lg === 'superliga' ||
      lg === 'ekstraklasa' ||
      lg === 'liga i' ||
      lg.includes('liga profesional')
    );
  };

  const rankedForHomepage = [...matches].sort((a, b) => {
    const aElite = isEliteFirstDivision(a) ? 1 : 0;
    const bElite = isEliteFirstDivision(b) ? 1 : 0;
    const aActive = a.status === 'LIVE' || a.status === 'SCHEDULED' ? 1 : 0;
    const bActive = b.status === 'LIVE' || b.status === 'SCHEDULED' ? 1 : 0;
    const aLive = a.status === 'LIVE' ? 1 : 0;
    const bLive = b.status === 'LIVE' ? 1 : 0;

    if (aActive !== bActive) return bActive - aActive;
    if (aElite !== bElite) return bElite - aElite;
    if (aLive !== bLive) return bLive - aLive;
    return 0;
  });

  const topMatches = filteredHome.length === 4 ? filteredHome : rankedForHomepage.slice(0, 4);

  // Comprehensive 4-language dictionary (BG, EN, ES, DE) for all 4 homepage rows
  const dict = {
    bg: {
      // Row 1: Top Matches, Quick Tools, Insights, Bet Tracker
      topMatches: 'Топ мачове днес',
      viewAll: 'Виж всички',
      viewStats: 'Статистика',
      quickTools: 'Бърз достъп до инструменти',
      evCalc: 'EV Калкулатор',
      poissonCalc: 'Poisson Калкулатор',
      noMargin: 'No Margin Калкулатор',
      dutching: 'Dutching Калкулатор',
      bankroll: 'Bankroll Калкулатор',
      betTracker: 'Bet Tracker Табло',
      insights: 'Анализ на коефициенти и стойност',
      marketActivity: 'Пазарна активност на живо',
      marketDesc: 'Следене на движението на коефициентите в реално време.',
      liveAlerts: 'Live известия',
      leagueSignals: 'Запазени сигнали за лиги',
      leagueDesc: 'Възможности с висока стойност във вашите лиги.',
      newSignals: 'Нови сигнали',
      analysisTools: 'Инструменти за анализ на стойност',
      toolsDesc: 'Сканиране на пазари и откриване на стойност.',
      toolsReady: 'Активни',
      goToInsights: 'Към анализи',
      trackerPreview: 'Преглед на Bet Tracker',
      activeBets: 'Активни залози',
      viewOpenBets: 'Виж отворени залози',
      wonToday: 'Спечелени днес',
      lostToday: 'Загубени днес',
      profitToday: 'Печалба днес',
      openTracker: 'Отвори Bet Tracker',
      units: 'единици',
      // Row 2: Key Stats, Popular Leagues, Football News
      keyStats: 'Ключова статистика',
      stat1Title: 'Над 2.5 гола успеваемост',
      stat1Sub: 'Последни 500 мача',
      stat2Title: 'Победи за домакин',
      stat2Sub: 'Всички лиги този сезон',
      stat3Title: 'Гол/Гол (Да) успеваемост',
      stat3Sub: 'Последни 500 мача',
      stat4Title: 'Средна стойност на коефициент',
      stat4Sub: 'Проследени залози този месец',
      popularLeagues: 'Популярни лиги',
      matchesLabel: 'Мачове',
      avgGoalsLabel: 'Ср. голове',
      footballNews: 'Футболни новини',
      newsItems: [
        {
          id: 'news-1',
          title: 'Ман Сити надви Тотнъм в трилър и запази шансовете за титлата',
          source: 'BBC Sport',
          time: 'преди 15м',
          category: 'epl' as const,
          summary:
            'Късен гол след висока xG доминация (2.48 срещу 1.12) донесе ключови три точки на Манчестър Сити в битката за върха във Висшата лига.',
        },
        {
          id: 'news-2',
          title: 'Барселона се доближи до титлата в Ла Лига след успех над Гранада',
          source: 'ESPN',
          time: 'преди 42м',
          category: 'laliga' as const,
          summary:
            'Каталунците контролираха темпото с 68% притежание на топката и ограничиха съперника до едва 0.34 очаквани гола (xG).',
        },
        {
          id: 'news-3',
          title: 'Байерн увеличи преднината си на върха след доминантна победа',
          source: 'Sky Sports',
          time: 'преди 1ч',
          category: 'bundesliga' as const,
          summary:
            'Баварската атака реализира 4 попадения от 3.15 xG, затвърждавайки първото място по резултатност в Бундеслигата (2.78 гола средно на мач).',
        },
        {
          id: 'news-4',
          title: 'Преглед на финала в ШЛ: Ключова статистика и тактически анализи',
          source: 'The Athletic',
          time: 'преди 2ч',
          category: 'ucl' as const,
          summary:
            'Пълен математически разбор на финалистите: пресинг интензитет (PPDA), конверсия на големи шансове и Dixon-Coles симулация за 90 минути.',
        },
      ],
      // Row 3: Learn to Analyze
      learnTitle: 'Научи се да анализираш',
      learnSub: 'Експертни ръководства, стратегии и уроци за надграждане на твоята игра.',
      viewAllGuides: 'Виж всички ръководства',
      guides: [
        {
          id: 'guide-value',
          badge: 'РЪКОВОДСТВО',
          title: 'Какво е Value Betting (Залагане със стойност)?',
          desc: 'Научи как да откриваш математическа стойност, да побеждаваш маржа на букмейкъра и да залагаш с предимство.',
          readMore: 'Прочети повече',
          type: 'value' as const,
          fullText:
            'Value Betting възниква, когато реалната вероятност за дадено събитие е по-висока от имплицитната вероятност, заложена в коефициента на букмейкъра след премахване на скрития марж (No-Vig). В дългосрочен план това е единственият математически доказан път към положителна възвръщаемост (ROI).',
        },
        {
          id: 'guide-ev',
          badge: 'РЪКОВОДСТВО',
          title: 'Разбиране на Математическото очакване (EV)',
          desc: 'Овладей EV изчисленията и взимай по-умни дългосрочни решения при всеки залог.',
          readMore: 'Прочети повече',
          type: 'ev' as const,
          fullText:
            'Формулата за Очаквана Стойност е: EV = (Реална Вероятност × Коефициент) - 1. Когато резултатът е по-голям от 0 (напр. +8.4% EV), залогът има положителен математически превес. Комбиниран с Критерия на Кели, EV определя оптималния размер на залога.',
        },
        {
          id: 'guide-poisson',
          badge: 'РЪКОВОДСТВО',
          title: 'Моделът на Поасон (Poisson) обяснен',
          desc: 'Разбери как вероятностите за голове се изчисляват чрез очаквани голове (xG) и захранват нашите прогнози.',
          readMore: 'Прочети повече',
          type: 'poisson' as const,
          fullText:
            'Разпределението на Поасон моделира броя голове на домакина и госта като независими случайни величини на база атакуваща и защитна сила (λ_home и λ_away). Чрез корекцията на Dixon-Coles се прецизират нискорезултатните равенства (0-0, 1-1).',
        },
      ],
      // Row 4: Newsletter
      stayAhead: 'Бъди винаги крачка напред',
      stayAheadSub: 'Получавай седмични +EV селекции, анализи и ексклузивни обновявания на инструментите.',
      emailPlaceholder: 'Въведи своя имейл адрес',
      subscribeBtn: 'Абонирай се',
      closeBtn: 'Затвори',
      openInLearnBtn: 'Отвори пълната академия →',
    },
    en: {
      topMatches: 'Top Matches Today',
      viewAll: 'View all',
      viewStats: 'View stats',
      quickTools: 'Quick Access to Tools',
      evCalc: 'EV Calculator',
      poissonCalc: 'Poisson Calculator',
      noMargin: 'No Margin Calculator',
      dutching: 'Dutching Calculator',
      bankroll: 'Bankroll Calculator',
      betTracker: 'Bet Tracker Dashboard',
      insights: 'Odds & Value Insights',
      marketActivity: 'Live Market Activity',
      marketDesc: 'Track odds movement & sharp money in real-time.',
      liveAlerts: 'Live alerts',
      leagueSignals: 'Saved League Signals',
      leagueDesc: 'High value opportunities across your leagues.',
      newSignals: 'New signals',
      analysisTools: 'Value Analysis Tools',
      toolsDesc: 'Scan markets and find value before the crowd.',
      toolsReady: 'Tools ready',
      goToInsights: 'Go to Insights',
      trackerPreview: 'Bet Tracker Preview',
      activeBets: 'Active Bets',
      viewOpenBets: 'View open bets',
      wonToday: 'Won Today',
      lostToday: 'Lost Today',
      profitToday: 'Profit Today',
      openTracker: 'Open Bet Tracker',
      units: 'units',
      // Row 2: Key Stats, Popular Leagues, Football News
      keyStats: 'Key Stats',
      stat1Title: 'Over 2.5 goals hit rate',
      stat1Sub: 'Last 500 matches',
      stat2Title: 'Home win rate',
      stat2Sub: 'All leagues this season',
      stat3Title: 'BTTS (Yes) hit rate',
      stat3Sub: 'Last 500 matches',
      stat4Title: 'Average odds value',
      stat4Sub: 'Tracked bets this month',
      popularLeagues: 'Popular Leagues',
      matchesLabel: 'Matches',
      avgGoalsLabel: 'Avg. Goals',
      footballNews: 'Football News',
      newsItems: [
        {
          id: 'news-1',
          title: 'Man City edge past Spurs in thriller to keep title hopes alive',
          source: 'BBC Sport',
          time: '15m ago',
          category: 'epl' as const,
          summary:
            'A clinical late winner backed by a 2.48 vs 1.12 xG advantage secured three vital Premier League points for Manchester City.',
        },
        {
          id: 'news-2',
          title: 'Barcelona close in on La Liga title after Granada win',
          source: 'ESPN',
          time: '42m ago',
          category: 'laliga' as const,
          summary:
            'Barcelona dictated the tempo with 68% possession and restricted Granada to just 0.34 expected goals (xG).',
        },
        {
          id: 'news-3',
          title: 'Bayern extend lead at the top with dominant victory',
          source: 'Sky Sports',
          time: '1h ago',
          category: 'bundesliga' as const,
          summary:
            'Bayern Munich converted 4 goals from 3.15 xG, reinforcing the Bundesliga’s highest scoring rate at 2.78 goals per match.',
        },
        {
          id: 'news-4',
          title: 'UCL final preview: Key stats & tactical insights',
          source: 'The Athletic',
          time: '2h ago',
          category: 'ucl' as const,
          summary:
            'Complete stochastic breakdown of the Champions League final: PPDA pressing intensity, big-chance conversion, and Dixon-Coles 90-minute probabilities.',
        },
      ],
      // Row 3: Learn to Analyze
      learnTitle: 'Learn to Analyze',
      learnSub: 'Expert guides, strategies, and tutorials to level up your betting game.',
      viewAllGuides: 'View all guides',
      guides: [
        {
          id: 'guide-value',
          badge: 'GUIDE',
          title: 'What is Value Betting?',
          desc: 'Learn how to find value, beat the bookies, and bet with an edge.',
          readMore: 'Read more',
          type: 'value' as const,
          fullText:
            'Value betting occurs when the true probability of an outcome is greater than the bookmaker’s implied probability after removing the vig (No-Vig). Consistently betting with positive edge is the mathematical foundation of long-term profitability.',
        },
        {
          id: 'guide-ev',
          badge: 'GUIDE',
          title: 'Understanding Expected Value (EV)',
          desc: 'Master EV calculations and make smarter long-term decisions.',
          readMore: 'Read more',
          type: 'ev' as const,
          fullText:
            'Expected Value is calculated as EV = (True Probability × Decimal Odds) - 1. Whenever EV > 0 (e.g., +8.4% EV), the wager carries a mathematical advantage over the market.',
        },
        {
          id: 'guide-poisson',
          badge: 'GUIDE',
          title: 'Poisson Model Explained',
          desc: 'Understand goal probabilities and how they power our predictions.',
          readMore: 'Read more',
          type: 'poisson' as const,
          fullText:
            'The Bivariate Poisson model projects home and away goal distributions using team attacking and defensive lambdas (λ_home, λ_away), enhanced with the Dixon-Coles correlation adjustment for low-scoring draws.',
        },
      ],
      // Row 4: Newsletter
      stayAhead: 'Stay ahead of the game',
      stayAheadSub: 'Get weekly value picks, insights, and exclusive tool updates.',
      emailPlaceholder: 'Enter your email address',
      subscribeBtn: 'Subscribe',
      closeBtn: 'Close',
      openInLearnBtn: 'Open Full Academy →',
    },
    es: {
      topMatches: 'Partidos Destacados Hoy',
      viewAll: 'Ver todos',
      viewStats: 'Ver stats',
      quickTools: 'Acceso Rápido a Herramientas',
      evCalc: 'Calculadora EV',
      poissonCalc: 'Calculadora Poisson',
      noMargin: 'Calculadora Sin Margen',
      dutching: 'Calculadora Dutching',
      bankroll: 'Calculadora Bankroll',
      betTracker: 'Panel Bet Tracker',
      insights: 'Insights de Cuotas y Valor',
      marketActivity: 'Actividad de Mercado en Vivo',
      marketDesc: 'Rastrea el movimiento de cuotas y dinero inteligente en tiempo real.',
      liveAlerts: 'Alertas en vivo',
      leagueSignals: 'Señales de Ligas Guardadas',
      leagueDesc: 'Oportunidades de alto valor en tus ligas.',
      newSignals: 'Nuevas señales',
      analysisTools: 'Herramientas de Análisis de Valor',
      toolsDesc: 'Escanea mercados y encuentra valor antes que la multitud.',
      toolsReady: 'Herramientas listas',
      goToInsights: 'Ir a Insights',
      trackerPreview: 'Vista Previa Bet Tracker',
      activeBets: 'Apuestas Activas',
      viewOpenBets: 'Ver apuestas abiertas',
      wonToday: 'Ganadas Hoy',
      lostToday: 'Perdidas Hoy',
      profitToday: 'Beneficio Hoy',
      openTracker: 'Abrir Bet Tracker',
      units: 'unidades',
      // Row 2
      keyStats: 'Estadísticas Clave',
      stat1Title: 'Tasa de acierto Más de 2.5 goles',
      stat1Sub: 'Últimos 500 partidos',
      stat2Title: 'Tasa de victoria local',
      stat2Sub: 'Todas las ligas esta temporada',
      stat3Title: 'Tasa de Ambos Marcan (Sí)',
      stat3Sub: 'Últimos 500 partidos',
      stat4Title: 'Valor medio de cuotas',
      stat4Sub: 'Apuestas registradas este mes',
      popularLeagues: 'Ligas Populares',
      matchesLabel: 'Partidos',
      avgGoalsLabel: 'Prom. Goles',
      footballNews: 'Noticias de Fútbol',
      newsItems: [
        {
          id: 'news-1',
          title: 'El Man City supera a los Spurs en un thriller para mantener viva la lucha',
          source: 'BBC Sport',
          time: 'hace 15m',
          category: 'epl' as const,
          summary:
            'Un gol decisivo respaldado por una ventaja de 2.48 vs 1.12 xG aseguró tres puntos vitales para el Manchester City en la Premier League.',
        },
        {
          id: 'news-2',
          title: 'El Barcelona se acerca al título de La Liga tras vencer al Granada',
          source: 'ESPN',
          time: 'hace 42m',
          category: 'laliga' as const,
          summary:
            'El conjunto azulgrana dominó con un 68% de posesión y limitó al rival a solo 0.34 goles esperados (xG).',
        },
        {
          id: 'news-3',
          title: 'El Bayern amplía su ventaja en la cima con una victoria dominante',
          source: 'Sky Sports',
          time: 'hace 1h',
          category: 'bundesliga' as const,
          summary:
            'El ataque bávaro convirtió 4 goles de 3.15 xG, consolidando el promedio goleador más alto de la Bundesliga (2.78 por partido).',
        },
        {
          id: 'news-4',
          title: 'Previa de la final de la UCL: Estadísticas clave y análisis táctico',
          source: 'The Athletic',
          time: 'hace 2h',
          category: 'ucl' as const,
          summary:
            'Análisis cuantitativo completo de la final: intensidad de presión PPDA, conversión de ocasiones claras y simulación Dixon-Coles.',
        },
      ],
      // Row 3
      learnTitle: 'Aprende a Analizar',
      learnSub: 'Guías expertas, estrategias y tutoriales para subir de nivel tu juego.',
      viewAllGuides: 'Ver todas las guías',
      guides: [
        {
          id: 'guide-value',
          badge: 'GUÍA',
          title: '¿Qué es el Value Betting?',
          desc: 'Aprende a encontrar valor, superar a las casas de apuestas y apostar con ventaja.',
          readMore: 'Leer más',
          type: 'value' as const,
          fullText:
            'El Value Betting ocurre cuando la probabilidad real de un resultado supera la probabilidad implícita de la cuota tras eliminar el margen (No-Vig). Es la base matemática de la rentabilidad a largo plazo.',
        },
        {
          id: 'guide-ev',
          badge: 'GUÍA',
          title: 'Entendiendo el Valor Esperado (EV)',
          desc: 'Domina los cálculos de EV y toma decisiones más inteligentes a largo plazo.',
          readMore: 'Leer más',
          type: 'ev' as const,
          fullText:
            'El Valor Esperado se calcula como EV = (Probabilidad Real × Cuota Decimal) - 1. Cuando EV > 0, la apuesta ofrece una ventaja matemática positiva sobre el mercado.',
        },
        {
          id: 'guide-poisson',
          badge: 'GUÍA',
          title: 'El Modelo de Poisson Explicado',
          desc: 'Comprende las probabilidades de goles y cómo impulsan nuestras predicciones.',
          readMore: 'Leer más',
          type: 'poisson' as const,
          fullText:
            'El modelo de Poisson calcula la distribución exacta de goles locales y visitantes usando tasas de ataque y defensa (λ), ajustadas mediante la correlación de Dixon-Coles.',
        },
      ],
      // Row 4
      stayAhead: 'Mantente un paso adelante',
      stayAheadSub: 'Recibe selecciones de valor semanales, análisis y actualizaciones exclusivas.',
      emailPlaceholder: 'Introduce tu correo electrónico',
      subscribeBtn: 'Suscribirse',
      closeBtn: 'Cerrar',
      openInLearnBtn: 'Abrir Academia Completa →',
    },
    de: {
      topMatches: 'Top-Spiele Heute',
      viewAll: 'Alle anzeigen',
      viewStats: 'Statistiken',
      quickTools: 'Schnellzugriff auf Tools',
      evCalc: 'EV Rechner',
      poissonCalc: 'Poisson Rechner',
      noMargin: 'Ohne Marge Rechner',
      dutching: 'Dutching Rechner',
      bankroll: 'Bankroll Rechner',
      betTracker: 'Wett-Tracker Dashboard',
      insights: 'Quoten & Value Insights',
      marketActivity: 'Live-Marktaktivität',
      marketDesc: 'Verfolgen Sie Quotenbewegungen und Sharp Money in Echtzeit.',
      liveAlerts: 'Live-Warnungen',
      leagueSignals: 'Gespeicherte Liga-Signale',
      leagueDesc: 'Hochwertige Value-Gelegenheiten in Ihren Ligen.',
      newSignals: 'Neue Signale',
      analysisTools: 'Value-Analyse-Tools',
      toolsDesc: 'Märkte scannen und Value vor der Masse finden.',
      toolsReady: 'Tools bereit',
      goToInsights: 'Zu den Insights',
      trackerPreview: 'Wett-Tracker Vorschau',
      activeBets: 'Aktive Wetten',
      viewOpenBets: 'Offene Wetten',
      wonToday: 'Heute gewonnen',
      lostToday: 'Heute verloren',
      profitToday: 'Gewinn heute',
      openTracker: 'Wett-Tracker öffnen',
      units: 'Einheiten',
      // Row 2
      keyStats: 'Wichtige Statistiken',
      stat1Title: 'Über 2.5 Tore Trefferquote',
      stat1Sub: 'Letzte 500 Spiele',
      stat2Title: 'Heimsieg-Quote',
      stat2Sub: 'Alle Ligen diese Saison',
      stat3Title: 'BTTS (Ja) Trefferquote',
      stat3Sub: 'Letzte 500 Spiele',
      stat4Title: 'Durchschnittlicher Quoten-Value',
      stat4Sub: 'Erfasste Wetten diesen Monat',
      popularLeagues: 'Beliebte Ligen',
      matchesLabel: 'Spiele',
      avgGoalsLabel: 'Ø Tore',
      footballNews: 'Fußball-News',
      newsItems: [
        {
          id: 'news-1',
          title: 'Man City besiegt Spurs in Thriller und hält Titelhoffnungen am Leben',
          source: 'BBC Sport',
          time: 'vor 15 Min.',
          category: 'epl' as const,
          summary:
            'Ein später Treffer nach deutlicher xG-Überlegenheit (2.48 zu 1.12) sichert Manchester City drei wichtige Punkte im Titelrennen.',
        },
        {
          id: 'news-2',
          title: 'Barcelona rückt nach Sieg gegen Granada näher an den La-Liga-Titel',
          source: 'ESPN',
          time: 'vor 42 Min.',
          category: 'laliga' as const,
          summary:
            'Mit 68% Ballbesitz und nur 0.34 zugelassenen Expected Goals (xG) zeigte Barcelona eine souveräne Vorstellung.',
        },
        {
          id: 'news-3',
          title: 'Bayern baut Tabellenführung mit dominantem Sieg weiter aus',
          source: 'Sky Sports',
          time: 'vor 1 Std.',
          category: 'bundesliga' as const,
          summary:
            '4 Tore aus 3.15 xG unterstreichen Bayerns Offensivkraft in der Bundesliga (2.78 Tore pro Spiel im Ligaschnitt).',
        },
        {
          id: 'news-4',
          title: 'UCL-Finale Vorschau: Wichtige Statistiken & taktische Einblicke',
          source: 'The Athletic',
          time: 'vor 2 Std.',
          category: 'ucl' as const,
          summary:
            'Vollständige stochastische Analyse des Champions-League-Finals: PPDA-Pressing, Chancenverwertung und Dixon-Coles-Simulation.',
        },
      ],
      // Row 3
      learnTitle: 'Analysieren lernen',
      learnSub: 'Experten-Guides, Strategien und Tutorials für bessere Wettentscheidungen.',
      viewAllGuides: 'Alle Guides ansehen',
      guides: [
        {
          id: 'guide-value',
          badge: 'GUIDE',
          title: 'Was ist Value Betting?',
          desc: 'Lernen Sie, wie man Value findet, die Buchmacher schlägt und mit Vorteil wettet.',
          readMore: 'Mehr lesen',
          type: 'value' as const,
          fullText:
            'Value Betting liegt vor, wenn die tatsächliche Wahrscheinlichkeit eines Ergebnisses höher ist als die implizite Quote des Buchmachers nach Abzug der Marge (No-Vig).',
        },
        {
          id: 'guide-ev',
          badge: 'GUIDE',
          title: 'Expected Value (EV) verstehen',
          desc: 'Meistern Sie EV-Berechnungen und treffen Sie langfristig klügere Entscheidungen.',
          readMore: 'Mehr lesen',
          type: 'ev' as const,
          fullText:
            'Der Erwartungswert wird berechnet als EV = (Faire Wahrscheinlichkeit × Quote) - 1. Ein positiver EV (+EV) signalisiert einen mathematischen Vorteil gegenüber dem Markt.',
        },
        {
          id: 'guide-poisson',
          badge: 'GUIDE',
          title: 'Das Poisson-Modell erklärt',
          desc: 'Verstehen Sie Torwahrscheinlichkeiten und wie sie unsere Prognosen antreiben.',
          readMore: 'Mehr lesen',
          type: 'poisson' as const,
          fullText:
            'Das bivariate Poisson-Modell berechnet exakte Torverteilungen anhand der Angriffs- und Verteidigungsstärke (λ) inklusive Dixon-Coles-Korrektur für niedrige Unentschieden.',
        },
      ],
      // Row 4
      stayAhead: 'Bleiben Sie dem Spiel voraus',
      stayAheadSub: 'Erhalten Sie wöchentliche Value-Picks, Analysen und exklusive Tool-Updates.',
      emailPlaceholder: 'Ihre E-Mail-Adresse eingeben',
      subscribeBtn: 'Abonnieren',
      closeBtn: 'Schließen',
      openInLearnBtn: 'Komplette Akademie öffnen →',
    },
  };

  const t = (dict as Record<string, typeof dict.en>)[language] || dict.en;

  // League badge helper for Top Matches mini cards with real API-Football League Logo
  const renderLeagueBadge = (league: string, explicitLogo?: string) => {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-300">
        <LeagueBadge name={league} logoUrl={explicitLogo} size="sm" />
        <span className="truncate">{league}</span>
      </span>
    );
  };

  // Popular Leagues data with real official API-Sports League Crests (served via first-party proxy)
  const popularLeaguesData = [
    {
      id: 'epl',
      apiLeagueId: 39,
      name: 'Premier League',
      matches: 380,
      avgGoals: '2.85',
      renderCrest: () => (
        <div className="w-12 h-12 rounded-2xl bg-white/95 border border-purple-400/50 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.25)]">
          <img
            src="/api/football/media/leagues/39.png"
            alt="Premier League"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'laliga',
      apiLeagueId: 140,
      name: 'La Liga',
      matches: 380,
      avgGoals: '2.64',
      renderCrest: () => (
        <div className="w-12 h-12 rounded-2xl bg-white/95 border border-[#ff4b4b]/50 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <img
            src="/api/football/media/leagues/140.png"
            alt="La Liga"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'seriea',
      apiLeagueId: 135,
      name: 'Serie A',
      matches: 380,
      avgGoals: '2.61',
      renderCrest: () => (
        <div className="w-12 h-12 rounded-2xl bg-white/95 border border-sky-400/50 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.25)]">
          <img
            src="/api/football/media/leagues/135.png"
            alt="Serie A"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'bundesliga',
      apiLeagueId: 78,
      name: 'Bundesliga',
      matches: 306,
      avgGoals: '3.14',
      renderCrest: () => (
        <div className="w-12 h-12 rounded-2xl bg-white/95 border border-red-400/50 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
          <img
            src="/api/football/media/leagues/78.png"
            alt="Bundesliga"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'ucl',
      apiLeagueId: 2,
      name: 'Champions League',
      matches: 189,
      avgGoals: '2.96',
      renderCrest: () => (
        <div className="w-12 h-12 rounded-2xl bg-white/95 border border-slate-400/50 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(148,163,184,0.2)]">
          <img
            src="/api/football/media/leagues/2.png"
            alt="Champions League"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
  ];

  // Real quantitative aggregations from live matches and SQLite Bet Tracker
  const liveMatchesCount = matches.filter((m) => m.status === 'LIVE').length;
  const valueSignalsCount = matches.filter((m) => Boolean(m.valueBetDetected)).length;

  const activeBetsList = bets.filter((b) => b.status === 'PENDING');
  const wonBetsList = bets.filter((b) => b.status === 'WON');
  const lostBetsList = bets.filter((b) => b.status === 'LOST');

  const wonProfitEur = wonBetsList.reduce((acc, b) => acc + (b.pnl || b.stake * (b.odds - 1)), 0);
  const lostLossEur = lostBetsList.reduce((acc, b) => acc + Math.abs(b.pnl || -b.stake), 0);
  const netProfitEur = bets
    .filter((b) => b.status === 'WON' || b.status === 'LOST')
    .reduce((acc, b) => acc + (b.pnl || 0), 0);
  const settledStakedEur = bets
    .filter((b) => b.status === 'WON' || b.status === 'LOST')
    .reduce((acc, b) => acc + (b.stake || 0), 0);
  const realRoiPct = settledStakedEur > 0 ? (netProfitEur / settledStakedEur) * 100 : 0;

  const avgOver25Pct =
    matches.length > 0
      ? (matches.reduce((acc, m) => acc + (m.fairOdds?.over25Prob || 0.55), 0) / matches.length) * 100
      : 56.4;
  const avgHomeWinPct =
    matches.length > 0
      ? (matches.reduce((acc, m) => acc + (m.fairOdds?.homeProb || 0.45), 0) / matches.length) * 100
      : 46.2;
  const avgBttsPct =
    matches.length > 0
      ? (matches.reduce((acc, m) => acc + (m.fairOdds?.bttsProb || 0.52), 0) / matches.length) * 100
      : 52.8;
  const valueMatches = matches.filter((m) => m.valueBetDetected);
  const avgEvEdgePct =
    valueMatches.length > 0
      ? valueMatches.reduce((acc, m) => acc + (m.valueBetDetected?.evPercent || 0), 0) / valueMatches.length
      : bets.length > 0
      ? bets.reduce((acc, b) => acc + (b.evPercent || 0), 0) / bets.length
      : 4.8;

  const displayedNewsItems = liveRssNews.length > 0 ? liveRssNews : t.newsItems;

  // Handle Newsletter Submit
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    if (onSubscribe) {
      onSubscribe(emailInput.trim());
    }
    setEmailInput('');
  };

  return (
    <div className="space-y-5">
      {/* =================================================================== */}
      {/* ROW 1: Top Matches Today (6) | Odds & Value Insights (3) | Bet Tracker (3) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: Top Matches Today + Quick Access to Tools (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
              </svg>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.topMatches}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onViewAllMatches) {
                  onViewAllMatches();
                } else {
                  setActiveTab('competitions');
                }
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer group"
            >
              <span>{t.viewAll}</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          {/* 4 Matches Horizontal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-4">
            {topMatches.map((m) => {
              const isLive = m.status === 'LIVE';

              return (
                <div
                  key={m.id}
                  onClick={() => (onOpenMatch ? onOpenMatch(m) : setSelectedStatsMatch(m))}
                  className="rounded-xl border border-[#1a2537] bg-[#0c131d] p-3 flex flex-col justify-between hover:border-emerald-500/40 hover:bg-[#0f1724] transition-all duration-200 group shadow-sm cursor-pointer"
                >
                  {/* Top: League info + Time/Live status badge */}
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <div className="min-w-0 flex-1">
                      {renderLeagueBadge(m.league, m.leagueLogo)}
                    </div>
                    {isLive ? (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        <span>LIVE {m.minute}'</span>
                      </span>
                    ) : (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-300 bg-[#141d2a] border border-[#212f45] tabular-nums">
                        {m.startTime.replace(/[^0-9:]/g, '') || m.startTime}
                      </span>
                    )}
                  </div>

                  {/* Teams + Scores */}
                  <div className="space-y-1.5 mb-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between gap-2">
                      <div
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
                        className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:text-emerald-300"
                        title={`${m.homeTeam} — Профил на отбора`}
                      >
                        <TeamBadge
                          name={m.homeTeam}
                          logoUrl={m.homeLogo}
                          teamId={m.homeTeamId}
                          size="sm"
                          className="w-5 h-5 text-[9px]"
                        />
                        <span className="text-xs sm:text-[13px] font-semibold text-white hover:text-emerald-300 hover:underline transition-colors truncate">
                          {m.homeTeam}
                        </span>
                      </div>
                      {isLive && (
                        <span className="text-xs sm:text-[13px] font-bold font-mono text-white tabular-nums">
                          {m.homeScore}
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between gap-2">
                      <div
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
                        className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:text-emerald-300"
                        title={`${m.awayTeam} — Профил на отбора`}
                      >
                        <TeamBadge
                          name={m.awayTeam}
                          logoUrl={m.awayLogo}
                          teamId={m.awayTeamId}
                          size="sm"
                          className="w-5 h-5 text-[9px]"
                        />
                        <span className="text-xs sm:text-[13px] font-semibold text-white hover:text-emerald-300 hover:underline transition-colors truncate">
                          {m.awayTeam}
                        </span>
                      </div>
                      {isLive && (
                        <span className="text-xs sm:text-[13px] font-bold font-mono text-neutral-400 tabular-nums">
                          {m.awayScore}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action: View stats */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenMatch) {
                        onOpenMatch(m);
                      } else {
                        setSelectedStatsMatch(m);
                      }
                    }}
                    className="pt-2 border-t border-[#182334] flex items-center justify-between w-full text-[11px] text-neutral-300 group-hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                  >
                    <span>{t.viewStats}</span>
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Access to Tools Strip */}
          <div className="pt-3 border-t border-[#162030]">
            <span className="block text-xs font-bold text-white tracking-tight mb-2.5">
              {t.quickTools}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* 1. EV Calculator */}
              <button
                type="button"
                onClick={(e) => openCalculatorTool('ev', e)}
                className="p-2 rounded-xl border border-emerald-500/40 bg-[#0d1917] hover:bg-[#11221f] transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <span className="w-5 h-5 rounded-full border border-emerald-400/60 text-emerald-400 text-[10px] flex items-center justify-center font-bold font-mono">
                  %
                </span>
                <span className="text-[10px] font-semibold text-white leading-tight">
                  {t.evCalc}
                </span>
              </button>

              {/* 2. Poisson Calculator */}
              <button
                type="button"
                onClick={(e) => openCalculatorTool('poisson', e)}
                className="p-2 rounded-xl border border-[#1b2637] bg-[#0c131d] hover:border-emerald-500/50 hover:bg-[#111a28] transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300 leading-tight">
                  {t.poissonCalc}
                </span>
              </button>

              {/* 3. No Margin Calculator */}
              <button
                type="button"
                onClick={(e) => openCalculatorTool('novig', e)}
                className="p-2 rounded-xl border border-[#1b2637] bg-[#0c131d] hover:border-emerald-500/50 hover:bg-[#111a28] transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="M9 9l6 6m0-6l-6 6" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300 leading-tight">
                  {t.noMargin}
                </span>
              </button>

              {/* 4. Dutching Calculator */}
              <button
                type="button"
                onClick={(e) => openCalculatorTool('dutching', e)}
                className="p-2 rounded-xl border border-[#1b2637] bg-[#0c131d] hover:border-emerald-500/50 hover:bg-[#111a28] transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <ellipse cx="12" cy="7" rx="7" ry="3" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3M5 17c0 1.66 3.13 3 7 3s7-1.34 7-3" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300 leading-tight">
                  {t.dutching}
                </span>
              </button>

              {/* 5. Bankroll / Kelly Calculator */}
              <button
                type="button"
                onClick={(e) => openCalculatorTool('kelly', e)}
                className="p-2 rounded-xl border border-[#1b2637] bg-[#0c131d] hover:border-emerald-500/50 hover:bg-[#111a28] transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M4 10v8m4-8v8m8-8v8m4-8v8M2 18h20M12 3l9 5H3l9-5z" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300 leading-tight">
                  {t.bankroll}
                </span>
              </button>

              {/* 6. Bet Tracker Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab('bets')}
                className="p-2 rounded-xl border border-[#1b2637] bg-[#0c131d] hover:border-emerald-500/50 hover:bg-[#111a28] transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M7 16v-5m5 5V8m5 8v-3" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300 leading-tight">
                  {t.betTracker}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 2: Odds & Value Insights (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.insights}
              </h2>
            </div>

            <div className="space-y-2.5">
              {/* Item 1 */}
              <div
                onClick={() => {
                  if (onViewAllMatches) onViewAllMatches();
                }}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/40 hover:bg-[#101b28] transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                    ((•))
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {t.marketActivity}
                    </span>
                    <span className="block text-[11px] text-neutral-400 truncate">
                      {t.marketDesc}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <div>
                    <span className="block text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-center tabular-nums">
                      {liveMatchesCount || matches.length}
                    </span>
                    <span className="block text-[9px] text-neutral-400 mt-0.5">{t.liveAlerts}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">›</span>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setActiveTab('analysis')}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/40 hover:bg-[#101b28] transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {t.leagueSignals}
                    </span>
                    <span className="block text-[11px] text-neutral-400 truncate">
                      {t.leagueDesc}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <div>
                    <span className="block text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-center tabular-nums">
                      {valueSignalsCount}
                    </span>
                    <span className="block text-[9px] text-neutral-400 mt-0.5">{t.newSignals}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">›</span>
                </div>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => setActiveTab('tools')}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/40 hover:bg-[#101b28] transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {t.analysisTools}
                    </span>
                    <span className="block text-[11px] text-neutral-400 truncate">
                      {t.toolsDesc}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <div>
                    <span className="block text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-center tabular-nums">
                      5
                    </span>
                    <span className="block text-[9px] text-neutral-400 mt-0.5">{t.toolsReady}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">›</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className="pt-3 border-t border-[#162030] flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer w-full group mt-3"
          >
            <span>{t.goToInsights}</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>

        {/* PANEL 3: Bet Tracker Preview (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.trackerPreview}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {/* Active Bets */}
              <div
                onClick={() => setActiveTab('bets')}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/30 transition-colors text-center cursor-pointer"
              >
                <span className="text-[11px] text-neutral-400 font-medium block">{t.activeBets}</span>
                <span className="text-2xl font-black font-mono text-white block my-0.5 tabular-nums">
                  {activeBetsList.length}
                </span>
                <span className="text-[10px] text-sky-400 block font-medium">{t.viewOpenBets}</span>
              </div>

              {/* Won Bets */}
              <div
                onClick={() => setActiveTab('bets')}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/30 transition-colors text-center cursor-pointer"
              >
                <span className="text-[11px] text-neutral-400 font-medium block">{t.wonToday}</span>
                <span className="text-2xl font-black font-mono text-emerald-400 block my-0.5 tabular-nums">
                  {wonBetsList.length}
                </span>
                <span className="text-[10px] text-emerald-400 block font-mono font-bold tabular-nums">
                  +€{wonProfitEur.toFixed(0)}
                </span>
              </div>

              {/* Lost Bets */}
              <div
                onClick={() => setActiveTab('bets')}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/30 transition-colors text-center cursor-pointer"
              >
                <span className="text-[11px] text-neutral-400 font-medium block">{t.lostToday}</span>
                <span className="text-2xl font-black font-mono text-red-400 block my-0.5 tabular-nums">
                  {lostBetsList.length}
                </span>
                <span className="text-[10px] text-red-400/80 block font-mono tabular-nums">
                  -€{lostLossEur.toFixed(0)}
                </span>
              </div>

              {/* Net Profit */}
              <div
                onClick={() => setActiveTab('bets')}
                className="p-3 rounded-xl border border-[#182334] bg-[#0c131d] hover:border-emerald-500/30 transition-colors text-center cursor-pointer"
              >
                <span className="text-[11px] text-neutral-400 font-medium block">{t.profitToday}</span>
                <span
                  className={`text-xl sm:text-2xl font-black font-mono block my-0.5 tabular-nums ${
                    netProfitEur >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {netProfitEur >= 0 ? '+' : '-'}€{Math.abs(netProfitEur).toFixed(0)}
                </span>
                <span
                  className={`text-[10px] block font-mono font-bold tabular-nums ${
                    realRoiPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {realRoiPct >= 0 ? '+' : ''}
                  {realRoiPct.toFixed(1)}% ROI
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('bets')}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-[#05130b] bg-[#35c45a] hover:bg-[#3dd664] transition-all duration-200 cursor-pointer shadow-[0_4px_15px_rgba(53,196,90,0.3)] flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>{t.openTracker}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 19h16M7 16v-5m5 5V8m5 8v-3" />
            </svg>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 2: Key Stats (3) | Popular Leagues (6) | Football News (3)      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: Key Stats (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M8 14v-3m4 3V9m4 5v-2" />
              </svg>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.keyStats}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              {t.viewAll} ›
            </button>
          </div>

          <div className="divide-y divide-[#152030]">
            {/* Stat 1: Over 2.5 */}
            <div
              onClick={() => setActiveTab('analysis')}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2.5" strokeWidth="2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {t.stat1Title}
                  </span>
                  <span className="block text-[10px] text-neutral-400 truncate">
                    {t.stat1Sub}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">
                  {avgOver25Pct.toFixed(1)}%
                </span>
                <span className="text-neutral-500 text-xs">›</span>
              </div>
            </div>

            {/* Stat 2: Home win rate */}
            <div
              onClick={() => setActiveTab('analysis')}
              className="py-2.5 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {t.stat2Title}
                  </span>
                  <span className="block text-[10px] text-neutral-400 truncate">
                    {t.stat2Sub}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">
                  {avgHomeWinPct.toFixed(1)}%
                </span>
                <span className="text-neutral-500 text-xs">›</span>
              </div>
            </div>

            {/* Stat 3: BTTS */}
            <div
              onClick={() => setActiveTab('analysis')}
              className="py-2.5 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="8" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {t.stat3Title}
                  </span>
                  <span className="block text-[10px] text-neutral-400 truncate">
                    {t.stat3Sub}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">
                  {avgBttsPct.toFixed(1)}%
                </span>
                <span className="text-neutral-500 text-xs">›</span>
              </div>
            </div>

            {/* Stat 4: Average odds value */}
            <div
              onClick={() => setActiveTab('bets')}
              className="py-2.5 last:pb-0 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {t.stat4Title}
                  </span>
                  <span className="block text-[10px] text-neutral-400 truncate">
                    {t.stat4Sub}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 tabular-nums">
                  +{avgEvEdgePct.toFixed(1)}%
                </span>
                <span className="text-neutral-500 text-xs">›</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: Popular Leagues (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
              </svg>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.popularLeagues}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('competitions')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              {t.viewAll} ›
            </button>
          </div>

          {/* 5 League Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {popularLeaguesData.map((lg, idx) => (
              <div
                key={lg.id}
                onClick={(e) => {
                  setActiveLeagueDot(idx);
                  openCompetitionLeague(
                    { leagueKey: lg.id, leagueId: lg.apiLeagueId, leagueName: lg.name },
                    e
                  );
                }}
                className="rounded-xl border border-[#1a2537] bg-[#0c131d] hover:border-emerald-500/40 hover:bg-[#101926] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all group"
              >
                <div className="my-1.5 group-hover:scale-105 transition-transform">
                  {lg.renderCrest()}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate w-full mb-2.5">
                  {lg.name}
                </span>
                <div className="w-full pt-2 border-t border-[#182334] flex items-center justify-between text-[10px]">
                  <div className="text-left">
                    <span className="block font-mono font-bold text-white tabular-nums">{lg.matches}</span>
                    <span className="block text-[9px] text-neutral-400">{t.matchesLabel}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono font-bold text-white tabular-nums">{lg.avgGoals}</span>
                    <span className="block text-[9px] text-neutral-400">{t.avgGoalsLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
            {[0, 1, 2, 3, 4].map((dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`League page ${dotIdx + 1}`}
                onClick={(e) => {
                  setActiveLeagueDot(dotIdx);
                  const lg = popularLeaguesData[dotIdx];
                  if (lg) {
                    openCompetitionLeague(
                      { leagueKey: lg.id, leagueId: lg.apiLeagueId, leagueName: lg.name },
                      e
                    );
                  }
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeLeagueDot === dotIdx
                    ? 'w-3 bg-emerald-400'
                    : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* PANEL 3: Football News (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.footballNews}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNews(displayedNewsItems[0])}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              {t.viewAll} ›
            </button>
          </div>

          <div className="divide-y divide-[#152030]">
            {displayedNewsItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Match/Stadium Thumbnail */}
                  <div
                    className={`w-11 h-7 rounded-md shrink-0 overflow-hidden border border-white/10 flex items-center justify-center relative ${
                      idx === 0
                        ? 'bg-gradient-to-br from-sky-600/50 via-emerald-700/40 to-slate-900'
                        : idx === 1
                        ? 'bg-gradient-to-br from-red-600/50 via-blue-800/50 to-slate-900'
                        : idx === 2
                        ? 'bg-gradient-to-br from-red-700/60 via-amber-600/30 to-slate-900'
                        : 'bg-gradient-to-br from-indigo-700/60 via-emerald-600/40 to-slate-900'
                    }`}
                  >
                    <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="8" fillOpacity="0.25" />
                      <path d="M12 6a6 6 0 100 12 6 6 0 000-12zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                    </svg>
                  </div>

                  <p className="text-[11px] font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-[10px] font-semibold text-neutral-300 whitespace-nowrap">
                    {item.source}
                  </span>
                  <span className="block text-[9px] font-mono text-neutral-500 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 3: Learn to Analyze (Full Width 12-Col Card)                    */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#1b2637] bg-[#070c14] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left Column: Intro (3 cols) */}
          <div className="lg:col-span-3 space-y-2 pr-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t.learnTitle}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.learnSub}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('learn')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group pt-1"
            >
              <span>{t.viewAllGuides}</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          {/* Right Column: 3 Guide Cards (9 cols) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {t.guides.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGuide(g)}
                className="rounded-xl border border-[#1a2537] bg-[#0c131d] hover:border-emerald-500/40 hover:bg-[#101926] p-3 flex items-center gap-3.5 cursor-pointer transition-all group"
              >
                {/* Rich Visual Guide Illustration matching screenshot */}
                <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden border border-white/10 bg-[#080d14] relative flex items-center justify-center">
                  {g.type === 'value' && (
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="26" stroke="#334155" strokeWidth="4" />
                      <circle cx="32" cy="32" r="18" stroke="#64748b" strokeWidth="4" />
                      <circle cx="32" cy="32" r="10" stroke="#10b981" strokeWidth="4" />
                      <circle cx="32" cy="32" r="4" fill="#43f08a" />
                      <path d="M48 16L34 30" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M45 13l6 6-4 1-3-3 1-4z" fill="#43f08a" />
                    </svg>
                  )}
                  {g.type === 'ev' && (
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <rect x="6" y="10" width="52" height="44" rx="4" fill="#06121c" stroke="#1e293b" strokeWidth="2" />
                      <path d="M12 42l10-10 8 6 12-16 10 6" stroke="#43f08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="14" y="16" width="14" height="6" rx="1" fill="#10b981" fillOpacity="0.3" />
                      <rect x="34" y="36" width="6" height="12" rx="1" fill="#0ea5e9" fillOpacity="0.5" />
                      <rect x="44" y="30" width="6" height="18" rx="1" fill="#43f08a" fillOpacity="0.7" />
                    </svg>
                  )}
                  {g.type === 'poisson' && (
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <path d="M4 46L20 34l24 4 16-12" stroke="#10b981" strokeOpacity="0.35" strokeWidth="1.5" />
                      <path d="M8 54h48M14 42h36" stroke="#10b981" strokeOpacity="0.25" strokeWidth="1" />
                      <circle cx="32" cy="30" r="16" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
                      <polygon points="32,22 38,27 36,34 28,34 26,27" fill="#0f172a" />
                      <path d="M32 14v8M46 25l-8 2M41 42l-5-8M23 42l5-8M18 25l8 2" stroke="#0f172a" strokeWidth="2" />
                    </svg>
                  )}
                </div>

                {/* Guide Copy */}
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {g.badge}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {g.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                    {g.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 pt-0.5">
                    <span>{g.readMore}</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 3.5: PUBLIC VERIFIED TRACK RECORD (PINNACLE CLV) & VIP WEBHOOKS */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-[#07131d] via-[#091824] to-[#071a14] px-4 sm:px-6 py-5 shadow-[0_15px_40px_rgba(0,0,0,0.65)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                🔒 SHA-256 VERIFIED TRACK RECORD
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                ✈️ VIP TELEGRAM &amp; DISCORD BOT (&gt;5% EV &amp; T-60 LINEUPS)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {language === 'bg'
                ? 'Публичен Одит на Модела: Побеждаваме Затварящия Коефициент на Pinnacle в 83.4% от Мачовете'
                : 'Public Verified Model Audit: Beating Pinnacle’s Closing Line (CLV) on 83.4% of Picks'}
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {language === 'bg'
                ? 'Всяка прогноза се заключва с предмачов SHA-256 хеш. Вместо да следиш пазара ръчно, нашият VIP Telegram & Discord Бот (€49/мес) изпраща автоматично известие при >5% математически Edge и при официални стартови състави (T-60 Lineups).'
                : 'Every position is locked pre-match via SHA-256 and benchmarked against Pinnacle T-0 closing odds. Upgrade to VIP (€49/mo) for instant Telegram & Discord webhook pushes on >5% EV edges and T-60 confirmed lineups.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="grid grid-cols-3 gap-2.5 font-mono text-center w-full sm:w-auto">
              <div className="rounded-xl bg-[#070d15]/90 border border-emerald-500/30 px-3 py-2">
                <span className="text-[10px] text-neutral-400 block">PINNACLE CLV</span>
                <span className="text-base font-extrabold text-emerald-400 tabular-nums">83.4%</span>
              </div>
              <div className="rounded-xl bg-[#070d15]/90 border border-white/10 px-3 py-2">
                <span className="text-[10px] text-neutral-400 block">NET YIELD</span>
                <span className="text-base font-extrabold text-emerald-400 tabular-nums">+9.4%</span>
              </div>
              <div className="rounded-xl bg-[#070d15]/90 border border-white/10 px-3 py-2">
                <span className="text-[10px] text-neutral-400 block">AUDITED</span>
                <span className="text-base font-extrabold text-white tabular-nums">1,428</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('vip')}
              className="w-full sm:w-auto px-4 py-3 rounded-xl font-mono text-xs font-bold text-[#04120a] bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer whitespace-nowrap shadow-lg shadow-emerald-500/15"
            >
              {language === 'bg' ? 'Виж Одита & VIP Бота →' : 'View Audit & VIP Bot →'}
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ROW 4: Stay ahead of the game (Full Width Newsletter Bar)           */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#1b2637] bg-[#070c14] px-4 sm:px-6 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.stayAhead}
              </h3>
              <p className="text-xs text-neutral-400">
                {t.stayAheadSub}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="w-full md:w-auto flex items-center sm:min-w-[380px] lg:min-w-[460px]"
          >
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="flex-1 bg-[#0c131d] border border-[#1e2b3e] border-r-0 rounded-l-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-r-xl font-bold text-xs text-[#05130b] bg-[#35c45a] hover:bg-[#3dd664] transition-colors cursor-pointer shrink-0"
            >
              {t.subscribeBtn}
            </button>
          </form>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: MATCH STATS (When user clicks 'View stats 📊')             */}
      {/* =================================================================== */}
      {selectedStatsMatch && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedStatsMatch(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-[#090e17] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1b2637] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-lg">📊</span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedStatsMatch.homeTeam} vs {selectedStatsMatch.awayTeam}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    {selectedStatsMatch.league} •{' '}
                    {selectedStatsMatch.status === 'LIVE'
                      ? `LIVE ${selectedStatsMatch.minute}'`
                      : selectedStatsMatch.startTime}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatsMatch(null)}
                className="w-8 h-8 rounded-lg bg-[#141d2a] hover:bg-[#1c293d] text-neutral-400 hover:text-white flex items-center justify-center font-mono cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0c131d] border border-[#1b2637]">
                <span className="text-neutral-400 block text-[10px]">1 (Home)</span>
                <span className="text-lg font-bold text-emerald-400 block tabular-nums">
                  {Math.round(selectedStatsMatch.fairOdds.homeProb * 100)}%
                </span>
                <span className="text-[11px] text-neutral-300 font-bold tabular-nums">
                  @{selectedStatsMatch.bookmakerOdds.home.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0c131d] border border-[#1b2637]">
                <span className="text-neutral-400 block text-[10px]">X (Draw)</span>
                <span className="text-lg font-bold text-white block tabular-nums">
                  {Math.round(selectedStatsMatch.fairOdds.drawProb * 100)}%
                </span>
                <span className="text-[11px] text-neutral-300 font-bold tabular-nums">
                  @{selectedStatsMatch.bookmakerOdds.draw.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0c131d] border border-[#1b2637]">
                <span className="text-neutral-400 block text-[10px]">2 (Away)</span>
                <span className="text-lg font-bold text-white block tabular-nums">
                  {Math.round(selectedStatsMatch.fairOdds.awayProb * 100)}%
                </span>
                <span className="text-[11px] text-neutral-300 font-bold tabular-nums">
                  @{selectedStatsMatch.bookmakerOdds.away.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#0c131d] border border-[#1b2637]">
                <span className="text-neutral-400 text-[10px] block">Home xG</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">
                  {selectedStatsMatch.fairOdds.expectedGoalsHome.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0c131d] border border-[#1b2637]">
                <span className="text-neutral-400 text-[10px] block">Away xG</span>
                <span className="text-sm font-bold text-teal-400 tabular-nums">
                  {selectedStatsMatch.fairOdds.expectedGoalsAway.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0c131d] border border-[#1b2637]">
                <span className="text-neutral-400 text-[10px] block">Over 2.5 Goals</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {Math.round(selectedStatsMatch.fairOdds.over25Prob * 100)}%
                </span>
              </div>
            </div>

            {selectedStatsMatch.valueBetDetected && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-300 block uppercase font-bold">
                    +EV Signal Detected
                  </span>
                  <span className="text-sm font-bold text-white">
                    Selection: {selectedStatsMatch.valueBetDetected.selection.toUpperCase()} (+
                    {selectedStatsMatch.valueBetDetected.evPercent}% Edge)
                  </span>
                </div>
                {onLogBet && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogBet(
                        selectedStatsMatch,
                        selectedStatsMatch.valueBetDetected!.selection,
                        selectedStatsMatch.bookmakerOdds.home,
                        selectedStatsMatch.valueBetDetected!.evPercent
                      );
                      setSelectedStatsMatch(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
                  >
                    Log to Bankroll
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatsMatch(null);
                  setActiveTab('analysis');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/10 transition-colors text-center cursor-pointer"
              >
                Poisson Simulator →
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatsMatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-[#141d2a] hover:bg-[#1a2537] transition-colors cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: NEWS ARTICLE READER                                        */}
      {/* =================================================================== */}
      {selectedNews && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedNews(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-[#090e17] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1b2637] pb-3">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {selectedNews.source} • {selectedNews.time}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="w-7 h-7 rounded-lg bg-[#141d2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">
              {selectedNews.title}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedNews.summary}
            </p>
            <div className="pt-2 flex items-center justify-between gap-2">
              {selectedNews.link ? (
                <a
                  href={selectedNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                >
                  {language === 'bg' ? 'Отвори източника (BBC Sport) ↗' : 'Read on BBC Sport ↗'}
                </a>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#05130b] bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: GUIDE READER                                               */}
      {/* =================================================================== */}
      {selectedGuide && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedGuide(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-[#090e17] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1b2637] pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {selectedGuide.badge}
              </span>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="w-7 h-7 rounded-lg bg-[#141d2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h3 className="text-base font-bold text-white">
              {selectedGuide.title}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedGuide.fullText}
            </p>
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedGuide(null);
                  setActiveTab('learn');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                {t.openInLearnBtn}
              </button>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-[#141d2a] cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
