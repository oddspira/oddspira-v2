import { Language } from '../types';

export interface VipI18nDict {
  headerKicker: string;
  headerTitle: string;
  headerSubtitle: string;
  verifiedBadge: string;
  kpiPicks: string;
  kpiClvBeat: string;
  kpiAvgClv: string;
  kpiYield: string;
  kpiProfit: string;
  clvExplainTitle: string;
  clvExplainDesc: string;
  chartTitle: string;
  chartActual: string;
  chartExpected: string;
  ledgerTitle: string;
  ledgerSub: string;
  filterAll: string;
  filterHighEdge: string;
  filterLineups: string;
  exportCsv: string;
  colFixture: string;
  colPick: string;
  colEntryOdds: string;
  colClosingOdds: string;
  colClvBeat: string;
  colResult: string;
  colHash: string;
  webhookSectionTitle: string;
  webhookSectionSub: string;
  channelTelegram: string;
  channelDiscord: string;
  signalHighEdge: string;
  signalT60Lineup: string;
  dispatchBtn: string;
  dispatchingBtn: string;
  customDiscordPlaceholder: string;
  pricingTitle: string;
  pricingSub: string;
  perMonth: string;
  foreverFree: string;
  mostPopular: string;
  vipExclusive: string;
  tierFreeName: string;
  tierFreeDesc: string;
  tierProName: string;
  tierProDesc: string;
  tierVipName: string;
  tierVipDesc: string;
  activateBtn: string;
  activatedToast: string;
}

const baseEn: VipI18nDict = {
  headerKicker: 'PUBLIC VERIFIED AUDIT // PINNACLE CLV & VIP WEBHOOKS',
  headerTitle: 'Verified Track Record & VIP Automated Signals',
  headerSubtitle:
    'Every model position is cryptographically timestamped (SHA-256) prior to kickoff and benchmarked against Pinnacle’s closing line (T-0). No edited picks. Pure mathematical proof.',
  verifiedBadge: 'SHA-256 PRE-MATCH AUDITED',
  kpiPicks: 'Verified Picks',
  kpiClvBeat: 'Pinnacle CLV Beat Rate',
  kpiAvgClv: 'Average CLV Edge',
  kpiYield: 'Net Yield (ROI)',
  kpiProfit: 'Cumulative Profit',
  clvExplainTitle: 'Why Closing Line Value (CLV) is the Ultimate Proof',
  clvExplainDesc:
    'Pinnacle’s closing odds at kickoff (T-0) reflect the sharpest syndicate liquidity in the world. Beating the closing line on 83.4% of 1,428 picks proves the algorithm captures true mathematical edge before the market corrects.',
  chartTitle: 'Cumulative Profit (Units) vs Expected +EV Curve (xPnL)',
  chartActual: 'Actual Audited Profit (+134.2u)',
  chartExpected: 'Expected Mathematical EV (+124.8u)',
  ledgerTitle: 'Public Pre-Match Audited Ledger (Entry Odds vs Pinnacle Closing Line)',
  ledgerSub: 'Immutable SQLite audit log with SHA-256 pre-match verification hashes.',
  filterAll: 'All Verified Picks',
  filterHighEdge: '🔥 >5% EV Signals',
  filterLineups: '⚡ T-60 Lineup Drops',
  exportCsv: 'Download Audit CSV',
  colFixture: 'Fixture & Date',
  colPick: 'Market Selection',
  colEntryOdds: 'Oddspira Entry',
  colClosingOdds: 'Pinnacle Close',
  colClvBeat: 'CLV Beat',
  colResult: 'Outcome',
  colHash: 'SHA-256 Proof',
  webhookSectionTitle: 'VIP Telegram & Discord Instant Webhook Engine (€49/mo)',
  webhookSectionSub:
    'Never miss a dropping line again. The moment our engine detects a >5% EV edge or receives official T-60 starting lineups, an instant alert is pushed to our private VIP Telegram channel and Discord Webhook.',
  channelTelegram: 'Telegram VIP Bot',
  channelDiscord: 'Discord VIP Webhook',
  signalHighEdge: '🔥 High-Edge Signal (>5% EV)',
  signalT60Lineup: '⚡ T-60 Confirmed Lineups',
  dispatchBtn: 'Send Live Test Alert',
  dispatchingBtn: 'Dispatching...',
  customDiscordPlaceholder: 'Optional: Paste your Discord Webhook URL to test live delivery...',
  pricingTitle: 'Institutional Access Tiers (EUR)',
  pricingSub: 'Transparent pricing in Euro (€). Cancel or switch tiers anytime.',
  perMonth: 'month',
  foreverFree: 'Forever Free',
  mostPopular: 'MOST POPULAR',
  vipExclusive: 'INSTANT TELEGRAM & DISCORD BOT',
  tierFreeName: 'Starter Quant',
  tierFreeDesc: 'Essential calculators and daily match previews for recreational analysts.',
  tierProName: 'Pro Analyst',
  tierProDesc: 'Full 12-league +EV scanner, No-Vig devigger, and automated Kelly bankroll tracker.',
  tierVipName: 'VIP Syndicate',
  tierVipDesc: 'Instant Telegram & Discord Bot alerts for >5% EV edges, T-60 confirmed lineups & Pinnacle steam moves.',
  activateBtn: 'Select Plan',
  activatedToast: 'Plan selected! Early-Access VIP features are unlocked in your workspace.',
};

const baseBg: VipI18nDict = {
  headerKicker: 'ПУБЛИЧЕН ОДИТ // PINNACLE CLV & VIP TELEGRAM / DISCORD БОТ',
  headerTitle: 'Верифициран Track Record & Автоматични VIP Сигнали',
  headerSubtitle:
    'Всяка прогноза на алгоритъма се заключва с криптографски SHA-256 подпис преди мача и се сравнява със затварящия коефициент на Pinnacle (Closing Line Value). 100% прозрачност без изтрити или редактирани мачове.',
  verifiedBadge: 'SHA-256 ПРЕДМАЧОВ ОДИТ',
  kpiPicks: 'Верифицирани Прогнози',
  kpiClvBeat: 'Pinnacle CLV Успеваемост',
  kpiAvgClv: 'Среден CLV Превес',
  kpiYield: 'Чист Yield (ROI)',
  kpiProfit: 'Натрупана Печалба',
  clvExplainTitle: 'Защо Closing Line Value (CLV) е най-силното доказателство в индустрията?',
  clvExplainDesc:
    'Затварящият коефициент на Pinnacle в секундата преди началото на мача (T-0) е най-точният пазарен еталон в света. Когато алгоритъмът взема коефициент 2.02, а пазарът затваря на 1.81 (+11.6% CLV), имаш математически гарантиран дългосрочен профит. Моделът побеждава Pinnacle в 83.4% от всички 1,428 мача.',
  chartTitle: 'Реална Печалба (Units) срещу Математическо Очакване (+EV Крива)',
  chartActual: 'Реална Одитирана Печалба (+134.2u)',
  chartExpected: 'Очакван +EV Модел (+124.8u)',
  ledgerTitle: 'Публичен Регистър на Прогнозите (Входен Коеф. срещу Затварящ Pinnacle)',
  ledgerSub: 'Неизменяем SQLite одит лог с предмачови SHA-256 хешове и филтър по тип сигнал.',
  filterAll: 'Всички Одитирани',
  filterHighEdge: '🔥 Сигнали с >5% Edge',
  filterLineups: '⚡ T-60 Стартови Състави',
  exportCsv: 'Изтегли CSV Одит',
  colFixture: 'Мач и Дата',
  colPick: 'Пазар и Прогноза',
  colEntryOdds: 'Входен Коеф.',
  colClosingOdds: 'Pinnacle Затварящ',
  colClvBeat: 'CLV Превес',
  colResult: 'Резултат',
  colHash: 'SHA-256 Хеш',
  webhookSectionTitle: 'VIP Telegram & Discord Автоматични Сигнали (€49/мес)',
  webhookSectionSub:
    'Вместо да стоиш пред екрана цял ден, VIP планът (€49/мес) изпраща автоматично известие в частен Telegram канал или Discord Webhook в секундата, в която се появи >5% математически Edge или излязат официалните състави 60 минути преди мача (T-60 Lineups).',
  channelTelegram: 'Telegram VIP Бот',
  channelDiscord: 'Discord VIP Webhook',
  signalHighEdge: '🔥 Висок Edge (>5% EV)',
  signalT60Lineup: '⚡ T-60 Потвърдени Състави',
  dispatchBtn: 'Изпрати Тестов VIP Сигнал',
  dispatchingBtn: 'Изпращане...',
  customDiscordPlaceholder: 'По желание: Постави твой Discord Webhook URL за реален тест на живо...',
  pricingTitle: 'Планове и Достъп (в Евро €)',
  pricingSub: 'Прозрачни абонаменти в евро (€) без скрити такси. Пълен достъп до одитирания модел.',
  perMonth: 'мес.',
  foreverFree: 'Завинаги Безплатен',
  mostPopular: 'НАЙ-ИЗБИРАН',
  vipExclusive: 'АВТОМАТИЧЕН TELEGRAM & DISCORD БОТ',
  tierFreeName: 'Free План',
  tierFreeDesc: 'Базови калкулатори и дневни мачове за начинаещи анализатори.',
  tierProName: 'Pro План',
  tierProDesc: 'Пълен +EV скенер за 12 лиги, No-Vig девигър и автоматизиран Kelly Bankroll тракер.',
  tierVipName: 'VIP Синдикат',
  tierVipDesc: 'Мигновени Telegram & Discord Бот сигнали при >5% EV, T-60 потвърдени състави и Pinnacle Steam Moves.',
  activateBtn: 'Избери План',
  activatedToast: 'Планът е избран! Всички Pro и VIP функции са отключени във вашия профил.',
};

export const VIP_I18N: Record<Language, VipI18nDict> = {
  bg: baseBg,
  en: baseEn,
  es: {
    ...baseEn,
    headerKicker: 'AUDITORÍA PÚBLICA VERIFICADA // PINNACLE CLV & WEBHOOKS VIP',
    headerTitle: 'Historial Verificado (Track Record) y Alertas VIP en Telegram/Discord',
    verifiedBadge: 'AUDITORÍA PRE-PARTIDO SHA-256',
    kpiPicks: 'Selecciones Verificadas',
    kpiClvBeat: 'Tasa Superación CLV Pinnacle',
    kpiAvgClv: 'Ventaja CLV Media',
    kpiYield: 'Yield Neto (ROI)',
    kpiProfit: 'Beneficio Acumulado',
    perMonth: 'mes',
    pricingTitle: 'Planes de Acceso Institucional (€)',
  },
  de: {
    ...baseEn,
    headerKicker: 'ÖFFENTLICHES AUDIT // PINNACLE CLV & VIP TELEGRAM / DISCORD BOT',
    headerTitle: 'Verifizierter Track Record & Automatische VIP-Webhooks',
    verifiedBadge: 'SHA-256 PRE-MATCH GEPRÜFT',
    kpiPicks: 'Verifizierte Picks',
    kpiClvBeat: 'Pinnacle CLV Beat-Rate',
    kpiAvgClv: 'Ø CLV-Vorteil',
    kpiYield: 'Netto-Yield (ROI)',
    kpiProfit: 'Gesamtgewinn',
    perMonth: 'Monat',
    pricingTitle: 'Zugangspläne in Euro (€)',
  },
  it: {
    ...baseEn,
    headerKicker: 'AUDIT PUBBLICO VERIFICATO // PINNACLE CLV & BOT VIP',
    headerTitle: 'Track Record Verificato & Segnali VIP Telegram/Discord',
    perMonth: 'mese',
  },
  pt: {
    ...baseEn,
    headerKicker: 'AUDITORIA PÚBLICA VERIFICADA // PINNACLE CLV & WEBHOOKS VIP',
    headerTitle: 'Track Record Verificado & Bot VIP Telegram/Discord',
    perMonth: 'mês',
  },
  fr: {
    ...baseEn,
    headerKicker: 'AUDIT PUBLIC VÉRIFIÉ // PINNACLE CLV & WEBHOOKS VIP',
    headerTitle: 'Track Record Vérifié & Alertes VIP Telegram/Discord',
    perMonth: 'mois',
  },
  tr: {
    ...baseEn,
    headerKicker: 'DOĞRULANMIŞ PERFORMANS // PINNACLE CLV & VIP TELEGRAM BOTU',
    headerTitle: 'Doğrulanmış Track Record & VIP Telegram/Discord Sinyalleri',
    perMonth: 'ay',
  },
  pl: {
    ...baseEn,
    headerKicker: 'PUBLICZNY AUDYT // PINNACLE CLV & VIP TELEGRAM / DISCORD BOT',
    headerTitle: 'Zweryfikowany Track Record i Automatyczne Sygnały VIP',
    perMonth: 'mies.',
  },
  el: {
    ...baseEn,
    headerKicker: 'ΔΗΜΟΣΙΟΣ ΕΛΕΓΧΟΣ // PINNACLE CLV & VIP TELEGRAM / DISCORD BOT',
    headerTitle: 'Επαληθευμένο Track Record & Αυτόματα VIP Σήματα',
    perMonth: 'μήνα',
  },
  ro: {
    ...baseEn,
    headerKicker: 'AUDIT PUBLIC VERIFICAT // PINNACLE CLV & BOT VIP TELEGRAM',
    headerTitle: 'Track Record Verificat & Semnale VIP Automate',
    perMonth: 'lună',
  },
  ru: {
    ...baseEn,
    headerKicker: 'ПУБЛИЧНЫЙ АУДИТ // PINNACLE CLV И VIP TELEGRAM / DISCORD БОТ',
    headerTitle: 'Верифицированный Track Record и Автоматические VIP Сигналы',
    perMonth: 'мес.',
  },
};
