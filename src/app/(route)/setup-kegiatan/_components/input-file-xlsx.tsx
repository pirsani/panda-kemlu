import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

interface InputFileXlsxProps {
  onChange: (data: Record<string, any>[]) => void;
  maxColumns?: number; // Add maxColumns prop
}
const InputFileXlsx = ({ onChange, maxColumns = 8 }: InputFileXlsxProps) => {
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            const arrayBuffer = e.target.result as ArrayBuffer;
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
              type: "array",
            });
            const sheetName = workbook.SheetNames[0];

            // Generate the list of allowed columns dynamically based on maxColumns
            const allowedColumns = Array.from({ length: maxColumns }, (_, i) =>
              String.fromCharCode(65 + i)
            ); // Columns A-H (ASCII 65 = 'A')

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

            onChange && onChange(filteredWorksheet);
          } catch (error) {
            console.error("Error parsing the file:", error);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <input
      id="peserta"
      type="file"
      accept=".xlsx"
      onChange={handleOnChange}
      className="border-2 border-gray-300 p-2 rounded w-full"
    />
  );
};

export default InputFileXlsx;
