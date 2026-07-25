"use client";

import { useState, useEffect, use } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Button,
  Label,
  Description,
  Avatar,
  ListBox,
  Select,
  Alert,
  TextField,
  Input,
  TextArea,
  Chip,
  ProgressBar,
  Modal,
  Table,
} from "@heroui/react";
import Link from "next/link";
import { UserPlus, PenLine, Link2, Plus, ArrowLeft } from "lucide-react";
import { MentorStudentListBox } from "@/components/custom/mentor-student-listbox";

export default function TeamDetailPage({ params }) {
  const { tid } = use(params);
  const { user } = useUser();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "", description: "", start_date: "", end_date: "", assignees: new Set(),
  });
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [availableStudents, setAvailableStudents] = useState([]);
  const [creating, setCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [canManageTeam, setCanManageTeam] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function getCurrentUser() {
      if (!user) return;
      const { data } = await supabase.from("users").select("id").eq("clerk_id", user.id).single();
      if (data) setCurrentUserId(data.id);
    }
    getCurrentUser();
  }, [user]);

  useEffect(() => {
    async function fetchTeamData() {
      if (!tid) return;
      setLoading(true);
      setAccessDenied(false);
      try {
        const { data: teamData, error: teamError } = await supabase
          .from("mentor_teams").select("*, mentors(name, users!clerk_id(name, pic))").eq("id", tid).maybeSingle();
        if (teamError) throw teamError;
        if (!teamData) { setTeam(null); return; }
        setTeam(teamData);

        const [{ data: mentorData }, { data: studentData }] = await Promise.all([
          supabase.from("mentors").select("id").eq("clerk_id", user?.id || "").maybeSingle(),
          supabase.from("students").select("id").eq("clerk_id", user?.id || "").maybeSingle(),
        ]);

        let allowedToView = false;
        let manageTeam = false;

        if (mentorData && teamData.mentor_id === mentorData.id) {
          allowedToView = true;
          manageTeam = true;
        }
        if (studentData) {
          const { data: approvedRequests } = await supabase
            .from("mentorship_requests").select("mentor_id")
            .eq("student_id", studentData.id).eq("status", "approved");
          const approvedMentorIds = new Set((approvedRequests || []).map((r) => r.mentor_id).filter(Boolean));
          if (approvedMentorIds.has(teamData.mentor_id)) allowedToView = true;
        }

        if (!allowedToView) {
          setAccessDenied(true);
          return;
        }

        setCanManageTeam(manageTeam);

        const { data: memberData } = await supabase
          .from("team_members")
          .select("student_id, user_id, role, joined_at, students(id, clerk_id, name, email, university, expertise, users!clerk_id(id, name, email, pic)), users(id, name, email, pic)")
          .eq("team_id", tid);

        if (memberData) {
          setMembers(memberData.map((m) => ({
            ...m,
            name: m.users?.name || m.students?.name || "Unknown",
            email: m.users?.email || m.students?.email,
            pic: m.users?.pic || m.students?.users?.pic || null,
            university: m.students?.university,
            expertise: m.students?.expertise,
          })));
        }

        const { data: taskData } = await supabase
          .from("team_tasks")
          .select("*, team_task_assignees(student_id, user_id, status, links, users(name, email, pic))")
          .eq("team_id", tid)
          .order("created_at", { ascending: false });

        if (taskData) {
          setTasks(taskData.map((task) => ({
            ...task,
            assignee_details: task.team_task_assignees?.map((ta) => ({ ...ta, ...ta.users })).filter(Boolean) || [],
          })));
        }

        if (manageTeam && mentorData) {
          const { data: approvedRequests } = await supabase
            .from("mentorship_requests")
            .select("student_id, students(id, clerk_id, name, email, university, expertise, users!clerk_id(id, name, email, pic))")
            .eq("mentor_id", mentorData.id).eq("status", "approved");

          const memberIds = new Set(memberData?.map((m) => m.student_id) || []);
          setAvailableStudents(
            (approvedRequests || [])
              .map((r) => {
                const s = r.students;
                if (!s || memberIds.has(s.id)) return null;
                return { id: s.id, userId: s.users?.id || null, clerkId: s.clerk_id, name: s.name, email: s.email, university: s.university, expertise: s.expertise, pic: s.users?.pic || null };
              })
              .filter(Boolean)
          );
        }
      } catch (err) {
        console.error("Fetch team error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, [tid, user]);

  const handleAddMembers = async () => {
    if (!canManageTeam || selectedMembers.size === 0) return;
    setCreating(true);
    try {
      const rows = Array.from(selectedMembers)
        .map((sid) => availableStudents.find((s) => s.id === sid))
        .filter((s) => s?.userId)
        .map((s) => ({ team_id: tid, student_id: s.id, user_id: s.userId, role: "member" }));

      const { error } = await supabase.from("team_members").insert(rows);
      if (error) throw error;

      const { data: memberData } = await supabase
        .from("team_members")
        .select("student_id, user_id, role, joined_at, students(name, email, university), users(name, email, pic)")
        .eq("team_id", tid);

      if (memberData) {
        setMembers(memberData.map((m) => ({
          ...m,
          name: m.users?.name || m.students?.name || "Unknown",
          email: m.users?.email || m.students?.email,
          pic: m.users?.pic || null,
          university: m.students?.university,
        })));
      }

      setAvailableStudents((prev) => prev.filter((s) => !selectedMembers.has(s.id)));
      setSelectedMembers(new Set());

      for (const student of rows) {
        if (student.user_id) {
          await supabase.from("notifications").insert({
            user_id: student.user_id, org_id: null, type: "mentorship",
            title: "Added to Team", message: `You have been added to team "${team.name}"`, entity_id: tid,
          });
        }
      }
    } catch (err) {
      console.error("Add members error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!canManageTeam || !newTask.title || !currentUserId) return;
    setCreating(true);
    try {
      const { data: taskData, error } = await supabase
        .from("team_tasks")
        .insert({
          team_id: tid, created_by: currentUserId, title: newTask.title,
          description: newTask.description, start_date: newTask.start_date || null, end_date: newTask.end_date || null,
        }).select().single();
      if (error) throw error;

      if (newTask.assignees.size > 0 && taskData) {
        const assigneeRows = Array.from(newTask.assignees)
          .map((sid) => members.find((m) => m.student_id === sid))
          .filter((m) => m?.user_id)
          .map((m) => ({ task_id: taskData.id, student_id: m.student_id, user_id: m.user_id, status: "pending" }));
        await supabase.from("team_task_assignees").insert(assigneeRows);
      }

      setTasks((prev) => [{ ...taskData, assignee_details: [] }, ...prev]);
      setNewTask({ title: "", description: "", start_date: "", end_date: "", assignees: new Set() });

      for (const sid of Array.from(newTask.assignees)) {
        const member = members.find((m) => m.student_id === sid);
        if (member?.user_id) {
          await supabase.from("notifications").insert({
            user_id: member.user_id, org_id: null, type: "task",
            title: "Team Task Assigned", message: `"${newTask.title}" has been assigned to you in team "${team.name}"`, entity_id: taskData.id,
          });
        }
      }
    } catch (err) {
      console.error("Create task error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleTaskStatusChange = async (taskId, studentId, newStatus) => {
    const { error } = await supabase
      .from("team_task_assignees")
      .update({ status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null })
      .eq("task_id", taskId).eq("student_id", studentId);

    if (!error) {
      setTasks((prev) => prev.map((t) => {
        if (t.id !== taskId) return t;
        const assignee_details = t.assignee_details.map((a) =>
          a.student_id === studentId ? { ...a, status: newStatus } : a
        );
        const allCompleted = assignee_details.length > 0 && assignee_details.every((a) => a.status === "completed");
        const anyDeclined = assignee_details.some((a) => a.status === "declined");
        return { ...t, status: allCompleted ? "completed" : anyDeclined ? "declined" : "pending", assignee_details };
      }));
    }
  };

  const totalTasks = tasks.length;
  const totalAssignees = tasks.reduce((sum, t) => sum + t.assignee_details.length, 0);
  const completedAssignees = tasks.reduce((sum, t) => sum + t.assignee_details.filter((a) => a.status === "completed").length, 0);
  const declinedAssignees = tasks.reduce((sum, t) => sum + t.assignee_details.filter((a) => a.status === "declined").length, 0);
  const pendingAssignees = totalAssignees - completedAssignees - declinedAssignees;
  const progressPercent = totalAssignees === 0 ? 0 : Math.round((completedAssignees / totalAssignees) * 100);

  if (loading) return <div className="py-12 px-4 animate-pulse space-y-4"><div className="h-8 w-48 bg-accent-soft-hover rounded" /><div className="h-12 bg-accent-soft-hover rounded" /><div className="h-12 bg-accent-soft-hover rounded" /></div>;
  if (accessDenied) return <div className="py-12 px-4"><Alert color="danger">You do not have access to this team.</Alert></div>;
  if (!team) return <p className="p-6">Team not found</p>;

  return (
    <div className="py-12 px-4">
      <Link href="/mentors/workspace" className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to Workspace
      </Link>

      {/* Header */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm text-muted">{team.description || "No description"}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Chip color="primary" variant="soft">
              <Avatar size="sm" className="size-4 mr-1">
                {team.mentors?.users?.pic ? <Avatar.Image src={team.mentors.users.pic} alt={team.mentors.name} /> : null}
                <Avatar.Fallback className="text-[8px]">{team.mentors?.name?.[0] || "?"}</Avatar.Fallback>
              </Avatar>
              Mentor: {team.mentors?.name || "Unknown"}
            </Chip>
            <Chip color="primary" variant="soft">{members.length} Members</Chip>
            <Chip color="success" variant="soft">{completedAssignees}/{totalAssignees} Tasks Completed</Chip>
            {declinedAssignees > 0 && <Chip color="danger" variant="soft">{declinedAssignees} Declined</Chip>}
            {pendingAssignees > 0 && <Chip color="warning" variant="soft">{pendingAssignees} Pending</Chip>}
          </div>
        </div>
        {canManageTeam && (
          <div className="flex gap-2">
            <Modal>
              <Button variant="secondary"><UserPlus className="size-3" /> Add Member</Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Icon className="bg-default text-foreground"><UserPlus className="size-5" /></Modal.Icon>
                      <Modal.Heading>Add Members to {team.name}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <MentorStudentListBox ariaLabel="Select mentor students" students={availableStudents} selectedKeys={selectedMembers} onSelectionChange={(keys) => setSelectedMembers(keys)} emptyMessage="All approved students are already in this team." />
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">Cancel</Button>
                      <Button slot="close" onClick={handleAddMembers} isLoading={creating} isDisabled={selectedMembers.size === 0}>Add Members</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>

            <Modal>
              <Button><Plus className="size-3" /> Add Task</Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Icon className="bg-default text-foreground"><PenLine className="size-5" /></Modal.Icon>
                      <Modal.Heading>Create Task for {team.name}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-3">
                        <TextField>
                          <Label>Title *</Label>
                          <Input placeholder="Task title" fullWidth value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} />
                        </TextField>
                        <TextField>
                          <Label>Description</Label>
                          <TextArea placeholder="Task description" rows={3} fullWidth value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} />
                        </TextField>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField>
                            <Label>Start Date</Label>
                            <Input type="date" fullWidth value={newTask.start_date} onChange={(e) => setNewTask((p) => ({ ...p, start_date: e.target.value }))} />
                          </TextField>
                          <TextField>
                            <Label>End Date</Label>
                            <Input type="date" fullWidth value={newTask.end_date} onChange={(e) => setNewTask((p) => ({ ...p, end_date: e.target.value }))} />
                          </TextField>
                        </div>
                        <div>
                          <Label className="mb-2 block">Assign to Members</Label>
                          <MentorStudentListBox ariaLabel="Assign members" students={members.map((m) => ({ id: m.student_id, name: m.name, email: m.email, university: m.university, pic: m.pic }))} selectedKeys={newTask.assignees} onSelectionChange={(keys) => setNewTask((p) => ({ ...p, assignees: keys }))} emptyMessage="Add members to this team before assigning tasks." />
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">Cancel</Button>
                      <Button slot="close" onClick={handleCreateTask} isLoading={creating} isDisabled={!newTask.title}>Create Task</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </div>
        )}
      </div>

      {/* Progress */}
      <ProgressBar aria-label="Progress" className="w-full mb-6" maxValue={100} value={progressPercent}>
        <div className="flex items-center gap-1"><Label>Progress</Label><Chip size="sm">{progressPercent}%</Chip></div>
        <ProgressBar.Output />
        <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
      </ProgressBar>

      {/* Members Table */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">Team Members ({members.length})</h2>
        {members.length > 0 ? (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Team members" className="min-w-[400px]">
                <Table.Header>
                  <Table.Column isRowHeader>Name</Table.Column>
                  <Table.Column>University</Table.Column>
                  <Table.Column>Email</Table.Column>
                  <Table.Column>Role</Table.Column>
                </Table.Header>
                <Table.Body>
                  {members.map((member) => (
                    <Table.Row key={member.student_id}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {member.pic ? <Avatar.Image src={member.pic} alt={member.name} /> : null}
                            <Avatar.Fallback>{member.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}</Avatar.Fallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{member.university || "-"}</Table.Cell>
                      <Table.Cell>{member.email || "-"}</Table.Cell>
                      <Table.Cell><Chip size="sm" variant="soft">{member.role}</Chip></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        ) : <p className="text-sm text-muted">No members yet.</p>}
      </div>

      {/* Tasks Table */}
      <div>
        <h2 className="text-lg font-bold mb-3">Tasks ({tasks.length})</h2>
        {tasks.length > 0 ? (() => {
          const taskRows = tasks.flatMap((task) =>
            task.assignee_details.length > 0
              ? task.assignee_details.map((a) => ({ ...a, task }))
              : [{ task, student_id: null, name: "Unassigned", status: "pending", links: [], pic: null }]
          );
          return (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Team tasks" className="min-w-[800px]">
                <Table.Header>
                  <Table.Column isRowHeader>Task</Table.Column>
                  <Table.Column>Assignee</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column className="justify-end">Links</Table.Column>
                </Table.Header>
                <Table.Body>
                  {taskRows.map((row, idx) => (
                    <Table.Row key={`${row.task.id}-${row.student_id || idx}`}>
                      <Table.Cell>
                        <p className="font-medium text-sm">{row.task.title}</p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Avatar size="sm" className="size-5">
                            {row.pic ? <Avatar.Image src={row.pic} alt={row.name} /> : null}
                            <Avatar.Fallback className="text-[8px]">{row.name?.[0] || "?"}</Avatar.Fallback>
                          </Avatar>
                          <span className="text-xs">{row.name || "Unassigned"}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {row.student_id && row.user_id === currentUserId ? (
                          <Select className="w-24" placeholder="Status" selectedKeys={new Set([row.status || "pending"])}
                            onSelectionChange={(keys) => { const val = keys instanceof Set ? Array.from(keys)[0] : keys; if (val) handleTaskStatusChange(row.task.id, row.student_id, val); }}>
                            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBox.Item id="pending" textValue="Pending">Pending<ListBox.ItemIndicator /></ListBox.Item>
                                <ListBox.Item id="completed" textValue="Completed">Completed<ListBox.ItemIndicator /></ListBox.Item>
                                <ListBox.Item id="declined" textValue="Declined">Declined<ListBox.ItemIndicator /></ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        ) : row.student_id ? (
                          <Chip size="sm" variant="soft" color={row.status === "completed" ? "success" : row.status === "declined" ? "danger" : "default"}>{row.status}</Chip>
                        ) : <Chip size="sm" variant="soft">-</Chip>}
                      </Table.Cell>
                      <Table.Cell>
                        {row.student_id && row.user_id === currentUserId ? (
                          <div className="flex flex-wrap gap-1 items-center">
                            {(row.links?.length || 0) > 0 && row.links.map((url, urlIdx) => (
                              <a key={urlIdx} href={url} target="_blank" rel="noopener noreferrer">
                                <Chip size="sm" variant="soft">{url.length > 30 ? url.slice(0, 30) + "..." : url}</Chip>
                              </a>
                            ))}
                            <Modal>
                              <Modal.Trigger>
                                <Button size="sm" variant="soft">
                                  <Link2 className="size-3" />
                                  {(row.links?.length || 0) > 0 ? "Edit" : "Add Links"}
                                </Button>
                              </Modal.Trigger>
                              <Modal.Backdrop>
                                <Modal.Container size="md">
                                  <Modal.Dialog>
                                    <Modal.CloseTrigger />
                                    <Modal.Header><Modal.Heading>{row.task.title} - Links ({row.name})</Modal.Heading></Modal.Header>
                                    <Modal.Body>
                                      <p className="text-sm text-muted mb-2">Enter comma-separated URLs:</p>
                                      <TextArea placeholder={"https://drive.google.com/file1.pdf, https://figma.com/design"} rows={6} fullWidth defaultValue={(row.links || []).join(", ")} id={`links-${row.task.id}-${row.student_id}`} />
                                      {(row.links?.length || 0) > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {row.links.map((url, urlIdx) => (
                                            <a key={urlIdx} href={url} target="_blank" rel="noopener noreferrer">
                                              <Chip size="sm" variant="soft">{url.length > 40 ? url.slice(0, 40) + "..." : url}</Chip>
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </Modal.Body>
                                    <Modal.Footer>
                                      <Button slot="close" variant="secondary">Cancel</Button>
                                      <Button slot="close" onClick={async () => {
                                        const el = document.getElementById(`links-${row.task.id}-${row.student_id}`);
                                        if (!el) return;
                                        const urls = el.value.split(",").map((u) => u.trim()).filter(Boolean);
                                        const { error: statusErr } = await supabase
                                          .from("team_task_assignees")
                                          .update({ status: "completed", completed_at: new Date().toISOString() })
                                          .eq("task_id", row.task.id)
                                          .eq("student_id", row.student_id);
                                        if (statusErr) console.error("Status update error:", statusErr);

                                        if (urls.length > 0) {
                                          const { error: linksErr } = await supabase
                                            .from("team_task_assignees")
                                            .update({ links: urls })
                                            .eq("task_id", row.task.id)
                                            .eq("student_id", row.student_id);
                                          if (linksErr) console.error("Links save error:", linksErr);
                                        }

                                        setTasks((prev) => prev.map((t) => {
                                          if (t.id !== row.task.id) return t;
                                          const assignee_details = t.assignee_details.map((a) => a.student_id === row.student_id ? { ...a, links: urls, status: "completed" } : a);
                                          return { ...t, status: assignee_details.every((a) => a.status === "completed") ? "completed" : "pending", assignee_details };
                                        }));
                                      }}>Submit</Button>
                                    </Modal.Footer>
                                  </Modal.Dialog>
                                </Modal.Container>
                              </Modal.Backdrop>
                            </Modal>
                          </div>
                        ) : row.student_id ? (
                          <div className="flex flex-wrap gap-1">
                            {(row.links?.length || 0) > 0 ? row.links.map((url, urlIdx) => (
                              <a key={urlIdx} href={url} target="_blank" rel="noopener noreferrer">
                                <Chip size="sm" variant="soft">{url.length > 30 ? url.slice(0, 30) + "..." : url}</Chip>
                              </a>
                            )) : <Chip size="sm" variant="soft">No links</Chip>}
                          </div>
                        ) : null}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
          );
        })() : <p className="text-sm text-muted">No tasks yet.</p>}
      </div>
    </div>
  );
}
