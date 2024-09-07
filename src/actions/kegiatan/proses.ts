"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import { JENIS_PENGAJUAN, Kegiatan } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "../response";

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

export type StatusRampungan =
  | "pengajuan"
  | "terverifikasi"
  | "revisi"
  | "ditolak"
  | "selesai";
export const updateStatusRampungan = async (
  kegiatanId: number,
  statusRampunganBaru: StatusRampungan
): Promise<ActionResponse<Kegiatan>> => {
  // TODO check permission disini untuk update status rampungan
  // allowed status: pengajuan, terverifikasi, revisi, ditolak, selesai

  let updateStatusRampungan;
  try {
    updateStatusRampungan = await dbHonorarium.kegiatan.update({
      where: {
        id: kegiatanId,
      },
      data: {
        statusRampungan: statusRampunganBaru,
      },
    });
  } catch (error) {
    console.error("Error updateStatusRampungan", error);
    return {
      success: false,
      error: "Error updateStatusRampungan",
      message: "Error updateStatusRampungan",
    };
  }

  console.log("[updateStatusRampungan]", updateStatusRampungan);
  return {
    success: true,
    data: updateStatusRampungan,
  };
};
