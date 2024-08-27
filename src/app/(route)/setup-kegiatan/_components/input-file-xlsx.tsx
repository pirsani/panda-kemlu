import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

interface InputFileXlsxProps {
  onChange: (data: Record<string, any>[]) => void;
}
const InputFileXlsx = ({ onChange }: InputFileXlsxProps) => {
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
            const worksheet: Record<string, any>[] = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheetName]
            );
            onChange && onChange(worksheet);
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
