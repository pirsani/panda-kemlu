"use server";
import { ActionResponse } from "@/actions";
import { dbHonorarium, Prisma } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import {
  narasumberSchema,
  Narasumber as ZNarasumber,
} from "@/zod/schemas/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
import { ZodError } from "zod";

const simpanNarasumber = async (
  formData: FormData
): Promise<ActionResponse<Narasumber>> => {
  // step 1: parse the form data
  const obj = formDataToObject(formData);
  console.log("[parsedForm]", obj);

  try {
    const data = narasumberSchema.parse(obj);
    const saved = await saveDataToDatabase(data, "admin");
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

export default simpanNarasumber;
