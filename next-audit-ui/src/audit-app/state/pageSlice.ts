
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PageState {
  showSpinner: boolean;
}

const initialState: PageState = {
  showSpinner: false
};


const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    updateShowSpinner: (state, action: PayloadAction<boolean>) => {
      state.showSpinner = action.payload;
    }
  },
});


export const { updateShowSpinner } = pageSlice.actions;
export default pageSlice.reducer;