"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  deliveryType: "HOME_DELIVERY" | "LOCAL_AGENCY_PICKUP";
  subtotal: number;
  deliveryFee: number;
  total: number;
  quantity: number;
  productPrice: number;
  product: {
    id: string;
    name: string;
    images?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.push("/404");
      return;
    }

    setLoading(true);

    fetch(`/api/orders/${orderId}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/404");
            return Promise.reject(new Error("الطلب غير موجود"));
          }
          return Promise.reject(new Error(`فشل جلب بيانات الطلب: ${response.status}`));
        }
        return response.json();
      })
      .then((orderData) => {
        setOrder(orderData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "تعذر تحميل الطلب");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12" dir="rtl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">جارٍ تحميل تفاصيل الطلب...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-12" dir="rtl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">خطأ</h1>
          <p className="text-muted-foreground">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const productImage = order.product?.images && order.product.images.length > 0 ? order.product.images[0] : "/placeholder.svg";

  return (
    <div className="container mx-auto max-w-4xl py-12" dir="rtl">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">تم تأكيد الطلب!</h1>
        <p className="text-muted-foreground">شكرًا لشرائك. تم تأكيد طلبك وسيتم شحنه قريبًا.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
            <CardDescription>رقم الطلب #{order.id.slice(-6)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">المجموع الجزئي:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">رسوم التوصيل:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">الإجمالي:</span>
                <span className="font-bold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات التوصيل</CardTitle>
            <CardDescription>{order.deliveryType === "HOME_DELIVERY" ? "توصيل للمنزل" : "استلام من الوكالة المحلية"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.phone}</p>
              <p>المدينة: {order.city}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>المنتج ({order.quantity})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image src={productImage} alt={order.product.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{order.product.name}</h3>
              <p className="text-sm text-muted-foreground">الكمية: {order.quantity}</p>
              <p className="text-sm">السعر: {formatCurrency(order.productPrice)}</p>
            </div>
            <div className="text-left font-medium">{formatCurrency(order.productPrice * order.quantity)}</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">متابعة التسوق <ArrowLeft className="mr-2 h-4 w-4" /></Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
