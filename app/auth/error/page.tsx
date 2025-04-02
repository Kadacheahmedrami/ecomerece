"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from 'react'

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            {error === 'OAuthCallback' 
              ? 'There was a problem connecting to Google. Please try again.' 
              : 'There was a problem signing you in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>This could be due to a temporary issue or network connectivity problem.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => router.push('/auth/signin')}
          >
            Try Again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}