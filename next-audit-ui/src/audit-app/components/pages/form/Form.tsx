import React, { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  username: string;
  age: string;
  dob: string;
}

interface FormProps {
  setFormData: (data: FormData) => void;
}

function Form({ setFormData }: FormProps) {
  const [inputValues, setInputValues] = useState<FormData>({
    username: "",
    age: "",
    dob: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues({
      ...inputValues,
      [name]: value,
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormData(inputValues);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={inputValues.username}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={inputValues.age}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Date of Birth:
          <input
            type="date"
            name="dob"
            value={inputValues.dob}
            onChange={handleChange}
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default Form;
