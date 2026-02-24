# Mobile API Documentation

This documentation provides details for the backend API implemented at `/api-mobile` for the mobile application.

## Authentication
All endpoints (except login, if applicable) require authentication using a JWT Bearer Token.

- **Header**: `Authorization: Bearer <your_jwt_token>`
- **Token Source**: Obtain this from the existing web login API (`/api/auth/login`).

## Base URL
`https://www.apkey.net/api-mobile`

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

Initiates a new deposit. Supports PayPal, Cryptomus, and Manual payments.

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
    "payment_url": "https://paypal.com/checkout/...", // For automated payments
    "message": "Deposit created successfully. Redirect to payment URL to complete payment."
  }
}
// Note: amount in response includes calculated fees
```

### Check Deposit Status
**Endpoint**: `POST /deposit/check-status`

Checks the current status of a deposit and updates it if payment has been completed.

**Request Body**:
```json
{
  "deposit_id": 45
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
      "status": "PAYMENT", // PENDING, PAYMENT, CANCELED, ERROR
      "created_at": "...",
      "updated_at": "..."
    },
    "status": "PAYMENT",
    "raw_status": "COMPLETED", // Provider-specific status
    "message": "Deposit status updated successfully"
  }
}
```

### Payment Success Callback
**Endpoint**: `GET /deposit/success`

Handles successful payment redirects from PayPal and Cryptomus.

**Query Parameters**:
- `token`: PayPal order ID
- `PayerID`: PayPal payer ID
- `order_id`: Cryptomus order ID
- `uuid`: Cryptomus payment UUID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "deposit_id": 45,
  "status": "PENDING",
  "next_action": "check_status"
}
```

### Payment Cancel Callback
**Endpoint**: `GET /deposit/cancel`

Handles canceled payment redirects from PayPal and Cryptomus.

**Query Parameters**:
- `token`: PayPal order ID
- `order_id`: Cryptomus order ID
- `uuid`: Cryptomus payment UUID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payment canceled successfully",
  "deposit_id": 45,
  "status": "CANCELED"
}
```

### Payment Webhooks (Server-to-Server)

**Cryptomus Webhook**: `POST /api/webhooks/cryptomus`
- Automatically updates deposit status when payment is confirmed
- Requires proper webhook URL configuration in payment gateway

**PayPal Webhook**: `POST /api/webhooks/paypal`
- Handles PayPal payment events (completed, denied, voided)
- Automatically updates user balance upon successful payment

**Note**: These webhooks are called automatically by payment providers and should not be called directly by mobile apps.

---

## 3. History

**Endpoint**: `GET /history?type=<type>&page=<page>&limit=<limit>`

Fetches detailed history of orders or deposits.

- **Query Params**:
  - `type`: `orders` (default) or `deposits`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

### Order History Response
**Response (200 OK) for `type=orders`**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 123,
        "invoice_number": "INV-2026-000123",
        "service_name": "Instagram Followers [REAL]",
        "platform_name": "Instagram",
        "link": "https://instagram.com/username",
        "quantity": 1000,
        "price": "15.50",
        "start_count": 5420,
        "remains": 0,
        "status": "COMPLETED",
        "refill": false,
        "runs": 0,
        "interval": 0,
        "pid": "PROV-12345",
        "created_at": "2026-02-20T10:30:00Z",
        "updated_at": "2026-02-20T12:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

**Order Fields**:
- `id`: Order ID
- `invoice_number`: Unique invoice identifier
- `service_name`: Name of the service ordered
- `platform_name`: Social media platform (Instagram, TikTok, etc.)
- `link`: Target URL/link for the service
- `quantity`: Amount/quantity ordered
- `price`: Price paid (as string for precision)
- `start_count`: Initial count before service start
- `remains`: Remaining quantity (for partial completions)
- `status`: Order status (PENDING, IN_PROGRESS, PROCESSING, COMPLETED, SUCCESS, PARTIAL, ERROR, CANCELED)
- `refill`: Whether refill is available
- `runs`: Number of runs (for drip-feed orders)
- `interval`: Interval between runs (for drip-feed orders)
- `pid`: Provider ID from API provider
- `created_at`: Order creation timestamp
- `updated_at`: Last update timestamp

### Deposit History Response
**Response (200 OK) for `type=deposits`**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 45,
        "amount": "52.50",
        "status": "PAYMENT",
        "provider": "PAYPAL",
        "transaction_id": "PAYPAL-123456789",
        "fee": "2.50",
        "created_at": "2026-02-20T09:15:00Z",
        "updated_at": "2026-02-20T09:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

**Deposit Fields**:
- `id`: Deposit ID
- `amount`: Deposit amount including fees (as string for precision)
- `status`: Deposit status (PENDING, PAYMENT, ERROR, CANCELED)
- `provider`: Payment provider (PAYPAL, CRYPTOMUS, MANUAL)
- `transaction_id`: External transaction/payment ID
- `fee`: Processing fee (as string for precision)
- `created_at`: Deposit creation timestamp
- `updated_at`: Last update timestamp

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
