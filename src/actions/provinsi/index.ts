"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Provinsi as ZProvinsi } from "@/zod/schemas/provinsi";
import { Provinsi } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

export const getProvinsi = async (provinsi?: string) => {
  const dataProvinsi = await dbHonorarium.provinsi.findMany({});
  return dataProvinsi;
};

export const simpanDataProvinsi = async (
  data: ZProvinsi
): Promise<ActionResponse<Provinsi>> => {
  try {
    const provinsiBaru = await dbHonorarium.provinsi.create({
      data: {
        ...data,
        id: data.kode,
        createdBy: "admin",
      },
    });
    console.log(provinsiBaru);
    revalidatePath("/data-referensi/provinsi");
    return {
      success: true,
      data: provinsiBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataProvinsi = async (
  data: ZProvinsi,
  id: number
): Promise<ActionResponse<Provinsi>> => {
  try {
    const provinsiUpdated = await dbHonorarium.provinsi.upsert({
      where: {
        id: id,
      },
      create: {
        ...data,
        id: id,
        createdBy: "admin",
      },
      update: {
        ...data,
        updatedBy: "admin",
      },
    });
    console.log(provinsiUpdated);
    revalidatePath("/data-referensi/provinsi");
    return {
      success: true,
      data: provinsiUpdated,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataProvinsi = async (
  id: number
): Promise<ActionResponse<Provinsi>> => {
  try {
    const deleted = await dbHonorarium.provinsi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/provinsi");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        console.error("Provinsi not found");
        return {
          success: false,
          error: "Provinsi not found",
          message: "Provinsi not found",
        };
        break;

      case "P2003":
        console.error("Provinsi is being referenced by other data");
        return {
          success: false,
          error: "Provinsi is being referenced by other data",
          message: "Provinsi is being referenced by other data",
        };
        break;

      default:
        break;
    }
    return {
      success: false,
      error: customError.code,
      message: customError.message,
    };
  }
};

export const getOptionsProvinsi = async () => {
  const dataProvinsi = await dbHonorarium.provinsi.findMany({});
  // map dataProvinsi to options
  const optionsProvinsi = dataProvinsi.map((provinsi) => ({
    value: provinsi.id,
    label: provinsi.kode + "-" + provinsi.nama,
  }));

  return optionsProvinsi;
};
