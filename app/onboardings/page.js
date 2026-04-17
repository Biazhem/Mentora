"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, Briefcase, GraduationCap } from "lucide-react"

export default function OnboardingsPage() {
  const roles = [
    {
      id: "organization",
      title: "Organization",
      description: "I'm representing a company or institution",
      icon: Building2,
      href: "/onboardings/organization",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "mentor",
      title: "Mentor (Teacher)",
      description: "I'm an experienced professional ready to guide others",
      icon: Briefcase,
      href: "/onboardings/mentor",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "student",
      title: "Student",
      description: "I'm looking to learn and grow with mentorship",
      icon: GraduationCap,
      href: "/onboardings/student",
      color: "from-green-500 to-green-600",
    },
    {
      id: "alumni",
      title: "Alumni / User",
      description: "I'm an alumnus or community member",
      icon: Users,
      href: "/onboardings/user",
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome to Mentora</h1>
          <p className="text-lg text-slate-600">
            Choose your profile type to get started
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <Link key={role.id} href={role.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-slate-300">
                  <CardHeader>
                    {/* Icon Badge */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    <CardTitle className="text-xl text-slate-900">
                      {role.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600 mt-2">
                      {role.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Button
                      className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white`}
                    >
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            You can change your profile type anytime from your account settings
          </p>
        </div>
      </div>
    </div>
  )
}