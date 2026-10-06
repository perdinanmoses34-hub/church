import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppSettings } from '../types';
import { StorageManager } from './storage';

export interface SignatureBlock {
  mengetahuiText?: string;
  leftTitle?: string;
  leftName?: string;
  leftRole?: string;
  rightTitle?: string;
  rightName?: string;
  rightRole?: string;
  dateCity?: string;
}

/**
 * Helper to get default official endorsement signatures:
 * Kiri: Ketua Majelis Jemaat / Penanggung Jawab
 * Kanan: Pendeta Jemaat
 */
export function getDefaultSignatures(settings?: AppSettings, custom?: SignatureBlock): Required<SignatureBlock> {
  const activeSettings = settings || StorageManager.getSettings();
  const dateStr = custom?.dateCity || `Puriala, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return {
    mengetahuiText: custom?.mengetahuiText || 'MENGETAHUI,',
    dateCity: dateStr,
    leftTitle: custom?.leftTitle || 'Ketua Majelis Jemaat / Penanggung Jawab',
    leftName: custom?.leftName || activeSettings?.nama_ketua_majelis || 'Dkn. Maria Melani',
    leftRole: custom?.leftRole || 'Ketua Majelis Jemaat',
    rightTitle: custom?.rightTitle || 'Pendeta Jemaat',
    rightName: custom?.rightName || activeSettings?.nama_pendeta || 'Pdt. Ferdinan Moses Timbu, S.Th, M.PdK',
    rightRole: custom?.rightRole || 'Pelayan Firman / Gembala'
  };
}

/**
 * Loads an image from URL or data URI safely for jsPDF embedding
 */
function loadImageSafely(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url || typeof window === 'undefined') return resolve(null);
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback without crossOrigin (in case of data URI or same-origin)
        try {
          const fallback = new Image();
          fallback.onload = () => resolve(fallback);
          fallback.onerror = () => resolve(null);
          fallback.src = url;
        } catch {
          resolve(null);
        }
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Export data to Excel (.xlsx) with Centered Kop Surat Header & Signatures Block
 */
export function exportToExcel(
  data: any[],
  fileName: string = 'Data_Laporan_Gereja',
  settings?: AppSettings,
  signatures?: SignatureBlock
) {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport.');
    return;
  }

  const activeSettings = settings || StorageManager.getSettings();
  const churchName = (activeSettings?.nama_gereja || 'GEREJA JEMAAT MONAPA PURIALA').trim().toUpperCase();
  const address = activeSettings?.alamat || 'Puriala, Sulawesi Tenggara';
  const email = activeSettings?.email || '-';
  const telepon = activeSettings?.telepon || '-';
  const logoUrl = activeSettings?.logo || '';

  const sig = getDefaultSignatures(activeSettings, signatures);

  // Prepare Kop Header rows for Excel sheet
  const headerRows: any[][] = [
    ['========================================================================================'],
    [`KOP SURAT RESMI - ${churchName}`],
    [`Alamat: ${address}`],
    [`Kontak: Email (${email}) | Telp/WhatsApp (${telepon})`],
    logoUrl ? [`Logo Gereja: ${logoUrl}`] : [],
    [`Dicetak pada: ${new Date().toLocaleString('id-ID')}`],
    ['========================================================================================'],
    [] // Row separator
  ];

  let fullDataRows: any[][] = [...headerRows];

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const keys = Object.keys(data[0]);
    fullDataRows.push(keys);
    data.forEach((item) => {
      fullDataRows.push(keys.map((k) => (item[k] !== undefined && item[k] !== null ? item[k] : '')));
    });
  }

  // Official Endorsement Signatures at the bottom of Excel sheet
  fullDataRows.push([]);
  fullDataRows.push([]);
  fullDataRows.push([`Ditetapkan di: ${sig.dateCity}`]);
  fullDataRows.push([sig.mengetahuiText]);
  fullDataRows.push([sig.leftTitle, '', '', sig.rightTitle]);
  fullDataRows.push(['(Tanda Tangan & Cap Majelis)', '', '', '(Tanda Tangan & Cap Gereja)']);
  fullDataRows.push([]);
  fullDataRows.push([]);
  fullDataRows.push([`( ${sig.leftName} )`, '', '', `( ${sig.rightName} )`]);
  if (sig.leftRole || sig.rightRole) {
    fullDataRows.push([sig.leftRole || '', '', '', sig.rightRole || '']);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(fullDataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Laporan');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export data to PDF with Centered Kop Surat Header, Church Logo, Double Border & Signatures
 */
export async function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  settings?: AppSettings,
  fileName: string = 'Data_Laporan_Gereja',
  signatures?: SignatureBlock
) {
  const doc = new jsPDF();
  const activeSettings = settings || StorageManager.getSettings();
  const churchName = (activeSettings?.nama_gereja || 'GEREJA JEMAAT MONAPA PURIALA').trim();
  const address = activeSettings?.alamat || 'Puriala, Sulawesi Tenggara';
  const email = activeSettings?.email || '-';
  const telepon = activeSettings?.telepon || '-';
  const logoUrl = activeSettings?.logo || '';

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const centerX = pageWidth / 2; // 105mm

  let currentY = 10;

  // 1. Render Logo Gereja (Rata Tengah / Centered di Atas Kop Surat)
  if (logoUrl) {
    try {
      const img = await loadImageSafely(logoUrl);
      if (img) {
        const logoSize = 18; // 18x18 mm
        doc.addImage(img, 'PNG', centerX - (logoSize / 2), currentY, logoSize, logoSize);
        currentY += logoSize + 4;
      }
    } catch (e) {
      console.warn('Logo gereja tidak dapat dimuat di PDF:', e);
    }
  }

  // 2. Header Kop Surat Resmi (Rata Tengah)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(churchName.toUpperCase(), centerX, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(address, centerX, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Email: ${email}  |  Telp / WhatsApp: ${telepon}`, centerX, currentY, { align: 'center' });
  currentY += 4;

  // 3. Garis Kop Surat Ganda Resmi (Garis Tebal & Tipis Rata Tengah)
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.0);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 1.2;
  doc.setLineWidth(0.3);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 7;

  // 4. Judul Dokumen Laporan (Rata Tengah)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), centerX, currentY, { align: 'center' });
  currentY += 5;

  // 5. Tanggal Cetak (Rata Tengah)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, centerX, currentY, { align: 'center' });
  currentY += 5;

  // 6. Tabel Data Laporan
  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  // 7. Tanda Tangan Pengesahan (Pendeta Jemaat & Ketua Majelis / Yang Bertanggung Jawab)
  const sig = getDefaultSignatures(activeSettings, signatures);

  let sigY = ((doc as any).lastAutoTable?.finalY || 120) + 12;
  if (sigY > 230) {
    doc.addPage();
    sigY = 25;
  }

  // Tanggal / Kota Ditetapkan
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text(sig.dateCity, pageWidth - 14, sigY, { align: 'right' });
  sigY += 6;

  // Mengetahui (Rata Tengah)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(sig.mengetahuiText, centerX, sigY, { align: 'center' });
  sigY += 7;

  // Jabatan Kiri & Kanan
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(sig.leftTitle, 55, sigY, { align: 'center' });
  doc.text(sig.rightTitle, pageWidth - 55, sigY, { align: 'center' });
  sigY += 6;

  // Ruang Tanda Tangan & Cap
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('(Tanda Tangan & Cap Majelis)', 55, sigY, { align: 'center' });
  doc.text('(Tanda Tangan & Cap Gereja)', pageWidth - 55, sigY, { align: 'center' });
  sigY += 15;

  // Garis Bawah Nama Pejabat
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${sig.leftName} )`, 55, sigY, { align: 'center' });
  doc.text(`( ${sig.rightName} )`, pageWidth - 55, sigY, { align: 'center' });

  if (sig.leftRole || sig.rightRole) {
    sigY += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    if (sig.leftRole) doc.text(sig.leftRole, 55, sigY, { align: 'center' });
    if (sig.rightRole) doc.text(sig.rightRole, pageWidth - 55, sigY, { align: 'center' });
  }

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Print preview document with Centered Kop Surat Header, Church Logo & Signatures
 */
export function printDocument(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  settings?: AppSettings,
  signatures?: SignatureBlock
) {
  const activeSettings = settings || StorageManager.getSettings();
  const churchName = (activeSettings?.nama_gereja || 'GEREJA JEMAAT MONAPA PURIALA').trim();
  const address = activeSettings?.alamat || 'Puriala, Sulawesi Tenggara';
  const email = activeSettings?.email || '-';
  const telepon = activeSettings?.telepon || '-';
  const logoUrl = activeSettings?.logo || '';

  const sig = getDefaultSignatures(activeSettings, signatures);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir oleh browser/aplikasi. Silakan gunakan tombol "Buka di Browser HP" di bagian atas halaman.');
    return;
  }

  const signatureHtml = `
    <div style="margin-top: 36px; page-break-inside: avoid;">
      <div style="text-align: right; font-size: 11px; color: #475569; margin-bottom: 10px; font-style: italic;">
        ${sig.dateCity}
      </div>
      <div style="text-align: center; font-size: 12px; font-weight: bold; margin-bottom: 16px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        ${sig.mengetahuiText}
      </div>
      <table style="width: 100%; border: none; margin-top: 6px;">
        <tr style="background: transparent;">
          <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 0 16px;">
            <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 6px;">
              ${sig.leftTitle}
            </div>
            <div style="height: 55px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; font-style: italic;">
              (Tanda Tangan &amp; Cap Majelis)
            </div>
            <div style="font-weight: bold; font-size: 11px; color: #0f172a; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 220px;">
              (${sig.leftName})
            </div>
            ${sig.leftRole ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${sig.leftRole}</div>` : ''}
          </td>
          <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 0 16px;">
            <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 6px;">
              ${sig.rightTitle}
            </div>
            <div style="height: 55px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; font-style: italic;">
              (Tanda Tangan &amp; Cap Gereja)
            </div>
            <div style="font-weight: bold; font-size: 11px; color: #0f172a; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 220px;">
              (${sig.rightName})
            </div>
            ${sig.rightRole ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${sig.rightRole}</div>` : ''}
          </td>
        </tr>
      </table>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #1e293b; }
          .kop { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 14px; margin-bottom: 22px; }
          .kop-logo { width: 68px; height: 68px; object-fit: contain; margin: 0 auto 8px auto; display: block; }
          .kop h1 { margin: 0 0 4px 0; font-size: 19px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; color: #0f172a; }
          .kop .alamat { margin: 2px 0; font-size: 12px; color: #334155; }
          .kop .kontak { margin: 2px 0; font-size: 11px; color: #64748b; }
          .doc-header { text-align: center; margin-bottom: 18px; }
          .doc-title { font-size: 15px; font-weight: bold; text-transform: uppercase; color: #0f172a; letter-spacing: 0.3px; }
          .doc-meta { font-size: 11px; color: #64748b; margin-top: 4px; font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #0f172a; color: #ffffff; font-weight: bold; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; display: flex; gap: 10px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #0d9488; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            🖨️ Cetak / Print Sekarang
          </button>
          <button onclick="window.close()" style="padding: 8px 16px; background: #64748b; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Tutup Jendela
          </button>
        </div>
        <div class="kop">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo Gereja" class="kop-logo" onerror="this.style.display='none'" />` : ''}
          <h1>${churchName}</h1>
          <p class="alamat">${address}</p>
          <p class="kontak">Email: ${email}  |  Telp / WhatsApp: ${telepon}</p>
        </div>
        <div class="doc-header">
          <div class="doc-title">${title}</div>
          <div class="doc-meta">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
        </div>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell !== undefined && cell !== null ? cell : ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        ${signatureHtml}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  try {
    printWindow.focus();
  } catch (err) {
    console.error('Window focus error:', err);
  }
}
