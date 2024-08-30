import FormFileUpload from "@/components/form/form-file-upload";
import PdfPreview from "@/components/pdf-preview";
import PdfPreviewContainer from "@/components/pdf-preview-container";
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
import { SubmitHandler, useForm } from "react-hook-form";

type FormValues<T> = T extends true
  ? DokumenUhDalamNegeriEditMode
  : DokumenUhDalamNegeri;

interface UhDalamNegeriContainerProps {
  editId?: string | null;
}
const UhDalamNegeriContainer = ({ editId }: UhDalamNegeriContainerProps) => {
  const isEditMode = editId !== null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(
      isEditMode
        ? DokumenUhDalamNegeriSchemaEditMode
        : DokumenUhDalamNegeriSchema
    ),
    defaultValues: {},
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    console.log(data);
  };

  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (file: File | null) => {
    const handleFileChange = (file: File | null) => {
      if (file !== null) {
        const fileUrl = URL.createObjectURL(file);
        setFileUrl(fileUrl);
      } else {
        setFileUrl(null);
      }
    };
  };

  return (
    <div>
      <h1>Uang Harian Dalam Negeri</h1>
      <div className="flex flex-row">
        <div>
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
                    <label htmlFor="laporanKegiatan">
                      Upload Nota Dinas/Memorandum/SK Tim
                    </label>
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
                name="daftarHadir"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="daftarHadir">
                      Upload Nota Dinas/Memorandum/SK Tim
                    </label>
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
                name="dokumentasi"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="dokumentasi">
                      Upload Nota Dinas/Memorandum/SK Tim
                    </label>
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
                name="rampungan"
                render={({ field }) => (
                  <FormItem>
                    <label htmlFor="rampungan">
                      Upload Nota Dinas/Memorandum/SK Tim
                    </label>
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
            </form>
          </Form>
        </div>
        <div>
          <PdfPreviewContainer />
        </div>
      </div>
    </div>
  );
};

export default UhDalamNegeriContainer;
