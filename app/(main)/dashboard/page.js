"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import Link from "next/link";
import {
  Card,
  Chip,
  Avatar,
  Button,
  Alert,
} from "@heroui/react";
import {
  Briefcase,
  Users,
  Calendar,
  CheckSquare,
  GraduationCap,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "default", href }) {
  const inner = (
    <Card className="p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl bg-${color}-soft text-${color}`}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-lg font-bold truncate">{value}</p>
        </div>
      </div>
    </Card>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionCard({ title, children, action }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm text-muted py-4 text-center">{text}</p>;
}

function ListItem({ avatar, title, subtitle, chip }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-default last:border-0">
      <Avatar size="sm">
        {avatar?.pic ? <Avatar.Image src={avatar.pic} alt={avatar.name} /> : null}
        <Avatar.Fallback>{avatar?.name?.charAt(0) || "?"}</Avatar.Fallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
      </div>
      {chip}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    if (!user || !selectedOrganizationId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);

      const { data: userData } = await supabase
        .from("users")
        .select("id, name, pic")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) { setLoading(false); return; }
      setUserId(userData.id);

      const { data: memberData } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", selectedOrganizationId)
        .eq("user_id", userData.id)
        .maybeSingle();

      const role = memberData?.role || "member";
      setUserRole(role);

      const { data: mentorData } = await supabase
        .from("mentors")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();

      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();

      let effectiveRole = role;
      if (role !== "admin" && mentorData) effectiveRole = "mentor";
      else if (role !== "admin" && studentData) effectiveRole = "student";

      setUserRole(effectiveRole);

      if (effectiveRole === "admin") {
        await loadOrgDashboard(selectedOrganizationId, userData.id);
      } else if (effectiveRole === "student") {
        await loadStudentDashboard(userData.id, selectedOrganizationId);
      } else if (effectiveRole === "mentor") {
        await loadMentorDashboard(userData.id, selectedOrganizationId);
      } else {
        await loadMemberDashboard(userData.id, selectedOrganizationId);
      }

      setLoading(false);
    }

    load();
  }, [user, selectedOrganizationId]);

  async function loadOrgDashboard(orgId, currentUserId) {
    const [orgRes, membersRes, tasksRes, jobsRes, eventsRes] = await Promise.all([
      supabase
        .from("organizations")
        .select("org_name, org_logo_url")
        .eq("id", orgId)
        .single(),
      supabase
        .from("organization_members")
        .select("user_id, role, users(name, pic, email)")
        .eq("organization_id", orgId),
      supabase
        .from("tasks")
        .select("id, title, status, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("jobs")
        .select("id, title, job_type, status, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("events")
        .select("id, title, type, start_date, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const orgLogo = orgRes.data?.org_logo_url || null;

    setDashboardData({
      orgLogo,
      memberCount: membersRes.data?.length || 0,
      members: (membersRes.data || []).slice(0, 5),
      tasks: (tasksRes.data || []).map((t) => ({ ...t, org_logo_url: orgLogo })),
      taskCount: tasksRes.data?.length || 0,
      pendingTasks: (tasksRes.data || []).filter((t) => t.status === "pending").length,
      jobs: (jobsRes.data || []).map((j) => ({ ...j, org_logo_url: orgLogo })),
      jobCount: jobsRes.data?.length || 0,
      events: eventsRes.data || [],
      eventCount: eventsRes.data?.length || 0,
    });
  }

  async function loadStudentDashboard(currentUserId, orgId) {
    const [appliedJobsRes, tasksRes, mentorshipRes] = await Promise.all([
      supabase
        .from("job_applications")
        .select("id, status, applied_at, jobs(title, job_type, org_id, organizations(org_logo_url))")
        .eq("user_id", currentUserId)
        .order("applied_at", { ascending: false })
        .limit(10),
      supabase
        .from("task_assignees")
        .select("task_id, tasks(id, title, status, org_id)")
        .eq("user_id", currentUserId),
      supabase
        .from("mentorship_requests")
        .select("id, status, mentors(name, field)")
        .eq("student_id", currentUserId)
        .order("requested_at", { ascending: false })
        .limit(5),
    ]);

    const taskList = (tasksRes.data || [])
      .map((t) => t.tasks)
      .filter(Boolean);

    const taskOrgIds = [...new Set(taskList.map((t) => t.org_id).filter(Boolean))];
    let orgLogoMap = {};
    if (taskOrgIds.length > 0) {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, org_logo_url")
        .in("id", taskOrgIds);
      (orgs || []).forEach((o) => { orgLogoMap[o.id] = o.org_logo_url; });
    }

    setDashboardData({
      appliedJobs: (appliedJobsRes.data || []).map((j) => ({
        ...j,
        org_logo_url: j.jobs?.organizations?.org_logo_url || null,
      })),
      appliedJobCount: appliedJobsRes.data?.length || 0,
      tasks: taskList.slice(0, 5).map((t) => ({ ...t, org_logo_url: orgLogoMap[t.org_id] || null })),
      taskCount: taskList.length,
      pendingTasks: taskList.filter((t) => t.status === "pending").length,
      mentors: mentorshipRes.data || [],
      mentorCount: mentorshipRes.data?.length || 0,
    });
  }

  async function loadMentorDashboard(currentUserId, orgId) {
    const [orgRes, teamsRes, tasksRes] = await Promise.all([
      supabase
        .from("organizations")
        .select("org_logo_url")
        .eq("id", orgId)
        .single(),
      supabase
        .from("mentor_teams")
        .select("id, name, description, team_members(student_id, students(name), users(pic))")
        .eq("mentor_id", currentUserId),
      supabase
        .from("tasks")
        .select("id, title, status, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const orgLogo = orgRes.data?.org_logo_url || null;

    const teamMembers = (teamsRes.data || []).flatMap((t) =>
      (t.team_members || []).map((tm) => ({
        name: tm.students?.name || "Unknown",
        pic: tm.users?.pic,
        team: t.name,
      })),
    );

    setDashboardData({
      teams: teamsRes.data || [],
      teamCount: teamsRes.data?.length || 0,
      teamMembers,
      studentCount: teamMembers.length,
      tasks: (tasksRes.data || []).map((t) => ({ ...t, org_logo_url: orgLogo })),
      taskCount: tasksRes.data?.length || 0,
      pendingTasks: (tasksRes.data || []).filter((t) => t.status === "pending").length,
    });
  }

  async function loadMemberDashboard(currentUserId, orgId) {
    const [tasksRes, appliedJobsRes] = await Promise.all([
      supabase
        .from("task_assignees")
        .select("task_id, tasks(id, title, status, org_id)")
        .eq("user_id", currentUserId),
      supabase
        .from("job_applications")
        .select("id, status, applied_at, jobs(title, job_type, org_id, organizations(org_logo_url))")
        .eq("user_id", currentUserId)
        .order("applied_at", { ascending: false })
        .limit(5),
    ]);

    const taskList = (tasksRes.data || []).map((t) => t.tasks).filter(Boolean);

    const taskOrgIds = [...new Set(taskList.map((t) => t.org_id).filter(Boolean))];
    let orgLogoMap = {};
    if (taskOrgIds.length > 0) {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, org_logo_url")
        .in("id", taskOrgIds);
      (orgs || []).forEach((o) => { orgLogoMap[o.id] = o.org_logo_url; });
    }

    setDashboardData({
      tasks: taskList.slice(0, 5).map((t) => ({ ...t, org_logo_url: orgLogoMap[t.org_id] || null })),
      taskCount: taskList.length,
      pendingTasks: taskList.filter((t) => t.status === "pending").length,
      appliedJobs: (appliedJobsRes.data || []).map((j) => ({
        ...j,
        org_logo_url: j.jobs?.organizations?.org_logo_url || null,
      })),
      appliedJobCount: appliedJobsRes.data?.length || 0,
    });
  }

  if (!selectedOrganizationId) {
    return (
      <div className="container py-10">
        <Alert color="warning">Select an organization from the header to view your dashboard.</Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 px-4 animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-accent-soft-hover" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-accent-soft-hover" />
          ))}
        </div>
      </div>
    );
  }

  const d = dashboardData;

  return (
    <div className="py-12 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">
          {userRole === "admin"
            ? "Overview of your organization"
            : userRole === "student"
              ? "Your learning journey"
              : userRole === "mentor"
                ? "Your mentoring overview"
                : "Your workspace overview"}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userRole === "admin" && (
          <>
            <StatCard icon={Users} label="Members" value={d.memberCount || 0} color="accent" href={`/organization/${selectedOrganizationId}`} />
            <StatCard icon={CheckSquare} label="Tasks" value={d.taskCount || 0} color="primary" href="/tasks" />
            <StatCard icon={Briefcase} label="Jobs" value={d.jobCount || 0} color="success" href="/job" />
            <StatCard icon={Calendar} label="Events" value={d.eventCount || 0} color="warning" href="/events" />
          </>
        )}
        {userRole === "student" && (
          <>
            <StatCard icon={Briefcase} label="Applied Jobs" value={d.appliedJobCount || 0} color="success" href="/job/applied" />
            <StatCard icon={CheckSquare} label="My Tasks" value={d.taskCount || 0} color="primary" href="/tasks" />
            <StatCard icon={GraduationCap} label="Mentors" value={d.mentorCount || 0} color="accent" href="/mentors" />
            <StatCard icon={Clock} label="Pending Tasks" value={d.pendingTasks || 0} color="warning" />
          </>
        )}
        {userRole === "mentor" && (
          <>
            <StatCard icon={Users} label="Students" value={d.studentCount || 0} color="accent" />
            <StatCard icon={TrendingUp} label="Teams" value={d.teamCount || 0} color="primary" href="/mentors/workspace" />
            <StatCard icon={CheckSquare} label="Org Tasks" value={d.taskCount || 0} color="success" href="/tasks" />
            <StatCard icon={Clock} label="Pending Tasks" value={d.pendingTasks || 0} color="warning" />
          </>
        )}
        {userRole === "member" && (
          <>
            <StatCard icon={CheckSquare} label="My Tasks" value={d.taskCount || 0} color="primary" href="/tasks" />
            <StatCard icon={Briefcase} label="Applied Jobs" value={d.appliedJobCount || 0} color="success" href="/job/applied" />
            <StatCard icon={Clock} label="Pending Tasks" value={d.pendingTasks || 0} color="warning" />
          </>
        )}
      </div>

      {/* Sections */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* ---- ORG ADMIN ---- */}
        {userRole === "admin" && (
          <>
            <SectionCard
              title="Recent Tasks"
              action={<Link href="/tasks"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.tasks?.length ? d.tasks.map((t) => (
                <ListItem
                  key={t.id}
                  avatar={t.org_logo_url ? { name: "", pic: t.org_logo_url } : undefined}
                  title={t.title}
                  chip={<Chip size="sm" color={t.status === "completed" ? "success" : t.status === "incomplete" ? "danger" : "accent"}>{t.status}</Chip>}
                />
              )) : <EmptyState text="No tasks yet" />}
            </SectionCard>

            <SectionCard
              title="Members"
              action={<Link href={`/organization/${selectedOrganizationId}`}><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.members?.length ? d.members.map((m, i) => (
                <ListItem
                  key={i}
                  avatar={{ name: m.users?.name, pic: m.users?.pic }}
                  title={m.users?.name || "Unknown"}
                  subtitle={m.users?.email || ""}
                  chip={<Chip size="sm" variant="soft">{m.role}</Chip>}
                />
              )) : <EmptyState text="No members" />}
            </SectionCard>

            <SectionCard
              title="Recent Jobs"
              action={<Link href="/job"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.jobs?.length ? d.jobs.map((j) => (
                <ListItem
                  key={j.id}
                  avatar={j.org_logo_url ? { name: "", pic: j.org_logo_url } : undefined}
                  title={j.title}
                  subtitle={j.job_type}
                  chip={<Chip size="sm" color={j.status === "active" ? "success" : "default"}>{j.status}</Chip>}
                />
              )) : <EmptyState text="No jobs posted" />}
            </SectionCard>

            <SectionCard
              title="Recent Events"
              action={<Link href="/events"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.events?.length ? d.events.map((e) => (
                <ListItem
                  key={e.id}
                  title={e.title}
                  subtitle={e.type || "No type"}
                  chip={e.start_date ? <Chip size="sm" variant="secondary">{new Date(e.start_date).toLocaleDateString()}</Chip> : null}
                />
              )) : <EmptyState text="No events created" />}
            </SectionCard>
          </>
        )}

        {/* ---- STUDENT ---- */}
        {userRole === "student" && (
          <>
            <SectionCard
              title="My Tasks"
              action={<Link href="/tasks"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.tasks?.length ? d.tasks.map((t) => (
                <ListItem
                  key={t.id}
                  avatar={t.org_logo_url ? { name: "", pic: t.org_logo_url } : undefined}
                  title={t.title}
                  chip={<Chip size="sm" color={t.status === "completed" ? "success" : t.status === "incomplete" ? "danger" : "accent"}>{t.status}</Chip>}
                />
              )) : <EmptyState text="No tasks assigned" />}
            </SectionCard>

            <SectionCard
              title="Applied Jobs"
              action={<Link href="/job/applied"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.appliedJobs?.length ? d.appliedJobs.map((j) => (
                <ListItem
                  key={j.id}
                  avatar={j.org_logo_url ? { name: "", pic: j.org_logo_url } : undefined}
                  title={j.jobs?.title || "Unknown"}
                  subtitle={j.jobs?.job_type || ""}
                  chip={<Chip size="sm" color={j.status === "pending" ? "warning" : j.status === "accepted" ? "success" : "default"}>{j.status}</Chip>}
                />
              )) : <EmptyState text="No jobs applied" />}
            </SectionCard>

            <SectionCard
              title="My Mentors"
              action={<Link href="/mentors"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.mentors?.length ? d.mentors.map((m) => (
                <ListItem
                  key={m.id}
                  avatar={{ name: m.mentors?.name }}
                  title={m.mentors?.name || "Unknown"}
                  subtitle={m.mentors?.field || ""}
                  chip={<Chip size="sm" color={m.status === "accepted" ? "success" : m.status === "pending" ? "warning" : "default"}>{m.status}</Chip>}
                />
              )) : <EmptyState text="No mentor connections" />}
            </SectionCard>

            <SectionCard title="Quick Stats">
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{d.appliedJobCount || 0}</p>
                  <p className="text-xs text-muted">Jobs Applied</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{d.mentorCount || 0}</p>
                  <p className="text-xs text-muted">Mentors</p>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ---- MENTOR ---- */}
        {userRole === "mentor" && (
          <>
            <SectionCard
              title="My Teams"
              action={<Link href="/mentors/workspace"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.teams?.length ? d.teams.map((t) => (
                <ListItem
                  key={t.id}
                  title={t.name}
                  subtitle={`${t.team_members?.length || 0} members`}
                />
              )) : <EmptyState text="No teams yet" />}
            </SectionCard>

            <SectionCard title="Students">
              {d.teamMembers?.length ? d.teamMembers.map((s, i) => (
                <ListItem
                  key={i}
                  avatar={{ name: s.name, pic: s.pic }}
                  title={s.name}
                  subtitle={`Team: ${s.team}`}
                />
              )) : <EmptyState text="No students yet" />}
            </SectionCard>

            <SectionCard
              title="Organization Tasks"
              action={<Link href="/tasks"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.tasks?.length ? d.tasks.map((t) => (
                <ListItem
                  key={t.id}
                  avatar={t.org_logo_url ? { name: "", pic: t.org_logo_url } : undefined}
                  title={t.title}
                  chip={<Chip size="sm" color={t.status === "completed" ? "success" : t.status === "incomplete" ? "danger" : "accent"}>{t.status}</Chip>}
                />
              )) : <EmptyState text="No tasks in org" />}
            </SectionCard>

            <SectionCard title="Quick Stats">
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{d.studentCount || 0}</p>
                  <p className="text-xs text-muted">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{d.teamCount || 0}</p>
                  <p className="text-xs text-muted">Teams</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{d.taskCount || 0}</p>
                  <p className="text-xs text-muted">Tasks</p>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ---- MEMBER (default) ---- */}
        {userRole === "member" && (
          <>
            <SectionCard
              title="My Tasks"
              action={<Link href="/tasks"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.tasks?.length ? d.tasks.map((t) => (
                <ListItem
                  key={t.id}
                  avatar={t.org_logo_url ? { name: "", pic: t.org_logo_url } : undefined}
                  title={t.title}
                  chip={<Chip size="sm" color={t.status === "completed" ? "success" : t.status === "incomplete" ? "danger" : "accent"}>{t.status}</Chip>}
                />
              )) : <EmptyState text="No tasks assigned" />}
            </SectionCard>

            <SectionCard
              title="Applied Jobs"
              action={<Link href="/job/applied"><Button isIconOnly variant="secondary" size="sm"><ArrowRight className="size-4" /></Button></Link>}
            >
              {d.appliedJobs?.length ? d.appliedJobs.map((j) => (
                <ListItem
                  key={j.id}
                  avatar={j.org_logo_url ? { name: "", pic: j.org_logo_url } : undefined}
                  title={j.jobs?.title || "Unknown"}
                  subtitle={j.jobs?.job_type || ""}
                  chip={<Chip size="sm" color={j.status === "pending" ? "warning" : j.status === "accepted" ? "success" : "default"}>{j.status}</Chip>}
                />
              )) : <EmptyState text="No jobs applied" />}
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}
