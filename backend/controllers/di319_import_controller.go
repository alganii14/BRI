package controllers

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"pipeline-backend/models"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DI319ImportController struct {
	DB *gorm.DB
}

func NewDI319ImportController(db *gorm.DB) *DI319ImportController {
	return &DI319ImportController{DB: db}
}

var (
	di319ImportProgress     = 0
	di319ImportTotal        = 0
	di319ImportStatus       = "idle"
	di319ImportMessage      = ""
	di319ImportMutex        sync.Mutex
	di319FilteredPercentage = 0.0
)

// ImportCSV - Import all DI319 data without filtering
func (c *DI319ImportController) ImportCSV(ctx *fiber.Ctx) error {
	// Check if import is already running
	di319ImportMutex.Lock()
	if di319ImportStatus == "processing" {
		di319ImportMutex.Unlock()
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Import already in progress",
		})
	}
	di319ImportStatus = "processing"
	di319ImportProgress = 0
	di319ImportTotal = 0
	di319ImportMessage = "Starting import..."
	di319FilteredPercentage = 0.0
	di319ImportMutex.Unlock()

	// Get file from request
	file, err := ctx.FormFile("file")
	if err != nil {
		di319ImportMutex.Lock()
		di319ImportStatus = "error"
		di319ImportMessage = "No file uploaded"
		di319ImportMutex.Unlock()
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No file uploaded",
		})
	}

	// Validate file type
	if !strings.HasSuffix(file.Filename, ".csv") {
		di319ImportMutex.Lock()
		di319ImportStatus = "error"
		di319ImportMessage = "File must be CSV"
		di319ImportMutex.Unlock()
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File must be CSV",
		})
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		di319ImportMutex.Lock()
		di319ImportStatus = "error"
		di319ImportMessage = "Failed to open file"
		di319ImportMutex.Unlock()
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to open file",
		})
	}
	defer src.Close()

	// Parse CSV - auto-detect delimiter and skip to header
	reader := csv.NewReader(src)

	// Try to detect delimiter and find header
	var header []string
	var headerIndex int
	delimiter := ';'

	// Read first few lines to detect format
	tempLines := [][]string{}
	for i := 0; i < 10; i++ {
		reader.Comma = ','
		line, err := reader.Read()
		if err != nil {
			break
		}
		tempLines = append(tempLines, line)

		// Check if this line contains CIFNO or periode (header indicators)
		lineStr := strings.Join(line, ",")
		if strings.Contains(lineStr, "CIFNO") || strings.Contains(lineStr, "periode") {
			header = line
			headerIndex = i
			// Detected comma format
			delimiter = ','
			break
		}
	}

	// If no header found with comma, try semicolon
	if header == nil {
		src.Close()
		src, _ = file.Open()
		reader = csv.NewReader(src)
		reader.Comma = ';'

		for i := 0; i < 10; i++ {
			line, err := reader.Read()
			if err != nil {
				break
			}
			lineStr := strings.Join(line, ";")
			if strings.Contains(lineStr, "periode") || strings.Contains(lineStr, "branch") {
				header = line
				headerIndex = i
				delimiter = ';'
				break
			}
		}
	}

	if header == nil {
		di319ImportMutex.Lock()
		di319ImportStatus = "error"
		di319ImportMessage = "Failed to find CSV header"
		di319ImportMutex.Unlock()
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to find CSV header",
		})
	}

	log.Printf("CSV Header found at line %d with delimiter '%c': %v", headerIndex+1, delimiter, header)

	// Reset reader to continue from after header
	src.Close()
	src, _ = file.Open()
	reader = csv.NewReader(src)
	reader.Comma = delimiter

	// Skip lines before header
	for i := 0; i <= headerIndex; i++ {
		reader.Read()
	}

	// Process in background
	go func() {
		var di319Records []models.DI319
		var filteredCount int
		lineNumber := headerIndex + 1 // Start counting from header

		// Create header map for flexible column mapping
		headerMap := make(map[string]int)
		for i, col := range header {
			headerMap[strings.TrimSpace(strings.ToLower(col))] = i
		}

		// Helper to get field by name with fallbacks
		getField := func(record []string, names ...string) string {
			for _, name := range names {
				if idx, ok := headerMap[strings.ToLower(name)]; ok && idx < len(record) {
					return strings.TrimSpace(record[idx])
				}
			}
			return ""
		}

		for {
			record, err := reader.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				log.Printf("Error reading line %d: %v", lineNumber, err)
				lineNumber++

				di319ImportMutex.Lock()
				di319ImportTotal = lineNumber - headerIndex - 1
				di319ImportMutex.Unlock()
				continue
			}

			lineNumber++

			di319ImportMutex.Lock()
			di319ImportTotal = lineNumber - headerIndex - 1
			di319ImportMutex.Unlock()

			// Parse DI319 record with flexible mapping
			di319 := models.DI319{}

			// Periode - try multiple field names and formats
			periodeStr := getField(record, "periode", "textbox16", "date")
			if periodeStr != "" {
				// Try multiple date formats (with and without leading zeros)
				var periodeDate time.Time
				var err error

				// Try dd/MM/yyyy format first (with leading zeros)
				if periodeDate, err = time.Parse("02/01/2006", periodeStr); err == nil {
					di319.Periode = periodeDate
				} else if periodeDate, err = time.Parse("2/1/2006", periodeStr); err == nil {
					// Try d/M/yyyy format (without leading zeros)
					di319.Periode = periodeDate
				} else if periodeDate, err = time.Parse("2006-01-02", periodeStr); err == nil {
					// Try yyyy-MM-dd format
					di319.Periode = periodeDate
				} else {
					log.Printf("Line %d: Invalid periode format: %s (error: %v)", lineNumber, periodeStr, err)
					continue
				}
			} else {
				log.Printf("Line %d: Missing periode", lineNumber)
				continue
			}

			// Main Branch
			di319.MainBranch = getField(record, "main_branch", "textbox22", "mainbranch")
			if di319.MainBranch == "" {
				di319.MainBranch = "Unknown"
			}

			// Branch
			di319.Branch = getField(record, "branch", "textbox8", "kode_uker")
			if di319.Branch == "" {
				log.Printf("Line %d: Missing branch", lineNumber)
				continue
			}

			// CIF
			di319.CIF = getField(record, "cif", "cifno", "customer_id")
			if di319.CIF == "" {
				log.Printf("Line %d: Missing CIF", lineNumber)
				continue
			}

			// NoRek
			di319.NoRek = getField(record, "norek", "textbox15", "account_no")
			if di319.NoRek == "" {
				log.Printf("Line %d: Missing norek", lineNumber)
				continue
			}

			// Type
			di319.Type = getField(record, "type", "sccode", "product_type")
			if di319.Type == "" {
				di319.Type = "Unknown"
			}

			// Nama
			di319.Nama = getField(record, "nama", "textbox38", "name", "customer_name")
			if di319.Nama == "" {
				di319.Nama = "Unknown"
			}

			// PN Pengelola - try multiple PN fields
			di319.PNPengelola = getField(record, "pn_pengelola", "pn_relationship_officer", "pn_rm_dana", "pn_singlepn", "pn_rm_pinjaman")
			// Clean up PN format: remove " - " prefix and extract PN number
			if di319.PNPengelola != "" && !strings.HasPrefix(di319.PNPengelola, "-") && di319.PNPengelola != " - " {
				// Remove leading/trailing spaces
				di319.PNPengelola = strings.TrimSpace(di319.PNPengelola)
			} else {
				di319.PNPengelola = "UNKNOWN"
			}

			// Balance
			balanceStr := strings.ReplaceAll(getField(record, "balance", "saldo", "current_balance"), ",", "")
			balanceStr = strings.ReplaceAll(balanceStr, `"`, "")
			if balance, err := strconv.ParseFloat(balanceStr, 64); err == nil {
				di319.Balance = int64(balance)
			} else {
				log.Printf("Line %d: Invalid balance: %s", lineNumber, balanceStr)
				continue
			}

			// Aval Balance
			avalStr := getField(record, "aval_balance", "availbalance", "available_balance")
			di319.AvalBalance = strings.ReplaceAll(strings.ReplaceAll(avalStr, ",", ""), `"`, "")

			// Avg Balance - nullable
			avgBalanceStr := strings.ReplaceAll(getField(record, "avg_balance", "avrgbalance", "average_balance"), ",", "")
			avgBalanceStr = strings.ReplaceAll(avgBalanceStr, `"`, "")
			if avgBalanceStr != "" && avgBalanceStr != "0" && avgBalanceStr != "-" {
				di319.AvgBalance = &avgBalanceStr
			}

			// Open Date
			openDateStr := getField(record, "open_date", "textbox2", "opening_date")
			if openDateStr != "" {
				// Try multiple date formats
				var openDate time.Time
				var err error

				// Try various formats
				formats := []string{
					"1/2/2006",   // M/D/YYYY (e.g., 5/31/2000)
					"2/1/2006",   // D/M/YYYY (e.g., 31/5/2000)
					"01/02/2006", // MM/DD/YYYY
					"02/01/2006", // DD/MM/YYYY
					"2006-01-02", // YYYY-MM-DD
				}

				parsed := false
				for _, format := range formats {
					if openDate, err = time.Parse(format, openDateStr); err == nil {
						di319.OpenDate = openDate
						parsed = true
						break
					}
				}

				if !parsed {
					log.Printf("Line %d: Invalid open_date format: %s (error: %v)", lineNumber, openDateStr, err)
					// Use periode as fallback instead of skipping
					di319.OpenDate = di319.Periode
				}
			} else {
				// Default to periode if no open date
				di319.OpenDate = di319.Periode
			}

			// Save all DI319 records without filtering
			di319Records = append(di319Records, di319)
			filteredCount++

			// Batch insert every 1000 records
			if len(di319Records) >= 1000 {
				if err := c.DB.Create(&di319Records).Error; err != nil {
					log.Printf("Error inserting DI319 batch: %v", err)
				}

				di319ImportMutex.Lock()
				di319ImportProgress += len(di319Records)
				di319ImportMutex.Unlock()

				di319Records = []models.DI319{}
			}
		}

		// Insert remaining records
		if len(di319Records) > 0 {
			if err := c.DB.Create(&di319Records).Error; err != nil {
				log.Printf("Error inserting final DI319 batch: %v", err)
			}
			di319ImportMutex.Lock()
			di319ImportProgress += len(di319Records)
			di319ImportMutex.Unlock()
		}

		// Calculate statistics
		di319ImportMutex.Lock()
		di319ImportTotal = lineNumber - headerIndex - 1 // Total lines processed (excluding header)
		if di319ImportTotal > 0 {
			di319FilteredPercentage = (float64(di319ImportProgress) / float64(di319ImportTotal)) * 100
		}
		di319ImportStatus = "completed"
		di319ImportMessage = fmt.Sprintf("Import completed! Processed %d records, saved all %d records successfully",
			di319ImportTotal, di319ImportProgress)
		di319ImportMutex.Unlock()

		log.Println(di319ImportMessage)
	}()

	return ctx.JSON(fiber.Map{
		"message": "Import started in background",
	})
}

// GetImportProgress - Get import progress
func (c *DI319ImportController) GetImportProgress(ctx *fiber.Ctx) error {
	di319ImportMutex.Lock()
	defer di319ImportMutex.Unlock()

	return ctx.JSON(fiber.Map{
		"status":            di319ImportStatus,
		"imported_rows":     di319ImportProgress, // All records saved
		"total_rows":        di319ImportTotal,    // Total records processed
		"message":           di319ImportMessage,
		"filtered_records":  di319ImportProgress, // Same as imported (all records saved)
		"filter_percentage": di319FilteredPercentage,
	})
}

// DeleteAllDI319 - Delete all DI319 records
func (c *DI319ImportController) DeleteAll(ctx *fiber.Ctx) error {
	if err := c.DB.Exec("DELETE FROM di319").Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"message": "All DI319 records deleted successfully",
	})
}

// GetAll - Get all DI319 records with pagination
func (c *DI319ImportController) GetAll(ctx *fiber.Ctx) error {
	var records []models.DI319
	var total int64

	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.Query("page_size", "10"))
	offset := (page - 1) * pageSize

	search := ctx.Query("search", "")

	query := c.DB.Model(&models.DI319{})

	if search != "" {
		query = query.Where("branch LIKE ? OR nama LIKE ? OR norek LIKE ? OR cif LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("periode DESC, id DESC").Find(&records).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return ctx.JSON(fiber.Map{
		"data": records,
		"pagination": fiber.Map{
			"total_records": total,
			"total_pages":   totalPages,
			"current_page":  page,
			"page_size":     pageSize,
		},
	})
}

// GetStats - Get statistics for dashboard from DI319 data
func (c *DI319ImportController) GetStats(ctx *fiber.Ctx) error {
	// Use raw SQL for maximum performance
	type StatsResult struct {
		Total        int64 `json:"total"`
		TotalBalance int64 `json:"total_balance"`
	}

	type GroupStats struct {
		Name         string `json:"name"`
		Count        int64  `json:"count"`
		TotalBalance int64  `json:"total_balance"`
	}

	var result StatsResult
	var branchStats []GroupStats
	var typeStats []GroupStats

	// Execute all queries in parallel using goroutines
	done := make(chan bool, 3)

	// Query 1: Total count and sum
	go func() {
		c.DB.Raw("SELECT COUNT(*) as total, COALESCE(SUM(balance), 0) as total_balance FROM di319").
			Scan(&result)
		done <- true
	}()

	// Query 2: Branch stats (top 10 branches)
	go func() {
		c.DB.Raw("SELECT branch as name, COUNT(*) as count, COALESCE(SUM(balance), 0) as total_balance FROM di319 GROUP BY branch ORDER BY total_balance DESC LIMIT 10").
			Scan(&branchStats)
		done <- true
	}()

	// Query 3: Type stats
	go func() {
		c.DB.Raw("SELECT type as name, COUNT(*) as count, COALESCE(SUM(balance), 0) as total_balance FROM di319 GROUP BY type").
			Scan(&typeStats)
		done <- true
	}()

	// Wait for all queries to complete
	for i := 0; i < 3; i++ {
		<-done
	}

	// Transform branch stats to match frontend format (as strategy)
	var formattedStrategyStats []struct {
		Strategy      string `json:"strategy"`
		Count         int64  `json:"count"`
		TotalProyeksi int64  `json:"total_proyeksi"`
	}
	for _, s := range branchStats {
		formattedStrategyStats = append(formattedStrategyStats, struct {
			Strategy      string `json:"strategy"`
			Count         int64  `json:"count"`
			TotalProyeksi int64  `json:"total_proyeksi"`
		}{
			Strategy:      s.Name,
			Count:         s.Count,
			TotalProyeksi: s.TotalBalance,
		})
	}

	// Transform type stats to match frontend format (as segment)
	var formattedSegmentStats []struct {
		Segment       string `json:"segment"`
		Count         int64  `json:"count"`
		TotalProyeksi int64  `json:"total_proyeksi"`
	}
	for _, s := range typeStats {
		formattedSegmentStats = append(formattedSegmentStats, struct {
			Segment       string `json:"segment"`
			Count         int64  `json:"count"`
			TotalProyeksi int64  `json:"total_proyeksi"`
		}{
			Segment:       s.Name,
			Count:         s.Count,
			TotalProyeksi: s.TotalBalance,
		})
	}

	return ctx.JSON(fiber.Map{
		"total_pipelines": result.Total,
		"total_proyeksi":  result.TotalBalance,
		"strategy_stats":  formattedStrategyStats,
		"segment_stats":   formattedSegmentStats,
	})
}
