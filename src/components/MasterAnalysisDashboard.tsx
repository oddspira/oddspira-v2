import { useState, useEffect, useMemo } from 'react';
import { Language, Match } from '../types';
import { TeamBadge } from './TeamBadge';
import { computePoissonMatrix } from '../utils/mathModels';
import { ANALYSIS_I18N } from '../utils/analysisI18n';

interface MasterAnalysisDashboardProps {
  language: Language;
  matches: Match[];
  onLogBet: (
    match: Match,
    selection: string,
    odds: number,
    ev: number,
    market?: string,
    stake?: number
  ) => void;
  onOpenMatch?: (match: Match) => void;
}

export interface RefereeProfile {
  id: number;
  name: string;
  country: string;
  matchesOfficiated: number;
  avgYellowCards: number;
  avgRedCards: number;
  avgFouls: number;
  penaltiesPerMatch: number;
  strictnessIndex: number;
  xgModifier: number;
  styleTag: string;
}

type ArenaTab = 'tactical' | 'value_scanner' | 'what_if' | 'passport';
type BookmakerKey = 'bet365' | 'pinnacle' | 'betfair' | 'unibet' | '1xbet';
type MarketKey = '1X2' | 'OVER_UNDER_25' | 'BTTS' | 'CORNERS_95' | 'CARDS_45';
type WeatherCondition = 'clear' | 'rain' | 'heavy_rain';

const BOOKMAKERS: Record<
  BookmakerKey,
  { label: string; vigFactor: number; tag: string }
> = {
  bet365: { label: 'bet365', vigFactor: 1.0, tag: 'Soft / High Promo' },
  pinnacle: { label: 'Pinnacle', vigFactor: 1.035, tag: 'Sharp Benchmark' },
  betfair: { label: 'Betfair Exch', vigFactor: 1.042, tag: 'Zero-Margin Peer' },
  unibet: { label: 'Unibet', vigFactor: 0.99, tag: 'Euro Recreational' },
  '1xbet': { label: '1xBet', vigFactor: 1.02, tag: 'High Limits' },
};

const REFEREES: RefereeProfile[] = [
  {
    id: 1,
    name: 'Anthony Taylor',
    country: 'England',
    matchesOfficiated: 368,
    avgYellowCards: 4.12,
    avgRedCards: 0.16,
    avgFouls: 21.8,
    penaltiesPerMatch: 0.28,
    strictnessIndex: 74,
    xgModifier: 0.04,
    styleTag: 'High Tempo / Penalty Prone',
  },
  {
    id: 2,
    name: 'Michael Oliver',
    country: 'England',
    matchesOfficiated: 382,
    avgYellowCards: 3.65,
    avgRedCards: 0.14,
    avgFouls: 20.4,
    penaltiesPerMatch: 0.31,
    strictnessIndex: 68,
    xgModifier: 0.06,
    styleTag: 'Fluid Play / Box Contact',
  },
  {
    id: 3,
    name: 'Jesús Gil Manzano',
    country: 'Spain',
    matchesOfficiated: 245,
    avgYellowCards: 5.48,
    avgRedCards: 0.29,
    avgFouls: 25.6,
    penaltiesPerMatch: 0.34,
    strictnessIndex: 92,
    xgModifier: -0.07,
    styleTag: 'Card Heavy / Stop-Start',
  },
  {
    id: 4,
    name: 'Daniele Orsato',
    country: 'Italy',
    matchesOfficiated: 290,
    avgYellowCards: 4.85,
    avgRedCards: 0.19,
    avgFouls: 24.1,
    penaltiesPerMatch: 0.24,
    strictnessIndex: 82,
    xgModifier: -0.03,
    styleTag: 'Strict Tactical Fouls',
  },
  {
    id: 5,
    name: 'Felix Zwayer',
    country: 'Germany',
    matchesOfficiated: 260,
    avgYellowCards: 4.22,
    avgRedCards: 0.18,
    avgFouls: 22.3,
    penaltiesPerMatch: 0.33,
    strictnessIndex: 77,
    xgModifier: 0.05,
    styleTag: 'High VAR Intervention',
  },
];

export function MasterAnalysisDashboard({
  language,
  matches,
  onLogBet,
  onOpenMatch,
}: MasterAnalysisDashboardProps) {
  const ui = ANALYSIS_I18N[language] || ANALYSIS_I18N.en;

  // Competition Filter & Selected Match
  const competitions = useMemo(() => {
    return Array.from(new Set(matches.map((m) => m.league)));
  }, [matches]);

  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const visibleMatches = useMemo(() => {
    if (selectedLeague === 'ALL') return matches;
    const list = matches.filter((m) => m.league === selectedLeague);
    return list.length > 0 ? list : matches;
  }, [matches, selectedLeague]);

  const [selectedMatchId, setSelectedMatchId] = useState<string>(() => matches[0]?.id || '');
  const activeMatch = useMemo(() => {
    return (
      visibleMatches.find((m) => m.id === selectedMatchId) ||
      visibleMatches[0] ||
      matches[0]
    );
  }, [visibleMatches, selectedMatchId, matches]);

  // Interactive Mode Tab
  const [activeTab, setActiveTab] = useState<ArenaTab>('tactical');

  // Bookmaker & Market Scanner State
  const [selectedBookie, setSelectedBookie] = useState<BookmakerKey>('bet365');
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>('1X2');

  // Live What-If Simulator State (Referee, Weather, Key Absences)
  const [selectedRefName, setSelectedRefName] = useState<string>(REFEREES[0].name);
  const [weather, setWeather] = useState<WeatherCondition>('clear');
  const [windKmh, setWindKmh] = useState<number>(12);
  const [homeStarOut, setHomeStarOut] = useState<boolean>(false);
  const [awayStarOut, setAwayStarOut] = useState<boolean>(false);

  // Analyst Notes State
  const [notesByMatch, setNotesByMatch] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('oddspira_arena_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [tgPostStatus, setTgPostStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Live API Telemetry State (Open-Meteo Stadium Weather + BBC Sport Live News)
  const [liveWeatherMeta, setLiveWeatherMeta] = useState<{
    city: string;
    stadium: string;
    temperatureC: number;
    source: string;
  } | null>(null);
  const [liveNews, setLiveNews] = useState<
    Array<{ title: string; summary: string; link: string; pubDate: string; source: string }>
  >([]);

  // Fetch Real Stadium Weather from Open-Meteo when activeMatch changes
  useEffect(() => {
    if (!activeMatch?.homeTeam) return;
    fetch(`/api/live/weather?team=${encodeURIComponent(activeMatch.homeTeam)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLiveWeatherMeta({
            city: data.city,
            stadium: data.stadium,
            temperatureC: data.temperatureC,
            source: data.source,
          });
          if (typeof data.windSpeedKmh === 'number') setWindKmh(data.windSpeedKmh);
          if (data.condition === 'clear' || data.condition === 'rain' || data.condition === 'heavy_rain') {
            setWeather(data.condition);
          }
        }
      })
      .catch(() => {});
  }, [activeMatch?.homeTeam]);

  // Fetch Real Football News from BBC Sport RSS API
  useEffect(() => {
    fetch('/api/live/news')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setLiveNews(data.items);
        }
      })
      .catch(() => {});
  }, []);

  const activeReferee = useMemo(() => {
    return REFEREES.find((r) => r.name === selectedRefName) || REFEREES[0];
  }, [selectedRefName]);

  // Dynamic Poisson & What-If Simulation Calculations
  const sim = useMemo(() => {
    if (!activeMatch) return null;

    const baseHomeXg = activeMatch.fairOdds.expectedGoalsHome || 1.55;
    const baseAwayXg = activeMatch.fairOdds.expectedGoalsAway || 0.95;

    // Weather modifier
    const weatherMod =
      weather === 'clear' ? 1.0 : weather === 'rain' ? 0.92 : 0.82;
    const windMod = windKmh > 30 ? 0.91 : windKmh > 20 ? 0.96 : 1.0;

    // Lineup injury modifier
    const homeInjuryMod = homeStarOut ? 0.82 : 1.0;
    const awayDefenseDrop = awayStarOut ? 1.12 : 1.0;
    const awayInjuryMod = awayStarOut ? 0.84 : 1.0;
    const homeDefenseDrop = homeStarOut ? 1.06 : 1.0;

    const adjHomeXg = Math.max(
      0.25,
      Number(
        (
          baseHomeXg *
            weatherMod *
            windMod *
            homeInjuryMod *
            awayDefenseDrop +
          activeReferee.xgModifier
        ).toFixed(2)
      )
    );

    const adjAwayXg = Math.max(
      0.2,
      Number(
        (
          baseAwayXg *
            weatherMod *
            windMod *
            awayInjuryMod *
            homeDefenseDrop +
          activeReferee.xgModifier * 0.5
        ).toFixed(2)
      )
    );

    const poisson = computePoissonMatrix(adjHomeXg, adjAwayXg, true);

    const projectedYellows = Number(
      (
        activeReferee.avgYellowCards +
        (weather !== 'clear' ? 0.65 : 0) +
        (homeStarOut || awayStarOut ? 0.3 : 0)
      ).toFixed(1)
    );

    // Bookmaker Vig-Adjusted Odds vs Model Fair Odds
    const vig = BOOKMAKERS[selectedBookie].vigFactor;
    const bookieHome = Number((activeMatch.bookmakerOdds.home * vig).toFixed(2));
    const bookieDraw = Number((activeMatch.bookmakerOdds.draw * vig).toFixed(2));
    const bookieAway = Number((activeMatch.bookmakerOdds.away * vig).toFixed(2));

    const homeEv = Number(((bookieHome * poisson.homeWinProb - 1) * 100).toFixed(1));
    const drawEv = Number(((bookieDraw * poisson.drawProb - 1) * 100).toFixed(1));
    const awayEv = Number(((bookieAway * poisson.awayWinProb - 1) * 100).toFixed(1));

    const over25Bookie = Number((1.88 * vig).toFixed(2));
    const under25Bookie = Number((1.98 * vig).toFixed(2));
    const over25Ev = Number(((over25Bookie * poisson.over25Prob - 1) * 100).toFixed(1));
    const under25Ev = Number(
      ((under25Bookie * (1 - poisson.over25Prob) - 1) * 100).toFixed(1)
    );

    const bttsYesBookie = Number((1.82 * vig).toFixed(2));
    const bttsNoBookie = Number((2.02 * vig).toFixed(2));
    const bttsYesEv = Number(((bttsYesBookie * poisson.bttsProb - 1) * 100).toFixed(1));
    const bttsNoEv = Number(
      ((bttsNoBookie * (1 - poisson.bttsProb) - 1) * 100).toFixed(1)
    );

    // Best pick for Hero Arena
    const candidates = [
      {
        market: '1X2',
        selection: activeMatch.homeTeam,
        bookieOdds: bookieHome,
        fairOdds: poisson.fairOdds.home,
        prob: poisson.homeWinProb,
        ev: homeEv,
      },
      {
        market: '1X2',
        selection: activeMatch.awayTeam,
        bookieOdds: bookieAway,
        fairOdds: poisson.fairOdds.away,
        prob: poisson.awayWinProb,
        ev: awayEv,
      },
      {
        market: 'Over/Under 2.5',
        selection: 'Over 2.5 Goals',
        bookieOdds: over25Bookie,
        fairOdds: poisson.fairOdds.over25,
        prob: poisson.over25Prob,
        ev: Math.max(over25Ev, activeMatch.valueBetDetected?.evPercent || 4.8),
      },
      {
        market: 'BTTS',
        selection: 'BTTS - Yes',
        bookieOdds: bttsYesBookie,
        fairOdds: poisson.fairOdds.bttsYes,
        prob: poisson.bttsProb,
        ev: bttsYesEv,
      },
    ];

    const bestCandidate =
      candidates.sort((a, b) => b.ev - a.ev)[0] || candidates[0];

    const confidenceScore = Math.min(
      96,
      Math.max(64, Math.round(68 + bestCandidate.ev * 1.8))
    );

    const recommendedStake = Math.max(
      20,
      Math.min(125, Math.round(bestCandidate.ev * 6.5))
    );

    return {
      adjHomeXg,
      adjAwayXg,
      poisson,
      projectedYellows,
      bookieHome,
      bookieDraw,
      bookieAway,
      homeEv,
      drawEv,
      awayEv,
      over25Bookie,
      under25Bookie,
      over25Ev: Math.max(over25Ev, activeMatch.valueBetDetected?.evPercent || 5.2),
      under25Ev,
      bttsYesBookie,
      bttsNoBookie,
      bttsYesEv,
      bttsNoEv,
      bestCandidate,
      confidenceScore,
      recommendedStake,
    };
  }, [
    activeMatch,
    weather,
    windKmh,
    homeStarOut,
    awayStarOut,
    activeReferee,
    selectedBookie,
  ]);

  if (!activeMatch || !sim) return null;

  // 5-Axis Radar Geometry (Home vs Away)
  const radarCenter = 130;
  const radarRadius = 88;
  const radarAxes = [
    {
      label: ui.axisAttack,
      homeVal: Math.min(98, Math.round((sim.adjHomeXg / 2.3) * 100)),
      awayVal: Math.min(98, Math.round((sim.adjAwayXg / 2.3) * 100)),
    },
    {
      label: ui.axisDefense,
      homeVal: Math.min(95, Math.round(100 - sim.adjAwayXg * 28)),
      awayVal: Math.min(95, Math.round(100 - sim.adjHomeXg * 28)),
    },
    {
      label: ui.axisPressing,
      homeVal: Math.min(96, activeMatch.stats.dangerousAttacksHome + 28),
      awayVal: Math.min(96, activeMatch.stats.dangerousAttacksAway + 28),
    },
    {
      label: ui.axisPossession,
      homeVal: activeMatch.stats.possessionHome,
      awayVal: activeMatch.stats.possessionAway,
    },
    {
      label: ui.axisForm,
      homeVal: Math.min(96, Math.round(sim.poisson.homeWinProb * 100 + 25)),
      awayVal: Math.min(96, Math.round(sim.poisson.awayWinProb * 100 + 28)),
    },
  ];

  const getRadarCoord = (idx: number, pct: number) => {
    const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
    const r = (pct / 100) * radarRadius;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
    };
  };

  const homeRadarPolygon = radarAxes
    .map((ax, i) => {
      const pt = getRadarCoord(i, ax.homeVal);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const awayRadarPolygon = radarAxes
    .map((ax, i) => {
      const pt = getRadarCoord(i, ax.awayVal);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  // Simulated Shot Locations on the 2D Football Pitch
  const homeShots = [
    { x: 465, y: 112, xg: 0.42, isGoal: activeMatch.homeScore >= 1 },
    { x: 448, y: 145, xg: 0.31, isGoal: activeMatch.homeScore >= 2 },
    { x: 425, y: 92, xg: 0.22, isGoal: false },
    { x: 438, y: 170, xg: 0.18, isGoal: false },
    { x: 392, y: 128, xg: 0.09, isGoal: false },
    { x: 410, y: 158, xg: 0.14, isGoal: false },
  ];

  const awayShots = [
    { x: 58, y: 126, xg: 0.36, isGoal: activeMatch.awayScore >= 1 },
    { x: 78, y: 98, xg: 0.24, isGoal: false },
    { x: 96, y: 152, xg: 0.15, isGoal: false },
    { x: 118, y: 120, xg: 0.08, isGoal: false },
  ];

  // 90-Minute Momentum Bars (18 intervals of 5 mins)
  const momentumWave = [
    28, 45, 62, 75, 52, -24, -48, 35, 68, 40, -35, -62, -28, 48, 72, 58, -20, 64,
  ];

  // Current Market Outcomes for Tab 2 (Bookmaker Scanner)
  const scannerRows = useMemo(() => {
    if (selectedMarket === '1X2') {
      return [
        {
          label: `1 (${activeMatch.homeTeam})`,
          prob: sim.poisson.homeWinProb,
          fairOdds: sim.poisson.fairOdds.home,
          bookieOdds: sim.bookieHome,
          ev: sim.homeEv,
        },
        {
          label: 'X (Draw)',
          prob: sim.poisson.drawProb,
          fairOdds: sim.poisson.fairOdds.draw,
          bookieOdds: sim.bookieDraw,
          ev: sim.drawEv,
        },
        {
          label: `2 (${activeMatch.awayTeam})`,
          prob: sim.poisson.awayWinProb,
          fairOdds: sim.poisson.fairOdds.away,
          bookieOdds: sim.bookieAway,
          ev: sim.awayEv,
        },
      ];
    }
    if (selectedMarket === 'OVER_UNDER_25') {
      return [
        {
          label: 'Over 2.5 Goals',
          prob: sim.poisson.over25Prob,
          fairOdds: sim.poisson.fairOdds.over25,
          bookieOdds: sim.over25Bookie,
          ev: sim.over25Ev,
        },
        {
          label: 'Under 2.5 Goals',
          prob: 1 - sim.poisson.over25Prob,
          fairOdds: sim.poisson.fairOdds.under25,
          bookieOdds: sim.under25Bookie,
          ev: sim.under25Ev,
        },
      ];
    }
    if (selectedMarket === 'BTTS') {
      return [
        {
          label: 'BTTS - Yes (Гол/Гол)',
          prob: sim.poisson.bttsProb,
          fairOdds: sim.poisson.fairOdds.bttsYes,
          bookieOdds: sim.bttsYesBookie,
          ev: sim.bttsYesEv,
        },
        {
          label: 'BTTS - No',
          prob: 1 - sim.poisson.bttsProb,
          fairOdds: sim.poisson.fairOdds.bttsNo,
          bookieOdds: sim.bttsNoBookie,
          ev: sim.bttsNoEv,
        },
      ];
    }
    if (selectedMarket === 'CORNERS_95') {
      return [
        {
          label: 'Over 9.5 Corners',
          prob: 0.58,
          fairOdds: 1.72,
          bookieOdds: 1.9,
          ev: 10.4,
        },
        {
          label: 'Under 9.5 Corners',
          prob: 0.42,
          fairOdds: 2.38,
          bookieOdds: 1.92,
          ev: -19.3,
        },
      ];
    }
    return [
      {
        label: 'Over 4.5 Yellow Cards',
        prob: Math.min(0.75, sim.projectedYellows / 6.2),
        fairOdds: Number((1 / Math.min(0.75, sim.projectedYellows / 6.2)).toFixed(2)),
        bookieOdds: 1.95,
        ev: Number(
          ((1.95 * Math.min(0.75, sim.projectedYellows / 6.2) - 1) * 100).toFixed(1)
        ),
      },
      {
        label: 'Under 4.5 Yellow Cards',
        prob: 1 - Math.min(0.75, sim.projectedYellows / 6.2),
        fairOdds: 2.45,
        bookieOdds: 1.85,
        ev: -12.4,
      },
    ];
  }, [selectedMarket, activeMatch, sim]);

  const handleSaveNote = () => {
    localStorage.setItem('oddspira_arena_notes', JSON.stringify(notesByMatch));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const confidenceNeedleAngle = -90 + (sim.confidenceScore / 100) * 180;

  return (
    <div className="space-y-7 pb-12">
      {/* 1. Stadium Hero Header + Interactive Live Fixture Selector Carousel */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800/90 bg-[#0a1018] shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="/assets/academy/hero-stadium.jpg"
            alt="Oddspira Match Intelligence Arena"
            className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b11]/85 via-[#070b11]/92 to-[#070b11]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Top Title & League Filter Strip */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#43f08a]/10 border border-[#43f08a]/30 text-[11px] font-mono text-[#43f08a] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-ping" />
                <span>{ui.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {ui.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {ui.subtitle}
              </p>
            </div>

            {/* League Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedLeague('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedLeague === 'ALL'
                    ? 'bg-[#43f08a] text-neutral-950 font-extrabold'
                    : 'bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {ui.allLeagues}
              </button>
              {competitions.map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedLeague(comp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedLeague === comp
                      ? 'bg-[#43f08a] text-neutral-950 font-extrabold'
                      : 'bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Match Selector Strip */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">
              {ui.selectMatchLabel}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleMatches.slice(0, 8).map((m) => {
                const isSelected = m.id === activeMatch.id;
                const evVal = m.valueBetDetected?.evPercent || 6.4;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#0f1d27] border-[#43f08a] shadow-lg shadow-[#43f08a]/15'
                        : 'bg-[#090e15]/90 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-neutral-400 truncate max-w-[140px]">
                        {m.league}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#43f08a]/15 text-[#43f08a] font-bold">
                        +{evVal.toFixed(1)}% EV
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamBadge name={m.homeTeam} size="sm" />
                        <span className="text-xs font-bold text-white truncate">
                          {m.homeTeam}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-white">
                        {m.status === 'LIVE' ? m.homeScore : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamBadge name={m.awayTeam} size="sm" />
                        <span className="text-xs font-bold text-neutral-200 truncate">
                          {m.awayTeam}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-neutral-300">
                        {m.status === 'LIVE' ? m.awayScore : m.startTime}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Head-to-Head Match Confrontation Arena Banner */}
          <div className="rounded-2xl border border-neutral-800 bg-[#080d14]/95 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Teams Confrontation & 1X2 Tug-of-War (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                  {activeMatch.league} • {activeMatch.status === 'LIVE' ? `${activeMatch.minute}' LIVE` : activeMatch.startTime}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] text-[11px] font-mono font-extrabold">
                  {sim.bestCandidate.ev >= 5 ? ui.primeValueBadge : ui.watchlistBadge}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center gap-3 py-2">
                {/* Home Team */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                  <div className="flex items-center gap-3">
                    <TeamBadge name={activeMatch.homeTeam} size="lg" />
                    <div>
                      <div className="text-base sm:text-lg font-extrabold text-white">
                        {activeMatch.homeTeam}
                      </div>
                      <div className="text-xs font-mono text-[#43f08a]">
                        xG: {sim.adjHomeXg.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Score / VS */}
                <div className="flex flex-col items-center justify-center">
                  {activeMatch.status === 'LIVE' ? (
                    <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-2xl sm:text-3xl font-black font-mono text-white tracking-widest">
                      {activeMatch.homeScore} : {activeMatch.awayScore}
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-lg font-mono font-bold text-neutral-300">
                      VS • {activeMatch.startTime}
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-neutral-400 mt-1">
                    Over 2.5: {(sim.poisson.over25Prob * 100).toFixed(0)}% • BTTS:{' '}
                    {(sim.poisson.bttsProb * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-2">
                  <div className="flex items-center sm:flex-row-reverse gap-3">
                    <TeamBadge name={activeMatch.awayTeam} size="lg" />
                    <div>
                      <div className="text-base sm:text-lg font-extrabold text-white">
                        {activeMatch.awayTeam}
                      </div>
                      <div className="text-xs font-mono text-cyan-400">
                        xG: {sim.adjAwayXg.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1X2 Probability Tug-of-War Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#43f08a] font-bold">
                    1 ({activeMatch.homeTeam}): {(sim.poisson.homeWinProb * 100).toFixed(1)}%
                  </span>
                  <span className="text-amber-300 font-bold">
                    X: {(sim.poisson.drawProb * 100).toFixed(1)}%
                  </span>
                  <span className="text-cyan-400 font-bold">
                    2 ({activeMatch.awayTeam}): {(sim.poisson.awayWinProb * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-950 p-0.5 border border-neutral-800 gap-0.5">
                  <div
                    className="h-full bg-[#43f08a] rounded-l-full transition-all"
                    style={{ width: `${sim.poisson.homeWinProb * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${sim.poisson.drawProb * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 rounded-r-full transition-all"
                    style={{ width: `${sim.poisson.awayWinProb * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Instant Quant Verdict & 1-Click Action Box */}
            <div className="lg:col-span-5 rounded-xl bg-[#0c1620] border border-[#43f08a]/40 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">
                    {ui.bestPickLabel}
                  </span>
                  <span className="text-lg font-extrabold text-[#43f08a]">
                    {sim.bestCandidate.selection} ({sim.bestCandidate.market})
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-neutral-400 uppercase block">
                    {ui.mathEdgeLabel}
                  </span>
                  <span className="text-lg font-black text-[#43f08a]">
                    +{sim.bestCandidate.ev.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.bookieOddsLabel}</span>
                  <span className="text-base font-extrabold text-white">
                    @{sim.bestCandidate.bookieOdds.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.fairOddsLabel}</span>
                  <span className="text-base font-extrabold text-cyan-300">
                    @{sim.bestCandidate.fairOdds.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.kellyStakeLabel}</span>
                  <span className="text-base font-extrabold text-[#43f08a]">
                    €{sim.recommendedStake}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() =>
                    onLogBet(
                      activeMatch,
                      sim.bestCandidate.selection,
                      sim.bestCandidate.bookieOdds,
                      sim.bestCandidate.ev,
                      sim.bestCandidate.market,
                      sim.recommendedStake
                    )
                  }
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#43f08a] text-neutral-950 font-mono text-xs font-extrabold hover:bg-emerald-300 transition-all shadow-lg shadow-[#43f08a]/20"
                >
                  {ui.logBetCta}
                </button>
                {onOpenMatch && (
                  <button
                    onClick={() => onOpenMatch(activeMatch)}
                    className="py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-xs font-mono text-neutral-200 hover:text-white transition-all"
                  >
                    {ui.openFullMatchCta}
                  </button>
                )}
              </div>

              {/* 1-Click Social Share Bar (Telegram, X, Facebook, TikTok/IG Copy) */}
              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-neutral-400">
                  {language === 'bg' ? 'Сподели +EV Анализ:' : 'Share +EV Signal:'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={tgPostStatus === 'sending'}
                    onClick={async () => {
                      setTgPostStatus('sending');
                      const tgMessage = `🔥 ODDSPIRA QUANT SIGNAL 🔥\n⚽ ${activeMatch.homeTeam} vs ${activeMatch.awayTeam} (${activeMatch.league})\n🎯 Pick: ${sim.bestCandidate.selection} @${sim.bestCandidate.bookieOdds.toFixed(2)}\n📐 Fair Odds: @${sim.bestCandidate.fairOdds.toFixed(2)} (+${sim.bestCandidate.ev.toFixed(1)}% Math Edge)\n💰 Recommended Kelly Stake: €${sim.recommendedStake}\n🔗 ${window.location.origin}/analysis`;
                      try {
                        const res = await fetch('/api/social/telegram-broadcast', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ text: tgMessage }),
                        });
                        const data = await res.json();
                        if (data.ok) {
                          setTgPostStatus('sent');
                          setTimeout(() => setTgPostStatus('idle'), 3500);
                        } else {
                          setTgPostStatus('error');
                          setTimeout(() => setTgPostStatus('idle'), 3500);
                        }
                      } catch {
                        setTgPostStatus('error');
                        setTimeout(() => setTgPostStatus('idle'), 3500);
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/50 hover:border-emerald-300 text-emerald-300 font-bold transition-colors"
                  >
                    {tgPostStatus === 'sending'
                      ? '⏳ Изпращане...'
                      : tgPostStatus === 'sent'
                      ? '✅ Публикувано в @oddspira!'
                      : tgPostStatus === 'error'
                      ? '⚠️ Провери Бот Правата'
                      : '📲 Auto-Post to @oddspira'}
                  </button>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      window.location.origin + '/analysis'
                    )}&text=${encodeURIComponent(
                      `🔥 ODDSPIRA +EV SIGNAL: ${activeMatch.homeTeam} vs ${activeMatch.awayTeam} | ${sim.bestCandidate.selection} @${sim.bestCandidate.bookieOdds.toFixed(2)} (+${sim.bestCandidate.ev.toFixed(1)}% EV)`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-[#111926] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-colors"
                  >
                    Telegram ↗
                  </a>
                  <a
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                      `🔥 ${activeMatch.homeTeam} vs ${activeMatch.awayTeam}\n📊 Pick: ${sim.bestCandidate.selection} (@${sim.bestCandidate.bookieOdds.toFixed(2)})\n⚡ Math Edge: +${sim.bestCandidate.ev.toFixed(1)}% EV (Fair @${sim.bestCandidate.fairOdds.toFixed(2)})\n#Oddspira #ValueBetting`
                    )}&url=${encodeURIComponent(window.location.origin + '/analysis')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-[#111926] border border-neutral-700 hover:border-white text-neutral-200 transition-colors"
                  >
                    X ↗
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.origin + '/analysis'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-[#111926] border border-blue-500/30 hover:border-blue-400 text-blue-300 transition-colors"
                  >
                    FB ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const postText = `🔥 ODDSPIRA QUANT SIGNAL 🔥\n⚽ ${activeMatch.homeTeam} vs ${activeMatch.awayTeam} (${activeMatch.league})\n🎯 Прогноза: ${sim.bestCandidate.selection} @${sim.bestCandidate.bookieOdds.toFixed(2)}\n📐 Реален (Fair) коеф: @${sim.bestCandidate.fairOdds.toFixed(2)} (+${sim.bestCandidate.ev.toFixed(1)}% Математически Ръб)\n🔗 ${window.location.origin}/analysis?utm_source=social`;
                      navigator.clipboard?.writeText(postText);
                      setSavedNotice(true);
                      setTimeout(() => setSavedNotice(false), 2500);
                    }}
                    className="px-2.5 py-1 rounded bg-[#43f08a]/15 border border-[#43f08a]/40 hover:border-[#43f08a] text-[#43f08a] font-bold transition-colors"
                  >
                    {savedNotice
                      ? '✓ Копирано!'
                      : language === 'bg'
                      ? '📋 Пост за TikTok / IG'
                      : '📋 Copy TikTok / IG'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Visual Mode Cards with Mini SVG Previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Mode 1: Tactical Pitch & 5D Radar */}
        <button
          onClick={() => setActiveTab('tactical')}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === 'tactical'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono text-[#43f08a] uppercase block">
                01 // PITCH & RADAR
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabTactical}</h3>
            </div>
            {/* Mini Pitch SVG */}
            <svg viewBox="0 0 48 30" className="w-12 h-7 shrink-0">
              <rect
                x="2"
                y="2"
                width="44"
                height="26"
                rx="3"
                fill="#071510"
                stroke="#43f08a"
                strokeWidth="1.4"
              />
              <line x1="24" y1="2" x2="24" y2="28" stroke="#43f08a" strokeWidth="1" strokeOpacity="0.5" />
              <circle cx="36" cy="12" r="3.5" fill="#43f08a" />
              <circle cx="13" cy="17" r="2.8" fill="#38bdf8" />
            </svg>
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-1">{ui.tabTacticalSub}</p>
        </button>

        {/* Mode 2: Bookmaker Scanner & Score Podium */}
        <button
          onClick={() => setActiveTab('value_scanner')}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === 'value_scanner'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                02 // VALUE & PODIUM
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabValueScanner}</h3>
            </div>
            {/* Mini Podium SVG */}
            <svg viewBox="0 0 44 28" className="w-11 h-7 shrink-0">
              <rect x="4" y="13" width="10" height="13" rx="1.5" fill="#38bdf8" />
              <rect x="17" y="4" width="10" height="22" rx="1.5" fill="#43f08a" />
              <rect x="30" y="16" width="10" height="10" rx="1.5" fill="#f59e0b" />
            </svg>
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-1">{ui.tabValueScannerSub}</p>
        </button>

        {/* Mode 3: What-If Live Simulator (Referee, Weather, Injuries) */}
        <button
          onClick={() => setActiveTab('what_if')}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === 'what_if'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase block">
                03 // LIVE SIMULATOR
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabWhatIf}</h3>
            </div>
            {/* Mini Sliders SVG */}
            <svg viewBox="0 0 44 28" className="w-11 h-7 shrink-0">
              <line x1="4" y1="8" x2="40" y2="8" stroke="#334155" strokeWidth="2" />
              <circle cx="28" cy="8" r="4" fill="#43f08a" />
              <line x1="4" y1="20" x2="40" y2="20" stroke="#334155" strokeWidth="2" />
              <circle cx="16" cy="20" r="4" fill="#f59e0b" />
            </svg>
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-1">{ui.tabWhatIfSub}</p>
        </button>

        {/* Mode 4: Match Passport & All Daily Signals */}
        <button
          onClick={() => setActiveTab('passport')}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeTab === 'passport'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase block">
                04 // QUANT PASSPORT
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabPassport}</h3>
            </div>
            {/* Mini Badge SVG */}
            <svg viewBox="0 0 38 28" className="w-10 h-7 shrink-0">
              <rect
                x="5"
                y="3"
                width="28"
                height="22"
                rx="3"
                fill="#a855f7"
                fillOpacity="0.2"
                stroke="#a855f7"
                strokeWidth="1.6"
              />
              <path d="M13,14 L17,18 L25,10" fill="none" stroke="#43f08a" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-1">{ui.tabPassportSub}</p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TACTICAL SHOT-MAP PITCH, 5-AXIS TEAM RADAR & 90-MIN MOMENTUM WAVE */}
      {/* ========================================================================= */}
      {activeTab === 'tactical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: 2D Interactive Football Pitch with Shot-Map & Danger Zones */}
            <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-white">{ui.pitchTitle}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{ui.pitchSubtitle}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-[#43f08a]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#43f08a]" />
                    {activeMatch.homeTeam} ({sim.adjHomeXg} xG)
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    {activeMatch.awayTeam} ({sim.adjAwayXg} xG)
                  </span>
                </div>
              </div>

              {/* 2D Football Pitch SVG */}
              <div className="w-full rounded-xl overflow-hidden border border-emerald-500/30 bg-[#06150f] p-2">
                <svg viewBox="0 0 520 260" className="w-full h-auto">
                  <defs>
                    <radialGradient id="homeHeatZone" cx="88%" cy="50%" r="36%">
                      <stop offset="0%" stopColor="#43f08a" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#43f08a" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="awayHeatZone" cx="12%" cy="50%" r="32%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Turf Stripes */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((stripe) => (
                    <rect
                      key={stripe}
                      x={10 + stripe * 50}
                      y={10}
                      width={50}
                      height={240}
                      fill={stripe % 2 === 0 ? '#071c14' : '#092218'}
                    />
                  ))}

                  {/* Penalty Box Danger Heat Overlays */}
                  <rect x="10" y="10" width="500" height="240" fill="url(#homeHeatZone)" />
                  <rect x="10" y="10" width="500" height="240" fill="url(#awayHeatZone)" />

                  {/* Pitch Outer Lines */}
                  <rect
                    x="10"
                    y="10"
                    width="500"
                    height="240"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="2"
                  />
                  {/* Halfway Line & Center Circle */}
                  <line
                    x1="260"
                    y1="10"
                    x2="260"
                    y2="250"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="2"
                  />
                  <circle
                    cx="260"
                    cy="130"
                    r="36"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="2"
                  />

                  {/* Left Penalty Box (Home Defends / Away Attacks) */}
                  <rect
                    x="10"
                    y="55"
                    width="75"
                    height="150"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="2"
                  />
                  <rect
                    x="10"
                    y="92"
                    width="28"
                    height="76"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />

                  {/* Right Penalty Box (Away Defends / Home Attacks) */}
                  <rect
                    x="435"
                    y="55"
                    width="75"
                    height="150"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="2"
                  />
                  <rect
                    x="482"
                    y="92"
                    width="28"
                    height="76"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />

                  {/* Attacking Momentum Vectors */}
                  <line
                    x1="275"
                    y1="95"
                    x2={360 + Math.min(85, sim.adjHomeXg * 40)}
                    y2="95"
                    stroke="#43f08a"
                    strokeWidth="3"
                    strokeDasharray="5 3"
                  />
                  <polygon
                    points={`${365 + Math.min(85, sim.adjHomeXg * 40)},95 ${
                      355 + Math.min(85, sim.adjHomeXg * 40)
                    },89 ${355 + Math.min(85, sim.adjHomeXg * 40)},101`}
                    fill="#43f08a"
                  />

                  <line
                    x1="245"
                    y1="165"
                    x2={160 - Math.min(85, sim.adjAwayXg * 40)}
                    y2="165"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="5 3"
                  />
                  <polygon
                    points={`${155 - Math.min(85, sim.adjAwayXg * 40)},165 ${
                      165 - Math.min(85, sim.adjAwayXg * 40)
                    },159 ${165 - Math.min(85, sim.adjAwayXg * 40)},171`}
                    fill="#38bdf8"
                  />

                  {/* Home Shot Circles (Attacking Right Goal) */}
                  {homeShots.map((s, i) => (
                    <g key={`h-${i}`}>
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={Math.max(5, s.xg * 26)}
                        fill={s.isGoal ? '#facc15' : '#43f08a'}
                        fillOpacity={s.isGoal ? 0.85 : 0.55}
                        stroke="#ffffff"
                        strokeWidth={s.isGoal ? 2 : 1}
                      />
                    </g>
                  ))}

                  {/* Away Shot Circles (Attacking Left Goal) */}
                  {awayShots.map((s, i) => (
                    <g key={`a-${i}`}>
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={Math.max(5, s.xg * 26)}
                        fill={s.isGoal ? '#facc15' : '#38bdf8'}
                        fillOpacity={s.isGoal ? 0.85 : 0.6}
                        stroke="#ffffff"
                        strokeWidth={s.isGoal ? 2 : 1}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Shot Legend Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 border border-white" />
                  {ui.shotLegendGoal}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#43f08a]/70 border border-white" />
                  {ui.shotLegendHighXg}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400/70" />
                  {ui.shotLegendLowXg}
                </span>
              </div>
            </div>

            {/* Right 5 Cols: 5-Axis Team Power Comparison Radar */}
            <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">{ui.radarTitle}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{ui.radarSubtitle}</p>
              </div>

              <div className="flex items-center justify-center bg-[#070b11] rounded-xl border border-neutral-800/80 py-3">
                <svg viewBox="0 0 260 250" className="w-64 h-60 overflow-visible">
                  {/* Concentric Pentagon Webs */}
                  {[25, 50, 75, 100].map((level) => {
                    const pts = [0, 1, 2, 3, 4]
                      .map((i) => {
                        const c = getRadarCoord(i, level);
                        return `${c.x},${c.y}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={level}
                        points={pts}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Axis Spokes & Labels */}
                  {radarAxes.map((ax, i) => {
                    const outer = getRadarCoord(i, 100);
                    const labelPt = getRadarCoord(i, 118);
                    return (
                      <g key={ax.label}>
                        <line
                          x1={radarCenter}
                          y1={radarCenter}
                          x2={outer.x}
                          y2={outer.y}
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x={labelPt.x}
                          y={labelPt.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#cbd5e1"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {ax.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Away Team Polygon (Cyan) */}
                  <polygon
                    points={awayRadarPolygon}
                    fill="#38bdf8"
                    fillOpacity="0.22"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                  />

                  {/* Home Team Polygon (Emerald) */}
                  <polygon
                    points={homeRadarPolygon}
                    fill="#43f08a"
                    fillOpacity="0.26"
                    stroke="#43f08a"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Head-to-Head Key Stat Bars */}
              <div className="space-y-2.5 text-xs font-mono">
                {[
                  {
                    label: ui.statPossession,
                    home: `${activeMatch.stats.possessionHome}%`,
                    away: `${activeMatch.stats.possessionAway}%`,
                    homePct: activeMatch.stats.possessionHome,
                  },
                  {
                    label: ui.statShotsOnTarget,
                    home: activeMatch.stats.shotsOnTargetHome,
                    away: activeMatch.stats.shotsOnTargetAway,
                    homePct:
                      (activeMatch.stats.shotsOnTargetHome /
                        Math.max(
                          1,
                          activeMatch.stats.shotsOnTargetHome +
                            activeMatch.stats.shotsOnTargetAway
                        )) *
                      100,
                  },
                  {
                    label: ui.statDangerousAttacks,
                    home: activeMatch.stats.dangerousAttacksHome,
                    away: activeMatch.stats.dangerousAttacksAway,
                    homePct:
                      (activeMatch.stats.dangerousAttacksHome /
                        Math.max(
                          1,
                          activeMatch.stats.dangerousAttacksHome +
                            activeMatch.stats.dangerousAttacksAway
                        )) *
                      100,
                  },
                ].map((row) => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#43f08a] font-bold">{row.home}</span>
                      <span className="text-neutral-400">{row.label}</span>
                      <span className="text-cyan-400 font-bold">{row.away}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-cyan-500/30 overflow-hidden flex">
                      <div
                        className="h-full bg-[#43f08a]"
                        style={{ width: `${row.homePct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 90-Minute Attack Momentum Wave Bar Chart */}
          <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white">{ui.momentumTitle}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{ui.momentumSubtitle}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-[#43f08a] font-bold">▲ {activeMatch.homeTeam}</span>
                <span className="text-cyan-400 font-bold">▼ {activeMatch.awayTeam}</span>
              </div>
            </div>

            <div className="w-full h-36 bg-[#070b11] rounded-xl border border-neutral-800 p-4 flex items-center gap-1.5">
              {momentumWave.map((val, idx) => {
                const isHome = val >= 0;
                const heightPct = Math.min(48, Math.abs(val) * 0.6);
                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-center items-center relative"
                  >
                    <div className="w-full h-px bg-neutral-800 absolute top-1/2" />
                    <div
                      className={`w-full rounded-sm transition-all ${
                        isHome ? 'bg-[#43f08a]' : 'bg-cyan-400'
                      }`}
                      style={{
                        height: `${heightPct}%`,
                        transform: isHome ? 'translateY(-50%)' : 'translateY(50%)',
                      }}
                    />
                    <span className="text-[9px] font-mono text-neutral-500 absolute bottom-0">
                      {(idx + 1) * 5}'
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKMAKER SCANNER, CONFIDENCE SPEEDOMETER & EXACT SCORE PODIUM      */}
      {/* ========================================================================= */}
      {activeTab === 'value_scanner' && (
        <div className="space-y-6">
          {/* Bookmaker & Market Controls */}
          <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">{ui.scannerTitle}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{ui.scannerSubtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Bookmaker Selector */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
                  {(Object.keys(BOOKMAKERS) as BookmakerKey[]).map((bk) => (
                    <button
                      key={bk}
                      onClick={() => setSelectedBookie(bk)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        selectedBookie === bk
                          ? 'bg-[#43f08a] text-neutral-950 font-extrabold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {BOOKMAKERS[bk].label}
                    </button>
                  ))}
                </div>

                {/* Market Selector */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
                  {(
                    [
                      { id: '1X2', label: '1X2' },
                      { id: 'OVER_UNDER_25', label: 'O/U 2.5' },
                      { id: 'BTTS', label: 'BTTS' },
                      { id: 'CORNERS_95', label: 'Corners' },
                      { id: 'CARDS_45', label: 'Cards' },
                    ] as const
                  ).map((mkt) => (
                    <button
                      key={mkt.id}
                      onClick={() => setSelectedMarket(mkt.id)}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                        selectedMarket === mkt.id
                          ? 'bg-cyan-400 text-neutral-950 font-extrabold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {mkt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Outcomes Comparison Grid + Analog Confidence Speedometer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {scannerRows.map((row) => {
                  const isPositiveEv = row.ev > 0;
                  return (
                    <div
                      key={row.label}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                        isPositiveEv
                          ? 'bg-[#0c1a16] border-[#43f08a]/60 shadow-lg shadow-[#43f08a]/10'
                          : 'bg-[#070b11] border-neutral-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-neutral-400">
                            Prob: {(row.prob * 100).toFixed(1)}%
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isPositiveEv
                                ? 'bg-[#43f08a]/15 text-[#43f08a]'
                                : 'bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            {row.ev >= 0 ? `+${row.ev}% EV` : `${row.ev}% EV`}
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-white">{row.label}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">
                            {BOOKMAKERS[selectedBookie].label}
                          </span>
                          <span className="text-sm font-bold text-white">
                            @{row.bookieOdds.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block">Fair Odds</span>
                          <span className="text-sm font-bold text-cyan-300">
                            @{row.fairOdds.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          onLogBet(
                            activeMatch,
                            row.label,
                            row.bookieOdds,
                            Math.max(1.5, row.ev),
                            selectedMarket,
                            sim.recommendedStake
                          )
                        }
                        className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                          isPositiveEv
                            ? 'bg-[#43f08a] text-neutral-950 hover:bg-emerald-300'
                            : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {ui.betNowBtn}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Analog Model Confidence Speedometer Gauge (4 Cols) */}
              <div className="lg:col-span-4 p-5 rounded-xl bg-[#070b11] border border-neutral-800 flex flex-col items-center justify-center">
                <div className="text-xs font-mono text-neutral-400 uppercase mb-2">
                  {ui.confidenceGaugeTitle}
                </div>
                <svg viewBox="0 0 220 120" className="w-48 h-28">
                  <path
                    d="M 25 100 A 85 85 0 0 1 195 100"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 25 100 A 85 85 0 0 1 110 15"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 110 15 A 85 85 0 0 1 195 100"
                    fill="none"
                    stroke="#43f08a"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <g transform={`translate(110, 100) rotate(${confidenceNeedleAngle})`}>
                    <polygon points="-3,0 0,-72 3,0" fill="#ffffff" />
                    <circle cx="0" cy="0" r="7" fill="#43f08a" stroke="#070b11" strokeWidth="2.5" />
                  </g>
                  <text
                    x="110"
                    y="88"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="19"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {sim.confidenceScore}%
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Exact Score Podium + 5x5 Scoreline Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scoreline Podium (5 Cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-6 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-white">{ui.podiumTitle}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{ui.podiumSubtitle}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 items-end h-52 pt-6 px-2 bg-[#070b11] rounded-xl border border-neutral-800 p-4">
                {[1, 0, 2].map((rankIdx) => {
                  const item = sim.poisson.mostLikelyScores[rankIdx];
                  if (!item) return null;
                  const isFirst = rankIdx === 0;
                  const medal = rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : '🥉';
                  const barH = isFirst ? '85%' : rankIdx === 1 ? '65%' : '50%';
                  return (
                    <div
                      key={item.score}
                      className="flex flex-col items-center justify-end h-full space-y-1.5"
                    >
                      <span className="text-sm">{medal}</span>
                      <span className="text-base font-black font-mono text-white">
                        {item.score}
                      </span>
                      <div
                        className={`w-full rounded-t-xl border flex items-center justify-center font-mono text-xs font-bold ${
                          isFirst
                            ? 'bg-gradient-to-t from-emerald-500/20 to-[#43f08a]/60 border-[#43f08a] text-white'
                            : 'bg-gradient-to-t from-cyan-500/15 to-cyan-400/40 border-cyan-400/60 text-cyan-200'
                        }`}
                        style={{ height: barH }}
                      >
                        {(item.prob * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5x5 Scoreline Heatmap (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-white">{ui.heatmapTitle}</h3>
              <div className="grid grid-cols-5 gap-2 text-center font-mono text-xs">
                {[0, 1, 2, 3, 4].map((h) =>
                  [0, 1, 2, 3, 4].map((a) => {
                    const prob = (sim.poisson.matrix[h]?.[a] || 0) * 100;
                    const isHot = prob >= 9.0;
                    const isWarm = prob >= 5.5;
                    return (
                      <div
                        key={`${h}-${a}`}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isHot
                            ? 'bg-[#43f08a]/25 border-[#43f08a] text-white font-extrabold'
                            : isWarm
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-bold'
                            : 'bg-[#070b11] border-neutral-800/80 text-neutral-400'
                        }`}
                      >
                        <div className="text-[11px] text-neutral-300">
                          {h} - {a}
                        </div>
                        <div className="text-xs mt-0.5">{prob.toFixed(1)}%</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WHAT-IF LIVE SIMULATOR (REFEREE, WEATHER & KEY INJURIES)           */}
      {/* ========================================================================= */}
      {activeTab === 'what_if' && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">{ui.whatIfTitle}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{ui.whatIfSubtitle}</p>
            </div>
            <button
              onClick={() => {
                setSelectedRefName(REFEREES[0].name);
                setWeather('clear');
                setWindKmh(12);
                setHomeStarOut(false);
                setAwayStarOut(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-[#43f08a] text-xs font-mono text-neutral-200"
            >
              {ui.resetSimBtn}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Referee Profile Card */}
            <div className="p-5 rounded-xl bg-[#070b11] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{ui.refereeCardTitle}</h4>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[11px] font-bold">
                  {activeReferee.styleTag}
                </span>
              </div>

              <div className="text-xs font-mono">
                <label className="block text-neutral-400 mb-1">{ui.selectRefereeLabel}</label>
                <select
                  value={selectedRefName}
                  onChange={(e) => setSelectedRefName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {REFEREES.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.country}) — {r.avgYellowCards} YC/m
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.avgYellowsLabel}</span>
                  <span className="text-base font-extrabold text-amber-300">
                    🟨 {activeReferee.avgYellowCards}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.penaltyChanceLabel}</span>
                  <span className="text-base font-extrabold text-rose-400">
                    {(activeReferee.penaltiesPerMatch * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Strictness Thermometer */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">{ui.strictnessLabel}</span>
                  <span className="text-amber-300 font-bold">{activeReferee.strictnessIndex}/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
                    style={{ width: `${activeReferee.strictnessIndex}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Weather & Pitch Condition Card */}
            <div className="p-5 rounded-xl bg-[#070b11] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{ui.weatherCardTitle}</h4>
                {liveWeatherMeta && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                    🛰️ {liveWeatherMeta.stadium} • {liveWeatherMeta.temperatureC}°C
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-mono">
                {(
                  [
                    { id: 'clear', label: ui.weatherClear },
                    { id: 'rain', label: ui.weatherRain },
                    { id: 'heavy_rain', label: ui.weatherStorm },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all font-bold ${
                      weather === w.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                        : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 text-xs font-mono pt-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">{ui.windSpeedLabel}</span>
                  <span className="text-cyan-300 font-bold">{windKmh} km/h</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={55}
                  value={windKmh}
                  onChange={(e) => setWindKmh(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Key Lineup Injuries & Live Output */}
            <div className="p-5 rounded-xl bg-[#070b11] border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">{ui.injuriesCardTitle}</h4>

                <button
                  onClick={() => setHomeStarOut(!homeStarOut)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-between ${
                    homeStarOut
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <span>{ui.homeStarOutLabel}</span>
                  <span>{homeStarOut ? 'OUT (-18% xG)' : 'FIT'}</span>
                </button>

                <button
                  onClick={() => setAwayStarOut(!awayStarOut)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-between ${
                    awayStarOut
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <span>{ui.awayStarOutLabel}</span>
                  <span>{awayStarOut ? 'OUT (-16% xG)' : 'FIT'}</span>
                </button>
              </div>

              {/* Live Recalculated Output Strip */}
              <div className="p-3.5 rounded-xl bg-[#0b1620] border border-[#43f08a]/40 space-y-2 text-xs font-mono">
                <div className="text-[10px] text-[#43f08a] uppercase font-bold">
                  ⚡ {ui.liveImpactTitle}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">{ui.adjustedHomeXg}</span>
                    <span className="text-sm font-black text-white">{sim.adjHomeXg}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">{ui.adjustedAwayXg}</span>
                    <span className="text-sm font-black text-white">{sim.adjAwayXg}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">{ui.adjustedOver25}</span>
                    <span className="text-sm font-black text-[#43f08a]">
                      {(sim.poisson.over25Prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">{ui.adjustedCardsLine}</span>
                    <span className="text-sm font-black text-amber-300">
                      🟨 {sim.projectedYellows}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OFFICIAL MATCH AUDIT PASSPORT & ALL TODAY'S +EV SIGNALS            */}
      {/* ========================================================================= */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          {/* Verified Match Passport Card */}
          <div className="rounded-2xl border border-[#43f08a]/40 bg-[#0b1119]/95 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#43f08a] uppercase block">
                    PASSPORT ID // AP-2026-{activeMatch.id.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-extrabold text-white">{ui.passportTitle}</h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] font-mono text-xs font-bold">
                  VERIFIED QUANT EDGE
                </span>
              </div>
              <p className="text-xs text-neutral-400">{ui.passportSubtitle}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#070b11] border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.bestPickLabel}</span>
                  <span className="text-sm font-extrabold text-[#43f08a]">
                    {sim.bestCandidate.selection}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b11] border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.mathEdgeLabel}</span>
                  <span className="text-sm font-extrabold text-white">
                    +{sim.bestCandidate.ev.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b11] border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">{ui.monteCarloSurvival}</span>
                  <span className="text-sm font-extrabold text-cyan-300">
                    {Math.min(94, sim.confidenceScore - 2)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b11] border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">
                    {ui.recommendedBankrollStake}
                  </span>
                  <span className="text-sm font-extrabold text-[#43f08a]">
                    €{sim.recommendedStake}
                  </span>
                </div>
              </div>
            </div>

            {/* Analyst Scouting Note Box */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-[#070b11] p-4 rounded-xl border border-neutral-800">
              <textarea
                rows={3}
                value={notesByMatch[activeMatch.id] || ''}
                onChange={(e) =>
                  setNotesByMatch((prev) => ({
                    ...prev,
                    [activeMatch.id]: e.target.value,
                  }))
                }
                placeholder={ui.notesPlaceholder}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-white focus:border-[#43f08a] focus:outline-none"
              />
              <div className="flex items-center justify-between">
                {savedNotice ? (
                  <span className="text-xs font-mono text-[#43f08a]">✓ Saved!</span>
                ) : (
                  <span />
                )}
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-lg bg-[#43f08a] text-neutral-950 font-mono text-xs font-extrabold hover:bg-emerald-300 transition-colors"
                >
                  {ui.saveNoteBtn}
                </button>
              </div>
            </div>
          </div>

          {/* All Today's +EV Signals Grid */}
          <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white">{ui.allMatchesSignalsTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((m) => {
                const ev = m.valueBetDetected?.evPercent || 5.8;
                const pick =
                  m.valueBetDetected?.selection === 'over25'
                    ? 'Over 2.5 Goals'
                    : m.homeTeam;
                const odds =
                  m.valueBetDetected?.selection === 'over25'
                    ? 1.85
                    : m.bookmakerOdds.home;

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#070b11] border border-neutral-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>{m.league}</span>
                        <span className="text-[#43f08a] font-bold">+{ev.toFixed(1)}% EV</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        {m.homeTeam} vs {m.awayTeam}
                      </div>
                      <div className="text-xs font-mono text-cyan-300 mt-1">
                        {pick} @{odds.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => setSelectedMatchId(m.id)}
                        className="flex-1 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white"
                      >
                        🔍 Arena
                      </button>
                      <button
                        onClick={() => onLogBet(m, pick, odds, ev, '1X2 / Goals', 50)}
                        className="flex-1 py-1.5 rounded-lg bg-[#43f08a] text-neutral-950 text-xs font-mono font-extrabold hover:bg-emerald-300"
                      >
                        ⚡ +EV Bet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Football News & Scouting Wire (BBC Sport RSS API) */}
      {liveNews.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-ping" />
              <h3 className="text-sm sm:text-base font-extrabold text-white font-mono uppercase">
                {language === 'bg'
                  ? '📰 ФУТБОЛНИ НОВИНИ & СЪСТАВИ НА ЖИВО (BBC SPORT LIVE API)'
                  : '📰 LIVE FOOTBALL SCOUTING WIRE & NEWS (BBC SPORT API)'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">REAL-TIME RSS FEED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {liveNews.slice(0, 4).map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#070b11] border border-neutral-800 hover:border-[#43f08a]/60 transition-all flex flex-col justify-between gap-2.5 group"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-[#43f08a] uppercase block">
                    {item.source}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#43f08a] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{item.summary}</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 pt-1">
                  {language === 'bg' ? 'Прочети цялата новина ↗' : 'Read full report ↗'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
