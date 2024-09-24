import generateTabelDinamis, {
  DataGroup,
  TableColumnHeader,
  TableOptions,
  TableRow,
} from "@/utils/pdf/tabel-dinamis";
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
          width: 35,
          align: "center",
        },
        {
          level: 2,
          header: "BESARAN",
          headerNumberingString: "4",
          field: "besaran",
          width: 75,
          align: "right",
        },
        {
          level: 2,
          header: "JUMLAH",
          headerNumberingString: "4",
          field: "jumlahBruto",
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

  const rows1: TableRow[] = [
    {
      no: 1,
      namaNipNpwp: "John Doe panjang \n 1234567890 \n 1234567890",
      nama: "John Doe panjang",
      jabatan: "Manager",
      jp: 2.3,
      besaran: "Rp. 105.000.000",
      jumlahBruto: "$500",
      dpp: "Rp. 15.000.000",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },
  ];

  const rows: TableRow[] = [
    {
      no: 1,
      namaNipNpwp: "John Doe panjang \n 1234567890 \n 1234567890",
      nama: "John Doe panjang",
      jabatan: "Manager",
      jp: 2.3,
      besaran: "Rp. 105.000.000",
      jumlahBruto: "$500",
      dpp: "Rp. 15.000.000",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },
    {
      no: 2,
      namaNipNpwp: "John Doe panjang",
      nama: "John Doe panjang",
      jabatan: "Manager",
      jp: 2.5,
      besaran: "$5000",
      jumlahBruto: "$500",
      dpp: "$200",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },
  ];

  const rows3: TableRow[] = [
    {
      no: 1,
      namaNipNpwp: "John Doe panjang \n 1234567890 \n 1234567890",
      nama: "John Doe panjang",
      jabatan: "Manager",
      jp: 2.3,
      besaran: "Rp. 105.000.000",
      jumlahBruto: "$500",
      dpp: "Rp. 15.000.000",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },
    {
      no: 2,
      namaNipNpwp: "fukasb sdsd sadj \n 1234567890 \n 1234567890",
      nama: "siaa ajsdasd ",
      jabatan: "Manager",
      jp: 2.5,
      besaran: "$5000",
      jumlahBruto: "$500",
      dpp: "$200",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BCA \n fulan bin fulan \n 1234567890",
    },

    {
      no: 3,
      namaNipNpwp: "sansdi sadsad \n 1234567890 \n 1234567890",
      nama: "siaa sad ",
      jabatan: "sadsad sdss",
      jp: 2.5,
      besaran: "$5000",
      jumlahBruto: "$500",
      dpp: "$200",
      tarif: "5%",
      pph: "Rp. 750.000",
      jumlahNetto: "$500",
      bankConcated: "BNI \n sdfdsf dsfdsf \n 1234567890",
    },
  ];

  const jadwal1: DataGroup = {
    nama: "Kelas A",
    groupMembers: rows1,
  };

  const jadwal2: DataGroup = {
    nama: "Kelas B",
    groupMembers: rows,
  };

  const jadwal3: DataGroup = {
    nama: "Kelas C",
    groupMembers: rows3,
  };

  const jadwals = [
    jadwal1,
    jadwal3,
    jadwal3,
    jadwal2,
    jadwal1,
    jadwal2,
    jadwal2,
    jadwal1,
    jadwal1,
    jadwal1,
    jadwal1,
    jadwal1,
    jadwal1,
    jadwal3,
    jadwal2,
    jadwal1,
    jadwal2,
    jadwal2,
    jadwal1,
    jadwal3,
    jadwal3,
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
