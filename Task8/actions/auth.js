"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signup(formData) {
  try {
    await connectDB();

    const email = formData.get("email");
    const password = formData.get("password");

    const existing = await User.findOne({ email });

    if (existing) {
      return { error: "User already exists" };
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashed,
    });

    redirect("/login");
  } catch (error) {
    return {
      error:
        error?.message ||
        "Unable to connect to database. Check your MONGODB_URI credentials.",
    };
  }
}

export async function login(formData) {
  await connectDB();

  const email = formData.get("email");
  const password = formData.get("password");

  const user = await User.findOne({ email });

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return { error: "Invalid credentials" };
  }

  const cookieStore = await cookies();

  cookieStore.set("session", user._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  redirect("/dashboard");
}

export async function logout() {
  cookies().delete("session");
  redirect("/login");
}
