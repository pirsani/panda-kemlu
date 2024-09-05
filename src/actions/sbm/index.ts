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

const currentYear = new Date().getFullYear().toString();

export const getSbmHonorarium = async (pmkAcuan: string = currentYear) => {
  const dataSbm = await dbHonorarium.sbmHonorarium.findMany({
    where: {
      pmkAcuanId: pmkAcuan,
    },
  });
  return dataSbm;
};

export const getOptionsSbmHonorarium = async () => {
  const dataSbm = await dbHonorarium.sbmHonorarium.findMany({});
  // map dataSbm to options
  const optionsSbm: OptionSbm[] = dataSbm.map((sbm) => ({
    value: sbm.id,
    label: sbm.jenis + " " + sbm.uraian,
    besaran: sbm.besaran,
    satuan: sbm.satuan,
  }));

  return optionsSbm;
};
