import React, { useState, useEffect } from 'react';
import { SelectedPlayerTarget } from '../types';
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
  rating: string | null;
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
  tacklesBlocks: number;
  tacklesInterceptions: number;
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
    currentTeam: {
      id: number | null;
      name: string;
      logo: string;
    };
  };
  totals: {
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
    avgRating: string | null;
  };
  statistics: PlayerCompetitionStat[];
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

export const PlayerDetailPage: React.FC<PlayerDetailPageProps> = ({
  target,
  onBack,
  onOpenLeague,
}) => {
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
  const totals = intel?.totals;
  const statistics = intel?.statistics || [];
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
  const currentTeamId = player?.currentTeam?.id || target.teamId || null;
  const currentTeamName = player?.currentTeam?.name || target.teamName || '';
  const currentTeamLogo = player?.currentTeam?.logo || target.teamLogo || '';

  const wonTrophiesCount = trophies.filter((t) =>
    t.place.toLowerCase().includes('winner') || t.place.includes('1')
  ).length;

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 24px 72px',
        fontFamily: 'var(--font-sans)',
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
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <span
            onClick={onBack}
            style={{
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'color 150ms',
            }}
          >
            Начало
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
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {currentTeamLogo && (
                  <img
                    src={currentTeamLogo}
                    alt=""
                    style={{ width: '15px', height: '15px', objectFit: 'contain' }}
                  />
                )}
                {currentTeamName}
              </span>
            </>
          )}
          <span>›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{displayName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Inline Global Player Search */}
          <div style={{ position: 'relative', minWidth: '270px' }}>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 200)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              placeholder="🔍 Потърси всеки футболист по име..."
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '7px 12px',
                color: 'var(--text-primary)',
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
                  background: '#0D1B2A',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
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
                      color: 'var(--text-muted)',
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
                      color: 'var(--text-muted)',
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
                        transition: 'background 120ms',
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
                            background: 'var(--bg-elevated)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-elevated)',
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
                            color: 'var(--text-primary)',
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
                                color: 'var(--accent-green)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              #{hit.number}
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
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
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '7px 14px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Назад
          </button>
        </div>
      </div>

      {/* Hero Bio Card */}
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(13,27,42,0.96) 0%, rgba(19,35,56,0.94) 60%, rgba(0,212,170,0.08) 100%)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 14px 36px rgba(0,0,0,0.3)',
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
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(0,212,170,0.45)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-green)' }}>
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
                  background: 'var(--accent-green)',
                  color: '#071018',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '2px solid #0D1B2A',
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
                marginBottom: '6px',
              }}
            >
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
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
                    color: 'var(--accent-blue)',
                    background: 'rgba(0,180,216,0.12)',
                    border: '1px solid rgba(0,180,216,0.3)',
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
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: '#071018',
                    background:
                      Number(totals.avgRating) >= 7.2
                        ? 'var(--accent-green)'
                        : Number(totals.avgRating) >= 6.8
                        ? 'var(--accent-amber)'
                        : '#94A3B8',
                    padding: '3px 9px',
                    borderRadius: '6px',
                  }}
                  title="Среден официален рейтинг за сезона"
                >
                  ★ {totals.avgRating}
                </span>
              )}

              {player?.injured && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#EF4444',
                    background: 'rgba(239,68,68,0.14)',
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
                color: 'var(--text-secondary)',
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
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
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
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  🌍 Националност:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{player.nationality}</strong>
                </span>
              )}

              {player?.age && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  🎂 Възраст: <strong style={{ color: 'var(--text-primary)' }}>{player.age} г.</strong>
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
                color: 'var(--text-secondary)',
              }}
            >
              {(player?.birthPlace || player?.birthCountry) && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  📍 Място на раждане:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {[player.birthPlace, player.birthCountry].filter(Boolean).join(', ')}
                  </strong>
                </span>
              )}

              {player?.height && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  📏 Ръст: <strong style={{ color: 'var(--text-primary)' }}>{player.height}</strong>
                </span>
              )}

              {player?.weight && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  ⚖️ Тегло: <strong style={{ color: 'var(--text-primary)' }}>{player.weight}</strong>
                </span>
              )}

              {wonTrophiesCount > 0 && (
                <span
                  onClick={() => setActiveTab('trophies')}
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245,158,11,0.35)',
                    color: 'var(--accent-amber)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🏆 {wonTrophiesCount} спечелени трофея
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
              gridTemplateColumns: 'repeat(4, minmax(112px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                background: 'rgba(10,22,40,0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                МАЧОВЕ / ТИТУЛЯР
              </div>
              <div
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              >
                {totals.appearances} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({totals.lineups})</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-blue)', marginTop: '4px' }}>
                {totals.minutes.toLocaleString()} мин.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(10,22,40,0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                ГОЛОВЕ / АСИСТЕНЦИИ
              </div>
              <div
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-green)',
                }}
              >
                {totals.goals} <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/</span>{' '}
                <span style={{ color: 'var(--accent-blue)' }}>{totals.assists}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Дузпи: {totals.penaltiesScored} вкарани
              </div>
            </div>

            <div
              style={{
                background: 'rgba(10,22,40,0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                УДАРИ (ТОЧНИ)
              </div>
              <div
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              >
                {totals.shotsTotal}{' '}
                <span style={{ fontSize: '13px', color: 'var(--accent-green)' }}>
                  ({totals.shotsOn})
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Дрибъли: {totals.dribblesSuccess}/{totals.dribblesAttempts}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(10,22,40,0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                КЛЮЧОВИ ПАСОВЕ
              </div>
              <div
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-amber)',
                }}
              >
                {totals.passesKey}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Единоборства: {totals.duelsWon}/{totals.duelsTotal}
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
              label: `📊 Статистика по турнири (${statistics.length})`,
            },
            {
              id: 'transfers' as SubTab,
              label: `🔄 Трансферна история (${transfers.length})`,
            },
            {
              id: 'trophies' as SubTab,
              label: `🏆 Трофеи и отличия (${trophies.length})`,
            },
            {
              id: 'sidelined' as SubTab,
              label: `🏥 Контузии и отсъствия (${sidelined.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--accent-green)' : 'var(--bg-surface)',
                color: activeTab === tab.id ? '#0A1628' : 'var(--text-secondary)',
                border: `1px solid ${
                  activeTab === tab.id ? 'var(--accent-green)' : 'var(--border-default)'
                }`,
                borderRadius: '999px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Season Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Сезон:
          </span>
          {[
            { key: 'auto', label: intel?.season ? `Актуален (${intel.season}/${String(intel.season + 1).slice(-2)})` : 'Актуален' },
            { key: '2025', label: '2025/26' },
            { key: '2024', label: '2024/25' },
            { key: '2023', label: '2023/24' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSeason(s.key)}
              style={{
                background:
                  selectedSeason === s.key ? 'rgba(0,212,170,0.16)' : 'var(--bg-surface)',
                color:
                  selectedSeason === s.key ? 'var(--accent-green)' : 'var(--text-secondary)',
                border: `1px solid ${
                  selectedSeason === s.key ? 'var(--accent-green)' : 'var(--border-default)'
                }`,
                borderRadius: '8px',
                padding: '6px 11px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error states */}
      {loading && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '14px',
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          Зареждане на пълно досие, сезонна статистика, трансфери и трофеи за{' '}
          <strong>{displayName}</strong>...
        </div>
      )}

      {!loading && errorMsg && (
        <div
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '14px',
            padding: '28px',
            textAlign: 'center',
            color: '#F87171',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
            {errorMsg}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
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
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '14px',
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
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Сезонна статистика по първенства и турнири (
                  {intel?.season ? `${intel.season}/${String(intel.season + 1).slice(-2)}` : 'Актуален'})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Кликни върху турнир или отбор, за да отвориш техния официален профил
                </div>
              </div>
            </div>

            {statistics.length === 0 ? (
              <div
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
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
                      borderBottom: '1px solid var(--border-default)',
                      color: 'var(--text-muted)',
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
                        borderBottom: '1px solid var(--border-subtle)',
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
                            color: 'var(--text-primary)',
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
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
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
                            color: 'var(--text-secondary)',
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
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        {st.appearances}{' '}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                          ({st.lineups})
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {st.minutes}'
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: st.goals > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                        }}
                      >
                        {st.goals}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: st.assists > 0 ? 'var(--accent-blue)' : 'var(--text-muted)',
                        }}
                      >
                        {st.assists}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {st.shotsTotal}{' '}
                        <span style={{ color: 'var(--accent-green)' }}>({st.shotsOn})</span>
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-amber)',
                          fontWeight: 700,
                        }}
                      >
                        {st.passesKey}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {st.dribblesSuccess}/{st.dribblesAttempts}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {st.duelsWon}/{st.duelsTotal}
                      </td>

                      <td
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
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
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                        }}
                      >
                        {st.rating ? (
                          <span
                            style={{
                              background:
                                Number(st.rating) >= 7.2
                                  ? 'rgba(0,212,170,0.16)'
                                  : 'rgba(255,255,255,0.06)',
                              color:
                                Number(st.rating) >= 7.2
                                  ? 'var(--accent-green)'
                                  : 'var(--text-primary)',
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--accent-green)',
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
                      borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--accent-blue)',
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
                      borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--accent-amber)',
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
                      borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '14px',
            padding: '22px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Пълна трансферна история ({transfers.length})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Всички официални трансфери и наеми в кариерата на футболиста (кликни върху отбор за неговия профил)
            </div>
          </div>

          {transfers.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-muted)',
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
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
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
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ОТ КЛУБ</div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {tr.teamOut.name || '—'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      color: 'var(--accent-green)',
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
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>В КЛУБ</div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--accent-green)',
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
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,212,170,0.12)',
                        color: 'var(--accent-green)',
                        border: '1px solid rgba(0,212,170,0.28)',
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '14px',
            padding: '22px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Спечелени трофеи и отличия ({trophies.length})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Всички шампионски титли, купи и финали в кариерата на футболиста
            </div>
          </div>

          {trophies.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-muted)',
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
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(13,27,42,0.9) 100%)'
                        : 'var(--bg-elevated)',
                      border: `1px solid ${
                        isWinner ? 'rgba(245,158,11,0.38)' : 'var(--border-subtle)'
                      }`,
                      borderRadius: '10px',
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
                            color: 'var(--text-primary)',
                          }}
                        >
                          {tr.league}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
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
                        color: isWinner ? 'var(--accent-amber)' : 'var(--text-secondary)',
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '14px',
            padding: '22px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              История на контузиите и наказанията ({sidelined.length})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Хронологичен архив на всички контузии, заболявания и дисциплинарни наказания
            </div>
          </div>

          {sidelined.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-muted)',
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
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>🏥</span>
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {sd.type}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Официално регистрирано отсъствие
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>От: <strong>{formatDateBg(sd.start)}</strong></span>
                    <span>→</span>
                    <span>До: <strong>{sd.end ? formatDateBg(sd.end) : 'Активна'}</strong></span>
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
