import React from "react";

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: any;
  placeholder?: string
  required?: boolean;
}

const TextInput = (props: TextInputProps) => {
  return (
    <div className="my-10">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {props.label}
      </label>
      <input className="shadow h-12 rounded block w-full p-2 border border-grey-100" name={props.name} type="text" onChange={props.onChange}
        value={props.value} placeholder={props.placeholder || props.label} required={props.required}/>
    </div>
  )
}

export default TextInput;