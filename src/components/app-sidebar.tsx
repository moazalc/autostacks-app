"use client";

import * as React from "react";
import {
  IconChartLine,
  IconCurrencyDollar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Layers } from "lucide-react";

type SidebarUser = {
  name: string;
  email: string;
  avatar?: string | null;
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Car Inventory", url: "/cars", icon: IconListDetails },
    {
      title: "Transactions",
      url: "/transactions",
      icon: IconCurrencyDollar,
    },
    { title: "Reports", url: "/reports", icon: IconChartLine },
  ];

  const navSecondary = [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Get Help", url: "/help", icon: IconHelp },
  ];

  // const documents = [
  //   { name: "Data Library", url: "/dashboard/library", icon: IconDatabase },
  //   { name: "Reports", url: "/dashboard/reports", icon: IconReport },
  //   { name: "Word Assistant", url: "/dashboard/assistant", icon: IconFileWord },
  // ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <Layers className="!size-5" />
                <span className="text-base font-semibold">AutoStacks</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* <NavDocuments items={documents} /> */}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
