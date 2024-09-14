"use server";
import { ActionResponse } from "@/actions/response";
import { columns as extractFromColumns } from "@/constants/excel/peserta";
import { dbHonorarium, Prisma } from "@/lib/db-honorarium";
import parseExcel, { ParseExcelResult } from "@/utils/excel/parse-excel";
import parseExcelOnServer from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import kegiatanSchema, { Kegiatan as ZKegiatan } from "@/zod/schemas/kegiatan";
import { Kegiatan } from "@prisma-honorarium/client";
import { format } from "date-fns";
import { never } from "zod";

export const setupKegiatan = async (
  formData: FormData
): Promise<ActionResponse<Kegiatan>> => {
  let dataparsed: ZKegiatan;
  let dataPesertaDariExcel: ParseExcelResult;

  // step 1: parse the form data
  try {
    // parse the form data
    dataparsed = prepareDataFromClient(formData);
  } catch (error) {
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    };
  }

  // step 2: parse the xlsx file
  try {
    // parse xlsx file
    dataPesertaDariExcel = await parseDataPesertaDariExcel(dataparsed);
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
      const kegiatanBaru = await createKegiatan(prisma, dataparsed);
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
    console.error("Error saving kegiatan:", error);
    return {
      success: false,
      error: "Error saving kegiatan",
      message: "Error saving kegiatan",
    };
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
    formDataObj["provinsi"] = parseInt(formDataObj["provinsi"]);
    formDataObj["tanggalMulai"] = format(
      new Date(formDataObj["tanggalMulai"]),
      "yyyy-MM-dd"
    );
    formDataObj["tanggalSelesai"] = format(
      new Date(formDataObj["tanggalSelesai"]),
      "yyyy-MM-dd"
    );

    const dataparsed = kegiatanSchema.parse(formDataObj);
    return dataparsed;
  } catch (error) {
    console.error("Error parsing form data:", error);
    throw new Error("Error parsing form data");
  }
};

async function parseDataPesertaDariExcel(dataparsed: ZKegiatan) {
  try {
    const dataPesertaDariExcel = await parseExcelOnServer(
      dataparsed.pesertaXlsx as File,
      {
        extractFromColumns: extractFromColumns,
      }
    );

    // seharusnya g pernah sampe sini jika pengecekan di client sudah benar dan tidak di bypass
    // check it there is any empty column that is not allowed
    const splitEmptyValuesResult = splitEmptyValues(
      dataPesertaDariExcel.emptyValues,
      ["Eselon", "ID", "Lainny"]
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
  dataparsed: ZKegiatan
) {
  return prisma.kegiatan.create({
    data: {
      status: "setup-kegiatan",
      nama: dataparsed.nama,
      tanggalMulai: dataparsed.tanggalMulai,
      tanggalSelesai: dataparsed.tanggalSelesai,
      lokasi: dataparsed.lokasi,
      dokumenNodinMemoSk: dataparsed.dokumenNodinMemoSk?.name!,
      dokumenJadwal: dataparsed.dokumenJadwal?.name!,
      createdBy: "admin",
      provinsiId: dataparsed.provinsi,
    },
  });
}

async function insertPesertaDariExcel(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: number,
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
  kegiatanBaruId: number,
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

export default setupKegiatan;
