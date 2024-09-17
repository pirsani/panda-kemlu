import { DefaultSession } from "next-auth";

// nextauth.d.ts

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    nip?: string | null;
    organisasiId?: string;
    organisasiNama?: string;
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
    id: string;
    roles: string[];
    organisasiId: string;
    organisasiNama: string;
    nip?: string | null;
    permissions?: string[];
  }
}
