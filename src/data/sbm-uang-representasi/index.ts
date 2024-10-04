import { dbHonorarium } from "@/lib/db-honorarium";
import {
  Provinsi,
  SbmTaksi,
  SbmUangRepresentasi,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export interface sbmUangRepresentasiWithPejabat extends SbmUangRepresentasi {
  pejabat: {
    id: number;
    nama: string;
  };
}
export const getSbmUangRepresentasi = async (tahunAnggaran?: number) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const dataSbmUangRepresentasi =
    await dbHonorarium.sbmUangRepresentasi.findMany({
      where: {
        tahun: tahun,
      },
      include: {
        pejabat: true,
      },
    });
  return dataSbmUangRepresentasi;
};
