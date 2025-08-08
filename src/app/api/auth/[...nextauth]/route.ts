import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing email or password in credentials.");
          return null;
        }

        console.log("🔍 Looking for user with email:", credentials.email);
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          console.log("❌ No user found with this email.");
          return null;
        }

        console.log("✅ User found:", { id: user.id, email: user.email });

        const passwordCorrect = await compare(
          credentials.password,
          user.password
        );
        console.log("🔑 Password match status:", passwordCorrect);

        if (passwordCorrect) {
          console.log("🎉 Authorization successful.");
          return {
            id: user.id,
            email: user.email,
            username: user.username,
          };
        }

        console.log("❌ Password is incorrect.");
        return null;
      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
