"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"

export default function Page() {
  const { user, isLoaded } = useUser()

  const [form, setForm] = useState({
    clerk_id: "",
    name: "",
    email: "",
    university: "",
    degree: "",
  })

  useEffect(() => {
    if (isLoaded && user) {
      setForm({
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
        university: "",
        degree: "",
      })
    }
  }, [isLoaded, user])

  const handleSubmit = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("users")
        .upsert(form, { onConflict: "clerk_id" })

      if (error) throw error

      alert("User information saved successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to save user information.")
    }
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          
          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            readOnly
          />

          <Input
            placeholder="University"
            value={form.university}
            onChange={e => setForm({ ...form, university: e.target.value })}
          />

          <Input
            placeholder="Degree"
            value={form.degree}
            onChange={e => setForm({ ...form, degree: e.target.value })}
          />
        </CardContent>

        <CardFooter>
          <Button className="w-full rounded-xl" onClick={handleSubmit}>
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}