"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  ListTodo,
  Users,
  Calendar,
  ArrowRight,
  Rocket,
  Search,
  Trophy,
  Zap,
  CheckCircle2,
  Star,
  Globe,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { Card, Button, Chip, Avatar } from "@heroui/react";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Counter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const FEATURES = [
  {
    icon: Briefcase,
    title: "Job Portal",
    description:
      "Connect with top organizations and apply for roles that match your skills. Track applications in real-time.",
    link: "/job",
    color: "primary",
    tags: ["Opportunities", "Careers"],
  },
  {
    icon: ListTodo,
    title: "Task Management",
    description:
      "High-performance task tracking for teams. Collaborate effectively with mentors and fellow students.",
    link: "/tasks",
    color: "success",
    tags: ["Agile", "Collaboration"],
  },
  {
    icon: Users,
    title: "Mentorship",
    description:
      "Get guidance from experienced alumni and industry experts. Build relationships that last.",
    link: "/mentors",
    color: "accent",
    tags: ["Growth", "Networking"],
  },
  {
    icon: Calendar,
    title: "Events",
    description:
      "Stay updated with workshops, webinars, and networking events hosted by our community.",
    link: "/events",
    color: "warning",
    tags: ["Learning", "Community"],
  },
];

const TESTIMONIALS = [
  {
    name: "Ayesha Khan",
    role: "Computer Science Student",
    text: "Mentora connected me with an amazing mentor who helped me land my first internship at a top tech company.",
    avatar: "AK",
  },
  {
    name: "Ali Raza",
    role: "Alumni & Mentor",
    text: "Giving back through Mentora has been incredibly rewarding. I've guided 12 students so far and watching them grow is priceless.",
    avatar: "AR",
  },
  {
    name: "TechCorp Inc.",
    role: "Partner Organization",
    text: "We've hired 8 talented students through Mentora. The quality of candidates and the platform's workflow is outstanding.",
    avatar: "TC",
  },
];

const STATS = [
  { icon: Zap, value: 500, suffix: "+", label: "Tasks Completed", color: "primary" },
  { icon: Trophy, value: 120, suffix: "+", label: "Successful Hires", color: "success" },
  { icon: CheckCircle2, value: 45, suffix: "+", label: "Partner Organizations", color: "accent" },
  { icon: GraduationCap, value: 9000, suffix: "+", label: "Active Learners", color: "warning" },
];

const STEPS = [
  { num: "01", title: "Create Your Profile", desc: "Sign up and tell us about your skills, goals, and interests." },
  { num: "02", title: "Connect & Learn", desc: "Join organizations, get matched with mentors, and start building." },
  { num: "03", title: "Grow & Succeed", desc: "Apply for jobs, complete tasks, and advance your career." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center px-6 lg:px-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/8 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/8 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="space-y-6">
              <Chip variant="secondary" className="gap-1">
                <Star className="size-3" /> New: Mentorship Program 2026
              </Chip>

              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                Bridge the Gap Between{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Learning
                </span>{" "}
                and{" "}
                <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Earning
                </span>
              </h1>

              <p className="max-w-lg text-lg text-muted leading-relaxed">
                Mentora is the all-in-one platform for students, alumni, and
                organizations to collaborate, grow, and succeed together.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="gap-2 group">
                    Get Started
                    <Rocket className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Button>
                </Link>
                <Link href="/job">
                  <Button size="lg" variant="outline" className="gap-2 group">
                    Explore Jobs
                    <Search className="size-5 transition-transform group-hover:scale-110" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {["bg-primary", "bg-accent", "bg-success", "bg-warning"].map((bg, i) => (
                    <div key={i} className={`size-10 rounded-full ${bg} border-2 border-background flex items-center justify-center text-xs font-bold text-white`}>
                      {["A", "K", "R", "M"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold">9,000+ active learners</p>
                  <p className="text-xs text-muted">across 45+ organizations</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200} className="hidden lg:block">
            <div className="relative">
              <div className="relative z-10 rounded-3xl bg-gradient-to-br from-background to-background-secondary p-1 shadow-2xl">
                <div className="rounded-2xl bg-background p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">New Job Alert</p>
                      <p className="text-xs text-muted">Senior Frontend Engineer at TechCorp</p>
                    </div>
                    <Chip size="sm" color="success">New</Chip>
                  </div>
                  <div className="h-px bg-default" />
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Users className="size-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Mentor Match</p>
                      <p className="text-xs text-muted">Connected with Dr. Sara Ahmed</p>
                    </div>
                    <Chip size="sm" color="accent">Active</Chip>
                  </div>
                  <div className="h-px bg-default" />
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Calendar className="size-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Upcoming Event</p>
                      <p className="text-xs text-muted">AI Workshop - June 25, 2026</p>
                    </div>
                    <Chip size="sm" color="warning">Soon</Chip>
                  </div>
                  <div className="h-px bg-default" />
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="size-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Task Completed</p>
                      <p className="text-xs text-muted">Project proposal submitted</p>
                    </div>
                    <Chip size="sm" color="success">Done</Chip>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl bg-primary/10" />
              <div className="absolute -top-6 -left-6 -z-10 h-full w-full rounded-3xl bg-accent/10" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-default bg-background-secondary/50 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl bg-${stat.color}-soft flex items-center justify-center`}>
                  <stat.icon className={`size-6 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold md:text-3xl">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs text-muted md:text-sm">{stat.label}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-14 text-center">
              <Chip variant="secondary" className="mb-4">Features</Chip>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Everything you need to succeed
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Four powerful pillars supporting your professional journey from learning to career
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <FadeIn key={index} delay={index * 100}>
                <Link href={feature.link}>
                  <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <Card.Header>
                      <div className={`mb-4 size-14 rounded-2xl bg-${feature.color}-soft flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <feature.icon className={`size-7 text-${feature.color}`} />
                      </div>
                      <Card.Title className="text-lg">{feature.title}</Card.Title>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {feature.tags.map((tag) => (
                          <Chip key={tag} size="sm" variant="soft">{tag}</Chip>
                        ))}
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <Card.Description className="text-sm leading-relaxed">
                        {feature.description}
                      </Card.Description>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Explore <ArrowRight className="size-4" />
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-background-secondary/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-14 text-center">
              <Chip variant="secondary" className="mb-4">How It Works</Chip>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Three steps to get started
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Simple, fast, and designed to get you results
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-[28px] top-14 hidden h-px w-[calc(100%-56px)] bg-default md:block" />
                  )}
                  <div className="flex gap-4">
                    <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-14 text-center">
              <Chip variant="secondary" className="mb-4">Testimonials</Chip>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Loved by our community
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Hear from students, mentors, and organizations who transformed their careers
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 100}>
                <Card className="h-full">
                  <Card.Content className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="size-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="mb-6 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <Avatar.Fallback className="bg-primary/10 text-primary font-semibold text-xs">{t.avatar}</Avatar.Fallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted">{t.role}</p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <FadeIn>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent px-8 py-16 text-center text-white md:px-16">
            <div className="absolute -left-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold md:text-5xl">
                Ready to take the next step?
              </h2>
              <p className="mx-auto mb-8 max-w-lg opacity-90">
                Join Mentora today and connect with mentors, discover job
                opportunities, and manage your tasks like a pro.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="gap-2 group">
                    Create Free Account
                    <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/job">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                    <Globe className="size-5" /> Explore Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
