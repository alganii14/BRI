package controllers

import (
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"pipeline-backend/models"
	"strconv"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type RFMTController struct {
	DB *gorm.DB
}

// Import progress tracking
var (
	importStatus   = "idle"
	importProgress = 0
	importTotal    = 0
	importMessage  = "No import in progress"
	importMutex    sync.RWMutex
)

func NewRFMTController(db *gorm.DB) *RFMTController {
	return &RFMTController{DB: db}
}

// GetAll - Get all RFMTs with pagination and filters
func (c *RFMTController) GetAll(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	pn := ctx.Query("pn", "")

	offset := (page - 1) * limit

	var rfmts []models.RFMT
	var total int64

	query := c.DB.Model(&models.RFMT{}).Preload("UkerRelation")

	// Filter by PN if provided
	if pn != "" {
		query = query.Where("pn = ?", pn)
	}

	// Search filter
	if search != "" {
		query = query.Where("pn LIKE ? OR nama_lengkap LIKE ? OR jg LIKE ? OR kanca LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&rfmts).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch RFMTs"})
	}

	return ctx.JSON(fiber.Map{
		"data":  rfmts,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetByID - Get single RFMT by ID
func (c *RFMTController) GetByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	var rfmt models.RFMT
	if err := c.DB.Preload("UkerRelation").First(&rfmt, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "RFMT not found"})
	}

	return ctx.JSON(rfmt)
}

// Create - Create new RFMT
func (c *RFMTController) Create(ctx *fiber.Ctx) error {
	rfmt := new(models.RFMT)

	if err := ctx.BodyParser(rfmt); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if rfmt.PN == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "PN is required"})
	}

	if err := c.DB.Create(&rfmt).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to create RFMT"})
	}

	// Load uker relation if exists
	c.DB.Preload("UkerRelation").First(&rfmt, rfmt.ID)

	return ctx.Status(201).JSON(rfmt)
}

// Update - Update existing RFMT
func (c *RFMTController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	var rfmt models.RFMT
	if err := c.DB.First(&rfmt, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "RFMT not found"})
	}

	if err := ctx.BodyParser(&rfmt); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if rfmt.PN == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "PN is required"})
	}

	if err := c.DB.Save(&rfmt).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to update RFMT"})
	}

	// Load uker relation if exists
	c.DB.Preload("UkerRelation").First(&rfmt, rfmt.ID)

	return ctx.JSON(rfmt)
}

// Delete - Soft delete RFMT
func (c *RFMTController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	var rfmt models.RFMT
	if err := c.DB.First(&rfmt, id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "RFMT not found"})
	}

	if err := c.DB.Delete(&rfmt).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to delete RFMT"})
	}

	return ctx.JSON(fiber.Map{"message": "RFMT deleted successfully"})
}

// GetByPipelinePN - Get all RFMTs for a specific pipeline by PN
func (c *RFMTController) GetByPipelinePN(ctx *fiber.Ctx) error {
	pn := ctx.Params("pn")

	var rfmts []models.RFMT
	if err := c.DB.Where("pn = ?", pn).Order("created_at DESC").Find(&rfmts).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch RFMTs"})
	}

	return ctx.JSON(rfmts)
}

// SearchUkers - Search ukers for selection in RFMT form
func (c *RFMTController) SearchUkers(ctx *fiber.Ctx) error {
	search := ctx.Query("search", "")

	var ukers []models.Uker
	query := c.DB.Model(&models.Uker{}).Where("ACTIVE = ?", "Y")

	if search != "" {
		query = query.Where("kode_uker LIKE ? OR nama_uker LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Limit(50).Order("kode_uker ASC").Find(&ukers).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to search ukers"})
	}

	return ctx.JSON(ukers)
}

// ImportCSV - Import RFMT data from CSV
func (c *RFMTController) ImportCSV(ctx *fiber.Ctx) error {
	// Check if import is already running
	importMutex.RLock()
	if importStatus == "processing" {
		importMutex.RUnlock()
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Import already in progress",
		})
	}
	importMutex.RUnlock()

	// Get file from request
	file, err := ctx.FormFile("file")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No file uploaded",
		})
	}

	// Validate file type
	if !strings.HasSuffix(file.Filename, ".csv") {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File must be CSV",
		})
	}

	// Ensure uploads directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to create uploads directory: %v", err),
		})
	}

	// Save uploaded file temporarily
	tempFile := filepath.Join(uploadDir, file.Filename)
	if err := ctx.SaveFile(file, tempFile); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to save uploaded file: %v", err),
		})
	}

	// Start import in background
	go c.processCSVImport(tempFile)

	return ctx.JSON(fiber.Map{
		"message":  "CSV import started",
		"filename": file.Filename,
		"size":     file.Size,
	})
}

// processCSVImport - Process CSV import in background
func (c *RFMTController) processCSVImport(filePath string) {
	// Set import status
	importMutex.Lock()
	importStatus = "processing"
	importProgress = 0
	importTotal = 0
	importMessage = "Starting import..."
	importMutex.Unlock()

	// Clean up temp file when done
	defer os.Remove(filePath)

	// Open CSV file
	file, err := os.Open(filePath)
	if err != nil {
		importMutex.Lock()
		importStatus = "error"
		importMessage = fmt.Sprintf("Failed to open file: %v", err)
		importMutex.Unlock()
		return
	}
	defer file.Close()

	// Create CSV reader with semicolon delimiter
	reader := csv.NewReader(file)
	reader.Comma = ';'
	reader.LazyQuotes = true
	reader.TrimLeadingSpace = true

	// Read header
	header, err := reader.Read()
	if err != nil {
		importMutex.Lock()
		importStatus = "error"
		importMessage = fmt.Sprintf("Failed to read header: %v", err)
		importMutex.Unlock()
		return
	}

	// Verify header format
	if len(header) < 9 {
		importMutex.Lock()
		importStatus = "error"
		importMessage = "Invalid CSV format: insufficient columns"
		importMutex.Unlock()
		return
	}

	// Count total rows first
	var records [][]string
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}
		records = append(records, record)
	}

	importMutex.Lock()
	importTotal = len(records)
	importMessage = fmt.Sprintf("Processing %d records...", importTotal)
	importMutex.Unlock()

	// Process records in batches
	batchSize := 100
	var batch []models.RFMT

	for i, record := range records {
		if len(record) < 9 {
			continue
		}

		// Skip empty PN
		pn := strings.TrimSpace(record[0])
		if pn == "" {
			continue
		}

		// CSV columns: PN;Nama Lengkap;JG;ESGDESC;Kanca;Uker;Uker Tujuan;Keterangan;Kelompok Jabatan RMFT Baru
		rfmt := models.RFMT{
			PN:                  pn,                           // Column 0
			NamaLengkap:         strings.TrimSpace(record[1]), // Column 1
			JG:                  strings.TrimSpace(record[2]), // Column 2
			ESGDESC:             strings.TrimSpace(record[3]), // Column 3
			Kanca:               strings.TrimSpace(record[4]), // Column 4
			Uker:                strings.TrimSpace(record[5]), // Column 5
			UkerTujuan:          strings.TrimSpace(record[6]), // Column 6
			Keterangan:          strings.TrimSpace(record[7]), // Column 7
			KelompokJabatanRMFT: strings.TrimSpace(record[8]), // Column 8
		}

		// Try to match with uker table (optional)
		var uker models.Uker
		if err := c.DB.Where("nama_uker LIKE ?", "%"+rfmt.Kanca+"%").
			Where("ACTIVE = ?", "Y").
			First(&uker).Error; err == nil {
			rfmt.UkerID = &uker.ID
		}

		batch = append(batch, rfmt)

		// Insert batch when it reaches batch size or last record
		if len(batch) >= batchSize || i == len(records)-1 {
			if err := c.DB.CreateInBatches(batch, batchSize).Error; err != nil {
				importMutex.Lock()
				importStatus = "error"
				importMessage = fmt.Sprintf("Failed to insert batch: %v", err)
				importMutex.Unlock()
				return
			}
			batch = nil
		}

		// Update progress
		importMutex.Lock()
		importProgress = i + 1
		importMessage = fmt.Sprintf("Processed %d of %d records", importProgress, importTotal)
		importMutex.Unlock()
	}

	// Mark as completed
	importMutex.Lock()
	importStatus = "completed"
	importMessage = fmt.Sprintf("Successfully imported %d records", importTotal)
	importMutex.Unlock()
}

// GetImportProgress - Get import progress
func (c *RFMTController) GetImportProgress(ctx *fiber.Ctx) error {
	importMutex.RLock()
	defer importMutex.RUnlock()

	percentage := 0
	if importTotal > 0 {
		percentage = (importProgress * 100) / importTotal
	}

	return ctx.JSON(fiber.Map{
		"status":     importStatus,
		"progress":   importProgress,
		"total":      importTotal,
		"percentage": percentage,
		"message":    importMessage,
	})
}

// DeleteAll - Delete all RFMT records
func (c *RFMTController) DeleteAll(ctx *fiber.Ctx) error {
	if err := c.DB.Exec("DELETE FROM rfmts").Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"message": "All RFMT records deleted successfully",
	})
}
