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

	// CORS — cho phép frontend gọi API.
	// AllowCredentials không dùng vì auth qua Bearer token, không phải cookie.
	// Production nên đổi AllowOrigins thành domain cụ thể thay vì "*".
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
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

	// Landing Page dependency
	pageRepo := repository.NewLandingPageRepository(db)
	pageService := service.NewLandingPageService(pageRepo, projectRepo)
	pageHandler := handlers.NewLandingPageHandler(pageService)

	// Section dependency
	sectionRepo := repository.NewPageSectionRepository(db)
	sectionService := service.NewPageSectionService(sectionRepo, pageService) // Truyền pageService vào
	sectionHandler := handlers.NewPageSectionHandler(sectionService)

	// Snapshot dependency
	snapshotRepo := repository.NewSnapshotRepository(db)
	snapshotService := service.NewSnapshotService(snapshotRepo, pageService, sectionRepo)
	snapshotHandler := handlers.NewSnapshotHandler(snapshotService)

	// Section Template Library dependency
	sectionTemplateRepo := repository.NewSectionTemplateRepository(db)
	sectionTemplateService := service.NewSectionTemplateService(sectionTemplateRepo)
	sectionTemplateHandler := handlers.NewSectionTemplateHandler(sectionTemplateService)

	templateRepo := repository.NewTemplateRepository(db)
	templateService := service.NewTemplateService(templateRepo)
	templateHandler := handlers.NewTemplateHandler(templateService)

	uploadHandler := handlers.NewUploadHandler()

	// Serve file tĩnh đã upload (thumbnail, template file).
	r.Static("/uploads", "./uploads")

	// --- Routes ---
	api := r.Group("/api/v1")

	// Auth (công khai)
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// ---- PUBLIC API (Không cần Token) ----
	publicAPI := api.Group("/p")
	{
		// Link public xem Landing Page
		publicAPI.GET("/:url", snapshotHandler.ViewPublicPage) 
	}

	// Các nhóm route cần đăng nhập.
	// TODO(team): mỗi người tự thêm handler tương ứng với feature của mình.
	authorized := api.Group("/")
	authorized.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		// ---- Profile API ----
		authorized.GET("/profile", userHandler.GetProfile)
		authorized.PUT("/profile", userHandler.UpdateProfile)

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

			//Nút bấm Publish
			pages.POST("/:id/publish", snapshotHandler.Publish)
		}

		// ---- Section API ----
		sections := authorized.Group("/sections")
		{
			sections.POST("", sectionHandler.Create)
			sections.GET("", sectionHandler.GetAll) // GET /sections?page_id=...
			sections.PUT("/:id", sectionHandler.Update)
			sections.DELETE("/:id", sectionHandler.Delete)
		}

		// ---- Section Template Library API ----
		sectionTemplates := authorized.Group("/section-templates")
		{
			sectionTemplates.POST("", sectionTemplateHandler.Create)
			sectionTemplates.GET("", sectionTemplateHandler.GetAll)
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
	admin.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.AdminRequired())
	{
		// System template management
		admin.POST("/templates", templateHandler.Create)
		admin.GET("/templates", templateHandler.List)
		admin.GET("/templates/:id", templateHandler.GetByID)
		admin.PUT("/templates/:id", templateHandler.Update)
		admin.DELETE("/templates/:id", templateHandler.Delete)
		admin.POST("/templates/upload", uploadHandler.UploadTemplateFile)

		// Media upload
		admin.POST("/media/upload", uploadHandler.UploadThumbnail)

		// Section library — BE Dev 3
		// admin.POST("/section-library", libHandler.Create)
	}

	// Route công khai serve landing page đã publish (không cần đăng nhập).
	// r.GET("/p/:slug", publishHandler.ServePublic)

	return r
}

