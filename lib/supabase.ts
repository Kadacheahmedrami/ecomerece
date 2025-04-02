import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire app
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Helper function to upload a file to Supabase storage
export async function uploadProductImage(file: File) {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error } = await supabase.storage.from("ecommerce").upload(filePath, file, {
      contentType: file.type,
    })

    if (error) {
      throw error
    }

    const { data } = supabase.storage.from("ecommerce").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

