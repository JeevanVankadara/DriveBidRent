# Redux Authentication Flow Diagrams

## 1. Application Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     React Application                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────┐                    │
│  │    Redux Provider (main.jsx)        │                    │
│  │                                     │                    │
│  │  ┌─────────────────────────────┐   │                    │
│  │  │   Redux Store               │   │                    │
│  │  │   ├── auth reducer          │   │                    │
│  │  │   │   ├── user state        │   │                    │
│  │  │   │   ├── loading state     │   │                    │
│  │  │   │   ├── error state       │   │                    │
│  │  │   │   └── redirect state    │   │                    │
│  │  │   └── middleware            │   │                    │
│  │  └─────────────────────────────┘   │                    │
│  │           ▲         ▼               │                    │
│  │           │         │               │                    │
│  │     ┌─────┴─────────┴─────┐        │                    │
│  │     │   BrowserRouter     │        │                    │
│  │     │   └── App.jsx       │        │                    │
│  │     │       ├── Login     │        │                    │
│  │     │       ├── Signup    │        │                    │
│  │     │       ├── Navbar    │        │                    │
│  │     │       └── Dashboard │        │                    │
│  │     └─────────────────────┘        │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 2. Login Flow (Detailed)

```
START: User enters credentials
  │
  ├─ email: user@example.com
  ├─ password: SecurePass123!
  │
  ▼
┌─────────────────────────┐
│   Click "Login" Button  │
└────────────┬────────────┘
             │
             ▼
    ┌──────────────────────────────────────────┐
    │  handleSubmit() function                  │
    │  - Validates input                       │
    │  - Clears previous errors                │
    └────────────┬─────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────────┐
    │  dispatch(loginUser({email, password}))  │
    │  Redux Action Dispatched                 │
    └────────────┬─────────────────────────────┘
                 │
                 ▼ Redux Async Thunk Starts
    ┌──────────────────────────────────────────┐
    │  loginUser/PENDING                       │
    │  - Set loading: true                     │
    │  - Set error: null                       │
    │  - Component shows "Logging in..."       │
    └────────────┬─────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────────┐
    │  API Call to /auth/login                 │
    │  POST with credentials                   │
    │  Network Request Sent                    │
    └────────────┬─────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼ SUCCESS         ▼ ERROR
    ┌──────────────┐  ┌─────────────────┐
    │ 200 OK       │  │ 401 Unauthorized│
    │ User data    │  │ Error message   │
    │ returned     │  │ returned        │
    └──────┬───────┘  └────────┬────────┘
           │                   │
           ▼                   ▼
    ┌────────────────────────────────────┐
    │ loginUser/FULFILLED              │ loginUser/REJECTED
    │ - Set loading: false             │ - Set loading: false
    │ - Set user: {...}               │ - Set error: message
    │ - Set isAuthenticated: true      │ - Set isAuthenticated: false
    │ - Set redirect: "/buyer"         │ - Component shows error
    │ - Set success: true              │ - Clear button disabled
    └────────┬───────────────────────────┘
             │
             ▼ Component watches redirect state
    ┌──────────────────────────────┐
    │ useEffect triggered           │
    │ Checks: isAuthenticated &&    │
    │         redirect              │
    │         approved_status       │
    └────────┬──────────────────────┘
             │
    ┌────────┴──────────────────┐
    │                           │
    ▼ (Approved)                ▼ (Unapproved Mechanic)
    │                           │
    │ navigate("/buyer")        │ setShowApprovalModal(true)
    │                           │
    ▼                           ▼
  DASHBOARD                 APPROVAL MODAL
  ┌─────────────────┐      ┌──────────────────────┐
  │ User Dashboard  │      │ "Waiting for Admin   │
  │ Fully Loaded    │      │  Approval"           │
  │ State Cleared   │      │ Users must wait      │
  └─────────────────┘      └──────────────────────┘
```

## 3. Signup Flow

```
START: User fills signup form
  │
  ├─ firstName: "John"
  ├─ email: "john@example.com"
  ├─ password: "SecurePass123!"
  ├─ userType: "buyer"
  └─ ...other fields...
  │
  ▼
┌────────────────────────────┐
│ Click "Sign Up" Button     │
└────────────┬───────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ Client-side Validation           │
│ - Check email format             │
│ - Check password strength        │
│ - Check age >= 18                │
│ - Verify passwords match         │
│ - Check terms accepted           │
└────────────┬─────────────────────┘
             │
        ┌────┴────┐
        │          │
   ✅ PASS   ❌ FAIL
        │          │
        ▼          ▼
   API Call    Show Errors
        │       (Inline)
        │          │
        ▼          └──► Wait for user
┌──────────────────────┐     to fix
│ dispatch(signupUser) │
│ (Async Thunk)        │
└────────────┬─────────┘
             │
             ▼
┌──────────────────────────────────┐
│ POST /auth/signup                │
│ Send: {firstName, email, ...}    │
└────────────┬─────────────────────┘
             │
        ┌────┴────────────┐
        │                 │
        ▼                 ▼
    SUCCESS           ERROR
    (201)         (409 conflict)
     │                  │
     ▼                  ▼
┌──────────┐      ┌──────────────┐
│ Account  │      │ Error shown  │
│ Created  │      │ "Email exists"│
└────┬─────┘      └──────────────┘
     │
     ▼
Redux Updates:
- success: true
- message: "Account created"
     │
     ▼
useEffect watches success
- Shows alert
- navigate("/login")
     │
     ▼
LOGIN PAGE
Ready for login
```

## 4. Logout Flow

```
START: User clicks "Logout"
  │
  ▼
┌────────────────────────────┐
│ handleLogout() function    │
│ in Navbar component        │
└────────────┬───────────────┘
             │
             ▼
┌──────────────────────────────┐
│ dispatch(logoutUser())       │
│ Redux Action                 │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Redux logoutUser Action (Sync)       │
│                                      │
│ State Changes:                       │
│ - user: null                         │
│ - isAuthenticated: false             │
│ - loading: false                     │
│ - error: null                        │
│ - success: false                     │
│ - redirect: null                     │
│                                      │
│ localStorage cleaned:                │
│ - Remove token                       │
│ - Remove userType                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌────────────────────────────┐
│ navigate("/", {replace})   │
│ Component navigates home   │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ Redux selectors updated    │
│ Components re-render       │
│ useSelector hooks trigger  │
└────────────┬───────────────┘
             │
             ▼
HOME PAGE
(User logged out)
All auth state cleared
```

## 5. Redux State Updates Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
├─────────────────────────────────────────────────────────────┤
│ user: null                                                  │
│ isAuthenticated: false                                      │
│ loading: false                                              │
│ error: null                                                 │
│ success: false                                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ dispatch(loginUser(...))
          ▼
┌─────────────────────────────────────────────────────────────┐
│ PENDING STATE (loginUser/pending)                           │
├─────────────────────────────────────────────────────────────┤
│ user: null                                                  │
│ isAuthenticated: false                                      │
│ loading: true  ← Changed                                    │
│ error: null                                                 │
│ success: false                                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ API Response Received
          ▼
┌─────────────────────────────────────────────────────────────┐
│ FULFILLED STATE (loginUser/fulfilled)                       │
├─────────────────────────────────────────────────────────────┤
│ user: {                          ← Changed                  │
│   _id: "123",                                               │
│   firstName: "John",                                        │
│   email: "john@example.com",                                │
│   userType: "buyer"                                         │
│ }                                                           │
│ isAuthenticated: true            ← Changed                  │
│ loading: false                   ← Changed                  │
│ error: null                                                 │
│ success: true                    ← Changed                  │
│ redirect: "/buyer"               ← Changed                  │
└─────────────────────────────────────────────────────────────┘
          │
          │ useEffect watches redirect
          │ Navigates to dashboard
          ▼
┌─────────────────────────────────────────────────────────────┐
│ AFTER NAVIGATION                                            │
├─────────────────────────────────────────────────────────────┤
│ Same state, but redirect cleared by clearRedirect()        │
│ User sees dashboard                                         │
│ Components re-render with new state                         │
└─────────────────────────────────────────────────────────────┘
```

## 6. Component Interaction Diagram

```
┌─────────────────────────────────────────────────────┐
│              Redux Store                            │
│              (Centralized State)                    │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌─────────────┐  ┌────────────┐  ┌──────────────┐
│  Login.jsx  │  │ Signup.jsx │  │ Navbar.jsx   │
├─────────────┤  ├────────────┤  ├──────────────┤
│             │  │            │  │              │
│ useDispatch │  │ useDispatch│  │ useDispatch  │
│ - dispatch  │  │ - dispatch │  │ - dispatch   │
│   loginUser │  │   signupUser │ logoutUser    │
│             │  │            │  │              │
│ useSelector │  │ useSelector│  │              │
│ - loading   │  │ - loading  │  │              │
│ - error     │  │ - error    │  │              │
│ - redirect  │  │ - success  │  │              │
└─────────────┘  └────────────┘  └──────────────┘
        │                              │
        └──────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  useAuth() Hook      │
        │  (Custom wrapper)    │
        │                      │
        │ Returns:             │
        │ - user               │
        │ - isAuthenticated    │
        │ - login()            │
        │ - logout()           │
        │ - signup()           │
        └──────────────────────┘
```

## 7. Thunk Execution Flow

```
dispatch(loginUser(credentials))
            │
            ▼
┌────────────────────────────────────┐
│ Thunk Middleware intercepts        │
│ (Built into Redux Toolkit)         │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ loginUser async function           │
│ (Extra argument: API client)       │
└────────────┬───────────────────────┘
             │
             ▼
  ┌──────────────────────┐
  │ dispatch PENDING     │
  │ loading: true        │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────────────────┐
  │ try {                            │
  │   const response =               │
  │   await fetch('/auth/login')     │
  │ }                                │
  └──────────┬───────────────────────┘
             │
        ┌────┴─────────┐
        │              │
   SUCCESS        FAILURE
        │              │
        ▼              ▼
  ┌──────────┐    ┌────────────┐
  │ Resolve  │    │ Reject     │
  │ with     │    │ with error │
  │ payload  │    │            │
  └────┬─────┘    └──────┬─────┘
       │                 │
       ▼                 ▼
  ┌──────────┐    ┌────────────┐
  │ Dispatch │    │ Dispatch   │
  │ FULFILLED│    │ REJECTED   │
  └────┬─────┘    └──────┬─────┘
       │                 │
       ▼                 ▼
  Update state     Update error
  with user        with message
```

## 8. Mechanic Approval Flow

```
Mechanic Login
     │
     ▼
POST /auth/login
     │
     ▼
Backend checks approved_status
     │
     ├─ "Yes" (Approved)
     │   │
     │   ▼
     │ Response includes:
     │ {approved_status: "Yes"}
     │   │
     │   ▼
     │ Redux state updates
     │   │
     │   ▼
     │ useEffect condition:
     │ if (approved_status === "Yes")
     │   │
     │   ▼
     │ navigate("/mechanic/dashboard")
     │
     │
     ├─ "No" (Unapproved)
     │   │
     │   ▼
     │ Response includes:
     │ {approved_status: "No"}
     │   │
     │   ▼
     │ Redux state updates
     │   │
     │   ▼
     │ useEffect condition:
     │ if (approved_status !== "Yes")
     │   │
     │   ▼
     │ setShowApprovalModal(true)
     │   │
     │   ▼
     │ Modal displayed to user
     │ "Please wait for admin approval"
     │   │
     │   ▼
     │ User must close modal
     │ Stays on login page
```

## 9. Protected Route Flow

```
User navigates to /buyer/dashboard
         │
         ▼
┌──────────────────────────────────┐
│ ProtectedRoute Component         │
│ <Route element={<ProtectedRoute>}│
│   <Route path="/buyer/dashboard" │
│ >                                │
└──────────────┬───────────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ Check: isAuthenticated  │
    │ via useSelector         │
    └───┬───────────────┬─────┘
        │               │
   YES  │               │  NO
        ▼               ▼
    ┌─────────┐   ┌──────────────┐
    │ Render  │   │ navigate to  │
    │ Content │   │ /login       │
    │         │   │ (replace)    │
    └─────────┘   └──────────────┘
        │               │
        ▼               ▼
    Dashboard      Login Page
    Displayed      Shown Instead
```

---

These diagrams illustrate the complete Redux authentication system for DriveBidRent.
