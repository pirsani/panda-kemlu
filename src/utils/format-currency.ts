import Decimal from "decimal.js";

// Format a number as currency using Decimal for precise calculations
export const formatCurrency = (
  amount: number | Decimal, // Accept both number and Decimal types
  locale = "id-ID",
  currency = "IDR"
) => {
  // Ensure amount is a Decimal
  const decimalAmount = Decimal.isDecimal(amount)
    ? amount
    : new Decimal(amount);

  // Define formatting options
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "IDR" ? 0 : 2, // No decimals for IDR
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  };

  // Format the Decimal amount as a currency string
  return new Intl.NumberFormat(locale, options).format(
    decimalAmount.toNumber()
  );
};

export default formatCurrency;
