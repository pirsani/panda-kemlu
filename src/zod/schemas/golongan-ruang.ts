import { z } from "zod";

// Define the Zod enum with the desired values
const golonganRuangEnum = z.enum([
  "-",
  "I/A",
  "I/B",
  "I/C",
  "I/D",
  "II/A",
  "II/B",
  "II/C",
  "II/D",
  "III/A",
  "III/B",
  "III/C",
  "III/D",
  "IV/A",
  "IV/B",
  "IV/C",
  "IV/D",
  "IV/E",
]);

// Generate the validation message with all available options
const availableOptions = golonganRuangEnum.options.join(", ");
const validationMessage = `Invalid Golongan/Ruang. Available options are: ${availableOptions}`;
// Create a custom validation function to handle case insensitivity
const golonganRuangSchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => {
      return golonganRuangEnum.options.includes(value as any);
    },
    {
      message: validationMessage,
    }
  );

export { golonganRuangEnum, golonganRuangSchema };
