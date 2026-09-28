import { AppSettings } from '../types';

/**
 * Helper generator that creates full Google Apps Script (GAS) code
 * ready for copy-pasting into script.google.com to turn Google Sheets into a REST API.
 */
export function generateGASScriptCode(settings?: AppSettings): string {
  return `/**
 * Google Apps Script (GAS) REST API Engine for CMS Pro
 * Spreadsheet ID: ${settings?.google_sheet_id || 'YOUR_GOOGLE_SHEET_ID'}
 * Generated automatically by Enterprise Church Management System Pro
 */

const SPREADSHEET_ID = "${settings?.google_sheet_id || ''}";

function getDb() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getAll';
  const sheetName = e && e.parameter && e.parameter.sheet;
  
  if (action === 'ping') {
    return createJsonResponse({ status: 'OK', message: 'CMS Pro GAS REST API Online', timestamp: new Date() });
  }

  if (!sheetName) {
    return createJsonResponse({ error: 'Parameter "sheet" required' }, 400);
  }

  const ss = getDb();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return createJsonResponse({ error: 'Sheet "' + sheetName + '" not found' }, 404);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({ status: 'success', data: [] });
  }

  const headers = data[0];
  const rows = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return createJsonResponse({ status: 'success', sheet: sheetName, total: rows.length, data: rows });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: 'OK', message: 'POST Endpoint Active' });
    }

    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || 'insert';
    const ss = getDb();

    // Action 1: Ping Healthcheck
    if (action === 'ping') {
      return createJsonResponse({ status: 'OK', message: 'CMS Pro GAS REST API Connected', timestamp: new Date() });
    }

    // Action 2: Auto Sync All 18 Sheets
    if (action === 'sync_all_18_sheets') {
      setupAll18Sheets();
      
      const mappings = [
        { name: '01_USERS', data: contents.users, headers: ['user_id', 'username', 'password_hash', 'nama', 'role', 'email', 'no_hp', 'status', 'created_at'] },
        { name: '02_JEMAAT', data: contents.jemaat, headers: ['jemaat_id', 'nik', 'no_kk', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'alamat', 'wilayah', 'komisi', 'status_baptis', 'status_sidi', 'status_pernikahan', 'pekerjaan', 'nomor_hp', 'email', 'foto', 'status'] },
        { name: '03_KELUARGA', data: contents.keluarga, headers: ['keluarga_id', 'no_kk', 'kepala_keluarga', 'alamat', 'wilayah'] },
        { name: '04_WILAYAH', data: contents.wilayah, headers: ['wilayah_id', 'nama_wilayah', 'ketua', 'jumlah_jemaat'] },
        { name: '05_PELAYANAN', data: contents.pelayanan, headers: ['pelayanan_id', 'nama', 'kategori', 'penanggung_jawab'] },
        { name: '06_BAPTISAN', data: contents.baptisan, headers: ['baptisan_id', 'jemaat_id', 'tanggal', 'pendeta', 'lokasi'] },
        { name: '07_SIDI', data: contents.sidi, headers: ['sidi_id', 'jemaat_id', 'tanggal', 'pendeta'] },
        { name: '08_PERNIKAHAN', data: contents.pernikahan, headers: ['nikah_id', 'suami', 'istri', 'tanggal', 'pendeta'] },
        { name: '09_PERSEMBAHAN', data: contents.persembahan, headers: ['persembahan_id', 'tanggal', 'kategori', 'jumlah', 'keterangan'] },
        { name: '10_DONASI', data: contents.donasi, headers: ['donasi_id', 'nama', 'jumlah', 'tanggal'] },
        { name: '11_PENGUMUMAN', data: contents.pengumuman, headers: ['pengumuman_id', 'judul', 'isi', 'tanggal', 'status'] },
        { name: '12_RENUNGAN', data: contents.renungan, headers: ['renungan_id', 'judul', 'isi', 'ayat', 'tanggal'] },
        { name: '13_EVENT', data: contents.events, headers: ['event_id', 'nama', 'lokasi', 'tanggal', 'jam'] },
        { name: '14_GALLERY', data: contents.gallery, headers: ['gallery_id', 'judul', 'foto', 'tanggal'] },
        { name: '17_ACTIVITY_LOG', data: contents.activity_logs, headers: ['log_id', 'user', 'aktivitas', 'tanggal', 'ip_address'] },
        { name: '18_LOGIN_HISTORY', data: contents.login_history, headers: ['history_id', 'user', 'login', 'logout', 'device', 'browser', 'ip_address'] }
      ];

      mappings.forEach(m => {
        if (!m.data || !Array.isArray(m.data)) return;
        let sh = ss.getSheetByName(m.name);
        if (!sh) {
          sh = ss.insertSheet(m.name);
          sh.appendRow(m.headers);
        } else {
          if (sh.getLastRow() > 1) {
            sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
          }
        }
        m.data.forEach(item => {
          const row = m.headers.map(h => item[h] !== undefined ? item[h] : '');
          sh.appendRow(row);
        });
      });

      return createJsonResponse({ status: 'success', message: 'Seluruh 18 Sheets berhasil dibuat & disinkronkan.' });
    }

    // Action 3: Single Sheet Insert
    const sheetName = contents.sheet;
    const payload = contents.data;

    if (!sheetName || !payload) {
      return createJsonResponse({ error: 'Sheet name and data are required' }, 400);
    }

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (typeof payload === 'object' && !Array.isArray(payload)) {
        sheet.appendRow(Object.keys(payload));
      }
    }

    const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];

    if (action === 'insert') {
      const row = headers.map(h => payload[h] !== undefined ? payload[h] : '');
      sheet.appendRow(row);
      return createJsonResponse({ status: 'success', message: 'Data inserted into ' + sheetName });
    }

    return createJsonResponse({ error: 'Action not supported' }, 400);
  } catch (err) {
    return createJsonResponse({ error: err.toString() }, 500);
  }
}

function createJsonResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup Function: Run this function once in Google Apps Script editor to auto-create all 18 sheets!
 */
function setupAll18Sheets() {
  const ss = getDb();
  const sheets = [
    { name: '01_USERS', headers: ['user_id', 'username', 'password_hash', 'nama', 'role', 'email', 'no_hp', 'status', 'created_at'] },
    { name: '02_JEMAAT', headers: ['jemaat_id', 'nik', 'no_kk', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'alamat', 'wilayah', 'komisi', 'status_baptis', 'status_sidi', 'status_pernikahan', 'pekerjaan', 'nomor_hp', 'email', 'foto', 'status'] },
    { name: '03_KELUARGA', headers: ['keluarga_id', 'no_kk', 'kepala_keluarga', 'alamat', 'wilayah'] },
    { name: '04_WILAYAH', headers: ['wilayah_id', 'nama_wilayah', 'ketua', 'jumlah_jemaat'] },
    { name: '05_PELAYANAN', headers: ['pelayanan_id', 'nama', 'kategori', 'penanggung_jawab'] },
    { name: '06_BAPTISAN', headers: ['baptisan_id', 'jemaat_id', 'tanggal', 'pendeta', 'lokasi'] },
    { name: '07_SIDI', headers: ['sidi_id', 'jemaat_id', 'tanggal', 'pendeta'] },
    { name: '08_PERNIKAHAN', headers: ['nikah_id', 'suami', 'istri', 'tanggal', 'pendeta'] },
    { name: '09_PERSEMBAHAN', headers: ['persembahan_id', 'tanggal', 'kategori', 'jumlah', 'keterangan'] },
    { name: '10_DONASI', headers: ['donasi_id', 'nama', 'jumlah', 'tanggal'] },
    { name: '11_PENGUMUMAN', headers: ['pengumuman_id', 'judul', 'isi', 'tanggal', 'status'] },
    { name: '12_RENUNGAN', headers: ['renungan_id', 'judul', 'isi', 'ayat', 'tanggal'] },
    { name: '13_EVENT', headers: ['event_id', 'nama', 'lokasi', 'tanggal', 'jam'] },
    { name: '14_GALLERY', headers: ['gallery_id', 'judul', 'foto', 'tanggal'] },
    { name: '15_NOTIFIKASI', headers: ['notif_id', 'user_id', 'judul', 'pesan', 'status_baca', 'tanggal'] },
    { name: '16_SETTING', headers: ['nama_gereja', 'logo', 'alamat', 'email', 'telepon', 'warna_tema', 'firebase_api_key', 'firebase_project_id', 'firebase_auth_domain', 'firebase_storage_bucket', 'firebase_messaging_sender_id', 'firebase_app_id', 'google_sheet_id', 'google_apps_script_url', 'timezone', 'bahasa'] },
    { name: '17_ACTIVITY_LOG', headers: ['log_id', 'user', 'aktivitas', 'tanggal', 'ip_address'] },
    { name: '18_LOGIN_HISTORY', headers: ['history_id', 'user', 'login', 'logout', 'device', 'browser', 'ip_address'] }
  ];

  sheets.forEach(s => {
    let sh = ss.getSheetByName(s.name);
    if (!sh) {
      sh = ss.insertSheet(s.name);
    }
    if (sh.getLastRow() === 0) {
      sh.appendRow(s.headers);
    }
  });
  Logger.log('18 Sheets created successfully!');
}
`;
}

export async function syncWithGoogleAppsScript(scriptUrl: string, sheetName: string, action: 'getAll' | 'insert' = 'getAll', data?: any) {
  if (!scriptUrl) {
    throw new Error('Google Apps Script URL belum dikonfigurasi.');
  }
  try {
    if (action === 'getAll') {
      const resp = await fetch(`${scriptUrl}?sheet=${encodeURIComponent(sheetName)}&action=getAll`);
      return await resp.json();
    } else {
      const resp = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: sheetName, action: 'insert', data })
      });
      return await resp.json();
    }
  } catch (err: any) {
    console.error('Error syncing with Google Apps Script:', err);
    throw err;
  }
}
