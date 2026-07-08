import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type AdminSession = {
  isAdmin?: boolean;
};

const password = process.env.SESSION_SECRET || "dev-only-secret-please-change-this-now-32chars+";

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "ap_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },
};

export async function getSession() {
  return getIronSession<AdminSession>(cookies(), sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  return Boolean(session.isAdmin);
}
