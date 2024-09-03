import { dbHonorarium } from "@/lib/db-honorarium";
import { Lokasi, Provinsi } from "@prisma-honorarium/client";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import csv from "csv-parser";
import { tr } from "date-fns/locale";
import fs from "fs";
import path, { resolve } from "path";

interface ProvinsiRow {
  id: string;
  tahun: string;
  kode: string;
  nama: string;
  nama_singkatan: string | null;
  aktif: string;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

const seedProvinsi = async (): Promise<void> => {
  console.log("Seeding provinsi data");
  const results: ProvinsiRow[] = [];

  const csvPath = "docs/data-referensi/provinsi.csv";
  const provinsiDataPath = path.resolve(process.cwd(), csvPath);
  return new Promise((resolve, reject) => {
    fs.createReadStream(provinsiDataPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            //console.log(row);
            await dbHonorarium.provinsi.create({
              data: {
                id: parseInt(row.id),
                tahun: parseInt(row.tahun),
                kode: parseInt(row.kode),
                nama: row.nama,
                namaSingkatan: row.nama_singkatan || null,
                aktif: row.aktif === "true",
                createdBy: row.created_by,
                createdAt: new Date(row.created_at),
                updatedBy: row.updated_by || null,
                updatedAt: row.updated_at ? new Date(row.updated_at) : null,
              },
            });
          }
          console.log("Data seeded successfully");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });
};
const deleteExisting = async (): Promise<void> => {
  // Truncate the table
  try {
    console.log("Deleting existing data");

    await dbHonorarium.kota.deleteMany({});
    await dbHonorarium.provinsi.deleteMany({});
    await dbHonorarium.jadwalNarasumber.deleteMany({});
    await dbHonorarium.jadwal.deleteMany({});
    await dbHonorarium.materi.deleteMany({});
    await dbHonorarium.kelas.deleteMany({});
    await dbHonorarium.kegiatan.deleteMany({});
    await dbHonorarium.sbmHonorarium.deleteMany({});
    await dbHonorarium.unitKerja.deleteMany({});
    await dbHonorarium.jenisDokumenKegiatan.deleteMany({});
    await dbHonorarium.materi.deleteMany({});
    await dbHonorarium.narasumber.deleteMany({});
    await dbHonorarium.pangkatGolongan.deleteMany({});
    await dbHonorarium.sbmHonorarium.deleteMany({});
    await dbHonorarium.pmkAcuan.deleteMany({});
    await dbHonorarium.user.deleteMany({});
    await dbHonorarium.userRole.deleteMany({});
    await dbHonorarium.role.deleteMany({});

    console.log("Existing data deleted successfully");
  } catch (error) {
    console.error("Error deleting existing data:", error);
    throw error;
  }
};

async function main() {
  await deleteExisting();
  await seedProvinsi();

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

  // Truncate the table
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
      provinsiId: 18,
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

  const materiku = await dbHonorarium.materi.findMany({
    where: {
      createdBy: "init",
    },
  });

  const kelasku = await dbHonorarium.kelas.findMany({
    where: {
      createdBy: "init",
    },
  });

  const narasumberku = await dbHonorarium.narasumber.findMany({
    where: {
      createdBy: "init",
    },
  });

  const jadwal = await dbHonorarium.jadwal.createMany({
    data: [
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[0].id,
        materiId: materiku[0].id,
        tanggal: new Date(),
        createdBy: "init",
      },
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[0].id,
        materiId: materiku[1].id,
        tanggal: new Date(),
        createdBy: "init",
      },
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[1].id,
        materiId: materiku[2].id,
        tanggal: new Date(),
        createdBy: "init",
      },
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[1].id,
        materiId: materiku[3].id,
        tanggal: new Date(),
        createdBy: "init",
      },
    ],
  });

  const jadwalku = await dbHonorarium.jadwal.findMany({
    where: {
      createdBy: "init",
    },
  });

  const jadwalNarasumber = await dbHonorarium.jadwalNarasumber.createMany({
    data: [
      {
        jadwalId: jadwalku[0].id,
        narasumberId: narasumberku[0].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[0].id,
        narasumberId: narasumberku[1].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[1].id,
        narasumberId: narasumberku[2].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[2].id,
        narasumberId: narasumberku[2].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[2].id,
        narasumberId: narasumberku[3].id,
        createdBy: "init",
      },
    ],
  });

  const kota = await dbHonorarium.kota.createMany({
    data: [
      {
        nama: "Jakarta",
        provinsiId: 31,
        createdBy: "init",
      },
      {
        nama: "Bandung",
        provinsiId: 32,
        createdBy: "init",
      },
      {
        nama: "Surabaya",
        provinsiId: 35,
        createdBy: "init",
      },
    ],
  });

  const pmkAcuan = await dbHonorarium.pmkAcuan.createMany({
    data: [
      {
        id: "2024",
        nomorPMK: "49/2023",
        tahun: 2024,
        aktif: true,
        createdBy: "init",
      },
    ],
  });

  const sbmHonorarium = await dbHonorarium.sbmHonorarium.createMany({
    data: [
      {
        pmkAcuanId: "2024",
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1700000,
        uraian:
          "Menteri/Pejabat Setingkat Menteri/Pejabat Negara Lainnya/yang disetarakan",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1400000,
        uraian: "Pejabat Eselon I/yang disetarakan",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1000000,
        uraian: "Pejabat Eselon II/yang disetarakan",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1000000,
        uraian: "Pejabat Eselon III ke bawah/yang disetarakan",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: " Moderator",
        satuan: "Orang/kali",
        besaran: 700000,
        uraian: "Pejabat Eselon III ke bawah/yang disetarakan",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: " Pembawa Acara",
        satuan: "OK",
        besaran: 400000,
        uraian: "Pejabat Eselon III ke bawah/yang disetarakan",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: "Panitia",
        satuan: "OK",
        besaran: 450000,
        uraian: "Penanggung Jawab",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: "Panitia",
        satuan: "OK",
        besaran: 400000,
        uraian: "Ketua/Wakil Ketua",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: "Panitia",
        satuan: "OK",
        besaran: 300000,
        uraian: "Sekretaris",
        createdBy: "init",
      },
      {
        pmkAcuanId: "2024",
        jenis: "Panitia",
        satuan: "OK",
        besaran: 300000,
        uraian: "Anggota",
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
