# Mobile API Documentation

This documentation provides details for the backend API implemented at `/api-mobile` for the mobile application.

## Authentication
All endpoints (except login, if applicable) require authentication using a JWT Bearer Token.

- **Header**: `Authorization: Bearer <your_jwt_token>`
- **Token Source**: Obtain this from the existing web login API (`/api/auth/login`).

## Base URL
`http://<your-domain>/api-mobile`

---

## 0. Authentication Endpoints

### Mobile Login
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com", // can be email or username
  "password": "yourpassword"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": { "id": 1, "username": "...", "email": "...", ... }
  },
  "message": "Login successful"
}
```

### Mobile Register
**Endpoint**: `POST /auth/register`

Matches `User` table naming conventions (snake_case).

**Request Body**:
```json
{
  "full_name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": { "id": 1, "username": "johndoe", "email": "...", ... },
  "message": "User created successfully"
}
```

---

## 1. Dashboard
**Endpoint**: `GET /dashboard`

Returns user profile summary, account statistics, and recent announcements.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "johndoe",
      "full_name": "John Doe",
      "balance": "150.50",
      "profile_image": "https://..."
    },
    "stats": {
      "total_spent": "500.25",
      "total_deposit": "650.75",
      "active_tickets": 2
    },
    "news": [
      {
        "id": 1,
        "subject": "System Update",
        "content": "We have updated our services...",
        "created_at": "2026-02-16T..."
      }
    ]
  }
}
```

---

## 2. Deposits

### List Payment Gateways
**Endpoint**: `GET /deposit`

Returns available payment methods and their configurations.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider": "PAYPAL",
      "min_deposit": "10.00",
      "api_config": { "fee": "5%" }
    },
    {
      "id": 2,
      "provider": "MANUAL",
      "min_deposit": "5.00",
      "api_config": {
        "bankName": "Bank ABC",
        "accountNumber": "123456789",
        "accountHolder": "Admin Name",
        "instructions": "Please transfer and upload proof..."
      }
    }
  ]
}
```

### Create Deposit Request
**Endpoint**: `POST /deposit`

Initiates a new deposit.

**Request Body**:
```json
{
  "amount": 50.00,
  "gateway_id": 1
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "deposit": {
      "id": 45,
      "amount": "52.50",
      "status": "PENDING",
      "created_at": "..."
    },
    "message": "Deposit created successfully"
  }
}
// Note: amount in response includes calculated fees
```

---

## 3. History

**Endpoint**: `GET /history?type=<type>&page=<page>&limit=<limit>`

Fetches history of orders or deposits.

- **Query Params**:
  - `type`: `orders` (default) or `deposits`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

## 4. Coupons

**Endpoint**: `POST /coupon`

Redeems a balance code/coupon.

**Request Body**:
```json
{
  "code": "PROMO2026"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "amount": "10.00",
    "message": "Successfully redeemed 10.00 balance"
  }
}
```

---

## 5. Announcements

**Endpoint**: `GET /announcement`

Lists all active news and system announcements.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [ ... ]
}
```

---

## 6. Account Management

### Get Profile
**Endpoint**: `GET /account`

Returns detailed user information.

### Update Profile
**Endpoint**: `PUT /account`

Updates user name or password.

**Request Body (Optional fields)**:
```json
{
  "full_name": "New Name",
  "password": "current_password",
  "new_password": "new_password"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "Profile updated successfully"
  }
}
```

---

## Error Handling
The API returns standard HTTP status codes and a consistent JSON error format.

- **401 Unauthorized**: Missing or invalid Bearer token.
- **400 Bad Request**: Validation errors or business logic failure (e.g., duplicate coupon).
- **500 Internal Server Error**: Unexpected server errors.

**Error Response Example**:
```json
{
  "success": false,
  "message": "Detailed error message here",
  "data": null
}
```
