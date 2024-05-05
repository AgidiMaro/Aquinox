import React from "react";

interface FileIconProps {
  name: string;
}

const FileIcon = (props: FileIconProps) => {

  const transform = (prevName: string) => {

    if (prevName.length < 20)
      return prevName;

    return `${prevName.substring(0, 7)}...${prevName.substring(prevName.length - 8)}`; 
  }


  return (
    <div className="p-3">
      <div className="file bg-lightWhite">
        <div className="file-icon"></div>
      </div>
      <div className="my-5 ml-5">{transform(props.name)}</div>
    </div>
  );
}

export default FileIcon;