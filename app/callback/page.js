"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

export default function CallbackPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    async function getAndSyncData() {
      if (isLoaded && user) {
        try {
          const userEmail = user.primaryEmailAddress?.emailAddress || ""
          if (!userEmail) {
            router.push("/onboardings")
            return
          }

          // 1. Check if user already exists in database by email
          const { data: userData, error: selectError } = await supabase
            .from("users")
            .select("id, role")
            .eq("email", userEmail)

          if (userData && userData.length > 0) {
            // User already has a record
            const existingUser = userData[0]
            if (existingUser.role) {
              // Has role assigned, go home
              router.push("/")
            } else {
              // No role assigned yet, go to onboarding
              router.push("/onboardings")
            }
            return
          }

          // 2. User not found, create new user record with generated UUID
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: crypto.randomUUID(),
              name: user.fullName || "User",
              email: userEmail,
              pic: user.imageUrl,
              user_type: null, // Will be set during onboarding
              clerk_id: user.id
            })

          if (insertError) throw insertError

          // 3. Redirect to onboarding to set role and profile data
          router.push("/onboardings")
        } catch (err) {
          console.error("Callback sync error:", err)
          // On error, still go to onboardings to let user complete setup manually
          router.push("/onboardings")
        }
      }
    }

    getAndSyncData()
  }, [isLoaded, user, router])

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <div className="text-center">
            <p className="text-sm font-medium">Setting up your profile...</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait while we prepare your account</p>
          </div>
        </div>
      </div>
    </div>
  )
}
