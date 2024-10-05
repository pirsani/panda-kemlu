import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path, { extname } from "path";
import { BASE_PATH_UPLOAD } from "./config";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const filename = data.get("filename") as string;
    const file = data.get("file") as File;
    const folderIdentifier = data.get("folder") as string;
    const fileExtension = extname(file.name);
    const uniqueFilename = `${filename}${fileExtension}`;

    // Create the /files folder if it doesn't exist
    const filesFolder = path.join(BASE_PATH_UPLOAD, "temp", folderIdentifier);
    if (!fs.existsSync(filesFolder)) {
      fs.mkdirSync(filesFolder, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write the file to the /files folder
    const filePath = path.join(filesFolder, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ message: "Upload complete" });
  } catch (error) {
    console.error("[ERROR UPLOAD]", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  } finally {
    console.log("Upload complete");
  }
}
