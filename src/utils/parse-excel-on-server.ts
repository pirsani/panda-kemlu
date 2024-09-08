import { fileTypeFromBuffer } from "file-type";
import { promises as fs } from "fs";
import * as XLSX from "xlsx";

interface ParseExcelOptions {
  allowedColumns: string[];
}

const parseExcelOnServer = async (
  file: File,
  options: ParseExcelOptions
): Promise<Record<string, any>[]> => {
  // Check if the input is a file
  if (!(file instanceof File)) {
    throw new Error("The provided input is not a file.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if the file type is allowed
    const fileType = await fileTypeFromBuffer(buffer);
    if (
      fileType &&
      fileType.mime ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Correctly pass the buffer here
      const workbook = XLSX.read(buffer, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const { allowedColumns } = options;

      // Read and parse the worksheet, restricting to the allowed columns
      const worksheet: Record<string, any>[] = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        {
          defval: "", // Default value for empty cells
          header: allowedColumns, // Restrict columns to allowed ones
        }
      );

      // Filter out rows that are completely empty in the allowed columns
      const filteredWorksheet = worksheet.filter((row) =>
        allowedColumns.some((col) => row[col] !== "")
      );
      return filteredWorksheet;

      console.log("[parseExcelOnServer] filteredWorksheet", filteredWorksheet);
    } else {
      throw new Error("Invalid file type.");
    }
  } catch (error) {
    console.error("Error parsing the file:", error);
    throw error;
  }
};

export default parseExcelOnServer;
