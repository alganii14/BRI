package controllers

import (
	"pipeline-backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type UkerController struct {
	DB *gorm.DB
}

func NewUkerController(db *gorm.DB) *UkerController {
	return &UkerController{DB: db}
}

// GetAll - Get all Ukers with pagination and filters
func (c *UkerController) GetAll(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	kodeUker := ctx.Query("kode_uker", "")
	region := ctx.Query("region", "")
	active := ctx.Query("active", "")

	offset := (page - 1) * limit

	var ukers []models.Uker
	var total int64

	query := c.DB.Model(&models.Uker{})

	// Filter by kode_uker if provided
	if kodeUker != "" {
		query = query.Where("kode_uker = ?", kodeUker)
	}

	// Filter by region if provided
	if region != "" {
		query = query.Where("region = ?", region)
	}

	// Filter by active status if provided
	if active != "" {
		query = query.Where("ACTIVE = ?", active)
	}

	// Search filter
	if search != "" {
		query = query.Where("kode_uker LIKE ? OR nama_uker LIKE ? OR main_branch LIKE ? OR region LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	if err := query.Offset(offset).Limit(limit).Order("id ASC").Find(&ukers).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch Ukers"})
	}

	return ctx.JSON(fiber.Map{
		"data":  ukers,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetByID - Get single Uker by ID
func (c *UkerController) GetByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	var uker models.Uker
	if err := c.DB.First(&uker, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Uker not found"})
	}

	return ctx.JSON(uker)
}

// GetByKodeUker - Get single Uker by kode_uker
func (c *UkerController) GetByKodeUker(ctx *fiber.Ctx) error {
	kodeUker := ctx.Params("kode_uker")

	var uker models.Uker
	if err := c.DB.Where("kode_uker = ?", kodeUker).First(&uker).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Uker not found"})
	}

	return ctx.JSON(uker)
}

// Create - Create new Uker
func (c *UkerController) Create(ctx *fiber.Ctx) error {
	uker := new(models.Uker)

	if err := ctx.BodyParser(uker); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if uker.KodeUker == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Kode Uker is required"})
	}

	if uker.NamaUker == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Nama Uker is required"})
	}

	// Check if kode_uker already exists
	var existing models.Uker
	if err := c.DB.Where("kode_uker = ?", uker.KodeUker).First(&existing).Error; err == nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Kode Uker already exists"})
	}

	if err := c.DB.Create(&uker).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to create Uker"})
	}

	return ctx.Status(201).JSON(uker)
}

// Update - Update existing Uker
func (c *UkerController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	var uker models.Uker
	if err := c.DB.First(&uker, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Uker not found"})
	}

	if err := ctx.BodyParser(&uker); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if uker.KodeUker == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Kode Uker is required"})
	}

	if uker.NamaUker == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Nama Uker is required"})
	}

	if err := c.DB.Save(&uker).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to update Uker"})
	}

	return ctx.JSON(uker)
}

// Delete - Delete Uker (hard delete, no soft delete for this table)
func (c *UkerController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	var uker models.Uker
	if err := c.DB.First(&uker, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Uker not found"})
	}

	if err := c.DB.Unscoped().Delete(&uker).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to delete Uker"})
	}

	return ctx.JSON(fiber.Map{"message": "Uker deleted successfully"})
}

// GetRegions - Get list of unique regions
func (c *UkerController) GetRegions(ctx *fiber.Ctx) error {
	var regions []string
	if err := c.DB.Model(&models.Uker{}).Distinct("region").Pluck("region", &regions).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch regions"})
	}

	return ctx.JSON(regions)
}

// GetUkerTypes - Get list of unique uker types
func (c *UkerController) GetUkerTypes(ctx *fiber.Ctx) error {
	var types []string
	if err := c.DB.Model(&models.Uker{}).Distinct("uker_type").Pluck("uker_type", &types).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch uker types"})
	}

	return ctx.JSON(types)
}
