import { AdminOrderPageClient } from './admin-order-page-client'

interface AdminOrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params

  return <AdminOrderPageClient orderId={id} />
}