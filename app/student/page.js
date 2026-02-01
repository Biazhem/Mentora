"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"

export default function Page() {
  const { user, isLoaded } = useUser()
  const [form, setForm] = useState({
    name: "",
    email: "",
    university: "",
    degree: "",
  })

  // Initialize form.email once Clerk is loaded
  useEffect(() => {
    if (isLoaded && user) {
      setForm(prev => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
      }))
    }
  }, [isLoaded, user])

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("users").upsert({
        email: form.email, // Clerk email
        name: form.name,
        university: form.university,
        degree: form.degree,
      })

      if (error) throw error

      alert("User information saved successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to save user information.")
    }
  }

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
            readOnly // prevent manual edits, since it's from Clerk
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
