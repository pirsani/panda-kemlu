"use server";
import { ActionResponse } from "@/actions/response";
import { columns as allowedColumns } from "@/constants/excel/peserta";
import { dbHonorarium } from "@/lib/db-honorarium";
import parseExcel, { ParseExcelResult } from "@/utils/excel/parse-excel";
import parseExcelOnServer from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import kegiatanSchema, { Kegiatan as ZKegiatan } from "@/zod/schemas/kegiatan";
import { Kegiatan } from "@prisma-honorarium/client";
import { format } from "date-fns";

export const setupKegiatan = async (
  formData: FormData
): Promise<ActionResponse<Kegiatan>> => {
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

  console.log("formDataObj", formDataObj);

  formDataObj["provinsi"] = parseInt(formDataObj["provinsi"]);
  //formDataObj["tanggalMulai"] = new Date(formDataObj["tanggalMulai"]);
  //formDataObj["tanggalSelesai"] = new Date(formDataObj["tanggalSelesai"]);

  formDataObj["tanggalMulai"] = format(
    new Date(formDataObj["tanggalMulai"]),
    "yyyy-MM-dd"
  );
  formDataObj["tanggalSelesai"] = format(
    new Date(formDataObj["tanggalSelesai"]),
    "yyyy-MM-dd"
  );

  let dataparsed: ZKegiatan;
  try {
    dataparsed = kegiatanSchema.parse(formDataObj);
  } catch (error) {
    console.error("Error parsing form data:", error);
    //throw new Error("Error parsing form data");
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    }; // change to message
  }

  let kegiatanBaru: Kegiatan;
  let dataPeserta: ParseExcelResult;

  try {
    // parse xlsx file
    dataPeserta = await parseExcelOnServer(dataparsed.pesertaXlsx as File, {
      allowedColumns: allowedColumns,
    });

    // seharusnya g pernah sampe sini jika pengecekan di client sudah benar dan tidak di bypass
    // check it there is any empty column that is not allowed
    const splitEmptyValuesResult = splitEmptyValues(dataPeserta.emptyValues, [
      "Eselon",
      "ID",
      "Lainny",
    ]);

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

      return {
        success: false,
        error,
        message: "Data peserta tidak valid",
      };
    }

    // console.log("dataPeserta", dataPeserta);
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    return {
      success: false,
      error: "Error parsing xlsx file",
      message: "Data peserta tidak valid",
    };
  }

  try {
    const result = await dbHonorarium.$transaction(async (prisma) => {
      // Create the main kegiatan entry
      const kegiatanBaru = await prisma.kegiatan.create({
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

      console.log("[kegiatanBaru]", kegiatanBaru);

      // Handle the documents for surat tugas
      if (dataparsed.dokumenSuratTugas) {
        if (Array.isArray(dataparsed.dokumenSuratTugas)) {
          await Promise.all(
            dataparsed.dokumenSuratTugas.map((dokumen) => {
              if (dokumen && dokumen.name) {
                return prisma.dokumenSuratTugas.create({
                  data: {
                    nama: dokumen.name,
                    dokumen: dokumen.name,
                    kegiatanId: kegiatanBaru.id,
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
                kegiatanId: kegiatanBaru.id,
                createdBy: "admin",
              },
            });
          } else {
            // Handle the case where dokumenSuratTugas.name is undefined
          }
        }
      }

      const pesertaKegiatan = dataPeserta.rows;

      const pesertaBaru = await Promise.all(
        pesertaKegiatan.map(async (peserta) => {
          const pesertaBaru = await prisma.pesertaKegiatan.create({
            data: {
              nama: peserta["Nama"],
              NIP: peserta["NIP"],
              pangkatGolonganId: peserta["Golongan/Ruang"],
              eselon: peserta["Eselon"],
              jabatan: peserta["Jabatan"],
              kegiatanId: kegiatanBaru.id,
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

  return {
    success: true,
    data: kegiatanBaru,
  };
};

// const insertPesertaDariExcel = async (
//   kegiatanBaruId: number,
//   dataPeserta: Record<string, any>[]
// ) => {
//   // Insert peserta dari excel

//   return pesertaBaru;
// };

export default setupKegiatan;
