import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type AuthenticatedUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
  role?: string;
  appwriteId?: string | null;
};

export async function requireUser(): Promise<AuthenticatedUser> {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user as AuthenticatedUser;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();

  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}
