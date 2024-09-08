import FormFileUpload from "@/components/form/form-file-upload";
import parseExcel, { ParseExcelResult } from "@/utils/excel/parse-excel";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

interface InputFileXlsxProps {
  name: string;
  onChange: (parseExcelResult: ParseExcelResult) => void;
  maxColumns?: number; // Add maxColumns prop
  allowedColumns: string[];
}
const InputFileXlsx = ({
  name,
  onChange,
  maxColumns = 8,
  allowedColumns,
}: InputFileXlsxProps) => {
  // const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
  const handleOnChange = async (file: File | null) => {
    //const file = event.target.files?.[0];
    if (file) {
      try {
        console.log("[allowedColumns]", allowedColumns);
        //const allowedColumns = allowedColumns;
        const parsedData = await parseExcel(file, {
          allowedColumns: allowedColumns,
        });
        onChange(parsedData);
        console.log(
          "Parsed Data: [missingColumns]",
          parsedData.missingColumns || []
        );
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <FormFileUpload
      name={name}
      allowedTypes={[
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]}
      onFileChange={handleOnChange}
      className="bg-white"
    />
  );
};

export default InputFileXlsx;
