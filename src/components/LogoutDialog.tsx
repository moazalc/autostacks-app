// path: components/site/LogoutDialog.tsx
"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { LogOut } from "lucide-react";

export default function LogoutDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      // NextAuth sign out; redirect to /login after sign out
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      console.error("Sign out failed", err);
      setLoading(false);
    }
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            className="hidden sm:flex"
            aria-label="Logout"
          >
            <LogOut />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-20 bg-gray-100">
          <p className="text-sm text-muted-foreground">Logout</p>
        </HoverCardContent>
      </HoverCard>

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You will be returned to the
              login page.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4" />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 cursor-pointer"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
