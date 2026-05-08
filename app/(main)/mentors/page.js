"use client"


import { Avatar} from "@heroui/react"
import { Card } from "@heroui/react"
import Link from "next/link"
import { data } from "@/config/data"
import { Chip } from "@heroui/react"

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
            <Card.Header className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg" >
                  <Avatar.Image src={mentor.picture} alt={mentor.name} />
                  <Avatar.Fallback>{mentor.name.charAt(0)}</Avatar.Fallback>
                </Avatar>
                <div>
                  <Card.Title className="text-lg">{mentor.name}</Card.Title>
                  <Card.Description className="text-xs">{mentor.bio}</Card.Description>
                </div>
              </div>
            </Card.Header>

            <Card.Content className="flex-1">
              {/* Expertise */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, idx) => (
                    <Chip size="sm" key={idx} variant="secondary" >
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  )
}
