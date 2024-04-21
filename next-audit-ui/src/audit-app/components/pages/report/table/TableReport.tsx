import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Domain } from "../../../../models/AuditReport";
import { AppDispatch, RootState } from "../../../../state/store";
import { expandSection, updateAuditReport } from "../../../../state/reportSlice";


const TableReport = () => {

  let report = useSelector((state: RootState) => state.report.auditReport);
  const dispatch = useDispatch<AppDispatch>();

  console.log(report);

  // To aid development. Remove this if block after
  
  if (!report || !Object.keys(report).length) {
    console.log('Update report');
    report = JSON.parse(localStorage.getItem('report') as string);
    dispatch(updateAuditReport(report));
    console.log(report);
  }

  const exportAsCSV = () => {
    const csvDoc = csvMaker();
    download(csvDoc);
  }

  const download = (data: any)  => { 
  
    // Creating a Blob for having a csv file format  
    // and passing the data with type 
    const blob = new Blob([data], { type: 'text/csv' }); 
  
    // Creating an object for downloading url 
    const url = window.URL.createObjectURL(blob) 
  
    // Creating an anchor(a) tag of HTML 
    const a = document.createElement('a') 
  
    // Passing the blob downloading url  
    a.setAttribute('href', url) 
  
    // Setting the anchor tag attribute for downloading 
    // and passing the download file name 
    a.setAttribute('download', 'download.csv'); 
  
    // Performing a download with click 
    a.click() 
}

  const csvMaker = () => {
    
    const csvRows: any [] = []; 
    
    const columns = 3;

    const headers = ['Criteria', 'Answer', 'Details']; 
  
    // As for making csv format, headers must 
    // be separated by comma and pushing it 
    // into array 
    csvRows.push(headers.join(',')); 

    const domainRowArr: string [] = [];

    for (let i = 0; i < columns; ++i) {
      domainRowArr.push('');
    }
    
    const emptyRow = domainRowArr.join(','); 
  
    report.domains.forEach(domain => {
      csvRows.push(emptyRow);
      updateDomainInCSV(csvRows, domain, domainRowArr)
    })
  
    // Returning the array joining with new line  
    return csvRows.join('\n') 
  };

  const updateDomainInCSV = (csvRows: any [], domain: Domain, domainRowArr: string []) => {
    domainRowArr[0] = `"${domain.name}"`;
    csvRows.push(domainRowArr.join(','));

    domain.questions.forEach(q => {
      csvRows.push(`"${q.criteria}","${q.answer}","${q.details}"`);
    })
  }

  const expandedIconClass = 'arrow up';
  const collapsedIconClass = 'arrow down';

  return (
    <div className="p-8">
      <div className="w-full h-20">
        
        <button onClick={exportAsCSV} className="bg-darkBlue text-white w-1/6 float-right p-2 m-5">Export as CSV</button>
        {/*
        <button onClick={() => {}} className="bg-darkBlue text-white w-1/6 float-right p-2 m-5">View Charts</button>
        */}
      </div>
      <div className="w-full">

        <div>
          {report.overview}
        </div>

        {report.domains.map((domain) => {
            return (
              <>
                <div onClick={() => dispatch(expandSection(domain))} className="my-5 bg-pureWhite shadow-md rounded p-8 m-auto">
                  {domain.name}
                  <span className="float-right">
                    <span className="mx-3">Yes: {((100 * domain.yesCount)/ domain.questions.length).toFixed(2)}%</span>
                    <span className="mx-3">No: {((100 * domain.noCount)/ domain.questions.length).toFixed(2)}%</span>
                    <span className="mx-3">N/A: {((100 * domain.unknown)/ domain.questions.length).toFixed(2)}%</span>
                    <i className={domain.isExpanded ? expandedIconClass : collapsedIconClass}></i>
                  </span>
                </div>
                {
                  domain.isExpanded &&
                  <table className="table-auto border w-full border-black border-2">
                  <thead className="border-b-2 border-black">
                    <tr>
                      <th className="font-bold border-2 border-black p-2">Criteria</th>
                      <th className="font-bold border-2 border-black p-2">Answer</th>
                      <th className="font-bold border-2 border-black p-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      domain.questions.map((question, index) => {
                        return (
                          <tr key={domain.name + index} className="my-5">
                            <td className="p-2 border-2 border-black text-left">{question.criteria}</td>
                            <td className="p-2 border-2 border-black text-left">{question.answer}</td>
                            <td className="p-2 border-2 border-black text-left">{question.details}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
                
                }
              </>
            );
          })}

          <div onClick={() => dispatch(expandSection())} className="my-5 bg-pureWhite shadow-md rounded p-8 m-auto">
            Summary
            <span className="float-right">
              <span className="mx-3">Yes: {(report.yesFrac).toFixed(2)}%</span>
              <span className="mx-3">No: {(report.noFrac).toFixed(2)}%</span>
              <span className="mx-3">N/A: {(report.unknownFrac).toFixed(2)}%</span>
              <i className={report.showOverview ? expandedIconClass : collapsedIconClass}></i>
            </span>
          </div>
          <div>
          {report.showOverview && report.summary}
        </div>
      </div>
    </div>
  )
}

export default TableReport;