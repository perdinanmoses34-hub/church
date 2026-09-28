export interface ParsedVideo {
  type: 'youtube' | 'instagram' | 'tiktok' | 'mp4' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  isValid: boolean;
}

/**
 * Parses social media video links (YouTube, Shorts, Instagram Reels/Posts, TikTok, MP4)
 * into embeddable URLs for responsive video players.
 */
export function parseSocialVideoUrl(url?: string): ParsedVideo {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      type: 'unknown',
      embedUrl: '',
      originalUrl: '',
      isValid: false
    };
  }

  const cleanUrl = url.trim();

  // 1. YouTube & Shorts
  // Matches: youtube.com/watch?v=ID, youtube.com/shorts/ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
      originalUrl: cleanUrl,
      isValid: true
    };
  }

  // 2. Instagram (Reels or Posts)
  // Matches: instagram.com/p/CODE/ or instagram.com/reel/CODE/
  const igMatch = cleanUrl.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const code = igMatch[1];
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/p/${code}/embed`,
      originalUrl: cleanUrl,
      isValid: true
    };
  }

  // 3. TikTok
  // Matches: tiktok.com/@user/video/1234567890
  const ttMatch = cleanUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (ttMatch && ttMatch[1]) {
    const videoId = ttMatch[1];
    return {
      type: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      originalUrl: cleanUrl,
      isValid: true
    };
  }

  // 4. Direct MP4 or WebM video file
  if (cleanUrl.match(/\.(mp4|webm|ogg)($|\?)/i) || cleanUrl.startsWith('data:video')) {
    return {
      type: 'mp4',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      isValid: true
    };
  }

  // Fallback: If it's a direct iframe source URL or valid https URL
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return {
      type: 'unknown',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      isValid: true
    };
  }

  return {
    type: 'unknown',
    embedUrl: '',
    originalUrl: cleanUrl,
    isValid: false
  };
}
