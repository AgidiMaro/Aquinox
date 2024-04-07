import React from "react";


export interface FileSectionProps {
  titleText: string;
  descriptionText: string;
  nameOnForm: string;
}

const FileSection = (props: FileSectionProps) => {
  return (
    <>
      <h3 className="text-2xl mb-3">{props.titleText}</h3>

      <div className="flex items-center">
        <span>{props.descriptionText}</span>
        <button className="ml-auto">
          <label htmlFor={props.nameOnForm}> Upload </label>
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">{props.titleText}</label>
        <input className="block w-full text-sm rounded-lg cursor-pointer" name={props.nameOnForm} type="file"
          multiple={true} accept="application/pdf" />
      </div>
    </>
  );
}

export default FileSection;