"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(2, { message: "City name must be at least 2 characters" }),
  deliveryFee: z.coerce.number().positive({ message: "Delivery fee must be a positive number" }),
})

type FormValues = z.infer<typeof formSchema>

interface AdminCityFormProps {
  onCityAdded?: (city: { id: string; name: string; deliveryFee: number }) => void;
}

export default function AdminCityForm({ onCityAdded }: AdminCityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      deliveryFee: 0,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add city")
      }

      // Get the new city data
      const newCity = await response.json()

      // Reset form
      form.reset({
        name: "",
        deliveryFee: 0,
      })

      // Call the callback if provided to update parent component's state
      if (onCityAdded) {
        onCityAdded(newCity)
      }

      toast.success("City added successfully")
      
      // Refresh the page data to show the new city
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add city")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-md p-6">
      <h2 className="text-lg font-semibold mb-4">Add New City</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="deliveryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Fee</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">DA</span>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      className="pl-10"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add City"}
          </Button>
        </form>
      </Form>
    </div>
  )
} 