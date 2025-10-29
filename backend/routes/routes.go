package routes

import (
	"pipeline-backend/config"
	"pipeline-backend/controllers"
	"pipeline-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes configures all application routes
func SetupRoutes(app *fiber.App) {
	// API group
	api := app.Group("/api")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Pipeline API is running",
		})
	})

	// Get database instance
	db := config.GetDB()

	// Auth routes (Public - tidak perlu JWT)
	authController := controllers.NewAuthController(db)
	auth := api.Group("/auth")
	auth.Post("/login", authController.Login)
	auth.Post("/register", authController.Register)

	// Protected routes - require JWT token
	protected := api.Group("/", middleware.JWTMiddleware())
	protected.Get("/profile", authController.GetProfile)
	protected.Post("/change-password", authController.ChangePassword)

	// Initialize controllers
	di319Controller := controllers.NewDI319ImportController(db)

	// Dashboard stats (protected) - Now uses DI319 data
	protected.Get("/stats", di319Controller.GetStats)

	// RFMT routes (Protected)
	rfmtController := controllers.NewRFMTController(db)
	rfmts := protected.Group("/rfmts")
	rfmts.Get("/", rfmtController.GetAll)
	rfmts.Get("/search-ukers", rfmtController.SearchUkers)          // Must be before /:id
	rfmts.Post("/import", rfmtController.ImportCSV)                 // Must be before /:id
	rfmts.Get("/import/progress", rfmtController.GetImportProgress) // Must be before /:id
	rfmts.Delete("/all", rfmtController.DeleteAll)                  // Must be before /:id
	rfmts.Get("/pipeline/:pn", rfmtController.GetByPipelinePN)
	rfmts.Get("/:id", rfmtController.GetByID)
	rfmts.Post("/", rfmtController.Create)
	rfmts.Put("/:id", rfmtController.Update)
	rfmts.Delete("/:id", rfmtController.Delete)

	// Uker routes (Protected)
	ukerController := controllers.NewUkerController(db)
	ukers := protected.Group("/ukers")
	ukers.Get("/", ukerController.GetAll)
	ukers.Get("/regions", ukerController.GetRegions)            // Must be before /:id
	ukers.Get("/types", ukerController.GetUkerTypes)            // Must be before /:id
	ukers.Get("/kode/:kode_uker", ukerController.GetByKodeUker) // Get by kode_uker
	ukers.Get("/:id", ukerController.GetByID)
	ukers.Post("/", ukerController.Create)
	ukers.Put("/:id", ukerController.Update)
	ukers.Delete("/:id", ukerController.Delete)

	// Product Type routes (Protected)
	productTypeController := controllers.NewProductTypeController(db)
	productTypes := protected.Group("/product-types")
	productTypes.Get("/", productTypeController.GetAll)
	productTypes.Get("/kode/:kode_product", productTypeController.GetByKodeProduct) // Must be before /:id
	productTypes.Get("/:id", productTypeController.GetByID)
	productTypes.Post("/", productTypeController.Create)
	productTypes.Put("/:id", productTypeController.Update)
	productTypes.Delete("/:id", productTypeController.Delete)

	// DI319 Import routes (Protected - same as pipeline import)
	di319 := protected.Group("/di319")
	di319.Get("/", di319Controller.GetAll)
	di319.Post("/import", di319Controller.ImportCSV)
	di319.Get("/import/progress", di319Controller.GetImportProgress)
	di319.Delete("/all", di319Controller.DeleteAll)
}
