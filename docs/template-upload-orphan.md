# Vấn đề mở: endpoint `/admin/templates/upload` đang mồ côi trong thiết kế

> Ghi chú để team bàn. Đây là **câu hỏi sản phẩm**, không phải kỹ thuật — chưa
> chốt hướng, cần product/team quyết.

## Hiện trạng

- Endpoint `POST /api/v1/admin/templates/upload` nhận một file **HTML đầy đủ**,
  lưu vào `uploads/templates/<uuid>.html` và trả về `file_url`.
- **Không có bảng nào trong DB tham chiếu tới file này.** Bảng `template` chỉ gồm
  `template_id, name, type, owner_id, template_source` — không có cột `file_url`
  hay `html_content`. Một `template` được cấu thành từ các dòng `template_section`
  (nội dung JSONB), **không** từ file HTML upload lên.
- Vì vậy file HTML sau khi upload xong **không được luồng nghiệp vụ nào tiêu thụ**:
  không gắn vào template, không render ra đâu, không có UI nào đọc lại. `file_url`
  trả về cho admin hiện cũng không dùng vào việc gì.

## Vì sao là vấn đề

1. **File rác không thể dọn.** Vì không có cạnh tham chiếu (không bảng nào trỏ tới
   file), không thể phân biệt file "đang dùng" với file "bỏ đi" → không GC được.
   Đây cũng là lý do (đã cân nhắc và quyết) **cố tình chưa ghi `media_asset`** cho
   template file: bản ghi sẽ là dữ liệu chết, chỉ gây ô nhiễm ngữ nghĩa bảng media.
   (Xem TODO trong `backend/internal/handlers/upload_handler.go` — `UploadTemplateFile`.)
2. **Hợp đồng feature chưa rõ.** Không rõ ý định ban đầu: upload HTML để làm gì?
   Import thành template? Làm bản xem trước? Cho phép admin dán HTML tùy biến?
   Mỗi ý định dẫn tới thiết kế dữ liệu khác nhau.
3. **Rủi ro bảo mật nếu sau này render.** File HTML admin upload hiện được serve
   an toàn (ép tải về, không thực thi — xem `ServeUploadedFile`). Nhưng nếu tương
   lai có luồng **render** HTML này vào trang/app, phải xử lý sanitize/CSP cẩn thận,
   nếu không sẽ mở lại lỗ hổng XSS mà ta vừa bịt.

## Các hướng xử lý khả dĩ (để bàn, chưa chọn)

- **A. Gắn file HTML vào `template`.** Thêm cột `template.file_url` (hoặc
  `html_content`), cho luồng tạo template tham chiếu file upload. Khi đó có cạnh
  tham chiếu → track/GC được, và việc ghi DB trở nên có nghĩa.
- **B. Lập bảng riêng `template_file`.** Nếu template-từ-HTML là một khái niệm
  riêng (khác template-từ-section), tách bảng có metadata riêng (`template_id`
  liên kết, `status`, ...). Nặng hơn A, chỉ đáng khi feature đủ lớn.
- **C. Bỏ hẳn endpoint upload HTML.** Nếu template chỉ nên tạo từ `template_section`
  (đúng như model hiện tại), thì endpoint này thừa → gỡ bỏ, tránh bề mặt tấn công
  và file rác không cần thiết.
- **D. Chuyển thành luồng import.** Upload HTML → parse thành các `template_section`
  → lưu như template bình thường, rồi **xóa file HTML tạm**. File chỉ là input
  trung gian, không lưu lâu dài.

## Cần quyết

- Ý định gốc của `/admin/templates/upload` là gì? (import? lưu HTML thô? preview?)
- Template trong sản phẩm được tạo từ **section (JSONB)** hay từ **file HTML**, hay cả hai?
- Chọn hướng A / B / C / D (hoặc khác) → khi đó mới nối phần tracking DB cho file này.
