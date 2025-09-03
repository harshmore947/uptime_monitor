# Authentication Endpoints Test Data

## Base URL

```
http://localhost:3000/api
```

## 1. POST /api/auth/register

**Description:** Registers a new user with email, password, and optional name.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Expected Response (201):**

```json
{
  "msg": "user created",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "success": true
}
```

**Test Cases:**

- Valid registration
- Duplicate email (409 error)
- Invalid email format (400 error)
- Password too short (400 error)

---

## 2. POST /api/auth/login

**Description:** Logs in a user with email and password.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response (200):**

```json
{
  "msg": "login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "success": true
}
```

**Test Cases:**

- Valid login
- Invalid email (401 error)
- Wrong password (401 error)
- Invalid input format (400 error)

---

## 3. POST /api/auth/logout

**Description:** Logs out user (client-side token removal).

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:** None

**Expected Response (200):**

```json
{
  "msg": "logout successful",
  "success": true
}
```

---

## 4. GET /api/auth/me

**Description:** Returns current authenticated user's profile.

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200):**

```json
{
  "msg": "user profile fetched successfully",
  "user": {
    "_id": "66d0123456789abcdef12345",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "plan": "starter",
    "isActive": true,
    "settings": {
      "notification": {
        "email": true,
        "slack": true,
        "discord": true
      },
      "timezone": "UTC"
    },
    "createdAt": "2025-08-29T10:00:00.000Z",
    "updatedAt": "2025-08-29T10:00:00.000Z"
  },
  "success": true
}
```

**Test Cases:**

- Valid token
- Invalid/expired token (401 error)
- User not found (404 error)

---

## 5. PUT /api/auth/me

**Description:** Updates user profile (email, name, password).

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body (all fields optional):**

```json
{
  "email": "john.updated@example.com",
  "name": "John Updated",
  "password": "newpassword123"
}
```

**Expected Response (200):**

```json
{
  "msg": "profile updated successfully",
  "user": {
    "_id": "66d0123456789abcdef12345",
    "email": "john.updated@example.com",
    "name": "John Updated",
    "plan": "starter",
    "isActive": true,
    "settings": {
      "notification": {
        "email": true,
        "slack": true,
        "discord": true
      },
      "timezone": "UTC"
    },
    "createdAt": "2025-08-29T10:00:00.000Z",
    "updatedAt": "2025-08-29T11:00:00.000Z"
  },
  "success": true
}
```

**Test Cases:**

- Update email only
- Update name only
- Update password only
- Update all fields
- Email already exists (409 error)
- Invalid token (401 error)

---

## 6. POST /api/auth/forgot-password

**Description:** Sends password reset email (token logged to console for testing).

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response (200):**

```json
{
  "msg": "if email exists, reset link has been sent",
  "success": true
}
```

**Note:** For security, response is the same whether email exists or not.
**Check console logs for reset token during testing.**

**Test Cases:**

- Valid email
- Non-existent email (same response)
- Invalid email format (400 error)

---

## 7. POST /api/auth/reset-password

**Description:** Resets password using token from forgot-password.

**Request Body:**

```json
{
  "token": "reset_token_from_forgot_password_console_log",
  "password": "newpassword123"
}
```

**Expected Response (200):**

```json
{
  "msg": "password reset successful",
  "success": true
}
```

**Test Cases:**

- Valid token and password
- Invalid token (400 error)
- Expired token (400 error)
- Password too short (400 error)

---

## cURL Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_CONSOLE",
    "password": "newpassword123"
  }'
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing Workflow

1. **Register a new user** → Save the JWT token
2. **Login with the same user** → Verify token works
3. **Get current user profile** → Using the token
4. **Update user profile** → Test partial updates
5. **Forgot password** → Check console for reset token
6. **Reset password** → Using the console token
7. **Login with new password** → Verify reset worked
8. **Logout** → Complete the flow

---

## Error Responses

### 400 - Bad Request

```json
{
  "msg": "invalid input",
  "errors": {
    "fieldErrors": {
      "email": ["Invalid email"],
      "password": ["String must contain at least 6 character(s)"]
    }
  },
  "success": false
}
```

### 401 - Unauthorized

```json
{
  "msg": "invalid credentials",
  "success": false
}
```

### 409 - Conflict

```json
{
  "msg": "user already exists, please try with a new email",
  "success": false
}
```

### 500 - Internal Server Error

```json
{
  "msg": "internal server error",
  "success": false
}
```
