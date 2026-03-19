"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback , AvatarImage} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Edit,
} from "lucide-react";
import { Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { EmailAddress } from "@clerk/nextjs/server";

export default function Page() {
  const { user, isLoaded } = useUser();

  const userData = {
    name: user?.fullName,
    role: "Student",
    email: user?.primaryEmailAddress?.emailAddress,
    phone: "+92 300 1234567",
    location: "Islamabad, Pakistan",
    university: "Islamic International University",
    skills: ["React", "Next.js", "UI Design", "Java"],
    imageUrl: user?.imageUrl
  };

  if (!isLoaded) {
    return <p>loading</p>;
  }

  if (!user) {
    return null;
  }
  return (
    <div className="grid gap-6 md:grid-cols-3 h-full">
      {/* LEFT PROFILE CARD */}

      <Card>
        <CardContent className="flex flex-col items-center text-center p-6">
          <Avatar className="h-44 w-44 mb-4 rounded-lg">
            <AvatarImage
              src={userData.imageUrl}
              alt={userData.fullName ?? "User"}
              className="rounded-full"
            />
            <AvatarFallback className="rounded-lg">
              {userData.firstName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-semibold">{userData.name}</h2>

          <Badge className="mt-2">{userData.role}</Badge>

          <Button className="mt-4 w-full">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* RIGHT DETAILS */}

      <div className="md:col-span-2 space-y-6">
        {/* CONTACT INFO */}

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{userData.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{userData.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{userData.location}</span>
            </div>
          </CardContent>
        </Card>

        {/* EDUCATION */}

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>

          <CardContent className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="font-medium">{userData.university}</p>

              <p className="text-sm text-muted-foreground">
                BS Software Engineering
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SKILLS */}

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {userData.skills.map((skill, i) => (
              <Badge key={i} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* EXPERIENCE */}

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>

          <CardContent className="flex gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="font-medium">Frontend Intern</p>

              <p className="text-xs text-muted-foreground">TechCorp • 2024</p>
              <p className="text-sm">
                Worked as a Frontend Developer Intern at TechCorp. Built
                responsive UI components using React and Tailwind CSS.
                Collaborated with the design team to improve user experience and
                optimized performance of web pages.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
