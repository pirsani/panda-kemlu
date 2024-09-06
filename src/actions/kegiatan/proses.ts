"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import { JENIS_PENGAJUAN } from "@prisma-honorarium/client";

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

  const existingRiwayatProses = await dbHonorarium.riwayatProses.findFirst({
    where: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
    },
  });

  if (existingRiwayatProses) {
    const updateRiwayatProses = await dbHonorarium.riwayatProses.update({
      where: {
        id: existingRiwayatProses.id,
      },
      data: {
        status: "pengajuan",
        tglStatus: new Date(),
      },
    });
    console.log("[updateRiwayatProses]", updateRiwayatProses);
    return updateRiwayatProses;
  }

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
  return createRiwayatProses;
};
