import { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/i18n';

export function ArchitectureModal({
  language,
  isOpen,
  onClose,
}: {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = translations[language];
  const [activeSection, setActiveSection] = useState<'monorepo' | 'deploy' | 'apifootball' | 'mathstack'>('monorepo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>ODDSPIRA_ARCHITECTURE_BLUEPRINT</span>
              <span aria-hidden="true">·</span>
              <span>PRODUCTION_SPEC_2026</span>
            </div>
            <h3 className="text-lg font-bold text-white font-mono">{t.archTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900/80 border-b border-neutral-800 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveSection('monorepo')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeSection === 'monorepo' ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            1. Monorepo Folder Structure
          </button>
          <button
            onClick={() => setActiveSection('deploy')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeSection === 'deploy' ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            2. Cloudflare Pages & Wrangler CLI
          </button>
          <button
            onClick={() => setActiveSection('apifootball')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeSection === 'apifootball' ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            3. API-Football.com Ingestion & Cache
          </button>
          <button
            onClick={() => setActiveSection('mathstack')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeSection === 'mathstack' ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            4. Stochastic Engine & Tech Stack
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono text-neutral-300 leading-relaxed">
          {activeSection === 'monorepo' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase text-emerald-400">
                Monorepo Directory Layout (Turborepo + pnpm workspaces)
              </h4>
              <p className="text-neutral-400">
                A clean separation between client Astro front-end, quantitative stochastic calculation packages, and API-Football workers:
              </p>
              <pre className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 overflow-x-auto text-[11px] text-emerald-300">
{`oddspira/
├── apps/
│   ├── web/                     # Astro 5 / Vite SSR + Islands Architecture
│   │   ├── src/
│   │   │   ├── components/      # UI Islands (React / Tailwind CSS)
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── PoissonEngine.tsx
│   │   │   │   ├── LiveMatchesBoard.tsx
│   │   │   │   ├── BankrollTracker.tsx
│   │   │   │   └── CalculatorsHub.tsx
│   │   │   ├── layouts/         # Base HTML & SEO Layout
│   │   │   ├── pages/           # Astro routes: [lang]/index.astro, [lang]/matches.astro
│   │   │   └── env.d.ts
│   │   ├── astro.config.mjs     # Cloudflare Pages SSR adapter (@astrojs/cloudflare)
│   │   ├── wrangler.toml        # Cloudflare Pages deploy configuration
│   │   └── package.json
│   │
│   └── cron-worker/             # Cloudflare Worker for background fixture polling
│       ├── src/index.ts         # Scheduled cron triggers every 60s
│       └── wrangler.toml
│
├── packages/
│   ├── stochastic-engine/       # Core Mathematical Library (Zero dependencies)
│   │   ├── src/
│   │   │   ├── poisson.ts       # Bivariate Poisson & Dixon-Coles
│   │   │   ├── novig.ts         # Shin & Multiplicative de-margin
│   │   │   ├── kelly.ts         # Log-wealth & Fractional Kelly criterion
│   │   │   └── montecarlo.ts    # 10,000 In-play match simulations
│   │   └── package.json
│   │
│   ├── api-football-client/     # Typed API-Football SDK & Redis Caching
│   │   ├── src/
│   │   │   ├── fixtures.ts      # Live & upcoming fixture normalization
│   │   │   ├── odds.ts          # Real-time bookmaker price aggregation
│   │   │   └── client.ts        # Rate-limiter with Upstash Redis cache
│   │   └── package.json
│   │
│   └── ui-kit/                  # Shared Design System & Emerald Tokens
│
├── package.json                 # pnpm workspace root
├── turbo.json                   # Pipeline caching (build, test, lint)
└── tsconfig.base.json`}
              </pre>
            </div>
          )}

          {activeSection === 'deploy' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase text-emerald-400">
                Cloudflare Pages Deployment via Wrangler CLI
              </h4>
              <p className="text-neutral-400">
                Zero cold starts, global edge network, and guaranteed fast loading even under heavy live football traffic:
              </p>
              
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-3">
                <span className="text-white font-bold block">1. Build Script:</span>
                <code className="text-emerald-400 block bg-neutral-950 p-2 rounded">
                  pnpm --filter @oddspira/web run build
                </code>

                <span className="text-white font-bold block">2. Wrangler Pages Deploy (Manual Clean Slate):</span>
                <code className="text-emerald-400 block bg-neutral-950 p-2 rounded">
                  npx wrangler pages deploy ./apps/web/dist --project-name=oddspira --branch=main
                </code>

                <span className="text-white font-bold block">3. wrangler.toml Configuration:</span>
                <pre className="text-[11px] text-neutral-300 bg-neutral-950 p-3 rounded">
{`name = "oddspira"
compatibility_date = "2026-11-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"
DEFAULT_LOCALE = "bg"

# Upstash Redis for API-Football 60s live caching
[[kv_namespaces]]
binding = "ODDSPIRA_KV"
id = "<your-kv-namespace-id>"`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'apifootball' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase text-emerald-400">
                API-Football.com Ingestion & High-Speed Cache Architecture
              </h4>
              <p className="text-neutral-400">
                API-Football rate limits must be respected without slowing down end-user requests. Here is our 3-tier caching model:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-emerald-400 font-bold block mb-1">Tier 1: Cloudflare Edge (KV)</span>
                  <p className="text-[11px] text-neutral-400">
                    Caches live match scores for 15 seconds. Serves 99.4% of client requests directly from edge memory without touching external APIs.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-emerald-400 font-bold block mb-1">Tier 2: Upstash Redis</span>
                  <p className="text-[11px] text-neutral-400">
                    Stores historical xG ratings, team attack/defense ratings, and pre-match opening lines for fast Poisson lookups.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-emerald-400 font-bold block mb-1">Tier 3: Cron Poller Worker</span>
                  <p className="text-[11px] text-neutral-400">
                    Cloudflare Scheduled Worker polls <code>/fixtures?live=all</code> every 30 seconds during match hours, updates KV, and triggers Poisson recalculations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'mathstack' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase text-emerald-400">
                Recommended Technology Stack for Big Data & High Performance
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-emerald-400 font-bold">Frontend:</span>
                  <div>
                    <strong className="text-white">Astro 5 + React Islands + Tailwind CSS</strong>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Zero unnecessary JavaScript shipped on static marketing & explanatory pages; React interactive islands loaded only for live matrix calculation and bet logging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-emerald-400 font-bold">Compute:</span>
                  <div>
                    <strong className="text-white">Cloudflare Workers / WebAssembly (Wasm)</strong>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Ultra-fast stochastic Poisson calculation compiled to Wasm or native TypeScript running at sub-5ms latency across 300+ edge locations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-emerald-400 font-bold">Database:</span>
                  <div>
                    <strong className="text-white">PostgreSQL (Supabase/Neon) or Cloudflare D1</strong>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Relational storage for user bankrolls, VIP subscriptions, closing line value (CLV) history, and team strength coefficients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-neutral-500 font-mono text-[11px]">Oddspira Engineering Specification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold bg-emerald-500 text-neutral-950 rounded hover:bg-emerald-400"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
