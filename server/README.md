# Finance Health Backend Server

A Go-based GraphQL API server for the Finance Health mobile application with JWT authentication.

## Features

- GraphQL API with comprehensive schema for financial data
- JWT-based authentication
- PostgreSQL database with GORM
- User registration and login with automatic category seeding
- Account management
- Transaction tracking
- User-specific category and subcategory management
- Financial metrics (Net Worth, Savings Rate, Debt-to-Income Ratio)

## Getting Started

### Prerequisites

#### Docker Installation (Recommended)
- Docker
- Docker Compose

#### Local Development
- Go 1.23 or higher
- PostgreSQL database
- Environment variables (optional)

### Installation

#### Option 1: Docker (Recommended)

1. Navigate to the server directory:

```bash
cd server
```

2. Start the services (PostgreSQL + Go server):

```bash
docker-compose up -d
```

3. View logs:

```bash
docker-compose logs -f
```

4. Stop the services:

```bash
docker-compose down
```

5. Rebuild and restart (if you make code changes):

```bash
docker-compose up --build -d
```

**Access points:**
- Server: http://localhost:8080
- GraphQL Playground: http://localhost:8080/
- Database: localhost:5432 (postgres/password)

#### Option 2: Local Development

1. Clone the repository and navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
go mod download
```

3. Set up your PostgreSQL database and update the connection string in your environment or use the default.

4. Run the server:

```bash
go run cmd/server/main.go
```

The server will start on port 8080 by default.

### Environment Variables

You can configure the following environment variables:

- `PORT`: Server port (default: 8080)
- `DATABASE_URL`: PostgreSQL connection string (default: postgres://postgres:password@localhost/finhealth?sslmode=disable)
- `JWT_SECRET`: Secret key for JWT tokens (default: your-secret-key-change-in-production)

### API Endpoints

#### REST Endpoints

- `GET /health` - Health check endpoint
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### GraphQL Endpoints

- `GET /` - GraphQL Playground (development)
- `POST /query` - Public GraphQL endpoint
- `POST /api/query` - Protected GraphQL endpoint (requires authentication)

### Authentication

The API uses JWT tokens for authentication. After registering or logging in, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Database Schema

The application automatically creates and migrates the following tables:

- `users` - User accounts
- `accounts` - Financial accounts (checking, savings, etc.)
- `categories` - User-specific transaction categories
- `subcategories` - User-specific transaction subcategories
- `transactions` - Financial transactions

### GraphQL Schema

The GraphQL schema includes the following main types:

- `User` - User account information
- `Account` - Financial accounts
- `Transaction` - Financial transactions
- `Category` - Transaction categories
- `Subcategory` - Transaction subcategories

### Example Queries

#### Register a new user:

```graphql
mutation {
  register(
    input: {
      email: "user@example.com"
      password: "password123"
      name: "John Doe"
    }
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

#### Get user's accounts:

```graphql
query {
  accounts {
    id
    name
    type
    balance
    icon
  }
}
```

#### Get user's categories:

```graphql
query {
  categories {
    id
    name
    icon
    color
    subcategories {
      id
      name
    }
  }
}
```

#### Create a custom category:

```graphql
mutation {
  createCategory(
    input: { name: "Custom Category", icon: "star.fill", color: "#FF6B6B" }
  ) {
    id
    name
    icon
    color
  }
}
```

#### Create a transaction:

```graphql
mutation {
  createTransaction(
    input: {
      name: "Coffee Shop"
      amount: -4.50
      date: "2023-01-01T10:00:00Z"
      icon: "cup.fill"
      color: "#FF6B6B"
      accountId: "1"
      categoryId: "1"
    }
  ) {
    id
    name
    amount
    date
  }
}
```

### Development

To regenerate GraphQL code (if you modify the schema):

```bash
go run github.com/99designs/gqlgen generate
```

### Production Deployment

1. Set environment variables for production
2. Use a proper PostgreSQL database
3. Change the JWT secret
4. Consider using a reverse proxy like nginx
5. Enable HTTPS

### Security Notes

- Change the default JWT secret in production
- Use environment variables for sensitive configuration
- Implement rate limiting for production use
- Use HTTPS in production
- Validate and sanitize all inputs
