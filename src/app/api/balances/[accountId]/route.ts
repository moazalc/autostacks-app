import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { z } from "zod";

const prisma = new PrismaClient().$extends(withAccelerate());

// Same balance recalculation function from entries route api

async function recalcBalance(accountId: string) {
  const credit = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: { accountId, type: "CREDIT" },
  });
  const debit = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: { accountId, type: "DEBIT" },
  });

  const newAmount = (credit._sum?.amount ?? 0) - (debit._sum?.amount ?? 0);

  const updated = await prisma.balance.upsert({
    where: { accountId },
    create: { accountId, amount: newAmount },
    update: { amount: newAmount },
  });

  return updated;
}

// Validation

const paramsSchema = z.object({ accountId: z.uuid() });
const querySchema = z.object({
  fresh: z
    .string()
    .transform((v) => v.toLowerCase())
    .pipe(z.enum(["true", "false"]))
    .optional(),
});

// GET

export async function GET(
  req: Request,
  context: { params: Promise<{ accountId: string }> }
) {
  try {
    // await the params first
    const { accountId } = await context.params;

    // validate the path param
    const p = paramsSchema.safeParse({ accountId });
    if (!p.success) {
      return NextResponse.json(
        { error: "Invalid Account ID", issues: p.error.issues },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = querySchema.safeParse({
      fresh: searchParams.get("fresh") ?? undefined,
    });
    if (!q.success) {
      return NextResponse.json(
        { error: "Invalid Query", issues: q.error.issues },
        { status: 400 }
      );
    }

    const forceFresh = q.data.fresh === "true";

    if (forceFresh) {
      const updated = await recalcBalance(accountId);
      return NextResponse.json({
        data: {
          accountId,
          amount: updated.amount,
          updatedAt: updated.updatedAt,
          source: "recalc",
        },
      });
    }

    // Return cached balance if present, if missing, initialize once.
    const cached = await prisma.balance.findUnique({ where: { accountId } });
    if (cached) {
      return NextResponse.json({
        data: {
          accountId,
          amount: cached.amount,
          updatedAt: cached.updatedAt,
          source: "cached",
        },
      });
    }

    const initialized = await recalcBalance(accountId);
    return NextResponse.json({
      data: {
        accountId,
        amount: initialized.amount,
        updatedAt: initialized.updatedAt,
        source: "initialized",
      },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to get balance." },
      { status: 500 }
    );
  }
}
