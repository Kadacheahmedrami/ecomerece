import Link from "next/link"

export function CategorySection() {
  const categories = [
    {
      name: "Clothing",
      image: "/placeholder.svg?height=300&width=300",
      href: "/products?category=Clothing",
    },
    {
      name: "Accessories",
      image: "/placeholder.svg?height=300&width=300",
      href: "/products?category=Accessories",
    },
    {
      name: "Footwear",
      image: "/placeholder.svg?height=300&width=300",
      href: "/products?category=Footwear",
    },
  ]

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Shop by Category</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Explore our collections by category to find exactly what you're looking for.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className="group relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors z-10 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
              </div>
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="w-full h-[300px] object-cover transition-transform group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

