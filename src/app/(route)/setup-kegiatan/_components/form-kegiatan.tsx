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
import { useEffect, useRef } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import ItineraryContainer from "./itinerary-container";
import PesertaContainer from "./peserta-container";
//import SelectSbmProvinsi from "./select-sbm-provinsi";
import setupKegiatan from "@/actions/kegiatan/setup-kegiatan";
import CummulativeErrors from "@/components/form/cummulative-error";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import {
  default as Required,
  default as RequiredLabel,
} from "@/components/form/required";
import SelectLokasi from "@/components/form/select-lokasi";
import { cn } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { LOKASI } from "@prisma-honorarium/client";
import { toast } from "sonner";

//import Select, { SingleValue } from "react-select";

const SelectSbmProvinsi = dynamic(() => import("./select-sbm-provinsi"), {
  ssr: false,
  loading: () => <p>Loading provinsi...</p>,
});
// fix Warning: Extra attributes from the server: aria-activedescendant
// Dynamically import Select to avoid SSR

type FormValues<T> = T extends true ? KegiatanEditMode : Kegiatan;

interface FormKegiatanProps {
  editId?: string | null;
}

export const FormKegiatan = ({ editId }: FormKegiatanProps) => {
  const isEditMode = editId != null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(isEditMode ? kegiatanSchemaEditMode : kegiatanSchema),
    defaultValues: {
      nama: "",
      lokasi: LOKASI.DALAM_KOTA, // Default value for lokasi atau nantinya bisa diisi dari data yang sudah ada klo mode edit
      provinsi: "31", // Default value for provinsi atau nantinya bisa diisi dari data yang sudah ada klo mode edit
      dokumenSuratTugas: undefined,
      dokumenSuratTugasCuid: [],
      dokumenJadwal: undefined,
      dokumenJadwalCuid: createId(),
      dokumenNodinMemoSk: undefined,
      dokumenNodinMemoSkCuid: createId(),
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

  // Watch the value of DokumenJadwalCuid
  const dokumenJadwalCuid = form.watch("dokumenJadwalCuid");
  const dokumenNodinMemoSkCuid = form.watch("dokumenNodinMemoSkCuid");
  const dokumenSuratTugasCuid = form.watch("dokumenSuratTugasCuid");

  // Use a ref to store the folderCuid
  const folderCuidRef = useRef(createId());
  const folderCuid = folderCuidRef.current;
  setValue("cuid", folderCuid);

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
    // formData.append("dokumenNodinMemoSk", dokumenNodinMemoSk as File);
    // formData.append("dokumenJadwal", dokumenJadwal as File);
    formData.append("pesertaXlsx", pesertaXlsx as File);

    // append the files to the form data
    if (Array.isArray(dokumenSuratTugas)) {
      dokumenSuratTugas.forEach((file) => {
        //formData.append("dokumenSuratTugas", file as File);
      });
    } else {
      //formData.append("dokumenSuratTugas", dokumenSuratTugas as File);
    }

    const kegiatanBaru = await setupKegiatan(formData);
    if (kegiatanBaru.success) {
      toast.success("Kegiatan berhasil disimpan");
      //reset(); // reset the form

      // resetField("dokumenSuratTugas");
      // resetField("dokumenNodinMemoSk");
      // resetField("dokumenJadwal");
    } else {
      toast.error(kegiatanBaru.error + " " + kegiatanBaru.message);
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full"
      >
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nama Kegiatan <RequiredLabel />
              </FormLabel>
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
                <FormLabel htmlFor="tanggalMulai">
                  Tanggal Mulai
                  <RequiredLabel />
                </FormLabel>
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
                <FormLabel htmlFor="tanggalSelesai">
                  Tanggal Selesai
                  <RequiredLabel />
                </FormLabel>
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
                <RequiredLabel />
              </FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={dokumenNodinMemoSkCuid}
                  folder={folderCuid}
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
                Dokumen Jadwal kegiatan
                <RequiredLabel />
              </FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={dokumenJadwalCuid}
                  folder={folderCuid}
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
                <RequiredLabel />
              </FormLabel>
              <FormControl
                onBlur={() => {
                  trigger(field.name);
                }}
              >
                <FormMultiFileUpload
                  name={field.name}
                  cuids={"dokumenSuratTugasCuid"}
                  folder={folderCuid}
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
              <FormLabel>
                Lokasi
                <RequiredLabel />
              </FormLabel>
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
                <FormLabel htmlFor={field.name}>
                  Provinsi
                  <RequiredLabel />
                </FormLabel>
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
                  folder={folderCuid}
                  pesertaXlsxCuid={"pesertaXlsxCuid"}
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

        <CummulativeErrors errors={errors} />

        <div className="flex flex-row gap-4 w-full mt-12">
          <Button
            className={cn("w-5/6 h-12 bg-blue-600 hover:bg-blue-700")}
            disabled={isSubmitting}
            type="submit"
          >
            Submit
            {isSubmitting && <span className="ml-2">submitting...</span>}
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
