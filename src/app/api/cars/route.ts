import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { z } from "zod";
import { carCreateSchema } from "@/lib/validation";

const prisma = new PrismaClient().$extends(withAccelerate());

// Validate query (?accountId=...)
const listQuerySchema = z.object({
  accountId: z.uuid(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = carCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data; // Already typed & coerced

    const car = await prisma.car.create({ data });
    return NextResponse.json(car, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to create car." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      accountId: searchParams.get("accountId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "accountId (uuid) is required",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const cars = await prisma.car.findMany({
      where: { accountId: parsed.data.accountId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cars);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch cars." },
      { status: 500 }
    );
  }
}
