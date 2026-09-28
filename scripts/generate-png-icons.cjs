const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function makeCrcTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = writeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0; // None filter
    const rowStart = y * (width * 4 + 1) + 1;
    const srcRowStart = y * width * 4;
    rgbaBuffer.copy(scanlines, rowStart, srcRowStart, srcRowStart + width * 4);
  }

  const deflated = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = writeChunk('IDAT', deflated);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function renderChurchIcon(size, isMaskable = false) {
  const buffer = Buffer.alloc(size * size * 4);

  // Colors
  const darkNavy = [15, 23, 42, 255]; // #0f172a
  const deepIndigo = [30, 27, 75, 255]; // #1e1b4b
  const pitchBlack = [9, 13, 22, 255]; // #090d16
  const goldBright = [251, 191, 36, 255]; // #fbbf24
  const goldDark = [217, 119, 6, 255]; // #d97706
  const white = [255, 255, 255, 255];
  const goldGlow = [251, 191, 36, 60];

  const center = size / 2;
  const scale = isMaskable ? (size / 512) * 0.8 : (size / 512);
  const cornerRadius = isMaskable ? 0 : size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rect boundary if not maskable
      if (!isMaskable) {
        let inside = true;
        const r = cornerRadius;
        if (x < r && y < r) inside = Math.hypot(x - r, y - r) <= r;
        else if (x > size - r && y < r) inside = Math.hypot(x - (size - r), y - r) <= r;
        else if (x < r && y > size - r) inside = Math.hypot(x - r, y - (size - r)) <= r;
        else if (x > size - r && y > size - r) inside = Math.hypot(x - (size - r), y - (size - r)) <= r;

        if (!inside) {
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = 0;
          continue;
        }
      }

      // Background gradient (top-left to bottom-right)
      const gradRatio = (x + y) / (size * 2);
      let rBg, gBg, bBg;
      if (gradRatio < 0.5) {
        const t = gradRatio / 0.5;
        rBg = Math.round(darkNavy[0] * (1 - t) + deepIndigo[0] * t);
        gBg = Math.round(darkNavy[1] * (1 - t) + deepIndigo[1] * t);
        bBg = Math.round(darkNavy[2] * (1 - t) + deepIndigo[2] * t);
      } else {
        const t = (gradRatio - 0.5) / 0.5;
        rBg = Math.round(deepIndigo[0] * (1 - t) + pitchBlack[0] * t);
        gBg = Math.round(deepIndigo[1] * (1 - t) + pitchBlack[1] * t);
        bBg = Math.round(deepIndigo[2] * (1 - t) + pitchBlack[2] * t);
      }

      // Base pixel
      let pr = rBg;
      let pg = gBg;
      let pb = bBg;
      let pa = 255;

      // Border ring if not maskable
      if (!isMaskable) {
        const distToEdge = Math.min(x, y, size - 1 - x, size - 1 - y);
        if (distToEdge >= 4 && distToEdge <= 8) {
          const goldFactor = 0.5 + 0.5 * Math.sin((x + y) / 20);
          pr = Math.round(pr * 0.4 + (goldBright[0] * goldFactor) * 0.6);
          pg = Math.round(pg * 0.4 + (goldBright[1] * goldFactor) * 0.6);
          pb = Math.round(pb * 0.4 + (goldBright[2] * goldFactor) * 0.6);
        }
      }

      // Coordinate relative to center and scaled
      const relX = (x - center) / scale;
      const relY = (y - center) / scale;

      // Halo behind the cross: center at (0, -36)
      const haloDist = Math.hypot(relX, relY + 36);
      if (haloDist < 120) {
        const haloIntensity = Math.pow(1 - haloDist / 120, 1.5) * 0.45;
        pr = Math.min(255, Math.round(pr * (1 - haloIntensity) + goldBright[0] * haloIntensity));
        pg = Math.min(255, Math.round(pg * (1 - haloIntensity) + goldBright[1] * haloIntensity));
        pb = Math.min(255, Math.round(pb * (1 - haloIntensity) + goldBright[2] * haloIntensity));
      }

      // Cathedral Arch Silhouette
      // Arch bounded from relX -80 to 80, relY -90 to 135
      if (relX >= -75 && relX <= 75 && relY >= -90 && relY <= 135) {
        let inArch = false;
        if (relY >= 0) inArch = true;
        else {
          // rounded top
          const archR = 75;
          if (Math.hypot(relX, relY) <= archR) inArch = true;
        }
        if (inArch) {
          pr = Math.round(pr * 0.55 + 30 * 0.45);
          pg = Math.round(pg * 0.55 + 41 * 0.45);
          pb = Math.round(pb * 0.55 + 59 * 0.45);
        }
      }

      // Golden Latin Cross
      // Vertical beam: X: -18 to +18, Y: -145 to +95
      // Horizontal beam: X: -85 to +85, Y: -80 to -44
      const inVBeam = (relX >= -18 && relX <= 18 && relY >= -145 && relY <= 95);
      const inHBeam = (relX >= -85 && relX <= 85 && relY >= -80 && relY <= -44);

      if (inVBeam || inHBeam) {
        // Gold shading
        const verticalT = (relY + 145) / 240;
        const goldR = Math.round(goldBright[0] * (1 - verticalT * 0.3) + goldDark[0] * (verticalT * 0.3));
        const goldG = Math.round(goldBright[1] * (1 - verticalT * 0.3) + goldDark[1] * (verticalT * 0.3));
        const goldB = Math.round(goldBright[2] * (1 - verticalT * 0.3) + goldDark[2] * (verticalT * 0.3));

        // Center highlight
        const isCenter = Math.abs(relX) <= 6;
        if (isCenter) {
          pr = Math.min(255, goldR + 40);
          pg = Math.min(255, goldG + 35);
          pb = Math.min(255, goldB + 20);
        } else {
          pr = goldR;
          pg = goldG;
          pb = goldB;
        }

        // Diamond jewel at the intersection: center at (0, -62)
        const diamondDist = Math.abs(relX) + Math.abs(relY + 62);
        if (diamondDist <= 14) {
          const dw = 1 - diamondDist / 14;
          pr = Math.min(255, Math.round(pr * (1 - dw) + white[0] * dw));
          pg = Math.min(255, Math.round(pg * (1 - dw) + white[1] * dw));
          pb = Math.min(255, Math.round(pb * (1 - dw) + white[2] * dw));
        }
      }

      // Scripture Ribbon Base: relX -120 to 120, relY 145 to 168
      const ribbonCurv = 155 - Math.cos((relX / 120) * (Math.PI / 2)) * 12;
      if (relX >= -120 && relX <= 120 && relY >= ribbonCurv - 8 && relY <= ribbonCurv + 10) {
        pr = goldBright[0];
        pg = goldBright[1];
        pb = goldBright[2];
      }

      buffer[idx] = pr;
      buffer[idx + 1] = pg;
      buffer[idx + 2] = pb;
      buffer[idx + 3] = pa;
    }
  }

  return encodePng(size, size, buffer);
}

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA Icons...');

// 192x192
const icon192 = renderChurchIcon(192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
console.log('✓ pwa-192x192.png generated (' + icon192.length + ' bytes)');

// 512x512
const icon512 = renderChurchIcon(512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
console.log('✓ pwa-512x512.png generated (' + icon512.length + ' bytes)');

// 512x512 Maskable
const iconMaskable = renderChurchIcon(512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);
console.log('✓ pwa-maskable-512x512.png generated (' + iconMaskable.length + ' bytes)');

// Apple Touch Icon 180x180
const iconApple = renderChurchIcon(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), iconApple);
console.log('✓ apple-touch-icon.png generated (' + iconApple.length + ' bytes)');

// Favicon 32x32
const iconFavicon = renderChurchIcon(32, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), iconFavicon);
console.log('✓ favicon.ico generated (' + iconFavicon.length + ' bytes)');
