# Personal Finance Tracker - API Documentation

## 📡 API Endpoints Overview

### **Base URL**
```
https://67ac71475853dfff53dab929.mockapi.io/api/v1
```

### **Headers**
```json
{
    "Content-Type": "application/json"
}
```

### **Timeout Configuration**
- **Request Timeout**: 10 seconds
- **Connection Timeout**: 10 seconds

---

## 🔐 Authentication Endpoints

### **Login User**
```http
GET /users?username={username}
```

#### **Description**
Authenticates a user by fetching user data based on username and validating password client-side.

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User's username for authentication |

#### **Request Example**
```bash
curl -X GET "https://67ac71475853dfff53dab929.mockapi.io/api/v1/users?username=testuser" \
  -H "Content-Type: application/json"
```

#### **Response Format**
```typescript
interface User {
    id: string;
    username: string;
    password: string;
    name?: string;
    email?: string;
}
```

#### **Success Response (200)**
```json
[
    {
        "id": "1",
        "username": "testuser",
        "password": "testpass",
        "name": "Test User",
        "email": "test@example.com"
    }
]
```

#### **Error Responses**
| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 404 | User not found | `[]` (empty array) |
| 500 | Server error | `{"error": "Internal server error"}` |

#### **Client-Side Validation**
- Username: minimum 3 characters, required
- Password: minimum 4 characters, required
- Password matching performed client-side

---

## 💰 Expense Management Endpoints

### **Get All Expenses**
```http
GET /expenses
```

#### **Description**
Retrieves all expenses from the system.

#### **Request Example**
```bash
curl -X GET "https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses" \
  -H "Content-Type: application/json"
```

#### **Response Format**
```typescript
interface Expense {
    id: string;
    title: string;
    name?: string; // API compatibility field
    amount: number;
    category: string;
    date: string; // ISO date format
    description?: string;
    userId?: string;
    createdAt?: string;
}
```

#### **Success Response (200)**
```json
[
    {
        "id": "1",
        "title": "Grocery Shopping",
        "amount": 85.50,
        "category": "Food & Dining",
        "date": "2025-05-27",
        "description": "Weekly groceries",
        "userId": "1",
        "createdAt": "2025-05-27T10:30:00Z"
    },
    {
        "id": "2",
        "title": "Gas Station",
        "amount": 45.00,
        "category": "Transportation",
        "date": "2025-05-26",
        "userId": "1"
    }
]
```

#### **Data Transformation**
The client automatically transforms API responses:
- `expense.name` → `expense.title` (fallback)
- String amounts → Number conversion
- Default category: "Other"
- Default date: current date

---

### **Get Expense by ID**
```http
GET /expenses/{id}
```

#### **Description**
Retrieves a specific expense by its unique identifier.

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique expense identifier |

#### **Request Example**
```bash
curl -X GET "https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses/1" \
  -H "Content-Type: application/json"
```

#### **Success Response (200)**
```json
{
    "id": "1",
    "title": "Grocery Shopping",
    "amount": 85.50,
    "category": "Food & Dining",
    "date": "2025-05-27",
    "description": "Weekly groceries",
    "userId": "1",
    "createdAt": "2025-05-27T10:30:00Z"
}
```

#### **Error Responses**
| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 404 | Expense not found | `{"error": "Not found"}` |
| 400 | Invalid expense ID | `{"error": "Invalid ID format"}` |

---

### **Create New Expense**
```http
POST /expenses
```

#### **Description**
Creates a new expense with duplicate detection and validation.

#### **Request Body**
```typescript
interface CreateExpenseRequest {
    title: string;        // Required, min 2 characters
    amount: number;       // Required, > 0, max 999999.99
    category: string;     // Required, from predefined list
    date: string;         // Required, YYYY-MM-DD format, not future
    description?: string; // Optional, max 300 characters
    userId?: string;      // Optional, user identifier
}
```

#### **Request Example**
```bash
curl -X POST "https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Coffee Shop",
    "amount": 5.50,
    "category": "Food & Dining",
    "date": "2025-05-27",
    "description": "Morning coffee",
    "userId": "1"
  }'
```

#### **Success Response (201)**
```json
{
    "id": "3",
    "title": "Coffee Shop",
    "amount": 5.50,
    "category": "Food & Dining",
    "date": "2025-05-27",
    "description": "Morning coffee",
    "userId": "1",
    "createdAt": "2025-05-27T11:45:00Z"
}
```

#### **Validation Rules**
| Field | Validation Rule |
|-------|----------------|
| title | Required, 2-100 characters, trimmed |
| amount | Required, number > 0, max 999999.99 |
| category | Required, must be from predefined list |
| date | Required, YYYY-MM-DD format, not future |
| description | Optional, max 300 characters |

#### **Predefined Categories**
```typescript
const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Business',
    'Other'
];
```

#### **Duplicate Detection Logic**
The system checks for duplicates based on:
1. **Same title** (case-insensitive)
2. **Same amount** (±0.01 precision)
3. **Same date** (exact match)

#### **Duplicate Response (400)**
```json
{
    "error": "DUPLICATE_FOUND:{\"title\":\"Coffee Shop\",\"amount\":5.50,\"category\":\"Food & Dining\",\"date\":\"2025-05-27\",\"id\":\"2\"}"
}
```

#### **Error Responses**
| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Validation error | `{"error": "Expense title is required"}` |
| 400 | Duplicate found | `{"error": "DUPLICATE_FOUND:{...}"}` |
| 422 | Invalid data format | `{"error": "Invalid date format"}` |

---

### **Force Create Expense (Bypass Duplicates)**
```http
POST /expenses (via forceCreateExpense method)
```

#### **Description**
Creates an expense bypassing duplicate detection. Used when user chooses to create despite duplicates.

#### **Usage**
This endpoint uses the same `/expenses` URL but is called through the `forceCreateExpense()` method in the client, which skips duplicate checking.

#### **Request/Response**
Same as regular create expense, but without duplicate validation.

---

### **Delete Expense**
```http
DELETE /expenses/{id}
```

#### **Description**
Permanently deletes an expense from the system.

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique expense identifier |

#### **Request Example**
```bash
curl -X DELETE "https://67ac71475853dfff53dab929.mockapi.io/api/v1/expenses/1" \
  -H "Content-Type: application/json"
```

#### **Success Response (200)**
```json
{
    "success": true
}
```

#### **Error Responses**
| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 404 | Expense not found | `{"error": "Not found"}` |
| 400 | Invalid expense ID | `{"error": "Invalid ID format"}` |

---

## 🔧 HTTP Client Configuration

### **Axios Instance Setup**
```typescript
export const api = axios.create({
    baseURL: 'https://67ac71475853dfff53dab929.mockapi.io/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});
```

### **Request Interceptor**
```typescript
// Automatic request logging and configuration
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => Promise.reject(error)
);
```

### **Response Interceptor**
```typescript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        
        // Handle network errors
        if (!error.response) {
            throw new Error('No internet connection. Please check your network and try again.');
        }

        const status = error.response.status;
        const data = error.response.data;

        // Handle different HTTP status codes
        switch (status) {
            case 400:
                throw new Error(data?.message || 'Invalid request. Please check your input and try again.');
            case 401:
                throw new Error('Authentication failed. Please login again.');
            case 403:
                throw new Error('Access denied. You don\'t have permission to perform this action.');
            case 404:
                throw new Error('The requested item was not found. It may have been deleted.');
            case 409:
                throw new Error('This action conflicts with existing data. Please refresh and try again.');
            case 422:
                throw new Error(data?.message || 'Invalid data provided. Please check your input.');
            case 429:
                throw new Error('Too many requests. Please wait a moment and try again.');
            case 500:
            case 502:
            case 503:
                throw new Error('Server error. Please try again later.');
            default:
                throw new Error(`Request failed (${status}). Please try again.`);
        }
    }
);
```

---

## 📊 Error Handling Strategy

### **Error Categories**

#### 1. **Network Errors**
```typescript
// Timeout errors
if (error.code === 'ECONNABORTED') {
    // Handle timeout
}

// No internet connection
if (!error.response) {
    // Handle offline state
}
```

#### 2. **HTTP Status Errors**
| Status | Category | Handling Strategy |
|--------|----------|------------------|
| 400 | Bad Request | Show validation error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show item not found |
| 409 | Conflict | Show conflict resolution |
| 422 | Validation | Show field-specific errors |
| 429 | Rate Limit | Show retry message |
| 5xx | Server Error | Show generic server error |

#### 3. **Business Logic Errors**
```typescript
// Duplicate detection
if (error.message.includes('DUPLICATE_FOUND:')) {
    // Parse duplicate data and show options
    const duplicateData = JSON.parse(error.message.split('DUPLICATE_FOUND:')[1]);
    // Show: Cancel, View Existing, Create Anyway
}

// Validation errors
if (error.message.includes('is required')) {
    // Show field-specific validation error
}
```

### **User-Friendly Error Messages**

#### **Network Issues**
- "No internet connection. Please check your network and try again."
- "Request timed out. Please check your internet connection and try again."
- "Server error. Please try again later."

#### **Validation Issues**
- "Please enter an expense title"
- "Please enter a valid amount greater than 0"
- "Expense date cannot be in the future"
- "Amount cannot exceed $999,999.99"

#### **Business Logic Issues**
- "A similar expense may already exist. Please check your expenses list."
- "Expense not found. It may have already been deleted."
- "Failed to create expense. Please check your input and try again."

---

## 🧪 API Testing

### **Test Script Location**
```
/tests/api-test.js
```

### **Running Tests**
```bash
node tests/api-test.js
```

### **Test Coverage**
1. **Authentication Tests**
   - Valid login
   - Invalid credentials
   - Missing parameters

2. **Expense CRUD Tests**
   - Create expense
   - Get all expenses
   - Get expense by ID
   - Delete expense
   - Duplicate detection

3. **Error Handling Tests**
   - Network timeouts
   - Invalid data
   - Non-existent resources

### **Sample Test Results**
```
✓ GET /users - Authentication successful
✓ GET /expenses - Retrieved all expenses
✓ POST /expenses - Created new expense
✓ GET /expenses/{id} - Retrieved specific expense
✓ DELETE /expenses/{id} - Deleted expense
✓ Error handling - Invalid ID returns 404
✓ Duplicate detection - Prevented duplicate creation
```

---

## 📈 Performance Considerations

### **Response Times**
- **Average Response Time**: < 500ms
- **Timeout Setting**: 10 seconds
- **Retry Strategy**: Manual retry with user feedback

### **Data Volume**
- **Maximum Expenses**: No hard limit (MockAPI constraint)
- **Request Size**: Max 1MB (standard JSON payload)
- **Concurrent Requests**: Handled by axios queue

### **Caching Strategy**
- **Client-Side Caching**: React state-based
- **Cache Invalidation**: On create/update/delete operations
- **Refresh Strategy**: Pull-to-refresh and auto-refresh on focus

---

## 🔒 Security Considerations

### **Data Validation**
- **Client-Side**: Form validation before API calls
- **Server-Side**: Automatic validation by MockAPI
- **Sanitization**: Input trimming and type checking

### **Authentication**
- **Method**: Username/password matching
- **Session**: Context-based state management
- **Route Protection**: Authentication guards

### **Data Protection**
- **No Sensitive Data**: Passwords not stored client-side
- **Error Sanitization**: No sensitive info in error messages
- **Input Validation**: Prevent injection attacks

---

## 📝 API Usage Examples

### **Complete Expense Lifecycle**

#### 1. Login
```javascript
const user = await authAPI.login('testuser', 'testpass');
if (user) {
    // Login successful, proceed to main app
}
```

#### 2. Load Expenses
```javascript
const expenses = await expensesAPI.getAllExpenses();
setExpenses(expenses);
```

#### 3. Create Expense with Duplicate Handling
```javascript
try {
    const newExpense = await expensesAPI.createExpense({
        title: 'Coffee',
        amount: 5.50,
        category: 'Food & Dining',
        date: '2025-05-27',
        description: 'Morning coffee'
    });
    // Success: expense created
} catch (error) {
    if (error.message.includes('DUPLICATE_FOUND:')) {
        // Handle duplicate: show user options
        const duplicateData = JSON.parse(error.message.split('DUPLICATE_FOUND:')[1]);
        // Options: Cancel, View Existing, Force Create
    } else {
        // Handle other errors
        Alert.alert('Error', error.message);
    }
}
```

#### 4. Force Create (Bypass Duplicates)
```javascript
const newExpense = await expensesAPI.forceCreateExpense(expenseData);
// Created regardless of duplicates
```

#### 5. Delete Expense
```javascript
await expensesAPI.deleteExpense(expenseId);
// Expense deleted successfully
```

---

This API documentation provides comprehensive coverage of all endpoints, error handling strategies, and usage patterns for the Personal Finance Tracker application.
