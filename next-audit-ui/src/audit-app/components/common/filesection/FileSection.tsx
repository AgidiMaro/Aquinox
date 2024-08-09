import React, { useState } from "react";
import './filesection.scss';
import FileIcon from "./File";


export interface FileSectionProps {
  titleText: string;
  descriptionText: string;
  nameOnForm: string;
  required?: boolean;
  disabled?: boolean;
  useSample?: boolean;
  isTextInput?: boolean;
  accept?: string;
  isDateInput?: boolean;
  hasExpansion?: boolean;
  placeholder?: string;
}

const FileSection = (props: FileSectionProps) => {
  const [files, setFiles] = useState([] as any[]);
  const [isExpanded, setExpanded] = useState(true);
  const [textInput, setTextInput] = useState<string>("");
  const [dateInput, setDateInput] = useState<string>("");

  const expandedIconClass = "arrow up";
  const collapsedIconClass = "arrow down";
  const displayClass = isExpanded ? "" : "none";

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesArray = Array.from(event.target.files || []);
    setFiles(filesArray);
    setExpanded(true);
  };

  const onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
  };

  const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(event.target.value);
  };

  let filesDisplay;

  if (props.useSample) {
    filesDisplay = (
      <>
        <FileIcon name={`${props.nameOnForm} Sample 1`} />
        <FileIcon name={`${props.nameOnForm} Sample 2`} />
      </>
    );
  } else if (!files || !files.length) {
    filesDisplay = (
      <span>
        {" "}
        <b>Click to upload</b> or drag and drop
      </span>
    );
  } else {
    filesDisplay = files.map((file) => (
      <FileIcon key={(file as any).name} name={(file as any).name} />
    ));
  }

  return (
    <>
      <div className="flex items-center mb-5">
        <div className="inline-block">
          <div className="text-2xl mb-3">
            {props.hasExpansion && (
              <i
                className={!isExpanded ? expandedIconClass : collapsedIconClass}
                onClick={() => setExpanded(!isExpanded)}
              ></i>
            )}
            <span
              className={`ml-5 text-lg font-semibold text-darkBlack ${
                !props.hasExpansion ? "ml-0" : ""
              }`}
            >
              {props.titleText}{" "}
            </span>
          </div>
          <div className="ml-8 text-sm font-regular text-lightBlack">
            {props.descriptionText}
          </div>
        </div>
        {!props.isTextInput && !props.isDateInput && !props.useSample && (
          <button
            type="button"
            className="ml-auto py-2 px-4 bg-pureWhite text-lightBlack font-semibold file-button text-sm"
          >
            <label htmlFor={props.nameOnForm}>Upload</label>
          </button>
        )}
      </div>

      <div className={`mb-4 ${props.hasExpansion ? displayClass : ""}`}>
        {props.isTextInput && (
          <textarea
            className="block w-full text-sm rounded-lg p-2 mt-2 border border-gray-300"
            placeholder={props.placeholder || "Enter additional context here"}
            value={textInput}
            onChange={onTextChange}
            name={`${props.nameOnForm}_text`}
          ></textarea>
        )}
        {props.isDateInput && (
          <input
            type="date"
            className="block w-full text-sm rounded-lg p-2 mt-2 border border-gray-300"
            value={dateInput}
            onChange={onDateChange}
            name={`${props.nameOnForm}_date`}
          />
        )}
        {!props.isTextInput && !props.isDateInput && (
          <label className="block flex items-center justify-center mb-2 p-2 text-sm bg-pureWhite font-medium input-label">
            {filesDisplay}
            <input
              id={props.nameOnForm}
              required={props.required}
              className="block w-full text-sm rounded-lg cursor-pointer none"
              name={props.nameOnForm}
              type="file"
              multiple={true}
              onChange={onUpload}
              disabled={props.disabled}
              accept={props.accept}
            />
          </label>
        )}
      </div>
    </>
  );
};


export default FileSection;