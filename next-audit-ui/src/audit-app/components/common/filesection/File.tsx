// Import the React library
import React from "react";

// Define the interface for the component's props
interface FileIconProps {
  name: string; // The name of the file
}

// Define the FileIcon functional component
const FileIcon = (props: FileIconProps) => {
  // Define a function to transform long file names
  const transform = (prevName: string) => {
    // If the name is less than 20 characters, return it as is
    if (prevName.length < 20) return prevName;

    // Otherwise, shorten the name and add ellipsis in the middle
    return `${prevName.substring(0, 7)}...${prevName.substring(
      prevName.length - 8
    )}`;
  };

  // Return the JSX to render the component
  return (
    <div className="p-3">
      {" "}
      {/* Container with padding */}
      <div className="file bg-lightWhite">
        {" "}
        {/* File icon container with background color */}
        <div className="file-icon"></div> {/* Actual file icon */}
      </div>
      <div className="my-5 ml-5">{transform(props.name)}</div>{" "}
      {/* Transformed file name with margin styling */}
    </div>
  );
};

// Export the FileIcon component as the default export
export default FileIcon;
