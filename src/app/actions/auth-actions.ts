"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

const reservedUsernames = new Set(["admin", "root", "null", "undefined", "palace52", "support", "system"]);

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be 3-20 characters.")
  .max(20, "Username must be 3-20 characters.")
  .regex(/^[a-z0-9_]+$/, "Use only lowercase letters, numbers, and underscore.")
  .refine((value) => !reservedUsernames.has(value), "That username is reserved.");

const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");

const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
  callbackUrl: z.string().optional()
});

const profileSchema = z.object({
  displayName: z.string().trim().max(80, "Display name must be 80 characters or less.").optional(),
  bio: z.string().trim().max(280, "Bio must be 280 characters or less.").optional(),
  avatarColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color.")
    .optional(),
  isPublic: z.boolean().default(false)
});

export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialErrorState: AuthActionState = { ok: false };

export async function registerAction(_state: AuthActionState = initialErrorState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const db = getPrisma();
  const existing = await db.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true }
  });

  if (existing) {
    return {
      ok: false,
      message: "That username is not available.",
      fieldErrors: { username: ["That username is not available."] }
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      username: parsed.data.username,
      passwordHash,
      profile: {
        create: {
          displayName: parsed.data.username,
          avatarColor: "#0e765c"
        }
      }
    }
  });

  redirect("/login?registered=1");
}

export async function loginAction(_state: AuthActionState = initialErrorState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Invalid username or password." };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: safeRedirect(parsed.data.callbackUrl)
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid username or password." };
    }

    throw error;
  }

  return { ok: true };
}

export async function updateProfileAction(_state: AuthActionState = initialErrorState, formData: FormData): Promise<AuthActionState> {
  const user = await requireCurrentUser();
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
    avatarColor: formData.get("avatarColor") || undefined,
    isPublic: formData.get("isPublic") === "on"
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await getPrisma().profile.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: {
      userId: user.id,
      ...parsed.data
    }
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/settings");

  return { ok: true, message: "Profile updated." };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

function safeRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/dashboard";
  return value;
}
