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
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // production nên giới hạn domain cụ thể
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
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

	// --- Routes ---
	api := r.Group("/api/v1")

	// Auth (công khai)
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Các nhóm route cần đăng nhập.
	// TODO(team): mỗi người tự thêm handler tương ứng với feature của mình.
	authorized := api.Group("/")
	authorized.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		// ---- Profile API ----
		authorized.GET("/profile", userHandler.GetProfile)
		authorized.PUT("/profile", userHandler.UpdateProfile)

		// Project — BE Dev 2
		// authorized.GET("/projects", projectHandler.List)
		// authorized.POST("/projects", projectHandler.Create)

		// Landing Page — BE Dev 2
		// authorized.GET("/landing-pages/:id", lpHandler.Get)

		// Section editing — BE Dev 2 / BE Dev 3
		// authorized.POST("/landing-pages/:id/sections", sectionHandler.Add)

		// Media upload — BE Dev 3
		// authorized.POST("/media/upload", mediaHandler.Upload)

		// Publish — BE Dev 3
		// authorized.POST("/landing-pages/:id/publish", publishHandler.Publish)

		// Export — BE Dev 1
		// authorized.GET("/landing-pages/:id/export/pdf", exportHandler.PDF)

		// Subscription — BE Dev 1
		// authorized.GET("/subscription", subHandler.Get)
	}

	// Route admin (cần quyền admin).
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.AdminRequired())
	{
		// System template management — BE Dev 2
		// admin.POST("/templates", templateHandler.CreateSystem)
		// Section library — BE Dev 3
		// admin.POST("/section-library", libHandler.Create)
	}

	// Route công khai serve landing page đã publish (không cần đăng nhập).
	// r.GET("/p/:slug", publishHandler.ServePublic)

	return r
}

