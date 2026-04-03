import { create } from 'zustand';

export type Language = 'en' | 'id';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Gold Analysis',
    'header.overlays': 'Overlays',

    // Tabs
    'tab.prediction': 'AI Prediction',
    'tab.simulator': 'Simulator',
    'tab.telegram': 'Telegram & Alerts',
    'tab.technical': 'Technical',
    'tab.fundamental': 'Fundamental',
    'tab.news': 'News',
    'tab.calendar': 'Calendar',
    'tab.correlation': 'Correlation',
    'tab.experts': 'Experts',

    // Simulator
    'sim.title': 'Trading Simulator',
    'sim.speed': 'Simulation Speed',
    'sim.volatility': 'Volatility',
    'sim.currentPrice': 'Current Price',
    'sim.noPositions': 'No open positions',
    'sim.startFirst': 'Start the simulation and place your first order!',
    'sim.tradeHistory': 'Trade History',
    'sim.slBelowBuy': 'Stop Loss must be below current price for BUY',
    'sim.tpAboveBuy': 'Take Profit must be above current price for BUY',
    'sim.slAboveSell': 'Stop Loss must be above current price for SELL',
    'sim.tpBelowSell': 'Take Profit must be below current price for SELL',

    // Price Alerts
    'alerts.title': 'Price Alerts',
    'alerts.targetPrice': 'Target Price ($)',
    'alerts.condition': 'Condition',
    'alerts.above': 'Above',
    'alerts.below': 'Below',
    'alerts.quick': 'Quick:',
    'alerts.message': 'Alert message (optional)',
    'alerts.add': 'Add',
    'alerts.active': 'Active',
    'alerts.triggered': 'Triggered',
    'alerts.noActive': 'No active alerts',
    'alerts.invalidPrice': 'Invalid price',
    'alerts.created': 'Alert Created',
    'alerts.fromCurrent': 'from current price',

    // Telegram
    'telegram.title': 'Telegram Settings',
    'telegram.connected': 'Connected',
    'telegram.step1Title': 'Step 1: Start the Telegram Bot',
    'telegram.step1Desc': 'Click the button below to open the bot in Telegram, then press Start.',
    'telegram.openBot': 'Open Bot in Telegram',
    'telegram.copyLink': 'Copy Link',
    'telegram.step2Title': 'Step 2: Get Your Chat ID',
    'telegram.step2Desc': 'How to get your Chat ID:',
    'telegram.step2_1': 'Open @userinfobot in Telegram',
    'telegram.step2_2': 'Press Start — the bot will reply with your info',
    'telegram.step2_3': 'Copy the Id number (e.g. 123456789)',
    'telegram.step2_4': 'Paste it in the field below',
    'telegram.step2Group': 'For groups: add @userinfobot to the group, send /start, then copy the Group ID (starts with -100...).',
    'telegram.chatIdPlaceholder': 'e.g. 123456789 or -100123456789',
    'telegram.save': 'Save',
    'telegram.step3Title': 'Step 3: Test Connection',
    'telegram.sendTest': 'Send Test Message',
    'telegram.sending': 'Sending...',
    'telegram.disconnect': 'Disconnect',
    'telegram.notifTypes': 'Notifications you will receive:',
    'telegram.notif1': 'Significant price movements',
    'telegram.notif2': 'Take Profit reached',
    'telegram.notif3': 'Stop Loss reached',
    'telegram.notif4': 'Price alert triggered',
    'telegram.notif5': 'New trading signals',
    'telegram.notif6': 'Simulator order executions',
    'telegram.emptyChatId': 'Chat ID is empty',
    'telegram.enterChatId': 'Enter your Telegram Chat ID or Group ID',
    'telegram.savedSuccess': 'Telegram Connected!',
    'telegram.testSent': 'Test message sent!',
    'telegram.checkTelegram': 'Check your Telegram',
    'telegram.testFailed': 'Failed to send',
    'telegram.testFailedDesc': 'Make sure Chat ID is correct and the bot has been started',
    'telegram.disconnected': 'Telegram disconnected',
    'telegram.linkCopied': 'Bot link copied!',
    'telegram.enterFirst': 'Enter Chat ID first',

    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.displayName': 'Display Name',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.logout': 'Sign Out',
    'auth.welcome': 'Welcome to Gold Analysis',
    'auth.subtitle': 'Sign in to save your alerts, settings, and receive notifications even when offline.',
    'auth.checkEmail': 'Check your email',
    'auth.checkEmailDesc': 'We sent you a confirmation link. Please verify your email to sign in.',

    // Correlated Assets
    'corr.reasoning': 'Analysis',

    // Footer
    'footer.line1': 'Data powered by GoldAPI.io. AI predictions are for informational purposes only.',
    'footer.line2': 'Not financial advice. Always do your own research before trading.',

    // Language
    'lang.switch': 'Language',
  },
  id: {
    // Header
    'app.title': 'Analisis Emas',
    'header.overlays': 'Overlay',

    // Tabs
    'tab.prediction': 'Prediksi AI',
    'tab.simulator': 'Simulator',
    'tab.telegram': 'Telegram & Alert',
    'tab.technical': 'Teknikal',
    'tab.fundamental': 'Fundamental',
    'tab.news': 'Berita',
    'tab.calendar': 'Kalender',
    'tab.correlation': 'Korelasi',
    'tab.experts': 'Pakar',

    // Simulator
    'sim.title': 'Simulator Trading',
    'sim.speed': 'Kecepatan Simulasi',
    'sim.volatility': 'Volatilitas',
    'sim.currentPrice': 'Harga Saat Ini',
    'sim.noPositions': 'Belum ada posisi terbuka',
    'sim.startFirst': 'Mulai simulasi dan buka order pertama!',
    'sim.tradeHistory': 'Riwayat Trading',
    'sim.slBelowBuy': 'Stop Loss harus di bawah harga saat ini untuk BUY',
    'sim.tpAboveBuy': 'Take Profit harus di atas harga saat ini untuk BUY',
    'sim.slAboveSell': 'Stop Loss harus di atas harga saat ini untuk SELL',
    'sim.tpBelowSell': 'Take Profit harus di bawah harga saat ini untuk SELL',

    // Price Alerts
    'alerts.title': 'Peringatan Harga',
    'alerts.targetPrice': 'Target Harga ($)',
    'alerts.condition': 'Kondisi',
    'alerts.above': 'Di Atas',
    'alerts.below': 'Di Bawah',
    'alerts.quick': 'Cepat:',
    'alerts.message': 'Pesan alert (opsional)',
    'alerts.add': 'Tambah',
    'alerts.active': 'Aktif',
    'alerts.triggered': 'Terpicu',
    'alerts.noActive': 'Belum ada alert aktif',
    'alerts.invalidPrice': 'Harga tidak valid',
    'alerts.created': 'Alert Dibuat',
    'alerts.fromCurrent': 'dari harga saat ini',

    // Telegram
    'telegram.title': 'Pengaturan Telegram',
    'telegram.connected': 'Terhubung',
    'telegram.step1Title': 'Langkah 1: Mulai Bot Telegram',
    'telegram.step1Desc': 'Klik tombol di bawah untuk membuka bot di Telegram, lalu tekan Start.',
    'telegram.openBot': 'Buka Bot di Telegram',
    'telegram.copyLink': 'Copy Link',
    'telegram.step2Title': 'Langkah 2: Dapatkan Chat ID',
    'telegram.step2Desc': 'Cara mendapatkan Chat ID:',
    'telegram.step2_1': 'Buka @userinfobot di Telegram',
    'telegram.step2_2': 'Tekan Start — bot akan membalas info kamu',
    'telegram.step2_3': 'Copy angka Id yang muncul (contoh: 123456789)',
    'telegram.step2_4': 'Paste di kolom bawah ini',
    'telegram.step2Group': 'Untuk grup: tambahkan @userinfobot ke grup, kirim /start, lalu copy Group ID (mulai dengan -100...).',
    'telegram.chatIdPlaceholder': 'cth. 123456789 atau -100123456789',
    'telegram.save': 'Simpan',
    'telegram.step3Title': 'Langkah 3: Test Koneksi',
    'telegram.sendTest': 'Kirim Pesan Test',
    'telegram.sending': 'Mengirim...',
    'telegram.disconnect': 'Putuskan',
    'telegram.notifTypes': 'Notifikasi yang akan diterima:',
    'telegram.notif1': 'Harga naik/turun signifikan',
    'telegram.notif2': 'Take Profit tercapai',
    'telegram.notif3': 'Stop Loss tercapai',
    'telegram.notif4': 'Price alert terpicu',
    'telegram.notif5': 'Sinyal trading baru',
    'telegram.notif6': 'Order eksekusi simulator',
    'telegram.emptyChatId': 'Chat ID kosong',
    'telegram.enterChatId': 'Masukkan Chat ID atau Group ID Telegram',
    'telegram.savedSuccess': 'Telegram Terhubung!',
    'telegram.testSent': 'Pesan test terkirim!',
    'telegram.checkTelegram': 'Cek Telegram kamu',
    'telegram.testFailed': 'Gagal mengirim',
    'telegram.testFailedDesc': 'Pastikan Chat ID benar dan bot sudah di-start',
    'telegram.disconnected': 'Telegram terputus',
    'telegram.linkCopied': 'Link bot di-copy!',
    'telegram.enterFirst': 'Masukkan Chat ID dulu',

    // Auth
    'auth.login': 'Masuk',
    'auth.signup': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.displayName': 'Nama Tampilan',
    'auth.noAccount': 'Belum punya akun?',
    'auth.hasAccount': 'Sudah punya akun?',
    'auth.logout': 'Keluar',
    'auth.welcome': 'Selamat Datang di Analisis Emas',
    'auth.subtitle': 'Masuk untuk menyimpan alert, pengaturan, dan menerima notifikasi bahkan saat offline.',
    'auth.checkEmail': 'Cek email kamu',
    'auth.checkEmailDesc': 'Kami mengirim link konfirmasi. Silakan verifikasi email kamu untuk masuk.',

    // Correlated Assets
    'corr.reasoning': 'Analisis',

    // Footer
    'footer.line1': 'Data dari GoldAPI.io. Prediksi AI hanya untuk informasi.',
    'footer.line2': 'Bukan saran keuangan. Selalu lakukan riset sendiri sebelum trading.',

    // Language
    'lang.switch': 'Bahasa',
  },
};

export const useI18n = create<I18nStore>((set, get) => ({
  language: (localStorage.getItem('preferred_language') as Language) || 'en',
  setLanguage: (lang: Language) => {
    localStorage.setItem('preferred_language', lang);
    set({ language: lang });
  },
  t: (key: string) => {
    const { language } = get();
    return translations[language]?.[key] || translations.en[key] || key;
  },
}));
