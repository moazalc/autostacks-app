"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props =
  | {
      onLogin?: () => void;
      onContact?: () => void;
      loginHref?: never;
      contactHref?: never;
    }
  | {
      loginHref?: string;
      contactHref?: string;
      onLogin?: never;
      onContact?: never;
    };

export default function AuthCard({
  onLogin,
  onContact,
  loginHref,
  contactHref,
}: Props) {
  return (
    <Card className="max-w-sm w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">AutoStacks Inc.</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Dealer accounting & inventory — fast, simple, and made for small
          dealerships.
        </p>
      </CardContent>

      <CardFooter className="flex gap-3 justify-center">
        {loginHref ? (
          <a href={loginHref} aria-label="Login">
            <Button size="sm">Login</Button>
          </a>
        ) : (
          <Button size="sm" onClick={onLogin} aria-label="Login">
            Login
          </Button>
        )}

        {contactHref ? (
          <a href={contactHref} aria-label="Contact">
            <Button size="sm" variant="ghost">
              Contact
            </Button>
          </a>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={onContact}
            aria-label="Contact"
          >
            Contact
          </Button>
        )}
      </CardFooter>
      <p className="text-xs text-muted-foreground text-center">
        © AutoStacks Inc.
      </p>
    </Card>
  );
}
