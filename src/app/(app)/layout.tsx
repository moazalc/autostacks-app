// app/(app)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type MinimalSessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Auth guard for everything under (app)
  // 1) session from NextAuth (server)
  const session = await getAuthSession();

  // If there's no session at all → send to UI login page
  if (!session) {
    redirect("/login");
  }

  const sessionUser = (session?.user ?? {}) as MinimalSessionUser;

  // 2) Try to find db user using id (preferred) or email fallback
  let dbUser = null;
  if (sessionUser.id) {
    dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { username: true, email: true, imgUrl: true },
    });
  } else if (sessionUser.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: { username: true, email: true, imgUrl: true },
    });
  }

  // If we couldn't find a DB user and session has no identifying info, redirect to login
  if (!dbUser && !sessionUser.email && !sessionUser.id) {
    // nothing useful to build nav user from — go to login
    redirect("/login");
  }

  // 3) Build the navUser object with sensible fallbacks
  const navUser = {
    name: dbUser?.username ?? sessionUser.name ?? "User",
    email: dbUser?.email ?? sessionUser.email ?? "",
    avatar: dbUser?.imgUrl ?? sessionUser.image ?? "",
  };

  const styleVars = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={styleVars}>
      <AppSidebar variant="inset" user={navUser} />
      <SidebarInset>
        {/* Top navbar visible on every (app) page */}
        <SiteHeader />
        {/* Page content area */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
