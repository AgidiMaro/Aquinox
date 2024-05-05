import React from "react";

interface FileInputProps {
  label: string;
  name: string;
  value: string;
  onChange: any;
  multiple?: boolean;
}

const FileInput = (props: FileInputProps) => {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">{props.label}</label>
      <input className="block w-full text-sm rounded-lg cursor-pointer" name={props.name}  id="file" type="file"
        multiple={true} accept="application/pdf" onChange={props.onChange} />
    </div>
  )
}

export default FileInput;