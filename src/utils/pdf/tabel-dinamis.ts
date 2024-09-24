import Decimal from "decimal.js";
import { once } from "events";
import fs from "fs";
import { concat, max } from "lodash";
import { NextResponse } from "next/server";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value
import { height, width } from "pdfkit/js/page";
import formatCurrency from "../format-currency";

export interface TableColumnHeader {
  header: string;
  headerNumberingString?: string;
  field?: String;
  isSummable?: boolean; // Indicates if the column values can be summed
  format?: "number" | "currency" | "date";
  currency?: "IDR" | "USD" | "EUR";
  level: number;
  width: number;
  align: "left" | "center" | "right";
  subHeader?: TableColumnHeader[];
}

export interface TableRow {
  [key: string]: string | number;
}

const justifyBetween = (
  fullValue: string, // This should contain the currency symbol and numeric value, e.g., 'Rp 919.099'
  width: number,
  fontSize: number,
  doc: InstanceType<typeof PDFDocument>
) => {
  // add space 10
  const space = -10;
  try {
    // Set the font size before measuring the width of the space character
    doc.fontSize(fontSize);

    // Use a regular expression to split the currency symbol from the value
    const match = fullValue.match(/^([^\d\s]+)\s*(\d.+)$/);

    if (!match) {
      throw new Error(
        "Invalid format for value: must include a currency symbol and numeric value."
      );
    }

    const currencySymbol = match[1]; // e.g., 'Rp'
    const value = match[2]; // e.g., '919.099'

    // Measure the width of the space character, the value, and the currency symbol
    const spaceWidth = doc.widthOfString(" ");
    const valueWidth = doc.widthOfString(value);
    const currencySymbolWidth = doc.widthOfString(currencySymbol);

    // Calculate the available width for inserting spaces between the currency symbol and the value
    const availableWidth = space + width - (valueWidth + currencySymbolWidth);

    // If the available width is negative or zero, return the currency symbol and value with no extra spacing
    if (availableWidth <= 0) return `${currencySymbol} ${value}`;

    // Calculate how many spaces can fit in the available width
    const totalSpaces = Math.floor(availableWidth / spaceWidth);

    // Build the final spread value by inserting the spaces between the currency symbol and the value
    let spreadValue = `${currencySymbol}${" ".repeat(totalSpaces)}${value}`;

    return spreadValue;
  } catch (error) {
    console.error("Error in spreadValueAcrossWidth:", error);
    throw error;
  }
};

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

      let val = String(value);
      if (column.format === "currency") {
        const currValue = formatCurrency(
          value as number,
          "id-ID",
          column.currency
        );
        // Spread value across column width if needed to fit the text Rp 1.000.000,00 -> Rp   1.000.000,00
        val = justifyBetween(String(currValue), column.width, 8, doc);
      }

      drawCell(doc, val, columnStartX, y, column.width, column.align, 8, 5, 5);

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
  textNarasiJumlah: string,
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
      let val = String(acummulatedSum[i]);
      if (column.format === "currency") {
        const currValue = formatCurrency(
          acummulatedSum[i],
          "id-ID",
          column.currency
        );
        // Spread value across column width if needed to fit the text Rp 1.000.000,00 -> Rp   1.000.000,00
        val = justifyBetween(String(currValue), column.width, 8, doc);
      }

      doc.rect(columnStartX, columnStartY, column.width, sumRowHeight).stroke();
      drawCell(
        doc,
        val,
        columnStartX,
        columnStartY,
        column.width,
        column.align
      );
      i++;
    }
  });

  drawCell(doc, textNarasiJumlah, startX, lastY, width, "left", 10, 5, 0);
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

  let sumRowHeight = 20;
  const heightDivider = 15;
  // generate table row
  let controlBaseStartY =
    startY +
    totalHeightHeader +
    headerRowHeight +
    headerNumberingRowHeight +
    sumRowHeight; // 20 is sumRowHeight
  let controlStartYRowgroupMembers = controlBaseStartY + heightDivider;
  let dataGroupIterator = 0;
  let rowIterator = 0;
  let page = 1;
  let rowCounterOnPage = 0;

  // iterate dataGroup
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

    // hanya tambahkan sumRowHeight jika page > 1 karena di page 1 tidak ada pindahan jumlah
    const addedSumRowHeight = page == 1 ? 0 : sumRowHeight;
    let baseStartY =
      startY +
      totalHeightHeader +
      headerRowHeight +
      totalHeightRow +
      addedSumRowHeight;

    // divider row dengan nama kelas
    let dividerStartY = baseStartY + 3 + dataGroupIterator * heightDivider;

    const isNewPageNeeded =
      dividerStartY + heightDivider + dataRowHeight > availableHeight;

    if (isNewPageNeeded) {
      // reset startY
      rowCounterOnPage = 0;
      dataGroupIterator = 0;

      // generate sum row before new page
      resetSums();
      const lastY = dividerStartY - 3; // plus 3 agar tulisan tidak berada tepat di garis
      generateSumRow(
        "Jumlah yang dipindahkan",
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
      generateSumRow(
        "Jumlah Pindahan",
        doc,
        pageSumsArray,
        deepestColumns,
        startX,
        startY + totalHeightHeader + headerRowHeight + headerNumberingRowHeight,
        sumRowHeight,
        totalWidth
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
          "Jumlah yang dipindahkan",
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
        // add sum row jumlah pindahan
        generateSumRow(
          "Jumlah Pindahan",
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          startYDynamic - sumRowHeight,
          sumRowHeight,
          totalWidth
        );
        summableColumns.forEach((column, columnIndex) => {
          const columnValue = groupMembers[column.field as string];
          pageSums[columnIndex] = pageSums[columnIndex].plus(
            new Decimal(columnValue)
          );
        });
      } else {
        rowIterator++;
        rowReset = false;

        // sum row
        summableColumns.forEach((column, columnIndex) => {
          const columnValue = groupMembers[column.field as string];
          pageSums[columnIndex] = pageSums[columnIndex].plus(
            new Decimal(columnValue)
          );
        });
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
        // setelah row terakhir perlu footer yang berisi tanggal dan ttd
        // maka jika tidak cukup tinggi, maka perlu new page
        const isNewPageNeeded = lastY + 100 > availableHeight;

        console.log("Last Page Sums:", pageSumsArray);
        generateSumRow(
          isNewPageNeeded ? "Jumlah yang dipindahkan" : "Jumlah Total",
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          lastY,
          20,
          totalWidth
        );

        console.log("isNewPageNeeded", isNewPageNeeded);
        if (isNewPageNeeded) {
          doc.addPage(); // new page
          page++;
          console.log("[NEW PAGE] on last row", page);
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
          // add sum row jumlah pindahan
          generateSumRow(
            "Jumlah Pindahan",
            doc,
            pageSumsArray,
            deepestColumns,
            startX,
            startYDynamic - sumRowHeight,
            sumRowHeight,
            totalWidth
          );
          generateSumRow(
            "Jumlah Total",
            doc,
            pageSumsArray,
            deepestColumns,
            startX,
            startYDynamic,
            sumRowHeight,
            totalWidth
          );
        }
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
  satker: string,
  tableTitle: string,
  tableSubtitle: string,
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

    generateReportHeader(doc, satker, tableTitle, tableSubtitle);

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

    // doc
    //   .moveTo(startX, currentY + dataRowHeight) // Move to the start of the line
    //   .lineTo(currentX + 10, currentY + dataRowHeight) // Draw the line to the end point
    //   .stroke(); // Apply the stroke to draw the line

    // mulai dari sini generate footer
    const ppk = { nama: "Fulan bin Fulan", NIP: "1234567890" };
    const bendahara = { nama: "Fulan bin Fulan", NIP: "1234567890" };
    const doctWidth = doc.page.width;
    console.log("doc.page.width", doctWidth);

    let y1 = currentY + 20;
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
