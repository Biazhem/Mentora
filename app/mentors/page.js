"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { data } from "@/config/data"

export default function MentorsPage() {
  // Transform mock data to match component structure
  const mentors = data.mentors.map((mentor, idx) => ({
    id: idx + 1,
    name: mentor.name,
    bio: mentor.bio,
    picture: mentor.pic,
    expertise: mentor.expertise,
    experience: mentor.experience,
  }));

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Meet Our Mentors</h1>
        <p className="text-sm text-muted-foreground">
          Learn from experienced professionals in your field
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="flex flex-col hover:shadow-sm transition cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={mentor.picture} alt={mentor.name} />
                  <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{mentor.name}</CardTitle>
                  <CardDescription className="text-xs">{mentor.bio}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              {/* Expertise */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
