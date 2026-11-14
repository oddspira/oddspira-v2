import { useState, useEffect } from 'react';
import { Language } from '../types';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface AdminOverviewData {
  apiFootball: {
    plan: string;
    dailyLimit: number;
    estimatedDailyUsed: number;
    configured: boolean;
    sqliteCacheActive: boolean;
  };
  brevo: {
    plan: string;
    dailyLimit: number;
    dailyUsed: number;
    configured: boolean;
    senderEmail: string;
    senderName: string;
  };
  monetization: {
    mode: string;
    stripeConfigured: boolean;
    plans: {
      id: string;
      name: string;
      priceEur: number;
      features: string[];
    }[];
  };
  users: { id: number; name: string; email: string; role: string; createdAt: string }[];
  subscribers: { id: number; email: string; createdAt: string }[];
  emailLogs: {
    id: number;
    recipient: string;
    templateType: string;
    subject: string;
    status: string;
    createdAt: string;
  }[];
}

export function AdminControlModal({ isOpen, onClose }: AdminControlModalProps) {
  const [activeTab, setActiveTab] = useState<'monetization' | 'brevo' | 'api_ovh' | 'users'>(
    'monetization'
  );
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [previewType, setPreviewType] = useState<'welcome' | 'password_reset' | 'ev_digest'>(
    'welcome'
  );
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [testDigestEmail, setTestDigestEmail] = useState<string>('golemboi9@gmail.com');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const loadOverview = () => {
    fetch('/api/admin/overview')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setOverview(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isOpen) return;
    loadOverview();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'brevo') return;
    fetch(`/api/admin/brevo/preview/${previewType}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.html) setPreviewHtml(data.html);
      })
      .catch(() => {});
  }, [isOpen, activeTab, previewType]);

  if (!isOpen) return null;

  const handleToggleMonetization = async (newMode: string) => {
    try {
      await fetch('/api/admin/monetization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
      setStatusToast(
        newMode === 'EARLY_ACCESS_FREE'
          ? '✓ Активиран режим: Early Access (Всичко безплатно за привличане на трафик)'
          : '✓ Активиран режим: Live Monetization Paywall (Free / Pro 29€ / VIP 59€)'
      );
      loadOverview();
      setTimeout(() => setStatusToast(null), 3500);
    } catch {
      // ignore
    }
  };

  const handleSendTestDigest = async () => {
    try {
      const res = await fetch('/api/admin/brevo/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testDigestEmail }),
      });
      const data = await res.json();
      setStatusToast(
        `✓ Brevo +EV Digest заявка: ${data.status} (Използвани днес: ${data.dailyUsed}/300)`
      );
      loadOverview();
      setTimeout(() => setStatusToast(null), 4000);
    } catch {
      // ignore
    }
  };

  const currentMode = overview?.monetization?.mode || 'EARLY_ACCESS_FREE';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b0f19] border border-[#43f08a]/50 rounded-2xl max-w-5xl w-full p-5 sm:p-6 space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto text-[#f7f8fb]"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c283d] pb-3.5">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#43f08a]">
              ODDSPIRA COMMAND CENTER • ADMIN, MONETIZATION, BREVO &amp; OVHCLOUD
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Администраторски Панел &amp; Монетизация
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#141e30] hover:bg-[#1e2d47] text-xs font-mono text-[#94a3b8] hover:text-white cursor-pointer"
          >
            ✕ Затвори
          </button>
        </div>

        {statusToast && (
          <div className="px-4 py-2.5 rounded-xl bg-[#092618] border border-[#43f08a] text-xs font-mono text-[#43f08a]">
            {statusToast}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-[#080c14] p-1.5 rounded-xl border border-[#1a2436]">
          {[
            {
              id: 'monetization',
              label: '💳 Монетизация, Планове & Банкови Плащания (Stripe)',
            },
            {
              id: 'brevo',
              label: '✉️ Brevo Email Engine (300/ден & HTML Шаблони)',
            },
            {
              id: 'api_ovh',
              label: '🚀 API-Football (19€) & Качване на OVHcloud VPS',
            },
            {
              id: 'users',
              label: `👥 Потребители (${overview?.users?.length || 0}) & Абонати (${overview?.subscribers?.length || 0})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#43f08a] text-[#04130a]'
                  : 'text-[#8f9cae] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================================================================
            TAB 1: MONETIZATION, FREE VS PAID TIERS & STRIPE BANKING GATEWAY
           =================================================================== */}
        {activeTab === 'monetization' && (
          <div className="space-y-4">
            <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#43f08a] font-bold">
                  ТЕКУЩ РЕЖИМ НА САЙТА (ПРЕВКЛЮЧВАНЕ С 1 КЛИК)
                </span>
                <h3 className="text-base font-bold text-white">
                  {currentMode === 'EARLY_ACCESS_FREE'
                    ? '🟢 EARLY ACCESS (Всички функции са безплатни за бързо събиране на потребители)'
                    : '🔒 LIVE PAYWALL (Разделение на Безплатни и Платени Pro/VIP функции)'}
                </h3>
                <p className="text-xs text-[#8f9cae]">
                  Препоръка: Дръж сайта в <strong>Early Access</strong> през първите 1–2 месеца, докато натрупаш регистрации и имейли, след което превключи на <strong>Live Paywall</strong> със Stripe.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleMonetization('EARLY_ACCESS_FREE')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                    currentMode === 'EARLY_ACCESS_FREE'
                      ? 'bg-[#43f08a] text-[#04130a] border-[#43f08a]'
                      : 'bg-[#080c14] text-[#8f9cae] border-[#1f2c42]'
                  }`}
                >
                  Early Access (0€)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMonetization('LIVE_MONETIZATION_PAYWALL')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                    currentMode === 'LIVE_MONETIZATION_PAYWALL'
                      ? 'bg-[#43f08a] text-[#04130a] border-[#43f08a]'
                      : 'bg-[#080c14] text-[#8f9cae] border-[#1f2c42]'
                  }`}
                >
                  Live Paywall (Stripe)
                </button>
              </div>
            </div>

            {/* 3-Tier Pricing & Entitlement Architecture (What is Free vs Paid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1: Free */}
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#94a3b8] uppercase">
                    1. БЕЗПЛАТЕН ПЛАН (FREE)
                  </span>
                  <span className="text-lg font-mono font-black text-white">0 € / мес.</span>
                </div>
                <p className="text-[11px] text-[#8f9cae]">
                  Цел: Да привлича трафик от Google и да кара хората да се регистрират.
                </p>
                <ul className="space-y-1.5 text-xs text-[#cbd5e1] font-mono">
                  <li>✓ Мачове на живо (Live) и Класирания (Leagues)</li>
                  <li>✓ Базови коефициенти 1X2 и H2H статистика</li>
                  <li>✓ До 3 детайлни прегледа на мач на ден</li>
                  <li>✓ Базов калкулатор за марж в Инструменти</li>
                  <li className="text-[#64748b]">✕ Без 9-панелния /analysis терминал</li>
                  <li className="text-[#64748b]">✕ Без Падащи коефициенти и Корнери/Картони</li>
                </ul>
              </div>

              {/* Tier 2: Pro Quant */}
              <div className="bg-[#0e1422] border border-[#43f08a]/50 rounded-xl p-4 space-y-3 shadow-[0_0_25px_rgba(67,240,138,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#43f08a] uppercase">
                    2. PRO QUANT TRADER
                  </span>
                  <span className="text-lg font-mono font-black text-[#43f08a]">29 € / мес.</span>
                </div>
                <p className="text-[11px] text-[#8f9cae]">
                  Основният източник на месечен абонаментен доход (при 100 абоната = 2 900 €/мес.).
                </p>
                <ul className="space-y-1.5 text-xs text-white font-mono">
                  <li>✓ Пълен достъп до 9-панелния терминал (/analysis)</li>
                  <li>✓ Поасон + Диксън-Коулс + Модели за Корнери и Картони</li>
                  <li>✓ Матрица за сравнение на 5 букмейкъра (Best Price)</li>
                  <li>✓ Пълен тракер „Моите залози“ с Кели управление</li>
                  <li>✓ Ежедневен +EV Имейл Бюлетин през Brevo</li>
                </ul>
              </div>

              {/* Tier 3: Institutional VIP */}
              <div className="bg-[#0e1422] border border-amber-400/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                    3. INSTITUTIONAL VIP
                  </span>
                  <span className="text-lg font-mono font-black text-amber-300">59 € / мес.</span>
                </div>
                <p className="text-[11px] text-[#8f9cae]">
                  За сериозни играчи, които търсят Steam Moves, Монте Карло и ранни сигнали.
                </p>
                <ul className="space-y-1.5 text-xs text-white font-mono">
                  <li>✓ Всичко от план Pro Quant Trader</li>
                  <li>✓ Радар за Падащи Коефициенти &amp; Steam Moves в реално време</li>
                  <li>✓ 10,000-Run Монте Карло Стрес-Тест &amp; Decision Passports</li>
                  <li>✓ Моментни известия 60 мин. преди мача (T-60 Lineups)</li>
                  <li>✓ Приоритетен VIP Сигнал на Деня</li>
                </ul>
              </div>
            </div>

            {/* How Banking / Stripe Works Explanation */}
            <div className="bg-[#080c14] border border-[#1a2436] rounded-xl p-4 space-y-2 text-xs text-[#cbd5e1]">
              <h4 className="font-mono font-bold text-[#43f08a] uppercase">
                🏦 Как се свързва с твоята банка за приемане на плащания с карти?
              </h4>
              <p>
                <strong>1. Stripe (Препоръчителен световен стандарт за SaaS сайтове):</strong> Регистрираш безплатен акаунт в <code>stripe.com</code> и въвеждаш своя банков <strong>IBAN</strong> (българска банка, Revolut Business или Wise). Потребителите плащат в сайта с <strong>Visa, Mastercard, Apple Pay или Google Pay</strong>, а Stripe автоматично превежда парите директно по твоята банкова сметка всяка седмица. В <code>.env</code> файла на OVHcloud само поставяш <code>STRIPE_SECRET_KEY</code>.
              </p>
              <p>
                <strong>2. Партньорски (Affiliate) комисионни от букмейкъри (Втори поток от приходи без такса за потребителя):</strong> Когато потребител кликне върху коефициент на <em>bet365 / Unibet / 1xBet</em> в твоята таблица за сравнение на коефициенти, можеш да сложиш свой партньорски линк (Affiliate ID) и да получаваш комисионна от букмейкъра.
              </p>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: BREVO EMAIL ENGINE (300/DAY LIMIT & HTML TEMPLATES PREVIEW)
           =================================================================== */}
        {activeTab === 'brevo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
                <span className="text-[10px] text-[#8f9cae] block">BREVO FREE TIER QUOTA</span>
                <strong className="text-base text-[#43f08a]">
                  {overview?.brevo?.dailyUsed || 0} / 300 имейла днес
                </strong>
                <div className="text-[10px] text-[#64748b] mt-1">
                  Автоматичен дневен ограничител (Rate-Limiter)
                </div>
              </div>
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
                <span className="text-[10px] text-[#8f9cae] block">SENDER IDENTITY</span>
                <strong className="text-white">
                  {overview?.brevo?.senderName || 'Oddspira Quant'}
                </strong>
                <div className="text-[10px] text-[#93c5fd] mt-1">
                  {overview?.brevo?.senderEmail || 'quant@oddspira.com'}
                </div>
              </div>
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
                <span className="text-[10px] text-[#8f9cae] block">BREVO API STATUS</span>
                <strong className="text-white">
                  {overview?.brevo?.configured
                    ? '🟢 LIVE BREVO SMTP API'
                    : '🟡 SQLITE QUEUE (Готов за BREVO_API_KEY)'}
                </strong>
                <div className="text-[10px] text-[#64748b] mt-1">
                  3 Dark-Terminal HTML шаблона (#0b0f19)
                </div>
              </div>
            </div>

            {/* Template Selector & Dispatch Test */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#8f9cae]">Преглед на HTML шаблон:</span>
                {[
                  { id: 'welcome', label: '1. Welcome & Activation' },
                  { id: 'password_reset', label: '2. Password Reset Token' },
                  { id: 'ev_digest', label: '3. Daily +EV Match Digest' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setPreviewType(tpl.id as typeof previewType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      previewType === tpl.id
                        ? 'bg-[#43f08a] text-[#04130a]'
                        : 'bg-[#080c14] text-[#cbd5e1] border border-[#1f2c42]'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testDigestEmail}
                  onChange={(e) => setTestDigestEmail(e.target.value)}
                  className="bg-[#080c14] border border-[#223049] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  placeholder="Имейл за тест..."
                />
                <button
                  type="button"
                  onClick={handleSendTestDigest}
                  className="px-3.5 py-1.5 rounded-lg bg-[#43f08a] hover:bg-[#56f498] text-[#04130a] text-xs font-mono font-bold cursor-pointer"
                >
                  Изпрати +EV Digest →
                </button>
              </div>
            </div>

            {/* Live HTML Email Preview Box */}
            <div className="bg-[#080c14] border border-[#1a2436] rounded-xl p-3">
              <div className="text-[10px] font-mono text-[#8f9cae] mb-2">
                LIVE HTML EMAIL RENDER PREVIEW (DARK TERMINAL #0B0F19 + #10B981):
              </div>
              <div
                className="rounded-lg overflow-hidden border border-[#1e293b] max-h-[320px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: API-FOOTBALL ($19/MO) & OVHCLOUD DEPLOYMENT PLAYBOOK
           =================================================================== */}
        {activeTab === 'api_ovh' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
                <span className="text-[10px] text-[#8f9cae] block">
                  L1 MEMORY + L2 SQLITE CACHE
                </span>
                <strong className="text-base text-[#43f08a]">45s Live / 5m Stats / 6h Tables</strong>
                <div className="text-[10px] text-[#64748b] mt-1">
                  1,000 потребители = 1 заявка към API-Football
                </div>
              </div>
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
                <span className="text-[10px] text-[#8f9cae] block">
                  SQLITE WAL MODE &amp; HOT BACKUP
                </span>
                <strong className="text-white">PRAGMA journal_mode = WAL</strong>
                <div className="text-[10px] text-[#93c5fd] mt-1">
                  Автоматичен VACUUM INTO бекъп на всеки 6ч
                </div>
              </div>
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-3.5">
                <span className="text-[10px] text-[#8f9cae] block">
                  IP RATE-LIMIT &amp; BOT SHIELD
                </span>
                <strong className="text-[#43f08a]">12 req/15m Auth · 90 req/m API</strong>
                <div className="text-[10px] text-[#64748b] mt-1">
                  Пази 300-те имейла на Brevo и API квотата
                </div>
              </div>
            </div>

            {/* 1-Click Live SQLite Hot Backup + Brevo SPF/DKIM/DMARC DNS Records */}
            <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-[#43f08a] font-bold uppercase">
                    🛡️ Production Hardening: SQLite Онлайн Бекъп &amp; DNS Записи (SPF / DKIM / DMARC)
                  </h4>
                  <p className="text-[11px] text-[#8f9cae]">
                    Атомарен бекъп без спиране на сървъра (<code>VACUUM INTO data/backups/</code>) + DNS конфигурация против Spam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/system/backup', { method: 'POST' });
                      const data = await res.json();
                      if (data?.ok) {
                        setStatusToast(
                          `✓ Създаден онлайн SQLite бекъп: ${data.fileName} (${(
                            data.sizeBytes / 1024
                          ).toFixed(1)} KB · Общо пазени: ${data.totalBackups}/14)`
                        );
                        setTimeout(() => setStatusToast(null), 4500);
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#43f08a] hover:bg-[#56f498] text-[#04130a] text-xs font-mono font-bold cursor-pointer shrink-0"
                >
                  💾 Създай Hot Backup сега →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1a2436]">
                  <div className="text-[10px] text-[#43f08a] font-bold">1. SPF RECORD (TXT)</div>
                  <div className="text-[10px] text-white mt-0.5 break-all">
                    Host: <code>@</code> → <code>v=spf1 include:spf.brevo.com mx ~all</code>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1a2436]">
                  <div className="text-[10px] text-[#43f08a] font-bold">2. DKIM RECORD (TXT)</div>
                  <div className="text-[10px] text-white mt-0.5 break-all">
                    Host: <code>mail._domainkey</code> → копира се от Brevo Senders &amp; IP
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1a2436]">
                  <div className="text-[10px] text-[#43f08a] font-bold">
                    3. DMARC RECORD + LIST-UNSUBSCRIBE
                  </div>
                  <div className="text-[10px] text-white mt-0.5 break-all">
                    Host: <code>_dmarc</code> → <code>v=DMARC1; p=quarantine; pct=100</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#080c14] border border-[#1a2436] rounded-xl p-4 space-y-3 font-mono text-xs text-[#cbd5e1]">
              <h4 className="text-[#43f08a] font-bold uppercase">
                Пълен График: Кога, Къде и Как качваме на OVHcloud VPS
              </h4>
              <div className="space-y-2 leading-relaxed">
                <div>
                  <strong className="text-white">СТЪПКА 1 (GitHub Desktop):</strong> Сваляш проекта от AI Studio на компютъра си, отваряш GitHub Desktop и го качваш в твое Private хранилище <code>oddspira</code>.
                </div>
                <div>
                  <strong className="text-white">СТЪПКА 2 (API-Football &amp; Brevo ключове):</strong> Влизаш в <code>dashboard.api-football.com</code> (взимаш плана от 19$/мес.) и в <code>brevo.com</code> (взимаш безплатния SMTP API ключ за 300 имейла/ден).
                </div>
                <div>
                  <strong className="text-white">СТЪПКА 3 (На твоя OVHcloud VPS терминал):</strong>
                  <pre className="mt-1.5 p-3 rounded-lg bg-[#05080f] border border-[#1e293b] text-[#43f08a] overflow-x-auto text-[11px]">
{`git clone https://github.com/ТВОЯТ_ПРОФИЛ/oddspira.git
cd oddspira
npm install
cp .env.example .env
nano .env   # Поставяш FOOTBALL_API_KEY и BREVO_API_KEY
npm run build
NODE_ENV=production pm2 start npm --name "oddspira" -- start`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: REGISTERED USERS & NEWSLETTER SUBSCRIBERS IN SQLITE
           =================================================================== */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-4 space-y-2.5">
              <h4 className="text-[#43f08a] font-bold uppercase">
                Регистрирани Потребители ({overview?.users?.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {overview?.users && overview.users.length > 0 ? (
                  overview.users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between bg-[#080c14] border border-[#1a2436] rounded-lg px-3 py-2"
                    >
                      <div>
                        <strong className="text-white">{u.name}</strong>
                        <div className="text-[10px] text-[#8f9cae]">{u.email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#082416] text-[#43f08a] text-[10px] font-bold">
                        {u.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[#64748b] py-4">
                    Все още няма регистрирани потребители. Тествай чрез бутона JOIN ODDSPIRA!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0e1422] border border-[#1d293d] rounded-xl p-4 space-y-2.5">
              <h4 className="text-[#43f08a] font-bold uppercase">
                Имейл Лог на Brevo ({overview?.emailLogs?.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {overview?.emailLogs && overview.emailLogs.length > 0 ? (
                  overview.emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between bg-[#080c14] border border-[#1a2436] rounded-lg px-3 py-2"
                    >
                      <div>
                        <strong className="text-white">{log.recipient}</strong>
                        <div className="text-[10px] text-[#8f9cae]">{log.templateType}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#111c2d] text-[#93c5fd] text-[10px]">
                        {log.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[#64748b] py-4">
                    Няма изпратени имейли днес. Натисни „Изпрати +EV Digest“ в таб Brevo!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
