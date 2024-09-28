"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Role as ZRole } from "@/zod/schemas/role";
import { Role } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export interface roleWithPermissions extends Role {}
export const getRoles = async (role?: string) => {
  const dataRole = await dbHonorarium.role.findMany({});
  return dataRole;
};

// hanya akan memberi flag isRole pada unit kerja yang dipilih

export const deleteRole = async (id: string): Promise<ActionResponse<Role>> => {
  try {
    const deleted = await dbHonorarium.role.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/data-referensi/role");
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

export const getOptionsRole = async () => {
  const dataRole = await dbHonorarium.role.findMany({});
  // map dataRole to options
  const optionsRole = dataRole.map((role) => {
    const label = role.name;
    return {
      label: label,
      value: role.id,
    };
  });

  return optionsRole;
};

export const simpanDataRole = async (
  data: ZRole
): Promise<ActionResponse<Role>> => {
  try {
    const roleBaru = await dbHonorarium.role.upsert({
      where: {
        id: data.id,
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
    revalidatePath("/data-referensi/role");
    return {
      success: true,
      data: roleBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};
