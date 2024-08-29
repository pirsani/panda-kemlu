"use server";

import { dbHonorarium } from "@/lib/db-honorarium";

export const getUser = async (email?: string) => {
  const user = await dbHonorarium.user.findFirst({
    where: {
      email: email,
    },
  });
  return user;
};
