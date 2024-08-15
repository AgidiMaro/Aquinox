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

  // const exportAsCSV = () => {
  //   const csvDoc = csvMaker();
  //   download(csvDoc);
  // };

  // const download = (data: any) => {
  //   const blob = new Blob([data], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.setAttribute("href", url);
  //   a.setAttribute("download", "download.csv");
  //   a.click();
  // };

  // const csvMaker = () => {
  //   const csvRows: any[] = [];

  //   // Define the headers for the CSV
  //   const headers = [
  //     "Domain",
  //     "Library Procedure",
  //     "Details",
  //     "Details with Example",
  //     "Draft Conclusion",
  //     "Reference",
  //   ];
  //   csvRows.push(headers.join(","));

  //   // Iterate over each domain to generate rows
  //   report.domains.forEach((domain) => {
  //     // Ensure the CSV rows include data for each question in the domain
  //     updateDomainInCSV(csvRows, domain);
  //   });

  //   // Join all the rows into a single string with new line separation
  //   return csvRows.join("\n");
  // };

  // const updateDomainInCSV = (csvRows: any[], domain: Domain) => {
  //   // Add the domain name as a header row, if needed for organization
  //   csvRows.push(`"${domain.name}"`);

  //   // Iterate through each question in the domain
  //   domain.questions.forEach((q) => {
  //     // Ensure details_references is an array and extract 'text' or another property
  //     const references = (q.details_references || [])
  //       .map(
  //         (ref) =>
  //           `Reference Text: "${ref.text.replace(
  //             /"/g,
  //             '""'
  //           )}", Reference File: "${ref.file_name.replace(/"/g, '""')}"`
  //       )
  //       .join("; ");

  //     // Add the row with the domain and question details
  //     csvRows.push(
  //       `"${domain.name}","${q.criteria.replace(
  //         /"/g,
  //         '""'
  //       )}","${q.details.replace(
  //         /"/g,
  //         '""'
  //       )}","${q.details_from_example.replace(/"/g, '""')}","${q.answer.replace(
  //         /"/g,
  //         '""'
  //       )}","${references.replace(/"/g, '""')}"`
  //     );
  //   });
  // };

  const exportAsExcel = () => {
    // Generate the Excel document using excelMaker
    const workbook = excelMaker();
    download(workbook);
  };

  const download = (workbook: XLSX.WorkBook) => {
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, "AuditReport.xlsx");
  };

  const excelMaker = (): XLSX.WorkBook => {
    const excelRows: any[] = [];

    // Define the headers for the Excel file
    const headers = [
      "Domain",
      "Library Procedure",
      "Design Details",
      "Design Details with Example",
      "Design Reference",
      "Implementation Procedure",
      "Implementation Details",
      "Implementation Details with Example",
      "Implementation Reference",
    ];
    excelRows.push(headers);

    // Iterate over each domain to generate rows
    report.domains.forEach((domain) => {
      updateDomainInExcel(excelRows, domain);
    });

    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    // Apply styles to the worksheet
    worksheet = applyStyles(worksheet, headers);

    // Append the styled worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    return workbook; // Return the workbook object
  };

  const applyStyles = (
    worksheet: XLSX.WorkSheet,
    headers: string[]
  ): XLSX.WorkSheet => {
    // Define the header style
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "8B0000" } }, // Dark red background
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Define the content cell style
    const contentStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    if (worksheet["!ref"]) {
      // Apply styles to the headers
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ c: C, r: 0 });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = headerStyle;
      }

      // Apply styles to the content cells
      for (let R = 1; R < headerRange.e.r + 1; ++R) {
        for (let C = 0; C < headers.length; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = contentStyle;
        }
      }
    }

    return worksheet;
  };

  const updateDomainInExcel = (excelRows: any[], domain: Domain) => {
    domain.questions.forEach((q) => {
      const design_references = (q.design_reference || [])
        .map(
          (ref) =>
            `Reference Text: ${ref.text}\n, Reference File: ${ref.file_name}\n`
        )
        .join("; ");
        const implementation_references = (q.implementation_reference || [])
        .map(
          (ref) =>
            `Reference Text: ${ref.text}\n, Reference File: ${ref.file_name}\n`
        )
        .join("; ");

      excelRows.push([
        domain.name,
        q.tailored_procedure_design,
        q.design_details,
        q.design_details_from_example,
        q.design_reference,
        q.tailored_procedure_implementation,
        q.implementation_details,
        q.implementation_details_from_example,
        q.implementation_reference
      ]);
    });
  };

  const headerButtons: Link[] = [
    {
      linkRef: "",
      linkTitle: "Download Report",
      action: exportAsExcel,
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
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Design Library Procedure
                          </th>
                          {/* <th className="font-medium text-sm p-2 text-gray-700">
                            Result
                          </th> */}
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Design Details
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Design Details with Example
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Design Reference
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Implementation Library Procedure
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Implementation Details
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
                            Implementation Details with Example
                          </th>
                          <th className="font-medium text-sm p-2 text-gray-700">
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
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {question.tailored_procedure_design}
                            </td>
                            {/* <td className="p-2 border-b border-gray-300 text-center align-top">
                              {question.answer}
                            </td> */}
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {question.design_details}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {question.design_details_from_example}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {Array.isArray(question.design_reference) &&
                                question.design_reference.map((ref) => (
                                  <React.Fragment key={ref.source}>
                                    <div>
                                      <ReadMore
                                        text={ref.text}
                                        wordLimit={100}
                                      />
                                    </div>
                                    <div className="italic">
                                      {ref.file_name}
                                    </div>
                                  </React.Fragment>
                                ))}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {question.tailored_procedure_implementation}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {question.implementation_details}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {question.implementation_details_from_example}
                            </td>
                            <td className="p-2 border-b border-gray-300 text-left align-top">
                              {Array.isArray(question.implementation_reference) &&
                                question.implementation_reference.map((ref) => (
                                  <React.Fragment key={ref.source}>
                                    <div>
                                      <ReadMore
                                        text={ref.text}
                                        wordLimit={100}
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
