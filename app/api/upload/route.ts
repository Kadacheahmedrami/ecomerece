import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// Check if required environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    persistSession: false,
  },
  // Add global timeout settings
  global: {
    fetch: (url, options) => {
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set a 30-second timeout
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      return fetch(url, { ...options, signal })
        .finally(() => clearTimeout(timeoutId));
    },
  },
});

const BUCKET_NAME = "ecommerce";

// Cache bucket status to avoid checking it for every request
let isBucketInitialized = false;

// Helper function to ensure bucket exists
async function ensureBucketExists() {
  if (isBucketInitialized) return true;
  
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        return false;
      }
      console.log(`Bucket ${BUCKET_NAME} created successfully`);
    }
    
    isBucketInitialized = true;
    return true;
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
    return false;
  }
}

// Set a maximum file size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Validate file size before processing
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: "File too large",
        details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 });
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: "Invalid file type",
        details: "Only image files are allowed"
      }, { status: 400 });
    }
    
    // Process file data
    const startTime = Date.now();
    console.log(`Starting upload process for file: ${file.name} (${file.size} bytes)`);
    
    // Get file extension and create a unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    // Ensure bucket exists before upload
    const bucketReady = await ensureBucketExists();
    if (!bucketReady) {
      return NextResponse.json({ error: "Storage bucket not available" }, { status: 500 });
    }
    
    console.log(`Bucket ready, uploading file to ${filePath}`);
    
    // Convert file to ArrayBuffer for upload
    const buffer = await file.arrayBuffer();
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ 
        error: "Failed to upload file",
        details: uploadError.message
      }, { status: 500 });
    }
    
    // Get the public URL
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    
    const endTime = Date.now();
    console.log(`Upload completed in ${endTime - startTime}ms. URL: ${data.publicUrl}`);
    
    return NextResponse.json({
      url: data.publicUrl,
      success: true,
      message: "File uploaded successfully",
      fileSize: file.size,
      processingTime: endTime - startTime
    });
  } catch (error) {
    console.error("Error in upload process:", error);
    return NextResponse.json({
      error: "Failed to upload file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

