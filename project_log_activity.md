# 📝 Log Aktivitas Proyek: Gold Analysis Platform
**Periode:** 21 Januari 2026 - Awal April 2026
**Tim Developer (6 Orang):** Habil (Project Leader), Johana, Shanty, Cristine, Nina, Nasywa.

*Catatan: Pola pengerjaan awal berupa rapat evaluasi seminggu sekali sebelum pertemuan kelas, kemudian di-*push* / dikebut secara intensif (sprint) pada 3 minggu terakhir menuju tenggat waktu.*

---

## 🗓️ Ringkasan Timeline Proyek

### 📌 Akhir Januari: Ide Awal & Momen Pivot
*(Rapat Seminggu Sekali)*
- **21 Jan** — Mulai *brainstorming* ide proyek (awalnya untuk IDX Stock Analyzer) dan mencari referensi data.
- **27 Jan** — Shanty, Nina, Johana membuat gambaran awal (*interface* mockup) untuk dasbor saham lokal (IDX). 
- **Keputusan Penting:** Setelah berdiskusi dan melihat keterbatasan API data lokal gratis, tim yang dipimpin oleh Habil sepakat melakukan **Pivot (Ubah Haluan)** dari IDX menjadi platform komoditas Emas (*Gold Only*).

### 📌 Februari: Re-desain UI & Setup Dasar
*(Rapat Seminggu Sekali)*
- Tim perlahan membangun pondasi proyek di React & Vite.
- Mengubah drastis desain antarmuka (*interface*) dari tema IDX menjadi tema "Gold" (menggunakan *Dark Mode* dan aksen emas).
- Johana & Cristine membuat kerangka dasar halaman, navigasi, dan komponen statis (Kartu Harga, Layout Tabel).

### 📌 Maret: Sprint Dimulai, Backend & Integrasi API
*(Mulai Intensif Menjelang 3 Minggu Terakhir)*
- Nasywa & Habil berhasil menyelesaikan masalah pembatasan API (CORS) menggunakan *Vercel Edge/Serverless Proxy* untuk menarik data harga SPOT dari Stooq.
- Tim memasukkan library `Recharts` menggunakan data historis Yahoo Finance.
- Habil bersama tim lainnya sukses mengakali *delay* data API dengan menanamkan algoritma simulasi *live-tick* 1 detik agar grafik bergerak lincah meniru bursa asli.

### 📌 Akhir Maret - Awal April (Tanggal 1 - 7): Finalisasi & Telegram
*(Ngebut Tiap Hari - Persiapan Presentasi)*
Pekerjaan akhir sangat padat berfokus pada fitur pelengkap dan Telegram:
- **Akhir Maret:** Cristine membuat logic *Expert Analysis* dan AI News yang bisa berubah (*dynamic*) bereaksi dengan pergerakan harga hari itu.
- **1-3 April:** Nasywa dan Johana memantapkan sumber data *live* dan fungsi alarm otomatis (*Price Alerts* dan limit *Trading Simulator*).
- **4-6 April:** Habil dan Johana menyelesaikan integrasi rumit pada Bot Telegram (menangani error CORS bot API, bug pembacaan `Chat_ID`, merapikan Token, dan *fallback/mock data*).
- **7 April:** Seluruh tim memastikan QA lulus (*responsive UI* stabil), *Deployment* akhir ke sistem cloud Vercel berjalan lancar, dan bersiap untuk presentasi Final!
