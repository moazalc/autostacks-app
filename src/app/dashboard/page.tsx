import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div>
      <h1>Welcome to your dashboard, {session.user?.email}!</h1>
      {/* Your dashboard content */}
    </div>
  );
}
