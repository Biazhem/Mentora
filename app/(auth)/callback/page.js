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
      if (!isLoaded || !user) return

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress || ""
        if (!userEmail) {
          router.push("/onboarding")
          return
        }

        const res = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            email: userEmail,
            name: user.fullName || "User",
            pic: user.imageUrl,
          }),
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Sync failed")

        if (data.isNew) {
          router.push("/onboarding")
          return
        }

        const clerkId = user.id

        const [studentRow, orgRow, mentorRow] = await Promise.all([
          supabase.from("students").select("id").eq("clerk_id", clerkId).maybeSingle(),
          supabase.from("organizations").select("id").eq("clerk_id", clerkId).maybeSingle(),
          supabase.from("mentors").select("id").eq("clerk_id", clerkId).maybeSingle(),
        ])

        const hasRole = studentRow.data || orgRow.data || mentorRow.data

        if (hasRole) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      } catch (err) {
        console.error("Callback sync error:", err)
        router.push("/onboarding")
      }
    }

    getAndSyncData()
  }, [isLoaded, user, router])

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="center">
          <p className="text-sm font-medium">Setting up your profile...</p>
          <p className="text-xs text-muted-foreground mt-1">Please wait while we prepare your account</p>
        </div>
      </div>
    </div>
  )
}
