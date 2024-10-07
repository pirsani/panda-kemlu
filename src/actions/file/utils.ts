export const mapsCuidToJenisDokumen = {
  dokumenSuratTugasCuid: "surat-tugas",
  dokumenNodinMemoSkCuid: "nodin-memo-sk",
  dokumenSuratSetnegSptjmCuid: "surat-setneg-sptjm",
  laporanKegiatanCuid: "laporan-kegiatan",
  daftarHadirCuid: "dafar-hadir",
  dokumentasiKegiatanCuid: "dokumentasi-kegiatan",
  rampunganTerstempelCuid: "rampungan-terstempel",
  suratPersetujuanJaldisSetnegCuid: "surat-persetujuan-jaldis-setneg",
  pasporCuid: "paspor",
  tiketBoardingPassCuid: "tiket-boarding-pass",
};

export function getJenisDokumenFromKey(
  key: keyof typeof mapsCuidToJenisDokumen
): string | undefined {
  return mapsCuidToJenisDokumen[key];
}
