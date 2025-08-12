"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Product } from "@prisma/client"
import { ImageUpload } from "@/components/admin/image-upload"
import { toast } from "@/components/ui/use-toast"

interface FormValues {
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  visible: boolean
}

interface AdminProductFormProps {
  product?: Product
}

export function AdminProductForm({ product }: AdminProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidationSummary, setShowValidationSummary] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      images: product?.images || [],
      category: product?.category || "",
      stock: product?.stock || 0,
      visible: product?.visible || false,
    },
  })

  // API submission function
  const submitProductData = async (values: FormValues) => {
    try {
      console.log("🔍 API: Starting API submission");
      
      // Log the form values being sent
      console.log("📋 API DATA:", JSON.stringify(values, null, 2));
      
      let response;
      let endpoint;
      let method;
      
      if (product) {
        // Update existing product using PUT
        endpoint = `/api/admin/products/${product.id}`;
        method = 'PUT';
        console.log(`🔄 UPDATE: Updating product ${product.id} via API`);
      } else {
        // Create new product using POST
        endpoint = '/api/admin/products';
        method = 'POST';
        console.log("🔄 CREATE: Creating new product via API");
      }
      
      response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const result = await response.json();
      console.log("📥 API RESPONSE:", result);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${result.error || 'Unknown error'}`);
      }
      
      toast({
        title: "Success",
        description: product ? "Product updated successfully" : "Product created successfully",
      });
      
      // Refresh and redirect on success
      router.refresh();
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
      
      return result;
    } catch (error) {
      console.error("❌ API ERROR:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
      
      throw error;
    }
  }

  // Enhanced client-side validation with better error feedback
  async function onSubmit(values: FormValues) {
    console.log("👉 SUBMIT START: Form submission initiated");
    setIsSubmitting(true)
    
    // Clear previous validation errors
    setValidationErrors([]);
    setShowValidationSummary(false);
    
    // Log the full form values for debugging
    console.log("📋 FORM VALUES:", JSON.stringify(values, null, 2));
    
    // Validation errors array to collect all errors
    const errors: string[] = [];
    
    // Perform all validations and collect errors
    if (!values.name || values.name.length < 2) {
      console.log("❌ VALIDATION FAILED: Name validation failed");
      errors.push("Name is required and must be at least 2 characters");
      form.setError("name", { 
        type: "manual", 
        message: "Required (min 2 characters)" 
      });
    }

    if (!values.description || values.description.length < 10) {
      console.log("❌ VALIDATION FAILED: Description validation failed");
      errors.push("Description is required and must be at least 10 characters");
      form.setError("description", { 
        type: "manual", 
        message: "Required (min 10 characters)" 
      });
    }

    if (!values.price || isNaN(values.price) || values.price <= 0) {
      console.log("❌ VALIDATION FAILED: Price validation failed, value:", values.price);
      errors.push("Price must be a positive number");
      form.setError("price", { 
        type: "manual", 
        message: "Must be a positive number" 
      });
    }

    if (!values.images || !Array.isArray(values.images) || values.images.length === 0) {
      console.log("❌ VALIDATION FAILED: Images validation failed, array:", values.images);
      errors.push("At least one image is required");
      form.setError("images", { 
        type: "manual", 
        message: "At least one image is required" 
      });
    }

    if (!values.category) {
      console.log("❌ VALIDATION FAILED: Category validation failed");
      errors.push("Category is required");
      form.setError("category", { 
        type: "manual", 
        message: "Required" 
      });
    }

    if (values.stock === undefined || values.stock === null || isNaN(values.stock) || !Number.isInteger(values.stock) || values.stock < 0) {
      console.log("❌ VALIDATION FAILED: Stock validation failed, value:", values.stock, "isInteger:", Number.isInteger(values.stock));
      errors.push("Stock must be a non-negative integer");
      form.setError("stock", { 
        type: "manual", 
        message: "Must be a non-negative integer" 
      });
    }
    
    // Show error toast with all validation errors if there are any
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationSummary(true);
      
      toast({
        title: "Validation Errors",
        description: "Please correct the form errors and try again",
        variant: "destructive",
        duration: 5000,
      });
      
      // Scroll to the top of the form to see the validation summary
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      setIsSubmitting(false);
      return;
    }
    
    console.log("✅ VALIDATION PASSED: All form fields validated successfully");

    // Data pre-processing to ensure correct types
    const processedValues = {
      ...values,
      price: typeof values.price === 'string' ? parseFloat(values.price) : values.price,
      stock: typeof values.stock === 'string' ? parseInt(values.stock, 10) : values.stock,
      images: Array.isArray(values.images) ? values.images : [],
    };
    
    console.log("📋 PROCESSED VALUES:", JSON.stringify(processedValues, null, 2));

    try {
      await submitProductData(processedValues);
      console.log("✅ SUBMISSION SUCCESS: Product saved successfully");
    } catch (error) {
      console.error("❌ GLOBAL FORM ERROR:", error);
      
      // Try to get more detailed error information
      let errorMessage = "There was an error saving the product.";
      
      if (typeof error === "string") {
        errorMessage = error;
        console.error("Error is a string:", errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error);
        console.error("Error stringified:", JSON.stringify(error));
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      console.log("🏁 SUBMIT END: Form submission completed");
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {showValidationSummary && validationErrors.length > 0 && (
          <div className="bg-destructive/15 border border-destructive rounded-md p-3 mb-4">
            <h3 className="text-sm font-medium text-destructive mb-2">Please correct the following errors:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-md p-3 mb-2 text-sm text-muted-foreground">
          <p className="font-medium mb-1">Important Notes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All fields marked are required</li>
            <li>Product name must be at least 2 characters</li>
            <li>Description must be at least 10 characters</li>
            <li>Price must be a positive number</li>
            <li>Stock must be a non-negative integer</li>
            <li>At least one product image is required</li>
          </ul>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className={fieldState.error ? "border-l-4 border-destructive pl-2" : ""}>
                <FormLabel className={fieldState.error ? "text-destructive" : ""}>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Premium T-Shirt" {...field} className={fieldState.error ? "border-destructive" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field, fieldState }) => (
              <FormItem className={fieldState.error ? "border-l-4 border-destructive pl-2" : ""}>
                <FormLabel className={fieldState.error ? "text-destructive" : ""}>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Clothing" {...field} className={fieldState.error ? "border-destructive" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem className={fieldState.error ? "border-l-4 border-destructive pl-2" : ""}>
              <FormLabel className={fieldState.error ? "text-destructive" : ""}>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="High-quality cotton t-shirt with premium design..."
                  className={`min-h-32 ${fieldState.error ? "border-destructive" : ""}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <FormItem className={fieldState.error ? "border-l-4 border-destructive pl-2" : ""}>
                <FormLabel className={fieldState.error ? "text-destructive" : ""}>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field, fieldState }) => (
              <FormItem className={fieldState.error ? "border-l-4 border-destructive pl-2" : ""}>
                <FormLabel className={fieldState.error ? "text-destructive" : ""}>Stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field, fieldState }) => (
            <FormItem className={fieldState.error ? "border-l-4 border-destructive pl-2" : ""}>
              <FormLabel className={fieldState.error ? "text-destructive" : ""}>Product Images</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={(urls) => field.onChange(urls)} />
              </FormControl>
              <FormDescription>
                Upload at least one image for your product. The first image will be used as the thumbnail.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visible"
          render={({ field, fieldState }) => (
            <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-4 ${fieldState.error ? "border-destructive" : ""}`}>
              <div className="space-y-0.5">
                <FormLabel className={`text-base ${fieldState.error ? "text-destructive" : ""}`}>Visible</FormLabel>
                <FormDescription>Make this product visible to customers</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}