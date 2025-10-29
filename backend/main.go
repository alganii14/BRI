package main

import (
	"log"
	"os"
	"pipeline-backend/config"
	"pipeline-backend/models"
	"pipeline-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load environment variables
	config.LoadEnv()

	// Connect to database
	config.ConnectDatabase()

	// Auto migrate database schema
	db := config.GetDB()

	// Drop all tables first (fresh start) - EXCEPT uker table which has existing data
	log.Println("🗑️  Dropping existing tables...")
	db.Migrator().DropTable(&models.RFMT{})
	log.Println("✅ Tables dropped successfully!")

	// Users table - for authentication
	log.Println("📦 Creating users table...")
	err := db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("Failed to migrate User:", err)
	}

	// Create default admin user if not exists
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		adminUser := models.User{
			Username: "admin",
			FullName: "Administrator",
			Email:    "admin@pipeline.com",
			Role:     "admin",
			IsActive: true,
		}
		adminUser.HashPassword("admin123") // Default password
		if err := db.Create(&adminUser).Error; err != nil {
			log.Println("⚠️  Failed to create default admin user:", err)
		} else {
			log.Println("✅ Default admin user created (username: admin, password: admin123)")
		}
	}

	// Uker table already exists with data - ensure it's migrated first (parent table)
	log.Println("📦 Registering uker table (existing data preserved)...")
	if db.Migrator().HasTable(&models.Uker{}) {
		log.Println("✅ Uker table found with existing data")
	} else {
		log.Println("⚠️  Warning: Uker table not found in database")
	}

	// DI319 table already exists with data
	log.Println("📦 Registering di319 table (existing data preserved)...")
	if db.Migrator().HasTable(&models.DI319{}) {
		log.Println("✅ DI319 table found with existing data")
	} else {
		log.Println("⚠️  Warning: DI319 table not found in database")
	}

	// Migrate product_type table
	log.Println("📦 Creating product_type table...")
	if err = db.AutoMigrate(&models.ProductType{}); err != nil {
		log.Fatal("Failed to migrate ProductType:", err)
	}

	// Then migrate RFMTs (child table with FK to uker)
	log.Println("📦 Creating rfmts table with FK constraints (uker)...")
	if err = db.AutoMigrate(&models.RFMT{}); err != nil {
		log.Fatal("Failed to migrate RFMT:", err)
	}

	log.Println("✅ Database migration completed! All tables created with FK relationships.") // Create Fiber app
	app := fiber.New(fiber.Config{
		BodyLimit: 1024 * 1024 * 1024, // 1GB for large CSV files
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Setup routes
	routes.SetupRoutes(app)

	// Start server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on http://localhost:%s\n", port)
	log.Printf("📊 API Documentation: http://localhost:%s/api/health\n", port)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
