import {
  User,
  Jemaat,
  Keluarga,
  Wilayah,
  Pelayanan,
  Baptisan,
  Sidi,
  Pernikahan,
  Persembahan,
  Donasi,
  KasPengeluaran,
  Doa,
  Pengumuman,
  Renungan,
  EventSchedule,
  GalleryItem,
  NotificationItem,
  AppSettings,
  ActivityLog,
  LoginHistory,
  PrayerRequest,
  FeaturedVideo,
  EventReservation,
  ChurchTenant,
  ChurchStatus,
  SuperAdminContact,
  ChatMessage,
  HymnSong,
  SecurityAlert
} from '../types';

import {
  initialSettings,
  initialUsers,
  initialJemaat,
  initialKeluarga,
  initialWilayah,
  initialPelayanan,
  initialBaptisan,
  initialSidi,
  initialPernikahan,
  initialPersembahan,
  initialDonasi,
  initialPengumuman,
  initialRenungan,
  initialEvents,
  initialGallery,
  initialNotifications,
  initialActivityLogs,
  initialLoginHistory,
  initialPrayerRequests,
  initialFeaturedVideos,
  initialTenants,
  initialSuperAdminContact,
  initialChatMessages
} from '../data/initialData';

import { INITIAL_HYMN_SONGS } from '../data/hymnsData';

import { pushToCloud, initRealtimeCloudSync, pushSecurityAlertRevocation } from './firebaseSync';
import { stopSecurityAlarmSiren } from './soundHelper';

const KEYS = {
  TENANTS: 'cms_pro_saas_tenants',
  ACTIVE_TENANT: 'cms_pro_active_tenant_id',
  SUPERADMIN_CONTACT: 'cms_pro_superadmin_contact',
  SETTINGS: 'cms_pro_settings',
  USERS: 'cms_pro_users',
  JEMAAT: 'cms_pro_jemaat',
  KELUARGA: 'cms_pro_keluarga',
  WILAYAH: 'cms_pro_wilayah',
  PELAYANAN: 'cms_pro_pelayanan',
  BAPTISAN: 'cms_pro_baptisan',
  SIDI: 'cms_pro_sidi',
  PERNIKAHAN: 'cms_pro_pernikahan',
  PERSEMBAHAN: 'cms_pro_persembahan',
  DONASI: 'cms_pro_donasi',
  KAS_PENGELUARAN: 'cms_pro_kas_pengeluaran',
  DOA: 'cms_pro_doa',
  PENGUMUMAN: 'cms_pro_pengumuman',
  RENUNGAN: 'cms_pro_renungan',
  EVENTS: 'cms_pro_events',
  GALLERY: 'cms_pro_gallery',
  FEATURED_VIDEOS: 'cms_pro_featured_videos',
  NOTIFICATIONS: 'cms_pro_notifications',
  ACTIVITY_LOGS: 'cms_pro_activity_logs',
  LOGIN_HISTORY: 'cms_pro_login_history',
  PRAYER_REQUESTS: 'cms_pro_prayer_requests',
  EVENT_RESERVATIONS: 'cms_pro_event_reservations',
  CURRENT_USER: 'cms_pro_current_user',
  CHAT_MESSAGES: 'cms_pro_chat_messages',
  HYMN_SONGS: 'cms_pro_hymn_songs',
  FAVORITE_SONGS: 'cms_pro_favorite_songs',
  FAVORITE_VERSES: 'cms_pro_favorite_verses',
  KOMISI: 'cms_pro_komisi',
  SECURITY_ALERT: 'cms_pro_security_alert'
};

const defaultKomisi: string[] = [
  'Komisi Pria (Bapa)',
  'Komisi Wanita (WBI)',
  'Komisi Pemuda (Youth)',
  'Komisi Remaja',
  'Komisi Anak (Sekolah Minggu)'
];

const defaultKas: KasPengeluaran[] = [
  {
    kas_id: 'KAS-2026-001',
    tanggal: '2026-07-26',
    kategori: 'Biaya Operasional & Listrik',
    jumlah: 3250000,
    tipe: 'Pengeluaran',
    keterangan: 'Pembayaran Rekening PLN & AC Gedung Utama',
    pic: 'Dkn. Samuel Santoso'
  },
  {
    kas_id: 'KAS-2026-002',
    tanggal: '2026-07-20',
    kategori: 'Maintenance Sound System',
    jumlah: 1850000,
    tipe: 'Pengeluaran',
    keterangan: 'Perbaikan Mixer Digital Yamaha & Kabel Stage',
    pic: 'Ev. Joshua Tan'
  }
];

const defaultDoa: Doa[] = [
  {
    doa_id: 'DOA-2026-001',
    nama_pemohon: 'Bpk. Yohanes Pratama',
    kategori: 'Kesehatan & Kesembuhan',
    isi_permohonan: 'Mohon dukungan doa untuk pemulihan kesehatan Ibu Ruth pasca operasi.',
    tanggal: '2026-07-27',
    status: 'Proses Doa'
  },
  {
    doa_id: 'DOA-2026-002',
    nama_pemohon: 'Daniel Pratama',
    kategori: 'Pekerjaan & Usaha',
    isi_permohonan: 'Mohon hikmat Tuhan dalam sidang skripsi akhir bulan ini.',
    tanggal: '2026-07-25',
    status: 'Dijawab'
  }
];

export function normalizeTenantId(raw: any): string {
  if (!raw || typeof raw !== 'string') return 'CHURCH-001';
  const cleaned = raw.replace(/^[\\"'`]+|[\\"'`]+$/g, '').trim();
  return cleaned || 'CHURCH-001';
}

function getTenantScopedKey(baseKey: string, specificTenantId?: string): string {
  if (
    baseKey === KEYS.TENANTS ||
    baseKey === KEYS.ACTIVE_TENANT ||
    baseKey === KEYS.SUPERADMIN_CONTACT ||
    baseKey === KEYS.CURRENT_USER ||
    baseKey === KEYS.USERS
  ) {
    return baseKey;
  }

  let activeId = specificTenantId;
  if (!activeId && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(KEYS.ACTIVE_TENANT);
      if (raw) {
        try {
          activeId = JSON.parse(raw);
        } catch {
          activeId = raw;
        }
      }
    } catch {
      // ignore
    }
  }
  activeId = normalizeTenantId(activeId);

  if (!activeId || activeId === 'CHURCH-001' || activeId === 'ALL') {
    return baseKey;
  }

  return `cms_pro_${activeId}_${baseKey.replace('cms_pro_', '')}`;
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const scopedKey = getTenantScopedKey(key);
    const item = localStorage.getItem(scopedKey);
    if (!item) {
      // CRITICAL MULTI-TENANT ISOLATION:
      // If we are querying a tenant-scoped key for a non-default church (scopedKey !== key),
      // NEVER fallback to the demo data of CHURCH-001! Return empty array [] for data collections.
      if (scopedKey !== key) {
        if (key === KEYS.SETTINGS) {
          const parts = scopedKey.split('_');
          const tenantId = normalizeTenantId(parts[2] || 'CHURCH-001');
          const tenants = getItem<ChurchTenant[]>(KEYS.TENANTS, initialTenants);
          const matchedTenant = tenants.find((t) => t.tenant_id === tenantId);
          return {
            ...initialSettings,
            nama_gereja: matchedTenant?.nama_gereja || 'Gereja Baru',
            email: matchedTenant?.admin_email || '',
            telepon: matchedTenant?.admin_wa || '',
            alamat: matchedTenant?.alamat || '',
            rekening_bank_nama: '',
            rekening_bank_nomor: '',
            rekening_bank_atas_nama: matchedTenant?.nama_gereja || '',
            qris_image_url: '',
            apk_download_url: matchedTenant?.apk_download_url || ''
          } as unknown as T;
        }
        if (Array.isArray(fallback) && key !== KEYS.HYMN_SONGS) {
          return [] as unknown as T;
        }
      }
      return fallback;
    }
    try {
      return JSON.parse(item);
    } catch (parseErr) {
      if (typeof fallback === 'string') {
        return item as unknown as T;
      }
      return fallback;
    }
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

// Realtime synchronization channel & pub/sub listeners for instant sync
type StorageListener = () => void;
const internalListeners = new Set<StorageListener>();

function notifyStorageListeners() {
  internalListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error in storage listener:', e);
    }
  });
}

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('cms_realtime_sync_channel');
    syncChannel.onmessage = (event) => {
      if (typeof window !== 'undefined') {
        notifyStorageListeners();
        window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: event.data }));
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel initialization fallback:', e);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('cms_pro_')) {
      notifyStorageListeners();
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { key: e.key } }));
    }
  });
}

// Multi-Tenant Isolation Data Scrubber: runs on startup to guarantee 100% clean isolation
function sanitizeTenantDataIsolation(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    // 1. Purge corrupted keys containing quotes or invalid characters
    const corruptedKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.includes('"') || k.includes('\\') || k.includes("'"))) {
        corruptedKeys.push(k);
      }
    }
    corruptedKeys.forEach((k) => localStorage.removeItem(k));

    // 2. Sanitize ACTIVE_TENANT key
    const rawActive = localStorage.getItem(KEYS.ACTIVE_TENANT);
    if (rawActive) {
      const cleanActive = normalizeTenantId(rawActive);
      localStorage.setItem(KEYS.ACTIVE_TENANT, JSON.stringify(cleanActive));
    }

    const rawTenants = localStorage.getItem(KEYS.TENANTS);
    if (!rawTenants) return;
    const tenants: ChurchTenant[] = JSON.parse(rawTenants);

    // 3. Sanitize USERS: Ensure every user in cms_pro_users has a tenant_id
    const rawUsers = localStorage.getItem(KEYS.USERS);
    if (rawUsers) {
      try {
        const users: User[] = JSON.parse(rawUsers);
        let usersChanged = false;
        const sanitizedUsers = users.map((u) => {
          if (!u.tenant_id || u.tenant_id.trim() === '') {
            usersChanged = true;
            return {
              ...u,
              tenant_id: (u.role === 'SUPER_ADMIN' || u.username?.toLowerCase() === 'superadmin') ? 'ALL' : 'CHURCH-001'
            };
          }
          return u;
        });
        if (usersChanged) {
          localStorage.setItem(KEYS.USERS, JSON.stringify(sanitizedUsers));
        }
      } catch (err) {
        // ignore
      }
    }

    // 4. For any tenant other than CHURCH-001, purge any accidentally copied demo records
    tenants.forEach((t) => {
      if (t.tenant_id && t.tenant_id !== 'CHURCH-001') {
        const jemaatKey = `cms_pro_${t.tenant_id}_jemaat`;
        const rawJemaat = localStorage.getItem(jemaatKey);
        if (rawJemaat) {
          try {
            const jList = JSON.parse(rawJemaat);
            if (Array.isArray(jList) && jList.some((j) => j.nik === '3171011508850001' || j.nama_lengkap === 'Bpk. Yohanes Pratama')) {
              localStorage.setItem(jemaatKey, JSON.stringify([]));
            }
          } catch (e) {}
        }

        const keuanganKey = `cms_pro_${t.tenant_id}_persembahan`;
        const rawKeuangan = localStorage.getItem(keuanganKey);
        if (rawKeuangan) {
          try {
            const kList = JSON.parse(rawKeuangan);
            if (Array.isArray(kList) && kList.some((k) => k.kategori === 'Kolekte Umum' && k.keterangan?.includes('Ibadah Raya 1 Sunter'))) {
              localStorage.setItem(keuanganKey, JSON.stringify([]));
            }
          } catch (e) {}
        }

        // Clean settings banking info for new churches
        const settingsKey = `cms_pro_${t.tenant_id}_settings`;
        const rawSettings = localStorage.getItem(settingsKey);
        if (rawSettings) {
          try {
            const s = JSON.parse(rawSettings);
            let sChanged = false;
            if (s.rekening_bank_nomor === '527-089-1122' || (s.rekening_bank_atas_nama && s.rekening_bank_atas_nama.includes('Kemenangan Faith'))) {
              s.rekening_bank_nama = '';
              s.rekening_bank_nomor = '';
              s.rekening_bank_atas_nama = t.nama_gereja || 'Jesus Kingdom Christ';
              s.qris_image_url = '';
              sChanged = true;
            }
            // Isolate APK link: prevent other churches from inheriting CHURCH-001's default APK drive link
            if (t.tenant_id !== 'CHURCH-001') {
              if (s.apk_download_url && (s.apk_download_url.includes('1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h') || s.apk_download_url.includes('1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s'))) {
                s.apk_download_url = t.apk_download_url || '';
                sChanged = true;
              }
            }
            if (sChanged) {
              localStorage.setItem(settingsKey, JSON.stringify(s));
            }
          } catch (e) {}
        }
      }
    });

    // Clean up any remaining legacy "Gereja Kemenangan Faith Center" references in stored tenants and root settings
    let tenantsModified = false;
    const sanitizedTenants = tenants.map((t) => {
      if (t.nama_gereja && t.nama_gereja.includes('Kemenangan Faith')) {
        tenantsModified = true;
        return {
          ...t,
          nama_gereja: 'Jesus Kingdom Christ',
          kode_unik: 'JKC-01',
          admin_email: 'admin@jesuskingdomchrist.org'
        };
      }
      return t;
    });
    if (tenantsModified) {
      localStorage.setItem(KEYS.TENANTS, JSON.stringify(sanitizedTenants));
    }

    const rawRootSettings = localStorage.getItem(KEYS.SETTINGS);
    if (rawRootSettings) {
      try {
        const s = JSON.parse(rawRootSettings);
        let sChanged = false;
        if (s.nama_gereja && s.nama_gereja.includes('Kemenangan Faith')) {
          s.nama_gereja = 'Jesus Kingdom Christ';
          sChanged = true;
        }
        if (s.header_title && s.header_title.includes('Kemenangan Faith')) {
          s.header_title = 'Jesus Kingdom Christ';
          sChanged = true;
        }
        if (s.rekening_bank_atas_nama && s.rekening_bank_atas_nama.includes('Kemenangan Faith')) {
          s.rekening_bank_atas_nama = 'Jesus Kingdom Christ';
          sChanged = true;
        }
        if (s.email === 'info@gkfc-cms.org') {
          s.email = 'info@jesuskingdomchrist.org';
          sChanged = true;
        }
        if (sChanged) {
          localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
        }
      } catch (e) {}
    }

    // 5. Clean up any revoked or inactive security alerts from localStorage
    const rawAlert = localStorage.getItem(KEYS.SECURITY_ALERT);
    if (rawAlert) {
      try {
        const parsedAlert = JSON.parse(rawAlert);
        if (!parsedAlert || parsedAlert.active === false || parsedAlert.revoked === true) {
          localStorage.removeItem(KEYS.SECURITY_ALERT);
        }
      } catch {
        localStorage.removeItem(KEYS.SECURITY_ALERT);
      }
    }
  } catch (e) {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  sanitizeTenantDataIsolation();
}

function setItem<T>(key: string, value: T): void {
  try {
    const scopedKey = getTenantScopedKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));
    if (typeof window !== 'undefined') {
      const payload = { key: scopedKey, baseKey: key, timestamp: Date.now() };
      notifyStorageListeners();
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: payload }));
      if (syncChannel) {
        try {
          syncChannel.postMessage(payload);
        } catch (err) {
          // ignore
        }
      }
      // Push to Firebase Firestore for cross-device real-time sync
      pushToCloud(scopedKey, value);
    }
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Auto-start real-time cloud synchronization across devices
if (typeof window !== 'undefined') {
  initRealtimeCloudSync(() => {
    notifyStorageListeners();
  });
}

function normalizeNoKk(val?: string): string {
  if (!val) return '';
  const clean = val.trim().replace(/[\s.-]/g, '');
  return clean === '-' ? '' : clean;
}

function syncKeluargaFromJemaatWithData(rawKeluarga: Keluarga[], jemaatList: Jemaat[]): Keluarga[] {
  // Index existing metadata by normalized no_kk
  const existingKeluargaMap = new Map<string, Keluarga>();
  (rawKeluarga || []).forEach((k) => {
    if (k && k.no_kk) {
      const norm = normalizeNoKk(k.no_kk);
      if (norm) {
        existingKeluargaMap.set(norm, { ...k });
      }
    }
  });

  // Group active jemaat by normalized no_kk
  // Members sharing the same No. KK belong to the same family (1 KK)
  const jemaatByKk = new Map<string, Jemaat[]>();
  (jemaatList || []).forEach((j) => {
    if (j && j.status !== 'Meninggal') {
      const normKk = normalizeNoKk(j.no_kk);
      const cleanKk = normKk || `KK-IND-${j.jemaat_id}`;
      const existing = jemaatByKk.get(cleanKk) || [];
      existing.push(j);
      jemaatByKk.set(cleanKk, existing);
    }
  });

  const syncedKeluarga: Keluarga[] = [];
  let counter = 1;

  jemaatByKk.forEach((members, cleanKk) => {
    const isIndividual = cleanKk.startsWith('KK-IND-');
    const existing = isIndividual ? undefined : existingKeluargaMap.get(cleanKk);
    
    // Tentukan Kepala Keluarga:
    // Prioritas 1: Kepala keluarga tersimpan sebelumnya
    // Prioritas 2: Anggota laki-laki yang sudah menikah, atau laki-laki dewasa tertua, atau anggota pertama
    const kepalaCandidate = members.find((m) => m.jenis_kelamin === 'Laki-laki' && m.status_pernikahan === 'Menikah')
      || members.find((m) => m.jenis_kelamin === 'Laki-laki')
      || members[0];

    const alamat = existing?.alamat || kepalaCandidate?.alamat || members[0]?.alamat || 'Alamat Jemaat';
    const wilayah = existing?.wilayah || kepalaCandidate?.wilayah || members[0]?.wilayah || 'Wilayah I';

    const keluargaId = existing?.keluarga_id || `KK-${counter.toString().padStart(3, '0')}`;
    counter++;

    const displayNoKk = isIndividual
      ? (existing?.no_kk || '-')
      : (members.find((m) => m.no_kk && m.no_kk.trim())?.no_kk?.trim() || cleanKk);

    syncedKeluarga.push({
      keluarga_id: keluargaId,
      no_kk: displayNoKk,
      kepala_keluarga: (existing && existing.kepala_keluarga && existing.kepala_keluarga !== 'Belum diisi' && existing.kepala_keluarga !== '-') 
        ? existing.kepala_keluarga 
        : (kepalaCandidate?.nama_lengkap || 'Kepala Keluarga'),
      alamat,
      wilayah,
      jumlah_anggota: members.length
    });
  });

  try {
    const scopedKey = getTenantScopedKey(KEYS.KELUARGA);
    localStorage.setItem(scopedKey, JSON.stringify(syncedKeluarga));
  } catch (e) {
    // ignore
  }

  return syncedKeluarga;
}

function syncKeluargaFromJemaat(jemaatList: Jemaat[]): Keluarga[] {
  const rawKeluarga = getItem<Keluarga[]>(KEYS.KELUARGA, initialKeluarga);
  return syncKeluargaFromJemaatWithData(rawKeluarga, jemaatList);
}

export const StorageManager = {
  subscribe: (listener: StorageListener): (() => void) => {
    internalListeners.add(listener);
    return () => {
      internalListeners.delete(listener);
    };
  },

  // --- SaaS Multi-Tenant & Buyer Church Management ---
  getTenants: (): ChurchTenant[] => {
    const tenants = getItem<ChurchTenant[]>(KEYS.TENANTS, initialTenants);
    const activeTenantId = StorageManager.getActiveTenantId();
    const currentSettings = StorageManager.getSettings();

    if (currentSettings && currentSettings.nama_gereja && activeTenantId === 'CHURCH-001') {
      let needsSync = false;
      const syncedTenants = tenants.map((t) => {
        if (t.tenant_id === 'CHURCH-001') {
          if (t.nama_gereja !== currentSettings.nama_gereja) {
            needsSync = true;
            return {
              ...t,
              nama_gereja: currentSettings.nama_gereja,
              ...(currentSettings.email ? { admin_email: currentSettings.email } : {}),
              ...(currentSettings.telepon ? { admin_wa: currentSettings.telepon } : {}),
              ...(currentSettings.alamat ? { alamat: currentSettings.alamat } : {})
            };
          }
        }
        return t;
      });
      if (needsSync) {
        try {
          const scopedKey = getTenantScopedKey(KEYS.TENANTS);
          localStorage.setItem(scopedKey, JSON.stringify(syncedTenants));
        } catch (e) { /* ignore */ }
        return syncedTenants;
      }
    }
    return tenants;
  },
  saveTenants: (tenants: ChurchTenant[]): void => setItem(KEYS.TENANTS, tenants),

  getActiveTenantId: (): string => {
    const raw = getItem<string>(KEYS.ACTIVE_TENANT, 'CHURCH-001');
    return normalizeTenantId(raw);
  },
  setActiveTenantId: (tenantId: string): void => {
    const cleanId = normalizeTenantId(tenantId);
    setItem(KEYS.ACTIVE_TENANT, cleanId);
    notifyStorageListeners();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { key: KEYS.ACTIVE_TENANT, tenantId: cleanId } }));
    }
  },
  getActiveTenant: (): ChurchTenant | null => {
    const activeId = StorageManager.getActiveTenantId();
    const tenants = StorageManager.getTenants();
    return tenants.find((t) => t.tenant_id === activeId) || tenants[0] || null;
  },
  createChurchTenant: (tenant: ChurchTenant, adminAccount?: User): void => {
    const currentTenants = StorageManager.getTenants();
    const cleanTenantId = normalizeTenantId(tenant.tenant_id);
    const cleanTenant: ChurchTenant = {
      ...tenant,
      tenant_id: cleanTenantId
    };
    const updatedTenants = [cleanTenant, ...currentTenants.filter((t) => t.tenant_id !== cleanTenantId)];
    StorageManager.saveTenants(updatedTenants);

    if (adminAccount) {
      const cleanAdmin: User = {
        ...adminAccount,
        tenant_id: cleanTenantId,
        role: 'ADMIN',
        status: cleanTenant.status === 'DIBLOKIR' || cleanTenant.status === 'NONAKTIF' ? 'Nonaktif' : 'Aktif'
      };
      const currentUsers = getItem<User[]>(KEYS.USERS, initialUsers);
      const filteredUsers = currentUsers.filter(
        (u) => u.username.toLowerCase() !== cleanAdmin.username.toLowerCase() && !(u.tenant_id === cleanTenantId && u.role === 'ADMIN')
      );
      setItem(KEYS.USERS, [cleanAdmin, ...filteredUsers]);
    }

    const newChurchSettings: AppSettings = {
      ...initialSettings,
      nama_gereja: cleanTenant.nama_gereja,
      email: cleanTenant.admin_email || '',
      telepon: cleanTenant.admin_wa || '',
      alamat: cleanTenant.alamat || '',
      rekening_bank_nama: '',
      rekening_bank_nomor: '',
      rekening_bank_atas_nama: cleanTenant.nama_gereja,
      qris_image_url: '',
      apk_download_url: cleanTenant.apk_download_url || ''
    };
    const tenantSettingsKey = getTenantScopedKey(KEYS.SETTINGS, cleanTenantId);
    localStorage.setItem(tenantSettingsKey, JSON.stringify(newChurchSettings));

    // Explicitly initialize clean, empty arrays for this tenant's collections to guarantee 100% data isolation
    const isolatedCollectionKeys = [
      KEYS.JEMAAT,
      KEYS.KELUARGA,
      KEYS.WILAYAH,
      KEYS.PELAYANAN,
      KEYS.BAPTISAN,
      KEYS.SIDI,
      KEYS.PERNIKAHAN,
      KEYS.PERSEMBAHAN,
      KEYS.DONASI,
      KEYS.KAS_PENGELUARAN,
      KEYS.DOA,
      KEYS.PENGUMUMAN,
      KEYS.RENUNGAN,
      KEYS.EVENTS,
      KEYS.GALLERY,
      KEYS.NOTIFICATIONS,
      KEYS.ACTIVITY_LOGS,
      KEYS.LOGIN_HISTORY,
      KEYS.PRAYER_REQUESTS,
      KEYS.EVENT_RESERVATIONS,
      KEYS.CHAT_MESSAGES
    ];
    isolatedCollectionKeys.forEach((baseKey) => {
      const tenantKey = getTenantScopedKey(baseKey, cleanTenantId);
      localStorage.setItem(tenantKey, JSON.stringify([]));
    });

    StorageManager.logActivity(
      'SUPER_ADMIN',
      `Membuat Akun Gereja Baru: ${cleanTenant.nama_gereja} (${cleanTenant.kode_unik})`,
      'SaaS'
    );
  },
  updateChurchTenantDetails: (updatedTenant: ChurchTenant): void => {
    const tenants = StorageManager.getTenants();
    const newTenants = tenants.map((t) => (t.tenant_id === updatedTenant.tenant_id ? updatedTenant : t));
    StorageManager.saveTenants(newTenants);

    // Sync to tenant's settings
    const activeTenantId = StorageManager.getActiveTenantId();
    if (updatedTenant.tenant_id === activeTenantId) {
      const currentSettings = StorageManager.getSettings();
      StorageManager.saveSettings({
        ...currentSettings,
        nama_gereja: updatedTenant.nama_gereja,
        email: updatedTenant.admin_email || currentSettings.email,
        telepon: updatedTenant.admin_wa || currentSettings.telepon,
        alamat: updatedTenant.alamat || currentSettings.alamat,
        ...(updatedTenant.apk_download_url !== undefined ? { apk_download_url: updatedTenant.apk_download_url } : {})
      });
    } else {
      const tenantSettingsKey = getTenantScopedKey(KEYS.SETTINGS, updatedTenant.tenant_id);
      try {
        const raw = localStorage.getItem(tenantSettingsKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.nama_gereja = updatedTenant.nama_gereja;
          if (updatedTenant.admin_email) parsed.email = updatedTenant.admin_email;
          if (updatedTenant.admin_wa) parsed.telepon = updatedTenant.admin_wa;
          if (updatedTenant.alamat) parsed.alamat = updatedTenant.alamat;
          if (updatedTenant.apk_download_url !== undefined) parsed.apk_download_url = updatedTenant.apk_download_url;
          localStorage.setItem(tenantSettingsKey, JSON.stringify(parsed));
          pushToCloud(tenantSettingsKey, parsed);
        }
      } catch (err) {
        // ignore
      }
    }
  },
  updateChurchTenantStatus: (tenantId: string, status: ChurchStatus, tanggalKadaluarsa?: string): void => {
    const tenants = StorageManager.getTenants();
    const updated = tenants.map((t) => {
      if (t.tenant_id === tenantId) {
        return {
          ...t,
          status,
          ...(tanggalKadaluarsa ? { tanggal_kadaluarsa: tanggalKadaluarsa } : {})
        };
      }
      return t;
    });
    StorageManager.saveTenants(updated);
    StorageManager.logActivity(
      'SUPER_ADMIN',
      `Mengubah Status Lisensi Gereja ${tenantId} menjadi ${status}`,
      'SaaS'
    );
  },
  deleteChurchTenant: (tenantId: string): void => {
    const tenants = StorageManager.getTenants();
    const updated = tenants.filter((t) => t.tenant_id !== tenantId);
    StorageManager.saveTenants(updated);
  },
  getSuperAdminContact: (): SuperAdminContact => {
    const contact = getItem<SuperAdminContact>(KEYS.SUPERADMIN_CONTACT, initialSuperAdminContact);
    if (!contact || !contact.email || contact.email === 'superadmin@gkfc-cms.org' || (contact.nama && contact.nama.includes('Herman'))) {
      setItem(KEYS.SUPERADMIN_CONTACT, initialSuperAdminContact);
      return initialSuperAdminContact;
    }
    return contact;
  },
  saveSuperAdminContact: (contact: SuperAdminContact): void => {
    setItem(KEYS.SUPERADMIN_CONTACT, contact);
  },
  checkTenantStatus: (tenantId?: string): { isLocked: boolean; reason: 'NONAKTIF' | 'KADALUARSA' | 'DIBLOKIR' | 'NONE'; tenant: ChurchTenant | null; message: string } => {
    const targetId = tenantId || StorageManager.getActiveTenantId();
    const tenants = StorageManager.getTenants();
    const tenant = tenants.find((t) => t.tenant_id === targetId) || tenants[0] || null;

    if (!tenant) {
      return { isLocked: false, reason: 'NONE', tenant: null, message: '' };
    }

    if (tenant.status === 'DIBLOKIR') {
      return {
        isLocked: true,
        reason: 'DIBLOKIR',
        tenant,
        message: `Akun ${tenant.nama_gereja} telah diblokir oleh SuperAdmin. Hubungi SuperAdmin untuk pengaktifan kembali.`
      };
    }

    if (tenant.status === 'NONAKTIF') {
      return {
        isLocked: true,
        reason: 'NONAKTIF',
        tenant,
        message: `Akun ${tenant.nama_gereja} sedang dalam status Nonaktif.`
      };
    }

    if (tenant.tanggal_kadaluarsa) {
      const expDate = new Date(tenant.tanggal_kadaluarsa);
      expDate.setHours(23, 59, 59, 999);
      if (new Date() > expDate || tenant.status === 'KADALUARSA') {
        return {
          isLocked: true,
          reason: 'KADALUARSA',
          tenant,
          message: `Masa berlaku lisensi ${tenant.nama_gereja} telah kadaluarsa pada ${tenant.tanggal_kadaluarsa}. Silahkan lakukan pembayaran untuk perpanjangan.`
        };
      }
    }

    return { isLocked: false, reason: 'NONE', tenant, message: '' };
  },
  getSettings: (): AppSettings => {
    const saved = getItem<AppSettings>(KEYS.SETTINGS, initialSettings);
    const settings = { ...initialSettings, ...saved };
    // Auto upgrade any legacy preset to universal EMERALD_LIGHT theme so all users experience the new theme
    if (!saved || saved.theme_preset !== 'EMERALD_LIGHT') {
      settings.theme_preset = 'EMERALD_LIGHT';
      settings.warna_tema = '#00a859';
      settings.accent_color = 'EMERALD';
      settings.navbar_theme_preset = 'CLEAN_LIGHT';
      settings.navbar_custom_bg = '#ffffff';
      settings.navbar_custom_text = 'DARK';
      settings.navbar_border_accent = 'THEME_COLOR';
      settings.footer_theme_preset = 'CLEAN_LIGHT';
      settings.footer_custom_bg = '#ffffff';
      settings.footer_icon_active_bg = '#dcfce7';
      settings.footer_icon_active_text = '#00a859';
      settings.footer_icon_inactive_text = '#64748b';
      settings.jemaat_banner_bg = 'GRADIENT_EMERALD';
      setItem(KEYS.SETTINGS, settings);
    }
    // Auto sanitize any stale legacy church name
    if (settings.nama_gereja && settings.nama_gereja.includes('Kemenangan Faith')) {
      settings.nama_gereja = 'Jesus Kingdom Christ';
    }
    if (settings.header_title && settings.header_title.includes('Kemenangan Faith')) {
      settings.header_title = 'Jesus Kingdom Christ';
    }
    if (settings.rekening_bank_atas_nama && settings.rekening_bank_atas_nama.includes('Kemenangan Faith')) {
      settings.rekening_bank_atas_nama = 'Jesus Kingdom Christ';
    }
    if (settings.email === 'info@gkfc-cms.org') {
      settings.email = 'info@jesuskingdomchrist.org';
    }
    if (settings.video_url && settings.video_url.includes('5qap5aO4i9A')) {
      settings.video_url = 'https://www.youtube.com/watch?v=wX2S6AebnI8';
    }

    const activeTenantId = StorageManager.getActiveTenantId();
    if (activeTenantId === 'CHURCH-001') {
      // Auto upgrade legacy/deleted APK link to the official Google Drive APK file ONLY for Church 001
      if (!settings.apk_download_url || settings.apk_download_url.includes('1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s')) {
        settings.apk_download_url = 'https://drive.google.com/file/d/1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h/view?usp=sharing';
      }
    } else {
      // For other churches, ensure they do not inherit Church 001's default link unless explicitly set by their admin
      if (settings.apk_download_url && (settings.apk_download_url.includes('1MnWPNmsDjO1clGqbixCgSHjNRcMaqx2h') || settings.apk_download_url.includes('1TlnvPxgIPWQ13CE_EJnj4gUMAipCWy1s'))) {
        const tenants = getItem<ChurchTenant[]>(KEYS.TENANTS, initialTenants);
        const currentTenant = tenants.find((t) => t.tenant_id === activeTenantId);
        settings.apk_download_url = currentTenant?.apk_download_url || '';
      }
    }
    return settings;
  },
  saveSettings: (settings: AppSettings): void => {
    setItem(KEYS.SETTINGS, settings);
    const activeTenantId = StorageManager.getActiveTenantId();
    const tenants = getItem<ChurchTenant[]>(KEYS.TENANTS, initialTenants);
    let needsSync = false;
    const updatedTenants = tenants.map((t) => {
      if (t.tenant_id === activeTenantId || (tenants.length === 1 && t.tenant_id === 'CHURCH-001')) {
        let tChanged = false;
        let newObj = { ...t };
        if (settings.nama_gereja && t.nama_gereja !== settings.nama_gereja) {
          newObj.nama_gereja = settings.nama_gereja;
          tChanged = true;
        }
        if (settings.email && t.admin_email !== settings.email) {
          newObj.admin_email = settings.email;
          tChanged = true;
        }
        if (settings.telepon && t.admin_wa !== settings.telepon) {
          newObj.admin_wa = settings.telepon;
          tChanged = true;
        }
        if (settings.alamat && t.alamat !== settings.alamat) {
          newObj.alamat = settings.alamat;
          tChanged = true;
        }
        if (settings.apk_download_url !== undefined && t.apk_download_url !== settings.apk_download_url) {
          newObj.apk_download_url = settings.apk_download_url;
          tChanged = true;
        }
        if (tChanged) {
          needsSync = true;
          return newObj;
        }
      }
      return t;
    });
    if (needsSync) {
      setItem(KEYS.TENANTS, updatedTenants);
    }
  },

  getUsers: (): User[] => {
    let list = getItem<User[]>(KEYS.USERS, initialUsers);

    // Actively remove any legacy tenant-scoped user keys from localStorage so deleted accounts cannot resurrect
    if (typeof localStorage !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('cms_pro_') && k.endsWith('_users') && k !== KEYS.USERS) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        // ignore
      }
    }

    const hasSuperAdmin = list.some((u) => u && (u.role === 'SUPER_ADMIN' || u.username?.toLowerCase() === 'superadmin'));
    if (!hasSuperAdmin) {
      list = [initialUsers[0], ...list];
    }

    // Ensure core Admin Monapa Puriala account always exists with active credentials
    const monapaIndex = list.findIndex((u) => u && u.username && u.username.toLowerCase().trim() === 'admin_monapa');
    if (monapaIndex === -1) {
      const monapaAccount: User = {
        user_id: 'USR-MONAPA',
        username: 'admin_monapa',
        password_hash: 'admin123',
        nama: 'Admin Monapa Puriala',
        role: 'ADMIN',
        email: 'admin_monapa@puriala.org',
        no_hp: '+62 881-0363-58650',
        status: 'Aktif',
        created_at: '2025-01-01 08:00',
        last_login: '2026-07-28 20:45',
        tenant_id: 'CHURCH-001'
      };
      list.push(monapaAccount);
      setItem(KEYS.USERS, list);
    } else {
      const monapa = list[monapaIndex];
      let updated = false;
      if (!monapa.password_hash) {
        monapa.password_hash = 'admin123';
        updated = true;
      }
      if (monapa.status !== 'Aktif') {
        monapa.status = 'Aktif';
        updated = true;
      }
      if (updated) {
        setItem(KEYS.USERS, list);
      }
    }

    // Auto-link users with role JEMAAT to their matching Jemaat profiles in memory
    const jemaatList = getItem<Jemaat[]>(KEYS.JEMAAT, initialJemaat);
    list = list.map((u) => {
      if (!u) return u;
      if (u.role === 'JEMAAT' || u.jemaat_id) {
        if (!u.jemaat_id) {
          const match = jemaatList.find(
            (j) =>
              (j.jemaat_id && u.username && j.jemaat_id.toLowerCase() === u.username.toLowerCase()) ||
              (j.nama_lengkap && u.nama && j.nama_lengkap.toLowerCase().trim() === u.nama.toLowerCase().trim()) ||
              (j.email && u.email && j.email.toLowerCase().trim() === u.email.toLowerCase().trim())
          );
          if (match) {
            return {
              ...u,
              jemaat_id: match.jemaat_id,
              nama: u.nama || match.nama_lengkap,
              email: u.email || match.email,
              no_hp: u.no_hp || match.nomor_hp,
              foto: u.foto || match.foto
            };
          }
        } else {
          const match = jemaatList.find((j) => j.jemaat_id === u.jemaat_id);
          if (match && (u.nama !== match.nama_lengkap || u.email !== match.email || u.foto !== match.foto)) {
            return {
              ...u,
              nama: match.nama_lengkap || u.nama,
              email: match.email || u.email,
              no_hp: match.nomor_hp || u.no_hp,
              foto: match.foto || u.foto
            };
          }
        }
      }
      return u;
    });

    // CRITICAL MULTI-TENANT USER ISOLATION:
    // Every single user account MUST have a valid tenant_id.
    let usersNeedResave = false;
    list = list.map((u) => {
      if (!u) return u;
      if (!u.tenant_id || u.tenant_id.trim() === '') {
        usersNeedResave = true;
        return {
          ...u,
          tenant_id: (u.role === 'SUPER_ADMIN' || u.username?.toLowerCase() === 'superadmin') ? 'ALL' : 'CHURCH-001'
        };
      }
      return {
        ...u,
        tenant_id: normalizeTenantId(u.tenant_id)
      };
    });

    // Synchronize Admin account for all active registered ChurchTenants
    try {
      const allTenants = getItem<ChurchTenant[]>(KEYS.TENANTS, initialTenants);
      allTenants.forEach((t) => {
        if (!t || !t.tenant_id || t.tenant_id === 'CHURCH-001') return;
        const normalizedId = normalizeTenantId(t.tenant_id);
        const adminIndex = list.findIndex(
          (u) => u && normalizeTenantId(u.tenant_id) === normalizedId && u.role === 'ADMIN'
        );
        if (adminIndex === -1 && t.admin_username) {
          usersNeedResave = true;
          const newAdmin: User = {
            user_id: `USR-ADM-${normalizedId.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString().slice(-4)}`,
            username: t.admin_username,
            password_hash: 'admin123',
            nama: t.admin_nama || `Admin ${t.nama_gereja}`,
            role: 'ADMIN',
            email: t.admin_email || '',
            no_hp: t.admin_wa || '',
            status: t.status === 'DIBLOKIR' || t.status === 'NONAKTIF' ? 'Nonaktif' : 'Aktif',
            created_at: new Date().toISOString(),
            tenant_id: normalizedId
          };
          list.push(newAdmin);
        } else if (adminIndex !== -1) {
          const adm = list[adminIndex];
          let updatedAdm = false;
          // Only populate empty fields from tenant, NEVER overwrite existing user-edited data!
          if (!adm.nama && t.admin_nama) {
            adm.nama = t.admin_nama;
            updatedAdm = true;
          }
          if (!adm.email && t.admin_email) {
            adm.email = t.admin_email;
            updatedAdm = true;
          }
          if (!adm.no_hp && t.admin_wa) {
            adm.no_hp = t.admin_wa;
            updatedAdm = true;
          }
          const expectedStatus = t.status === 'DIBLOKIR' || t.status === 'NONAKTIF' ? 'Nonaktif' : 'Aktif';
          if (adm.status !== expectedStatus) {
            adm.status = expectedStatus;
            updatedAdm = true;
          }
          if (updatedAdm) {
            usersNeedResave = true;
          }
        }
      });
    } catch (err) {
      // ignore
    }

    if (usersNeedResave && typeof localStorage !== 'undefined') {
      setItem(KEYS.USERS, list);
    }

    return list;
  },
  getUsersByTenant: (targetTenantId?: string, includeGlobalSuperAdmin: boolean = false): User[] => {
    const allUsers = StorageManager.getUsers();
    if (includeGlobalSuperAdmin) {
      return allUsers;
    }
    const rawActive = targetTenantId || StorageManager.getActiveTenantId() || 'CHURCH-001';
    const activeTenantId = normalizeTenantId(rawActive);
    return allUsers.filter((u) => {
      const uTenant = normalizeTenantId(u.tenant_id || (u.role === 'SUPER_ADMIN' ? 'ALL' : 'CHURCH-001'));
      return uTenant === activeTenantId;
    });
  },
  saveUsers: (users: User[]): void => {
    setItem(KEYS.USERS, users);

    // Auto sync admin profile changes to matching ChurchTenant so they stay permanently in sync
    try {
      const tenants = getItem<ChurchTenant[]>(KEYS.TENANTS, initialTenants);
      let tenantsChanged = false;
      const updatedTenants = tenants.map((t) => {
        const normalizedTenantId = normalizeTenantId(t.tenant_id);
        const adminAccount = users.find(
          (u) => u && normalizeTenantId(u.tenant_id) === normalizedTenantId && u.role === 'ADMIN'
        );
        if (adminAccount) {
          let tModified = false;
          let newName = t.admin_nama;
          let newUsername = t.admin_username;
          let newEmail = t.admin_email;
          let newWa = t.admin_wa;

          if (adminAccount.nama && t.admin_nama !== adminAccount.nama) {
            newName = adminAccount.nama;
            tModified = true;
          }
          if (adminAccount.username && t.admin_username !== adminAccount.username) {
            newUsername = adminAccount.username;
            tModified = true;
          }
          if (adminAccount.email && t.admin_email !== adminAccount.email) {
            newEmail = adminAccount.email;
            tModified = true;
          }
          if (adminAccount.no_hp && t.admin_wa !== adminAccount.no_hp) {
            newWa = adminAccount.no_hp;
            tModified = true;
          }
          if (tModified) {
            tenantsChanged = true;
            return {
              ...t,
              admin_nama: newName,
              admin_username: newUsername,
              admin_email: newEmail,
              admin_wa: newWa
            };
          }
        }
        return t;
      });
      if (tenantsChanged) {
        setItem(KEYS.TENANTS, updatedTenants);
      }
    } catch (e) {
      // ignore
    }

    window.dispatchEvent(new Event('cms_data_changed'));
  },
  deleteUser: (userId: string, username?: string, jemaatId?: string, nama?: string): void => {
    const cleanUsername = (username || '').toLowerCase().trim();
    if (cleanUsername === 'superadmin' || cleanUsername === 'admin_monapa') {
      return;
    }
    const currentUsers = StorageManager.getUsers();
    const updatedUsers = currentUsers.filter((u) => {
      if (u.user_id === userId) return false;
      if (username && u.username && u.username.toLowerCase().trim() === cleanUsername) return false;
      return true;
    });

    StorageManager.saveUsers(updatedUsers);

    // Actively purge any legacy keys in localStorage so the user cannot be restored
    if (typeof localStorage !== 'undefined') {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('cms_pro_') && k.endsWith('_users') && k !== KEYS.USERS) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
      } catch (e) {
        // ignore
      }
    }

    // Also remove associated Jemaat profile if any
    const allJemaat = getItem<Jemaat[]>(KEYS.JEMAAT, initialJemaat);
    const updatedJemaat = allJemaat.filter((j) => {
      if (jemaatId && j.jemaat_id === jemaatId) return false;
      if (nama && j.nama_lengkap && j.nama_lengkap.toLowerCase().trim() === nama.toLowerCase().trim()) return false;
      if (username && j.nama_lengkap && j.nama_lengkap.toLowerCase().trim() === username.toLowerCase().trim()) return false;
      return true;
    });

    if (updatedJemaat.length !== allJemaat.length) {
      StorageManager.saveJemaat(updatedJemaat);
    }

    window.dispatchEvent(new Event('cms_data_changed'));
  },
  deleteJemaat: (jemaatId: string, nama?: string): void => {
    const allJemaat = getItem<Jemaat[]>(KEYS.JEMAAT, initialJemaat);
    const updatedJemaat = allJemaat.filter((j) => j.jemaat_id !== jemaatId);
    StorageManager.saveJemaat(updatedJemaat);

    // Also remove associated user account
    const allUsers = StorageManager.getUsers();
    const updatedUsers = allUsers.filter((u) => {
      if (u.jemaat_id && u.jemaat_id === jemaatId) return false;
      if (nama && u.nama && u.nama.toLowerCase().trim() === nama.toLowerCase().trim()) return false;
      return true;
    });

    if (updatedUsers.length !== allUsers.length) {
      StorageManager.saveUsers(updatedUsers);
    }

    window.dispatchEvent(new Event('cms_data_changed'));
  },
  getNextUserId: (): string => {
    const users = getItem<User[]>(KEYS.USERS, initialUsers);
    const existingIds = new Set(users.map((u) => u.user_id));
    let maxNum = 0;
    users.forEach((u) => {
      if (u.user_id) {
        const matches = u.user_id.match(/\d+/g);
        if (matches) {
          matches.forEach((m) => {
            const n = parseInt(m, 10);
            if (!isNaN(n) && n > maxNum) maxNum = n;
          });
        }
      }
    });
    let nextNum = maxNum + 1;
    let nextId = `USR-${nextNum.toString().padStart(3, '0')}`;
    while (existingIds.has(nextId)) {
      nextNum++;
      nextId = `USR-${nextNum.toString().padStart(3, '0')}`;
    }
    return nextId;
  },
  resetAdminAccounts: (): void => {
    // Deprecated for security: Do not reset or wipe admin accounts
  },

  getNextJemaatId: (): string => {
    const list = getItem<Jemaat[]>(KEYS.JEMAAT, initialJemaat);
    let maxNum = 0;
    list.forEach((j) => {
      if (j.jemaat_id && j.jemaat_id.startsWith('JMT-')) {
        const numPart = parseInt(j.jemaat_id.replace('JMT-', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    return `JMT-${(maxNum + 1).toString().padStart(3, '0')}`;
  },
  getJemaat: (): Jemaat[] => {
    let list = getItem<Jemaat[]>(KEYS.JEMAAT, initialJemaat);
    
    // Auto heal missing accounts for Jemaat records in memory
    const users = getItem<User[]>(KEYS.USERS, initialUsers);

    // Ensure every Jemaat record is synchronized with users
    list = list.map((j) => {
      const matchingUser = users.find(
        (u) =>
          (u.jemaat_id && u.jemaat_id === j.jemaat_id) ||
          (u.nama && j.nama_lengkap && u.nama.toLowerCase().trim() === j.nama_lengkap.toLowerCase().trim()) ||
          (u.email && j.email && u.email.toLowerCase().trim() === j.email.toLowerCase().trim())
      );

      if (matchingUser) {
        if (!matchingUser.jemaat_id) {
          matchingUser.jemaat_id = j.jemaat_id;
        }
        if (matchingUser.foto && j.foto !== matchingUser.foto) {
          return { ...j, foto: matchingUser.foto, email: matchingUser.email || j.email, nomor_hp: matchingUser.no_hp || j.nomor_hp };
        }
      }
      return j;
    });

    return list;
  },
  saveJemaat: (list: Jemaat[]): void => {
    setItem(KEYS.JEMAAT, list);
    // Also sync photo, name, email to corresponding user account
    const users = StorageManager.getUsers();
    let usersNeedSave = false;

    const updatedUsers = users.map((u) => {
      if (u.jemaat_id || u.role === 'JEMAAT') {
        const match = list.find((j) => (u.jemaat_id && j.jemaat_id && j.jemaat_id === u.jemaat_id) || (j.nama_lengkap && u.nama && j.nama_lengkap.toLowerCase().trim() === u.nama.toLowerCase().trim()));
        if (match) {
          if (u.nama !== match.nama_lengkap || u.email !== match.email || u.no_hp !== match.nomor_hp || u.foto !== match.foto || u.jemaat_id !== match.jemaat_id) {
            usersNeedSave = true;
            return {
              ...u,
              jemaat_id: match.jemaat_id,
              nama: match.nama_lengkap,
              email: match.email || u.email,
              no_hp: match.nomor_hp || u.no_hp,
              foto: match.foto || u.foto
            };
          }
        }
      }
      return u;
    });

    if (usersNeedSave) {
      setItem(KEYS.USERS, updatedUsers);
    }

    // Auto-sync Keluarga list whenever Jemaat list is updated
    syncKeluargaFromJemaat(list);

    window.dispatchEvent(new Event('cms_data_changed'));
  },

  getKeluarga: (): Keluarga[] => {
    const rawKeluarga = getItem<Keluarga[]>(KEYS.KELUARGA, initialKeluarga);
    const jemaatList = getItem<Jemaat[]>(KEYS.JEMAAT, initialJemaat);
    return syncKeluargaFromJemaatWithData(rawKeluarga, jemaatList);
  },
  saveKeluarga: (list: Keluarga[]): void => setItem(KEYS.KELUARGA, list),

  getWilayah: (): Wilayah[] => getItem(KEYS.WILAYAH, initialWilayah),
  saveWilayah: (list: Wilayah[]): void => {
    setItem(KEYS.WILAYAH, list);
    window.dispatchEvent(new Event('cms_data_changed'));
  },
  deleteWilayah: (wilayahId: string): void => {
    const list = StorageManager.getWilayah().filter((w) => w.wilayah_id !== wilayahId);
    setItem(KEYS.WILAYAH, list);
    window.dispatchEvent(new Event('cms_data_changed'));
  },

  getPelayanan: (): Pelayanan[] => getItem(KEYS.PELAYANAN, initialPelayanan),
  savePelayanan: (list: Pelayanan[]): void => {
    setItem(KEYS.PELAYANAN, list);
    window.dispatchEvent(new Event('cms_data_changed'));
  },
  deletePelayanan: (pelayananId: string): void => {
    const list = StorageManager.getPelayanan().filter((p) => p.pelayanan_id !== pelayananId);
    setItem(KEYS.PELAYANAN, list);
    window.dispatchEvent(new Event('cms_data_changed'));
  },

  getKomisi: (): string[] => {
    return getItem<string[]>(KEYS.KOMISI, defaultKomisi);
  },
  saveKomisi: (list: string[]): void => {
    setItem(KEYS.KOMISI, list);
    window.dispatchEvent(new Event('cms_data_changed'));
  },
  addKomisi: (name: string): void => {
    const clean = name.trim();
    if (!clean) return;
    const current = StorageManager.getKomisi();
    if (!current.some((k) => k.toLowerCase() === clean.toLowerCase())) {
      const updated = [...current, clean];
      StorageManager.saveKomisi(updated);
    }
  },
  deleteKomisi: (name: string): void => {
    const current = StorageManager.getKomisi();
    const updated = current.filter((k) => k.toLowerCase() !== name.toLowerCase());
    StorageManager.saveKomisi(updated);
  },

  getBaptisan: (): Baptisan[] => getItem(KEYS.BAPTISAN, initialBaptisan),
  saveBaptisan: (list: Baptisan[]): void => setItem(KEYS.BAPTISAN, list),

  getSidi: (): Sidi[] => getItem(KEYS.SIDI, initialSidi),
  saveSidi: (list: Sidi[]): void => setItem(KEYS.SIDI, list),

  getPernikahan: (): Pernikahan[] => getItem(KEYS.PERNIKAHAN, initialPernikahan),
  savePernikahan: (list: Pernikahan[]): void => setItem(KEYS.PERNIKAHAN, list),

  getPersembahan: (): Persembahan[] => getItem(KEYS.PERSEMBAHAN, initialPersembahan),
  savePersembahan: (list: Persembahan[]): void => setItem(KEYS.PERSEMBAHAN, list),

  getDonasi: (): Donasi[] => getItem(KEYS.DONASI, initialDonasi),
  saveDonasi: (list: Donasi[]): void => setItem(KEYS.DONASI, list),

  getKasPengeluaran: (): KasPengeluaran[] => getItem(KEYS.KAS_PENGELUARAN, defaultKas),
  saveKasPengeluaran: (list: KasPengeluaran[]): void => setItem(KEYS.KAS_PENGELUARAN, list),

  getDoa: (): Doa[] => {
    const items = getItem<Doa[]>(KEYS.DOA, defaultDoa);
    const seen = new Set<string>();
    return items.map((item, idx) => {
      let id = item.doa_id || `DOA-2026-${idx + 1}`;
      if (seen.has(id)) {
        id = `${id}-${idx}`;
      }
      seen.add(id);
      return { ...item, doa_id: id };
    });
  },
  saveDoa: (list: Doa[]): void => setItem(KEYS.DOA, list),

  getPengumuman: (): Pengumuman[] => {
    const items = getItem<Pengumuman[]>(KEYS.PENGUMUMAN, initialPengumuman);
    const seen = new Set<string>();
    return items.map((item, idx) => {
      let id = item.pengumuman_id || `PNG-${idx + 1}`;
      if (seen.has(id)) {
        id = `${id}-${idx}`;
      }
      seen.add(id);
      return { ...item, pengumuman_id: id };
    });
  },
  savePengumuman: (list: Pengumuman[]): void => setItem(KEYS.PENGUMUMAN, list),

  getRenungan: (): Renungan[] => {
    const items = getItem<Renungan[]>(KEYS.RENUNGAN, initialRenungan);
    const seen = new Set<string>();
    return items.map((item, idx) => {
      let id = item.renungan_id || `RNG-${idx + 1}`;
      if (seen.has(id)) {
        id = `${id}-${idx}`;
      }
      seen.add(id);
      return { ...item, renungan_id: id };
    });
  },
  saveRenungan: (list: Renungan[]): void => setItem(KEYS.RENUNGAN, list),

  getEvents: (): EventSchedule[] => {
    const items = getItem<EventSchedule[]>(KEYS.EVENTS, initialEvents);
    const seen = new Set<string>();
    return items.map((item, idx) => {
      let id = item.event_id || `EVT-2026-${idx + 1}`;
      if (seen.has(id)) {
        id = `${id}-${idx}`;
      }
      seen.add(id);
      return { ...item, event_id: id };
    });
  },
  saveEvents: (list: EventSchedule[]): void => setItem(KEYS.EVENTS, list),

  getGallery: (): GalleryItem[] => getItem(KEYS.GALLERY, initialGallery),
  saveGallery: (list: GalleryItem[]): void => setItem(KEYS.GALLERY, list),

  getFeaturedVideos: (): FeaturedVideo[] => {
    const list = getItem<FeaturedVideo[]>(KEYS.FEATURED_VIDEOS, initialFeaturedVideos);
    return list.map((v) => {
      if (v.video_url && v.video_url.includes('5qap5aO4i9A')) {
        return {
          ...v,
          video_url: 'https://www.youtube.com/watch?v=wX2S6AebnI8'
        };
      }
      return v;
    });
  },
  saveFeaturedVideos: (list: FeaturedVideo[]): void => {
    setItem(KEYS.FEATURED_VIDEOS, list);
    // Automatically sync active video to settings for backward compatibility
    const active = list.find((v) => v.is_active) || list[0];
    if (active) {
      const currentSettings = StorageManager.getSettings();
      StorageManager.saveSettings({
        ...currentSettings,
        video_url: active.video_url,
        video_title: active.judul,
        video_description: active.keterangan || ''
      });
    }
  },

  getNotifications: (): NotificationItem[] => getItem(KEYS.NOTIFICATIONS, initialNotifications),
  saveNotifications: (list: NotificationItem[]): void => setItem(KEYS.NOTIFICATIONS, list),

  getActivityLogs: (): ActivityLog[] => getItem(KEYS.ACTIVITY_LOGS, initialActivityLogs),
  logActivity: (user: string, aktivitas: string, moduleName: string = 'General'): void => {
    const current = getItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS, initialActivityLogs);
    const newLog: ActivityLog = {
      log_id: `ACT-${Date.now().toString().slice(-4)}`,
      user,
      aktivitas,
      tanggal: new Date().toLocaleString('id-ID'),
      ip_address: '180.252.12.99',
      module: moduleName
    };
    setItem(KEYS.ACTIVITY_LOGS, [newLog, ...current]);
  },

  getLoginHistory: (): LoginHistory[] => getItem(KEYS.LOGIN_HISTORY, initialLoginHistory),
  recordLogin: (user: string): string => {
    const current = getItem<LoginHistory[]>(KEYS.LOGIN_HISTORY, initialLoginHistory);
    const historyId = `LOG-${Date.now().toString().slice(-4)}`;
    const newEntry: LoginHistory = {
      history_id: historyId,
      user,
      login: new Date().toLocaleString('id-ID'),
      logout: 'Sedang Aktif',
      device: window.innerWidth < 768 ? 'Mobile / PWA Client' : 'Desktop / Web Client',
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome Enterprise' : 'Web Browser',
      ip_address: '180.252.12.99'
    };
    setItem(KEYS.LOGIN_HISTORY, [newEntry, ...current]);
    return historyId;
  },

  recordLogout: (historyId: string): void => {
    const current = getItem<LoginHistory[]>(KEYS.LOGIN_HISTORY, initialLoginHistory);
    const updated = current.map((item) => (item.history_id === historyId ? { ...item, logout: new Date().toLocaleString('id-ID') } : item));
    setItem(KEYS.LOGIN_HISTORY, updated);
  },

  getPrayerRequests: (): PrayerRequest[] => getItem(KEYS.PRAYER_REQUESTS, initialPrayerRequests),
  savePrayerRequests: (list: PrayerRequest[]): void => setItem(KEYS.PRAYER_REQUESTS, list),

  getEventReservations: (): EventReservation[] => {
    const items = getItem<EventReservation[]>(KEYS.EVENT_RESERVATIONS, [
      {
        reservation_id: 'RES-2026-001',
        event_id: 'EVT-2026-001',
        nama_jemaat: 'Bpk. Herman Setyawan',
        nomor_wa: '081234567890',
        jumlah_kursi: 3,
        catatan: 'Duduk di barisan tengah bersama keluarga',
        tanggal_reservasi: '2026-07-28 10:15',
        status: 'TERKONFIRMASI'
      },
      {
        reservation_id: 'RES-2026-002',
        event_id: 'EVT-2026-001',
        nama_jemaat: 'Ibu Maria Setyawati',
        nomor_wa: '081987654321',
        jumlah_kursi: 2,
        catatan: 'Membawa lansia',
        tanggal_reservasi: '2026-07-29 14:20',
        status: 'TERKONFIRMASI'
      }
    ]);
    const seen = new Set<string>();
    return items.map((item, idx) => {
      let id = item.reservation_id || `RES-2026-${idx + 1}`;
      if (seen.has(id)) {
        id = `${id}-${idx}`;
      }
      seen.add(id);
      return { ...item, reservation_id: id };
    });
  },
  saveEventReservations: (list: EventReservation[]): void => setItem(KEYS.EVENT_RESERVATIONS, list),

  getChatMessages: (): ChatMessage[] => {
    return getItem<ChatMessage[]>(KEYS.CHAT_MESSAGES, initialChatMessages);
  },
  saveChatMessages: (messages: ChatMessage[]): void => {
    setItem(KEYS.CHAT_MESSAGES, messages);
  },
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage => {
    const list = StorageManager.getChatMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: `CHAT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    // Keep max 500 latest messages to prevent localStorage overflow
    const updated = [...list, newMsg].slice(-500);
    StorageManager.saveChatMessages(updated);
    return newMsg;
  },
  deleteChatMessage: (id: string): void => {
    const list = StorageManager.getChatMessages();
    const updated = list.filter((m) => m.id !== id);
    StorageManager.saveChatMessages(updated);
  },
  togglePinChatMessage: (id: string): void => {
    const list = StorageManager.getChatMessages();
    const updated = list.map((m) => {
      if (m.id === id) {
        return { ...m, is_pinned: !m.is_pinned };
      }
      return m;
    });
    StorageManager.saveChatMessages(updated);
  },
  clearChatMessages: (): void => {
    StorageManager.saveChatMessages([]);
  },

  // ==================== PUSTAKA ALKITAB & LAGU PUJIAN ====================
  getHymnSongs: (): HymnSong[] => {
    return getItem<HymnSong[]>(KEYS.HYMN_SONGS, INITIAL_HYMN_SONGS);
  },
  saveHymnSongs: (songs: HymnSong[]): void => {
    setItem(KEYS.HYMN_SONGS, songs);
  },
  addHymnSong: (songData: Omit<HymnSong, 'id'>): HymnSong => {
    const songs = StorageManager.getHymnSongs();
    const newSong: HymnSong = {
      ...songData,
      id: `${songData.category}-${Date.now()}`
    };
    const updated = [newSong, ...songs];
    StorageManager.saveHymnSongs(updated);
    return newSong;
  },
  deleteHymnSong: (id: string): void => {
    const songs = StorageManager.getHymnSongs();
    const updated = songs.filter((s) => s.id !== id);
    StorageManager.saveHymnSongs(updated);
  },
  getFavoriteSongIds: (): string[] => {
    return getItem<string[]>(KEYS.FAVORITE_SONGS, []);
  },
  toggleFavoriteSong: (id: string): boolean => {
    const favs = StorageManager.getFavoriteSongIds();
    const exists = favs.includes(id);
    const updated = exists ? favs.filter((f) => f !== id) : [...favs, id];
    setItem(KEYS.FAVORITE_SONGS, updated);
    return !exists;
  },
  getFavoriteVerses: (): string[] => {
    return getItem<string[]>(KEYS.FAVORITE_VERSES, []);
  },
  toggleFavoriteVerse: (verseKey: string): boolean => {
    const favs = StorageManager.getFavoriteVerses();
    const exists = favs.includes(verseKey);
    const updated = exists ? favs.filter((v) => v !== verseKey) : [...favs, verseKey];
    setItem(KEYS.FAVORITE_VERSES, updated);
    return !exists;
  },

  getCurrentUser: (): User | null => {
    const saved = getItem<User | null>(KEYS.CURRENT_USER, null);
    if (!saved || !saved.username) return null;
    const allUsers = getItem<User[]>(KEYS.USERS, initialUsers);
    // STRICT: Only look up by username to avoid ID collision hijacking session
    const fresh = allUsers.find(
      (u) => u.username && u.username.toLowerCase() === saved.username.toLowerCase()
    );
    if (fresh) {
      return { ...saved, ...fresh };
    }
    return saved;
  },
  saveCurrentUser: (user: User | null): void => setItem(KEYS.CURRENT_USER, user),
  clearCurrentUser: (): void => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    notifyStorageListeners();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { key: KEYS.CURRENT_USER } }));
    }
  },

  resetToDefault: (): void => {
    localStorage.clear();
    setItem(KEYS.SETTINGS, initialSettings);
    setItem(KEYS.USERS, initialUsers);
    setItem(KEYS.JEMAAT, initialJemaat);
    setItem(KEYS.KELUARGA, initialKeluarga);
    setItem(KEYS.WILAYAH, initialWilayah);
    setItem(KEYS.PELAYANAN, initialPelayanan);
    setItem(KEYS.BAPTISAN, initialBaptisan);
    setItem(KEYS.SIDI, initialSidi);
    setItem(KEYS.PERNIKAHAN, initialPernikahan);
    setItem(KEYS.PERSEMBAHAN, initialPersembahan);
    setItem(KEYS.DONASI, initialDonasi);
    setItem(KEYS.KAS_PENGELUARAN, defaultKas);
    setItem(KEYS.DOA, defaultDoa);
    setItem(KEYS.PENGUMUMAN, initialPengumuman);
    setItem(KEYS.RENUNGAN, initialRenungan);
    setItem(KEYS.EVENTS, initialEvents);
    setItem(KEYS.GALLERY, initialGallery);
    setItem(KEYS.NOTIFICATIONS, initialNotifications);
    setItem(KEYS.ACTIVITY_LOGS, initialActivityLogs);
    setItem(KEYS.LOGIN_HISTORY, initialLoginHistory);
    setItem(KEYS.PRAYER_REQUESTS, initialPrayerRequests);
    setItem(KEYS.CHAT_MESSAGES, initialChatMessages);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },
  resetAllDataToDefaults: (): void => {
    StorageManager.resetToDefault();
  },

  getSecurityAlert: (): SecurityAlert | null => {
    // 1. Check direct key first
    const alert = getItem<SecurityAlert | null>(KEYS.SECURITY_ALERT, null);
    if (alert) {
      if (alert.active && !alert.revoked) {
        return alert;
      }
      // If alert was marked inactive or revoked, clean up local state
      if (typeof localStorage !== 'undefined' && (alert.active === false || alert.revoked === true)) {
        try {
          localStorage.removeItem(KEYS.SECURITY_ALERT);
        } catch {
          // ignore
        }
      }
    }

    // 2. Fallback to settings.security_alert
    const settings = StorageManager.getSettings();
    if (settings && settings.security_alert && settings.security_alert.active && !settings.security_alert.revoked) {
      return settings.security_alert;
    }

    return null;
  },

  saveSecurityAlert: (alert: SecurityAlert | null): void => {
    if (!alert || alert.active === false || alert.revoked === true) {
      StorageManager.revokeSecurityAlert(alert?.sender || 'SuperAdmin');
      return;
    }

    setItem(KEYS.SECURITY_ALERT, alert);
    // Also sync into settings for cloud broadcast compatibility
    const settings = StorageManager.getSettings();
    settings.security_alert = alert;
    setItem(KEYS.SETTINGS, settings);

    // Explicit cloud push to ensure both security_alert and cms_pro_security_alert docs are updated
    pushToCloud('cms_pro_security_alert', alert);
    pushToCloud('security_alert', alert);

    if (alert && alert.active) {
      // Add entry to notifications for history audit
      const notifs = StorageManager.getNotifications();
      const newNotif: NotificationItem = {
        notif_id: `NOTIF-ALERT-${Date.now()}`,
        user_id: alert.target_user_id || 'ALL',
        judul: `⚠️ ${alert.title}`,
        pesan: alert.message,
        status_baca: 'Belum',
        tanggal: new Date().toLocaleString('id-ID'),
        tipe: 'Peringatan',
        pengirim: `SuperAdmin (${alert.sender || 'System Security'})`
      };
      StorageManager.saveNotifications([newNotif, ...notifs]);
    }

    notifyStorageListeners();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms_security_alert_changed', { detail: alert }));
      window.dispatchEvent(new Event('cms_data_changed'));
    }
  },

  revokeSecurityAlert: (revokedBy?: string): void => {
    const existingAlert = StorageManager.getSecurityAlert() || getItem<SecurityAlert | null>(KEYS.SECURITY_ALERT, null);
    const revokedPayload: SecurityAlert = {
      id: existingAlert?.id || `SEC-ALERT-REVOKED-${Date.now()}`,
      active: false,
      revoked: true,
      title: existingAlert?.title || 'Peringatan Keamanan Dicabut',
      message: 'Peringatan keamanan dan alarm telah dinonaktifkan/dicabut oleh SuperAdmin.',
      sender: existingAlert?.sender || 'SuperAdmin',
      sender_user_id: existingAlert?.sender_user_id,
      sender_username: existingAlert?.sender_username,
      created_at: existingAlert?.created_at || new Date().toLocaleString('id-ID'),
      severity: 'WARNING',
      target_user_id: 'ALL',
      target_username: 'ALL',
      revoked_at: new Date().toLocaleString('id-ID'),
      revoked_by: revokedBy || 'SuperAdmin'
    };

    // 1. Immediately remove from local storage on this device
    try {
      localStorage.removeItem(KEYS.SECURITY_ALERT);
      localStorage.removeItem('cms_pro_security_alert');
      localStorage.removeItem('security_alert');
    } catch {
      // ignore
    }

    // 2. Clear from settings and sync to cloud
    const settings = StorageManager.getSettings();
    settings.security_alert = null;
    setItem(KEYS.SETTINGS, settings);

    // 3. Stop local alarm siren sound immediately
    stopSecurityAlarmSiren();

    // 4. Push explicit revocation tombstone to Firebase Firestore across all channels
    pushSecurityAlertRevocation(revokedPayload).catch((e) => console.warn('[Storage] Revocation push warning:', e));

    // 5. Notify local listeners, BroadcastChannel & components
    notifyStorageListeners();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms_security_alert_changed', { detail: null }));
      window.dispatchEvent(new Event('cms_data_changed'));
      window.dispatchEvent(new Event('storage'));
    }
  },

  clearSecurityAlert: (): void => {
    StorageManager.revokeSecurityAlert('SuperAdmin');
  }
};
