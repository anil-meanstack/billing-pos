import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuApi } from './menuApi';

export const fetchMenuData = createAsyncThunk(
  'menu/fetchMenuData',
  async (_, { rejectWithValue }) => {
    try {
      return await menuApi.fetchMenuData();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    categories: [{ id: 'all', name: 'All Items', slug: 'all' }],
    selectedCategory: 'all',
    searchTerm: '',
    filters: {
      foodTypes: [],
      sortBy: "",
    },
    loading: false,
    error: null,
    restaurant_name: 'Restaurant Name',
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFoodType: (state, action) => {
  state.filters.foodTypes = action.payload; // ✅ full array replace
},

    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    resetMenuState: (state) => {
      state.restaurant_name = 'Restaurant Name';

    },
    setRestaurantName: (state, action) => {
      state.restaurant_name = action.payload.restaurant_name;

    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuData.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.restaurant_name = action.payload.restaurant_name

        state.categories = [
          { id: 'all', name: 'All Items', slug: 'all' },
          ...action.payload.categories,
        ];

        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMenuData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedCategory, setSearchTerm,setFoodType,   
  setSortBy, clearError, setRestaurantName } = menuSlice.actions;
export default menuSlice.reducer;