import { dbHonorarium } from "@/lib/db-honorarium";

async function main() {
  const routes = await dbHonorarium.jadwal.findMany({});
  console.log(routes);

  const dokumenKegiatan = await dbHonorarium.jenisDokumenKegiatan.createMany({
    data: [
      {
        nama: "nota-dinas-memorandum-sk",
        createdBy: "init",
        deskripsi: "Nota Dinas/Memorandum/ SK Tim",
      },
      {
        nama: "jadwal-kegiatan",
        createdBy: "init",
        deskripsi: "Jadwal Kegiatan",
      },
      {
        nama: "surat-setneg-sptjm",
        createdBy: "init",
        deskripsi: "Surat Setneg/SPTJM",
      },
      {
        nama: "surat-tugas",
        createdBy: "init",
        deskripsi: "Surat Tugas",
        isMultiple: true,
      },
      {
        nama: "surat-setneg-sptjm",
        createdBy: "init",
        deskripsi: "Surat Setneg/SPTJM",
        untukLokasiDi: "2;",
      },
      {
        nama: "laporan-kegiatan",
        createdBy: "init",
        deskripsi: "Laporan Kegiatan",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        nama: "dafar-hadir",
        createdBy: "init",
        deskripsi: "Daftar Hadir",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        nama: "dokumentasi-kegiatan",
        createdBy: "init",
        deskripsi: "Dokumentasi Kegiatan",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        nama: "rampungan-terstempel",
        createdBy: "init",
        deskripsi: "Rampungan yang distempel",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        nama: "paspor",
        createdBy: "init",
        deskripsi: "Paspor (ID, exit permit, stempel imigrasi)",
        untukLangkahKe: 1,
        untukLokasiDi: "2;",
      },
      {
        nama: "tiket",
        createdBy: "init",
        deskripsi: "Tiket atau boarding pass",
        untukLangkahKe: 1,
        untukLokasiDi: "2;",
      },
    ],
  });
}

main();
