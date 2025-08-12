import { Layers } from "lucide-react";
import * as React from "react";
import LoginForm from "@/components/login-form";
import { Language } from "@/components/language-select";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="#"
          className="flex w-full items-center justify-between font-medium"
        >
          {/* Left side */}
          <span className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Layers className="size-4" />
            </div>
            AutoStacks Inc.
          </span>

          {/* Right side */}
          <Language />
        </a>

        <LoginForm />
      </div>
    </div>
  );
}
