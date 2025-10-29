package controllers

import (
	"pipeline-backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ProductTypeController struct {
	DB *gorm.DB
}

func NewProductTypeController(db *gorm.DB) *ProductTypeController {
	return &ProductTypeController{DB: db}
}

// GetAll - Get all product types with pagination and search
func (c *ProductTypeController) GetAll(ctx *fiber.Ctx) error {
	var productTypes []models.ProductType
	var total int64

	// Pagination
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.Query("page_size", "10"))
	offset := (page - 1) * pageSize

	// Search
	search := ctx.Query("search", "")

	query := c.DB.Model(&models.ProductType{})

	if search != "" {
		query = query.Where("kode_product LIKE ? OR nama_product LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Count total
	query.Count(&total)

	// Get data
	if err := query.Offset(offset).Limit(pageSize).Order("kode_product ASC").Find(&productTypes).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"data": productTypes,
		"meta": fiber.Map{
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// GetByID - Get product type by ID
func (c *ProductTypeController) GetByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var productType models.ProductType

	if err := c.DB.First(&productType, id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product type not found",
		})
	}

	return ctx.JSON(fiber.Map{
		"data": productType,
	})
}

// GetByKodeProduct - Get product type by kode_product
func (c *ProductTypeController) GetByKodeProduct(ctx *fiber.Ctx) error {
	kodeProduct := ctx.Params("kode_product")
	var productType models.ProductType

	if err := c.DB.Where("kode_product = ?", kodeProduct).First(&productType).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product type not found",
		})
	}

	return ctx.JSON(fiber.Map{
		"data": productType,
	})
}

// Create - Create new product type
func (c *ProductTypeController) Create(ctx *fiber.Ctx) error {
	var productType models.ProductType

	if err := ctx.BodyParser(&productType); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if productType.KodeProduct == "" || productType.NamaProduct == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "kode_product and nama_product are required",
		})
	}

	// Check if kode_product already exists
	var existing models.ProductType
	if err := c.DB.Where("kode_product = ?", productType.KodeProduct).First(&existing).Error; err == nil {
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Product type with this kode_product already exists",
		})
	}

	if err := c.DB.Create(&productType).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Product type created successfully",
		"data":    productType,
	})
}

// Update - Update product type
func (c *ProductTypeController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var productType models.ProductType

	if err := c.DB.First(&productType, id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product type not found",
		})
	}

	var updateData models.ProductType
	if err := ctx.BodyParser(&updateData); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if updateData.KodeProduct == "" || updateData.NamaProduct == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "kode_product and nama_product are required",
		})
	}

	// Check if new kode_product already exists (except current record)
	var existing models.ProductType
	if err := c.DB.Where("kode_product = ? AND id != ?", updateData.KodeProduct, id).First(&existing).Error; err == nil {
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Product type with this kode_product already exists",
		})
	}

	productType.KodeProduct = updateData.KodeProduct
	productType.NamaProduct = updateData.NamaProduct

	if err := c.DB.Save(&productType).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"message": "Product type updated successfully",
		"data":    productType,
	})
}

// Delete - Delete product type
func (c *ProductTypeController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var productType models.ProductType

	if err := c.DB.First(&productType, id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product type not found",
		})
	}

	if err := c.DB.Delete(&productType).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"message": "Product type deleted successfully",
	})
}
