"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Button,
  InputGroup,
  Label,
  Description,
  Avatar,
  TextField,
  Input,
  TextArea,
  Alert,
} from "@heroui/react";
import { Search, Plus } from "lucide-react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { ProgressBar } from "@heroui/react";
import { Modal } from "@heroui/react";
import Link from "next/link";
import { MentorStudentListBox } from "@/components/custom/mentor-student-listbox";

export default function WorkspacePage() {
  const { user } = useUser();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMentorUser, setIsMentorUser] = useState(false);
  const [isStudentUser, setIsStudentUser] = useState(false);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: "", description: "", members: new Set() });
  const [creating, setCreating] = useState(false);
  const [mentorId, setMentorId] = useState(null);

  const [fetchError, setFetchError] = useState(null);

  const loadWorkspace = async () => {
    setFetchError(null);
    if (!user) return;

    setLoading(true);
    try {
      const loadTeams = async (teamRows) => {
        if (!teamRows || teamRows.length === 0) {
          setTeams([]);
          return;
        }

        const enriched = await Promise.all(
          teamRows.map(async (team) => {
            const { count: memberCount } = await supabase
              .from("team_members")
              .select("*", { count: "exact", head: true })
              .eq("team_id", team.id);

            const { data: taskIds } = await supabase
              .from("team_tasks")
              .select("id")
              .eq("team_id", team.id);

            let totalAssignees = 0;
            let completedAssignees = 0;
            if (taskIds && taskIds.length > 0) {
              const { data: assigneeData } = await supabase
                .from("team_task_assignees")
                .select("status")
                .in("task_id", taskIds.map((t) => t.id));

              totalAssignees = assigneeData?.length || 0;
              completedAssignees = assigneeData?.filter((a) => a.status === "completed").length || 0;
            }

            const { data: memberRows } = await supabase
              .from("team_members")
              .select("user_id, users(name, pic)")
              .eq("team_id", team.id)
              .limit(3);

            // safe mentor lookup: fetch mentor row directly
            const { data: mentorInfo } = await supabase
              .from("mentors")
              .select("id, name, clerk_id")
              .eq("id", team.mentor_id)
              .maybeSingle();

            // then fetch user by clerk_id to get pic
            let mentorPic = null;
            if (mentorInfo?.clerk_id) {
              const { data: userRow } = await supabase
                .from("users")
                .select("pic, name")
                .eq("clerk_id", mentorInfo.clerk_id)
                .maybeSingle();
              mentorPic = userRow?.pic || null;
            }

            return {
              ...team,
              member_count: memberCount || 0,
              total_assignees: totalAssignees,
              completed_assignees: completedAssignees,
              preview_members: memberRows || [],
              mentor_name: mentorInfo?.name || "Unknown",
              mentor_pic: mentorPic,
            };
          })
        );

        setTeams(enriched);
      };

      const { data: mentorData, error: mentorErr } = await supabase
        .from("mentors")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (mentorErr) throw mentorErr;

      const { data: studentData, error: studentErr } = await supabase
        .from("students")
        .select("id, clerk_id, name")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (studentErr) throw studentErr;

      if (studentData) {
        setIsStudentUser(true);
        setIsMentorUser(false);
        setMentorId(null);

        const { data: approvedReqs, error: approvedErr } = await supabase
          .from("mentorship_requests")
          .select("mentor_id")
          .eq("student_id", studentData.id)
          .eq("status", "approved");

        if (approvedErr) throw approvedErr;

        const mentorIds = [...new Set((approvedReqs || []).map((r) => r.mentor_id).filter(Boolean))];

        if (mentorIds.length === 0) {
          setApprovedStudents([]);
          setTeams([]);
        } else {
          const { data: teamData, error: teamErr } = await supabase
            .from("mentor_teams")
            .select("*")
            .in("mentor_id", mentorIds)
            .order("created_at", { ascending: false });

          if (teamErr) throw teamErr;

          await loadTeams(teamData || []);
        }
      } else if (mentorData) {
        setIsMentorUser(true);
        setIsStudentUser(false);
        setMentorId(mentorData.id);

        const { data: approvedReqs, error: approvedErr } = await supabase
          .from("mentorship_requests")
          .select(
            "student_id, students(id, clerk_id, name, email, university, expertise, users!clerk_id(id, name, email, pic))"
          )
          .eq("mentor_id", mentorData.id)
          .eq("status", "approved");

        if (approvedErr) throw approvedErr;

        const studentList = (approvedReqs || [])
          .map((r) => {
            const student = r.students;
            if (!student) return null;

            return {
              id: student.id,
              userId: student.users?.id || null,
              clerkId: student.clerk_id,
              name: student.name,
              email: student.email,
              university: student.university,
              expertise: student.expertise,
              pic: student.users?.pic || null,
            };
          })
          .filter(Boolean);

        setApprovedStudents(studentList);

        const { data: teamData, error: teamErr } = await supabase
          .from("mentor_teams")
          .select("*")
          .eq("mentor_id", mentorData.id)
          .order("created_at", { ascending: false });

        if (teamErr) throw teamErr;

        await loadTeams(teamData || []);
      } else {
        setIsMentorUser(false);
        setIsStudentUser(false);
        setApprovedStudents([]);
        setTeams([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Workspace init error:", err);
      setFetchError(err?.message || String(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [user]);

  const handleCreateTeam = async () => {
    if (!newTeam.name || !mentorId) return;

    setCreating(true);
    try {
      const selectedStudents = Array.from(newTeam.members)
        .map((studentId) =>
          approvedStudents.find((student) => student.id === studentId)
        )
        .filter((student) => student && student.userId);

      const { data: teamData, error } = await supabase
        .from("mentor_teams")
        .insert({
          mentor_id: mentorId,
          name: newTeam.name,
          description: newTeam.description,
        })
        .select()
        .single();

      if (error) throw error;

      if (selectedStudents.length > 0) {
        const rows = selectedStudents.map((student) => ({
          team_id: teamData.id,
          student_id: student.id,
          user_id: student.userId,
          role: "member",
        }));

        await supabase.from("team_members").insert(rows);
      }

      setTeams((prev) => [
        {
          ...teamData,
          member_count: selectedStudents.length,
          task_count: 0,
          completed_count: 0,
          preview_members: selectedStudents.map((student) => ({
            user_id: student.userId,
            users: {
              name: student.name,
              pic: student.pic,
            },
          })),
        },
        ...prev,
      ]);
      setNewTeam({ name: "", description: "", members: new Set() });
    } catch (err) {
      console.error("Create team error:", err);
    } finally {
      setCreating(false);
    }
  };

  const progressPercent = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const canCreateTeams = isMentorUser && !isStudentUser;

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">My Workspace</h1>
        <p className="text-sm text-muted">
          {isStudentUser
            ? "View teams created by your approved mentor and track assigned work."
            : "Manage teams, tasks and mentor your students"}
        </p>
      </div>

      {isStudentUser ? (
        <Alert color="info" className="mb-6">
          Student accounts can view approved mentor teams only. Team creation is
          available from a mentor account.
        </Alert>
      ) : null}

      <div className="mb-8 flex justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <InputGroup>
            <InputGroup.Prefix>
              <Search className="size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="Search teams"
              className="w-fit"
            />
          </InputGroup>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {canCreateTeams ? (
            <>
              <Modal>
                <Button>
                  <Plus className="size-4" /> Create Team
                </Button>
                <Modal.Backdrop>
                  <Modal.Container>
                    <Modal.Dialog>
                      <Modal.CloseTrigger />
                      <Modal.Header>
                        <Modal.Icon className="bg-default text-foreground">
                          <Plus className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Create Team</Modal.Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <div className="space-y-3">
                          <TextField>
                            <Label>Team Name *</Label>
                            <Input
                              placeholder="e.g., Backend Team"
                              fullWidth
                              value={newTeam.name}
                              onChange={(e) => setNewTeam((p) => ({ ...p, name: e.target.value }))}
                            />
                          </TextField>
                          <TextField>
                            <Label>Description</Label>
                            <TextArea
                              placeholder="Team description"
                              rows={3}
                              fullWidth
                              value={newTeam.description}
                              onChange={(e) => setNewTeam((p) => ({ ...p, description: e.target.value }))}
                            />
                          </TextField>
                          <div>
                            <Label className="mb-2 block">Add Members (optional)</Label>
                            <MentorStudentListBox
                              ariaLabel="Select mentor students"
                              students={approvedStudents}
                              selectedKeys={newTeam.members}
                              onSelectionChange={(keys) =>
                                setNewTeam((p) => ({ ...p, members: keys }))
                              }
                            />
                          </div>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button slot="close" variant="secondary">Cancel</Button>
                        <Button
                          slot="close"
                          onClick={handleCreateTeam}
                          isLoading={creating}
                          isDisabled={!newTeam.name}
                        >
                          Create Team
                        </Button>
                      </Modal.Footer>
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>

              <Button variant="secondary" onClick={loadWorkspace}>Refresh</Button>
            </>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3">
              <div className="h-5 w-40 bg-background-secondary rounded" />
              <div className="h-3 w-full bg-background-secondary rounded" />
              <div className="h-4 w-20 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <Alert color="danger">
          <Alert.Content>
            <Alert.Title>Error loading workspace</Alert.Title>
            <Alert.Description>{fetchError}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : teams.length === 0 ? (
        <Alert color="info">
          {isStudentUser
            ? "No approved mentor teams are available yet."
            : "No teams yet. Use the create team action to get started."}
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/mentors/workspace/teams/${team.id}`}>
              <Card className="cursor-pointer transition hover:shadow-md">
                <Card.Header>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <Card.Title>{team.name}</Card.Title>
                      <div className="flex items-center gap-1 mt-1">
                        <Avatar size="sm" className="size-4">
                          {team.mentor_pic ? <Avatar.Image src={team.mentor_pic} alt={team.mentor_name} /> : null}
                          <Avatar.Fallback className="text-[8px]">{team.mentor_name?.[0] || "?"}</Avatar.Fallback>
                        </Avatar>
                        <span className="text-xs text-muted truncate">{team.mentor_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center -space-x-3 *:ring-2 *:ring-background">
                      {team.preview_members.slice(0, 3).map((m, idx) => (
                        <Avatar key={idx} size="sm">
                          {m.users?.pic ? (
                            <Avatar.Image src={m.users.pic} alt={m.users.name} />
                          ) : null}
                          <Avatar.Fallback className="text-[10px]">
                            {m.users?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                          </Avatar.Fallback>
                        </Avatar>
                      ))}
                      {team.member_count > 3 && (
                        <Avatar size="sm">
                          <Avatar.Fallback className="text-[10px]">+{team.member_count - 3}</Avatar.Fallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </Card.Header>
                <Card.Content>
                  <Description className="line-clamp-1">{team.description || "No description"}</Description>
                </Card.Content>
                <Card.Footer className="flex flex-col items-start gap-2">
                  <ProgressBar
                    aria-label="Task progress"
                    className="w-full"
                    maxValue={100}
                    minValue={0}
                    value={progressPercent(team.completed_assignees, team.total_assignees)}
                  >
                    <div className="flex items-center gap-1">
                      <Label>Tasks</Label>
                      <Chip size="sm">{team.completed_assignees}/{team.total_assignees} Assignees</Chip>
                    </div>
                    <ProgressBar.Output />
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                </Card.Footer>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
