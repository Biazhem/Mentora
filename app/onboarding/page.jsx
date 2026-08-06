"use client";

import { Typography, Card, Button, Avatar } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CARDS_DATA = [
  {
    href: "/onboarding/organization",
    alt: "Organizations",
    imgSrc:
      "https://www.shutterstock.com/image-vector/vector-illustration-simple-flat-style-260nw-1705391407.jpg",
    title: "Organization",
    description: "Join as a company, university, or institution",
    fallback: "OR",
    stats: "1,200+ active hubs",
  },
  {
    href: "/onboarding/mentor",
    alt: "Mentors",
    imgSrc:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7PPxV4cP4DMAl_V9g-xfXknLkgSApqhkYZ_kJbEPvLXqMZ_S6lFZm8vyE&s=10",
    title: "Mentor",
    description: "Share your expertise and guide the community",
    fallback: "ME",
    stats: "1,480+ experts",
  },
  {
    href: "/onboarding/student",
    alt: "Students",
    imgSrc:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThs_BrpDjVkeEaZWeVLhqlVyizaWHasGXemlWiZn3fKByyN5hbHAQBfbw&s=10",
    title: "Student",
    description: "Learn skills, build projects, and find mentors",
    fallback: "ST",
    stats: "9,000+ learners",
  },
];

const DOC_CARD = [
  "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/3Uq4BcXvB80wSQ6kXB8hWz/0865c40bcb602e913f533b9985d577f5/GettyImages-1728008421.jpg?w=1500&h=680&q=60&fit=fill&f=faces&fm=jpg&fl=progressive&auto=format%2Ccompress&dpr=1&w=1000",
  "https://media.licdn.com/dms/image/v2/D4E12AQEBTcZ1SUeuXA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1667815678892?e=2147483647&v=beta&t=KyAIsY2IAmJ4V2P3SmvJJcYez0xXCWbc0SreyVxMFCA",
  "https://img.magnific.com/free-photo/joyful-female-colleagues-watching-content-phone_74855-2027.jpg?semt=ais_hybrid&w=740&q=80",
];

export default function Page() {
  const router = useRouter();
  return (
    <div className="w-full grid grid-cols-2">
      <div className="flex flex-row items-center justify-center flex-wrap h-svh p-8 pt-16 gap-2 relative">
        <Button className="absolute top-8 left-8" onClick={() => router.back()}>
          <ArrowLeft />
          Back
        </Button>
        {CARDS_DATA.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="w-[200px] gap-2 ring-0 hover:ring-2 ring-accent transition-all">
              <img
                alt={card.alt}
                className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
                loading="lazy"
                src={card.imgSrc}
              />
              <Card.Header>
                <Card.Title>{card.title}</Card.Title>
                <Card.Description>{card.description}</Card.Description>
              </Card.Header>
              <Card.Footer className="flex gap-2">
                <span className="text-xs text-default-500">{card.stats}</span>
              </Card.Footer>
            </Card>
          </Link>
        ))}
      </div>
      <div className="bg-[url('/grads.png')] bg-cover bg-center w-full h-full hidden flex-col gap-2 p-4 pt-16 lg:flex">
        <Typography.Heading level={1} align="center">
          Welcome to the Mentora
        </Typography.Heading>
        <Typography.Heading level={4} align="center">
          Getting Started with account type
        </Typography.Heading>
        <div className="flex justify-center items-center mt-5 h-full">
          {DOC_CARD.map((itm, idx) => (
            <Card
              className={`w-[200px] gap-2 ${idx % 2 == 1 ? "rotate-6" : "-rotate-6"}`}
            >
              <img
                alt={"hola"}
                className="pointer-events-none aspect-square w-full rounded-2xl object-cover select-none"
                loading="lazy"
                src={itm}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
