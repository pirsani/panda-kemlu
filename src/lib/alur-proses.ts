"use server";
type StatusLangkah =
  | "Draft"
  | "Submitted"
  | "Revise"
  | "Revised"
  | "Paid"
  | "End";

export interface Kegiatan {
  id: number;
  langkahSekarang: string;
  langkahSelanjutnya: string | null;
  status: string;
  updatedAt?: Date;
}

interface LogEntry {
  id: number;
  kegiatanId: number;
  langkahSekarang: string;
  langkahSelanjutnya: string;
  status: string;
  createdAt: Date;
}

const kegiatan: Kegiatan = {
  id: 1,
  langkahSekarang: "setup",
  langkahSelanjutnya: "pengajuan",
  status: "Draft",
};

type Aksi = "proceed" | "Revise";

export const updateAlurLangkah = async (
  kegiatan: Kegiatan,
  aksi: Aksi
): Promise<Kegiatan> => {
  console.log("[SEBELUM]", kegiatan);
  console.log("[AKSI]", aksi);

  // Update the status of the kegiatan
  if (kegiatan.status === "End") {
    console.log("Kegiatan sudah selesai");
    return kegiatan;
  }
  if (aksi === "proceed" && kegiatan.status === "Paid") {
    kegiatan.status = "End";
  } else if (
    aksi === "proceed" &&
    kegiatan.status === "Submitted" &&
    kegiatan.langkahSelanjutnya === "selesai"
  ) {
    kegiatan.status = "Paid";
  } else if (aksi === "proceed" && kegiatan.status === "Draft") {
    kegiatan.status = "Submitted";
  } else if (aksi === "proceed" && kegiatan.status === "Revise") {
    kegiatan.status = "Revised";
  } else if (aksi === "proceed" && kegiatan.status === "Revised") {
    kegiatan.status = "Submitted";
    kegiatan.langkahSekarang = kegiatan.langkahSelanjutnya || "";
    kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
      kegiatan.langkahSekarang,
      kegiatan.status as StatusLangkah
    );
  } else if (aksi === "proceed" && kegiatan.status === "Submitted") {
    kegiatan.status = "Submitted";
    // If the status is Submitted, move to the next step
    kegiatan.langkahSekarang = kegiatan.langkahSelanjutnya || "";
    kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
      kegiatan.langkahSekarang,
      kegiatan.status as StatusLangkah
    );
  } else if (aksi === "Revise") {
    kegiatan.status = "Revise";
  }
  console.log("[SESUDAH]", kegiatan);

  return kegiatan;

  //logFlowPost(postID, currentStep || "", nextStep, newStatus, userID);
};

// only move to the next step if the new status is Submitted
// if the status is Draft, stay in the current step
function tentukanLangkahSelanjutnya(
  langkahSekarang: string | null,
  statusBaru: StatusLangkah
): string | null {
  const langkah = [
    "setup",
    "pengajuan",
    "verifikasi",
    "nominatif",
    "pembayaran",
    "selesai",
  ];

  if (!langkahSekarang) return langkah[0]; // Start from 'setup' if current step is null

  const currentIndex = langkah.indexOf(langkahSekarang);
  if (currentIndex === -1) return null; // Current step not found in the list

  if (currentIndex === langkah.length - 1) return langkahSekarang; // Already at the last step

  switch (statusBaru) {
    case "Submitted":
      // If status is 'Submitted' move to the next step if possible
      return currentIndex + 1 < langkah.length
        ? langkah[currentIndex + 1]
        : null;
    case "Draft":
    case "Revise":
    case "Revised":
    case "Paid":
    case "End":
      // If status is 'Revise' or 'Paid', stay in the current step
      return null;
    default:
      return null;
  }
}
