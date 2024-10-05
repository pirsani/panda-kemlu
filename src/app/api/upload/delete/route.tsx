// create route DELETE to delete uploaded files
// Path: app/api/upload/delete/route.tsx
// Compare this snippet from app/api/upload/route.tsx:
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Logger } from "tslog";
import { BASE_PATH_UPLOAD } from "../config";
//

const logger = new Logger({
  name: "DELETE",
  hideLogPositionForProduction: true,
});

export async function DELETE(req: NextRequest) {
  try {
    // TODO : check siapa yang mengakses

    const { filename, folder } = await req.json();

    // Create the /files folder if it doesn't exist
    const fileTobeDeleted = path.join(
      BASE_PATH_UPLOAD,
      "temp",
      folder,
      filename
    );

    logger.info("fileTobeDeleted", fileTobeDeleted);

    if (!fs.existsSync(fileTobeDeleted)) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Delete the file from the /files folder
    //https://www.tutorialkart.com/nodejs/delete-a-file-in-nodejs-using-node-fs/
    fs.unlinkSync(fileTobeDeleted);

    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    console.error("[ERROR DELETE]", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  } finally {
    console.log("Delete complete");
  }
}
