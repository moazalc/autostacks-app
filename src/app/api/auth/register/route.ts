import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { message: "Email, Username and Password Required!" },
        { status: 400 }
      );
    }

    //Checking if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email or username already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      const newAccount = await tx.account.create({
        data: {
          name: `${username}'s Account`,
        },
      });

      await tx.accountUser.create({
        data: {
          userId: newUser.id,
          accountId: newAccount.id,
        },
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
        account: {
          id: newAccount.id,
          name: newAccount.name,
        },
      };
    });

    return NextResponse.json({
      message: "User and account created successfully.",
      ...result,
    });
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
