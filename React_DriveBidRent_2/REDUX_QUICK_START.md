# Redux Authentication - Quick Start Guide

## 🚀 Getting Started

### Step 1: Start the Development Server
```bash
cd React_DriveBidRent_2/client
npm run dev
```

### Step 2: Navigate to Login
Open your browser to `http://localhost:5173/login`

## 🧪 Testing the Redux Authentication

### Test Case 1: Buyer Login
1. Go to `/login`
2. Enter test buyer credentials (check with your backend)
3. Click "Login"
4. Expected: Redirects to `/buyer` dashboard
5. Verify Redux state in DevTools:
   - `auth.isAuthenticated: true`
   - `auth.user.userType: "buyer"`
   - `auth.redirect: "/buyer"`

### Test Case 2: Mechanic Login (Unapproved)
1. Go to `/login`
2. Enter unapproved mechanic credentials
3. Click "Login"
4. Expected: Shows approval modal with message "Please wait for admin approval"
5. Redux state shows:
   - `auth.approved_status: "No"`
   - Modal prevents navigation

### Test Case 3: Mechanic Login (Approved)
1. Go to `/login`
2. Enter approved mechanic credentials
3. Click "Login"
4. Expected: Redirects to `/mechanic/dashboard`
5. Redux state shows:
   - `auth.approved_status: "Yes"`
   - `auth.redirect: "/mechanic/dashboard"`

### Test Case 4: Logout
1. After logging in, click "Logout" button in navbar
2. Expected: 
   - Redux state clears (user, isAuthenticated become null/false)
   - Redirects to home page `/`
3. Try accessing `/buyer` → should redirect to `/login`

### Test Case 5: Signup
1. Go to `/signup`
2. Fill all form fields
3. Click "Sign Up"
4. Expected:
   - "Account created!" alert appears
   - Redirects to `/login`
   - Redux success state becomes true

### Test Case 6: Protected Routes
1. Without logging in, try to access `/buyer/dashboard`
2. Expected: Redirects to `/login`
3. After login, you should be able to access it

## 🔍 Redux DevTools Inspection

### Install Redux DevTools Extension
- Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmjabglehjbabhhpadbabjnacffgiapk)
- Firefox: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### Watch Redux Actions
1. Open DevTools (F12)
2. Go to Redux tab
3. Perform login:
   - Watch `loginUser/pending` action
   - Watch `loginUser/fulfilled` action
   - View full auth state in right panel

### State Timeline
- **loginUser/pending**: `loading: true`
- **loginUser/fulfilled**: 
  - `loading: false`
  - `user: {...}`
  - `isAuthenticated: true`
  - `redirect: "/buyer"`

## 📁 File Structure

```
src/
├── redux/
│   ├── slices/
│   │   └── authSlice.js          # All auth logic
│   └── store.js                  # Redux store config
├── hooks/
│   └── useAuth.js                # Custom auth hook
├── components/
│   └── ProtectedRoute.jsx        # Route protection
├── pages/auth/
│   ├── Login.jsx                 # Redux-based login
│   └── Signup.jsx                # Redux-based signup
├── pages/buyer/components/
│   └── Navbar.jsx                # Updated with Redux
├── pages/seller/components/
│   └── Navbar.jsx                # Updated with Redux
├── pages/auctionManager/components/
│   └── Navbar.jsx                # Updated with Redux
├── pages/admin/components/
│   └── Navbar.jsx                # Updated with Redux
└── main.jsx                      # Redux Provider wrapper
```

## 🔐 How It Works

### Initialization (`main.jsx`)
```javascript
<Provider store={store}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Provider>
```

### Login Flow
```javascript
// User clicks login
dispatch(loginUser({ email, password }))
  ↓
// authSlice thunk makes API call
POST /auth/login
  ↓
// Response updates Redux state
auth.user = {...}
auth.isAuthenticated = true
auth.redirect = "/buyer"
  ↓
// useEffect watches redirect state
// Navigates to appropriate dashboard
```

### State Access Pattern
```javascript
// Component accesses auth state
const { loading, error, user } = useSelector(state => state.auth);

// Component dispatches auth actions
dispatch(loginUser(data))
dispatch(logoutUser())
```

## 🛠️ Common Tasks

### Access User Data in Component
```javascript
import { useSelector } from 'react-redux';

function MyComponent() {
  const user = useSelector(state => state.auth.user);
  return <div>Welcome, {user?.firstName}</div>;
}
```

### Check if User is Authenticated
```javascript
const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

if (isAuthenticated) {
  // Show user dashboard
} else {
  // Show login page
}
```

### Dispatch Logout
```javascript
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

function LogoutButton() {
  const dispatch = useDispatch();
  
  return (
    <button onClick={() => dispatch(logoutUser())}>
      Logout
    </button>
  );
}
```

### Use Custom Hook
```javascript
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <>
      <h1>Welcome, {user?.firstName}</h1>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

## 🐛 Debugging Tips

### View Redux State
```javascript
// In browser console
// Assuming Redux DevTools is installed
store.getState().auth

// Output:
// {
//   user: {...},
//   isAuthenticated: true,
//   loading: false,
//   error: null,
//   ...
// }
```

### Check API Call
1. Open DevTools Network tab
2. Perform login
3. Look for `/auth/login` request
4. Check Response tab for user data

### Common Issues

**Issue**: User not appearing after login
- Check Redux DevTools - verify `loginUser/fulfilled` action occurred
- Check Network tab - verify API returned user data
- Reload page to see if localStorage has token

**Issue**: Logout not clearing state
- Check Redux DevTools - verify `logoutUser` action fired
- Verify no errors in console
- Check cookies are cleared (DevTools → Application → Cookies)

**Issue**: Approval modal not showing for mechanic
- Check user.approved_status in Redux state
- Verify backend sends approved_status in login response
- Check mechanic-specific condition in Login.jsx

## 📋 Redux Thunks Reference

### loginUser
```javascript
dispatch(loginUser({ email, password }))
// Calls: POST /auth/login
// Sets: user, isAuthenticated, redirect
// On Error: Sets error message
```

### signupUser
```javascript
dispatch(signupUser(formData))
// Calls: POST /auth/signup
// Sets: success = true
// Triggers: Redirect to /login
```

### logoutUser
```javascript
dispatch(logoutUser())
// Clears: user, isAuthenticated
// Clears: localStorage tokens
// No API call needed
```

## 🎯 Next Steps

1. ✅ **Done**: Redux setup complete
2. ✅ **Done**: Components updated with Redux
3. **Next**: Test full flow with backend
4. **Next**: Add localStorage persistence
5. **Next**: Create auth selectors for performance
6. **Next**: Add role-based route protection

## 📚 Learn More

- **Redux Toolkit**: https://redux-toolkit.js.org
- **React-Redux Hooks**: https://react-redux.js.org/api/hooks
- **Full Guide**: See `REDUX_AUTHENTICATION_GUIDE.md`
- **Detailed Report**: See `REDUX_IMPLEMENTATION_REPORT.md`

## 💡 Pro Tips

1. **Use Redux DevTools** - Invaluable for debugging state changes
2. **Dispatch clearError()** - Clear errors before new submissions
3. **Watch useEffect** - State changes trigger redirects
4. **Check Network** - Verify API responses format

## ✨ You're Ready!

Everything is set up and ready to test. Start the server and begin testing the authentication flow!

```bash
npm run dev
```

Then navigate to http://localhost:5173/login 🚀

---

**Last Updated**: $(date)
**Status**: ✅ Ready for Testing
