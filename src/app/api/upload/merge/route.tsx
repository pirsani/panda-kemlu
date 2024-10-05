import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { BASE_PATH_UPLOAD_CHUNK } from "../config";

const mergeChunks = async (
  fromChunk: string,
  toFilename: string,
  totalChunks: number
) => {
  let chunkPaths: Array<string> = [];
  for (let i = 0; i < totalChunks; i++) {
    const filePath = path.join(
      BASE_PATH_UPLOAD_CHUNK,
      "chunk",
      fromChunk + "-" + i
    );
    chunkPaths.push(filePath);
  }

  const writeStream = fs.createWriteStream(
    path.join(process.cwd(), "files", toFilename)
  );

  writeStream.on("finish", () => {
    //console.log("merge chunks finish");
  });
  writeStream.on("error", (error) => {
    //console.log("merge chunks error", error);
  });

  try {
    chunkPaths.forEach((chunkPath) => {
      const chunk = fs.readFileSync(chunkPath);
      writeStream.write(Buffer.from(chunk.toString(), "base64"));
      fs.unlinkSync(chunkPath);
    });
    writeStream.end();
    //console.log("merging");
  } catch (error) {
    console.error("[ERROR MERGE UPLOAD]", error);
  }

  writeStream.end();
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const chunkname = data.get("randomString") as string;
    const filename = data.get("filename") as string;
    const totalChunks = data.get("totalChunks") as string;

    await mergeChunks(chunkname, filename, parseInt(totalChunks));

    return NextResponse.json({ message: "chunk Upload complete" });
  } catch (error: any) {
    console.error("[ERROR UPLOAD]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    //console.log("Upload complete");
  }
}
