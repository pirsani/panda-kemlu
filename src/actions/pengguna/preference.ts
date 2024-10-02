"use server";
import { auth } from "@/auth";
import { dbHonorarium } from "@/lib/db-honorarium";

export const setTahunAnggaran = async (tahunAnggaran: number) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const data = await dbHonorarium.userPreference.upsert({
    where: {
      id: userId || "falback-id",
    },
    create: {
      id: userId,
      tahunAnggaran,
    },
    update: {
      tahunAnggaran,
    },
  });
  return tahunAnggaran;
};

export const getTahunAnggaran = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const data = await dbHonorarium.userPreference.findUnique({
    where: {
      id: userId || "falback-id",
    },
  });

  // if not found, set the default year
  if (!data) {
    return await setTahunAnggaran(new Date().getFullYear());
  }
  return data.tahunAnggaran;
};

export default setTahunAnggaran;
