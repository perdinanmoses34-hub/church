import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, AppSettings, ChatMessage, ChatTag, Jemaat } from '../../types';
import { initialJemaat, initialChatMessages } from '../../data/initialData';
import { StorageManager, normalizeTenantId } from '../../utils/storage';
import { playNotificationChime } from '../../utils/soundHelper';
import { confirmDialog, alertDialog } from '../../utils/confirmDialog';
import {
  MessageCircle,
  Send,
  Pin,
  Trash2,
  Reply,
  X,
  Volume2,
  VolumeX,
  Search,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  ArrowDown,
  AlertCircle,
  Edit2,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Tag,
  Lock,
  Users,
  User as UserIcon,
  ArrowLeft,
  Shield,
  Clock,
  Check,
  Building,
  Heart
} from 'lucide-react';

interface ChatViewProps {
  currentUser: User;
  settings?: AppSettings;
  onOpenLogin?: () => void;
}

interface ChatContact {
  id: string;
  name: string;
  username?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT' | 'TAMU';
  avatar?: string;
  wilayah?: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
}

const TAG_CONFIG: Record<
  ChatTag,
  {
    label: string;
    icon: string;
    dark: { bg: string; text: string; border: string };
    light: { bg: string; text: string; border: string };
  }
> = {
  UMUM: {
    label: 'Umum',
    icon: '💬',
    dark: { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' },
    light: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }
  },
  DOA: {
    label: 'Pokok Doa',
    icon: '🙏',
    dark: { bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-800/60' },
    light: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  },
  AYAT: {
    label: 'Ayat Alkitab',
    icon: '✝️',
    dark: { bg: 'bg-amber-950/70', text: 'text-amber-300', border: 'border-amber-800/60' },
    light: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' }
  },
  SALAM: {
    label: 'Salam & Sapaan',
    icon: '🕊️',
    dark: { bg: 'bg-teal-950/70', text: 'text-teal-300', border: 'border-teal-800/60' },
    light: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' }
  },
  INFO: {
    label: 'Warta / Info',
    icon: '📢',
    dark: { bg: 'bg-blue-950/70', text: 'text-blue-300', border: 'border-blue-800/60' },
    light: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  }
};

const QUICK_BLESSINGS = [
  '🙏 Amin',
  '🕊️ Syalom',
  '✝️ Puji Tuhan',
  '❤️ Haleluya',
  '🙌 Tuhan Berkati',
  '⛪ Salam Kasih'
];

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, settings, onOpenLogin }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const list = StorageManager.getChatMessages();
    if (list && list.length > 0) return list;
    return initialChatMessages;
  });
  const [chatMode, setChatMode] = useState<'COMMUNITY' | 'PRIVATE'>('COMMUNITY');
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactRoleFilter, setContactRoleFilter] = useState<'ALL' | 'JEMAAT' | 'ADMIN'>('ALL');

  const [inputMessage, setInputMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState<ChatTag>('UMUM');
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [filterTag, setFilterTag] = useState<'ALL' | ChatTag | 'PINNED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // User preference toggles for expandable / clean view
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [showQuickBlessings, setShowQuickBlessings] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPinnedBannerDismissed, setIsPinnedBannerDismissed] = useState(false);

  // Guest Nickname State for visitors who are not logged in
  const isGuest = currentUser.user_id === 'guest' || !currentUser.user_id;
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('cms_chat_guest_name') || 'Jemaat Tamu';
  });
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);
  const [tempGuestName, setTempGuestName] = useState(guestName);

  // Unique immutable identifier for the active user:
  // If registered user, use their actual user_id; if guest, use a dedicated persistent device ID
  const activeUserId = useMemo(() => {
    if (!isGuest && currentUser.user_id) {
      return currentUser.user_id;
    }
    return StorageManager.getOrCreateDeviceId();
  }, [isGuest, currentUser.user_id]);

  const activeUserName = isGuest ? guestName : currentUser.nama || currentUser.username;
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme & Color Mode Detection
  const isDark =
    settings?.theme_preset === 'DARK_SLATE' ||
    settings?.theme_preset === 'MIDNIGHT_BLUE' ||
    settings?.theme_preset === 'DEEP_PURPLE' ||
    settings?.theme_preset === 'FOREST_GREEN' ||
    settings?.theme_preset === 'WARM_GOLD';
  const isLight = !isDark;
  const themeHex = settings?.warna_tema?.trim() || '#0d9488';

  // Load and subscribe to storage & real-time changes
  useEffect(() => {
    const handleDataChange = () => {
      const latest = StorageManager.getChatMessages();
      setMessages((prev) => {
        if (latest.length !== prev.length || JSON.stringify(prev) !== JSON.stringify(latest)) {
          if (latest.length > prev.length && soundEnabled) {
            playNotificationChime();
          }
          return latest;
        }
        return prev;
      });
    };

    window.addEventListener('cms_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    const interval = setInterval(() => {
      const latest = StorageManager.getChatMessages();
      setMessages((prev) => {
        if (latest.length !== prev.length) {
          return latest;
        }
        return prev;
      });
    }, 4000);

    return () => {
      window.removeEventListener('cms_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
      clearInterval(interval);
    };
  }, [soundEnabled]);

  // Build Contact List ONLY from registered active users in Management User (StorageManager.getUsers())
  // STRICTLY EXCLUDES accounts from other churches (GBI ROCK Juanda, ingelin, GKII) and platform SuperAdmin
  const contactsList = useMemo<ChatContact[]>(() => {
    const users = StorageManager.getUsers();
    const contactsMap = new Map<string, ChatContact>();

    // ONLY add registered accounts from Management User
    users.forEach((u) => {
      if (!u) return;
      // Skip inactive accounts
      if (u.status === 'Nonaktif') return;

      // Skip current logged in user
      if (u.user_id === activeUserId || u.username === currentUser.username) return;

      // NEVER show platform SuperAdmin in local church private chat
      if (u.role === 'SUPER_ADMIN' || u.username?.toLowerCase() === 'superadmin' || u.tenant_id === 'ALL') {
        return;
      }

      const uName = (u.nama || '').toLowerCase();
      const uUser = (u.username || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      const uTenant = normalizeTenantId(u.tenant_id || '');

      // EXCLUSION OF OTHER CHURCHES:
      // A. Exclude GBI ROCK Juanda:
      if (
        uTenant === 'CHURCH-002' ||
        uUser === 'admin_gbi' ||
        uName.includes('gbi') ||
        uName.includes('rock') ||
        uName.includes('juanda') ||
        uUser.includes('gbi') ||
        uEmail.includes('gbigrace')
      ) {
        return;
      }

      // B. Exclude ingelin:
      if (
        uUser.includes('ingelin') ||
        uName.includes('ingelin') ||
        uEmail.includes('ingelin')
      ) {
        return;
      }

      // C. Exclude GKII:
      if (
        uTenant === 'CHURCH-003' ||
        uUser === 'admin_gkii' ||
        uName.includes('gkii') ||
        uName.includes('sejahtera') ||
        uEmail.includes('gkii-sejahtera')
      ) {
        return;
      }

      contactsMap.set(u.user_id, {
        id: u.user_id,
        name: u.nama || u.username,
        username: u.username,
        role: u.role,
        avatar: u.foto,
        wilayah: u.role === 'ADMIN' ? 'Pengurus / Admin Gereja' : 'Jemaat Terdaftar (Manajemen User)'
      });
    });

    const myId = activeUserId.toLowerCase();
    const myUsername = (currentUser.username || '').toLowerCase();

    // Calculate last private message & unread count strictly for activeUserId
    const result = Array.from(contactsMap.values()).map((contact) => {
      const cId = contact.id.toLowerCase();
      const cUser = (contact.username || '').toLowerCase();

      // Find all private messages exchanged between active user and this contact
      const relatedPrivate = messages.filter((m) => {
        if (!m.is_private) return false;
        const sId = (m.sender_id || '').toLowerCase();
        const rId = (m.recipient_id || '').toLowerCase();

        const isSenderMe = sId === myId || sId === myUsername;
        const isRecipientMe = rId === myId || rId === myUsername;
        const isSenderContact = sId === cId || sId === cUser;
        const isRecipientContact = rId === cId || rId === cUser;

        return (isSenderMe && isRecipientContact) || (isSenderContact && isRecipientMe);
      });

      const lastMsg = relatedPrivate[relatedPrivate.length - 1];

      // Unread: messages where contact is sender and active user is recipient
      const unreadCount = relatedPrivate.filter((m) => {
        const sId = (m.sender_id || '').toLowerCase();
        const rId = (m.recipient_id || '').toLowerCase();
        return (sId === cId || sId === cUser) && (rId === myId || rId === myUsername);
      }).length;

      return {
        ...contact,
        lastMessage: lastMsg?.message,
        lastTime: lastMsg?.created_at,
        unreadCount
      };
    });

    return result.sort((a, b) => {
      if (a.lastTime && b.lastTime) {
        return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
      }
      if (a.lastTime) return -1;
      if (b.lastTime) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [messages, activeUserId, currentUser]);

  // Total unread private messages strictly addressed to activeUserId
  const totalUnreadPrivateCount = useMemo(() => {
    const myId = activeUserId.toLowerCase();
    const myUsername = (currentUser.username || '').toLowerCase();
    return messages.filter((m) => {
      if (!m.is_private) return false;
      const rId = (m.recipient_id || '').toLowerCase();
      const sId = (m.sender_id || '').toLowerCase();
      const isRecipientMe = rId === myId || rId === myUsername;
      const isSenderMe = sId === myId || sId === myUsername;
      return isRecipientMe && !isSenderMe;
    }).length;
  }, [messages, activeUserId, currentUser.username]);

  // Filtered contacts based on search & role
  const filteredContacts = useMemo(() => {
    return contactsList.filter((c) => {
      if (contactRoleFilter === 'ADMIN' && c.role !== 'ADMIN' && c.role !== 'SUPER_ADMIN') {
        return false;
      }
      if (contactRoleFilter === 'JEMAAT' && (c.role === 'ADMIN' || c.role === 'SUPER_ADMIN')) {
        return false;
      }
      if (contactSearchQuery.trim()) {
        const q = contactSearchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.username && c.username.toLowerCase().includes(q)) ||
          (c.wilayah && c.wilayah.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contactsList, contactRoleFilter, contactSearchQuery]);

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [chatMode, selectedContact]);

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  // Save guest nickname
  const handleSaveGuestName = () => {
    const trimmed = tempGuestName.trim();
    if (trimmed) {
      setGuestName(trimmed);
      localStorage.setItem('cms_chat_guest_name', trimmed);
    }
    setIsEditingGuestName(false);
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    if (isGuest) {
      alertDialog({
        title: 'Akses Kirim Pesan',
        message: 'Silakan Masuk / Login dengan akun yang terdaftar pada Manajemen User untuk mengirim pesan.',
        type: 'warning'
      });
      if (onOpenLogin) onOpenLogin();
      return;
    }

    let senderRole: 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT' | 'TAMU' = 'JEMAAT';
    if (currentUser.role === 'SUPER_ADMIN') senderRole = 'SUPER_ADMIN';
    else if (currentUser.role === 'ADMIN') senderRole = 'ADMIN';

    const isPrivate = chatMode === 'PRIVATE' && !!selectedContact;

    if (isPrivate && selectedContact) {
      const convId = [activeUserId, selectedContact.id].sort().join('___');

      StorageManager.addChatMessage({
        sender_name: activeUserName,
        sender_id: activeUserId,
        sender_role: senderRole,
        message: trimmed,
        tag: selectedTag,
        is_private: true,
        conversation_id: convId,
        recipient_id: selectedContact.id,
        recipient_name: selectedContact.name,
        recipient_role: selectedContact.role
      });
    } else {
      StorageManager.addChatMessage({
        sender_name: activeUserName,
        sender_id: activeUserId,
        sender_role: senderRole,
        message: trimmed,
        tag: selectedTag,
        is_private: false,
        reply_to: replyTarget
          ? {
              id: replyTarget.id,
              sender_name: replyTarget.sender_name,
              message: replyTarget.message.slice(0, 100)
            }
          : undefined
      });
    }

    const latest = StorageManager.getChatMessages();
    setMessages(latest.length > 0 ? latest : StorageManager.getChatMessages());
    setInputMessage('');
    setReplyTarget(null);
    setSelectedTag('UMUM');

    if (soundEnabled) {
      playNotificationChime();
    }

    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleStartPrivateChat = (contact: ChatContact) => {
    setSelectedContact(contact);
    setChatMode('PRIVATE');
    setReplyTarget(null);
  };

  const handleStartPrivateFromMessage = (msg: ChatMessage) => {
    if (!msg.sender_id || msg.sender_id === activeUserId) return;
    const targetContact: ChatContact = {
      id: msg.sender_id,
      name: msg.sender_name,
      role: msg.sender_role || 'JEMAAT',
      avatar: msg.sender_avatar
    };
    handleStartPrivateChat(targetContact);
  };

  const handleDeleteMessage = async (id: string) => {
    const msg = messages.find((m) => m.id === id);
    const isPinned = msg?.is_pinned;
    const ok = await confirmDialog({
      title: isPinned ? 'Hapus Pesan Disematkan' : 'Hapus Pesan Chat',
      message: isPinned
        ? 'Pesan ini sedang DI-SEMATKAN (Pinned). Anda yakin ingin menghapus pesan ini?'
        : 'Hapus pesan ini dari ruang chat?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true
    });
    if (!ok) return;

    StorageManager.deleteChatMessage(id);
    setMessages(StorageManager.getChatMessages());
    if (isAdmin) {
      StorageManager.logActivity(
        currentUser.username,
        `Menghapus pesan chat: ${msg?.message.slice(0, 35) || id}`,
        'Ruang Chat'
      );
    }
  };

  const handleTogglePin = (id: string) => {
    StorageManager.togglePinChatMessage(id);
    setMessages(StorageManager.getChatMessages());
  };

  const handleClearAllChat = () => {
    StorageManager.clearChatMessages();
    setMessages([]);
    setShowClearConfirm(false);
  };

  // Set of all registered users in Management User
  const validUserSet = useMemo(() => {
    const set = new Set<string>();
    const allUsers = StorageManager.getUsers();
    allUsers.forEach((u) => {
      if (u.user_id) set.add(u.user_id.toLowerCase());
      if (u.username) set.add(u.username.toLowerCase());
      if (u.nama) set.add(u.nama.toLowerCase().trim());
    });
    return set;
  }, [messages]);

  // AIRTIGHT ISOLATION: Strict conversation filter
  // ONLY messages from accounts in Management User are displayed
  const currentFeedMessages = useMemo(() => {
    const myId = activeUserId.toLowerCase();
    const myUsername = (currentUser.username || '').toLowerCase();

    if (chatMode === 'PRIVATE') {
      if (!selectedContact) return [];
      const cId = selectedContact.id.toLowerCase();
      const cUser = (selectedContact.username || '').toLowerCase();

      return messages.filter((msg) => {
        if (!msg.is_private) return false;

        const sId = (msg.sender_id || '').toLowerCase();
        const sName = (msg.sender_name || '').toLowerCase().trim();
        const rId = (msg.recipient_id || '').toLowerCase();
        const rName = (msg.recipient_name || '').toLowerCase().trim();

        // Both sender & recipient MUST be in Management User
        const isSenderValid = validUserSet.has(sId) || validUserSet.has(sName) || sId === myId || sId === myUsername;
        const isRecipientValid = validUserSet.has(rId) || validUserSet.has(rName) || rId === myId || rId === myUsername;
        if (!isSenderValid || !isRecipientValid) return false;

        const isSenderMe = sId === myId || sId === myUsername;
        const isRecipientMe = rId === myId || rId === myUsername;
        const isSenderContact = sId === cId || sId === cUser;
        const isRecipientContact = rId === cId || rId === cUser;

        return (isSenderMe && isRecipientContact) || (isSenderContact && isRecipientMe);
      });
    }

    // Community Mode: NEVER show private messages in the community feed!
    return messages.filter((msg) => {
      if (msg.is_private) return false;

      // Sender MUST exist in Management User
      const sId = (msg.sender_id || '').toLowerCase();
      const sName = (msg.sender_name || '').toLowerCase().trim();
      const isSenderValid = validUserSet.has(sId) || validUserSet.has(sName) || sId === myId || sId === myUsername;
      if (!isSenderValid) {
        return false;
      }

      // Exclude messages from other churches (specifically GBI ROCK Juanda or ingelin)
      if (sName.includes('gbi rock') || sName.includes('juanda') || sName.includes('ingelin')) {
        return false;
      }

      if (filterTag === 'PINNED') {
        if (!msg.is_pinned) return false;
      } else if (filterTag !== 'ALL') {
        if (msg.tag !== filterTag) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = msg.message.toLowerCase().includes(query);
        const matchesSender = msg.sender_name.toLowerCase().includes(query);
        return matchesText || matchesSender;
      }

      return true;
    });
  }, [messages, chatMode, selectedContact, filterTag, searchQuery, activeUserId, currentUser.username, validUserSet]);

  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => m.is_pinned && !m.is_private);
  }, [messages]);

  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      if (isToday) return timeStr;
      return `${date.getDate()}/${date.getMonth() + 1} ${timeStr}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div
      className={
        isFullScreen
          ? `fixed inset-0 sm:inset-3 z-50 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in ${
              isLight
                ? 'bg-white border border-slate-300 shadow-slate-400/20 text-slate-800'
                : 'bg-slate-950 border border-slate-700/80 shadow-black/90 text-white'
            }`
          : `flex flex-col h-[calc(100vh-190px)] sm:h-[calc(100vh-210px)] min-h-[520px] w-full max-w-6xl xl:max-w-7xl mx-auto rounded-3xl shadow-xl overflow-hidden animate-fade-in relative ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-slate-200/50 text-slate-800'
                : 'bg-slate-950 border border-slate-800 shadow-2xl text-white'
            }`
      }
    >
      {/* 1. TOP HEADER & ROOM MODE SWITCHER */}
      <div
        className={`p-2.5 sm:p-3.5 border-b backdrop-blur-xl flex flex-col gap-2 shrink-0 z-10 ${
          isLight ? 'bg-white/95 border-slate-200/90' : 'bg-slate-900/95 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Identity & Inline Current User */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: themeHex }}
            >
              {chatMode === 'PRIVATE' ? (
                <Lock className="w-5 h-5 text-white" />
              ) : (
                <MessageCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2
                  className={`text-sm sm:text-base font-black tracking-tight truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {chatMode === 'PRIVATE' ? 'Jalur Chat Pribadi' : 'Ruang Chat Komunitas'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${
                    chatMode === 'PRIVATE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                      : isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{chatMode === 'PRIVATE' ? '🔒 100% Terisolasi' : 'Live Komunitas'}</span>
                </span>
              </div>

              {/* Space-Saving Compact User Identity in Header */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'} hidden sm:inline`}>
                  Sebagai:
                </span>
                <span
                  className={`font-bold truncate max-w-[110px] sm:max-w-[170px] ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {activeUserName}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {currentUser.role === 'SUPER_ADMIN'
                    ? 'SuperAdmin'
                    : currentUser.role === 'ADMIN'
                    ? 'Admin'
                    : isGuest
                    ? 'Tamu'
                    : 'Jemaat'}
                </span>
                {isGuest && (
                  <button
                    onClick={() => {
                      setTempGuestName(guestName);
                      setIsEditingGuestName(true);
                    }}
                    title="Ubah Nama Tamu"
                    className={`p-0.5 rounded cursor-pointer ${
                      isLight
                        ? 'text-teal-700 hover:text-teal-900 hover:bg-slate-100'
                        : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
                    }`}
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action & Toggle Toolbar Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {chatMode === 'COMMUNITY' && (
              <button
                onClick={() => setShowFilterBar(!showFilterBar)}
                title={showFilterBar ? 'Tutup Filter' : 'Filter & Cari Pesan'}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showFilterBar || filterTag !== 'ALL' || searchQuery
                    ? 'text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                    : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                style={
                  showFilterBar || filterTag !== 'ALL' || searchQuery
                    ? { backgroundColor: themeHex, borderColor: themeHex }
                    : {}
                }
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showFilterBar ? 'Tutup' : 'Cari'}</span>
              </button>
            )}

            {/* Toggle Full Screen */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'Kecilkan Tampilan Chat' : 'Perluas Layar Penuh'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isFullScreen
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-lg'
                  : isLight
                  ? 'bg-slate-100/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Matikan Suara Notifikasi' : 'Aktifkan Suara Notifikasi'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? isLight
                    ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                    : 'bg-indigo-950/60 border-indigo-800 text-indigo-300 hover:bg-indigo-900/80'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Admin Clear Chat (Community only) */}
            {isAdmin && chatMode === 'COMMUNITY' && (
              <button
                onClick={() => setShowClearConfirm(true)}
                title="Bersihkan Semua Percakapan Komunitas (Admin)"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. CHAT ROOM MODE SWITCHER: RUANG KOMUNITAS vs PESAN PRIBADI */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-2xs">
          <button
            onClick={() => {
              setChatMode('COMMUNITY');
              setReplyTarget(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              chatMode === 'COMMUNITY'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Ruang Komunitas Publik</span>
          </button>

          <button
            onClick={() => {
              setChatMode('PRIVATE');
              setReplyTarget(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              chatMode === 'PRIVATE'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Pesan Pribadi (Jalur Khusus 1-on-1)</span>
            {totalUnreadPrivateCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                {totalUnreadPrivateCount} baru
              </span>
            )}
          </button>
        </div>

        {/* Guest Nickname Editor Drawer */}
        {isEditingGuestName && (
          <div
            className={`flex items-center gap-2 p-2 rounded-xl border text-xs animate-fade-in ${
              isLight
                ? 'bg-teal-50/80 border-teal-200 text-slate-800'
                : 'bg-indigo-950/40 border-indigo-500/30 text-white'
            }`}
          >
            <span className={`font-bold ${isLight ? 'text-teal-800' : 'text-indigo-300'}`}>Nama Tamu:</span>
            <input
              type="text"
              value={tempGuestName}
              onChange={(e) => setTempGuestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveGuestName()}
              placeholder="Ketik nama Anda..."
              className={`flex-1 px-2.5 py-1 rounded-lg border text-xs focus:outline-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-950 border-indigo-500 text-white'
              }`}
              autoFocus
            />
            <button
              onClick={handleSaveGuestName}
              style={{ backgroundColor: themeHex }}
              className="px-2.5 py-1 rounded-lg text-white font-bold hover:brightness-110 cursor-pointer"
            >
              Simpan
            </button>
            <button
              onClick={() => setIsEditingGuestName(false)}
              className={`p-1 cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapsible Community Filter & Search Bar */}
        {chatMode === 'COMMUNITY' && showFilterBar && !isFocusMode && (
          <div
            className={`pt-2 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 animate-fade-in ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            {/* Tag Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <button
                onClick={() => setFilterTag('ALL')}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterTag === 'ALL'
                    ? isLight
                      ? 'text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
                style={filterTag === 'ALL' && isLight ? { backgroundColor: themeHex } : {}}
              >
                Semua
              </button>
              {pinnedMessages.length > 0 && (
                <button
                  onClick={() => setFilterTag('PINNED')}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    filterTag === 'PINNED'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : isLight
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'bg-slate-900 text-amber-400 hover:bg-amber-950/40 border border-amber-800/40'
                  }`}
                >
                  <Pin className="w-3 h-3 fill-current" />
                  <span>Disematkan ({pinnedMessages.length})</span>
                </button>
              )}
              {(['DOA', 'AYAT', 'SALAM', 'INFO'] as ChatTag[]).map((tag) => {
                const tagClasses = isLight ? TAG_CONFIG[tag].light : TAG_CONFIG[tag].dark;
                return (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      filterTag === tag
                        ? `${tagClasses.bg} ${tagClasses.text} border ${tagClasses.border} shadow-sm`
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{TAG_CONFIG[tag].icon}</span>
                    <span>{TAG_CONFIG[tag].label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative shrink-0 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pesan / jemaat..."
                className={`w-full pl-8 pr-7 py-1 rounded-xl border text-xs focus:outline-none placeholder-slate-400 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-teal-500'
                    : 'bg-slate-900/90 border-slate-800 text-white focus:border-indigo-500 placeholder-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN CHAT AREA */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* === SCENARIO A: PRIVATE MODE - DIRECTORY VIEW (NO CONTACT SELECTED) === */}
        {chatMode === 'PRIVATE' && !selectedContact && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Header Advisory Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 shadow-xs">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-xs sm:text-sm flex items-center gap-2">
                  <span>Jalur Chat Pribadi Terenkripsi &amp; Terisolasi (1-on-1)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                    Privasi 100%
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pilih salah satu jemaat atau pengurus gereja di bawah ini. Percakapan di ruang ini{' '}
                  <strong>hanya dapat dibaca oleh Anda ({activeUserName}) dan orang yang Anda tuju</strong>.
                  Jemaat lain, pengurus lain, maupun publik <strong>sama sekali tidak dapat melihat isi percakapan</strong>.
                </p>
                {isGuest && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold pt-1">
                    💡 Anda sedang menggunakan akun Tamu (ID Perangkat: {activeUserId.slice(0, 12)}). Hanya perangkat ini yang dapat membaca balasan dari orang yang Anda hubungi.
                  </p>
                )}
              </div>
            </div>

            {/* Contact Search & Role Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  placeholder="Cari jemaat, nama, wilayah, atau admin..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                      : 'bg-slate-900 border-slate-800 text-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setContactRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    contactRoleFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Semua ({contactsList.length})
                </button>
                <button
                  onClick={() => setContactRoleFilter('JEMAAT')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    contactRoleFilter === 'JEMAAT'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Jemaat
                </button>
                <button
                  onClick={() => setContactRoleFilter('ADMIN')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    contactRoleFilter === 'ADMIN'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Pengurus &amp; Admin
                </button>
              </div>
            </div>

            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {filteredContacts.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">Tidak ada jemaat yang cocok dengan pencarian.</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleStartPrivateChat(contact)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isLight
                        ? 'bg-white hover:bg-emerald-50/30 border-slate-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                            style={{ backgroundColor: themeHex }}
                          >
                            {contact.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        {contact.unreadCount && contact.unreadCount > 0 ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                            {contact.unreadCount}
                          </span>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {contact.name}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                              contact.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                                : contact.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {contact.role === 'SUPER_ADMIN'
                              ? 'SuperAdmin'
                              : contact.role === 'ADMIN'
                              ? 'Admin'
                              : 'Jemaat'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {contact.lastMessage ? (
                            <span className="italic text-emerald-700 dark:text-emerald-300 font-medium">
                              "{contact.lastMessage.slice(0, 45)}
                              {contact.lastMessage.length > 45 ? '...' : ''}"
                            </span>
                          ) : (
                            contact.wilayah || 'Belum ada obrolan pribadi dengan Anda'
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPrivateChat(contact);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs shrink-0 flex items-center gap-1.5 group-hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Chat Pribadi</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* === SCENARIO B: ACTIVE CHAT FEED (COMMUNITY OR SPECIFIC PRIVATE CONTACT) === */}
        {(chatMode === 'COMMUNITY' || (chatMode === 'PRIVATE' && selectedContact)) && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Private Contact Active Header Sub-Bar */}
            {chatMode === 'PRIVATE' && selectedContact && (
              <div
                className={`p-2.5 px-4 border-b flex items-center justify-between gap-3 ${
                  isLight ? 'bg-emerald-50/80 border-emerald-200' : 'bg-emerald-950/30 border-emerald-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer shadow-2xs"
                    title="Kembali ke Daftar Kontak"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-2xs shrink-0"
                      style={{ backgroundColor: themeHex }}
                    >
                      {selectedContact.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {selectedContact.name}
                        </h3>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 shrink-0">
                          {selectedContact.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800/90 dark:text-emerald-300/90 flex items-center gap-1 truncate font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Jalur Terisolasi 100% &bull; Hanya Anda ({activeUserName}) dan {selectedContact.name}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/40 hover:bg-white cursor-pointer shadow-2xs"
                >
                  Ganti Lawan Bicara
                </button>
              </div>
            )}

            {/* Pinned Messages Banner (Community mode only) */}
            {chatMode === 'COMMUNITY' &&
              pinnedMessages.length > 0 &&
              !isPinnedBannerDismissed &&
              !isFocusMode && (
                <div
                  className={`p-2 sm:p-2.5 border-b flex items-center justify-between gap-2 text-xs animate-fade-in ${
                    isLight
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-amber-950/40 border-amber-800/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-current" />
                    <span className="font-extrabold text-[11px] shrink-0 text-amber-700 dark:text-amber-400">
                      Disematkan:
                    </span>
                    <p className="truncate text-[11px] font-medium">
                      <strong className="font-bold">{pinnedMessages[0].sender_name}:</strong>{' '}
                      {pinnedMessages[0].message}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPinnedBannerDismissed(true)}
                    className="p-1 rounded text-amber-600 hover:text-amber-900 cursor-pointer"
                    title="Tutup banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            {/* Scrollable Messages Stream */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin transition-colors ${
                isLight ? 'bg-slate-50/50' : 'bg-slate-950'
              }`}
            >
              {currentFeedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md opacity-80"
                    style={{ backgroundColor: themeHex }}
                  >
                    {chatMode === 'PRIVATE' ? <Lock className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                      {chatMode === 'PRIVATE'
                        ? `Belum ada pesan pribadi dengan ${selectedContact?.name}`
                        : 'Belum ada percakapan di ruang komunitas'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {chatMode === 'PRIVATE'
                        ? `Pesan yang Anda kirimkan di sini bersifat 100% rahasia, terisolasi khusus antara Anda dan ${selectedContact?.name}. Jemaat lain tidak akan pernah bisa membaca pesan ini.`
                        : 'Jadilah yang pertama mengirimkan sapaan, ayat berkat, atau pokok doa kepada sesama jemaat!'}
                    </p>
                  </div>
                </div>
              ) : (
                currentFeedMessages.map((msg) => {
                  const isFromMe = msg.sender_id === activeUserId;
                  const tagConfig = msg.tag ? TAG_CONFIG[msg.tag] : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group animate-fade-in ${
                        isFromMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Sender Info for Inbound Messages */}
                      {!isFromMe && (
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                          <span
                            className={`font-extrabold ${
                              isLight ? 'text-slate-900' : 'text-slate-200'
                            }`}
                          >
                            {msg.sender_name}
                          </span>

                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                              msg.sender_role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                                : msg.sender_role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                                : msg.sender_role === 'TAMU'
                                ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {msg.sender_role === 'SUPER_ADMIN'
                              ? 'SuperAdmin'
                              : msg.sender_role === 'ADMIN'
                              ? 'Admin'
                              : msg.sender_role === 'TAMU'
                              ? 'Tamu'
                              : 'Jemaat'}
                          </span>

                          {msg.is_private && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Rahasia / Pribadi</span>
                            </span>
                          )}

                          {tagConfig && !msg.is_private && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                                isLight ? tagConfig.light.bg : tagConfig.dark.bg
                              } ${isLight ? tagConfig.light.text : tagConfig.dark.text} ${
                                isLight ? tagConfig.light.border : tagConfig.dark.border
                              }`}
                            >
                              {tagConfig.icon} {tagConfig.label}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bubble Message */}
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs relative transition-all ${
                          isFromMe
                            ? 'text-white rounded-br-xs'
                            : isLight
                            ? 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs shadow-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                        }`}
                        style={isFromMe ? { backgroundColor: themeHex } : {}}
                      >
                        {/* Reply Header inside bubble */}
                        {msg.reply_to && (
                          <div
                            className={`mb-2 p-2 rounded-xl text-[10px] border-l-2 ${
                              isFromMe
                                ? 'bg-black/15 text-white/90 border-white/60'
                                : isLight
                                ? 'bg-slate-100 text-slate-700 border-slate-400'
                                : 'bg-slate-800 text-slate-300 border-slate-600'
                            }`}
                          >
                            <span className="font-extrabold block">{msg.reply_to.sender_name}:</span>
                            <span className="line-clamp-1 italic">"{msg.reply_to.message}"</span>
                          </div>
                        )}

                        {/* Message Content */}
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed font-normal">
                          {msg.message}
                        </p>

                        {/* Footer: Time & Status */}
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] font-mono ${
                            isFromMe ? 'text-white/80' : isLight ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {msg.is_pinned && <Pin className="w-2.5 h-2.5 fill-current text-amber-300" />}
                          {msg.is_private && <Lock className="w-2.5 h-2.5 text-emerald-300" />}
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isFromMe && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {/* Action Hover Tooltip on Message */}
                      <div
                        className={`flex items-center gap-1.5 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ${
                          isFromMe ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Reply Action */}
                        <button
                          onClick={() => setReplyTarget(msg)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Reply className="w-2.5 h-2.5" />
                          <span>Balas</span>
                        </button>

                        {/* Start Private Chat (If in community mode and from another user) */}
                        {chatMode === 'COMMUNITY' && !isFromMe && (
                          <button
                            onClick={() => handleStartPrivateFromMessage(msg)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1 cursor-pointer shadow-2xs font-bold"
                            title="Balas secara pribadi (hanya Anda dan pengirim)"
                          >
                            <Lock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Pribadi</span>
                          </button>
                        )}

                        {/* Pin Message (Admin only, community only) */}
                        {isAdmin && !msg.is_private && (
                          <button
                            onClick={() => handleTogglePin(msg.id)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Pin className="w-2.5 h-2.5" />
                            <span>{msg.is_pinned ? 'Lepas' : 'Sematkan'}</span>
                          </button>
                        )}

                        {/* Delete Message */}
                        {(isAdmin || isFromMe) && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollBottom && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-20 right-4 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg cursor-pointer hover:scale-105 transition-all z-20 flex items-center gap-1 text-xs font-bold"
              >
                <ArrowDown className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Pesan Baru</span>
              </button>
            )}

            {/* Active Reply Banner above Input */}
            {replyTarget && (
              <div
                className={`p-2 px-4 border-t flex items-center justify-between text-xs animate-fade-in ${
                  isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Reply className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-bold shrink-0">Membalas {replyTarget.sender_name}:</span>
                  <span className="truncate italic text-slate-500">"{replyTarget.message}"</span>
                </div>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Blessings Row Toggle */}
            {showQuickBlessings && (
              <div
                className={`p-2 px-3 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-none animate-fade-in text-xs ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {QUICK_BLESSINGS.map((blessing) => (
                  <button
                    key={blessing}
                    onClick={() => {
                      setInputMessage((prev) => (prev ? `${prev} ${blessing}` : blessing));
                      setShowQuickBlessings(false);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    {blessing}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form Box or Guest Notice */}
            {isGuest ? (
              <div
                className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                  isLight ? 'bg-teal-50/90 border-teal-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              >
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 min-w-0">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-xs">
                    Ruang Chat Komunitas &amp; Pesan Pribadi hanya dapat digunakan oleh akun yang terdaftar pada <strong>Manajemen User</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLogin) onOpenLogin();
                    else window.dispatchEvent(new CustomEvent('open_login_modal'));
                  }}
                  style={{ backgroundColor: themeHex }}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs shrink-0 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  Masuk / Login Akun
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className={`p-2.5 sm:p-3 border-t flex items-center gap-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
                }`}
              >
                {/* Quick Blessings & Tag Toggles */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickBlessings(!showQuickBlessings)}
                    title="Pintasan Doa & Berkat"
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      showQuickBlessings
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </button>

                  {chatMode === 'COMMUNITY' && (
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value as ChatTag)}
                      className={`px-2 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="UMUM">💬 Umum</option>
                      <option value="DOA">🙏 Doa</option>
                      <option value="AYAT">✝️ Ayat</option>
                      <option value="SALAM">🕊️ Salam</option>
                      <option value="INFO">📢 Info</option>
                    </select>
                  )}
                </div>

                {/* Text Input */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      chatMode === 'PRIVATE' && selectedContact
                        ? `Ketik pesan pribadi untuk ${selectedContact.name} (rahasia 1-on-1)...`
                        : 'Ketik pesan firman, doa, atau sapaan jemaat...'
                    }
                    className={`w-full px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                      chatMode === 'PRIVATE'
                        ? 'focus:ring-2 focus:ring-emerald-500/30'
                        : 'focus:ring-2 focus:ring-emerald-500/30'
                    } ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                        : 'bg-slate-800/90 border-slate-700 text-white focus:bg-slate-800'
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  style={{ backgroundColor: themeHex }}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 shrink-0"
                >
                  {chatMode === 'PRIVATE' ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Bersihkan Ruang Chat?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tindakan ini akan menghapus seluruh riwayat pesan komunitas. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleClearAllChat}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
