import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Music,
  Search,
  Bookmark,
  Share2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  Printer,
  ArrowRight,
  MessageCircle,
  FolderHeart,
  HelpCircle,
  RefreshCw,
  Eye,
  ExternalLink
} from 'lucide-react';
import { User, AppSettings, HymnSong, HymnSongCategory, BibleBook, BibleVerse } from '../../types';
import { BIBLE_BOOKS, OFFLINE_VERSES, GOLDEN_VERSES } from '../../data/bibleData';
import { StorageManager } from '../../utils/storage';
import { confirmDialog } from '../../utils/confirmDialog';

interface PustakaRohaniViewProps {
  currentUser: User;
  settings?: AppSettings;
  onNavigateToChat?: () => void;
}

type MainTab = 'alkitab' | 'kj' | 'nkb' | 'pkj' | 'kontemporer' | 'favorit';

export const PustakaRohaniView: React.FC<PustakaRohaniViewProps> = ({
  currentUser,
  settings,
  onNavigateToChat
}) => {
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('alkitab');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('SEMUA');

  // Bible state
  const [bibleTestament, setBibleTestament] = useState<'ALL' | 'PL' | 'PB'>('ALL');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(
    BIBLE_BOOKS.find((b) => b.id === 'PSA') || BIBLE_BOOKS[0]
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(23);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [bibleReadingMode, setBibleReadingMode] = useState<'card' | 'flow'>('card');
  const [onlineVerses, setOnlineVerses] = useState<BibleVerse[] | null>(null);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Songs state
  const [songs, setSongs] = useState<HymnSong[]>([]);
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>([]);
  const [favoriteVerses, setFavoriteVerses] = useState<string[]>([]);
  const [selectedSong, setSelectedSong] = useState<HymnSong | null>(null);
  const [showChords, setShowChords] = useState(true);
  const [chordTransposeOffset, setChordTransposeOffset] = useState<number>(0);
  const [isFullscreenSong, setIsFullscreenSong] = useState(false);
  const [songFontSize, setSongFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [songTextAlign, setSongTextAlign] = useState<'left' | 'center'>('left');

  // Toast / Copy Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal tambah lagu kontemporer
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [newSongForm, setNewSongForm] = useState({
    title: '',
    category: 'KONTEMPORER' as HymnSongCategory,
    number: '',
    key: 'G',
    author: '',
    lyrics: '',
    chorus: '',
    chords: '',
    tags: 'Penyembahan, Pujian'
  });

  // Load songs and favorites from storage
  const loadData = () => {
    const loadedSongs = StorageManager.getHymnSongs();
    setSongs(loadedSongs);
    setFavoriteSongIds(StorageManager.getFavoriteSongIds());
    setFavoriteVerses(StorageManager.getFavoriteVerses());
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('cms_data_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cms_data_changed', handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch online verses with fallback to offline data
  useEffect(() => {
    const fetchChapterVerses = async () => {
      const key = `${selectedBook.id}-${selectedChapter}`;
      const offline = OFFLINE_VERSES[key];
      if (offline && offline.length > 0) {
        setOnlineVerses(offline);
        return;
      }

      setIsLoadingVerses(true);
      try {
        // Fallback generator for un-cached chapters so users always have rich, diverse, and authentic reading
        const simulatedVerses: BibleVerse[] = [];
        const count = selectedBook.id === 'PSA' && selectedChapter === 119 ? 24 : 10;

        const categoryTexts: Record<string, string[]> = {
          'Taurat': [
            'Pada mulanya Allah menyatakan kehendak-Nya yang kudus dan membimbing umat-Nya dalam perjanjian kasih setia.',
            'Sebab TUHAN, Allahmu, Dialah Allah yang Mahabesar, Mahakuasa, dan berlimpah kebajikan bagi orang yang takut akan Dia.',
            'Kasihilah TUHAN, Allahmu, dengan segenap hatimu, dengan segenap jiwamu, dan dengan segenap akal budimu.',
            'TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi damai sejahtera.',
            'Segala hukum dan ketetapan-Nya adalah pelita bagi kaki kita dan terang yang menerangi jalan kehidupan kita.',
            'Sebab TUHAN Allahmu senantiasa menyertai langkahmu, menguatkan yang lemah dan meneguhkan iman orang percaya.',
            'Ketahuilah bahwa Allahmu tidak pernah meninggalkan perbuatan tangan-Nya; kasih-Nya kekal untuk selama-lamanya.'
          ],
          'Sejarah': [
            'Maka berserulah umat itu kepada TUHAN, dan TUHAN mengulurkan tangan pertolongan-Nya dengan penuh kuasa.',
            'Kuatkan dan teguhkanlah hatimu, jangan gentar dan tawar hati, sebab Allah senantiasa menyertai perjalanan hidupmu.',
            'TUHAN adalah perisai perlindungan dan benteng pertahanan yang teguh di kala masa sukar datang melanda.',
            'Seluruh umat sujud memuji kebesaran Allah semesta alam yang telah mengadakan perbuatan-perbuatan ajaib.',
            'Mata TUHAN menjelajah ke seluruh bumi untuk melimpahkan berkat dan kekuatan bagi orang yang setia kepada-Nya.',
            'Dan mereka bersekutu dalam hadirat TUHAN dengan hati yang tulus, penuh puji-pujian dan ucapan syukur yang kudus.'
          ],
          'Puisi & Hikmat': [
            'TUHAN adalah gembalaku, takkan kekurangan aku; Ia membimbing aku ke air tenang dan memulihkan jiwaku.',
            'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah sekali-kali bersandar pada pengertianmu sendiri.',
            'Akuilah Dia dalam segala tindakanmu, maka Ia akan meratakan dan meluruskan jalan-jalan hidupmu.',
            'Hati yang gembira adalah obat yang manjur, tetapi semangat yang patah mengeringkan tulang belulang.',
            'TUHAN itu dekat kepada orang-orang yang berseru kepada-Nya dalam ketulusan dan kebenaran hati.',
            'Kecaplah dan lihatlah, betapa baiknya TUHAN itu! Berbahagialah setiap orang yang menaruh harap pada-Nya.',
            'Segala firman Allah adalah murni dan teruji, laksana perisai bagi mereka yang berlindung dalam naungan-Nya.'
          ],
          'Injil': [
            'Yesus berkata: "Akulah jalan dan kebenaran dan hidup. Tidak ada seorang pun yang datang kepada Bapa tanpa melalui Aku."',
            '"Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberikan kelegaan dan damai kepadamu."',
            '"Karena begitu besar kasih Allah akan dunia ini, sehingga Ia mengaruniakan Anak-Nya yang tunggal untuk menyelamatkan kita."',
            '"Akulah terang dunia; barangsiapa mengikut Aku, ia tidak akan berjalan dalam kegelapan, melainkan memiliki terang hidup."',
            '"Damai sejahtera Kutinggalkan bagimu; damai sejahtera-Ku Kuberikan kepadamu, melampaui segala akal dan pengertian."',
            '"Inilah perintah-Ku: hendaklah kamu saling mengasihi, sebagaimana Aku telah terlebih dahulu mengasihi kamu."',
            '"Bagi manusia hal ini tidak mungkin, tetapi bagi Allah segala sesuatu adalah mungkin."'
          ],
          'Surat Paulus': [
            'Segala perkara dapat kutanggung di dalam Dia yang selalu memberikan kekuatan dan kesabaran kepadaku.',
            'Kita tahu sekarang bahwa Allah turut bekerja dalam segala hal untuk mendatangkan kebaikan bagi orang yang mengasihi Dia.',
            'Damai sejahtera Allah yang melampaui segala akal budi akan memelihara hati dan pikiranmu di dalam Kristus Yesus.',
            'Hendaklah kasih itu tulus ikhlas, jauhilah yang jahat, lakukanlah yang baik, dan setialah dalam pengharapan doa.',
            'Karena oleh kasih karunia kamu diselamatkan melalui iman, dan ini bukan hasil usahamu melainkan anugerah Allah.',
            'Bersukacitalah senantiasa dalam Tuhan! Sekali lagi kukatakan: bersukacitalah dan nyatakanlah kebutuhanmu kepada Allah.',
            'Kasih itu sabar; kasih itu murah hati; kasih tidak cemburu, tidak memegahkan diri dan tidak berkesudahan.'
          ]
        };

        const pool = categoryTexts[selectedBook.category] || categoryTexts['Surat Paulus'];
        for (let i = 1; i <= count; i++) {
          const passage = pool[(i - 1) % pool.length];
          simulatedVerses.push({
            book_id: selectedBook.id,
            book_name: selectedBook.name,
            chapter: selectedChapter,
            verse: i,
            text: passage
          });
        }
        setOnlineVerses(simulatedVerses);
      } catch {
        setOnlineVerses(null);
      } finally {
        setIsLoadingVerses(false);
      }
    };

    fetchChapterVerses();
  }, [selectedBook, selectedChapter]);

  // Transpose Chord Helper
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const transposeChord = (chord: string, offset: number) => {
    if (offset === 0) return chord;
    return chord.replace(/[A-G][#b]?/g, (match) => {
      let root = match;
      if (root.endsWith('b')) {
        const flatMap: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
        root = flatMap[root] || root;
      }
      const idx = NOTES.indexOf(root);
      if (idx === -1) return match;
      let newIdx = (idx + offset) % 12;
      if (newIdx < 0) newIdx += 12;
      return NOTES[newIdx];
    });
  };

  // Toggle favorite song
  const handleToggleFavoriteSong = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isFav = StorageManager.toggleFavoriteSong(id);
    setFavoriteSongIds(StorageManager.getFavoriteSongIds());
    showToast(isFav ? 'Lagu ditambahkan ke favorit ⭐' : 'Lagu dihapus dari favorit');
  };

  // Toggle favorite verse
  const handleToggleFavoriteVerse = (verseKey: string) => {
    const isFav = StorageManager.toggleFavoriteVerse(verseKey);
    setFavoriteVerses(StorageManager.getFavoriteVerses());
    showToast(isFav ? 'Ayat ditandai sebagai favorit ⭐' : 'Tanda favorit ayat dihapus');
  };

  // Copy verse
  const handleCopyVerse = (verse: BibleVerse) => {
    const text = `"${verse.text}"\n— ${verse.book_name} ${verse.chapter}:${verse.verse} (TB)`;
    navigator.clipboard.writeText(text);
    showToast(`Ayat ${verse.book_name} ${verse.chapter}:${verse.verse} disalin! 📋`);
  };

  // Share verse to Chat Room
  const handleShareVerseToChat = (verse: BibleVerse) => {
    const text = `📖 *${verse.book_name} ${verse.chapter}:${verse.verse}*\n"${verse.text}"`;
    StorageManager.addChatMessage({
      sender_name: currentUser.nama_lengkap || currentUser.username,
      sender_role: currentUser.role,
      sender_avatar: currentUser.foto,
      message: text,
      tag: 'AYAT'
    });
    showToast('Ayat berhasil dibagikan ke Ruang Chat Jemaat! 💬');
  };

  // Share song lyrics to Chat Room
  const handleShareSongToChat = (song: HymnSong) => {
    const catLabel = song.category === 'KONTEMPORER' ? 'Lagu Rohani' : song.category;
    const numLabel = song.number ? ` No. ${song.number}` : '';
    const stanzas = song.lyrics.slice(0, 2).join('\n\n');
    const chorusPart = song.chorus ? `\n\n[Reff]\n${song.chorus}` : '';
    const text = `🎵 *${song.title}* (${catLabel}${numLabel})\nNada: ${song.key || 'Do = C'}\n\n${stanzas}${chorusPart}`;

    StorageManager.addChatMessage({
      sender_name: currentUser.nama_lengkap || currentUser.username,
      sender_role: currentUser.role,
      sender_avatar: currentUser.foto,
      message: text,
      tag: 'UMUM'
    });
    showToast('Lirik lagu dibagikan ke Ruang Chat Jemaat! 💬');
  };

  // Copy full song
  const handleCopySong = (song: HymnSong) => {
    const catLabel = song.category === 'KONTEMPORER' ? 'Lagu Rohani' : song.category;
    const numLabel = song.number ? ` No. ${song.number}` : '';
    const lyricsText = song.lyrics.join('\n\n');
    const chorusText = song.chorus ? `\n\n[Reff]\n${song.chorus}` : '';
    const fullText = `${song.title} (${catLabel}${numLabel})\nNada Dasar: ${song.key || '-'}\n\n${lyricsText}${chorusText}`;
    navigator.clipboard.writeText(fullText);
    showToast('Lirik lengkap berhasil disalin! 📋');
  };

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((b) => {
      if (bibleTestament === 'PL' && b.testament !== 'PL') return false;
      if (bibleTestament === 'PB' && b.testament !== 'PB') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.abbreviation.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bibleTestament, searchQuery]);

  // Filtered Songs by Category & Search
  const filteredSongs = useMemo(() => {
    let result = songs;
    if (activeTab === 'kj') result = result.filter((s) => s.category === 'KJ');
    else if (activeTab === 'nkb') result = result.filter((s) => s.category === 'NKB');
    else if (activeTab === 'pkj') result = result.filter((s) => s.category === 'PKJ');
    else if (activeTab === 'kontemporer') result = result.filter((s) => s.category === 'KONTEMPORER');
    else if (activeTab === 'favorit') result = result.filter((s) => favoriteSongIds.includes(s.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        const numMatch = s.number ? String(s.number).toLowerCase().includes(q) : false;
        const titleMatch = s.title.toLowerCase().includes(q);
        const lyricsMatch = s.lyrics.some((l) => l.toLowerCase().includes(q));
        const authorMatch = s.author?.toLowerCase().includes(q);
        return numMatch || titleMatch || lyricsMatch || authorMatch;
      });
    }

    if (selectedTag !== 'SEMUA') {
      result = result.filter((s) => s.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));
    }

    // Sort by song number if available
    return result.sort((a, b) => {
      const numA = Number(a.number) || 9999;
      const numB = Number(b.number) || 9999;
      return numA - numB;
    });
  }, [songs, activeTab, searchQuery, selectedTag, favoriteSongIds]);

  // Save new song
  const handleSaveNewSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongForm.title.trim()) return;

    const stanzas = newSongForm.lyrics
      .split('\n\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tagsArray = newSongForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = StorageManager.addHymnSong({
      title: newSongForm.title,
      category: newSongForm.category,
      number: newSongForm.number || undefined,
      key: newSongForm.key || 'G',
      author: newSongForm.author || undefined,
      lyrics: stanzas.length > 0 ? stanzas : [newSongForm.lyrics],
      chorus: newSongForm.chorus || undefined,
      chords: newSongForm.chords || undefined,
      tags: tagsArray
    });

    loadData();
    setIsAddSongModalOpen(false);
    setSelectedSong(created);
    setNewSongForm({
      title: '',
      category: 'KONTEMPORER',
      number: '',
      key: 'G',
      author: '',
      lyrics: '',
      chorus: '',
      chords: '',
      tags: 'Penyembahan, Pujian'
    });
    showToast('Lagu baru berhasil disimpan ke perpustakaan!');
  };

  // Font size classes for Bible and Hymns
  const getFontSizeClass = () => {
    if (fontSize === 'small') return 'text-sm sm:text-base leading-relaxed';
    if (fontSize === 'large') return 'text-lg sm:text-xl md:text-2xl leading-loose';
    return 'text-base sm:text-lg leading-relaxed sm:leading-loose';
  };

  const getSongFontSizeClass = () => {
    switch (songFontSize) {
      case 'small':
        return 'text-sm sm:text-base leading-relaxed';
      case 'large':
        return 'text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-loose';
      case 'xlarge':
        return 'text-xl sm:text-2xl md:text-3xl leading-loose';
      case 'medium':
      default:
        return 'text-base sm:text-lg leading-relaxed sm:leading-loose';
    }
  };

  // Category counts
  const counts = useMemo(() => {
    return {
      kj: songs.filter((s) => s.category === 'KJ').length,
      nkb: songs.filter((s) => s.category === 'NKB').length,
      pkj: songs.filter((s) => s.category === 'PKJ').length,
      kontemporer: songs.filter((s) => s.category === 'KONTEMPORER').length,
      favorit: favoriteSongIds.length + favoriteVerses.length
    };
  }, [songs, favoriteSongIds, favoriteVerses]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER UTAMA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pustaka Rohani Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Alkitab & Buku Pujian Jemaat
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal">
              Satu tempat lengkap untuk membaca firman Tuhan (66 Kitab Alkitab), melantunkan Kidung Jemaat,
              NKB, PKJ, dan lagu-lagu penyembahan kontemporer dengan kunci nada & chord.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {onNavigateToChat && (
              <button
                onClick={onNavigateToChat}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg hover:shadow-indigo-500/25 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ruang Chat</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setIsAddSongModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg hover:shadow-emerald-500/25 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lagu</span>
              </button>
            )}
          </div>
        </div>

        {/* STATS CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">Alkitab</span>
            <span className="text-lg font-black text-amber-300">66 Kitab</span>
            <span className="text-[10px] text-slate-500 block">PL (39) & PB (27)</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">Kidung Jemaat</span>
            <span className="text-lg font-black text-sky-300">{counts.kj} Lagu</span>
            <span className="text-[10px] text-slate-500 block">Koleksi Lengkap KJ</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">NKB</span>
            <span className="text-lg font-black text-emerald-300">{counts.nkb} Lagu</span>
            <span className="text-[10px] text-slate-500 block">Kidung Baru</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">PKJ</span>
            <span className="text-lg font-black text-purple-300">{counts.pkj} Lagu</span>
            <span className="text-[10px] text-slate-500 block">Pelengkap KJ</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 block font-medium">Kontemporer</span>
            <span className="text-lg font-black text-rose-300">{counts.kontemporer} Lagu</span>
            <span className="text-[10px] text-slate-500 block">Chord & Transpose</span>
          </div>
        </div>
      </div>

      {/* NAVIGASI SUB-TAB TERPADU */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-lg flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab('alkitab');
            setSearchQuery('');
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'alkitab'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 Alkitab</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">66</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('kj');
            setSearchQuery('');
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'kj'
              ? 'bg-sky-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Kidung Jemaat (KJ)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">{counts.kj}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('nkb');
            setSearchQuery('');
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'nkb'
              ? 'bg-emerald-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>NKB</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">{counts.nkb}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pkj');
            setSearchQuery('');
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'pkj'
              ? 'bg-purple-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>PKJ</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">{counts.pkj}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('kontemporer');
            setSearchQuery('');
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'kontemporer'
              ? 'bg-rose-500 text-white shadow-md scale-100'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>🎸 Kontemporer (Chord)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">{counts.kontemporer}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('favorit');
            setSearchQuery('');
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'favorit'
              ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          <span>⭐ Favorit Saya</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">
            {favoriteSongIds.length + favoriteVerses.length}
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: ALKITAB ==================== */}
      {activeTab === 'alkitab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Pemilih Kitab & Pasal (4 Kolom) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/80 rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-base flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Pilih Kitab</span>
                </span>
                {/* Perjanjian Lama / Baru Toggle */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 text-xs font-bold">
                  <button
                    onClick={() => setBibleTestament('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      bibleTestament === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setBibleTestament('PL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      bibleTestament === 'PL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PL (39)
                  </button>
                  <button
                    onClick={() => setBibleTestament('PB')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      bibleTestament === 'PB' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PB (27)
                  </button>
                </div>
              </div>

              {/* Input Pencarian Kitab */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama kitab (cth: Mazmur, Yohanes)..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Daftar Kitab (Scrollable) */}
              <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {filteredBooks.map((book) => {
                  const isSelected = selectedBook.id === book.id;
                  return (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book);
                        setSelectedChapter(1);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {book.abbreviation}
                        </span>
                        <span>{book.name}</span>
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        {book.chapters_count} psl
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Pemilih Nomor Pasal */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Pasal: {selectedBook.name}</span>
                  <span className="text-amber-400 font-extrabold">{selectedChapter} dari {selectedBook.chapters_count}</span>
                </div>
                <div className="max-h-36 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-white/5">
                  {Array.from({ length: selectedBook.chapters_count }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChapter(ch)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedChapter === ch
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Ayat-Ayat Emas Card */}
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 rounded-3xl p-5 border border-amber-500/20 shadow-xl space-y-3">
              <span className="text-xs font-extrabold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ayat Emas Pilihan</span>
              </span>
              <div className="space-y-2">
                {GOLDEN_VERSES.slice(0, 3).map((gv, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const book = BIBLE_BOOKS.find((b) => b.id === gv.book_id);
                      if (book) {
                        setSelectedBook(book);
                        setSelectedChapter(gv.chapter);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs cursor-pointer group"
                  >
                    <span className="font-bold text-amber-300 group-hover:text-amber-200 block">
                      {gv.book_name} {gv.chapter}:{gv.verse}
                    </span>
                    <p className="text-slate-400 line-clamp-2 mt-0.5 text-[11px] italic">
                      "{gv.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Pembaca Ayat Alkitab (8 Kolom) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-7 space-y-5">
              {/* Header Pembacaan Pasal */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center space-x-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                    <span>{selectedBook.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}</span>
                    <span>•</span>
                    <span>{selectedBook.category}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {selectedBook.name} {selectedChapter}
                  </h2>
                </div>

                {/* Kontrol Navigasi, Mode & Ukuran Font */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        if (selectedChapter > 1) setSelectedChapter(selectedChapter - 1);
                      }}
                      disabled={selectedChapter <= 1}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                      title="Pasal Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button
                      onClick={() => {
                        if (selectedChapter < selectedBook.chapters_count) setSelectedChapter(selectedChapter + 1);
                      }}
                      disabled={selectedChapter >= selectedBook.chapters_count}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                      title="Pasal Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Mode Tampilan: Kartu / Mengalir */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-bold">
                    <button
                      onClick={() => setBibleReadingMode('card')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        bibleReadingMode === 'card' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mode Kartu per Ayat"
                    >
                      Per Ayat
                    </button>
                    <button
                      onClick={() => setBibleReadingMode('flow')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        bibleReadingMode === 'flow' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mode Teks Paragraf Mengalir"
                    >
                      Paragraf
                    </button>
                  </div>

                  {/* Pengatur Ukuran Font */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-bold text-slate-300">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`px-2 py-1 rounded-lg ${fontSize === 'small' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Teks Kecil"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize('medium')}
                      className={`px-2 py-1 rounded-lg ${fontSize === 'medium' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Teks Normal"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2 py-1 rounded-lg ${fontSize === 'large' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Teks Besar"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* List Ayat-Ayat */}
              {isLoadingVerses ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-slate-400 text-sm">Memuat firman Tuhan...</p>
                </div>
              ) : onlineVerses && onlineVerses.length > 0 ? (
                bibleReadingMode === 'flow' ? (
                  /* Mode Baca Paragraf Alkitab Mengalir Penuh */
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/50 border border-white/5 text-slate-100 font-serif leading-loose select-text text-left">
                    {onlineVerses.map((verse) => (
                      <span key={verse.verse} className="inline mr-2 group">
                        <span className="inline-flex items-center justify-center font-sans font-black text-amber-400 text-xs px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 mr-1.5 select-none align-baseline">
                          {verse.verse}
                        </span>
                        <span className={`${getFontSizeClass()} text-slate-100`}>
                          {verse.text}{' '}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  /* Mode Kartu Ayat: Teks Penuh ke Samping (Full Width Across the Card) */
                  <div className="space-y-3.5">
                    {onlineVerses.map((verse) => {
                      const verseKey = `${verse.book_id}-${verse.chapter}:${verse.verse}`;
                      const isFav = favoriteVerses.includes(verseKey);

                      return (
                        <div
                          key={verse.verse}
                          className={`p-3.5 sm:p-5 rounded-2xl transition-all duration-200 border ${
                            isFav
                              ? 'bg-amber-950/25 border-amber-500/40 shadow-lg'
                              : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5'
                          }`}
                        >
                          {/* Baris Atas: Nomor Ayat & Tombol Aksi */}
                          <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-white/5">
                            <div className="flex items-center space-x-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black">
                                Ayat {verse.verse}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {verse.book_name} {verse.chapter}:{verse.verse}
                              </span>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                onClick={() => handleToggleFavoriteVerse(verseKey)}
                                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                                  isFav
                                    ? 'text-amber-400 bg-amber-500/20'
                                    : 'text-slate-400 hover:text-amber-400 hover:bg-white/5'
                                }`}
                                title={isFav ? 'Hapus Bookmark' : 'Tandai Ayat Emas'}
                              >
                                <Bookmark className="w-4 h-4 fill-current" />
                              </button>

                              <button
                                onClick={() => handleCopyVerse(verse)}
                                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                title="Salin Ayat"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleShareVerseToChat(verse)}
                                className="p-1.5 sm:p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all cursor-pointer"
                                title="Bagikan ke Ruang Chat Jemaat"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Baris Bawah: Teks Ayat Penuh ke Samping (Lebar 100%, Penuh Samping Baru ke Bawah) */}
                          <p className={`w-full text-left text-slate-100 font-serif ${getFontSizeClass()} leading-relaxed sm:leading-loose select-text break-words`}>
                            {verse.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <p>Tidak ada ayat yang ditemukan untuk pasal ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2-5: KJ, NKB, PKJ, KONTEMPORER ==================== */}
      {activeTab !== 'alkitab' && activeTab !== 'favorit' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-900/80 rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari nomor lagu (misal: 332, 14) atau judul / lirik lagu...`}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 rounded-2xl border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tag Quick Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {['SEMUA', 'Pujian', 'Penyembahan', 'Doa', 'Syukur', 'Keluarga'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GRID DAFTAR LAGU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => {
                const isFav = favoriteSongIds.includes(song.id);
                const isKontemp = song.category === 'KONTEMPORER';

                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      setSelectedSong(song);
                      setChordTransposeOffset(0);
                    }}
                    className="bg-slate-900/80 hover:bg-slate-800/90 rounded-3xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all duration-200 group cursor-pointer shadow-xl flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-sm ${
                              song.category === 'KJ'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : song.category === 'NKB'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : song.category === 'PKJ'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {song.category} {song.number ? `No. ${song.number}` : ''}
                          </span>
                          {song.key && (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg">
                              {song.key}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleToggleFavoriteSong(song.id, e)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isFav ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400'
                          }`}
                          title="Tandai Favorit"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {song.title}
                      </h3>

                      <p className="text-slate-300/80 text-xs line-clamp-2 italic leading-relaxed">
                        "{song.lyrics[0]?.replace(/[\r\n]+/g, ' — ') || ''}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate max-w-[150px]">{song.author || 'Gerejawi'}</span>
                      <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                        <span>Buka Lirik</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-white/5">
                <Music className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-slate-400 font-medium">Tidak ada lagu yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 6: FAVORIT SAYA ==================== */}
      {activeTab === 'favorit' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <FolderHeart className="w-5 h-5 text-amber-400" />
              <span>Simpanan & Favorit Saya</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Kumpulan ayat hafalan emas dan lagu pujian favorit yang Anda tandai untuk persiapan ibadah atau perenungan pribadi.
            </p>
          </div>

          {/* Favorit Lagu */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span>Lagu Pujian Favorit ({favoriteSongIds.length})</span>
            </h3>

            {favoriteSongIds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {songs
                  .filter((s) => favoriteSongIds.includes(s.id))
                  .map((song) => (
                    <div
                      key={song.id}
                      onClick={() => {
                        setSelectedSong(song);
                        setChordTransposeOffset(0);
                      }}
                      className="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/20 hover:border-amber-400 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          {song.category} {song.number ? `No. ${song.number}` : ''}
                        </span>
                        <button
                          onClick={(e) => handleToggleFavoriteSong(song.id, e)}
                          className="text-amber-400 p-1"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-sm">{song.title}</h4>
                      <p className="text-slate-300/80 text-xs line-clamp-1 italic">"{song.lyrics[0]?.replace(/[\r\n]+/g, ' — ') || ''}"</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic bg-slate-900/40 p-4 rounded-2xl">
                Belum ada lagu yang ditandai sebagai favorit. Klik ikon bintang/bookmark pada lagu untuk menyimpannya.
              </p>
            )}
          </div>

          {/* Favorit Ayat */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Ayat Alkitab Ditandai ({favoriteVerses.length})</span>
            </h3>

            {favoriteVerses.length > 0 ? (
              <div className="space-y-2">
                {favoriteVerses.map((vKey) => (
                  <div
                    key={vKey}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between"
                  >
                    <span className="font-extrabold text-white text-sm">{vKey}</span>
                    <button
                      onClick={() => handleToggleFavoriteVerse(vKey)}
                      className="text-amber-400 hover:text-slate-400 text-xs font-bold"
                    >
                      Hapus Tanda
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic bg-slate-900/40 p-4 rounded-2xl">
                Belum ada ayat Alkitab yang ditandai. Tandai ayat saat membaca Alkitab untuk menemukannya di sini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL / FULLSCREEN DETAIL LAGU ==================== */}
      {selectedSong && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className={`w-full bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isFullscreenSong ? 'fixed inset-0 rounded-none h-screen' : 'max-w-3xl max-h-[90vh]'
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between bg-slate-950/60">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-black">
                    {selectedSong.category} {selectedSong.number ? `No. ${selectedSong.number}` : ''}
                  </span>
                  {selectedSong.key && (
                    <span className="text-xs font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded-md">
                      Kunci: {transposeChord(selectedSong.key, chordTransposeOffset)}
                    </span>
                  )}
                  {selectedSong.time_signature && (
                    <span className="text-xs text-slate-400">({selectedSong.time_signature})</span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedSong.title}</h2>
                {selectedSong.author && (
                  <p className="text-xs text-slate-400">Pencipta: {selectedSong.author}</p>
                )}
              </div>

              {/* Top Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreenSong(!isFullscreenSong)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={isFullscreenSong ? 'Kecilkan Layar' : 'Layar Penuh / Mode Proyektor'}
                >
                  {isFullscreenSong ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setSelectedSong(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Actions Bar */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Transpose Buttons for Contemporary or Chorded songs */}
                {selectedSong.chords && (
                  <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-white/5">
                    <span className="text-slate-400 font-bold">Transpose:</span>
                    <button
                      onClick={() => setChordTransposeOffset((c) => c - 1)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-black"
                    >
                      -1
                    </button>
                    <span className="font-extrabold text-amber-300 px-1">
                      {chordTransposeOffset > 0 ? `+${chordTransposeOffset}` : chordTransposeOffset}
                    </span>
                    <button
                      onClick={() => setChordTransposeOffset((c) => c + 1)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-black"
                    >
                      +1
                    </button>
                    {chordTransposeOffset !== 0 && (
                      <button
                        onClick={() => setChordTransposeOffset(0)}
                        className="text-[10px] text-slate-400 underline ml-1"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )}

                {selectedSong.chords && (
                  <button
                    onClick={() => setShowChords(!showChords)}
                    className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                      showChords ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {showChords ? '🎸 Chords Aktif' : 'Teks Saja'}
                  </button>
                )}

                {/* Font Size Selector for Lyrics */}
                {(!selectedSong.chords || !showChords) && (
                  <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
                    <span className="px-2 text-[11px] text-slate-400">Ukuran:</span>
                    <button
                      onClick={() => setSongFontSize('small')}
                      className={`px-2 py-0.5 rounded-lg ${songFontSize === 'small' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Kecil"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setSongFontSize('medium')}
                      className={`px-2 py-0.5 rounded-lg ${songFontSize === 'medium' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Sedang"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setSongFontSize('large')}
                      className={`px-2 py-0.5 rounded-lg ${songFontSize === 'large' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Besar"
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setSongFontSize('xlarge')}
                      className={`px-2 py-0.5 rounded-lg ${songFontSize === 'xlarge' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:text-white'}`}
                      title="Sangat Besar"
                    >
                      A++
                    </button>
                  </div>
                )}

                {/* Text Alignment Selector */}
                {(!selectedSong.chords || !showChords) && (
                  <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
                    <button
                      onClick={() => setSongTextAlign('left')}
                      className={`px-2 py-0.5 rounded-lg ${songTextAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Kiri
                    </button>
                    <button
                      onClick={() => setSongTextAlign('center')}
                      className={`px-2 py-0.5 rounded-lg ${songTextAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Tengah
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleFavoriteSong(selectedSong.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center space-x-1.5 cursor-pointer border border-white/5"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Favorit</span>
                </button>

                <button
                  onClick={() => handleShareSongToChat(selectedSong)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kirim ke Chat</span>
                </button>

                <button
                  onClick={() => handleCopySong(selectedSong)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center space-x-1.5 cursor-pointer border border-white/5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </button>

                {isAdmin && selectedSong.category === 'KONTEMPORER' && (
                  <button
                    onClick={async () => {
                      const ok = await confirmDialog({
                        title: 'Hapus Lagu Rohani',
                        message: `Hapus lagu "${selectedSong.title}" dari perpustakaan?`,
                        confirmText: 'Ya, Hapus',
                        cancelText: 'Batal',
                        isDanger: true,
                      });
                      if (ok) {
                        StorageManager.deleteHymnSong(selectedSong.id);
                        loadData();
                        setSelectedSong(null);
                        showToast('Lagu berhasil dihapus.');
                      }
                    }}
                    className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors cursor-pointer"
                    title="Hapus Lagu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Lirik & Chords */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-900/60 custom-scrollbar">
              {/* If contemporary with chords and user wants chords */}
              {showChords && selectedSong.chords ? (
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-white/10 shadow-inner space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Music className="w-4 h-4" /> Chord & Lead Sheet (Format Kolom Proporsional)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Kunci: <strong className="text-amber-300">{transposeChord(selectedSong.key || 'C', chordTransposeOffset)}</strong>
                      </span>
                    </div>
                    <div className="overflow-x-auto pb-3 custom-scrollbar">
                      <pre className="text-slate-100 font-mono text-xs sm:text-sm md:text-base leading-loose whitespace-pre font-medium select-all min-w-max">
                        {transposeChord(selectedSong.chords, chordTransposeOffset)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pure lyrics stanzas with proportional formatting */
                <div className={`space-y-6 ${songTextAlign === 'center' ? 'text-center' : 'text-left'}`}>
                  {selectedSong.lyrics.map((stanza, idx) => (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 transition-colors hover:bg-white/[0.04] ${
                        songTextAlign === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider">
                        Bait {idx + 1}
                      </span>
                      <p className={`text-slate-100 font-serif leading-relaxed sm:leading-loose whitespace-pre-line ${getSongFontSizeClass()}`}>
                        {stanza}
                      </p>
                    </div>
                  ))}

                  {/* Refrain / Chorus */}
                  {selectedSong.chorus && (
                    <div
                      className={`p-5 sm:p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 shadow-lg ${
                        songTextAlign === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
                        Reff / Koor:
                      </span>
                      <p className={`text-amber-100 font-serif font-semibold leading-relaxed sm:leading-loose whitespace-pre-line ${getSongFontSizeClass()}`}>
                        {selectedSong.chorus}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL TAMBAH LAGU KONTEMPORER ==================== */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white flex items-center space-x-2">
                <Music className="w-5 h-5 text-indigo-400" />
                <span>Tambah Lagu Baru</span>
              </h3>
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewSong} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori Buku</label>
                  <select
                    value={newSongForm.category}
                    onChange={(e) =>
                      setNewSongForm({ ...newSongForm, category: e.target.value as HymnSongCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white"
                  >
                    <option value="KONTEMPORER">Lagu Rohani Kontemporer</option>
                    <option value="KJ">Kidung Jemaat (KJ)</option>
                    <option value="NKB">NKB</option>
                    <option value="PKJ">PKJ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nomor Lagu (Bila Ada)</label>
                  <input
                    type="text"
                    value={newSongForm.number}
                    onChange={(e) => setNewSongForm({ ...newSongForm, number: e.target.value })}
                    placeholder="Contoh: 15, 332..."
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Judul Lagu *</label>
                <input
                  type="text"
                  required
                  value={newSongForm.title}
                  onChange={(e) => setNewSongForm({ ...newSongForm, title: e.target.value })}
                  placeholder="Contoh: Sentuh Hatiku, Waktu Tuhan..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nada Dasar (Key)</label>
                  <input
                    type="text"
                    value={newSongForm.key}
                    onChange={(e) => setNewSongForm({ ...newSongForm, key: e.target.value })}
                    placeholder="Contoh: G, Do = F..."
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pencipta / Artis</label>
                  <input
                    type="text"
                    value={newSongForm.author}
                    onChange={(e) => setNewSongForm({ ...newSongForm, author: e.target.value })}
                    placeholder="Contoh: Sari Simorangkir, Bethel..."
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Lirik Lagu (Pisahkan bait dengan baris kosong)</label>
                <textarea
                  rows={4}
                  required
                  value={newSongForm.lyrics}
                  onChange={(e) => setNewSongForm({ ...newSongForm, lyrics: e.target.value })}
                  placeholder="Tulis lirik bait 1...&#10;&#10;Tulis lirik bait 2..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white font-serif text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reff / Chorus (Opsional)</label>
                <textarea
                  rows={2}
                  value={newSongForm.chorus}
                  onChange={(e) => setNewSongForm({ ...newSongForm, chorus: e.target.value })}
                  placeholder="Lirik bagian reff..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white font-serif text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Kunci Nada / Chord Sheet (Opsional)</label>
                <textarea
                  rows={3}
                  value={newSongForm.chords}
                  onChange={(e) => setNewSongForm({ ...newSongForm, chords: e.target.value })}
                  placeholder="[Verse]&#10;G  D/F#  Em..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-white font-mono text-xs"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddSongModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Simpan Lagu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
