import React, { useState } from "react";
import './filesection.scss';
import FileIcon from "./File";


export interface FileSectionProps {
  titleText: string;
  descriptionText: string;
  nameOnForm: string;
}

const FileSection = (props: FileSectionProps) => {

  const [files, setFiles] = useState([] as any []);
  const [isExpanded, setExpanded] = useState(false);

  const expandedIconClass = 'arrow up';
  const collapsedIconClass = 'arrow down';

  const displayClass = isExpanded ? "" : "none"

  const onUpload = (event: any) => {

    let filesUploaded = [];

    for (const node of event.target.files) {
      filesUploaded.push(node);
    }
    setFiles(filesUploaded);
    setExpanded(true);
  }

  return (
    <>
      <div className="flex items-center mb-5">
        <div className="inline-block">
          <div className="text-2xl mb-3">
            <i
              className={!isExpanded ? expandedIconClass : collapsedIconClass}
              onClick={() => setExpanded(!isExpanded)}
            ></i>
            <span className="ml-5 text-lg font-semibold text-darkBlack">
              {props.titleText}{" "}
            </span>
          </div>
          <div className="ml-8 text-sm font-regulat text-lightBlack">
            {props.descriptionText}
          </div>
        </div>
        <button
          type="button"
          className="ml-auto py-2 px-4 bg-pureWhite text-lightBlack font-semibold file-button text-sm"
        >
          <label htmlFor={props.nameOnForm}>Upload</label>
        </button>
      </div>

      <div className={`mb-4 ${displayClass}`}>
        <label className="block flex items-center justify-center mb-2 p-2 text-sm bg-pureWhite font-medium input-label">
          {!files.length && (
            <span>
              {" "}
              <b>Click to upload</b> or drag and drop
            </span>
          )}
          {!!files.length &&
            files.map((file) => <FileIcon name={(file as any).name} />)}
          <input
            id={props.nameOnForm}
            className="block w-full text-sm rounded-lg cursor-pointer none"
            name={props.nameOnForm}
            type="file"
            multiple={true}
            onChange={onUpload}
            accept="application/pdf"
          />
        </label>
      </div>
    </>
  );
}

export default FileSection;