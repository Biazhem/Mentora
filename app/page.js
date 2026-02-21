"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  ListTodo,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Search,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

export default function HomePage() {
  const features = [
    {
      title: "Job Portal",
      description:
        "Connect with top organizations and apply for roles that match your skills. Track your applications in real-time.",
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      link: "/jobs",
      tags: ["Opportunities", "Careers"],
    },
    {
      title: "Task Management",
      description:
        "High-performance task tracking for teams. Collaborate effectively with mentors and fellow students.",
      icon: <ListTodo className="h-10 w-10 text-primary" />,
      link: "/tasks",
      tags: ["Agile", "Collaboration"],
    },
    {
      title: "Mentorship",
      description:
        "Get guidance from experienced alumni and industry experts. Build relationships that last.",
      icon: <Users className="h-10 w-10 text-primary" />,
      link: "/mentor",
      tags: ["Growth", "Networking"],
    },
    {
      title: "Events",
      description:
        "Stay updated with workshops, webinars, and networking events hosted by our community.",
      icon: <Calendar className="h-10 w-10 text-primary" />,
      link: "/events",
      tags: ["Learning", "Community"],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-12 py-8 px-3">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-primary/5 p-8 md:p-16">
          <div className="relative z-10 max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              New: Mentorship Program 2026
            </Badge>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Bridge the Gap Between{" "}
              <span className="text-primary">Learning</span> and{" "}
              <span className="text-primary">Earning</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Mentora is the all-in-one platform for students, alumni, and
              organizations to collaborate, grow, and succeed together.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">
                  Explore Jobs <Search className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Abstract shapes for visual interest */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </section>

        {/* Core Features */}
        <section>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-2 text-muted-foreground">
              Four powerful pillars supporting your professional journey
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {feature.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-6 text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Button variant="ghost" size="sm" className="group" asChild>
                    <Link href={feature.link}>
                      Explore{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats/Proof Section */}
        <section className="grid gap-8 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">500+</div>
              <p className="text-sm text-muted-foreground">
                Active Tasks Completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">120+</div>
              <p className="text-sm text-muted-foreground">Successful Hires</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">45+</div>
              <p className="text-sm text-muted-foreground">
                Partner Organizations
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mb-8 max-w-xl opacity-90">
            Join Mentora today and connect with mentors, discover job
            opportunities, and manage your tasks like a pro.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
