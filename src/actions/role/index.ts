"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Role as ZRole } from "@/zod/schemas/role";
import { Role } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export interface RoleWithPermissions extends Role {
  rolePermission: RolePermission[];
}
export const getRoles = async (role?: string) => {
  const dataRole = await dbHonorarium.role.findMany({
    include: {
      rolePermission: true,
    },
  });
  console.log("dataRole", dataRole);
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

interface RolePermission {
  permissionId: string;
  roleId?: string;
}
export const simpanDataRole = async (
  data: ZRole
): Promise<ActionResponse<Role>> => {
  try {
    const { permissions, ...roleWithoutPermission } = data;
    // create array permission object
    const objPermissions: RolePermission[] = (permissions ?? []).map(
      (p: string) => {
        const px: RolePermission = {
          permissionId: p,
        };
        return px;
      }
    );
    let permissionsToRemove: RolePermission[] = [];
    let permissionsToAdd: RolePermission[] = [];
    if (data.id) {
      // Fetch existing permissions
      const existingPermissions = await dbHonorarium.rolePermission.findMany({
        where: {
          roleId: data.id,
        },
      });
      // Determine permissions to add and remove
      const existingPermissionIds = new Set(
        existingPermissions.map((p) => p.roleId)
      );
      const newPermissionIds = new Set(
        objPermissions.map((p) => p.permissionId)
      );

      permissionsToAdd = objPermissions.filter(
        (p) => !existingPermissionIds.has(p.permissionId)
      );
      permissionsToRemove = existingPermissions.filter(
        (p) => !newPermissionIds.has(p.roleId)
      );
    }

    const roleBaru = await dbHonorarium.role.upsert({
      where: {
        id: data.id || "it-should-never-be-this",
      },
      create: {
        ...roleWithoutPermission,
        createdBy: "admin",
        rolePermission: {
          createMany: {
            data: objPermissions,
          },
        },
      },
      update: {
        ...roleWithoutPermission,
        updatedBy: "admin",
        rolePermission: {
          deleteMany: {
            permissionId: {
              in: permissionsToRemove.map((p) => p.permissionId),
            },
          },
          createMany: {
            data: permissionsToAdd,
          },
        },
      },
    });
    revalidatePath("/data-referensi/role");
    return {
      success: true,
      data: roleBaru,
    };
  } catch (error) {
    console.error("Error saving role:", error);
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};
