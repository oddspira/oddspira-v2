interface BrandLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function BrandLogo({
  className = 'h-14 sm:h-16',
  showSubtitle = true,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* 3D VECTOR MINIMAL APEX WITH INTERACTIVE EMERALD HOVER AURA */}
      <div className="relative group shrink-0 flex items-center">
        {/* Subtle Ambient Emerald Glow Halo on Hover */}
        <div
          className="absolute -inset-3.5 rounded-3xl bg-gradient-to-tr from-emerald-500/0 via-emerald-400/0 to-teal-400/0 group-hover:from-emerald-500/35 group-hover:via-emerald-400/25 group-hover:to-teal-400/35 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"
          aria-hidden="true"
        />

        {/* 3D Chiseled Vector Insignia */}
        <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]">
          <svg
            className="w-full h-full"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* 3D Metallic Rim Gradient (Top-Left Highlight to Bottom-Right Shadow) */}
              <linearGradient id="v3d_rim" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="25%" stopColor="#34d399" />
                <stop offset="60%" stopColor="#059669" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>

              {/* 3D Sunken Obsidian Core with Inner Shadow */}
              <radialGradient id="v3d_core" cx="30" cy="26" r="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d2e23" />
                <stop offset="60%" stopColor="#03130e" />
                <stop offset="100%" stopColor="#010705" />
              </radialGradient>

              {/* 3D Spiral Extrusion Facet */}
              <linearGradient id="v3d_spiral_top" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              {/* 3D Arrow Shaft Gradient (Specular White to Emerald) */}
              <linearGradient id="v3d_arrow_shaft" x1="16" y1="44" x2="44" y2="21" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="40%" stopColor="#6ee7b7" />
                <stop offset="80%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              {/* 3D Arrowhead Left Bevel (Direct Light Reflection) */}
              <linearGradient id="v3d_arrow_left_bevel" x1="31" y1="21" x2="45" y2="21" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              {/* 3D Arrowhead Downward Face (Shaded Emerald Bevel) */}
              <linearGradient id="v3d_arrow_right_bevel" x1="45" y1="21" x2="45" y2="35" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* 3D Spherical Apex Node Lighting */}
              <radialGradient id="v3d_orb" cx="44" cy="20" r="3.5" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>

              {/* 3D Drop Shadow Filter */}
              <filter id="v3d_shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.85" />
              </filter>
            </defs>

            {/* 1. Base 3D Squircle with Beveled Rim */}
            <rect
              x="2.5"
              y="2.5"
              width="59"
              height="59"
              rx="16"
              fill="url(#v3d_core)"
              stroke="url(#v3d_rim)"
              strokeWidth="2.5"
            />

            {/* Inner Bevel Rim Highlight (Simulating 3D Chamfered Edge) */}
            <rect
              x="4.5"
              y="4.5"
              width="55"
              height="55"
              rx="14"
              fill="none"
              stroke="#34d399"
              strokeWidth="0.8"
              opacity="0.3"
            />

            {/* Subtle Grid Coordinate Guides */}
            <line x1="12" y1="32" x2="52" y2="32" stroke="#064e3b" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.3" />
            <line x1="32" y1="12" x2="32" y2="52" stroke="#064e3b" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.3" />

            {/* 2. 3D Faceted Mobius Spiral Loop (Layered Depth) */}
            <path
              d="M32 11C43.6 11 53 20.4 53 32C53 43.6 43.6 53 32 53C20.4 53 11 43.6 11 32C11 23.6 15.9 16.3 22.9 12.8"
              stroke="#021a12"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M32 10C44.15 10 54 19.85 54 32C54 44.15 44.15 54 32 54C19.85 54 10 44.15 10 32C10 23.2 15.1 15.6 22.5 12"
              stroke="url(#v3d_spiral_top)"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M32 18C39.73 18 46 24.27 46 32C46 39.73 39.73 46 32 46C24.27 46 18 39.73 18 32C18 26.5 21.2 21.8 26 19.5"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* 3. 3D JAGGED BREAKOUT ARROW (EXTRUDED & CHISELED) */}
            <g filter="url(#v3d_shadow)">
              <path
                d="M 17 44 L 27 36 L 32 40 L 45 21"
                stroke="#010805"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 31 21 L 45 21 L 45 35"
                stroke="#010805"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 3D Arrow Extruded Flank */}
            <path
              d="M 18 45.2 L 28 37.2 L 33 41.2 L 46 22.2"
              stroke="#044b36"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3D Arrow Shaft Top Ridge */}
            <path
              d="M 17 44 L 27 36 L 32 40 L 45 21"
              stroke="url(#v3d_arrow_shaft)"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3D Arrowhead Left Face */}
            <path
              d="M 31 21 L 45 21"
              stroke="url(#v3d_arrow_left_bevel)"
              strokeWidth="4.6"
              strokeLinecap="round"
            />

            {/* 3D Arrowhead Downward Face */}
            <path
              d="M 45 21 L 45 35"
              stroke="url(#v3d_arrow_right_bevel)"
              strokeWidth="4.6"
              strokeLinecap="round"
            />

            {/* 3D Chiseled Centerline Spine */}
            <line x1="32" y1="21" x2="45" y2="21" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

            {/* 3D Spherical Apex Node with Specular Glow */}
            <circle cx="45" cy="21" r="3.2" fill="url(#v3d_orb)" />
            <circle cx="45" cy="21" r="5.5" stroke="#34d399" strokeWidth="1.2" opacity="0.8" />
            <circle cx="44.2" cy="20.2" r="1.1" fill="#ffffff" />

            {/* Quantitative Pivot Origin */}
            <circle cx="17" cy="44" r="3" fill="#044b36" />
            <circle cx="17" cy="44" r="2.2" fill="#10b981" />
            <circle cx="16.5" cy="43.5" r="0.8" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* TYPOGRAPHIC WORDMARK - HIGH-END SWISS LUXURY FINTECH */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight">
          <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm group-hover:text-neutral-100 transition-colors">
            ODD
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 ml-0.5">
            SPIRA
          </span>
          <span className="text-emerald-400 font-mono text-xl sm:text-2xl font-black ml-0.5">
            ′
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.24em] text-emerald-400/90 uppercase">
              QUANTITATIVE SPORTS ANALYTICS
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
