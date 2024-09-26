import FormFileUpload from "@/components/form/form-file-upload";
import parseExcel, { ParseExcelResult } from "@/utils/excel/parse-excel";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

interface InputFileXlsxProps {
  name: string;
  onChange: (parseExcelResult: ParseExcelResult) => void;
  maxColumns?: number; // Add maxColumns prop
  extractFromColumns: string[];
  placeholder?: string;
}
const InputFileXlsx = ({
  name,
  onChange,
  extractFromColumns,
  placeholder,
}: InputFileXlsxProps) => {
  // const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
  const handleOnChange = async (file: File | null) => {
    //const file = event.target.files?.[0];
    if (file) {
      try {
        console.log("[extractFromColumns]", extractFromColumns);
        //const extractFromColumns = extractFromColumns;
        const parsedData = await parseExcel(file, {
          extractFromColumns: extractFromColumns,
        });
        onChange(parsedData); // pass the result to the parent component
        console.log("Parsed Data: [rows]", parsedData.rows || []);
        // console.log(
        //   "Parsed Data: [missingColumns]",
        //   parsedData.missingColumns || []
        // );
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat membaca file excel");
      }
    } else {
      // set as empty when file is null
      const emptyResult: ParseExcelResult = {
        rows: [],
        missingColumns: [],
        emptyValues: {},
      };
      onChange(emptyResult);
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
      placeholder={placeholder}
    />
  );
};

export default InputFileXlsx;
