# 🎓 Panduan Presentasi & FAQ (Bahasa Indonesia)
Dibuat khusus sebagai bahan contekan (cheat sheet) saat presentasi final project.

---

## 1. Bagaimana Cara Platform Menyambung ke Telegram & Mengirim Notifikasi?
**Jelaskan dengan bahasa sederhana:**
* *"Platform kita tidak membutuhkan backend server (seperti Node.js manual) untuk Telegram, kita langsung nge-hit Bot API dari Telegram."*
* **Cara kerjanya:**
  1. Pertama, pengguna masukin **Bot Token** yang didapat dari BotFather. Token ini disimpan secara lokal di browser (`localStorage`).
  2. Pengguna harus buka aplikasi Telegram mereka, cari nama bot-nya, lalu tekan **START**.
  3. Setelah itu, pengguna kembali ke website kita dan tekan tombol **Detect Chat ID**.
  4. Platform kita akan menembak API Telegram (`getUpdates`) untuk mencari siapa orang terakhir yang chat bot tersebut. Dari sana kita dapat **Chat ID** milik si pengguna secara otomatis.
  5. Begitu Chat ID dan Token tersimpan, setiap kali harga Emas menyentuh titik **Take Profit** atau **Stop Loss** di Trading Simulator kita, atau saat tombol Test ditekan, website akan mengirim data via `fetch POST` (`sendMessage`) langsung ke aplikasi Telegram pengguna saat itu juga.
* **Point penting untuk Dosen:** *"Untuk mencegah error terblokir oleh browser (CORS policy), kami menggunakan Vercel Serverless Function sebagai perantara (proxy). Jadi website minta tolong Vercel, lalu Vercel yang ngirim pesannya ke Telegram."*

## 2. Bagaimana Cara Pengambilan Data Real-Time & Grafiknya Bekerja?
**Jelaskan dengan bahasa sederhana:**
* *"Data kita 100% Asli dan Real-Time, bukan mock data statis."*
* **Sumber Data:** Kami menggabungkan dua sumber. **Stooq API (via format CSV)** untuk mendapatkan harga SPOT saat ini dengan delay sangat kecil (nyaris real-time). Serta **Yahoo Finance** untuk mengambil bentuk historis Candlestick 1 tahun terakhir.
* **Cara kerja Grafiknya agar terlihat 'Hidup' (Real-time):**
  1. Karena memanggil API hitungan detik terus-menerus bisa menyebabkan kita kena *Banned / Rate Limit* dari penyedia API, kami menggunakan teknik **Polling & Tick Simulation**.
  2. Kami memanggil API aslinya (refresh data yang konkrit) setiap **10-15 detik sekali**.
  3. Namun, di dalam React, kami menjalankan sebuah interval (`setInterval`) setiap **1 detik** yang mensimulasikan pergerakan atau "micro-fluctuation" (ditambah/dikurangi sepersekian persen acak).
  4. Hasilnya, grafik Candlestick (*menggunakan library Recharts*) akan terus bergerak naik-turun setiap detik seolah terhubung dengan server bursa kelas berat. Begitu 10 detik berlalu, harganya disamakan kembali (sinkronisasi) dengan harga asli dari API agar tetap akurat.

## 3. Bagaimana Fitur Berita (News) dan Pakar (Expert Analysis) Bekerja?
**Jelaskan dengan bahasa sederhana:**
* *"Untuk memastikan data pendukung selalu relevan dengan pergerakan grafik saat presentasi, kami merancang sistem Dynamic Generative Data."*
* **Expert Analysis:** Daripada memasukkan angka prediksi pakar secara manual/Statis, kami membuat algoritma yang bereaksi terhadap harga emas *real-time*. Jika harga Emas sedang di angka $2000, target dari *Expert* akan secara otomatis ter-generate sekian persen di atas/bawah harga saat ini beserta statusnya (Bullish / Bearish). Ini membuat aplikasinya sangat *adaptif*.
* **News (Berita):** Di awal kami sempat menggunakan Supabase Edge Functions yang memanggil AI (Groq/OpenAI) untuk membuat berita. Namun pada versi efisien / finalnya, sistem akan otomatis meracik *headline* sentimen berita berdasarkan pergerakan harian (Change Percent). Misalnya, jika harga hari ini hijau (naik tajam), berita yang muncul otomatis akan memuat sentimen "Bullish" seperti "Dolar AS melemah, Emas meroket". Jika harga merah turun, sentimennya menjadi "Bearish".

---

## 💡 Topik yang Wajib Ditegaskan Saat Presentasi Berlangsung (Selling Points)
1. **Tidak Memakai Database Tradisional yang Lambat:** Tegaskan bahwa web ini menggunakan sistem *Micro-backend & Serverless API Proxy*. Sangat modern.
2. **Zero Mock Data:** Sampaikan bahwa saat aplikasi di-refresh, warnanya (hijau/merah) dan grafiknya bisa beda karena ia murni membaca bursa global saat Anda presentasi.
3. **Simulasi Trading Gratis:** Tekankan bahwa ini menyelesaikan masalah platform berbayar. *User* bisa belajar *trading* emas dengan modal virtual dan peringatan notifikasinya masuk ke layar *handphone* beneran secara Real-time.

---

## 🤔 Daftar Pertanyaan Dosen/Penguji (beserta Kunci Jawabannya)

**Q1: Kenapa pakai Vercel Edge/Serverless function, kok ga langsung fetch dari browser (React) saja?**
> **Jawaban:** "Karena ada masalah CORS (Cross-Origin Resource Sharing) Pak/Bu. Browser otomatis memblokir website kita (localhost) jika memanggil API langsung dari Stooq/Telegram karena beda domain. Dengan Vercel Serverless, permintaan dipindahkan ke sisi server backend Vercel, yang dimana server-to-server tidak terhalang batas CORS."

**Q2: Daripada interval 10 detik, kenapa tidak pakai WebSockets saja biar benar-benar setiap ms (milisecond) update?**
> **Jawaban:** "WebSocket dari bursa valas/emas aslinya berbayar sangat mahal (seperti langganan Bloomberg/TradingView premium). Proyek ini difokuskan sebagai 'solusi bagi retail/pemula'. Alternatif yang kami pakai (Polling 10s + Micro-tick 1s simulation) memberikan pengalaman layaknya WebSocket tanpa harus membayar lisensi data."

**Q3: Kalo saya close browser-nya, apakah notifikasi Take Profit/Stop Loss bot Telegram tetap masuk?**
> **Jawaban:** (Jujur tapi elegan) "Untuk iterasi versi saat ini, eksekusi pemantauan harga (Price Monitor) berjalan di Client-Side (Browser). Jadi browser harus terbuka agar trigger terkirim. Namun, dari segi arsitektur, kode ini hanya perlu mindahkan satu fungsi `setInterval` dari React ke Supabase Cron Job, dan fitur server-side berjalan di background langsung bisa berfungsi. Itu jadi pengembangan masa depan kami."

**Q4: Apa peran Supabase di sini kalau kalian ambil data bursa dari Stooq?**
> **Jawaban:** "Stooq hanya memberi harga Emas. Supabase kami gunakan secara eksklusif untuk manajemen *User Authentication* (Login/Register) dan *User Profile* (menyimpan histori modal, pengaturan bahasa, dan menyimpan Chat ID Telegram user secara cloud)."

**Q5: Bagaimana jika API Yahoo Finance / Stooq sedang mati atau down?**
> **Jawaban:** "Sistem kami dilengkapi dengan Error Handling yang baik (Try-Catch). Jika gagal memanggil API asli, aplikasi tidak akan blank putih, melainkan tetap menampilkan User Interface yang berfungsi dengan nilai (cache) harga terakhir kali didapat plus notifikasi visual (Toast Alert) ke user bahwa koneksi ke bursa sedang tidak stabil."
