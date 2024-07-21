import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuditReport, Domain } from "../models/AuditReport";
import { User } from "../models/User";

interface UserState {
  user: User;
}

const initialState: UserState = {
  user: {} as User,
};


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
  },
});


const deployedDomain = 'http://localhost:8080/';

export const signInAsync = createAsyncThunk(
  "signInAsync",
  async (formData: User): Promise<any> => {
    const result = await new Promise((resolve, reject) => {
      console.log(formData);

      fetch(`${deployedDomain}user/signin`, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      })
      .then(response => {
          if (response.ok) {
            resolve(response);
          }else {
            reject(response);
          }
      })
      .catch(err => {
        reject(err);
      })
    });

    return result;
  }
);

export default userSlice.reducer;
