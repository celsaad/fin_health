.PHONY: build run test clean generate

# Build the application
build:
	go build -o bin/server main.go

# Run the application
run:
	go run main.go

# Run tests
test:
	go test ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Generate GraphQL code
generate:
	go run github.com/99designs/gqlgen generate

# Install dependencies
deps:
	go mod download
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Run database migrations
migrate:
	@echo "Migrations are automatically run on server start"

# Development server with hot reload
dev:
	air

# Build for production
build-prod:
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/server main.go