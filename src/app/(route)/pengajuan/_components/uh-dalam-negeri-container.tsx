import ajukanUhDalamNegeri from "@/actions/kegiatan/uang-harian/dalam-negeri";
import ButtonEye from "@/components/button-eye-open-document";
import FormFileUpload from "@/components/form/form-file-upload";
import PdfPreview from "@/components/pdf-preview";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import useFileStore from "@/hooks/use-file-store";
import {
  DokumenUhDalamNegeri,
  DokumenUhDalamNegeriEditMode,
  DokumenUhDalamNegeriSchema,
  DokumenUhDalamNegeriSchemaEditMode,
} from "@/zod/schemas/dokumen-uh-dalam-negeri";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";

type FormValues<T> = T extends true
  ? DokumenUhDalamNegeriEditMode
  : DokumenUhDalamNegeri;

interface UhDalamNegeriContainerProps {
  kegiatanId: number;
  editId?: number | null;
}
const UhDalamNegeriContainer = ({
  kegiatanId,
  editId,
}: UhDalamNegeriContainerProps) => {
  //this ensures that isEditMode will be false if editId is null or undefined
  const isEditMode = editId != null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(
      isEditMode
        ? DokumenUhDalamNegeriSchemaEditMode
        : DokumenUhDalamNegeriSchema
    ),
    defaultValues: {
      kegiatanId,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    console.log(data, isEditMode);
    // extraction of zod schema to be used in the action
    const formData = new FormData();
    formData.append("kegiatanId", data.kegiatanId.toString());
    formData.append("laporanKegiatan", data.laporanKegiatan as File);
    formData.append("daftarHadir", data.daftarHadir as File);
    formData.append("dokumentasi", data.dokumentasi as File);
    formData.append("rampungan", data.rampungan as File);

    const ajukan = await ajukanUhDalamNegeri(formData);
    console.log("[response]", ajukan);
  };

  const [fileUrls, setFileUrls] = useState<{ [key: string]: string | null }>(
    {}
  );
  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (
    file: File | null,
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    if (file !== null) {
      const fileUrl = URL.createObjectURL(file);
      setFileUrl(fileUrl);

      // Update the fileUrls state
      setFileUrls((prevUrls) => ({
        ...prevUrls,
        [field.name]: fileUrl,
      }));
    } else {
      setFileUrl(null);
      // Update the fileUrls state
      setFileUrls((prevUrls) => ({
        ...prevUrls,
        [field.name]: null,
      }));
    }
  };

  return (
    <div className="mt-6 border border-blue-500 rounded-lg">
      <h1 className="font-semibold text-lg py-2 p-2 border-b border-blue-600">
        Data Dukung Pengajuan Uang Harian Dalam Negeri
      </h1>
      <div className="flex flex-col gap-8 p-2 pb-8">
        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="laporanKegiatan"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="laporanKegiatan" className=" font-semibold">
                      laporan Kegiatan
                    </label>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileUpload
                          name={field.name}
                          onFileChange={handleFileChange}
                          className="bg-white w-full border-2"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="daftarHadir"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="daftarHadir" className=" font-semibold">
                      Daftar Hadir
                    </label>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileUpload
                          name={field.name}
                          onFileChange={handleFileChange}
                          className="bg-white"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dokumentasi"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="dokumentasi" className="font-semibold">
                      Dokumentasi
                    </label>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileUpload
                          name={field.name}
                          onFileChange={handleFileChange}
                          className="bg-white"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rampungan"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="rampungan" className=" font-semibold">
                      Rampungan yang distempel
                    </label>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileUpload
                          name={field.name}
                          onFileChange={handleFileChange}
                          className="bg-white"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full">
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  type="submit"
                >
                  Ajukan
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UhDalamNegeriContainer;
