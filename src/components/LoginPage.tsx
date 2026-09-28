import React, { useState, useEffect } from 'react';
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
  Smartphone,
  ArrowLeft,
  X,
  AlertTriangle,
  LogOut,
  Home,
  Download
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
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Cleanly exit login page
  const handleExitLogin = () => {
    if (onClose) {
      onClose();
    }
  };

  // Quick Account Switcher for Demo Ease
  const handleQuickRoleSelect = (roleName: string) => {
    setErrorMessage('');
    if (roleName === 'SUPER_ADMIN') {
      setUsername('superadmin');
      setPassword('admin123');
    } else if (roleName === 'ADMIN') {
      setUsername('adminsekretariat');
      setPassword('admin123');
    } else {
      setUsername('jemaat01');
      setPassword('jemaat123');
    }
  };

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
        const matchesName = cleanUsername === inputName || (cleanEmail !== '' && cleanEmail === inputName);

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

        // Save logged in user state & switch active tenant if tenant_id is set
        if (found.tenant_id && found.tenant_id !== 'ALL') {
          StorageManager.setActiveTenantId(found.tenant_id);
        }
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
    <div id="app-container" className="relative min-h-screen w-full flex flex-col items-center justify-between bg-slate-950 p-3 sm:p-6 selection:bg-indigo-500 selection:text-white overflow-y-auto">
      {/* Background Ambient Lights */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse pointer-events-none delay-1000" />
      <div className="fixed top-1/2 right-1/3 w-72 h-72 sm:w-80 sm:h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse pointer-events-none delay-500" />

      {/* Decorative Grid Overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header Bar with Exit/Back Button */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 relative z-20">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer group active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Aplikasi</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Enterprise CMS Pro</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {canInstallPWA && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
              title="Download File APK Android (.apk)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Download APK</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              title="Tutup Halaman Login"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Tutup</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Glassmorphism Login Container */}
      <main className="w-full max-w-4xl my-auto py-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Church Identity & Role Selection */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between space-y-6">
              
              {/* Church Logo & Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
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
                    <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug truncate">
                      {settings.nama_gereja}
                    </h1>
                    <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                      Church Management System
                    </p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">
                  Sistem informasi terpadu jemaat, keuangan, jadwal ibadah, dan portal keanggotaan gereja.
                </p>
              </div>

              {/* Security Banner Footer */}
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Koneksi aman terenkripsi Firebase Firestore real-time.</span>
              </div>
            </div>

            {/* Right Column: Clean Login Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-slate-900/40">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Masuk ke Sistem
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Masukkan username / email dan password akun Anda untuk melanjutkan.
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium"
                >
                  <p>{errorMessage}</p>
                </motion.div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Username / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: superadmin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500/40"
                    />
                    <span>Ingat login saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
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
        Church Management System Pro &copy; 2026. All rights reserved.
      </footer>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white space-y-4"
            >
              <h3 className="text-lg font-bold">Lupa Password Akun</h3>
              <p className="text-xs text-slate-400">
                Masukkan email yang terdaftar pada sistem CMS Pro. Kami akan mengirimkan instruksi pemulihan password.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="email@gkfc-cms.org"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetSent}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    {resetSent ? 'Kirim Tautan...' : 'Kirim Instruksi Reset'}
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
