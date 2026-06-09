import { createSlice } from '@reduxjs/toolkit';

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState: { active: 'cm', dimensionsAll: ['cm', 'mm', 'm', 'ft'] },
  reducers: {
    changeMetricsActive: (state, action) => {
      state.active = action.payload;
    },
  },
});

export const selectMetrics = (state) => state.metrics;

export const { changeMetricsActive } = metricsSlice.actions;

export default metricsSlice.reducer;
