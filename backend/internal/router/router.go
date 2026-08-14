package router

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/config"
	"github.com/nhienthai/lading-custom/backend/internal/handlers"
	"github.com/nhienthai/lading-custom/backend/internal/middleware"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
)

// Setup khởi tạo Gin engine, đăng ký middleware và toàn bộ route.
func Setup(db *gorm.DB, cfg *config.Config) *gin.Engine {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Giới hạn phần multipart buffer trong RAM (mặc định 32MB); phần lớn hơn spill
	// ra file temp. Trần cứng theo từng endpoint upload đặt bằng MaxBytesReader.
	r.MaxMultipartMemory = 8 << 20 // 8 MB

	// CORS — cho phép frontend gọi API.
	// AllowCredentials không dùng vì auth qua Bearer token, không phải cookie.
	// Danh sách origin đọc từ CORS_ALLOWED_ORIGINS; để trống thì mở "*" cho môi
	// trường dev. Config.Load() đã chặn không cho production chạy với "*".
	r.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORSAllowedOrigins,
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		MaxAge:       12 * time.Hour,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// --- Khởi tạo dependency (wiring) ---
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg)
	authHandler := handlers.NewAuthHandler(authService)
	userService := service.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	projectRepo := repository.NewProjectRepository(db)
	projectService := service.NewProjectService(projectRepo)
	projectHandler := handlers.NewProjectHandler(projectService)

	// Admin User dependency (trang admin Users) — cần projectRepo để đếm số dự án.
	adminUserService := service.NewAdminUserService(userRepo, projectRepo)
	adminUserHandler := handlers.NewAdminUserHandler(adminUserService)

	// Admin Project dependency (trang admin Projects — xem dự án của mọi user).
	adminProjectService := service.NewAdminProjectService(projectRepo)
	adminProjectHandler := handlers.NewAdminProjectHandler(adminProjectService)

	// Pricing Plan dependency (trang admin Pricing Plans).
	planRepo := repository.NewPricingPlanRepository(db)
	planService := service.NewPricingPlanService(planRepo)
	planHandler := handlers.NewPricingPlanHandler(planService)

	// Settings dependency (cấu hình hệ thống + tài khoản admin đang đăng nhập).
	settingRepo := repository.NewPlatformSettingRepository(db)
	settingsService := service.NewSettingsService(settingRepo, userRepo)
	settingsHandler := handlers.NewSettingsHandler(settingsService, cfg.PublicBaseURL)

	// AI Generator dependency. LƯU Ý: chưa tích hợp mô hình AI thật —
	// xem ghi chú trong service.AIService.Generate.
	aiRepo := repository.NewAIRepository(db)
	aiService := service.NewAIService(aiRepo, settingRepo)
	aiHandler := handlers.NewAIHandler(aiService)

	// Stats dependency (số liệu tổng quan cho Admin Dashboard).
	statsRepo := repository.NewStatsRepository(db)
	statsService := service.NewStatsService(statsRepo, aiRepo)
	statsHandler := handlers.NewStatsHandler(statsService)

	// Landing Page dependency
	pageRepo := repository.NewLandingPageRepository(db)
	pageService := service.NewLandingPageService(pageRepo, projectRepo)
	pageHandler := handlers.NewLandingPageHandler(pageService)

	// Section dependency
	sectionRepo := repository.NewPageSectionRepository(db)
	sectionService := service.NewPageSectionService(sectionRepo, pageService) // Truyền pageService vào
	sectionHandler := handlers.NewPageSectionHandler(sectionService)

	// Section Template Library dependency
	sectionTemplateRepo := repository.NewSectionTemplateRepository(db)
	sectionTemplateService := service.NewSectionTemplateService(sectionTemplateRepo)
	sectionTemplateHandler := handlers.NewSectionTemplateHandler(sectionTemplateService)

	templateRepo := repository.NewTemplateRepository(db)
	templateService := service.NewTemplateService(templateRepo)
	templateHandler := handlers.NewTemplateHandler(templateService)

	// Template Action dependency (Save As Template / Clone Template).
	// Section con được ghi kèm cha trong transaction ở tầng repository
	// (TemplateRepository.CreateWithSections), nên không cần TemplateSectionRepository ở đây.
	templateActionService := service.NewTemplateActionService(templateRepo, pageRepo, sectionRepo, projectRepo)
	templateActionHandler := handlers.NewTemplateActionHandler(templateActionService)

	// Media Asset dependency
	assetRepo := repository.NewMediaAssetRepository(db)
	assetService := service.NewMediaAssetService(assetRepo)
	assetHandler := handlers.NewMediaAssetHandler(assetService, cfg.PublicBaseURL)

	// Export dependency (export landing page ra PDF — miễn phí)
	exportRepo := repository.NewExportRepository(db)
	exportService := service.NewExportService(exportRepo)
	exportHandler := handlers.NewExportHandler(exportService)

	// Preview dependency (realtime preview — sinh HTML cho iframe của editor)
	previewRepo := repository.NewPreviewRepository(db)
	previewService := service.NewPreviewService(previewRepo)
	previewHandler := handlers.NewPreviewHandler(previewService)

	// Static dependency (sinh HTML tĩnh, publish snapshot và serve link công khai /p/:slug)
	staticRepo := repository.NewStaticRepository(db)
	staticService := service.NewStaticService(staticRepo)
	staticHandler := handlers.NewStaticHandler(staticService)

	uploadHandler := handlers.NewUploadHandler(assetService, cfg.PublicBaseURL)

	// Payment & MoMo dependency
	subRepo := repository.NewSubscriptionRepository(db)
	momoService := service.NewMomoService(cfg)
	paymentService := service.NewPaymentService(subRepo, momoService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)

	// Serve file tĩnh đã upload (thumbnail, template file) qua handler an toàn:
	// đặt header chống thực thi (nosniff, CSP) và ép tải về với file không phải ảnh,
	// nhằm triệt tiêu Stored XSS. Xem handlers.ServeUploadedFile.
	r.GET("/uploads/*filepath", handlers.ServeUploadedFile("./uploads"))

	// --- Routes ---
	api := r.Group("/api/v1")

	// Auth (công khai)
	// Có rate limit vì đây là 2 endpoint duy nhất không cần token: login hở ra
	// thì dò được mật khẩu, register hở ra thì bị spam tạo tài khoản rác.
	// bcrypt làm chậm attacker phần nào nhưng đó không phải cơ chế chống brute force.
	authLimiter := middleware.NewRateLimiter(10, time.Minute)
	auth := api.Group("/auth", authLimiter.Middleware())
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// ---- PUBLIC API (Không cần Token) ----
	publicAPI := api.Group("/p")
	{
		// Webhook cho MoMo gọi về để báo cáo kết quả thanh toán
		publicAPI.POST("/payment/webhook", paymentHandler.MoMoWebhook)
	}

	// Các nhóm route cần đăng nhập.
	// TODO(team): mỗi người tự thêm handler tương ứng với feature của mình.
	authorized := api.Group("/")
	authorized.Use(middleware.AuthRequired(cfg.JWTSecret, userRepo))
	{
		// ---- Profile API ----
		authorized.GET("/profile", userHandler.GetProfile)
		authorized.PUT("/profile", userHandler.UpdateProfile)
		authorized.PUT("/profile/password", userHandler.ChangePassword)

		// ---- Project API (THÊM MỚI TỪ ĐÂY) ----
		projects := authorized.Group("/projects")
		{
			projects.POST("", projectHandler.Create)
			projects.GET("", projectHandler.GetAll)
			projects.GET("/:id", projectHandler.GetByID)
			projects.PUT("/:id", projectHandler.Update)
			projects.DELETE("/:id", projectHandler.Delete)
		}

		// ---- Landing Page API ----
		pages := authorized.Group("/pages")
		{
			pages.POST("", pageHandler.Create)
			pages.GET("", pageHandler.GetAll) // Cần truyền ?project_id=...
			pages.GET("/:id", pageHandler.GetByID)
			pages.PUT("/:id", pageHandler.Update)
			pages.DELETE("/:id", pageHandler.Delete)
			// Publish nằm ở /landing-pages/:id/publish (xem nhóm Static Preview / Publish bên dưới).
			// ---- (Chức năng Save as Template) ----
			pages.POST("/save-as-template", templateActionHandler.SaveAsTemplate)
			pages.POST("/from-template", templateActionHandler.CreateFromTemplate) // 👉 THÊM DÒNG NÀY CHO CLONE TEMPLATE
		}

		// ---- Export API ----
		// Export landing page ra HTML/CSS/JS đóng gói ZIP (chỉ gói Pro — check trong handler).
		authorized.GET("/landing-pages/:id/export/html", exportHandler.ExportHTML)
		// Export landing page ra PDF (miễn phí — cả gói Free lẫn Pro đều dùng được).
		authorized.GET("/landing-pages/:id/export/pdf", exportHandler.ExportPDF)

		// ---- Realtime Preview API ----
		// Preview realtime — trả JSON { html, updated_at } để FE nạp vào iframe (srcdoc).
		authorized.GET("/landing-pages/:id/preview", previewHandler.GetRealtimePreview)
		// Preview tĩnh — trả HTML thẳng, dùng trực tiếp cho iframe src.
		authorized.GET("/landing-pages/:id/preview/static", previewHandler.GetStaticPreview)
		// Preview theo thiết bị — ?device=desktop|tablet|mobile
		authorized.GET("/landing-pages/:id/preview/device", previewHandler.PreviewByDevice)

		// ---- Static Preview / Publish API ----
		// Sinh HTML tĩnh để xem trước bản sẽ publish (chưa lưu snapshot).
		authorized.POST("/landing-pages/:id/generate-static", staticHandler.GenerateStatic)
		// Publish: sinh HTML tĩnh, lưu snapshot với slug duy nhất, đổi status sang published.
		// CHỈ GÓI PRO — đây là ranh giới thu tiền của sản phẩm: gói free dựng và
		// xem trước trang thoải mái, nhưng đưa lên link công khai thì phải trả phí.
		authorized.POST("/landing-pages/:id/publish", middleware.ProRequired(), staticHandler.PublishPage)
		// Unpublish KHÔNG chặn theo gói: user hạ xuống free vẫn phải gỡ được trang
		// của mình xuống. Chặn ở đây là nhốt nội dung của họ ở trạng thái công khai.
		authorized.POST("/landing-pages/:id/unpublish", staticHandler.UnpublishPage)

		// ---- Section API ----
		sections := authorized.Group("/sections")
		{
			sections.POST("", sectionHandler.Create)
			sections.GET("", sectionHandler.GetAll) // GET /sections?page_id=...
			sections.PUT("/:id", sectionHandler.Update)
			sections.DELETE("/:id", sectionHandler.Delete)
		}

		// ---- AI Generator API ----
		// CHƯA tích hợp mô hình AI: /generate ghi lịch sử và trừ hạn mức thật,
		// nhưng không sinh ra nội dung nào (xem service.AIService.Generate).
		ai := authorized.Group("/ai")
		{
			ai.POST("/generate", aiHandler.Generate)
			ai.GET("/history", aiHandler.History)
			ai.GET("/credits", aiHandler.Credits)
		}

		// ---- Section Template Library API ----
		// Chỉ ĐỌC ở đây. Thư viện section là tài nguyên dùng chung toàn hệ thống,
		// quyền ghi nằm ở nhóm /admin bên dưới.
		sectionTemplates := authorized.Group("/section-templates")
		{
			sectionTemplates.GET("", sectionTemplateHandler.GetAll)
		}

		// ---- Template API cho user thường (trang "chọn mẫu") ----
		// Chỉ ĐỌC. Handler tự lọc theo user đang đăng nhập: mẫu hệ thống đã
		// publish + mẫu của chính họ. Quyền tạo/sửa/xoá nằm ở nhóm /admin.
		templates := authorized.Group("/templates")
		{
			templates.GET("", templateHandler.ListForUser)
		}

		// ----Image Upload API ----
		upload := authorized.Group("/upload")
		{
			upload.POST("", assetHandler.UploadImage)
			upload.GET("/assets", assetHandler.GetAssets)
		}

		// ---- Payment API (User) ----
		payment := authorized.Group("/payment")
		{
			payment.POST("/upgrade", paymentHandler.UpgradeToPro)
		}

		// Project — BE Dev 2
		// authorized.GET("/projects", projectHandler.List)
		// authorized.POST("/projects", projectHandler.Create)

		// Landing Page — BE Dev 2
		// authorized.GET("/landing-pages/:id", lpHandler.Get)

		// Section editing — BE Dev 2 / BE Dev 3
		// authorized.POST("/landing-pages/:id/sections", sectionHandler.Add)

		// Media upload — BE Dev 3
		// authorized.POST("/media/upload", mediaHandler.Upload)

		// Publish — chỉ gói Pro (BE Dev 3)
		// authorized.POST("/landing-pages/:id/publish", middleware.ProRequired(), publishHandler.Publish)

		// Export — BE Dev 1
		// authorized.GET("/landing-pages/:id/export/pdf", exportHandler.PDF)

		// Subscription — BE Dev 1
		// authorized.GET("/subscription", subHandler.Get)
	}

	// Route admin (cần quyền admin).
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(cfg.JWTSecret, userRepo), middleware.AdminRequired())
	{
		// System template management
		admin.POST("/templates", templateHandler.Create)
		admin.GET("/templates", templateHandler.List)
		admin.GET("/templates/:id", templateHandler.GetByID)
		admin.PUT("/templates/:id", templateHandler.Update)
		admin.PUT("/templates/:id/sections", templateHandler.ReplaceSections) // builder bấm "Xuất bản"
		admin.DELETE("/templates/:id", templateHandler.Delete)
		admin.POST("/templates/upload", uploadHandler.UploadTemplateFile)

		// Pricing Plans — bảng giá hiển thị. DELETE chỉ xoá dòng bảng giá,
		// KHÔNG đụng tới gói hiện tại của user (app_user.plan_type là ENUM riêng);
		// muốn ngừng bán mà giữ dữ liệu thì PUT với is_active = false.
		admin.GET("/plans", planHandler.List)
		admin.POST("/plans", planHandler.Create)
		admin.GET("/plans/:id", planHandler.GetByID)
		admin.PUT("/plans/:id", planHandler.Update)
		admin.DELETE("/plans/:id", planHandler.Delete)

		// Settings — cấu hình hệ thống (platform + AI engine).
		// Nhóm "account" trong response lấy từ app_user của admin đang đăng nhập
		// và được sửa qua PUT /profile, KHÔNG sửa qua đây.
		admin.GET("/settings", settingsHandler.Get)
		admin.PUT("/settings", settingsHandler.Update)
		admin.POST("/settings/logo", settingsHandler.UploadLogo)

		// Dashboard — số liệu tổng quan + log AI toàn hệ thống.
		admin.GET("/stats", statsHandler.GetDashboardStats)
		admin.GET("/ai/logs", aiHandler.AdminLogs)

		// User management — trang admin Users.
		// DELETE là XOÁ CỨNG, kéo theo project/landing page của user (CASCADE);
		// muốn tạm khoá thì PUT với is_active = false.
		admin.GET("/users", adminUserHandler.List)
		admin.POST("/users", adminUserHandler.Create)
		admin.GET("/users/:id", adminUserHandler.GetByID)
		admin.PUT("/users/:id", adminUserHandler.Update)
		admin.DELETE("/users/:id", adminUserHandler.Delete)

		// Project management — xem dự án của MỌI user (khác /projects chỉ trả
		// dự án của chính mình). DELETE là xoá cứng, kéo theo landing page.
		admin.GET("/projects", adminProjectHandler.List)
		admin.DELETE("/projects/:id", adminProjectHandler.Delete)

		// Media upload
		admin.POST("/media/upload", uploadHandler.UploadThumbnail)

		// Section library — thư viện section dùng chung, chỉ admin được ghi.
		// Bản GET ở nhóm authorized bên trên trả toàn bộ (cho panel editor);
		// bản ở đây có phân trang + đếm used_in cho trang quản trị.
		admin.POST("/section-templates", sectionTemplateHandler.Create)
		admin.GET("/section-templates", sectionTemplateHandler.List)
		admin.GET("/section-templates/:id", sectionTemplateHandler.GetByID)
		admin.PUT("/section-templates/:id", sectionTemplateHandler.Update)
		admin.DELETE("/section-templates/:id", sectionTemplateHandler.Delete)
	}

	// Route công khai serve landing page đã publish (không cần đăng nhập).
	// Trả thẳng HTML đã đóng băng trong snapshot; slug lạ -> trang 404 đơn giản.
	r.GET("/p/:slug", staticHandler.ServePublic)

	return r
}
