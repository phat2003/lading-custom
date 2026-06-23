# Hướng dẫn đóng góp (CONTRIBUTING)

## Quy trình làm việc với Git

### 1. Cập nhật develop mới nhất
```bash
git checkout develop
git pull origin develop
```

### 2. Tạo nhánh feature từ develop
Đặt tên theo task của bạn:
```bash
git checkout -b feature/login-api
# hoặc: fix/section-order-bug
```

### 3. Commit theo quy ước
Dùng tiền tố rõ ràng:
```
feat: thêm API đăng nhập
fix: sửa lỗi sắp xếp section
refactor: tách service layer
docs: cập nhật README
```

### 4. Push và tạo Pull Request
```bash
git push origin feature/login-api
```
Vào GitHub tạo Pull Request về nhánh `develop`. Gắn người review (thường là Leader).

### 5. Sau khi được duyệt
PR được merge vào `develop`. Cuối sprint, `develop` được merge vào `main`.

## Quy ước code

### Backend (Go)
- Chạy `gofmt` trước khi commit (hoặc bật format-on-save trong IDE).
- Mỗi feature theo cấu trúc: `handler -> service -> repository`.
- Không viết business logic trong handler; handler chỉ nhận request, gọi service, trả response.
- Tham khảo feature mẫu: `Auth` (đã có sẵn đầy đủ 3 tầng).

### Frontend (React)
- Component đặt trong `src/components`, trang trong `src/pages`.
- Gọi API qua `src/api/` (đã có axios client tự gắn token).
- Tham khảo mẫu: trang `Login` + `AuthContext`.

## Phân công feature (tham khảo)

| Feature | Người phụ trách | Thư mục chính |
|---------|----------------|---------------|
| Auth (mẫu) | BE1 + FE1 | đã hoàn thành |
| Project | BE2 + FE1 | handlers/project_*, pages/Project* |
| Template / Section | BE2 + BE3 + FE2 | handlers/template_*, section_* |
| Preview / Publish | Leader + FE1/FE2 | handlers/publish_* |
| Media upload | BE3 | handlers/media_* |
| Export / Pricing | BE1 + FE1/FE2 | handlers/export_*, subscription_* |

## Không bao giờ commit
- File `.env` (chứa secret) — chỉ commit `.env.example`
- `node_modules/`, file build (`dist/`, binary Go)
- Khóa API, mật khẩu, token
