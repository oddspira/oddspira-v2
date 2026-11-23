import React, { useEffect, useState } from 'react';

// Official API-Sports CDN Club Crests + Dynamic Runtime Registry
const TEAM_LOGO_REGISTRY: Record<string, string> = {
  'manchester city': 'https://media.api-sports.io/football/teams/50.png',
  'man city': 'https://media.api-sports.io/football/teams/50.png',
  'manchester united': 'https://media.api-sports.io/football/teams/33.png',
  'man united': 'https://media.api-sports.io/football/teams/33.png',
  'man utd': 'https://media.api-sports.io/football/teams/33.png',
  'newcastle united': 'https://media.api-sports.io/football/teams/34.png',
  newcastle: 'https://media.api-sports.io/football/teams/34.png',
  arsenal: 'https://media.api-sports.io/football/teams/42.png',
  chelsea: 'https://media.api-sports.io/football/teams/49.png',
  liverpool: 'https://media.api-sports.io/football/teams/40.png',
  tottenham: 'https://media.api-sports.io/football/teams/47.png',
  'aston villa': 'https://media.api-sports.io/football/teams/66.png',
  'real madrid': 'https://media.api-sports.io/football/teams/541.png',
  barcelona: 'https://media.api-sports.io/football/teams/529.png',
  'atletico madrid': 'https://media.api-sports.io/football/teams/530.png',
  'athletic club': 'https://media.api-sports.io/football/teams/531.png',
  villarreal: 'https://media.api-sports.io/football/teams/533.png',
  'bayern munich': 'https://media.api-sports.io/football/teams/157.png',
  dortmund: 'https://media.api-sports.io/football/teams/165.png',
  'borussia dortmund': 'https://media.api-sports.io/football/teams/165.png',
  'bayer leverkusen': 'https://media.api-sports.io/football/teams/168.png',
  leverkusen: 'https://media.api-sports.io/football/teams/168.png',
  'inter milan': 'https://media.api-sports.io/football/teams/505.png',
  inter: 'https://media.api-sports.io/football/teams/505.png',
  'ac milan': 'https://media.api-sports.io/football/teams/489.png',
  juventus: 'https://media.api-sports.io/football/teams/496.png',
  'as roma': 'https://media.api-sports.io/football/teams/497.png',
  roma: 'https://media.api-sports.io/football/teams/497.png',
  atalanta: 'https://media.api-sports.io/football/teams/499.png',
  napoli: 'https://media.api-sports.io/football/teams/492.png',
  psg: 'https://media.api-sports.io/football/teams/85.png',
  'paris saint germain': 'https://media.api-sports.io/football/teams/85.png',
  lyon: 'https://media.api-sports.io/football/teams/80.png',
  'sporting cp': 'https://media.api-sports.io/football/teams/228.png',
  benfica: 'https://media.api-sports.io/football/teams/211.png',
  'young boys': 'https://media.api-sports.io/football/teams/565.png',
  'sturm graz': 'https://media.api-sports.io/football/teams/637.png',
  'america mineiro': 'https://media.api-sports.io/football/teams/125.png',
  avai: 'https://media.api-sports.io/football/teams/145.png',
  'atletico goianiense': 'https://media.api-sports.io/football/teams/144.png',
  'atletico-go': 'https://media.api-sports.io/football/teams/144.png',
  cuiaba: 'https://media.api-sports.io/football/teams/1193.png',
  crb: 'https://media.api-sports.io/football/teams/146.png',
  ceara: 'https://media.api-sports.io/football/teams/129.png',
  criciuma: 'https://media.api-sports.io/football/teams/140.png',
  novorizontino: 'https://media.api-sports.io/football/teams/755.png',
};

const LEAGUE_LOGO_REGISTRY: Record<string, string> = {
  'premier league': 'https://media.api-sports.io/football/leagues/39.png',
  'la liga': 'https://media.api-sports.io/football/leagues/140.png',
  laliga: 'https://media.api-sports.io/football/leagues/140.png',
  'serie a': 'https://media.api-sports.io/football/leagues/135.png',
  'serie b': 'https://media.api-sports.io/football/leagues/72.png',
  bundesliga: 'https://media.api-sports.io/football/leagues/78.png',
  'ligue 1': 'https://media.api-sports.io/football/leagues/61.png',
  'champions league': 'https://media.api-sports.io/football/leagues/2.png',
  'uefa champions league': 'https://media.api-sports.io/football/leagues/2.png',
  'europa league': 'https://media.api-sports.io/football/leagues/3.png',
  'uefa europa league': 'https://media.api-sports.io/football/leagues/3.png',
  'primeira liga': 'https://media.api-sports.io/football/leagues/94.png',
  eredivisie: 'https://media.api-sports.io/football/leagues/88.png',
  'first league': 'https://media.api-sports.io/football/leagues/172.png',
};

export function proxyApiSportsUrl(rawUrl?: string | null): string | null {
  const str = String(rawUrl || '').trim();
  if (!str) return null;
  if (str.startsWith('/api/football/media/')) return str;
  const mFootball = str.match(
    /^https?:\/\/media(?:-\d+)?\.api-sports\.io\/football\/([a-z0-9_-]+)\/([a-z0-9_.-]+)$/i
  );
  if (mFootball) {
    return `/api/football/media/${mFootball[1].toLowerCase()}/${mFootball[2]}`;
  }
  const mFlag = str.match(
    /^https?:\/\/media(?:-\d+)?\.api-sports\.io\/flags\/([a-z0-9_.-]+)$/i
  );
  if (mFlag) {
    return `/api/football/media/flags/${mFlag[1]}`;
  }
  return str;
}

export function registerMatchLogos(
  matches: Array<{
    homeTeam?: string;
    awayTeam?: string;
    homeLogo?: string;
    awayLogo?: string;
    league?: string;
    leagueLogo?: string;
  }>
): void {
  for (const m of matches) {
    if (m.homeTeam && m.homeLogo) {
      const proxied = proxyApiSportsUrl(m.homeLogo);
      if (proxied) TEAM_LOGO_REGISTRY[m.homeTeam.trim().toLowerCase()] = proxied;
    }
    if (m.awayTeam && m.awayLogo) {
      const proxied = proxyApiSportsUrl(m.awayLogo);
      if (proxied) TEAM_LOGO_REGISTRY[m.awayTeam.trim().toLowerCase()] = proxied;
    }
    if (m.league && m.leagueLogo) {
      const proxied = proxyApiSportsUrl(m.leagueLogo);
      if (proxied) LEAGUE_LOGO_REGISTRY[m.league.trim().toLowerCase()] = proxied;
    }
  }
}

export function getTeamLogoUrl(teamName: string, explicitLogo?: string): string | null {
  if (explicitLogo) return proxyApiSportsUrl(explicitLogo);
  const key = (teamName || '').trim().toLowerCase();
  if (!key) return null;
  if (TEAM_LOGO_REGISTRY[key]) return proxyApiSportsUrl(TEAM_LOGO_REGISTRY[key]);
  for (const [knownName, url] of Object.entries(TEAM_LOGO_REGISTRY)) {
    if (knownName.length >= 4 && key.length >= 4) {
      if (key.includes(knownName) || knownName.includes(key)) {
        return proxyApiSportsUrl(url);
      }
    }
  }
  return null;
}

export function getLeagueLogoUrl(leagueName: string, explicitLogo?: string): string | null {
  if (explicitLogo) return proxyApiSportsUrl(explicitLogo);
  const key = (leagueName || '').trim().toLowerCase();
  if (!key) return null;
  if (LEAGUE_LOGO_REGISTRY[key]) return proxyApiSportsUrl(LEAGUE_LOGO_REGISTRY[key]);
  for (const [knownName, url] of Object.entries(LEAGUE_LOGO_REGISTRY)) {
    if (key === knownName || key.includes(knownName)) {
      return proxyApiSportsUrl(url);
    }
  }
  return null;
}

interface LeagueBadgeProps {
  name: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({
  name,
  logoUrl,
  size = 'sm',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const resolvedLogo = getLeagueLogoUrl(name, logoUrl);

  useEffect(() => {
    setImgError(false);
  }, [resolvedLogo]);

  const sizeClasses = {
    xs: 'w-3.5 h-3.5 rounded-sm p-0.5 text-[9px]',
    sm: 'w-4 h-4 rounded p-0.5 text-[9px]',
    md: 'w-8 h-8 rounded-lg p-1 text-xs',
    lg: 'w-11 h-11 rounded-xl p-1.5 text-sm',
  };

  if (resolvedLogo && !imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-white/95 border border-white/20 shrink-0 overflow-hidden select-none ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <img
          src={resolvedLogo}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center bg-emerald-500/20 border border-emerald-500/40 font-black text-emerald-400 shrink-0 select-none ${sizeClasses[size]} ${className}`}
      title={name}
    >
      ⚽
    </span>
  );
};

interface TeamBadgeProps {
  name: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  name,
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const resolvedLogo = getTeamLogoUrl(name, logoUrl);

  useEffect(() => {
    setImgError(false);
  }, [resolvedLogo]);

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

  if (resolvedLogo && !imgError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#0e1624] border border-[#223049] ${sizeMap[size]} shadow-sm shrink-0 overflow-hidden select-none p-0.5 ${className}`}
        title={name}
        aria-label={name}
      >
        <img
          src={resolvedLogo}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>
    );
  }

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
