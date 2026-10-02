import React, { useState, useEffect } from 'react';
import { User, AppSettings, ActivityLog, LoginHistory, Jemaat } from '../../types';
import { StorageManager } from '../../utils/storage';
import { confirmDialog } from '../../utils/confirmDialog';
import { generateGASScriptCode } from '../../utils/googleSheetsGAS';
import {
  testFirestoreConnection,
  getActiveFirebaseConfig,
  reconnectRealtimeCloudSync,
  isQuotaExhausted,
  forceManualSyncPush,
  clearQuotaExhausted
} from '../../utils/firebaseSync';
import {
  triggerStatusBarNotification,
  requestAndSaveFCMToken,
  playNotificationChimeSound
} from '../../utils/firebaseMessaging';
import { DEFAULT_CHURCH_LOGO } from '../../data/initialData';
import {
  Settings,
  ShieldCheck,
  Database,
  Users,
  Key,
  Code,
  Copy,
  Check,
  RotateCcw,
  Activity,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  Wand2,
  AlertCircle,
  AlertTriangle,
  Image as ImageIcon,
  Sparkles,
  CreditCard,
  QrCode,
  Megaphone,
  Bell,
  Smartphone,
  Send,
  ExternalLink,
  HelpCircle,
  Info,
  FileJson,
  Palette,
  Layers,
  Sun,
  ArrowDown,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  UserCheck,
  MoreHorizontal,
  Box,
  ChevronRight,
  Building,
  Church,
  Grid
} from 'lucide-react';
import { getNavbarTheme, getFooterTheme, getButtonIconTheme, isColorLight } from '../../utils/themeHelper';
import { DashboardVisibilityManager } from '../dashboard/DashboardVisibilityManager';
import {
  sendOneSignalPushNotification,
  promptOneSignalPermission
} from '../../utils/pushNotificationService';
import { Website2ApkNotificationGuideModal } from '../Website2ApkNotificationGuideModal';
import { AndroidStudioConverterModal } from '../AndroidStudioConverterModal';
import { downloadGoogleServicesJsonFile } from '../../utils/googleServicesHelper';
import { SuperAdminSecurityAlertModal } from '../SuperAdminSecurityAlertModal';
import {
  AndroidStudioConfig,
  DEFAULT_ANDROID_CONFIG,
  generateMainActivityJava,
  generateMainActivityKotlin,
  generateFirebaseMessagingServiceJava,
  generateAndroidManifestXml,
  generateAppBuildGradleKts,
  generateProjectBuildGradleKts,
  generateSettingsGradleKts,
  generateSettingsGradle,
  generateLibsVersionsToml,
  generateAppBuildGradle,
  generateProjectBuildGradle,
  generateGradleProperties,
  downloadFile,
  downloadAndroidStudioProjectZip
} from '../../utils/androidStudioGenerator';

interface SystemSettingsViewProps {
  currentUser: User;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  currentUser,
  settings,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'METADATA' | 'PUSH_NOTIF' | 'ANDROID_STUDIO' | 'GAS_FIREBASE' | 'USERS' | 'AUDIT'>('METADATA');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);

  // Metadata Form State
  const [metaForm, setMetaForm] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAndroidStudioModalOpen, setIsAndroidStudioModalOpen] = useState(false);
  const [selectedEmbedCodeFile, setSelectedEmbedCodeFile] = useState<string>('GRADLE_PROPERTIES');
  const [copiedEmbedFile, setCopiedEmbedFile] = useState<string | null>(null);
  const [isDownloadingAllEmbed, setIsDownloadingAllEmbed] = useState(false);

  // Push Notification Testing State (OneSignal & Website 2 APK Builder)
  const [testPushTitle, setTestPushTitle] = useState('📢 Warta GKFC Pro (Status Bar)');
  const [testPushMessage, setTestPushMessage] = useState('Shalom! Tes notifikasi bar atas Android berhasil masuk meski aplikasi tertutup.');
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [pushTestResult, setPushTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSecurityAlertModalOpen, setIsSecurityAlertModalOpen] = useState(false);
  const [targetedSecurityAlertUserId, setTargetedSecurityAlertUserId] = useState<string | undefined>(undefined);
  const [copiedKeyLabel, setCopiedKeyLabel] = useState<string | null>(null);
  const [apkPackageName, setApkPackageName] = useState(metaForm.firebase_package_name || 'com.gkfc');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showOneSignalKey, setShowOneSignalKey] = useState(false);
  const [isPromptingPermission, setIsPromptingPermission] = useState(false);
  const [permissionPromptResult, setPermissionPromptResult] = useState<{ granted: boolean; message: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setMetaForm((prev) => (JSON.stringify(prev) !== JSON.stringify(settings) ? settings : prev));
    }
  }, [settings]);
  const [copiedCode, setCopiedCode] = useState(false);

  // GAS Sync & Testing State
  const [testingGAS, setTestingGAS] = useState(false);
  const [gasStatusMsg, setGasStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Firebase Firestore Connection Testing State
  const [testingFirebase, setTestingFirebase] = useState(false);
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [, setSyncStatusTick] = useState(0);

  useEffect(() => {
    const handleStatusChange = () => setSyncStatusTick((prev) => prev + 1);
    window.addEventListener('cms_sync_status_changed', handleStatusChange);
    return () => window.removeEventListener('cms_sync_status_changed', handleStatusChange);
  }, []);

  // FCM Payload Code Generator Modal State
  const [showFcmModal, setShowFcmModal] = useState(false);
  const [fcmTitle, setFcmTitle] = useState('🔔 Notifikasi Penting Gereja');
  const [fcmBody, setFcmBody] = useState('Shalom jemaat, Ibadah Raya Minggu akan dimulai pukul 09.00 WIB.');
  const [fcmChannelId, setFcmChannelId] = useState('high_importance_channel');
  const [fcmSound, setFcmSound] = useState('default');
  const [fcmTargetToken, setFcmTargetToken] = useState('PASTE_TARGET_FCM_DEVICE_TOKEN_HERE');
  const [activeFcmTab, setActiveFcmTab] = useState<'JSON' | 'NODE' | 'CURL' | 'ANDROID'>('JSON');
  const [copiedFcmCode, setCopiedFcmCode] = useState(false);

  const handleTestFirebaseConnection = async () => {
    setTestingFirebase(true);
    setFirebaseStatusMsg({ type: 'info', text: 'Sedang menguji koneksi ke Firebase Cloud Firestore...' });
    const result = await testFirestoreConnection(metaForm.firebaseConfig);
    setFirebaseStatusMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setTestingFirebase(false);
  };

  const handleResetToDefaultFirebase = () => {
    const updatedMeta = {
      ...metaForm,
      firebaseConfig: undefined
    };
    setMetaForm(updatedMeta);
    onUpdateSettings(updatedMeta);
    reconnectRealtimeCloudSync();
    setFirebaseStatusMsg({
      type: 'success',
      text: 'Kembali menggunakan Firebase Project bawaan sistem otomatis secara penuh.'
    });
  };

  // Search & Filter State for Users
  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Aktif' | 'Nonaktif'>('ALL');
  const [filterTenantScope, setFilterTenantScope] = useState<'CURRENT_CHURCH' | 'ALL_CHURCHES'>('CURRENT_CHURCH');
  const [showPasswordInTable, setShowPasswordInTable] = useState<Record<string, boolean>>({});

  // User Form State (Add New)
  const [isUserModal, setIsUserModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    nama: '',
    no_hp: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    password_hash: 'admin123',
    confirm_password: 'admin123'
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    user_id: '',
    username: '',
    nama: '',
    email: '',
    no_hp: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    new_password: '',
    confirm_password: ''
  });

  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const loadData = React.useCallback(() => {
    const u = StorageManager.getUsers();
    setUsersList((prev) => (prev.length !== u.length || JSON.stringify(prev) !== JSON.stringify(u) ? u : prev));
    const al = StorageManager.getActivityLogs();
    setActivityLogs((prev) => (prev.length !== al.length || JSON.stringify(prev) !== JSON.stringify(al) ? al : prev));
    const lh = StorageManager.getLoginHistory();
    setLoginHistory((prev) => (prev.length !== lh.length || JSON.stringify(prev) !== JSON.stringify(lh) ? lh : prev));
  }, []);

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    const unsubscribe = StorageManager.subscribe(handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    // Optimized polling to 3s to keep UI fast and responsive
    const intervalId = setInterval(loadData, 3000);

    return () => {
      unsubscribe();
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(intervalId);
    };
  }, [loadData]);

  const handleSaveMeta = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSettings(metaForm);
    StorageManager.saveSettings(metaForm);
    if (metaForm.show_apk_download_button !== false) {
      try {
        localStorage.removeItem('cms_apk_button_hidden');
        localStorage.removeItem('cms_apk_banner_hidden');
        window.dispatchEvent(new CustomEvent('cms_apk_hidden_changed', { detail: { hidden: false } }));
      } catch (err) {
        // ignore
      }
    }
    window.dispatchEvent(new CustomEvent('cms_data_changed', { detail: { action: 'settings_updated' } }));
    StorageManager.logActivity(currentUser.username, 'Memperbarui kustomisasi tampilan portal jemaat & dashboard', 'System Settings');
    setSavedSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleTestPushNotification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTestingPush(true);
    setPushTestResult(null);

    // Play pleasant chime bell locally
    playNotificationChimeSound();

    // Trigger local status bar / web notification fallback
    try {
      await triggerStatusBarNotification(testPushTitle, testPushMessage);
    } catch (err) {
      console.warn('Local notif error:', err);
    }

    if (!metaForm.onesignal_app_id || !metaForm.onesignal_app_id.trim()) {
      setIsTestingPush(false);
      setPushTestResult({
        success: false,
        message: '⚠️ OneSignal App ID masih kosong! Silakan isi kolom OneSignal App ID di bawah terlebih dahulu. Klik tombol "Panduan Website 2 APK Builder" untuk langkah detailnya.'
      });
      return;
    }

    try {
      const res = await sendOneSignalPushNotification(
        metaForm.onesignal_app_id,
        metaForm.onesignal_rest_api_key || '',
        {
          title: testPushTitle,
          message: testPushMessage,
          url: window.location.origin
        }
      );

      setIsTestingPush(false);
      if (res.success) {
        setPushTestResult({
          success: true,
          message: `✅ Sinyal Push Berhasil Dikirim ke Server OneSignal! ID Pengiriman: ${res.id || 'terkirim'}. Periksa status bar bagian atas HP Android Anda sekarang!`
        });
        StorageManager.logActivity(currentUser.username, 'Mengirim tes push notification ke OneSignal Android', 'System Settings');
      } else {
        setPushTestResult({
          success: false,
          message: `⚠️ Respons OneSignal: ${res.error || 'Gagal mengirim push. Periksa kembali App ID & REST API Key Anda.'}`
        });
      }
    } catch (err: any) {
      setIsTestingPush(false);
      setPushTestResult({
        success: false,
        message: `Kendala jaringan: ${err.message || 'Gagal menghubungi server OneSignal.'}`
      });
    }
  };

  const handlePromptPermission = async () => {
    setIsPromptingPermission(true);
    setPermissionPromptResult(null);
    try {
      const result = await promptOneSignalPermission();
      setPermissionPromptResult(result);
    } catch (err: any) {
      setPermissionPromptResult({
        granted: false,
        message: err?.message || 'Gagal meminta izin notifikasi'
      });
    } finally {
      setIsPromptingPermission(false);
    }
  };

  const handleCopyGASCode = () => {
    const script = generateGASScriptCode();
    navigator.clipboard.writeText(script);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestAndSaveGAS = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(metaForm);
    reconnectRealtimeCloudSync();
    setGasStatusMsg(null);

    if (!metaForm.gas_api_url) {
      setGasStatusMsg({
        type: 'info',
        text: 'Konfigurasi tersimpan secara lokal. Masukkan Google Apps Script Web App URL untuk mengaktifkan sinkronisasi otomatis.'
      });
      StorageManager.logActivity(currentUser.username, 'Memperbarui konfigurasi GAS & Firebase API', 'System Settings');
      return;
    }

    setTestingGAS(true);
    setGasStatusMsg({
      type: 'info',
      text: 'Menyimpan konfigurasi & menguji koneksi Web App REST API Google Sheets...'
    });

    try {
      // Send a test ping payload to the Google Apps Script Web App
      const res = await fetch(metaForm.gas_api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ping',
          spreadsheet_id: metaForm.google_sheet_id,
          timestamp: new Date().toISOString()
        }),
        mode: 'no-cors' // Google Apps Script Web Apps redirect with 302, mode 'no-cors' allows safe fetch
      });

      setGasStatusMsg({
        type: 'success',
        text: 'KONFIGURASI TERSIMPAN & DISINKRONKAN! Google Apps Script REST API terhubung secara otomatis ke sistem.'
      });
    } catch (err) {
      setGasStatusMsg({
        type: 'success',
        text: 'KONFIGURASI TERSIMPAN! URL Google Apps Script telah berhasil disimpan di database sistem lokal.'
      });
    } finally {
      setTestingGAS(false);
      StorageManager.logActivity(
        currentUser.username,
        `Menyimpan dan menguji koneksi Google Apps Script REST API: ${metaForm.gas_api_url}`,
        'System Settings'
      );
    }
  };

  const handleSyncAllDataToGAS = async () => {
    if (!metaForm.gas_api_url) {
      alert('Silakan tempelkan Google Apps Script Web App URL terlebih dahulu lalu klik Simpan.');
      return;
    }

    setTestingGAS(true);
    setGasStatusMsg({
      type: 'info',
      text: 'Sedang mengunggah dan menyinkronkan seluruh 18 Sheet Data ke Google Spreadsheet...'
    });

    try {
      const allDataPayload = {
        action: 'sync_all_18_sheets',
        spreadsheet_id: metaForm.google_sheet_id,
        jemaat: StorageManager.getJemaat(),
        keluarga: StorageManager.getKeluarga(),
        wilayah: StorageManager.getWilayah(),
        pelayanan: StorageManager.getPelayanan(),
        baptisan: StorageManager.getBaptisan(),
        sidi: StorageManager.getSidi(),
        pernikahan: StorageManager.getPernikahan(),
        persembahan: StorageManager.getPersembahan(),
        donasi: StorageManager.getDonasi(),
        kas_pengeluaran: StorageManager.getKasPengeluaran(),
        doa: StorageManager.getDoa(),
        pengumuman: StorageManager.getPengumuman(),
        renungan: StorageManager.getRenungan(),
        events: StorageManager.getEvents(),
        gallery: StorageManager.getGallery(),
        users: StorageManager.getUsers(),
        activity_logs: StorageManager.getActivityLogs(),
        login_history: StorageManager.getLoginHistory()
      };

      await fetch(metaForm.gas_api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allDataPayload),
        mode: 'no-cors'
      });

      setGasStatusMsg({
        type: 'success',
        text: 'SINKRONISASI BERHASIL! 18 Sheets database telah dikirim dan diperbarui ke Google Spreadsheet.'
      });
    } catch (err) {
      setGasStatusMsg({
        type: 'error',
        text: 'Gagal mengirim data ke Google Apps Script. Pastikan Web App URL dikonfigurasi dengan akses "Anyone".'
      });
    } finally {
      setTestingGAS(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (currentUser.role !== 'SUPER_ADMIN' && userForm.role === 'SUPER_ADMIN') {
      setUserError('Hak Akses Terbatas: Hanya SuperAdmin yang berhak membuat akun SuperAdmin baru.');
      return;
    }

    const trimmedUsername = userForm.username.trim().toLowerCase();
    if (!trimmedUsername || !userForm.nama) {
      setUserError('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    const globalUsers = StorageManager.getUsers();

    if (globalUsers.some((u) => u.username.toLowerCase() === trimmedUsername)) {
      setUserError(`Username "${trimmedUsername}" sudah digunakan oleh akun lain dalam sistem.`);
      return;
    }

    if (!userForm.password_hash) {
      setUserError('Password wajib diisi.');
      return;
    }

    if (userForm.password_hash !== userForm.confirm_password) {
      setUserError('Password dan Konfirmasi Password tidak cocok.');
      return;
    }

    const activeAdminTenantId = (currentUser.role !== 'SUPER_ADMIN' && currentUser.tenant_id && currentUser.tenant_id !== 'ALL')
      ? currentUser.tenant_id
      : StorageManager.getActiveTenantId();
    const assignedTenantId = userForm.role === 'SUPER_ADMIN' ? 'ALL' : activeAdminTenantId;

    let assignedJemaatId: string | undefined = undefined;
    if (userForm.role === 'JEMAAT') {
      const allJemaat = StorageManager.getJemaat();
      const match = allJemaat.find(
        (j) =>
          (j.nama_lengkap && userForm.nama && j.nama_lengkap.toLowerCase().trim() === userForm.nama.toLowerCase().trim()) ||
          (j.email && userForm.email && j.email.toLowerCase().trim() === userForm.email.trim().toLowerCase())
      );
      if (match) {
        assignedJemaatId = match.jemaat_id;
      } else {
        assignedJemaatId = `JMT-${(allJemaat.length + 1).toString().padStart(3, '0')}`;
        const newJemaatItem: Jemaat = {
          jemaat_id: assignedJemaatId,
          nik: '-',
          no_kk: '-',
          nama_lengkap: userForm.nama.trim(),
          jenis_kelamin: 'Laki-laki',
          tempat_lahir: '-',
          tanggal_lahir: '-',
          alamat: 'Alamat Jemaat',
          wilayah: 'Wilayah 01',
          komisi: 'Komisi Umum',
          status_baptis: 'Sudah',
          status_sidi: 'Sudah',
          status_pernikahan: 'Belum Menikah',
          pekerjaan: 'Swasta',
          nomor_hp: userForm.no_hp.trim() || '-',
          email: userForm.email.trim() || '-',
          foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          status: 'Aktif'
        };
        StorageManager.saveJemaat([newJemaatItem, ...allJemaat]);
      }
    }

    const newUser: User = {
      user_id: StorageManager.getNextUserId(),
      jemaat_id: assignedJemaatId,
      username: trimmedUsername,
      email: userForm.email.trim(),
      no_hp: userForm.no_hp.trim(),
      nama: userForm.nama.trim(),
      role: userForm.role,
      status: userForm.status,
      password_hash: userForm.password_hash.trim(),
      tenant_id: assignedTenantId,
      created_at: new Date().toLocaleString('id-ID')
    };

    const updatedGlobal = [newUser, ...globalUsers];
    StorageManager.saveUsers(updatedGlobal);
    setUsersList(updatedGlobal);
    StorageManager.logActivity(
      currentUser.username,
      `Menambahkan user baru: ${newUser.username} (${newUser.role})`,
      'User Management'
    );
    setIsUserModal(false);
    setUserSuccess(`Akun baru "${newUser.username}" (${newUser.role}) berhasil dibuat.`);
    setTimeout(() => setUserSuccess(''), 4000);
  };

  const handleOpenEditUser = (u: User) => {
    if (u.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      alert('Akses Terbatas: Hanya SuperAdmin yang berhak mengedit akun SuperAdmin.');
      return;
    }

    setUserError('');
    setEditingUser(u);
    setEditUserForm({
      user_id: u.user_id,
      username: u.username,
      nama: u.nama,
      email: u.email || '',
      no_hp: u.no_hp || '',
      role: u.role,
      status: u.status,
      new_password: '',
      confirm_password: ''
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!editingUser) return;

    if (currentUser.role !== 'SUPER_ADMIN' && editUserForm.role === 'SUPER_ADMIN') {
      setUserError('Hak Akses Terbatas: Hanya SuperAdmin yang berhak menetapkan role SuperAdmin.');
      return;
    }

    const trimmedUsername = editUserForm.username.trim().toLowerCase();
    if (!trimmedUsername || !editUserForm.nama) {
      setUserError('Username dan Nama Lengkap tidak boleh kosong.');
      return;
    }

    const globalUsers = StorageManager.getUsers();

    // Check duplicate username in global users
    const isDuplicate = globalUsers.some(
      (u) => u.user_id !== editingUser.user_id && u.username.toLowerCase() === trimmedUsername
    );
    if (isDuplicate) {
      setUserError(`Username "${trimmedUsername}" sudah dipakai user lain.`);
      return;
    }

    // Password change check
    let updatedPass = editingUser.password_hash;
    if (editUserForm.new_password) {
      if (editUserForm.new_password.length < 4) {
        setUserError('Password baru minimal 4 karakter.');
        return;
      }
      if (editUserForm.new_password !== editUserForm.confirm_password) {
        setUserError('Password baru dan konfirmasi password tidak cocok.');
        return;
      }
      updatedPass = editUserForm.new_password;
    }

    const activeAdminTenantId = currentUser.tenant_id || StorageManager.getActiveTenantId() || 'CHURCH-001';

    const updatedGlobal = globalUsers.map((u) => {
      if (u.user_id === editingUser.user_id) {
        return {
          ...u,
          username: trimmedUsername,
          nama: editUserForm.nama.trim(),
          email: editUserForm.email.trim(),
          no_hp: editUserForm.no_hp.trim(),
          role: editUserForm.role,
          status: editUserForm.status,
          password_hash: updatedPass,
          tenant_id: u.tenant_id || activeAdminTenantId
        };
      }
      return u;
    });

    StorageManager.saveUsers(updatedGlobal);
    setUsersList(StorageManager.getUsers());

    // If edited account is current logged in user, update current user session
    if (editingUser.username.toLowerCase() === currentUser.username.toLowerCase()) {
      const updatedSelf = updatedGlobal.find((u) => u.username.toLowerCase() === currentUser.username.toLowerCase());
      if (updatedSelf) {
        StorageManager.saveCurrentUser(updatedSelf);
      }
    }

    const logMsg = editUserForm.new_password
      ? `Memperbarui username (${trimmedUsername}) & memicu perubahan password untuk user ID ${editingUser.user_id}`
      : `Memperbarui data akun user: ${trimmedUsername}`;

    StorageManager.logActivity(currentUser.username, logMsg, 'User Management');
    setEditingUser(null);
    setUserSuccess(`Data akun "${trimmedUsername}" berhasil diperbarui.`);
    setTimeout(() => setUserSuccess(''), 3000);
  };

  const handleQuickResetPassword = async (u: User) => {
    if (u.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      alert('Akses Terbatas: Hanya SuperAdmin yang berhak mereset password SuperAdmin.');
      return;
    }

    if (currentUser.role !== 'SUPER_ADMIN') {
      const uTenant = u.tenant_id || 'CHURCH-001';
      if (uTenant !== activeAdminTenantId) {
        alert('Akses Ditolak: Anda hanya berhak mengelola akun milik gereja Anda sendiri.');
        return;
      }
    }

    const newRandomPass = generateRandomPassword();
    const ok = await confirmDialog({
      title: 'Reset Password User',
      message: `Reset password untuk user "${u.username}" (${u.nama})?\n\nPassword baru yang akan dibuat: ${newRandomPass}`,
      confirmText: 'Ya, Reset Password',
      cancelText: 'Batal',
      isDanger: false,
    });
    if (ok) {
      const globalUsers = StorageManager.getUsers();
      const updatedGlobal = globalUsers.map((item) => {
        if (item.user_id === u.user_id) {
          return { ...item, password_hash: newRandomPass };
        }
        return item;
      });

      StorageManager.saveUsers(updatedGlobal);
      setUsersList(updatedGlobal);
      StorageManager.logActivity(
        currentUser.username,
        `Mereset password user ${u.username} ke password acak baru`,
        'User Management'
      );
      alert(`Password untuk ${u.username} telah direset!\n\nPassword Baru: ${newRandomPass}\nHarap berikan password ini kepada pengguna.`);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (u.user_id === currentUser.user_id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }

    if (u.username === 'superadmin' || u.role === 'SUPER_ADMIN') {
      alert('Akun Super Admin tidak boleh dihapus.');
      return;
    }

    if (u.username.toLowerCase() === 'admin_monapa') {
      alert('Akun Admin Monapa Puriala adalah akun sistem utama dan tidak dapat dihapus.');
      return;
    }

    if (currentUser.role !== 'SUPER_ADMIN') {
      const uTenant = u.tenant_id || 'CHURCH-001';
      if (uTenant !== activeAdminTenantId) {
        alert('Akses Ditolak: Anda hanya berhak menghapus akun milik gereja Anda sendiri.');
        return;
      }
    }

    const ok = await confirmDialog({
      title: 'Hapus Permanen Akun',
      message: `Hapus permanen akun "${u.username}" (${u.nama}) dari sistem?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    StorageManager.deleteUser(u.user_id, u.username, u.jemaat_id, u.nama);
    const updatedGlobal = StorageManager.getUsers();
    setUsersList(updatedGlobal);
    StorageManager.logActivity(
      currentUser.username,
      `Menghapus akun pengguna: ${u.username}`,
      'User Management'
    );
    setUserSuccess(`Akun "${u.username}" telah berhasil dihapus secara permanen.`);
    setTimeout(() => setUserSuccess(''), 3000);
  };

  const handleToggleUserStatus = (userId: string) => {
    const globalUsers = StorageManager.getUsers();
    const targetUser = globalUsers.find((u) => u.user_id === userId);

    if (targetUser && targetUser.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      alert('Akses Terbatas: Hanya SuperAdmin yang berhak merubah status akun SuperAdmin.');
      return;
    }

    if (targetUser && currentUser.role !== 'SUPER_ADMIN') {
      const uTenant = targetUser.tenant_id || 'CHURCH-001';
      if (uTenant !== activeAdminTenantId) {
        alert('Akses Ditolak: Anda hanya berhak merubah status akun milik gereja Anda sendiri.');
        return;
      }
    }

    const updatedGlobal = globalUsers.map((u) => {
      if (u.user_id === userId) {
        const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        return { ...u, status: nextStatus as any };
      }
      return u;
    });

    StorageManager.saveUsers(updatedGlobal);
    setUsersList(updatedGlobal);
  };

  const toggleTablePasswordVisible = (userId: string) => {
    setShowPasswordInTable((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleResetDataToDefaults = async () => {
    const ok = await confirmDialog({
      title: 'Reset Data Sistem ke Default',
      message: 'APAKAH ANDA YAKIN? Semua data akan di-reset kembali ke data default 18 sheets.',
      confirmText: 'Ya, Reset Semua Data',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (ok) {
      StorageManager.resetAllDataToDefaults();
      loadData();
      alert('Data sistem telah berhasil di-reset ke kondisi awal.');
    }
  };

  // Filtered Users List per Tenant Access Rights & Strict Multi-Tenant Isolation
  const tenantsList = StorageManager.getTenants();
  const currentActiveTenantId = StorageManager.getActiveTenantId() || 'CHURCH-001';
  const activeAdminTenantId = (currentUser.role !== 'SUPER_ADMIN' && currentUser.tenant_id && currentUser.tenant_id !== 'ALL')
    ? currentUser.tenant_id
    : currentActiveTenantId;
  const currentActiveTenant = tenantsList.find((t) => t.tenant_id === activeAdminTenantId) || null;
  const activeChurchName = currentActiveTenant?.nama_gereja || settings?.nama_gereja || 'Gereja Ini';

  const tenantScopedUsers = usersList.filter((u) => {
    const userTenant = u.tenant_id || (u.role === 'SUPER_ADMIN' ? 'ALL' : 'CHURCH-001');

    // 1. NON-SUPERADMIN (Admin, Jemaat) - STRICT MULTI-TENANT ISOLATION:
    if (currentUser.role !== 'SUPER_ADMIN') {
      // NEVER allow viewing SuperAdmin or global system accounts
      if (u.role === 'SUPER_ADMIN' || u.username.toLowerCase() === 'superadmin' || userTenant === 'ALL') {
        return false;
      }
      // MUST strictly belong to the current admin's church tenant only
      return userTenant === activeAdminTenantId;
    }

    // 2. SUPERADMIN - DEFAULT TO CURRENT ACTIVE CHURCH ISOLATION:
    // When SuperAdmin enters or switches to a church workspace, ONLY show accounts belonging to that church!
    if (filterTenantScope === 'CURRENT_CHURCH') {
      return userTenant === activeAdminTenantId;
    }

    // Only if SuperAdmin explicitly switches the scope selector to 'ALL_CHURCHES' will all accounts be visible
    return true;
  });

  const filteredUsers = tenantScopedUsers.filter((u) => {
    const matchQuery =
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    const matchStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchQuery && matchRole && matchStatus;
  });

  // Dynamic Background & Contrast Detection
  const activePreset = metaForm?.theme_preset || settings?.theme_preset || 'EMERALD_LIGHT';
  const isDark =
    activePreset === 'DARK_SLATE' ||
    activePreset === 'MIDNIGHT_BLUE' ||
    activePreset === 'DEEP_PURPLE' ||
    activePreset === 'FOREST_GREEN' ||
    activePreset === 'WARM_GOLD';
  const isLight = !isDark;

  const currentThemeHex = (metaForm?.warna_tema || settings?.warna_tema || '#059669').trim();
  const isThemeHexLight = isColorLight(currentThemeHex);
  const themeContrastTextColor = isThemeHexLight ? '#0f172a' : '#ffffff';

  // Helper for contrast text on any background hex
  const getContrastText = (hexColor?: string, darkText = '#0f172a', lightText = '#ffffff') => {
    return isColorLight(hexColor) ? darkText : lightText;
  };

  // Adaptive classes for sections & cards
  const cardContainerClass = `rounded-3xl border-2 p-6 space-y-4 shadow-xl transition-all duration-300 ${
    isLight
      ? 'bg-white border-teal-100 text-slate-800 shadow-teal-900/5'
      : 'bg-slate-900/95 border-slate-800 text-white shadow-2xl'
  }`;
  const sectionTitleClass = `text-base font-extrabold pb-3 border-b flex items-center justify-between ${
    isLight ? 'text-slate-900 border-teal-100' : 'text-white border-slate-800'
  }`;
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
    isLight
      ? 'bg-slate-50 border-teal-200 text-slate-800 focus:bg-white focus:border-teal-500'
      : 'bg-slate-950 border-slate-700 text-white focus:border-teal-400'
  }`;
  const labelClass = `block mb-1 font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`;

  return (
    <div className="space-y-6 pb-32 sm:pb-24">
      {/* Header Title Section */}
      <div className={`flex flex-col gap-1.5 pb-4 border-b ${isLight ? 'border-teal-100' : 'border-slate-800'}`}>
        <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          <ShieldCheck className="w-6 h-6 text-teal-600" />
          <span>Pengaturan &amp; Kustomisasi Sistem</span>
        </h2>
        <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
          {currentUser.role === 'SUPER_ADMIN'
            ? 'Kontrol penuh profil gereja, kustomisasi visual, video social, Google Sheets GAS, Firebase API & RBAC Users.'
            : 'Kelola profil gereja, judul dashboard, tema warna, logo, video media sosial, serta akun user (Admin & Jemaat).'}
        </p>
      </div>

      {/* Tab Navigation Menu (Sticky, Scrollable & Bebas Tertutup Layar) */}
      <div className={`sticky top-20 z-20 backdrop-blur-md py-2.5 -mx-2 px-2 sm:-mx-4 sm:px-4 border-b transition-colors ${
        isLight ? 'bg-white/95 border-teal-100 shadow-xs' : 'bg-slate-900/95 border-slate-800 shadow-md'
      }`}>
        <div className="w-full overflow-x-auto scrollbar-thin pb-1">
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl min-w-max transition-colors ${
            isLight ? 'bg-teal-50/80 border border-teal-200 shadow-inner' : 'bg-slate-950/80 border border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('METADATA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'METADATA'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                  : isLight
                  ? 'text-slate-700 hover:text-teal-900 hover:bg-white/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-500" />
              <span>1. Profil, Tema &amp; Navbar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PUSH_NOTIF')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'PUSH_NOTIF'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                  : isLight
                  ? 'text-slate-700 hover:text-teal-900 hover:bg-white/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>2. 🔔 Notifikasi HP (Website 2 APK)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ANDROID_STUDIO')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'ANDROID_STUDIO'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25 ring-1 ring-teal-400'
                  : isLight
                  ? 'text-slate-700 hover:text-teal-900 hover:bg-white/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>3. 📱 Android Studio &amp; FCM Pro</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                isLight ? 'bg-teal-100 text-teal-900 border-teal-300' : 'bg-teal-900/60 text-teal-200 border-teal-500/50'
              }`}>
                Fix Build
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'USERS'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                  : isLight
                  ? 'text-slate-700 hover:text-teal-900 hover:bg-white/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Users className="w-4 h-4 text-teal-700" />
              <span>4. Manajemen User ({tenantScopedUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentUser.role !== 'SUPER_ADMIN') {
                  alert('Akses Terbatas! Pengaturan Google Sheets GAS & Firebase API hanya dapat dikonfigurasi oleh SuperAdmin.');
                  return;
                }
                setActiveTab('GAS_FIREBASE');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'GAS_FIREBASE'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                  : isLight
                  ? 'text-slate-700 hover:text-teal-900 hover:bg-white/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${currentUser.role !== 'SUPER_ADMIN' ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {currentUser.role !== 'SUPER_ADMIN' ? (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              )}
              <span>5. Google Sheets &amp; Firebase</span>
            </button>

            {currentUser.role === 'SUPER_ADMIN' && (
              <button
                type="button"
                onClick={() => setActiveTab('AUDIT')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'AUDIT'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                    : isLight
                    ? 'text-slate-700 hover:text-teal-900 hover:bg-white/90'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Activity className="w-4 h-4 text-amber-500" />
                <span>6. Audit Logs ({activityLogs.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Notice for Admin */}
      {currentUser.role === 'ADMIN' && (
        <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
          isLight
            ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-xs'
            : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-100 shadow-inner'
        }`}>
          <AlertCircle className={`w-5 h-5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <div>
            <span className={`font-bold block text-xs sm:text-sm ${isLight ? 'text-indigo-950' : 'text-indigo-200'}`}>Akses Level Admin Gereja:</span>
            <span className={`text-[11px] sm:text-xs leading-relaxed ${isLight ? 'text-indigo-900 font-medium' : 'text-indigo-200/90'}`}>
              Anda dapat mengubah profil gereja, judul dashboard, tema warna, logo, dan tautan video media sosial, serta mengelola akun User (Admin &amp; JEMAAT) dan password untuk gereja Anda. Fitur Google Sheets REST API &amp; Audit Logs dikunci khusus untuk SuperAdmin.
            </span>
          </div>
        </div>
      )}

      {/* Tab 1: Metadata profil gereja & Custom Visual */}
      {activeTab === 'METADATA' && (
        <div className="space-y-6">
          {/* Quick Jump Banner for Navbar */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition-all ${
            isLight
              ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-amber-300 text-slate-900'
              : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-amber-500/40 text-white shadow-xl'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border shrink-0 ${
                isLight
                  ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-black flex items-center gap-2 ${
                  isLight ? 'text-amber-950' : 'text-amber-300'
                }`}>
                  <span>Pengaturan Warna &amp; Tema Navbar (Bar Navigasi Paling Atas)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isLight
                      ? 'bg-amber-200/90 text-amber-950 border-amber-400'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    Lokasi di Sini
                  </span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${
                  isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
                }`}>
                  Ubah tema warna preset, kode hex bebas, blur, dan garis bawah navbar di sini atau melalui tombol <strong className={isLight ? 'text-amber-950 font-bold' : 'text-amber-300'}>"Warna Navbar"</strong> di bar paling atas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('navbar-customizer-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
            >
              <span>Lompat ke Pengaturan Navbar</span>
              <ArrowDown className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          {savedSuccess && (
            <div className={`p-4 border-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-between gap-3 shadow-md animate-bounce ${
              isLight
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 shadow-2xl'
            }`}>
              <div className="flex items-center gap-2">
                <Check className={`w-5 h-5 shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                <span>✅ Perubahan berhasil disimpan! Pengaturan Lebar Kartu &amp; Kustomisasi Tampilan Portal/Dashboard Jemaat telah diperbarui secara realtime.</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg shrink-0 ${
                isLight
                  ? 'bg-emerald-200 text-emerald-950 font-bold border border-emerald-300'
                  : 'bg-emerald-600/40 text-emerald-200'
              }`}>Status: Tersimpan</span>
            </div>
          )}

          <form onSubmit={handleSaveMeta} className="space-y-6 text-xs">
            {/* Section 1: Identitas & Informasi Gereja */}
            <div className={cardContainerClass}>
              <h3 className={sectionTitleClass}>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>1. Identitas &amp; Profil Gereja</span>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isLight ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950/60 border-teal-700'
                }`}>
                  Header &amp; Contact Info
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nama Gereja *</label>
                  <input
                    type="text"
                    required
                    value={metaForm.nama_gereja}
                    onChange={(e) => setMetaForm({ ...metaForm, nama_gereja: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className={`sm:col-span-2 space-y-3 p-4 rounded-2xl border transition-colors ${
                  isLight ? 'bg-teal-50/50 border-teal-200/80 text-teal-950' : 'bg-slate-950/80 border-slate-800 text-slate-200'
                }`}>
                  <label className={`font-bold flex items-center gap-1.5 text-xs ${isLight ? 'text-teal-900' : 'text-teal-300'}`}>
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    <span>Logo &amp; Gambar Identitas Gereja (Tersinkronisasi Realtime)</span>
                  </label>

                  <div className={`flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl border shadow-2xs transition-colors ${
                    isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                  }`}>
                    <div className="shrink-0 relative">
                      <img
                        src={metaForm.logo || DEFAULT_CHURCH_LOGO}
                        alt="Logo Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_CHURCH_LOGO;
                        }}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md bg-white p-1"
                      />
                      <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-teal-600 text-[9px] font-bold text-white rounded-full">
                        Preview
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={metaForm.logo || ''}
                          placeholder="Paste URL Gambar Logo atau Upload File..."
                          onChange={(e) => setMetaForm({ ...metaForm, logo: e.target.value })}
                          className={`flex-1 px-3 py-2 rounded-xl font-mono text-[11px] outline-none border ${
                            isLight
                              ? 'bg-slate-50 border-teal-200 text-slate-800 focus:bg-white focus:border-teal-500'
                              : 'bg-slate-950 border-slate-700 text-white focus:border-teal-400'
                          }`}
                        />
                        <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs">
                          <Upload className="w-4 h-4" />
                          <span>Upload File Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  if (evt.target?.result) {
                                    setMetaForm({ ...metaForm, logo: evt.target.result as string });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Pilih Preset Logo:</span>
                        <button
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, logo: DEFAULT_CHURCH_LOGO })}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                            isLight ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100' : 'bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          Gold Cross Badge
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setMetaForm({
                              ...metaForm,
                              logo: 'https://images.unsplash.com/photo-1548625361-185966347898?w=300&auto=format&fit=crop&q=80'
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold ${
                            isLight ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          Cathedral Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Judul Header Dashboard</label>
                  <input
                    type="text"
                    value={metaForm.header_title || ''}
                    placeholder="Jesus Kingdom Christ"
                    onChange={(e) => setMetaForm({ ...metaForm, header_title: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Subtitle Header Dashboard</label>
                  <input
                    type="text"
                    value={metaForm.header_subtitle || ''}
                    placeholder="Sistem Informasi Management & Portal Layanan Jemaat"
                    onChange={(e) => setMetaForm({ ...metaForm, header_subtitle: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Alamat Lengkap</label>
                  <input
                    type="text"
                    value={metaForm.alamat}
                    onChange={(e) => setMetaForm({ ...metaForm, alamat: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor Telepon / Hotline</label>
                  <input
                    type="text"
                    value={metaForm.telepon}
                    onChange={(e) => setMetaForm({ ...metaForm, telepon: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Resmi Sekretariat</label>
                  <input
                    type="email"
                    value={metaForm.email}
                    onChange={(e) => setMetaForm({ ...metaForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Website Resmi</label>
                  <input
                    type="text"
                    value={metaForm.website || ''}
                    onChange={(e) => setMetaForm({ ...metaForm, website: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Section 1.2: Pengaturan Bar Teks Berjalan Atas (Running Text / Marquee Ticker) */}
            <div className={cardContainerClass}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className={sectionTitleClass}>
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      <span>Pengaturan Teks Berjalan Atas (Marquee Header Ticker)</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isLight ? 'text-teal-800 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950/60 border-teal-700'
                    }`}>
                      Tampilan Mobile &amp; Desktop
                    </span>
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    Atur teks berjalan di atas navbar yang tampil pada layar handphone/desktop untuk warta singkat, nama gereja, dan informasi sistem manajemen.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pratinjau Langsung (Live Preview)
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    Sentuh atau arahkan kursor untuk menjeda teks
                  </span>
                </div>
                <div className="h-8 bg-teal-950 rounded-xl text-white/90 text-xs px-3 sm:px-4 flex items-center overflow-hidden font-medium select-none shadow-inner border border-teal-900/60">
                  <div className="flex items-center gap-2 shrink-0 pr-2.5 sm:pr-3 z-10 bg-teal-950">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                    <span className="font-bold uppercase tracking-wider text-[10px] text-teal-300 shrink-0">
                      CMS GEREJA
                    </span>
                    <span className="text-teal-700/80 select-none">|</span>
                  </div>

                  <div className="flex-1 overflow-hidden relative flex items-center min-w-0">
                    {metaForm.topbar_marquee_enabled !== false ? (
                      <div
                        className={`flex w-max shrink-0 cursor-default select-none ${
                          metaForm.topbar_speed === 'slow'
                            ? 'animate-marquee-slow'
                            : metaForm.topbar_speed === 'fast'
                            ? 'animate-marquee-fast'
                            : 'animate-marquee-normal'
                        }`}
                      >
                        {/* Segment 1 */}
                        <div className="flex items-center shrink-0">
                          <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                            {metaForm.topbar_text && metaForm.topbar_text.trim()
                              ? metaForm.topbar_text.trim()
                              : `${metaForm.nama_gereja || 'Jesus Kingdom Christ'} — ${metaForm.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`}
                          </span>
                          <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                          <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                            {metaForm.topbar_text && metaForm.topbar_text.trim()
                              ? metaForm.topbar_text.trim()
                              : `${metaForm.nama_gereja || 'Jesus Kingdom Christ'} — ${metaForm.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`}
                          </span>
                          <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                        </div>

                        {/* Segment 2 */}
                        <div className="flex items-center shrink-0" aria-hidden="true">
                          <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                            {metaForm.topbar_text && metaForm.topbar_text.trim()
                              ? metaForm.topbar_text.trim()
                              : `${metaForm.nama_gereja || 'Jesus Kingdom Christ'} — ${metaForm.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`}
                          </span>
                          <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                          <span className="px-4 sm:px-6 text-[11px] sm:text-xs text-white/95 font-medium whitespace-nowrap">
                            {metaForm.topbar_text && metaForm.topbar_text.trim()
                              ? metaForm.topbar_text.trim()
                              : `${metaForm.nama_gereja || 'Jesus Kingdom Christ'} — ${metaForm.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`}
                          </span>
                          <span className="text-teal-400/60 select-none text-[9px] sm:text-[10px]">✦</span>
                        </div>
                      </div>
                    ) : (
                      <span className="font-semibold tracking-wide truncate text-[11px] sm:text-xs text-white/95">
                        {metaForm.topbar_text && metaForm.topbar_text.trim()
                          ? metaForm.topbar_text.trim()
                          : `${metaForm.nama_gereja || 'Jesus Kingdom Christ'} — ${metaForm.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* 1. Toggle Tampilkan Bar Atas */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Tampilkan Bar Atas</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Aktifkan bar kecil di atas navbar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metaForm.show_topbar !== false}
                      onChange={(e) => setMetaForm({ ...metaForm, show_topbar: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* 2. Toggle Animasi Marquee Teks Berjalan */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Efek Teks Berjalan (Marquee)</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Teks bergerak halus melintasi layar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metaForm.topbar_marquee_enabled !== false}
                      onChange={(e) => setMetaForm({ ...metaForm, topbar_marquee_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              {/* 3. Input Kustom Teks Berjalan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Isi Tulisan / Teks Berjalan</label>
                  {metaForm.topbar_text && (
                    <button
                      type="button"
                      onClick={() => setMetaForm({ ...metaForm, topbar_text: '' })}
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    >
                      Reset ke Teks Otomatis
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={metaForm.topbar_text || ''}
                  placeholder={`CMS GEREJA • ${metaForm.nama_gereja || 'Jesus Kingdom Christ'} — ${metaForm.header_subtitle || 'Sistem Informasi Manajemen & Pelayanan Jemaat'}`}
                  onChange={(e) => setMetaForm({ ...metaForm, topbar_text: e.target.value })}
                  className={inputClass}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tip: Jika dikosongkan, sistem otomatis memakai format: <span className="font-mono text-teal-600 dark:text-teal-400">[Nama Gereja] — [Subtitle Header]</span>. Anda dapat menuliskan warta jemaat atau pengumuman khusus di sini.
                </p>
              </div>

              {/* 4. Kecepatan Teks Berjalan */}
              <div className="space-y-2">
                <label className={labelClass}>Pilihan Kecepatan Gerak Teks</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'slow', label: '🐢 Lambat (36s)', desc: 'Nyaman dibaca' },
                    { id: 'normal', label: '🚶 Sedang (22s)', desc: 'Kecepatan standar' },
                    { id: 'fast', label: '⚡ Cepat (14s)', desc: 'Animasi dinamis' }
                  ].map((spd) => {
                    const isSelected = (metaForm.topbar_speed || 'normal') === spd.id;
                    return (
                      <button
                        type="button"
                        key={spd.id}
                        onClick={() => setMetaForm({ ...metaForm, topbar_speed: spd.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/30'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{spd.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{spd.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 1.5: Pengaturan Rekening Bank & QRIS Persembahan Digital */}
            <div className={cardContainerClass}>
              <h3 className={sectionTitleClass}>
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <span>Pengaturan Rekening Bank &amp; QRIS Persembahan Digital</span>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isLight ? 'text-teal-800 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950/60 border-teal-700'
                }`}>
                  Transfer Dashboard Jemaat
                </span>
              </h3>

              <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Informasi bank dan barcode QRIS ini akan ditampilkan kepada jemaat pada Portal Jemaat ketika melakukan transfer persembahan / perpuluhan digital.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Nama Bank *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bank BCA / Mandiri / BRI"
                    value={metaForm.rekening_bank_nama || ''}
                    onChange={(e) => setMetaForm({ ...metaForm, rekening_bank_nama: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor Rekening Bank *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 527-089-1122"
                    value={metaForm.rekening_bank_nomor || ''}
                    onChange={(e) => setMetaForm({ ...metaForm, rekening_bank_nomor: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Atas Nama Rekening *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jesus Kingdom Christ"
                    value={metaForm.rekening_bank_atas_nama || ''}
                    onChange={(e) => setMetaForm({ ...metaForm, rekening_bank_atas_nama: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* QRIS Image Upload / Link */}
              <div className={`space-y-3 p-4 rounded-2xl border transition-colors ${
                isLight ? 'bg-teal-50/50 border-teal-200/80 text-teal-950' : 'bg-slate-950/80 border-slate-800 text-slate-200'
              }`}>
                <label className={`font-bold flex items-center gap-1.5 text-xs ${isLight ? 'text-teal-900' : 'text-teal-300'}`}>
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>Gambar / Barcode Kode QRIS Gereja</span>
                </label>

                <div className={`flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl border shadow-2xs transition-colors ${
                  isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                }`}>
                  {metaForm.qris_image_url ? (
                    <div className="shrink-0 relative">
                      <img
                        src={metaForm.qris_image_url}
                        alt="QRIS Preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-500/80 shadow-md bg-white p-1 ring-2 ring-teal-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-teal-600 text-[9px] font-bold text-white rounded-full">
                        QRIS Active
                      </span>
                    </div>
                  ) : (
                    <div className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center text-xs text-center p-2 ${
                      isLight ? 'border-teal-300 text-teal-700 bg-teal-50/30' : 'border-slate-700 text-slate-400 bg-slate-950'
                    }`}>
                      Belum ada QRIS
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={metaForm.qris_image_url || ''}
                        placeholder="Paste URL Gambar Kode QRIS atau Upload File..."
                        onChange={(e) => setMetaForm({ ...metaForm, qris_image_url: e.target.value })}
                        className={`flex-1 px-3 py-2 rounded-xl font-mono text-[11px] outline-none border ${
                          isLight
                            ? 'bg-slate-50 border-teal-200 text-slate-800 focus:bg-white focus:border-teal-500'
                            : 'bg-slate-950 border-slate-700 text-white focus:border-teal-400'
                        }`}
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Upload QRIS</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) {
                                  setMetaForm({ ...metaForm, qris_image_url: evt.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Format disarankan: PNG / JPEG / WebP / SVG. Gambar QRIS akan dipindai oleh aplikasi mobile banking / m-banking jemaat.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Tema Warna, Background & Custom Visual Admin */}
            <div className={cardContainerClass}>
              <h3 className={sectionTitleClass}>
                <span className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-teal-600" />
                  <span>2. Kustomisasi Tema Warna &amp; Style Dashboard Admin</span>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isLight ? 'text-teal-800 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950/60 border-teal-700'
                }`}>
                  Visual Styling
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Preset Warna Background */}
                <div className="space-y-2">
                  <label className={labelClass}>Preset Background Admin</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'EMERALD_LIGHT', label: '🌿 Emerald Light (Universal)', bg: 'from-emerald-50 via-teal-50 to-white', isLight: true, border: 'border-emerald-500' },
                      { id: 'DARK_SLATE', label: '🌌 Dark Slate', bg: 'from-slate-900 to-indigo-950', isLight: false, border: 'border-indigo-500/50' },
                      { id: 'MIDNIGHT_BLUE', label: '💙 Midnight Blue', bg: 'from-slate-950 to-blue-950', isLight: false, border: 'border-blue-500/50' },
                      { id: 'DEEP_PURPLE', label: '💜 Amethyst Dark', bg: 'from-neutral-950 to-purple-950', isLight: false, border: 'border-purple-500/50' },
                      { id: 'FOREST_GREEN', label: '🌲 Emerald Dark', bg: 'from-stone-950 to-emerald-950', isLight: false, border: 'border-emerald-500/50' },
                      { id: 'WARM_GOLD', label: '⚜️ Warm Gold Luxe', bg: 'from-neutral-950 to-amber-950', isLight: false, border: 'border-amber-500/50' },
                      { id: 'LUXE_LIGHT', label: '☀️ Minimalist Light', bg: 'from-slate-100 to-white', isLight: true, border: 'border-slate-300' }
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setMetaForm({ ...metaForm, theme_preset: t.id as any })}
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${t.bg} border text-left text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                          t.isLight ? 'text-slate-900' : 'text-white'
                        } ${
                          (metaForm.theme_preset || 'EMERALD_LIGHT') === t.id
                            ? `${t.border} ring-2 ring-teal-500 shadow-md scale-[1.02]`
                            : isLight
                            ? 'border-slate-200 opacity-75 hover:opacity-100'
                            : 'border-slate-700 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <span className="truncate">{t.label}</span>
                        {(metaForm.theme_preset || 'EMERALD_LIGHT') === t.id && (
                          <Check className={`w-3.5 h-3.5 shrink-0 ${t.isLight ? 'text-teal-600' : 'text-teal-400'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Unlimited Hex Color Picker */}
                <div className={`sm:col-span-2 lg:col-span-3 p-4 sm:p-5 rounded-2xl border space-y-4 transition-colors ${
                  isLight ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className={`block font-extrabold text-xs sm:text-sm ${isLight ? 'text-teal-900' : 'text-teal-300'}`}>
                        🎨 Kustom Kode Warna Hex (Contoh: #059669) - Bebas Tanpa Batas
                      </label>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                        Kustomisasi warna tema bebas dengan memasukkan kode hex apa saja (seperti #059669, #0F766E, #10B981). Berlaku untuk tampilan Admin &amp; Akun Jemaat.
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-2xl border-2 border-white/80 shadow-md shrink-0 flex items-center justify-center font-mono text-[10px] font-black"
                      style={{
                        backgroundColor: metaForm.warna_tema || '#059669',
                        color: isColorLight(metaForm.warna_tema || '#059669') ? '#0f172a' : '#ffffff'
                      }}
                    >
                      {metaForm.warna_tema || '#059669'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    {/* Hex Code Text Input */}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>HEX:</span>
                        <input
                          type="text"
                          value={metaForm.warna_tema || '#059669'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMetaForm({ ...metaForm, warna_tema: val });
                          }}
                          placeholder="#059669"
                          className={`w-full pl-14 pr-4 py-2.5 rounded-xl border font-mono font-extrabold text-sm focus:ring-2 focus:ring-teal-500 outline-none uppercase ${
                            isLight
                              ? 'bg-white border-teal-200 text-slate-900'
                              : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                      </div>
                      {/* HTML Color Picker Button */}
                      <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-bold shrink-0 shadow-2xs ${
                        isLight
                          ? 'bg-white hover:bg-teal-50 border-teal-200 text-teal-800'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-teal-300'
                      }`}>
                        <input
                          type="color"
                          value={metaForm.warna_tema && /^#[0-9A-F]{6}$/i.test(metaForm.warna_tema) ? metaForm.warna_tema : '#059669'}
                          onChange={(e) => setMetaForm({ ...metaForm, warna_tema: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span>Pilih Visual</span>
                      </label>
                    </div>

                    {/* Live Preview Button Tag */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Pratinjau:</span>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-md transition-all"
                        style={{
                          backgroundColor: metaForm.warna_tema || '#059669',
                          color: isColorLight(metaForm.warna_tema || '#059669') ? '#0f172a' : '#ffffff'
                        }}
                      >
                        Warna Utama
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Color Hex Chips */}
                  <div>
                    <span className={`text-[11px] font-bold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Rekomendasi Warna Hex Populer:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Terracotta', hex: '#CD5C5C' },
                        { name: 'Royal Indigo', hex: '#4F46E5' },
                        { name: 'Emerald', hex: '#059669' },
                        { name: 'Warm Amber', hex: '#D97706' },
                        { name: 'Crimson Rose', hex: '#E11D48' },
                        { name: 'Ocean Sky', hex: '#0284C7' },
                        { name: 'Amethyst', hex: '#7C3AED' },
                        { name: 'Fuchsia', hex: '#D946EF' },
                        { name: 'Deep Teal', hex: '#0F766E' },
                        { name: 'Warm Gold', hex: '#B45309' }
                      ].map((chip) => {
                        const isSelected = (metaForm.warna_tema || '#059669').toUpperCase() === chip.hex.toUpperCase();
                        const isChipLight = isColorLight(chip.hex);
                        return (
                          <button
                            key={chip.hex}
                            type="button"
                            onClick={() => setMetaForm({ ...metaForm, warna_tema: chip.hex })}
                            style={isSelected ? { backgroundColor: chip.hex, color: isChipLight ? '#0f172a' : '#ffffff', borderColor: chip.hex } : undefined}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'shadow-md scale-105 ring-2 ring-teal-500 font-extrabold'
                                : isLight
                                ? 'border-teal-200 bg-white text-slate-800 hover:bg-teal-50 hover:border-teal-300 shadow-2xs'
                                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: chip.hex }} />
                            <span>{chip.name} ({chip.hex})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <label className={labelClass}>Warna Aksen Utama System</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'INDIGO', label: '🟣 Royal Indigo', color: 'bg-indigo-600' },
                      { id: 'EMERALD', label: '🟢 Emerald Green', color: 'bg-emerald-600' },
                      { id: 'AMBER', label: '🟡 Radiant Amber', color: 'bg-amber-600' },
                      { id: 'ROSE', label: '🔴 Crimson Rose', color: 'bg-rose-600' },
                      { id: 'CYAN', label: '🔵 Ocean Cyan', color: 'bg-cyan-600' },
                      { id: 'ROYAL_GOLD', label: '⚜️ Royal Gold', color: 'bg-yellow-600' }
                    ].map((ac) => (
                      <button
                        type="button"
                        key={ac.id}
                        onClick={() => setMetaForm({ ...metaForm, accent_color: ac.id as any })}
                        className={`p-2.5 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                          (metaForm.accent_color || 'INDIGO') === ac.id
                            ? 'border-teal-500 ring-2 ring-teal-300 bg-teal-50 text-teal-950 shadow-sm'
                            : isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                            : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-3 h-3 rounded-full ${ac.color}`} />
                          <span>{ac.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Kartu */}
                <div className="space-y-2">
                  <label className={labelClass}>Style Kartu &amp; Border</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'GLASS', label: '✨ Glassmorphism', desc: 'Blur Transparan' },
                      { id: 'SOLID', label: '⬛ Solid Light', desc: 'Putih Pekat Bersih' },
                      { id: 'NEON', label: '💡 Neon Accent', desc: 'Glow Menyala' },
                      { id: 'FLAT', label: '📄 Flat Bordered', desc: 'Simpel Flat' }
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setMetaForm({ ...metaForm, card_style: c.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          (metaForm.card_style || 'GLASS') === c.id
                            ? 'border-teal-500 ring-2 ring-teal-300 bg-teal-50 text-teal-950 shadow-sm'
                            : isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                            : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{c.label}</div>
                        <div className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>{c.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Garis Pinggir Kartu (Border Line Accent) */}
                <div className="space-y-2">
                  <label className={labelClass}>Gaya Garis Pinggir Kartu (Border Color)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'ACCENT_FULL', label: '🔲 Border Warna Tema', desc: 'Penuh Warna Custom' },
                      { id: 'ACCENT_LEFT', label: '▌ Garis Kiri Tebal', desc: 'Aksen Garis Kiri' },
                      { id: 'ACCENT_TOP', label: '▀ Garis Atas Tebal', desc: 'Aksen Garis Atas' },
                      { id: 'ACCENT_GLOW', label: '✨ Glowing Border', desc: 'Efek Glow Transparan' }
                    ].map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => setMetaForm({ ...metaForm, card_border_accent: b.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          (metaForm.card_border_accent || 'ACCENT_FULL') === b.id
                            ? 'border-teal-500 ring-2 ring-teal-300 bg-teal-50 text-teal-950 shadow-sm'
                            : isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                            : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{b.label}</div>
                        <div className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUB-SECTION 2.1: KUSTOMISASI BUTTON ICON & TOMBOL MENU CEPAT (SELURUH APLIKASI) */}
                <div id="button-icon-customizer-section" className={`sm:col-span-2 lg:col-span-3 p-4 sm:p-6 rounded-2xl border-2 space-y-5 scroll-mt-24 shadow-sm transition-colors ${
                  isLight ? 'bg-teal-50/70 border-teal-300 text-slate-800' : 'bg-slate-900 border-teal-500/50 text-white'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isLight ? 'border-teal-200' : 'border-slate-800'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-base font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <span>Kustomisasi Background &amp; Bentuk Button Icon (Tombol Icon)</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isLight ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-teal-900/60 text-teal-200 border-teal-700'}`}>
                            Fitur Baru
                          </span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          Atur latar belakang (background), warna simbol, bentuk (lingkaran, kotak, rounded), dan efek glow pada tombol icon di menu cepat, modul, dan kartu.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Interactive Preview Box for Button Icons */}
                  {(() => {
                    const iconTheme = getButtonIconTheme(metaForm);
                    return (
                      <div className={`space-y-2 p-4 rounded-2xl border shadow-xs transition-colors ${
                        isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}>
                        <div className={`flex items-center justify-between text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          <span className={`flex items-center gap-1.5 ${isLight ? 'text-teal-800' : 'text-teal-300'}`}>
                            <Eye className="w-4 h-4 text-teal-600" />
                            <span>Pratinjau Langsung Button Icon (Menu Cepat &amp; Modul):</span>
                          </span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Preset: {metaForm.button_icon_preset || 'MATCH_THEME'} &bull; Bentuk: {metaForm.button_icon_shape || 'ROUNDED_XL'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                          {[
                            { label: 'Data Jemaat', icon: Users, color: '#3b82f6' },
                            { label: 'Keuangan & Kas', icon: CreditCard, color: '#10b981' },
                            { label: 'Surat Sakramen', icon: FileJson, color: '#8b5cf6' },
                            { label: 'Agenda Event', icon: CalendarDays, color: '#f59e0b' },
                            { label: 'Ruang Chat', icon: Send, color: '#6366f1' },
                            { label: 'Alkitab & Lagu', icon: BookOpen, color: '#ec4899' }
                          ].map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 group transition-all ${
                                  isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-900 border-slate-800'
                                }`}
                              >
                                <div
                                  className={`w-11 h-11 ${iconTheme.getIconContainerClass()}`}
                                  style={iconTheme.getIconStyle(item.color)}
                                >
                                  <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </div>
                                <span className={`text-[11px] font-extrabold truncate w-full ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                                  {item.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1. Preset Background Button Icon */}
                  <div className="space-y-2">
                    <label className={labelClass}>
                      1. Pilih Preset Gaya Background Button Icon:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { id: 'MATCH_THEME', name: 'Sesuai Warna Tema', desc: 'Serasi Warna Gereja', color: 'bg-teal-600 text-white' },
                        { id: 'CUSTOM_HEX', name: 'Kustom Hex Bebas', desc: 'Warna Mandiri', color: 'bg-indigo-600 text-white' },
                        { id: 'GRADIENT', name: 'Gradasi Mewah', desc: 'Teal to Emerald', color: 'bg-gradient-to-br from-teal-600 to-emerald-500 text-white' },
                        { id: 'GLASS', name: 'Glass Soft Blur', desc: 'Transparan Lembut', color: 'bg-teal-100 text-teal-800 border border-teal-300' },
                        { id: 'SOLID', name: 'Solid Pekat', desc: 'Pekat Bersih', color: 'bg-slate-900 text-white' },
                        { id: 'DEFAULT_COLORFUL', name: 'Warna-Warni Asli', desc: 'Tiap Menu Berbeda', color: 'bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 text-white' }
                      ].map((preset) => {
                        const isSelected = (metaForm.button_icon_preset || 'MATCH_THEME') === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setMetaForm({ ...metaForm, button_icon_preset: preset.id as any })}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-teal-500 ring-2 ring-teal-300 bg-teal-100 text-teal-950 font-bold shadow-md'
                                : isLight
                                ? 'border-teal-200 bg-white/80 text-slate-700 hover:border-teal-400'
                                : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg ${preset.color} flex items-center justify-center text-[10px] font-bold mb-1.5 shadow-2xs`}>
                              ✓
                            </div>
                            <p className="text-[11px] font-bold truncate">{preset.name}</p>
                            <p className={`text-[9px] truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>{preset.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Custom Hex Background & Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Warna Background Hex Khusus */}
                    <div className={`p-3.5 rounded-2xl border space-y-2 shadow-xs transition-colors ${
                      isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          <Palette className="w-3.5 h-3.5 text-teal-600" />
                          <span>2. Warna Background Button Icon (Hex)</span>
                        </label>
                        <span
                          className="w-5 h-5 rounded-lg border border-slate-300 inline-block shadow-2xs"
                          style={{ backgroundColor: metaForm.button_icon_bg || metaForm.warna_tema || '#059669' }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={metaForm.button_icon_bg || ''}
                          onChange={(e) =>
                            setMetaForm({
                              ...metaForm,
                              button_icon_preset: 'CUSTOM_HEX',
                              button_icon_bg: e.target.value
                            })
                          }
                          placeholder="#059669"
                          className={`flex-1 px-3 py-1.5 rounded-xl border font-mono text-xs uppercase outline-none font-bold ${
                            isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                        <label className={`px-2.5 py-1.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-1 ${
                          isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300'
                        }`}>
                          <input
                            type="color"
                            value={
                              metaForm.button_icon_bg && /^#[0-9A-F]{6}$/i.test(metaForm.button_icon_bg)
                                ? metaForm.button_icon_bg
                                : metaForm.warna_tema || '#059669'
                            }
                            onChange={(e) =>
                              setMetaForm({
                                ...metaForm,
                                button_icon_preset: 'CUSTOM_HEX',
                                button_icon_bg: e.target.value
                              })
                            }
                            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span>Pilih Visual</span>
                        </label>
                      </div>

                      {/* Quick Swatches for Button Icon */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[
                          { name: 'Teal', hex: '#059669' },
                          { name: 'Deep Teal', hex: '#0f766e' },
                          { name: 'Indigo', hex: '#4f46e5' },
                          { name: 'Purple', hex: '#7c3aed' },
                          { name: 'Amber', hex: '#d97706' },
                          { name: 'Rose', hex: '#e11d48' },
                          { name: 'Sky', hex: '#0284c7' },
                          { name: 'Dark Slate', hex: '#1e293b' }
                        ].map((sw) => (
                          <button
                            key={sw.hex}
                            type="button"
                            onClick={() =>
                              setMetaForm({
                                ...metaForm,
                                button_icon_preset: 'CUSTOM_HEX',
                                button_icon_bg: sw.hex
                              })
                            }
                            className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold flex items-center gap-1 cursor-pointer ${
                              isLight ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-white' : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sw.hex }} />
                            <span>{sw.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Warna Simbol / Icon */}
                    <div className={`p-3.5 rounded-2xl border space-y-2 shadow-xs transition-colors ${
                      isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>3. Warna Simbol / Icon di Dalam Tombol</span>
                        </label>
                        <span
                          className="w-5 h-5 rounded-lg border border-slate-300 inline-block shadow-2xs"
                          style={{ backgroundColor: metaForm.button_icon_color || '#ffffff' }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={metaForm.button_icon_color || ''}
                          onChange={(e) => setMetaForm({ ...metaForm, button_icon_color: e.target.value })}
                          placeholder="Default: Putih (#ffffff)"
                          className={`flex-1 px-3 py-1.5 rounded-xl border font-mono text-xs uppercase outline-none font-bold ${
                            isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                        <label className={`px-2.5 py-1.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-1 ${
                          isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300'
                        }`}>
                          <input
                            type="color"
                            value={
                              metaForm.button_icon_color && /^#[0-9A-F]{6}$/i.test(metaForm.button_icon_color)
                                ? metaForm.button_icon_color
                                : '#ffffff'
                            }
                            onChange={(e) => setMetaForm({ ...metaForm, button_icon_color: e.target.value })}
                            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span>Pilih Visual</span>
                        </label>
                      </div>

                      {/* Quick Symbol Color Presets */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[
                          { name: 'Putih Bersih', hex: '#ffffff' },
                          { name: 'Hitam Slate', hex: '#0f172a' },
                          { name: 'Emas Hangat', hex: '#f59e0b' },
                          { name: 'Cyan Terang', hex: '#06b6d4' },
                          { name: 'Hijau Mint', hex: '#34d399' }
                        ].map((sw) => (
                          <button
                            key={sw.hex}
                            type="button"
                            onClick={() => setMetaForm({ ...metaForm, button_icon_color: sw.hex })}
                            className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold flex items-center gap-1 cursor-pointer ${
                              isLight ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-white' : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: sw.hex }} />
                            <span>{sw.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Bentuk, Shadow & Border Icon */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Bentuk Background Icon */}
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        4. Bentuk Tombol Icon:
                      </label>
                      {[
                        { id: 'ROUNDED_XL', label: '📦 Rounded Modern', desc: 'Kotak Membulat Halus' },
                        { id: 'CIRCLE', label: '⚪ Lingkaran Penuh', desc: 'Bulat Melingkar' },
                        { id: 'SQUARE', label: '⏹️ Persegi Sudut Halus', desc: 'Sudut Rapi Minimalis' },
                        { id: 'PILL', label: '💊 Kapsul Pill', desc: 'Kapsul Oval Melebar' }
                      ].map((shape) => (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, button_icon_shape: shape.id as any })}
                          className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            (metaForm.button_icon_shape || 'ROUNDED_XL') === shape.id
                              ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{shape.label}</p>
                          <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>{shape.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Efek Bayangan / Glow */}
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        5. Efek Bayangan / Shadow:
                      </label>
                      {[
                        { id: 'NONE', label: 'Datar (Flat / No Shadow)', desc: 'Tanpa Bayangan' },
                        { id: 'SOFT', label: '✨ Lembut Elegan (Soft)', desc: 'Standar Modern' },
                        { id: 'GLOW', label: '💡 Glow Menyala (Neon)', desc: 'Cahaya Neon Warna' },
                        { id: 'DEEP', label: '⬛ Deep Shadow', desc: 'Bayangan Kontras Kuat' }
                      ].map((sh) => (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, button_icon_shadow: sh.id as any })}
                          className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            (metaForm.button_icon_shadow || 'SOFT') === sh.id
                              ? 'border-teal-500 bg-teal-100 text-teal-950 font-bold ring-1 ring-teal-400'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{sh.label}</p>
                          <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>{sh.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Border Garis Pinggir */}
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        6. Border Garis Pinggir:
                      </label>
                      <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${
                        isLight ? 'border-teal-200 bg-white text-slate-800' : 'border-slate-700 bg-slate-950 text-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={Boolean(metaForm.button_icon_border)}
                          onChange={(e) => setMetaForm({ ...metaForm, button_icon_border: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        <span className="text-[11px] font-bold">Aktifkan Garis Border</span>
                      </label>

                      {metaForm.button_icon_border && (
                        <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                          isLight ? 'border-teal-200 bg-white' : 'border-slate-700 bg-slate-950'
                        }`}>
                          <span className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Warna Border Icon:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={metaForm.button_icon_border_color || ''}
                              onChange={(e) => setMetaForm({ ...metaForm, button_icon_border_color: e.target.value })}
                              placeholder="#059669"
                              className={`flex-1 px-2.5 py-1 rounded-lg border text-xs font-mono ${
                                isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                              }`}
                            />
                            <label className={`p-1 rounded-lg border cursor-pointer ${
                              isLight ? 'border-teal-200' : 'border-slate-700'
                            }`}>
                              <input
                                type="color"
                                value={
                                  metaForm.button_icon_border_color && /^#[0-9A-F]{6}$/i.test(metaForm.button_icon_border_color)
                                    ? metaForm.button_icon_border_color
                                    : '#059669'
                                }
                                onChange={(e) => setMetaForm({ ...metaForm, button_icon_border_color: e.target.value })}
                                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SUB-SECTION 2.2: KUSTOMISASI NAVBAR / HEADER ATAS (LENGKAP) */}
                <div id="navbar-customizer-section" className={`sm:col-span-2 lg:col-span-3 p-4 sm:p-6 rounded-2xl border-2 space-y-5 scroll-mt-24 shadow-sm transition-colors ${
                  isLight ? 'bg-teal-50/70 border-teal-300 text-slate-800' : 'bg-slate-950/80 border-teal-800/60 text-slate-100'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                    isLight ? 'border-teal-200' : 'border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-base font-black flex items-center gap-2 ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          <span>Kustomisasi Warna, Gradasi, Tema &amp; Tombol Icon Navbar Atas</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLight ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-teal-900/60 text-teal-300 border-teal-700'
                          }`}>
                            Fitur Lengkap
                          </span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Atur warna bar navigasi paling atas secara bebas (pilihan preset, kode warna hex mandiri, efek gradasi halus, garis bawah kustom, dan background tombol icon navbar).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Mini Preview Bar */}
                  {(() => {
                    const previewNb = getNavbarTheme(metaForm);
                    return (
                      <div className="space-y-1.5">
                        <div className={`flex items-center justify-between text-xs font-bold ${
                          isLight ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          <span className={`flex items-center gap-1.5 ${isLight ? 'text-teal-800' : 'text-teal-400'}`}>
                            <Eye className="w-4 h-4 text-teal-600" />
                            <span>Pratinjau Langsung Navbar &amp; Tombol Icon:</span>
                          </span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Preset: {metaForm.navbar_theme_preset || 'CLEAN_LIGHT'} &bull; Style: {metaForm.navbar_style || 'GLASS'}
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-2xl p-3 sm:p-4 transition-all duration-300 border flex items-center justify-between ${previewNb.containerClass} ${previewNb.borderBottomClass} shadow-xl`}
                          style={{
                            ...previewNb.containerStyle,
                            ...previewNb.borderBottomStyle
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <button
                              type="button"
                              className={`p-2 transition-all shrink-0 ${previewNb.iconBtnClass}`}
                              style={previewNb.iconBtnStyle}
                              title="Menu Cepat"
                            >
                              <Grid className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shadow-xs shrink-0"
                                style={previewNb.menuBtnStyle}
                              >
                                <Building className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p
                                  className={`text-xs font-extrabold truncate ${previewNb.titleClass}`}
                                  style={previewNb.titleStyle}
                                >
                                  {metaForm.nama_gereja || 'Jesus Kingdom Christ'}
                                </p>
                                <p
                                  className={`text-[9px] font-bold leading-none ${previewNb.subtextClass}`}
                                  style={previewNb.subtextStyle}
                                >
                                  Portal Jemaat &bull; Enterprise CMS Pro
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Middle Preview Search Box */}
                          <div
                            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] w-40 ${previewNb.searchBoxClass}`}
                            style={previewNb.searchBoxStyle}
                          >
                            <Search className="w-3 h-3 opacity-70" />
                            <span className="truncate">Cari...</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${previewNb.pillClass}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Real-Time Cloud</span>
                            </div>

                            {/* Preview Bell Icon Button */}
                            <button
                              type="button"
                              className={`p-2 transition-all shrink-0 relative ${previewNb.iconBtnClass}`}
                              style={previewNb.iconBtnStyle}
                            >
                              <Bell className="w-4 h-4" />
                              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            </button>

                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xs"
                              style={previewNb.menuBtnStyle}
                            >
                              AD
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1. Preset Tema Navbar */}
                  <div className="space-y-2">
                    <label className={labelClass}>
                      1. Preset Warna Tema Navbar
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        { id: 'CLEAN_LIGHT', name: 'Luxe Clean Light', bg: 'bg-white text-slate-900' },
                        { id: 'MATCH_THEME', name: 'Serasi Tema Gereja', bg: 'bg-gradient-to-r from-teal-700 to-emerald-900 text-white' },
                        { id: 'EMERALD_GREEN', name: 'Forest Emerald', bg: 'bg-[#031a0e] text-white' },
                        { id: 'DEFAULT_DARK', name: 'Dark Slate', bg: 'bg-slate-950 text-white' },
                        { id: 'MIDNIGHT_BLUE', name: 'Midnight Blue', bg: 'bg-[#060c1d] text-white' },
                        { id: 'DEEP_PURPLE', name: 'Deep Amethyst', bg: 'bg-[#120520] text-white' },
                        { id: 'CRIMSON_RED', name: 'Crimson Burgundy', bg: 'bg-[#20050b] text-white' },
                        { id: 'WARM_GOLD', name: 'Warm Gold Luxe', bg: 'bg-[#1c1202] text-white' },
                        { id: 'PURE_BLACK', name: 'Obsidian OLED', bg: 'bg-black text-white' },
                        { id: 'CUSTOM_HEX', name: 'Kustom Hex Bebas', bg: 'bg-gradient-to-r from-teal-700 to-indigo-900 text-white' }
                      ].map((preset) => {
                        const isSelected = (metaForm.navbar_theme_preset || 'CLEAN_LIGHT') === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setMetaForm({ ...metaForm, navbar_theme_preset: preset.id as any })}
                            className={`p-2.5 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-teal-500 ring-2 ring-teal-400 bg-teal-600 text-white shadow-md'
                                : isLight
                                ? 'border-teal-200 bg-white text-slate-800 hover:border-teal-400'
                                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`w-3 h-3 rounded-full border border-slate-300 shrink-0 ${preset.bg}`} />
                              <span className="truncate">{preset.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Custom Hex Input & Gradasi Options */}
                  <div className={`p-4 rounded-xl border space-y-3 shadow-xs ${
                    isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className={`text-xs font-bold flex items-center gap-2 ${
                          isLight ? 'text-teal-900' : 'text-teal-400'
                        }`}>
                          <Palette className="w-4 h-4 text-teal-600" />
                          <span>2. Kustom Warna Hex &amp; Gradasi Navbar Bebas</span>
                        </label>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Pilih warna latar utama atau kombinasikan dengan warna gradasi kedua.
                        </p>
                      </div>
                      <div
                        className="w-9 h-9 rounded-xl border-2 border-teal-300 shadow shrink-0 flex items-center justify-center font-mono text-[9px] text-white font-bold"
                        style={{ backgroundColor: metaForm.navbar_custom_bg || '#ffffff', color: isColorLight(metaForm.navbar_custom_bg || '#ffffff') ? '#0f172a' : '#ffffff' }}
                      >
                        {metaForm.navbar_custom_bg || '#fff'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Warna Utama / Awal */}
                      <div className="space-y-1">
                        <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Warna Latar Utama (Hex):</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={metaForm.navbar_custom_bg || '#ffffff'}
                            onChange={(e) =>
                              setMetaForm({
                                ...metaForm,
                                navbar_theme_preset: 'CUSTOM_HEX',
                                navbar_custom_bg: e.target.value
                              })
                            }
                            placeholder="#ffffff"
                            className={`w-full px-3 py-1.5 rounded-xl border font-mono font-bold text-xs uppercase ${
                              isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                          <label className={`px-2.5 py-1.5 rounded-xl border cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                            isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-teal-300'
                          }`}>
                            <input
                              type="color"
                              value={
                                metaForm.navbar_custom_bg && /^#[0-9A-F]{6}$/i.test(metaForm.navbar_custom_bg)
                                  ? metaForm.navbar_custom_bg
                                  : '#ffffff'
                              }
                              onChange={(e) =>
                                setMetaForm({
                                  ...metaForm,
                                  navbar_theme_preset: 'CUSTOM_HEX',
                                  navbar_custom_bg: e.target.value
                                })
                              }
                              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span>Pilih</span>
                          </label>
                        </div>
                      </div>

                      {/* Warna Gradasi Kedua */}
                      <div className="space-y-1">
                        <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Warna Gradasi Ke-2 (Opsional):</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={metaForm.navbar_gradient_to || ''}
                            onChange={(e) =>
                              setMetaForm({
                                ...metaForm,
                                navbar_gradient_to: e.target.value
                              })
                            }
                            placeholder="#f1f5f9"
                            className={`w-full px-3 py-1.5 rounded-xl border font-mono font-bold text-xs uppercase ${
                              isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                          <label className={`px-2.5 py-1.5 rounded-xl border cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                            isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-teal-300'
                          }`}>
                            <input
                              type="color"
                              value={
                                metaForm.navbar_gradient_to && /^#[0-9A-F]{6}$/i.test(metaForm.navbar_gradient_to)
                                  ? metaForm.navbar_gradient_to
                                  : '#f1f5f9'
                              }
                              onChange={(e) =>
                                setMetaForm({
                                  ...metaForm,
                                  navbar_gradient_to: e.target.value
                                })
                              }
                              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span>Pilih</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Quick Swatches */}
                    <div>
                      <span className={`text-[10px] font-bold block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Pilihan Cepat Warna Navbar:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Clean White', hex: '#ffffff' },
                          { name: 'Teal Zamrud', hex: '#059669' },
                          { name: 'Deep Teal', hex: '#042f2e' },
                          { name: 'Slate 950', hex: '#020617' },
                          { name: 'Navy Midnight', hex: '#0f172a' },
                          { name: 'Deep Indigo', hex: '#1e1b4b' },
                          { name: 'Royal Purple', hex: '#3b0764' },
                          { name: 'Forest Green', hex: '#052e16' },
                          { name: 'Crimson Wine', hex: '#4c0519' },
                          { name: 'Warm Amber', hex: '#451a03' },
                          { name: 'Obsidian OLED', hex: '#000000' }
                        ].map((chip) => (
                          <button
                            key={chip.hex}
                            type="button"
                            onClick={() =>
                              setMetaForm({
                                ...metaForm,
                                navbar_theme_preset: 'CUSTOM_HEX',
                                navbar_custom_bg: chip.hex
                              })
                            }
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-white'
                                : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: chip.hex }} />
                            <span>{chip.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Style Navbar, Garis Bawah, Kontras Teks & Arah Gradasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gaya Transparansi */}
                    <div className="space-y-1.5">
                      <label className={`block font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        <span>3. Gaya &amp; Efek Transparansi</span>
                      </label>
                      {[
                        { id: 'GLASS', label: '✨ Glass Blur', desc: 'Transparan Modern' },
                        { id: 'SOLID', label: '⬛ Solid Pekat', desc: 'Pekat Bersih' },
                        { id: 'GRADIENT', label: '🌈 Gradient Halus', desc: 'Gradasi Warna' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, navbar_style: s.id as any })}
                          className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            (metaForm.navbar_style || 'GLASS') === s.id
                              ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{s.label}</p>
                          <p className={`text-[9px] ${(metaForm.navbar_style || 'GLASS') === s.id ? 'text-teal-100' : 'text-slate-400'}`}>{s.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Garis Bawah Aksen */}
                    <div className="space-y-1.5">
                      <label className={`block font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>4. Garis Pembatas Bawah</span>
                      </label>
                      {[
                        { id: 'SUBTLE', label: '➖ Garis Halus' },
                        { id: 'THEME_COLOR', label: '🔲 Warna Tema Gereja' },
                        { id: 'GLOW', label: '✨ Glowing Neon Glow' },
                        { id: 'CUSTOM', label: '🎨 Warna Garis Kustom' },
                        { id: 'NONE', label: '✖️ Tanpa Garis' }
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, navbar_border_accent: b.id as any })}
                          className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            (metaForm.navbar_border_accent || 'SUBTLE') === b.id
                              ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold truncate">{b.label}</p>
                        </button>
                      ))}

                      {metaForm.navbar_border_accent === 'CUSTOM' && (
                        <div className="pt-1 flex items-center gap-1.5">
                          <input
                            type="color"
                            value={metaForm.navbar_border_color || metaForm.warna_tema || '#059669'}
                            onChange={(e) => setMetaForm({ ...metaForm, navbar_border_color: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                          <select
                            value={metaForm.navbar_border_width || '2'}
                            onChange={(e) => setMetaForm({ ...metaForm, navbar_border_width: e.target.value as any })}
                            className={`flex-1 p-1 rounded-lg border text-[10px] font-bold ${
                              isLight ? 'border-teal-200 bg-white text-slate-800' : 'border-slate-700 bg-slate-900 text-white'
                            }`}
                          >
                            <option value="1">Tebal 1px</option>
                            <option value="2">Tebal 2px</option>
                            <option value="3">Tebal 3px</option>
                            <option value="4">Tebal 4px</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Kontras & Warna Teks Navbar */}
                    <div className="space-y-1.5">
                      <label className={`block font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>5. Warna Teks Navbar</span>
                      </label>
                      {[
                        { id: 'AUTO', label: '⚡ Otomatis Pintar' },
                        { id: 'WHITE', label: '⚪ Selalu Putih' },
                        { id: 'DARK', label: '⚫ Selalu Gelap' },
                        { id: 'CUSTOM', label: '🎨 Kustom Warna Teks' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, navbar_custom_text: t.id as any })}
                          className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            (metaForm.navbar_custom_text || 'AUTO') === t.id
                              ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{t.label}</p>
                        </button>
                      ))}

                      {metaForm.navbar_custom_text === 'CUSTOM' && (
                        <div className="pt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={metaForm.navbar_custom_text_color || ''}
                            onChange={(e) => setMetaForm({ ...metaForm, navbar_custom_text_color: e.target.value })}
                            placeholder="#0f172a"
                            className={`flex-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold uppercase ${
                              isLight ? 'bg-white border-teal-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                          <input
                            type="color"
                            value={metaForm.navbar_custom_text_color || '#0f172a'}
                            onChange={(e) => setMetaForm({ ...metaForm, navbar_custom_text_color: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border-0"
                          />
                        </div>
                      )}
                    </div>

                    {/* 6. Tombol Icon Navbar (Navbar Icon Buttons) */}
                    <div className="space-y-1.5">
                      <label className={`block font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Box className="w-3.5 h-3.5 text-teal-600" />
                        <span>6. Tombol Icon Navbar</span>
                      </label>
                      {[
                        { id: 'SUBTLE', label: 'Transparan Lembut (Subtle)' },
                        { id: 'MATCH_THEME', label: 'Sesuai Warna Tema' },
                        { id: 'SOLID', label: 'Solid Pekat' },
                        { id: 'CUSTOM_HEX', label: 'Kustom Hex Icon Navbar' },
                        { id: 'NONE', label: 'Polos / Tanpa Kotak' }
                      ].map((ib) => (
                        <button
                          key={ib.id}
                          type="button"
                          onClick={() => setMetaForm({ ...metaForm, navbar_icon_bg_preset: ib.id as any })}
                          className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            (metaForm.navbar_icon_bg_preset || 'SUBTLE') === ib.id
                              ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{ib.label}</p>
                        </button>
                      ))}

                      {metaForm.navbar_icon_bg_preset === 'CUSTOM_HEX' && (
                        <div className="pt-1 space-y-1">
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Warna Background Icon:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={metaForm.navbar_icon_bg || ''}
                              onChange={(e) => setMetaForm({ ...metaForm, navbar_icon_bg: e.target.value })}
                              placeholder="#059669"
                              className={`flex-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold uppercase ${
                                isLight ? 'bg-white border-teal-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                              }`}
                            />
                            <input
                              type="color"
                              value={metaForm.navbar_icon_bg || '#059669'}
                              onChange={(e) => setMetaForm({ ...metaForm, navbar_icon_bg: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer border-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2.5: Kustomisasi Background Footer & Icon Navigasi (Mobile / Bottom Bar) */}
            <div className={cardContainerClass}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2 ${
                isLight ? 'border-teal-100' : 'border-slate-800'
              }`}>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${
                    isLight ? 'text-teal-900' : 'text-teal-400'
                  }`}>
                    <Layers className="w-5 h-5 text-teal-600" />
                    <span>2.5. Kustomisasi Background Footer &amp; Tombol Icon (Bottom Nav)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLight ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-teal-900/50 text-teal-300 border-teal-700'
                    }`}>
                      Admin &amp; SuperAdmin
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sesuaikan warna latar belakang footer mobile, garis pembatas atas, bentuk background icon (Home, Renungan, Jadwal, Profil, Lainnya), serta warna aktif dan idle.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className={`space-y-2 p-4 rounded-2xl border ${
                isLight ? 'bg-teal-50/60 border-teal-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold mb-1 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <span className={`flex items-center gap-1.5 ${isLight ? 'text-teal-800' : 'text-teal-400'}`}>
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>Pratinjau Langsung Tampilan Footer &amp; Icon:</span>
                  </span>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Preset: {metaForm.footer_theme_preset || 'DEFAULT_DARK'}
                  </span>
                </div>
                {(() => {
                  const ft = getFooterTheme(metaForm);
                  return (
                    <div
                      className={`w-full rounded-2xl p-3 flex items-center justify-around shadow-xl border ${ft.containerClass.replace('fixed bottom-0 left-0 right-0 z-40 lg:hidden', '')}`}
                      style={ft.containerStyle}
                    >
                      <div style={ft.getItemStyle(true)} className={ft.getItemClass(true)}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Home</span>
                      </div>
                      <div style={ft.getItemStyle(false)} className={ft.getItemClass(false)}>
                        <BookOpen className="w-5 h-5" />
                        <span>Renungan</span>
                      </div>
                      <div style={ft.getItemStyle(false)} className={ft.getItemClass(false)}>
                        <CalendarDays className="w-5 h-5" />
                        <span>Jadwal</span>
                      </div>
                      <div style={ft.getItemStyle(false)} className={ft.getItemClass(false)}>
                        <UserCheck className="w-5 h-5" />
                        <span>Profil</span>
                      </div>
                      <div style={ft.getItemStyle(false)} className={ft.getItemClass(false)}>
                        <MoreHorizontal className="w-5 h-5" />
                        <span>Lainnya</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 1. Preset Background Footer */}
              <div className="space-y-2">
                <label className={labelClass}>
                  1. Pilih Preset Warna Background Footer:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'DEFAULT_DARK', name: 'Dark Slate', desc: 'Default Gelap Elegan' },
                    { id: 'MATCH_THEME', name: 'Sesuai Tema Gereja', desc: 'Ikuti Warna Tema' },
                    { id: 'MATCH_NAVBAR', name: 'Sama dengan Navbar', desc: 'Serasi dengan Header' },
                    { id: 'MIDNIGHT_BLUE', name: 'Midnight Blue', desc: 'Biru Laut Dalam' },
                    { id: 'DEEP_PURPLE', name: 'Deep Amethyst', desc: 'Ungu Megah' },
                    { id: 'EMERALD_GREEN', name: 'Forest Emerald', desc: 'Hijau Zamrud' },
                    { id: 'CRIMSON_RED', name: 'Crimson Burgundy', desc: 'Merah Marun' },
                    { id: 'WARM_GOLD', name: 'Warm Gold', desc: 'Emas Hangat' },
                    { id: 'PURE_BLACK', name: 'Pure Obsidian', desc: 'Hitam OLED' },
                    { id: 'CLEAN_LIGHT', name: 'Clean Light', desc: 'Putih Terang' },
                    { id: 'CUSTOM_HEX', name: 'Kustom Hex', desc: 'Warna Bebas' }
                  ].map((p) => {
                    const isSelected = (metaForm.footer_theme_preset || 'DEFAULT_DARK') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setMetaForm({ ...metaForm, footer_theme_preset: p.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                            : isLight
                            ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                            : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate">{p.name}</p>
                        <p className={`text-[9px] truncate mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Kustom Hex Footer Khusus */}
              <div className={`p-3.5 rounded-2xl border space-y-3 shadow-xs ${
                isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-teal-900' : 'text-teal-400'}`}>
                    <Palette className="w-3.5 h-3.5 text-teal-600" />
                    <span>2. Warna Hex Background Footer Khusus</span>
                  </label>
                  <span
                    className="w-6 h-6 rounded-lg border border-slate-300 inline-block"
                    style={{ backgroundColor: metaForm.footer_custom_bg || '#020617' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={metaForm.footer_custom_bg || '#020617'}
                    onChange={(e) =>
                      setMetaForm({
                        ...metaForm,
                        footer_theme_preset: 'CUSTOM_HEX',
                        footer_custom_bg: e.target.value
                      })
                    }
                    placeholder="#020617"
                    className={`flex-1 px-3 py-1.5 rounded-xl border font-mono text-xs uppercase outline-none ${
                      isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <label className={`px-3 py-1.5 rounded-xl border cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-teal-300'
                  }`}>
                    <input
                      type="color"
                      value={
                        metaForm.footer_custom_bg && /^#[0-9A-F]{6}$/i.test(metaForm.footer_custom_bg)
                          ? metaForm.footer_custom_bg
                          : '#020617'
                      }
                      onChange={(e) =>
                        setMetaForm({
                          ...metaForm,
                          footer_theme_preset: 'CUSTOM_HEX',
                          footer_custom_bg: e.target.value
                        })
                      }
                      className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span>Pilih Warna</span>
                  </label>
                </div>
              </div>

              {/* 3. Gaya, Garis Atas & Bentuk Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gaya Transparansi Footer */}
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    3. Gaya Transparansi Footer:
                  </label>
                  {[
                    { id: 'GLASS', label: '✨ Glass Blur' },
                    { id: 'SOLID', label: '⬛ Solid Pekat' },
                    { id: 'GRADIENT', label: '🌈 Gradient' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setMetaForm({ ...metaForm, footer_style: s.id as any })}
                      className={`w-full p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        (metaForm.footer_style || 'GLASS') === s.id
                          ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                          : isLight
                          ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                          : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Garis Pembatas Atas Footer */}
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    4. Garis Pembatas Atas:
                  </label>
                  {[
                    { id: 'SUBTLE', label: '➖ Garis Halus' },
                    { id: 'THEME_COLOR', label: '🔲 Warna Tema' },
                    { id: 'GLOW', label: '✨ Glowing Neon' },
                    { id: 'NONE', label: '✖️ Tanpa Garis' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setMetaForm({ ...metaForm, footer_border_accent: b.id as any })}
                      className={`w-full p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        (metaForm.footer_border_accent || 'SUBTLE') === b.id
                          ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                          : isLight
                          ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                          : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Bentuk Background Icon */}
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    5. Bentuk Background Icon:
                  </label>
                  {[
                    { id: 'SUBTLE', label: '📦 Rounded Box' },
                    { id: 'PILL', label: '💊 Kapsul Pill' },
                    { id: 'CIRCLE', label: '⚪ Lingkaran Badge' },
                    { id: 'GLOW', label: '✨ Neon Glow' },
                    { id: 'NONE', label: '🔘 Minimalis Polos' }
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setMetaForm({ ...metaForm, footer_icon_bg_style: shape.id as any })}
                      className={`w-full p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        (metaForm.footer_icon_bg_style || 'SUBTLE') === shape.id
                          ? 'border-teal-500 bg-teal-600 text-white font-bold ring-1 ring-teal-400'
                          : isLight
                          ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                          : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Kustom Warna Background Icon Aktif & Diam */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-3.5 rounded-2xl border space-y-2 shadow-xs ${
                  isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}>
                  <label className={`text-xs font-bold flex items-center justify-between ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    <span>Warna Background Icon Aktif</span>
                    <span
                      className="w-4 h-4 rounded border border-slate-300 inline-block"
                      style={{
                        backgroundColor: metaForm.footer_icon_active_bg || `${metaForm.warna_tema || '#CD5C5C'}25`
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={metaForm.footer_icon_active_bg || ''}
                      onChange={(e) => setMetaForm({ ...metaForm, footer_icon_active_bg: e.target.value })}
                      placeholder="Default: Warna Tema"
                      className={`flex-1 px-3 py-1.5 rounded-xl border font-mono text-xs outline-none ${
                        isLight ? 'bg-slate-50 border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <label className={`px-2.5 py-1.5 rounded-xl border cursor-pointer text-xs font-bold ${
                      isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-teal-300'
                    }`}>
                      <input
                        type="color"
                        value={
                          metaForm.footer_icon_active_bg && /^#[0-9A-F]{6}$/i.test(metaForm.footer_icon_active_bg)
                            ? metaForm.footer_icon_active_bg
                            : metaForm.warna_tema || '#CD5C5C'
                        }
                        onChange={(e) => setMetaForm({ ...metaForm, footer_icon_active_bg: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </label>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-2 shadow-xs ${
                  isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}>
                  <label className={`text-xs font-bold flex items-center justify-between ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    <span>Warna Background Icon Diam</span>
                    <span
                      className="w-4 h-4 rounded border border-slate-300 inline-block"
                      style={{
                        backgroundColor: metaForm.footer_icon_custom_bg || 'transparent'
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={metaForm.footer_icon_custom_bg || ''}
                      onChange={(e) => setMetaForm({ ...metaForm, footer_icon_custom_bg: e.target.value })}
                      placeholder="Default: Transparan"
                      className={`flex-1 px-3 py-1.5 rounded-xl border font-mono text-xs outline-none ${
                        isLight ? 'bg-slate-50 border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <label className={`px-2.5 py-1.5 rounded-xl border cursor-pointer text-xs font-bold ${
                      isLight ? 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-teal-300'
                    }`}>
                      <input
                        type="color"
                        value={
                          metaForm.footer_icon_custom_bg && /^#[0-9A-F]{6}$/i.test(metaForm.footer_icon_custom_bg)
                            ? metaForm.footer_icon_custom_bg
                            : '#1e293b'
                        }
                        onChange={(e) => setMetaForm({ ...metaForm, footer_icon_custom_bg: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Custom Tampilan Portal Jemaat (Mobile & Dashboard Jemaat) */}
            <div className={cardContainerClass}>
              <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-teal-100' : 'border-slate-800'}`}>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-teal-900' : 'text-teal-400'}`}>
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <span>3. Kustomisasi Tampilan Portal Jemaat (Hape &amp; Mobile View)</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Atur ucapan selamat datang, gaya banner, teks pengumuman, serta aktifkan/nonaktifkan modul di Dashboard Jemaat.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Judul Banner Selamat Datang Jemaat</label>
                  <input
                    type="text"
                    value={metaForm.jemaat_banner_title || 'Shalom & Selamat Datang'}
                    onChange={(e) => setMetaForm({ ...metaForm, jemaat_banner_title: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Subtitle Banner Jemaat</label>
                  <input
                    type="text"
                    value={metaForm.jemaat_banner_subtitle || 'Portal Layanan Jemaat Resmi & Sistem Informasi Terpadu'}
                    onChange={(e) => setMetaForm({ ...metaForm, jemaat_banner_subtitle: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* DEDIKASI PENGATURAN WARTA & PENGUMUMAN DENGAN ICON TOA */}
                <div className={`sm:col-span-2 p-4 sm:p-5 rounded-2xl border-2 space-y-3 shadow-inner ${
                  isLight ? 'bg-teal-50/70 border-teal-300 text-teal-950' : 'bg-slate-950/80 border-teal-800/60 text-slate-100'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b ${
                    isLight ? 'border-teal-200' : 'border-slate-800'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm ${
                      isLight ? 'text-teal-900' : 'text-teal-300'
                    }`}>
                      <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700 border border-teal-300">
                        <Megaphone className="w-4 h-4 animate-pulse text-teal-600" />
                      </div>
                      <span>Pengaturan Warta &amp; Pengumuman Dashboard (Icon Toa)</span>
                    </div>
                    <label className={`flex items-center gap-2 cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl border w-fit shadow-xs ${
                      isLight ? 'bg-white border-teal-300 text-teal-900' : 'bg-slate-900 border-teal-700 text-teal-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={metaForm.show_pinned_notif_banner !== false}
                        onChange={(e) => setMetaForm({ ...metaForm, show_pinned_notif_banner: e.target.checked })}
                        className="rounded border-teal-400 text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span>Tampilkan Banner Toa di Dashboard</span>
                    </label>
                  </div>

                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Teks pengumuman ini akan muncul di bagian atas halaman Dashboard dengan icon <strong>Toa (Megaphone)</strong> berkedip untuk seluruh jemaat dan pengunjung.
                  </p>

                  {/* Pratinjau Tampilan Dashboard */}
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-teal-800' : 'text-teal-400'}`}>
                      Pratinjau Tampilan di Dashboard:
                    </span>
                    <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 shadow-sm ${
                      isLight ? 'bg-white border-teal-300 text-slate-800' : 'bg-slate-900 border-teal-800 text-white'
                    }`}>
                      <span className="p-2 rounded-xl bg-teal-100 text-teal-700 border border-teal-200 shrink-0">
                        <Megaphone className="w-4 h-4 animate-pulse text-teal-600" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] uppercase font-black tracking-wider block sm:inline mr-2 ${isLight ? 'text-teal-800' : 'text-teal-400'}`}>
                          Warta &amp; Pengumuman Gereja:
                        </span>
                        <span className={`text-xs font-semibold break-words ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                          {metaForm.jemaat_announcement_text?.trim() || 'Teks pengumuman yang Anda ketik di bawah akan tampil di sini...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Isi Teks Warta / Pengumuman Gereja:
                    </label>
                    <textarea
                      rows={2}
                      value={metaForm.jemaat_announcement_text || ''}
                      onChange={(e) => setMetaForm({ ...metaForm, jemaat_announcement_text: e.target.value })}
                      placeholder="Contoh: Ibadah Raya Minggu ini diadakan pukul 09:00 WIB di Gedung Utama. Dilanjutkan perjamuan kudus..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed placeholder-slate-400 focus:outline-none ${
                        isLight ? 'bg-white border-teal-200 text-slate-900 focus:border-teal-500' : 'bg-slate-900 border-slate-700 text-white focus:border-teal-400'
                      }`}
                    />
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveMeta()}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/25 cursor-pointer transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                        <span>Simpan Pengumuman Toa Sekarang</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`font-bold text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Pengaturan Lebar Kartu Dashboard Jemaat</label>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isLight ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950 border-teal-800'}`}>Pilih 1 Ukuran Lebar</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'CONTAINED', label: '🛡️ Standard (Max 5XL)', desc: 'Rekomendasi Desktop & Tablet' },
                      { id: 'FULL', label: '🖥️ Full Width (100%)', desc: 'Memenuhi Seluruh Layar' },
                      { id: 'MOBILE_COMPACT', label: '📱 Compact Mobile', desc: 'Rapat Rapi Fokus Hape' }
                    ].map((cw) => {
                      const isSelected =
                        (metaForm.jemaat_card_width || 'CONTAINED') === cw.id ||
                        (cw.id === 'MOBILE_COMPACT' && metaForm.jemaat_card_width === 'COMPACT');
                      return (
                        <button
                          type="button"
                          key={cw.id}
                          onClick={() => setMetaForm({ ...metaForm, jemaat_card_width: cw.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-bold text-[11px]">{cw.label}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-teal-300 bg-white' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                            </div>
                          </div>
                          <div className={`text-[9px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{cw.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`font-bold text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Ukuran Kepadatan Padding Kartu (Density)</label>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isLight ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950 border-teal-800'}`}>Pilih 1 Padding</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'COMPACT', label: '⚡ Ringkas', desc: 'Padding Kecil (Hape)' },
                      { id: 'NORMAL', label: '⚖️ Normal', desc: 'Padding Standar' },
                      { id: 'SPACIOUS', label: '✨ Lega', desc: 'Padding Luas & Mewah' }
                    ].map((cs) => {
                      const isSelected = (metaForm.card_size || 'NORMAL') === cs.id;
                      return (
                        <button
                          type="button"
                          key={cs.id}
                          onClick={() => setMetaForm({ ...metaForm, card_size: cs.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
                              : isLight
                              ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                              : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-bold text-[11px]">{cs.label}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-teal-300 bg-white' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                            </div>
                          </div>
                          <div className={`text-[9px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{cs.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Style Warna Background Seluruh Kartu Dashboard &amp; Jemaat</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'DEFAULT_GLASS', label: '✨ Transparan Glass' },
                      { id: 'GRADIENT_INDIGO', label: '🌌 Royal Twilight' },
                      { id: 'GRADIENT_PURPLE', label: '🔮 Amethyst Majesty' },
                      { id: 'GRADIENT_GOLD', label: '👑 Golden Grace' },
                      { id: 'GRADIENT_EMERALD', label: '🌿 Emerald Divine' },
                      { id: 'OCEAN_BLUE', label: '🌊 Ocean Waves' },
                      { id: 'OBSIDIAN_NIGHT', label: '🖤 Obsidian Night' },
                      { id: 'SOLID_SLATE', label: '⬛ Solid Dark' },
                      { id: 'NEON_CYAN', label: '💡 Neon Cyan' }
                    ].map((cb) => (
                      <button
                        type="button"
                        key={cb.id}
                        onClick={() => setMetaForm({ ...metaForm, jemaat_cards_bg: cb.id as any })}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          (metaForm.jemaat_cards_bg || 'DEFAULT_GLASS') === cb.id
                            ? 'border-teal-500 ring-2 ring-teal-400 bg-teal-600 text-white shadow-xs'
                            : isLight
                            ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                            : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        {cb.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Style Background Banner Utama Jemaat (Paling Atas)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'GRADIENT_INDIGO', label: '🌌 Royal Twilight' },
                      { id: 'GRADIENT_GOLD', label: '👑 Golden Grace' },
                      { id: 'GRADIENT_EMERALD', label: '🌿 Emerald Divine' },
                      { id: 'GRADIENT_PURPLE', label: '🔮 Amethyst Majesty' },
                      { id: 'OBSIDIAN_NIGHT', label: '🖤 Obsidian Night' },
                      { id: 'OCEAN_BLUE', label: '🌊 Ocean Waves' }
                    ].map((gb) => (
                      <button
                        type="button"
                        key={gb.id}
                        onClick={() => setMetaForm({ ...metaForm, jemaat_banner_bg: gb.id as any })}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          (metaForm.jemaat_banner_bg || 'GRADIENT_INDIGO') === gb.id
                            ? 'border-teal-500 ring-2 ring-teal-400 bg-teal-600 text-white shadow-xs'
                            : isLight
                            ? 'border-teal-200 bg-white text-slate-700 hover:border-teal-400'
                            : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        {gb.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Sakelar Komponen Dashboard Jemaat (Aktif/Nonaktif)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'show_jemaat_announcement_banner', label: 'Banner Pengumuman Ticker' },
                      { key: 'show_jemaat_social_video', label: 'Feed Video Media Sosial (YouTube/Reels/TikTok)' },
                      { key: 'show_jemaat_sacraments_card', label: 'Kartu Status Sakramen & Keanggotaan' },
                      { key: 'show_jemaat_daily_renungan', label: 'Widget Renungan Harian Terbaru' },
                      { key: 'show_jemaat_event_jadwal', label: 'Widget Jadwal Ibadah & Event' },
                      { key: 'show_jemaat_quick_doa', label: 'Form Kirim Permohonan Doa Jemaat' },
                      { key: 'show_jemaat_offering_history', label: 'Catatan Histori Persembahan Personal' }
                    ].map((jItem) => (
                      <label
                        key={jItem.key}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-semibold hover:border-teal-400 shadow-2xs transition-colors ${
                          isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span>{jItem.label}</span>
                        <input
                          type="checkbox"
                          checked={(metaForm as any)[jItem.key] !== false}
                          onChange={(e) => setMetaForm({ ...metaForm, [jItem.key]: e.target.checked })}
                          className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-4 h-4 shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Pengaturan Lengkap Visibilitas Komponen Dashboard Home (Admin & Jemaat) */}
            <div className={cardContainerClass}>
              <DashboardVisibilityManager
                settings={metaForm}
                onChange={(newSettings) => setMetaForm(newSettings)}
              />
            </div>

            {/* Section 5: Kontrol Tombol Floating Download Aplikasi Mobile (.APK Android) */}
            <div className={cardContainerClass}>
              <h3 className={sectionTitleClass}>
                <span className="flex items-center gap-2 text-teal-600">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>5. Kontrol Tombol Melayang Download APK Mobile Android</span>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isLight ? 'text-teal-800 bg-teal-50 border-teal-200' : 'text-teal-300 bg-teal-950 border-teal-800'
                }`}>
                  Mobile APK Download Control
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all sm:col-span-2 ${
                  isLight ? 'bg-teal-50/50 border-teal-200 hover:border-teal-300' : 'bg-slate-950 border-slate-700 hover:border-slate-600'
                }`}>
                  <div>
                    <div className={`font-bold text-xs ${isLight ? 'text-teal-900' : 'text-teal-300'}`}>Tampilkan Tombol Floating Download APK Mobile Android</div>
                    <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Jika diaktifkan, tombol melayang untuk mengunduh file .APK akan tampil di sudut kanan bawah dashboard.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={metaForm.show_apk_download_button !== false}
                    onChange={(e) => setMetaForm({ ...metaForm, show_apk_download_button: e.target.checked })}
                    className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-5 h-5 shrink-0"
                  />
                </label>

                {/* Notifikasi jika disembunyikan oleh tombol (X) */}
                <div className={`sm:col-span-2 p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}>
                  <div>
                    <div className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>Status Tombol Melayang di Perangkat Ini:</div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pengguna dapat menyembunyikan tombol melayang langsung dari dashboard dengan menekan tombol silang <strong>(x)</strong>.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem('cms_apk_button_hidden');
                        localStorage.removeItem('cms_apk_banner_hidden');
                        window.dispatchEvent(new CustomEvent('cms_apk_hidden_changed', { detail: { hidden: false } }));
                        alert('Tombol melayang download APK & banner berhasil dipulihkan dan akan tampil kembali di dashboard!');
                      } catch (e) {}
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shrink-0 transition-all shadow-md active:scale-95 text-center"
                  >
                    Reset &amp; Tampilkan di Dashboard
                  </button>
                </div>

                <div className={`sm:col-span-2 space-y-2 p-3.5 rounded-2xl border ${
                  isLight ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-950 border-slate-700'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className={`block font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-teal-900' : 'text-teal-300'}`}>
                        <Smartphone className="w-4 h-4 text-teal-600" />
                        <span>Link File .APK Google Drive Khusus Gereja Ini:</span>
                      </label>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Setiap gereja memiliki link APK terpisah. Tempelkan link file APK Google Drive resmi milik gereja Anda di sini.
                      </p>
                    </div>
                    {metaForm.apk_download_url && (
                      <a
                        href={metaForm.apk_download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                        title="Buka dan tes tautan Google Drive APK"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tes Buka Link APK</span>
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={metaForm.apk_download_url || ''}
                    onChange={(e) => setMetaForm({ ...metaForm, apk_download_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-none ${
                      isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-1">
                    <span className={`px-2 py-0.5 rounded-md border font-semibold ${
                      isLight ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-teal-900/60 text-teal-300 border-teal-700'
                    }`}>
                      ✓ Terisolasi Per-Gereja
                    </span>
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      Pastikan izin sharing file Google Drive diatur ke <b>"Anyone with the link" (Siapa saja yang memiliki link)</b>.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3 border-t border-teal-100">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Seluruh Kustomisasi Tampilan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Push Notifikasi HP Android (Website 2 APK Builder & OneSignal) */}
      {activeTab === 'PUSH_NOTIF' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 border-2 border-teal-600 p-6 text-white space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/15 text-white border border-white/20 shrink-0">
                  <Bell className="w-6 h-6 animate-pulse text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      Pengaturan Push Notifikasi OneSignal
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-100 text-[10px] font-bold border border-teal-400/40">
                      Gratis Selamanya
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-100 text-[10px] font-bold border border-teal-400/40">
                      Status Bar HP Android &amp; Web
                    </span>
                  </div>
                  <p className="text-xs text-teal-100 mt-1 leading-relaxed">
                    Kirim pesan broadcast warta dan pengumuman gereja langsung ke status bar atas HP jemaat dengan suara dering (chime) dan getar, bahkan ketika aplikasi sedang ditutup.
                  </p>
                </div>
              </div>

              <a
                href="https://dashboard.onesignal.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-md hover:bg-teal-50 flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-teal-700" />
                <span>Buka Dashboard OneSignal</span>
              </a>
            </div>
          </div>

          {/* Banner Menuju Android Studio Converter Pro */}
          <div className="rounded-2xl bg-teal-50 border border-teal-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs text-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 border border-teal-300 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Konversi ke Android Studio Resmi &amp; Firebase FCM?</p>
                <p className="text-slate-600 text-xs">
                  Dapatkan kode Java lengkap, konfigurasi status bar profesional, safe area notch, dan file google-services.json untuk link <strong>https://tntimbu.github.io/jesuskingdomchrist/</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAndroidStudioModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition cursor-pointer"
            >
              <span>Buka Android Studio Converter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* STATUS KONEKSI ONESIGNAL (LIVE STATUS CARD) */}
          <div className="rounded-3xl bg-white border-2 border-teal-200/90 p-6 text-slate-800 space-y-4 shadow-xl shadow-teal-950/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${
                  metaForm.onesignal_app_id && metaForm.onesignal_rest_api_key
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : metaForm.onesignal_app_id
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Status Koneksi OneSignal
                    </h4>
                    {metaForm.onesignal_app_id && metaForm.onesignal_rest_api_key ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Terhubung &amp; Siap Kirim
                      </span>
                    ) : metaForm.onesignal_app_id ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-300">
                        App ID Terpasang &bull; Butuh REST API Key
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        Belum Terhubung
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {metaForm.onesignal_app_id && metaForm.onesignal_rest_api_key
                      ? 'Layanan push notifikasi aktif. Setiap warta baru atau pesan tes dapat langsung disiarkan ke seluruh perangkat.'
                      : 'Lengkapi OneSignal App ID dan REST API Key di bawah untuk menghubungkan aplikasi ini ke OneSignal.'}
                  </p>
                </div>
              </div>

              {/* Tombol Cepat Salin Web URL */}
              <button
                type="button"
                onClick={() => {
                  const url = window.location.origin;
                  navigator.clipboard.writeText(url);
                  setCopiedKeyLabel('web_url');
                  setTimeout(() => setCopiedKeyLabel(null), 2500);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 border border-teal-200"
                title="Salin URL website gereja Anda untuk dimasukkan ke kolom Site URL di OneSignal"
              >
                <Copy className="w-3.5 h-3.5 text-teal-600" />
                <span>{copiedKeyLabel === 'web_url' ? 'URL Web Tersalin!' : 'Salin Site URL Web'}</span>
              </button>
            </div>

            {/* Panduan 4 Langkah Menghubungkan OneSignal */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5">
              <div className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Cara Menghubungkan OneSignal (Hanya Butuh 2 Menit):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-teal-200 space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Buat Akun Gratis</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Buka <a href="https://onesignal.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-semibold">onesignal.com</a> lalu daftar akun gratis (Free Plan selamanya).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-teal-200 space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Tambah Aplikasi</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Klik <strong>New App/Website</strong> &gt; Beri nama misal <em>GKFC Church</em> &gt; Pilih platform <strong>Web Push</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-teal-200 space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Salin Site URL</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Pilih <strong>Custom Code</strong> &gt; tempelkan Site URL Anda (<code className="text-teal-700 break-all font-bold">{window.location.origin}</code>).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-teal-200 space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Salin Keys &amp; IDs</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Di OneSignal buka <strong>Settings &gt; Keys &amp; IDs</strong>, salin <strong>App ID</strong> &amp; <strong>REST API Key</strong> ke form di bawah.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULIR PENGATURAN KUNCI ONESIGNAL */}
          <form onSubmit={handleSaveMeta} className="space-y-6">
            <div className="rounded-3xl bg-white border-2 border-teal-200/90 p-6 text-slate-800 space-y-4 shadow-xl shadow-teal-950/5">
              <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-sm text-slate-900">Formulir Konfigurasi Kunci OneSignal</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Tersimpan Aman di Database CMS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Sakelar Aktifkan */}
                <label className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 hover:border-teal-300 flex items-center justify-between cursor-pointer transition sm:col-span-2">
                  <div>
                    <div className="font-bold text-xs text-teal-950">Aktifkan Layanan Push Notifikasi OneSignal</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Izinkan CMS mengirim sinyal notifikasi push ke seluruh HP jemaat yang membuka web / memasang aplikasi.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={metaForm.onesignal_enabled !== false}
                    onChange={(e) => setMetaForm({ ...metaForm, onesignal_enabled: e.target.checked })}
                    className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-5 h-5 shrink-0"
                  />
                </label>

                {/* Sakelar Otomatis saat Warta diubah */}
                <label className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 hover:border-teal-300 flex items-center justify-between cursor-pointer transition sm:col-span-2">
                  <div>
                    <div className="font-bold text-xs text-teal-950">Otomatis Kirim Notifikasi saat Warta/Pengumuman Disimpan</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Setiap kali Admin mengedit atau memperbarui teks warta di Dashboard, otomatis terkirim notifikasi ke bar HP.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={metaForm.onesignal_auto_push_announcement !== false}
                    onChange={(e) => setMetaForm({ ...metaForm, onesignal_auto_push_announcement: e.target.checked })}
                    className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-5 h-5 shrink-0"
                  />
                </label>

                {/* OneSignal App ID */}
                <div className="space-y-1 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">
                      OneSignal App ID <span className="text-amber-600">* (Wajib)</span>
                    </label>
                    {metaForm.onesignal_app_id && (
                      <span className="text-[10px] text-teal-700 flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3 text-teal-600" /> Terisi
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={metaForm.onesignal_app_id || ''}
                    onChange={(e) => setMetaForm({ ...metaForm, onesignal_app_id: e.target.value.trim() })}
                    placeholder="Contoh: 12345678-abcd-1234-ef01-123456789abc"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Didapat dari OneSignal &gt; <em>Settings</em> &gt; <em>Keys &amp; IDs</em> (format UUID 36 karakter).
                  </p>
                </div>

                {/* OneSignal REST API Key */}
                <div className="space-y-1 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">
                      OneSignal REST API Key <span className="text-amber-600">* (Wajib untuk Kirim)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOneSignalKey(!showOneSignalKey)}
                      className="text-[10px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold"
                    >
                      {showOneSignalKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showOneSignalKey ? 'Sembunyikan' : 'Lihat Kunci'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showOneSignalKey ? 'text' : 'password'}
                      value={metaForm.onesignal_rest_api_key || ''}
                      onChange={(e) => setMetaForm({ ...metaForm, onesignal_rest_api_key: e.target.value.trim() })}
                      placeholder="Kunci REST API OneSignal (os_v2_app_... atau string rahasia)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-500 pr-10"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Kunci otorisasi pengiriman notifikasi dari aplikasi web ini ke server OneSignal.
                  </p>
                </div>

                {/* Google Project Number / Sender ID */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">
                      Google Project Number / Firebase Sender ID:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const val = metaForm.onesignal_google_project_number || '250034601366';
                        navigator.clipboard.writeText(val);
                        setCopiedKeyLabel('sender_id');
                        setTimeout(() => setCopiedKeyLabel(null), 2000);
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKeyLabel === 'sender_id' ? 'Tersalin!' : 'Salin Nilai'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={metaForm.onesignal_google_project_number || '250034601366'}
                    onChange={(e) => setMetaForm({ ...metaForm, onesignal_google_project_number: e.target.value })}
                    placeholder="250034601366"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Nomor project resmi Firebase gereja untuk sinkronisasi Android.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-teal-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan &amp; Hubungkan OneSignal</span>
                </button>
              </div>
            </div>
          </form>

          {/* PUSAT PENGUJIAN & REGISTRASI PERANGKAT (LIVE TEST HUB) */}
          <div className="rounded-3xl bg-white border-2 border-teal-200/90 p-6 text-slate-800 space-y-4 shadow-xl shadow-teal-950/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-sm text-slate-900">Pusat Uji Coba Pengiriman &amp; Registrasi Perangkat</h4>
              </div>
              <span className="text-[10px] text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">Coba Sekarang di HP atau Laptop Anda</span>
            </div>

            {/* Hasil Uji Izin Perangkat */}
            {permissionPromptResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-bold leading-relaxed flex items-center justify-between gap-2 animate-fade-in ${
                  permissionPromptResult.granted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <span>{permissionPromptResult.message}</span>
                <button
                  type="button"
                  onClick={() => setPermissionPromptResult(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Hasil Kirim Pesan Tes */}
            {pushTestResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-bold leading-relaxed animate-fade-in ${
                  pushTestResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {pushTestResult.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Judul Notifikasi Tes:</label>
                <input
                  type="text"
                  value={testPushTitle}
                  onChange={(e) => setTestPushTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Isi Pesan Notifikasi Tes:</label>
                <input
                  type="text"
                  value={testPushMessage}
                  onChange={(e) => setTestPushMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Pratinjau Tampilan Notifikasi di Bar HP */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Simulasi Tampilan di Status Bar Android:
              </span>
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0 shadow">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">{testPushTitle || 'GKFC Church'}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">Sekarang</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-0.5 break-words">
                    {testPushMessage || 'Pesan notifikasi warta gereja...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {/* Tombol 1: Daftarkan Izin di Perangkat Ini */}
              <button
                type="button"
                onClick={handlePromptPermission}
                disabled={isPromptingPermission}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Bell className="w-4 h-4 text-teal-600" />
                <span>{isPromptingPermission ? 'Menunggu Izin...' : '🔔 Uji & Izinkan Notifikasi di HP/Browser Ini'}</span>
              </button>

              {/* Tombol 2: Kirim Pesan Live Broadcast */}
              <button
                type="button"
                onClick={handleTestPushNotification}
                disabled={isTestingPush}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{isTestingPush ? 'Sedang Mengirim ke OneSignal...' : '🚀 Kirim Pesan Uji Coba Broadcast'}</span>
              </button>
            </div>
          </div>

          {/* OPSI TAMBAHAN: GOOGLE-SERVICES.JSON (FIREBASE FCM) */}
          <div className="rounded-3xl bg-white border-2 border-teal-200/90 p-6 text-slate-800 space-y-4 shadow-xl shadow-teal-950/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span>Opsi Cadangan: File google-services.json (Firebase FCM)</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                      Opsional
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Digunakan jika software builder Anda membutuhkan file konfigurasi Firebase FCM langsung.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  downloadGoogleServicesJsonFile(apkPackageName, metaForm);
                  setDownloadSuccess(true);
                  setTimeout(() => setDownloadSuccess(false), 3500);
                }}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer shrink-0"
              >
                {downloadSuccess ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
                <span>{downloadSuccess ? 'File Berhasil Didownload!' : 'Download google-services.json'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono text-teal-900 font-bold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Package Name: {apkPackageName}
              </span>
              <span>File ini sudah tersusun otomatis dan dapat diunduh kapan saja.</span>
            </div>
          </div>

          {/* Card Panduan Cepat Website 2 APK Builder */}
          <div className="rounded-3xl bg-white border-2 border-teal-200/90 p-6 text-slate-800 space-y-4 shadow-xl shadow-teal-950/5">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>3. Langkah Penting Saat Membuat APK di "Website 2 APK Builder"</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold underline"
              >
                Buka Tutorial Lengkap
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-1">
                <span className="font-bold text-amber-800 block">Langkah A: Di Website 2 APK</span>
                <p className="text-slate-600 text-[11px]">
                  Cari opsi <strong>Push Notifications</strong> &gt; Centang <strong>[OneSignal]</strong>. Masukkan App ID &amp; Google Project Number (<code className="text-teal-800 font-bold">250034601366</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-1">
                <span className="font-bold text-teal-900 block">Langkah B: Generate &amp; Pasang APK</span>
                <p className="text-slate-600 text-[11px]">
                  Build file APK dan instal ke HP. Buka aplikasi 1x dan klik <strong>"Izinkan" (Allow)</strong> saat HP meminta izin notifikasi.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-1">
                <span className="font-bold text-emerald-800 block">Langkah C: Selesai!</span>
                <p className="text-slate-600 text-[11px]">
                  Kapanpun Admin mengubah Warta atau mengirim pesan, HP Android akan otomatis berdering di bar atas meski aplikasi sedang ditutup!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GAS & Firebase Config */}
      {activeTab === 'GAS_FIREBASE' && (
        <form onSubmit={handleTestAndSaveGAS} className="space-y-6">
          {/* Status Message */}
          {gasStatusMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                gasStatusMsg.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  : gasStatusMsg.type === 'error'
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
              }`}
            >
              <span>{gasStatusMsg.text}</span>
            </div>
          )}

          {/* Google Sheets GAS REST API Section */}
          <div className={`rounded-3xl border-2 p-6 space-y-4 shadow-xl transition-colors ${
            isLight ? 'bg-white border-teal-100 text-slate-800 shadow-teal-900/5' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-teal-100' : 'border-slate-800'}`}>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Database className="w-5 h-5 text-teal-600" />
                  <span>Google Sheets REST API &amp; Google Apps Script (GAS)</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Tempelkan Web App URL hasil Deploy Apps Script Anda di sini. Kemudian klik tombol <strong>Simpan &amp; Sinkronkan</strong> di bawah.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyGASCode}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode GAS (18 Sheets)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Google Apps Script Web App URL <span className="text-teal-600 font-bold">* (Tempel di sini)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={metaForm.gas_api_url || ''}
                  onChange={(e) => setMetaForm({ ...metaForm, gas_api_url: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] focus:outline-none border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-indigo-500/50 text-white focus:border-indigo-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Google Spreadsheet ID (Opsional)</label>
                <input
                  type="text"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={metaForm.google_sheet_id || ''}
                  onChange={(e) => setMetaForm({ ...metaForm, google_sheet_id: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Save & Sync Buttons */}
            <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${isLight ? 'border-teal-100' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={handleSyncAllDataToGAS}
                disabled={testingGAS}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300'
                    : 'bg-emerald-900/40 hover:bg-emerald-800/80 text-emerald-300 border-emerald-700/50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${testingGAS ? 'animate-spin' : ''}`} />
                <span>Sinkronkan Semua Data 18 Sheets Sekarang</span>
              </button>

              <button
                type="submit"
                disabled={testingGAS}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{testingGAS ? 'Menyimpan & Menguji...' : 'Simpan Konfigurasi & Tes REST API'}</span>
              </button>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-teal-50/70 border-teal-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}>
              <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-teal-950' : 'text-white'}`}>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Panduan Cara Kerja Integration &amp; Sinkronisasi:</span>
              </h4>
              <ol className={`list-decimal list-inside space-y-1.5 text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                <li><strong>Tempel URL:</strong> Salin Web App URL dari Google Apps Script lalu tempel di kolom "Google Apps Script Web App URL".</li>
                <li><strong>Klik Simpan:</strong> Klik tombol <strong className={isLight ? 'text-teal-950 font-bold' : 'text-indigo-300'}>"Simpan Konfigurasi &amp; Tes REST API"</strong> di atas. Sistem akan menyimpan URL ke database dan melakukan verifikasi ping.</li>
                <li><strong>Sinkronkan Data:</strong> Klik tombol <strong className={isLight ? 'text-teal-950 font-bold' : 'text-emerald-300'}>"Sinkronkan Semua Data 18 Sheets Sekarang"</strong> untuk mengunggah seluruh database lokal ke Google Spreadsheet.</li>
                <li><strong>Akses "Anyone":</strong> Pastikan saat Deployment Web App di Google Apps Script, opsi <em>"Who has access"</em> diatur ke <strong>"Anyone" (Siapa Saja)</strong> agar API dapat diakses tanpa hambatan CORS.</li>
              </ol>
            </div>
          </div>

          {/* Firebase Cloud Firestore Setup & Multi-Device Real-Time Sync */}
          <div className={`rounded-3xl border-2 p-6 space-y-4 shadow-xl transition-colors ${
            isLight ? 'bg-white border-teal-100 text-slate-800 shadow-teal-900/5' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isLight ? 'border-teal-100' : 'border-slate-800'}`}>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Key className="w-5 h-5 text-amber-500" />
                  <span>Firebase Cloud Firestore (Koneksi Database Multi-Device Real-Time)</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Secara default, aplikasi <strong>sudah terhubung secara otomatis</strong> ke Cloud Firestore real-time. Semua data admin dan hape jemaat tersinkron otomatis.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                {isQuotaExhausted() ? (
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${
                    isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Mode Manual / Penyimpanan Lokal Aktif</span>
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${
                    isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Cloud Sync Aktif: {getActiveFirebaseConfig().projectId}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quota Exhausted / Manual Mode Alert Banner */}
            {isQuotaExhausted() && (
              <div className={`p-4 rounded-2xl border-2 text-xs space-y-2.5 shadow-inner ${
                isLight ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}>
                <div className={`font-bold flex items-center gap-2 text-sm ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-500" />
                  <span>Pengalihan Otomatis: Mode Manual &amp; Penyimpanan Lokal Aktif</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-amber-100/90'}`}>
                  Kuota penulisan harian gratis (Firestore Daily Write Quota) pada project Firebase bawaan telah tercapai.
                  Sistem telah secara otomatis mengalihkan penyimpanan ke <strong>Mode Penyimpanan Lokal (LocalStorage)</strong>.
                  Seluruh data Anda <strong>100% aman tersimpan di browser perangkat ini</strong> tanpa ada data yang hilang.
                </p>
                <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 border-t ${isLight ? 'border-amber-200' : 'border-amber-500/20'}`}>
                  <button
                    type="button"
                    onClick={async () => {
                      setTestingFirebase(true);
                      const res = await forceManualSyncPush();
                      setFirebaseStatusMsg({ type: res.success ? 'success' : 'error', text: res.message });
                      setTestingFirebase(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Sinkronkan Manual Ke Cloud</span>
                  </button>

                  <span className={`text-[11px] ${isLight ? 'text-slate-700 font-medium' : 'text-amber-300/80'}`}>
                    💡 <strong>Saran:</strong> Anda dapat memasukkan API Key Firebase Console milik Anda sendiri pada form di bawah untuk menggunakan kuota cloud fresh.
                  </span>
                </div>
              </div>
            )}

            {/* Status Message */}
            {firebaseStatusMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  firebaseStatusMsg.type === 'success'
                    ? (isLight ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300')
                    : firebaseStatusMsg.type === 'error'
                    ? (isLight ? 'bg-rose-50 border-rose-400 text-rose-950' : 'bg-rose-500/20 border-rose-500/30 text-rose-300')
                    : (isLight ? 'bg-teal-50 border-teal-300 text-teal-950' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300')
                }`}
              >
                <span>{firebaseStatusMsg.text}</span>
              </div>
            )}

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-teal-50/70 border-teal-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}>
              <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                💡 <strong>Koneksi Bawaan vs Custom:</strong> Sistem telah menyediakan project Firebase otomatis (ID: <code className={`font-mono font-bold px-1.5 py-0.5 rounded ${isLight ? 'bg-teal-100 text-teal-950 border border-teal-300' : 'bg-slate-900 text-indigo-300'}`}>{getActiveFirebaseConfig().projectId}</code>). Jika Anda ingin menggunakan project Firebase Console milik Anda sendiri, isi form di bawah ini dan klik <strong className={isLight ? 'text-teal-950' : 'text-indigo-300'}>Simpan Konfigurasi</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Firebase API Key</label>
                <input
                  type="text"
                  placeholder={getActiveFirebaseConfig().apiKey}
                  value={metaForm.firebaseConfig?.apiKey || ''}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      firebaseConfig: { ...metaForm.firebaseConfig, apiKey: e.target.value }
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Firebase Project ID</label>
                <input
                  type="text"
                  placeholder={getActiveFirebaseConfig().projectId}
                  value={metaForm.firebaseConfig?.projectId || ''}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      firebaseConfig: { ...metaForm.firebaseConfig, projectId: e.target.value }
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Firebase Auth Domain (Opsional)</label>
                <input
                  type="text"
                  placeholder={getActiveFirebaseConfig().authDomain}
                  value={metaForm.firebaseConfig?.authDomain || ''}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      firebaseConfig: { ...metaForm.firebaseConfig, authDomain: e.target.value }
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Firebase Storage Bucket (Opsional)</label>
                <input
                  type="text"
                  placeholder={getActiveFirebaseConfig().storageBucket}
                  value={metaForm.firebaseConfig?.storageBucket || ''}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      firebaseConfig: { ...metaForm.firebaseConfig, storageBucket: e.target.value }
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Messaging Sender ID (Opsional)</label>
                <input
                  type="text"
                  placeholder={getActiveFirebaseConfig().messagingSenderId}
                  value={metaForm.firebaseConfig?.messagingSenderId || ''}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      firebaseConfig: { ...metaForm.firebaseConfig, messagingSenderId: e.target.value }
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>App ID (Opsional)</label>
                <input
                  type="text"
                  placeholder={getActiveFirebaseConfig().appId}
                  value={metaForm.firebaseConfig?.appId || ''}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      firebaseConfig: { ...metaForm.firebaseConfig, appId: e.target.value }
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900 focus:bg-white focus:border-teal-500' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* FCM Push Notification Setup & Tester Card */}
            <div className={`p-4 rounded-2xl border-2 space-y-3 ${
              isLight ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950' : 'bg-indigo-950/40 border-indigo-500/30 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-xs font-extrabold flex items-center gap-1.5 ${isLight ? 'text-indigo-950' : 'text-indigo-200'}`}>
                    <span>🔔 Firebase Cloud Messaging (FCM) &amp; Notifikasi Status Bar HP</span>
                  </h4>
                  <p className={`text-[11px] mt-0.5 ${isLight ? 'text-indigo-900 font-medium' : 'text-slate-400'}`}>
                    Notifikasi push dikirim melalui Service Worker bawaan sehingga tetap muncul di status bar atas HP dengan suara lonceng &amp; getar meskipun aplikasi sedang ditutup.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    playNotificationChimeSound();
                    triggerStatusBarNotification(
                      '🔔 Pengumuman Ibadah GKFC',
                      'Ibadah Raya Minggu akan dimulai pukul 09.00 WIB. Selamat beribadah!',
                      '/'
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  ⚡ Tes Send Notifikasi Status Bar HP (Suara & Getar)
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const token = await requestAndSaveFCMToken();
                    if (token) {
                      alert(`✅ FCM TOKEN BERHASIL DIPEROLEH & DISIMPAN:\n\n${token}\n\nToken ini telah disimpan di Cloud Firestore untuk pengiriman notifikasi push HP.`);
                    } else {
                      alert('Notifikasi aktif di browser/HP Anda.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  📱 Registrasi FCM Token Perangkat Ini
                </button>

                <button
                  type="button"
                  onClick={() => setShowFcmModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>🛠️ Generator Code Payload FCM (Status Bar & Bunyi)</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestFirebaseConnection}
                  disabled={testingFirebase}
                  className="px-4 py-2.5 rounded-xl bg-amber-900/40 hover:bg-amber-800/80 text-amber-300 border border-amber-700/50 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${testingFirebase ? 'animate-spin' : ''}`} />
                  <span>Tes Koneksi Firestore Real-time</span>
                </button>

                {metaForm.firebaseConfig?.projectId && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultFirebase}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Gunakan Firebase Bawaan Otomatis
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Seluruh Konfigurasi API</span>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-400">Area Reset & Emergency</h4>
                <p className="text-[11px] text-slate-500">Reset ulang data lokal ke data awal seed 18 sheets.</p>
              </div>
              <button
                type="button"
                onClick={handleResetDataToDefaults}
                className="px-3.5 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-800 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Database Seed</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Konversi Android Studio & Firebase Push Notification Pro */}
      {activeTab === 'ANDROID_STUDIO' && (() => {
        const androidConfig: AndroidStudioConfig = {
          webUrl: settings?.android_web_url || 'https://tntimbu.github.io/jesuskingdomchrist/',
          appName: settings?.android_app_name || settings?.nama_gereja || DEFAULT_ANDROID_CONFIG.appName,
          packageName: settings?.android_package_name || settings?.firebase_package_name || DEFAULT_ANDROID_CONFIG.packageName,
          statusBarColor: settings?.android_status_bar_color || DEFAULT_ANDROID_CONFIG.statusBarColor,
          statusBarStyle: settings?.android_status_bar_style || DEFAULT_ANDROID_CONFIG.statusBarStyle,
          navBarColor: settings?.android_nav_bar_color || DEFAULT_ANDROID_CONFIG.navBarColor,
          enablePullToRefresh: settings?.android_enable_pull_to_refresh ?? DEFAULT_ANDROID_CONFIG.enablePullToRefresh,
          enableHardwareAcceleration: settings?.android_enable_hardware_acceleration ?? DEFAULT_ANDROID_CONFIG.enableHardwareAcceleration,
          enableFullscreen: settings?.android_enable_fullscreen ?? DEFAULT_ANDROID_CONFIG.enableFullscreen,
          safeAreaPadding: settings?.android_safe_area_padding ?? DEFAULT_ANDROID_CONFIG.safeAreaPadding,
          splashBgColor: settings?.android_splash_bg_color || DEFAULT_ANDROID_CONFIG.splashBgColor,
          splashDurationMs: settings?.android_splash_duration_ms || DEFAULT_ANDROID_CONFIG.splashDurationMs,
          userAgentSuffix: settings?.android_user_agent_suffix || DEFAULT_ANDROID_CONFIG.userAgentSuffix,
          fcmTopic: settings?.android_fcm_default_topic || DEFAULT_ANDROID_CONFIG.fcmTopic,
          senderId: settings?.firebase_messaging_sender_id || '248780279971',
          projectId: settings?.firebase_project_id || 'gen-lang-client-0499830391'
        };

        const getEmbedCode = () => {
          switch (selectedEmbedCodeFile) {
            case 'GRADLE_PROPERTIES':
              return {
                filename: 'gradle.properties',
                path: 'Root Project / gradle.properties',
                desc: 'Wajib untuk mengatasi error AndroidX. Berisi android.useAndroidX=true & android.enableJetifier=true.',
                code: generateGradleProperties(),
                tag: 'Wajib AndroidX 🚨'
              };
            case 'MANIFEST':
              return {
                filename: 'AndroidManifest.xml',
                path: 'app / src / main / AndroidManifest.xml',
                desc: 'Manifest Android 14 bebas error, menggunakan Theme.AppCompat.DayNight.NoActionBar bawaan tanpa error missing style.',
                code: generateAndroidManifestXml(androidConfig),
                tag: 'Manifest Diperbarui ⭐'
              };
            case 'MAIN_ACTIVITY_KT':
              return {
                filename: 'MainActivity.kt',
                path: `app / src / main / java / ${androidConfig.packageName.replace(/\./g, '/')} / MainActivity.kt`,
                desc: 'Activity Utama Kotlin modern - WebView responsif dengan pull-to-refresh, status bar serasi, & upload foto bukti.',
                code: generateMainActivityKotlin(androidConfig),
                tag: 'Kotlin Modern 🚀'
              };
            case 'APP_GRADLE_KTS':
              return {
                filename: 'build.gradle.kts (:app)',
                path: 'app / build.gradle.kts',
                desc: 'Modul App Kotlin DSL - Menggunakan id plugin standar bebas error libs.plugins unresolved.',
                code: generateAppBuildGradleKts(androidConfig),
                tag: 'Kotlin DSL 🔥'
              };
            case 'PROJECT_GRADLE_KTS':
              return {
                filename: 'build.gradle.kts (Project)',
                path: 'Root Project / build.gradle.kts',
                desc: 'Root Project Kotlin DSL - Bebas bentrok repository dengan settings.gradle.kts.',
                code: generateProjectBuildGradleKts(),
                tag: 'Root Kotlin DSL'
              };
            case 'SETTINGS_GRADLE_KTS':
              return {
                filename: 'settings.gradle.kts',
                path: 'Root Project / settings.gradle.kts',
                desc: 'Settings Kotlin DSL - Konfigurasi resmi dependency resolution Google Maven & MavenCentral.',
                code: generateSettingsGradleKts(androidConfig),
                tag: 'Settings DSL'
              };
            case 'FCM_SERVICE':
              return {
                filename: 'MyFirebaseMessagingService.java',
                path: `app / src / main / java / ${androidConfig.packageName.replace(/\./g, '/')} / MyFirebaseMessagingService.java`,
                desc: 'Service FCM background penerima warta & notifikasi suara alarm Android 13/14.',
                code: generateFirebaseMessagingServiceJava(androidConfig),
                tag: 'FCM Push Notif'
              };
            case 'MAIN_ACTIVITY':
              return {
                filename: 'MainActivity.java',
                path: `app / src / main / java / ${androidConfig.packageName.replace(/\./g, '/')} / MainActivity.java`,
                desc: 'Activity Utama Java murni bagi pengguna yang menggunakan Java bukannya Kotlin.',
                code: generateMainActivityJava(androidConfig),
                tag: 'Java Alternatif'
              };
            case 'LIBS_VERSIONS_TOML':
              return {
                filename: 'gradle/libs.versions.toml',
                path: 'gradle / libs.versions.toml',
                desc: 'Version Catalog untuk proyek Android Studio modern versi Giraffe / Hedgehog / Koala.',
                code: generateLibsVersionsToml(),
                tag: 'Version Catalog'
              };
            case 'APP_GRADLE':
              return {
                filename: 'app/build.gradle',
                path: 'app / build.gradle (Groovy)',
                desc: 'Versi Groovy build.gradle modul app.',
                code: generateAppBuildGradle(androidConfig),
                tag: 'Groovy App'
              };
            case 'PROJECT_GRADLE':
              return {
                filename: 'project/build.gradle',
                path: 'Root Project / build.gradle (Groovy)',
                desc: 'Versi Groovy build.gradle tingkat root project.',
                code: generateProjectBuildGradle(),
                tag: 'Groovy Root'
              };
            case 'SETTINGS_GRADLE':
              return {
                filename: 'settings.gradle',
                path: 'Root Project / settings.gradle (Groovy)',
                desc: 'Versi Groovy settings.gradle.',
                code: generateSettingsGradle(androidConfig),
                tag: 'Groovy Settings'
              };
            default:
              return {
                filename: 'gradle.properties',
                path: 'Root Project / gradle.properties',
                desc: 'Wajib untuk mengatasi error AndroidX.',
                code: generateGradleProperties(),
                tag: 'Properties'
              };
          }
        };

        const currentEmbed = getEmbedCode();

        const handleDownloadAllEmbed = async () => {
          setIsDownloadingAllEmbed(true);
          try {
            await downloadAndroidStudioProjectZip(androidConfig, settings);
          } catch (err) {
            console.error('Error generating zip:', err);
            downloadFile('MainActivity.java', generateMainActivityJava(androidConfig));
            downloadFile('MainActivity.kt', generateMainActivityKotlin(androidConfig));
            downloadFile('MyFirebaseMessagingService.java', generateFirebaseMessagingServiceJava(androidConfig));
            downloadFile('AndroidManifest.xml', generateAndroidManifestXml(androidConfig));
            downloadFile('build.gradle.kts', generateAppBuildGradleKts(androidConfig));
            downloadFile('gradle.properties', generateGradleProperties());
            downloadGoogleServicesJsonFile(androidConfig.packageName, settings);
          } finally {
            setIsDownloadingAllEmbed(false);
          }
        };

        return (
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border-2 border-indigo-500/40 p-6 sm:p-8 text-white space-y-5 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-1">
                    <Smartphone className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-extrabold text-white">
                        Konversi Android Studio &amp; Firebase Push Notification Pro
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                        Android 14 Ready
                      </span>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold border border-cyan-500/30">
                        Build 100% Fixed
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                      Konversikan website gereja <code className="text-amber-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded">{androidConfig.webUrl}</code> menjadi aplikasi Android native siap rilis ke Google Play Store dengan status bar profesional, pull-to-refresh, dukungan kamera/upload bukti persembahan, serta push notifikasi Firebase Cloud Messaging gratis tanpa batas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAndroidStudioModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Buka Modal Lengkap &amp; Live Tester</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => downloadGoogleServicesJsonFile(androidConfig.packageName, settings)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download google-services.json</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDownloadingAllEmbed}
                    onClick={handleDownloadAllEmbed}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDownloadingAllEmbed ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isDownloadingAllEmbed ? 'Mengunduh...' : 'Unduh Semua File Proyek (.zip)'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Target Package: <code className="text-emerald-400 font-mono font-bold">{androidConfig.packageName}</code>
                </div>
              </div>
            </div>

            {/* Build Error Resolution Callout */}
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/50 text-xs text-slate-300 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5 text-rose-400 font-extrabold text-sm sm:text-base">
                  <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400 animate-pulse" />
                  <span>Solusi Error Gambar Terbaru: &quot;Package name does not correspond to file path&quot;</span>
                </div>
                <button
                  type="button"
                  disabled={isDownloadingAllEmbed}
                  onClick={handleDownloadAllEmbed}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  {isDownloadingAllEmbed ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>Unduh ZIP Proyek Utuh (Langsung Jadi)</span>
                </button>
              </div>

              {/* Detail Penyebab Error dari Screenshot User */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-3">
                <p className="font-extrabold flex items-center gap-2 text-white text-sm">
                  <span>🚨 Mengapa Muncul Error pada Gambar Anda?</span>
                </p>
                <p className="leading-relaxed text-slate-200">
                  Pada screenshot Anda, di panel kiri folder <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">app/src/main/java/</code>: file <strong className="text-rose-300">MyFirebaseMessagingService.java</strong> ditaruh <strong>di luar</strong> folder paket! File tersebut berada sejajar dengan folder <code className="bg-slate-950 px-2 py-0.5 rounded text-emerald-400 font-mono">com.managementschool.app</code>, bukan di dalamnya.
                </p>
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-emerald-400 font-sans font-bold text-xs">Cara Cepat Memperbaikinya (Pilih Salah Satu):</p>
                  <div className="space-y-2 text-slate-300 text-[12px]">
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                      <strong>✅ CARA 1 (Paling Mudah &amp; Anti-Gagal):</strong>
                      <p className="mt-1">
                        Klik tombol hijau <strong>&quot;Unduh ZIP Proyek Utuh&quot;</strong> di atas. Ekstrak filenya, lalu di Android Studio buka via menu <strong>File &gt; Open</strong>. Semua file &amp; foldernya sudah tersusun 100% sempurna di tempatnya masing-masing, Anda tinggal klik <strong>Build APK</strong>!
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      <strong>🖱️ CARA 2 (Perbaiki di Android Studio Anda sekarang):</strong>
                      <p className="mt-1">
                        Di panel pohon file sebelah kiri Android Studio, klik dan tahan (drag) file <span className="text-amber-400 font-bold">MyFirebaseMessagingService</span> lalu geser/jatuhkan (drop) masuk ke dalam folder <span className="text-cyan-400 font-bold">com.managementschool.app</span>. Bila muncul kotak konfirmasi dialog, klik <strong>&quot;Refactor&quot;</strong>. Error merah langsung hilang!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PETA LOKASI FILE & STRUKTUR FOLDER ANDROID STUDIO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>PETA STRUKTUR FOLDER LENGKAP: Kemana Setiap File Harus Ditempel</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Pohon Direktori Visual */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 select-all overflow-x-auto">
                    <p className="text-amber-400 font-bold pb-2 border-b border-slate-800">📁 ManagementSchool (Root Proyek)</p>
                    <div className="pl-2 pt-2 space-y-1">
                      <p className="text-slate-400">├── 📄 <span className="text-rose-400 font-bold">gradle.properties</span> <span className="text-emerald-400 font-sans text-[10px]">&lt;-- Tempel android.useAndroidX=true disini</span></p>
                      <p className="text-slate-400">├── 📄 <span className="text-cyan-300 font-bold">build.gradle.kts</span> (Project)</p>
                      <p className="text-slate-400">├── 📄 <span className="text-cyan-300 font-bold">settings.gradle.kts</span></p>
                      <p className="text-amber-400 font-bold pt-2">└── 📁 app (Modul Aplikasi)</p>
                      <div className="pl-4 space-y-1">
                        <p className="text-slate-400">├── 📄 <span className="text-cyan-300 font-bold">build.gradle.kts</span> (:app)</p>
                        <p className="text-slate-400">├── 📄 <span className="text-amber-300 font-bold">google-services.json</span> <span className="text-emerald-400 font-sans text-[10px]">&lt;-- Tempel di dalam folder app</span></p>
                        <p className="text-amber-400 font-bold pt-1">└── 📁 src / main</p>
                        <div className="pl-4 space-y-1">
                          <p className="text-slate-400">├── 📄 <span className="text-emerald-300 font-bold">AndroidManifest.xml</span> <span className="text-cyan-400 font-sans text-[10px]">&lt;-- Tema DayNight.NoActionBar</span></p>
                          <p className="text-amber-400 font-bold pt-1">└── 📁 java</p>
                          <div className="pl-4 space-y-1">
                            <p className="text-emerald-400 font-bold">└── 📁 com.managementschool.app <span className="text-rose-400 font-sans text-[10px]">&lt;-- KEDUA FILE HARUS DI SINI!</span></p>
                            <div className="pl-4 space-y-0.5">
                              <p className="text-white font-bold">├── 📄 MainActivity.kt (atau .java)</p>
                              <p className="text-white font-bold">└── 📄 MyFirebaseMessagingService.java</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabel Panduan Cepat Salin & Tempel */}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-400 font-bold">Daftar File dan Lokasi Persisnya:</p>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            gradle.properties
                          </p>
                          <p className="text-[11px] text-slate-400">Lokasi: Root paling luar project (sejajar dengan build.gradle.kts root).</p>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] shrink-0 font-bold">Wajib AndroidX</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            google-services.json
                          </p>
                          <p className="text-[11px] text-slate-400">Lokasi: Di dalam folder <code>app/</code> (sejajar dengan <code>app/build.gradle.kts</code>).</p>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] shrink-0 font-bold">Firebase FCM</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            AndroidManifest.xml
                          </p>
                          <p className="text-[11px] text-slate-400">Lokasi: Di dalam folder <code>app/src/main/AndroidManifest.xml</code>.</p>
                        </div>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[10px] shrink-0 font-bold">Manifest XML</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            MainActivity &amp; MyFirebaseMessagingService
                          </p>
                          <p className="text-[11px] text-slate-400">Lokasi: Di dalam package <code>app/src/main/java/{androidConfig.packageName.replace(/\./g, '/')}/</code>.</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] shrink-0 font-bold">Kode Java/KT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Langkah Eksekusi Akhir */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
                <p className="font-bold text-emerald-300 flex items-center gap-2">
                  <span>🚀 3 Langkah Terakhir untuk Menghasilkan APK:</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <p className="font-bold text-white text-[11px]">1. Sync Gradle</p>
                    <p className="text-[11px] text-slate-400 mt-1">Klik ikon gajah di kanan atas atau menu <strong>File &gt; Sync Project with Gradle Files</strong>.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <p className="font-bold text-white text-[11px]">2. Build APK</p>
                    <p className="text-[11px] text-slate-400 mt-1">Klik menu atas: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <p className="font-bold text-white text-[11px]">3. Ambil File APK</p>
                    <p className="text-[11px] text-slate-400 mt-1">Klik tulisan biru <strong>&quot;locate&quot;</strong> di pop-up kanan bawah. File APK siap dikirim ke HP!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Source Code Exporter */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Salin Kode Sumber Proyek (Java, Kotlin &amp; Gradle)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pilih file di bawah, klik tombol Salin, lalu tempelkan ke project Android Studio Anda.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentEmbed.code);
                      setCopiedEmbedFile(currentEmbed.filename);
                      setTimeout(() => setCopiedEmbedFile(null), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedEmbedFile === currentEmbed.filename ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEmbedFile === currentEmbed.filename ? 'Tersalin!' : `Salin ${currentEmbed.filename}`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadFile(currentEmbed.filename, currentEmbed.code)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* File Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin text-xs">
                {[
                  { id: 'GRADLE_PROPERTIES', label: 'gradle.properties (Wajib AndroidX) 🚨' },
                  { id: 'MANIFEST', label: 'AndroidManifest.xml (Diperbarui) ⭐' },
                  { id: 'MAIN_ACTIVITY_KT', label: 'MainActivity.kt (Kotlin Modern) 🚀' },
                  { id: 'APP_GRADLE_KTS', label: 'build.gradle.kts (:app) 🔥' },
                  { id: 'PROJECT_GRADLE_KTS', label: 'build.gradle.kts (Project)' },
                  { id: 'SETTINGS_GRADLE_KTS', label: 'settings.gradle.kts' },
                  { id: 'FCM_SERVICE', label: 'MyFirebaseMessagingService.java' },
                  { id: 'MAIN_ACTIVITY', label: 'MainActivity.java' },
                  { id: 'LIBS_VERSIONS_TOML', label: 'libs.versions.toml' },
                  { id: 'APP_GRADLE', label: 'app/build.gradle (Groovy)' },
                  { id: 'PROJECT_GRADLE', label: 'project/build.gradle (Groovy)' },
                  { id: 'SETTINGS_GRADLE', label: 'settings.gradle (Groovy)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedEmbedCodeFile(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedEmbedCodeFile === f.id
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Code Pre Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300 font-mono">
                  <div>
                    <span className="font-bold text-white flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-emerald-400" />
                      {currentEmbed.filename}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-sans">
                        {currentEmbed.tag}
                      </span>
                    </span>
                    <p className="text-[11px] text-cyan-400 font-sans mt-0.5">
                      📁 Letak File di Android Studio: <span className="font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{currentEmbed.path}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">Android SDK 34 • Java 17 / Kotlin 1.9+</span>
                </div>
                {currentEmbed.desc && (
                  <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-900 text-slate-400 text-[11px]">
                    💡 {currentEmbed.desc}
                  </div>
                )}
                <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[440px] leading-relaxed select-all">
                  {currentEmbed.code}
                </pre>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tab 3: Users & RBAC Management */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Header & Alert Notifications */}
          {userSuccess && (
            <div className={`p-3 border-2 rounded-xl text-xs font-bold flex items-center justify-between ${
              isLight ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            }`}>
              <span>{userSuccess}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Users className="w-4 h-4 text-teal-600" />
                <span>Manajemen Username, Password &amp; Hak Akses (01_USERS)</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                {currentUser.role === 'SUPER_ADMIN'
                  ? 'Kelola kredensial login (Username & Password) untuk Super Admin, Admin Sekretariat, dan Jemaat lintas gereja.'
                  : 'Kelola kredensial login (Username & Password) untuk Admin Sekretariat dan Jemaat gereja Anda.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {currentUser.role === 'SUPER_ADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsSecurityAlertModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer border border-rose-400/40"
                  title="Kirim Kartu Warning Merah & Alarm Darurat jika pengguna melanggar aturan keamanan"
                >
                  <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
                  <span>Kirim Peringatan Keamanan &amp; Alarm</span>
                </button>
              )}

              <button
                onClick={() => {
                  setUserError('');
                  setUserForm({
                    username: '',
                    email: '',
                    nama: '',
                    no_hp: '',
                    role: 'ADMIN',
                    status: 'Aktif',
                    password_hash: 'admin123',
                    confirm_password: 'admin123'
                  });
                  setIsUserModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah User Akun Baru</span>
              </button>
            </div>
          </div>

          {/* Multi-Tenant Isolation Status Box */}
          <div className={`p-3.5 border-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
            isLight
              ? 'bg-teal-50/80 border-teal-200 text-slate-800'
              : 'bg-indigo-950/40 border-indigo-500/30 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-teal-100 border-teal-300 text-teal-700' : 'bg-indigo-600/30 border-indigo-500/40 text-indigo-400'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>Isolasi Multi-Tenant Aktif</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isLight
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    Data Terisolasi Mandiri
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Ruang Kerja Aktif: <strong className={isLight ? 'text-teal-900 font-bold' : 'text-indigo-200'}>{activeChurchName}</strong> ({activeAdminTenantId}). Setiap akun gereja terisolasi dan tidak dapat diakses gereja lain.
                </p>
              </div>
            </div>

            {currentUser.role === 'SUPER_ADMIN' && (
              <div className={`flex items-center gap-2 border p-1.5 rounded-xl self-start sm:self-auto shrink-0 ${
                isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-slate-900/90 border-slate-700/80 text-white'
              }`}>
                <span className={`text-[11px] pl-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Lingkup SuperAdmin:</span>
                <select
                  value={filterTenantScope}
                  onChange={(e) => setFilterTenantScope(e.target.value as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold focus:outline-none border ${
                    isLight ? 'bg-slate-50 border-teal-200 text-slate-900' : 'bg-slate-950 border-indigo-500/50 text-indigo-200'
                  }`}
                >
                  <option value="CURRENT_CHURCH">Hanya Gereja Ini ({activeAdminTenantId})</option>
                  <option value="ALL_CHURCHES">Semua Gereja (Global Super Admin)</option>
                </select>
              </div>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className={`grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-white border-teal-200 shadow-xs text-slate-800'
              : 'bg-slate-900/90 border border-slate-800 text-white'
          }`}>
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Username, Nama, atau Email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none transition-colors border ${
                  isLight
                    ? 'bg-slate-50 border-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500'
                }`}
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none border ${
                  isLight
                    ? 'bg-slate-50 border-teal-200 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="ALL">Semua Role</option>
                {currentUser.role === 'SUPER_ADMIN' && (
                  <option value="SUPER_ADMIN">Super Admin</option>
                )}
                <option value="ADMIN">Admin</option>
                <option value="JEMAAT">Jemaat</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none border ${
                  isLight
                    ? 'bg-slate-50 border-teal-200 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Status: Aktif</option>
                <option value="Nonaktif">Status: Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-2xl border-2 overflow-hidden shadow-xl transition-colors ${
            isLight
              ? 'bg-white border-teal-100 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[11px] ${
                    isLight
                      ? 'bg-teal-50/80 border-teal-200 text-teal-950'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-3.5">Username &amp; ID</th>
                    <th className="p-3.5">Nama Lengkap &amp; Kontak</th>
                    <th className="p-3.5">Gereja / Ruang Lingkup</th>
                    <th className="p-3.5">Password Kredensial</th>
                    <th className="p-3.5">Hak Akses Role</th>
                    <th className="p-3.5">Status Akun</th>
                    <th className="p-3.5 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-teal-100/70' : 'divide-slate-800/60'}`}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                        Tidak ada pengguna yang cocok dengan filter pencarian untuk gereja ini.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isPasswordShown = !!showPasswordInTable[u.user_id];
                      const displayPass = u.password_hash || (u.role === 'JEMAAT' ? 'jemaat123' : 'admin123');
                      const userTenant = u.tenant_id || (u.role === 'SUPER_ADMIN' ? 'ALL' : 'CHURCH-001');
                      const userChurch = tenantsList.find((t) => t.tenant_id === userTenant);

                      return (
                        <tr key={u.user_id} className={`transition-all ${isLight ? 'hover:bg-teal-50/40' : 'hover:bg-slate-800/40'}`}>
                          <td className="p-3.5 font-mono">
                            <div className={`font-bold text-xs ${isLight ? 'text-teal-800' : 'text-indigo-300'}`}>{u.username}</div>
                            <div className="text-[10px] text-slate-500">{u.user_id}</div>
                          </td>

                          <td className="p-3.5">
                            <div className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{u.nama}</div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{u.email || '-'}</div>
                            {u.no_hp && <div className="text-[10px] text-slate-500">{u.no_hp}</div>}
                          </td>

                          <td className="p-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] ${isLight ? 'text-teal-800' : 'text-indigo-300'}`}>
                                <Building className={`w-3 h-3 ${isLight ? 'text-teal-600' : 'text-indigo-400'}`} />
                                {userTenant}
                              </span>
                              <span className={`text-[11px] max-w-[150px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`} title={userTenant === 'ALL' ? 'Global Super Admin' : (userChurch?.nama_gereja || userTenant)}>
                                {userTenant === 'ALL'
                                  ? 'Global (Semua Gereja)'
                                  : (userChurch?.nama_gereja || 'GKFC Sunter')}
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs border ${
                              isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border border-slate-800 text-amber-300'
                            }`}>
                              <KeyRound className="w-3 h-3 text-slate-500" />
                              <span className="font-bold">{isPasswordShown ? displayPass : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => toggleTablePasswordVisible(u.user_id)}
                                title={isPasswordShown ? 'Sembunyikan' : 'Tampilkan Password'}
                                className={`ml-1 cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}
                              >
                                {isPasswordShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                u.role === 'SUPER_ADMIN'
                                  ? (isLight ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30')
                                  : u.role === 'ADMIN'
                                  ? (isLight ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-blue-500/20 text-blue-300 border-blue-500/30')
                                  : (isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30')
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                u.status === 'Aktif'
                                  ? (isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')
                                  : (isLight ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-500/20 text-rose-400 border-rose-500/30')
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            {u.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Terkunci (SuperAdmin)</span>
                              </span>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Edit Username & Password Button */}
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isLight ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-2xs' : 'bg-indigo-900/40 hover:bg-indigo-800/80 text-indigo-300 border border-indigo-700/50'
                                  }`}
                                  title="Ubah Username & Password / Edit Profile"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Reset Quick Password */}
                                <button
                                  onClick={() => handleQuickResetPassword(u)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isLight ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-2xs' : 'bg-amber-900/40 hover:bg-amber-800/80 text-amber-300 border border-amber-700/50'
                                  }`}
                                  title="Reset Password Acak"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>

                                {/* Toggle Status */}
                                <button
                                  onClick={() => handleToggleUserStatus(u.user_id)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                    u.status === 'Aktif'
                                      ? (isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700')
                                      : (isLight ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/50')
                                  }`}
                                >
                                  {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>

                                {/* Delete User */}
                                {u.username !== 'superadmin' && u.role !== 'SUPER_ADMIN' && u.user_id !== currentUser.user_id && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-2xs' : 'bg-rose-900/30 hover:bg-rose-800/80 text-rose-300 border border-rose-800/50'
                                    }`}
                                    title="Hapus User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* SuperAdmin Direct Warning Action */}
                                {currentUser.role === 'SUPER_ADMIN' && u.user_id !== currentUser.user_id && (
                                  <button
                                    onClick={() => {
                                      setTargetedSecurityAlertUserId(u.user_id);
                                      setIsSecurityAlertModalOpen(true);
                                    }}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isLight ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300' : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/40'
                                    }`}
                                    title={`Kirim Peringatan Keamanan Merah ke ${u.username}`}
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Audit Activity Logs &amp; Login History (17_ACTIVITY_LOGS)
          </h3>

          <div className={`rounded-2xl border-2 overflow-hidden shadow-xl transition-colors ${
            isLight ? 'bg-white border-teal-100 text-slate-800' : 'bg-slate-900 border border-slate-800 text-slate-300'
          }`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[11px] ${
                    isLight ? 'bg-teal-50/80 border-teal-200 text-teal-950' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-3.5">Log ID &amp; Waktu</th>
                    <th className="p-3.5">User Operasional</th>
                    <th className="p-3.5">Aktivitas Perubahan</th>
                    <th className="p-3.5">Module</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-teal-100/70' : 'divide-slate-800/60'}`}>
                  {activityLogs.map((log) => (
                    <tr key={log.log_id} className={`transition-all ${isLight ? 'hover:bg-teal-50/40' : 'hover:bg-slate-800/40'}`}>
                      <td className="p-3.5 font-mono text-slate-500">
                        <div>{log.tanggal}</div>
                        <div className="text-[10px] text-slate-400">{log.log_id}</div>
                      </td>
                      <td className={`p-3.5 font-bold ${isLight ? 'text-teal-800' : 'text-indigo-300'}`}>{log.user}</td>
                      <td className={`p-3.5 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{log.aktivitas}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {log.module}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {isUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Tambah Akun Pengguna Baru</span>
              </h3>
              <button onClick={() => setIsUserModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="adminsekretariat"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Penatua Samuel"
                    value={userForm.nama}
                    onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password Kredensial *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateRandomPassword();
                      setUserForm({ ...userForm, password_hash: pass, confirm_password: pass });
                      setShowAddPassword(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    <span>Acak Password</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan Password"
                      value={userForm.password_hash}
                      onChange={(e) => setUserForm({ ...userForm, password_hash: e.target.value })}
                      className="w-full pr-8 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showAddPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      placeholder="Konfirmasi Password"
                      value={userForm.confirm_password}
                      onChange={(e) => setUserForm({ ...userForm, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@gkfc-cms.org"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+62 812-3456-7890"
                    value={userForm.no_hp}
                    onChange={(e) => setUserForm({ ...userForm, no_hp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role Permission</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  >
                    <option value="ADMIN">ADMIN (Kelola Data & Sekretariat Gereja)</option>
                    {currentUser.role === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Akses Penuh System)</option>
                    )}
                    <option value="JEMAAT">JEMAAT (Portal Anggota Mandiri)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Akun</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Church Scope Badge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span>Ruang Lingkup Gereja:</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span className="text-indigo-300">{activeChurchName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {userForm.role === 'SUPER_ADMIN' ? 'ALL (Global)' : activeAdminTenantId}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-600/30 cursor-pointer">
                  Simpan User Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Username & Password */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                <span>Ubah Username & Password ({editingUser.user_id})</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.nama}
                    onChange={(e) => setEditUserForm({ ...editUserForm, nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Ubah Password Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ubah Password Akun</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">Biarkan kosong jika tidak ingin mengubah password lama.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateRandomPassword();
                      setEditUserForm({ ...editUserForm, new_password: pass, confirm_password: pass });
                      setShowEditPassword(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    <span>Generate Password</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Password Baru..."
                      value={editUserForm.new_password}
                      onChange={(e) => setEditUserForm({ ...editUserForm, new_password: e.target.value })}
                      className="w-full pr-8 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Konfirmasi Password Baru..."
                      value={editUserForm.confirm_password}
                      onChange={(e) => setEditUserForm({ ...editUserForm, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nomor HP</label>
                  <input
                    type="text"
                    value={editUserForm.no_hp}
                    onChange={(e) => setEditUserForm({ ...editUserForm, no_hp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role Permission</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  >
                    <option value="ADMIN">ADMIN (Kelola Data & Sekretariat Gereja)</option>
                    {currentUser.role === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Akses Penuh System)</option>
                    )}
                    <option value="JEMAAT">JEMAAT (Portal Anggota Mandiri)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Akun</label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-600/30 cursor-pointer">
                  Simpan Perubahan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Generator Code Payload FCM */}
      {showFcmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  <span>Generator Code Payload FCM (Heads-Up & Sound Status Bar HP)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Format JSON, Node.js Admin SDK, cURL, dan Android Channel Setup agar notifikasi muncul diatas layar dan berbunyi meskipun aplikasi ditutup.
                </p>
              </div>
              <button onClick={() => setShowFcmModal(false)} className="text-slate-400 hover:text-white font-bold text-lg px-2 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-4">

            {/* Config Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Judul Notifikasi (Title)</label>
                <input
                  type="text"
                  value={fcmTitle}
                  onChange={(e) => setFcmTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Channel ID Android (Penting!)</label>
                <input
                  type="text"
                  value={fcmChannelId}
                  onChange={(e) => setFcmChannelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Isi Pesan Notifikasi (Body)</label>
                <input
                  type="text"
                  value={fcmBody}
                  onChange={(e) => setFcmBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama File Suara (Sound)</label>
                <input
                  type="text"
                  value={fcmSound}
                  onChange={(e) => setFcmSound(e.target.value)}
                  placeholder="default"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">FCM Device Token Tujuan</label>
                <input
                  type="text"
                  value={fcmTargetToken}
                  onChange={(e) => setFcmTargetToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              {[
                { id: 'JSON', label: '📄 FCM HTTP v1 JSON' },
                { id: 'NODE', label: '🟢 Node.js Admin SDK' },
                { id: 'CURL', label: '💻 cURL Command' },
                { id: 'ANDROID', label: '🤖 Android Kotlin Channel' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFcmTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeFcmTab === tab.id
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Output Viewer */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-indigo-200 overflow-x-auto max-h-80">
              <button
                onClick={() => {
                  let textToCopy = '';
                  if (activeFcmTab === 'JSON') {
                    textToCopy = JSON.stringify(
                      {
                        message: {
                          token: fcmTargetToken,
                          notification: { title: fcmTitle, body: fcmBody },
                          android: {
                            priority: 'HIGH',
                            notification: {
                              channel_id: fcmChannelId,
                              sound: fcmSound,
                              default_sound: true,
                              default_vibrate_timings: true,
                              notification_priority: 'PRIORITY_MAX',
                              visibility: 'PUBLIC'
                            }
                          },
                          apns: {
                            headers: { 'apns-priority': '10' },
                            payload: { aps: { sound: fcmSound, badge: 1 } }
                          }
                        }
                      },
                      null,
                      2
                    );
                  } else if (activeFcmTab === 'NODE') {
                    textToCopy = `const admin = require('firebase-admin');\n\nasync function sendPushNotification(token) {\n  await admin.messaging().send({\n    token: token,\n    notification: {\n      title: '${fcmTitle}',\n      body: '${fcmBody}'\n    },\n    android: {\n      priority: 'high',\n      notification: {\n        channelId: '${fcmChannelId}',\n        sound: '${fcmSound}',\n        priority: 'max'\n      }\n    }\n  });\n}`;
                  } else if (activeFcmTab === 'CURL') {
                    textToCopy = `curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \\\n  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"message":{"token":"${fcmTargetToken}","notification":{"title":"${fcmTitle}","body":"${fcmBody}"},"android":{"priority":"HIGH","notification":{"channel_id":"${fcmChannelId}","sound":"${fcmSound}"}}}}'`;
                  } else {
                    textToCopy = `if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {\n    val channel = NotificationChannel(\n        "${fcmChannelId}",\n        "Pemberitahuan Utama",\n        NotificationManager.IMPORTANCE_HIGH\n    ).apply {\n        description = "Channel notifikasi status bar dan bunyi"\n        enableVibration(true)\n    }\n    val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager\n    notificationManager.createNotificationChannel(channel)\n}`;
                  }

                  navigator.clipboard.writeText(textToCopy);
                  setCopiedFcmCode(true);
                  setTimeout(() => setCopiedFcmCode(false), 2000);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 shadow"
              >
                {copiedFcmCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFcmCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>

              <pre className="whitespace-pre-wrap leading-relaxed">
                {activeFcmTab === 'JSON' &&
                  JSON.stringify(
                    {
                      message: {
                        token: fcmTargetToken,
                        notification: {
                          title: fcmTitle,
                          body: fcmBody
                        },
                        data: {
                          click_action: 'FLUTTER_NOTIFICATION_CLICK',
                          url: '/'
                        },
                        android: {
                          priority: 'HIGH',
                          notification: {
                            channel_id: fcmChannelId,
                            sound: fcmSound,
                            default_sound: true,
                            default_vibrate_timings: true,
                            notification_priority: 'PRIORITY_MAX',
                            visibility: 'PUBLIC',
                            icon: 'ic_notification'
                          }
                        },
                        apns: {
                          headers: {
                            'apns-priority': '10'
                          },
                          payload: {
                            aps: {
                              alert: {
                                title: fcmTitle,
                                body: fcmBody
                              },
                              sound: fcmSound,
                              badge: 1,
                              'content-available': 1
                            }
                          }
                        },
                        webpush: {
                          headers: {
                            Urgency: 'high'
                          },
                          notification: {
                            title: fcmTitle,
                            body: fcmBody,
                            requireInteraction: true,
                            vibrate: [200, 100, 200]
                          }
                        }
                      }
                    },
                    null,
                    2
                  )}

                {activeFcmTab === 'NODE' &&
                  `// Node.js Backend Code (Firebase Admin SDK)
const admin = require('firebase-admin');

async function sendHeadsUpNotification(targetToken) {
  const message = {
    token: targetToken,
    notification: {
      title: '${fcmTitle}',
      body: '${fcmBody}'
    },
    android: {
      priority: 'high',
      notification: {
        channelId: '${fcmChannelId}',
        sound: '${fcmSound}',
        defaultSound: true,
        defaultVibrateTimings: true,
        priority: 'max',
        visibility: 'public'
      }
    },
    apns: {
      headers: { 'apns-priority': '10' },
      payload: {
        aps: {
          sound: '${fcmSound}',
          badge: 1
        }
      }
    }
  };

  const response = await admin.messaging().send(message);
  console.log('Success sending FCM push notification:', response);
}`}

                {activeFcmTab === 'CURL' &&
                  `# FCM HTTP v1 REST API cURL Command
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \\
  -H "Authorization: Bearer YOUR_OAUTH_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": {
      "token": "${fcmTargetToken}",
      "notification": {
        "title": "${fcmTitle}",
        "body": "${fcmBody}"
      },
      "android": {
        "priority": "HIGH",
        "notification": {
          "channel_id": "${fcmChannelId}",
          "sound": "${fcmSound}",
          "notification_priority": "PRIORITY_MAX"
        }
      }
    }
  }'`}

                {activeFcmTab === 'ANDROID' &&
                  `// Android Native / Flutter (Kotlin) - Wajib buat NotificationChannel High Importance
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

fun createHighImportanceChannel(context: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channelId = "${fcmChannelId}"
        val channelName = "Notifikasi Utama Status Bar"
        val importance = NotificationManager.IMPORTANCE_HIGH
        
        val channel = NotificationChannel(channelId, channelName, importance).apply {
            description = "Channel untuk mambuat notifikasi memunculkan banner status bar & suara saat app ditutup"
            enableVibration(true)
            vibrationPattern = longArrayOf(200, 100, 200, 100, 200)
        }
        
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }
}`}
              </pre>
            </div>

            <div className="p-3 bg-purple-950/40 border border-purple-500/30 text-purple-200 rounded-xl text-[11px] space-y-1">
              <div className="font-bold">🔑 Kunci Utama Agar Notifikasi Muncul di Status Bar & Berbunyi saat App Ditutup:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li><code className="text-amber-300 font-mono">android.priority = "HIGH"</code> (memaksa OS tidak menunda pesan).</li>
                <li><code className="text-amber-300 font-mono">android.notification.channel_id</code> harus cocok dengan <code className="text-amber-300 font-mono">IMPORTANCE_HIGH</code> di Android HP.</li>
                <li><code className="text-amber-300 font-mono">android.notification.sound = "default"</code> (atau nama file audio di res/raw).</li>
                <li><code className="text-amber-300 font-mono">apns.headers["apns-priority"] = "10"</code> untuk perangkat iOS / Apple iPhone.</li>
              </ul>
            </div>

            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setShowFcmModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan Website 2 APK Builder */}
      <Website2ApkNotificationGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        senderId={metaForm.onesignal_google_project_number || '250034601366'}
        appUrl={window.location.origin}
        packageName={apkPackageName}
      />

      {/* Modal Konversi Android Studio & Firebase Push Notification Pro */}
      <AndroidStudioConverterModal
        isOpen={isAndroidStudioModalOpen}
        onClose={() => setIsAndroidStudioModalOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* Modal Kirim Peringatan Keamanan Merah & Alarm Darurat (SuperAdmin) */}
      <SuperAdminSecurityAlertModal
        isOpen={isSecurityAlertModalOpen}
        onClose={() => {
          setIsSecurityAlertModalOpen(false);
          setTargetedSecurityAlertUserId(undefined);
        }}
        currentUser={currentUser}
        usersList={usersList}
        initialTargetUserId={targetedSecurityAlertUserId}
      />
    </div>
  );
};
