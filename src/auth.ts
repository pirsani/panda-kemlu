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
          // model user yang diharapkan oleh next-auth lihat referensi di bawah
          // https://authjs.dev/getting-started/adapters/prisma
          // kemudian sesuaikan dengan model user yang ada di aplikasi dengan memodifikasi `src/next-auth.d.ts`
          return {
            ...user,
            unitKerjaId: "pusdiklat", // TODO contoh unit kerja id nanti diambil dari user.unitKerjaId
            unitKerjaNama: "Pusdiklat", // TODO contoh unit kerja nama nanti diambil dari user.unitKerjaNama
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user || !account) {
        throw new Error("Invalid sign in");
      }

      //console.log("[signIn] user", user);
      return true;
    },
    async session({ session, token, user }) {
      //console.log("[session] session", session);
      //console.log("[session] token", token);
      //console.log("[session] user", user);
      session.user.id = token.sub as string;
      session.user.name = token.name;
      session.user.nip = token.nip as string;
      session.user.unitKerjaId = token.unitKerjaId as string;
      session.user.unitKerjaNama = token.unitKerjaNama as string;
      session.user.roles = token.roles as string[];
      session.user.permissions = token.permissions as string[];
      return session;
    },
    async jwt({ token, user, account, profile }) {
      //console.log("[jwt] token", token);
      //console.log("[jwt] account", account);
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.nip = user.nip;
        token.unitKerjaId = user.unitKerjaId;
        token.unitKerjaNama = user.unitKerjaNama;
        token.roles = user.roles;
        token.permissions = user.permissions;
      }
      return token;
    },
  },
});
