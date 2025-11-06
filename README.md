# LAPORAN DIRECTORS API
- Nama : Rusydi Jabir Alawfa
- Kelas : TRPL2D

## Deskripsi Proyek
Proyek ini merupakan implementasi API untuk mengelola data direktur film. API ini memungkinkan pengguna untuk melihat, menambahkan, mengedit, dan menghapus data direktur menggunakan database SQLite. API dibangun dengan Node.js dan Express.js dengan sistem otentikasi menggunakan JWT.

## Struktur File
- `server.js`: File utama aplikasi Express.js yang berisi semua endpoint Directors API
- `database.js`: Konfigurasi dan koneksi database SQLite untuk movie dan directors
- `directors.db`: File database untuk menyimpan data direktur
- `middleware/authMiddleware.js`: Middleware untuk otentikasi JWT

## Fitur Utama
- RESTful API endpoints lengkap untuk manajemen direktur (GET, POST, PUT, DELETE)
- Sistem otentikasi dan otorisasi menggunakan JWT
- Database SQLite untuk menyimpan data direktur
- Validasi input untuk memastikan data yang dimasukkan sesuai
- Penanganan error yang komprehensif

## Endpoint API Lengkap
- `GET /directors` - Mendapatkan semua data direktur
- `GET /directors/:id` - Mendapatkan data direktur berdasarkan ID
- `POST /directors` - Menambahkan direktur baru (memerlukan otentikasi)
- `PUT /directors/:id` - Memperbarui data direktur (memerlukan otentikasi)
- `DELETE /directors/:id` - Menghapus data direktur (memerlukan otentikasi)
- `POST /auth/director/register` - Registrasi akun untuk akses API
- `POST /auth/director/login` - Login untuk mendapatkan token JWT

## Skema Database
Tabel `directors`:
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `name` - TEXT (nama direktur)
- `birthYear` - INTEGER (tahun kelahiran direktur)

## Validasi Input
- Nama direktur wajib diisi
- Tahun kelahiran harus berupa angka antara 1800 dan tahun sekarang
- Endpoint POST, PUT, DELETE memerlukan token otentikasi yang valid

## Teknologi yang Digunakan
- Node.js
- Express.js
- SQLite
- JWT (JSON Web Token) untuk otentikasi
- Bcrypt untuk hashing password
- CORS middleware
- JavaScript

