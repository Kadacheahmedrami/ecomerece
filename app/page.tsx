import { ProductCard } from "@/components/product-card"
import Footer from "@/components/footer"

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: HomeProps) {
  try {
    // Await the searchParams promise in Next.js 15
    const resolvedSearchParams = await searchParams
    
    const search = resolvedSearchParams?.search && typeof resolvedSearchParams.search === "string" 
      ? resolvedSearchParams.search 
      : undefined

    return (
      <div className=" mx-auto pt-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Our Products</h1>
        
        </div>
        <div className="min-h-[80vh] px-4 w-full overflow-y-auto">
          <ProductCard search={search} />
        </div>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Home page error:', error)
    return (
      <div className=" mx-auto pt-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
        <Footer />
      </div>
    )
  }
}