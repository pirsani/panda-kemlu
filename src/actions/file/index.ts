import { dbHonorarium } from "@/lib/db-honorarium";
import saveFile from "@/utils/file-operations/save";
import { createId } from "@paralleldrive/cuid2";
import { extname } from "path";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

const SaveAndLogUploadedFile = async (
  file: File | undefined | null,
  directory: string,
  savedBy: string
) => {
  if (!file) {
    return false;
  }

  try {
    const fileExtension = extname(file.name);
    // Generate a unique filename using nanoid
    const uniqueFilename = `${createId}${fileExtension}`;

    const { filePath, relativePath, fileHash, fileType } = await saveFile({
      file,
      fileName: uniqueFilename,
      directory,
    });

    const savedFile = await logUploadedFile(
      uniqueFilename,
      file.name,
      relativePath,
      fileHash,
      fileType.mime,
      savedBy
    );

    return { filePath, relativePath, fileHash, fileType };
  } catch (error) {
    logger.error("[Error saving file]", error);
    return false;
  }
  // Save the file to disk
};

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

export default SaveAndLogUploadedFile;
