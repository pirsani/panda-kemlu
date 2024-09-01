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
  await dbHonorarium.kelas.deleteMany({});
  await dbHonorarium.kegiatan.deleteMany({});
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

  const kegiatanLuarKota = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan LuarKota",
      createdBy: "admin",
      keterangan: "Kegiatan LuarKota",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: Lokasi.LuarKota,
      dokumenNodinMemoSk: "123456789.pdf",
      dokumenJadwal: "123456789.pdf",
      //unitKerjaId: "1",
      status: "setup-kegiatan",
    },
  });

  const kegiatanLuarNegeri = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan Luar Negeri",
      createdBy: "admin",
      keterangan: "Kegiatan Luar Negeri",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: Lokasi.LuarNegeri,
      dokumenNodinMemoSk: "123456789.pdf",
      dokumenJadwal: "123456789.pdf",
      //unitKerjaId: "1",
      status: "setup-kegiatan",
    },
  });

  const kegiatan = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan DalamKota",
      createdBy: "admin",
      keterangan: "Kegiatan DalamKota",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: Lokasi.DalamKota,
      dokumenNodinMemoSk: "123456789.pdf",
      dokumenJadwal: "123456789.pdf",
      //unitKerjaId: "1",
      status: "setup-kegiatan",
    },
  });

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

  await dbHonorarium.materi.deleteMany({});

  const materi = await dbHonorarium.materi.createMany({
    data: [
      {
        kode: "PDK-A001",
        nama: "Entrepreurship in Digital Age",
        createdBy: "init",
      },
      {
        kode: "PDK-A002",
        nama: "Digital Marketing",
        createdBy: "init",
      },
      {
        kode: "PDK-A003",
        nama: "Digital Transformation",
        createdBy: "init",
      },
      {
        kode: "PDK-A004",
        nama: "Digital Diplomacy",
        createdBy: "init",
      },

      {
        kode: "PDK-A005",
        nama: "ASEAN: overview and challenges",
        createdBy: "init",
      },
      {
        kode: "PDK-A006",
        nama: "OECD: cooperation and opportunities",
        createdBy: "init",
      },
      {
        kode: "PDK-A007",
        nama: "ASEAN: regional security",
        createdBy: "init",
      },
      {
        kode: "PDK-A008",
        nama: "ASEAN: economic integration",
        createdBy: "init",
      },
      {
        kode: "PID-A001",
        nama: "Digital Economy",
        createdBy: "init",
      },
      {
        kode: "PID-A002",
        nama: "Digital Governance",
        createdBy: "init",
      },
      {
        kode: "PID-A003",
        nama: "Digital Society",
        createdBy: "init",
      },
      {
        kode: "PID-A004",
        nama: "Digital Security",
        createdBy: "init",
      },
    ],
  });

  await dbHonorarium.pangkatGolongan.deleteMany({});
  const pangkatGolongan = await dbHonorarium.pangkatGolongan.createMany({
    data: [
      {
        id: "I/A",
        pangkat: "Juru Muda",
        golongan: "I",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "I/B",
        pangkat: "Juru Muda Tingkat 1",
        golongan: "I",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "I/C",
        pangkat: "Juru Muda Tingkat 2",
        golongan: "I",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "I/D",
        pangkat: "Juru",
        golongan: "I",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "II/A",
        pangkat: "Pengatur Muda",
        golongan: "II",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "II/B",
        pangkat: "Pengatur Muda Tingkat 1",
        golongan: "II",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "II/C",
        pangkat: "Pengatur",
        golongan: "II",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "II/D",
        pangkat: "Pengatur Tingkat 1",
        golongan: "II",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "III/A",
        pangkat: "Penata Muda",
        golongan: "III",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "III/B",
        pangkat: "Penata Tingkat 1",
        golongan: "III",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "III/C",
        pangkat: "Penata",
        golongan: "III",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "III/D",
        pangkat: "Penata Tingkat 1",
        golongan: "III",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "IV/A",
        pangkat: "Pembina",
        golongan: "IV",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "IV/B",
        pangkat: "Pembina Tingkat 1",
        golongan: "IV",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "IV/C",
        pangkat: "Pembina Muda",
        golongan: "IV",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "IV/D",
        pangkat: "Pembina Madya",
        golongan: "IV",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "IV/E",
        pangkat: "Pembina Utama",
        golongan: "IV",
        ruang: "E",
        createdBy: "init",
      },
    ],
  });

  await dbHonorarium.narasumber.deleteMany({});

  const narasumber = await dbHonorarium.narasumber.createMany({
    data: [
      {
        id: "1234567891234567", // ini adalah NIK 16 digit
        nama: "Dr. Rizal Sukma",
        NIP: "196509241992031001",
        pangkatGolonganId: "IV/D",
        createdBy: "init",
        email: "",
      },
      {
        id: "1234567891234568", // ini adalah NIK 16 digit
        nama: "Dr. Bertiga",
        NIP: "196509241992031002",
        pangkatGolonganId: "IV/C",
        createdBy: "init",
        email: "",
      },
      {
        id: "1234567891234569", // ini adalah NIK 16 digit
        nama: "Dr. Madya Bendahara",
        NIP: "197509241992031001",
        pangkatGolonganId: "IV/B",
        createdBy: "init",
        email: "",
      },
      {
        id: "1234567891234570", // ini adalah NIK 16 digit
        nama: "Dr. Siapa lah",
        NIP: "198509241992031001",
        pangkatGolonganId: "IV/A",
        createdBy: "init",
        email: "",
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
