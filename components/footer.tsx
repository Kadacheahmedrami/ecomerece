import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram, Twitter, Send } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4 max-w-md">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">
                <span className="text-primary">Modern</span>Shop
              </h2>
            </Link>
            <p className="text-muted-foreground">
              Discover the latest trends and high-quality products at affordable prices. Shop with confidence and enjoy a seamless experience.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
          </div>
          </div>

          <div className="w-full md:w-auto">
            <h3 className="font-semibold text-lg mb-4">Subscribe to our newsletter</h3>
            <form className="flex gap-2 max-w-sm">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1" 
                required 
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} ModernShop. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

