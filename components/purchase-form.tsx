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
      toast.error("يرجى اختيار مدينة صالحة لحساب رسوم التوصيل")
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



  return (
    <>
      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border shadow-sm text-base md:text-lg">
     

        <Form  {...form}>
      
          <form dir="rtl" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl mx-auto  md:text-3xl font-bold mb-4">إتمام الشراء</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-sm md:text-base">الاسم الكامل</FormLabel>
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
                  <FormLabel className="font-bold text-sm md:text-base">البريد الإلكتروني</FormLabel>
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
                  <FormLabel className="font-bold text-sm md:text-base">المدينة</FormLabel>
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
                          // Set a default delivery fee
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
                  <FormLabel className="font-bold text-sm md:text-base">رقم الهاتف</FormLabel>
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
                  <FormLabel className="font-bold text-sm md:text-base">طريقة التوصيل</FormLabel>
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

            {/* Add quantity field */}
            <div>
              <FormLabel className="font-bold text-sm md:text-base">الكمية</FormLabel>
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
                <div className="w-16 text-center font-bold text-lg md:text-xl">{quantity}</div>
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
                <p className="text-xs text-muted-foreground mt-1">تبقى {product.stock} قطعة فقط في المخزون</p>
              )}
            </div>

            {/* Price Summary */}
            <div className="space-y-2 pt-4 border-t md:col-span-2">
              <h3 className="font-medium">ملخص الطلب</h3>
              <div className="flex justify-between text-sm md:text-base font-semibold">
                <span>سعر القطعة:</span>
                <span>{formatDA(product.price)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base font-semibold">
                <span>الكمية:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base font-semibold">
                <span>المجموع الفرعي:</span>
                <span>{formatDA(product.price * quantity)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base font-semibold">
                <span>رسوم التوصيل:</span>
                {isLoadingCities ? (
                  <span className="w-16 h-4 bg-muted animate-pulse rounded"></span>
                ) : (
                  <span>{formatDA(deliveryFee)}</span>
                )}
              </div>
              <div className="flex justify-between text-lg md:text-xl font-bold">
                <span>الإجمالي:</span>
                {isLoadingCities ? (
                  <span className="w-20 h-5 bg-muted animate-pulse rounded"></span>
                ) : (
                  <span>{formatDA(product.price * quantity + deliveryFee)}</span>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                إتمام الطلب
              </Button>
            </div>
          </div>
          </form>
        </Form>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-bold">تأكيد الشراء</DialogTitle>
            <DialogDescription className="text-sm md:text-base font-medium">يرجى مراجعة تفاصيل الطلب قبل المتابعة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <p>
              <strong>المنتج:</strong> {product.name}
            </p>
            <p>
              <strong>الكمية:</strong> {quantity}
            </p>
            <p>
              <strong>المجموع الفرعي:</strong> {formatDA(product.price * quantity)}
            </p>
            <p>
              <strong>رسوم التوصيل:</strong> {formatDA(deliveryFee)}
            </p>
            <p>
              <strong>الإجمالي:</strong> {formatDA(product.price * quantity + deliveryFee)}
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

      {/* تم إتمام الطلب Dialog */}
      <Dialog open={orderCompleted} onOpenChange={setOrderCompleted}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              تم إتمام الطلب
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base font-medium">تم تقديم طلبك بنجاح. شكرًا لشرائك!</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>المنتج:</strong> {product.name}
            </p>
            <p>
              <strong>السعر:</strong> {formatDA(product.price)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.
            </p>
          </div>
    
        </DialogContent>
      </Dialog>
    </>
  )
}
