import { NextResponse } from "next/server";
import generatorDokumenPengadaan, {
  downloadDokumenPengadaan,
} from "./generator-dokumen-pengadaan";
import { downloadDokumenRampungan } from "./generator-rampungan";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const { slug } = params;
  console.log(slug);

  const jenisDokumen = slug[0];
  console.log(jenisDokumen);

  switch (jenisDokumen) {
    case "dokumen-pengadaan":
      return downloadDokumenPengadaan(req, slug);
    case "dokumen-rampungan":
      return downloadDokumenRampungan(req, slug);
    default:
      return new NextResponse(`Download ${params.slug.join("/")}`);
  }
}

// Function to update the Word template
