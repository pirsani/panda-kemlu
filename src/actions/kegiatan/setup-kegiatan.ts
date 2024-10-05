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
import path from "path";
import { Logger } from "tslog";
import { never, ZodError } from "zod";
import { getSessionPengguna } from "../pengguna";
import { getPrismaErrorResponse } from "../prisma-error-response";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const setupKegiatan = async (
  formData: FormData
): Promise<ActionResponse<Kegiatan>> => {
  let dataparsed: ZKegiatan;
  let dataPesertaDariExcel: ParseExcelResult;

  // get satkerId and unitKerjaId from the user
  const pengguna = await getSessionPengguna();
  logger.info("Pengguna", pengguna);
  if (!pengguna.success) {
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
    const result = await dbHonorarium.$transaction(async (prisma) => {
      // Create the main kegiatan entry
      const kegiatanBaru = await createKegiatan(
        prisma,
        dataparsed,
        satkerId,
        unitKerjaId
      );
      // insert peserta dari excel
      const peserta = await insertPesertaDariExcel(
        prisma,
        kegiatanBaru.id,
        dataPesertaDariExcel.rows
      );
      // Handle the documents for surat tugas
      const suratTugas = await insertDokumenSuratTugas(
        prisma,
        kegiatanBaru.id,
        dataparsed
      );
      return kegiatanBaru;
    });
    return {
      success: true,
      data: result,
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
  unitKerjaId: string
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
      createdBy: "admin",
      provinsiId: dataparsed.provinsi,
    },
  });
}

async function insertPesertaDariExcel(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: string,
  pesertaKegiatan: Record<string, any>[]
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
          createdBy: "admin",
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
  dataparsed: ZKegiatan
) {
  if (dataparsed.dokumenSuratTugas) {
    if (Array.isArray(dataparsed.dokumenSuratTugas)) {
      await Promise.all(
        dataparsed.dokumenSuratTugas.map((dokumen) => {
          if (dokumen && dokumen.name) {
            return prisma.dokumenSuratTugas.create({
              data: {
                nama: dokumen.name,
                dokumen: dokumen.name,
                kegiatanId: kegiatanBaruId,
                createdBy: "admin",
              },
            });
          } else {
            // Handle the case where dokumen.name is undefined
            return Promise.resolve();
          }
        })
      );
    } else {
      if (dataparsed.dokumenSuratTugas.name) {
        await prisma.dokumenSuratTugas.create({
          data: {
            nama: dataparsed.dokumenSuratTugas.name,
            dokumen: dataparsed.dokumenSuratTugas.name,
            kegiatanId: kegiatanBaruId,
            createdBy: "admin",
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

const saveDokumenSetupKegiatan = async (
  nodin: File,
  jadwal: File,
  surtug: File[]
) => {
  // Save the file to disk
};

export default setupKegiatan;
