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

// Create a custom validation function to handle case insensitivity
const golonganRuangSchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => {
      return golonganRuangEnum.options.includes(value as any);
    },
    {
      message: "Invalid Golongan/Ruang",
    }
  );

export { golonganRuangEnum, golonganRuangSchema };
