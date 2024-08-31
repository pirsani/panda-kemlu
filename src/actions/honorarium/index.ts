"use server";

import { dbHonorarium } from "@/lib/db-honorarium";

export const getKelas = async (kelas?: string) => {
  const dataKelas = await dbHonorarium.kelas.findMany({});
  return dataKelas;
};

export const getOptionsKelas = async () => {
  const dataKelas = await dbHonorarium.kelas.findMany({});
  // map dataKelas to options
  const optionsKelas = dataKelas.map((kelas) => ({
    value: kelas.id,
    label: kelas.kode + "-" + kelas.nama,
  }));

  return optionsKelas;
};

export const getMateri = async (materi?: string) => {
  const dataMateri = await dbHonorarium.materi.findMany({});
  return dataMateri;
};

export const getOptionsMateri = async () => {
  const dataMateri = await dbHonorarium.materi.findMany({});
  // map dataMateri to options
  const optionsMateri = dataMateri.map((materi) => ({
    value: materi.id,
    label: materi.kode + "-" + materi.nama,
  }));

  return optionsMateri;
};
