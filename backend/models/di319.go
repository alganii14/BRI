package models

import "time"

type DI319 struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Periode     time.Time `gorm:"type:date;not null" json:"periode"`
	MainBranch  string    `gorm:"type:varchar(100);not null" json:"main_branch"`
	Branch      string    `gorm:"type:varchar(5);not null;index:idx_di319_branch" json:"branch"`
	CIF         string    `gorm:"type:varchar(10);not null" json:"cif"`
	NoRek       string    `gorm:"column:norek;type:varchar(20);not null" json:"norek"`
	Type        string    `gorm:"type:varchar(50);not null" json:"type"`
	Nama        string    `gorm:"type:varchar(100);not null" json:"nama"`
	PNPengelola string    `gorm:"type:varchar(250);not null" json:"pn_pengelola"`
	Balance     int64     `gorm:"type:bigint;not null" json:"balance"`
	AvalBalance string    `gorm:"type:varchar(20);not null" json:"aval_balance"`
	AvgBalance  *string   `gorm:"type:varchar(20)" json:"avg_balance"`
	OpenDate    time.Time `gorm:"type:date;not null" json:"open_date"`
}

func (DI319) TableName() string {
	return "di319"
}
