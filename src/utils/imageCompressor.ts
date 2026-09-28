/**
 * Image compression and optimization utility for client-side storage.
 * Resizes large high-resolution images (smartphone camera / 4K) to maximum 1600px width/height,
 * compressing to WebP/JPEG format (~80-150KB) to ensure localStorage & Firestore limits are never exceeded.
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<{ dataUrl: string; sizeKb: number; originalSizeKb: number }> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat format gambar'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional resize if larger than maxWidth
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const rawUrl = event.target?.result as string;
          resolve({
            dataUrl: rawUrl,
            sizeKb: Math.round(rawUrl.length * 0.75 / 1024),
            originalSizeKb
          });
          return;
        }

        // Draw and compress
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression, fallback to JPEG
        let compressedData = '';
        try {
          compressedData = canvas.toDataURL('image/webp', quality);
          if (!compressedData.startsWith('data:image/webp')) {
            compressedData = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          compressedData = canvas.toDataURL('image/jpeg', quality);
        }

        const sizeKb = Math.round((compressedData.length * 0.75) / 1024);
        resolve({
          dataUrl: compressedData,
          sizeKb,
          originalSizeKb
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads a photo to the user's computer or phone, handling data URLs, blobs, and CORS fallbacks.
 */
export async function downloadPhotoFile(photoUrl: string, title: string, date?: string): Promise<void> {
  const sanitizedTitle = (title || 'foto_gereja').trim().replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
  const dateStr = (date || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const fileName = `${sanitizedTitle}_${dateStr}.jpg`;

  // 1. Data URL
  if (photoUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 2. Fetch blob for remote URLs to ensure forced download
  try {
    const response = await fetch(photoUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
  } catch {
    // 3. Fallback: standard link download / open in new tab
    const link = document.createElement('a');
    link.href = photoUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
