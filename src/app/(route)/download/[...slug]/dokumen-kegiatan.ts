import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function downloadDokumenKegiatan(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const dokumenId = slug[1];
  //const kegiatan = await getKegiatanById(kegiatanId);
  const uploadedFile = await getUploadedFile(dokumenId);
  const filePath = uploadedFile?.filePath;
  if (!filePath) {
    return new NextResponse("File not found", { status: 404 });
  }

  // read file from disk and send it to client
  const fullPath = path.join(BASE_PATH_UPLOAD, filePath);
  const file = await fs.readFile(fullPath);
  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": uploadedFile?.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename=${uploadedFile.originalFilename}`, // inline or attachment
    },
  });
}

export async function getUploadedFile(id: string) {
  const dokumen = await dbHonorarium.uploadedFile.findUnique({
    where: {
      id,
    },
  });
  return dokumen;
}

export default downloadDokumenKegiatan;
