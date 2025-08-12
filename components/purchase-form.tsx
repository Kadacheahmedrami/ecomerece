"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Product } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { toast } from "sonner"
import { MinusIcon, PlusIcon } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }).nonempty("Full name is required"),
  email: z.string().email({ message: "Please enter a valid email address" }).nonempty("Email is required"),
  city: z.string().min(2, { message: "Please enter your city" }).nonempty("City is required"),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }).nonempty("Phone number is required"),
  deliveryType: z.enum(["HOME_DELIVERY", "LOCAL_AGENCY_PICKUP"], {
    required_error: "Please select a delivery method",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function PurchaseForm({ product }: { product: Product }) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cities, setCities] = useState<{ id: string; name: string; deliveryFee: number }[]>([])
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  // Fetch cities on component mount
  useEffect(() => {
    setIsLoadingCities(true)
    fetch("/api/cities")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch cities")
        }
        return response.json()
      })
      .then((cityData) => {
        setCities(cityData)
      })
      .catch((error) => {
        console.error("Error loading cities:", error)
      })
      .finally(() => {
        setIsLoadingCities(false)
      })
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      city: "",
      phone: "",
      deliveryType: "HOME_DELIVERY",
    },
  })

  // Update delivery fee when city changes
  useEffect(() => {
    const city = form.watch("city")
    if (city) {
      fetch(`/api/cities/delivery-fee?city=${encodeURIComponent(city)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch delivery fee")
          }
          return response.json()
        })
        .then((data) => {
          setDeliveryFee(data.deliveryFee)
        })
        .catch((error) => {
          console.error("Error getting delivery fee:", error)
          setDeliveryFee(10.0) // Default fee
        })
    }
  }, [form.watch("city")])

  function onSubmit(data: FormValues) {
    // Validate that we have a delivery fee
    if (deliveryFee <= 0) {
      toast.error("Please select a valid city for delivery fee calculation")
      return
    }

    // Show confirmation dialog
    setShowConfirmation(true)
  }

  function handleConfirmPurchase() {
    setIsSubmitting(true)

    // Calculate prices
    const productPrice = product.price // Current price of the product
    const subtotal = productPrice * quantity
    const total = subtotal + deliveryFee

    // Validate that the product is in stock
    if (product.stock < quantity) {
      toast.error(`Sorry, only ${product.stock} items available in stock`)
      setIsSubmitting(false)
      return
    }

    const orderData = {
      customerName: form.getValues().fullName,
      customerEmail: form.getValues().email,
      city: form.getValues().city,
      phone: form.getValues().phone,
      deliveryType: form.getValues().deliveryType,
      productId: product.id,
      quantity: quantity,
      productPrice: productPrice,
      deliveryFee: deliveryFee,
      total: total,
    }

    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to create order: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        setShowConfirmation(false)
        setOrderCompleted(true)
        router.push(`/checkout/success?orderId=${data.order.id}`)
      })
      .catch((error) => {
        console.error("Error creating order:", error)
        toast.error("Failed to create order. Please try again.")
        setShowConfirmation(false)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  function handleGoHome() {
    router.push("/")
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  {isLoadingCities ? (
                    <div className="h-10 w-full rounded-md border border-input bg-muted animate-pulse" />
                  ) : cities.length > 0 ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name} (Delivery: ${city.deliveryFee.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <>
                      <Input
                        placeholder="Enter your city"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          // Set a default delivery fee
                          setDeliveryFee(10.0)
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        No predefined cities available. Using standard delivery fee ($10.00).
                      </p>
                    </>
                  )}
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

            <FormField
              control={form.control}
              name="deliveryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HOME_DELIVERY">Home Delivery</SelectItem>
                      <SelectItem value="LOCAL_AGENCY_PICKUP">Local Agency Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add quantity field */}
            <div>
              <FormLabel>Quantity</FormLabel>
              <div className="flex items-center mt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <div className="w-16 text-center font-medium">{quantity}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              {product.stock < 10 && (
                <p className="text-xs text-muted-foreground mt-1">Only {product.stock} items left in stock</p>
              )}
            </div>

            {/* Price Summary */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-medium">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Price per item:</span>
                <span>${product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee:</span>
                {isLoadingCities ? (
                  <span className="w-16 h-4 bg-muted animate-pulse rounded"></span>
                ) : (
                  <span>${deliveryFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                {isLoadingCities ? (
                  <span className="w-20 h-5 bg-muted animate-pulse rounded"></span>
                ) : (
                  <span>${(product.price * quantity + deliveryFee).toFixed(2)}</span>
                )}
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full">
                Place Order
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Purchase</DialogTitle>
            <DialogDescription>Please review your order details before continuing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <p>
              <strong>Product:</strong> {product.name}
            </p>
            <p>
              <strong>Quantity:</strong> {quantity}
            </p>
            <p>
              <strong>Subtotal:</strong> ${(product.price * quantity).toFixed(2)}
            </p>
            <p>
              <strong>Delivery Fee:</strong> ${deliveryFee.toFixed(2)}
            </p>
            <p>
              <strong>Total:</strong> ${(product.price * quantity + deliveryFee).toFixed(2)}
            </p>
            <p>
              <strong>Delivery Type:</strong>{" "}
              {form.getValues().deliveryType === "HOME_DELIVERY" ? "Home Delivery" : "Local Agency Pickup"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Purchase"}
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
            <DialogDescription>Your order has been placed successfully. Thank you for your purchase!</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Product:</strong> {product.name}
            </p>
            <p>
              <strong>Price:</strong> ${product.price.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              A confirmation email has been sent to your email address.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleGoHome}>Return to Home</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
