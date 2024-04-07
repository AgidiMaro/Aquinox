import React from "react";


const ChartReport = () => {
  return (
    <div className="p-8">
      <div className="w-full">
        <h2 className="text-5xl m-3 float-left">Dashboard</h2>
        {/*
        <button onClick={() => {}} className="bg-darkBlue text-white w-1/6 float-right p-2 m-5">View Table</button>
        */}
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>01</div>
        <div>09</div>
      </div>
    </div>
  )
}

export default ChartReport;