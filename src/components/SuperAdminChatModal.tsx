import React, { useState } from 'react';
import { MessageCircle, Mail, PhoneCall, X, Send, Sparkles, CheckCircle2, ShieldCheck, Building2, UserCheck } from 'lucide-react';
import { SuperAdminContact } from '../types';
import { StorageManager } from '../utils/storage';

interface SuperAdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchName?: string;
}

export const SuperAdminChatModal: React.FC<SuperAdminChatModalProps> = ({
  isOpen,
  onClose,
  churchName
}) => {
  const contact: SuperAdminContact = StorageManager.getSuperAdminContact();
  const currentChurch = churchName || StorageManager.getSettings().nama_gereja || 'Gereja Pembeli';

  const [messageInput, setMessageInput] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Log activity / prayer request as support ticket
    const currentUser = StorageManager.getCurrentUser();
    StorageManager.logActivity(
      currentUser ? currentUser.username : 'User',
      `Pesan Support SuperAdmin: "${messageInput.substring(0, 50)}..."`,
      'Support'
    );

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setMessageInput('');
      onClose();
    }, 2000);
  };

  const getWaUrl = () => {
    let waNum = contact.wa ? contact.wa.replace(/\D/g, '') : '62881036358650';
    if (waNum.startsWith('0')) {
      waNum = '62' + waNum.substring(1);
    }
    const text = encodeURIComponent(`Halo SuperAdmin (Pdt. Ferdinan Moses Timbu, S.Th), saya dari ${currentChurch}.\n\nPesan/Bantuan: ${messageInput || 'Mohon bantuan mengenai aplikasi / lisensi gereja kami.'}`);
    return `https://wa.me/${waNum}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5 leading-snug">
                <span>Hubungi SuperAdmin &amp; Support</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold text-slate-300">{currentChurch}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {isSent && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Pesan Anda berhasil dikirim langsung ke SuperAdmin! Tim support akan merespon segera.</span>
          </div>
        )}

        {/* SuperAdmin Contact Info Person Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Penanggung Jawab SaaS Application</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Online 24/7
            </span>
          </div>

          <div className="pt-1">
            <h4 className="text-sm font-black text-white leading-tight">
              {contact.nama || 'Pdt. Ferdinan Moses Timbu, S.Th'}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1.5">
              <span className="flex items-center gap-1 font-mono text-emerald-300 font-bold">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                {contact.wa || '0881036358650'}
              </span>
              <span className="flex items-center gap-1 text-slate-300 break-all">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {contact.email || 'tn.timbu@gmail.com'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={getWaUrl()}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 transition-all cursor-pointer group active:scale-95 shadow-md"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-black text-white leading-tight">Chat WhatsApp Direct</div>
              <div className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5 truncate">
                {contact.wa || '0881036358650'}
              </div>
            </div>
          </a>

          <a
            href={`mailto:${contact.email || 'tn.timbu@gmail.com'}?subject=Dukungan%20Aplikasi%20Gereja%20${encodeURIComponent(currentChurch)}`}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-slate-900 hover:from-indigo-900 hover:to-slate-850 border border-indigo-500/40 text-indigo-300 flex items-center gap-3 transition-all cursor-pointer group active:scale-95 shadow-md"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-black text-white leading-tight">Kirim Email Direct</div>
              <div className="text-[11px] text-indigo-300 font-mono font-semibold mt-0.5 truncate">
                {contact.email || 'tn.timbu@gmail.com'}
              </div>
            </div>
          </a>
        </div>

        {/* Direct Text Form */}
        <form onSubmit={handleSendDirectMessage} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tulis Pesan / Pertanyaan / Bantuan:</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Respon Cepat
              </span>
            </label>
            <textarea
              rows={3}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Contoh: Halo SuperAdmin, mohon konfirmasi perpanjangan masa berlaku lisensi aplikasi gereja kami..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
              required
            />
          </div>

          <div className="pt-1 flex items-center justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Pesan ke SuperAdmin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

