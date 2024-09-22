"use client";
import { importExcelSbmUhLuarNegeri } from "@/actions/excel/sbm/uh-luar-negeri";
import ExcelContainer, {
  ParseResult,
} from "@/approute/data-referensi/_components/excel-container";
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
  columnsWithEmptyValueAllowed,
  extractFromColumns,
} from "@/constants/excel/sbm-uh-luar-negeri";
import {
  excelDataReferensi,
  excelDataReferensiSchema,
} from "@/zod/schemas/excel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const FormUploadExcelSbmUhLuarNegeri = () => {
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

  const onSubmit = async (data: excelDataReferensi) => {
    // disubmit excel / data ke backend ?
    // harus tidak ada error dulu
    if (!data.file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file);
    const importedData = await importExcelSbmUhLuarNegeri(formData);
    if (importedData.success) {
      toast.success("Data berhasil diimport");
      console.log("Data berhasil diimport", importedData.data);
      setData(null);
      setIsReadyToSubmit(false);
      reset();
    } else {
      toast.error("Data gagal diimport");
      console.log("Data gagal diimport ", importedData.error);
    }
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

  useEffect(() => {
    setIsReadyToSubmit(
      data ? Object.keys(data.shouldNotEmpty).length === 0 : false
    );
  }, [data]);

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
                  templateXlsx="/download/template-excel/sbm-uh-luar-negeri"
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
        <div className="flex my-8 w-full justify-center">
          {isReadyToSubmit && (
            <Button
              type="submit"
              className="w-full w-1/3 bg-blue-600 hover:bg-blue-700"
            >
              Import {data?.rows.length} data
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default FormUploadExcelSbmUhLuarNegeri;
