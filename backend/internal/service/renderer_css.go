package service

// rendererUtilityCSS là bộ CSS thay cho cdn.tailwindcss.com.
//
// Vì sao không dùng CDN: script đó là bản dev của Tailwind — nó tải ~300KB JS
// rồi biên dịch CSS ngay trong trình duyệt, và biến mọi trang đã publish thành
// phụ thuộc vào một host bên ngoài (CDN chết là toàn bộ trang mất sạch style
// cùng lúc). Với sản phẩm landing page thì tốc độ tải chính là tỉ lệ chuyển đổi.
//
// PHẠM VI: chỉ gồm ĐÚNG những class mà renderer sinh ra — xem sectionTemplates
// trong preview_service.go — chứ không phải cả framework. Thêm class mới ở
// renderer thì PHẢI thêm quy tắc tương ứng ở đây, nếu không nó sẽ im lặng không
// có tác dụng. TestLayoutPublish_PhuHetClassMaRendererSinhRa canh việc đó.
//
// Giá trị lấy đúng theo thang mặc định của Tailwind v3.
//
// Dùng chung cho cả trang publish (static_service) lẫn preview trong editor
// (preview_service) vì hai nơi chạy cùng một bộ renderer section.
const rendererUtilityCSS = `
		/* Tailwind preflight đặt border-style: solid toàn cục; không có nó thì
		   border-t chỉ set độ dày mà không vẽ ra gì. */
		*, *::before, *::after { border-width: 0; border-style: solid; border-color: currentColor; }

		.flex { display: flex; }
		.grid { display: grid; }
		.inline-block { display: inline-block; }
		.items-center { align-items: center; }
		.justify-between { justify-content: space-between; }
		.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
		.gap-6 { gap: 1.5rem; }
		.gap-8 { gap: 2rem; }

		.mx-auto { margin-left: auto; margin-right: auto; }
		.max-w-3xl { max-width: 48rem; }
		.mb-4 { margin-bottom: 1rem; }
		.mb-8 { margin-bottom: 2rem; }
		.mb-12 { margin-bottom: 3rem; }
		.mt-2 { margin-top: 0.5rem; }
		.mt-3 { margin-top: 0.75rem; }
		.mt-4 { margin-top: 1rem; }
		.ml-3 { margin-left: 0.75rem; }
		.p-4 { padding: 1rem; }
		.p-6 { padding: 1.5rem; }
		.px-8 { padding-left: 2rem; padding-right: 2rem; }
		.px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
		.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
		.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
		.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
		.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
		.py-20 { padding-top: 5rem; padding-bottom: 5rem; }

		.h-10 { height: 2.5rem; }
		.w-10 { width: 2.5rem; }

		.text-center { text-align: center; }
		.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
		.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
		.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
		.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
		.text-5xl { font-size: 3rem; line-height: 1; }
		.font-semibold { font-weight: 600; }
		.font-bold { font-weight: 700; }
		.italic { font-style: italic; }
		.text-white { color: #fff; }

		.bg-blue-600 { background-color: #2563eb; }
		.bg-blue-600\/20 { background-color: rgba(37, 99, 235, 0.2); }
		.bg-white\/5 { background-color: rgba(255, 255, 255, 0.05); }
		.border-t { border-top-width: 1px; }
		.border-white\/10 { border-color: rgba(255, 255, 255, 0.1); }

		.rounded-lg { border-radius: 0.5rem; }
		.rounded-xl { border-radius: 0.75rem; }
		.rounded-full { border-radius: 9999px; }
		.object-cover { object-fit: cover; }
		.cursor-pointer { cursor: pointer; }
		.opacity-50 { opacity: 0.5; }
		.opacity-70 { opacity: 0.7; }
		.opacity-80 { opacity: 0.8; }
		.hover\:opacity-100:hover { opacity: 1; }
`
