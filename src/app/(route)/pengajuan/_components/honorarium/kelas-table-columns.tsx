"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Minus, Plus } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    id: "expander", // ID for the expander column
    header: () => null, // Empty header for the expander column
    cell: ({ row }) => (
      <span
        className="cursor-pointer"
        //onClick={() => row.toggleExpanded()} // Toggle row expansion
      >
        {row.getIsExpanded() ? (
          <Minus size={12} className="rounded-full text-white bg-blue-500" />
        ) : (
          <Plus size={12} className="rounded-full" />
        )}{" "}
        {/* Plus/Minus sign for expansion */}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Kelas",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];
