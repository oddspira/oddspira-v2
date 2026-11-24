import React, { useState, useEffect, useRef } from 'react';
import { Match, ActiveTab } from '../types';
import { TeamBadge, openTeamProfile } from './TeamBadge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectMatch?: (match: Match) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  matches,
  setActiveTab,
  onSelectMatch,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

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

  const quickLinks: { title: string; tab: ActiveTab; icon: string; desc: string }[] = [
    { title: 'На живо', tab: 'live', icon: '⚡', desc: 'Текущи мачове и симулация в реално време' },
    { title: 'Състезания', tab: 'competitions', icon: '🏆', desc: 'Европейски лиги и турнири' },
    { title: 'Анализ', tab: 'analysis', icon: '📊', desc: 'Двумерен Poisson & Dixon-Coles калкулатор' },
    { title: 'Моите залози', tab: 'bets', icon: '💼', desc: 'Управление на личната банка и P&L' },
    { title: 'Инструменти', tab: 'tools', icon: '📐', desc: '+EV стойност, Kelly критерий и No-Vig' },
    { title: 'Научи', tab: 'learn', icon: '📚', desc: 'Математически основи и формули' },
  ];

  const filteredLinks = trimmed
    ? quickLinks.filter(
        (l) =>
          l.title.toLowerCase().includes(trimmed) ||
          l.desc.toLowerCase().includes(trimmed)
      )
    : quickLinks;

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
                } else {
                  openTeamProfile({ teamName: query.trim() });
                }
                onClose();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Търсене на отбор (напр. Arsenal, Levski, Real Madrid), мач или лига..."
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
          {/* Team Profiles Section */}
          {trimmed.length >= 2 && (
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                <span>Отбори — Официален профил, класиране и състав</span>
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
                      Профил на отбора →
                    </span>
                  </button>
                ))}

                {/* Direct API-Football Lookup for ANY team worldwide */}
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
                        Потърси отбор „{query.trim()}“ в глобалната база
                      </span>
                      <span className="text-[11px] text-[#8f9cae] block">
                        Отваря официална страница със стадион, треньор, класиране, играчи и мачове
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 shrink-0">
                    Отвори ↗
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Matches */}
          {matchingFixtures.length > 0 && (
            <div>
              <div className="text-xs font-mono text-[#8f9cae] uppercase tracking-wider px-2 mb-2">
                Спортни срещи ({matchingFixtures.length})
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
                        Детайли →
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
              Секции на платформата
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
          <span>Бързо търсене в Oddspira</span>
          <span>Натиснете [ESC] за затваряне</span>
        </div>
      </div>
    </div>
  );
};
