import React from "react";

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: any;
}

const SelectInput = (props: SelectInputProps) => {
  return (
    <div className="mb-4">
      <label htmlFor="dropdown" className="block text-gray-700 text-sm font-bold mb-2">Work Program</label>
      <select  id="dropdown" className="text-sm rounded-lg block w-full p-2.5 shadow">
        <option value="FR">Third Party Security Risk</option>
        <option value="US">Logical Access</option>
        <option value="CA">Patch And Vulnerability</option>
      </select>
    </div>
  )
}

export default SelectInput;