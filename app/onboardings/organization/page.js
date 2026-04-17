"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload } from "lucide-react"

export default function OrganizationOnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoBase64, setLogoBase64] = useState(null)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    category: "",
  })

  useEffect(() => {
    // Organization name is separate from user name - don't pre-fill
    if (isLoaded && user) {
      // Form stays empty - user must enter organization name
    }
  }, [isLoaded, user])

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
      setLogoBase64(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!user) return
    setIsSubmitting(true)
    setError(null)

    try {
      const userEmail = user.primaryEmailAddress?.emailAddress || ""
      if (!userEmail) throw new Error("No email found from Clerk")

      // Validate form
      const orgName = form.name.trim()
      if (!orgName) throw new Error("Organization name is required")
      if (!form.website.trim()) throw new Error("Website is required")

      // 1. Check if organization name already exists
      const { data: existingOrg, error: checkOrgError } = await supabase
        .from("organisation")
        .select("id")
        .eq("name", orgName)

      if (checkOrgError) throw checkOrgError
      if (existingOrg && existingOrg.length > 0) {
        throw new Error("Organization name already exists. Please choose a different name.")
      }

      // 2. Get the user UUID by email
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)

      if (userFetchError) throw userFetchError
      if (!userData || userData.length === 0) throw new Error("User record not found in database")

      const userId = userData[0].id

      // 3. Update user in 'users' table with role and user's actual name
      const { error: userError } = await supabase
        .from("users")
        .update({
          name: user.fullName || "User",
          pic: user.imageUrl || "null",
          user_type: "organisation",
        })
        .eq("id", userId)

      if (userError) throw userError

      // 4. Create entry in 'organizations' table
      const { error: orgError } = await supabase
        .from("organisation")
        .upsert({
          owner_id: userId,
          name: orgName,
          category: form.category || null,
          description: form.description || null,
          website: form.website,
          logo: logoBase64 || null,
        })

      if (orgError) throw orgError

      router.push("/")
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to save organization information")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
          <CardTitle className="text-2xl">Organization Profile</CardTitle>
          <CardDescription className="text-blue-100">
            Tell us about your organization
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-900">
                Organization Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter organization name"
                value={form.name}
                onChange={handleInputChange}
                className="border-slate-200"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-slate-900">
                Website *
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={handleInputChange}
                className="border-slate-200"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-900">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., Technology, Education, Finance"
                value={form.category}
                onChange={handleInputChange}
                className="border-slate-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-900">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell us about your organization, mission, and values..."
                value={form.description}
                onChange={handleInputChange}
                rows={5}
                className="border-slate-200 resize-none"
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-medium text-slate-900">
                Organization Logo
              </Label>
              <div className="space-y-3">
                {logoPreview && (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">Logo preview</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null)
                          setLogoBase64(null)
                        }}
                        className="text-blue-600 hover:underline text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-900">Upload logo</p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
          >
            {isSubmitting ? "Saving..." : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}