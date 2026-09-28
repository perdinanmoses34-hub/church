import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  ShieldCheck,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Trash2,
  Edit,
  Search,
  MessageCircle,
  Mail,
  DollarSign,
  Globe,
  Settings,
  X,
  ExternalLink,
  ShieldAlert,
  Save,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { ChurchTenant, ChurchStatus, User, SuperAdminContact } from '../types';
import { StorageManager } from '../utils/storage';
import { confirmDialog } from '../utils/confirmDialog';
import { SuperAdminSecurityAlertModal } from './SuperAdminSecurityAlertModal';

interface SuperAdminSaaSPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTenant: (tenantId: string) => void;
}

export const SuperAdminSaaSPanel: React.FC<SuperAdminSaaSPanelProps> = ({
  isOpen,
  onClose,
  onSelectTenant
}) => {
  const [tenants, setTenants] = useState<ChurchTenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>('CHURCH-001');
  const [superAdminContact, setSuperAdminContact] = useState<SuperAdminContact>({
    nama: '',
    wa: '',
    email: '',
    pesan_default: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal / Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSecurityAlertModalOpen, setIsSecurityAlertModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<ChurchTenant | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // New Tenant Form State
  const [newTenantData, setNewTenantData] = useState({
    nama_gereja: '',
    kode_unik: '',
    admin_username: '',
    admin_password: 'admin123',
    admin_nama: '',
    admin_email: '',
    admin_wa: '',
    alamat: '',
    status: 'AKTIF' as ChurchStatus,
    tanggal_kadaluarsa: '2027-12-31',
    paket_langganan: 'PRO_SAAS_ANNUAL' as ChurchTenant['paket_langganan'],
    harga_sewa: 'Rp 2.500.000 / Tahun',
    catatan_admin: '',
    apk_download_url: ''
  });

  const loadData = () => {
    const list = StorageManager.getTenants();
    setTenants(list);
    setActiveTenantId(StorageManager.getActiveTenantId());
    setSuperAdminContact(StorageManager.getSuperAdminContact());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handler for Switching Church Context
  const handleSwitchChurch = (tenantId: string) => {
    StorageManager.setActiveTenantId(tenantId);
    setActiveTenantId(tenantId);
    onSelectTenant(tenantId);
    setSuccessMessage(`Berhasil beralih ke ruang kerja gereja: ${tenantId}`);
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  // Handler for Updating Church Status
  const handleUpdateStatus = (tenantId: string, newStatus: ChurchStatus, expDate?: string) => {
    StorageManager.updateChurchTenantStatus(tenantId, newStatus, expDate);
    loadData();
    setSuccessMessage(`Status lisensi ${tenantId} diperbarui menjadi: ${newStatus}`);
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  // Handler for Creating New Buyer Church Tenant
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.nama_gereja || !newTenantData.admin_username) return;

    const newTenantId = `CHURCH-${String(tenants.length + 1).padStart(3, '0')}`;
    const newTenantObj: ChurchTenant = {
      tenant_id: newTenantId,
      nama_gereja: newTenantData.nama_gereja,
      kode_unik: newTenantData.kode_unik || `G-0${tenants.length + 1}`,
      admin_username: newTenantData.admin_username,
      admin_nama: newTenantData.admin_nama,
      admin_email: newTenantData.admin_email,
      admin_wa: newTenantData.admin_wa,
      alamat: newTenantData.alamat,
      status: newTenantData.status,
      tanggal_pendaftaran: new Date().toISOString().split('T')[0],
      tanggal_kadaluarsa: newTenantData.tanggal_kadaluarsa,
      paket_langganan: newTenantData.paket_langganan,
      harga_sewa: newTenantData.harga_sewa,
      catatan_admin: newTenantData.catatan_admin,
      apk_download_url: newTenantData.apk_download_url || ''
    };

    const adminUser: User = {
      user_id: `USR-ADM-${Date.now().toString().slice(-4)}`,
      username: newTenantData.admin_username,
      password_hash: newTenantData.admin_password || 'admin123',
      nama: newTenantData.admin_nama || `Admin ${newTenantData.nama_gereja}`,
      role: 'ADMIN',
      email: newTenantData.admin_email,
      no_hp: newTenantData.admin_wa,
      status: 'Aktif',
      created_at: new Date().toISOString(),
      tenant_id: newTenantId
    };

    StorageManager.createChurchTenant(newTenantObj, adminUser);
    loadData();
    setIsAddModalOpen(false);
    setNewTenantData({
      nama_gereja: '',
      kode_unik: '',
      admin_username: '',
      admin_password: 'admin123',
      admin_nama: '',
      admin_email: '',
      admin_wa: '',
      alamat: '',
      status: 'AKTIF',
      tanggal_kadaluarsa: '2027-12-31',
      paket_langganan: 'PRO_SAAS_ANNUAL',
      harga_sewa: 'Rp 2.500.000 / Tahun',
      catatan_admin: ''
    });
    setSuccessMessage(`Akun Gereja Baru "${newTenantObj.nama_gereja}" berhasil didaftarkan! Akun admin "${newTenantObj.admin_username}" telah disinkronkan dan semua data gereja baru disiapkan kosong & bersih.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handler for Saving SuperAdmin Contact Settings
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    StorageManager.saveSuperAdminContact(superAdminContact);
    setSuccessMessage('Pengaturan Kontak SuperAdmin & Support Billing berhasil disimpan!');
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  // Filtered Tenants List
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.nama_gereja.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.kode_unik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.admin_nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = tenants.filter((t) => t.status === 'AKTIF').length;
  const lockedCount = tenants.filter((t) => t.status === 'DIBLOKIR' || t.status === 'KADALUARSA' || t.status === 'NONAKTIF').length;

  return (
    <div className="fixed inset-0 z-[9980] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto relative">
        
        {/* Top Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-purple-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Panel SuperAdmin SaaS Multi-Gereja</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                  MASTER CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Kelola akun gereja pembeli, lisensi sewa, tanggal kadaluarsa, blokir akun, dan ruang kerja terisolasi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* SaaS Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Gereja Pembeli</span>
            <div className="text-2xl font-black text-white">{tenants.length} Akun</div>
            <p className="text-[10px] text-slate-400">Terdaftar dalam sistem SaaS</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Lisensi Aktif</span>
            <div className="text-2xl font-black text-emerald-300">{activeCount} Gereja</div>
            <p className="text-[10px] text-emerald-400/80">Akses berjalan penuh</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Kadaluarsa / Terkunci</span>
            <div className="text-2xl font-black text-rose-300">{lockedCount} Gereja</div>
            <p className="text-[10px] text-rose-400/80">Menunggu pembayaran</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Gereja Aktif Saat Ini</span>
            <div className="text-sm font-extrabold text-indigo-200 truncate">
              {StorageManager.getActiveTenant()?.nama_gereja || 'Gereja Utama'}
            </div>
            <p className="text-[10px] font-mono text-amber-300">Tenant ID: {activeTenantId}</p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama gereja, kode unik, atau admin..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Hanya AKTIF</option>
              <option value="KADALUARSA">Hanya KADALUARSA</option>
              <option value="DIBLOKIR">Hanya DIBLOKIR</option>
              <option value="NONAKTIF">Hanya NONAKTIF</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSecurityAlertModalOpen(true)}
              className="py-2.5 px-3.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-400/40 shrink-0"
              title="Kirim Kartu Warning Merah & Alarm Darurat kepada Pengguna yang Melanggar Aturan Keamanan"
            >
              <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
              <span>Kirim Warning Merah &amp; Alarm</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Akun Gereja Baru</span>
            </button>
          </div>
        </div>

        {/* Buyer Church Tenants Table */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Gereja &amp; Kode Tenant</th>
                  <th className="p-3.5">Status Lisensi</th>
                  <th className="p-3.5">Tanggal Kadaluarsa</th>
                  <th className="p-3.5">Admin Utama</th>
                  <th className="p-3.5">Paket &amp; Harga</th>
                  <th className="p-3.5 text-center">Aksi / Switch Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                      Tidak ada data gereja pembeli yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((item) => {
                    const isCurrent = item.tenant_id === activeTenantId;
                    const isLocked = item.status === 'DIBLOKIR' || item.status === 'KADALUARSA' || item.status === 'NONAKTIF';

                    return (
                      <tr key={item.tenant_id} className={`hover:bg-slate-900/50 transition-colors ${isCurrent ? 'bg-indigo-950/30' : ''}`}>
                        
                        {/* Church Info */}
                        <td className="p-3.5">
                          <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            <span>{item.nama_gereja}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px]">
                                SELEKSI SAAT INI
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span className="text-amber-400 font-bold">{item.kode_unik}</span>
                            <span>&bull;</span>
                            <span>ID: {item.tenant_id}</span>
                          </div>
                          {item.alamat && (
                            <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">{item.alamat}</p>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                              item.status === 'AKTIF'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : item.status === 'DIBLOKIR'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : item.status === 'KADALUARSA'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.status === 'AKTIF' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            {item.status === 'DIBLOKIR' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                            {item.status === 'KADALUARSA' && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{item.status}</span>
                          </span>
                        </td>

                        {/* Expiration Date */}
                        <td className="p-3.5 font-mono text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{item.tanggal_kadaluarsa || 'Seumur Hidup'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Pendaftaran: {item.tanggal_pendaftaran}
                          </div>
                        </td>

                        {/* Admin Contact */}
                        <td className="p-3.5">
                          <div className="font-bold text-white">{item.admin_nama}</div>
                          <div className="text-[11px] text-indigo-300 font-mono">User: @{item.admin_username}</div>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            {item.admin_wa && (
                              <a
                                href={`https://wa.me/${item.admin_wa.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WA</span>
                              </a>
                            )}
                            {item.admin_email && (
                              <a
                                href={`mailto:${item.admin_email}`}
                                className="text-slate-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Email</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Subscription Plan */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-200">{item.paket_langganan}</div>
                          <div className="text-[10px] font-mono text-emerald-400">{item.harga_sewa || 'Rp 2.500.000'}</div>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Switch Access Button */}
                            <button
                              onClick={() => handleSwitchChurch(item.tenant_id)}
                              className={`py-1.5 px-3 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-md ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-indigo-600/80 hover:bg-indigo-500 text-white'
                              }`}
                              title="Masuk & Kelola Ruang Kerja Gereja Ini"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{isCurrent ? 'Aktif' : 'Kelola'}</span>
                            </button>

                            {/* Status Quick Toggle Dropdown */}
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateStatus(item.tenant_id, e.target.value as ChurchStatus)}
                              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-200 outline-none cursor-pointer"
                              title="Ubah Status Lisensi"
                            >
                              <option value="AKTIF">Set AKTIF</option>
                              <option value="KADALUARSA">Set KADALUARSA</option>
                              <option value="DIBLOKIR">Set DIBLOKIR</option>
                              <option value="NONAKTIF">Set NONAKTIF</option>
                            </select>

                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingTenant(item)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950 text-slate-400 hover:text-indigo-300 border border-slate-800 transition-all cursor-pointer"
                              title="Edit Detail / Nama Gereja"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={async () => {
                                const ok = await confirmDialog({
                                  title: 'Hapus Akun Gereja',
                                  message: `Hapus akun gereja "${item.nama_gereja}"?`,
                                  confirmText: 'Ya, Hapus',
                                  cancelText: 'Batal',
                                  isDanger: true,
                                });
                                if (ok) {
                                  StorageManager.deleteChurchTenant(item.tenant_id);
                                  loadData();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-all cursor-pointer"
                              title="Hapus Akun Gereja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SuperAdmin Support Contact Configuration Section */}
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Pengaturan Kontak Direct SuperAdmin (Untuk Tombol Support &amp; Bantuan Pembeli)</h3>
          </div>

          <form onSubmit={handleSaveContact} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Nama SuperAdmin:</label>
              <input
                type="text"
                value={superAdminContact.nama}
                onChange={(e) => setSuperAdminContact({ ...superAdminContact, nama: e.target.value })}
                placeholder="Pdt. Ferdinan Moses Timbu, S.Th"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Nomor WhatsApp Support:</label>
              <input
                type="text"
                value={superAdminContact.wa}
                onChange={(e) => setSuperAdminContact({ ...superAdminContact, wa: e.target.value })}
                placeholder="0881036358650"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Email SuperAdmin:</label>
              <input
                type="email"
                value={superAdminContact.email}
                onChange={(e) => setSuperAdminContact({ ...superAdminContact, email: e.target.value })}
                placeholder="tn.timbu@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kontak SuperAdmin</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CREATE NEW TENANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Buat Akun Gereja Pembeli Baru</h3>
                  <p className="text-xs text-slate-400">Sistem akan mengisolasi penuh data gereja ini dan membuatkan akun admin utamanya.</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Gereja Pembeli *</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.nama_gereja}
                    onChange={(e) => setNewTenantData({ ...newTenantData, nama_gereja: e.target.value })}
                    placeholder="Contoh: Gereja Bethel Indonesia Grace"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kode Unik Tenant (Kode Singkatan)</label>
                  <input
                    type="text"
                    value={newTenantData.kode_unik}
                    onChange={(e) => setNewTenantData({ ...newTenantData, kode_unik: e.target.value.toUpperCase() })}
                    placeholder="Contoh: GBI-GC01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Username Admin Gereja *</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.admin_username}
                    onChange={(e) => setNewTenantData({ ...newTenantData, admin_username: e.target.value })}
                    placeholder="admin_gbigrace"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password Default Admin *</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.admin_password}
                    onChange={(e) => setNewTenantData({ ...newTenantData, admin_password: e.target.value })}
                    placeholder="admin123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Lengkap Admin Utama</label>
                  <input
                    type="text"
                    value={newTenantData.admin_nama}
                    onChange={(e) => setNewTenantData({ ...newTenantData, admin_nama: e.target.value })}
                    placeholder="Pdt. Andreas Widodo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nomor WhatsApp Admin</label>
                  <input
                    type="text"
                    value={newTenantData.admin_wa}
                    onChange={(e) => setNewTenantData({ ...newTenantData, admin_wa: e.target.value })}
                    placeholder="081311223344"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Email Admin / Sekretariat</label>
                  <input
                    type="email"
                    value={newTenantData.admin_email}
                    onChange={(e) => setNewTenantData({ ...newTenantData, admin_email: e.target.value })}
                    placeholder="admin@gbigrace.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Alamat Gedung Gereja</label>
                  <input
                    type="text"
                    value={newTenantData.alamat}
                    onChange={(e) => setNewTenantData({ ...newTenantData, alamat: e.target.value })}
                    placeholder="Jl. Boulevard Raya M3 No. 12, Kelapa Gading"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Kadaluarsa Lisensi *</label>
                  <input
                    type="date"
                    required
                    value={newTenantData.tanggal_kadaluarsa}
                    onChange={(e) => setNewTenantData({ ...newTenantData, tanggal_kadaluarsa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Awal Lisensi</label>
                  <select
                    value={newTenantData.status}
                    onChange={(e) => setNewTenantData({ ...newTenantData, status: e.target.value as ChurchStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="AKTIF">AKTIF (Langsung Dapat Diakses)</option>
                    <option value="NONAKTIF">NONAKTIF (Belum Aktif)</option>
                    <option value="KADALUARSA">KADALUARSA (Expired)</option>
                    <option value="DIBLOKIR">DIBLOKIR (Terkunci)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Paket Langganan</label>
                  <select
                    value={newTenantData.paket_langganan}
                    onChange={(e) => setNewTenantData({ ...newTenantData, paket_langganan: e.target.value as ChurchTenant['paket_langganan'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="PRO_SAAS_ANNUAL">PRO SaaS Annual (Tahunan)</option>
                    <option value="ENTERPRISE_LIFETIME">Enterprise Lifetime</option>
                    <option value="BASIC_MONTHLY">Basic Starter (Bulanan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Harga Sewa / Catatan Biaya</label>
                  <input
                    type="text"
                    value={newTenantData.harga_sewa}
                    onChange={(e) => setNewTenantData({ ...newTenantData, harga_sewa: e.target.value })}
                    placeholder="Rp 2.500.000 / Tahun"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Link File .APK Google Drive Khusus Gereja Ini (Opsional)</label>
                  <input
                    type="url"
                    value={newTenantData.apk_download_url}
                    onChange={(e) => setNewTenantData({ ...newTenantData, apk_download_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aktifkan Akun Gereja</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Existing Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Edit Data Akun Gereja Pembeli</h3>
                  <p className="text-xs text-slate-400">
                    Satu Perubahan Nama Gereja di sini otomatis mensinkronkan seluruh sistem &amp; pengaturan admin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingTenant) return;
                StorageManager.updateChurchTenantDetails(editingTenant);
                loadData();
                setEditingTenant(null);
                setSuccessMessage(`Data Gereja "${editingTenant.nama_gereja}" berhasil diperbarui!`);
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Nama Resmi Gereja Pembeli *</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.nama_gereja}
                    onChange={(e) => setEditingTenant({ ...editingTenant, nama_gereja: e.target.value })}
                    placeholder="Contoh: SYSTEM MANAGEMENT CHURCH / GKI Kebayoran"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kode Unik Tenant</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.kode_unik}
                    onChange={(e) => setEditingTenant({ ...editingTenant, kode_unik: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Admin Utama</label>
                  <input
                    type="text"
                    value={editingTenant.admin_nama}
                    onChange={(e) => setEditingTenant({ ...editingTenant, admin_nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nomor WhatsApp Admin</label>
                  <input
                    type="text"
                    value={editingTenant.admin_wa || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, admin_wa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Admin / Sekretariat</label>
                  <input
                    type="email"
                    value={editingTenant.admin_email || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, admin_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Alamat Gereja</label>
                  <input
                    type="text"
                    value={editingTenant.alamat || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, alamat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Kadaluarsa Lisensi</label>
                  <input
                    type="date"
                    value={editingTenant.tanggal_kadaluarsa || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, tanggal_kadaluarsa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Lisensi</label>
                  <select
                    value={editingTenant.status}
                    onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value as ChurchStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                    <option value="KADALUARSA">KADALUARSA</option>
                    <option value="DIBLOKIR">DIBLOKIR</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-emerald-400 font-bold mb-1 flex items-center justify-between">
                    <span>Link File .APK Google Drive Khusus Gereja Ini</span>
                    <span className="text-[10px] text-slate-400 font-normal">Isolasi Penuh</span>
                  </label>
                  <input
                    type="url"
                    value={editingTenant.apk_download_url || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, apk_download_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Setiap akun gereja memiliki link APK Google Drive masing-masing sehingga jemaat dan pengurus hanya mendownload APK gereja mereka sendiri.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Kirim Warning Merah & Alarm Darurat */}
      <SuperAdminSecurityAlertModal
        isOpen={isSecurityAlertModalOpen}
        onClose={() => setIsSecurityAlertModalOpen(false)}
        currentUser={
          StorageManager.getCurrentUser() || {
            user_id: 'USR-SUPERADMIN',
            username: 'superadmin',
            role: 'SUPER_ADMIN',
            nama: 'Super Administrator'
          }
        }
        usersList={StorageManager.getUsers()}
      />
    </div>
  );
};
