package models

type ProductType struct {
	ID          int    `gorm:"primarykey;autoIncrement" json:"id"`
	KodeProduct string `gorm:"type:varchar(20);uniqueIndex;not null" json:"kode_product"`
	NamaProduct string `gorm:"type:varchar(100);not null" json:"nama_product"`
}

func (ProductType) TableName() string {
	return "product_type"
}
