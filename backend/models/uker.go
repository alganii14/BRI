package models

type Uker struct {
	ID         int    `json:"id" gorm:"primaryKey;autoIncrement:false"`
	KodeUker   string `json:"kode_uker" gorm:"type:varchar(5)"`
	NamaUker   string `json:"nama_uker" gorm:"type:varchar(50)"`
	MainBranch string `json:"main_branch" gorm:"type:varchar(5)"`
	IDMbm      *int   `json:"id_mbm"`
	Region     string `json:"region" gorm:"type:varchar(5)"`
	UkerType   string `json:"uker_type" gorm:"type:varchar(50)"`
	Active     string `json:"active" gorm:"type:varchar(2);default:Y;column:ACTIVE"`
	NewUker    string `json:"new_uker" gorm:"type:varchar(10)"`
	Cluster    string `json:"cluster" gorm:"type:varchar(100);not null"`
	IDArea     string `json:"id_area" gorm:"type:varchar(100)"`
	PnRmbh     string `json:"pn_rmbh" gorm:"type:varchar(10)"`
}

func (Uker) TableName() string {
	return "uker"
}
