package main

import (
	"context"
	"fin-health-server/graph"
	"fin-health-server/internal/auth"
	"fin-health-server/internal/config"
	"fin-health-server/internal/database"
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize GraphQL server
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		DB: db,
	}}))

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Auth endpoints
	r.POST("/auth/register", auth.Register(db))
	r.POST("/auth/login", auth.Login(db))

	// GraphQL endpoints
	r.POST("/query", gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL playground", "/query")))
	
	// Protected GraphQL playground (no auth required for the playground UI)
	r.GET("/api", gin.WrapH(playground.Handler("GraphQL playground (Protected)", "/api/query")))

	// GraphQL context middleware to transfer Gin context values
	graphqlContextMiddleware := func(c *gin.Context) {
		// Create a new context with the values from Gin context
		ctx := c.Request.Context()
		if userID, exists := c.Get("user_id"); exists {
			log.Printf("DEBUG: Setting user_id in context: %v (type: %T)", userID, userID)
			ctx = context.WithValue(ctx, "user_id", userID)
		} else {
			log.Printf("DEBUG: user_id not found in Gin context")
		}
		if email, exists := c.Get("email"); exists {
			log.Printf("DEBUG: Setting email in context: %v", email)
			ctx = context.WithValue(ctx, "email", email)
		}
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}

	// Protected GraphQL endpoint
	protected := r.Group("/")
	protected.Use(auth.AuthMiddleware())
	protected.Use(graphqlContextMiddleware)
	protected.POST("/api/query", gin.WrapH(srv))

	log.Printf("Server starting on port %s", cfg.Port)
	log.Printf("GraphQL playground (public) available at http://localhost:%s/", cfg.Port)
	log.Printf("GraphQL playground (protected) available at http://localhost:%s/api", cfg.Port)
	log.Fatal(r.Run(":" + cfg.Port))
}