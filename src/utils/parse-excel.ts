import * as XLSX from "xlsx";

interface ParseExcelOptions {
  allowedColumns: string[];
}

const parseExcel = (
  file: File,
  options: ParseExcelOptions
): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
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

        resolve(filteredWorksheet);
      } catch (error) {
        console.error("Error parsing the file:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading the file:", error);
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

export default parseExcel;
