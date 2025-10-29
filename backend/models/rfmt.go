package models

import (
	"time"

	"gorm.io/gorm"
)

type RFMT struct {
	ID                  uint           `gorm:"primarykey" json:"id"`
	UkerID              *int           `gorm:"type:int;index:idx_rfmt_uker_id" json:"uker_id,omitempty"`
	UkerRelation        *Uker          `gorm:"foreignKey:UkerID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:SET NULL" json:"uker_relation,omitempty"`
	PN                  string         `gorm:"type:varchar(50);index:idx_rfmt_pn;not null" json:"pn"`
	NamaLengkap         string         `gorm:"type:varchar(255)" json:"nama_lengkap"`
	JG                  string         `gorm:"type:varchar(50)" json:"jg"`
	ESGDESC             string         `gorm:"type:varchar(100)" json:"esgdesc"`
	Kanca               string         `gorm:"type:varchar(100)" json:"kanca"`
	Uker                string         `gorm:"type:varchar(100)" json:"uker"`
	UkerTujuan          string         `gorm:"type:varchar(100)" json:"uker_tujuan"`
	Keterangan          string         `gorm:"type:text" json:"keterangan"`
	KelompokJabatanRMFT string         `gorm:"type:varchar(100)" json:"kelompok_jabatan_rmft_baru"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
