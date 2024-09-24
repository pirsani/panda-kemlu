import generateTabelDinamis, {
  DataGroup,
  TableColumnHeader,
  TableOptions,
  TableRow,
} from "@/utils/pdf/tabel-dinamis";
import { faker } from "@faker-js/faker";
import { once } from "events";
import fs from "fs";
import { concat, max } from "lodash";
import { NextResponse } from "next/server";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value
import { height } from "pdfkit/js/page";

interface Jadwal {
  nama: string; // nama kelas
  tanggal: string;
  jam: string;
  jadwalNarasumber: TableRow[]; // TableRow[] ini dari JadwalNarasumber
}

export async function generateDaftarNominatif(req: Request, slug: string[]) {
  // Example table columns with nested subheaders
  const columns: TableColumnHeader[] = [
    {
      level: 1,
      header: "No.",
      headerNumberingString: "1",
      field: "no",
      width: 30,
      align: "center",
    },
    {
      level: 1,
      header: "NAMA/NIK/NPWP",
      headerNumberingString: "2",
      field: "namaNipNpwp",
      width: 120,
      align: "left",
    },
    {
      level: 1,
      header: "JABATAN",
      headerNumberingString: "2",
      field: "jabatan",
      width: 90,
      align: "left",
    },
    {
      level: 1,
      header: "HONORARIUM",
      width: 185,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "JP",
          headerNumberingString: "3",
          field: "jp",
          isSummable: true,
          width: 35,
          align: "center",
        },
        {
          level: 2,
          header: "BESARAN",
          headerNumberingString: "4",
          field: "besaran",
          isSummable: true,
          width: 75,
          align: "right",
        },
        {
          level: 2,
          header: "JUMLAH",
          headerNumberingString: "4",
          field: "jumlahBruto",
          isSummable: true,
          width: 75,
          align: "right",
        },
      ],
    },
    {
      level: 1,
      header: "PAJAK PENGHASILAN",
      width: 180,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "DPP",
          headerNumberingString: "5",
          field: "dpp",
          isSummable: true,
          width: 75,
          align: "right",
        },
        {
          level: 2,
          header: "TARIF",
          headerNumberingString: "6=5-7",
          field: "tarif",
          width: 35,
          align: "right",
        },
        {
          level: 2,
          header: "PPH 21 YANG DIPOTONG",
          headerNumberingString: "7",
          field: "pph",
          isSummable: true,
          width: 70,
          align: "right",
        },
      ],
    },
    {
      level: 1,
      header: "JUMLAH YANG DITERIMA",
      headerNumberingString: "7",
      field: "jumlahNetto",
      isSummable: true,
      width: 75,
      align: "center",
    },
    {
      level: 1,
      header: "NAMA DAN NOMOR REKENING",
      headerNumberingString: "7",
      field: "bankConcated",
      width: 90,
      align: "center",
    },
  ];

  const generateFakeData = (count: number): TableRow[] => {
    const rows: TableRow[] = [];
    for (let i = 0; i < count; i++) {
      rows.push({
        no: i + 1,
        namaNipNpwp: `${faker.person.fullName()} \n ${faker.string.numeric(
          18
        )} \n ${faker.string.numeric(16)}`,
        nama: `${faker.person.fullName()}`,
        jabatan: `${faker.person.jobTitle()}`,
        jp: `${faker.number.float({ min: 1, max: 5, fractionDigits: 1 })}`,
        besaran: faker.number.int({ min: 100, max: 1000 }),
        jumlahBruto: faker.number.int({ min: 100, max: 1000 }),
        dpp: faker.number.int({ min: 100, max: 1000 }),
        tarif: faker.helpers.arrayElement(["5%", "10%", "15%"]),
        pph: faker.number.int({ min: 100, max: 1000 }),
        jumlahNetto: faker.number.int({ min: 100, max: 1000 }),
        bankConcated: `${faker.helpers.arrayElement([
          "BNI",
          "BCA",
          "MANDIRI",
        ])} \n ${faker.person.fullName()} \n ${faker.string.numeric(10)}`,
      });
    }
    return rows;
  };

  const rows1: TableRow[] = generateFakeData(1);

  const rows2: TableRow[] = generateFakeData(2);

  const rows3: TableRow[] = generateFakeData(3);

  const jadwal1: DataGroup = {
    nama: "Kelas A",
    groupMembers: rows1,
  };

  const jadwal2: DataGroup = {
    nama: "Kelas B",
    groupMembers: rows2,
  };

  const jadwal3: DataGroup = {
    nama: "Kelas C",
    groupMembers: rows3,
  };

  const jadwals = [
    jadwal1,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal1,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal2,
    jadwal1,
    jadwal1,
  ];

  const options: TableOptions = {
    startX: 30,
    startY: 75,
    headerRowHeight: 25,
    headerNumberingRowHeight: 15,
    dataRowHeight: 60,
  };
  try {
    const pdfBuffer = await generateTabelDinamis(jadwals, columns, options);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": 'attachment; filename="payroll.pdf"',
      },
    });
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
}

export async function downloadDaftarNominatif(req: Request, slug: string[]) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadDaftarNominatif;
