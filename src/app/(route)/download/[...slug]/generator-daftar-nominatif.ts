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
  fontSize: number = 8, // Default font size value
  padding: number = 5, // Default padding value
  lineSpacing: number = 10 // Default line spacing value
) => {
  //const adjustedX = align === "right" ? x : x + padding;
  const adjustedX = x + padding; // Add horizontal padding if needed

  //const adjustedX = x; //+ padding; // Add horizontal padding if needed
  const adjustedWidth = width - 2 * padding;
  const adjustedY = y + padding; // Add vertical padding if needed

  const lines = text.split("\n");
  let currentY = adjustedY;

  lines.forEach((line) => {
    doc.fontSize(fontSize).text(line, adjustedX, currentY, {
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
        "center" //column.align always center
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

interface Jadwal {
  nama: string; // nama kelas
  tanggal: string;
  jam: string;
  jadwalNarasumber: TableRow[]; // TableRow[] ini dari JadwalNarasumber
}

const generateTable = (
  doc: InstanceType<typeof PDFDocument>,
  columns: TableColumn[],
  rows: TableRow[],
  startX: number,
  startY: number,
  headerRowHeight: number = 25,
  headerNumberingRowHeight: number = 20,
  rowHeight: number = 25
) => {
  const deepestColumns = getDeepestColumns(columns);
  const maxLevel = findMaxLevel(columns);
  const totalHeightHeader = maxLevel * headerRowHeight;

  // count total width
  const totalWidth = getTotalTableWidth(deepestColumns);

  generateTableHeader(doc, columns, startX, startY, headerRowHeight);
  generateNumberingHeader(
    doc,
    deepestColumns,
    startX,
    startY + totalHeightHeader + headerRowHeight - headerNumberingRowHeight,
    headerNumberingRowHeight
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
        headerNumberingRowHeight +
        rowHeight * rowIndex,
      rowHeight
    );
  });
};

export const generateReportHeader = (
  doc: InstanceType<typeof PDFDocument>,
  satker: string,
  headerText: string,
  subHeaderText: string
) => {
  drawCell(
    doc,
    `${satker} \n Kementerian Luar Negeri`,
    25,
    25,
    200,
    "center",
    12,
    0,
    0
  );

  doc.moveDown();

  doc.fontSize(11).text(headerText, { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(11).text(subHeaderText, {
    align: "center",
  });
  doc.moveDown();
};

const generateReportFooter = (
  doc: InstanceType<typeof PDFDocument>,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  ppk: { nama: string; NIP: string },
  bendahara: { nama: string; NIP: string }
) => {
  drawCell(
    doc,
    `Mengetahui, \n Pejabat Pembuat Komitmen`,
    x1,
    y1,
    250,
    "center",
    12,
    0,
    0
  );

  drawCell(
    doc,
    `${ppk.nama} \n NIP. ${ppk.NIP}`,
    x1,
    y2,
    250,
    "center",
    12,
    0,
    0
  );

  drawCell(
    doc,
    `Mengetahui, \n Pejabat Pembuat Komitmen`,
    x2,
    y1,
    250,
    "center",
    12,
    0,
    0
  );

  drawCell(
    doc,
    `${ppk.nama} \n NIP. ${ppk.NIP}`,
    x2,
    y2,
    250,
    "center",
    12,
    0,
    0
  );
};

export async function generateDaftarNominatif(req: Request, slug: string[]) {
  // Example table columns with nested subheaders
  const columns: TableColumn[] = [
    {
      level: 1,
      header: "No.",
      headerNumberingString: "1",
      field: "no",
      width: 30,
      align: "center",
    },
    {
      level: 1,
      header: "NAMA/NIK/NPWP",
      headerNumberingString: "2",
      field: "namaNipNpwp",
      width: 120,
      align: "left",
    },
    {
      level: 1,
      header: "JABATAN",
      headerNumberingString: "2",
      field: "jabatan",
      width: 90,
      align: "left",
    },
    {
      level: 1,
      header: "HONORARIUM",
      width: 185,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "JP",
          headerNumberingString: "3",
          field: "jp",
          width: 35,
          align: "center",
        },
        {
          level: 2,
          header: "BESARAN",
          headerNumberingString: "4",
          field: "besaran",
          width: 75,
          align: "right",
        },
        {
          level: 2,
          header: "JUMLAH",
          headerNumberingString: "4",
          field: "jumlahBruto",
          width: 75,
          align: "right",
        },
      ],
    },
    {
      level: 1,
      header: "PAJAK PENGHASILAN",
      width: 200,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "DPP",
          headerNumberingString: "5",
          field: "dpp",
          width: 75,
          align: "right",
        },
        {
          level: 2,
          header: "TARIF",
          headerNumberingString: "6=5-7",
          field: "tarif",
          width: 50,
          align: "right",
        },
        {
          level: 2,
          header: "PPH 21 YANG DIPOTONG",
          headerNumberingString: "7",
          field: "pph",
          width: 75,
          align: "right",
        },
      ],
    },
    {
      level: 1,
      header: "JUMLAH YANG DITERIMA",
      headerNumberingString: "7",
      field: "jumlahNetto",
      width: 75,
      align: "center",
    },
    {
      level: 1,
      header: "NAMA DAN NOMOR REKENING",
      headerNumberingString: "7",
      field: "bankConcated",
      width: 100,
      align: "center",
    },
  ];

  const rows: TableRow[] = [
    {
      no: 1,
      namaNipNpwp: "John Doe panjang \n 1234567890 \n 1234567890",
      nama: "John Doe panjang",
      jabatan: "Manager",
      jp: 2.3,
      besaran: "Rp. 105.000.000",
      jumlahBruto: "$500",
      dpp: "Rp. 15.000.000",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },
    {
      no: 2,
      namaNipNpwp: "John Doe panjang",
      nama: "John Doe panjang",
      jabatan: "Manager",
      jp: 2.5,
      besaran: "$5000",
      jumlahBruto: "$500",
      dpp: "$200",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },
  ];

  const customFontPath = path.resolve(
    process.cwd(),
    "fonts/helvetica/Helvetica.ttf"
  );

  const doc = new PDFDocument({
    font: customFontPath,
    size: "A4",
    margins: { top: 15, bottom: 15, left: 10, right: 15 },
    layout: "landscape",
  });
  // doc.registerFont("CustomHelvetica", customFontPath);
  // doc.font("CustomHelvetica");

  // Buffers to hold PDF data
  const buffers: Buffer[] = [];

  // Listen for data and end events
  doc.on("data", buffers.push.bind(buffers));

  // Generate PDF content
  const startX = 20; // x-coordinate for the start of the table
  const startY = 75; // y-coordinate for the start of the table
  const headerRowHeight = 25; // tinggi untuk masing-masing baris header
  const headerNumberingRowHeight = 15; // tinggi untuk masing-masing baris header nomor
  const rowHeight = 65; // tinggi untuk masing-masing row data

  try {
    generateReportHeader(
      doc,
      "Pusat Pendidikan dan Pelatihan",
      "DAFTAR NOMINATIF HONORARIUM NARASUMBER/PEMBAHAS PAKAR/ PRAKTISI/ PROFESIONAL",
      "KEGIATAN PELATIHAN DAN PENGEMBANGAN KOMPETENSI PEGAWAI"
    );

    generateTable(
      doc,
      columns,
      rows,
      startX,
      startY,
      headerRowHeight,
      headerNumberingRowHeight,
      rowHeight
    );

    const y1 = startY + 125 + rowHeight * rows.length; // startYFooter
    const y2 = y1 + 75;
    const x1 = 25;
    const x2 = 600;
    const ppk = { nama: "Fulan bin Fulan", NIP: "1234567890" };
    const bendahara = { nama: "Fulan bin Fulan", NIP: "1234567890" };
    generateReportFooter(doc, x1, x2, y1, y2, ppk, bendahara);
    // how to detect last start y

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
