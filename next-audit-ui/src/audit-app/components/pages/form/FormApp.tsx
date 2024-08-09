import React, { useState } from "react";
import Form from "./Form";
import FormDisplay from "./FormDisplay";

interface FormData {
  username: string;
  age: string;
  dob: string;
}

function FormApp() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    age: "",
    dob: "",
  });

  return (
    <div className="FormApp">
      <h1>React Input Passing Example</h1>
      <Form setFormData={setFormData} />
      <FormDisplay data={formData} />
    </div>
  );
}

export default FormApp;
