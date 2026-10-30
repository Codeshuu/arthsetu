# API Contract — ArthSetu

## Base URL
`/api/v1`

## Standard Envelope & Error Format
All 4xx and 5xx errors return JSON with the standard FastAPI exception payload:
```json
{
  "detail": "Error description message"
}
```

---

## 1. Authentication Module (`/auth`)

### 1.1 Register User
- **Method / Path:** `POST /api/v1/auth/register`
- **Auth:** None
- **Request Body (`application/json`):**
  ```json
  {
    "email": "user@kirana.org",
    "password": "SecurePassword@123",
    "full_name": "Ramesh Kumar"
  }
  ```
- **Responses:**
  - `201 Created`: User registered successfully.
    ```json
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@kirana.org",
      "full_name": "Ramesh Kumar",
      "is_active": true,
      "created_at": "2026-10-31T01:00:00Z"
    }
    ```
  - `409 Conflict`: User with this email already exists.
  - `422 Unprocessable Content`: Validation error (password < 8 chars, invalid email).

### 1.2 Login User
- **Method / Path:** `POST /api/v1/auth/login`
- **Auth:** None
- **Request Body (`application/json`):**
  ```json
  {
    "email": "user@kirana.org",
    "password": "SecurePassword@123"
  }
  ```
- **Responses:**
  - `200 OK`: Successful authentication.
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
      "token_type": "bearer"
    }
    ```
  - `401 Unauthorized`: Incorrect email or password (timing-safe).

### 1.3 Get Current User Profile
- **Method / Path:** `GET /api/v1/auth/me`
- **Auth:** Bearer JWT Token (`Authorization: Bearer <token>`)
- **Responses:**
  - `200 OK`: Returns authenticated user profile.
    ```json
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@kirana.org",
      "full_name": "Ramesh Kumar",
      "is_active": true,
      "created_at": "2026-10-31T01:00:00Z"
    }
    ```
  - `401 Unauthorized`: Token missing, invalid, or expired.

---

## 2. Business Profile Module (`/businesses`)

All endpoints require Bearer JWT authentication and enforce strict multi-tenant ownership scoping (`owner_user_id == current_user.id`).

### 2.1 Create Business Profile
- **Method / Path:** `POST /api/v1/businesses`
- **Auth:** Bearer JWT Token
- **Request Body (`application/json`):**
  ```json
  {
    "trade_name": "Gupta Kirana & General Store",
    "category": "Kirana",
    "business_type": "Sole Proprietorship",
    "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }
  ```
- **Responses:**
  - `201 Created`: Business created successfully.
    ```json
    {
      "id": "e4b2d184-f7b5-4f40-8f92-959c5d1a5861",
      "owner_user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "trade_name": "Gupta Kirana & General Store",
      "category": "Kirana",
      "business_type": "Sole Proprietorship",
      "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "created_at": "2026-10-31T01:25:00Z",
      "updated_at": "2026-10-31T01:25:00Z"
    }
    ```
  - `401 Unauthorized`: Missing or invalid token.
  - `422 Unprocessable Content`: Missing or invalid fields (e.g. empty `trade_name`).

### 2.2 List Businesses for Authenticated User
- **Method / Path:** `GET /api/v1/businesses`
- **Auth:** Bearer JWT Token
- **Responses:**
  - `200 OK`: Returns an array of businesses owned by the caller. Returns `[]` if none exist.
    ```json
    [
      {
        "id": "e4b2d184-f7b5-4f40-8f92-959c5d1a5861",
        "owner_user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "trade_name": "Gupta Kirana & General Store",
        "category": "Kirana",
        "business_type": "Sole Proprietorship",
        "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "created_at": "2026-10-31T01:25:00Z",
        "updated_at": "2026-10-31T01:25:00Z"
      }
    ]
    ```
  - `401 Unauthorized`: Missing or invalid token.

### 2.3 Fetch Business by ID
- **Method / Path:** `GET /api/v1/businesses/{business_id}`
- **Auth:** Bearer JWT Token
- **Path Parameters:**
  - `business_id` (UUID, required): The UUID of the business.
- **Responses:**
  - `200 OK`: Returns the business profile.
  - `404 Not Found`: If business does not exist OR belongs to another tenant (avoids resource enumeration).
  - `401 Unauthorized`: Missing or invalid token.
  - `422 Unprocessable Content`: Malformed UUID.

### 2.4 Update Business Profile
- **Method / Path:** `PATCH /api/v1/businesses/{business_id}` (also supports `PUT`)
- **Auth:** Bearer JWT Token
- **Path Parameters:**
  - `business_id` (UUID, required): The UUID of the business.
- **Request Body (`application/json`):** Partial updates allowed.
  ```json
  {
    "trade_name": "Gupta Supermart & Kirana",
    "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  }
  ```
- **Responses:**
  - `200 OK`: Returns the updated business profile.
  - `404 Not Found`: If business does not exist OR belongs to another tenant.
  - `401 Unauthorized`: Missing or invalid token.
  - `422 Unprocessable Content`: Malformed UUID or invalid field types.

---

## 3. Transaction Module (`/transactions`)

All endpoints require Bearer JWT authentication and enforce strict multi-tenant ownership scoping (`Transaction -> Business -> owner_user_id == current_user.id`).

### 3.1 Create Transaction
- **Method / Path:** `POST /api/v1/transactions`
- **Auth:** Bearer JWT Token
- **Request Body (`application/json`):**
  ```json
  {
    "business_id": "e4b2d184-f7b5-4f40-8f92-959c5d1a5861",
    "transaction_date": "2026-10-31",
    "transaction_time": "14:30:00",
    "amount": "2500.50",
    "flow_type": "INFLOW",
    "payment_mode": "UPI",
    "category": "SALE",
    "counterparty_name": "Ramesh Groceries",
    "counterparty_identifier": "ramesh@upi",
    "reference_number": "UPI/2026/001",
    "description": "Daily Kirana sale"
  }
  ```
- **Responses:**
  - `201 Created`: Transaction created successfully.
    ```json
    {
      "id": "7b08f447-79aa-448c-9eb2-9d3d3ef46cfb",
      "business_id": "e4b2d184-f7b5-4f40-8f92-959c5d1a5861",
      "source_id": null,
      "import_batch_id": null,
      "import_row_id": null,
      "transaction_date": "2026-10-31",
      "transaction_time": "14:30:00",
      "amount": "2500.50",
      "flow_type": "INFLOW",
      "payment_mode": "UPI",
      "category": "SALE",
      "counterparty_name": "Ramesh Groceries",
      "counterparty_identifier": "ramesh@upi",
      "reference_number": "UPI/2026/001",
      "description": "Daily Kirana sale",
      "is_flagged": false,
      "flag_reason": null,
      "created_at": "2026-10-31T01:30:00Z",
      "updated_at": "2026-10-31T01:30:00Z"
    }
    ```
  - `404 Not Found`: Target `business_id` does not exist or belongs to another tenant.
  - `401 Unauthorized`: Missing or invalid token.
  - `422 Unprocessable Content`: Negative/zero amount, invalid flow_type, or missing required fields.

### 3.2 List Transactions (Filtered & Paginated)
- **Method / Path:** `GET /api/v1/transactions`
- **Auth:** Bearer JWT Token
- **Query Parameters:**
  - `business_id` (UUID, optional): Scoped business filter. Verified against user ownership.
  - `page` (integer, default: 1, min: 1): 1-indexed page number.
  - `page_size` (integer, default: 20, min: 1, max: 100): Records per page.
  - `start_date` (date, optional, YYYY-MM-DD): Filter transactions on or after date.
  - `end_date` (date, optional, YYYY-MM-DD): Filter transactions on or before date.
  - `flow_type` (string, optional): `INFLOW` or `OUTFLOW`.
  - `payment_mode` (string, optional): `CASH`, `UPI`, `NET_BANKING`, `CHEQUE`, etc.
  - `category` (string, optional): `SALE`, `EXPENSE`, `TRANSFER`, etc.
- **Responses:**
  - `200 OK`: Paginated envelope with sorting by `transaction_date DESC, created_at DESC`.
    ```json
    {
      "items": [
        {
          "id": "7b08f447-79aa-448c-9eb2-9d3d3ef46cfb",
          "business_id": "e4b2d184-f7b5-4f40-8f92-959c5d1a5861",
          "source_id": null,
          "import_batch_id": null,
          "import_row_id": null,
          "transaction_date": "2026-10-31",
          "transaction_time": "14:30:00",
          "amount": "2500.50",
          "flow_type": "INFLOW",
          "payment_mode": "UPI",
          "category": "SALE",
          "counterparty_name": "Ramesh Groceries",
          "counterparty_identifier": "ramesh@upi",
          "reference_number": "UPI/2026/001",
          "description": "Daily Kirana sale",
          "is_flagged": false,
          "flag_reason": null,
          "created_at": "2026-10-31T01:30:00Z",
          "updated_at": "2026-10-31T01:30:00Z"
        }
      ],
      "total": 1,
      "page": 1,
      "page_size": 20,
      "total_pages": 1
    }
    ```
  - `400 Bad Request`: When `start_date > end_date`.
  - `404 Not Found`: If `business_id` query param specifies a business not owned by user.
  - `401 Unauthorized`: Missing or invalid token.
  - `422 Unprocessable Content`: `page_size > 100` or malformed parameter.

### 3.3 Fetch Transaction by ID
- **Method / Path:** `GET /api/v1/transactions/{transaction_id}`
- **Auth:** Bearer JWT Token
- **Path Parameters:**
  - `transaction_id` (UUID, required): The UUID of the transaction.
- **Responses:**
  - `200 OK`: Returns the transaction object.
  - `404 Not Found`: Transaction does not exist OR belongs to another tenant.
  - `401 Unauthorized`: Missing or invalid token.

### 3.4 Update Transaction
- **Method / Path:** `PATCH /api/v1/transactions/{transaction_id}` (also supports `PUT`)
- **Auth:** Bearer JWT Token
- **Path Parameters:**
  - `transaction_id` (UUID, required): The UUID of the transaction.
- **Request Body (`application/json`):** Partial updates allowed. Immutability enforced for `id`, `business_id`, import IDs, and system flags.
  ```json
  {
    "amount": "3000.00",
    "description": "Adjusted kirana sale"
  }
  ```
- **Responses:**
  - `200 OK`: Returns the updated transaction object.
  - `404 Not Found`: Transaction does not exist OR belongs to another tenant.
  - `401 Unauthorized`: Missing or invalid token.
  - `422 Unprocessable Content`: Amount <= 0 or invalid field formats.

### 3.5 Delete Transaction
- **Method / Path:** `DELETE /api/v1/transactions/{transaction_id}`
- **Auth:** Bearer JWT Token
- **Path Parameters:**
  - `transaction_id` (UUID, required): The UUID of the transaction.
- **Responses:**
  - `204 No Content`: Transaction deleted safely.
  - `409 Conflict`: Cannot delete transaction referenced in active reconciliation records (`Reconciliation`).
  - `404 Not Found`: Transaction does not exist OR belongs to another tenant.
  - `401 Unauthorized`: Missing or invalid token.

---

## 4. Other Modules (Planned / Upcoming)
- **Imports**: `/imports` - T3-01 to T3-05
- **Reconciliation**: `/reconciliation` - T3-06, T3-07
- **Analysis**: `/analysis` - T4-01 to T4-05
- **Passports**: `/passports` - T4-06, T4-07

