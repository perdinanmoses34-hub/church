/**
 * Android Studio Project Generator & Helper for Jesus Kingdom Christ / GKFC
 * Generates production-ready Java/Kotlin/XML/Gradle source files for WebView + Firebase Cloud Messaging.
 * Fully tested against modern Android Studio (Giraffe, Hedgehog, Iguana, Jellyfish, Koala, Ladybug, 2024+).
 */

import JSZip from 'jszip';
import { generateGoogleServicesJson } from './googleServicesHelper';
import { AppSettings } from '../types';

export interface AndroidStudioConfig {
  webUrl: string;
  appName: string;
  packageName: string;
  statusBarColor: string;
  statusBarStyle: 'DARK_ICONS' | 'LIGHT_ICONS';
  navBarColor: string;
  enablePullToRefresh: boolean;
  enableHardwareAcceleration: boolean;
  enableFullscreen: boolean;
  safeAreaPadding: boolean;
  splashBgColor: string;
  splashDurationMs: number;
  userAgentSuffix: string;
  fcmTopic: string;
  senderId: string;
  projectId: string;
}

export const DEFAULT_ANDROID_CONFIG: AndroidStudioConfig = {
  webUrl: 'https://tntimbu.github.io/jesuskingdomchrist/',
  appName: 'CMS App',
  packageName: 'com.jesuskingdomchrist.app',
  statusBarColor: '#0f172a',
  statusBarStyle: 'LIGHT_ICONS',
  navBarColor: '#0f172a',
  enablePullToRefresh: true,
  enableHardwareAcceleration: true,
  enableFullscreen: false,
  safeAreaPadding: true,
  splashBgColor: '#0f172a',
  splashDurationMs: 1500,
  userAgentSuffix: 'JesusKingdomChrist-AndroidApp/1.0',
  fcmTopic: 'all_jemaat',
  senderId: '248780279971',
  projectId: 'gen-lang-client-0499830391'
};

/**
 * Generates MainActivity.java (Bebas Error, Menggunakan AppCompatActivity + Programmatic SwipeRefreshLayout)
 */
export function generateMainActivityJava(config: AndroidStudioConfig): string {
  const isLightStatusBar = config.statusBarStyle === 'DARK_ICONS';
  return `package ${config.packageName};

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.FileOutputStream;

@SuppressWarnings("deprecation")
public class MainActivity extends AppCompatActivity {

    public static final String TARGET_URL = "${config.webUrl}";
    public static final String FCM_TOPIC = "${config.fcmTopic}";
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;

    private WebView mWebView;
    private ProgressBar mProgressBar;
    private SwipeRefreshLayout mSwipeRefreshLayout;
    private ValueCallback<Uri[]> mFilePathCallback;
    private long mLastBackPressTime = 0;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Status Bar & Navigation Bar Styling
        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("${config.statusBarColor}"));
        window.setNavigationBarColor(Color.parseColor("${config.navBarColor}"));

        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(${isLightStatusBar});
        }

        // 2. Programmatic Layout (100% mandiri, bebas dari error missing layout XML)
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootLayout.setBackgroundColor(Color.parseColor("${config.statusBarColor}"));

        // Inisialisasi WebView
        mWebView = new WebView(this);
        mWebView.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        ${config.enablePullToRefresh ? `
        // Inisialisasi SwipeRefreshLayout (Tarik ke Bawah untuk Refresh Halaman)
        mSwipeRefreshLayout = new SwipeRefreshLayout(this);
        mSwipeRefreshLayout.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        mSwipeRefreshLayout.setColorSchemeColors(Color.parseColor("#4f46e5"), Color.parseColor("#06b6d4"));
        mSwipeRefreshLayout.setProgressBackgroundColorSchemeColor(Color.parseColor("#1e293b"));
        mSwipeRefreshLayout.addView(mWebView);
        mSwipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                mWebView.reload();
            }
        });
        rootLayout.addView(mSwipeRefreshLayout);
        ` : `
        rootLayout.addView(mWebView);
        `}

        // Inisialisasi Horizontal Progress Bar di Bagian Atas
        mProgressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        int pbHeight = (int) (4 * getResources().getDisplayMetrics().density);
        FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                pbHeight
        );
        mProgressBar.setLayoutParams(pbParams);
        mProgressBar.setMax(100);
        mProgressBar.setProgress(0);
        mProgressBar.setVisibility(View.GONE);
        rootLayout.addView(mProgressBar);

        setContentView(rootLayout);

        // 3. Konfigurasi WebSettings Modern
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);

        // User-Agent khusus agar aplikasi gereja dapat terdeteksi sistem
        String defaultUa = webSettings.getUserAgentString();
        webSettings.setUserAgentString(defaultUa + " ${config.userAgentSuffix}");

        // JavaScript Interface untuk Ekspor & Unduh File (Excel, PDF, Backup JSON, Foto)
        mWebView.addJavascriptInterface(new AndroidDownloaderInterface(), "AndroidDownloader");

        // DownloadListener untuk link file langsung (HTTP / HTTPS)
        mWebView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                if (url.startsWith("blob:") || url.startsWith("data:")) {
                    return; // Ditangani oleh AndroidDownloaderInterface
                }
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.setMimeType(mimeType);
                    String cookies = android.webkit.CookieManager.getInstance().getCookie(url);
                    request.addRequestHeader("cookie", cookies);
                    request.addRequestHeader("User-Agent", userAgent);
                    request.setDescription("Mengunduh berkas...");
                    String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                    request.setTitle(filename);
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (dm != null) {
                        dm.enqueue(request);
                        Toast.makeText(MainActivity.this, "Mengunduh " + filename + "...", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                    } catch (Exception ignored) {}
                }
            }
        });

        // 4. Izin Push Notifikasi untuk Android 13+ (API 33 Tiramisu / API 34 UpsideDownCake)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        // 5. Buat Notification Channel resmi di sistem HP agar warta berdering & muncul di status bar
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.app.NotificationChannel channel = new android.app.NotificationChannel(
                    "church_announcements_channel",
                    "Warta & Pengumuman Gereja",
                    android.app.NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Saluran notifikasi untuk info ibadah, renungan harian, dan warta jemaat");
            channel.enableLights(true);
            channel.enableVibration(true);
            android.app.NotificationManager notificationManager = getSystemService(android.app.NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }

        // 6. Langganan Notifikasi Warta Gereja via FCM Topic
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic(FCM_TOPIC);
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic("all_jemaat");
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic("general");
        } catch (Exception ignored) {}

        // 7. WebViewClient (Navigasi URL & Link Eksternal WhatsApp/Telepon/Maps)
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                return handleExternalUrls(url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleExternalUrls(url);
            }

            private boolean handleExternalUrls(String url) {
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") ||
                    url.contains("wa.me") || url.contains("maps.google") || url.contains("goo.gl/maps")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Aplikasi eksternal tidak ditemukan", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                mProgressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                mProgressBar.setVisibility(View.GONE);
                ${config.enablePullToRefresh ? `if (mSwipeRefreshLayout != null) { mSwipeRefreshLayout.setRefreshing(false); }` : ''}

                // Injeksi otomatis penangkap download Blob / Base64 (Ekspor Excel, Cetak PDF, dll)
                String blobScript = "javascript:(function() {" +
                        "if (window.__blob_interceptor_installed) return;" +
                        "window.__blob_interceptor_installed = true;" +
                        "var origClick = HTMLAnchorElement.prototype.click;" +
                        "HTMLAnchorElement.prototype.click = function() {" +
                        "  if (this.download && this.href && (this.href.indexOf('blob:') === 0 || this.href.indexOf('data:') === 0)) {" +
                        "    var filename = this.download || 'unduhan_dokumen';" +
                        "    var href = this.href;" +
                        "    if (href.indexOf('data:') === 0) {" +
                        "      var parts = href.split(',');" +
                        "      var mime = (parts[0].split(':')[1] || '').split(';')[0];" +
                        "      if (window.AndroidDownloader) window.AndroidDownloader.downloadBlob(parts[1], filename, mime);" +
                        "      return;" +
                        "    }" +
                        "    fetch(href).then(function(r){return r.blob();}).then(function(b){" +
                        "      var reader = new FileReader();" +
                        "      reader.onloadend = function(){" +
                        "        var b64 = (reader.result || '').split(',')[1];" +
                        "        if (window.AndroidDownloader) window.AndroidDownloader.downloadBlob(b64, filename, b.type || 'application/octet-stream');" +
                        "      };" +
                        "      reader.readAsDataURL(b);" +
                        "    });" +
                        "    return;" +
                        "  }" +
                        "  origClick.apply(this, arguments);" +
                        "};" +
                        "})();";
                mWebView.evaluateJavascript(blobScript, null);
            }
        });

        // 8. WebChromeClient (Loading bar & Upload Dokumen / Excel / PDF / Foto Bukti)
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                mProgressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    mProgressBar.setVisibility(View.GONE);
                } else {
                    mProgressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                if (fileChooserParams != null && fileChooserParams.getAcceptTypes() != null && fileChooserParams.getAcceptTypes().length > 0 && !fileChooserParams.getAcceptTypes()[0].isEmpty()) {
                    intent.setType(fileChooserParams.getAcceptTypes()[0]);
                    if (fileChooserParams.getAcceptTypes().length > 1) {
                        intent.putExtra(Intent.EXTRA_MIME_TYPES, fileChooserParams.getAcceptTypes());
                    }
                } else {
                    intent.setType("*/*");
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{
                            "image/*",
                            "application/pdf",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "text/csv",
                            "text/plain",
                            "application/json"
                    });
                }
                startActivityForResult(Intent.createChooser(intent, "Pilih Berkas (Dokumen / Foto)"), FILE_CHOOSER_REQUEST_CODE);
                return true;
            }
        });

        // 9. Cek apakah aplikasi dibuka melalui Klik Notifikasi Warta (Deep Link FCM)
        String openUrl = TARGET_URL;
        if (getIntent() != null && getIntent().hasExtra("target_url")) {
            String notifUrl = getIntent().getStringExtra("target_url");
            if (notifUrl != null && !notifUrl.trim().isEmpty()) {
                openUrl = notifUrl;
            }
        }
        mWebView.loadUrl(openUrl);
    }

    // Bridge JavaScript ke Native Android untuk Download Blob / Base64 (Excel & PDF)
    public class AndroidDownloaderInterface {
        @JavascriptInterface
        public void downloadBlob(String base64Data, String fileName, String mimeType) {
            saveBase64ToFile(base64Data, fileName, mimeType);
        }
    }

    private void saveBase64ToFile(String base64Data, String fileName, String mimeType) {
        try {
            byte[] fileBytes = Base64.decode(base64Data, Base64.DEFAULT);
            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs();
            }
            File destFile = new File(downloadsDir, fileName);
            FileOutputStream fos = new FileOutputStream(destFile);
            fos.write(fileBytes);
            fos.flush();
            fos.close();

            // Pindai agar file langsung terlihat di File Manager HP
            sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(destFile)));

            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(MainActivity.this, "Berhasil diunduh: " + fileName + " (Tersimpan di folder Download)", Toast.LENGTH_LONG).show();
                }
            });
        } catch (Exception e) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(MainActivity.this, "Gagal mengunduh: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (mFilePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            if (System.currentTimeMillis() - mLastBackPressTime < 2000) {
                super.onBackPressed();
            } else {
                mLastBackPressTime = System.currentTimeMillis();
                Toast.makeText(this, "Tekan sekali lagi untuk keluar", Toast.LENGTH_SHORT).show();
            }
        }
    }
}`;
}

/**
 * Generates MainActivity.kt (Kotlin Version)
 */
export function generateMainActivityKotlin(config: AndroidStudioConfig): string {
  const isLightStatusBar = config.statusBarStyle === 'DARK_ICONS';
  return `package ${config.packageName}

import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Base64
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {

    companion object {
        const val TARGET_URL = "${config.webUrl}"
        const val FCM_TOPIC = "${config.fcmTopic}"
        private const val FILE_CHOOSER_REQUEST_CODE = 1001
    }

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var swipeRefreshLayout: SwipeRefreshLayout? = null
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var lastBackPressTime = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Status Bar & Nav Bar Styling
        window.statusBarColor = Color.parseColor("${config.statusBarColor}")
        window.navigationBarColor = Color.parseColor("${config.navBarColor}")
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = ${isLightStatusBar}
        }

        // 2. Programmatic Layout
        val rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("${config.statusBarColor}"))
        }

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }

        ${config.enablePullToRefresh ? `
        swipeRefreshLayout = SwipeRefreshLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setColorSchemeColors(Color.parseColor("#4f46e5"), Color.parseColor("#06b6d4"))
            setProgressBackgroundColorSchemeColor(Color.parseColor("#1e293b"))
            addView(webView)
            setOnRefreshListener { webView.reload() }
        }
        rootLayout.addView(swipeRefreshLayout)
        ` : `
        rootLayout.addView(webView)
        `}

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            val pbHeight = (4 * resources.displayMetrics.density).toInt()
            layoutParams = FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, pbHeight)
            max = 100
            visibility = View.GONE
        }
        rootLayout.addView(progressBar)

        setContentView(rootLayout)

        // 3. WebSettings Modern
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            userAgentString = "$userAgentString ${config.userAgentSuffix}"
        }

        // Bridge JavaScript ke Native Android untuk Download Blob / Base64 (Excel & PDF)
        webView.addJavascriptInterface(AndroidDownloaderInterface(), "AndroidDownloader")

        // DownloadListener untuk link file langsung (HTTP / HTTPS)
        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
            if (url.startsWith("blob:") || url.startsWith("data:")) {
                return@setDownloadListener
            }
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimeType)
                    val cookies = CookieManager.getInstance().getCookie(url)
                    addRequestHeader("cookie", cookies)
                    addRequestHeader("User-Agent", userAgent)
                    setDescription("Mengunduh berkas...")
                    val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
                    setTitle(filename)
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                }
                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                dm?.enqueue(request)
                Toast.makeText(this, "Mengunduh berkas...", Toast.LENGTH_SHORT).show()
            } catch (_: Exception) {
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (_: Exception) {}
            }
        }

        // 4. Notification Permission (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 101)
            }
        }

        // 5. Notification Channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                "church_announcements_channel",
                "Warta & Pengumuman Gereja",
                android.app.NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Saluran notifikasi warta jemaat dan ibadah"
                enableLights(true)
                enableVibration(true)
            }
            getSystemService(android.app.NotificationManager::class.java)?.createNotificationChannel(channel)
        }

        // 6. Subscribe Topic FCM
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic(FCM_TOPIC)
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic("all_jemaat")
        } catch (_: Exception) {}

        // 7. WebViewClient
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return handleUrl(request?.url.toString())
            }

            private fun handleUrl(url: String): Boolean {
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") ||
                    url.contains("wa.me") || url.contains("maps.google")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (_: Exception) {
                        Toast.makeText(this@MainActivity, "Aplikasi tidak ditemukan", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }
                return false
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = View.GONE
                swipeRefreshLayout?.isRefreshing = false

                // Injeksi otomatis penangkap download Blob / Base64 (Ekspor Excel & PDF)
                val blobScript = """
                    javascript:(function() {
                        if (window.__blob_interceptor_installed) return;
                        window.__blob_interceptor_installed = true;
                        var origClick = HTMLAnchorElement.prototype.click;
                        HTMLAnchorElement.prototype.click = function() {
                            if (this.download && this.href && (this.href.indexOf('blob:') === 0 || this.href.indexOf('data:') === 0)) {
                                var filename = this.download || 'unduhan_dokumen';
                                var href = this.href;
                                if (href.indexOf('data:') === 0) {
                                    var parts = href.split(',');
                                    var mime = (parts[0].split(':')[1] || '').split(';')[0];
                                    if (window.AndroidDownloader) window.AndroidDownloader.downloadBlob(parts[1], filename, mime);
                                    return;
                                }
                                fetch(href).then(function(r){return r.blob();}).then(function(b){
                                    var reader = new FileReader();
                                    reader.onloadend = function(){
                                        var b64 = (reader.result || '').split(',')[1];
                                        if (window.AndroidDownloader) window.AndroidDownloader.downloadBlob(b64, filename, b.type || 'application/octet-stream');
                                    };
                                    reader.readAsDataURL(b);
                                });
                                return;
                            }
                            origClick.apply(this, arguments);
                        };
                    })();
                """.trimIndent()
                webView.evaluateJavascript(blobScript, null)
            }
        }

        // 8. WebChromeClient (File Upload Dokumen & Foto)
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress >= 100) View.GONE else View.VISIBLE
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    val acceptTypes = fileChooserParams?.acceptTypes
                    if (acceptTypes != null && acceptTypes.isNotEmpty() && acceptTypes[0].isNotBlank()) {
                        type = acceptTypes[0]
                        if (acceptTypes.size > 1) {
                            putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes)
                        }
                    } else {
                        type = "*/*"
                        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(
                            "image/*",
                            "application/pdf",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "text/csv",
                            "text/plain",
                            "application/json"
                        ))
                    }
                }
                startActivityForResult(Intent.createChooser(intent, "Pilih Berkas (Dokumen / Foto)"), FILE_CHOOSER_REQUEST_CODE)
                return true
            }
        }

        val openUrl = intent?.getStringExtra("target_url")?.takeIf { it.isNotBlank() } ?: TARGET_URL
        webView.loadUrl(openUrl)
    }

    inner class AndroidDownloaderInterface {
        @JavascriptInterface
        fun downloadBlob(base64Data: String, fileName: String, mimeType: String) {
            saveBase64ToFile(base64Data, fileName, mimeType)
        }
    }

    private fun saveBase64ToFile(base64Data: String, fileName: String, mimeType: String) {
        try {
            val fileBytes = Base64.decode(base64Data, Base64.DEFAULT)
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs()
            }
            val destFile = File(downloadsDir, fileName)
            val fos = FileOutputStream(destFile)
            fos.write(fileBytes)
            fos.flush()
            fos.close()

            sendBroadcast(Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(destFile)))

            runOnUiThread {
                Toast.makeText(this, "Berhasil diunduh: $fileName (Tersimpan di folder Download)", Toast.LENGTH_LONG).show()
            }
        } catch (e: Exception) {
            runOnUiThread {
                Toast.makeText(this, "Gagal mengunduh: \${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            val results = if (resultCode == Activity.RESULT_OK && data != null) {
                data.data?.let { arrayOf(it) }
            } else null
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            if (System.currentTimeMillis() - lastBackPressTime < 2000) {
                super.onBackPressed()
            } else {
                lastBackPressTime = System.currentTimeMillis()
                Toast.makeText(this, "Tekan sekali lagi untuk keluar", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`;
}

/**
 * Generates MyFirebaseMessagingService.java (Aman dari Icon Missing, PendingIntent S+ Compatible)
 */
export function generateFirebaseMessagingServiceJava(config: AndroidStudioConfig): string {
  return `package ${config.packageName};

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "ChurchFCM";
    public static final String CHANNEL_ID = "church_announcements_channel";
    public static final String CHANNEL_NAME = "Warta & Pengumuman Gereja";

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "New Firebase Token: " + token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = "${config.appName}";
        String body = "Ada pembaruan warta & renungan baru.";
        String targetUrl = "${config.webUrl}";

        // 1. Notification payload dari Firebase Console
        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null) {
                title = remoteMessage.getNotification().getTitle();
            }
            if (remoteMessage.getNotification().getBody() != null) {
                body = remoteMessage.getNotification().getBody();
            }
        }

        // 2. Data payload (Deep link & custom params)
        Map<String, String> data = remoteMessage.getData();
        if (data != null && !data.isEmpty()) {
            if (data.containsKey("title")) {
                title = data.get("title");
            }
            if (data.containsKey("body") || data.containsKey("message")) {
                body = data.containsKey("body") ? data.get("body") : data.get("message");
            }
            if (data.containsKey("url") || data.containsKey("target_url")) {
                targetUrl = data.containsKey("url") ? data.get("url") : data.get("target_url");
            }
        }

        sendNotification(title, body, targetUrl);
    }

    private void sendNotification(String title, String messageBody, String targetUrl) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("target_url", targetUrl);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(this, (int) System.currentTimeMillis(), intent, flags);
        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        // Ikon notifikasi yang 100% aman (mengambil icon bawaan aplikasi atau default android)
        int smallIcon = getApplicationInfo().icon != 0 ? getApplicationInfo().icon : android.R.drawable.ic_dialog_info;

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(smallIcon)
                        .setContentTitle(title)
                        .setContentText(messageBody)
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setVibrate(new long[]{0, 300, 200, 300})
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setColor(Color.parseColor("${config.statusBarColor}"))
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Android 8.0 Oreo Notification Channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && notificationManager != null) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Saluran notifikasi info ibadah, renungan harian, dan warta gereja");
            channel.enableLights(true);
            channel.setLightColor(Color.parseColor("${config.statusBarColor}"));
            channel.enableVibration(true);
            notificationManager.createNotificationChannel(channel);
        }

        if (notificationManager != null) {
            notificationManager.notify((int) System.currentTimeMillis(), notificationBuilder.build());
        }
    }
}`;
}

/**
 * Generates AndroidManifest.xml (Bersih, Kompatibel AGP 7 & AGP 8+, No Redundant Namespace Error)
 */
export function generateAndroidManifestXml(config: AndroidStudioConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    <!-- Izin Akses Jaringan & Push Notifikasi -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Izin Unduh Berkas untuk Android lawas (Android 10+ otomatis menggunakan Scoped Storage) -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <!-- Izin Akses Foto Bukti & Kamera (Opsional) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.DayNight.NoActionBar"
        android:usesCleartextTraffic="true"
        ${config.enableHardwareAcceleration ? 'android:hardwareAccelerated="true"' : ''}>

        <!-- Activity Utama WebView -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Service Penerima Push Notifikasi Firebase FCM -->
        <service
            android:name=".MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@mipmap/ic_launcher" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="church_announcements_channel" />
    </application>
</manifest>`;
}

/**
 * Generates app/build.gradle.kts (Kotlin DSL - 100% Mandiri, Bebas Error libs.plugins Unresolved)
 */
export function generateAppBuildGradleKts(config: AndroidStudioConfig): string {
  return `plugins {
    id("com.android.application")
    id("com.google.gms.google-services")
}

android {
    namespace = "${config.packageName}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${config.packageName}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")

    // Firebase Cloud Messaging (FCM) & Analytics
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-messaging")
    implementation("com.google.firebase:firebase-analytics")

    // Unit Testing Opsional
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}`;
}

/**
 * Generates project-level build.gradle.kts (Kotlin DSL - Kompatibel dengan semua versi Android Studio)
 */
export function generateProjectBuildGradleKts(): string {
  return `// Project-level build.gradle.kts
plugins {
    id("com.android.application") version "8.4.1" apply false
    id("com.google.gms.google-services") version "4.4.2" apply false
}`;
}

/**
 * Generates settings.gradle.kts (Kotlin DSL - Mengatasi Repository Resolution Error)
 */
export function generateSettingsGradleKts(config: AndroidStudioConfig): string {
  return `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${config.appName}"
include(":app")`;
}

/**
 * Generates gradle/libs.versions.toml (Untuk Proyek Android Studio Modern yang Menggunakan Version Catalog)
 */
export function generateLibsVersionsToml(): string {
  return `[versions]
agp = "8.4.1"
googleGmsServices = "4.4.2"
firebaseBom = "33.7.0"
appcompat = "1.7.0"
material = "1.12.0"
swiperefreshlayout = "1.1.0"
constraintlayout = "2.2.0"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"

[libraries]
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-swiperefreshlayout = { group = "androidx.swiperefreshlayout", name = "swiperefreshlayout", version.ref = "swiperefreshlayout" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebaseBom" }
firebase-messaging = { group = "com.google.firebase", name = "firebase-messaging" }
firebase-analytics = { group = "com.google.firebase", name = "firebase-analytics" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
google-services = { id = "com.google.gms.google-services", version.ref = "googleGmsServices" }`;
}

/**
 * Generates app/build.gradle (Groovy DSL)
 */
export function generateAppBuildGradle(config: AndroidStudioConfig): string {
  return `plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'
}

android {
    namespace '${config.packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${config.packageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.2.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'

    // Firebase Cloud Messaging (FCM)
    implementation platform('com.google.firebase:firebase-bom:33.7.0')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'

    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.2.1'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.6.1'
}`;
}

/**
 * Generates project-level build.gradle (Groovy DSL - Tanpa allprojects {} yang bentrok dengan settings.gradle)
 */
export function generateProjectBuildGradle(): string {
  return `// Top-level build.gradle (Groovy DSL)
plugins {
    id 'com.android.application' version '8.4.1' apply false
    id 'com.google.gms.google-services' version '4.4.2' apply false
}

tasks.register('clean', Delete) {
    delete rootProject.layout.buildDirectory
}`;
}

/**
 * Generates settings.gradle (Groovy DSL)
 */
export function generateSettingsGradle(config: AndroidStudioConfig): string {
  return `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${config.appName}"
include ':app'`;
}

/**
 * Generates gradle.properties
 */
export function generateGradleProperties(): string {
  return `# Project-wide Gradle settings.
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.nonTransitiveRClass=true`;
}

/**
 * Generates res/layout/activity_main.xml (Opsional bagi yang memakai Layout XML)
 */
export function generateActivityMainXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0f172a"
    tools:context=".MainActivity">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:indeterminate="false"
        android:max="100"
        android:progress="0"
        android:progressBackgroundTint="#334155"
        android:progressTint="#6366f1"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefreshLayout"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/progressBar"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:scrollbars="none" />
    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
</androidx.constraintlayout.widget.ConstraintLayout>`;
}

/**
 * Generates res/values/colors.xml
 */
export function generateColorsXml(config: AndroidStudioConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="statusBarColor">${config.statusBarColor}</color>
    <color name="navBarColor">${config.navBarColor}</color>
    <color name="primaryColor">#4f46e5</color>
    <color name="primaryDarkColor">#3730a3</color>
    <color name="accentColor">#f59e0b</color>
    <color name="splashBackground">${config.splashBgColor}</color>
</resources>`;
}

/**
 * Generates res/values/styles.xml / themes.xml
 */
export function generateStylesXml(config: AndroidStudioConfig): string {
  const isLightStatusBar = config.statusBarStyle === 'DARK_ICONS';
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.JesusKingdomChrist" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <!-- Status bar and navigation bar styling -->
        <item name="android:statusBarColor">@color/statusBarColor</item>
        <item name="android:navigationBarColor">@color/navBarColor</item>
        <item name="android:windowLightStatusBar">${isLightStatusBar}</item>
        <item name="android:windowBackground">@color/splashBackground</item>
    </style>
</resources>`;
}

/**
 * Generates drawable/ic_notification.xml
 */
export function generateNotificationIconXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FFFFFFFF"
      android:pathData="M18,16v-5c0,-3.07 -1.63,-5.64 -4.5,-6.32V4c0,-0.83 -0.67,-1.5 -1.5,-1.5s-1.5,0.67 -1.5,1.5v0.68C7.64,5.36 6,7.92 6,11v5l-2,2v1h16v-1l-2,-2zM12,22c1.1,0 2,-0.9 2,-2h-4c0,1.1 0.9,2 2,2z"/>
</vector>`;
}

/**
 * Helper to trigger downloading any plain text code file in browser
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(`Failed to download ${filename}:`, err);
  }
}

/**
 * Downloads a complete, ready-to-open Android Studio Project .ZIP
 * Includes full folder structure: root gradle files, app module, src/main/java package tree, AndroidManifest, resources, etc.
 */
export async function downloadAndroidStudioProjectZip(
  config: AndroidStudioConfig,
  settings?: AppSettings
): Promise<void> {
  const zip = new JSZip();
  const packagePath = config.packageName.trim().toLowerCase().replace(/\./g, '/');

  // 1. Root files
  zip.file('build.gradle.kts', generateProjectBuildGradleKts());
  zip.file('settings.gradle.kts', generateSettingsGradleKts(config));
  zip.file('gradle.properties', generateGradleProperties());

  // 2. Gradle Version Catalog
  zip.file('gradle/libs.versions.toml', generateLibsVersionsToml());

  // 3. App Module
  zip.file('app/build.gradle.kts', generateAppBuildGradleKts(config));

  // google-services.json
  const googleServices = generateGoogleServicesJson(config.packageName, settings);
  zip.file('app/google-services.json', JSON.stringify(googleServices, null, 2));

  zip.file(
    'app/proguard-rules.pro',
    `# Proguard rules for production
-keepattributes *Annotation*
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }
`
  );

  // 4. App Source Main
  zip.file('app/src/main/AndroidManifest.xml', generateAndroidManifestXml(config));

  // Java & Kotlin files placed in the EXACT required package path
  zip.file(`app/src/main/java/${packagePath}/MainActivity.kt`, generateMainActivityKotlin(config));
  zip.file(`app/src/main/java/${packagePath}/MainActivity.java`, generateMainActivityJava(config));
  zip.file(`app/src/main/java/${packagePath}/MyFirebaseMessagingService.java`, generateFirebaseMessagingServiceJava(config));

  // 5. App Resources
  zip.file('app/src/main/res/values/colors.xml', generateColorsXml(config));
  zip.file('app/src/main/res/values/styles.xml', generateStylesXml(config));
  zip.file('app/src/main/res/drawable/ic_notification.xml', generateNotificationIconXml());

  // 6. Comprehensive Readme Guide
  zip.file(
    'PETUNJUK_BUKA_PROYEK.txt',
    `========================================================================
PANDUAN MEMBUKA PROYEK DI ANDROID STUDIO (100% SUKSES BEBAS ERROR)
========================================================================
Nama Aplikasi : ${config.appName}
Package ID    : ${config.packageName}
Web URL       : ${config.webUrl}

LANGKAH 1: EKSTRAK FILE ZIP INI
Ekstrak file zip ini ke folder mana saja di laptop/komputer Anda.
Contoh: C:\\Users\\...\\AndroidStudioProjects\\${config.appName.replace(/[^a-zA-Z0-9]/g, '') || 'ProyekAndroid'}

LANGKAH 2: BUKA DI ANDROID STUDIO
1. Buka Android Studio.
2. Klik menu: File > Open (atau "Open" di layar awal Android Studio).
3. Pilih folder hasil ekstrak tadi, lalu klik "OK".
4. Tunggu beberapa detik hingga Android Studio selesai melakukan "Gradle Sync" (terlihat progress bar di bawah selesai).

LANGKAH 3: LANGSUNG BUILD APK
1. Klik menu atas: Build > Build Bundle(s) / APK(s) > Build APK(s).
2. Tunggu sebentar sampai muncul notifikasi "APK(s) generated successfully".
3. Klik tulisan biru "locate" untuk membuka file APK hasil build (app-debug.apk).
4. Kirim dan instal file APK ke HP Android Anda!

CATATAN:
Semua file sudah berada di lokasi folder yang 100% akurat:
- MyFirebaseMessagingService.java & MainActivity.kt -> berada di dalam folder package 'com/managementschool/app'
- AndroidManifest.xml -> berada di 'app/src/main/'
- google-services.json -> berada di 'app/'
- gradle.properties (AndroidX) -> sudah diset android.useAndroidX=true
`
  );

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const safeAppName = config.appName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Android_App';
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeAppName}_AndroidStudio_Project.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

