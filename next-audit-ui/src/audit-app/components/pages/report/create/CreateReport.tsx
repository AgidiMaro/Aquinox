import React from "react";
import { Form, Field, useFormState } from 'react-final-form'
import FileInput from "../../../common/fileInput/FileInput";
import TextInput from "../../../common/textInput/TextInput";

const CreateReport = (props: any) => {
  const onSubmit = (formVals: any) => {
    
    const form: any = document.getElementById("audit-form");
    const formData = new FormData(form);

    fetch("http://localhost:5000/upload", {
        method: 'post',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            response.json()
            .then(res => {
                console.log(res.message);
                props.navigateToResult(res.message);
            })
        }
    })
  };

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

            <button className="bg-darkBlue text-white w-full block p-2" type="submit">Submit</button>
          </form>
        )}
      />
    </div>
  )
}

export default CreateReport