import { getCities } from "@/lib/cities"
import { checkAdminAccess } from "@/lib/auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { CitiesManager } from "@/components/admin/cities-manager"

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

  const cities = await getCities()

  return (
    <AdminShell> 
      <div className="container py-10">
        <CitiesManager initialCities={cities} />
      </div>
    </AdminShell>
  )
} 