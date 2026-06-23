# Landing Page Builder

Nền tảng web cho phép người dùng tạo và tùy chỉnh landing page qua giao diện trực quan, không cần biết lập trình.

## Tech Stack

| Layer    | Công nghệ                          |
|----------|------------------------------------|
| Frontend | React + Vite + TailwindCSS         |
| Backend  | Golang + Gin + GORM                |
| Database | PostgreSQL 14+                     |
| Deploy   | Docker + Docker Compose            |

## Cấu trúc thư mục (Monorepo)

```
landing-page-builder/
├── backend/           # API server (Golang + Gin + GORM)
│   ├── cmd/api/       # Entry point
│   ├── internal/      # Code nội bộ (không export)
│   │   ├── config/    # Đọc biến môi trường
│   │   ├── models/    # GORM models (khớp với DB schema)
│   │   ├── handlers/  # HTTP handlers (controller)
│   │   ├── service/   # Business logic
│   │   ├── repository/# Truy vấn database
│   │   ├── middleware/# Auth, CORS, logging
│   │   └── router/    # Khai báo routes
│   ├── pkg/           # Code dùng chung có thể tái sử dụng
│   └── migrations/    # SQL migration
├── frontend/          # React app
├── db/                # Schema SQL, ERD
├── docs/              # Tài liệu dự án
└── docker-compose.yml # Chạy toàn bộ stack
```

## Bắt đầu nhanh

### Yêu cầu
- Go 1.22+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 14+ (hoặc chạy qua Docker)

### Chạy bằng Docker (khuyên dùng)
```bash
cp .env.example .env       # chỉnh sửa biến môi trường nếu cần
docker compose up -d
```

### Chạy thủ công

Backend:
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/api
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Quy ước nhánh Git (Git Flow rút gọn)

- `main` — code production, luôn ổn định, chỉ merge từ `develop`
- `develop` — nhánh tích hợp chính
- `feature/<ten-tinh-nang>` — nhánh tính năng, ví dụ `feature/login-api`
- `fix/<ten-loi>` — nhánh sửa lỗi

Mỗi thành viên tạo nhánh `feature/...` từ `develop`, làm xong tạo Pull Request về `develop`.

## Phân công

Xem chi tiết task trong `docs/` hoặc bảng Notion của team.
