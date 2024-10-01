"use server";

import { dbHonorarium } from "@/lib/db-honorarium";
import { Organisasi } from "@prisma-honorarium/client";

import { Itinerary, Kegiatan, Provinsi } from "@prisma-honorarium/client";

export interface KegiatanWithSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
}

export const getKegiatan = async (
  kegiatan?: string
): Promise<KegiatanWithSatker[]> => {
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({
    include: {
      satker: true,
      unitKerja: true,
    },
  });
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
