import { checkAdminAccess } from "@/lib/auth"
import { AdminCitiesPageClient } from "./admin-cities-page-client"

export default async function AdminCitiesPage() {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <AdminCitiesPageClient />
    </div>
  )
}