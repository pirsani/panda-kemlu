import { DefaultSession } from "next-auth";

// nextauth.d.ts

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    name: string;
    nip?: string;
    unitKerjaId?: string;
    unitKerjaNama?: string;
    roles?: string[];
    permissions?: string[];
  }
  interface Session {
    user: User & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    name: string;
    roles: string[];
    unitKerjaId: string;
    unitKerjaNama: string;
    nip?: string;
    permissions?: string[];
  }
}
