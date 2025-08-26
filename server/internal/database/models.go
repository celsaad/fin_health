package database

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Name      string    `json:"name" gorm:"not null"`
	Password  string    `json:"-" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Accounts      []Account     `json:"accounts" gorm:"foreignKey:UserID"`
	Transactions  []Transaction `json:"transactions" gorm:"foreignKey:UserID"`
	Categories    []Category    `json:"categories" gorm:"foreignKey:UserID"`
}

type Account struct {
	ID      uint    `json:"id" gorm:"primaryKey"`
	Name    string  `json:"name" gorm:"not null"`
	Type    string  `json:"type" gorm:"not null"`
	Balance float64 `json:"balance" gorm:"default:0"`
	Icon    string  `json:"icon" gorm:"not null"`
	UserID  uint    `json:"user_id" gorm:"not null"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User         User          `json:"user" gorm:"foreignKey:UserID"`
	Transactions []Transaction `json:"transactions" gorm:"foreignKey:AccountID"`
}

type Category struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	Name   string `json:"name" gorm:"not null"`
	Icon   string `json:"icon" gorm:"not null"`
	Color  string `json:"color" gorm:"not null"`
	UserID uint   `json:"user_id" gorm:"not null"`

	User          User          `json:"user" gorm:"foreignKey:UserID"`
	Subcategories []Subcategory `json:"subcategories" gorm:"foreignKey:CategoryID"`
	Transactions  []Transaction `json:"transactions" gorm:"foreignKey:CategoryID"`
}

type Subcategory struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	Name       string `json:"name" gorm:"not null"`
	CategoryID uint   `json:"category_id" gorm:"not null"`

	Category     Category      `json:"category" gorm:"foreignKey:CategoryID"`
	Transactions []Transaction `json:"transactions" gorm:"foreignKey:SubcategoryID"`
}

type Transaction struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Name          string    `json:"name" gorm:"not null"`
	Amount        float64   `json:"amount" gorm:"not null"`
	Date          time.Time `json:"date" gorm:"not null"`
	Notes         *string   `json:"notes"`
	Icon          string    `json:"icon" gorm:"not null"`
	Color         string    `json:"color" gorm:"not null"`
	UserID        uint      `json:"user_id" gorm:"not null"`
	AccountID     uint      `json:"account_id" gorm:"not null"`
	CategoryID    uint      `json:"category_id" gorm:"not null"`
	SubcategoryID *uint     `json:"subcategory_id"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User        User         `json:"user" gorm:"foreignKey:UserID"`
	Account     Account      `json:"account" gorm:"foreignKey:AccountID"`
	Category    Category     `json:"category" gorm:"foreignKey:CategoryID"`
	Subcategory *Subcategory `json:"subcategory" gorm:"foreignKey:SubcategoryID"`
}

func (t *Transaction) HasNote() bool {
	return t.Notes != nil && *t.Notes != ""
}

func MigrateDB(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Account{},
		&Category{},
		&Subcategory{},
		&Transaction{},
	)
}