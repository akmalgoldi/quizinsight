# QuizInsight 🤖📝

**QuizInsight** adalah aplikasi kuis interaktif yang dirancang untuk membantu dosen mengevaluasi tingkat pemahaman mahasiswa secara cepat setelah perkuliahan. Aplikasi ini tidak hanya menyajikan nilai akhir, melainkan juga memetakan akurasi jawaban per topik perkuliahan serta menyajikan analisis naratif otomatis menggunakan Kecerdasan Buatan (AI Insight).

---

## 🚀 Fitur Utama

### 👨‍🏫 Fitur Dosen (Lecturer)
1. **Autentikasi Mandiri**: Registrasi dan login khusus Dosen.
2. **Manajemen Kuis (CRUD)**: Membuat kuis baru, mengedit, dan menghapusnya. Setiap kuis otomatis menghasilkan **Kode Akses Unik** (misal: `QZ-A12BC`).
3. **Manajemen Soal & Topik**: Menambahkan soal pilihan ganda dengan 4 opsi, menentukan kunci jawaban, serta melabeli setiap soal dengan **Topik Bahasan** (contoh: *Entropy*, *Information Gain*).
4. **Dashboard Analitis Real-time**:
   * Total partisipan kuis.
   * Nilai rata-rata, tertinggi, dan terendah kelas.
   * Tingkat akurasi jawaban mahasiswa yang dikelompokkan berdasarkan **Topik Bahasan** (Visual Progress Bar).
   * Daftar soal yang paling sering salah dijawab.
   * Tabel detail riwayat nilai mahasiswa.
5. **AI Insight & Rekomendasi Pedagogis**: Menghasilkan analisis naratif otomatis mengenai kelebihan/kekurangan pemahaman kelas serta rekomendasi topik materi yang perlu diulang sebelum berpindah bab.

### 🎓 Fitur Mahasiswa (Student)
1. **Autentikasi Mandiri**: Login khusus Mahasiswa.
2. **Gabung Kuis**: Masuk ke lembar kuis dengan menginputkan **Kode Akses Kuis**.
3. **Lembar Ujian Interaktif**: Menjawab soal pilihan ganda dengan status pelacakan soal yang sudah/belum dijawab.
4. **Keamanan Jawaban**: Opsi kunci jawaban disembunyikan (*sanitized*) dari browser mahasiswa untuk mencegah kebocoran jawaban.
5. **Hasil Instan**: Melihat skor pengerjaan (skala 100) dan rincian jumlah jawaban yang benar/salah secara langsung setelah submit.

---

## 🛠️ Tech Stack & Arsitektur

* **Framework**: Next.js 16 (App Router)
* **Database**: SQLite (Local database file `dev.db` untuk kemudahan jalankan lokal)
* **ORM**: Prisma 7 (Menggunakan driver adapter `better-sqlite3` sesuai standar Next.js & Rust-free engine baru)
* **Autentikasi**: Custom JWT Session (HTTP-Only Cookie) - 100% aman dan kompatibel dengan Edge Runtime/Proxy.
* **AI Engine**: OpenAI API / IBM Granite (dengan fallback analitis rule-based jika API key kosong)
* **Styling**: Vanilla CSS (Premium dark mode UI dengan Outfit & Plus Jakarta Sans typography, glassmorphism, dan micro-animations).

---

## 📦 Cara Menjalankan Proyek

Ikuti langkah-langkah berikut untuk menjalankan QuizInsight di komputer lokal Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js** (Versi 18 ke atas recommended).

### 2. Instalasi Dependensi
Jalankan perintah berikut di terminal:
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
File `.env` sudah dikonfigurasikan di root folder:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="quizinsight_secret_key_12345678"
OPENAI_API_KEY="mock_key"
```
*Jika Anda ingin menggunakan analisis AI OpenAI yang sebenarnya, ganti `mock_key` dengan **OpenAI API Key** Anda yang valid.*

### 4. Menjalankan Database (Prisma)
Migrasi skema database relasional ke SQLite lokal Anda:
```bash
npx prisma generate
```
*(Database `dev.db` sudah terbuat dan siap digunakan. Jika ingin mereset atau menyelaraskan ulang skema di lain waktu, Anda bisa menjalankan `npx prisma db push`).*

### 5. Jalankan Development Server
Start aplikasi Next.js Anda:
```bash
npm run dev
```
Buka browser Anda di: [http://localhost:3000](http://localhost:3000)

---

## 💡 Panduan Uji Coba Alur Aplikasi

Untuk menguji seluruh fitur end-to-end (MVP):
1. **Daftarkan Akun Dosen**: Pergi ke halaman Daftar, pilih peran **Dosen**, lalu daftarkan email & password Anda.
2. **Buat Kuis**: Masuk sebagai Dosen, klik tombol **Buat Kuis Baru**, isi nama kuis (misal: *Latihan Machine Learning Dasar*).
3. **Tambahkan Soal**: Klik **Kelola Soal** pada kuis tersebut. Tambahkan beberapa soal pilihan ganda, isi topik per soal (misal: *Entropy* untuk soal 1 & 2, *Decision Tree* untuk soal 3), tentukan pilihan jawaban, tandai radio button untuk jawaban yang benar, lalu klik **Simpan Soal**.
4. **Salin Kode Kuis**: Salin kode akses unik kuis di dashboard dosen (misal: `QZ-K8B92`).
5. **Daftarkan Akun Mahasiswa**: Logout dari akun Dosen, buka halaman Daftar, pilih peran **Mahasiswa**, daftarkan akun baru, lalu login.
6. **Kerjakan Kuis**: Pada dashboard Mahasiswa, tempelkan Kode Akses Kuis tadi, klik **Gabung & Kerjakan Kuis**. Jawab soal-soal tersebut, lalu klik **Kirim Kuis**.
7. **Lihat Hasil Mahasiswa**: Mahasiswa akan langsung diarahkan ke halaman skor evaluasi lengkap beserta daftar soal benar/salah.
8. **Lihat Dashboard Analisis Dosen**: Logout dari Mahasiswa, masuk kembali sebagai Dosen. Klik **Analisis AI** pada kuis terkait. Anda akan disajikan dashboard analitis lengkap beserta visualisasi akurasi per topik (*Entropy* vs *Decision Tree*), serta teks **AI Insight** yang merangkum hasil belajar kelas Anda.
