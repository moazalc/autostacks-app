import CarsClient from "@/components/cars/CarClient";
import FiltersSidebar from "@/components/cars/FiltersSidebar";
import React from "react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function CarsPage() {
  // Minimal page: no server-side fetch, no pagination/filters here.
  // CarsClient will start with empty data (or fetch client-side if implemented).
  const initialCars = { items: [] };
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
      {/* Sidebar: fixed width on desktop, full width on mobile */}
      <div className="w-full md:w-80 md:p-2 md:h-full">
        <FiltersSidebar />
      </div>
      {/* Main content fills remaining space, reduced inner padding */}
      <main className="flex-1 p-2 md:pl-15">
        <CarsClient initialData={initialCars} accountId={accountId}/>
      </main>
    </div>
  );
}
