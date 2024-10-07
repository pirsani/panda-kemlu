"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import saveFile from "@/utils/file-operations/save";
import {
  DokumenUhLuarNegeriWithoutFile,
  DokumenUhLuarNegeriWithoutFileSchema,
} from "@/zod/schemas/dokumen-uh-luar-negeri";
import { Kegiatan } from "@prisma-honorarium/client";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";

// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

// upload file to temp folder
// update kegiatan status
// move file to permanent folder
export const ajukanUhLuarNegeri = async (
  dokumenUhLuarNegeri: DokumenUhLuarNegeriWithoutFile
): Promise<ActionResponse<Kegiatan | null>> => {
  // parse again zod schema

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  let dataparsed;
  interface LogUploadedFile {
    dokumen: string;
    kegiatanId: string;
    jenisDokumenId: string;
    filePath: string;
  }
  const logUploadedFile: LogUploadedFile[] = [];

  // try to move file to final folder
  try {
    dataparsed =
      DokumenUhLuarNegeriWithoutFileSchema.parse(dokumenUhLuarNegeri);
    // console.log("dataparsed", dataparsed);

    const kegiatanId = dataparsed.kegiatanId;

    const kegiatan = await dbHonorarium.kegiatan.findUnique({
      where: { id: kegiatanId },
    });

    if (!kegiatan) {
      return {
        success: false,
        error: "Kegiatan tidak ditemukan",
        message: "Kegiatan tidak ditemukan",
      };
    }

    const kegiatanYear = new Date(kegiatan?.tanggalMulai)
      .getFullYear()
      .toString();
    // Type assertion to make TypeScript treat the property as optional
    delete (dataparsed as { kegiatanId?: string }).kegiatanId;
    // Check if file is uploaded by iterating over the entries and then move to final folder
    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      kegiatanYear,
      kegiatanId,
      "uh-luar-negeri"
    );

    const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", kegiatanId);

    // this will not wait for the async operation to finish
    Object.entries(dataparsed).forEach(async ([key, value]) => {
      const jenisDokumen = getJenisDokumenFromKey(
        key as keyof typeof mapsCuidToJenisDokumen
      );
      console.log(key, value);
    });

    // we dont use  Object.entries(dataparsed).forEach(async ([key, value])
    // because it will not wait for the async operation to finish
    for (const [key, value] of Object.entries(dataparsed)) {
      await (async () => {
        const jenisDokumen = getJenisDokumenFromKey(
          key as keyof typeof mapsCuidToJenisDokumen
        );
        if (!jenisDokumen) {
          logger.error(value, "Jenis dokumen tidak ditemukan, skip file");
          return;
        }

        logger.info(key, value);
        logger.info("jenisDokumen", jenisDokumen);
        const finalPathFile = path.posix.join(finalPath, value);
        const tempPathFile = path.posix.join(tempPath, value);
        const resolvedPathFile = path.resolve(finalPathFile);
        const resolvedTempPathFile = path.resolve(tempPathFile);
        // check if temp file exists
        const fileExists = await fse.pathExists(resolvedTempPathFile);
        if (!fileExists) {
          logger.error(
            "File not found in temp folder, skipping moving file to final folder"
          );
          return;
        }

        logger.info("File exists in temp folder, moving to final folder");
        //await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);
        logger.info("collecting log file to be updated in database");
        logUploadedFile.push({
          dokumen: value,
          kegiatanId: kegiatanId,
          jenisDokumenId: jenisDokumen,
          filePath: path.posix.relative(BASE_PATH_UPLOAD, finalPathFile),
        });
      })();
    }
  } catch (error) {
    console.error("Error moving file:", error);
    //throw new Error("Error parsing form data");
    return {
      success: false,
      error: "Error Moving File",
      message: "Error Moving File",
    }; // change to message
  }

  // update database entries
  console.log("logUploadedFile", logUploadedFile);
  logger.info("update database entries...");

  // Use a for...of loop instead of forEach, which will handle async/await correctly by waiting for each promise to resolve before proceeding to the next iteration.
  try {
    const updateKegiatan = await dbHonorarium.$transaction(async (prisma) => {
      for (const log of logUploadedFile) {
        const { dokumen, kegiatanId, jenisDokumenId, filePath } = log;

        // select from uploadedFile
        const uploadedFile = await prisma.uploadedFile.findUnique({
          where: { id: dokumen },
        });

        // insert into dokumenKegiatan
        if (!uploadedFile) {
          logger.error(
            dokumen,
            "Log file tidak ditemukan di tabel uploaded_file, skip file"
          );
          continue; // Skip to the next log if file is not found
        }

        await prisma.dokumenKegiatan.create({
          data: {
            dokumen: uploadedFile.id,
            kegiatanId,
            nama: uploadedFile.originalFilename,
            jenisDokumenId,
            filePath,
            createdBy: pengguna.data.penggunaId,
          },
        });
      }
    });
  } catch (error) {
    logger.error("Error updating database entries", error);
    return getPrismaErrorResponse(error as Error);
  }

  return {
    success: true,
    data: null,
  };
};

const mapsCuidToJenisDokumen = {
  dokumenSuratTugasCuid: "surat-tugas",
  dokumenNodinMemoSkCuid: "nodin-memo-sk",
  dokumenSuratSetnegSptjmCuid: "surat-setneg-sptjm",
  laporanKegiatanCuid: "laporan-kegiatan",
  daftarHadirCuid: "dafar-hadir",
  dokumentasiKegiatanCuid: "dokumentasi-kegiatan",
  rampunganTerstempelCuid: "rampungan-terstempel",
  suratPersetujuanJaldisSetnegCuid: "surat-persetujuan-jaldis-setneg",
  pasporCuid: "paspor",
  tiketBoardingPassCuid: "tiket-boarding-pass",
};

function getJenisDokumenFromKey(
  key: keyof typeof mapsCuidToJenisDokumen
): string | undefined {
  return mapsCuidToJenisDokumen[key];
}

async function moveFileToFinalFolder(
  tempPath: string,
  finalPath: string
): Promise<void> {
  // Ensure the final folder exists
  await fse.ensureDir(finalPath);
  // Move the file inside temp folder to final folder
  await fse.move(tempPath, finalPath, {
    overwrite: true,
  });
}

async function copyRecordToDokumenKegiatan(
  key: string,
  value: string,
  kegiatanId: string,
  finalPath: string
): Promise<void> {
  const jenisDokumen = getJenisDokumenFromKey(
    key as keyof typeof mapsCuidToJenisDokumen
  );

  if (!jenisDokumen) {
    logger.error(value, "Jenis dokumen tidak ditemukan, skip file");
    return;
  }

  const uploadedFile = await dbHonorarium.uploadedFile.findUnique({
    where: {
      id: value,
    },
  });

  if (!uploadedFile) {
    logger.error(
      value,
      "Log file tidak ditemukan di tabel uploaded_file, skip file"
    );
    return;
  }

  logger.info("copy record di tabel uploaded_file to dokumen_kegiatan");

  // update database entries
  // const updatedUploadedFile = await dbHonorarium.uploadedFile.update({
  //   where: {
  //     id: kegiatanId,
  //   },
  //   data: {
  //     [key]: value,
  //   },
  // });
}

// const laporanKegiatan = getValueFromKey("laporanKegiatanCuid"); // Output: "laporan-kegiatan"

export default ajukanUhLuarNegeri;
