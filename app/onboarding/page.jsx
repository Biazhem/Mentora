"use client";

import { Card, Button, Avatar } from "@heroui/react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-row gap-6 items-center justify-center h-svh">
      <Link href="/onboarding/organization">
        <Card className="w-[200px] gap-2">
          <img
            alt="Indie Hackers community"
            className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
            loading="lazy"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"
          />
          <Card.Header>
            <Card.Title>Organization</Card.Title>
            <Card.Description>148 members</Card.Description>
          </Card.Header>
          <Card.Footer className="flex gap-2">
            <Avatar aria-label="Martha's profile picture" className="size-5">
              <Avatar.Image
                alt="Martha's avatar"
                src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
              />
              <Avatar.Fallback className="text-xs">IH</Avatar.Fallback>
            </Avatar>
            <span className="text-xs">By Martha</span>
          </Card.Footer>
        </Card>
      </Link>
      <Link href="/onboarding/mentors">
        <Card className="w-[200px] gap-2">
          <img
            alt="Indie Hackers community"
            className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
            loading="lazy"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"
          />
          <Card.Header>
            <Card.Title>Mentors</Card.Title>
            <Card.Description>148 members</Card.Description>
          </Card.Header>
          <Card.Footer className="flex gap-2">
            <Avatar aria-label="Martha's profile picture" className="size-5">
              <Avatar.Image
                alt="Martha's avatar"
                src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
              />
              <Avatar.Fallback className="text-xs">IH</Avatar.Fallback>
            </Avatar>
            <span className="text-xs">By Martha</span>
          </Card.Footer>
        </Card>
      </Link>
      <Link href="/onboarding/student">
        <Card className="w-[200px] gap-2">
          <img
            alt="Indie Hackers community"
            className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
            loading="lazy"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"
          />
          <Card.Header>
            <Card.Title>Students</Card.Title>
            <Card.Description>148 members</Card.Description>
          </Card.Header>
          <Card.Footer className="flex gap-2">
            <Avatar aria-label="Martha's profile picture" className="size-5">
              <Avatar.Image
                alt="Martha's avatar"
                src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
              />
              <Avatar.Fallback className="text-xs">IH</Avatar.Fallback>
            </Avatar>
            <span className="text-xs">By Martha</span>
          </Card.Footer>
        </Card>
      </Link>
    </div>
  );
}
