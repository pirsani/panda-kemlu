"use client";
import BasicDatePicker from "@/components/form/date-picker/basic-date-picker";
import FocusableDatePicker from "@/components/form/date-picker/focusable-date-picker";
import InputDatePicker from "@/components/form/date-picker/input-date-picker";
import FormFileUpload from "@/components/form/form-file-upload";
import { FormMultiFileUpload } from "@/components/form/form-multifile-upload";
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
import { Input } from "@/components/ui/input";
import useFileStore from "@/hooks/use-file-store";
import kegiatanSchema, {
  Kegiatan,
  KegiatanEditMode,
  kegiatanSchemaEditMode,
} from "@/zod/schemas/kegiatan";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import ItineraryContainer from "./itinerary-container";
import PesertaContainer from "./peserta-container";
//import SelectSbmProvinsi from "./select-sbm-provinsi";
import setupKegiatan from "@/actions/kegiatan/setup-kegiatan";
import SelectLokasi from "@/components/form/select-lokasi";
import { LOKASI } from "@prisma-honorarium/client";

//import Select, { SingleValue } from "react-select";

const SelectSbmProvinsi = dynamic(() => import("./select-sbm-provinsi"), {
  ssr: false,
  loading: () => <p>Loading provinsi...</p>,
});
// fix Warning: Extra attributes from the server: aria-activedescendant
// Dynamically import Select to avoid SSR

type FormValues<T> = T extends true ? KegiatanEditMode : Kegiatan;

interface FormKegiatanProps {
  editId?: number | null;
}

export const FormKegiatan = ({ editId }: FormKegiatanProps) => {
  const isEditMode = editId != null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(isEditMode ? kegiatanSchemaEditMode : kegiatanSchema),
    defaultValues: {
      nama: "",
      lokasi: LOKASI.DALAM_KOTA, // Default value for lokasi atau nantinya bisa diisi dari data yang sudah ada klo mode edit
      provinsi: 31, // Default value for provinsi atau nantinya bisa diisi dari data yang sudah ada klo mode edit
      dokumenSuratTugas: undefined,
      dokumenJadwal: undefined,
      dokumenNodinMemoSk: undefined,
    },
    //reValidateMode: "onChange",
  });

  const {
    setValue,
    reset,
    resetField,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = form;

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    console.log("[onSubmit]", data);
    // destructuring data to get the file object
    const {
      dokumenNodinMemoSk,
      dokumenJadwal,
      dokumenSuratTugas,
      pesertaXlsx,
      ...dataWithoutFile
    } = data;
    // create a new FormData object
    const formData = new FormData();
    // append the data to the form data
    // formData.append("data", JSON.stringify(dataWithoutFile));
    // dataWithoutFile
    for (const [key, value] of Object.entries(dataWithoutFile)) {
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "string") {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }
    // append the files to the form data
    formData.append("dokumenNodinMemoSk", dokumenNodinMemoSk as File);
    formData.append("dokumenJadwal", dokumenJadwal as File);
    formData.append("pesertaXlsx", pesertaXlsx as File);

    // append the files to the form data
    if (Array.isArray(dokumenSuratTugas)) {
      dokumenSuratTugas.forEach((file) => {
        formData.append("dokumenSuratTugas", file as File);
      });
    } else {
      formData.append("dokumenSuratTugas", dokumenSuratTugas as File);
    }

    const kegiatanBaru = await setupKegiatan(formData);
    if (kegiatanBaru.success) {
      alert("Kegiatan berhasil disimpan");
      //reset(); // reset the form

      // resetField("dokumenSuratTugas");
      // resetField("dokumenNodinMemoSk");
      // resetField("dokumenJadwal");
    } else {
      alert(kegiatanBaru.error);
    }
  };

  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (file: File | null) => {
    if (file !== null) {
      const fileUrl = URL.createObjectURL(file);
      console.log(fileUrl);
      setFileUrl(fileUrl);
    } else {
      setFileUrl(null);
    }
  };

  const handleMultiFileChange = (files: File[] | null) => {
    // Ensure files is an array and contains at least one file
    const fileArray = files?.length ? (files as [File, ...File[]]) : undefined;

    setValue("dokumenSuratTugas", fileArray);
    trigger("dokumenSuratTugas");
    console.log("dokumenSuratTugas", fileArray);
  };

  // Watch the lokasi field to update the state
  const lokasi = watch("lokasi");

  // Update selectedLokasi state when lokasi changes
  useEffect(() => {
    console.log(lokasi);
  }, [lokasi]);

  const displayAllErrors = false;

  const LOKASI_OPTIONS = [
    { value: LOKASI.DALAM_KOTA, label: "Dalam Kota" },
    { value: LOKASI.LUAR_KOTA, label: "Luar Kota" },
    { value: LOKASI.LUAR_NEGERI, label: "Luar Negeri" },
  ];

  return (
    <Form {...form}>
      {/* Map errors to a div */}
      {Object.keys(errors).length > 0 && displayAllErrors && (
        <div className="bg-red-100 p-4 mt-4 rounded">
          <h3 className="text-red-500 font-bold mb-2">Form Errors:</h3>
          <ul className="list-disc list-inside text-red-500">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>
                {key}: {error?.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full"
      >
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kegiatan</FormLabel>
              <FormControl>
                <Input placeholder="nama kegiatan" {...field} tabIndex={0} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row w-full gap-2">
          <FormField
            control={form.control}
            name="tanggalMulai"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="tanggalMulai">Tanggal Mulai</FormLabel>
                <FormControl>
                  <BasicDatePicker
                    name={field.name}
                    error={errors.tanggalMulai}
                    className="md:w-full"
                    calendarOptions={{
                      fromDate: new Date(new Date().getFullYear(), 0, 1),
                      toDate: new Date(new Date().getFullYear(), 11, 31),
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tanggalSelesai"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="tanggalSelesai">Tanggal Selesai</FormLabel>
                <FormControl>
                  <BasicDatePicker
                    name={field.name}
                    error={errors.tanggalSelesai}
                    className="md:w-full"
                    calendarOptions={{
                      fromDate: new Date(new Date().getFullYear(), 0, 1),
                      toDate: new Date(new Date().getFullYear(), 11, 31),
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="dokumenNodinMemoSk"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenNodinMemoSk">
                Upload Nota Dinas/Memorandum/SK Tim
              </FormLabel>
              <FormControl>
                <FormFileUpload
                  name={field.name}
                  onFileChange={handleFileChange}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dokumenJadwal"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenJadwal">
                Upload Nota Dinas/Memorandum/SK Tim
              </FormLabel>
              <FormControl>
                <FormFileUpload
                  name={field.name}
                  onFileChange={handleFileChange}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dokumenSuratTugas"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>
                Surat Tugas (multiple files)
              </FormLabel>
              <FormControl
                onBlur={() => {
                  trigger(field.name);
                }}
              >
                <FormMultiFileUpload
                  name={field.name}
                  text="Pilih dokumen Surat Tugas"
                  onFileChange={handleMultiFileChange}
                  className="bg-white w-full"
                  classNameEyeButton=""
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lokasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Lokasi</FormLabel>
              <FormControl>
                <SelectLokasi
                  value={field.value}
                  fieldName={field.name}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {lokasi == LOKASI.LUAR_NEGERI && <ItineraryContainer />}
        {lokasi != LOKASI.LUAR_NEGERI && (
          <FormField
            control={form.control}
            name="provinsi"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Provinsi</FormLabel>
                <FormControl>
                  <SelectSbmProvinsi
                    fullKey={field.name}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="pesertaXlsx"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PesertaContainer
                  fieldName={field.name}
                  value={field.value}
                  // onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <PesertaContainer fieldName="pesertaXls" /> */}
        <div className="flex flex-row gap-4 w-full mt-12">
          <Button
            className="w-5/6 h-12 bg-blue-600 hover:bg-blue-700"
            type="submit"
          >
            Submit
          </Button>
          <Button
            type="button"
            variant={"outline"}
            className="w-1/6 h-12"
            onClick={() => {
              reset();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormKegiatan;
