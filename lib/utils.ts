import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "DZD",
    currencyDisplay: "code"
  }).format(amount)
  
  // Remove DZD and add DA at the end
  const numberOnly = formatted.replace("DZD", "").trim()
  return numberOnly + " DA"
}