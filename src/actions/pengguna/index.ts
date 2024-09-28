"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { penggunaSchema, Pengguna as ZPengguna } from "@/zod/schemas/pengguna";
import { User as Pengguna } from "@prisma-honorarium/client";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export interface PenggunaWithRoles extends Omit<Pengguna, "password"> {}
export const getPengguna = async (pengguna?: string) => {
  const dataPengguna = await dbHonorarium.user.findMany({});
  return dataPengguna as PenggunaWithRoles[];
};

// hanya akan memberi flag isPengguna pada unit kerja yang dipilih

export const deletePengguna = async (
  id: string
): Promise<ActionResponse<Pengguna>> => {
  try {
    const deleted = await dbHonorarium.user.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/data-referensi/pengguna");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const getOptionsPengguna = async () => {
  const dataPengguna = await dbHonorarium.user.findMany({});
  // map dataPengguna to options
  const optionsPengguna = dataPengguna.map((pengguna) => {
    const label = pengguna.name;
    return {
      label: label,
      value: pengguna.id,
    };
  });

  return optionsPengguna;
};

export const simpanDataPengguna = async (
  data: ZPengguna
): Promise<ActionResponse<Pengguna>> => {
  console.log("sebelum", data);
  try {
    const parsed = penggunaSchema.parse(data);

    // omit rePassword from the data
    delete parsed.rePassword;

    // hash the password
    if (parsed.password) {
      // bcrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(parsed.password, salt);
      parsed.password = hashedPassword;
    } else {
      delete parsed.password;
    }

    console.log("parsed", parsed);
    const penggunaUpsert = await dbHonorarium.user.upsert({
      where: {
        id: parsed.id || "falback-id",
      },
      create: {
        ...parsed,
        createdBy: "admin",
      },
      update: {
        ...parsed,
        updatedBy: "admin",
      },
    });
    console.log("sesudah", penggunaUpsert);
    revalidatePath("/data-referensi/pengguna");
    return {
      success: true,
      data: penggunaUpsert,
    };
  } catch (error) {
    console.error("Error parsing form data", error);
    if (error instanceof ZodError) {
      console.error("[ZodError]", error.errors);
    } else {
      const customError = error as CustomPrismaClientError;
      if (customError.code === "P2002") {
        return {
          success: false,
          error: customError.code,
          message: "Pengguna yang sama sudah ada",
        };
      }
      console.error("[customError]", customError.code, customError.message);
    }
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    };
  }
};
