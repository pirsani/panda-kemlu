import Decimal from "decimal.js";
import { once } from "events";
import fs from "fs";
import { concat, max } from "lodash";
import { NextResponse } from "next/server";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value
import { height, width } from "pdfkit/js/page";

export interface TableColumnHeader {
  header: string;
  headerNumberingString?: string;
  field?: String;
  isSummable?: boolean; // Indicates if the column values can be summed
  level: number;
  width: number;
  align: "left" | "center" | "right";
  subHeader?: TableColumnHeader[];
}

export interface TableRow {
  [key: string]: string | number;
}

const getColumnXOffset = (
  tableColumnHeaders: TableColumnHeader[],
  index: number
) => {
  return tableColumnHeaders
    .slice(0, index)
    .reduce((acc, col) => acc + col.width, 0);
};

const getTotalTableWidth = (tableColumnHeaders: TableColumnHeader[]) => {
  return tableColumnHeaders.reduce((acc, col) => acc + col.width, 0);
};

const findMaxLevel = (tableColumnHeaders: TableColumnHeader[]): number => {
  let maxLevel = 0;

  for (const column of tableColumnHeaders) {
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

const getDeepestColumns = (
  tableColumnHeaders: TableColumnHeader[]
): TableColumnHeader[] => {
  let deepestColumns: TableColumnHeader[] = [];

  const traverse = (column: TableColumnHeader) => {
    if (!column.subHeader || column.subHeader.length === 0) {
      deepestColumns.push(column);
    } else {
      column.subHeader.forEach((subColumn) => traverse(subColumn));
    }
  };

  tableColumnHeaders.forEach((column) => traverse(column));
  return deepestColumns;
};

const isHasSubHeader = (column: TableColumnHeader): boolean => {
  return !!(column.subHeader && column.subHeader.length > 0);
};

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
  flatColumns: TableColumnHeader[],
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
  tableColumnHeaders: TableColumnHeader[],
  startX: number,
  startY: number,
  rowHeight: number = 20
) => {
  // find max level recursively
  const maxLevel = findMaxLevel(tableColumnHeaders);

  const drawHeader = (
    tableColumnHeaders: TableColumnHeader[],
    startX: number,
    startY: number
  ) => {
    tableColumnHeaders.forEach((column, index) => {
      const columnXOffset = getColumnXOffset(tableColumnHeaders, index);
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
  drawHeader(tableColumnHeaders, startX, startY);

  // Draw the border around the header
};

const generateTableRow = (
  doc: InstanceType<typeof PDFDocument>,
  row: TableRow,
  tableColumnHeaders: TableColumnHeader[],
  startX: number,
  y: number,
  rowHeight: number = 20
) => {
  const drawRow = (
    row: TableRow,
    tableColumnHeaders: TableColumnHeader[],
    startX: number,
    y: number,
    rowHeight: number
  ) => {
    Object.entries(row).forEach(([key, value]) => {
      const column = tableColumnHeaders.find((column) => column.field === key);
      if (!column) {
        return;
      }

      const columnXOffset = getColumnXOffset(
        tableColumnHeaders,
        tableColumnHeaders.indexOf(column)
      );
      const columnStartX = startX + columnXOffset;

      drawCell(
        doc,
        String(value),
        columnStartX,
        y,
        column.width,
        column.align,
        8,
        5,
        5
      );

      doc.rect(columnStartX, y, column.width, rowHeight).stroke();
      // console.log("columnY shouldbe", y + rowHeight);
      // console.log("[x,y]", doc.x, doc.y);
    });
  };

  drawRow(row, tableColumnHeaders, startX, y, rowHeight);
};

const sumData = (data: Decimal[][]): Decimal[] => {
  return data.reduce(
    (acc, row) => {
      return acc.map((value, index) => value.plus(row[index]));
    },
    data[0].map(() => new Decimal(0))
  );
};

const generateSumRow = (
  doc: InstanceType<typeof PDFDocument>,
  data: Decimal[][],
  deepestColumns: TableColumnHeader[],
  startX: number,
  lastY: number,
  sumRowHeight: number = 25,
  width: number = 200
) => {
  // add summary before new page
  const currentY = doc.y;
  console.log("[currentY before new page]", currentY);
  doc.rect(startX, lastY, width, sumRowHeight).stroke();

  const acummulatedSum = sumData(data);

  let i = 0;
  deepestColumns.forEach((column, index) => {
    const columnXOffset = getColumnXOffset(deepestColumns, index);
    const columnStartX = startX + columnXOffset;
    const columnStartY = lastY;

    // Draw the header text
    //drawCell(doc, "nilai", columnStartX, columnStartY, column.width, "center");
    if (column.isSummable) {
      doc.rect(columnStartX, columnStartY, column.width, sumRowHeight).stroke();
      drawCell(
        doc,
        acummulatedSum[i].toString(),
        columnStartX,
        columnStartY,
        column.width,
        column.align
      );
      i++;
    }
  });

  drawCell(doc, "Jumlah", startX, lastY, width, "left", 10, 5, 0);
};

export interface DataGroup {
  nama: string; // nama group
  groupMembers: TableRow[]; // TableRow[] ini dari DataGroupNarasumber
}

const generateTable = (
  doc: InstanceType<typeof PDFDocument>,
  tableColumnHeaders: TableColumnHeader[],
  tableData: DataGroup[],
  startX: number,
  startY: number,
  headerRowHeight: number = 25,
  headerNumberingRowHeight: number = 20,
  dataRowHeight: number = 25
) => {
  console.log("===generateTable===");
  const deepestColumns = getDeepestColumns(tableColumnHeaders);
  const maxLevel = findMaxLevel(tableColumnHeaders);
  const totalHeightHeader = maxLevel * headerRowHeight;
  const availableHeight = doc.page.height - 60;

  // count total width
  const totalWidth = getTotalTableWidth(deepestColumns);

  // filter deepest column that isSummable === true
  const summableColumns = deepestColumns.filter((column) => column.isSummable);
  let pageSums = summableColumns.map(() => new Decimal(0));
  const pageSumsArray: Decimal[][] = []; // Explicitly define the type
  const resetSums = () => {
    pageSumsArray.push([...pageSums]);
    pageSums = summableColumns.map(() => new Decimal(0));
  };

  generateTableHeader(doc, tableColumnHeaders, startX, startY, headerRowHeight);
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
  let controlStartYRowgroupMembers = controlBaseStartY + heightDivider;
  let controlStartYDynamic = 0;
  let dataGroupIterator = 0;
  let rowIterator = 0;
  let page = 1;
  let rowCounter = 0;
  let rowCounterOnPage = 0;
  tableData.forEach((dataGroup, dataGroupIndex) => {
    console.log("\n");
    console.log("[page]", page);
    console.log(
      "[dataGroupIterator,dataGroupIndex ]",
      dataGroupIterator,
      dataGroupIndex
    );
    let length = 0;
    if (dataGroupIndex !== 0) {
      length = tableData[dataGroupIndex - 1].groupMembers.length;
    }
    const totalHeightDivider = dataGroupIterator * heightDivider;
    const totalHeightRow = rowCounterOnPage * dataRowHeight;
    //const yBaseOnIndex = dataGroupIterator * length * dataRowHeight;
    //console.log("[yBaseOnIndex]", yBaseOnIndex);

    let baseStartY =
      startY +
      totalHeightHeader +
      headerRowHeight +
      //headerNumberingRowHeight +
      //totalHeightDivider +
      totalHeightRow;

    // debug baseStartY
    console.log(
      "[baseStartY = startY + totalHeightHeader+headerRowHeight+totalHeightRow]",
      `baseStartY = ${startY} + ${totalHeightHeader} + ${headerRowHeight} + ${totalHeightRow}`,
      baseStartY
    );

    // divider row dengan nama kelas
    let dividerStartY = baseStartY + 3 + dataGroupIterator * heightDivider;

    const isNewPageNeeded =
      dividerStartY + heightDivider + dataRowHeight > availableHeight;
    console.log(
      "[dividerStartY = baseStartY + 3 + dataGroupIterator * heightDivider]",
      dividerStartY,
      baseStartY,
      dataGroupIterator,
      heightDivider
    );
    console.log(
      "[dividerStartY,dataRowHeight,availableHeight]",
      dividerStartY,
      dataRowHeight,
      availableHeight
    );
    if (isNewPageNeeded) {
      // reset startY
      rowCounterOnPage = 0;
      dataGroupIterator = 0;

      // generate sum row before new page
      // baseStartY + dataGroupIterator * heightDivider
      // const lastY = baseStartY + dataGroupIterator * heightDivider;
      resetSums();
      const lastY = dividerStartY - 3;
      const dataSum = pageSumsArray[page - 1];
      generateSumRow(
        doc,
        pageSumsArray,
        deepestColumns,
        startX,
        lastY,
        20,
        totalWidth
      );

      doc.addPage(); // new page
      page++;
      console.log("[NEW PAGE] on new divider", page);
      baseStartY = controlBaseStartY;
      dividerStartY = baseStartY + 3;
      generateTableHeader(
        doc,
        tableColumnHeaders,
        startX,
        startY,
        headerRowHeight
      );
      generateNumberingHeader(
        doc,
        deepestColumns,
        startX,
        startY + totalHeightHeader + headerRowHeight - headerNumberingRowHeight,
        headerNumberingRowHeight
      );
    } else {
      //console.log("[CONTINUE]", dataGroupIndex);
    }

    // Set the fill color for the rectangle
    //console.log("Draw divider", dividerStartY, "\n");
    doc
      .fillColor("#e9ecef") // Set the desired background color
      .rect(
        startX,
        baseStartY + dataGroupIterator * heightDivider,
        //dividerStartY,
        totalWidth,
        heightDivider
      )
      .fillAndStroke(); // Fill the rectangle with the background color and draw the border
    // Reset the fill color to default (black) or transparent
    doc.fillColor("black");

    drawCell(
      doc,
      `${dataGroup.nama} dataGroupIterator ${dataGroupIterator} dataGroupIndex ${dataGroupIndex}`,
      startX,
      dividerStartY,
      totalWidth,
      "center",
      10,
      0,
      0
    );

    let startYRowgroupMembers =
      baseStartY + (dataGroupIterator + 1) * heightDivider;
    if (isNewPageNeeded) {
      startYRowgroupMembers = controlStartYRowgroupMembers;
    }

    let rowReset = false;

    // Iterate and generate row for each groupMembers
    // calculate subSumRow
    dataGroup.groupMembers.forEach((groupMembers, rowIndex) => {
      rowCounterOnPage++;

      let startYDynamic = startYRowgroupMembers + dataRowHeight * rowIndex;
      if (rowReset) {
        startYDynamic = controlStartYRowgroupMembers + dataRowHeight - 15;
      }

      const isNewPageNeeded = startYDynamic + dataRowHeight > availableHeight;
      if (isNewPageNeeded) {
        rowCounterOnPage = 1;
        rowIterator = 0;
        dataGroupIterator = 0;
        rowReset = true;

        // generate sum row before new page
        resetSums();
        console.log("Page Sums:", pageSumsArray);
        console.log(pageSumsArray[page - 1]); // array is zero based
        const dataSum = pageSumsArray[page - 1];
        generateSumRow(
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          startYDynamic,
          20,
          totalWidth
        );

        doc.addPage(); // new page
        page++;
        //console.log("[NEW PAGE] on new row", page);

        // reset startY
        startYDynamic = controlBaseStartY;
        baseStartY = controlBaseStartY;
        startYRowgroupMembers = controlStartYRowgroupMembers;
        generateTableHeader(
          doc,
          tableColumnHeaders,
          startX,
          startY,
          headerRowHeight
        );
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
        // sum row
        summableColumns.forEach((column, columnIndex) => {
          const columnValue = groupMembers[column.field as string];
          pageSums[columnIndex] = pageSums[columnIndex].plus(
            new Decimal(columnValue)
          );
        });
        rowIterator++;
        rowReset = false;
      }
      generateTableRow(
        doc,
        groupMembers,
        deepestColumns,
        startX,
        startYDynamic,
        dataRowHeight
      );

      // if last row, generate sum row
      if (
        dataGroupIndex === tableData.length - 1 &&
        rowIndex === dataGroup.groupMembers.length - 1
      ) {
        resetSums();
        const lastY = startYDynamic + dataRowHeight;
        const dataSum = pageSumsArray[page - 1];
        console.log("Last Page Sums:", pageSumsArray);
        generateSumRow(
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          lastY,
          20,
          totalWidth
        );
      }
    });

    dataGroupIterator++;
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

export interface TableOptions {
  startX: number; // x-coordinate for the start of the table
  startY: number; // y-coordinate for the start of the table
  headerRowHeight: number; // tinggi untuk masing-masing baris header
  headerNumberingRowHeight: number; // tinggi untuk baris header nomor dibawah header
  dataRowHeight: number; // tinggi untuk masing-masing row data
}
export async function generateTabelDinamis(
  tableData: DataGroup[],
  tableColumnHeaders: TableColumnHeader[],
  tableOptions: TableOptions
) {
  const {
    startX,
    startY,
    headerRowHeight,
    headerNumberingRowHeight,
    dataRowHeight,
  } = tableOptions;
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

  // Buffers to hold PDF data
  const buffers: Buffer[] = [];

  // Listen for data and end events
  doc.on("data", buffers.push.bind(buffers));

  // Generate PDF content

  try {
    //doc.rect(10, 10, 820, 560).stroke(); // reference
    // const lineStartX = 10; // x-coordinate for the start of the line
    // const lineEndX = 820; // x-coordinate for the end of the line
    // const lineY = 560; // y-coordinate for the line

    // doc
    //   .moveTo(lineStartX, lineY) // Move to the start of the line
    //   .lineTo(lineEndX, lineY) // Draw the line to the end point
    //   .stroke(); // Apply the stroke to draw the line

    generateReportHeader(
      doc,
      "Pusat Pendidikan dan Pelatihan",
      "DAFTAR NOMINATIF HONORARIUM NARASUMBER/PEMBAHAS PAKAR/ PRAKTISI/ PROFESIONAL",
      "KEGIATAN PELATIHAN DAN PENGEMBANGAN KOMPETENSI PEGAWAI"
    );

    generateTable(
      doc,
      tableColumnHeaders,
      tableData,
      startX,
      startY,
      headerRowHeight,
      headerNumberingRowHeight,
      dataRowHeight
    );

    // how to detect last start y

    // Detect current x and y coordinates
    let currentX = doc.x;
    let currentY = doc.y;
    console.log(`Current X: ${currentX}, Current Y: ${currentY}`);

    doc
      .moveTo(startX, currentY + dataRowHeight) // Move to the start of the line
      .lineTo(currentX + 10, currentY + dataRowHeight) // Draw the line to the end point
      .stroke(); // Apply the stroke to draw the line

    // mulai dari sini generate footer
    const ppk = { nama: "Fulan bin Fulan", NIP: "1234567890" };
    const bendahara = { nama: "Fulan bin Fulan", NIP: "1234567890" };
    const doctWidth = doc.page.width;
    console.log("doc.page.width", doctWidth);

    let y1 = currentY + dataRowHeight + 10;
    let y2 = y1 + 50;
    let x1 = startX;
    let x2 = doctWidth - 300;

    // check if need to add page if the last row is near the end of the page
    const availableHeight = doc.page.height - 60;
    const isPageNeeded = y1 + 75 > availableHeight;
    if (isPageNeeded) {
      doc.addPage();
      // tambahkan total lagi disini ?
      x1 = startX;
      x2 = doctWidth - 300;
      y1 = startY;
      y2 = y1 + 50;
    }

    generateReportFooter(doc, x1, x2, y1, y2, ppk, bendahara);

    doc.end();
    // Wait for 'end' event to ensure the document generation is complete
    await once(doc, "end");
    // Concatenate the buffers once the PDF generation is complete
    const pdfBuffer = Buffer.concat(buffers);
    return pdfBuffer;
    // Return a NextResponse with the PDF content
    // return new NextResponse(pdfBuffer, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "application/pdf",
    //     // "Content-Disposition": 'attachment; filename="payroll.pdf"',
    //   },
    // });
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
}

export default generateTabelDinamis;
