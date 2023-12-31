import React, { Component } from 'react';

import { useNavigate } from "react-router-dom";

import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';
import { AuditReport, Domain, Query } from '../../models/AuditReport';

import CreateReport from '../pages/report/create/CreateReport';

import Report from '../pages/report/Report';
import Result, { ResultProps } from '../pages/report/Result';

const Router = () => {
  let resultsProps: ResultProps = {} as any;

  const navigate = useNavigate();
  

  const navigateToResult = (resMessage: any) => {

    let questions: Query [];
    let domains: Domain [] = [];
    let domain: Domain;

    for (const key of Object.keys(resMessage)) {
      questions = resMessage[key] as Query [];

      domain = {
        name: key,
        questions: questions
      }

      domains.push(domain);
    }

    let auditReport: AuditReport = {
      domains: domains
    }

    resultsProps = {
      report: auditReport,
      modeSwitch: () => {}
    }

    console.log(resultsProps);
    localStorage.setItem('report', JSON.stringify(resultsProps));
    //const navigate = useNavigate();
    navigate("/report/result");
  }

  resultsProps = JSON.parse(localStorage.getItem('report') as string);

  return (
    <Routes>
      <Route path='report' element={<Report/>}>
        <Route path='' element={<CreateReport navigateToResult={navigateToResult} />}/>
        <Route path='result' element={<Result {...resultsProps}/>}/>
      </Route>
      <Route path='*' element={<Navigate to='report'/>}/>
    </Routes>
  );
  
}

export default Router;