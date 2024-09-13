"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  excelDataReferensi,
  excelDataReferensiSchema,
} from "@/zod/schemas/excel";
import { Narasumber } from "@/zod/schemas/narasumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ExcelContainer, { ParseResult } from "../../_components/excel-container";

const FormUploadExcelNarasumber = () => {
  const form = useForm<excelDataReferensi>({
    resolver: zodResolver(excelDataReferensiSchema),
  });
  const [data, setData] = useState<ParseResult | null>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const {
    setValue,
    reset,
    resetField,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = form;

  const extractFromColumns = [
    "ID",
    "Nama",
    "NIP",
    "NIK",
    "NPWP",
    "Golongan/Ruang",
    "Jabatan",
    "Eselon",
    "Nama Rekening",
    "Bank",
    "Nomor Rekening",
  ];
  const columnsWithEmptyValueAllowed = [
    "NIP",
    "Eselon",
    "Golongan/Ruang",
    "NPWP",
    "Nama Rekening",
    "Bank",
    "Nomor Rekening",
  ];

  const onSubmit = (data: excelDataReferensi) => {
    // disubmit excel / data ke backend ?
    // harus tidak ada error dulu
    console.log(data);
  };

  const onParse = (data: ParseResult | null) => {
    console.log("onParse", data);
    setData(data);
    if (data) {
      console.log("data", data.shouldNotEmpty);
      setIsReadyToSubmit(Object.keys(data.shouldNotEmpty).length === 0);
    } else {
      console.log("Not ready to submit");
      setIsReadyToSubmit(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ExcelContainer
                  templateXlsx="/template-narasumber.xlsx"
                  name={field.name}
                  value={field.value}
                  extractFromColumns={extractFromColumns}
                  columnsWithEmptyValueAllowed={columnsWithEmptyValueAllowed}
                  onParse={onParse}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex mt-8">
          {isReadyToSubmit && <Button type="submit">Submit</Button>}
        </div>
      </form>
    </Form>
  );
};

export default FormUploadExcelNarasumber;
