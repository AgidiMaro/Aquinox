import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Domain } from "../../../../models/AuditReport";
import { AppDispatch, RootState } from "../../../../state/store";
import { expandSection, updateAuditReport } from "../../../../state/reportSlice";
import title_icon from './TitleIcon.svg'

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,ChartOptions,
  ChartData, TooltipItem } from 'chart.js';
import { Link } from "../../../../models/Links";
import SubHeader from "../../../common/subheader/SubHeader";


// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

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

  const headerPaths: Link [] = [
    {
      linkRef: '/dashboard',
      linkTitle: 'Audits'
    },
    {
      linkRef: '/report',
      linkTitle: 'Audit 1' 
    },
    {
      linkRef: '',
      linkTitle: 'Report' 
    }
  ];

  const headerButtons: Link [] = [
    {
      linkRef: '',
      linkTitle: 'Download',
      action: exportAsCSV
    }
  ];

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

    <>
      <SubHeader buttons={headerButtons} paths={headerPaths}></SubHeader>
   
      <div className="mx-7 p-6 ">        
        {/* Report Title and Icon*/}
        <div className="flex items-center mb-8">
          <img src={title_icon}alt="Logo"/>
          <h1 className="text-2xl font-semibold">Logical Access Audit</h1>
        </div>

        <div>

          {/* <div>
            {report.overview}
          </div> */}

          {report.domains.map((domain) => {
          const total = domain.yesCount + domain.noCount + domain.unknown;
          
          const rawDatasets = [
            { label: 'Effective', data: [domain.yesCount], backgroundColor: '#219653', borderRadius: { topLeft: 50, bottomLeft: 50 }, borderSkipped: false },
            { label: 'Ineffective', data: [domain.noCount], backgroundColor: '#EB5757', borderSkipped: false },
            { label: 'N/A', data: [domain.unknown], backgroundColor: '#F2C94C', borderRadius: { topRight: 50, bottomRight: 50 }, borderSkipped: false },
          ];

          const datasets = rawDatasets.map(dataset => ({
            ...dataset,
            data: [(dataset.data[0] / total) * 100],
          }));

          console.log({datasets})
          const data = {
            labels: [''],
            datasets,
          };

          const options = {
          indexAxis: 'y' as const,
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            x: {
              stacked: true,
              display: false,
              max:100,
              grid:{
                display:false,
                drawTicks:false,
                drawOnChartArea:false,
              }
            },
        y: {
          stacked: true,
          max:100,
          grid:{
            display:false,
            drawTicks:false,
            drawOnChartArea:false,
          }
        },
      },
      plugins: {
        
        tooltip: {
          enabled:true,
          
          callbacks: {
            label: (tooltipItem: TooltipItem<"bar">) => {
              const datasetLabel =
                tooltipItem.chart.data.datasets[tooltipItem.datasetIndex]
                  .label;
              const value = tooltipItem.raw as number; // Cast raw to number
              return `${datasetLabel} : ${value.toFixed(0)}%`; // Handling raw as a number directly
            },
          },
        },
      },
          };


              return (
                <>
                  <div onClick={() => dispatch(expandSection(domain))} className="border-2 rounded-lg pl-8 pr-24">
                    
                    <div className="flex justify-between items-center py-2 ">
                      <div className="font-medium text-gray-700">
                      {domain.name}
                      </div>
                      
                      {/* Bar chart and the icon for expansion */}
                    <div className="h-10 w-1/6 flex justify-between items-center p-1">
                      
                      <Bar data={data} options={options} className="rounded-full " />
                      
                      <div className="ml-12">

                      <i className={domain.isExpanded ? expandedIconClass : collapsedIconClass}></i>
      
                    </div>

                    </div>

                    </div>    

                    {/* Section showing the expanded results */}
                    {
                    domain.isExpanded &&
                    
                      <table className="table-auto border-collapse w-full my-4 rounded-lg overflow-hidden">
                    <thead className="border-b-2 bg-gray-200">
                      <tr>
                        <th className="font-medium text-sm p-2 text-gray-700">Test procedure</th>
                        <th className="font-medium text-sm p-2 text-gray-700">Result</th>
                        <th className="font-medium text-sm p-2 text-gray-700">Details</th>
                      </tr>
                    </thead>

                    <tbody>
                      {
                        domain.questions.map((question, index) => {
                          return (
                            <tr key={domain.name + index} className="my-10 font-normal text-sm text-gray-700">
                              <td className="p-2 border-b border-gray-300  text-left">{question.criteria}</td>
                              <td className="p-2 border-b border-gray-300  text-center">{question.answer}</td>
                              <td className="p-2 border-b border-gray-300 text-left">{question.details}</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                  
                    
                  
                  }
                    
                  </div>

                  
                </>
              );
            })}

            {/* Summary at the bottom */}
            {/* <div onClick={() => dispatch(expandSection())} className="my-5 bg-pureWhite shadow-md rounded p-8 m-auto">
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
          </div> */}

        </div>
      </div>
    </>
  )
}

export default TableReport;