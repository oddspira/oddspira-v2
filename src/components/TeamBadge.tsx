import React from 'react';

interface TeamBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const getTeamVisuals = (teamName: string) => {
    const lower = teamName.toLowerCase();

    if (lower.includes('manchester city') || lower.includes('man city')) {
      return {
        bg: 'from-[#6CABDD] via-[#5094cc] to-[#1C2C5B]',
        border: 'border-[#6CABDD]/60',
        text: 'text-white',
        initials: 'MCFC',
        glow: 'shadow-[#6CABDD]/30',
        symbol: (
          <path
            d="M12 4L19 8V14C19 18 12 21 12 21C12 21 5 18 5 14V8L12 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('manchester united') || lower.includes('man utd')) {
      return {
        bg: 'from-[#DA291C] via-[#B31B1B] to-[#FBE122]',
        border: 'border-[#FBE122]/70',
        text: 'text-[#FBE122] font-black',
        initials: 'MUN',
        glow: 'shadow-[#DA291C]/40',
        symbol: (
          <path
            d="M12 4L19 8V14C19 18 12 21 12 21C12 21 5 18 5 14V8L12 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('newcastle')) {
      return {
        bg: 'from-[#111111] via-[#333333] to-[#00A8E8]',
        border: 'border-white/60',
        text: 'text-white font-black',
        initials: 'NEW',
        glow: 'shadow-white/25',
        symbol: (
          <path
            d="M12 4L19 8V14C19 18 12 21 12 21C12 21 5 18 5 14V8L12 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('real madrid')) {
      return {
        bg: 'from-[#FFFFFF] via-[#F1F3F5] to-[#EEB730]',
        border: 'border-[#EEB730]/70',
        text: 'text-[#1C2C5B]',
        initials: 'RMA',
        glow: 'shadow-[#EEB730]/30',
        symbol: (
          <path
            d="M6 10L12 6L18 10L16 17H8L6 10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('arsenal')) {
      return {
        bg: 'from-[#DB0007] via-[#9C0005] to-[#023474]',
        border: 'border-[#DB0007]/60',
        text: 'text-white',
        initials: 'AFC',
        glow: 'shadow-[#DB0007]/30',
        symbol: (
          <path
            d="M5 8H19M7 12H17M9 16H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ),
      };
    }
    if (lower.includes('aston villa') || lower.includes('villa')) {
      return {
        bg: 'from-[#670E36] via-[#4B0A27] to-[#95BFE5]',
        border: 'border-[#95BFE5]/70',
        text: 'text-[#FEE505] font-black',
        initials: 'AVFC',
        glow: 'shadow-[#670E36]/40',
        symbol: (
          <path
            d="M12 4L18 8V14L12 20L6 14V8L12 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('chelsea')) {
      return {
        bg: 'from-[#034694] via-[#001489] to-[#0A2240]',
        border: 'border-[#034694]/70',
        text: 'text-white font-bold',
        initials: 'CFC',
        glow: 'shadow-[#034694]/30',
        symbol: (
          <path
            d="M8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V12H8V8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('ac milan') || (lower.includes('milan') && !lower.includes('inter'))) {
      return {
        bg: 'from-[#FB090B] via-[#000000] to-[#FB090B]',
        border: 'border-[#FB090B]/60',
        text: 'text-white font-bold',
        initials: 'ACM',
        glow: 'shadow-[#FB090B]/30',
        symbol: (
          <path
            d="M6 6H18V18H6V6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('liverpool')) {
      return {
        bg: 'from-[#C8102E] via-[#A8001F] to-[#00B2A9]',
        border: 'border-[#00B2A9]/50',
        text: 'text-white',
        initials: 'LFC',
        glow: 'shadow-[#C8102E]/30',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('barcelona')) {
      return {
        bg: 'from-[#004D98] via-[#7B1741] to-[#EDBB00]',
        border: 'border-[#EDBB00]/60',
        text: 'text-white',
        initials: 'FCB',
        glow: 'shadow-[#EDBB00]/30',
        symbol: (
          <path
            d="M7 6H17V13C17 17 12 19 12 19C12 19 7 17 7 13V6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('atlético') || lower.includes('atletico')) {
      return {
        bg: 'from-[#CB3524] via-[#FFFFFF] to-[#272E61]',
        border: 'border-[#CB3524]/60',
        text: 'text-white',
        initials: 'ATM',
        glow: 'shadow-[#CB3524]/30',
        symbol: (
          <path
            d="M12 4L18 9V15L12 20L6 15V9L12 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('bayern')) {
      return {
        bg: 'from-[#DC052D] via-[#A60021] to-[#0066B2]',
        border: 'border-[#DC052D]/60',
        text: 'text-white',
        initials: 'FCB',
        glow: 'shadow-[#DC052D]/30',
        symbol: (
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('dortmund') || lower.includes('bvb')) {
      return {
        bg: 'from-[#FDE100] via-[#F5CC00] to-[#111111]',
        border: 'border-[#FDE100]/70',
        text: 'text-neutral-950 font-black',
        initials: 'BVB',
        glow: 'shadow-[#FDE100]/30',
        symbol: (
          <path
            d="M6 12L12 6L18 12L12 18L6 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ),
      };
    }
    if (lower.includes('inter')) {
      return {
        bg: 'from-[#010E80] via-[#0055A5] to-[#111111]',
        border: 'border-[#0055A5]/60',
        text: 'text-white',
        initials: 'INT',
        glow: 'shadow-[#010E80]/30',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('juventus')) {
      return {
        bg: 'from-[#FFFFFF] via-[#333333] to-[#000000]',
        border: 'border-white/50',
        text: 'text-white font-bold',
        initials: 'JUV',
        glow: 'shadow-white/20',
        symbol: (
          <path
            d="M9 6V14C9 16 11 18 13 18C15 18 15 16 15 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ),
      };
    }
    if (lower.includes('paris') || lower.includes('psg')) {
      return {
        bg: 'from-[#004170] via-[#DA291C] to-[#FFFFFF]',
        border: 'border-[#004170]/60',
        text: 'text-white',
        initials: 'PSG',
        glow: 'shadow-[#004170]/30',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('leverkusen')) {
      return {
        bg: 'from-[#E32221] via-[#111111] to-[#F3E500]',
        border: 'border-[#E32221]/70',
        text: 'text-white font-black',
        initials: 'B04',
        glow: 'shadow-[#E32221]/30',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('roma')) {
      return {
        bg: 'from-[#8E1F2F] via-[#A92436] to-[#F0BC42]',
        border: 'border-[#F0BC42]/70',
        text: 'text-[#F0BC42] font-black',
        initials: 'ASR',
        glow: 'shadow-[#8E1F2F]/40',
        symbol: (
          <path d="M12 4L18 8V14L12 20L6 14V8L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('young boys')) {
      return {
        bg: 'from-[#FFCC00] via-[#E5B800] to-[#111111]',
        border: 'border-[#FFCC00]/70',
        text: 'text-neutral-950 font-black',
        initials: 'YB',
        glow: 'shadow-[#FFCC00]/30',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('villarreal')) {
      return {
        bg: 'from-[#FFE667] via-[#F5D000] to-[#005187]',
        border: 'border-[#FFE667]/70',
        text: 'text-[#005187] font-black',
        initials: 'VIL',
        glow: 'shadow-[#FFE667]/30',
        symbol: (
          <path d="M12 4L18 8V14L12 20L6 14V8L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('tottenham') || lower.includes('spurs')) {
      return {
        bg: 'from-[#FFFFFF] via-[#E2E8F0] to-[#132257]',
        border: 'border-[#132257]/70',
        text: 'text-[#132257] font-black',
        initials: 'TOT',
        glow: 'shadow-white/20',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('atalanta')) {
      return {
        bg: 'from-[#1E71B8] via-[#0F3A61] to-[#000000]',
        border: 'border-[#1E71B8]/70',
        text: 'text-white font-black',
        initials: 'ATA',
        glow: 'shadow-[#1E71B8]/30',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('sporting')) {
      return {
        bg: 'from-[#008057] via-[#006644] to-[#FFFFFF]',
        border: 'border-[#008057]/70',
        text: 'text-white font-black',
        initials: 'SCP',
        glow: 'shadow-[#008057]/30',
        symbol: (
          <path d="M12 4L18 8V14L12 20L6 14V8L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }
    if (lower.includes('sturm')) {
      return {
        bg: 'from-[#111111] via-[#262626] to-[#FFFFFF]',
        border: 'border-white/50',
        text: 'text-white font-black',
        initials: 'STU',
        glow: 'shadow-white/20',
        symbol: (
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        ),
      };
    }

    // Default Generic Club Crest
    return {
      bg: 'from-neutral-800 via-neutral-850 to-neutral-900',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300 font-bold',
      initials: teamName.slice(0, 3).toUpperCase(),
      glow: 'shadow-emerald-500/10',
      symbol: (
        <path
          d="M12 4L18 8V14C18 17 12 20 12 20C12 20 6 17 6 14V8L12 4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ),
    };
  };

  const visuals = getTeamVisuals(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${visuals.bg} border ${visuals.border} ${sizeMap[size]} shadow-md ${visuals.glow} shrink-0 overflow-hidden select-none font-mono tracking-tighter ${className}`}
      title={name}
      aria-label={name}
    >
      {/* Subtle glass reflex */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />
      
      {/* Club Acronym / Emblem */}
      <span className={`relative z-10 font-bold ${visuals.text}`}>
        {visuals.initials}
      </span>
    </div>
  );
};
