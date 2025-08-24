import { CircleAlert } from "lucide-react";
import React from "react";

const SettingsPage = () => {
  return (
    <div className="text-center min-h-screen m-0">
      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
        <CircleAlert className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">Under Maintenance</h3>
      <p>The settings page is currently under maintenance.</p>
    </div>
  );
};

export default SettingsPage;
