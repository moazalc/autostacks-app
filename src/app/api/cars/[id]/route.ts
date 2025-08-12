import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";
import { z } from "zod";
import { carUpdateSchema } from "@/lib/validation";

const prisma = new PrismaClient().$extends(withAccelerate());

// Validate the dynamic route param
const idParamSchema = z.object({
  id: z.uuid(),
});

// Get a single car
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const parsed = idParamSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid car id", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { id } = parsed.data;

  try {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json({ error: "Car not found!" }, { status: 404 });
    }
    return NextResponse.json(car);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error fetching car" },
      { status: 500 }
    );
  }
}

// Update a car
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const idParsed = idParamSchema.safeParse(params);
  if (!idParsed.success) {
    return NextResponse.json(
      { error: "Invalid car id", issues: idParsed.error.issues },
      { status: 400 }
    );
  }
  const { id } = idParsed.data;

  const body = await req.json();
  const parsed = carUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Optional safety: don't allow moving a car to another account via update
  const safeData = parsed.data;

  try {
    const updated = await prisma.car.update({
      where: { id },
      data: safeData,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error updating car" }, { status: 500 });
  }
}

// Delete a car
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const parsed = idParamSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid car id", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { id } = parsed.data;

  try {
    await prisma.car.delete({ where: { id } });
    return NextResponse.json({ message: "Car deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error deleting car" }, { status: 500 });
  }
}
