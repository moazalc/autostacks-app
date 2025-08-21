// app/(app)/dashboard/page.tsx
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "./data.json";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getAuthSession();

  const email = session?.user?.email;
  let username: string | null = null;

  if (email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { username: true, email: true },
      });
      username = dbUser?.username ?? null;
    } catch (err) {
      console.error("Error Fetching user for dashboard", err);
    }
  }

  if (!username) {
    if (email) {
      // use the part before @ as fallback
      username = email.split("@")[0];
    } else {
      username = "User";
    }
  }

  return (
    <>
      <div className="mx-8">
        <h1 className="text-3xl font-semibold ">Welcome Back {username}!</h1>
      </div>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
