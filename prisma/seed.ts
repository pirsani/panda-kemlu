import { dbHonorarium } from "@/lib/db-honorarium";
import { Lokasi } from "@prisma-honorarium/client";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison

async function main() {
  const routes = await dbHonorarium.jadwal.findMany({});
  console.log(routes);

  // Truncate the table
  await dbHonorarium.jenisDokumenKegiatan.deleteMany({});
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

  // Truncate the table
  await dbHonorarium.unitKerja.deleteMany({});
  const unitKerja = await dbHonorarium.unitKerja.createMany({
    data: [
      {
        nama: "Tata Usaha",
        namaSingkatan: "TU",
        createdBy: "init",
      },
      {
        nama: "PPE",
        namaSingkatan: "PPE",
        createdBy: "init",
      },
      {
        nama: "UPT Sekdilu",
        namaSingkatan: "UPT Sekdilu",
        createdBy: "init",
      },
      {
        nama: "UPT Sesdilu",
        namaSingkatan: "UPT Sesdilu ",
        createdBy: "init",
      },
      {
        nama: "UPT Sesparlu",
        namaSingkatan: "UPT Sesparlu",
        createdBy: "init",
      },
    ],
  });

  // Truncate the table
  await dbHonorarium.role.deleteMany({});
  const role = await dbHonorarium.role.createMany({
    data: [
      {
        id: "superadmin",
        name: "Superadmin",
        createdBy: "init",
      },
      {
        id: "admin",
        name: "Bendahara",
        createdBy: "init",
      },
      {
        id: "operator-keuangan",
        name: "Operator Keuangan",
        createdBy: "init",
      },
      {
        id: "uploader",
        name: "Uploader",
        createdBy: "init",
      },
      {
        id: "viewer",
        name: "Viewer",
        createdBy: "init",
      },
    ],
  });

  // Truncate the table
  await dbHonorarium.user.deleteMany({});
  const pass = bcrypt.hashSync("123456", 10);
  const user = await dbHonorarium.user.createMany({
    data: [
      {
        id: "admin",
        password: pass,
        name: "admin",
        email: "admin@super.id",
      },
    ],
  });

  // Truncate the table
  await dbHonorarium.userRole.deleteMany({});
  const userRole = await dbHonorarium.userRole.createMany({
    data: [
      {
        userId: "admin",
        roleId: "superadmin",
      },
    ],
  });

  await dbHonorarium.kegiatan.deleteMany({});
  const kegiatan = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan DalamKota",
      createdBy: "admin",
      keterangan: "Kegiatan DalamKota",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: Lokasi.DalamKota,
      //unitKerjaId: "1",
      status: "setup-kegiatan",
    },
  });

  await dbHonorarium.kelas.deleteMany({});
  const kelas = await dbHonorarium.kelas.createMany({
    data: [
      {
        nama: "Kelas A",
        createdBy: "init",
        kode: "PDK-75-A",
        kegiatanId: kegiatan.id,
      },
      {
        nama: "Kelas B",
        createdBy: "init",
        kode: "PDK-75-B",
        kegiatanId: kegiatan.id,
      },
    ],
  });

  const materi = await dbHonorarium.materi.createMany({
    data: [
      {
        kode: "MPU-PDK-A001",
        nama: "Entrepreurship in Digital Age",
        createdBy: "init",
      },
      {
        kode: "MPU-PDK-A002",
        nama: "Digital Marketing",
        createdBy: "init",
      },
      {
        kode: "MPU-PDK-A003",
        nama: "Digital Transformation",
        createdBy: "init",
      },
      {
        kode: "MPK-PDK-A004",
        nama: "Digital Diplomacy",
        createdBy: "init",
      },

      {
        kode: "MPK-PDK-A005",
        nama: "ASEAN: overview and challenges",
        createdBy: "init",
      },
      {
        kode: "MPK-PDK-A006",
        nama: "OECD: cooperation and opportunities",
        createdBy: "init",
      },
      {
        kode: "MPK-PDK-A007",
        nama: "ASEAN: regional security",
        createdBy: "init",
      },
      {
        kode: "MPK-PDK-A008",
        nama: "ASEAN: economic integration",
        createdBy: "init",
      },
      {
        kode: "MPU-PID-A001",
        nama: "Digital Economy",
        createdBy: "init",
      },
      {
        kode: "MPU-PID-A002",
        nama: "Digital Governance",
        createdBy: "init",
      },
      {
        kode: "MPU-PID-A003",
        nama: "Digital Society",
        createdBy: "init",
      },
      {
        kode: "MPU-PID-A004",
        nama: "Digital Security",
        createdBy: "init",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await dbHonorarium.$disconnect();
  });
