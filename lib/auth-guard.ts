import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type AuthenticatedUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
  role?: string;
};

export async function requireUser(): Promise<AuthenticatedUser> {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });

  if (!session?.user) {
    throw new AuthGuardError("Unauthorized", 401);
  }

  return session.user as AuthenticatedUser;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();

  if (user.role !== "admin") {
    throw new AuthGuardError("Forbidden", 403);
  }

  return user;
}

export class AuthGuardError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

export async function adminAuthErrorResponse(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to verify authorization" },
      { status: 500 },
    );
  }
}
