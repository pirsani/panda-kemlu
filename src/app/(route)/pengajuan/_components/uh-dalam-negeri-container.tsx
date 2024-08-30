import { Form } from "@/components/ui/form";

type FormValues<T> = T extends true
  ? DokumenUploadUhDalamNegeriEditMode
  : DokumenUploadUhDalamNegeri;

interface UhDalamNegeriContainerProps {
  editId?: string | null;
}
const UhDalamNegeriContainer = ({ editId }: UhDalamNegeriContainerProps) => {
  const isEditMode = editId !== null;
  type FormMode = typeof isEditMode;
  return (
    <div>
      <h1>Uang Harian Dalam Negeri</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="dokumenSurat"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="dokumenSurat">
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
  );
};

export default UhDalamNegeriContainer;
