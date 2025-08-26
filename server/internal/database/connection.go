package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	log.Println("Database connected successfully")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("Running database migrations...")
	
	if err := MigrateDB(db); err != nil {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// SeedUserCategories creates default categories for a new user
func SeedUserCategories(db *gorm.DB, userID uint) error {
	categories := []Category{
		{Name: "Food & Dining", Icon: "fork.knife", Color: "#FF6B6B", UserID: userID},
		{Name: "Transportation", Icon: "car.fill", Color: "#4ECDC4", UserID: userID},
		{Name: "Shopping", Icon: "bag.fill", Color: "#45B7D1", UserID: userID},
		{Name: "Entertainment", Icon: "tv.fill", Color: "#96CEB4", UserID: userID},
		{Name: "Bills & Utilities", Icon: "lightbulb.fill", Color: "#FCEA2B", UserID: userID},
		{Name: "Healthcare", Icon: "cross.fill", Color: "#FF6B9D", UserID: userID},
		{Name: "Education", Icon: "book.fill", Color: "#C44569", UserID: userID},
		{Name: "Income", Icon: "briefcase.fill", Color: "#54A0FF", UserID: userID},
	}

	// Create categories for the user
	for _, category := range categories {
		if err := db.Create(&category).Error; err != nil {
			return err
		}
	}

	// Get the created categories to get their IDs
	var createdCategories []Category
	if err := db.Where("user_id = ?", userID).Find(&createdCategories).Error; err != nil {
		return err
	}

	// Create a map for category name to ID
	categoryMap := make(map[string]uint)
	for _, cat := range createdCategories {
		categoryMap[cat.Name] = cat.ID
	}

	// Create subcategories
	subcategories := []Subcategory{
		// Food & Dining
		{Name: "Restaurants", CategoryID: categoryMap["Food & Dining"]},
		{Name: "Groceries", CategoryID: categoryMap["Food & Dining"]},
		{Name: "Coffee & Tea", CategoryID: categoryMap["Food & Dining"]},
		
		// Transportation
		{Name: "Gas", CategoryID: categoryMap["Transportation"]},
		{Name: "Public Transport", CategoryID: categoryMap["Transportation"]},
		{Name: "Parking", CategoryID: categoryMap["Transportation"]},
		
		// Shopping
		{Name: "Clothing", CategoryID: categoryMap["Shopping"]},
		{Name: "Electronics", CategoryID: categoryMap["Shopping"]},
		{Name: "Home & Garden", CategoryID: categoryMap["Shopping"]},
		
		// Entertainment
		{Name: "Movies", CategoryID: categoryMap["Entertainment"]},
		{Name: "Music", CategoryID: categoryMap["Entertainment"]},
		{Name: "Sports", CategoryID: categoryMap["Entertainment"]},
		
		// Bills & Utilities
		{Name: "Electricity", CategoryID: categoryMap["Bills & Utilities"]},
		{Name: "Water", CategoryID: categoryMap["Bills & Utilities"]},
		{Name: "Internet", CategoryID: categoryMap["Bills & Utilities"]},
		{Name: "Rent", CategoryID: categoryMap["Bills & Utilities"]},
		
		// Income
		{Name: "Salary", CategoryID: categoryMap["Income"]},
		{Name: "Freelance", CategoryID: categoryMap["Income"]},
		{Name: "Investment", CategoryID: categoryMap["Income"]},
	}

	// Create subcategories
	for _, subcategory := range subcategories {
		if err := db.Create(&subcategory).Error; err != nil {
			return err
		}
	}

	return nil
}