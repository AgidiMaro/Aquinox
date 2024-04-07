
import React from "react";
import { Form, Field, useFormState } from 'react-final-form'
import FileInput from "../../../common/fileInput/FileInput";
import TextInput from "../../../common/textInput/TextInput";

import { AuditReport, Domain, Query } from '../../../../models/AuditReport';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getReportAsync, updateAuditReport } from "../../../../state/reportSlice";
import { AppDispatch } from "../../../../state/store";
import SelectInput from "../../../common/selectinput/SelectInput";

const CreateReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();


  const onSubmit = () => {
    
    const form: any = document.getElementById("audit-form");
    const formData = new FormData(form);

    dispatch(getReportAsync(formData))
    .unwrap()
    .then(message => navigateToResult(message))

  };


  // To do: Move parsing logic elsewhere
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
      const yes = Math.floor(Math.random() * length);
      const rem = length - yes;
      const no = Math.floor(Math.random() * rem);
      const maybe = rem - no;

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

  return (
    <div className="flex items-center">
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} id="audit-form" 
          className="bg-pureWhite shadow-md rounded p-8 w-4/6 m-auto">
            <h2 className="text-5xl mb-5">Final Audit Form</h2>

            <h3 className="text-2xl mb-3">Company Information</h3>
            
            <Field name="companyName">
              {props => (
                <div>
                  <TextInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Company Name"
                    onChange={props.input.onChange}
                  />
                </div>
              )}
            </Field>

            <Field name="companyEmail">
              {props => (
                <div>
                  <TextInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Company Email"
                    onChange={props.input.onChange}
                  />
                </div>
              )}
            </Field>


            <Field name="workplan">
              {props => (
                <div>
                  <SelectInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Work Plan"
                    onChange={props.input.onChange}
                  />
                </div>
              )}
            </Field>

            <h3 className="text-2xl my-5">Audit Information</h3>

            <Field name="policyDoc">
              {props => (
                <div>
                  <FileInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Policy Document"
                    onChange={props.input.onChange}
                  />
                </div>
              )}
            </Field>
            
            <Field name="meetingNote">
              {props => (
                <div>
                  <FileInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Meeting notes"
                    onChange={props.input.onChange}
                  />
                </div>
              )}
            </Field>


            <Field name="otherFiles">
              {props => (
                <div>
                  <FileInput
                    name={props.input.name}
                    value={props.input.value}
                    multiple={true}
                    label="Other files"
                    onChange={props.input.onChange}
                  />
                </div>
              )}
            </Field>

            <button className="bg-darkBlue text-white w-full block p-2" type="submit">Submit</button>
          </form>
        )}
      />
    </div>
  )
}

export default CreateReport