"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import parseExcel from "@/utils/parse-excel";
import parseExcelOnServer from "@/utils/parse-excel-on-server";
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

  try {
    // parse xlsx file
    const dataPeserta = await parseExcelOnServer(
      dataparsed.pesertaXlsx as File,
      {
        allowedColumns: ["A", "B", "C", "D", "E", "F", "G", "H"],
      }
    );

    console.log("dataPeserta", dataPeserta);
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
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

export default setupKegiatan;
