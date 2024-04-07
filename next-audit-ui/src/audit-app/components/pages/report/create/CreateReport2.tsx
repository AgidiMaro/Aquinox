
import React from "react";
import { getReportAsync } from "../../../../state/reportSlice";
import { Form } from "react-final-form";
import { AppDispatch } from "../../../../state/store";
import { useDispatch } from "react-redux";
import SubHeader from "../../../common/subheader/SubHeader";
import { Link } from "../../../../models/Links";
import FileSection from "../../../common/filesection/FileSection";

const CreateReport2 = () => {

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = () => {
    
    const form: any = document.getElementById("audit-form");
    const formData = new FormData(form);

    dispatch(getReportAsync(formData))
  };

  const headerButtons: Link [] = [
    {
      linkRef: '/dashboard',
      linkTitle: 'Download 1'
    },
    {
      linkRef: '',
      linkTitle: 'Download 2' 
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

  return (
    <>
      <SubHeader buttons={headerButtons} paths={headerPaths}></SubHeader>
      <div className="flex items-center">
        
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit} id="audit-form" 
            className="rounded p-5 w-4/6 mx-10">
              <h2 className="text-3xl mb-3">Audit Task 1</h2>
              <FileSection titleText="Policies" descriptionText="List of policy documents" nameOnForm="policyDoc">
                
              </FileSection>
            </form>
          )}
        />
      </div>
    </>
  )
}

export default CreateReport2
