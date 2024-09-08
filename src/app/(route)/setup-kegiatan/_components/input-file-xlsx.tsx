import FormFileUpload from "@/components/form/form-file-upload";
import parseExcel from "@/utils/parse-excel";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

interface InputFileXlsxProps {
  name: string;
  onChange: (data: Record<string, any>[]) => void;
  maxColumns?: number; // Add maxColumns prop
}
const InputFileXlsx = ({
  name,
  onChange,
  maxColumns = 8,
}: InputFileXlsxProps) => {
  // const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
  const handleOnChange = async (file: File | null) => {
    //const file = event.target.files?.[0];
    if (file) {
      try {
        const allowedColumns = [
          "ID",
          "Nama",
          "NIP",
          "Golongan/Ruang",
          "NIP",
          "Jabatan",
          "Eselon",
          "NIK",
          "NPWP",
          "Nama Rekening",
          "Bank",
          "Nomor Rekening",
        ];
        const parsedData = await parseExcel(file, { allowedColumns });
        onChange(parsedData);
        //console.log("Parsed Data:", parsedData);
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
