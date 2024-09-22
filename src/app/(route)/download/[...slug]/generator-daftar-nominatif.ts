import { once } from "events";
import fs from "fs";
import { concat, max } from "lodash";
import { NextResponse } from "next/server";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value

interface TableColumn {
  header: string;
  headerNumberingString?: string;
  field?: String;
  level: number;
  width: number;
  align: "left" | "center" | "right";
  subHeader?: TableColumn[];
}

interface TableRow {
  [key: string]: string | number;
}

const getColumnXOffset = (columns: TableColumn[], index: number) => {
  return columns.slice(0, index).reduce((acc, col) => acc + col.width, 0);
};

const getTotalTableWidth = (columns: TableColumn[]) => {
  return columns.reduce((acc, col) => acc + col.width, 0);
};

const findMaxLevel = (columns: TableColumn[]): number => {
  let maxLevel = 0;

  for (const column of columns) {
    // Check the current column's level
    if (column.level > maxLevel) {
      maxLevel = column.level;
    }

    // Recursively check subheaders if they exist
    if (column.subHeader && column.subHeader.length > 0) {
      const subMaxLevel = findMaxLevel(column.subHeader);
      if (subMaxLevel > maxLevel) {
        maxLevel = subMaxLevel;
      }
    }
  }

  return maxLevel;
};

const getDeepestColumns = (columns: TableColumn[]): TableColumn[] => {
  let deepestColumns: TableColumn[] = [];

  const traverse = (column: TableColumn) => {
    if (!column.subHeader || column.subHeader.length === 0) {
      deepestColumns.push(column);
    } else {
      column.subHeader.forEach((subColumn) => traverse(subColumn));
    }
  };

  columns.forEach((column) => traverse(column));
  return deepestColumns;
};

const isHasSubHeader = (column: TableColumn): boolean => {
  return !!(column.subHeader && column.subHeader.length > 0);
};

// const getMaxHeaderHeight = (
//   columns: TableColumn[],
//   rowHeight: number
// ): number => {
//   let maxHeight = rowHeight;
//   columns.forEach((column) => {
//     if (column.subHeader) {
//       const subHeaderHeight = getMaxHeaderHeight(column.subHeader, rowHeight);
//       maxHeight = Math.max(maxHeight, rowHeight + subHeaderHeight);
//     }
//   });
//   return maxHeight;
// };

const drawCell = (
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  x: number,
  y: number,
  width: number,
  align: "left" | "center" | "right",
  padding: number = 5, // Default padding value
  lineSpacing: number = 10 // Default line spacing value
) => {
  const adjustedX = align === "right" ? x - padding : x + padding;
  const adjustedWidth = width - 2 * padding;
  const adjustedY = y + padding; // Add vertical padding if needed

  const lines = text.split("\n");
  let currentY = adjustedY;

  lines.forEach((line) => {
    doc.fontSize(10).text(line, adjustedX, currentY, {
      width: adjustedWidth,
      align: align,
    });
    currentY +=
      doc.heightOfString(line, { width: adjustedWidth }) + lineSpacing;
  });
};

const generateNumberingHeader = (
  doc: InstanceType<typeof PDFDocument>,
  flatColumns: TableColumn[],
  startX: number,
  startY: number,
  rowHeight: number = 20
) => {
  flatColumns.forEach((column, index) => {
    const columnXOffset = getColumnXOffset(flatColumns, index);
    const columnStartX = startX + columnXOffset;
    const columnStartY = startY + rowHeight;

    // Draw the header text
    drawCell(
      doc,
      column.headerNumberingString || String(index + 1),
      columnStartX,
      columnStartY,
      column.width,
      "center"
    );

    doc.rect(columnStartX, columnStartY, column.width, rowHeight).stroke();
  });
};

const generateTableHeader = (
  doc: InstanceType<typeof PDFDocument>,
  columns: TableColumn[],
  startX: number,
  startY: number,
  rowHeight: number = 20
) => {
  // find max level recursively
  const maxLevel = findMaxLevel(columns);

  const drawHeader = (
    columns: TableColumn[],
    startX: number,
    startY: number
  ) => {
    console.log("[rowHeight]", rowHeight);
    columns.forEach((column, index) => {
      const columnXOffset = getColumnXOffset(columns, index);
      const columnStartX = startX + columnXOffset;
      const columnStartY = startY + rowHeight;

      // Draw the header text
      drawCell(
        doc,
        String(column.header),
        columnStartX,
        columnStartY,
        column.width,
        column.align
      );

      // check if column has subheader
      const hasSubHeader = isHasSubHeader(column);

      //console.log(`[hasSubHeader] ${column.header} `, hasSubHeader);
      const columnRowHeight = hasSubHeader
        ? rowHeight
        : (maxLevel - column.level) * rowHeight + rowHeight;

      doc
        .rect(columnStartX, columnStartY, column.width, columnRowHeight)
        .stroke();

      // If the column has subheaders, draw them recursively
      if (column.subHeader) {
        drawHeader(column.subHeader, columnStartX, columnStartY);
      }
    });
  };

  // Start drawing the header
  drawHeader(columns, startX, startY);

  // Draw the border around the header
};

const generateTableRow = (
  doc: InstanceType<typeof PDFDocument>,
  row: TableRow,
  columns: TableColumn[],
  startX: number,
  y: number,
  rowHeight: number = 20
) => {
  const drawRow = (
    row: TableRow,
    columns: TableColumn[],
    startX: number,
    y: number,
    rowHeight: number
  ) => {
    Object.entries(row).forEach(([key, value]) => {
      const column = columns.find((column) => column.field === key);
      if (!column) {
        return;
      }

      //console.log("[column]", column);

      const columnXOffset = getColumnXOffset(columns, columns.indexOf(column));
      const columnStartX = startX + columnXOffset;

      drawCell(doc, String(value), columnStartX, y, column.width, column.align);

      doc.rect(columnStartX, y, column.width, rowHeight).stroke();
    });
  };

  drawRow(row, columns, startX, y, rowHeight);
};

const generateTable = (
  doc: InstanceType<typeof PDFDocument>,
  columns: TableColumn[],
  rows: TableRow[],
  startX: number,
  startY: number,
  headerRowHeight: number = 20,
  rowHeight: number = 20
) => {
  const deepestColumns = getDeepestColumns(columns);
  const maxLevel = findMaxLevel(columns);
  const totalHeightHeader = maxLevel * headerRowHeight;

  generateTableHeader(doc, columns, startX, startY, headerRowHeight);
  generateNumberingHeader(
    doc,
    deepestColumns,
    startX,
    startY + totalHeightHeader,
    headerRowHeight
  );

  rows.forEach((row, rowIndex) => {
    generateTableRow(
      doc,
      row,
      deepestColumns,
      startX,
      // startY + totalHeightHeader + rowHeight * (rowIndex + 1),
      startY +
        totalHeightHeader +
        headerRowHeight +
        headerRowHeight +
        rowHeight * rowIndex,
      rowHeight
    );
  });
};

export async function generateDaftarNominatif(req: Request, slug: string[]) {
  // Example table columns with nested subheaders
  const columns: TableColumn[] = [
    {
      level: 1,
      header: "No.",
      headerNumberingString: "1",
      field: "no",
      width: 50,
      align: "center",
    },
    {
      level: 1,
      header: "NAMA/NIK/NPWP",
      headerNumberingString: "2",
      field: "concatedText",
      width: 150,
      align: "left",
    },
    {
      level: 1,
      header: "Employee Info",
      width: 250,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "Name",
          headerNumberingString: "3",
          field: "nama",
          width: 150,
          align: "left",
        },
        {
          level: 2,
          header: "Position",
          headerNumberingString: "4",
          field: "posisi",
          width: 100,
          align: "left",
        },
      ],
    },
    {
      level: 1,
      header: "Salary Details",
      width: 300,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "Basic Salary",
          headerNumberingString: "5",
          field: "basicSalary",
          width: 100,
          align: "right",
        },
        {
          level: 2,
          header: "Allowances",
          headerNumberingString: "6=5-7",
          field: "allowances",
          width: 100,
          align: "right",
        },
        {
          level: 2,
          header: "Deductions",
          headerNumberingString: "7",
          field: "deductions",
          width: 100,
          align: "right",
        },
      ],
    },
  ];

  const rows: TableRow[] = [
    {
      no: 1,
      concatedText: "John Doe panjang \n 1234567890 \n 1234567890",
      nama: "John Doe panjang",
      posisi: "Manager",
      basicSalary: "$5000",
      allowances: "$500",
      deductions: "$200",
    },
    {
      no: 2,
      concatedText: "John Doe panjang",
      nama: "John Doe panjang",
      posisi: "Manager",
      basicSalary: "$5000",
      allowances: "$500",
      deductions: "$200",
    },
  ];

  const customFontPath = path.resolve(
    process.cwd(),
    "fonts/helvetica/Helvetica.ttf"
  );

  const doc = new PDFDocument({
    font: customFontPath,
    size: "A4",
    margins: { top: 10, bottom: 50, left: 10, right: 50 },
    layout: "landscape",
  });
  // doc.registerFont("CustomHelvetica", customFontPath);
  // doc.font("CustomHelvetica");

  // Buffers to hold PDF data
  const buffers: Buffer[] = [];

  // Listen for data and end events
  doc.on("data", buffers.push.bind(buffers));

  // Generate PDF content
  try {
    doc.fontSize(18).text("Payroll Report", { align: "center" });
    doc.moveDown();
    generateTable(doc, columns, rows, 20, 100, 20, 100);
    //generateTable(doc, columns, rows, 20, 100, 20, 60);
    doc
      .moveDown()
      .text("Officer Signature: ____________________", { align: "left" });
    doc.end();

    // Wait for 'end' event to ensure the document generation is complete
    await once(doc, "end");
    // Concatenate the buffers once the PDF generation is complete
    const pdfBuffer = Buffer.concat(buffers);

    // Return a NextResponse with the PDF content
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": 'attachment; filename="payroll.pdf"',
      },
    });
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
}

export async function downloadDaftarNominatif(req: Request, slug: string[]) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadDaftarNominatif;
