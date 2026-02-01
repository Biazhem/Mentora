"use client"

import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Page() {
  const data = [
    {
      title: "Organization",
      desc: "Post jobs, manage teams, hire talent",
      url: "/organization",
      highlight: false,
    },
    {
      title: "Alumni / Student / User",
      desc: "Apply for jobs, connect with mentors",
      url: "/student",
      highlight: true,
    },
    {
      title: "Mentor",
      desc: "Guide students, share experience",
      url: "/mentor",
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl w-full">
        {data.map((item, idx) => (
          <Card
            key={idx}
            className={`rounded-2xl transition hover:shadow-lg ${
              item.highlight
                ? "border-primary scale-105"
                : "border-muted"
            }`}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {item.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {item.desc}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center text-sm text-muted-foreground">
              <p>Access core features</p>
              <p>Profile & dashboard</p>
              <p>Email notifications</p>
            </CardContent>

            <CardFooter>
              <Link href={item.url} className="w-full">
                <Button
                  className="w-full rounded-xl"
                  variant={item.highlight ? "default" : "outline"}
                >
                  Continue
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
