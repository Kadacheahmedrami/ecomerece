"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { CheckCircle2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

// helper to format numbers in English and append DA
const formatDA = (value: number | undefined | null) => {
  const num = typeof value === "number" && !isNaN(value) ? value : 0
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} DA`
}

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, { message: "يجب أن يكون الاسم على الأقل حرفين" }).nonempty("الاسم الكامل مطلوب"),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح" }).nonempty("البريد الإلكتروني مطلوب"),
  city: z.string().min(2, { message: "الرجاء إدخال مدينتك" }).nonempty("المدينة is required"),
  phone: z.string().min(5, { message: "الرجاء إدخال رقم هاتف صالح" }).nonempty("رقم الهاتف مطلوب"),
  deliveryType: z.enum(["HOME_DELIVERY", "LOCAL_AGENCY_PICKUP"], {
    required_error: "يرجى اختيار طريقة التوصيل",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function CartCheckoutPage() {
  const { state, clearCart } = useCart()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cities, setCities] = useState<{ id: string; name: string; deliveryFee: number }[]>([])
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const router = useRouter()

  // Redirect if cart is empty
  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/")
      return
    }
  }, [state.items.length, router])

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
      toast.error("يرجى اختيار مدينة صالحة لحساب رسوم التوصيل")
      return
    }

    // Show confirmation dialog
    setShowConfirmation(true)
  }

  function handleConfirmPurchase() {
    setIsSubmitting(true)

    // Calculate totals
    const subtotal = state.totalPrice
    const total = subtotal + deliveryFee

    // Create order data for multiple products
    const orderData = {
      customerName: form.getValues().fullName,
      customerEmail: form.getValues().email,
      city: form.getValues().city,
      phone: form.getValues().phone,
      deliveryType: form.getValues().deliveryType,
      items: state.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        productPrice: item.price,
      })),
      deliveryFee: deliveryFee,
      total: total,
    }

    fetch("/api/orders/bulk", {
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
        clearCart() // Clear the cart after successful order
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

  if (state.items.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDA(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDA(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({state.totalItems} items):</span>
                <span>{formatDA(state.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee:</span>
                {isLoadingCities ? (
                  <span className="w-16 h-4 bg-muted animate-pulse rounded"></span>
                ) : (
                  <span>{formatDA(deliveryFee)}</span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                {isLoadingCities ? (
                  <span className="w-20 h-5 bg-muted animate-pulse rounded"></span>
                ) : (
                  <span>{formatDA(state.totalPrice + deliveryFee)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border shadow-sm">
            <Form {...form}>
              <form dir="rtl" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">إتمام الشراء</h2>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">الاسم الكامل</FormLabel>
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
                        <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
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
                        <FormLabel className="font-bold">المدينة</FormLabel>
                        {isLoadingCities ? (
                          <div className="h-10 w-full rounded-md border border-input bg-muted animate-pulse" />
                        ) : cities.length > 0 ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر مدينتك" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name} (Delivery: {formatDA(city.deliveryFee)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <>
                            <Input
                              placeholder="أدخل مدينتك"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setDeliveryFee(10.0)
                              }}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              لا توجد مدن معرفة مسبقًا. يتم استخدام رسوم توصيل قياسية ({formatDA(10.0)}).
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
                        <FormLabel className="font-bold">رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الهاتف" {...field} />
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
                        <FormLabel className="font-bold">طريقة التوصيل</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر طريقة التوصيل" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HOME_DELIVERY">توصيل إلى المنزل</SelectItem>
                            <SelectItem value="LOCAL_AGENCY_PICKUP">استلام من وكالة محلية</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    إتمام الطلب
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">تأكيد الشراء</DialogTitle>
            <DialogDescription className="font-medium">يرجى مراجعة تفاصيل الطلب قبل المتابعة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <p>
              <strong>Items:</strong> {state.totalItems} products
            </p>
            <p>
              <strong>المجموع الفرعي:</strong> {formatDA(state.totalPrice)}
            </p>
            <p>
              <strong>رسوم التوصيل:</strong> {formatDA(deliveryFee)}
            </p>
            <p>
              <strong>الإجمالي:</strong> {formatDA(state.totalPrice + deliveryFee)}
            </p>
            <p>
              <strong>Delivery Type:</strong>{" "}
              {form.getValues().deliveryType === "HOME_DELIVERY" ? "توصيل إلى المنزل" : "استلام من وكالة محلية"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmPurchase} disabled={isSubmitting}>
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الشراء"}
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
              تم إتمام الطلب
            </DialogTitle>
            <DialogDescription className="font-medium">تم تقديم طلبك بنجاح. شكرًا لشرائك!</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Items:</strong> {state.totalItems} products
            </p>
            <p>
              <strong>Total:</strong> {formatDA(state.totalPrice + deliveryFee)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
