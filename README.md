# Personal Finance Tracker

A React Native mobile application built with Expo for tracking personal expenses with comprehensive error handling and duplicate detection.

## 📱 Features

- **User Authentication**: Secure login with validation
- **Expense Management**: Create, view, edit, and delete expenses
- **Duplicate Detection**: Smart duplicate expense detection with user options
- **Category Management**: Pre-defined expense categories
- **Real-time Validation**: Comprehensive form validation and error handling
- **Responsive UI**: Modern, intuitive interface
- **Offline Support**: Local state management with API synchronization

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **UI Components**: React Native with custom styling
- **Icons**: Expo Vector Icons (FontAwesome)

### **Project Structure**
```
my-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── _layout.tsx    # Tab layout with header
│   │   ├── index.tsx      # Expenses list (home)
│   │   └── two.tsx        # Additional tab
│   ├── _layout.tsx        # Root layout with auth guards
│   ├── add-expense.tsx    # Add expense form
│   ├── expense-details.tsx # Expense details view
│   └── login.tsx          # Login screen
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication state
├── services/              # API services
│   └── api.ts             # HTTP client and API methods
├── components/            # Reusable UI components
├── constants/             # App constants and themes
└── assets/               # Images, fonts, and static files
```

## 🔄 Data Flow Architecture

### **Application Flow**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Login Screen  │───▶│  Auth Context    │───▶│  Main App Tabs  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │    API Service   │◀───│ Expenses Screen │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   MockAPI.io     │    │ Add Forms  │
                       │   (Backend)      │    └─────────────────┘
                       └──────────────────┘             │
                                                        ▼
                                              ┌─────────────────┐
                                              │ Expense Details │
                                              └─────────────────┘
```

### **Data Flow Sequence**

#### 1. **Authentication Flow**
```
User → Login Screen → Validation → API Service → MockAPI → Auth Context → Main App
```

#### 2. **Expense Creation Flow**
```
User → Add Expense Form → Validation → Duplicate Check → API Service → MockAPI → Update Local State → UI Refresh
```

#### 3. **Expense Management Flow**
```
User → Expenses List → API Service → MockAPI → Local State → Real-time UI Updates
```

## 🛠️ API Endpoints

### **Base URL**
```
https://67ac71475853dfff53dab929.mockapi.io/api/v1
```

### **Authentication Endpoints**
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/users?username={username}` | Login user | - | `User[]` |

### **Expense Endpoints**
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/expenses` | Get all expenses | - | `Expense[]` |
| GET | `/expenses/{id}` | Get expense by ID | - | `Expense` |
| POST | `/expenses` | Create new expense | `Expense` | `Expense` |
| DELETE | `/expenses/{id}` | Delete expense | - | `void` |

### **Data Models**

#### **User Interface**
```typescript
interface User {
    id: string;
    username: string;
    password: string;
    name?: string;
    email?: string;
}
```

#### **Expense Interface**
```typescript
interface Expense {
    id: string;
    title: string;
    name?: string; // API compatibility
    amount: number;
    category: string;
    date: string;
    description?: string;
    userId?: string;
    createdAt?: string;
}
```

## 📄 Application Pages

### **Implemented Pages**

#### 1. **Login Screen** (`/login.tsx`)
- **Purpose**: User authentication
- **Features**:
  - Username/password validation
  - Error handling with specific messages
  - Auto-redirect on successful login
- **Validation Rules**:
  - Username: minimum 3 characters
  - Password: minimum 4 characters

#### 2. **Expenses List** (`/(tabs)/index.tsx`)
- **Purpose**: Display all expenses with summary
- **Features**:
  - Real-time expense list
  - Total expenses calculation with NaN handling
  - Pull-to-refresh functionality
  - Delete expenses with confirmation
  - Navigation to expense details
- **Error Handling**: Network errors, server errors, data formatting issues

#### 3. **Add Expense Form** (`/add-expense.tsx`)
- **Purpose**: Create new expenses
- **Features**:
  - Comprehensive form validation
  - Duplicate detection with user options
  - Category selection dropdown
  - Date validation (no future dates)
  - Amount validation (0-999,999.99)
- **Duplicate Handling**:
  - Detects duplicates by title, amount, and date
  - Offers options: Cancel, View Existing, Create Anyway

#### 4. **Expense Details** (`/expense-details.tsx`)
- **Purpose**: View and manage individual expenses
- **Features**:
  - Detailed expense information
  - Delete functionality with confirmation
  - Error handling for missing expenses
  - Navigation back to list

#### 5. **Tab Layout** (`/(tabs)/_layout.tsx`)
- **Purpose**: Main navigation structure
- **Features**:
  - Header with add expense button
  - Tab-based navigation
  - Debug navigation logging

#### 6. **Root Layout** (`/_layout.tsx`)
- **Purpose**: App-wide layout and routing
- **Features**:
  - Authentication guards
  - Route protection
  - Context providers

## 🔧 Error Handling Strategy

### **Validation Layers**
1. **Client-side Validation**: Form fields, data types, business rules
2. **API Validation**: Server-side validation with detailed error messages
3. **Network Error Handling**: Timeout, connectivity, server errors
4. **Duplicate Detection**: Smart duplicate checking with user options

### **Error Categories**
- **Validation Errors**: Invalid input, missing fields
- **Network Errors**: Timeout, no connection, server errors
- **Business Logic Errors**: Duplicates, unauthorized actions
- **Data Errors**: Invalid format, missing data

### **User Feedback**
- **Alert Dialogs**: For errors and confirmations
- **Loading States**: Visual feedback during operations
- **Success Messages**: Confirmation of successful actions
- **Specific Error Messages**: Clear, actionable error descriptions

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/Viateur-akimana/Personal-finance-tracker-RN-NE
cd Personal-finance-tracker-RN-NE

# Install dependencies
npm install

# Start the development server
npx expo start
```

### **Running the App**
```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🧪 Testing

### **API Testing**
```bash
# Run API tests
node tests/api-test.js
```

### **Demo Credentials**
Use any username from the API with matching password. The app will fetch users from MockAPI for authentication.

## 📱 Usage Flow

### **First Time Users**
1. Launch app → Login screen appears
2. Enter valid credentials → Main app loads
3. View expenses list → See existing expenses
4. Tap "+" button → Add new expense
5. Fill form → Submit → Duplicate check → Create expense

### **Returning Users**
1. Launch app → Auto-login if credentials stored
2. Navigate between tabs
3. Manage expenses (view, add, delete)
4. Real-time synchronization with backend

## ⚠️ Known Limitations

1. **Authentication**: Simple password matching (no encryption)
2. **Offline Mode**: Limited offline capabilities
3. **Image Upload**: Not implemented
4. **Expense Categories**: Fixed list (no custom categories)
5. **User Management**: No user registration or profile editing
6. **Data Export**: No export functionality

## 🔮 Future Enhancements

1. **Enhanced Security**: JWT tokens, encrypted passwords
2. **Advanced Filtering**: Date ranges, category filters, search
3. **Data Visualization**: Charts, spending trends, budgets
4. **Notifications**: Expense reminders, budget alerts
5. **Multi-currency Support**: Currency conversion
6. **Receipt Scanning**: Image-to-expense conversion
7. **Cloud Sync**: Real-time synchronization across devices
8. **Expense Sharing**: Family/team expense sharing

## 🐛 Troubleshooting

### **Common Issues**

#### **Navigation Not Working**
- Check route guards in `_layout.tsx`
- Verify authentication state
- Review console logs for navigation errors

#### **API Errors**
- Verify internet connection
- Check MockAPI service status
- Review API error logs in console

#### **Duplicate Detection Issues**
- Check expense data format
- Verify date format consistency
- Review duplicate detection logic

#### **Total Showing NaN**
- Check expense amount data types
- Verify API response format
- Review amount parsing logic

## 📞 Support

For issues and questions:
1. Check console logs for error details
2. Review API response format
3. Verify network connectivity
4. Check authentication state

## 📄 License

This project is for educational purposes. All rights reserved.

---

**Version**: 1.0.0
**Last Updated**: May 27, 2025
**Platform**: React Native with Expo
**API**: MockAPI.io
