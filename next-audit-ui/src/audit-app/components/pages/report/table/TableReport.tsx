import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Domain } from "../../../../models/AuditReport";
import { AppDispatch, RootState } from "../../../../state/store";
import {
  expandSection,
  updateAuditReport,
} from "../../../../state/reportSlice";
import title_icon from "./TitleIcon.svg";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Link } from "../../../../models/Links";
import SubHeader from "../../../common/subheader/SubHeader";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { current } from "@reduxjs/toolkit";
import { exportAsExcel } from "../../../common/excelUtils/excelUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const truncateText = (text: string, wordLimit: number) => {
  const words = text.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
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
        {isExpanded ? " Read Less" : " Read More"}
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


  

  const headerButtons: Link[] = [
    {
      linkRef: "",
      linkTitle: "Download Report",
      action: ()=> exportAsExcel(report),
    },
  ];

  const headerPaths: Link[] = [
    {
      linkRef: "/dashboard",
      linkTitle: "Audits",
    },
    {
      linkRef: "/report",
      linkTitle: "Audit 1",
    },
    {
      linkRef: "",
      linkTitle: "Report",
    },
  ];

  const expandedIconClass = "arrow up";
  const collapsedIconClass = "arrow down";

  return (
    <>
      <SubHeader buttons={headerButtons} paths={headerPaths}></SubHeader>
      <div className="mx-auto p-6">
        <div className="flex items-center mb-8">
          <img src={title_icon} alt="Logo" />
          <h1 className="text-2xl font-semibold">
            Change Management Design and Implementation
          </h1>
        </div>
        <div>
          {report.domains.map((domain) => {
            const total = domain.yesCount + domain.noCount + domain.unknown;
            const rawDatasets = [
              {
                label: "Effective",
                data: [domain.yesCount],
                backgroundColor: "#219653",
                borderRadius: { topLeft: 50, bottomLeft: 50 },
                borderSkipped: false,
              },
              {
                label: "Ineffective",
                data: [domain.noCount],
                backgroundColor: "#EB5757",
                borderSkipped: false,
              },
              {
                label: "N/A",
                data: [domain.unknown],
                backgroundColor: "#F2C94C",
                borderRadius: { topRight: 50, bottomRight: 50 },
                borderSkipped: false,
              },
            ];
            const datasets = rawDatasets.map((dataset) => ({
              ...dataset,
              data: [(dataset.data[0] / total) * 100],
            }));
            const data = {
              labels: [""],
              datasets,
            };
            const options = {
              indexAxis: "y" as const,
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
                  },
                },
                y: {
                  stacked: true,
                  max: 100,
                  grid: {
                    display: false,
                    drawTicks: false,
                    drawOnChartArea: false,
                  },
                },
              },
              plugins: {
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (tooltipItem: TooltipItem<"bar">) => {
                      const value = tooltipItem.raw as number;
                      return `${value.toFixed(0)}%`;
                    },
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
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/8">
                            Design Library Procedure
                          </th>
                          {/* <th className="font-medium text-sm p-2 text-gray-700">
                            Result
                          </th> */}
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/8">
                            Design Details
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/8">
                            Design Details with Example
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/16">
                            Design Reference
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/8">
                            Implementation Library Procedure
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/8">
                            Implementation Details
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/8">
                            Implementation Details with Example
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700 w-1/16">
                            Implementation Reference
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {domain.questions.map((question, index) => (
                          <tr
                            key={domain.name + index}
                            className="my-10 font-normal text-sm text-gray-700"
                          >
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/8">
                              {question.tailored_procedure_design}
                            </td>
                            {/* <td className="p-2 border-b border-gray-300 text-center align-top">
                              {question.answer}
                            </td> */}
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/8">
                              {question.design_details}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/8">
                              {question.design_details_from_example}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/16">
                              {Array.isArray(question.design_reference) &&
                                question.design_reference.map((ref) => (
                                  <React.Fragment key={ref.source}>
                                    <div>
                                      <ReadMore
                                        text={ref.text}
                                        wordLimit={50}
                                      />
                                    </div>
                                    <div className="italic">
                                      {ref.file_name}
                                    </div>
                                  </React.Fragment>
                                ))}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/8">
                              {question.tailored_procedure_implementation}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/8">
                              {question.implementation_details}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/8">
                              {question.implementation_details_from_example}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top w-1/16">
                              {Array.isArray(
                                question.implementation_reference
                              ) &&
                                question.implementation_reference.map((ref) => (
                                  <React.Fragment key={ref.source}>
                                    <div>
                                      <ReadMore
                                        text={ref.text}
                                        wordLimit={50}
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
