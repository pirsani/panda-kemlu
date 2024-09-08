import { fileTypeFromBuffer } from "file-type";
import * as XLSX from "xlsx";

interface ParseExcelOptions {
  allowedColumns: string[];
  sheetName?: string;
  range?: string; // Optional range of cells
}

const parseExcelOnServer = async (
  file: File,
  options: ParseExcelOptions
): Promise<Record<string, any>[]> => {
  if (!(file instanceof File)) {
    throw new Error("The provided input is not a file.");
  }

  if (!options.allowedColumns || options.allowedColumns.length === 0) {
    throw new Error("Allowed columns must be provided and cannot be empty.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      throw new Error("Unable to detect file type.");
    } else if (
      fileType.mime !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      throw new Error("Invalid file type. Only .xlsx files are supported.");
    }

    // Parse the file using XLSX
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = options.sheetName || workbook.SheetNames[0];
    console.log(`Parsing sheet: ${sheetName}`);

    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      header: 1, // Read raw rows as arrays
      range: options.range || undefined,
    }) as unknown[]; // Cast to unknown[] for type safety

    // Extract headers from the first row
    const headers = rawData[0] as string[];

    // Filter columns based on allowed columns
    const filteredRows = (rawData.slice(1) as any[]).map(
      (row: Record<string, any>[]) => {
        const rowObject: Record<string, any> = {};
        options.allowedColumns.forEach((col, index) => {
          const colIndex = headers.indexOf(col);
          if (colIndex >= 0 && colIndex < row.length) {
            rowObject[col] = row[colIndex];
          }
        });
        return rowObject;
      }
    );

    // Remove rows where all values are empty
    const validRows = filteredRows.filter((row) =>
      options.allowedColumns.some(
        (col) => row[col] !== "" && row[col] !== undefined
      )
    );

    console.log(`[parseExcelOnServer] Parsed ${validRows.length} rows`);
    return validRows;
  } catch (error) {
    console.error("Error parsing the file:", error);
    throw error;
  }
};

export default parseExcelOnServer;
