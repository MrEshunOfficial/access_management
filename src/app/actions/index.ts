// app/actions.ts
'use server'

import { signIn, signOut } from "@/auth"
import { invalidateUserSessions } from "@/auth"
import { auth } from "@/auth"
import { connect } from "@/lib/dbconfigue/dbConfigue"
import { revalidatePath } from "next/cache"
import { User } from "../models/auth/authModel"
import { AuthError } from "next-auth"

export async function doSocialLogin(formData: FormData) {
  const action = formData.get("action") as string
     
  if (!action) {
    throw new Error("Provider action is required")
  }
 
  try {
    await signIn(action, { redirectTo: "/" })
  }  catch (error) {
    if (error instanceof AuthError) {
      console.error("Authentication error:", error)
      throw error
    }
    throw error
  }
}

export async function doLogout() {
  try {
    const session = await auth()
    if (session?.user?.id) {
      await invalidateUserSessions(session.user.id)
    }
    await signOut({ 
      redirectTo: '/auth/users/login',
      redirect: true 
    })
    revalidatePath('/')
    revalidatePath('/auth/users/login')
  } catch {
    await signOut({ redirectTo: '/auth/users/login' })
  }
}

export async function deleteAccount() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }
    
    await connect()
    
    await invalidateUserSessions(session.user.id)
    
    await User.findByIdAndDelete(session.user.id)
    
    await signOut({ 
      redirectTo: '/auth/users/login',
      redirect: true 
    })
    
    revalidatePath('/')
    revalidatePath('/auth/users/login')
    
    return { success: true, message: "Account deleted successfully" }
    
  } catch (error) {
    console.error("Account deletion error:", error)
    throw new Error("Failed to delete account")
  }
}

export async function forceLogoutUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }
    
    await invalidateUserSessions(userId)
    
    return { success: true, message: "User sessions invalidated" }
    
  } catch (error) {
    console.error("Force logout error:", error)
    throw new Error("Failed to force logout user")
  }
}