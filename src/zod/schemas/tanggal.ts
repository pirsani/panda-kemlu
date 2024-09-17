import { isValid, parseISO } from "date-fns";
import { z } from "zod";

// Custom validation function to check if the input is a valid date string
export const isValidDateString = (value: string) => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

export const tanggalSchema = z
  .string()
  .min(10, {
    message: "please complete the date",
  })
  .max(10, {
    message: "please use valid date format",
  })
  .refine(isValidDateString, {
    message: "Invalid, use format as yyyy-mm-dd.",
  })
  .transform((value) => new Date(value));
