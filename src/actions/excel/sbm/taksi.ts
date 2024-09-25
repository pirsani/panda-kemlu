"use server";
import { ActionResponse } from "@/actions";
import {
  columnsMap,
  columnsWithEmptyValueAllowed,
  extractFromColumns,
  mapColumnExcelToField,
} from "@/constants/excel/sbm-taksi";
import getReferensiSbmTaksi, { SbmTaksiPlainObject } from "@/data/sbm-taksi";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import parseExcelOnServer, {
  ParseExcelOptions,
} from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { excelDataReferensiSchema } from "@/zod/schemas/excel";
import { SbmTaksi } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export const importExcelSbmTaksi = async (
  formData: FormData
): Promise<ActionResponse<SbmTaksiPlainObject[]>> => {
  let data: SbmTaksiPlainObject[];

  // step 1: parse the form data
  try {
    console.log("[try to parse]", formData);
    // Convert FormData to a plain object
    const plainObject = formDataToObject(formData);

    const parsedForm = excelDataReferensiSchema.parse(plainObject);
    console.log("[parsedForm]", parsedForm);

    const { file } = parsedForm;
    // parse the xlsx file
    if (file) {
      const rows = await parseDataSbmTaksiDariExcel(file);
      const result = await saveDataSbmTaksiToDatabase(rows);
      if (!result) {
        return {
          success: false,
          error: "No result Error saving data to database",
          message: "No result Error saving data to database",
        };
      } else {
        return {
          success: true,
          data: result,
          message: "Data sbmTaksi berhasil diimport",
        };
      }
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[ZodError]", error.errors);
    } else {
      const customError = error as CustomPrismaClientError;
      if (customError.code === "P2002") {
        return {
          success: false,
          error: customError.code,
          message:
            "Sbm Uh Dalam Negeri dengan provinsi dan tahun yang sama sudah ada",
        };
      }

      console.error("[UnknownError]", error);
    }
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    };
  }

  // step 2: save the data to the database
  // data ready to be saved
  return {
    success: false,
    error: "Error saving data to database",
    message: "Error saving data to database",
  };
};

// Function to convert FormData to a plain object
const formDataToObject = (formData: FormData) => {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

async function parseDataSbmTaksiDariExcel(file: File) {
  // parse the form data
  const options: ParseExcelOptions = {
    extractFromColumns: extractFromColumns,
  };
  try {
    const dataSbmTaksiDariExcel = await parseExcelOnServer(file, options);

    // check if there is no missing columns and empty values : harusnya ini sdh dilakukan di sisi client jadi gak perlu diulang

    if (dataSbmTaksiDariExcel.rows.length === 0) {
      throw new Error("No data found in the excel file");
    }

    // check if there is emtpy values
    if (Object.keys(dataSbmTaksiDariExcel.emptyValues).length != 0) {
      const result = splitEmptyValues(
        dataSbmTaksiDariExcel.emptyValues,
        columnsWithEmptyValueAllowed
      );
      const { shouldNotEmpty, allowEmpty } = result;
      if (Object.keys(shouldNotEmpty).length != 0) {
        console.log("[shouldNotEmpty]", shouldNotEmpty);
        console.log("There are empty values in the required columns");
        throw new Error("There are empty values in the required columns");
      }
    }

    return dataSbmTaksiDariExcel.rows;
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    throw new Error("Error parsing xlsx file");
  }
}

async function saveDataSbmTaksiToDatabase(
  data: Record<string, any>[],
  createdBy: string = "admin"
): Promise<SbmTaksiPlainObject[] | void> {
  // loop over the data and save it to the database, convert into SbmTaksi object
  // manual id creation
  try {
    const sbmTaksi: SbmTaksi[] = data.map((row) => {
      const mappedData = mapColumnExcelToField(row, columnsMap);
      mappedData.createdBy = createdBy;
      mappedData.id =
        mappedData.nomor.toString() + "-" + mappedData.tahun.toString();
      delete mappedData.nomor;
      delete mappedData.provinsi;
      return mappedData as SbmTaksi;
    });

    console.log("[sbmTaksi]", sbmTaksi);

    const inserted = await dbHonorarium.sbmTaksi.createMany({
      data: sbmTaksi,
    });

    console.log("[inserted]", inserted);
    // Fetch the created records
    const createdSbmTaksi = await getReferensiSbmTaksi();
    const convertedData = createdSbmTaksi.map((item) => ({
      ...convertSpecialTypesToPlain<SbmTaksiPlainObject>(item),
    }));

    revalidatePath("/data-referensi/sbm/taksi");

    return convertedData;
  } catch (error) {
    console.error("Error saving data to database:", error);
    throw error;
  }
}
