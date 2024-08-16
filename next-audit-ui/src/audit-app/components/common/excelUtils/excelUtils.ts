import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Domain } from "../../../models/AuditReport";



export const exportAsExcel = async (report: any) => {
  const workbook = await excelMaker(report);
  await download(workbook);
};

const download = async (workbook: ExcelJS.Workbook) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "AuditReport.xlsx");
};

const excelMaker = async (report: any): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Change Management");

  worksheet.views = [{ showGridLines: false }];

  const additionalHeaders = [
    ["IT Domain", "Program Changes"],
    ["Control Activity", "Changes are tested by appropriate personnel, reviewed for approval of testing, approval to promote and confirmation of the approved version prior to being moved to production"],
    ["Relevant to significant risk?", ""],
    ["Frequency", ""],
    ["Level of Automation", ""],
    ["Relevant IT Dependency & Type", ""],
    ["Control Name & Position", ""],
    ["Date of Assessment", ""],
    ["Applications Covered", ""],
    ["If multiple applications covered, assessed homogeneity", ""],
  ];

  additionalHeaders.forEach((row, index) => {
    worksheet.getRow(index + 2).getCell(1).value = row[0];
    worksheet.getRow(index + 2).getCell(2).value = row[1];
  });

  const headers = [
    "Domain",
    "Tailored Procedure",
    "Design Documentation",
    "Design Documentation with Example",
    "Design Reference",
    "Evidence to support implementation",
    "Implementation Documentation",
    "Implementation Documentation with Example",
    "Implementation Reference",
    "Conclusion",
    "Link to CD/W",
  ];

  worksheet.getRow(14).values = headers;
  let currentRow = 15;

  report.domains.forEach((domain: Domain) => {
    currentRow = updateDomainInExcel(worksheet, domain, currentRow);
  });

  applyStyles(worksheet);

  return workbook;
};

const applyStyles = (worksheet: ExcelJS.Worksheet) => {
    // Define a minimum width for all columns that have content
    worksheet.columns.forEach((column) => {
      if (column && column.eachCell) {
        // Ensure column and eachCell method are defined
        let maxLength = 35; // Set a default minimum width
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = typeof cell.value === "string" ? cell.value : "";
          const length = cellValue.length;
          if (length > maxLength) {
            maxLength = length;
          }
        });
        column.width = Math.min(Math.max(maxLength, 30), 60);
      }
    });

    // Wrap text in all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: "top" }; // Enable text wrapping
      });
    });

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FFFFFFFF" } }, // White text color
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8B0000" },
      }, // Dark red background
      border: {
        top: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        }, // Black borders
        bottom: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        left: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        right: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
      },
    };

    // Style for additional headers (rows 2 to 11) in Cell 1
    const additionalHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FF8B0000" } }, // Dark red bold font
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      }, // Grey background fill
      border: {
        top: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        }, // Thin black borders
        bottom: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        left: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        right: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
      },
      alignment: { wrapText: true, vertical: "top" },
    };

    // Style for Cell 2 in rows 2 to 11
    const additionalCell2Style: Partial<ExcelJS.Style> = {
      border: {
        top: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        }, // Thin black borders
        bottom: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        left: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        right: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
      },
      alignment: { wrapText: true, vertical: "top" },
    };

    const contentStyle: Partial<ExcelJS.Style> = {
      border: {
        top: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        }, // Black borders
        bottom: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        left: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
        right: {
          style: "thin" as ExcelJS.BorderStyle,
          color: { argb: "FF000000" },
        },
      },
      alignment: { wrapText: true, vertical: "top" },
    };

    // Apply styles to headers (first row)
    worksheet.getRow(14).eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Apply style to additional headers (rows 2 to 11)
    for (let i = 2; i <= 11; i++) {
      const row = worksheet.getRow(i);
      row.getCell(1).style = additionalHeaderStyle;
      row.getCell(2).style = additionalCell2Style;
    }

    // Apply styles to the content cells (all rows after the header)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 14) {
        row.eachCell((cell) => {
          cell.style = contentStyle;
        });
      }
    });
  };


const updateDomainInExcel = (
  worksheet: ExcelJS.Worksheet,
  domain: Domain,
  startRow: number
) => {
  let currentRow = startRow;
  domain.questions.forEach((q) => {
    const design_references = (q.design_reference || [])
      .map(
        (ref) => `Reference Text: ${ref.text}\nReference File: ${ref.file_name}`
      )
      .join("; ");
    const implementation_references = (q.implementation_reference || [])
      .map(
        (ref) => `Reference Text: ${ref.text}\nReference File: ${ref.file_name}`
      )
      .join("; ");

    worksheet.getRow(currentRow).values = [
      domain.name,
      q.tailored_procedure_design,
      q.design_details,
      q.design_details_from_example,
      design_references,
      q.tailored_procedure_implementation,
      q.implementation_details,
      q.implementation_details_from_example,
      implementation_references,
      "", // Placeholder for Conclusion
      "", // Placeholder for Link to CD/W
    ];
    currentRow++;
  });
  return currentRow;
};
