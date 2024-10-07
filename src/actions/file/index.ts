import { dbHonorarium } from "@/lib/db-honorarium";
import saveFile from "@/utils/file-operations/save";
import { createId } from "@paralleldrive/cuid2";
import fse from "fs-extra";
import path, { extname } from "path";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

// const SaveAndLogUploadedFile = async (
//   file: File | undefined | null,
//   directory: string,
//   savedBy: string
// ) => {
//   if (!file) {
//     return false;
//   }

//   try {
//     const fileExtension = extname(file.name);
//     // Generate a unique filename using nanoid
//     const uniqueFilename = `${createId}${fileExtension}`;

//     const { filePath, relativePath, fileHash, fileType } = await saveFile({
//       file,
//       fileName: uniqueFilename,
//       directory,
//     });

//     const savedFile = await logUploadedFile(
//       uniqueFilename,
//       file.name,
//       relativePath,
//       fileHash,
//       fileType.mime,
//       savedBy
//     );

//     return { filePath, relativePath, fileHash, fileType };
//   } catch (error) {
//     logger.error("[Error saving file]", error);
//     return false;
//   }
//   // Save the file to disk
// };

export const logUploadedFile = async (
  id: string,
  filename: string,
  filePath: string,
  fileHash: string,
  mimeType: string,
  createdBy: string
) => {
  // Save the file path to the database
  const uploadedFile = await dbHonorarium.uploadedFile.upsert({
    where: { id },
    create: {
      id,
      originalFilename: filename,
      filePath,
      hash: fileHash,
      mimeType,
      createdBy,
      createdAt: new Date(),
    },
    update: {
      originalFilename: filename,
      filePath,
      hash: fileHash,
      mimeType,
      createdBy,
      createdAt: new Date(),
    },
  });
  return uploadedFile;
};

export async function moveFileToFinalFolder(
  tempPath: string,
  finalPath: string
): Promise<void> {
  // Ensure the final folder exists
  // Ensure the final folder exists
  const finalDir = path.dirname(finalPath);
  logger.info("finalDir", finalDir);
  logger.info("finalPath", finalPath);

  await fse.ensureDir(finalDir);
  // Check if the destination path is a directory
  const isDirectory =
    (await fse.pathExists(finalPath)) &&
    (await fse.stat(finalPath)).isDirectory();

  if (isDirectory) {
    throw new Error(`Cannot overwrite directory '${finalPath}' with a file`);
  }

  // Move the file inside temp folder to final folder
  await fse.move(tempPath, finalPath, {
    overwrite: true,
  });
}

export interface LogUploadedFile {
  dokumen: string;
  kegiatanId: string;
  jenisDokumenId: string;
  filePath: string;
}

export async function copyLogUploadedFileToDokumenKegiatan(
  logUploadedFile: LogUploadedFile[],
  penggunaId: string
) {
  try {
    logger.info("moving log record to dokumen kegiatan");
    // Use a for...of loop instead of forEach, which will handle async/await correctly by waiting for each promise to resolve before proceeding to the next iteration.
    const updateKegiatan = await dbHonorarium.$transaction(async (prisma) => {
      for (const log of logUploadedFile) {
        const { dokumen, kegiatanId, jenisDokumenId, filePath } = log;
        // logger.info(
        //   "update dokumen kegiatan",
        //   dokumen,
        //   kegiatanId,
        //   jenisDokumenId,
        //   filePath
        // );

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
          continue; // Skip to the next log if log is not found
        }

        await prisma.dokumenKegiatan.create({
          data: {
            dokumen: uploadedFile.id,
            kegiatanId,
            nama: uploadedFile.originalFilename,
            jenisDokumenId,
            filePath,
            createdBy: penggunaId,
          },
        });
      }
    });
  } catch (error) {
    logger.error("Error updating database entries", error);
    //return getPrismaErrorResponse(error as Error);
    return error;
  }
}
