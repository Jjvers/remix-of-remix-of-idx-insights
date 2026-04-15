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

    // General UI
    'ui.live': 'Live',
    'ui.refresh': 'Refresh',

    // Time & Date
    'time.today': 'Today',
    'time.tomorrow': 'Tomorrow',

    // Trading Details
    'trade.target': 'Target',
    'trade.stop': 'Stop',
    'trade.accuracy': 'Accuracy',
    'trade.analysts': 'Analysts',
    'trade.impact': 'Impact',
    'trade.previous': 'Previous',
    'trade.forecast': 'Forecast',
    'trade.actual': 'Actual',
    'trade.reasoning': 'Analysis Rationale',

    // Categories
    'cat.all': 'All',
    'cat.market': 'Market',
    'cat.geopolitical': 'Geopolitical',
    'cat.macro': 'Macro',
    'cat.demand': 'Demand',

    // Analysis Terms
    'anal.bullish': 'Bullish',
    'anal.bearish': 'Bearish',
    'anal.neutral': 'Neutral',
    'anal.high': 'High',
    'anal.medium': 'Medium',
    'anal.low': 'Low',
    'anal.signal': 'Signal',
    'anal.probability': 'Probability',
    'anal.confidence': 'Confidence',
    'anal.riskReward': 'Risk/Reward',

    // Fundamental Details
    'fundamental.dxy.desc': 'Inverse correlation with gold',
    'fundamental.dxy.bullish': 'Dollar weakness supports gold prices',
    'fundamental.dxy.bearish': 'Dollar strength pressures gold',
    'fundamental.yield.desc': 'Opportunity cost for gold',
    'fundamental.yield.bearish': 'High yields increase gold holding cost',
    'fundamental.yield.bullish': 'Lower yields support gold as alternative',
    'fundamental.realYield.desc': 'Treasury yield minus inflation',
    'fundamental.realYield.bullish': 'Negative real yields are bullish for gold',
    'fundamental.realYield.bearish': 'High real yields compete with gold',
    'fundamental.vix.desc': 'Market volatility index',
    'fundamental.vix.bullish_high': 'Market fear drives safe-haven demand',
    'fundamental.vix.bullish_medium': 'Elevated uncertainty supports gold',
    'fundamental.vix.neutral': 'Low volatility reduces safe-haven appeal',
    'fundamental.gsRatio.desc': 'Historical average ~60',
    'fundamental.gsRatio.neutral': 'Elevated ratio may indicate silver undervaluation',
    'fundamental.gsRatio.bullish': 'Normal ratio suggests fair value',
    'fundamental.summary.bullish.title': 'Bullish Fundamental Backdrop',
    'fundamental.summary.bullish.desc': 'Current macro conditions favor gold prices. Weak USD and elevated uncertainty create a supportive environment.',
    'fundamental.summary.mixed.title': 'Mixed Fundamental Signals',
    'fundamental.summary.mixed.desc': 'Mixed signals from macro factors. Watch for changes in USD strength and inflation expectations.',
    'fundamental.summary.bearish.title': 'Bearish Fundamental Conditions',
    'fundamental.summary.bearish.desc': 'Headwinds from strong USD and high real yields. Gold faces challenges in current environment.',

    // Correlated Assets Details
    'corr.with_gold': 'Correlation w/ Gold',
    'corr.market_note': 'Market Note',
    'corr.tooltip': 'Assets correlated with gold. Leading indicators move before gold, and can be used as early signals to predict gold price movements.',

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

    // General UI
    'ui.live': 'Live',
    'ui.refresh': 'Segarkan',

    // Time & Date
    'time.today': 'Hari Ini',
    'time.tomorrow': 'Besok',

    // Trading Details
    'trade.target': 'Target',
    'trade.stop': 'Stop',
    'trade.accuracy': 'Akurasi',
    'trade.analysts': 'Analis',
    'trade.impact': 'Dampak',
    'trade.previous': 'Sebelumnya',
    'trade.forecast': 'Prediksi',
    'trade.actual': 'Aktual',
    'trade.reasoning': 'Rasio Analisis',

    // Categories
    'cat.all': 'Semua',
    'cat.market': 'Pasar',
    'cat.geopolitical': 'Geopolitik',
    'cat.macro': 'Makro',
    'cat.demand': 'Permintaan',

    // Analysis Terms
    'anal.bullish': 'Bullish',
    'anal.bearish': 'Bearish',
    'anal.neutral': 'Netral',
    'anal.high': 'Tinggi',
    'anal.medium': 'Sedang',
    'anal.low': 'Rendah',
    'anal.signal': 'Sinyal',
    'anal.probability': 'Probabilitas',
    'anal.confidence': 'Keyakinan',
    'anal.riskReward': 'Risiko/Hasil',

    // Fundamental Details (ID)
    'fundamental.dxy.desc': 'Korelasi terbalik dengan emas',
    'fundamental.dxy.bullish': 'Pelemahan Dolar mendukung harga emas',
    'fundamental.dxy.bearish': 'Penguatan Dolar menekan harga emas',
    'fundamental.yield.desc': 'Biaya peluang untuk memegang emas',
    'fundamental.yield.bearish': 'Bunga tinggi meningkatkan biaya simpan emas',
    'fundamental.yield.bullish': 'Bunga rendah mendukung emas sebagai alternatif',
    'fundamental.realYield.desc': 'Imbal hasil obligasi dikurangi inflasi',
    'fundamental.realYield.bullish': 'Suku bunga riil negatif sangat menguntungkan emas',
    'fundamental.realYield.bearish': 'Suku bunga riil tinggi bersaing dengan emas',
    'fundamental.vix.desc': 'Indeks volatilitas pasar',
    'fundamental.vix.bullish_high': 'Ketakutan pasar mendorong permintaan safe-haven',
    'fundamental.vix.bullish_medium': 'Ketidakpastian yang meningkat mendukung emas',
    'fundamental.vix.neutral': 'Volatilitas rendah mengurangi daya tarik safe-haven',
    'fundamental.gsRatio.desc': 'Rata-rata historis ~60',
    'fundamental.gsRatio.neutral': 'Rasio tinggi menunjukkan perak mungkin murah',
    'fundamental.gsRatio.bullish': 'Rasio normal menunjukkan nilai wajar',
    'fundamental.summary.bullish.title': 'Latar Belakang Fundamental Bullish',
    'fundamental.summary.bullish.desc': 'Kondisi makro saat ini mendukung harga emas. USD yang lemah dan ketidakpastian yang tinggi menciptakan lingkungan yang mendukung.',
    'fundamental.summary.mixed.title': 'Sinyal Fundamental Campuran',
    'fundamental.summary.mixed.desc': 'Sinyal campuran dari faktor makro. Perhatikan perubahan kekuatan USD dan ekspektasi inflasi.',
    'fundamental.summary.bearish.title': 'Kondisi Fundamental Bearish',
    'fundamental.summary.bearish.desc': 'Hambatan dari USD yang kuat dan imbal hasil riil yang tinggi. Emas menghadapi tantangan di lingkungan saat ini.',

    // Correlated Assets Details (ID)
    'corr.with_gold': 'Korelasi dengan Emas',
    'corr.market_note': 'Catatan Pasar',
    'corr.tooltip': 'Aset yang berkorelasi dengan emas. Indikator utama bergerak sebelum emas, dan dapat digunakan sebagai sinyal awal untuk memprediksi pergerakan harga emas.',
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
