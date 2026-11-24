import React, { useEffect, useState, useMemo } from 'react';
import { ActiveTab, Language, Match, SelectedTeamTarget } from '../types';
import {
  TeamBadge,
  LeagueBadge,
  openTeamProfile,
  openCompetitionLeague,
  registerMatchLogos,
} from './TeamBadge';

interface TeamIntelVenue {
  id: number | null;
  name: string;
  city: string | null;
  address: string | null;
  capacity: number | null;
  surface: string | null;
  image: string | null;
}

interface TeamIntelCoach {
  id: number;
  name: string;
  age: number | null;
  nationality: string | null;
  photo: string;
}

interface TeamIntelPlayer {
  id: number;
  name: string;
  age: number | null;
  number: number | null;
  position: string;
  photo: string;
}

interface TeamStandingSplit {
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
}

interface TeamStandingRow {
  rank: number;
  teamId?: number;
  club: string;
  clubLogo?: string;
  description?: string | null;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  home?: TeamStandingSplit;
  away?: TeamStandingSplit;
}

interface TeamFixtureItem {
  fixtureId: string;
  timestamp: number;
  date: string;
  time: string;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
  minute?: number;
  leagueId?: number;
  league: string;
  leagueLogo?: string;
  round?: string;
  homeTeamId?: number;
  homeTeam: string;
  homeLogo?: string;
  awayTeamId?: number;
  awayTeam: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  result?: 'W' | 'D' | 'L';
}

interface RealStatsSummary {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  sampleMatchesCount: number;
  cleanSheets: number;
  failedToScore: number;
  bttsCount: number;
  over25Count: number;
  bttsPercent: number | null;
  over25Percent: number | null;
  cleanSheetPercent: number | null;
}

interface TeamIntelResponse {
  configured: boolean;
  found: boolean;
  team?: {
    id: number;
    name: string;
    code: string | null;
    country: string | null;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  league?: {
    id: number | null;
    name: string;
    country: string | null;
    logo: string | null;
    seasonLabel: string;
  } | null;
  venue?: TeamIntelVenue | null;
  coach?: TeamIntelCoach | null;
  squad?: TeamIntelPlayer[];
  standings?: TeamStandingRow[];
  teamStanding?: TeamStandingRow | null;
  recentMatches?: TeamFixtureItem[];
  upcomingMatches?: TeamFixtureItem[];
  realStatsSummary?: RealStatsSummary | null;
}

interface PastFixtureModalIntel {
  found?: boolean;
  date?: string;
  league?: string;
  leagueRound?: string | null;
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  halftimeScore?: string;
  venue?: string | null;
  referee?: string | null;
  hasRealStats?: boolean;
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    cornersHome: number;
    cornersAway: number;
    yellowCardsHome: number;
    yellowCardsAway: number;
  } | null;
  events?: Array<{
    min: string;
    team: 'home' | 'away';
    icon: string;
    title: string;
    sub: string;
    highlight?: boolean;
  }>;
}

interface TeamDetailPageProps {
  language: Language;
  target: SelectedTeamTarget;
  allMatches: Match[];
  onBack: () => void;
  onSelectMatch: (match: Match) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({
  language,
  target,
  allMatches,
  onBack,
  onSelectMatch,
  setActiveTab,
}) => {
  const isBg = language === 'bg';
  const [loading, setLoading] = useState<boolean>(true);
  const [intel, setIntel] = useState<TeamIntelResponse | null>(null);
  const [subTab, setSubTab] = useState<'overview' | 'standings' | 'squad' | 'matches'>('overview');
  const [standingsMode, setStandingsMode] = useState<'all' | 'home' | 'away'>('all');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [playerSearch, setPlayerSearch] = useState<string>('');

  // Modal state when clicking a form dot or a past match
  const [selectedFixture, setSelectedFixture] = useState<TeamFixtureItem | null>(null);
  const [fixtureModalIntel, setFixtureModalIntel] = useState<PastFixtureModalIntel | null>(null);
  const [fixtureModalLoading, setFixtureModalLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSubTab('overview');

    const params = new URLSearchParams();
    if (target.teamId) params.set('teamId', String(target.teamId));
    if (target.teamName) params.set('name', target.teamName);
    if (target.leagueId) params.set('leagueId', String(target.leagueId));

    fetch(`/api/football/team-intel?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TeamIntelResponse | null) => {
        if (!active) return;
        setIntel(data);
        setLoading(false);

        if (data?.found) {
          // Register all team & league logos in global registry
          const toRegister: Array<{
            homeTeam?: string;
            awayTeam?: string;
            homeLogo?: string;
            awayLogo?: string;
            league?: string;
            leagueLogo?: string;
          }> = [];
          if (data.team?.name && data.team?.logo) {
            toRegister.push({
              homeTeam: data.team.name,
              homeLogo: data.team.logo,
              league: data.league?.name,
              leagueLogo: data.league?.logo || undefined,
            });
          }
          for (const row of data.standings || []) {
            if (row.club && row.clubLogo) {
              toRegister.push({ homeTeam: row.club, homeLogo: row.clubLogo });
            }
          }
          for (const fx of [...(data.recentMatches || []), ...(data.upcomingMatches || [])]) {
            toRegister.push({
              homeTeam: fx.homeTeam,
              homeLogo: fx.homeLogo,
              awayTeam: fx.awayTeam,
              awayLogo: fx.awayLogo,
              league: fx.league,
              leagueLogo: fx.leagueLogo,
            });
          }
          registerMatchLogos(toRegister);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [target.teamId, target.teamName, target.leagueId]);

  // Fetch deep fixture events/stats when user clicks a past match or W/D/L dot
  useEffect(() => {
    if (!selectedFixture?.fixtureId) {
      setFixtureModalIntel(null);
      return;
    }
    let active = true;
    setFixtureModalLoading(true);
    const rawId = selectedFixture.fixtureId.replace(/^api-/, '');
    fetch(`/api/football/match-intel/${rawId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          setFixtureModalIntel(data?.found ? data : null);
          setFixtureModalLoading(false);
        }
      })
      .catch(() => {
        if (active) setFixtureModalLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedFixture]);

  const teamName = intel?.team?.name || target.teamName;
  const teamLogo = intel?.team?.logo || target.teamLogo;
  const teamId = intel?.team?.id || target.teamId;

  const standings = intel?.standings || [];
  const squad = intel?.squad || [];
  const recentMatches = intel?.recentMatches || [];
  const upcomingMatches = intel?.upcomingMatches || [];
  const venue = intel?.venue || null;
  const coach = intel?.coach || null;
  const statsSummary = intel?.realStatsSummary || null;
  const teamStanding = intel?.teamStanding || null;

  const hasStandings = standings.length > 0;
  const hasSquad = squad.length > 0;
  const hasMatches = recentMatches.length > 0 || upcomingMatches.length > 0;

  // Dynamic Navigation Tabs — strictly hiding any tab for which API-Football has no data
  const navTabs = useMemo(() => {
    return [
      {
        key: 'overview' as const,
        label: isBg ? 'Преглед на отбора' : 'Club Overview',
        icon: '🛡️',
        visible: true,
      },
      {
        key: 'standings' as const,
        label: isBg ? `Класиране (${standings.length})` : `Standings (${standings.length})`,
        icon: '🏆',
        visible: hasStandings,
      },
      {
        key: 'squad' as const,
        label: isBg ? `Играчи & Състав (${squad.length})` : `Squad (${squad.length})`,
        icon: '👕',
        visible: hasSquad,
      },
      {
        key: 'matches' as const,
        label: isBg
          ? `Мачове (${recentMatches.length + upcomingMatches.length})`
          : `Matches (${recentMatches.length + upcomingMatches.length})`,
        icon: '📅',
        visible: hasMatches,
      },
    ].filter((t) => t.visible);
  }, [isBg, hasStandings, hasSquad, hasMatches, standings.length, squad.length, recentMatches.length, upcomingMatches.length]);

  const positionLabel = (pos: string) => {
    const p = pos.toLowerCase();
    if (p.includes('goal')) return isBg ? 'Вратар' : 'Goalkeeper';
    if (p.includes('def')) return isBg ? 'Защитник' : 'Defender';
    if (p.includes('mid')) return isBg ? 'Полузащитник' : 'Midfielder';
    if (p.includes('att') || p.includes('forw')) return isBg ? 'Нападател' : 'Attacker';
    return pos;
  };

  const filteredSquad = useMemo(() => {
    return squad.filter((p) => {
      if (posFilter !== 'ALL' && p.position.toLowerCase() !== posFilter.toLowerCase()) {
        return false;
      }
      if (
        playerSearch.trim() &&
        !p.name.toLowerCase().includes(playerSearch.trim().toLowerCase()) &&
        String(p.number || '') !== playerSearch.trim()
      ) {
        return false;
      }
      return true;
    });
  }, [squad, posFilter, playerSearch]);

  const handleFixtureClick = (fx: TeamFixtureItem) => {
    // Check if this fixture is currently in allMatches (live or today's feed)
    const inLiveFeed = allMatches.find(
      (m) =>
        m.id === fx.fixtureId ||
        (m.homeTeam.toLowerCase() === fx.homeTeam.toLowerCase() &&
          m.awayTeam.toLowerCase() === fx.awayTeam.toLowerCase())
    );
    if (inLiveFeed && fx.status !== 'FINISHED') {
      onSelectMatch(inLiveFeed);
      return;
    }
    setSelectedFixture(fx);
  };

  // Interactive W/D/L Form Pills (hover shows match tooltip, click opens match modal)
  const renderFormPills = (matchesList: TeamFixtureItem[]) => {
    const last5 = matchesList.slice(0, 5);
    if (last5.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {last5.map((m, idx) => {
          const res = m.result || 'D';
          return (
            <div key={m.fixtureId || idx} className="relative group">
              <button
                type="button"
                onClick={() => handleFixtureClick(m)}
                className={`w-6 h-6 rounded-md text-[10px] font-mono font-black flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ring-1 ring-white/15 hover:ring-[#43f08a] ${
                  res === 'W'
                    ? 'bg-[#10b981] text-[#04130b]'
                    : res === 'D'
                    ? 'bg-[#475569] text-white'
                    : 'bg-[#ef4444] text-white'
                }`}
              >
                {res}
              </button>

              {/* Rich Hover Tooltip */}
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-[260px] rounded-xl bg-[#070d15] border border-[#22c55e]/50 px-3 py-2 shadow-2xl text-left">
                <div className="text-[10px] font-mono text-[#8f9cae] flex items-center justify-between gap-3">
                  <span>{m.date}</span>
                  <span className="text-[#43f08a] truncate max-w-[130px]">{m.league}</span>
                </div>
                <div className="text-xs font-extrabold text-white mt-0.5">
                  {m.homeTeam}{' '}
                  <span className="text-[#43f08a] font-mono px-1">
                    {m.homeScore}-{m.awayScore}
                  </span>{' '}
                  {m.awayTeam}
                </div>
                <div className="text-[9px] font-mono text-[#43f08a] mt-1">
                  {isBg ? 'Кликни за детайли от мача ↗' : 'Click for match details ↗'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStandingsTable = (compact = false) => {
    if (!hasStandings) return null;

    // Sort/compute rows according to standingsMode ('all' | 'home' | 'away')
    const computedRows = standings.map((row) => {
      if (standingsMode === 'home' && row.home) {
        const gd = row.home.gf - row.home.ga;
        const pts = row.home.w * 3 + row.home.d;
        return {
          ...row,
          p: row.home.p,
          w: row.home.w,
          d: row.home.d,
          l: row.home.l,
          gf: row.home.gf,
          ga: row.home.ga,
          gd: gd > 0 ? `+${gd}` : String(gd),
          pts,
        };
      }
      if (standingsMode === 'away' && row.away) {
        const gd = row.away.gf - row.away.ga;
        const pts = row.away.w * 3 + row.away.d;
        return {
          ...row,
          p: row.away.p,
          w: row.away.w,
          d: row.away.d,
          l: row.away.l,
          gf: row.away.gf,
          ga: row.away.ga,
          gd: gd > 0 ? `+${gd}` : String(gd),
          pts,
        };
      }
      return row;
    });

    if (standingsMode !== 'all') {
      computedRows.sort((a, b) => b.pts - a.pts || Number(b.gd) - Number(a.gd) || b.gf - a.gf);
    }

    let rowsToDisplay = computedRows;
    if (compact && computedRows.length > 8) {
      const idx = computedRows.findIndex(
        (r) =>
          (teamId && r.teamId === teamId) ||
          r.club.toLowerCase() === teamName.toLowerCase()
      );
      if (idx !== -1) {
        const start = Math.max(0, Math.min(idx - 3, computedRows.length - 8));
        rowsToDisplay = computedRows.slice(start, start + 8);
      } else {
        rowsToDisplay = computedRows.slice(0, 8);
      }
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#162232] text-[10px] font-mono text-[#8f9cae] uppercase">
              <th className="py-2 pl-2 pr-1 w-8">#</th>
              <th className="py-2 px-2">{isBg ? 'Отбор' : 'Club'}</th>
              <th className="py-2 px-1.5 text-center">P</th>
              {!compact && (
                <>
                  <th className="py-2 px-1.5 text-center">W</th>
                  <th className="py-2 px-1.5 text-center">D</th>
                  <th className="py-2 px-1.5 text-center">L</th>
                  <th className="py-2 px-2 text-center">GF:GA</th>
                </>
              )}
              <th className="py-2 px-1.5 text-center">GD</th>
              <th className="py-2 px-2 text-center text-white">PTS</th>
              {!compact && (
                <th className="py-2 pl-2 pr-2 text-right">{isBg ? 'Форма' : 'Form'}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#131e2c]">
            {rowsToDisplay.map((row, idx) => {
              const isCurrentTeam =
                (teamId && row.teamId === teamId) ||
                row.club.toLowerCase() === teamName.toLowerCase();
              const displayRank = standingsMode === 'all' ? row.rank : idx + 1;

              return (
                <tr
                  key={`${row.rank}-${row.club}`}
                  onClick={() =>
                    openTeamProfile({
                      teamId: row.teamId,
                      teamName: row.club,
                      teamLogo: row.clubLogo,
                      leagueId: intel?.league?.id || undefined,
                      leagueName: intel?.league?.name,
                    })
                  }
                  className={`transition-colors cursor-pointer ${
                    isCurrentTeam
                      ? 'bg-[#0f291e]/90 border-l-2 border-l-[#43f08a]'
                      : 'hover:bg-[#0e1622]'
                  }`}
                >
                  <td className="py-2.5 pl-2 pr-1 font-mono text-[11px] font-bold text-[#8f9cae]">
                    {displayRank}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamBadge
                        name={row.club}
                        logoUrl={row.clubLogo}
                        teamId={row.teamId}
                        size="sm"
                      />
                      <span
                        className={`truncate hover:underline ${
                          isCurrentTeam
                            ? 'font-extrabold text-[#43f08a]'
                            : 'font-semibold text-white'
                        }`}
                      >
                        {row.club}
                      </span>
                      {isCurrentTeam && (
                        <span className="px-1.5 py-0.5 rounded bg-[#22c55e]/20 border border-[#22c55e]/40 text-[9px] font-mono font-bold text-[#43f08a] shrink-0">
                          {isBg ? 'ИЗБРАН' : 'SELECTED'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                    {row.p}
                  </td>
                  {!compact && (
                    <>
                      <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                        {row.w}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                        {row.d}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                        {row.l}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-400">
                        {row.gf}:{row.ga}
                      </td>
                    </>
                  )}
                  <td className="py-2.5 px-1.5 text-center font-mono text-neutral-300">
                    {row.gd}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-black text-[#43f08a]">
                    {row.pts}
                  </td>
                  {!compact && (
                    <td className="py-2.5 pl-2 pr-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {(row.form || []).map((f, fIdx) => {
                          // For the currently viewed team, map directly to its recentMatches (oldest to newest of last 5)
                          const last5Chrono = isCurrentTeam
                            ? [...recentMatches.slice(0, 5)].reverse()
                            : [];
                          const offset = (row.form || []).length - last5Chrono.length;
                          const matchedFx =
                            isCurrentTeam && fIdx - offset >= 0
                              ? last5Chrono[fIdx - offset]
                              : undefined;

                          return (
                            <button
                              key={fIdx}
                              type="button"
                              title={
                                matchedFx
                                  ? `${matchedFx.date}: ${matchedFx.homeTeam} ${matchedFx.homeScore}-${matchedFx.awayScore} ${matchedFx.awayTeam}`
                                  : `${row.club} — Кликни за детайли за мача (${f})`
                              }
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (matchedFx) {
                                  handleFixtureClick(matchedFx);
                                  return;
                                }
                                try {
                                  const qs = new URLSearchParams();
                                  if (row.teamId) qs.set('teamId', String(row.teamId));
                                  qs.set('teamName', row.club);
                                  if (intel?.league?.id) qs.set('leagueId', String(intel.league.id));
                                  const res = await fetch(`/api/football/team-intel?${qs.toString()}`);
                                  if (res.ok) {
                                    const data = await res.json();
                                    if (Array.isArray(data?.recentMatches) && data.recentMatches.length > 0) {
                                      const chrono: TeamFixtureItem[] = [...data.recentMatches.slice(0, 5)].reverse();
                                      const off = (row.form || []).length - chrono.length;
                                      const pick =
                                        (fIdx - off >= 0 && fIdx - off < chrono.length
                                          ? chrono[fIdx - off]
                                          : undefined) ||
                                        chrono.find((m) => m.result === f) ||
                                        chrono[chrono.length - 1];
                                      if (pick) {
                                        setSelectedFixture(pick);
                                        return;
                                      }
                                    }
                                  }
                                } catch {
                                  // fallback to opening team profile
                                }
                                openTeamProfile({
                                  teamId: row.teamId,
                                  teamName: row.club,
                                  teamLogo: row.clubLogo,
                                  leagueId: intel?.league?.id || undefined,
                                  leagueName: intel?.league?.name,
                                });
                              }}
                              className={`w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center transition-transform hover:scale-125 hover:ring-2 hover:ring-white/80 cursor-pointer ${
                                f === 'W'
                                  ? 'bg-[#10b981] text-[#04130b]'
                                  : f === 'D'
                                  ? 'bg-[#475569] text-white'
                                  : 'bg-[#ef4444] text-white'
                              }`}
                            >
                              {f}
                            </button>
                          );
                        })}
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
            {isBg ? 'Начало' : 'Home'}
          </button>
          {intel?.team?.country && (
            <>
              <span className="text-neutral-600">›</span>
              <span className="inline-flex items-center gap-1 text-neutral-300">
                <span>🌍</span>
                <span>{intel.team.country}</span>
              </span>
            </>
          )}
          {intel?.league?.name && (
            <>
              <span className="text-neutral-600">›</span>
              <button
                type="button"
                onClick={(e) =>
                  openCompetitionLeague(
                    {
                      leagueId: intel.league?.id || undefined,
                      leagueName: intel.league?.name || undefined,
                    },
                    e
                  )
                }
                className="hover:text-white transition-colors cursor-pointer"
              >
                {intel.league.name}
              </button>
            </>
          )}
          <span className="text-neutral-600">›</span>
          <span className="text-white font-semibold">{teamName}</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl border border-[#1e2d40] bg-[#0b131d] hover:border-[#43f08a]/60 text-xs font-semibold text-[#43f08a] transition-colors cursor-pointer"
        >
          {isBg ? '← Назад' : '← Back'}
        </button>
      </div>

      {/* =================================================================== */}
      {/* HERO CLUB PROFILE HEADER BANNER */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-[#1a2938] bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] p-5 sm:p-7 relative overflow-visible shadow-2xl">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 40%, rgba(34, 197, 94, 0.30) 0%, transparent 65%), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 22px 22px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Club Emblem + Identity + Metadata Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <TeamBadge
              name={teamName}
              logoUrl={teamLogo}
              teamId={teamId}
              clickable={false}
              size="lg"
              className="w-20 h-20 text-lg rounded-2xl shrink-0"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {teamName}
                </h1>
                {intel?.team?.code && (
                  <span className="px-2 py-0.5 rounded-md bg-[#111d2b] border border-[#223549] font-mono text-xs font-bold text-[#8f9cae]">
                    {intel.team.code}
                  </span>
                )}
                {teamStanding && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#0f291e] border border-[#22c55e]/50 font-mono text-xs font-extrabold text-[#43f08a]">
                    #{teamStanding.rank} {intel?.league?.name ? `в ${intel.league.name}` : ''}
                  </span>
                )}
              </div>

              {/* Metadata Pills — strictly showing ONLY fields that exist in API-Football */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                {intel?.league?.name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <LeagueBadge
                      name={intel.league.name}
                      logoUrl={intel.league.logo || undefined}
                      size="xs"
                    />
                    <span className="font-semibold text-white">{intel.league.name}</span>
                    {intel.league.seasonLabel && (
                      <span className="text-[#8f9cae] font-mono">
                        ({intel.league.seasonLabel})
                      </span>
                    )}
                  </span>
                )}

                {intel?.team?.country && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <span>🌍</span>
                    <span>{intel.team.country}</span>
                  </span>
                )}

                {intel?.team?.founded && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a] font-mono">
                    <span>🏛️</span>
                    <span>
                      {isBg ? 'Основан:' : 'Founded:'}{' '}
                      <strong className="text-white">{intel.team.founded}</strong>
                    </span>
                  </span>
                )}

                {venue?.name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <span>🏟️</span>
                    <strong className="text-white">{venue.name}</strong>
                    {venue.city && <span className="text-[#8f9cae]">({venue.city})</span>}
                    {venue.capacity && (
                      <span className="font-mono text-[#43f08a]">
                        · {venue.capacity.toLocaleString('en-US')}{' '}
                        {isBg ? 'места' : 'seats'}
                      </span>
                    )}
                  </span>
                )}

                {coach?.name && (
                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0c1622] border border-[#1a2a3a]">
                    <span>👔</span>
                    <span className="text-[#8f9cae]">
                      {isBg ? 'Треньор:' : 'Coach:'}
                    </span>
                    <strong className="text-white">{coach.name}</strong>
                    {coach.nationality && (
                      <span className="text-[#8f9cae]">({coach.nationality})</span>
                    )}
                  </span>
                )}
              </div>

              {/* Last 5 Matches Interactive Form Dots */}
              {recentMatches.length > 0 && (
                <div className="pt-1 flex items-center gap-2.5">
                  <span className="text-[11px] font-mono text-[#8f9cae] uppercase">
                    {isBg ? 'Последни 5 мача:' : 'Last 5 matches:'}
                  </span>
                  {renderFormPills(recentMatches)}
                </div>
              )}
            </div>
          </div>

          {/* Right: Season Snapshot KPI Strip (ONLY if real stats exist) */}
          {statsSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                  {isBg ? 'Мачове (W-D-L)' : 'Played (W-D-L)'}
                </span>
                <span className="text-lg font-black font-mono text-white mt-0.5 block">
                  {statsSummary.played}
                </span>
                <span className="text-[11px] font-mono text-[#43f08a]">
                  {statsSummary.wins}W · {statsSummary.draws}D · {statsSummary.losses}L
                </span>
              </div>

              <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                  {isBg ? 'Голова разлика' : 'Goals (GF:GA)'}
                </span>
                <span className="text-lg font-black font-mono text-white mt-0.5 block">
                  {statsSummary.goalsFor}:{statsSummary.goalsAgainst}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {statsSummary.avgGoalsFor} / {statsSummary.avgGoalsAgainst}{' '}
                  {isBg ? 'ср.' : 'avg'}
                </span>
              </div>

              {statsSummary.over25Percent !== null && (
                <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                  <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                    {isBg ? 'Над 2.5 Гола' : 'Over 2.5 Goals'}
                  </span>
                  <span className="text-lg font-black font-mono text-[#43f08a] mt-0.5 block">
                    {statsSummary.over25Percent}%
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {statsSummary.over25Count}/{statsSummary.sampleMatchesCount}{' '}
                    {isBg ? 'мача' : 'matches'}
                  </span>
                </div>
              )}

              {statsSummary.bttsPercent !== null && (
                <div className="rounded-xl border border-[#1b2c3f] bg-[#081018]/90 px-4 py-3 text-center">
                  <span className="text-[10px] font-mono text-[#8f9cae] uppercase block">
                    {isBg ? 'Гол/Гол (BTTS)' : 'BTTS Rate'}
                  </span>
                  <span className="text-lg font-black font-mono text-cyan-400 mt-0.5 block">
                    {statsSummary.bttsPercent}%
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {isBg ? 'Сухи мрежи:' : 'Clean sheets:'} {statsSummary.cleanSheets}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* SUB-NAVIGATION TABS (ONLY TABS WITH REAL API DATA ARE RENDERED) */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-[#162232] pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {navTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                subTab === tab.key
                  ? 'bg-[#22c55e] text-[#04130b] shadow-lg shadow-[#22c55e]/20'
                  : 'bg-[#0b111a] border border-[#182434] text-[#8f9cae] hover:text-white hover:border-[#2a3c54]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* LOADING SKELETON */}
      {/* =================================================================== */}
      {loading && (
        <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-10 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#43f08a] border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">
            {isBg
              ? `Зареждане на официален профил за ${teamName}...`
              : `Loading official profile for ${teamName}...`}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 1: CLUB OVERVIEW (ONLY RENDERS PANELS WITH REAL API DATA) */}
      {/* =================================================================== */}
      {!loading && subTab === 'overview' && (
        <div className="space-y-5">
          {/* TOP ROW: Recent Results + Upcoming Fixtures + Home/Away or Stadium */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* PANEL A: Recent Finished Matches (if available) */}
            {recentMatches.length > 0 && (
              <div
                className={`${
                  upcomingMatches.length > 0 ? 'lg:col-span-6' : 'lg:col-span-8'
                } rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4`}
              >
                <div className="flex items-center justify-between border-b border-[#162232] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {isBg ? 'Последни официални мачове' : 'Recent Official Matches'}
                    </h3>
                    <p className="text-[11px] text-[#8f9cae]">
                      {isBg
                        ? 'Кликни на мач за хронология или върху отбор за неговия профил'
                        : 'Click a match for timeline or a team name for its profile'}
                    </p>
                  </div>
                  {recentMatches.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setSubTab('matches')}
                      className="text-xs text-[#43f08a] hover:underline cursor-pointer"
                    >
                      {isBg ? 'Всички мачове ›' : 'All matches ›'}
                    </button>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  {recentMatches.slice(0, 6).map((m) => (
                    <div
                      key={m.fixtureId}
                      onClick={() => handleFixtureClick(m)}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                            m.result === 'W'
                              ? 'bg-[#10b981] text-[#04130b]'
                              : m.result === 'D'
                              ? 'bg-[#475569] text-white'
                              : 'bg-[#ef4444] text-white'
                          }`}
                        >
                          {m.result}
                        </span>
                        <div className="text-[10px] font-mono text-[#8f9cae] w-16 shrink-0">
                          <div>{m.date}</div>
                          <div className="truncate text-[9px]">{m.league}</div>
                        </div>
                      </div>

                      {/* Teams & Score */}
                      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                        <button
                          type="button"
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
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <span className="truncate max-w-[110px]">{m.homeTeam}</span>
                          <TeamBadge
                            name={m.homeTeam}
                            logoUrl={m.homeLogo}
                            teamId={m.homeTeamId}
                            size="sm"
                          />
                        </button>

                        <span className="px-2 py-0.5 rounded bg-[#121d2b] border border-[#1e2f44] font-mono font-black text-white shrink-0">
                          {m.homeScore} - {m.awayScore}
                        </span>

                        <button
                          type="button"
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
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            !m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <TeamBadge
                            name={m.awayTeam}
                            logoUrl={m.awayLogo}
                            teamId={m.awayTeamId}
                            size="sm"
                          />
                          <span className="truncate max-w-[110px]">{m.awayTeam}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL B: Upcoming Scheduled Fixtures (ONLY if API returns upcoming matches) */}
            {upcomingMatches.length > 0 && (
              <div
                className={`${
                  recentMatches.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'
                } rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4`}
              >
                <div className="flex items-center justify-between border-b border-[#162232] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {isBg ? 'Предстоящи мачове по програма' : 'Upcoming Scheduled Fixtures'}
                    </h3>
                    <p className="text-[11px] text-[#8f9cae]">
                      {isBg
                        ? 'Официална програма по кръгове и турнири'
                        : 'Official schedule by round and competition'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#0f291e] border border-[#22c55e]/40 text-[10px] font-mono font-bold text-[#43f08a]">
                    {upcomingMatches.length} {isBg ? 'мача' : 'fixtures'}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {upcomingMatches.slice(0, 6).map((m) => (
                    <div
                      key={m.fixtureId}
                      onClick={() => handleFixtureClick(m)}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="text-[10px] font-mono text-[#8f9cae] w-24 shrink-0">
                        <div className="text-neutral-200 font-bold">{m.date}</div>
                        <div className="truncate text-[9px] text-[#43f08a]">
                          {m.round || m.league}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                        <button
                          type="button"
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
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <span className="truncate max-w-[115px]">{m.homeTeam}</span>
                          <TeamBadge
                            name={m.homeTeam}
                            logoUrl={m.homeLogo}
                            teamId={m.homeTeamId}
                            size="sm"
                          />
                        </button>

                        <span className="px-2 py-0.5 rounded bg-[#101c2a] border border-[#1d3046] font-mono font-bold text-amber-400 text-[11px] shrink-0">
                          {m.status === 'LIVE'
                            ? `LIVE ${m.homeScore}-${m.awayScore}`
                            : m.time || 'VS'}
                        </span>

                        <button
                          type="button"
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
                          className={`flex items-center gap-1.5 min-w-0 hover:text-[#43f08a] cursor-pointer ${
                            !m.isHome ? 'font-extrabold text-white' : 'text-neutral-300'
                          }`}
                        >
                          <TeamBadge
                            name={m.awayTeam}
                            logoUrl={m.awayLogo}
                            teamId={m.awayTeamId}
                            size="sm"
                          />
                          <span className="truncate max-w-[115px]">{m.awayTeam}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECOND ROW: League Standings Preview + Home/Away Breakdown & Venue */}
          {(hasStandings || venue || teamStanding) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {hasStandings && (
                <div
                  className={`${
                    venue || teamStanding ? 'lg:col-span-7' : 'lg:col-span-12'
                  } rounded-2xl border border-[#182434] bg-[#0b111a] p-5 flex flex-col justify-between shadow-xl space-y-4`}
                >
                  <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {intel?.league?.name && (
                        <LeagueBadge
                          name={intel.league.name}
                          logoUrl={intel.league.logo || undefined}
                          size="sm"
                        />
                      )}
                      <h3 className="text-sm font-extrabold text-white">
                        {isBg ? 'Позиция в класирането' : 'League Standings'} —{' '}
                        {intel?.league?.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSubTab('standings')}
                      className="text-xs font-bold text-[#43f08a] hover:underline cursor-pointer"
                    >
                      {isBg
                        ? `Виж пълното класиране (${standings.length} отбора) ›`
                        : `View full table (${standings.length} clubs) ›`}
                    </button>
                  </div>

                  {renderStandingsTable(true)}
                </div>
              )}

              {/* Right Column: Official Home vs Away Split + Stadium Card */}
              {(teamStanding || venue) && (
                <div
                  className={`${
                    hasStandings ? 'lg:col-span-5' : 'lg:col-span-12'
                  } flex flex-col justify-between gap-5`}
                >
                  {/* Home vs Away Split from Official Standings */}
                  {teamStanding?.home && teamStanding?.away && (
                    <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl">
                      <h3 className="text-sm font-extrabold text-white border-b border-[#162232] pb-2.5">
                        {isBg
                          ? 'Представяне Домакин vs Гост (Официална статистика)'
                          : 'Home vs Away Performance (Official)'}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#080e16] border border-[#162232] space-y-1.5">
                          <div className="text-[10px] font-mono text-[#43f08a] uppercase font-bold">
                            🏠 {isBg ? 'Като Домакин' : 'Home Record'}
                          </div>
                          <div className="text-base font-black font-mono text-white">
                            {teamStanding.home.w}W - {teamStanding.home.d}D -{' '}
                            {teamStanding.home.l}L
                          </div>
                          <div className="text-[11px] font-mono text-[#8f9cae]">
                            {isBg ? 'Голове:' : 'Goals:'}{' '}
                            <strong className="text-white">
                              {teamStanding.home.gf}:{teamStanding.home.ga}
                            </strong>{' '}
                            ({teamStanding.home.p} {isBg ? 'мача' : 'matches'})
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#080e16] border border-[#162232] space-y-1.5">
                          <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                            ✈️ {isBg ? 'Като Гост' : 'Away Record'}
                          </div>
                          <div className="text-base font-black font-mono text-white">
                            {teamStanding.away.w}W - {teamStanding.away.d}D -{' '}
                            {teamStanding.away.l}L
                          </div>
                          <div className="text-[11px] font-mono text-[#8f9cae]">
                            {isBg ? 'Голове:' : 'Goals:'}{' '}
                            <strong className="text-white">
                              {teamStanding.away.gf}:{teamStanding.away.ga}
                            </strong>{' '}
                            ({teamStanding.away.p} {isBg ? 'мача' : 'matches'})
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Official Stadium & Venue Card (ONLY if API-Football provides venue) */}
                  {venue && (
                    <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3 shadow-xl flex-1">
                      <div className="flex items-center justify-between border-b border-[#162232] pb-2.5">
                        <h3 className="text-sm font-extrabold text-white">
                          🏟️ {isBg ? 'Стадион на клуба' : 'Club Stadium'}
                        </h3>
                        {venue.surface && (
                          <span className="px-2 py-0.5 rounded bg-[#0f291e] border border-[#22c55e]/40 text-[10px] font-mono text-[#43f08a] uppercase">
                            {venue.surface}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {venue.image && (
                          <img
                            src={venue.image}
                            alt={venue.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-full sm:w-32 h-24 rounded-xl object-cover border border-[#1e2d40] shrink-0"
                          />
                        )}
                        <div className="space-y-1 text-xs">
                          <div className="text-base font-extrabold text-white">
                            {venue.name}
                          </div>
                          {venue.city && (
                            <div className="text-[#8f9cae]">
                              📍 {venue.city}
                              {venue.address ? ` · ${venue.address}` : ''}
                            </div>
                          )}
                          {venue.capacity && (
                            <div className="text-neutral-300 font-mono pt-1">
                              👥 {isBg ? 'Капацитет:' : 'Capacity:'}{' '}
                              <strong className="text-[#43f08a]">
                                {venue.capacity.toLocaleString('en-US')}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* THIRD ROW: Official Squad Preview (ONLY if API returns squad players) */}
          {hasSquad && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    👕 {isBg ? 'Официален състав на отбора' : 'Official Club Squad'} (
                    {squad.length})
                  </h3>
                  <p className="text-[11px] text-[#8f9cae]">
                    {isBg
                      ? 'Картотекирани играчи за текущия сезон'
                      : 'Registered squad players for the current season'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubTab('squad')}
                  className="text-xs font-bold text-[#43f08a] hover:underline cursor-pointer"
                >
                  {isBg
                    ? `Виж всички ${squad.length} играчи ›`
                    : `View all ${squad.length} players ›`}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {squad.slice(0, 12).map((player) => (
                  <div
                    key={player.id || player.name}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#15202e] bg-[#080e16]"
                  >
                    <img
                      src={player.photo}
                      alt={player.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-10 h-10 rounded-full object-cover bg-[#111c2a] border border-[#22354a] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-white truncate">
                          {player.name}
                        </span>
                        {player.number && (
                          <span className="px-1.5 py-0.5 rounded bg-[#111d2c] border border-[#21344a] font-mono text-[10px] font-bold text-[#43f08a]">
                            #{player.number}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8f9cae] flex items-center gap-2 mt-0.5">
                        <span>{positionLabel(player.position)}</span>
                        {player.age && (
                          <>
                            <span>·</span>
                            <span className="font-mono">
                              {player.age} {isBg ? 'г.' : 'yrs'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: FULL LEAGUE STANDINGS WITH ALL / HOME / AWAY FILTER */}
      {/* =================================================================== */}
      {!loading && subTab === 'standings' && hasStandings && (
        <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#162232] pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              {intel?.league?.name && (
                <LeagueBadge
                  name={intel.league.name}
                  logoUrl={intel.league.logo || undefined}
                  size="md"
                />
              )}
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {intel?.league?.name} — {isBg ? 'Пълно класиране' : 'Full Standings'}
                </h3>
                <p className="text-xs text-[#8f9cae]">
                  {isBg
                    ? 'Кликни върху който и да е отбор в таблицата, за да отвориш неговата страница'
                    : 'Click any team in the table to open its dedicated profile page'}
                </p>
              </div>
            </div>

            {/* All / Home / Away Switcher */}
            <div className="flex items-center gap-1.5 bg-[#080e16] p-1 rounded-xl border border-[#162232]">
              {[
                { key: 'all' as const, label: isBg ? 'Общо' : 'Overall' },
                { key: 'home' as const, label: isBg ? 'Домакин' : 'Home' },
                { key: 'away' as const, label: isBg ? 'Гост' : 'Away' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setStandingsMode(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    standingsMode === m.key
                      ? 'bg-[#22c55e] text-[#04130b]'
                      : 'text-[#8f9cae] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {renderStandingsTable(false)}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: FULL SQUAD & PLAYERS BY POSITION */}
      {/* =================================================================== */}
      {!loading && subTab === 'squad' && hasSquad && (
        <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#162232] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">
                👕 {teamName} — {isBg ? 'Официален състав' : 'Official Squad'} ({squad.length})
              </h3>
              {coach?.name && (
                <p className="text-xs text-[#8f9cae] mt-0.5">
                  {isBg ? 'Старши треньор:' : 'Head Coach:'}{' '}
                  <strong className="text-white">{coach.name}</strong>
                  {coach.nationality ? ` (${coach.nationality})` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder={isBg ? 'Търси играч или номер...' : 'Search player or #...'}
                className="px-3 py-1.5 rounded-xl bg-[#080e16] border border-[#1a293a] text-xs text-white placeholder-[#8f9cae] focus:outline-none focus:border-[#43f08a]"
              />

              {[
                { key: 'ALL', label: isBg ? 'Всички' : 'All' },
                { key: 'Goalkeeper', label: isBg ? 'Вратари' : 'GK' },
                { key: 'Defender', label: isBg ? 'Защитници' : 'DEF' },
                { key: 'Midfielder', label: isBg ? 'Халфове' : 'MID' },
                { key: 'Attacker', label: isBg ? 'Нападатели' : 'ATT' },
              ].map((pf) => (
                <button
                  key={pf.key}
                  type="button"
                  onClick={() => setPosFilter(pf.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    posFilter === pf.key
                      ? 'bg-[#22c55e] text-[#04130b]'
                      : 'bg-[#080e16] border border-[#162232] text-[#8f9cae] hover:text-white'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSquad.map((player) => (
              <div
                key={player.id || player.name}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#24374e] transition-colors"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-12 h-12 rounded-full object-cover bg-[#111c2a] border border-[#22354a] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-extrabold text-white truncate">
                      {player.name}
                    </span>
                    {player.number && (
                      <span className="px-2 py-0.5 rounded-md bg-[#111d2c] border border-[#21344a] font-mono text-xs font-black text-[#43f08a]">
                        #{player.number}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8f9cae] flex items-center gap-2 mt-1">
                    <span className="text-neutral-300 font-semibold">
                      {positionLabel(player.position)}
                    </span>
                    {player.age && (
                      <>
                        <span>·</span>
                        <span className="font-mono">
                          {player.age} {isBg ? 'години' : 'years old'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: ALL RECENT & UPCOMING MATCHES */}
      {/* =================================================================== */}
      {!loading && subTab === 'matches' && hasMatches && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recentMatches.length > 0 && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl">
              <h3 className="text-sm font-extrabold text-white border-b border-[#162232] pb-2.5">
                {isBg ? 'Последни изиграни срещи' : 'Recent Finished Matches'} (
                {recentMatches.length})
              </h3>
              <div className="space-y-2">
                {recentMatches.map((m) => (
                  <div
                    key={m.fixtureId}
                    onClick={() => handleFixtureClick(m)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                          m.result === 'W'
                            ? 'bg-[#10b981] text-[#04130b]'
                            : m.result === 'D'
                            ? 'bg-[#475569] text-white'
                            : 'bg-[#ef4444] text-white'
                        }`}
                      >
                        {m.result}
                      </span>
                      <div className="text-[10px] font-mono text-[#8f9cae]">
                        <div>{m.date}</div>
                        <div className="text-[9px]">{m.league}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
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
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <span>{m.homeTeam}</span>
                        <TeamBadge
                          name={m.homeTeam}
                          logoUrl={m.homeLogo}
                          teamId={m.homeTeamId}
                          size="sm"
                        />
                      </button>

                      <span className="px-2 py-0.5 rounded bg-[#121d2b] font-mono font-black text-white">
                        {m.homeScore} - {m.awayScore}
                      </span>

                      <button
                        type="button"
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
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <TeamBadge
                          name={m.awayTeam}
                          logoUrl={m.awayLogo}
                          teamId={m.awayTeamId}
                          size="sm"
                        />
                        <span>{m.awayTeam}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingMatches.length > 0 && (
            <div className="rounded-2xl border border-[#182434] bg-[#0b111a] p-5 space-y-3.5 shadow-xl">
              <h3 className="text-sm font-extrabold text-white border-b border-[#162232] pb-2.5">
                {isBg ? 'Предстоящи мачове' : 'Upcoming Fixtures'} ({upcomingMatches.length})
              </h3>
              <div className="space-y-2">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.fixtureId}
                    onClick={() => handleFixtureClick(m)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#15202e] bg-[#080e16] hover:border-[#43f08a]/50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="text-[10px] font-mono text-[#8f9cae]">
                      <div className="text-white font-bold">{m.date}</div>
                      <div className="text-[9px] text-[#43f08a]">{m.round || m.league}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
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
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <span>{m.homeTeam}</span>
                        <TeamBadge
                          name={m.homeTeam}
                          logoUrl={m.homeLogo}
                          teamId={m.homeTeamId}
                          size="sm"
                        />
                      </button>

                      <span className="px-2 py-0.5 rounded bg-[#101c2a] font-mono font-bold text-amber-400">
                        {m.time || 'VS'}
                      </span>

                      <button
                        type="button"
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
                        className="flex items-center gap-1.5 text-white font-semibold hover:text-[#43f08a] cursor-pointer"
                      >
                        <TeamBadge
                          name={m.awayTeam}
                          logoUrl={m.awayLogo}
                          teamId={m.awayTeamId}
                          size="sm"
                        />
                        <span>{m.awayTeam}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL WINDOW: MATCH DETAILS WHEN CLICKING A FORM DOT OR PAST MATCH */}
      {/* =================================================================== */}
      {selectedFixture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedFixture(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#1f3347] bg-[#081018] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#162232] bg-[#0b1520]">
              <div className="flex items-center gap-2 text-xs text-neutral-200 font-semibold">
                <LeagueBadge
                  name={fixtureModalIntel?.league || selectedFixture.league}
                  logoUrl={selectedFixture.leagueLogo}
                  size="xs"
                />
                <span>{fixtureModalIntel?.league || selectedFixture.league}</span>
                <span className="text-neutral-500">·</span>
                <span className="font-mono text-[#43f08a]">
                  {fixtureModalIntel?.date || selectedFixture.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFixture(null)}
                className="w-7 h-7 rounded-lg border border-[#1e2d40] bg-[#0e1622] hover:border-[#43f08a] text-neutral-300 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-gradient-to-r from-[#07111a] via-[#0b1b20] to-[#08111a] border-b border-[#162232]">
              <div className="grid grid-cols-11 gap-3 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <TeamBadge
                    name={selectedFixture.homeTeam}
                    logoUrl={fixtureModalIntel?.homeLogo || selectedFixture.homeLogo}
                    teamId={selectedFixture.homeTeamId}
                    size="md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextTarget = {
                        teamId: selectedFixture.homeTeamId,
                        teamName: selectedFixture.homeTeam,
                        teamLogo: selectedFixture.homeLogo,
                      };
                      setSelectedFixture(null);
                      openTeamProfile(nextTarget);
                    }}
                    className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] text-left leading-tight cursor-pointer"
                  >
                    {selectedFixture.homeTeam}
                  </button>
                </div>

                <div className="col-span-3 text-center">
                  <div className="inline-block rounded-xl border border-[#1f3144] bg-[#060b12]/90 px-4 py-2">
                    <div className="text-[10px] font-mono font-bold text-[#43f08a] uppercase">
                      {fixtureModalIntel?.halftimeScore ||
                        (selectedFixture.status === 'FINISHED'
                          ? isBg
                            ? 'КРАЕН РЕЗУЛТАТ'
                            : 'FINAL SCORE'
                          : selectedFixture.time)}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {selectedFixture.status === 'SCHEDULED'
                        ? 'VS'
                        : `${fixtureModalIntel?.homeScore ?? selectedFixture.homeScore} - ${
                            fixtureModalIntel?.awayScore ?? selectedFixture.awayScore
                          }`}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-end gap-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      const nextTarget = {
                        teamId: selectedFixture.awayTeamId,
                        teamName: selectedFixture.awayTeam,
                        teamLogo: selectedFixture.awayLogo,
                      };
                      setSelectedFixture(null);
                      openTeamProfile(nextTarget);
                    }}
                    className="text-sm sm:text-base font-extrabold text-white hover:text-[#43f08a] text-right leading-tight cursor-pointer"
                  >
                    {selectedFixture.awayTeam}
                  </button>
                  <TeamBadge
                    name={selectedFixture.awayTeam}
                    logoUrl={fixtureModalIntel?.awayLogo || selectedFixture.awayLogo}
                    teamId={selectedFixture.awayTeamId}
                    size="md"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
              {fixtureModalLoading ? (
                <div className="py-8 text-center text-xs text-[#8f9cae] font-mono">
                  {isBg
                    ? 'Зареждане на официална хронология на мача...'
                    : 'Loading official match timeline...'}
                </div>
              ) : (
                <>
                  {fixtureModalIntel?.events && fixtureModalIntel.events.length > 0 ? (
                    <div className="space-y-1.5">
                      {fixtureModalIntel.events.map((ev, idx) => (
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
                    <div className="p-3 rounded-xl border border-[#15202e] bg-[#0b121c] text-xs text-[#8f9cae] text-center">
                      {selectedFixture.homeTeam} {selectedFixture.homeScore} -{' '}
                      {selectedFixture.awayScore} {selectedFixture.awayTeam}
                    </div>
                  )}

                  {fixtureModalIntel?.hasRealStats && fixtureModalIntel.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs pt-2 border-t border-[#162232]">
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          {isBg ? 'Владеене' : 'Possession'}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.possessionHome}% -{' '}
                          {fixtureModalIntel.stats.possessionAway}%
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          {isBg ? 'Удари (Точни)' : 'Shots (On Target)'}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.shotsHome} (
                          {fixtureModalIntel.stats.shotsOnTargetHome}) -{' '}
                          {fixtureModalIntel.stats.shotsAway} (
                          {fixtureModalIntel.stats.shotsOnTargetAway})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          {isBg ? 'Корнери' : 'Corners'}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.cornersHome} -{' '}
                          {fixtureModalIntel.stats.cornersAway}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0b121c] border border-[#15202e]">
                        <span className="text-[10px] text-[#8f9cae] block">
                          🟨 {isBg ? 'Жълти картони' : 'Yellow Cards'}
                        </span>
                        <span className="font-bold text-white">
                          {fixtureModalIntel.stats.yellowCardsHome} -{' '}
                          {fixtureModalIntel.stats.yellowCardsAway}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
