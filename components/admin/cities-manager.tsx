"use client"

import { useState, useEffect } from "react"
import AdminCitiesTable from "@/components/admin/admin-cities-table"
import AdminCityForm from "@/components/admin/admin-city-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Info, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface City {
  id: string
  name: string
  deliveryFee: number
}

interface CitiesManagerProps {
  initialCities?: City[]
  onCitiesUpdate?: () => void
}

export function CitiesManager({ initialCities = [], onCitiesUpdate }: CitiesManagerProps) {
  const [cities, setCities] = useState<City[]>(initialCities)
  const [loading, setLoading] = useState(!initialCities.length)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch cities from API
  const fetchCities = async (): Promise<City[]> => {
    try {
      const response = await fetch('/api/admin/cities', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching cities:', error)
      throw error
    }
  }

  // Function to refresh cities data
  const refreshCities = async () => {
    try {
      setError(null)
      const citiesData = await fetchCities()
      setCities(citiesData)
      // Call the optional callback if provided
      onCitiesUpdate?.()
    } catch (err) {
      console.error('Error refreshing cities:', err)
      setError('Failed to refresh cities data')
    }
  }

  // Load cities if not provided initially
  useEffect(() => {
    if (!initialCities.length) {
      const loadCities = async () => {
        try {
          setLoading(true)
          setError(null)
          const citiesData = await fetchCities()
          setCities(citiesData)
        } catch (err) {
          console.error('Error loading cities:', err)
          setError('Failed to load cities data')
        } finally {
          setLoading(false)
        }
      }

      loadCities()
    } else {
      setLoading(false)
    }
  }, [initialCities.length])

  // Function to handle adding a new city
  const handleCityAdded = async (newCity: City) => {
    setCities(prevCities => [...prevCities, newCity])
    // Optionally refresh from server to ensure consistency
    await refreshCities()
  }

  // Function to handle updating a city in the table
  const handleCityUpdated = async (updatedCity: City) => {
    setCities(prevCities => 
      prevCities.map(city => city.id === updatedCity.id ? updatedCity : city)
    )
    // Optionally refresh from server to ensure consistency
    await refreshCities()
  }

  // Function to handle deleting a city from the table
  const handleCityDeleted = async (cityId: string) => {
    setCities(prevCities => prevCities.filter(city => city.id !== cityId))
    // Optionally refresh from server to ensure consistency
    await refreshCities()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading cities...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Cities & Delivery Fees</h1>
        <div className="flex gap-2">
          <Button 
            onClick={refreshCities}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              onClick={refreshCities}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {cities.length === 0 && !loading && !error && (
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