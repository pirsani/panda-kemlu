"use server";

import { dbHonorarium } from "@/lib/db-honorarium";
import Decimal from "decimal.js";

export interface OptionSbm {
  value: number;
  label: string;
  besaran?: Decimal;
  satuan?: string;
}

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

const currentYear = new Date().getFullYear();

export const getSbmHonorarium = async (tahun: number = currentYear) => {
  const dataSbm = await dbHonorarium.sbmHonorarium.findMany({
    where: {
      tahun,
    },
  });
  return dataSbm;
};

//FIX Warning: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
//  {value: 30, label: ..., besaran: Decimal, satuan: ...}
// convert Decimal to plain number
// and then return converted data
// on client side, convert it back to Decimal
export const getOptionsSbmHonorarium = async () => {
  const dataSbm = await dbHonorarium.sbmHonorarium.findMany({});
  // map dataSbm to options
  const optionsSbm: OptionSbm[] = dataSbm.map((sbm) => ({
    value: sbm.id,
    label: sbm.jenis + " " + sbm.uraian,
    besaran: sbm.besaran,
    satuan: sbm.satuan,
  }));

  const convertedData = optionsSbm.map((item) => ({
    ...item,
    besaran: item.besaran?.toNumber(), // Convert Decimal to plain number
  }));

  return convertedData;
};
