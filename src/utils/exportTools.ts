import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppSettings } from '../types';
import { StorageManager } from './storage';

export function exportToExcel(data: any[], fileName: string = 'Laporan_CMS_Pro', settings?: AppSettings) {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport.');
    return;
  }

  const activeSettings = settings || StorageManager.getSettings();
  const churchName = (activeSettings?.nama_gereja || 'SYSTEM MANAGEMENT CHURCH').trim();
  const address = activeSettings?.alamat || '';
  const email = activeSettings?.email || '';
  const telepon = activeSettings?.telepon || '';

  // Prepare Kop Header rows for Excel sheet
  const headerRows = [
    [churchName.toUpperCase()],
    [`Alamat: ${address}`],
    [`Kontak: Email (${email}) | Telp (${telepon})`],
    [`Dicetak pada: ${new Date().toLocaleString('id-ID')}`],
    [] // Empty row separator
  ];

  let fullDataRows: any[][] = [...headerRows];

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const keys = Object.keys(data[0]);
    fullDataRows.push(keys);
    data.forEach((item) => {
      fullDataRows.push(keys.map((k) => (item[k] !== undefined && item[k] !== null ? item[k] : '')));
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(fullDataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export interface SignatureBlock {
  mengetahuiText?: string;
  leftTitle: string;
  leftName?: string;
  leftRole?: string;
  rightTitle: string;
  rightName?: string;
  rightRole?: string;
  dateCity?: string;
}

export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  settings?: AppSettings,
  fileName: string = 'Dokumen_CMS_Pro',
  signatures?: SignatureBlock
) {
  const doc = new jsPDF();
  const activeSettings = settings || StorageManager.getSettings();
  const churchName = (activeSettings?.nama_gereja || 'SYSTEM MANAGEMENT CHURCH').trim();
  const address = activeSettings?.alamat || 'Gereja Management System';
  const email = activeSettings?.email || '-';
  const telepon = activeSettings?.telepon || '-';

  // Header Kop Surat
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName.toUpperCase(), 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(address, 14, 21);
  doc.text(`Email: ${email} | Telp: ${telepon}`, 14, 26);

  doc.setLineWidth(0.5);
  doc.line(14, 29, 196, 29);

  // Document Title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 44);

  // Table
  autoTable(doc, {
    startY: 48,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  // Tanda Tangan Mengetahui jika tersedia
  if (signatures) {
    let currentY = ((doc as any).lastAutoTable?.finalY || 120) + 14;
    if (currentY > 220) {
      doc.addPage();
      currentY = 25;
    }

    // Tanggal / Kota Ditetapkan
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(71, 85, 105);
    const dateText = signatures.dateCity || `Ditetapkan pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.text(dateText, 196, currentY, { align: 'right' });
    currentY += 8;

    // Mengetahui
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(signatures.mengetahuiText || 'Mengetahui,', 105, currentY, { align: 'center' });
    currentY += 8;

    // Jabatan / Role Titles
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    // Sebelah kiri: Pendeta jemaat/Gembala
    doc.text(signatures.leftTitle || 'Pendeta Jemaat / Gembala', 55, currentY, { align: 'center' });
    // Sebelah kanan: Ketua Majelis
    doc.text(signatures.rightTitle || 'Ketua Majelis', 155, currentY, { align: 'center' });

    // Space untuk Tanda Tangan (tanda tangan & cap)
    currentY += 12;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('(Tanda Tangan & Cap Gereja)', 55, currentY, { align: 'center' });
    doc.text('(Tanda Tangan & Cap Majelis)', 155, currentY, { align: 'center' });
    currentY += 16;

    // Garis / Nama
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const leftNameStr = signatures.leftName ? `( ${signatures.leftName} )` : '( .................................................... )';
    const rightNameStr = signatures.rightName ? `( ${signatures.rightName} )` : '( .................................................... )';
    doc.text(leftNameStr, 55, currentY, { align: 'center' });
    doc.text(rightNameStr, 155, currentY, { align: 'center' });

    if (signatures.leftRole || signatures.rightRole) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      if (signatures.leftRole) doc.text(signatures.leftRole, 55, currentY + 4, { align: 'center' });
      if (signatures.rightRole) doc.text(signatures.rightRole, 155, currentY + 4, { align: 'center' });
    }
  }

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function printDocument(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  settings?: AppSettings,
  signatures?: SignatureBlock
) {
  const activeSettings = settings || StorageManager.getSettings();
  const churchName = (activeSettings?.nama_gereja || 'SYSTEM MANAGEMENT CHURCH').trim();
  const address = activeSettings?.alamat || 'Gereja Management System';
  const email = activeSettings?.email || '-';
  const telepon = activeSettings?.telepon || '-';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir oleh browser/aplikasi. Silakan gunakan tombol "Buka di Browser HP" di bagian atas halaman.');
    return;
  }

  const signatureHtml = signatures
    ? `
      <div style="margin-top: 36px; page-break-inside: avoid;">
        <div style="text-align: right; font-size: 11px; color: #475569; margin-bottom: 12px; font-style: italic;">
          ${signatures.dateCity || `Ditetapkan pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        </div>
        <div style="text-align: center; font-size: 12px; font-weight: bold; margin-bottom: 16px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          ${signatures.mengetahuiText || 'Mengetahui,'}
        </div>
        <table style="width: 100%; border: none; margin-top: 6px;">
          <tr style="background: transparent;">
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 0 16px;">
              <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 8px;">
                ${signatures.leftTitle || 'Pendeta Jemaat / Gembala'}
              </div>
              <div style="height: 65px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; font-style: italic;">
                (Space Tanda Tangan &amp; Cap Gereja)
              </div>
              <div style="font-weight: bold; font-size: 11px; color: #0f172a; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 220px;">
                (${signatures.leftName || '....................................................'})
              </div>
              ${signatures.leftRole ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${signatures.leftRole}</div>` : ''}
            </td>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 0 16px;">
              <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 8px;">
                ${signatures.rightTitle || 'Ketua Majelis'}
              </div>
              <div style="height: 65px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; font-style: italic;">
                (Space Tanda Tangan &amp; Cap Majelis)
              </div>
              <div style="font-weight: bold; font-size: 11px; color: #0f172a; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 220px;">
                (${signatures.rightName || '....................................................'})
              </div>
              ${signatures.rightRole ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${signatures.rightRole}</div>` : ''}
            </td>
          </tr>
        </table>
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #1e293b; }
          .kop { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .kop h1 { margin: 0 0 6px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
          .kop p { margin: 2px 0; font-size: 11px; color: #475569; }
          .title { font-size: 15px; font-weight: bold; margin-bottom: 4px; color: #0f172a; }
          .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; color: #0f172a; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; display: flex; gap: 10px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Cetak / Print Sekarang
          </button>
          <button onclick="window.close()" style="padding: 8px 16px; background: #64748b; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Tutup Jendela
          </button>
        </div>
        <div class="kop">
          <h1>${churchName}</h1>
          <p>${address} | Email: ${email} | Telp: ${telepon}</p>
        </div>
        <div class="title">${title}</div>
        <div class="meta">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
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
