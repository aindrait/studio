# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Persiapan & Deployment di Server Linux

Berikut adalah panduan untuk menyiapkan dan menjalankan aplikasi ini di server Linux (seperti Ubuntu/Debian).

### 1. Prasyarat: Instalasi Node.js dan NPM

Aplikasi ini membutuhkan Node.js dan NPM. Cara termudah untuk menginstalnya adalah menggunakan Node Version Manager (nvm) atau package manager sistem Anda.

**Opsi A: Menggunakan `apt` (untuk Ubuntu/Debian)**
```bash
# Perbarui daftar paket Anda
sudo apt update

# Instal Node.js dan NPM
sudo apt install nodejs npm -y

# Verifikasi instalasi
node -v
npm -v
```

**Opsi B: Menggunakan `nvm` (Direkomendasikan)**
`nvm` memungkinkan Anda mengelola beberapa versi Node.js dengan mudah.
```bash
# Instal nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Muat nvm ke dalam sesi shell Anda
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instal versi LTS (Long-Term Support) terbaru dari Node.js
nvm install --lts

# Verifikasi instalasi
node -v
npm -v
```

### 2. Instalasi Aplikasi

Salin atau kloning repositori proyek Anda ke server, lalu masuk ke direktorinya.

```bash
# Ganti dengan URL repositori Anda jika menggunakan git
# git clone <url-repositori-anda>
# cd <nama-direktori-proyek>

# Instal semua dependensi yang tercantum di package.json
npm install
```

### 3. Konfigurasi Lingkungan

Aplikasi ini menggunakan file `.env` untuk variabel lingkungan. Untuk produksi, buat file `.env.local`.

```bash
# Salin file contoh
cp .env .env.local
```
*Catatan: Karena aplikasi saat ini menggunakan database berbasis file, tidak ada kredensial rahasia yang perlu ditambahkan. Namun, jika Anda menambahkan layanan eksternal di masa depan, `env.local` adalah tempat untuk menyimpan kunci API atau kredensial database.*

### 4. Build Aplikasi untuk Produksi

Next.js perlu di-*build* untuk mengoptimalkan aplikasi untuk produksi.

```bash
npm run build
```
Perintah ini akan membuat direktori `.next` yang berisi build aplikasi yang siap di-deploy.

### 5. Menjalankan Aplikasi

Setelah proses build selesai, jalankan aplikasi menggunakan server produksi Next.js.

```bash
npm run start
```
Secara default, aplikasi akan berjalan di port 3000.

### 6. (Opsional) Menjalankan sebagai Layanan dengan PM2

Untuk menjalankan aplikasi secara terus-menerus sebagai layanan di latar belakang (dan otomatis restart jika terjadi crash), direkomendasikan menggunakan manajer proses seperti `pm2`.

```bash
# Instal pm2 secara global
sudo npm install pm2 -g

# Jalankan aplikasi Anda menggunakan pm2
pm2 start npm --name "mds-manual-app" -- start

# Lihat status aplikasi Anda
pm2 list

# (Opsional) Mengatur pm2 agar otomatis berjalan saat server startup
pm2 startup
```
