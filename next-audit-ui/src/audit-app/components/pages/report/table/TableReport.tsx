import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Domain } from "../../../../models/AuditReport";
import { AppDispatch, RootState } from "../../../../state/store";
import { expandSection, updateAuditReport } from "../../../../state/reportSlice";
import title_icon from "./TitleIcon.svg";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Link } from "../../../../models/Links";
import SubHeader from "../../../common/subheader/SubHeader";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const truncateText = (text: string, wordLimit: number) => {
  const words = text.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return text;
};

interface ReadMoreProps {
  text: string;
  wordLimit: number;
}

const ReadMore: React.FC<ReadMoreProps> = ({ text, wordLimit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {isExpanded ? text : truncateText(text, wordLimit)}
      <span onClick={toggleReadMore} className="text-blue-500 cursor-pointer">
        {isExpanded ? ' Read Less' : ' Read More'}
      </span>
    </div>
  );
};

const TableReport = () => {
  let report = useSelector((state: RootState) => state.report.auditReport);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!report || !Object.keys(report).length) {
      console.log("Update report");
      report = JSON.parse(localStorage.getItem("report") as string);
      dispatch(updateAuditReport(report));
    }
  }, [dispatch, report]);

  const exportAsCSV = () => {
    const csvDoc = csvMaker();
    download(csvDoc);
  };

  const download = (data: any) => {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'download.csv');
    a.click();
  };

  const csvMaker = () => {
    const csvRows: any[] = [];
    const columns = 5;
    const headers = ["Criteria", "Answer", "Details", "Details with Example", "Reference"];
    csvRows.push(headers.join(","));
    const domainRowArr: string[] = [];
    for (let i = 0; i < columns; ++i) {
      domainRowArr.push("");
    }
    const emptyRow = domainRowArr.join(",");
    report.domains.forEach((domain) => {
      csvRows.push(emptyRow);
      updateDomainInCSV(csvRows, domain, domainRowArr);
    });
    return csvRows.join("\n");
  };

  const updateDomainInCSV = (csvRows: any[], domain: Domain, domainRowArr: string[]) => {
    domainRowArr[0] = `"${domain.name}"`;
    csvRows.push(domainRowArr.join(","));
    domain.questions.forEach((q) => {
      csvRows.push(`"${q.criteria}","${q.answer}","${q.details}"`);
    });
  };

  const headerButtons: Link[] = [
    {
      linkRef: '',
      linkTitle: 'Download Report',
      action: exportAsCSV
    }
  ];

  const headerPaths: Link[] = [
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

  const expandedIconClass = "arrow up";
  const collapsedIconClass = "arrow down";

  return (
    <>
      <SubHeader buttons={headerButtons} paths={headerPaths}></SubHeader>
      <div className="mx-auto p-6">
        <div className="flex items-center mb-8">
          <img src={title_icon} alt="Logo" />
          <h1 className="text-2xl font-semibold">Change Management Design and Implementation</h1>
        </div>
        <div>
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
                  max: 100,
                  grid: {
                    display: false,
                    drawTicks: false,
                    drawOnChartArea: false,
                  }
                },
                y: {
                  stacked: true,
                  max: 100,
                  grid: {
                    display: false,
                    drawTicks: false,
                    drawOnChartArea: false,
                  }
                },
              },
              plugins: {
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (tooltipItem: TooltipItem<'bar'>) => {
                      const value = tooltipItem.raw as number;
                      return `${value.toFixed(0)}%`;
                    }
                  },
                },
              },
            };
            return (
              <div key={domain.name}>
                <div
                  onClick={() => dispatch(expandSection(domain))}
                  className="border-2 rounded-lg pl-8 pr-24"
                >
                  <div className="flex justify-between items-center py-2">
                    <div className="font-medium text-gray-700">
                      {domain.name}
                    </div>
                    <div className="h-10 w-1/6 flex justify-between items-center p-1">
                      <Bar
                        data={data}
                        options={options}
                        className="rounded-full"
                      />
                      <div className="ml-12">
                        <i
                          className={
                            domain.isExpanded
                              ? expandedIconClass
                              : collapsedIconClass
                          }
                        ></i>
                      </div>
                    </div>
                  </div>
                  {domain.isExpanded && (
                    <table className="table-auto border-collapse w-full my-4 rounded-lg overflow-hidden">
                      <thead className="border-b-2 bg-gray-200">
                        <tr>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Test procedure
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Result
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Details
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Details with Example
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Reference
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {domain.questions.map((question, index) => (
                          <tr
                            key={domain.name + index}
                            className="my-10 font-normal text-sm text-gray-700"
                          >
                            <td className="p-2 border-b border-gray-300 text-left">
                              {question.criteria}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-center">
                              {question.answer}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left">
                              {question.details}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left">
                              {question.details_from_example}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left">
                              {Array.isArray(question.details_references) &&
                                question.details_references.map((ref) => (
                                  <React.Fragment key={ref.source}>
                                    <div>
                                      <ReadMore
                                        text={ref.text}
                                        wordLimit={20}
                                      />
                                    </div>
                                    <div className="italic">
                                      {ref.file_name}
                                    </div>
                                  </React.Fragment>
                                ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TableReport;
