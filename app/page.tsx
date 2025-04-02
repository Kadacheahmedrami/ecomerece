import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/products"
import { Suspense } from "react"
import { ProductsLoading } from "@/components/products-loading"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const search = searchParams?.search && typeof searchParams.search === "string" 
    ? searchParams.search 
    : undefined

  const products = await getProducts({
    visible: true,
    search,
  })

  return (
    <>
                <Header />
    
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Our Products</h1>
        <p className="text-muted-foreground mb-6">Find high-quality products at affordable prices</p>
      </div>

      <Suspense fallback={<ProductsLoading />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try a different search term to find what you're looking for.</p>
            </div>
          )}
        </div>
      </Suspense>
    </div>
    <Footer />
    </>
  
  )
}

