# Personal Finance Tracker - Architecture & Data Flow

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PERSONAL FINANCE TRACKER                           │
│                                Mobile Application                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │Login Screen │  │Expenses List│  │Add Expense  │  │   Expense Details       │  │
│  │             │  │             │  │    Form     │  │                         │  │
│  │• Validation │  │• Real-time  │  │• Validation │  │• View Details          │  │
│  │• Error      │  │• Pull Refresh│  │• Duplicate  │  │• Delete Confirmation   │  │
│  │  Handling   │  │• Delete     │  │  Detection  │  │• Error Handling        │  │
│  │• Auto Login │  │• Navigation │  │• Categories │  │• Navigation            │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               NAVIGATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   Root Layout   │    │   Tab Layout    │    │     Route Guards            │  │
│  │                 │    │                 │    │                             │  │
│  │• Auth Guards    │    │• Header with    │    │• Authentication Check      │  │
│  │• Route Protection│   │  Add Button     │    │• Navigation Permissions     │  │
│  │• Context Setup  │    │• Tab Navigation │    │• Redirect Logic             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                BUSINESS LOGIC LAYER                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐         ┌─────────────────────────────────────────┐ │
│  │    Auth Context         │         │        API Service Layer               │ │
│  │                         │         │                                         │ │
│  │• User State Management  │◀────────▶│ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │• Login/Logout Logic     │         │ │ Auth API    │ │   Expenses API      │ │ │
│  │• Session Persistence    │         │ │             │ │                     │ │ │
│  │• Authentication Status  │         │ │• Login      │ │• getAllExpenses     │ │ │
│  └─────────────────────────┘         │ │• Validation │ │• getExpenseById     │ │ │
│                                      │ └─────────────┘ │• createExpense      │ │ │
│                                      │                 │• forceCreateExpense │ │ │
│                                      │                 │• deleteExpense      │ │ │
│                                      │                 └─────────────────────┘ │ │
│                                      └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HTTP CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Axios HTTP Client                                 │ │
│  │                                                                             │ │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │ │
│  │ │Request Config   │  │Response Inter.  │  │    Error Handling           │  │ │
│  │ │                 │  │                 │  │                             │  │ │
│  │ │• Base URL       │  │• Success Handle │  │• Network Errors             │  │ │
│  │ │• Headers        │  │• Data Transform │  │• HTTP Status Codes          │  │ │
│  │ │• Timeout (10s)  │  │• Response Format│  │• Timeout Handling           │  │ │
│  │ │• Content-Type   │  │• Logging        │  │• User-Friendly Messages     │  │ │
│  │ └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 EXTERNAL API                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                MockAPI.io Backend Service                                   │ │
│  │             https://67ac71475853dfff53dab929.mockapi.io/api/v1              │ │
│  │                                                                             │ │
│  │ ┌─────────────────────────┐    ┌─────────────────────────────────────────┐  │ │
│  │ │      Users Endpoint     │    │         Expenses Endpoint               │  │ │
│  │ │                         │    │                                         │  │ │
│  │ │GET /users?username={}   │    │GET /expenses                            │  │ │
│  │ │                         │    │GET /expenses/{id}                       │  │ │
│  │ │Returns: User[]          │    │POST /expenses                           │  │ │
│  │ │                         │    │DELETE /expenses/{id}                    │  │ │
│  │ │Data: id, username,      │    │                                         │  │ │
│  │ │      password, name,    │    │Data: id, title, amount, category,      │  │ │
│  │ │      email              │    │      date, description, userId          │  │ │
│  │ └─────────────────────────┘    └─────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Detailed Data Flow Diagrams

### 1. Authentication Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│Login Screen │────▶│Validation   │────▶│Auth Context │
│Input Creds  │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                    │                    │
                           ▼                    ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │Form Submit  │────▶│API Service  │────▶│MockAPI Call │
                    │             │     │             │     │GET /users   │
                    └─────────────┘     └─────────────┘     └─────────────┘
                                               │                    │
                                               ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Main App     │◀────│Auth Success │◀────│User Found   │◀────│Password     │
│Dashboard    │     │Navigation   │     │& Validated  │     │Match Check  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 2. Expense Creation Flow with Duplicate Detection
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│User Inputs  │────▶│Add Expense  │────▶│Form         │────▶│Client       │
│Expense Data │     │Form         │     │Validation   │     │Validation   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │                    │
                                               ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│API Service  │◀────│Form Submit  │◀────│Validation   │────▶│Date/Amount  │
│createExpense│     │             │     │Passed       │     │Validation   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
        │
        ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Get All      │────▶│Duplicate    │────▶│Comparison   │
│Expenses     │     │Detection    │     │Logic        │
└─────────────┘     └─────────────┘     └─────────────┘
        │                                      │
        ▼                                      ▼
┌─────────────┐                     ┌─────────────────────┐
│No Duplicates│                     │   Duplicate Found   │
│Found        │                     │                     │
└─────────────┘                     └─────────────────────┘
        │                                      │
        ▼                                      ▼
┌─────────────┐                     ┌─────────────────────┐
│Create       │                     │  User Choice Alert  │
│Expense      │                     │                     │
│POST /expense│                     │┌─────┐ ┌─────┐ ┌───┐│
└─────────────┘                     ││Cancel│ │View │ │OK ││
        │                           │└─────┘ └─────┘ └───┘│
        ▼                           └─────────────────────┘
┌─────────────┐                              │       │
│Success      │                              ▼       ▼
│Response     │◀─────────────────────────────┘   ┌─────────────┐
└─────────────┘                                  │Force Create │
        │                                        │forceCreate  │
        ▼                                        │Expense()    │
┌─────────────┐                                  └─────────────┘
│Update UI    │◀─────────────────────────────────────────┘
│Refresh List │
└─────────────┘
```

### 3. Expense Management Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│App Launch   │────▶│Auth Check   │────▶│Load         │────▶│API Call     │
│             │     │             │     │Expenses     │     │GET /expenses│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │                    │
                                               ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Display      │◀────│Update State │◀────│Process      │◀────│Response     │
│Expenses List│     │             │     │Response     │     │Data         │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
        │
        ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│User Actions │────▶│   Delete    │────▶│Confirmation │
│             │     │   Expense   │     │   Dialog    │
└─────────────┘     └─────────────┘     └─────────────┘
        │                                      │
        ▼                                      ▼
┌─────────────┐                     ┌─────────────────────┐
│View Details │                     │  DELETE /expenses   │
│Navigation   │                     │        /{id}        │
└─────────────┘                     └─────────────────────┘
        │                                      │
        ▼                                      ▼
┌─────────────┐                     ┌─────────────────────┐
│Expense      │                     │Update Local State   │
│Details Page │                     │Remove from List     │
└─────────────┘                     └─────────────────────┘
```

## 🔧 Component Interaction Architecture

### State Management Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                            STATE MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐           ┌─────────────────────────────────────┐   │
│  │  Auth Context   │           │          Local Component State      │   │
│  │                 │           │                                     │   │
│  │• User Info      │           │ ┌─────────────┐ ┌─────────────────┐ │   │
│  │• Login State    │◀──────────▶│ │Expense List │ │  Form Data      │ │   │
│  │• Session Data   │           │ │• expenses[] │ │• title, amount  │ │   │
│  │• Auth Methods   │           │ │• loading    │ │• category, date │ │   │
│  └─────────────────┘           │ │• refreshing │ │• description    │ │   │
│                                │ └─────────────┘ └─────────────────┘ │   │
│                                └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API SYNCHRONIZATION                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Local State ◀────▶ API Calls ◀────▶ MockAPI ◀────▶ Real-time Updates  │
│                                                                         │
│  • Optimistic UI Updates              • Error Rollback                 │
│  • Loading States                     • Success Confirmation           │
│  • Error Handling                     • State Synchronization          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📊 Error Handling Architecture

### Error Flow Diagram
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│User Action  │────▶│Validation   │────▶│API Call     │────▶│Error        │
│             │     │Layer        │     │             │     │Detection    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Form Errors  │     │Field        │     │Network      │     │HTTP Status  │
│             │     │Validation   │     │Errors       │     │Errors       │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
        │                    │                    │                    │
        └────────────────────┼────────────────────┼────────────────────┘
                             ▼                    ▼
                    ┌─────────────────────────────────────┐
                    │         Error Handler               │
                    │                                     │
                    │• Categorize Error Type              │
                    │• Generate User-Friendly Message     │
                    │• Determine Recovery Action          │
                    │• Log for Debugging                  │
                    └─────────────────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────┐
                    │         User Notification           │
                    │                                     │
                    │• Alert Dialog                       │
                    │• Specific Error Message             │
                    │• Recovery Options                   │
                    │• Loading State Reset                │
                    └─────────────────────────────────────┘
```

## 🏗️ Technical Architecture Layers

### 1. **Presentation Layer**
- **React Native Components**: UI rendering and user interaction
- **Expo Router**: File-based navigation system
- **Custom Styling**: StyleSheet-based responsive design
- **FontAwesome Icons**: Consistent iconography

### 2. **Business Logic Layer**
- **React Context**: Global state management
- **Custom Hooks**: Reusable logic components
- **Validation Logic**: Form and data validation
- **Business Rules**: Duplicate detection, permissions

### 3. **Service Layer**
- **API Services**: HTTP communication layer
- **Authentication Service**: Login/logout logic
- **Expense Service**: CRUD operations
- **Error Handling**: Centralized error management

### 4. **Data Layer**
- **HTTP Client (Axios)**: Network communication
- **Request/Response Interceptors**: Automatic error handling
- **Data Transformation**: API response normalization
- **Caching Strategy**: Local state caching

### 5. **External Services**
- **MockAPI.io**: Backend-as-a-Service
- **RESTful Endpoints**: Standard HTTP operations
- **JSON Data Format**: Structured data exchange

## 🔐 Security Architecture

### Authentication Flow
```
Client ──▶ Username/Password ──▶ API Service ──▶ MockAPI
   ▲                                               │
   │                                               ▼
Auth Context ◀── User Object ◀── Password Check ◀──┘
   │
   ▼
Protected Routes ──▶ Main Application
```

### Data Security Measures
1. **Input Validation**: Client and server-side validation
2. **Error Sanitization**: No sensitive data in error messages
3. **Session Management**: Context-based user state
4. **Route Protection**: Authentication guards

---

This architecture supports a scalable, maintainable Personal Finance Tracker with comprehensive error handling, duplicate detection, and user-friendly interfaces.
