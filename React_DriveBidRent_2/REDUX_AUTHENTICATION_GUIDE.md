# Redux Toolkit Authentication Implementation Guide

## Overview
This document outlines the complete Redux Toolkit authentication system implementation for DriveBidRent.

## Architecture

### Redux Store Structure
```
store/
├── slices/
│   └── authSlice.js          # Auth state management with async thunks
└── store.js                  # Redux store configuration
```

### State Shape
```javascript
auth: {
  user: {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    userType: 'buyer' | 'seller' | 'mechanic' | 'admin',
    approved_status: boolean (for mechanics)
  },
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  success: boolean,
  message: string,
  redirect: string | null,
  userType: string
}
```

## Components Updated for Redux

### 1. Authentication Pages

#### Login.jsx
- **Before**: Used `useState` + `authServices.login()`
- **After**: Uses `useDispatch()` + Redux `loginUser` thunk
- **Key Changes**:
  - Import `useDispatch`, `useSelector` from react-redux
  - Import `loginUser` thunk from authSlice
  - Dispatch `loginUser(formData)` instead of calling service directly
  - Listen to Redux state for loading/error/success
  - Auto-redirect on successful login via useEffect

#### Signup.jsx
- **Before**: Used `useState` + `authServices.signup()`
- **After**: Uses `useDispatch()` + Redux `signupUser` thunk
- **Key Changes**:
  - Import `useDispatch`, `useSelector` from react-redux
  - Import `signupUser` thunk from authSlice
  - Dispatch `signupUser(signupData)` instead of calling service
  - Auto-redirect to login on successful signup

### 2. Navigation Components

#### Buyer Navbar (`pages/buyer/components/Navbar.jsx`)
- **Before**: Used `useLogout()` custom hook from auth.services
- **After**: Dispatches Redux `logoutUser` action
- **Key Change**: `dispatch(logoutUser())` replaces `await logout()`

#### Seller Navbar (`pages/seller/components/Navbar.jsx`)
- **Before**: Used `authServices.logout()` + manual localStorage cleanup
- **After**: Dispatches Redux `logoutUser` action
- **Key Change**: Redux handles all cleanup automatically

#### Auction Manager Navbar (`pages/auctionManager/components/Navbar.jsx`)
- **Before**: Used `authServices.logout()` + manual localStorage cleanup
- **After**: Dispatches Redux `logoutUser` action

#### Admin Navbar (`pages/admin/components/Navbar.jsx`)
- **Before**: Used `authServices.logout()` + manual localStorage cleanup
- **After**: Dispatches Redux `logoutUser` action

## Files Created

### 1. `src/redux/store.js`
```javascript
Configures Redux store with:
- configureStore() for store setup
- Auth reducer registered
- RTK Query support (if needed later)
```

### 2. `src/redux/slices/authSlice.js`
Contains three async thunks:
- **loginUser**: POST /auth/login → Sets auth state + user data
- **signupUser**: POST /auth/signup → Creates account, redirects to login
- **logoutUser**: Clears auth state + localStorage

Handles:
- Approval status for mechanics (approved_status)
- User type detection
- Redirect URLs
- Error messages

### 3. `src/hooks/useAuth.js`
Custom hook for easy auth access:
```javascript
const { 
  user, 
  isAuthenticated, 
  loading, 
  error,
  login,      // dispatch(loginUser(data))
  signup,     // dispatch(signupUser(data))
  logout      // dispatch(logoutUser())
} = useAuth();
```

### 4. `src/components/ProtectedRoute.jsx`
Route protection components:
- **ProtectedRoute**: Guards dashboard routes (requires authentication)
- **PublicRoute**: Guards auth pages (redirects if already logged in)

## Usage Examples

### Login Component
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';

function Login() {
  const dispatch = useDispatch();
  const { loading, error, redirect } = useSelector(state => state.auth);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };
  
  return (
    <>
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
    </>
  );
}
```

### Using Custom Hook
```javascript
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

### Protected Routes
```javascript
import ProtectedRoute, { PublicRoute } from '../components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes - redirects to dashboard if logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      
      {/* Protected routes - requires authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Route>
    </Routes>
  );
}
```

## API Integration

### Backend Endpoints
- `POST /auth/login` - Login user
- `POST /auth/signup` - Register new user
- `POST /auth/logout` - Logout (optional backend call)

### Response Format Expected
```javascript
// Login/Signup Success
{
  success: true,
  message: "Login successful",
  data: {
    user: {
      _id: "...",
      firstName: "...",
      lastName: "...",
      email: "...",
      userType: "buyer|seller|mechanic|admin",
      approved_status: true/false (for mechanics)
    },
    redirect: "/buyer/dashboard" or "/mechanic/pending",
    userType: "buyer"
  }
}

// Error
{
  success: false,
  message: "Invalid credentials"
}
```

## Key Features

### 1. Automatic Session Management
- Redux store persists auth state during session
- Can add localStorage middleware for persistence (optional)

### 2. Role-Based Redirects
- Mechanic users with `approved_status: false` → mechanic pending page
- Approved users → dashboard
- Auto-detects and routes based on userType

### 3. Centralized Auth State
- All auth logic in one place (authSlice.js)
- Easy to access from any component via selectors
- Consistent error handling

### 4. Loading States
- `loading` flag for disabled buttons during requests
- `error` for displaying error messages
- `success` for handling redirects

## Migration Checklist

- [x] Install Redux Toolkit and react-redux
- [x] Create Redux store structure
- [x] Implement authSlice with thunks
- [x] Update Login.jsx for Redux
- [x] Update Signup.jsx for Redux
- [x] Update all Navbar components
- [x] Create custom useAuth hook
- [x] Create ProtectedRoute component
- [ ] Add localStorage persistence (optional)
- [ ] Implement auth selectors (optional optimization)
- [ ] Add Redux DevTools integration (development)
- [ ] Test full authentication flow
- [ ] Deploy to production

## Testing

### Manual Testing Steps
1. Start the app: `npm run dev`
2. Navigate to /login
3. Enter credentials and verify Redux dispatch:
   - Open Redux DevTools extension
   - Watch `loginUser/pending` → `loginUser/fulfilled` actions
   - Verify auth state updates
4. Check redirect to appropriate dashboard
5. Click logout and verify state clears
6. Try accessing protected routes without login - should redirect

## Future Enhancements

1. **localStorage Persistence**
   - Redux persist middleware
   - Survives page refresh

2. **Refresh Token Handling**
   - Auto-refresh logic in interceptor
   - Update auth state on token refresh

3. **Auth Selectors**
   - Memoized selectors for performance
   - `selectIsAuthenticated`, `selectCurrentUser`, etc.

4. **Middleware**
   - Custom middleware for logging
   - Analytics tracking

## Troubleshooting

### Issue: User state not updating after login
**Solution**: Check that authSlice is properly registered in store.js

### Issue: Redirect not working
**Solution**: Ensure useEffect is watching the redirect state properly

### Issue: Logout doesn't clear user data
**Solution**: Verify logoutUser thunk clears user state in localStorage and Redux

## Dependencies
- `@reduxjs/toolkit`: ^1.9.0+
- `react-redux`: ^8.0.0+

## References
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [React-Redux Hooks Documentation](https://react-redux.js.org/api/hooks)
- [Async Thunks Guide](https://redux-toolkit.js.org/api/createAsyncThunk)
