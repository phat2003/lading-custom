# Hướng dẫn chạy dự án (mỗi lần làm việc)

Quy trình khởi động **backend + database + frontend** cho môi trường phát triển (dev).
Áp dụng cho Windows (PowerShell / cmd). Database và backend chạy trong Docker, frontend chạy
bằng `npm run dev` để có hot-reload.

---

## 1. Yêu cầu (cài 1 lần)

- **Docker Desktop** (chứa cả PostgreSQL + backend)
- **Node.js 20+** (chạy frontend)

---

## 2. Chuẩn bị lần đầu (chỉ làm 1 lần)

```bash
# tại thư mục gốc dự án: c:\Landing_page\lading-custom
copy .env.example .env          # PowerShell: Copy-Item .env.example .env

cd frontend
npm install                     # cài dependency frontend
cd ..
```

> Lần **đầu tiên** chạy `docker compose up`, container PostgreSQL sẽ tự động nạp `db/schema.sql`
> (tạo bảng + seed sẵn 2 tài khoản demo). Các lần sau dữ liệu được giữ trong volume `pgdata`,
> **không** seed lại.

---

## 3. Mỗi lần chạy dự án

**Bước 1 — Bật Docker Desktop**
Mở Docker Desktop, đợi tới khi hiện **"Engine running"** (icon 🐳 dưới khay hệ thống đứng yên).

**Bước 2 — Terminal 1: Database + Backend (Docker)**
```bash
cd c:\Landing_page\lading-custom
docker compose up -d db backend
```

**Bước 3 — Terminal 2: Frontend (local, có hot-reload)**
```bash
cd c:\Landing_page\lading-custom\frontend
npm run dev
```

Xong! Mở trình duyệt:

| Thành phần | Địa chỉ |
|------------|---------|
| Giao diện (frontend) | http://localhost:5173 |
| API (backend)        | http://localhost:8080 |
| Database (PostgreSQL)| localhost:5432 |

### Tài khoản test (seed sẵn trong `db/schema.sql`)
| Email | Mật khẩu | Họ tên | Vai trò | Gói | Dùng để test |
|-------|----------|--------|---------|-----|--------------|
| `admin@lpbuilder.com` | `Admin@123` | System Admin | admin | pro | Khu quản trị `/admin`, tạo template & section mẫu |
| `user@demo.com` | `User@123` | Demo User | user | free | Trang người dùng `/projects`, tạo landing page |

> Đây là 2 tài khoản được seed tự động khi khởi tạo DB lần đầu. Đăng nhập **admin** để vào khu
> `/admin`; đăng nhập **user** để test luồng người dùng thường. Đăng ký tài khoản mới qua trang
> `/register` sẽ luôn có vai trò `user`, gói `free`.

> **Vì sao frontend không chạy trong Docker?** Frontend trong Docker là bản build tĩnh (nginx),
> sửa code **không** tự cập nhật. `npm run dev` mới có hot-reload — phù hợp khi đang phát triển.

---

## 4. Khi làm xong (tắt)

- Terminal frontend: nhấn **Ctrl + C**.
- Dừng Docker (**giữ nguyên** dữ liệu DB):
```bash
cd c:\Landing_page\lading-custom
docker compose stop
```

> ⚠️ Dùng `docker compose stop`, **KHÔNG** dùng `docker compose down -v`.
> Cờ `-v` sẽ xoá sạch volume DB → mất toàn bộ dữ liệu, lần sau phải seed lại từ đầu.

---

## 5. Những thứ KHÔNG cần làm lại mỗi lần

- ❌ `copy .env.example .env` — đã có rồi.
- ❌ `npm install` — chỉ chạy lại khi `frontend/package.json` thay đổi (kéo code mới về mà báo
  thiếu package thì mới cần).
- ❌ Seed database — dữ liệu nằm trong volume `pgdata`, còn nguyên giữa các lần chạy.

---

## 6. Tình huống thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| `unable to connect to the docker API ... cannot find the file` | Docker Desktop chưa chạy | Bật Docker Desktop, đợi "Engine running" rồi chạy lại |
| Backend chạy nhưng API lỗi 500 / bảng không tồn tại | DB khởi tạo khi chưa có schema, hoặc đã sửa `schema.sql` | `docker compose down -v` rồi `docker compose up -d db backend` để nạp lại schema (**mất dữ liệu DB**) |
| `port 5432 already in use` | Có PostgreSQL khác đang chạy trên máy | Tắt PostgreSQL local, hoặc đổi cổng publish trong `docker-compose.yml` |
| Sửa code **backend** mà không thấy đổi | Backend trong Docker là bản build sẵn | `docker compose up -d --build backend` |
| Sửa code **frontend** mà không thấy đổi | Đang xem bản Docker thay vì dev server | Mở đúng http://localhost:5173 (từ `npm run dev`) |
| Máy vừa khởi động lại | — | Bật Docker Desktop rồi làm lại Bước 2–3 |

---

## 7. Lệnh kiểm tra nhanh

```bash
# Backend còn sống không?
curl http://localhost:8080/health          # kỳ vọng: {"status":"ok"}

# Xem log backend khi nghi lỗi
docker compose logs -f backend

# Xem trạng thái các container
docker compose ps
```

---

## 8. Tóm tắt 30 giây

```text
1. Bật Docker Desktop  (đợi "Engine running")
2. docker compose up -d db backend
3. cd frontend && npm run dev
→ mở http://localhost:5173, đăng nhập admin@lpbuilder.com / Admin@123
```
