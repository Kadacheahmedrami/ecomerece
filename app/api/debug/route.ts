import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAccess()
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const data = await request.json()
    console.log("Debug endpoint called with data:", JSON.stringify(data, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: "Debug data received",
      serverInfo: {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        adminEmail: process.env.ADMIN_EMAIL,
        session: isAdmin ? "Valid admin session" : "No admin session"
      }
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ 
      error: "Debug endpoint error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 