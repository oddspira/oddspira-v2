import React, { useState, useEffect } from 'react';
import { Language } from '../types';

export type LegalTab = 'terms' | 'privacy' | 'responsible' | 'affiliate';

export function getNationalRegulator(language: Language): {
  name: string;
  url: string;
  desc: string;
} {
  const map: Record<Language, { name: string; url: string; desc: string }> = {
    bg: {
      name: 'НАП — Отговорен хазарт (БГ) ↗',
      url: 'https://nra.bg/wps/portal/nra/gambling/responsible.gambling',
      desc: 'Официален регистър на уязвимите лица към Националната агенция за приходите.',
    },
    en: {
      name: 'GamblingTherapy.org ↗',
      url: 'https://www.gamblingtherapy.org',
      desc: 'Global multilingual online support and practical advice for problem gambling.',
    },
    es: {
      name: 'JugarBien.es (DGOJ) ↗',
      url: 'https://www.jugarbien.es',
      desc: 'Portal oficial de juego responsable de la Dirección General de Ordenación del Juego.',
    },
    de: {
      name: 'Check-dein-Spiel.de (BZgA) ↗',
      url: 'https://www.check-dein-spiel.de',
      desc: 'Offizielles Informations- und Hilfeportal der BZgA zur Glücksspielsucht-Prävention.',
    },
    it: {
      name: 'GiocaResponsabile.it (ADM) ↗',
      url: 'https://www.gioca-responsabile.it',
      desc: 'Servizio nazionale di consulenza e supporto gratuito per il gioco problematico.',
    },
    pt: {
      name: 'JogoResponsavel.pt (SRIJ) ↗',
      url: 'https://www.jogoresponsavel.pt',
      desc: 'Portal oficial de apoio, prevenção e informação sobre Jogo Responsável.',
    },
    fr: {
      name: 'Joueurs-Info-Service.fr (ANJ) ↗',
      url: 'https://www.joueurs-info-service.fr',
      desc: 'Service national officiel d’aide et d’écoute pour le jeu responsable en France.',
    },
    tr: {
      name: 'GamblingTherapy Türkiye ↗',
      url: 'https://www.gamblingtherapy.org/tr/',
      desc: 'Sorumlu oyun ve bağımlılıkla mücadele için uluslararası ücretsiz Türkçe destek hattı.',
    },
    pl: {
      name: 'GamblingTherapy Polska ↗',
      url: 'https://www.gamblingtherapy.org/pl/',
      desc: 'Międzynarodowe wsparcie i pomoc online w zakresie odpowiedzialnej gry po polsku.',
    },
    el: {
      name: 'ΚΕΘΕΑ ΑΛΦΑ / ΕΕΕΠ (GR) ↗',
      url: 'https://www.kethea.gr',
      desc: 'Επίσημο πρόγραμμα υποστήριξης και υπεύθυνου παιχνιδιού στην Ελλάδα.',
    },
    ro: {
      name: 'JocResponsabil.ro (ONJN) ↗',
      url: 'https://www.jocresponsabil.ro',
      desc: 'Programul național oficial de prevenire și consiliere pentru joc responsabil în România.',
    },
    ru: {
      name: 'GamblingTherapy RU ↗',
      url: 'https://www.gamblingtherapy.org/ru/',
      desc: 'Международная бесплатная служба поддержки и консультаций по ответственной игре.',
    },
  };
  return map[language] || map.en;
}

interface LegalComplianceModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  language: Language;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  initialTab = 'terms',
  language,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const isBg = language === 'bg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-[#0b0f19] border border-[#1f2d42] shadow-[0_25px_80px_rgba(0,0,0,0.9)] text-[#f7f8fb] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#070b12] border-b border-[#182234]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#10b981]/15 border border-[#10b981]/40 text-[#43f08a] text-[10px] font-mono font-bold uppercase">
                EU GDPR · STRIPE SAAS COMPLIANCE · 18+
              </span>
              <span className="text-[11px] font-mono text-[#8f9cae]">
                ODDSPIRA LEGAL & REGULATORY CENTER
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {isBg
                ? 'Правна рамка, Защита на данните (GDPR) и Отговорна игра (18+)'
                : 'Legal Terms, GDPR Privacy Policy & 18+ Responsible Gaming'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111927] hover:bg-[#1a263b] border border-[#24324a] text-[#8f9cae] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 px-6 py-3 bg-[#090d16] border-b border-[#182234]">
          {[
            {
              id: 'terms' as LegalTab,
              label: isBg ? '⚖️ Общи условия & Отказ от отговорност' : '⚖️ Terms & SaaS Disclaimer',
            },
            {
              id: 'privacy' as LegalTab,
              label: isBg ? '🔒 Поверителност (GDPR & Бисквитки)' : '🔒 Privacy Policy (GDPR)',
            },
            {
              id: 'responsible' as LegalTab,
              label: isBg ? '🔞 18+ Отговорна игра' : '🔞 18+ Responsible Gaming',
            },
            {
              id: 'affiliate' as LegalTab,
              label: isBg ? '🤝 Партньорско разкриване & Stripe' : '🤝 Affiliate & Stripe Disclosure',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#43f08a] text-[#05130b]'
                  : 'bg-[#111826] text-[#94a3b8] hover:text-white border border-[#1d283a]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0e1a16] border border-[#10b981]/40">
                <div className="text-xs font-mono font-bold text-[#43f08a] uppercase mb-1">
                  {isBg
                    ? 'ВАЖНА КЛАСИФИКАЦИЯ НА УСЛУГАТА (ЗА БАНКИ, STRIPE И РЕГУЛАТОРИ)'
                    : 'IMPORTANT SAAS CLASSIFICATION (FOR PAYMENT PROCESSORS & REGULATORS)'}
                </div>
                <p className="text-xs text-[#e2e8f0]">
                  {isBg
                    ? 'ODDSPIRA (oddspira.com) е статистически, математически и информационен софтуер като услуга (SaaS). ODDSPIRA НЕ Е БУКМЕЙКЪР, НЕ Е ХАЗАРТЕН ОПЕРАТОР, не приема залози с реални или виртуални средства, не държи клиентски депозити за залагане и не изплаща печалби от хазартни игри.'
                    : 'ODDSPIRA (oddspira.com) is a statistical, mathematical, and quantitative sports analytics Software-as-a-Service (SaaS) platform. ODDSPIRA IS NOT A BOOKMAKER OR GAMBLING OPERATOR, does not accept wagers, does not hold betting deposits, and does not facilitate real-money gambling transactions.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '1. Характер на математическите модели и отказ от финансова отговорност'
                    : '1. Nature of Quantitative Models & No Financial Guarantee'}
                </h3>
                <p>
                  {isBg
                    ? 'Всички вероятности, очаквани голове (xG), двумерни разпределения на Поасон, корекции на Dixon-Coles, девигирани коефициенти (Shin No-Vig), показатели за очаквана стойност (+EV) и симулации по метода Монте Карло са строго аналитични и статистически оценки, базирани на исторически данни.'
                    : 'All probabilities, Expected Goals (xG), Bivariate Poisson matrices, Dixon-Coles adjustments, No-Vig fair odds, Expected Value (+EV) metrics, and Monte Carlo simulations provided on Oddspira are strictly statistical estimates derived from historical data.'}
                </p>
                <p>
                  {isBg
                    ? 'Миналите резултати и положителният Closing Line Value (CLV) не гарантират бъдещи печалби. Спортните събития съдържат присъща стохастична дисперсия. Потребителят носи 100% лична отговорност за своите финансови решения.'
                    : 'Past performance and positive Closing Line Value (CLV) do not guarantee future profits. Sports outcomes carry inherent stochastic variance. Users bear 100% sole responsibility for their own financial decisions.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '2. Абонаментни планове (Oddspira Pro / Quant VIP) и Политика за възстановяване'
                    : '2. SaaS Subscriptions (Oddspira Pro / Quant VIP) & Refund Policy'}
                </h3>
                <p>
                  {isBg
                    ? 'Платените планове на Oddspira предоставят достъп до изчислителен софтуер, сървърни алгоритми и аналитични инструменти. Плащанията се обработват сигурно чрез лицензирани платежни оператори (Stripe / Банков картови оператор). Всеки потребител може да прекрати абонамента си по всяко време с 1 клик от своя профил без скрити такси.'
                    : 'Paid tiers grant access to computational software, server-side algorithms, and analytical dashboards. Payments are securely processed via Stripe. Subscriptions can be canceled at any time with one click from the user account dashboard.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '3. Юрисдикция и спазване на местното законодателство'
                    : '3. Local Laws & Jurisdiction Compliance'}
                </h3>
                <p>
                  {isBg
                    ? 'Потребителят е длъжен да се увери, че използването на спортна статистическа информация и евентуалното участие в спортни залози при трети страни (лицензирани букмейкъри) е законно в неговата държава на пребиваване.'
                    : 'Users are responsible for ensuring that accessing sports statistical data and any subsequent activity with third-party licensed bookmakers complies with the laws of their jurisdiction.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '4. Защита на интелектуалната собственост, Забрана за ботове (Anti-Scraping) и препродажба на сигнали'
                    : '4. Intellectual Property, Anti-Scraping & Signal Redistribution Ban'}
                </h3>
                <p>
                  {isBg
                    ? 'Математическите алгоритми, синтетичният xG модел и +EV сигналите са интелектуална собственост на Oddspira. Строго се забранява автоматизираното извличане на данни (web scraping / ботове), както и споделянето на един VIP/Pro акаунт между няколко лица или препродажбата на сигналите в Telegram/Discord групи.'
                    : 'All mathematical algorithms, synthetic xG models, and +EV signals are proprietary to Oddspira. Automated web scraping, account sharing, and unauthorized redistribution of VIP signals in third-party Telegram/Discord channels are strictly prohibited.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '5. Търговски марки на футболни лиги и клубове (Nominative Fair Use)'
                    : '5. Sports Leagues & Club Trademarks (Nominative Fair Use)'}
                </h3>
                <p>
                  {isBg
                    ? 'Всички имена на първенства (UEFA, Premier League, La Liga и др.), отбори и стадиони са собственост на съответните им притежатели и се използват в Oddspira единствено с информационна, статистическа и описателна цел (Nominative Fair Use), без да се внушава официално спонсорство или принадлежност.'
                    : 'All league names, team names, and competition identifiers belong to their respective owners and are used strictly for descriptive, statistical, and informational purposes (Nominative Fair Use) without implying official endorsement.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                <div className="text-xs font-mono font-bold text-[#43f08a] uppercase mb-1">
                  {isBg
                    ? 'РЕГЛАМЕНТ (ЕС) 2016/679 (GDPR) И ЗАЩИТА НА ЛИЧНИТЕ ДАННИ'
                    : 'EU REGULATION 2016/679 (GDPR) DATA PROTECTION'}
                </div>
                <p className="text-xs text-[#cbd5e1]">
                  {isBg
                    ? 'Данните на Oddspira се съхраняват на защитени европейски сървъри (OVHcloud EU Data Centers — Франция/Германия) при пълно спазване на Общия регламент относно защитата на данните (GDPR).'
                    : 'Oddspira data is hosted exclusively on secure European servers (OVHcloud EU Data Centers) in full compliance with the EU General Data Protection Regulation (GDPR).'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg ? '1. Какви данни събираме и защо?' : '1. What Data We Collect & Why'}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>{isBg ? 'Акаунт и автентикация:' : 'Account & Authentication:'}</strong>{' '}
                    {isBg
                      ? 'Име/псевдоним, имейл адрес и криптографски хеширана парола (SHA-256 със сол) за достъп до вашите запазени анализи и дневник на банката.'
                      : 'Name/handle, email address, and cryptographically salted password hash (SHA-256) to sync your saved analyses and bankroll ledger.'}
                  </li>
                  <li>
                    <strong>{isBg ? 'Имейл известия (Brevo):' : 'Email Notifications (Brevo):'}</strong>{' '}
                    {isBg
                      ? 'Транзакционни имейли (активация, възстановяване на парола) и, само при изрично съгласие (Opt-in), седмичен +EV дайджест чрез Brevo (Sendinblue). Всеки имейл съдържа бутон за отписване с 1 клик.'
                      : 'Transactional emails (welcome, password reset) and opt-in +EV digests powered by Brevo (Sendinblue) with 1-click unsubscribe.'}
                  </li>
                  <li>
                    <strong>{isBg ? 'Плащания (Stripe):' : 'Payments (Stripe):'}</strong>{' '}
                    {isBg
                      ? 'Oddspira НЕ съхранява номера на банкови карти на своите сървъри. Всички картови данни се обработват директно от Stripe (PCI-DSS Level 1 сертифициран оператор).'
                      : 'Oddspira NEVER stores credit card numbers on its servers. All payment credentials are handled directly by Stripe (PCI-DSS Level 1 certified).'}
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '2. Вашите права по GDPR (Изтриване и Експорт)'
                    : '2. Your GDPR Rights (Right to Erasure & Data Portability)'}
                </h3>
                <p>
                  {isBg
                    ? 'Имате право по всяко време да експортирате цялата си история във формат CSV/JSON (от секция „Моите залози“) или да поискате пълно изтриване („Право да бъдеш забравен“) на вашия профил и имейл от базата данни.'
                    : 'You have the right to export your entire history in CSV/JSON format at any time or request immediate permanent deletion ("Right to be Forgotten") of your account and email record.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'responsible' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3.5">
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-sm shrink-0">
                  18+
                </span>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-300 uppercase">
                    {isBg
                      ? 'ЗАБРАНЕНО ЗА ЛИЦА ПОД 18 ГОДИНИ · ИГРАЙТЕ ОТГОВОРНО'
                      : 'STRICTLY 18+ ONLY · RESPONSIBLE GAMING COMMITMENT'}
                  </div>
                  <p className="text-xs text-[#e2e8f0] mt-1">
                    {isBg
                      ? 'Макар Oddspira да е математически софтуер, а не букмейкър, нашите инструменти се използват от спортни анализатори. Хазартът крие риск от развиване на зависимост и загуба на средства. Никога не рискувайте средства, които не можете да си позволите да загубите.'
                      : 'While Oddspira is an analytical software platform and not a gambling operator, sports betting carries financial risk and potential addiction. Never wager money you cannot afford to lose.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="https://www.begambleaware.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-[#101827] border border-[#1f2e46] hover:border-[#43f08a] transition-colors block"
                >
                  <div className="text-xs font-mono font-bold text-[#43f08a]">BeGambleAware.org ↗</div>
                  <p className="text-[11px] text-[#94a3b8] mt-1">
                    {isBg
                      ? 'Безплатна, поверителна помощ и консултации при проблеми с хазарта.'
                      : 'Free, confidential help and support for anyone worried about gambling.'}
                  </p>
                </a>
                <a
                  href="https://www.gamcare.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-[#101827] border border-[#1f2e46] hover:border-[#43f08a] transition-colors block"
                >
                  <div className="text-xs font-mono font-bold text-[#43f08a]">GamCare.org.uk ↗</div>
                  <p className="text-[11px] text-[#94a3b8] mt-1">
                    {isBg
                      ? 'Водеща организация за информация, съвети и подкрепа (24/7 линия).'
                      : 'Leading provider of information, advice, and support for problem gambling.'}
                  </p>
                </a>
                <a
                  href={getNationalRegulator(language).url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-[#101827] border border-[#1f2e46] hover:border-[#43f08a] transition-colors block"
                >
                  <div className="text-xs font-mono font-bold text-[#43f08a]">
                    {getNationalRegulator(language).name}
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-1">
                    {getNationalRegulator(language).desc}
                  </p>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '1. Независимост на алгоритмите и Партньорски линкове (Affiliate Disclosure)'
                    : '1. Algorithmic Independence & Affiliate Disclosure'}
                </h3>
                <p>
                  {isBg
                    ? 'Справедливите коефициенти (Fair Odds) и вероятностите на Oddspira се изчисляват на 100% автоматично от нашите математически модели (Poisson, Dixon-Coles, Shin No-Vig) и никога не се манипулират в полза на който и да е букмейкър. Когато сравняваме коефициенти между букмейкъри, платформата може да съдържа партньорски връзки към лицензирани оператори.'
                    : 'Oddspira Fair Odds and probabilities are 100% mathematically computed and are never altered to favor any bookmaker. Bookmaker comparison tables may include affiliate links to licensed operators.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isBg
                    ? '2. Защо това е критично при кандидатстване за Stripe и банкови терминали?'
                    : '2. Stripe & Banking Compliance Summary'}
                </h3>
                <p>
                  {isBg
                    ? 'Платежните процесори като Stripe класифицират хазартните сайтове като „Restricted Businesses“, но РАЗРЕШАВАТ софтуерни и информационни SaaS платформи за спортна статистика, стига на сайта да е ясно посочено, че не се приемат залози и че се продава единствено абонамент за данни и калкулатори. Този правен модул покрива изискванията на Stripe, Visa и Mastercard.'
                    : 'Payment processors like Stripe restrict gambling operators but permit sports data and statistical SaaS platforms when clearly disclosed that no wagers are accepted and subscriptions are strictly for analytical tools.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#070b12] border-t border-[#182234]">
          <span className="text-[11px] font-mono text-[#8f9cae]">
            Oddspira Quantitative Intelligence · EU GDPR & 18+ Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#43f08a] text-[#05130b] text-xs font-mono font-bold cursor-pointer hover:bg-[#56f498] transition-colors"
          >
            {isBg ? 'Разбрах / Затвори' : 'Understood / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CookieConsentBanner: React.FC<{
  language: Language;
  onOpenPrivacy: () => void;
}> = ({ language, onOpenPrivacy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('oddspira_cookie_consent');
      if (!saved) {
        setVisible(true);
      }
    } catch {
      setVisible(false);
    }
  }, []);

  const handleAccept = (mode: 'all' | 'essential') => {
    try {
      localStorage.setItem('oddspira_cookie_consent', mode);
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  const isBg = language === 'bg';

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-5xl mx-auto rounded-2xl bg-[#0b0f19]/95 backdrop-blur-md border border-[#1e2d42] shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1 text-xs text-[#cbd5e1]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#43f08a]/15 border border-[#43f08a]/40 text-[#43f08a] text-[10px] font-mono font-bold">
            GDPR & COOKIE COMPLIANCE
          </span>
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold">
            18+
          </span>
          <span className="font-bold text-white">
            {isBg
              ? 'Поверителност, бисквитки и информационен характер'
              : 'Privacy, Cookies & Statistical Software Notice'}
          </span>
        </div>
        <p className="text-[11px] text-[#94a3b8] leading-relaxed">
          {isBg
            ? 'Използваме задължителни бисквитки за работата на аналитичния терминал, сесиите и запазването на вашата банка. Oddspira е софтуер за спортен статистически анализ (не е букмейкър) и е предназначен за лица над 18 г. '
            : 'We use essential cookies to power the analytical terminal, user sessions, and local bankroll storage. Oddspira is quantitative sports analytics software (not a bookmaker) for users 18+. '}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[#43f08a] underline hover:text-emerald-300 cursor-pointer font-medium"
          >
            {isBg ? 'Прочети GDPR Политиката & Условията' : 'Read GDPR Privacy & Terms'}
          </button>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
        <button
          type="button"
          onClick={() => handleAccept('essential')}
          className="px-3.5 py-2 rounded-xl bg-[#111927] hover:bg-[#1a263b] border border-[#24324a] text-xs font-mono text-[#cbd5e1] cursor-pointer transition-colors"
        >
          {isBg ? 'Само задължителни' : 'Essential Only'}
        </button>
        <button
          type="button"
          onClick={() => handleAccept('all')}
          className="px-4 py-2 rounded-xl bg-[#43f08a] hover:bg-[#56f498] text-[#05130b] text-xs font-mono font-bold cursor-pointer transition-colors"
        >
          {isBg ? 'Приемам всички ✓' : 'Accept All ✓'}
        </button>
      </div>
    </div>
  );
};
