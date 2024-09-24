import { once } from "events";
import fs from "fs";
import { concat, max } from "lodash";
import { NextResponse } from "next/server";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value
import { height } from "pdfkit/js/page";

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
  lineSpacing: number = 5 // Default line spacing value
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
  rows: Jadwal[],
  startX: number,
  startY: number,
  headerRowHeight: number = 25,
  headerNumberingRowHeight: number = 20,
  rowHeight: number = 25
) => {
  console.log("===generateTable===");
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

  const heightDivider = 15;
  // generate table row
  let controlBaseStartY =
    startY + totalHeightHeader + headerRowHeight + headerNumberingRowHeight;
  let isReset = false;
  let controlStartYRowjadwalNarasumber = controlBaseStartY + heightDivider;
  let controlStartYDynamic = 0;
  let jadwalIterator = 0;
  let rowIterator = 0;
  rows.forEach((jadwal, jadwalIndex) => {
    console.log("\n");
    console.log("[jadwalIndex, jadwalIterator]", jadwalIndex, jadwalIterator);
    let length = 0;
    if (jadwalIndex !== 0) {
      length = rows[jadwalIndex - 1].jadwalNarasumber.length;
    }
    const totalHeightDivider = jadwalIterator * heightDivider;
    const totalHeightRow = rowIterator * rowHeight;
    const yBaseOnIndex = jadwalIterator * length * rowHeight;
    console.log("[yBaseOnIndex]", yBaseOnIndex);

    let baseStartY =
      startY +
      totalHeightHeader +
      headerRowHeight +
      headerNumberingRowHeight +
      //totalHeightDivider +
      totalHeightRow;

    // divider row dengan nama kelas
    let dividerStartY = baseStartY + 2 + jadwalIterator * heightDivider;

    const isNewPageNeeded = dividerStartY + rowHeight > doc.page.height - 25;
    if (isNewPageNeeded) {
      // reset startY
      console.log("[max height]", doc.page.height - 25);
      jadwalIterator = 0;
      console.log("[isNewPageNeeded On Divider]", isNewPageNeeded, jadwalIndex);
      //doc.addPage();
      doc.addPage(); // new page
      console.log("reset");
      baseStartY = controlBaseStartY;
      dividerStartY = baseStartY + 2;
      generateTableHeader(doc, columns, startX, startY, headerRowHeight);
      generateNumberingHeader(
        doc,
        deepestColumns,
        startX,
        startY + totalHeightHeader + headerRowHeight - headerNumberingRowHeight,
        headerNumberingRowHeight
      );
      console.log("Draw divider in new page", dividerStartY, "\n");
    } else {
      console.log("[CONTINUE]", jadwalIndex);
    }

    // Set the fill color for the rectangle
    console.log("Draw divider", dividerStartY, "\n");
    doc
      .fillColor("#e9ecef") // Set the desired background color
      .rect(
        startX,
        baseStartY + jadwalIterator * heightDivider,
        totalWidth,
        heightDivider
      )
      .fillAndStroke(); // Fill the rectangle with the background color and draw the border
    // Reset the fill color to default (black) or transparent
    doc.fillColor("black");

    drawCell(
      doc,
      `${jadwal.nama} ${jadwal.tanggal} ${jadwal.jam} iterator ${jadwalIterator} jadwalIndex ${jadwalIndex}`,
      startX,
      dividerStartY,
      totalWidth,
      "center",
      9,
      0,
      0
    );

    let startYRowjadwalNarasumber =
      baseStartY + (jadwalIterator + 1) * heightDivider;
    if (isNewPageNeeded) {
      startYRowjadwalNarasumber = controlStartYRowjadwalNarasumber;
    }

    //let startYDynamic = startYRowjadwalNarasumber;
    let rowReset = false;
    jadwal.jadwalNarasumber.forEach((jadwalNarasumber, rowIndex) => {
      let startYDynamic = startYRowjadwalNarasumber + rowHeight * rowIndex;

      //startYDynamic = startYRowjadwalNarasumber + rowHeight * rowIndex;
      console.log(
        "[startY, baseStartY,startYRowjadwalNarasumber]",
        startY,
        baseStartY,
        startYRowjadwalNarasumber
      );
      console.log(
        "[startYDynamic, expectedHeight]",
        startYDynamic,
        startYDynamic + rowHeight
      );
      const isNewPageNeeded = startYDynamic + rowHeight > doc.page.height - 25;
      if (isNewPageNeeded) {
        rowIterator = 0;
        rowReset = true;
        console.log(
          "[isNewPageNeeded on Row]",
          isNewPageNeeded,
          jadwalIndex,
          rowIndex
        );
        console.log("[max height]", doc.page.height - 25);
        doc.addPage(); // new page
        // reset startY
        startYDynamic = controlBaseStartY;
        baseStartY = controlBaseStartY;
        startYRowjadwalNarasumber = controlStartYRowjadwalNarasumber;
        generateTableHeader(doc, columns, startX, startY, headerRowHeight);
        generateNumberingHeader(
          doc,
          deepestColumns,
          startX,
          startY +
            totalHeightHeader +
            headerRowHeight -
            headerNumberingRowHeight,
          headerNumberingRowHeight
        );
      } else {
        rowIterator++;
        rowReset = false;
      }
      generateTableRow(
        doc,
        jadwalNarasumber,
        deepestColumns,
        startX,
        // startY + totalHeightHeader + rowHeight * (rowIndex + 1),
        startYDynamic,
        rowHeight
      );
    });

    jadwalIterator++;
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
      width: 180,
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
          width: 35,
          align: "right",
        },
        {
          level: 2,
          header: "PPH 21 YANG DIPOTONG",
          headerNumberingString: "7",
          field: "pph",
          width: 70,
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
      width: 90,
      align: "center",
    },
  ];

  const rows1: TableRow[] = [
    {
      no: 1,
      namaNipNpwp: "satu orang \n 97638383 \n 4847474",
      nama: "satu orang",
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

  const rows3: TableRow[] = [
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
      namaNipNpwp: "fukasb sdsd sadj \n 1234567890 \n 1234567890",
      nama: "siaa ajsdasd ",
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

    {
      no: 3,
      namaNipNpwp: "sansdi sadsad \n 1234567890 \n 1234567890",
      nama: "siaa sad ",
      jabatan: "sadsad sdss",
      jp: 2.5,
      besaran: "$5000",
      jumlahBruto: "$500",
      dpp: "$200",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BNI \n sdfdsf dsfdsf \n 1234567890",
    },
  ];

  const jadwal1: Jadwal = {
    nama: "Kelas A",
    tanggal: "2021-10-10",
    jam: "09:00 - 16:00",
    jadwalNarasumber: rows1,
  };

  const jadwal: Jadwal = {
    nama: "Kelas A",
    tanggal: "2021-10-10",
    jam: "09:00 - 16:00",
    jadwalNarasumber: rows,
  };

  const jadwal3: Jadwal = {
    nama: "Kelas X",
    tanggal: "2021-10-10",
    jam: "09:00 - 16:00",
    jadwalNarasumber: rows3,
  };

  const jadwals = [
    jadwal3,
    jadwal,
    jadwal3,
    jadwal3,
    jadwal,
    jadwal3,
    jadwal1,
    jadwal3,
    jadwal,
    jadwal,
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
  const rowHeight = 50; // tinggi untuk masing-masing row data

  try {
    //doc.rect(10, 10, 820, 560).stroke(); // reference
    //  // Draw a horizontal line
    const lineStartX = 10; // x-coordinate for the start of the line
    const lineEndX = 820; // x-coordinate for the end of the line
    const lineY = 560; // y-coordinate for the line

    doc
      .moveTo(lineStartX, lineY) // Move to the start of the line
      .lineTo(lineEndX, lineY) // Draw the line to the end point
      .stroke(); // Apply the stroke to draw the line

    generateReportHeader(
      doc,
      "Pusat Pendidikan dan Pelatihan",
      "DAFTAR NOMINATIF HONORARIUM NARASUMBER/PEMBAHAS PAKAR/ PRAKTISI/ PROFESIONAL",
      "KEGIATAN PELATIHAN DAN PENGEMBANGAN KOMPETENSI PEGAWAI"
    );

    generateTable(
      doc,
      columns,
      jadwals,
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
    // generateReportFooter(doc, x1, x2, y1, y2, ppk, bendahara);
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

export async function downloadTabelDinamis(req: Request, slug: string[]) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadTabelDinamis;
