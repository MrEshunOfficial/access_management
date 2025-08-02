// app/actions.ts
"use server";

import { signIn, signOut } from "@/auth";
import { auth } from "@/auth";
import { connect } from "@/lib/dbconfigue/dbConfigue";
import { revalidatePath } from "next/cache";
import { User } from "../models/auth/authModel";
import { AuthError } from "next-auth";

export async function doSocialLogin(formData: FormData) {
  const action = formData.get("action") as string;

  if (!action) {
    throw new Error("Provider action is required");
  }

  try {
    await signIn(action, { redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Authentication error:", error);
      throw error;
    }
    throw error;
  }
}

export async function doLogout() {
  try {
    await signOut({
      redirectTo: "/auth/users/login",
      redirect: true,
    });
    revalidatePath("/");
    revalidatePath("/auth/users/login");
  } catch (error) {
    console.error("Logout error:", error);
    await signOut({ redirectTo: "/auth/users/login" });
  }
}

export async function deleteAccount() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    await connect();

    // Delete the user from the database
    await User.findByIdAndDelete(session.user.id);

    // Sign out the user (NextAuth will handle JWT invalidation)
    await signOut({
      redirectTo: "/auth/users/login",
      redirect: true,
    });

    revalidatePath("/");
    revalidatePath("/auth/users/login");

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Account deletion error:", error);
    throw new Error("Failed to delete account");
  }
}

export async function forceLogoutUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Since we're using JWT-based sessions, we can't force logout users
    // from the server side. The JWT tokens will remain valid until they expire.
    // Consider implementing a token blacklist in your database if you need this functionality.

    console.warn(
      "Force logout is not supported with JWT-based sessions. Consider implementing a token blacklist."
    );

    return {
      success: false,
      message:
        "Force logout is not supported with current session management. JWT tokens remain valid until expiry.",
    };
  } catch (error) {
    console.error("Force logout error:", error);
    throw new Error("Failed to force logout user");
  }
}
