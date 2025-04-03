"use client"

import { useState } from "react"
import AdminCitiesTable from "@/components/admin/admin-cities-table"
import AdminCityForm from "@/components/admin/admin-city-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface City {
  id: string
  name: string
  deliveryFee: number
}

interface CitiesManagerProps {
  initialCities: City[]
}

export function CitiesManager({ initialCities }: CitiesManagerProps) {
  const [cities, setCities] = useState<City[]>(initialCities)

  // Function to handle adding a new city
  const handleCityAdded = (newCity: City) => {
    setCities(prevCities => [...prevCities, newCity])
  }

  // Function to handle updating a city in the table
  const handleCityUpdated = (updatedCity: City) => {
    setCities(prevCities => 
      prevCities.map(city => city.id === updatedCity.id ? updatedCity : city)
    )
  }

  // Function to handle deleting a city from the table
  const handleCityDeleted = (cityId: string) => {
    setCities(prevCities => prevCities.filter(city => city.id !== cityId))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Cities & Delivery Fees</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
      </div>

      {cities.length === 0 && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>No cities configured yet</AlertTitle>
          <AlertDescription>
            Add cities and their delivery fees to provide accurate shipping costs to your customers. 
            These cities will appear in the checkout process, allowing customers to select their location 
            and automatically calculate delivery fees.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AdminCitiesTable 
            cities={cities} 
            onCityUpdated={handleCityUpdated} 
            onCityDeleted={handleCityDeleted} 
          />
        </div>
        <div>
          <AdminCityForm onCityAdded={handleCityAdded} />
        </div>
      </div>
    </>
  )
} 