"use server";

import { dbHonorarium } from "@/lib/db-honorarium";

export const getKegiatan = async (kegiatan?: string) => {
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({});
  return dataKegiatan;
};

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
    label: kegiatan.status + "-" + kegiatan.nama,
  }));

  return optionsKegiatan;
};
