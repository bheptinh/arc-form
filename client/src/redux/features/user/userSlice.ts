import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { user } from '../../../initR2D';

export const userLogout = createAsyncThunk('user/logout', async (data, thunkAPI) => {
  return await user.logout();
});

const userSlice = createSlice({
  name: 'user',
  initialState: { logged: false, profile: {}, projectActive: { name: null, plan: 'free' } },
  reducers: {
    saveLoggedStatus: (state, action) => {
      state.logged = action.payload.logged;
    },
    setActiveProjectName: (state, action) => {
      state.projectActive.name = action.payload;
    },
    setProfileData: (state, action) => {
      state.profile = action.payload;
    },
    setProjectPlan: (state, action) => {
      state.projectActive.plan = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(userLogout.fulfilled, (state, action) => {
      return { ...state, logged: action.payload.logged, profile: {} };
    });
  },
});

export const selectIsLogged = (state) => state.user.logged;
export const selectUserProfileData = (state) => state.user.profile;
export const selectUserProjectActive = (state) => state.user.projectActive;

export const { setActiveProjectName, saveLoggedStatus, setProfileData, setProjectPlan } =
  userSlice.actions;

export default userSlice.reducer;
