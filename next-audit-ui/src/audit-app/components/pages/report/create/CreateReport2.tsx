
import React from "react";
import { getReportAsync, updateAuditReport } from "../../../../state/reportSlice";
import { Form } from "react-final-form";
import { AppDispatch } from "../../../../state/store";
import { useDispatch } from "react-redux";
import SubHeader from "../../../common/subheader/SubHeader";
import { Link } from "../../../../models/Links";
import FileSection from "../../../common/filesection/FileSection";
import { useNavigate } from "react-router-dom";
import { AuditReport, Domain, Query } from "../../../../models/AuditReport";
import title_icon from '../table/TitleIcon.svg'

const CreateReport2 = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const onSubmit = () => {
    
    const form: any = document.getElementById("audit-form");
    const formData = new FormData(form);

    // dispatch(getReportAsync(formData))
    dispatch(getReportAsync(formData))
    .unwrap()
    .then(message => navigateToResult(message))
  };

  const navigateToResult = (res: any) => {

    let questions: Query [];
    let domains: Domain [] = [];
    let domain: Domain;

    const resMessage = res.message;
    const findings = res.findings;

    let yesFraction = 0;
    let noFraction = 0;
    let unknownFraction = 0;

    for (const key of Object.keys(resMessage)) {
      questions = resMessage[key] as Query [];

      // TO DO - Map to accurate and not random values
      const length = questions.length;
      let yes = 0;
      let no = 0;
      let maybe = 0;

      for (const question of questions) {
        if (question.answer == 'Pass'){
          ++yes;
        }
        else if (question.answer == 'Fail') {
          ++no;
        } else {
          ++maybe;
        }
      }

      yesFraction += yes / questions.length;
      noFraction += no / questions.length;
      unknownFraction += maybe / questions.length;

      domain = {
        name: key,
        questions: questions,
        yesCount: yes,
        noCount: no,
        unknown: maybe
      }
      domains.push(domain);
    } 

    yesFraction *= 100;
    yesFraction /= domains.length;

    noFraction *= 100;
    noFraction /= domains.length;

    unknownFraction *= 100;
    unknownFraction /= domains.length;

    let auditReport: AuditReport = {
      domains: domains,
      overview: findings.overview,
      summary: findings.summary,
      yesFrac: yesFraction,
      noFrac: noFraction,
      unknownFrac: unknownFraction
    }

    localStorage.setItem('report', JSON.stringify(auditReport));
    dispatch(updateAuditReport(auditReport));
    navigate("/report/result");
  }
  

  const headerButtons: Link [] = [
    {
      linkRef: '/dashboard',
      linkTitle: 'Generate Report',
      action: onSubmit
    }
  ];

  const headerPaths: Link [] = [
    {
      linkRef: '/dashboard',
      linkTitle: 'Audits'
    },
    {
      linkRef: '',
      linkTitle: 'Audit 1' 
    }
  ]

  const inputs = [
    {
      titleText: 'Policies',
      descriptionText: 'Upload associated policies and procedures maintained by the organisation',
      nameOnForm: 'policyDoc'
    },
    {
      titleText: 'Walkthrough Note',
      descriptionText: 'Upload walkthrough notes from meeting with control operator(s)',
      nameOnForm: 'meetingNote'
    },
    {
      titleText: 'Supporting Evidence',
      descriptionText: 'Upload any other supporting evidence for the review',
      nameOnForm: 'otherFiles'
    }
  ]

  return (
    <>
      <SubHeader buttons={headerButtons} paths={headerPaths}></SubHeader>
      <div className="w-4/6 inline-grid report-area">
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit }) => (
            <form
              onSubmit={handleSubmit}
              id="audit-form"
              className="rounded p-5 ml-10"
            >
              <div className="flex items-center mb-8 ">
                <img src={title_icon} alt="Logo" />
                <h2 className="text-2xl font-semibold">Logical access audit</h2>
              </div>
              {inputs.map((input) => (
                <FileSection
                  titleText={input.titleText}
                  descriptionText={input.descriptionText}
                  nameOnForm={input.nameOnForm}
                ></FileSection>
              ))}
            </form>
          )}
        />
      </div>
      <div className="rounded p-5 w-2/6 inline-grid report-sidebar">
        <div className="text-lg mb-3  text-lightBlack">Description</div>
        <div className="text-sm">
          The logical access audit evaluates and verifies the implementation and
          effectiveness of an organization's electronic data systems controls.
          This type of audit ensures that only authorized individuals have
          access to systems and data, thereby safeguarding sensitive information
          from unauthorized access, use, or manipulation. The audit process
          typically involves reviewing user access rights, authentication
          mechanisms, and system activity logs to identify any discrepancies or
          potential security vulnerabilities. The goal is to maintain integrity
          and confidentiality of data by ensuring that access controls are
          appropriate and effectively managed
        </div>
        <table className="text-sm mt-5">
          <tbody>
            <tr>
              <td className="text-lightBlack">Status</td>
              <td>Active</td>
            </tr>
            <tr>
              <td className="text-lightBlack">Assignee</td>
              <td>Emmanuel Maro</td>
            </tr>
            <tr>
              <td className="text-lightBlack">Due Date</td>
              <td>2nd June 2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CreateReport2
