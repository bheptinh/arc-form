
import { createSlice } from '@reduxjs/toolkit'

export const constructorSlice = createSlice({
  name: 'constr',
  initialState: { wallsHeight: 0, minWallsHeight: 0, maxWallsHeight: 400, imagePlanUploadedType: null },
  reducers: {
    changeWallsHeight: (state, action) => {
      state.wallsHeight = action.payload;
    },
    changeImagePlanUploadType: (state, action) => {
      state.imagePlanUploadedType = action.payload;
    }
  },
})

export const selectWallsHeight = state => state.constr.wallsHeight;
export const selectMinWallsHeight = state => state.constr.minWallsHeight;
export const selectMaxWallsHeight = state => state.constr.maxWallsHeight;
export const selectImagePlanUploadedType = state => state.constr.imagePlanUploadedType;

export const { changeWallsHeight, changeImagePlanUploadType } = constructorSlice.actions; 

export default constructorSlice.reducer;