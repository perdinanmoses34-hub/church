import React from 'react';
import { ShieldAlert, MessageCircle, Mail, PhoneCall, LogIn, Lock, Calendar, AlertTriangle } from 'lucide-react';
import { ChurchTenant, SuperAdminContact } from '../types';
import { StorageManager } from '../utils/storage';

interface TenantLockedScreenProps {
  tenant: ChurchTenant | null;
  reason: 'NONAKTIF' | 'KADALUARSA' | 'DIBLOKIR' | 'NONE';
  message: string;
  onOpenLogin: () => void;
}

export const TenantLockedScreen: React.FC<TenantLockedScreenProps> = ({
  tenant,
  reason,
  message,
  onOpenLogin
}) => {
  const contact: SuperAdminContact = StorageManager.getSuperAdminContact();
  const churchName = tenant ? tenant.nama_gereja : 'Aplikasi Gereja';

  const formatWaUrl = () => {
    let waNum = contact.wa ? contact.wa.replace(/\D/g, '') : '62881036358650';
    if (waNum.startsWith('0')) {
      waNum = '62' + waNum.substring(1);
    }
    const rawMsg = contact.pesan_default || 'Halo SuperAdmin (Pdt. Ferdinan Moses Timbu, S.Th), saya dari %NAMA_GEREJA% ingin konfirmasi pembayaran lisensi aplikasi & aktivasi akun.';
    const formattedMsg = encodeURIComponent(rawMsg.replace('%NAMA_GEREJA%', churchName));
    return `https://wa.me/${waNum}?text=${formattedMsg}`;
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#090d16]/95 backdrop-blur-xl animate-fade-in text-white overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 my-auto">
        {/* Top Glow Background */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Shield Icon */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
            <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-extrabold text-xs tracking-wide uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Akses Aplikasi Dinonaktifkan / Kadaluarsa</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">{churchName}</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
            {message || 'Lisensi penggunaan aplikasi ini telah berakhir atau dinonaktifkan sementara oleh SuperAdmin. Silahkan lakukan perpanjangan langganan untuk membuka kembali.'}
          </p>
        </div>

        {/* Status Details Card */}
        {tenant && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs relative z-10">
            <div className="flex items-center justify-between text-slate-400">
              <span>Status Lisensi Akun:</span>
              <span className={`font-black px-2.5 py-0.5 rounded-md text-[11px] ${
                reason === 'DIBLOKIR' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {reason === 'DIBLOKIR' ? 'DIBLOKIR / SUSPENDED' : reason === 'KADALUARSA' ? 'EXPIRED / KADALUARSA' : 'NONAKTIF'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Tanggal Batas Masa Berlaku:
              </span>
              <span className="font-mono font-bold text-slate-200">{tenant.tanggal_kadaluarsa || 'Kadaluarsa'}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Kode Tenant / Id Gereja:</span>
              <span className="font-mono font-bold text-amber-300">{tenant.kode_unik} ({tenant.tenant_id})</span>
            </div>
          </div>
        )}

        {/* Direct Contact SuperAdmin Options */}
        <div className="space-y-3 relative z-10 pt-2 border-t border-slate-800/80">
          <p className="text-xs font-bold text-center text-slate-300">
            Hubungi SuperAdmin / Support Billing untuk Aktivasi Kembali:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={formatWaUrl()}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200 fill-current group-hover:scale-110 transition-transform" />
              <span>Chat WhatsApp SuperAdmin</span>
            </a>

            <a
              href={`mailto:${contact.email || 'tn.timbu@gmail.com'}?subject=Aktivasi%20Lisensi%20Aplikasi%20${encodeURIComponent(churchName)}`}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-200 font-extrabold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Kirim Email Support</span>
            </a>
          </div>

          {/* SuperAdmin Contact Person Card */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Penanggung Jawab SaaS Application:</span>
              <p className="font-bold text-white">{contact.nama || 'Pdt. Ferdinan Moses Timbu, S.Th'}</p>
              <p className="text-[11px] text-slate-300 font-mono">WA: {contact.wa || '0881036358650'} &bull; {contact.email || 'tn.timbu@gmail.com'}</p>
            </div>
            <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 ml-2" />
          </div>
        </div>

        {/* Option for SuperAdmin Login */}
        <div className="pt-2 text-center relative z-10">
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer border border-slate-700"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Login sebagai SuperAdmin (Unblock / Kelola Lisensi)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
