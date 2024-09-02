import { getKegiatanById } from "@/actions/kegiatan";

const GeneratorRampungan = () => {
  return true;
};

export async function downloadDokumenRampungan(req: Request, slug: string[]) {
  const kegiatanId = parseInt(slug[1]);
  const kegiatan = await getKegiatanById(kegiatanId);
}

export default GeneratorRampungan;
