import { Controller, useFormContext } from "react-hook-form";

interface FormFileUploadProps {
  name: string;
  onFileChange?: (file: File | null) => void;
  ref?: React.RefObject<HTMLInputElement>;
}
export const FormFileUpload = ({
  name,
  onFileChange,
  ref,
}: FormFileUploadProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            ref={ref}
            id={name}
            type="file"
            accept=".pdf"
            className="border-2 border-gray-300 p-2 rounded w-full"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              field.onChange(file);
              onFileChange && onFileChange(file);
            }}
          />
        )}
      />
    </div>
  );
};

export default FormFileUpload;
