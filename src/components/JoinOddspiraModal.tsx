import React, { useState } from 'react';
import { Language } from '../types';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface JoinOddspiraModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  onAuthSuccess: (user: UserProfile, token: string, isNewUser: boolean) => void;
}

export const JoinOddspiraModal: React.FC<JoinOddspiraModalProps> = ({
  isOpen,
  onClose,
  language = 'bg',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'forgot' | 'reset'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const dict = {
    bg: {
      tabRegister: 'Регистрация',
      tabLogin: 'Вход в профила',
      badge: 'СОБСТВЕНА БАЗА ДАННИ · BREVO EMAIL ENGINE',
      registerTitle: 'Създай акаунт в',
      loginTitle: 'Вход в твоя профил в',
      forgotTitle: 'Възстановяване на парола в',
      subText:
        'Запазвай своите +EV залози в облачната база данни на сървъра и получавай имейл известия през Brevo.',
      nameLabel: 'Име / Псевдоним',
      namePlaceholder: 'Вашето име',
      emailLabel: 'Имейл адрес',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Парола (мин. 6 символа)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Създай безплатен акаунт →',
      loginBtn: 'Влез в профила си →',
      forgotLink: 'Забравена парола?',
      sendCodeBtn: 'Изпрати код по имейл (Brevo) →',
      resetBtn: 'Запази новата парола →',
      tokenLabel: 'Код за възстановяване (напр. OSP-89F42A)',
      newPassLabel: 'Нова парола (мин. 6 символа)',
      loadingBtn: 'Свързване със сървъра...',
      switchLoginText: 'Вече имаш акаунт?',
      switchLoginAction: 'Влез тук',
      switchRegisterText: 'Нямаш акаунт все още?',
      switchRegisterAction: 'Регистрирай се',
    },
    en: {
      tabRegister: 'Create Account',
      tabLogin: 'Sign In',
      badge: 'ENCRYPTED SQL DATABASE · BREVO EMAIL ENGINE',
      registerTitle: 'Create your account on',
      loginTitle: 'Sign in to your account on',
      forgotTitle: 'Reset your password on',
      subText:
        'Save your +EV wagers in the server database and receive automated Brevo email confirmations.',
      nameLabel: 'Name / Nickname',
      namePlaceholder: 'Your name',
      emailLabel: 'Email address',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password (min. 6 characters)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Create Free Account →',
      loginBtn: 'Sign In to Account →',
      forgotLink: 'Forgot password?',
      sendCodeBtn: 'Send Reset Code via Brevo →',
      resetBtn: 'Save New Password →',
      tokenLabel: 'Security Reset Code (e.g. OSP-89F42A)',
      newPassLabel: 'New Password (min. 6 chars)',
      loadingBtn: 'Connecting to server...',
      switchLoginText: 'Already have an account?',
      switchLoginAction: 'Sign in here',
      switchRegisterText: "Don't have an account yet?",
      switchRegisterAction: 'Create one',
    },
    es: {
      tabRegister: 'Crear Cuenta',
      tabLogin: 'Iniciar Sesión',
      badge: 'BASE DE DATOS SQL · BREVO EMAIL',
      registerTitle: 'Crea tu cuenta en',
      loginTitle: 'Inicia sesión en',
      forgotTitle: 'Recuperar contraseña en',
      subText:
        'Guarda tus apuestas +EV y tu bankroll en la base de datos del servidor desde cualquier dispositivo.',
      nameLabel: 'Nombre / Alias',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Contraseña (mín. 6 caracteres)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Crear Cuenta Gratis →',
      loginBtn: 'Iniciar Sesión →',
      forgotLink: '¿Olvidaste tu contraseña?',
      sendCodeBtn: 'Enviar código por Brevo →',
      resetBtn: 'Guardar nueva contraseña →',
      tokenLabel: 'Código de seguridad (ej. OSP-89F42A)',
      newPassLabel: 'Nueva contraseña (mín. 6 caracteres)',
      loadingBtn: 'Conectando al servidor...',
      switchLoginText: '¿Ya tienes una cuenta?',
      switchLoginAction: 'Inicia sesión aquí',
      switchRegisterText: '¿Aún no tienes cuenta?',
      switchRegisterAction: 'Regístrate',
    },
    de: {
      tabRegister: 'Registrieren',
      tabLogin: 'Anmelden',
      badge: 'SQL-DATENBANK · BREVO EMAIL ENGINE',
      registerTitle: 'Konto erstellen bei',
      loginTitle: 'Anmelden bei',
      forgotTitle: 'Passwort zurücksetzen bei',
      subText:
        'Speichern Sie Ihre +EV-Wetten und Bankroll-Daten sicher in der Server-Datenbank für alle Geräte.',
      nameLabel: 'Name / Benutzername',
      namePlaceholder: 'Ihr Name',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Passwort (mind. 6 Zeichen)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Kostenloses Konto erstellen →',
      loginBtn: 'Jetzt anmelden →',
      forgotLink: 'Passwort vergessen?',
      sendCodeBtn: 'Reset-Code per Brevo senden →',
      resetBtn: 'Neues Passwort speichern →',
      tokenLabel: 'Sicherheitscode (z.B. OSP-89F42A)',
      newPassLabel: 'Neues Passwort (mind. 6 Zeichen)',
      loadingBtn: 'Verbindung zum Server...',
      switchLoginText: 'Bereits ein Konto?',
      switchLoginAction: 'Hier anmelden',
      switchRegisterText: 'Noch kein Konto?',
      switchRegisterAction: 'Jetzt registrieren',
    },
  };

  const t = (dict as Record<string, typeof dict.en>)[language] || dict.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json();
        setIsSubmitting(false);
        if (!res.ok) {
          setErrorMessage(data.error || 'Грешка при изпращане на код.');
          return;
        }
        if (data.demoTokenPreview) {
          setResetToken(data.demoTokenPreview);
        }
        setInfoMessage(
          data.demoTokenPreview
            ? `${data.message} (Демо код: ${data.demoTokenPreview})`
            : data.message
        );
        setMode('reset');
        return;
      }

      if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken.trim(),
            newPassword,
          }),
        });
        const data = await res.json();
        setIsSubmitting(false);
        if (!res.ok) {
          setErrorMessage(data.error || 'Невалиден код.');
          return;
        }
        setInfoMessage(data.message || 'Паролата е сменена успешно!');
        setMode('login');
        return;
      }

      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'Възникна грешка при заявката.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onAuthSuccess(data.user, data.token, mode === 'register');
      setPassword('');
      onClose();
    } catch {
      setErrorMessage('Няма връзка със сървъра. Моля, опитайте отново.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0c1219] via-[#070b11] to-[#05080c] border border-[#1e293b] shadow-[0_0_50px_rgba(67,240,138,0.12)] p-6 sm:p-8 overflow-hidden text-[#f7f8fb]"
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full bg-[#43f08a]/20 blur-3xl"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#0f1723] border border-[#1e293b] text-[#8f9cae] hover:text-[#f7f8fb] hover:border-[#43f08a]/50 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="space-y-5">
          {/* Segmented Mode Switcher: Register vs Login */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#090e16] border border-[#1b2535] max-w-xs">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#43f08a] text-[#05130b] shadow-sm'
                  : 'text-[#8f9cae] hover:text-white'
              }`}
            >
              {t.tabRegister}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'login' || mode === 'forgot' || mode === 'reset'
                  ? 'bg-[#43f08a] text-[#05130b] shadow-sm'
                  : 'text-[#8f9cae] hover:text-white'
              }`}
            >
              {t.tabLogin}
            </button>
          </div>

          {/* Header Badge & Title */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#43f08a]/10 border border-[#43f08a]/30 text-[10px] font-mono font-bold text-[#43f08a]">
              <span>{t.badge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#f7f8fb]">
              {mode === 'register'
                ? t.registerTitle
                : mode === 'login'
                ? t.loginTitle
                : t.forgotTitle}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#43f08a] to-[#70f7a7]">
                Oddspira
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-[#8f9cae] leading-relaxed">{t.subText}</p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-300">
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-[#43f08a]">
              {infoMessage}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono text-[#8f9cae] mb-1">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080d14] border border-[#1e293b] focus:border-[#43f08a] rounded-xl px-3.5 py-2.5 text-sm text-[#f7f8fb] placeholder-[#475569] focus:outline-none transition-colors"
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-mono text-[#8f9cae] mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080d14] border border-[#1e293b] focus:border-[#43f08a] rounded-xl px-3.5 py-2.5 text-sm text-[#f7f8fb] placeholder-[#475569] focus:outline-none transition-colors"
                />
              </div>
            )}

            {(mode === 'register' || mode === 'login') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-[#8f9cae]">
                    {t.passwordLabel}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setInfoMessage(null);
                      }}
                      className="text-[11px] font-mono text-[#43f08a] hover:underline cursor-pointer"
                    >
                      {t.forgotLink}
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080d14] border border-[#1e293b] focus:border-[#43f08a] rounded-xl px-3.5 py-2.5 text-sm text-[#f7f8fb] placeholder-[#475569] focus:outline-none transition-colors"
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-[#8f9cae] mb-1">
                    {t.tokenLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="OSP-XXXXXX"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-[#080d14] border border-[#43f08a]/50 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#43f08a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8f9cae] mb-1">
                    {t.newPassLabel}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#080d14] border border-[#1e293b] focus:border-[#43f08a] rounded-xl px-3.5 py-2.5 text-sm text-[#f7f8fb] focus:outline-none"
                  />
                </div>
              </>
            )}

            {mode === 'register' && (
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 text-[11px] text-[#94a3b8] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="mt-0.5 accent-[#43f08a] rounded cursor-pointer"
                  />
                  <span>
                    {language === 'bg'
                      ? 'Потвърждавам, че имам навършени 18 години, приемам Общите условия и GDPR Политиката за поверителност и разбирам, че Oddspira е аналитичен софтуер (не е букмейкър).'
                      : 'I confirm that I am 18+ years of age, accept the Terms of Service & GDPR Privacy Policy, and understand Oddspira is statistical analytics software (not a bookmaker).'}
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-3.5 px-6 rounded-xl font-bold text-sm text-[#070b11] bg-gradient-to-r from-[#43f08a] via-[#3fe384] to-[#2cd873] hover:from-[#54f396] hover:to-[#38df7d] transition-all duration-200 shadow-[0_0_25px_rgba(67,240,138,0.35)] cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span className="relative z-10 font-black tracking-wide">
                {isSubmitting
                  ? t.loadingBtn
                  : mode === 'register'
                  ? t.registerBtn
                  : mode === 'login'
                  ? t.loginBtn
                  : mode === 'forgot'
                  ? t.sendCodeBtn
                  : t.resetBtn}
              </span>
            </button>
          </form>

          {/* Bottom Switch Mode Link */}
          <div className="text-center text-xs text-[#8f9cae] pt-1">
            {mode === 'register' ? (
              <>
                <span>{t.switchLoginText} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-[#43f08a] font-bold hover:underline cursor-pointer"
                >
                  {t.switchLoginAction}
                </button>
              </>
            ) : (
              <>
                <span>{t.switchRegisterText} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-[#43f08a] font-bold hover:underline cursor-pointer"
                >
                  {t.switchRegisterAction}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
