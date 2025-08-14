'use client'

import { useState, useEffect } from "react"
import { CitiesManager } from "@/components/admin/cities-manager"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define types based on what CitiesManager expects
interface City {
  id: string
  name: string
  deliveryFee: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export function AdminCitiesPageClient() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch cities data
  const fetchCities = async (): Promise<City[]> => {
    try {
      const response = await fetch('/api/admin/cities', {
        cache: 'no-store' // Ensure fresh data on each request
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
    } catch (err) {
      console.error('Error refreshing cities:', err)
      setError('Failed to refresh cities data')
    }
  }

  // Load initial cities data
  useEffect(() => {
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
  }, [])

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

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Optional: Add a refresh button at the top */}
      <div className="flex justify-end">
        <Button 
          onClick={refreshCities}
          variant="outline"
          size="sm"
        >
          Refresh Cities
        </Button>
      </div>
      
      <CitiesManager 
        initialCities={cities} 
        onCitiesUpdate={refreshCities} // Pass refresh function if CitiesManager supports it
      />
    </div>
  )
}