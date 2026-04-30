"use client";

import React from "react";
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  MoreHorizontal,
  Mail,
  CheckCircle2,
  Calendar,
  Clock,
  LayoutDashboard,
  Video
} from "lucide-react";
import { data, USER_ROLE, tasks } from "@/config/data";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartBarDefault } from "@/components/custom/graphs/bar-chart";

// Shared Chart Config
const chartConfig = {
  count: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
};

// --- Organization Dashboard View ---
function OrganizationView() {
  const organization = data.organizations[0];
  const orgJobs = data.jobs.filter(job => job.org_index === 0);
  
  const applicationData = [
    { month: "Jan", count: 45 }, { month: "Feb", count: 52 },
    { month: "Mar", count: 38 }, { month: "Apr", count: 65 },
    { month: "May", count: 48 }, { month: "Jun", count: 59 },
  ];

  const stats = [
    { title: "Total Jobs", value: orgJobs.length, icon: Briefcase, color: "text-blue-600" },
    { title: "Applications", value: "307", icon: FileText, color: "text-green-600" },
    { title: "Active Candidates", value: "12", icon: Users, color: "text-purple-600" },
    { title: "Hiring Rate", value: "84%", icon: TrendingUp, color: "text-orange-600" }
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
       <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {organization.name}.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={i}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{s.title}</CardTitle><s.icon className={`h-4 w-4 ${s.color}`} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4"><ChartBarDefault data={applicationData} config={chartConfig} title="Application Trends" /></div>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Active Jobs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {orgJobs.map((j, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="text-sm font-medium">{j.title}</p><Badge variant="secondary" className="text-[10px]">{j.type[0]}</Badge></div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Student Dashboard View ---
function StudentView() {
  const appliedJobs = [
    { id: 1, title: "Frontend Developer", company: "Acme Inc", status: "Shortlisted", date: "2024-03-15" },
    { id: 2, title: "AI Engineer", company: "TechNova", status: "Reviewing", date: "2024-03-20" },
  ];

  const recentTasks = tasks.slice(0, 3);
  const joinedEvents = data.events.slice(0, 2);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Track your applications and learning progress.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Applied Jobs</CardTitle><Briefcase className="h-4 w-4 text-blue-600" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{appliedJobs.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Tasks</CardTitle><Clock className="h-4 w-4 text-orange-600" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{recentTasks.filter(t => t.status !== "Completed").length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Joined Events</CardTitle><Calendar className="h-4 w-4 text-purple-600" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{joinedEvents.length}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Application Status</CardTitle><CardDescription>Jobs you've recently applied to</CardDescription></CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors">
                    <th className="h-12 px-4 text-left font-medium">Job Title</th>
                    <th className="h-12 px-4 text-left font-medium">Company</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appliedJobs.map((job) => (
                    <tr key={job.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{job.title}</td>
                      <td className="p-4">{job.company}</td>
                      <td className="p-4"><Badge variant={job.status === "Shortlisted" ? "default" : "secondary"}>{job.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Tasks</CardTitle><CardDescription>Upcoming deadlines</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                </div>
                <Badge variant="outline">{task.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Mentor Dashboard View ---
function MentorView() {
  const myStudents = [
    { id: 1, name: "Zaid Khan", role: "Student", joined: "2024-01-10", avatar: "https://xsgames.co/randomusers/avatar.php?g=male&u=5" },
    { id: 2, name: "Sara Lee", role: "Student", joined: "2024-02-15", avatar: "https://xsgames.co/randomusers/avatar.php?g=female&u=5" },
    { id: 3, name: "Ali Ahmed", role: "Student", joined: "2024-03-01", avatar: "https://xsgames.co/randomusers/avatar.php?g=male&u=6" },
  ];

  const joinedTrendData = [
    { month: "Jan", count: 2 }, { month: "Feb", count: 5 },
    { month: "Mar", count: 8 }, { month: "Apr", count: 12 },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
        <p className="text-muted-foreground">Manage your student teams and sessions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Students</CardTitle><Users className="h-4 w-4 text-blue-600" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{myStudents.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Live Sessions</CardTitle><Video className="h-4 w-4 text-green-600" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">4</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle><Calendar className="h-4 w-4 text-purple-600" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">2</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ChartBarDefault data={joinedTrendData} config={chartConfig} title="Student Onboarding Trend" description="Number of students joined over time" />
        </div>
        
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>My Team</CardTitle><CardDescription>Students currently under your mentorship</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {myStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 border-b last:border-0">
                <Avatar className="h-8 w-8"><AvatarImage src={s.avatar} /><AvatarFallback>{s.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">Joined: {s.joined}</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[10px]">Profile</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  switch (USER_ROLE) {
    case "student":
      return <StudentView />;
    case "mentors":
      return <MentorView />;
    case "organization":
    default:
      return <OrganizationView />;
  }
}
