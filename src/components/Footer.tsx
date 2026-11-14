import { Language, ActiveTab } from '../types';
import { BrandLogo } from './BrandLogo';
import { LegalTab, getNationalRegulator } from './LegalComplianceModal';

export function Footer({
  language,
  setActiveTab,
  onOpenArchitecture,
  onOpenLegal,
}: {
  language: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArchitecture: () => void;
  onOpenLegal?: (tab: LegalTab) => void;
}) {
  const dict = {
    bg: {
      tagline: 'По-умни залози. По-добри резултати.',
      product: 'Продукт',
      live: 'На живо',
      tools: 'Инструменти',
      leagues: 'Състезания',
      myBets: 'Моите залози',
      resources: 'Ресурси',
      guides: 'Ръководства',
      blog: 'Блог',
      helpCenter: 'Помощен център',
      contactUs: 'Контакти',
      terms: 'Общи условия',
      privacy: 'Политика за поверителност',
      responsible: 'Отговорна игра',
      affiliate: 'Партньорска програма',
      followUs: 'Последвай ни',
      copyright: '© 2024 Oddspira. Всички права запазени.',
    },
    en: {
      tagline: 'Smarter bets. Better results.',
      product: 'Product',
      live: 'Live',
      tools: 'Tools',
      leagues: 'Leagues',
      myBets: 'My Bets',
      resources: 'Resources',
      guides: 'Guides',
      blog: 'Blog',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      responsible: 'Responsible Gaming',
      affiliate: 'Affiliate Program',
      followUs: 'Follow Us',
      copyright: '© 2024 Oddspira. All rights reserved.',
    },
    es: {
      tagline: 'Apuestas más inteligentes. Mejores resultados.',
      product: 'Producto',
      live: 'En Vivo',
      tools: 'Herramientas',
      leagues: 'Ligas',
      myBets: 'Mis Apuestas',
      resources: 'Recursos',
      guides: 'Guías',
      blog: 'Blog',
      helpCenter: 'Centro de Ayuda',
      contactUs: 'Contacto',
      terms: 'Términos de Servicio',
      privacy: 'Política de Privacidad',
      responsible: 'Juego Responsable',
      affiliate: 'Programa de Afiliados',
      followUs: 'Síguenos',
      copyright: '© 2024 Oddspira. Todos los derechos reservados.',
    },
    de: {
      tagline: 'Intelligentere Wetten. Bessere Ergebnisse.',
      product: 'Produkt',
      live: 'Live',
      tools: 'Tools',
      leagues: 'Ligen',
      myBets: 'Meine Wetten',
      resources: 'Ressourcen',
      guides: 'Guides',
      blog: 'Blog',
      helpCenter: 'Hilfe-Center',
      contactUs: 'Kontakt',
      terms: 'Nutzungsbedingungen',
      privacy: 'Datenschutz',
      responsible: 'Verantwortungsvolles Spielen',
      affiliate: 'Partnerprogramm',
      followUs: 'Folge uns',
      copyright: '© 2024 Oddspira. Alle Rechte vorbehalten.',
    },
    it: {
      tagline: 'Scommesse più intelligenti. Risultati migliori.',
      product: 'Prodotto',
      live: 'Live',
      tools: 'Strumenti',
      leagues: 'Campionati',
      myBets: 'Le Mie Scommesse',
      resources: 'Risorse',
      guides: 'Guide',
      blog: 'Blog',
      helpCenter: 'Centro Assistenza',
      contactUs: 'Contattaci',
      terms: 'Termini di Servizio',
      privacy: 'Informativa sulla Privacy',
      responsible: 'Gioco Responsabile',
      affiliate: 'Programma Affiliati',
      followUs: 'Seguici',
      copyright: '© 2024 Oddspira. Tutti i diritti riservati.',
    },
    pt: {
      tagline: 'Apostas mais inteligentes. Melhores resultados.',
      product: 'Produto',
      live: 'Ao Vivo',
      tools: 'Ferramentas',
      leagues: 'Ligas',
      myBets: 'Minhas Apostas',
      resources: 'Recursos',
      guides: 'Guias',
      blog: 'Blog',
      helpCenter: 'Central de Ajuda',
      contactUs: 'Contato',
      terms: 'Termos de Serviço',
      privacy: 'Política de Privacidade',
      responsible: 'Jogo Responsável',
      affiliate: 'Programa de Afiliados',
      followUs: 'Siga-nos',
      copyright: '© 2024 Oddspira. Todos os direitos reservados.',
    },
    fr: {
      tagline: 'Des paris plus intelligents. De meilleurs résultats.',
      product: 'Produit',
      live: 'En Direct',
      tools: 'Outils',
      leagues: 'Championnats',
      myBets: 'Mes Paris',
      resources: 'Ressources',
      guides: 'Guides',
      blog: 'Blog',
      helpCenter: 'Centre d’Aide',
      contactUs: 'Contact',
      terms: 'Conditions d’Utilisation',
      privacy: 'Politique de Confidentialité',
      responsible: 'Jeu Responsable',
      affiliate: 'Programme d’Affiliation',
      followUs: 'Suivez-nous',
      copyright: '© 2024 Oddspira. Tous droits réservés.',
    },
    tr: {
      tagline: 'Daha akıllı bahisler. Daha iyi sonuçlar.',
      product: 'Ürün',
      live: 'Canlı',
      tools: 'Araçlar',
      leagues: 'Ligler',
      myBets: 'Bahislerim',
      resources: 'Kaynaklar',
      guides: 'Rehberler',
      blog: 'Blog',
      helpCenter: 'Yardım Merkezi',
      contactUs: 'İletişim',
      terms: 'Kullanım Koşulları',
      privacy: 'Gizlilik Politikası',
      responsible: 'Sorumlu Oyun',
      affiliate: 'Ortaklık Programı',
      followUs: 'Bizi Takip Edin',
      copyright: '© 2024 Oddspira. Tüm hakları saklıdır.',
    },
    pl: {
      tagline: 'Mądrzejsze zakłady. Lepsze wyniki.',
      product: 'Produkt',
      live: 'Na Żywo',
      tools: 'Narzędzia',
      leagues: 'Ligi',
      myBets: 'Moje Zakłady',
      resources: 'Zasoby',
      guides: 'Poradniki',
      blog: 'Blog',
      helpCenter: 'Centrum Pomocy',
      contactUs: 'Kontakt',
      terms: 'Warunki Korzystania',
      privacy: 'Polityka Prywatności',
      responsible: 'Odpowiedzialna Gra',
      affiliate: 'Program Partnerski',
      followUs: 'Obserwuj nas',
      copyright: '© 2024 Oddspira. Wszelkie prawa zastrzeżone.',
    },
    el: {
      tagline: 'Πιο έξυπνα στοιχήματα. Καλύτερα αποτελέσματα.',
      product: 'Προϊόν',
      live: 'Ζωντανά',
      tools: 'Εργαλεία',
      leagues: 'Πρωταθλήματα',
      myBets: 'Τα Στοιχήματά μου',
      resources: 'Πόροι',
      guides: 'Οδηγοί',
      blog: ' Blog',
      helpCenter: 'Κέντρο Βοήθειας',
      contactUs: 'Επικοινωνία',
      terms: 'Όροι Χρήσης',
      privacy: 'Πολιτική Απορρήτου',
      responsible: 'Υπεύθυνο Παιχνίδι',
      affiliate: 'Πρόγραμμα Συνεργατών',
      followUs: 'Ακολουθήστε μας',
      copyright: '© 2024 Oddspira. Με επιφύλαξη παντός δικαιώματος.',
    },
    ro: {
      tagline: 'Pariuri mai inteligente. Rezultate mai bune.',
      product: 'Produs',
      live: 'Live',
      tools: 'Instrumente',
      leagues: 'Campionate',
      myBets: 'Pariurile Mele',
      resources: 'Resurse',
      guides: 'Ghiduri',
      blog: 'Blog',
      helpCenter: 'Centru de Ajutor',
      contactUs: 'Contact',
      terms: 'Termeni și Condiții',
      privacy: 'Politica de Confidențialitate',
      responsible: 'Joc Responsabil',
      affiliate: 'Program de Afiliere',
      followUs: 'Urmărește-ne',
      copyright: '© 2024 Oddspira. Toate drepturile rezervate.',
    },
    ru: {
      tagline: 'Умные ставки. Лучшие результаты.',
      product: 'Продукт',
      live: 'Лайв',
      tools: 'Инструменты',
      leagues: 'Лиги',
      myBets: 'Мои Ставки',
      resources: 'Ресурсы',
      guides: 'Руководства',
      blog: 'Блог',
      helpCenter: 'Центр помощи',
      contactUs: 'Контакты',
      terms: 'Условия использования',
      privacy: 'Политика конфиденциальности',
      responsible: 'Ответственная игра',
      affiliate: 'Партнерская программа',
      followUs: 'Мы в соцсетях',
      copyright: '© 2024 Oddspira. Все права защищены.',
    },
  };

  const t = dict[language] || dict.en;

  return (
    <footer className="border-t border-[#162030] bg-[#06090f] py-6 text-xs text-[#8f9cae]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Brand Column (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:opacity-95 transition-opacity duration-150 focus:outline-none cursor-pointer"
            >
              <BrandLogo showSubtitle={false} className="h-8" />
            </button>
            <p className="text-[11px] text-neutral-400">
              {t.tagline}
            </p>
          </div>

          {/* Product Column (2 cols) */}
          <div className="md:col-span-2 flex gap-6">
            <span className="font-bold text-white text-xs shrink-0">{t.product}</span>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.live}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.tools}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('competitions')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.leagues}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('bets')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.myBets}
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Legal Column (4 cols) */}
          <div className="md:col-span-4 flex flex-wrap gap-6 sm:gap-8">
            <span className="font-bold text-white text-xs shrink-0">{t.resources}</span>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('learn')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.guides}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('learn')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.blog}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenArchitecture}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.helpCenter}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenArchitecture}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.contactUs}
                </button>
              </li>
            </ul>

            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => (onOpenLegal ? onOpenLegal('terms') : onOpenArchitecture())}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.terms}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (onOpenLegal ? onOpenLegal('privacy') : onOpenArchitecture())}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.privacy}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (onOpenLegal ? onOpenLegal('responsible') : onOpenArchitecture())}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.responsible}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (onOpenLegal ? onOpenLegal('affiliate') : setActiveTab('vip'))}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t.affiliate}
                </button>
              </li>
            </ul>
          </div>

          {/* Follow Us + Copyright (3 cols) */}
          <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="font-bold text-white text-xs block">{t.followUs}</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. X / Twitter */}
                <a
                  href="https://x.com/oddspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  title="X (Twitter)"
                  className="w-7 h-7 rounded-full bg-[#111926] border border-[#1e2c42] hover:border-[#43f08a] text-neutral-300 hover:text-[#43f08a] flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* 2. Facebook */}
                <a
                  href="https://facebook.com/oddspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="w-7 h-7 rounded-full bg-[#111926] border border-[#1e2c42] hover:border-[#43f08a] text-neutral-300 hover:text-[#43f08a] flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* 3. TikTok */}
                <a
                  href="https://tiktok.com/@oddspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                  className="w-7 h-7 rounded-full bg-[#111926] border border-[#1e2c42] hover:border-[#43f08a] text-neutral-300 hover:text-[#43f08a] flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                {/* 4. Instagram */}
                <a
                  href="https://instagram.com/oddspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="w-7 h-7 rounded-full bg-[#111926] border border-[#1e2c42] hover:border-[#43f08a] text-neutral-300 hover:text-[#43f08a] flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" strokeWidth="2" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>
                {/* 5. Telegram */}
                <a
                  href="https://t.me/oddspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  title="Telegram"
                  className="w-7 h-7 rounded-full bg-[#111926] border border-[#1e2c42] hover:border-[#43f08a] text-neutral-300 hover:text-[#43f08a] flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                {/* 6. YouTube */}
                <a
                  href="https://youtube.com/@oddspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className="w-7 h-7 rounded-full bg-[#111926] border border-[#1e2c42] hover:border-[#43f08a] text-neutral-300 hover:text-[#43f08a] flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 lg:text-right pt-2 lg:pt-5">
              {t.copyright}
            </div>
          </div>
        </div>

        {/* Mandatory 18+ Responsible Gaming, BeGambleAware, GamCare & Non-Bookmaker SaaS Compliance Strip */}
        <div className="mt-5 pt-4 border-t border-[#121a28] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-[11px] text-[#64748b]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/40 text-red-300 font-mono font-black text-[10px]">
              18+
            </span>
            <span className="px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30 text-[#43f08a] font-mono font-bold text-[10px]">
              STATISTICAL SAAS · NOT A BOOKMAKER
            </span>
            <span>
              {language === 'bg'
                ? 'Oddspira е информационен и математически софтуер за спортен анализ. Не приема залози и не гарантира печалби.'
                : 'Oddspira is quantitative sports analytics software, not a gambling operator. No wagers are accepted and past edge does not guarantee future profit.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] shrink-0">
            <a
              href="https://www.begambleaware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#0d1420] border border-[#1d283a] text-[#cbd5e1] hover:border-[#43f08a] hover:text-[#43f08a] transition-colors"
            >
              BeGambleAware.org ↗
            </a>
            <a
              href="https://www.gamcare.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#0d1420] border border-[#1d283a] text-[#cbd5e1] hover:border-[#43f08a] hover:text-[#43f08a] transition-colors"
            >
              GamCare ↗
            </a>
            <a
              href={getNationalRegulator(language).url}
              target="_blank"
              rel="noopener noreferrer"
              title={getNationalRegulator(language).desc}
              className="px-2.5 py-1 rounded bg-[#0d1420] border border-[#1d283a] text-[#cbd5e1] hover:border-[#43f08a] hover:text-[#43f08a] transition-colors"
            >
              {getNationalRegulator(language).name}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
