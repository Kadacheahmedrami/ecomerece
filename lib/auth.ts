import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  return session.user
}

export async function checkAdminAccess() {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  if (!user.email) {
    return false
  }

  // Check if user is admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = user.email === adminEmail;
  
  return isAdmin;
}

export async function getSessionWithAdmin() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    return null
  }

  // Add admin flag to session
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = session.user.email === adminEmail;

  return {
    ...session,
    user: {
      ...session.user,
      admin: isAdmin
    }
  }
}

export async function getCurrentUserWithAdmin() {
  const sessionWithAdmin = await getSessionWithAdmin()
  
  if (!sessionWithAdmin?.user) {
    return null
  }

  return sessionWithAdmin.user
}