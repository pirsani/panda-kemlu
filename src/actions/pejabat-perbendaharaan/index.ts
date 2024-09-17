import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { PejabatPerbendaharaan } from "@prisma-honorarium/client";

export const deleteDataPejabatPerbendaharaan = async (
  id: string
): Promise<ActionResponse<PejabatPerbendaharaan>> => {
  return {
    success: false,
    message: "Not implemented yet",
    error: "Not implemented yet",
  };
};

export const getOptionsJenisJabatanPerbendaharaan = async () => {
  const dataJenisJabatanPerbendaharaan =
    await dbHonorarium.jenisJabatanPerbendaharaan.findMany({});
  // map dataJenisJabatanPerbendaharaan to options
  const optionsJenisJabatanPerbendaharaan = dataJenisJabatanPerbendaharaan.map(
    (jenis) => ({
      value: jenis.id,
      label: jenis.nama,
    })
  );

  return optionsJenisJabatanPerbendaharaan;
};

export const simpanPejabatPerbendaharaan = async (
  data: FormData
): Promise<ActionResponse<PejabatPerbendaharaan>> => {
  try {
    const response = await fetch("/api/pejabat-perbendaharaan", {
      method: "POST",
      body: data,
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    return {
      success: false,
      message: "Error saving pejabatPerbendaharaan",
      error: "Error saving pejabatPerbendaharaan",
    };
  }
};
