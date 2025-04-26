# 📚 Sistem Peminjaman Buku Perpustakaan Digital

### 👥 Kelompok:
- Bagus Priambudi
- Humam Razzan Herditama
- Mochammad Aziiz Nugroho
- Syarif Imam Muslim

---

## 📌 Deskripsi Tugas

Sistem ini adalah **aplikasi peminjaman buku berbasis microservices** dengan frontend HTML+CSS+JS sederhana.

Terdiri dari 3 backend API:
- **User Service** (`localhost:5001`) → Mengelola data pengguna
- **Book Service** (`localhost:5002`) → Mengelola daftar buku
- **Borrow Service** (`localhost:5003`) → Mengelola transaksi peminjaman

Frontend (`index.html`) terhubung dengan ketiga service ini menggunakan **fetch API**.

## 🚀 Fitur Aplikasi

- 📖 **Daftar Buku**
  - Melihat semua buku
  - Menambah buku baru (Author dan Title)
  - Menghapus buku

- 👤 **Pengguna**
  - Melihat daftar user
  - Menambahkan user baru
  - Menghapus user

- 📝 **Form Peminjaman**
  - Pinjam buku dengan memasukkan nama user, ID buku, dan durasi hari

- 📂 **Riwayat Peminjaman**
  - Melihat semua transaksi peminjaman
  - Menghapus transaksi pinjaman

---
