import EntriesFilters from "@/components/transactions/FiltersSidebar";
import EntriesClient from "@/components/transactions/TransactionsClient";
import React from "react";

export default function EntriesPage() {
  // Minimal page: no server-side fetch, no pagination/filters here.
  // CarsClient will start with empty data (or fetch client-side if implemented).

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar: fixed width on desktop, full width on mobile */}
      <div className="w-full md:w-80 md:p-2 md:h-full">
        <EntriesFilters />
      </div>
      {/* Main content fills remaining space, reduced inner padding */}
      <main className="flex-1 p-2 md:pl-15">
        <EntriesClient />
      </main>
    </div>
  );
}
