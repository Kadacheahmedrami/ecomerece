'use client'

import { useState, useEffect } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/admin/columns"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the CustomerColumn type to match what your columns expect
interface CustomerColumn {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  deliveryType: string;
  createdAt: Date;
}

interface CustomerFromAPI {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  deliveryType: string;
  createdAt: string;
}

export function CustomersPageClient() {
  const [customers, setCustomers] = useState<CustomerColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch customers data
  const fetchCustomers = async (): Promise<CustomerColumn[]> => {
    try {
      const response = await fetch('/api/admin/customers', {
        cache: 'no-store' // Ensure fresh data on each request
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }

      const data: CustomerFromAPI[] = await response.json();
      
      // Transform the data to match CustomerColumn type expectations
      const transformedCustomers: CustomerColumn[] = data.map((customer) => ({
        id: customer.id,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        phone: customer.phone,
        city: customer.city,
        deliveryType: customer.deliveryType,
        createdAt: new Date(customer.createdAt) // Convert string to Date
      }));
      
      return transformedCustomers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Function to refresh customers data
  const refreshCustomers = async () => {
    try {
      setError(null)
      const customersData = await fetchCustomers()
      setCustomers(customersData)
    } catch (err) {
      console.error('Error refreshing customers:', err)
      setError('Failed to refresh customers data')
    }
  }

  // Load initial customers data
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        setError(null)
        const customersData = await fetchCustomers()
        setCustomers(customersData)
      } catch (err) {
        console.error('Error loading customers:', err)
        setError('Failed to load customers data')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading customers...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <Button 
          onClick={refreshCustomers}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              onClick={refreshCustomers}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <DataTable<CustomerColumn, unknown> 
        columns={columns} 
        data={customers} 
        searchKey="customerEmail" 
      />
    </div>
  )
}