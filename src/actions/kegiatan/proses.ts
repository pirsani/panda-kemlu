import { dbHonorarium } from "@/lib/db-honorarium";

import { JENIS_PENGAJUAN } from "@prisma-honorarium/client";

export const pengajuanGenerateRampungan = async (kegiatanId: number) => {
  const updateRiwayatProses = await dbHonorarium.riwayatProses.create({
    data: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
      keterangan: "Generate Rampungan",
      status: "pengajuan",
      createdBy: "admin",
      tglStatus: new Date(),
    },
  });
  return updateRiwayatProses;
};
