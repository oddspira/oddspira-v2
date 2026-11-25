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
  const [mode, setMode] = useState<'register' | 'login' | 'verify' | 'forgot' | 'reset'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
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
      badge: 'ODDSPIRA QUANT SECURITY · ЗАЩИТЕН ПРОФИЛ',
      registerTitle: 'Създай акаунт в',
      loginTitle: 'Вход в твоя профил в',
      verifyTitle: 'Потвърди имейла си в',
      forgotTitle: 'Възстановяване на парола в',
      subText:
        'Синхронизирай своите +EV залози и банка между всички устройства и получавай автоматични известия за математическа стойност.',
      nameLabel: 'Име / Псевдоним',
      namePlaceholder: 'Вашето име',
      emailLabel: 'Имейл адрес',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Парола (мин. 6 символа)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Създай безплатен акаунт →',
      loginBtn: 'Влез в профила си →',
      verifyBtn: 'Потвърди имейла и активирай профила →',
      verifyCodeLabel: 'Код за потвърждение от имейла (напр. OSP-89F42A)',
      resendCodeBtn: 'Изпрати нов код на имейла',
      forgotLink: 'Забравена парола?',
      sendCodeBtn: 'Изпрати код по имейл →',
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
      badge: 'ODDSPIRA QUANT SECURITY · ENCRYPTED ACCOUNT',
      registerTitle: 'Create your account on',
      loginTitle: 'Sign in to your account on',
      verifyTitle: 'Verify your email on',
      forgotTitle: 'Reset your password on',
      subText:
        'Sync your +EV wagers and bankroll across all devices and receive automated value notifications.',
      nameLabel: 'Name / Nickname',
      namePlaceholder: 'Your name',
      emailLabel: 'Email address',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password (min. 6 characters)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Create Free Account →',
      loginBtn: 'Sign In to Account →',
      verifyBtn: 'Verify Email & Activate Account →',
      verifyCodeLabel: 'Email Verification Code (e.g. OSP-89F42A)',
      resendCodeBtn: 'Resend verification code',
      forgotLink: 'Forgot password?',
      sendCodeBtn: 'Send Reset Code to Email →',
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
      badge: 'ODDSPIRA QUANT SECURITY · CUENTA PROTEGIDA',
      registerTitle: 'Crea tu cuenta en',
      loginTitle: 'Inicia sesión en',
      verifyTitle: 'Verifica tu correo en',
      forgotTitle: 'Recuperar contraseña en',
      subText:
        'Guarda tus apuestas +EV y tu bankroll de forma sincronizada desde cualquier dispositivo.',
      nameLabel: 'Nombre / Alias',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Contraseña (mín. 6 caracteres)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Crear Cuenta Gratis →',
      loginBtn: 'Iniciar Sesión →',
      verifyBtn: 'Verificar correo y activar cuenta →',
      verifyCodeLabel: 'Código de verificación (ej. OSP-89F42A)',
      resendCodeBtn: 'Reenviar código al correo',
      forgotLink: '¿Olvidaste tu contraseña?',
      sendCodeBtn: 'Enviar código por correo →',
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
      badge: 'ODDSPIRA QUANT SECURITY · GESCHÜTZTES KONTO',
      registerTitle: 'Konto erstellen bei',
      loginTitle: 'Anmelden bei',
      verifyTitle: 'E-Mail bestätigen bei',
      forgotTitle: 'Passwort zurücksetzen bei',
      subText:
        'Synchronisieren Sie Ihre +EV-Wetten und Bankroll-Daten sicher über alle Ihre Geräte.',
      nameLabel: 'Name / Benutzername',
      namePlaceholder: 'Ihr Name',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Passwort (mind. 6 Zeichen)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Kostenloses Konto erstellen →',
      loginBtn: 'Jetzt anmelden →',
      verifyBtn: 'E-Mail bestätigen & Konto aktivieren →',
      verifyCodeLabel: 'Bestätigungscode (z.B. OSP-89F42A)',
      resendCodeBtn: 'Neuen Code senden',
      forgotLink: 'Passwort vergessen?',
      sendCodeBtn: 'Reset-Code per E-Mail senden →',
      resetBtn: 'Neues Passwort speichern →',
      tokenLabel: 'Sicherheitscode (z.B. OSP-89F42A)',
      newPassLabel: 'Neues Passwort (mind. 6 Zeichen)',
      loadingBtn: 'Verbindung zum Server...',
      switchLoginText: 'Bereits ein Konto?',
      switchLoginAction: 'Hier anmelden',
      switchRegisterText: 'Noch kein Konto?',
      switchRegisterAction: 'Jetzt registrieren',
    },
    it: {
      tabRegister: 'Registrati',
      tabLogin: 'Accedi',
      badge: 'ODDSPIRA QUANT SECURITY · ACCOUNT PROTETTO',
      registerTitle: 'Crea il tuo account su',
      loginTitle: 'Accedi al tuo account su',
      verifyTitle: 'Verifica la tua email su',
      forgotTitle: 'Recupera password su',
      subText:
        'Sincronizza le tue scommesse +EV e il tuo bankroll su tutti i dispositivi e ricevi notifiche di valore.',
      nameLabel: 'Nome / Nickname',
      namePlaceholder: 'Il tuo nome',
      emailLabel: 'Indirizzo email',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password (min. 6 caratteri)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Crea Account Gratuito →',
      loginBtn: 'Accedi →',
      verifyBtn: 'Verifica Email e Attiva Account →',
      verifyCodeLabel: 'Codice di verifica email (es. OSP-89F42A)',
      resendCodeBtn: 'Invia nuovo codice',
      forgotLink: 'Password dimenticata?',
      sendCodeBtn: 'Invia codice via email →',
      resetBtn: 'Salva nuova password →',
      tokenLabel: 'Codice di sicurezza (es. OSP-89F42A)',
      newPassLabel: 'Nuova password (min. 6 caratteri)',
      loadingBtn: 'Connessione al server...',
      switchLoginText: 'Hai già un account?',
      switchLoginAction: 'Accedi qui',
      switchRegisterText: 'Non hai ancora un account?',
      switchRegisterAction: 'Registrati',
    },
    pt: {
      tabRegister: 'Criar Conta',
      tabLogin: 'Entrar',
      badge: 'ODDSPIRA QUANT SECURITY · CONTA PROTEGIDA',
      registerTitle: 'Crie sua conta em',
      loginTitle: 'Entre na sua conta em',
      verifyTitle: 'Verifique seu e-mail em',
      forgotTitle: 'Recuperar senha em',
      subText:
        'Sincronize suas apostas +EV e sua banca em todos os dispositivos e receba alertas de valor.',
      nameLabel: 'Nome / Apelido',
      namePlaceholder: 'Seu nome',
      emailLabel: 'Endereço de e-mail',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Senha (mín. 6 caracteres)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Criar Conta Grátis →',
      loginBtn: 'Entrar na Conta →',
      verifyBtn: 'Verificar E-mail e Ativar Conta →',
      verifyCodeLabel: 'Código de verificação (ex. OSP-89F42A)',
      resendCodeBtn: 'Reenviar código',
      forgotLink: 'Esqueceu a senha?',
      sendCodeBtn: 'Enviar código por e-mail →',
      resetBtn: 'Salvar nova senha →',
      tokenLabel: 'Código de segurança (ex. OSP-89F42A)',
      newPassLabel: 'Nova senha (mín. 6 caracteres)',
      loadingBtn: 'Conectando ao servidor...',
      switchLoginText: 'Já tem uma conta?',
      switchLoginAction: 'Entre aqui',
      switchRegisterText: 'Ainda não tem conta?',
      switchRegisterAction: 'Cadastre-se',
    },
    fr: {
      tabRegister: 'Inscription',
      tabLogin: 'Connexion',
      badge: 'ODDSPIRA QUANT SECURITY · COMPTE SÉCURISÉ',
      registerTitle: 'Créez votre compte sur',
      loginTitle: 'Connectez-vous sur',
      verifyTitle: 'Vérifiez votre e-mail sur',
      forgotTitle: 'Réinitialiser le mot de passe sur',
      subText:
        'Synchronisez vos paris +EV et votre bankroll sur tous vos appareils et recevez des alertes de valeur.',
      nameLabel: 'Nom / Pseudo',
      namePlaceholder: 'Votre nom',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Mot de passe (min. 6 caractères)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Créer un Compte Gratuit →',
      loginBtn: 'Se Connecter →',
      verifyBtn: 'Vérifier l’E-mail et Activer →',
      verifyCodeLabel: 'Code de vérification (ex. OSP-89F42A)',
      resendCodeBtn: 'Renvoyer un code',
      forgotLink: 'Mot de passe oublié ?',
      sendCodeBtn: 'Envoyer le code par e-mail →',
      resetBtn: 'Enregistrer le nouveau mot de passe →',
      tokenLabel: 'Code de sécurité (ex. OSP-89F42A)',
      newPassLabel: 'Nouveau mot de passe (min. 6 caractères)',
      loadingBtn: 'Connexion au serveur...',
      switchLoginText: 'Vous avez déjà un compte ?',
      switchLoginAction: 'Connectez-vous ici',
      switchRegisterText: 'Pas encore de compte ?',
      switchRegisterAction: 'S’inscrire',
    },
    tr: {
      tabRegister: 'Kayıt Ol',
      tabLogin: 'Giriş Yap',
      badge: 'ODDSPIRA QUANT SECURITY · GÜVENLİ HESAP',
      registerTitle: 'Hesabınızı oluşturun:',
      loginTitle: 'Hesabınıza giriş yapın:',
      verifyTitle: 'E-postanızı doğrulayın:',
      forgotTitle: 'Şifre sıfırlama:',
      subText:
        '+EV bahislerinizi ve kasanızı tüm cihazlarda senkronize edin ve değer bildirimleri alın.',
      nameLabel: 'Ad / Kullanıcı Adı',
      namePlaceholder: 'Adınız',
      emailLabel: 'E-posta adresi',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Şifre (en az 6 karakter)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Ücretsiz Hesap Oluştur →',
      loginBtn: 'Giriş Yap →',
      verifyBtn: 'E-postayı Doğrula ve Aktifleştir →',
      verifyCodeLabel: 'Doğrulama Kodu (örn. OSP-89F42A)',
      resendCodeBtn: 'Yeni kod gönder',
      forgotLink: 'Şifremi unuttum?',
      sendCodeBtn: 'E-postaya kod gönder →',
      resetBtn: 'Yeni şifreyi kaydet →',
      tokenLabel: 'Güvenlik Kodu (örn. OSP-89F42A)',
      newPassLabel: 'Yeni Şifre (en az 6 karakter)',
      loadingBtn: 'Sunucuya bağlanılıyor...',
      switchLoginText: 'Zaten hesabınız var mı?',
      switchLoginAction: 'Buradan giriş yapın',
      switchRegisterText: 'Henüz hesabınız yok mu?',
      switchRegisterAction: 'Kayıt olun',
    },
    pl: {
      tabRegister: 'Rejestracja',
      tabLogin: 'Logowanie',
      badge: 'ODDSPIRA QUANT SECURITY · BEZPIECZNE KONTO',
      registerTitle: 'Utwórz konto w',
      loginTitle: 'Zaloguj się do',
      verifyTitle: 'Potwierdź e-mail w',
      forgotTitle: 'Resetowanie hasła w',
      subText:
        'Synchronizuj swoje zakłady +EV i budżet na wszystkich urządzeniach oraz otrzymuj powiadomienia o wartości.',
      nameLabel: 'Imię / Nick',
      namePlaceholder: 'Twoje imię',
      emailLabel: 'Adres e-mail',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Hasło (min. 6 znaków)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Utwórz Darmowe Konto →',
      loginBtn: 'Zaloguj się →',
      verifyBtn: 'Potwierdź E-mail i Aktywuj Konto →',
      verifyCodeLabel: 'Kod weryfikacyjny (np. OSP-89F42A)',
      resendCodeBtn: 'Wyślij nowy kod',
      forgotLink: 'Nie pamiętasz hasła?',
      sendCodeBtn: 'Wyślij kod na e-mail →',
      resetBtn: 'Zapisz nowe hasło →',
      tokenLabel: 'Kod bezpieczeństwa (np. OSP-89F42A)',
      newPassLabel: 'Nowe hasło (min. 6 znaków)',
      loadingBtn: 'Łączenie z serwerem...',
      switchLoginText: 'Masz już konto?',
      switchLoginAction: 'Zaloguj się tutaj',
      switchRegisterText: 'Nie masz jeszcze konta?',
      switchRegisterAction: 'Zarejestruj się',
    },
    el: {
      tabRegister: 'Εγγραφή',
      tabLogin: 'Σύνδεση',
      badge: 'ODDSPIRA QUANT SECURITY · ΑΣΦΑΛΗΣ ΛΟΓΑΡΙΑΣΜΟΣ',
      registerTitle: 'Δημιουργία λογαριασμού στο',
      loginTitle: 'Σύνδεση στο λογαριασμό σας στο',
      verifyTitle: 'Επαλήθευση email στο',
      forgotTitle: 'Ανάκτηση κωδικού στο',
      subText:
        'Συγχρονίστε τα +EV στοιχήματα και την κάβα σας σε όλες τις συσκευές.',
      nameLabel: 'Όνομα / Ψευδώνυμο',
      namePlaceholder: 'Το όνομά σας',
      emailLabel: 'Διεύθυνση Email',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Κωδικός (τουλ. 6 χαρακτήρες)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Δημιουργία Δωρεάν Λογαριασμού →',
      loginBtn: 'Σύνδεση →',
      verifyBtn: 'Επαλήθευση Email & Ενεργοποίηση →',
      verifyCodeLabel: 'Κωδικός επαλήθευσης (π.χ. OSP-89F42A)',
      resendCodeBtn: 'Αποστολή νέου κωδικού',
      forgotLink: 'Ξεχάσατε τον κωδικό;',
      sendCodeBtn: 'Αποστολή κωδικού στο email →',
      resetBtn: 'Αποθήκευση νέου κωδικού →',
      tokenLabel: 'Κωδικός ασφαλείας (π.χ. OSP-89F42A)',
      newPassLabel: 'Νέος κωδικός (τουλ. 6 χαρακτήρες)',
      loadingBtn: 'Σύνδεση με διακομιστή...',
      switchLoginText: 'Έχετε ήδη λογαριασμό;',
      switchLoginAction: 'Συνδεθείτε εδώ',
      switchRegisterText: 'Δεν έχετε λογαριασμό;',
      switchRegisterAction: 'Εγγραφείτε',
    },
    ro: {
      tabRegister: 'Înregistrare',
      tabLogin: 'Autentificare',
      badge: 'ODDSPIRA QUANT SECURITY · CONT SECURIZAT',
      registerTitle: 'Creează un cont pe',
      loginTitle: 'Autentifică-te pe',
      verifyTitle: 'Verifică emailul pe',
      forgotTitle: 'Resetare parolă pe',
      subText:
        'Sincronizează pariurile +EV și banca pe toate dispozitivele și primește alerte de valoare.',
      nameLabel: 'Nume / Pseudonim',
      namePlaceholder: 'Numele tău',
      emailLabel: 'Adresă de email',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Parolă (min. 6 caractere)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Creează Cont Gratuit →',
      loginBtn: 'Intră în Cont →',
      verifyBtn: 'Verifică Email și Activează Cont →',
      verifyCodeLabel: 'Cod de verificare (ex. OSP-89F42A)',
      resendCodeBtn: 'Trimite cod nou',
      forgotLink: 'Ai uitat parola?',
      sendCodeBtn: 'Trimite cod pe email →',
      resetBtn: 'Salvează noua parolă →',
      tokenLabel: 'Cod de securitate (ex. OSP-89F42A)',
      newPassLabel: 'Parolă nouă (min. 6 caractere)',
      loadingBtn: 'Conectare la server...',
      switchLoginText: 'Ai deja un cont?',
      switchLoginAction: 'Autentifică-te aici',
      switchRegisterText: 'Nu ai încă un cont?',
      switchRegisterAction: 'Înregistrează-te',
    },
    ru: {
      tabRegister: 'Регистрация',
      tabLogin: 'Вход',
      badge: 'ODDSPIRA QUANT SECURITY · ЗАЩИЩЕННЫЙ АККАУНТ',
      registerTitle: 'Создать аккаунт в',
      loginTitle: 'Войти в аккаунт',
      verifyTitle: 'Подтвердите email в',
      forgotTitle: 'Восстановление пароля в',
      subText:
        'Синхронизируйте свои +EV ставки и банкролл между всеми устройствами и получайте уведомления о перевесе.',
      nameLabel: 'Имя / Никнейм',
      namePlaceholder: 'Ваше имя',
      emailLabel: 'Электронная почта',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Пароль (мин. 6 символов)',
      passwordPlaceholder: '••••••••',
      registerBtn: 'Создать бесплатный аккаунт →',
      loginBtn: 'Войти в профиль →',
      verifyBtn: 'Подтвердить email и активировать →',
      verifyCodeLabel: 'Код подтверждения из письма (напр. OSP-89F42A)',
      resendCodeBtn: 'Отправить новый код',
      forgotLink: 'Забыли пароль?',
      sendCodeBtn: 'Отправить код на email →',
      resetBtn: 'Сохранить новый пароль →',
      tokenLabel: 'Код восстановления (напр. OSP-89F42A)',
      newPassLabel: 'Новый пароль (мин. 6 символов)',
      loadingBtn: 'Подключение к серверу...',
      switchLoginText: 'Уже есть аккаунт?',
      switchLoginAction: 'Войти здесь',
      switchRegisterText: 'Еще нет аккаунта?',
      switchRegisterAction: 'Зарегистрироваться',
    },
  };

  const t = (dict as Record<string, typeof dict.en>)[language] || dict.en;

  const handleResendCode = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.demoCodePreview) setVerifyCode(data.demoCodePreview);
        setInfoMessage(data.message || 'Изпратихме нов код на вашия имейл.');
      } else {
        setErrorMessage(data.error || 'Грешка при повторно изпращане.');
      }
    } catch {
      setErrorMessage('Няма връзка със сървъра.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'verify') {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            code: verifyCode.trim(),
          }),
        });
        const data = await res.json();
        setIsSubmitting(false);
        if (!res.ok) {
          setErrorMessage(data.error || 'Невалиден код за потвърждение.');
          return;
        }
        onAuthSuccess(data.user, data.token, true);
        setPassword('');
        setVerifyCode('');
        onClose();
        return;
      }

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

      if (data.requiresVerification) {
        setIsSubmitting(false);
        if (data.demoCodePreview) {
          setVerifyCode(data.demoCodePreview);
        }
        setInfoMessage(data.message || 'Въведете кода за потвърждение от вашия имейл.');
        setMode('verify');
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
                mode === 'register' || mode === 'verify'
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
                : mode === 'verify'
                ? t.verifyTitle
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

            {mode !== 'reset' && mode !== 'verify' && (
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

            {mode === 'verify' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-mono text-[#8f9cae] mb-1">
                    {t.verifyCodeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="OSP-XXXXXX"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="w-full bg-[#080d14] border border-[#43f08a]/50 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#43f08a] focus:outline-none tracking-wider"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#8f9cae] truncate max-w-[230px]">{email}</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[#43f08a] hover:underline cursor-pointer"
                  >
                    ↻ {t.resendCodeBtn}
                  </button>
                </div>
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
                  : mode === 'verify'
                  ? t.verifyBtn
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
