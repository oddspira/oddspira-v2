import React, { useState, useEffect, useRef } from 'react';
import { Match, ActiveTab } from '../types';
import { TeamBadge } from './TeamBadge';

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

  const matchingFixtures = matches.filter(
    (m) =>
      m.homeTeam.toLowerCase().includes(trimmed) ||
      m.awayTeam.toLowerCase().includes(trimmed) ||
      m.league.toLowerCase().includes(trimmed)
  );

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
            placeholder="Търсене на мач, отбор, състезание или инструмент..."
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
          {/* Matches Matches */}
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
                        <TeamBadge name={m.homeTeam} size="sm" />
                        <span className="text-sm font-semibold text-[#f7f8fb]">
                          {m.homeTeam}
                        </span>
                      </div>
                      <span className="text-xs text-[#8f9cae] font-mono">vs</span>
                      <div className="flex items-center gap-1.5">
                        <TeamBadge name={m.awayTeam} size="sm" />
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
                        Отвори →
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
