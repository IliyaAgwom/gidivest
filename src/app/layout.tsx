import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Martcapp - Invest Smarter. Grow Stronger.",
  description:
    "Access diversified investment opportunities, real-time market insights, and intelligent portfolio management—all in one secure platform.",
};

async function getMaintenanceMode(): Promise<boolean> {
  try {
    const settings = await prisma.adminSetting.findFirst({
      select: { maintenanceMode: true },
    });
    return settings?.maintenanceMode ?? false;
  } catch {
    return false; // fail open — never block everyone if DB is down
  }
}

async function getSessionRole(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hv_session")?.value;
    if (!token) return null;

    const SECRET = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024"
    );
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the pathname injected by middleware so we can skip the
  // maintenance redirect for /maintenance, /login, and /register
  // (avoids infinite redirect loops and always lets admins sign in).
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const isBypassPath =
    pathname === "/maintenance" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api");

  if (!isBypassPath) {
    const [inMaintenance, role] = await Promise.all([
      getMaintenanceMode(),
      getSessionRole(),
    ]);

    if (inMaintenance && role !== "ADMIN") {
      redirect("/maintenance");
    }
  }

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-navy-50 dark:bg-navy-900 text-navy-900 dark:text-white transition-colors duration-300`}
      >
        <Navbar />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
