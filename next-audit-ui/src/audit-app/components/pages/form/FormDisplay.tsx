import React from "react";

interface FormDisplayProps {
  data: {
    username: string;
    age: string;
    dob: string;
  };
}

function FormDisplay({ data }: FormDisplayProps) {
  return (
    <div>
      <h2>Data received:</h2>
      <p>
        <strong>Username:</strong> {data.username}
      </p>
      <p>
        <strong>Age:</strong> {data.age}
      </p>
      <p>
        <strong>Date of Birth:</strong> {data.dob}
      </p>
    </div>
  );
}

export default FormDisplay;
