"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Product } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { createOrder } from "@/lib/actions"

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  address: z.string().min(5, { message: "Please enter your full address" }),
  city: z.string().min(2, { message: "Please enter your city" }),
  zipCode: z.string().min(1, { message: "Please enter your zip code" }),
  country: z.string().min(2, { message: "Please enter your country" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
})

type FormValues = z.infer<typeof formSchema>

export function PurchaseForm({ product }: { product: Product }) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      phone: "",
    },
  })

  function onSubmit(data: FormValues) {
    // Show confirmation dialog
    setShowConfirmation(true)
  }

  async function handleConfirmPurchase() {
    setIsSubmitting(true)
    try {
      const orderId = await createOrder({
        customerName: form.getValues().fullName,
        customerEmail: form.getValues().email,
        address: form.getValues().address,
        city: form.getValues().city,
        state: "", // Not collected in this form
        zipCode: form.getValues().zipCode,
        country: form.getValues().country,
        phone: form.getValues().phone,
        items: [{
          productId: product.id,
          quantity: 1,
          price: product.price
        }],
        total: product.price
      })

      setShowConfirmation(false)
      setOrderCompleted(true)
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      console.error("Error creating order:", error)
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleGoHome() {
    router.push("/")
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Zip Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button type="submit" className="w-full">Place Order</Button>
            </div>
          </form>
        </Form>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase {product.name} for ${product.price.toFixed(2)}. Would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Product:</strong> {product.name}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
            <p><strong>Shipping To:</strong> {form.getValues().fullName}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>Return</Button>
            <Button onClick={handleConfirmPurchase} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Order Completed Dialog */}
      <Dialog open={orderCompleted} onOpenChange={setOrderCompleted}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Order Completed
            </DialogTitle>
            <DialogDescription>
              Your order has been placed successfully. Thank you for your purchase!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Product:</strong> {product.name}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2">A confirmation email has been sent to your email address.</p>
          </div>
          <DialogFooter>
            <Button onClick={handleGoHome}>Return to Home</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 