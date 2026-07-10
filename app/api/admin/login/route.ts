import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminCookieValue,
  verifyPassword,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // Malformed body — treat as an empty password (fails verification).
  }

  const value = adminCookieValue();
  if (!verifyPassword(password) || !value) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
