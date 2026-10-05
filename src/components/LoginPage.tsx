import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, AppSettings } from '../types';
import { StorageManager } from '../utils/storage';
import { pullAllFromCloud } from '../utils/firebaseSync';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  settings: AppSettings;
  onLoginSuccess: (user: User, freshSettings?: AppSettings) => void;
  onClose?: () => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  settings,
  onLoginSuccess,
  onClose
}) => {
  // Credentials start empty & protected (no automatic exposure of accounts)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Prevent horizontal overflow while allowing smooth inner scroll on mobile screens
  useEffect(() => {
    const origBodyOverflowX = document.body.style.overflowX;
    const origHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflowX = origBodyOverflowX;
      document.documentElement.style.overflowX = origHtmlOverflowX;
    };
  }, []);

  // Silently pull all latest users & church configurations from cloud on mount
  useEffect(() => {
    pullAllFromCloud().catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. Pull latest accounts and church configurations from cloud immediately before matching
      await pullAllFromCloud();
    } catch {
      // offline fallback
    }

    const users = StorageManager.getUsers();
    const inputName = username.trim().toLowerCase();
    const inputPass = password.trim();

    const found = users.find((u) => {
      if (!u || !u.username) return false;

      const cleanUsername = u.username.trim().toLowerCase();
      const cleanEmail = (u.email && typeof u.email === 'string') ? u.email.trim().toLowerCase() : '';
      const cleanNama = (u.nama && typeof u.nama === 'string') ? u.nama.trim().toLowerCase() : '';

      // Exact match on username, email, or exact full name
      const matchesName =
        cleanUsername === inputName ||
        (cleanEmail !== '' && cleanEmail === inputName) ||
        (cleanNama !== '' && cleanNama === inputName);

      const rawPass = (u.password_hash !== undefined && u.password_hash !== null && String(u.password_hash).trim() !== '')
        ? String(u.password_hash).trim()
        : (u.role === 'JEMAAT' ? 'jemaat123' : 'admin123');

      return matchesName && rawPass === inputPass;
    });

    if (found) {
      if (found.status === 'Nonaktif') {
        setErrorMessage('Akun Anda dinonaktifkan oleh Administrator.');
        setIsLoading(false);
        return;
      }

      const historyId = StorageManager.recordLogin(found.username);
      StorageManager.logActivity(found.username, 'Login ke sistem CMS Pro', 'Auth');

      // Switch active tenant to target church
      const rawTenant = (found.tenant_id && found.tenant_id !== 'ALL') ? found.tenant_id : 'CHURCH-001';
      const targetTenantId = rawTenant === 'CHURCH-004' ? 'CHURCH-001' : rawTenant;
      found.tenant_id = targetTenantId;
      StorageManager.setActiveTenantId(targetTenantId);

      // Ensure user has jemaat_id linked from the correct church
      if (found.role === 'JEMAAT' && !found.jemaat_id) {
        const allJemaat = StorageManager.getJemaat();
        const match = allJemaat.find(
          (j) =>
            (j.nama_lengkap && found.nama && j.nama_lengkap.toLowerCase().trim() === found.nama.toLowerCase().trim()) ||
            (j.email && found.email && j.email.toLowerCase().trim() === found.email.toLowerCase().trim())
        );
        if (match) {
          found.jemaat_id = match.jemaat_id;
        }
      }

      // Save logged in user state
      StorageManager.saveCurrentUser(found);
      (window as any).__cms_history_id = historyId;

      // 2. Ensure all data & settings for the active tenant are 100% pulled from cloud
      try {
        await pullAllFromCloud();
      } catch {
        // offline fallback
      }

      const freshSettings = StorageManager.getSettings();

      // Immediately sync theme CSS variables globally before transition
      const customHex = (freshSettings?.warna_tema || '#0d9488').trim();
      if (/^#[0-9A-F]{6}$/i.test(customHex) || /^#[0-9A-F]{3}$/i.test(customHex)) {
        document.documentElement.style.setProperty('--theme-custom-primary', customHex);
        document.documentElement.style.setProperty('--theme-custom-border', `${customHex}90`);
        document.documentElement.style.setProperty('--theme-custom-bg-alpha', `${customHex}18`);
      }

      setIsLoading(false);
      onLoginSuccess(found, freshSettings);
    } else {
      setErrorMessage('Username/Email atau Password tidak cocok. Silakan periksa kembali.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSent(false);
      setResetEmail('');
      alert(`Instruksi reset password telah dikirimkan ke email: ${resetEmail}`);
    }, 1000);
  };

  return (
    <div
      id="app-container"
      className="fixed inset-0 w-screen h-[100dvh] flex flex-col justify-between items-center bg-gradient-to-br from-slate-50 via-teal-50/50 to-emerald-50/30 p-2 sm:p-4 md:p-6 text-slate-800 overflow-y-auto select-none"
    >
      {/* Background Soft Teal Ambient Lights */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Dot Grid */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0d9488 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header Bar with Back Button & Church Status */}
      <header className="w-full max-w-4xl flex items-center justify-between py-1.5 sm:py-2 shrink-0 relative z-20 px-1 sm:px-0">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ touchAction: 'manipulation' }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-teal-600" />
            <span>Kembali ke Halaman</span>
          </button>
        )}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 border border-teal-200/80 text-teal-900 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Informasi Gereja</span>
        </div>
      </header>

      {/* Main Glassmorphism Login Container (Fills Full Height on Mobile) */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center items-center relative z-10 px-0 sm:px-1 my-1 sm:my-auto min-h-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full sm:h-auto flex-1 sm:flex-initial flex flex-col md:grid md:grid-cols-12 rounded-2xl sm:rounded-3xl bg-white border border-teal-100/90 shadow-xl shadow-teal-950/10 overflow-hidden"
        >
          {/* Left Column: Church Identity in Rich Teal Gradient (Desktop & Tablet) */}
          <div className="hidden md:flex md:col-span-5 p-6 lg:p-7 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Church Logo & Info */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-teal-300/40 shrink-0">
                  <img
                    src={settings.logo || DEFAULT_CHURCH_LOGO}
                    alt="Logo Gereja"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                    }}
                    className="w-full h-full object-cover rounded-[10px]"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-black text-white tracking-tight leading-snug truncate">
                    {(settings.nama_gereja && settings.nama_gereja !== 'Gereja Baru') ? settings.nama_gereja : 'Monapa Puriala'}
                  </h1>
                  <p className="text-[10px] uppercase tracking-wider text-teal-200 font-bold mt-0.5">
                    Sistem Informasi Gereja
                  </p>
                </div>
              </div>

              <p className="text-teal-100/90 text-xs leading-relaxed font-normal">
                Sistem informasi terpadu pelayanan jemaat, warta ibadah, persembahan, dan administrasi gereja.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-1 text-xs text-white/95">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span>Portal Jemaat Mandiri &amp; Warta Ibadah</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span>Ruang Chat Komunitas &amp; Pesan Pribadi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span>Laporan Keuangan Transparan &amp; Akurat</span>
                </div>
              </div>
            </div>

            {/* Security Banner */}
            <div className="p-3 rounded-xl bg-teal-900/60 border border-teal-400/30 text-teal-100 text-[11px] flex items-center gap-2 relative z-10 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Koneksi aman terenkripsi &amp; terlindungi.</span>
            </div>
          </div>

          {/* Mobile Top Church Branding Banner (Expanded & High Impact) */}
          <div className="md:hidden p-4 sm:p-5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center gap-3.5 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-36 h-36 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md border border-teal-300/40 shrink-0">
              <img
                src={settings.logo || DEFAULT_CHURCH_LOGO}
                alt="Logo Gereja"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                }}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight truncate">
                {(settings.nama_gereja && settings.nama_gereja !== 'Gereja Baru') ? settings.nama_gereja : 'Monapa Puriala'}
              </h1>
              <p className="text-[11px] uppercase tracking-wider text-teal-200 font-bold mt-0.5">
                Sistem Informasi Gereja
              </p>
              <p className="text-[10px] text-teal-100/90 truncate mt-0.5">
                Portal Pelayanan &amp; Warta Jemaat
              </p>
            </div>
          </div>

          {/* Form Column: Clean White, Spacious, Enlarged Inputs & Buttons */}
          <div className="md:col-span-7 p-4 sm:p-6 lg:p-7 flex-1 flex flex-col justify-center space-y-4 bg-white overflow-y-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Masuk ke Akun
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                Silakan masukkan username/email dan password Anda.
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <p>{errorMessage}</p>
              </motion.div>
            )}

            {/* Form Input Fields with Comfortable Touch Height */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                  Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600/70" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username atau email..."
                    style={{ touchAction: 'manipulation' }}
                    className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-3 focus:ring-teal-500/15 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600/70" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password akun..."
                    style={{ touchAction: 'manipulation' }}
                    className="w-full pl-10 sm:pl-11 pr-11 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-3 focus:ring-teal-500/15 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ touchAction: 'manipulation' }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ touchAction: 'manipulation' }}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/40 cursor-pointer accent-teal-600"
                  />
                  <span className="font-medium">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  style={{ touchAction: 'manipulation' }}
                  className="text-teal-700 hover:text-teal-900 font-bold transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Primary Submit Button (Large & Comfortable) */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ touchAction: 'manipulation' }}
                className="w-full mt-2 py-3.5 sm:py-4 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile Bottom Security Pill */}
            <div className="md:hidden pt-2">
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-teal-900 text-xs font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Koneksi aman &amp; terlindungi sistem gereja</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer copyright (Compact) */}
      <footer className="w-full max-w-4xl py-1 text-center text-[10px] sm:text-[11px] text-slate-500 shrink-0 relative z-10">
        {settings.nama_gereja} &copy; 2026. Hak Cipta Dilindungi Undang-Undang.
      </footer>

      {/* Forgot Password Modal (Teal & White) */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white border border-teal-200 p-5 shadow-2xl text-slate-800 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>Lupa Password Akun</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  Tutup
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan email Anda yang terdaftar pada sistem gereja. Instruksi pemulihan kata sandi akan dikirimkan ke email tersebut.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{ touchAction: 'manipulation' }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-3 focus:ring-teal-500/10 font-medium"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    style={{ touchAction: 'manipulation' }}
                    className="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetSent}
                    style={{ touchAction: 'manipulation' }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shadow-teal-600/20"
                  >
                    {resetSent ? 'Mengirim...' : 'Kirim Instruksi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

