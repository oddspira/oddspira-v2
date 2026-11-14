import React from 'react';

export type SupportedLanguage =
  | 'bg'
  | 'en'
  | 'es'
  | 'de'
  | 'it'
  | 'pt'
  | 'fr'
  | 'tr'
  | 'pl'
  | 'el'
  | 'ro'
  | 'ru';

export interface HeroLeftTranslations {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  cta1: string;
  cta2: string;
  cta3: string;
  indicator1: string;
  indicator2: string;
  indicator3: string;
}

export const heroTranslations: Record<SupportedLanguage, HeroLeftTranslations> = {
  bg: {
    badge: 'QUANTITATIVE FOOTBALL INTELLIGENCE',
    titlePrefix: 'Надхитри букмейкъра с',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Мощен стохастичен двигател за анализ в реално време. Poisson модел с Dixon-Coles корекция, No-Vig симулатор и автоматично откриване на +EV стойност.',
    cta1: '🎯 Намери +EV мачове',
    cta2: '⚡ Стартирай Poisson симулатор',
    cta3: '⚙ Как работи Engine-а →',
    indicator1: '0% Скрит марж (Shin No-Vig)',
    indicator2: 'Данни в реално време',
    indicator3: 'Без реклами. Без шум. Само стойност.',
  },
  en: {
    badge: 'QUANTITATIVE FOOTBALL INTELLIGENCE',
    titlePrefix: 'Outsmart the Bookmaker with',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'A powerful real-time stochastic analysis engine. Built with Dixon-Coles Poisson modeling, a No-Vig simulator, and automated +EV discovery.',
    cta1: '🎯 Find +EV Matches',
    cta2: '⚡ Launch Poisson Simulator',
    cta3: '⚙ How the Engine Works →',
    indicator1: '0% Hidden Margin (Shin No-Vig)',
    indicator2: 'Real-time Data Feed',
    indicator3: 'Zero Ads. Zero Noise. Pure Value.',
  },
  es: {
    badge: 'INTELIGENCIA FUTBOLÍSTICA CUANTITATIVA',
    titlePrefix: 'Supera a la casa de apuestas con',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Un potente motor estocástico de análisis en tiempo real. Poisson con corrección Dixon-Coles, simulador No-Vig y detección automática de valor +EV.',
    cta1: '🎯 Buscar partidos +EV',
    cta2: '⚡ Iniciar simulador Poisson',
    cta3: '⚙ Cómo funciona el Motor →',
    indicator1: '0% Margen oculto (Shin No-Vig)',
    indicator2: 'Datos en tiempo real',
    indicator3: 'Sin anuncios. Sin ruido. Puro valor.',
  },
  de: {
    badge: 'QUANTITATIVE FUSSBALL-INTELLIGENZ',
    titlePrefix: 'Schlagen Sie den Buchmacher mit der',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Eine leistungsstarke stochastische Echtzeit-Analyse-Engine. Poisson-Modell mit Dixon-Coles-Korrektur, No-Vig-Simulator und automatischer +EV-Erkennung.',
    cta1: '🎯 +EV Spiele finden',
    cta2: '⚡ Poisson-Simulator starten',
    cta3: '⚙ Wie die Engine funktioniert →',
    indicator1: '0% Versteckte Marge (Shin No-Vig)',
    indicator2: 'Echtzeit-Daten',
    indicator3: 'Keine Werbung. Kein Lärm. Purer Wert.',
  },
  it: {
    badge: 'INTELLIGENZA CALCISTICA QUANTITATIVA',
    titlePrefix: 'Batti il bookmaker con',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Potente motore stocastico di analisi in tempo reale. Modello di Poisson con correzione Dixon-Coles, simulatore No-Vig e rilevamento automatico di valore +EV.',
    cta1: '🎯 Trova partite +EV',
    cta2: '⚡ Avvia simulatore Poisson',
    cta3: '⚙ Come funziona il Motore →',
    indicator1: '0% Margine nascosto (Shin No-Vig)',
    indicator2: 'Dati in tempo reale',
    indicator3: 'Zero pubblicità. Puro valore.',
  },
  pt: {
    badge: 'INTELIGÊNCIA QUANTITATIVA DE FUTEBOL',
    titlePrefix: 'Supere a casa de apostas com o',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Motor estocástico de análise em tempo real. Modelo de Poisson com correção Dixon-Coles, simulador No-Vig e descoberta automática de apostas +EV.',
    cta1: '🎯 Encontrar jogos +EV',
    cta2: '⚡ Iniciar simulador Poisson',
    cta3: '⚙ Como funciona o Motor →',
    indicator1: '0% Margem oculta (Shin No-Vig)',
    indicator2: 'Dados em tempo real',
    indicator3: 'Sem anúncios. Sem ruído. Puro valor.',
  },
  fr: {
    badge: 'INTELLIGENCE QUANTITATIVE FOOTBALL',
    titlePrefix: 'Déjouez le bookmaker avec',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Un moteur stochastique d’analyse en temps réel. Modèle de Poisson avec correction Dixon-Coles, simulateur No-Vig et détection automatique de valeur +EV.',
    cta1: '🎯 Trouver des matchs +EV',
    cta2: '⚡ Lancer le simulateur Poisson',
    cta3: '⚙ Fonctionnement du moteur →',
    indicator1: '0% Marge cachée (Shin No-Vig)',
    indicator2: 'Données en temps réel',
    indicator3: 'Zéro pub. Zéro bruit. Pure valeur.',
  },
  tr: {
    badge: 'KANTİTATİF FUTBOL İSTİHBARATI',
    titlePrefix: 'Bahis bürolarını geride bırakın:',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Gerçek zamanlı stokastik analiz motoru. Dixon-Coles düzeltmeli Poisson modeli, No-Vig simülatörü ve otomatik +EV değer tespiti.',
    cta1: '🎯 +EV Maçları Bul',
    cta2: '⚡ Poisson Simülatörünü Başlat',
    cta3: '⚙ Motor Nasıl Çalışır →',
    indicator1: '%0 Gizli Marj (Shin No-Vig)',
    indicator2: 'Gerçek Zamanlı Veri',
    indicator3: 'Reklam Yok. Gürültü Yok. Saf Değer.',
  },
  pl: {
    badge: 'ILOŚCIOWA ANALITYKA PIŁKARSKA',
    titlePrefix: 'Pokonaj bukmachera dzięki',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Zaawansowany stochastyczny silnik analityczny w czasie rzeczywistym. Model Poissona z korektą Dixona-Colesa, symulator No-Vig i wykrywanie +EV.',
    cta1: '🎯 Znajdź mecze +EV',
    cta2: '⚡ Uruchom symulator Poissona',
    cta3: '⚙ Jak działa silnik →',
    indicator1: '0% Ukrytej marży (Shin No-Vig)',
    indicator2: 'Dane na żywo',
    indicator3: 'Zero reklam. Czysta wartość.',
  },
  el: {
    badge: 'ΠΟΣΟΤΙΚΗ ΠΟΔΟΣΦΑΙΡΙΚΗ ΑΝΑΛΥΤΙΚΗ',
    titlePrefix: 'Κερδίστε τον μπουκ με το',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Ισχυρός στοχαστικός κινητήρας ανάλυσης σε πραγματικό χρόνο. Μοντέλο Poisson με διόρθωση Dixon-Coles, προσομοιωτής No-Vig και αυτόματη εύρεση +EV αξίας.',
    cta1: '🎯 Βρείτε αγώνες +EV',
    cta2: '⚡ Εκκίνηση προσομοιωτή Poisson',
    cta3: '⚙ Πώς λειτουργεί το Engine →',
    indicator1: '0% Κρυφή γκανιότα (Shin No-Vig)',
    indicator2: 'Δεδομένα σε πραγματικό χρόνο',
    indicator3: 'Χωρίς διαφημίσεις. Καθαρή αξία.',
  },
  ro: {
    badge: 'INTELIGENȚĂ CANTITATIVĂ ÎN FOTBAL',
    titlePrefix: 'Învinge casele de pariuri cu',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Motor stocastic puternic de analiză în timp real. Model Poisson cu corecție Dixon-Coles, simulator No-Vig și detectare automată a valorii +EV.',
    cta1: '🎯 Găsește meciuri +EV',
    cta2: '⚡ Pornește simulatorul Poisson',
    cta3: '⚙ Cum funcționează motorul →',
    indicator1: '0% Marjă ascunsă (Shin No-Vig)',
    indicator2: 'Date în timp real',
    indicator3: 'Zero reclame. Doar valoare pură.',
  },
  ru: {
    badge: 'КОЛИЧЕСТВЕННАЯ ФУТБОЛЬНАЯ АНАЛИТИКА',
    titlePrefix: 'Обыграйте букмекера с',
    titleHighlight: 'Oddspira Engine',
    subtitle:
      'Мощный стохастический движок анализа в реальном времени. Модель Пуассона с коррекцией Диксона-Коулза, симулятор No-Vig и автоматический поиск +EV.',
    cta1: '🎯 Найти +EV матчи',
    cta2: '⚡ Запустить симулятор Пуассона',
    cta3: '⚙ Как работает движок →',
    indicator1: '0% Скрытой маржи (Shin No-Vig)',
    indicator2: 'Данные в реальном времени',
    indicator3: 'Без рекламы. Только чистая ценность.',
  },
};

export interface HeroLeftSectionProps {
  language?: SupportedLanguage;
  showBadge?: boolean;
  onFindMatches?: () => void;
  onLaunchSimulator?: () => void;
  onHowItWorks?: () => void;
  className?: string;
}

export const HeroLeftSection: React.FC<HeroLeftSectionProps> = ({
  language = 'bg',
  showBadge = true,
  onFindMatches,
  onLaunchSimulator,
  onHowItWorks,
  className = '',
}) => {
  const t = heroTranslations[language] || heroTranslations.bg;

  return (
    <div className={`flex flex-col h-full justify-between ${className}`}>
      {/* 1. Header Badge */}
      {showBadge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-xs font-mono font-bold tracking-wider text-[#10b981] uppercase w-fit select-none mb-2.5">
          <span aria-hidden="true" className="text-sm">
            ⚙
          </span>
          <span>{t.badge}</span>
        </div>
      )}

      {/* Main Top Block: Title, Subtitle & 3 Action CTAs */}
      <div className="flex flex-col">
        {/* 2. Main Title (H1) - Tight bottom margin */}
        <h1
          className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-black tracking-tight text-[#f7f8fb] leading-[1.14] mb-2.5"
          style={{ textWrap: 'balance' }}
        >
          {t.titlePrefix}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7]">
            {t.titleHighlight}
          </span>
        </h1>

        {/* 3. Subtitle Paragraph - Exactly 2 lines across all languages (BG, EN, ES, DE) */}
        <p className="text-sm sm:text-[15px] lg:text-base text-[#8f9cae] leading-relaxed max-w-2xl font-normal mb-3.5">
          {t.subtitle}
        </p>

        {/* 4. Action Buttons - 1 Single Row across all languages on desktop with clean gap */}
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-3 flex-wrap xl:flex-nowrap">
          {/* CTA 1: Primary Emerald Gradient Button */}
          <button
            type="button"
            onClick={onFindMatches}
            className="group relative px-4 sm:px-4.5 lg:px-5 py-3 text-xs sm:text-[13px] font-bold text-[#070b11] bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
          >
            <span className="relative z-10">{t.cta1}</span>
          </button>

          {/* CTA 2: Secondary Dark Slate Button with Border */}
          <button
            type="button"
            onClick={onLaunchSimulator}
            className="px-3.5 sm:px-4 lg:px-4.5 py-3 text-xs sm:text-[13px] font-bold text-[#f7f8fb] bg-[#0c1219] hover:bg-[#131b26] border border-[#1e293b] hover:border-[#10b981]/60 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0"
          >
            <span>{t.cta2}</span>
          </button>

          {/* CTA 3: Tertiary Discrete/Text Button */}
          <button
            type="button"
            onClick={onHowItWorks}
            className="px-2.5 sm:px-3 lg:px-3.5 py-3 text-xs sm:text-[13px] font-semibold text-[#8f9cae] hover:text-[#10b981] transition-colors duration-200 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 group shrink-0"
          >
            <span>{t.cta3}</span>
          </button>
        </div>
      </div>

      {/* 5. Indicators with Small Emerald Checkmarks - 1 Single Row Anchored Flush to the Bottom */}
      <div className="mt-auto pt-2 flex items-center gap-y-2 gap-x-3.5 sm:gap-x-4 lg:gap-x-5 text-[11px] sm:text-xs font-mono text-[#8f9cae] flex-wrap xl:flex-nowrap whitespace-nowrap">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-[#10b981] font-bold" aria-hidden="true">
            ✔
          </span>
          <span>{t.indicator1}</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-[#10b981] font-bold" aria-hidden="true">
            ✔
          </span>
          <span>{t.indicator2}</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-[#10b981] font-bold" aria-hidden="true">
            ✔
          </span>
          <span>{t.indicator3}</span>
        </div>
      </div>
    </div>
  );
};
