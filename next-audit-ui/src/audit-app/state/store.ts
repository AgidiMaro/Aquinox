import { configureStore } from "@reduxjs/toolkit";
import reportReducer from "./reportSlice";
import pageReducer from "./pageSlice";

export const store = configureStore({
  reducer: {
    report: reportReducer,
    page: pageReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;