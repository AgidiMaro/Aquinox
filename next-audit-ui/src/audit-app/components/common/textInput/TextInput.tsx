import React from "react";

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: any;
}

const TextInput = (props: TextInputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {props.label}
      </label>
      <input className="shadow rounded block w-full p-2" name={props.name} type="text" onChange={props.onChange}
        value={props.value} placeholder={props.label}/>
    </div>
  )
}

export default TextInput;