import React from 'react';

import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';
import ChartReport from '../pages/report/chart/ChartReport';
import CreateReport from '../pages/report/create/CreateReport';

import Report from '../pages/report/Report';
import TableReport from '../pages/report/table/TableReport';
import Dashboard from '../pages/dashboard/Dashboard';
import CreateReport2 from '../pages/report/create/CreateReport2';

const Router = () => {

  return (
    <Routes>
      <Route path='report' element={<Report/>}>
        <Route path='' element={<CreateReport2/>}/>
        <Route path='result' element={<TableReport/>}/>
        <Route path='chart' element={<ChartReport/>}/>
      </Route>
      <Route path='dashboard' element={<Dashboard/>}/>
      
      <Route path='*' element={<Navigate to='dashboard'/>}/>
    </Routes>
  );
  
}

export default Router;