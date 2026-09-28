import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  X,
  ShieldAlert,
  Volume2,
  Users,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';
import { User, SecurityAlert } from '../types';
import { StorageManager } from '../utils/storage';
import { playSecurityAlarmSiren } from '../utils/soundHelper';

interface SuperAdminSecurityAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  usersList: User[];
  initialTargetUserId?: string;
}

export const SuperAdminSecurityAlertModal: React.FC<SuperAdminSecurityAlertModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  usersList,
  initialTargetUserId
}) => {
  const [activeAlert, setActiveAlert] = useState<SecurityAlert | null>(null);
  const [targetScope, setTargetScope] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [title, setTitle] = useState('PERINGATAN PELANGGARAN KEAMANAN APLIKASI');
  const [message, setMessage] = useState(
    'Terdeteksi aktivitas yang melanggar aturan penggunaan dan kebijakan keamanan sistem aplikasi gereja. Segera hentikan tindakan tersebut atau akun Anda akan dibekukan oleh Administrator.'
  );
  const [severity, setSeverity] = useState<'CRITICAL' | 'WARNING'>('CRITICAL');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    const syncAlert = () => {
      setActiveAlert(StorageManager.getSecurityAlert());
    };

    if (isOpen) {
      syncAlert();
      setFeedback('');
      if (initialTargetUserId) {
        setTargetScope('SPECIFIC');
        setSelectedUser(initialTargetUserId);
      }
    }

    window.addEventListener('cms_security_alert_changed', syncAlert);
    window.addEventListener('cms_data_changed', syncAlert);
    return () => {
      window.removeEventListener('cms_security_alert_changed', syncAlert);
      window.removeEventListener('cms_data_changed', syncAlert);
    };
  }, [isOpen, initialTargetUserId]);

  if (!isOpen) return null;

  const handleTestSound = () => {
    playSecurityAlarmSiren(2500);
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Judul dan pesan peringatan tidak boleh kosong.');
      return;
    }

    let targetUserId = 'ALL';
    let targetUsername = 'ALL';

    if (targetScope === 'SPECIFIC' && selectedUser) {
      const u = usersList.find((usr) => usr.user_id === selectedUser);
      if (u) {
        targetUserId = u.user_id;
        targetUsername = u.username;
      }
    }

    const newAlert: SecurityAlert = {
      id: `SEC-ALERT-${Date.now()}`,
      active: true,
      title: title.trim(),
      message: message.trim(),
      sender: currentUser.nama || currentUser.username || 'SuperAdmin',
      sender_user_id: currentUser.user_id,
      sender_username: currentUser.username,
      created_at: new Date().toLocaleString('id-ID'),
      severity,
      target_user_id: targetUserId,
      target_username: targetUsername
    };

    StorageManager.saveSecurityAlert(newAlert);
    setActiveAlert(newAlert);
    StorageManager.logActivity(
      currentUser.username,
      `Menerbitkan Peringatan Keamanan Alarm: "${title}" untuk ${targetUsername}`,
      'Security System'
    );

    // Play preview siren
    playSecurityAlarmSiren(3000);

    setFeedback('Peringatan kartu merah dan alarm darurat berhasil dikirim ke seluruh layar pengguna!');
    setTimeout(() => {
      setFeedback('');
    }, 4000);
  };

  const handleRevokeAlert = () => {
    StorageManager.revokeSecurityAlert(currentUser.nama || currentUser.username || 'SuperAdmin');
    setActiveAlert(null);
    StorageManager.logActivity(
      currentUser.username,
      'Mencabut dan menghentikan status Peringatan Keamanan Sistem di Cloud dan seluruh perangkat',
      'Security System'
    );
    setFeedback('Peringatan keamanan telah berhasil dicabut dan alarm dihentikan di server Cloud & semua perangkat!');
    setTimeout(() => {
      setFeedback('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-rose-600/60 rounded-3xl shadow-2xl shadow-rose-950/60 p-5 sm:p-7 text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Kirim Peringatan Keamanan &amp; Alarm
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30">
                  SuperAdmin Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kirim kartu merah dengan segitiga peringatan berkedip dan alarm bunyi darurat di layar pengguna.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Aktif Saat Ini */}
        {activeAlert && activeAlert.active && !activeAlert.revoked ? (
          <div className="my-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-600/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>STATUS: PERINGATAN DARURAT SEDANG AKTIF DI LAYAR PENGGUNA</span>
              </div>
              <button
                onClick={handleRevokeAlert}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Hentikan &amp; Tarik Alarm Sekarang</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>
                <strong className="text-white">Judul: </strong>
                {activeAlert.title}
              </div>
              <div>
                <strong className="text-white">Sasaran: </strong>
                {activeAlert.target_username === 'ALL'
                  ? 'Semua Pengguna Aplikasi'
                  : `@${activeAlert.target_username}`}
              </div>
              <div>
                <strong className="text-white">Pesan: </strong>
                <span className="italic text-rose-200">{activeAlert.message}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Status: Tidak ada alarm darurat aktif di sistem saat ini.</span>
            </div>
            <button
              type="button"
              onClick={handleRevokeAlert}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
              title="Kirim sinyal pencabutan paksa ke Firestore & seluruh perangkat jika ada alarm yang tersisa"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Bersihkan/Tarik Sisa Alarm di Cloud</span>
            </button>
          </div>
        )}

        {feedback && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Form Pembuatan / Pengiriman Peringatan */}
        <form onSubmit={handleSendAlert} className="space-y-4 pt-4">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Sasaran Pengguna Penerima Peringatan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTargetScope('ALL');
                  setSelectedUser('');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  targetScope === 'ALL'
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Semua Pengguna</div>
                  <div className="text-[10px] text-slate-400">Siarkan ke seluruh perangkat</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('SPECIFIC')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  targetScope === 'SPECIFIC'
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Pengguna Spesifik</div>
                  <div className="text-[10px] text-slate-400">Pilih satu akun tertentu</div>
                </div>
              </button>
            </div>
          </div>

          {targetScope === 'SPECIFIC' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Pilih Akun yang Melanggar:
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="">-- Pilih Akun Pengguna --</option>
                {usersList
                  .filter((u) => u.username !== 'superadmin' && u.user_id !== currentUser.user_id)
                  .map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.nama} (@{u.username}) - {u.role} ({u.tenant_id || 'CHURCH-001'})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Preset Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Template Cepat Jenis Pelanggaran:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('PERINGATAN ATURAN KEAMANAN: AKSES ILEGAL');
                  setMessage(
                    'Peringatan Keamanan: Terdeteksi percobaan manipulasi data atau percobaan akses tanpa izin. Akses Anda sedang dipantau oleh Super Administrator.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
              >
                Percobaan Akses Ilegal
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('PERINGATAN: PELANGGARAN ETIKA & SPAM');
                  setMessage(
                    'Peringatan Sistem: Ditemukan aktivitas spam atau pengiriman pesan yang melanggar norma di ruang komunitas gereja. Harap patuhi aturan penggunaan aplikasi.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
              >
                Spam / Chat Kasar
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('PERINGATAN KEAMANAN: AKUN DISUSPENSI JIKA BERLANJUT');
                  setMessage(
                    'Pemberitahuan Resmi: Anda terindikasi melanggar ketentuan keamanan aplikasi. Jika pelanggaran berlanjut dalam 1x24 jam, akun Anda akan dinonaktifkan permanen.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
              >
                Ancaman Pembekuan Akun
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Judul Peringatan (Tampil di Header Kartu Merah)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: PERINGATAN PELANGGARAN KEAMANAN"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Isi Pesan Peringatan Resmi
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Jelaskan alasan pelanggaran aturan keamanan secara tegas..."
              required
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          {/* Sound Preview & Visual Note */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Info className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Kartu merah akan muncul di tengah layar pengguna dengan <strong>segitiga merah berkedip</strong> &amp; <strong>bunyi alarm darurat</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={handleTestSound}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tes Bunyi Alarm</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Batal / Tutup
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/40 transition cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Peringatan &amp; Bunyikan Alarm Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
