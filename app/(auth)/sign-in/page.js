"use client";

import NextLink from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Button, Card, Chip, Link, Surface } from "@heroui/react";
import { Briefcase, Rocket, Users } from "lucide-react";

const highlights = [
  "Structured mentorship tracks with measurable goals",
  "Student, mentor, and organization workflows in one platform",
  "Career opportunities and live events tailored to your journey",
];

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-2">
        <Surface variant="transparent" className="rounded-4xl border border-white/80 bg-white/70 p-8 backdrop-blur-sm sm:p-10">
          <div className="flex h-full flex-col gap-8">
            <div className="space-y-5">
              <Chip color="accent" variant="soft" className="w-fit">
                <Chip.Label>Mentora Professional Network</Chip.Label>
              </Chip>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                  Welcome back to Mentora
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                  Sign in to continue building your growth path with mentors, projects, events, and
                  career opportunities designed for long-term outcomes.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {highlights.map((item) => (
                <Card key={item} variant="transparent" className="flex flex-row items-start gap-3 rounded-2xl border border-border/70 px-4 py-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                  <p className="text-sm text-foreground/90">{item}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="gap-1 rounded-2xl border border-border/80 px-4 py-3" variant="secondary">
                <Users className="h-4 w-4 text-accent" />
                <p className="text-xl font-semibold">12k+</p>
                <p className="text-xs text-muted">Active learners</p>
              </Card>
              <Card className="gap-1 rounded-2xl border border-border/80 px-4 py-3" variant="secondary">
                <Briefcase className="h-4 w-4 text-accent" />
                <p className="text-xl font-semibold">300+</p>
                <p className="text-xs text-muted">Career openings</p>
              </Card>
              <Card className="gap-1 rounded-2xl border border-border/80 px-4 py-3" variant="secondary">
                <Rocket className="h-4 w-4 text-accent" />
                <p className="text-xl font-semibold">95%</p>
                <p className="text-xs text-muted">Goal completion</p>
              </Card>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button as={NextLink} href="/" variant="secondary">
                Back to home
              </Button>
              <Link as={NextLink} href="/sign-up" className="text-sm no-underline hover:underline">
                Need an account?
                <Link.Icon />
              </Link>
            </div>
          </div>
        </Surface>

        <Card className="rounded-4xl border border-white/80 bg-white/95 p-4 shadow-lg shadow-slate-200/60 sm:p-6" variant="default">
          <Card.Header className="pb-2">
            <Card.Title className="text-2xl">Sign in</Card.Title>
            <Card.Description>Use your Mentora account to continue.</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex w-full justify-center">
              <SignIn
                appearance={{
                  elements: {
                    card: "shadow-none border-0 bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                  },
                }}
                forceRedirectUrl="/onboardings"
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
              />
            </div>
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}
