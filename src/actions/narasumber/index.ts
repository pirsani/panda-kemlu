"use server";
import { ActionResponse } from "@/actions";
import { dbHonorarium, Prisma } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import saveFile from "@/utils/file-operations/save";
import {
  narasumberSchema,
  Narasumber as ZNarasumber,
} from "@/zod/schemas/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { basename, extname, join } from "path";
import { ZodError } from "zod";

export const simpanNarasumber = async (
  formData: FormData
): Promise<ActionResponse<Narasumber>> => {
  // step 1: parse the form data
  const obj = formDataToObject(formData);
  console.log("[parsedForm]", obj);

  try {
    const data = narasumberSchema.parse(obj);

    const file = data.dokumenPeryataanRekeningBerbeda;
    let uniqueFilename: string | null = null;
    const saveto = join("dokumen-pernyataan-rekening-berbeda", data.id);
    if (file) {
      // Save the file to disk
      // Extract the file extension
      const fileExtension = extname(file.name);
      // Generate a unique filename using nanoid
      uniqueFilename = `${nanoid()}${fileExtension}`;

      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file,
        fileName: uniqueFilename,
        directory: saveto,
      });
      console.log("File saved at:", filePath);
      const savedFile = await logUploadedFile(
        file.name,
        relativePath,
        fileHash,
        fileType.mime,
        "admin"
      );
      console.log("File saved to database:", savedFile);

      // log saved file to database
    }

    const saved = await saveDataToDatabase(data, "admin");
    revalidatePath("/data-referensi/narasumber");

    return {
      success: true,
      data: saved,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation failed:", error.errors);
    } else {
      console.error("Unexpected error:", error);
    }
    const e = error as Error;
    return {
      success: false,
      error: "Error saving data to database",
      message: e.message,
    };
  }
};

export const updateNarasumber = async (
  formData: FormData,
  id: string
): Promise<ActionResponse<Narasumber>> => {
  // step 1: parse the form data
  const obj = formDataToObject(formData);
  console.log("[parsedForm]", obj);

  try {
    const data = narasumberSchema.parse(obj);

    const file = data.dokumenPeryataanRekeningBerbeda;
    let uniqueFilename: string | null = null;
    const saveto = join("dokumen-pernyataan-rekening-berbeda", data.id);
    if (file) {
      // Save the file to disk
      // Extract the file extension
      const fileExtension = extname(file.name);
      // Generate a unique filename using nanoid
      uniqueFilename = `${nanoid()}${fileExtension}`;

      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file,
        fileName: uniqueFilename,
        directory: saveto,
      });
      console.log("File saved at:", filePath);
      const savedFile = await logUploadedFile(
        file.name,
        relativePath,
        fileHash,
        fileType.mime,
        "admin"
      );
      console.log("File saved to database:", savedFile);

      // log saved file to database
    }

    const saved = await updateDataToDatabase(data, id, "admin");
    revalidatePath("/data-referensi/narasumber");
    return {
      success: true,
      data: saved,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation failed:", error.errors);
    } else {
      console.error("Unexpected error:", error);
    }
    const e = error as Error;
    return {
      success: false,
      error: "Error saving data to database",
      message: e.message,
    };
  }
};

// Function to convert FormData to a plain object
// When FormData is serialized, if there's no file or the field is empty, it's commonly set as an empty string (""), but sometimes frameworks will serialize the value as the string "undefined". This string is not the same as the undefined type in JavaScript. This function will convert the FormData object to a plain object, replacing the string "undefined" with the actual undefined type.
const formDataToObject = (formData: FormData) => {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Check if the value is the string "undefined"
    if (value === "undefined") {
      obj[key] = undefined; // Assign undefined if the value is the string "undefined"
    } else {
      obj[key] = value; // Otherwise, assign the value
    }
  });
  return obj;
};

const saveDataToDatabase = async (data: ZNarasumber, createdBy: string) => {
  const dataCreatedBy = {
    ...data,
    dokumenPeryataanRekeningBerbeda: data.dokumenPeryataanRekeningBerbeda?.name,
    createdBy,
  };
  // Save data to database
  try {
    //const result = await dbHonorarium.$transaction(async (prisma) => {
    const newNarasumber = await dbHonorarium.narasumber.create({
      data: dataCreatedBy,
    });
    // Save data to database
    return newNarasumber;
    // });
    // return result;
  } catch (error) {
    const e = error as CustomPrismaClientError;
    if (e.code === "P2002") {
      console.log("There is a unique constraint violation");
      throw new Error("Narasumber dengan NIK yang sama sudah ada");
    }
    console.error("Error saving data to database:", e);
    throw new Error(e.message);
  }
};

const updateDataToDatabase = async (
  data: ZNarasumber,
  id: string,
  updatedBy: string
) => {
  const dataUpdatedBy = {
    ...data,
    dokumenPeryataanRekeningBerbeda: data.dokumenPeryataanRekeningBerbeda?.name,
    updatedBy,
  };
  // Save data to database
  try {
    //const result = await dbHonorarium.$transaction(async (prisma) => {
    const newNarasumber = await dbHonorarium.narasumber.update({
      where: {
        id,
      },
      data: dataUpdatedBy,
    });
    // Save data to database
    return newNarasumber;
    // });
    // return result;
  } catch (error) {
    const e = error as CustomPrismaClientError;
    switch (e.code) {
      case "P2002":
        console.log("There is a unique constraint violation");
        throw new Error("Narasumber dengan NIK yang sama sudah ada");
        break;
      case "P2025":
        console.log("There is a foreign key constraint violation");
        throw new Error("Narasumber tidak ditemukan");
        break;
      default:
        break;
    }
    console.error("Error saving data to database:", e);
    throw new Error(e.message);
  }
};

const logUploadedFile = async (
  filename: string,
  filePath: string,
  fileHash: string,
  mimeType: string,
  createdBy: string
) => {
  // Save the file path to the database
  const uploadedFile = await dbHonorarium.uploadedFile.create({
    data: {
      originalFilename: filename,
      filePath,
      hash: fileHash,
      mimeType,
      createdBy,
      createdAt: new Date(),
    },
  });
  return uploadedFile;
};

export const deleteNarasumber = async (id: string) => {
  try {
    const deleted = await dbHonorarium.narasumber.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const e = error as CustomPrismaClientError;
    console.error("Error deleting narasumber:", error);
    return {
      success: false,
      error: "Error deleting narasumber",
      message: e.message,
    };
  }
};

export default simpanNarasumber;
