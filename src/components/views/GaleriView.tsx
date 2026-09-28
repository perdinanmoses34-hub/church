import React, { useState, useEffect, useRef } from 'react';
import { GalleryItem, User, FeaturedVideo } from '../../types';
import { StorageManager } from '../../utils/storage';
import { parseSocialVideoUrl } from '../../utils/videoHelper';
import { broadcastContentNotification } from '../../utils/notificationBroadcast';
import { confirmDialog } from '../../utils/confirmDialog';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Filter,
  Play,
  Upload,
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Tag,
  CheckCircle2,
  Tv,
  HardDrive,
  FolderPlus,
  FileImage,
  UploadCloud,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Check,
  Eye,
  Database,
  Layers,
  Sparkle
} from 'lucide-react';
import { compressImage, downloadPhotoFile } from '../../utils/imageCompressor';

interface GaleriViewProps {
  currentUser: User;
  initialTab?: 'GALLERY' | 'SOCIAL_VIDEOS';
}

export const GaleriView: React.FC<GaleriViewProps> = ({ currentUser, initialTab = 'GALLERY' }) => {
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const [settings] = useState(() => StorageManager.getSettings());
  const isLightSystem =
    settings.theme_preset === 'EMERALD_LIGHT' ||
    settings.theme_preset === 'LUXE_LIGHT' ||
    settings.theme_preset === 'CLEAN_LIGHT' ||
    !settings.theme_preset;
  const [activeTab, setActiveTab] = useState<'GALLERY' | 'SOCIAL_VIDEOS'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(() => StorageManager.getGallery());
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>(() => StorageManager.getFeaturedVideos());
  const [activeType, setActiveType] = useState<'ALL' | 'Foto' | 'Video'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  
  // Modals & Lightbox states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GalleryItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [showStorageGuide, setShowStorageGuide] = useState<boolean>(false);
  const [uploadCompressionInfo, setUploadCompressionInfo] = useState<{ sizeKb: number; originalSizeKb: number } | null>(null);

  // File input ref for local/offline image uploading
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [offlineFileName, setOfflineFileName] = useState<string>('');

  const handleOfflineFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WEBP, GIF)!');
      return;
    }

    setOfflineFileName(`${file.name} (Memproses kompresi otomatis...)`);
    try {
      const result = await compressImage(file, 1600, 0.82);
      setUploadCompressionInfo({
        sizeKb: result.sizeKb,
        originalSizeKb: result.originalSizeKb
      });
      setOfflineFileName(file.name);
      setMediaForm((prev) => ({
        ...prev,
        foto: result.dataUrl,
        judul: prev.judul || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      }));
    } catch (err) {
      console.warn('Fallback standard reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (res) {
          setOfflineFileName(file.name);
          setMediaForm((prev) => ({
            ...prev,
            foto: res,
            judul: prev.judul || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [mediaForm, setMediaForm] = useState({
    judul: '',
    tipe: 'Foto' as 'Foto' | 'Video',
    foto: '',
    video_url: '',
    kategori: 'Ibadah',
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: ''
  });

  // Add Featured Social Video Form
  const [videoForm, setVideoForm] = useState({
    judul: '',
    video_url: '',
    keterangan: '',
    platform: 'YouTube' as 'YouTube' | 'TikTok' | 'Instagram' | 'Direct',
    kategori: 'Ibadah Raya',
    is_active: true
  });

  const loadData = React.useCallback(() => {
    const g = StorageManager.getGallery();
    setGalleryList((prev) => (prev.length !== g.length || JSON.stringify(prev) !== JSON.stringify(g) ? g : prev));
    const f = StorageManager.getFeaturedVideos();
    setFeaturedVideos((prev) => (prev.length !== f.length || JSON.stringify(prev) !== JSON.stringify(f) ? f : prev));
  }, []);

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('cms_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const intervalId = setInterval(loadData, 2500);

    return () => {
      window.removeEventListener('cms_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(intervalId);
    };
  }, [loadData]);

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.judul) return;

    const vUrl = mediaForm.video_url || (mediaForm.tipe === 'Video' ? mediaForm.foto : '');

    const newItem: GalleryItem = {
      gallery_id: `GAL-2026-${(galleryList.length + 1).toString().padStart(3, '0')}`,
      judul: mediaForm.judul,
      tipe: mediaForm.tipe,
      foto: mediaForm.foto || (mediaForm.tipe === 'Foto' ? 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'),
      video_url: vUrl,
      kategori: mediaForm.kategori,
      tanggal: mediaForm.tanggal,
      keterangan: mediaForm.keterangan,
      penulis: currentUser.nama || 'Sekretariat'
    };

    const updated = [newItem, ...galleryList];
    setGalleryList(updated);
    StorageManager.saveGallery(updated);

    // Auto sync video items to Featured Videos for live stream stream display
    if (mediaForm.tipe === 'Video' && vUrl) {
      const parsed = parseSocialVideoUrl(vUrl);
      const newFeat: FeaturedVideo = {
        video_id: `VID-${Date.now().toString().slice(-4)}`,
        judul: mediaForm.judul,
        video_url: vUrl,
        keterangan: mediaForm.keterangan,
        is_active: true,
        tanggal: mediaForm.tanggal,
        platform: parsed.type === 'youtube' ? 'YouTube' : parsed.type === 'tiktok' ? 'TikTok' : parsed.type === 'instagram' ? 'Instagram' : 'Direct',
        kategori: mediaForm.kategori
      };
      const existing = StorageManager.getFeaturedVideos().map((v) => ({ ...v, is_active: false }));
      const updatedFeats = [newFeat, ...existing];
      StorageManager.saveFeaturedVideos(updatedFeats);
      setFeaturedVideos(updatedFeats);

      // Broadcast floating notification for new video
      broadcastContentNotification({
        category: 'Video',
        action: 'TAMBAH',
        title: mediaForm.judul,
        summary: mediaForm.keterangan || `Video kegiatan "${mediaForm.judul}" telah diunggah ke galeri gereja.`,
        targetView: 'galeri',
        targetId: newItem.gallery_id,
        senderName: currentUser.nama || 'Tim Multimedia Gereja'
      });
    }

    StorageManager.logActivity(currentUser.username, `Mengunggah media galeri: ${newItem.judul}`, 'Galeri');

    setIsAddModalOpen(false);
    setMediaForm({
      judul: '',
      tipe: 'Foto',
      foto: '',
      video_url: '',
      kategori: 'Ibadah',
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: ''
    });
  };

  const handleSaveSocialVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.judul || !videoForm.video_url) return;

    const parsed = parseSocialVideoUrl(videoForm.video_url);

    const newVideo: FeaturedVideo = {
      video_id: `VID-${Date.now().toString().slice(-4)}`,
      judul: videoForm.judul,
      video_url: videoForm.video_url,
      keterangan: videoForm.keterangan,
      is_active: videoForm.is_active,
      tanggal: new Date().toISOString().slice(0, 10),
      platform: parsed.type === 'youtube' ? 'YouTube' : parsed.type === 'tiktok' ? 'TikTok' : parsed.type === 'instagram' ? 'Instagram' : 'Direct',
      kategori: videoForm.kategori
    };

    let updatedList = [...featuredVideos];
    if (videoForm.is_active) {
      updatedList = updatedList.map((v) => ({ ...v, is_active: false }));
    }
    updatedList = [newVideo, ...updatedList];

    setFeaturedVideos(updatedList);
    StorageManager.saveFeaturedVideos(updatedList);
    StorageManager.logActivity(currentUser.username, `Menambahkan video media sosial: ${newVideo.judul}`, 'Galeri');

    // Broadcast floating notification for newly added social video
    broadcastContentNotification({
      category: 'Video',
      action: 'TAMBAH',
      title: videoForm.judul,
      summary: videoForm.keterangan || `Tayangan video ${videoForm.platform} "${videoForm.judul}" telah ditambahkan.`,
      targetView: 'galeri',
      targetId: newVideo.video_id,
      senderName: currentUser.nama || 'Tim Multimedia Gereja'
    });

    setIsVideoModalOpen(false);
    setVideoForm({
      judul: '',
      video_url: '',
      keterangan: '',
      platform: 'YouTube',
      kategori: 'Ibadah Raya',
      is_active: true
    });
  };

  const handleActivateSocialVideo = (id: string) => {
    const updated = featuredVideos.map((v) => ({
      ...v,
      is_active: v.video_id === id
    }));
    setFeaturedVideos(updated);
    StorageManager.saveFeaturedVideos(updated);
    StorageManager.logActivity(currentUser.username, `Mengaktifkan tayangan video utama ID ${id}`, 'Galeri');

    const activated = updated.find((v) => v.video_id === id);
    if (activated) {
      broadcastContentNotification({
        category: 'Video',
        action: 'UPDATE',
        title: activated.judul,
        summary: `Tayangan video utama diperbarui: "${activated.judul}". Klik untuk menonton.`,
        targetView: 'galeri',
        targetId: id,
        senderName: currentUser.nama || 'Tim Multimedia Gereja'
      });
    }
  };

  const handleDeleteSocialVideo = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Hapus Video Media Sosial',
      message: 'Apakah anda yakin akan menghapus file ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;
    const updated = featuredVideos.filter((v) => v.video_id !== id);
    if (updated.length > 0 && !updated.some((v) => v.is_active)) {
      updated[0].is_active = true;
    }
    setFeaturedVideos(updated);
    StorageManager.saveFeaturedVideos(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus video media sosial ID ${id}`, 'Galeri');
  };

  const handleDeleteMedia = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirmDialog({
      title: 'Hapus File Media Galeri',
      message: 'Apakah anda yakin akan menghapus file ini?',
      confirmText: 'Ya, Hapus File',
      cancelText: 'Batal',
      isDanger: true,
    });
    if (!ok) return;

    const updated = galleryList.filter((g) => g.gallery_id !== id);
    setGalleryList(updated);
    StorageManager.saveGallery(updated);
    StorageManager.logActivity(currentUser.username, `Menghapus media galeri ID ${id}`, 'Galeri');
  };

  const categories = ['SEMUA', 'Ibadah', 'Youth & Pemuda', 'Event & Paskah', 'Diakonia', 'Konser Musik', 'Lainnya'];

  const filteredItems = galleryList.filter((item) => {
    const itemType = item.tipe || (item.video_url ? 'Video' : 'Foto');
    const matchesType = activeType === 'ALL' || itemType === activeType;
    const matchesCat = selectedCategory === 'SEMUA' || item.kategori === selectedCategory;
    return matchesType && matchesCat;
  });

  // Filtered list strictly for photos (for lightbox navigation)
  const photosOnly = filteredItems.filter((item) => item.tipe !== 'Video' && !item.video_url);

  const currentPhotoIndex = selectedPhoto
    ? photosOnly.findIndex((p) => p.gallery_id === selectedPhoto.gallery_id)
    : -1;

  const handlePrevPhoto = () => {
    if (photosOnly.length <= 1 || currentPhotoIndex === -1) return;
    const prevIdx = (currentPhotoIndex - 1 + photosOnly.length) % photosOnly.length;
    setSelectedPhoto(photosOnly[prevIdx]);
    setZoomLevel(1);
  };

  const handleNextPhoto = () => {
    if (photosOnly.length <= 1 || currentPhotoIndex === -1) return;
    const nextIdx = (currentPhotoIndex + 1) % photosOnly.length;
    setSelectedPhoto(photosOnly[nextIdx]);
    setZoomLevel(1);
  };

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentPhotoIndex, photosOnly]);

  const handleDownload = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDownloading(item.gallery_id);
    try {
      await downloadPhotoFile(item.foto, item.judul, item.tanggal);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setIsDownloading(null), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Galeri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-teal-600" />
            <span>Galeri &amp; Video Media Sosial</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dokumentasi peribadatan dan kegiatan jemaat. Jemaat dapat melihat layar penuh (*full screen*) dan mengunduh foto berkualitas tinggi.
          </p>
        </div>

        {/* Tab Selector & Add Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowStorageGuide(!showStorageGuide)}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer shadow-2xs"
            title="Klik untuk melihat penjelasan database penyimpanan foto & kapasitas"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Info Database &amp; Kapasitas</span>
          </button>

          <div className="p-1 rounded-2xl bg-white border-2 border-teal-100 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setActiveTab('GALLERY')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'GALLERY' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Galeri Foto</span>
            </button>
            <button
              onClick={() => setActiveTab('SOCIAL_VIDEOS')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'SOCIAL_VIDEOS' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50/60'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Media Sosial ({featuredVideos.length})</span>
            </button>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              {activeTab === 'GALLERY' && (
                <button
                  onClick={() => {
                    setOfflineFileName('');
                    setIsAddModalOpen(true);
                    setTimeout(() => {
                      fileInputRef.current?.click();
                    }, 200);
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border-2 border-teal-200 cursor-pointer"
                  title="Pilih dan upload file gambar dari galeri HP atau disk komputer lokal"
                >
                  <HardDrive className="w-4 h-4 text-teal-600" />
                  <span>Unggah File Offline (Lokal)</span>
                </button>
              )}

              <button
                onClick={() => (activeTab === 'GALLERY' ? setIsAddModalOpen(true) : setIsVideoModalOpen(true))}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{activeTab === 'GALLERY' ? 'Tambah Form Media' : 'Tambah Video Media Sosial'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Storage Information Guide Modal / Banner */}
      {showStorageGuide && (
        <div className="p-5 rounded-3xl bg-white border-2 border-teal-200/90 text-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Informasi Database &amp; Penyimpanan Foto Galeri</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200">
                    Sistem Otomatis Aktif
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Penjelasan lokasi penyimpanan, kapasitas memori, dan teknologi optimasi foto.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStorageGuide(false)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold">
                <HardDrive className="w-4 h-4 text-teal-600" />
                <span>1. Dimana Foto Disimpan?</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Foto disimpan secara terpusat pada <strong>Database Aplikasi (LocalStorage &amp; Cloud Firebase Firestore)</strong>. Ketika terhubung ke internet, foto otomatis tersinkronisasi antar perangkat (HP jemaat, laptop sekretariat, dan layar display).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>2. Apakah Tidak Akan Penuh?</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>Aman &amp; Teroptimasi!</strong> Setiap foto yang diupload dari galeri HP / disk otomatis dikompresi menjadi format <strong>WebP/JPEG resolusi tinggi 1600px</strong> (~100–150 KB per foto dari aslinya 5–10 MB). Ini memungkinkan ratusan foto tersimpan tanpa memenuhi kuota browser.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold">
                <UploadCloud className="w-4 h-4 text-teal-600" />
                <span>3. Opsi Cloud (Tanpa Batas)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Untuk arsip ribuan foto, Admin dapat menggunakan <strong>URL Gambar Cloud</strong> (Google Drive, Cloudinary, atau web hosting). Tautan URL tidak menggunakan kuota memori aplikasi sama sekali.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-teal-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-teal-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Jemaat dapat mengunduh foto kapan saja dengan tombol Download HD di setiap foto.</span>
            </span>
            <button
              onClick={() => setShowStorageGuide(false)}
              className="text-teal-700 hover:text-teal-800 font-bold underline cursor-pointer"
            >
              Tutup Penjelasan
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: GALERI FOTO & DOKUMENTASI */}
      {activeTab === 'GALLERY' && (
        <>
          {/* Quick Notice Banner */}
          <div className="px-4 py-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Petunjuk:</strong> Klik pada foto untuk membuka <strong>Layar Penuh (Lightbox)</strong>, memperbesar (zoom), dan <strong>Mengunduh (Download)</strong> langsung ke perangkat Anda.
              </span>
            </div>
            <span className="text-[11px] text-teal-700 font-mono font-bold shrink-0">
              {photosOnly.length} Foto Siap Diunduh
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-teal-200/90 shadow-md">
            {/* Tipe Filter: Semua / Foto / Video */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-teal-100">
              <button
                onClick={() => setActiveType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeType === 'ALL' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25' : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                Semua Media ({galleryList.length})
              </button>
              <button
                onClick={() => setActiveType('Foto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeType === 'Foto' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25' : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Foto ({galleryList.filter((g) => g.tipe !== 'Video' && !g.video_url).length})</span>
              </button>
              <button
                onClick={() => setActiveType('Video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeType === 'Video' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25' : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Liputan</span>
              </button>
            </div>

            {/* Kategori Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <Filter className="w-4 h-4 text-teal-600 shrink-0 hidden sm:block" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Galeri Items */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border-2 border-teal-200/90 shadow-md space-y-3">
              <ImageIcon className="w-12 h-12 text-teal-400 mx-auto" />
              <p className="text-slate-600 text-sm font-semibold">Belum ada foto atau video dalam kategori ini.</p>
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/25"
                >
                  <Plus className="w-4 h-4" />
                  <span>Unggah Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const isVideo = item.tipe === 'Video' || !!item.video_url;

                return (
                  <div
                    key={item.gallery_id}
                    onClick={() => {
                      if (isVideo) setSelectedVideo(item);
                      else {
                        setSelectedPhoto(item);
                        setZoomLevel(1);
                      }
                    }}
                    className="group relative rounded-3xl bg-white border-2 border-teal-200/90 hover:border-teal-400 shadow-xl shadow-teal-950/5 hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                  >
                    {/* Media Image / Thumbnail Container */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.foto || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80'}
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Top Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md flex items-center gap-1 ${
                          isVideo ? 'bg-rose-600/90 border border-rose-500/50' : 'bg-teal-600/90 border border-teal-400/50'
                        }`}>
                          {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          <span>{isVideo ? 'VIDEO' : 'FOTO'}</span>
                        </span>

                        {item.kategori && (
                          <span className="px-2.5 py-1 rounded-xl bg-white/90 text-teal-900 border border-teal-200 text-[10px] font-bold backdrop-blur-md truncate max-w-[120px] shadow-xs">
                            {item.kategori}
                          </span>
                        )}
                      </div>

                      {/* Center Play Button for Videos */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="p-3.5 rounded-full bg-rose-600/90 text-white shadow-2xl group-hover:scale-110 transition-transform border border-white/20">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Hover Action Overlay for Photos */}
                      {!isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-15 pointer-events-none bg-teal-950/20">
                          <span className="pointer-events-auto px-3 py-1.5 rounded-xl bg-teal-600/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl backdrop-blur-md">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Lihat Penuh</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDownload(item, e)}
                            disabled={isDownloading === item.gallery_id}
                            className="pointer-events-auto px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
                            title="Unduh foto ini ke HP / Komputer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isDownloading === item.gallery_id ? 'Mengunduh...' : 'Unduh'}</span>
                          </button>
                        </div>
                      )}

                      {/* Delete Button for Admin */}
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteMedia(item.gallery_id, e)}
                          className="absolute bottom-3 right-3 p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Hapus Media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-white">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
                        {item.judul}
                      </h3>

                      {item.keterangan && (
                        <p className="text-xs text-slate-600 line-clamp-2 font-normal">
                          {item.keterangan}
                        </p>
                      )}

                      <div className="pt-2 border-t border-teal-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-teal-700 font-semibold">
                          <Calendar className="w-3 h-3 text-teal-600" />
                          {item.tanggal}
                        </span>

                        <div className="flex items-center gap-2">
                          {!isVideo && (
                            <button
                              type="button"
                              onClick={(e) => handleDownload(item, e)}
                              disabled={isDownloading === item.gallery_id}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                              title="Download Foto"
                            >
                              <Download className="w-3 h-3 text-teal-600" />
                              <span>{isDownloading === item.gallery_id ? '...' : 'Unduh'}</span>
                            </button>
                          )}
                          <span className="text-slate-400 truncate max-w-[85px]">
                            {item.penulis || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: VIDEO MEDIA SOSIAL DASHBOARD (YouTube / Reels / TikTok) */}
      {activeTab === 'SOCIAL_VIDEOS' && (
        <div className="space-y-6">
          <div className={`p-4 rounded-3xl ${
            isLightSystem ? 'bg-white border-2 border-teal-200 text-slate-800 shadow-sm' : 'bg-slate-900 border border-slate-800 text-slate-300'
          } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div>
              <h3 className={`font-bold ${isLightSystem ? 'text-slate-900' : 'text-white'} text-sm flex items-center gap-2`}>
                <Tv className={`w-4 h-4 ${isLightSystem ? 'text-rose-600' : 'text-rose-400'}`} />
                <span>Pengaturan Tayangan Video Media Sosial Dashboard</span>
              </h3>
              <p className={`text-xs ${isLightSystem ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                Pilih video media sosial mana yang ditampilkan secara otomatis di Dashboard Utama Admin &amp; Portal Jemaat.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Link Video Baru</span>
              </button>
            )}
          </div>

          {featuredVideos.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl ${
              isLightSystem ? 'bg-white border-2 border-teal-100 text-slate-600' : 'bg-slate-900/50 border border-slate-800'
            } space-y-3`}>
              <Video className={`w-12 h-12 ${isLightSystem ? 'text-teal-400' : 'text-slate-600'} mx-auto`} />
              <p className={`${isLightSystem ? 'text-slate-600' : 'text-slate-400'} text-sm font-semibold`}>Belum ada tautan video media sosial yang terdaftar.</p>
              {isAdmin && (
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Link Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredVideos.map((video) => {
                const parsed = parseSocialVideoUrl(video.video_url);

                return (
                  <div
                    key={video.video_id}
                    className={`p-5 rounded-3xl ${
                      isLightSystem
                        ? 'bg-white border-2 shadow-md text-slate-800'
                        : 'bg-slate-900/90 border text-white'
                    } transition-all ${
                      video.is_active
                        ? isLightSystem
                          ? 'border-teal-400 ring-2 ring-teal-200 shadow-lg'
                          : 'border-emerald-500/70 ring-1 ring-emerald-500/30 shadow-xl'
                        : isLightSystem
                        ? 'border-slate-200 hover:border-teal-300'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black text-white ${
                            video.platform === 'TikTok'
                              ? 'bg-black border border-slate-700'
                              : video.platform === 'Instagram'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                              : 'bg-rose-600'
                          }`}>
                            {video.platform || 'YouTube'}
                          </span>
                          <span className={`text-xs font-bold ${isLightSystem ? 'text-teal-700' : 'text-indigo-300'}`}>{video.kategori || 'Ibadah'}</span>
                          <span className={`text-[10px] ${isLightSystem ? 'text-slate-400' : 'text-slate-500'}`}>• {video.tanggal}</span>
                        </div>
                        <h4 className={`font-extrabold ${isLightSystem ? 'text-slate-900' : 'text-white'} text-base mt-1`}>{video.judul}</h4>
                      </div>

                      {video.is_active ? (
                        <span className={`px-3 py-1 rounded-full ${
                          isLightSystem ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        } text-[11px] font-extrabold flex items-center gap-1 shrink-0`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>TAYANG AKTIF</span>
                        </span>
                      ) : (
                        isAdmin && (
                          <button
                            onClick={() => handleActivateSocialVideo(video.video_id)}
                            className={`px-3 py-1 rounded-full ${
                              isLightSystem ? 'bg-slate-100 hover:bg-teal-600 text-slate-700 hover:text-white border border-slate-200' : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700'
                            } text-[11px] font-bold transition-all shrink-0 cursor-pointer`}
                          >
                            Set Tayang Utama
                          </button>
                        )
                      )}
                    </div>

                    {/* Embedded Video Player Preview */}
                    <div className={`aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 ${
                      isLightSystem ? 'border-2 border-teal-200/80 shadow-md ring-2 ring-teal-50' : 'border border-slate-800 shadow-inner'
                    } my-3`}>
                      {parsed.isValid ? (
                        parsed.type === 'mp4' ? (
                          <video src={parsed.embedUrl} controls className="w-full h-full object-cover" />
                        ) : (
                          <iframe
                            src={parsed.embedUrl}
                            title={video.judul}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center text-slate-500 text-xs">
                          Preview tidak tersedia untuk link ini.
                        </div>
                      )}
                    </div>

                    {video.keterangan && (
                      <p className={`text-xs ${isLightSystem ? 'text-slate-600' : 'text-slate-400'} mt-2 font-normal line-clamp-2`}>
                        {video.keterangan}
                      </p>
                    )}

                    <div className={`mt-3 pt-3 border-t ${isLightSystem ? 'border-slate-100' : 'border-slate-800/80'} flex items-center justify-between text-xs`}>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isLightSystem ? 'text-teal-700 hover:text-teal-800' : 'text-indigo-400 hover:text-indigo-300'} font-semibold inline-flex items-center gap-1 text-[11px]`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Link Asli Video</span>
                      </a>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteSocialVideo(video.video_id)}
                          className="text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL VIEW PHOTO DETAIL (CINEMA FULLSCREEN LIGHTBOX & DOWNLOAD) */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl transition-all duration-300 select-none overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Floating Control Bar */}
          <div className="relative z-20 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent border-b border-slate-800/60">
            {/* Left: Info badge & Counter */}
            <div className="flex items-center gap-2 md:gap-3 text-white">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-600/90 text-white text-[10px] sm:text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md border border-indigo-400/40">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>FOTO GEREJA</span>
              </span>
              {photosOnly.length > 0 && currentPhotoIndex !== -1 && (
                <span className="text-xs text-slate-300 font-mono bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
                  Foto {currentPhotoIndex + 1} dari {photosOnly.length}
                </span>
              )}
              {selectedPhoto.kategori && (
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold border border-slate-700">
                  {selectedPhoto.kategori}
                </span>
              )}
            </div>

            {/* Right: Zoom, Download, New Tab, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.25).toFixed(2))))}
                  disabled={zoomLevel <= 0.6}
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                  title="Perkecil (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-2 text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                  title="Perbesar (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg text-amber-400 cursor-pointer"
                    title="Reset Zoom Normal (100%)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={() => handleDownload(selectedPhoto)}
                disabled={isDownloading === selectedPhoto.gallery_id}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                title="Download / Simpan Foto ke Komputer / HP"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading === selectedPhoto.gallery_id ? 'Mengunduh...' : 'Unduh HD'}</span>
              </button>

              {/* Open Raw in New Tab if external URL */}
              {selectedPhoto.foto && !selectedPhoto.foto.startsWith('data:') && (
                <a
                  href={selectedPhoto.foto}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer hidden md:flex"
                  title="Buka File Gambar Asli di Tab Baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPhoto(null);
                  setZoomLevel(1);
                }}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-600/90 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                title="Tutup Layar Penuh (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage: Photo Display with Next & Prev Buttons */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {/* Prev Photo Arrow */}
            {photosOnly.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 sm:left-6 z-30 p-3 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white hover:text-indigo-300 border border-slate-700/60 backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                title="Foto Sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Photo Image with Zoom & Full Dimension Display */}
            <div className="relative max-w-full max-h-[70vh] sm:max-h-[76vh] flex items-center justify-center overflow-auto scrollbar-none">
              <img
                src={selectedPhoto.foto}
                alt={selectedPhoto.judul}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                }}
                className="max-h-[70vh] sm:max-h-[76vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl select-none"
              />
            </div>

            {/* Next Photo Arrow */}
            {photosOnly.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 sm:right-6 z-30 p-3 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white hover:text-indigo-300 border border-slate-700/60 backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                title="Foto Selanjutnya (Panah Kanan)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Floating Info & Action Bar */}
          <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/85 to-transparent border-t border-slate-800/60">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-white">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {selectedPhoto.judul}
                </h3>
                {selectedPhoto.keterangan && (
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl font-normal">
                    {selectedPhoto.keterangan}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedPhoto.tanggal}
                  </span>
                  <span>•</span>
                  <span>Diunggah: {selectedPhoto.penulis || 'Admin Gereja'}</span>
                  {selectedPhoto.kategori && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-300 font-semibold">{selectedPhoto.kategori}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Download CTA */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPhoto)}
                  disabled={isDownloading === selectedPhoto.gallery_id}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading === selectedPhoto.gallery_id ? 'Menyimpan ke Perangkat...' : 'Unduh Foto ke Perangkat'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIEW VIDEO DETAIL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-4xl w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-6">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {parseSocialVideoUrl(selectedVideo.video_url).isValid ? (
                <iframe
                  src={parseSocialVideoUrl(selectedVideo.video_url).embedUrl}
                  title={selectedVideo.judul}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <video src={selectedVideo.video_url} controls className="w-full h-full object-contain" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{selectedVideo.judul}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedVideo.keterangan}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD GALERI ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative max-w-lg w-full rounded-3xl bg-white border-2 border-teal-200/90 p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                <span>Unggah Media Galeri Baru</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumentasi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibadah Paskah Raya 2026"
                  value={mediaForm.judul}
                  onChange={(e) => setMediaForm({ ...mediaForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs font-semibold focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Media</label>
                  <select
                    value={mediaForm.tipe}
                    onChange={(e) => setMediaForm({ ...mediaForm, tipe: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="Foto">Foto</option>
                    <option value="Video">Video Liputan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Event</label>
                  <select
                    value={mediaForm.kategori}
                    onChange={(e) => setMediaForm({ ...mediaForm, kategori: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs focus:bg-white focus:border-teal-500 outline-none"
                  >
                    {categories.filter((c) => c !== 'SEMUA').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Offline File Upload Method / Local Storage */}
              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-teal-600" />
                    <span>Upload dari Penyimpanan Lokal / Disk Offline</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold">Offline &amp; Direct File</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleOfflineFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <FolderPlus className="w-4 h-4 text-teal-100" />
                    <span>Pilih Foto Lokal Disk / HP...</span>
                  </button>

                  {offlineFileName && (
                    <span className="text-[11px] text-teal-800 font-semibold truncate font-mono">
                      {offlineFileName}
                    </span>
                  )}
                </div>

                {/* Compression Info Badge */}
                {uploadCompressionInfo && mediaForm.foto && mediaForm.foto.startsWith('data:image/') && (
                  <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-teal-900 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        Kompresi Otomatis: Asli <strong>{uploadCompressionInfo.originalSizeKb} KB</strong> &rarr; Dioptimalkan <strong>{uploadCompressionInfo.sizeKb} KB</strong>
                      </span>
                    </div>
                    {uploadCompressionInfo.originalSizeKb > uploadCompressionInfo.sizeKb && (
                      <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
                        Hemat {Math.round((1 - uploadCompressionInfo.sizeKb / uploadCompressionInfo.originalSizeKb) * 100)}%
                      </span>
                    )}
                  </div>
                )}

                {/* Preview Thumbnail if local image loaded */}
                {mediaForm.foto && mediaForm.foto.startsWith('data:image/') && (
                  <div className="relative rounded-xl overflow-hidden border-2 border-teal-300 max-h-32 bg-slate-100 flex items-center justify-center">
                    <img src={mediaForm.foto} alt="Preview Offline" className="h-28 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirmDialog({
                          title: 'Hapus File Foto',
                          message: 'Apakah anda yakin akan menghapus file ini?',
                          confirmText: 'Ya, Hapus File',
                        });
                        if (ok) {
                          setMediaForm((prev) => ({ ...prev, foto: '' }));
                          setOfflineFileName('');
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow cursor-pointer transition-all"
                      title="Hapus file foto ini"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-teal-200/60">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Atau Masukkan URL Gambar Web / Unsplash (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={mediaForm.foto}
                    onChange={(e) => {
                      setMediaForm({ ...mediaForm, foto: e.target.value });
                      if (!e.target.value.startsWith('data:image/')) {
                        setOfflineFileName('');
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-teal-200 text-slate-800 text-xs font-mono focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {mediaForm.tipe === 'Video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Video Stream</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={mediaForm.video_url}
                    onChange={(e) => setMediaForm({ ...mediaForm, video_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs font-mono focus:bg-white focus:border-teal-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Mendukung link YouTube, Facebook, TikTok, Instagram, atau direct MP4 video.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={mediaForm.tanggal}
                    onChange={(e) => setMediaForm({ ...mediaForm, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs focus:bg-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Detail Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat momen peribadatan..."
                  value={mediaForm.keterangan}
                  onChange={(e) => setMediaForm({ ...mediaForm, keterangan: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  Simpan Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD SOCIAL MEDIA VIDEO */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative max-w-lg w-full rounded-3xl bg-white border-2 border-teal-200/90 p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Tv className="w-5 h-5 text-rose-600" />
                <span>Tambah Video Media Sosial (Dashboard &amp; Portal)</span>
              </h3>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSocialVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Video / Khotbah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tayangan Khotbah Minggu & Puji-pujian"
                  value={videoForm.judul}
                  onChange={(e) => setVideoForm({ ...videoForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs font-semibold focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link URL Video <span className="text-teal-700 font-semibold">(YouTube / Shorts / Instagram Reels / TikTok / MP4)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=5qap5aO4i9A atau https://youtube.com/shorts/..."
                  value={videoForm.video_url}
                  onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs font-mono focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori / Segmen</label>
                  <select
                    value={videoForm.kategori}
                    onChange={(e) => setVideoForm({ ...videoForm, kategori: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="Ibadah Raya">Ibadah Raya</option>
                    <option value="Youth & Pemuda">Youth &amp; Pemuda</option>
                    <option value="Renungan Harian">Renungan Harian</option>
                    <option value="Diakonia & Misi">Diakonia &amp; Misi</option>
                    <option value="Lagu Pujian">Lagu Pujian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Set Utama</label>
                  <label className="flex items-center gap-2 h-[38px] px-3 bg-teal-50/60 border border-teal-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={videoForm.is_active}
                      onChange={(e) => setVideoForm({ ...videoForm, is_active: e.target.checked })}
                      className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-teal-800">Tayang Aktif</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat khotbah atau rekaman video..."
                  value={videoForm.keterangan}
                  onChange={(e) => setVideoForm({ ...videoForm, keterangan: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-teal-200 text-slate-800 text-xs focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  Simpan Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
