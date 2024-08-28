"use server";

import { dbHonorarium } from "@/lib/db-honorarium";

export const getNegara = async (negara?: string) => {
  const dataNegara = await dbHonorarium.negara.findMany({});
  return dataNegara;
};

export const getOptionsNegara = async () => {
  const dataNegara = await dbHonorarium.negara.findMany({});
  // map dataNegara to options
  const optionsNegara = dataNegara.map((negara) => ({
    value: negara.id,
    label: negara.nama,
  }));

  return optionsNegara;
};

export const getProvinsi = async (provinsi?: string) => {
  const dataProvinsi = await dbHonorarium.provinsi.findMany({});
  return dataProvinsi;
};

export const getOptionsProvinsi = async () => {
  const dataProvinsi = await dbHonorarium.provinsi.findMany({});
  // map dataProvinsi to options
  const optionsProvinsi = dataProvinsi.map((provinsi) => ({
    value: provinsi.id,
    label: provinsi.nama,
  }));

  return optionsProvinsi;
};
