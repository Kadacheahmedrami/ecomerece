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

  // Log information about the admin check
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = user.email === adminEmail;
  


  return isAdmin;
}

