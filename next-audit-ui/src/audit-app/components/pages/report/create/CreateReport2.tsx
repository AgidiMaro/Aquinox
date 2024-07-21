
import React, { useState } from "react";
import { getReportAsync, updateAuditReport } from "../../../../state/reportSlice";
import { Form } from "react-final-form";
import { AppDispatch } from "../../../../state/store";
import { useDispatch } from "react-redux";
import SubHeader from "../../../common/subheader/SubHeader";
import { Link } from "../../../../models/Links";
import FileSection, { FileSectionProps } from "../../../common/filesection/FileSection";
import { useNavigate } from "react-router-dom";
import { AuditReport, Domain, Query } from "../../../../models/AuditReport";
import title_icon from '../table/TitleIcon.svg'
import { updateShowSpinner } from "../../../../state/pageSlice";
import './CreateReport.scss'

const CreateReport2 = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [filesRequired, setFilesRequired] = useState(true);

  const onSubmit = () => {
    
    const form: any = document.getElementById("audit-form");
    const formData = new FormData(form);

    
    if (!form.checkValidity()) {
      window.confirm('Ensure the Policies and Walkthrough notes are uploaded');
      return;
    }
    
    // dispatch(getReportAsync(formData))
    dispatch(updateShowSpinner(true));
    dispatch(getReportAsync(formData))
    .unwrap()
    .then(message => { 
      dispatch(updateShowSpinner(false));
      navigateToResult(message)
    })
    .catch(err => { 
      dispatch(updateShowSpinner(false));
      window.confirm('Error. Ensure All required fields are populated')
    })
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

  const inputs: FileSectionProps[] = [
    {
      titleText: "Policies*",
      descriptionText:
        "Upload associated policies and procedures maintained by the organisation",
      nameOnForm: "PolicyDoc",
      required: filesRequired,
      useSample: !filesRequired,
      disabled: !filesRequired,
      accept: ".pdf,.txt,.docx,.xlsx,.csv",
    },
    {
      titleText: "Walkthrough Note*",
      descriptionText:
        "Upload walkthrough notes from meeting with control operator(s)",
      nameOnForm: "MeetingNote",
      required: filesRequired,
      useSample: !filesRequired,
      disabled: !filesRequired,
      accept: ".pdf,.txt,.docx,.xlsx,.csv",
    },
    {
      titleText: "Supporting Evidence",
      descriptionText: "Upload any other supporting evidence for the review",
      nameOnForm: "OtherFiles",
      required: false,
      useSample: !filesRequired,
      disabled: !filesRequired,
      accept: ".pdf,.txt,.docx,.xlsx,.csv",
    },
    {
      titleText: "Additional Context",
      descriptionText: "Enter additional context here",
      nameOnForm: "AdditionalContext",
      required: false,
      useSample: false,
      disabled: false,
      isTextInput: true,
    },
  ];

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
                <h2 className="text-2xl font-semibold">
                  Change management audit
                </h2>
                <label id="useSampleWrapper" className="ml-auto mt-5 p-2">
                  <input
                    name="useSample"
                    id="useSample"
                    onChange={() => setFilesRequired(!filesRequired)}
                    className="sample-checkbox"
                    type="checkbox"
                    value="true"
                  />
                  <span className="ml-3">Use sample Data</span>
                </label>
              </div>
              {inputs.map((input) => (
                <FileSection key={input.nameOnForm} {...input}></FileSection>
              ))}
            </form>
          )}
        />
      </div>

      <div className="rounded p-5 w-2/6 inline-grid report-sidebar">
        <div className="text-lg mb-3  text-lightBlack">Description</div>
        <div className="text-sm">
          A change management audit assesses the effectiveness of an
          organization's procedures for managing changes to systems, processes,
          and products, ensuring they are introduced systematically and with
          minimal risk. Key aspects to look out for include the thorough
          documentation and logging of change requests, a formal submission
          process with detailed justifications and impact analyses, and a robust
          approval workflow involving appropriate stakeholders. The audit should
          also evaluate detailed implementation planning, effective
          communication strategies, and comprehensive training programs.
          Rigorous testing and validation procedures, coupled with thorough
          post-implementation reviews, are essential to ensure changes meet all
          requirements and perform as intended. Proper documentation and
          record-keeping practices must be maintained for future audits.
          Continuous improvement mechanisms should be in place to refine change
          management processes based on feedback. Overall, the audit aims to
          verify that changes are beneficial, aligned with strategic goals, and
          compliant with regulations, thus supporting organizational stability
          and efficiency.
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
