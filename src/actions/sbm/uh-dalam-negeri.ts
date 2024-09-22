"use server";
import { ActionResponse } from "@/actions/response";
import { SbmUhDalamNegeriPlainObject } from "@/data/sbm-uh-dalam-negeri";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { SbmUhDalamNegeri as ZSbmUhDalamNegeri } from "@/zod/schemas/sbm-uh-dalam-negeri";
import { SbmUhDalamNegeri } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { revalidatePath } from "next/cache";
export type { SbmUhDalamNegeriPlainObject } from "@/data/sbm-uh-dalam-negeri";

export const getSbmUhDalamNegeri = async (sbmUhDalamNegeri?: string) => {
  const dataSbmUhDalamNegeri = await dbHonorarium.sbmUhDalamNegeri.findMany({});
  return dataSbmUhDalamNegeri;
};

export const simpanDataSbmUhDalamNegeri = async (
  data: ZSbmUhDalamNegeri
): Promise<ActionResponse<SbmUhDalamNegeri>> => {
  try {
    const sbmUhDalamNegeriBaru = await dbHonorarium.sbmUhDalamNegeri.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/sbm/uang-representasi");
    return {
      success: true,
      data: sbmUhDalamNegeriBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataSbmUhDalamNegeri = async (
  data: ZSbmUhDalamNegeri,
  id: string
): Promise<ActionResponse<SbmUhDalamNegeriPlainObject>> => {
  try {
    const sbmUhDalamNegeriBaru = await dbHonorarium.sbmUhDalamNegeri.upsert({
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
    //const plainObject = sbmUhDalamNegeriBaru as SbmUhDalamNegeriPlainObject;
    const plainObject =
      convertSpecialTypesToPlain<SbmUhDalamNegeriPlainObject>(
        sbmUhDalamNegeriBaru
      );
    //console.log("[PLAIN OBJECT]", plainObject);
    revalidatePath("/data-referensi/sbm/honorarium");
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

export const deleteDataSbmUhDalamNegeri = async (
  id: string
): Promise<ActionResponse<SbmUhDalamNegeriPlainObject>> => {
  try {
    const deleted = await dbHonorarium.sbmUhDalamNegeri.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/honorarium");
    const plainObject =
      convertSpecialTypesToPlain<SbmUhDalamNegeriPlainObject>(deleted);
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        console.error("Sbm Uang Representasi not found");
        return {
          success: false,
          error: "Sbm Uang Representasi not found",
          message: "Sbm Uang Representasi not found",
        };
        break;

      case "P2003":
        console.error(
          "Sbm Uang Representasi is being referenced by other data"
        );
        return {
          success: false,
          error: "Sbm Uang Representasi is being referenced by other data",
          message: "Sbm Uang Representasi is being referenced by other data",
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

export const getOptionsSbmUhDalamNegeri = async () => {
  const dataSbmUhDalamNegeri = await dbHonorarium.sbmUhDalamNegeri.findMany({
    include: {
      provinsi: true,
    },
  });
  // map dataSbmUhDalamNegeri to options
  const optionsSbmUhDalamNegeri = dataSbmUhDalamNegeri.map(
    (sbmUhDalamNegeri) => ({
      value: sbmUhDalamNegeri.id,
      label: sbmUhDalamNegeri.provinsi.nama,
    })
  );

  return optionsSbmUhDalamNegeri;
};
