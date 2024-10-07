"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import saveFile from "@/utils/file-operations/save";
import {
  DokumenUhDalamNegeri,
  DokumenUhDalamNegeriSchema,
} from "@/zod/schemas/dokumen-uh-dalam-negeri";
import { Kegiatan } from "@prisma-honorarium/client";
import path from "path";

// upload file to temp folder
// update kegiatan status
// move file to permanent folder
export const ajukanUhDalamNegeri = async (
  formData: FormData
): Promise<ActionResponse<Kegiatan | null>> => {
  // parse again zod schema
  // Convert FormData to a plain object for Zod parsing
  const formDataObj: any = {};
  formData.forEach((value, key) => {
    formDataObj[key] = value;
  });

  let dataparsed;
  try {
    dataparsed = DokumenUhDalamNegeriSchema.parse(formDataObj);
  } catch (error) {
    console.error("Error parsing form data:", error);
    //throw new Error("Error parsing form data");
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    }; // change to message
  }

  const fileFolder = path.posix.join(dataparsed.kegiatanId, "uh-dalam-negeri");

  try {
    // save file to temp folder
    if (dataparsed.laporanKegiatan) {
      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file: dataparsed.laporanKegiatan,
        fileName: "laporan-kegiatan.pdf",
        directory: fileFolder,
      });
    }
    if (dataparsed.daftarHadir) {
      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file: dataparsed.daftarHadir,
        fileName: "daftar-hadir.pdf",
        directory: fileFolder,
      });
    }
    if (dataparsed.dokumentasi) {
      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file: dataparsed.dokumentasi,
        fileName: "dokumentasi.pdf",
        directory: fileFolder,
      });
    }
    if (dataparsed.rampungan) {
      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file: dataparsed.rampungan,
        fileName: "rampungan.pdf",
        directory: fileFolder,
      });
    }
    console.log("Files saved successfully");
  } catch (error) {
    console.error("Error saving files:", error);
    throw new Error("Error saving files");
  }

  // do something with the data
  const updateKegiatan = await dbHonorarium.kegiatan.update({
    where: { id: dataparsed.kegiatanId },
    data: {
      status: "pengajuan",
      statusUhDalamNegeri: "pengajuan",
    },
  });

  return {
    success: true,
    data: updateKegiatan,
  };
};

export default ajukanUhDalamNegeri;
