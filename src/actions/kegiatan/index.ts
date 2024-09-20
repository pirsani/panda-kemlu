"use server";

import { dbHonorarium } from "@/lib/db-honorarium";

import { Itinerary, Kegiatan, Provinsi } from "@prisma-honorarium/client";

export const getKegiatan = async (kegiatan?: string) => {
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({});
  return dataKegiatan;
};

export interface KegiatanWithDetail extends Kegiatan {
  itinerary: Itinerary[];
  provinsi: Provinsi;
}

export const getKegiatanById = async (id: number) => {
  const kegiatan = await dbHonorarium.kegiatan.findUnique({
    where: { id },
    include: {
      itinerary: true,
      provinsi: true,
    },
  });

  console.log(kegiatan);
  return kegiatan;
};

export const getOptionsKegiatan = async () => {
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({});
  // map dataKegiatan to options
  const optionsKegiatan = dataKegiatan.map((kegiatan) => ({
    value: kegiatan.id,
    // label: kegiatan.status + "-" + kegiatan.nama,
    label: kegiatan.nama,
  }));

  return optionsKegiatan;
};
