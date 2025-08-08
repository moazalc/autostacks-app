import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: Request) {
  try {
    const {
      accountId,
      make,
      model,
      year,
      buyPrice,
      buyDate,
      imgUrl,
      sellPrice,
      sellDate,
      notes,
    } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { message: "accountId is required" },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        accountId,
        make,
        model,
        year: Number(year),
        buyPrice,
        buyDate: new Date(buyDate),
        imgUrl,
        sellPrice,
        sellDate: sellDate ? new Date(sellDate) : undefined,
        notes,
      },
    });
    return NextResponse.json(car);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to create car." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cars = await prisma.car.findMany();
    return NextResponse.json(cars);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch cars." },
      { status: 500 }
    );
  }
}
