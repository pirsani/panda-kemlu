import FormFileUpload from "@/components/form/form-file-upload";
import parseExcel, { ParseExcelResult } from "@/utils/parse-excel";
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
        //console.log("Parsed Data: [emptyValues]", parsedData.emptyValues || {});
        //const emptyAllowed = ["Eselon", "ID", "Lainny"];
        //const result = splitEmptyValues(parsedData.emptyValues, emptyAllowed);
        //console.log("Empty values:", result.shouldNotEmpty);
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

/**
 * Splits the empty values into two objects based on whether the empty columns are part of `emptyAllowed`.
 *
 * @param emptyValues - A record where the keys are row indices and values are arrays of empty column names.
 * @param emptyAllowed - An array of allowed empty column names.
 * @returns An object containing two records:
 * - `allowEmpty`: Rows with empty columns that are part of `emptyAllowed`.
 * - `shouldNotEmpty`: Rows with empty columns that are not part of `emptyAllowed`.
 */
export const splitEmptyValues = (
  emptyValues: Record<number, string[]>,
  emptyAllowed: string[]
): {
  allowEmpty: Record<number, string[]>;
  shouldNotEmpty: Record<number, string[]>;
} => {
  const allowEmpty: Record<number, string[]> = {};
  const shouldNotEmpty: Record<number, string[]> = {};

  for (const [rowIndex, columns] of Object.entries(emptyValues)) {
    const rowNum = Number(rowIndex); // Convert rowIndex to number
    const [withAllowed, withoutAllowed] = columns.reduce(
      ([withAllowed, withoutAllowed], col) => {
        if (emptyAllowed.includes(col)) {
          withAllowed.push(col);
        } else {
          withoutAllowed.push(col);
        }
        return [withAllowed, withoutAllowed];
      },
      [[], []] as [string[], string[]]
    );

    if (withAllowed.length > 0) {
      allowEmpty[rowNum] = withAllowed;
    }

    if (withoutAllowed.length > 0) {
      shouldNotEmpty[rowNum] = withoutAllowed;
    }
  }

  return {
    allowEmpty,
    shouldNotEmpty,
  };
};

// // Example usage
// const emptyValues: Record<number, string[]> = {
//   1: ["Eselon", "OtherColumn"],
//   2: ["Lainny", "SomeColumn"],
//   3: ["AnotherColumn", "YetAnotherColumn"]
// };

// const emptyAllowed = ["Eselon", "Lainny"];

// const result = splitEmptyValues(emptyValues, emptyAllowed);

// console.log("Empty values with emptyAllowed:", result.allowEmpty);
// console.log("Empty values without emptyAllowed:", result.shouldNotEmpty);
