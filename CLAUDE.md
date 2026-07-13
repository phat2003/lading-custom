# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing Page Builder — a web platform for creating and customizing landing pages via a visual interface (no coding required). Monorepo with separate `backend/` (Go) and `frontend/` (React) directories.

## Commands

### Run the full stack (recommended)
```bash
cp .env.example .env   # edit values as needed
docker compose up -d
```
Services: frontend at `http://localhost:5173`, backend API at `http://localhost:8080`, PostgreSQL at `5432`.

### Backend (Go)
```bash
cd backend
cp .env.example .env
go mod download
go run ./cmd/api          # start dev server
go vet ./...              # lint
go build ./...            # build check
go test ./...             # run tests
go test ./internal/service/... -run TestAuthService  # run a single test
```
Run `gofmt` before committing (or enable format-on-save).

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev               # dev server (hot reload)
npm run build             # production build
npm run lint              # ESLint
```

## Architecture

### Backend layers (always follow this order: handler → service → repository)
- `cmd/api/main.go` — entry point; loads config, opens DB, calls `router.Setup()`
- `internal/config/` — reads env vars; `Config` struct passed everywhere
- `internal/router/router.go` — all routes declared here; dependency wiring (repo → service → handler) done at startup
- `internal/handlers/` — HTTP layer only; validates request, calls service, returns response via `pkg/response`
- `internal/service/` — business logic; no direct DB calls
- `internal/repository/` — all GORM queries; returns domain types
- `internal/middleware/` — `AuthRequired` (JWT) and `AdminRequired` (role check)
- `internal/models/` — GORM models (`user.go` for User; `entities.go` for all other domain models)
- `pkg/response/` — shared `response.OK` / `response.Fail` helpers for consistent JSON shape

**Auth feature is the complete reference implementation** — study `auth_handler.go`, `auth_service.go`, `user_repository.go` before writing new features.

### Frontend structure
- `src/api/client.js` — shared axios instance; auto-attaches JWT from `localStorage`; handles 401 globally
- `src/api/` — one file per domain (e.g., `auth.js`); call these from components, not raw axios
- `src/context/AuthContext.jsx` — auth state provider; reference for other context patterns
- `src/pages/` — full-page route components
- `src/components/` — reusable UI components
- `src/App.jsx` — route definitions; `ProtectedRoute` wraps authenticated pages

### Data model relationships
`User` → owns → `Project` (1:N) → contains → `LandingPage` (1:N) → has → `PageSection` (1:N, stores user-edited JSONB content)

Templates are separate: `Template` → `TemplateSection` (system/user-saved templates)  
`SectionTemplateLibrary` is the global section library managed by admins.  
`PublishedSnapshot` stores a frozen JSONB snapshot at publish time (served at `/p/:slug`).  
`MediaAsset` is attached to an owner and optionally to a `LandingPage`.

### API base path
All endpoints: `/api/v1/...`  
Public: `/api/v1/auth/register`, `/api/v1/auth/login`  
Authenticated: `/api/v1/` group with `AuthRequired` middleware  
Admin: `/api/v1/admin/` group with `AuthRequired` + `AdminRequired`

### Database
Migrations live in `backend/migrations/` (SQL up/down). The `db/schema.sql` file is mounted into the Postgres container on first run via Docker Compose.

## Rules (must follow)

- **Do NOT delete mock data until a real API exists for that feature.**
- **Do NOT change the `features/` directory structure.**
- **Always ask the user before deleting any file.**
- Write comments in Vietnamese.
- Frontend components use arrow functions.
- When in doubt, ask before changing — prefer fixing one page at a time.

## Git workflow

Branch from `develop` for all feature/fix work; PR back to `develop`.  
`main` is production-only (merged from `develop` at sprint end).  
Commit prefix convention: `feat:`, `fix:`, `refactor:`, `docs:`  
Never commit `.env` files — only `.env.example`.
## Quy tắc code
- Viết comment bằng tiếng Việt
- Component dùng arrow function

## Quy tắc bắt buộc (KHÔNG được vi phạm)
- ❌ KHÔNG xóa mock data khi chưa có API thật
- ❌ KHÔNG thay đổi cấu trúc thư mục features/
- ⚠️ LUÔN hỏi người dùng trước khi xóa bất kỳ file nào

## Trạng thái project
- 🔄 Tất cả các page đều đang trong quá trình phát triển
## Lưu ý khi làm việc
- Luôn đọc CLAUDE.md trước khi bắt đầu bất kỳ task nào
- Khi không chắc → hỏi trước, không tự ý sửa
- Ưu tiên sửa từng page một, không sửa nhiều file cùng lúc