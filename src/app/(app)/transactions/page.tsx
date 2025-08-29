import EntriesFilters from "@/components/transactions/FiltersSidebar";
import EntriesClient from "@/components/transactions/TransactionsClient";
import React from "react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import BalanceWidget from "@/components/BalanceWidget";

export default async function EntriesPage() {
  const session = await getAuthSession();

  let accountId: string | undefined = undefined;
  try{
    if(session?.user?.email){
      const accountUser = await prisma.accountUser.findFirst({
        where: {user: {email: session.user.email}},
      });
      accountId = accountUser?.accountId ?? undefined;
    }
  }catch(err){
    console.error("Failed to resolve accountId for Entries:", err)
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-80 md:p-2 md:h-full">
        <EntriesFilters />
      </div>
      <main className="flex-1 p-2 md:pl-15">
        <EntriesClient accountId={accountId} />
      </main>
    </div>
  );
}
