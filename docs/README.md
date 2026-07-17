# Tài liệu dự án

- `landing-page-requirement-document-updated-timeline.docx` — Tài liệu yêu cầu (requirement) gốc.
- ERD và schema database: xem `../db/schema.sql`.
- `template-upload-orphan.md` — **Vấn đề mở cần team bàn**: endpoint upload template HTML đang mồ côi trong thiết kế.

## Quy ước API

Tất cả response theo format chuẩn:
```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```
Lỗi:
```json
{
  "success": false,
  "error": "mô tả lỗi"
}
```

Base URL: `/api/v1`. Các route cần đăng nhập gửi header `Authorization: Bearer <token>`.
