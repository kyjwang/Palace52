import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

class InvalidLoginError extends CredentialsSignin {
  code = "invalid_credentials";
}

const credentialsSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(20),
  password: z.string().min(1)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidLoginError();

        const user = await getPrisma().user.findUnique({
          where: { username: parsed.data.username },
          select: { id: true, username: true, passwordHash: true }
        });

        if (!user) throw new InvalidLoginError();

        const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!validPassword) throw new InvalidLoginError();

        return {
          id: user.id,
          username: user.username,
          name: user.username
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const id = typeof token.id === "string" ? token.id : "";
        const username = typeof token.username === "string" ? token.username : "";

        session.user.id = id;
        session.user.username = username;
        session.user.name = username;
      }

      return session;
    }
  }
});
