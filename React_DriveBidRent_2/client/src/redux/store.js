import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    wishlist: wishlistReducer,
  }
});

export default store;
