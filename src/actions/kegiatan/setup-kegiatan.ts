"use server";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import {
  emptyAllowed,
  columns as extractFromColumns,
} from "@/constants/excel/peserta";
import { dbHonorarium, Prisma } from "@/lib/db-honorarium";
import parseExcel, { ParseExcelResult } from "@/utils/excel/parse-excel";
import parseExcelOnServer from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import kegiatanSchema, {
  kegiatanSchemaWithoutFile,
  Kegiatan as ZKegiatan,
} from "@/zod/schemas/kegiatan";
import { Kegiatan } from "@prisma-honorarium/client";
import { format } from "date-fns";
import fs from "fs";
import { startsWith } from "lodash";
import path from "path";
import { Logger } from "tslog";
import { never, ZodError } from "zod";
import { getSessionPengguna } from "../pengguna";
import { getPrismaErrorResponse } from "../prisma-error-response";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const setupKegiatanWithoutFile = async (kegiatan: ZKegiatan) => {
  console.log("kegiatan", kegiatan);
  console.log("kegiatan.tanggalMulai", kegiatan.tanggalMulai.getFullYear());
  return {
    success: true,
    data: kegiatan,
  };
};

export const setupKegiatan = async (
  formData: FormData
): Promise<ActionResponse<Kegiatan>> => {
  let dataparsed: ZKegiatan;
  let dataPesertaDariExcel: ParseExcelResult;

  // get satkerId and unitKerjaId from the user
  const pengguna = await getSessionPengguna();
  logger.info("Pengguna", pengguna);
  if (!pengguna.success || !pengguna.data || !pengguna.data.id) {
    return {
      success: false,
      error: "E-UAuth-01",
      message: "User not found",
    };
  }

  if (!pengguna.data?.satkerId || !pengguna.data?.unitKerjaId) {
    return {
      success: false,
      error: "E-UORG-01",
      message: "User tidak mempunyai satkerId atau unitKerjaId",
    };
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.id;

  // step 1: parse the form data
  try {
    // parse the form data
    dataparsed = prepareDataFromClient(formData);
  } catch (error) {
    logger.info("[prepareDataFromClient]:", formData);
    if (error instanceof ZodError) {
      logger.error("[ZodError]", error.errors);
    } else {
      logger.error("Error parsing form data:", error);
    }

    return {
      success: false,
      error: "E-KEG-01",
      message: "Error parsing form data",
    };
  }

  const cuid = dataparsed.cuid; // this is the cuid of the kegiatan yang akan digunakan untuk referensi file yang telah diupload

  // step 2: parse the xlsx file
  try {
    // parse xlsx file yang berisi data peserta yang telah diupload oleh user
    // cuidFolder dan cuidFile akan digunakan untuk menyimpan file di server
    // get file from file in folder with cuid
    const pesertaXlsxCuid = dataparsed.pesertaXlsxCuid;

    // add the file extension
    const filePesertaXlsx = `${pesertaXlsxCuid}.xlsx`;
    const excelFilePath = path.join(
      BASE_PATH_UPLOAD,
      "temp",
      cuid,
      filePesertaXlsx
    );

    // check if the file exists
    logger.info("excelFilePath", filePesertaXlsx);
    if (!fs.existsSync(excelFilePath)) {
      return {
        success: false,
        error: "E-KEG-02",
        message: "File peserta tidak ditemukan",
      };
    }

    // read file as File
    const pesertaXlsx = fs.readFileSync(excelFilePath);

    dataPesertaDariExcel = await parseDataPesertaDariExcel(pesertaXlsx);
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    return {
      success: false,
      error: "Error parsing xlsx file",
      message: "Data peserta tidak valid",
    };
  }

  // step 3: save the data to the database
  // data ready to be saved
  try {
    const kegiatan = await dbHonorarium.$transaction(async (prisma) => {
      // Create the main kegiatan entry
      const kegiatanBaru = await createKegiatan(
        prisma,
        dataparsed,
        satkerId,
        unitKerjaId,
        penggunaId
      );
      // insert peserta dari excel
      const peserta = await insertPesertaDariExcel(
        prisma,
        kegiatanBaru.id,
        dataPesertaDariExcel.rows,
        penggunaId
      );
      // Handle the documents for surat tugas
      const suratTugas = await insertDokumenSuratTugas(
        prisma,
        kegiatanBaru.id,
        dataparsed,
        penggunaId
      );
      return kegiatanBaru;
    });

    // move the file to the final folder
    const year = kegiatan.tanggalMulai.getFullYear();
    const finalFolder = path.join(year.toString(), kegiatan.id);
    await moveFolderToFinalLocation(cuid, finalFolder);
    // update database uploaded file
    // Fetch the uploaded file record
    const uploadedFiles = await dbHonorarium.uploadedFile.findMany({
      where: {
        filePath: {
          contains: `temp/${cuid}`,
        },
      },
    });

    if (uploadedFiles.length > 0) {
      const year = new Date().getFullYear();

      await Promise.all(
        uploadedFiles.map(async (file) => {
          const newFilePath = file.filePath.replace(
            `temp/${cuid}`,
            `${year}/${kegiatan.id}`
          );

          // Update the filepath in the database
          await dbHonorarium.uploadedFile.update({
            where: {
              id: file.id,
            },
            data: {
              filePath: newFilePath,
            },
          });

          console.log(`Filepath updated to: ${newFilePath}`);
        })
      );
    } else {
      console.log(`No file found with filepath containing: temp/${cuid}`);
    }

    return {
      success: true,
      data: kegiatan,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
    // return {
    //   success: false,
    //   error: "Error saving kegiatan",
    //   message: "Error saving kegiatan",
    // };
  }
};

const moveFolderToFinalLocation = async (
  fromCuid: string,
  toKegiatanId: string
) => {
  // move the folder to the final location
  const tempFolder = path.join(BASE_PATH_UPLOAD, "temp", fromCuid);
  const finalFolder = path.join(BASE_PATH_UPLOAD, toKegiatanId);
  try {
    // Ensure the final folder exists
    fs.mkdirSync(finalFolder, { recursive: true });
    fs.renameSync(tempFolder, finalFolder);
  } catch (error) {
    console.error("Error moving folder:", error);
    throw new Error("Error moving folder");
  }
};

//==============================================================
//==============================================================

const prepareDataFromClient = (formData: FormData) => {
  try {
    const formDataObj: any = {};
    // Convert FormData to an object for Zod validation
    formData.forEach((value, key) => {
      if (formDataObj[key]) {
        if (Array.isArray(formDataObj[key])) {
          formDataObj[key].push(value);
        } else {
          formDataObj[key] = [formDataObj[key], value];
        }
      } else {
        formDataObj[key] = value;
      }
    });

    // reformat the provinsi dan tanggal karen ketika dikirim dari client berbentuk string
    // formDataObj["provinsi"] = parseInt(formDataObj["provinsi"]);
    formDataObj["tanggalMulai"] = format(
      new Date(formDataObj["tanggalMulai"]),
      "yyyy-MM-dd"
    );
    formDataObj["tanggalSelesai"] = format(
      new Date(formDataObj["tanggalSelesai"]),
      "yyyy-MM-dd"
    );

    // karena file sudah diupload, maka kita hanya perlu mengambil nama file saja
    const dataparsed = kegiatanSchemaWithoutFile.parse(formDataObj);
    return dataparsed;
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("[ZodErrors]", error.errors);
      error.errors.forEach((err) => {
        logger.error("[ZodError]", err.message, "at path", err.path);
      });
    }
    throw error;
  }
};

async function parseDataPesertaDariExcel(pesertaXlsx: Buffer) {
  try {
    const dataPesertaDariExcel = await parseExcelOnServer(pesertaXlsx, {
      extractFromColumns: extractFromColumns,
    });

    // seharusnya g pernah sampe sini jika pengecekan di client sudah benar dan tidak di bypass
    // check it there is any empty column that is not allowed
    const splitEmptyValuesResult = splitEmptyValues(
      dataPesertaDariExcel.emptyValues,
      emptyAllowed
    );

    const { allowEmpty, shouldNotEmpty } = splitEmptyValuesResult;
    console.log("allowEmpty", allowEmpty);
    console.log("shouldNotEmpty", shouldNotEmpty);

    if (Object.keys(shouldNotEmpty).length > 0) {
      let error = "";
      // iterate over the rows with empty columns that are not allowed
      for (const [rowIndex, columns] of Object.entries(shouldNotEmpty)) {
        const rowNum = Number(rowIndex);
        console.log("Row", rowNum, "has empty columns:", columns);
        error += `Baris ${rowNum} memiliki kolom kosong: ${columns.join(
          ", "
        )}\n`;
      }
      throw new Error(error);
    }
    return dataPesertaDariExcel;
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    throw new Error("Error parsing xlsx file");
  }
}

async function createKegiatan(
  prisma: Prisma.TransactionClient,
  dataparsed: ZKegiatan,
  satkerId: string,
  unitKerjaId: string,
  penggunaId: string
) {
  return prisma.kegiatan.create({
    data: {
      id: dataparsed.cuid,
      status: "setup-kegiatan",
      nama: dataparsed.nama,
      tanggalMulai: dataparsed.tanggalMulai,
      tanggalSelesai: dataparsed.tanggalSelesai,
      lokasi: dataparsed.lokasi,
      dokumenNodinMemoSk: dataparsed.dokumenNodinMemoSkCuid,
      dokumenJadwal: dataparsed.dokumenJadwalCuid,
      satkerId: satkerId,
      unitKerjaId: unitKerjaId,
      createdBy: penggunaId,
      provinsiId: dataparsed.provinsi,
    },
  });
}

async function insertPesertaDariExcel(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: string,
  pesertaKegiatan: Record<string, any>[],
  penggunaId: string
) {
  const pesertaBaru = await Promise.all(
    pesertaKegiatan.map(async (peserta) => {
      // checks againts zod schema harusnya dilakukan disisi client saja
      // anggap saja ini adalah data yang valid

      const pesertaBaru = await prisma.pesertaKegiatan.create({
        data: {
          nama: peserta["Nama"],
          NIP: peserta["NIP"].toString(),
          NIK: peserta["NIK"].toString().trim(),
          NPWP: peserta["NPWP"].toString().trim(),
          pangkatGolonganId: peserta["Golongan/Ruang"]
            .toString()
            .trim()
            .toUpperCase(),
          eselon: peserta["Eselon"],
          jabatan: peserta["Jabatan"],
          kegiatanId: kegiatanBaruId,
          bank: peserta["Bank"],
          nomorRekening: peserta["Nomor Rekening"],
          namaRekening: peserta["Nama Rekening"],
          createdBy: penggunaId,
          jumlahHari: 0, // Default to 0 HARDCODED
        },
      });
      return pesertaBaru;
    })
  );
}

async function insertDokumenSuratTugas(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: string,
  dataparsed: ZKegiatan,
  penggunaId: string
) {
  console.log(
    "dataparsed.dokumenSuratTugasCuid",
    dataparsed.dokumenSuratTugasCuid
  );
  if (dataparsed.dokumenSuratTugasCuid) {
    if (typeof dataparsed.dokumenSuratTugasCuid === "string") {
      try {
        dataparsed.dokumenSuratTugasCuid = JSON.parse(
          dataparsed.dokumenSuratTugasCuid
        );
      } catch (error) {
        console.error("Failed to parse dokumenSuratTugasCuid as JSON:", error);
      }
    }

    if (Array.isArray(dataparsed.dokumenSuratTugasCuid)) {
      console.log("dataparsed.dokumenSuratTugasCuid is an array");
      await Promise.all(
        dataparsed.dokumenSuratTugasCuid.map((dokumen) => {
          if (dokumen) {
            return prisma.dokumenSuratTugas.create({
              data: {
                nama: dokumen,
                dokumen: dokumen,
                kegiatanId: kegiatanBaruId,
                createdBy: penggunaId,
              },
            });
          } else {
            // Handle the case where dokumen.name is undefined
            return Promise.resolve();
          }
        })
      );
    } else {
      console.log("dataparsed.dokumenSuratTugasCuid is not an array");
      if (dataparsed.dokumenSuratTugasCuid) {
        await prisma.dokumenSuratTugas.create({
          data: {
            nama: dataparsed.dokumenSuratTugasCuid,
            dokumen: dataparsed.dokumenSuratTugasCuid,
            kegiatanId: kegiatanBaruId,
            createdBy: penggunaId,
          },
        });
      } else {
        // Handle the case where dokumenSuratTugas.name is undefined
        console.error(
          "[SHOULD NEVER BE HERE] dokumenSuratTugas.name is undefined"
        );
      }
    }
  }
}

export default setupKegiatan;
