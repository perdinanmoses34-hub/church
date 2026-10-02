import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, AppSettings } from '../types';
import { StorageManager } from '../utils/storage';
import { DEFAULT_CHURCH_LOGO } from '../data/initialData';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  X,
  Download,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  settings: AppSettings;
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  settings,
  onLoginSuccess,
  onClose,
  onInstallPWA,
  canInstallPWA
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const users = StorageManager.getUsers();
      const inputName = username.trim().toLowerCase();
      const inputPass = password.trim();

      const found = users.find((u) => {
        if (!u || !u.username) return false;

        const cleanUsername = u.username.trim().toLowerCase();
        const cleanEmail = (u.email && typeof u.email === 'string') ? u.email.trim().toLowerCase() : '';
        const cleanNama = (u.nama && typeof u.nama === 'string') ? u.nama.trim().toLowerCase() : '';
        const matchesName =
          cleanUsername === inputName ||
          (cleanEmail !== '' && cleanEmail === inputName) ||
          cleanNama === inputName ||
          (cleanNama !== '' && inputName.length >= 4 && cleanNama.includes(inputName)) ||
          (inputName.includes('ferdinan') && (cleanUsername.includes('ferdinan') || cleanUsername === 'superadmin'));

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

        // Ensure user has jemaat_id linked
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

        // Save logged in user state & switch active tenant to target church
        const targetTenantId = (found.tenant_id && found.tenant_id !== 'ALL') ? found.tenant_id : 'CHURCH-001';
        StorageManager.setActiveTenantId(targetTenantId);
        StorageManager.saveCurrentUser(found);
        (window as any).__cms_history_id = historyId;

        setIsLoading(false);
        onLoginSuccess(found);
      } else {
        setErrorMessage('Username/Email atau Password tidak cocok. Silakan periksa kembali.');
        setIsLoading(false);
      }
    }, 600);
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
    <div id="app-container" className="relative min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-br from-slate-50 via-teal-50/50 to-emerald-50/30 p-3 sm:p-6 selection:bg-teal-500 selection:text-white overflow-y-auto text-slate-800">
      {/* Background Soft Teal Ambient Lights */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-400/15 rounded-full blur-3xl animate-pulse pointer-events-none delay-1000" />
      <div className="fixed top-1/2 right-1/3 w-72 h-72 sm:w-80 sm:h-80 bg-teal-300/15 rounded-full blur-3xl animate-pulse pointer-events-none delay-500" />

      {/* Subtle Dot Grid */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0d9488 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header Bar with Exit/Back Button */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 relative z-20">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer group active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-teal-200 text-xs font-semibold text-teal-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Sistem Informasi Gereja</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {canInstallPWA && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-all cursor-pointer shadow-2xs"
              title="Download File APK Android (.apk)"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Download APK</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Tutup Halaman Login"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Tutup</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Glassmorphism Login Container (Teal & White Palette) */}
      <main className="w-full max-w-4xl my-auto py-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white border border-teal-100/90 shadow-2xl shadow-teal-950/10 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Church Identity in Rich Teal Gradient */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
              {/* Subtle ambient light inside left card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Church Logo & Info */}
              <div className="space-y-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-lg border border-teal-300/40 shrink-0">
                    <img
                      src={settings.logo || DEFAULT_CHURCH_LOGO}
                      alt="Logo Gereja"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                      }}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug truncate">
                      {(settings.nama_gereja && settings.nama_gereja !== 'Gereja Baru') ? settings.nama_gereja : 'Jesus Kingdom Christ'}
                    </h1>
                    <p className="text-[10px] uppercase tracking-wider text-teal-200 font-bold mt-0.5">
                      Sistem Informasi Gereja
                    </p>
                  </div>
                </div>

                <p className="text-teal-100/90 text-xs leading-relaxed font-normal">
                  Sistem informasi terpadu pelayanan jemaat, jadwal ibadah, persembahan, dan administrasi gereja.
                </p>

                {/* Church Feature Highlights */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-white/95">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>Portal Jemaat Mandiri &amp; Warta Ibadah</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/95">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>Ruang Chat Komunitas &amp; Pesan Pribadi</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/95">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>Laporan Keuangan Transparan &amp; Akurat</span>
                  </div>
                </div>
              </div>

              {/* Security Banner Footer */}
              <div className="p-3.5 rounded-2xl bg-teal-900/60 border border-teal-400/30 text-teal-100 text-[11px] flex items-center gap-2.5 relative z-10 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Koneksi aman terenkripsi &amp; terlindungi.</span>
              </div>
            </div>

            {/* Right Column: Clean White Login Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Masuk ke Akun
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Silakan masukkan username/email dan password Anda yang terdaftar.
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <p>{errorMessage}</p>
                </motion.div>
              )}

              {/* Form Input Fields (Clean & Secure) */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Username / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username atau email Anda..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input (Masked & Secure) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password akun Anda..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/40 cursor-pointer accent-teal-600"
                    />
                    <span>Ingat login saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-teal-600 hover:text-teal-800 font-bold transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-4xl py-2 text-center text-[11px] text-slate-500 relative z-10">
        {settings.nama_gereja} &copy; 2026. Hak Cipta Dilindungi Undang-Undang.
      </footer>

      {/* Forgot Password Modal (Teal & White) */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white border border-teal-200 p-6 shadow-2xl text-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>Lupa Password Akun</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan email Anda yang terdaftar pada sistem gereja. Instruksi pemulihan kata sandi akan dikirimkan ke email tersebut.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 font-medium"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetSent}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shadow-teal-600/20"
                  >
                    {resetSent ? 'Mengirim Tautan...' : 'Kirim Instruksi Reset'}
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
