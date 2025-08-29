"use client";
import React, { useEffect, useState } from "react";

type BalanceWidgetProps = {
  accountId?: string;
  /** change this value (e.g. increment a counter) to force a refresh when entries change */
  refresh?: unknown;
  locale?: string;
  currency?: string;
};

export default function BalanceWidget({
  accountId,
  refresh,
  locale = "en-US",
  currency = "USD",
}: BalanceWidgetProps) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!accountId) {
      setBalance(null);
      return;
    }

    let mounted = true;
    (async function load() {
      try {
        const res = await fetch(`/api/balances/${accountId}?fresh=true`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (mounted) setBalance(null);
          return;
        }
        const json = await res.json();
        // handle common shapes: { data: { amount } }, { amount }, { balance }
        const amt =
          json?.data?.amount ?? json?.amount ?? json?.balance ?? null;
        if (mounted) setBalance(typeof amt === "number" ? amt : null);
      } catch (err) {
        console.error("Balance fetch failed", err);
        if (mounted) setBalance(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [accountId, refresh]);

  const formatted =
    balance === null
      ? "-"
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(balance);

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border px-3 py-2">
      <div>
        <div className="text-xs text-muted-foreground">Balance</div>
        <div className="text-lg font-semibold">{formatted}</div>
      </div>
    </div>
  );
}
