import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import InputFileXlsx from "./input-file-xlsx";
import TabelPeserta from "./tabel-peserta";

const PesertaContainer = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);

  const handleOnChange = (data: Record<string, any>[]) => {
    if (data) {
      setData(data);
    }
  };

  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold mb-2">Peserta</h1>
      <div className="flex flex-row items-center gap-2 mb-2">
        <Button variant="outline">
          <Link href="/templates/peserta.xlsx">Unduh template xls peserta</Link>
        </Button>
        <span>atau</span>
      </div>
      <div>
        <label
          htmlFor="peserta"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Upload xlsx peserta
        </label>
        <InputFileXlsx onChange={handleOnChange} />
      </div>
      {data.length > 0 && <TabelPeserta data={data} />}
    </div>
  );
};

export default PesertaContainer;
