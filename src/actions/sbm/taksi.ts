"use server";
import { ActionResponse } from "@/actions/response";
import { SbmTaksiPlainObject } from "@/data/sbm-taksi";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { SbmTaksi as ZSbmTaksi } from "@/zod/schemas/sbm-taksi";
import { SbmTaksi } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { revalidatePath } from "next/cache";
export type { SbmTaksiPlainObject } from "@/data/sbm-taksi";

export const getSbmTaksi = async (sbmTaksi?: string) => {
  const dataSbmTaksi = await dbHonorarium.sbmTaksi.findMany({});
  return dataSbmTaksi;
};

export const simpanDataSbmTaksi = async (
  data: ZSbmTaksi
): Promise<ActionResponse<SbmTaksi>> => {
  try {
    const sbmTaksiBaru = await dbHonorarium.sbmTaksi.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/sbm/uang-representasi");
    return {
      success: true,
      data: sbmTaksiBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataSbmTaksi = async (
  data: ZSbmTaksi,
  id: string
): Promise<ActionResponse<SbmTaksiPlainObject>> => {
  try {
    const sbmTaksiBaru = await dbHonorarium.sbmTaksi.upsert({
      where: {
        id: id,
      },
      create: {
        ...data,
        createdBy: "admin",
      },
      update: {
        ...data,
        updatedBy: "admin",
      },
    });
    //const plainObject = sbmTaksiBaru as SbmTaksiPlainObject;
    const plainObject =
      convertSpecialTypesToPlain<SbmTaksiPlainObject>(sbmTaksiBaru);
    //console.log("[PLAIN OBJECT]", plainObject);
    revalidatePath("/data-referensi/sbm/taksi");
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataSbmTaksi = async (
  id: string
): Promise<ActionResponse<SbmTaksiPlainObject>> => {
  try {
    const deleted = await dbHonorarium.sbmTaksi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/taksi");
    const plainObject =
      convertSpecialTypesToPlain<SbmTaksiPlainObject>(deleted);
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        console.error("Sbm UHDalam Negeri not found");
        return {
          success: false,
          error: "Sbm UHDalam Negeri not found",
          message: "Sbm UHDalam Negeri not found",
        };
        break;

      case "P2003":
        console.error("Sbm UHDalam Negeri is being referenced by other data");
        return {
          success: false,
          error: "Sbm UHDalam Negeri is being referenced by other data",
          message: "Sbm UHDalam Negeri is being referenced by other data",
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

export const getOptionsSbmTaksi = async () => {
  const dataSbmTaksi = await dbHonorarium.sbmTaksi.findMany({
    include: {
      provinsi: true,
    },
  });
  // map dataSbmTaksi to options
  const optionsSbmTaksi = dataSbmTaksi.map((sbmTaksi) => ({
    value: sbmTaksi.id,
    label: sbmTaksi.provinsi.nama,
  }));

  return optionsSbmTaksi;
};
