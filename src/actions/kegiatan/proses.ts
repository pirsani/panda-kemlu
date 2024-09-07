"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import { JENIS_PENGAJUAN } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

export const getStatusPengajuanGenerateRampungan = async (
  kegiatanId: number
) => {
  const existingRiwayatProses = await dbHonorarium.riwayatProses.findFirst({
    where: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
    },
  });

  return existingRiwayatProses;
};

export const getRiwayatProses = async (kegiatanId: number) => {
  const riwayat = await dbHonorarium.riwayatProses.findMany({
    where: {
      kegiatanId,
    },
  });

  return riwayat;
};

export const pengajuanGenerateRampungan = async (kegiatanId: number) => {
  //jika sudah ada pengajuan generate rampungan, maka update status pengajuannya dan tanggal statusnya

  const updateStatusRampungan = await dbHonorarium.kegiatan.update({
    where: {
      id: kegiatanId,
    },
    data: {
      statusRampungan: "pengajuan",
    },
  });
  console.log("[createRiwayatProses]", updateStatusRampungan);

  const createRiwayatProses = await dbHonorarium.riwayatProses.create({
    data: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
      keterangan: "Generate Rampungan",
      status: "pengajuan",
      createdBy: "admin",
      tglStatus: new Date(),
    },
  });
  console.log("[createRiwayatProses]", createRiwayatProses);
  revalidatePath("/pengajuan");
  return updateStatusRampungan;
};
