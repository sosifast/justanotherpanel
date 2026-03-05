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

## 4. Redeem Balance Code

**Endpoint**: `POST /reedem`

Redeem **kode balance top-up** yang dibuat oleh admin melalui panel **Admin → Redeem → Generate Code**. Setelah berhasil, nilai balance dari kode langsung dikreditkan ke saldo akun user.

> **DB Model**: `RedeemCode` + `RedeemUsed`  
> **Berbeda dengan `/coupon`** — endpoint ini BUKAN untuk kode diskon order.

**Request Body**:
```json
{
  "code": "TOPUP2026"
}
```

> Input `code` bersifat case-insensitive, otomatis dikonversi ke huruf kapital di server.

**Validasi** (dicek berurutan):
1. Field `code` wajib diisi
2. Kode harus ada di tabel `RedeemCode`
3. Status kode harus `ACTIVE`
4. Kode belum expired (`expired_date` > sekarang)
5. Quota kode masih > 0
6. User belum pernah meredeem kode ini (`RedeemUsed`)

**Atomic Transaction**:
1. Buat record `RedeemUsed` (log penggunaan)
2. Kurangi `quota` kode sebesar 1
3. Tambahkan `get_balance` ke saldo user

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "amount": "10.00",
    "message": "Successfully redeemed $10.00 to your balance"
  },
  "message": "Redeem code applied successfully"
}
```

**Error Responses**:
| HTTP | Message |
|------|---------|
| `400` | `"Code is required"` |
| `400` | `"Invalid redeem code"` |
| `400` | `"This redeem code is no longer active"` |
| `400` | `"This redeem code has expired"` |
| `400` | `"This redeem code quota has been fully used"` |
| `400` | `"You have already redeemed this code"` |
| `401` | `"Unauthorized"` |
| `500` | `"Internal Server Error"` |

---

## 4b. Coupon (Validasi Kode Diskon Transaksi)

**Endpoint**: `POST /coupon`

Validasi **kode diskon transaksi** yang dibuat admin melalui panel **Admin → Discount**. Kode ini digunakan untuk mengurangi harga order SMM — bukan untuk menambah balance.

> **DB Model**: `Discount` + `DiscountUsage`  
> **Berbeda dengan `/reedem`** — endpoint ini BUKAN untuk balance top-up.  
> Untuk **menerapkan** diskon ke order, gunakan field `discount_code` di `POST /order`.

**Request Body**:
```json
{
  "discount_code": "PROMO10",
  "service_id": 101,
  "quantity": 1000
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `discount_code` | ✅ | Kode diskon dari admin |
| `service_id` | ❌ | Jika diisi bersama `quantity`, menghitung harga final |
| `quantity` | ❌ | Diperlukan untuk kalkulasi subtotal |

**Response dengan `service_id` + `quantity` (200 OK)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount_code": "PROMO10",
    "discount_type": "PERCENTAGE",
    "discount_amount": "1.5000",
    "discount_max_get": "5.00",
    "subtotal": "15.0000",
    "final_price": "13.5000"
  },
  "message": "Discount code is valid"
}
```

**Response tanpa `service_id` + `quantity` (metadata only)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount_code": "PROMO10",
    "discount_type": "PERCENTAGE",
    "discount_amount": "10.0000",
    "discount_max_get": "5.00",
    "min_transaction": "5.00",
    "max_transaction": null,
    "expired_date": "2026-12-31T23:59:59.000Z"
  },
  "message": "Discount code is valid"
}
```

**Error Responses**:
| HTTP | Message |
|------|---------|
| `400` | `"discount_code is required"` |
| `400` | `"Discount code not found or expired"` |
| `400` | `"Discount code has reached its usage limit"` |
| `400` | `"Minimum order subtotal for this discount is $X.XX"` |
| `400` | `"Maximum order subtotal for this discount is $X.XX"` |
| `401` | `"Unauthorized"` |
| `500` | `"Internal Server Error"` |



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

## 8. Platform

**Endpoint**: `GET /platform`

Fetches platforms, categories, or services depending on the query parameters.

- **Query Params**:
  - *(none)*: Lists all active platforms.
  - `platform_id`: Lists all categories (with services) for the given platform.
  - `category_id`: Lists all services for the given category.

### List Platforms
**Endpoint**: `GET /platform`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Instagram",
      "slug": "instagram",
      "icon_imagekit_url": "https://ik.imagekit.io/.../icon.png"
    }
  ]
}
```

### List Categories by Platform
**Endpoint**: `GET /platform?platform_id=1`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "id_platform": 1,
      "name": "Followers",
      "status": "ACTIVE",
      "created_at": "...",
      "updated_at": "...",
      "services": [
        {
          "id": 101,
          "name": "Instagram Followers [REAL]",
          "min": 100,
          "max": 10000,
          "price_sale": "15000",
          "note": "High retention followers",
          "type": "DEFAULT"
        }
      ]
    }
  ]
}
```

### List Services by Category
**Endpoint**: `GET /platform?category_id=10`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "Instagram Followers [REAL]",
      "min": 100,
      "max": 10000,
      "price_sale": "15000",
      "note": "High retention followers",
      "type": "DEFAULT"
    }
  ]
}
```

---

## 9. Tickets

### List Tickets
**Endpoint**: `GET /tickets`

Lists all support tickets for the authenticated user.

- **Query Params**:
  - `status`: Filter by status (`all`, `OPEN`, `PENDING`, `ANSWERED`, `CLOSED`). Default is `all`.
  - `page`: Page number (default: 1).
  - `limit`: Items per page (default: 20).

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "subject": "Payment not added",
        "category": "Payment",
        "status": "OPEN",
        "priority": "MEDIUM",
        "created_at": "2026-02-26T10:00:00.000Z",
        "updated_at": "2026-02-26T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Create Ticket
**Endpoint**: `POST /tickets`

Creates a new support ticket.

**Request Options**:
1. **JSON (`application/json`)**: Use this if you already have the `image_url` or do not need to attach an image.
2. **FormData (`multipart/form-data`)**: Use this if you want to upload the image file directly while creating the ticket.

**Request Body (JSON Example)**:
```json
{
  "subject": "Payment not added",
  "category": "Payment",
  "message": "I deposited $50 via PayPal but my balance is still $0.",
  "image_url": "https://ik.imagekit.io/.../screenshot.png" // Optional
}
```

**Request Body (FormData Example)**:
- `subject` (text)
- `category` (text)
- `message` (text)
- `file` (file binary, Optional)

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 2,
      "subject": "Payment not added",
      "category": "Payment",
      "status": "OPEN",
      "created_at": "2026-02-26T10:05:00.000Z"
    },
    "message": "Ticket created successfully"
  }
}
```

### Get Ticket Details
**Endpoint**: `GET /tickets/:id`

Retrieves the details of a specific ticket, including all its messages.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 1,
      "id_user": 7,
      "subject": "Payment not added",
      "category": "Payment",
      "status": "OPEN",
      "priority": "MEDIUM",
      "created_at": "...",
      "updated_at": "...",
      "messages": [
        {
          "sender": "user",
          "content": "I deposited $50...",
          "image_url": null,
          "created_at": "2026-02-26T10:00:00.000Z"
        },
        {
          "sender": "admin",
          "content": "Let me check this for you.",
          "image_url": null,
          "created_at": "2026-02-26T10:05:00.000Z"
        }
      ]
    }
  }
}
```

### Reply to Ticket
**Endpoint**: `POST /tickets/:id/reply`

Adds a new message to an existing ticket.

**Request Options**:
1. **JSON (`application/json`)**:
2. **FormData (`multipart/form-data`)**: Upload image file directly.

**Request Body (JSON Example)**:
```json
{
  "message": "Please let me know once it is fixed.",
  "image_url": null // Optional
}
```

**Request Body (FormData Example)**:
- `message` or `content` (text)
- `file` (file binary, Optional)

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "sender": "user",
      "content": "Please let me know once it is fixed.",
      "image_url": null,
      "created_at": "2026-02-26T10:10:00.000Z"
    },
    "info": "Reply sent successfully"
  }
}
```

---

## 10. Media Upload

### Upload Image
**Endpoint**: `POST /upload`

Uploads an image file to the server (via ImageKit) and returns the public URL. Use this URL for the `image_url` field when creating or replying to tickets.
- **Content-Type**: `multipart/form-data`
- **Max File Size**: 5MB
- **Allowed Types**: `image/*`

**Request Body (FormData)**:
- `file`: The image file binary.

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "url": "https://ik.imagekit.io/.../mobile_uploads/mobile_upload_1711234567.jpg",
    "fileId": "65f..."
  },
  "message": "Image uploaded successfully"
}
```

---

## 11. Pusher Configuration

### Get Pusher Config
**Endpoint**: `GET /pusher-config`

Returns the Pusher client-side configuration (app key and cluster) so the mobile app can initialize a real-time Pusher connection. The `app_secret` is **never** exposed.

> **Auth Required**: `Authorization: Bearer <token>`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "key": "your_pusher_app_key",
    "cluster": "ap1",
    "auth_endpoint": "/api/pusher/auth",
    "channels": {
      "user": "private-user-7"
    }
  },
  "message": "Pusher config retrieved"
}
```

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Pusher app key (public) |
| `cluster` | string | Pusher cluster region (e.g. `ap1`) |
| `auth_endpoint` | string | Endpoint to authenticate private channels |
| `channels.user` | string | Private channel name for this user (`private-user-{id}`) |

**Private Channel Authentication**:

After obtaining the config, the mobile app must authenticate its private channel by calling:
```
POST /api/pusher/auth
Authorization: Bearer <token>
Content-Type: application/x-www-form-urlencoded

socket_id=<socket_id>&channel_name=private-user-<id>
```

**Error Responses**:
- `401` – Unauthorized
- `503` – `"Pusher not configured"` (key or cluster not set on the server)

---

## 12. Blog / Artikel

> **Auth**: Semua endpoint blog **tidak memerlukan autentikasi** — dapat diakses publik.

### 12.1 List Artikel
**Endpoint**: `GET /blog`

Mengembalikan daftar artikel aktif dengan pagination.

**Query Parameters**:
| Parameter | Wajib | Default | Keterangan |
|-----------|-------|---------|------------|
| `page` | ❌ | `1` | Nomor halaman |
| `limit` | ❌ | `10` | Jumlah per halaman (maks 50) |
| `category_id` | ❌ | — | Filter berdasarkan ID kategori |
| `category_slug` | ❌ | — | Filter berdasarkan slug kategori |
| `search` | ❌ | — | Pencarian berdasarkan judul artikel |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "How to Grow Instagram Followers in 2026",
        "slug": "how-to-grow-instagram-followers-2026",
        "banner_imagekit_upload_url": "https://ik.imagekit.io/.../banner.jpg",
        "desc_seo": "Learn the best strategies to grow your Instagram following organically.",
        "keyword": "instagram, followers, growth",
        "view_count": 1240,
        "created_at": "2026-02-01T10:00:00.000Z",
        "updated_at": "2026-02-10T08:30:00.000Z",
        "category": {
          "id": 3,
          "name": "Tips & Tricks",
          "slug": "tips-tricks"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

---

### 12.2 Detail Artikel
**Endpoint**: `GET /blog/:slug`

Mengembalikan detail lengkap sebuah artikel berdasarkan slug. Setiap request akan **menginkrementasi `view_count`** secara otomatis (non-blocking).

**URL Params**:
- `:slug` — Slug unik artikel (contoh: `how-to-grow-instagram-followers-2026`)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "article": {
      "id": 1,
      "name": "How to Grow Instagram Followers in 2026",
      "slug": "how-to-grow-instagram-followers-2026",
      "banner_url": "https://ik.imagekit.io/.../banner.jpg",
      "content_html": "<h2>Introduction</h2><p>Growing your Instagram...</p>",
      "desc_seo": "Learn the best strategies to grow your Instagram following organically.",
      "seo_title": "Instagram Growth Guide 2026",
      "keywords": ["instagram", "followers", "growth"],
      "view_count": 1241,
      "created_at": "2026-02-01T10:00:00.000Z",
      "updated_at": "2026-02-10T08:30:00.000Z",
      "category": {
        "id": 3,
        "name": "Tips & Tricks",
        "slug": "tips-tricks"
      }
    },
    "recommended": [
      {
        "id": 5,
        "name": "TikTok Followers Growth Strategy",
        "slug": "tiktok-followers-growth-strategy",
        "banner_imagekit_upload_url": "https://ik.imagekit.io/.../tiktok-banner.jpg",
        "desc_seo": "How to grow TikTok followers fast.",
        "view_count": 870,
        "created_at": "2026-01-15T09:00:00.000Z",
        "category": { "id": 3, "name": "Tips & Tricks", "slug": "tips-tricks" }
      }
    ]
  }
}
```

**Notes**:
- `content_html` — Konten artikel dalam format HTML, siap di-render langsung di WebView atau dengan HTML parser.
- `recommended` — Maksimum 3 artikel dari kategori yang sama, diurutkan berdasarkan jumlah view terbanyak.
- `view_count` — Nilai yang dikembalikan sudah mencerminkan view setelah increment.

**Error Responses**:
| HTTP | Message |
|------|---------|
| `400` | `"Slug is required"` |
| `404` | `"Article not found"` |
| `500` | `"Internal Server Error"` |

---

### 12.3 List Kategori Blog
**Endpoint**: `GET /blog/categories`

Mengembalikan semua kategori blog aktif beserta jumlah artikel aktif di setiap kategori.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "News",
      "slug": "news",
      "description": "Latest news and updates.",
      "article_count": 12
    },
    {
      "id": 3,
      "name": "Tips & Tricks",
      "slug": "tips-tricks",
      "description": null,
      "article_count": 8
    }
  ]
}
```

---

## 13. Firebase Push Notification (FCM)

Push notification dikirim secara otomatis ke semua device aktif pengguna menggunakan **Firebase Cloud Messaging (FCM)**.

> Konfigurasi Firebase (Service Account JSON) dilakukan di **Admin Panel → Settings → Firebase Push Notification**.

---

### 13.1 Register FCM Token

**Endpoint**: `POST /fcm/register`

Simpan atau update FCM device token untuk sesi aktif. Panggil ini setiap kali:
- User berhasil login
- Firebase SDK memperbarui token (`onTokenRefresh`)

**Request Body**:
```json
{
  "fcm_token": "exxxxxxx:APA91bHxx..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": { "registered": true },
  "message": "FCM token registered successfully"
}
```

---

### 13.2 Hapus FCM Token (Logout)

**Endpoint**: `DELETE /fcm/register`

Hapus FCM token dari sesi saat ini. Panggil ini ketika user logout agar tidak menerima push notification lagi di device tersebut.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": { "unregistered": true },
  "message": "FCM token removed"
}
```

---

### 13.3 Push Notification Otomatis

Berikut semua event yang memicu push notification ke user secara otomatis:

| Event | Trigger | Title | Payload `data` |
|-------|---------|-------|----------------|
| **Order dibuat** | `POST /order` | "Order Placed Successfully" | `{ type: "ORDER", related_id, screen: "order_detail" }` |
| **Order status berubah** | Admin update order | Sesuai status baru | `{ type: "ORDER", screen: "order_detail" }` |
| **Deposit dibuat** | `POST /deposit` | "Deposit Submitted" | `{ type: "DEPOSIT", screen: "deposit" }` |
| **Deposit disetujui** | `POST /deposit/check-status` | "💰 Deposit Approved" | `{ type: "DEPOSIT", status: "PAYMENT", screen: "deposit" }` |
| **Deposit dibatalkan** | `POST /deposit/check-status` | "Deposit Cancelled" | `{ type: "DEPOSIT", status: "CANCELED", screen: "deposit" }` |
| **Tiket dibuat** | `POST /tickets` | "Ticket Created" | `{ type: "TICKET", screen: "ticket_detail" }` |
| **User reply tiket** | `POST /tickets/:id/reply` | "Reply Sent" | `{ type: "TICKET", ticket_id, screen: "ticket_detail" }` |
| **Admin reply tiket** | Admin reply dari panel | "New Reply on Your Ticket" | `{ type: "TICKET", screen: "ticket_detail" }` |

---

### 13.4 Struktur Data Push Notification

Setiap push notification yang diterima mobile memiliki format:

```json
{
  "notification": {
    "title": "💰 Deposit Approved",
    "body": "Your deposit of $10.00 has been approved and credited to your balance."
  },
  "data": {
    "type": "DEPOSIT",
    "related_id": "42",
    "status": "PAYMENT",
    "screen": "deposit"
  }
}
```

Field `data.screen` dapat digunakan untuk navigasi deep-link di mobile app:

| `screen` value | Navigasi ke |
|----------------|-------------|
| `deposit` | Halaman riwayat deposit |
| `order_detail` | Detail order (gunakan `related_id`) |
| `ticket_detail` | Detail tiket (gunakan `ticket_id` atau `related_id`) |
| `blog_detail` | Detail artikel blog (gunakan `slug`) |
| `home` | Halaman utama |

---

### 13.5 Integrasi Mobile SDK (React Native / Expo)

**Install**:
```bash
npx expo install @react-native-firebase/app @react-native-firebase/messaging
```

**Setup di app entry point**:
```typescript
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

async function setupPushNotifications(authToken: string) {
  // 1. Request permission
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  // 2. Get FCM token
  const fcmToken = await messaging().getToken();

  // 3. Register token to backend
  await axios.post(
    'https://yourpanel.com/api-mobile/fcm/register',
    { fcm_token: fcmToken },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  // 4. Handle token refresh
  messaging().onTokenRefresh(async (newToken) => {
    await axios.post(
      'https://yourpanel.com/api-mobile/fcm/register',
      { fcm_token: newToken },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  });

  // 5. Handle foreground notifications
  messaging().onMessage(async (remoteMessage) => {
    console.log('FCM received:', remoteMessage);
    // Show local notification or update UI
  });
}

// Call on logout
async function onLogout(authToken: string) {
  await axios.delete(
    'https://yourpanel.com/api-mobile/fcm/register',
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
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
