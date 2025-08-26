# Testing the GraphQL API

This guide will help you test the Finance Health GraphQL API to ensure everything is working correctly.

## 1. GraphQL Playground (Recommended)

Once your server is running, visit: **http://localhost:8080/**

This provides a web interface where you can:
- Write and execute queries
- Browse the schema documentation
- See query results in real-time

**IMPORTANT ENDPOINTS:**
- **Public GraphQL Playground:** `http://localhost:8080/` → Only for `register` and `login` mutations
- **Protected GraphQL Playground:** `http://localhost:8080/api` → For all other queries that require authentication

**Two separate playgrounds:**
1. **Public:** `http://localhost:8080/` (for registration/login)
2. **Protected:** `http://localhost:8080/api` (for everything else with JWT token)

## 2. Basic Authentication Flow

### Register a New User

```graphql
mutation {
  register(
    input: {
      email: "test@example.com"
      password: "password123"
      name: "Test User"
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

### Login (Alternative)

```graphql
mutation {
  login(
    input: {
      email: "test@example.com"
      password: "password123"
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

**Important:** Copy the `token` from the response for protected queries.

## 3. Set Authorization Header

For protected queries, add this header in GraphQL Playground:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

## 4. Test Protected Queries

**IMPORTANT:** Use the protected playground: `http://localhost:8080/api`

### Get User Information

```graphql
query {
  me {
    id
    email
    name
    createdAt
  }
}
```

### Get Categories (Default Seeded Categories)

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

### Create an Account

```graphql
mutation {
  createAccount(
    input: {
      name: "Main Checking"
      type: CHECKING
      balance: 1000.00
      icon: "creditcard.fill"
    }
  ) {
    id
    name
    type
    balance
    icon
  }
}
```

### Get Accounts

```graphql
query {
  accounts {
    id
    name
    type
    balance
    icon
    createdAt
  }
}
```

### Create a Transaction

```graphql
mutation {
  createTransaction(
    input: {
      name: "Coffee Shop"
      amount: -4.50
      date: "2024-01-01T10:00:00Z"
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
    icon
    color
  }
}
```

### Get Transactions

```graphql
query {
  transactions {
    id
    name
    amount
    date
    icon
    color
    account {
      name
    }
    category {
      name
    }
  }
}
```

### Financial Metrics

```graphql
query {
  netWorth
  monthlySpending(year: 2024, month: 1)
  savingsRate(year: 2024, month: 1)
  debtToIncomeRatio
}
```

## 5. cURL Commands (Alternative)

### Register

```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { register(input: {email: \"test@example.com\", password: \"password123\", name: \"Test User\"}) { token user { id email name } } }"}'
```

### Protected Query (Replace TOKEN)

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "query { me { id email name } }"}'
```

## 6. Database Verification

Connect to PostgreSQL container to verify data:

```bash
# Connect to database
docker exec -it finhealth-db psql -U postgres -d finhealth

# Check tables
\dt

# Check users
SELECT * FROM users;

# Check categories
SELECT * FROM categories;

# Check accounts
SELECT * FROM accounts;

# Check transactions
SELECT * FROM transactions;

# Exit
\q
```

## 7. Common Issues

### Authentication Errors
- Make sure to include the `Authorization: Bearer TOKEN` header for protected endpoints
- Use `/api/query` for protected queries, `/query` for public ones (register/login)

### Internal Server Errors
- Check server logs: `docker-compose logs server`
- Verify database connection: `docker-compose logs db`

### Schema Errors
- Regenerate GraphQL schema if needed: `go run github.com/99designs/gqlgen generate`

## 8. Testing Workflow

1. **Register** a new user on public playground (`http://localhost:8080/`) to get a token
2. **Switch to protected playground** (`http://localhost:8080/api`)
3. **Set authorization header** in GraphQL Playground: `{"Authorization": "Bearer YOUR_TOKEN"}`
4. **Query categories** to see default seeded data
5. **Create an account** for transactions
6. **Create transactions** to test the full flow
7. **Query transactions** to verify data
8. **Test financial metrics** to ensure calculations work

**Common Mistake:** Using the wrong playground! Remember:
- `http://localhost:8080/` = Public (register/login only)
- `http://localhost:8080/api` = Protected (everything else)

Start with the GraphQL Playground - it's the most user-friendly way to test your API!