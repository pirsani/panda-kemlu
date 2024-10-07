import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { BASE_PATH_UPLOAD_CHUNK } from "../config";

const saveChunk = async (chunk: string, filename: string) => {
  return new Promise((resolve, reject) => {
    const filesFolder = path.posix.join(BASE_PATH_UPLOAD_CHUNK, "chunk");
    const osCompatibleFolder = path.resolve(filesFolder);
    const filePath = path.posix.join(filesFolder, filename);
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(osCompatibleFolder)) {
      fs.mkdirSync(osCompatibleFolder);
    }
    console.log("filePath ", resolvedPath);

    const writeStream = fs.createWriteStream(resolvedPath);
    writeStream.on("finish", () => {
      resolve("finish");
    });
    writeStream.on("error", (error) => {
      reject(error);
    });
    writeStream.write(chunk);
    writeStream.end();
  });
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const filename = data.get("randomString") as string;
    const fileChunk = data.get("chunk") as Blob;
    const currentChunk = data.get("currentChunk") as string;

    const chunk = Buffer.from(await fileChunk.arrayBuffer()).toString("base64");
    //console.log("chunk", chunk);

    const saved = await saveChunk(chunk, filename + "-" + currentChunk);

    if (saved === "finish") {
      return NextResponse.json({ message: "chunk Upload complete" });
    } else {
      return NextResponse.json({ message: "chunk Upload error" });
    }
  } catch (error: any) {
    console.error("[ERROR UPLOAD]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    console.log("Upload complete");
  }
}
