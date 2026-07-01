"use client";

import { useState, useEffect } from "react";
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
} from "@heroui/react";
import { Plus, ArrowLeft } from "lucide-react";
import { Chip } from "@heroui/react";
import { ProgressBar } from "@heroui/react";
import { Modal } from "@heroui/react";
import { Table } from "@heroui/react";
import Link from "next/link";
import { use } from "react";
import { UserPlus, PenLine } from "lucide-react";
import { MentorStudentListBox } from "@/components/custom/mentor-student-listbox";

export default function TeamDetailPage({ params }) {
  const { tid } = use(params);
  const { user } = useUser();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    assignees: new Set(),
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
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();
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
          .from("mentor_teams")
          .select("*")
          .eq("id", tid)
          .maybeSingle();

        if (teamError) throw teamError;

        if (!teamData) {
          setTeam(null);
          return;
        }

        setTeam(teamData);

        const [{ data: mentorData }, { data: studentData }] = await Promise.all([
          supabase
            .from("mentors")
            .select("id")
            .eq("clerk_id", user?.id || "")
            .maybeSingle(),
          supabase
            .from("students")
            .select("id")
            .eq("clerk_id", user?.id || "")
            .maybeSingle(),
        ]);

        let allowedToView = false;
        let manageTeam = false;

        if (mentorData && teamData.mentor_id === mentorData.id) {
          allowedToView = true;
          manageTeam = true;
        }

        if (studentData) {
          const { data: approvedRequests } = await supabase
            .from("mentorship_requests")
            .select("mentor_id")
            .eq("student_id", studentData.id)
            .eq("status", "approved");

          const approvedMentorIds = new Set(
            (approvedRequests || []).map((request) => request.mentor_id).filter(Boolean)
          );

          if (approvedMentorIds.has(teamData.mentor_id)) {
            allowedToView = true;
          }
        }

        if (!allowedToView) {
          setAccessDenied(true);
          setCanManageTeam(false);
          setMembers([]);
          setTasks([]);
          setAvailableStudents([]);
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
          .select("*, team_task_assignees(student_id, user_id, status, users(name, email, pic))")
          .eq("team_id", tid)
          .order("created_at", { ascending: false });

        if (taskData) {
          const enriched = taskData.map((task) => ({
            ...task,
            assignee_details: task.team_task_assignees?.map((ta) => ({
              ...ta,
              ...ta.users,
            })).filter(Boolean) || [],
          }));
          setTasks(enriched);
        }

        if (manageTeam && mentorData) {
          const { data: approvedRequests } = await supabase
            .from("mentorship_requests")
            .select("student_id, students(id, clerk_id, name, email, university, expertise, users!clerk_id(id, name, email, pic))")
            .eq("mentor_id", mentorData.id)
            .eq("status", "approved");

          const memberIds = new Set(memberData?.map((m) => m.student_id) || []);
          const available = (approvedRequests || [])
            .map((r) => {
              const student = r.students;
              if (!student || memberIds.has(student.id)) return null;

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

          setAvailableStudents(available);
        } else {
          setAvailableStudents([]);
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
        .map((studentId) =>
          availableStudents.find((student) => student.id === studentId)
        )
        .filter((student) => student && student.userId)
        .map((student) => ({
          team_id: tid,
          student_id: student.id,
          user_id: student.userId,
          role: "member",
        }));

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

      setAvailableStudents((prev) =>
        prev.filter((student) => !selectedMembers.has(student.id))
      );
      setSelectedMembers(new Set());
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
          team_id: tid,
          created_by: currentUserId,
          title: newTask.title,
          description: newTask.description,
          start_date: newTask.start_date || null,
          end_date: newTask.end_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (newTask.assignees.size > 0 && taskData) {
        const assigneeRows = Array.from(newTask.assignees)
          .map((studentId) =>
            members.find((member) => member.student_id === studentId)
          )
          .filter((member) => member && member.user_id)
          .map((member) => ({
            task_id: taskData.id,
            student_id: member.student_id,
            user_id: member.user_id,
            status: "pending",
          }));
        await supabase.from("team_task_assignees").insert(assigneeRows);
      }

      setTasks((prev) => [{ ...taskData, assignee_details: [] }, ...prev]);
      setNewTask({ title: "", description: "", start_date: "", end_date: "", assignees: new Set() });
    } catch (err) {
      console.error("Create task error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleTaskStatusChange = async (taskId, studentId, newStatus, targetUserId) => {
    if (!canManageTeam && targetUserId !== currentUserId) return;

    const updatedStatus = newStatus === "completed" ? "completed" : "pending";

    const { error } = await supabase
      .from("team_task_assignees")
      .update({
        status: updatedStatus,
        completed_at: updatedStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("task_id", taskId)
      .eq("student_id", studentId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const assignee_details = t.assignee_details.map((a) =>
            a.student_id === studentId ? { ...a, status: updatedStatus } : a
          );

          const taskStatus = assignee_details.length > 0 && assignee_details.every((a) => a.status === "completed")
            ? "completed"
            : "pending";

          return {
            ...t,
            status: taskStatus,
            assignee_details,
          };
        })
      );
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (loading) {
    return (
      <div className="py-12 px-4 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-accent-soft-hover rounded" />
        <div className="h-12 bg-accent-soft-hover rounded" />
        <div className="h-12 bg-accent-soft-hover rounded" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="py-12 px-4">
        <Alert color="danger">You do not have access to this team.</Alert>
      </div>
    );
  }

  if (!team) {
    return <p className="p-6">Team not found</p>;
  }

  return (
    <div className="py-12 px-4">
      <Link href="/mentors/workspace" className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to Workspace
      </Link>

      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm text-muted">{team.description || "No description"}</p>
          <div className="flex items-center gap-3 mt-2">
            <Chip color="primary" variant="soft">{members.length} Members</Chip>
            <Chip color="success" variant="soft">{completedTasks}/{totalTasks} Tasks Completed</Chip>
          </div>
        </div>
        {canManageTeam ? (
          <div className="flex gap-2">
          <Modal>
            <Button variant="secondary">
              <UserPlus className="size-3" /> Add Member
            </Button>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Icon className="bg-default text-foreground">
                      <UserPlus className="size-5" />
                    </Modal.Icon>
                    <Modal.Heading>Add Members to {team.name}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <MentorStudentListBox
                      ariaLabel="Select mentor students"
                      students={availableStudents}
                      selectedKeys={selectedMembers}
                      onSelectionChange={(keys) => setSelectedMembers(keys)}
                      emptyMessage="All approved students are already in this team."
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" variant="secondary">Cancel</Button>
                    <Button
                      slot="close"
                      onClick={handleAddMembers}
                      isLoading={creating}
                      isDisabled={selectedMembers.size === 0}
                    >
                      Add Members
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>

          <Modal>
            <Button>
              <Plus className="size-3" /> Add Task
            </Button>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Icon className="bg-default text-foreground">
                      <PenLine className="size-5" />
                    </Modal.Icon>
                    <Modal.Heading>Create Task for {team.name}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="space-y-3">
                      <TextField>
                        <Label>Title *</Label>
                        <Input
                          placeholder="Task title"
                          fullWidth
                          value={newTask.title}
                          onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                        />
                      </TextField>
                      <TextField>
                        <Label>Description</Label>
                        <TextArea
                          placeholder="Task description"
                          rows={3}
                          fullWidth
                          value={newTask.description}
                          onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                        />
                      </TextField>
                      <div className="grid grid-cols-2 gap-3">
                        <TextField>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            fullWidth
                            value={newTask.start_date}
                            onChange={(e) => setNewTask((p) => ({ ...p, start_date: e.target.value }))}
                          />
                        </TextField>
                        <TextField>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            fullWidth
                            value={newTask.end_date}
                            onChange={(e) => setNewTask((p) => ({ ...p, end_date: e.target.value }))}
                          />
                        </TextField>
                      </div>
                      <div>
                        <Label className="mb-2 block">Assign to Members</Label>
                        <MentorStudentListBox
                          ariaLabel="Assign members"
                          students={members.map((member) => ({
                            id: member.student_id,
                            name: member.name,
                            email: member.email,
                            university: member.university,
                            pic: member.pic,
                          }))}
                          selectedKeys={newTask.assignees}
                          onSelectionChange={(keys) =>
                            setNewTask((p) => ({ ...p, assignees: keys }))
                          }
                          emptyMessage="Add members to this team before assigning tasks."
                        />
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" variant="secondary">Cancel</Button>
                    <Button
                      slot="close"
                      onClick={handleCreateTask}
                      isLoading={creating}
                      isDisabled={!newTask.title}
                    >
                      Create Task
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
          </div>
        ) : null}
      </div>

      <ProgressBar aria-label="Progress" className="w-full mb-6" maxValue={100} value={progressPercent}>
        <div className="flex items-center gap-1">
          <Label>Progress</Label>
          <Chip size="sm">{progressPercent}%</Chip>
        </div>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>

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
                            {member.pic ? (
                              <Avatar.Image src={member.pic} alt={member.name} />
                            ) : null}
                            <Avatar.Fallback>
                              {member.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                            </Avatar.Fallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{member.university || "-"}</Table.Cell>
                      <Table.Cell>{member.email || "-"}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="soft">{member.role}</Chip>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        ) : (
          <p className="text-sm text-muted">No members yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Tasks ({tasks.length})</h2>
        {tasks.length > 0 ? (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Team tasks" className="min-w-[600px]">
                <Table.Header>
                  <Table.Column isRowHeader>Task</Table.Column>
                  <Table.Column>Assignees</Table.Column>
                  <Table.Column>Status</Table.Column>
                </Table.Header>
                <Table.Body>
                  {tasks.map((task) => (
                    <Table.Row key={task.id}>
                      <Table.Cell>
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted line-clamp-1">{task.description}</p>
                          )}
                          {task.start_date && (
                            <p className="text-[10px] text-muted">
                              {task.start_date}{task.end_date ? ` to ${task.end_date}` : ""}
                            </p>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-wrap gap-2">
                          {task.assignee_details.map((a, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <Avatar size="sm" className="size-5">
                                {a.pic ? (
                                  <Avatar.Image src={a.pic} alt={a.name} />
                                ) : null}
                                <Avatar.Fallback className="text-[8px]">
                                  {a.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                                </Avatar.Fallback>
                              </Avatar>
                              {canManageTeam || a.user_id === currentUserId ? (
                                <Select
                                  className="w-24"
                                  placeholder="Status"
                                  selectedKeys={[a.status]}
                                  onSelectionChange={(keys) => {
                                    const val = keys instanceof Set ? Array.from(keys)[0] : keys;
                                    if (val) handleTaskStatusChange(task.id, a.student_id, val, a.user_id);
                                  }}
                                >
                                  <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                  </Select.Trigger>
                                  <Select.Popover>
                                    <ListBox>
                                      <ListBox.Item id="pending" textValue="Pending">
                                        Pending<ListBox.ItemIndicator />
                                      </ListBox.Item>
                                      <ListBox.Item id="completed" textValue="Completed">
                                        Completed<ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    </ListBox>
                                  </Select.Popover>
                                </Select>
                              ) : (
                                <Chip size="sm" variant="soft">{a.status}</Chip>
                              )}
                            </div>
                          ))}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip
                          size="sm"
                          color={task.status === "completed" ? "success" : "warning"}
                        >
                          {task.status}
                        </Chip>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        ) : (
          <p className="text-sm text-muted">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
