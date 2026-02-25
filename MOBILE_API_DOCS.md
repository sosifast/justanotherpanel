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

> **Supported Payment Methods: PayPal and Cryptomus only.**  
> There is no manual/bank transfer payment system.

### List Payment Gateways
**Endpoint**: `GET /deposit`

Returns available payment gateways. Only `PAYPAL` and `CRYPTOMUS` providers are supported. The `api_config` for automated gateways exposes only the `fee` field (secrets are hidden).

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
      "provider": "CRYPTOMUS",
      "min_deposit": "5.00",
      "api_config": { "fee": "1%" }
    }
  ]
}
```

### Create Deposit Request
**Endpoint**: `POST /deposit`

Initiates a new deposit for either PayPal or Cryptomus. Always returns a `payment_url` that the app must redirect/open for the user to complete payment.

**Request Body**:
```json
{
  "amount": 50.00,
  "gateway_id": 1
}
```

**Notes**:
- `amount` is the base amount the user wants to deposit (before fees).
- Fee is calculated server-side based on the gateway's `api_config.fee` setting.
- The deposit is created with `status: PENDING` and updated once payment is confirmed via webhook or `check-status`.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "deposit": {
      "id": 45,
      "id_user": 7,
      "amount": "52.50",
      "status": "PENDING",
      "detail_transaction": {
        "fee": 2.5,
        "method": "PAYPAL",
        "provider": "PAYPAL",
        "payment_id": "PAYPAL_ORDER_ID_HERE",
        "type": "AUTOMATIC"
      },
      "created_at": "2026-02-24T14:00:00.000Z"
    },
    "payment_url": "https://www.paypal.com/checkoutnow?token=...",
    "message": "Deposit created successfully. Redirect to payment URL to complete payment."
  }
}
```

### Check Deposit Status
**Endpoint**: `POST /deposit/check-status`

Polls the payment provider (PayPal/Cryptomus) for the latest payment status and updates the deposit record. Use this after the user returns from the `payment_url` redirect.

- **PayPal raw statuses**: `COMPLETED`, `APPROVED`, `CANCELLED`, `VOIDED`
- **Cryptomus raw statuses**: `paid`, `paid_over`, `process`, `confirm_check`, `check`, `cancel`, `system_fail`, `fail`, `refund`

**Internal status mapping**:
| Provider Status | Internal Status |
|---|---|
| PayPal `COMPLETED` / Cryptomus `paid`, `paid_over` | `PAYMENT` |
| PayPal `CANCELLED`/`VOIDED` / Cryptomus `cancel`, `fail`, etc. | `CANCELED` |
| All others | `PENDING` |

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
    "deposit": { "id": 45, "amount": "52.50", "status": "PAYMENT", ... },
    "status": "PAYMENT",
    "raw_status": "COMPLETED",
    "message": "Deposit status updated successfully"
  }
}
```

**Note**: If the deposit is already in a final state (`PAYMENT`, `CANCELED`, `ERROR`), no external call is made and the current deposit object is returned with `message: "Deposit status is final"`.

### Payment Success Callback
**Endpoint**: `GET /deposit/success`

The redirect landing page when a user completes payment on the provider's site. Mobile apps should listen for navigation to this URL and then call `POST /deposit/check-status` to confirm the final status.

**Query Parameters** (sent automatically by payment provider):
- `token` – PayPal order ID (PayPal only)
- `PayerID` – PayPal payer ID (PayPal only)
- `order_id` – Cryptomus order ID (Cryptomus only)
- `uuid` – Cryptomus payment UUID (Cryptomus only)

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

The redirect landing page when a user cancels payment on the provider's site. The deposit status is updated to `CANCELED`.

**Query Parameters** (sent automatically by payment provider):
- `token` – PayPal order ID (PayPal only)
- `order_id` – Cryptomus order ID (Cryptomus only)
- `uuid` – Cryptomus payment UUID (Cryptomus only)

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

These are called **automatically by the payment providers** and should **not** be called directly from the mobile app.

**Cryptomus Webhook**: `POST /api/webhooks/cryptomus`  
- Verifies the webhook signature using `md5(base64(payload) + paymentKey)`
- Updates deposit status and credits user balance upon successful payment

**PayPal Webhook**: `POST /api/webhooks/paypal`  
- Handles PayPal IPN events (payment completed, denied, voided)
- Automatically credits user balance upon `PAYMENT_SALE_COMPLETED`

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
- `amount`: Total deposit amount including fees
- `status`: `PENDING` | `PAYMENT` | `CANCELED` | `ERROR`
- `provider`: Payment provider — `PAYPAL` or `CRYPTOMUS`
- `transaction_id`: External payment ID from the provider
- `fee`: Processing fee charged
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

## 7. Order SMM

> **Auth Required**: `Authorization: Bearer <token>`
> **Catatan Harga**: `price_sale` dan `price_reseller` dalam satuan **per 1000 unit**. Harga aktual = `(price / 1000) × quantity`.

### List Services
**Endpoint**: `GET /order`

Mengembalikan daftar layanan SMM yang aktif, dikelompokkan berdasarkan Platform → Category → Service.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Instagram",
      "categories": [
        {
          "id": 10,
          "name": "Followers",
          "services": [
            {
              "id": 101,
              "name": "Instagram Followers [REAL]",
              "min": 100,
              "max": 10000,
              "price_sale": "15000",
              "price_reseller": "12000",
              "type": "DEFAULT",
              "refill": true,
              "note": "High retention followers"
            }
          ]
        }
      ]
    }
  ]
}
```

**Service Types**:
| Type | Keterangan |
|------|-----------|
| `DEFAULT` | Order standar dengan `quantity` |
| `CUSTOM_COMMENTS` | Gunakan field `comments` (bukan `quantity`) |

---

### Place Order
**Endpoint**: `POST /order`

Membuat order baru. Saldo user akan langsung dipotong, dan order dikirim otomatis ke provider SMM eksternal (jika terkonfigurasi).

**Request Body (DEFAULT)**:
```json
{
  "service_id": 101,
  "link": "https://instagram.com/username",
  "quantity": 1000,
  "discount_code": "PROMO10"
}
```

**Request Body (CUSTOM_COMMENTS)**:
```json
{
  "service_id": 102,
  "link": "https://instagram.com/p/postid",
  "comments": "Great post!\nLove it!\nAmazing content!"
}
```

**Request Body (Drip-Feed / opsional)**:
```json
{
  "service_id": 101,
  "link": "https://...",
  "quantity": 5000,
  "runs": 5,
  "interval": 30
}
```

**Field Keterangan**:
| Field | Type | Wajib | Keterangan |
|-------|------|-------|-----------|
| `service_id` | number | ✅ | ID service dari GET /order |
| `link` | string | ✅ | URL target (profil/post/video) |
| `quantity` | number | ✅* | Jumlah order. *Tidak perlu untuk `CUSTOM_COMMENTS` |
| `comments` | string | ✅* | Komentar per baris. *Wajib untuk `CUSTOM_COMMENTS` |
| `discount_code` | string | ❌ | Kode diskon (opsional) |
| `runs` | number | ❌ | Jumlah run untuk drip-feed |
| `interval` | number | ❌ | Interval (menit) antar run untuk drip-feed |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 123,
      "invoice_number": "INV-2026-456789",
      "status": "PROCESSING",
      "service_name": "Instagram Followers [REAL]",
      "platform": "Instagram",
      "category": "Followers",
      "link": "https://instagram.com/username",
      "quantity": 1000,
      "subtotal": "15.0000",
      "discount_code": "PROMO10",
      "discount_amount": "1.5000",
      "total_price": "13.5000",
      "refill": true,
      "pid": "98765"
    }
  },
  "message": "Order placed successfully"
}
```

**Order Status**:
| Status | Keterangan |
|--------|-----------|
| `PENDING` | Menunggu diproses oleh provider |
| `PROCESSING` | Sudah dikirim ke provider dan sedang berjalan |
| `COMPLETED` | Selesai |
| `PARTIAL` | Sebagian selesai |
| `CANCELED` | Dibatalkan |
| `ERROR` | Terjadi error dari provider |

**Error Responses**:
- `400` – `"service_id is required"` / `"Insufficient balance"` / `"Quantity must be between X and Y"`
- `400` – `"comments is required for CUSTOM_COMMENTS service"`
- `400` – `"Provider error: <pesan dari provider>"`
- `401` – Unauthorized

---

### Validate Discount
**Endpoint**: `POST /order/validate-discount`

Preview potongan harga dari kode diskon **tanpa membuat order**. Gunakan ini untuk tampilan real-time di UI saat user mengetik kode promo.

**Request Body**:
```json
{
  "service_id": 101,
  "quantity": 1000,
  "discount_code": "PROMO10"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount_code": "PROMO10",
    "discount_type": "PERCENTAGE",
    "discount_amount": "1.5000",
    "subtotal": "15.0000",
    "final_price": "13.5000"
  }
}
```

**Error Responses**:
- `400` – `"Discount code not found or expired"`
- `400` – `"Discount code has reached its usage limit"`
- `400` – `"Minimum order subtotal for this discount is $X.XX"`

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
