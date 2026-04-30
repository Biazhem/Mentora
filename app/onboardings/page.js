"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, GraduationCap, ArrowRight } from "lucide-react";

export default function OnboardingsPage() {
  const roles = [
    {
      id: "organization",
      title: "Organization",
      description: "Represent a company, research institution, or startup",
      icon: Building2,
      href: "/onboardings/organization",
      color: "from-blue-600 to-cyan-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      id: "mentor",
      title: "Mentor",
      description: "Share expertise, guide students, and lead sessions",
      icon: Briefcase,
      href: "/onboardings/mentor",
      color: "from-purple-600 to-pink-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      id: "student",
      title: "Student",
      description: "Learn new skills, apply for jobs, and find mentorship",
      icon: GraduationCap,
      href: "/onboardings/student",
      color: "from-emerald-600 to-teal-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Onboarding Process
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Welcome to Mentora
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Choose the path that best fits your goals. We'll help you set up your profile in just a few steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link key={role.id} href={role.href} className="group">
                <Card className="h-full border-slate-200/60 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className={`h-2 w-full bg-gradient-to-r ${role.color}`} />
                  <CardHeader className="pt-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${role.lightColor} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${role.textColor}`} />
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">
                      {role.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-base leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <Button className={`w-full h-12 bg-gradient-to-r ${role.color} hover:opacity-90 text-white font-semibold rounded-xl`}>
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm">
            Need help? Check our <span className="text-slate-600 font-medium cursor-pointer hover:underline">Support Center</span>
          </p>
        </div>
      </div>
    </div>
  );
}
