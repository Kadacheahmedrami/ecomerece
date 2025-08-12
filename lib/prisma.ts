import { PrismaClient } from "@prisma/client"

// Enhanced global type declaration
declare global {
  var __prisma: PrismaClient | undefined
}

// Create a more robust Prisma client configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pool settings for better reliability
    // Note: These go in your schema.prisma file, but shown here for reference
  })
}

// Use globalThis instead of global for better compatibility
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

// Optional: Add connection testing and error handling
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Graceful shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect()
}