# 🚀 Pipeline Dashboard - Full Stack Application

Dashboard manajemen Pipeline dengan fitur CRUD dan Import CSV super cepat untuk jutaan data.

## 📋 Tech Stack

### Backend
- **Go 1.21+** dengan **Fiber Framework** (ultra-fast HTTP framework)
- **GORM** untuk ORM
- **MySQL** sebagai database
- **Goroutines** untuk parallel processing
- **Bulk Insert** untuk performa optimal

### Frontend
- **React 18** dengan **Vite** (lightning-fast build tool)
- **React Router** untuk routing
- **Axios** untuk HTTP client
- **Tailwind CSS** untuk styling
- **Recharts** untuk visualisasi data
- **Lucide React** untuk icons

## ✨ Fitur Utama

### Backend Features
- ✅ RESTful API dengan pagination dan filtering
- ✅ CRUD Operations (Create, Read, Update, Delete)
- ✅ CSV Import dengan streaming (tidak load semua ke memory)
- ✅ Parallel processing dengan 8 goroutines
- ✅ Bulk insert 10,000 rows per batch
- ✅ Transaction-based import untuk konsistensi data
- ✅ Real-time progress logging
- ✅ Auto migration database

### Frontend Features
- ✅ Dashboard dengan statistik dan charts
- ✅ Tabel data dengan pagination, search, dan filter
- ✅ Modal untuk Add/Edit data
- ✅ Upload CSV dengan progress bar
- ✅ Responsive design dengan Tailwind CSS
- ✅ Sidebar navigation
- ✅ Real-time feedback untuk semua operasi

## 📁 Struktur Proyek

```
pipeline/
├── backend/
│   ├── config/
│   │   └── database.go          # Database connection
│   ├── controllers/
│   │   ├── pipeline_controller.go   # CRUD operations
│   │   └── import_controller.go     # CSV import dengan goroutines
│   ├── models/
│   │   └── pipeline.go          # Model dan response structs
│   ├── routes/
│   │   └── routes.go            # API routes
│   ├── .env                     # Environment variables
│   ├── go.mod                   # Go dependencies
│   ├── init.sql                 # Database schema + seed data
│   ├── main.go                  # Entry point
│   └── sample.csv               # Sample CSV untuk testing
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # Main layout wrapper
    │   │   └── Sidebar.jsx      # Sidebar navigation
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Dashboard dengan charts
    │   │   ├── Pipelines.jsx    # CRUD table
    │   │   ├── ImportData.jsx   # CSV upload
    │   │   └── Settings.jsx     # Settings page
    │   ├── api.js               # Axios API client
    │   ├── App.jsx              # Root component
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Tailwind CSS
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Cara Menjalankan Proyek

### Prerequisites
- **Go 1.21+** - [Download](https://go.dev/dl/)
- **Node.js 18+** dan npm - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/) atau gunakan XAMPP
- **Git** (optional)

### 1️⃣ Setup Database (MySQL)

#### Menggunakan XAMPP
1. Jalankan XAMPP Control Panel
2. Start **Apache** dan **MySQL**
3. Buka phpMyAdmin: `http://localhost/phpmyadmin`
4. Import file `backend/init.sql`:
   - Klik tab "Import"
   - Pilih file `init.sql`
   - Klik "Go"

#### Atau Manual via MySQL Command Line
```bash
# Login ke MySQL
mysql -u root -p

# Jalankan init.sql
source d:/xampp/htdocs/pipeline/backend/init.sql
```

Database `pipeline_db` akan dibuat dengan tabel `pipelines` dan 10 data seed.

### 2️⃣ Setup dan Jalankan Backend

```powershell
# Masuk ke folder backend
cd d:\xampp\htdocs\pipeline\backend

# Download dependencies Go
go mod download

# Jalankan server
go run main.go
```

Backend akan berjalan di: **http://localhost:8080**

Endpoints yang tersedia:
- `GET /api/health` - Health check
- `GET /api/stats` - Dashboard statistics
- `GET /api/pipelines` - Get all pipelines (dengan pagination & filter)
- `GET /api/pipelines/:id` - Get single pipeline
- `POST /api/pipelines` - Create new pipeline
- `PUT /api/pipelines/:id` - Update pipeline
- `DELETE /api/pipelines/:id` - Delete pipeline
- `POST /api/pipelines/import` - Import CSV file

### 3️⃣ Setup dan Jalankan Frontend

Buka terminal **baru** (jangan tutup terminal backend):

```powershell
# Masuk ke folder frontend
cd d:\xampp\htdocs\pipeline\frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

Browser akan otomatis terbuka. Jika tidak, buka manual di `http://localhost:3000`

## 📊 Cara Menggunakan

### Dashboard
- Lihat total pipelines, proyeksi, dan statistik
- Chart proyeksi per strategy
- Pie chart distribusi per segment
- Tabel breakdown detail

### Pipelines (CRUD)
- **View**: Tabel dengan pagination, search, dan filter
- **Add**: Klik tombol "Add Pipeline" → isi form → klik "Create"
- **Edit**: Klik icon pensil → ubah data → klik "Update"
- **Delete**: Klik icon trash → konfirmasi
- **Search**: Ketik di search box untuk cari berdasarkan PN, Nama, atau Kode Uker
- **Filter**: Pilih Strategy atau Segment dari dropdown

### Import Data (CSV)
1. Klik "Select CSV File" atau drag & drop file CSV
2. Pastikan format CSV sesuai (lihat instruksi di halaman)
3. Klik "Upload and Import"
4. Progress bar akan muncul
5. Hasil import akan ditampilkan (success, failed, total, duration)

### Format CSV

**Header (wajib):**
```
PN,NAMA_RMFT,KODE_UKER,KC,PROD,NO_REK,DUP,NAMA,TGL,STRATEGY,SEGMENT,PIPELINE,PROYEKSI
```

**Contoh data:**
```
PN001,RMFT Jakarta,UK001,KC Jakarta Pusat,PROD001,REK001,DUP001,Budi Santoso,2025-01-15,Aggressive,Premium,Pipeline A,1500000.50
PN002,RMFT Bandung,UK002,KC Bandung Utara,PROD002,REK002,DUP002,Siti Nurhaliza,2025-02-20,Moderate,Gold,Pipeline B,2300000.75
```

File `backend/sample.csv` bisa digunakan untuk testing.

## ⚡ Performa Import CSV

### Optimasi yang Diterapkan:
- **Streaming CSV**: Membaca file secara streaming, tidak load semua ke memory
- **8 Goroutines**: Parallel processing dengan 8 worker
- **Bulk Insert**: Insert 10,000 rows per batch (bukan per-row)
- **Transaction**: Setiap batch menggunakan transaction MySQL
- **Channel Buffer**: 1000 untuk menghindari blocking
- **Connection Pool**: MaxOpenConns = 100, MaxIdleConns = 10

### Benchmark (estimasi):
- **10,000 rows**: ~1-2 detik
- **100,000 rows**: ~10-15 detik
- **1,000,000 rows**: ~1-2 menit
- **10,000,000 rows**: ~15-20 menit

*Waktu aktual tergantung spesifikasi hardware dan MySQL configuration*

## 🔧 Konfigurasi

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=pipeline_db
SERVER_PORT=8080
```

### Frontend (api.js)
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

Jika mengubah port backend, sesuaikan `API_BASE_URL` di `frontend/src/api.js`

## 🛠️ Build untuk Production

### Backend
```bash
cd backend
go build -o pipeline-server.exe main.go
./pipeline-server.exe
```

### Frontend
```bash
cd frontend
npm run build
```
Hasil build ada di folder `frontend/dist/`

## 📝 API Documentation

### GET /api/pipelines
Query Parameters:
- `page` (default: 1)
- `per_page` (default: 10, max: 100)
- `search` (optional)
- `strategy` (optional: Aggressive, Moderate, Conservative)
- `segment` (optional: Premium, Gold, Silver)

Response:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "per_page": 10,
  "total_pages": 10
}
```

### POST /api/pipelines
Body:
```json
{
  "pn": "PN001",
  "nama_rmft": "RMFT Jakarta",
  "kode_uker": "UK001",
  "kc": "KC Jakarta",
  "prod": "PROD001",
  "no_rek": "REK001",
  "dup": "DUP001",
  "nama": "Budi Santoso",
  "tgl": "2025-01-15",
  "strategy": "Aggressive",
  "segment": "Premium",
  "pipeline": "Pipeline A",
  "proyeksi": 1500000.50
}
```

### POST /api/pipelines/import
Form Data:
- `file`: CSV file (multipart/form-data)

Response:
```json
{
  "success": 9500,
  "failed": 500,
  "total": 10000,
  "duration": "12.5s",
  "message": "Import completed successfully"
}
```

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan MySQL sudah running (XAMPP Control Panel)
- Cek credentials di `.env`
- Cek port MySQL di XAMPP (default: 3306)

### Frontend tidak bisa fetch data
- Pastikan backend sudah running
- Cek CORS settings di `backend/main.go`
- Cek `API_BASE_URL` di `frontend/src/api.js`

### CSV import gagal
- Pastikan format CSV sesuai (header case-sensitive)
- Cek file size (max 100MB)
- Lihat log error di terminal backend

### Port sudah digunakan
- Backend: Ubah `SERVER_PORT` di `.env`
- Frontend: Ubah `server.port` di `vite.config.js`

## 📚 Dependencies

### Backend (go.mod)
```
github.com/gofiber/fiber/v2
github.com/joho/godotenv
gorm.io/driver/mysql
gorm.io/gorm
```

### Frontend (package.json)
```
react, react-dom, react-router-dom
axios
recharts
lucide-react
tailwindcss
```

## 👨‍💻 Development Tips

### Hot Reload Backend (optional)
Install Air untuk auto-reload:
```bash
go install github.com/cosmtrek/air@latest
air
```

### Frontend Development
Vite sudah support hot reload otomatis

### Database Migration
Auto migration sudah aktif di `main.go`:
```go
db.AutoMigrate(&models.Pipeline{})
```

## 📄 License

MIT License - Bebas digunakan untuk project apapun

## 🙏 Credits

Created with ❤️ using:
- Go Fiber (fastest Go web framework)
- React + Vite (modern frontend stack)
- Tailwind CSS (utility-first CSS)
- MySQL (reliable database)

---

**Happy Coding! 🚀**

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
