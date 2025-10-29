# 🚀 Quick Start Guide

## Langkah Cepat untuk Memulai

### 1. Start MySQL (XAMPP)
- Buka XAMPP Control Panel
- Klik "Start" pada MySQL
- Tunggu hingga status menjadi hijau

### 2. Import Database
Buka terminal dan jalankan:
```powershell
# Via phpMyAdmin
# 1. Buka http://localhost/phpmyadmin
# 2. Klik "Import"
# 3. Pilih file: d:\xampp\htdocs\pipeline\backend\init.sql
# 4. Klik "Go"
```

Atau via MySQL CLI:
```bash
mysql -u root -p < d:\xampp\htdocs\pipeline\backend\init.sql
```

### 3. Jalankan Backend
```powershell
cd d:\xampp\htdocs\pipeline\backend
go mod download
go run main.go
```

Tunggu hingga muncul:
```
✅ Database connected successfully!
✅ Database migration completed!
🚀 Server starting on http://localhost:8080
```

### 4. Jalankan Frontend (Terminal Baru)
```powershell
cd d:\xampp\htdocs\pipeline\frontend
npm install
npm run dev
```

Tunggu hingga muncul:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

### 5. Buka Browser
Otomatis terbuka atau manual ke: **http://localhost:3000**

## ✅ Checklist
- [ ] MySQL running di XAMPP
- [ ] Database `pipeline_db` sudah ada
- [ ] Backend running di port 8080
- [ ] Frontend running di port 3000
- [ ] Browser bisa akses http://localhost:3000

## 🧪 Testing

### Test Backend API
```powershell
# Health check
curl http://localhost:8080/api/health

# Get pipelines
curl http://localhost:8080/api/pipelines

# Get stats
curl http://localhost:8080/api/stats
```

### Test Import CSV
1. Buka http://localhost:3000/import
2. Upload file `backend/sample.csv`
3. Klik "Upload and Import"
4. Lihat progress dan hasil import

### Test CRUD
1. Buka http://localhost:3000/pipelines
2. Klik "Add Pipeline" → isi form → save
3. Klik icon pensil untuk edit
4. Klik icon trash untuk delete

## ⚠️ Troubleshooting Cepat

### "Failed to connect to database"
- Pastikan MySQL di XAMPP sudah start
- Cek `.env` di folder backend

### "port 8080 already in use"
- Ubah `SERVER_PORT=8081` di `.env`
- Restart backend

### "Failed to fetch"
- Pastikan backend running
- Cek console browser (F12)

### "npm install error"
- Hapus folder `node_modules` dan `package-lock.json`
- Jalankan `npm install` lagi

## 📸 Screenshots Expected

### Dashboard
- Card: Total Pipelines, Total Proyeksi, Strategies
- Chart: Bar chart proyeksi per strategy
- Chart: Pie chart distribusi segment
- Table: Detail statistics

### Pipelines
- Tabel data dengan 10 rows (seed data)
- Search box, filter dropdown
- Tombol Add Pipeline
- Icon edit dan delete per row

### Import Data
- Upload area
- Instructions panel
- Progress bar (saat upload)
- Result card (setelah sukses)

## 🎯 Next Steps

1. Coba import sample.csv
2. Tambah data baru via form
3. Edit dan delete data
4. Lihat update statistics di dashboard
5. Filter dan search data

## 💡 Tips
- Gunakan sample.csv untuk testing import
- Buat CSV dengan jutaan row untuk test performa
- Monitor terminal backend untuk melihat log import
- Check Network tab di browser untuk debug API

---

**Selamat mencoba! 🎉**
