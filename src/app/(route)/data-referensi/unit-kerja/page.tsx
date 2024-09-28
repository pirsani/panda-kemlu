import { getOptionsForEligibleSatkerAnggaran } from "@/actions/satker-anggaran";
import { getOptionsUnitKerja, getUnitKerja } from "@/actions/unit-kerja";
import { DialogTambahUnitKerja } from "./_components/dialog-tambah-unit-kerja";
import TabelUnitKerja from "./_components/tabel-unit-kerja";

const ReferensiUnitKerjaPage = async () => {
  const data = await getUnitKerja();
  const optionsUnitKerja = await getOptionsUnitKerja();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Unit Kerja </h1>
      <DialogTambahUnitKerja />
      <TabelUnitKerja data={data} optionsUnitKerja={optionsUnitKerja} />
    </div>
  );
};

export default ReferensiUnitKerjaPage;
