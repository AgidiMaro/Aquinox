import React from "react";
import { ResultProps } from "../Result";


const TableReport = (props: ResultProps) => {
  return (
    <div className="p-8">
      <div className="w-full">
        <button className="bg-darkBlue text-white w-1/6 float-right p-2 m-5">Export as CSV</button>
        <button onClick={props.modeSwitch} className="bg-darkBlue text-white w-1/6 float-right p-2 m-5">View Charts</button>
      </div>
      <table className="table-auto border w-full">
        <thead>
          <tr>
            <th className="font-bold p-2 border-b">Domain</th>
            <th className="font-bold p-2 border-b">Criteria</th>
            <th className="font-bold p-2 border-b">Answer</th>
            <th className="font-bold p-2 border-b">Details</th>
          </tr>
        </thead>
        <tbody>
          {props.report.domains.map((domain) => {
            return (
              <>
                {
                  domain.questions.map((question, index) => {
                    return (
                      <tr key={domain.name + index} className="my-5">
                        <td className="p-2 border-b text-left">{index == 0 ? domain.name : ''}</td>
                        <td className="p-2 border-b text-left">{question.criteria}</td>
                        <td className="p-2 border-b text-left">{question.answer}</td>
                        <td className="p-2 border-b text-left">{question.details}</td>
                      </tr>
                    )
                  })
                }
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TableReport;