import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

// Shape: { data: {auctions: [], rentals: []}, loading: boolean, error: string|null, addingAuctionIds: string[], addingRentalIds: string[], removingAuctionIds: string[], removingRentalIds: string[] }
const initialState = {
  data: { auctions: [], rentals: [] },
  loading: false,
  error: null,
  addingAuctionIds: [],
  addingRentalIds: [],
  removingAuctionIds: [],
  removingRentalIds: [],
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWishlist();
      if (!response?.success) {
        return rejectWithValue(response?.message || 'Failed to fetch wishlist');
      }
      return response?.data || { auctions: [], rentals: [] };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch wishlist');
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async ({ id, type }, { rejectWithValue }) => {  // type: 'auction' or 'rental'
    try {
      await addToWishlist(id, type);
      return { id, type };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add to wishlist');
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async ({ id, type }, { rejectWithValue }) => {  // type: 'auction' or 'rental'
    try {
      await removeFromWishlist(id, type);
      return { id, type };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.data = { auctions: [], rentals: [] };
      state.loading = false;
      state.error = null;
      state.addingAuctionIds = [];
      state.addingRentalIds = [];
      state.removingAuctionIds = [];
      state.removingRentalIds = [];
    },
    setWishlist: (state, action) => {
      state.data = action.payload || { auctions: [], rentals: [] };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || { auctions: [], rentals: [] };
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wishlist';
      })
      .addCase(addWishlistItem.pending, (state, action) => {
        const { id, type } = action.meta.arg;
        if (type === 'auction' && !state.addingAuctionIds.includes(id)) {
          state.addingAuctionIds.push(id);
        } else if (type === 'rental' && !state.addingRentalIds.includes(id)) {
          state.addingRentalIds.push(id);
        }
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        const { id, type } = action.payload;
        const providedItem = action.meta?.arg?.item;  // Optional: pass item for optimistic add
        const targetArray = type === 'auction' ? 'auctions' : 'rentals';
        const exists = state.data[targetArray].find((item) => item._id === id);
        if (!exists && providedItem) {
          state.data[targetArray].push(providedItem);
        }
        if (type === 'auction') {
          state.addingAuctionIds = state.addingAuctionIds.filter((itemId) => itemId !== id);
        } else {
          state.addingRentalIds = state.addingRentalIds.filter((itemId) => itemId !== id);
        }
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        const { id, type } = action.meta.arg;
        state.error = action.payload || 'Failed to add to wishlist';
        if (type === 'auction') {
          state.addingAuctionIds = state.addingAuctionIds.filter((itemId) => itemId !== id);
        } else {
          state.addingRentalIds = state.addingRentalIds.filter((itemId) => itemId !== id);
        }
      })
      .addCase(removeWishlistItem.pending, (state, action) => {
        const { id, type } = action.meta.arg;
        if (type === 'auction' && !state.removingAuctionIds.includes(id)) {
          state.removingAuctionIds.push(id);
        } else if (type === 'rental' && !state.removingRentalIds.includes(id)) {
          state.removingRentalIds.push(id);
        }
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        const { id, type } = action.payload;
        const targetArray = type === 'auction' ? 'auctions' : 'rentals';
        state.data[targetArray] = state.data[targetArray].filter((item) => item._id !== id);
        if (type === 'auction') {
          state.removingAuctionIds = state.removingAuctionIds.filter((itemId) => itemId !== id);
        } else {
          state.removingRentalIds = state.removingRentalIds.filter((itemId) => itemId !== id);
        }
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        const { id, type } = action.meta.arg;
        state.error = action.payload || 'Failed to remove from wishlist';
        if (type === 'auction') {
          state.removingAuctionIds = state.removingAuctionIds.filter((itemId) => itemId !== id);
        } else {
          state.removingRentalIds = state.removingRentalIds.filter((itemId) => itemId !== id);
        }
      });
  },
});

export const { clearWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;