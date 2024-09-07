import { fileTypeFromBuffer } from "file-type";
import { promises as fs } from "fs";
import path from "path";

const fallbackPath = path.join(process.cwd(), "BASE_PATH_UPLOAD");
export const BASE_PATH_UPLOAD = process.env.BASE_PATH_UPLOAD || fallbackPath;
if (!process.env.BASE_PATH_UPLOAD) {
  console.warn(
    `BASE_PATH_UPLOAD is not defined in the .env file. Using default value: ${fallbackPath}`
  );
}
// Now you can use BASE_PATH_UPLOAD in your application
console.log(`Base path for uploads: ${BASE_PATH_UPLOAD}`);

// Save files to the desired storage
/*
@usage 

const file = new File(["content"], "example.txt", { type: "text/plain" });
const directory = BASE_PATH_UPLOAD; // Use the environment variable
saveFile({ file, fileName: "example.txt", directory })
  .then((filePath) => {
    console.log(`File saved at ${filePath}`);
  })
  .catch((error) => {
    console.error("Error saving file:", error);
  });

  or 

  try {
    const filePath = await saveFile({ file, fileName: "example.txt", directory });
    console.log(`File saved at ${filePath}`);
  } catch (error) {
    console.error("Error saving file:", error);
  }

  Summary
  .then() and .catch(): Traditional promise handling, method chaining.
  async/await: Modern syntax, more readable, uses try/catch for error handling.
*/

interface SaveFileOptions {
  file: File;
  fileName: string;
  directory?: string;
  allowedMimeTypes?: string[];
}
const saveFile = async ({
  file,
  fileName,
  directory = BASE_PATH_UPLOAD,
  allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"],
}: SaveFileOptions) => {
  // Check if the input is a file
  if (!(file instanceof File)) {
    throw new Error("The provided input is not a file.");
  }

  // Ensure the directory exists
  const dirPath = path.resolve(directory);
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory does not exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }

  // Save the file
  const buffer = await file.arrayBuffer();

  // Check if the file type is allowed
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
    throw new Error("Invalid file type.");
  }

  const filePath = path.join(dirPath, fileName);
  await fs.writeFile(filePath, Buffer.from(buffer));
  return filePath;
};

export default saveFile;
