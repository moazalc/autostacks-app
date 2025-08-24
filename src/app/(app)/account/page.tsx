import ProfileCard from "@/components/account/ProfileCard";
import TabSwitcher from "@/components/account/TabSwitcher";
import React from "react";

const AccountPage = () => {
  return (
    <div>
      <div className="mb-5 px-3">
        <h1 className="text-3xl font-semibold ">Account</h1>
        <p className="text-sm text-muted-foreground">
          Member since Apr 12, 2024 · Last sign-in: Aug 20, 2025
        </p>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-80 md:p-2 md:h-full flex items-start md:items-stretch justify-center md:justify-start">
          <ProfileCard />
        </div>
        <div className="flex-1 p-2 md:pl-10">
          <TabSwitcher />
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
