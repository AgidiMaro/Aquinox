import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuditReport, Domain } from "../models/AuditReport";


interface ReportState {
  auditReport: AuditReport;
}

const initialState: ReportState = {
  auditReport: {} as AuditReport,
};


const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    updateAuditReport: (state, action: PayloadAction<AuditReport>) => {
      
      state.auditReport = action.payload;
      //console.log(state.auditReport);
    },
    expandSection: (state, action: PayloadAction<Domain | undefined>) => {
      
      const curDomain = action.payload;
      
      console.log(state.auditReport.domains);

      if (!curDomain) {
        state.auditReport.showOverview = !state.auditReport.showOverview;
      } else {
        state.auditReport.domains.forEach(domain => {
          if (domain.name === curDomain.name) {
            domain.isExpanded = !domain.isExpanded;
          }
        });
      }
      //console.log(state.auditReport);
    },
  },
});

// const deployedDomain = 'https://avid-audit-deploy-d9c98622bb55.herokuapp.com/';
const deployedDomain = 'http://localhost:8000/';

export const getReportAsync = createAsyncThunk(
  "getReportAsync",
  async (formData: FormData): Promise<any> => {
    const result = await new Promise((resolve, reject) => {
      fetch(`${deployedDomain}upload`, {
          method: 'post',
          body: formData
      })
      .then(response => {
          if (response.ok) {
              response.json()
              .then(res => {
                  console.log(res);
                  resolve(res)
              })
              .catch(err => {
                  reject(err);
              })
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



export const { updateAuditReport, expandSection } = reportSlice.actions;
export default reportSlice.reducer;
