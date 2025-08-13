"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash, X, Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface City {
  id: string
  name: string
  deliveryFee: number
}

interface AdminCitiesTableProps {
  cities: City[]
  onCityUpdated?: (city: City) => void
  onCityDeleted?: (cityId: string) => void
}

export default function AdminCitiesTable({ 
  cities,
  onCityUpdated,
  onCityDeleted
}: AdminCitiesTableProps) {
  const [tableData, setTableData] = useState<City[]>(cities)
  const [cityToDelete, setCityToDelete] = useState<string | null>(null)
  const [editingCity, setEditingCity] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ name: string, deliveryFee: number }>({
    name: "",
    deliveryFee: 0
  })
  const router = useRouter()
  
  // Update tableData when cities prop changes
  useEffect(() => {
    setTableData(cities)
  }, [cities])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete city')
      }

      setTableData(tableData.filter(city => city.id !== id))
      
      // Call the callback if provided
      if (onCityDeleted) {
        onCityDeleted(id)
      }
      
      toast.success('City deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete city')
    }
  }

  const startEditing = (city: City) => {
    setEditingCity(city.id)
    setEditValues({
      name: city.name,
      deliveryFee: city.deliveryFee
    })
  }

  const cancelEditing = () => {
    setEditingCity(null)
  }

  const saveEditing = async () => {
    if (!editingCity) return

    try {
      const response = await fetch(`/api/cities/${editingCity}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editValues)
      })

      if (!response.ok) {
        throw new Error('Failed to update city')
      }

      const updatedCity = await response.json()
      
      setTableData(tableData.map(city => 
        city.id === editingCity ? updatedCity : city
      ))
      
      // Call the callback if provided
      if (onCityUpdated) {
        onCityUpdated(updatedCity)
      }
      
      setEditingCity(null)
      toast.success('City updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update city')
    }
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>City</TableHead>
            <TableHead className="text-right">Delivery Fee</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No cities found. Add your first city.
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((city) => (
              <TableRow key={city.id}>
                <TableCell>
                  {editingCity === city.id ? (
                    <Input 
                      value={editValues.name} 
                      onChange={e => setEditValues({...editValues, name: e.target.value})}
                    />
                  ) : (
                    city.name
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingCity === city.id ? (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">DA</span>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-10"
                        value={editValues.deliveryFee}
                        onChange={e => setEditValues({
                          ...editValues, 
                          deliveryFee: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  ) : (
                    `${city.deliveryFee.toFixed(2)} DA`
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end space-x-2">
                    {editingCity === city.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={saveEditing}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEditing}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startEditing(city)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setCityToDelete(city.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {city.name} and its delivery fee.
                                Orders that use this city will not be affected.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(city.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 