import React from 'react';
import { Language } from '../types';

interface LiveMarketTickerProps {
  language: Language;
  onSelectMatch?: (id: string) => void;
}

export const LiveMarketTicker: React.FC<LiveMarketTickerProps> = ({
  language,
}) => {
  const tickerItems = [
    {
      league: 'UCL',
      match: 'Man City vs Real Madrid',
      detail: 'Fair 1.92 vs Bookie 2.15',
      edge: '+11.8% EV',
      type: 'value',
      sharpFlow: '$2.4M',
    },
    {
      league: 'EPL',
      match: 'Arsenal vs Liverpool',
      detail: 'Model Draw 3.25 vs Bet365 3.60',
      edge: '+10.8% EV',
      type: 'value',
      sharpFlow: '$1.8M',
    },
    {
      league: 'La Liga',
      match: 'Barcelona vs Atl. Madrid',
      detail: 'BTTS Fair 1.72 vs Pinnacle 1.95',
      edge: '+13.4% EV',
      type: 'value',
      sharpFlow: '$950K',
    },
    {
      league: 'Serie A',
      match: 'Inter vs Juventus',
      detail: '1X2 Zero-Vig Margin: 1.84%',
      edge: 'Devigged',
      type: 'info',
      sharpFlow: '$3.1M',
    },
    {
      league: 'Bundesliga',
      match: 'Bayern vs Dortmund',
      detail: 'Over 3.5 Goals True Prob: 64.2%',
      edge: '+8.6% EV',
      type: 'value',
      sharpFlow: '$1.2M',
    },
  ];

  return (
    <div className="w-full bg-[#05070a] border-b border-neutral-800/80 overflow-hidden py-2 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Real-time Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-400 shrink-0 border-r border-neutral-800 pr-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold tracking-wider uppercase">QUANT FEED</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400">0.4s LATENCY</span>
        </div>

        {/* Scrolling Ticker Stream */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 text-xs font-mono">
          {tickerItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group hover:opacity-100 transition-opacity"
            >
              <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400 font-bold">
                {item.league}
              </span>
              <span className="text-neutral-200 font-medium">{item.match}</span>
              <span className="text-neutral-400 text-[11px]">{item.detail}</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                  item.type === 'value'
                    ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30'
                    : 'text-teal-300 bg-teal-950/60 border border-teal-500/30'
                }`}
              >
                {item.edge}
              </span>
              <span className="text-neutral-500 text-[10px] hidden md:inline">
                Vol: {item.sharpFlow}
              </span>
              {idx < tickerItems.length - 1 && (
                <span className="text-neutral-800 ml-2" aria-hidden="true">
                  |
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
