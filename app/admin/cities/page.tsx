import { checkAdminAccess } from "@/lib/auth"
import { AdminShell } from "@/components/admin/admin-shell"
import { CitiesManager } from "@/components/admin/cities-manager"

async function getCities() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/cities`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch cities')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}

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

      <div className="container py-10">
        <CitiesManager initialCities={cities} />
      </div>

  )
}