import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import * as XLSX from "xlsx";
import InputFileXlsx from "./input-file-xlsx";
import TabelPeserta from "./tabel-peserta";

interface PesertaContainerProps {
  // Define the props for PesertaContainer
  fieldName: string;
  value?: File | null;
}
const PesertaContainer = ({ fieldName, value }: PesertaContainerProps) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const { control, watch, setValue, trigger } = useFormContext();

  const handleOnChange = (data: Record<string, any>[]) => {
    if (data) {
      setData(data);
      console.log(data);
    } else {
      console.log("Data is empty");
      setData([]);
    }
  };

  // Clear data when value is empty ini untuk menghapus data ketika value kosong atau di reset dari parent component
  // component ini tidak akan merender file input dari parent component
  // hanya akan merender file input yg di kelola oleh component ini
  useEffect(() => {
    if (!value) {
      setData([]);
    }
  }, [value]);

  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold mb-2">Peserta</h1>
      <div className="flex flex-row items-center gap-2 mb-2">
        <Button variant="outline">
          <Link href="/templates/peserta.xlsx">Unduh template xls peserta</Link>
        </Button>
        <span>atau</span>
      </div>
      <InputFileXlsx
        onChange={handleOnChange}
        maxColumns={9}
        name={fieldName}
      />

      {data.length > 0 && <TabelPeserta data={data} />}
    </div>
  );
};

export default PesertaContainer;
