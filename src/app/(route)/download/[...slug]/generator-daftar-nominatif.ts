import fs from "fs";
import { max } from "lodash";
import { NextResponse } from "next/server";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value

interface TableColumn {
  header: string;
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

const getMaxHeaderHeight = (
  columns: TableColumn[],
  rowHeight: number
): number => {
  let maxHeight = rowHeight;
  columns.forEach((column) => {
    if (column.subHeader) {
      const subHeaderHeight = getMaxHeaderHeight(column.subHeader, rowHeight);
      maxHeight = Math.max(maxHeight, rowHeight + subHeaderHeight);
    }
  });
  return maxHeight;
};

const drawCell = (
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  x: number,
  y: number,
  width: number,
  align: "left" | "center" | "right"
) => {
  const padding = align === "right" ? -5 : 5;
  doc.fontSize(10).text(text, x + padding, y + 10, {
    width: width - 10,
    align: align,
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

      console.log("[column]", column);

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
  rowHeight: number = 20
) => {
  generateTableHeader(doc, columns, startX, startY, rowHeight);

  const totalHeight = getMaxHeaderHeight(columns, rowHeight);

  // get the colum

  const deepestColumns = getDeepestColumns(columns);

  rows.forEach((row, rowIndex) => {
    generateTableRow(
      doc,
      row,
      deepestColumns,
      startX,
      totalHeight + startY + rowHeight * (rowIndex + 1),
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
      field: "no",
      width: 50,
      align: "center",
    },
    {
      level: 1,
      header: "Employee Info",
      width: 250,
      align: "center",
      subHeader: [
        { level: 2, header: "Name", field: "nama", width: 150, align: "left" },
        {
          level: 2,
          header: "Position",
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
          field: "basicSalary",
          width: 100,
          align: "right",
        },
        {
          level: 2,
          header: "Allowances",
          field: "allowances",
          width: 100,
          align: "right",
        },
        {
          level: 2,
          header: "Deductions",
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
      nama: "John Doe panjang",
      posisi: "Manager",
      basicSalary: "$5000",
      allowances: "$500",
      deductions: "$200",
    },
    {
      no: 2,
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

  // Return a new Promise
  return new Promise<NextResponse>((resolve, reject) => {
    // Listen for data and end events
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(
        new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            // "Content-Disposition": 'attachment; filename="payroll.pdf"',
          },
        })
      );
    });
    doc.on("error", reject);

    // Generate PDF content
    try {
      doc.fontSize(18).text("Payroll Report", { align: "center" });
      doc.moveDown();
      generateTable(doc, columns, rows, 20, 100, 20);
      doc
        .moveDown()
        .text("Officer Signature: ____________________", { align: "left" });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadDaftarNominatif(req: Request, slug: string[]) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadDaftarNominatif;
