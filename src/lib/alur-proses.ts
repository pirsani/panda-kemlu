type StatusLangkah =
  | "Draft"
  | "Submitted"
  | "Revise"
  | "Revised"
  | "Paid"
  | "Other";

interface Kegiatan {
  id: number;
  langkahSekarang: string | null;
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
  langkahSekarang: null,
  langkahSelanjutnya: "setup",
  status: "Draft",
};

function updateAlurLangkah(
  kegiatan: Kegiatan,
  statusBaru: StatusLangkah
): Kegiatan {
  const langkahSekarang = kegiatan.langkahSelanjutnya;
  const langkahSelanjutnya = tentukanLangkahSelanjutnya(
    langkahSekarang,
    statusBaru
  );

  kegiatan.langkahSekarang = langkahSekarang || null;
  kegiatan.langkahSelanjutnya = langkahSelanjutnya;
  kegiatan.status = statusBaru;
  kegiatan.updatedAt = new Date();

  return kegiatan;
  //logFlowPost(postID, currentStep || "", nextStep, newStatus, userID);
}

function tentukanLangkahSelanjutnya(
  langkahSekarang: string | null,
  statusBaru: StatusLangkah
): string | null {
  const langkah = [
    "setup",
    "pengajuan",
    "verfikasi",
    "nominatif",
    "pembayaran",
  ];

  if (!langkahSekarang) return langkah[0]; // Start from 'setup' if current step is null

  const currentIndex = langkah.indexOf(langkahSekarang);
  if (currentIndex === -1) return null; // Current step not found in the list

  switch (statusBaru) {
    case "Draft":
    case "Other":
      // If status is 'Draft' or 'Other', stay in the current step
      return langkah[currentIndex];
    case "Submitted":
    case "Revised":
      // If status is 'Submitted' or 'Revised', move to the next step if possible
      return currentIndex + 1 < langkah.length
        ? langkah[currentIndex + 1]
        : null;
    case "Revise":
    case "Paid":
      // If status is 'Revise' or 'Paid', stay in the current step
      return langkah[currentIndex];
    default:
      return null;
  }
}
