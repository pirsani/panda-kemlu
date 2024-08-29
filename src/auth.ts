import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "./data/user";
import { UncomplexLoginSchema } from "./zod/schemas/login";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        let user = {
          id: "sdsad",
          name: "Test User",
          email: "email@gmail.com",
          password: "password",
        };

        //validate against the schema
        const validatedCredentials =
          UncomplexLoginSchema.safeParse(credentials);

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data;

          // logic to salt and hash password
          const isValidPassword = await bcrypt.compare(password, password);

          // logic to verify if the user exists
          // user = await getUserFromDb(credentials.email, pwHash);
          const user = await getUser(email);

          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            //throw new Error("User not found.");
            return null;
          }

          // return user object with their profile data
          return {
            ...user,
          };
        }
        return null;
      },
    }),
  ],
});
