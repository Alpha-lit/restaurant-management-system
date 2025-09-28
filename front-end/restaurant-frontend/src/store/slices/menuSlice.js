import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
 
export const fetchMenu = createAsyncThunk(
  'menu/fetchMenu',
  async () => {
    const response = await api.get('menu/dishes/');
    return response.data;
  }
);

const initialState = {
  dishes: [],
  status: 'idle',
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dishes = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default menuSlice.reducer;