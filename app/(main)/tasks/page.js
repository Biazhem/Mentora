"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import {
  Label,
  ListBox,
  Select,
  TextField,
  Input,
  TextArea,
  Description,
  Alert,
  Avatar,
  Surface,
  ModalHeader,
} from "@heroui/react";
import { X, Plus } from "lucide-react";
import { Separator } from "@heroui/react";
import { Search, SlidersHorizontal, Trash } from "lucide-react";
import { Card, Chip, Button, InputGroup } from "@heroui/react";
import { Modal } from "@heroui/react";

async function sendTaskNotification({ orgId, userId, type, title, message, taskId, assigneeIds = [] }) {
  try {
    const targetUserIds = assigneeIds.length > 0 ? assigneeIds : [];

    if (targetUserIds.length > 0) {
      const rows = targetUserIds.map((uid) => ({
        user_id: uid,
        org_id: orgId,
        type: "task",
        title,
        message,
        entity_id: taskId || null,
      }));

      await supabase.from("notifications").insert(rows);
    }

    const { data: adminMembers } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId)
      .eq("role", "admin");

    if (adminMembers) {
      const adminRows = adminMembers
        .filter((m) => m.user_id !== userId && !targetUserIds.includes(m.user_id))
        .map((m) => ({
          user_id: m.user_id,
          org_id: orgId,
          type: "task",
          title,
          message,
          entity_id: taskId || null,
        }));

      if (adminRows.length > 0) {
        await supabase.from("notifications").insert(adminRows);
      }
    }
  } catch (err) {
    console.error("Notification error:", err);
  }
}

export default function TasksPage() {
  const { user } = useUser();
  const selectedOrganizationId = useOrgSelectorStore(
    (s) => s.selectedOrganizationId,
  );
  const members = useOrgSelectorStore((s) => s.members);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [memberTaskCounts, setMemberTaskCounts] = useState({});

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    start_date: "",
    end_date: "",
    assignees: new Set(),
  });

  useEffect(() => {
    async function checkAdmin() {
      if (!user || !selectedOrganizationId) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        setIsAdmin(false);
        return;
      }

      const { data: memberData } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", selectedOrganizationId)
        .eq("user_id", userData.id)
        .maybeSingle();

      setIsAdmin(memberData?.role === "admin");
    }

    checkAdmin();
  }, [user, selectedOrganizationId]);

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
    async function fetchTasks() {
      if (!selectedOrganizationId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: taskData } = await supabase
        .from("tasks")
        .select("*, task_assignees(user_id, users(name, email, pic))")
        .eq("org_id", selectedOrganizationId)
        .order("created_at", { ascending: false });

      if (taskData) {
        const enriched = taskData.map((task) => ({
          ...task,
          assignee_details:
            task.task_assignees?.map((ta) => ta.users).filter(Boolean) || [],
        }));
        setTasks(enriched);

        // Build member task counts
        const counts = {};
        taskData.forEach((task) => {
          (task.task_assignees || []).forEach((ta) => {
            counts[ta.user_id] = (counts[ta.user_id] || 0) + 1;
          });
        });
        setMemberTaskCounts(counts);
      }
      setLoading(false);
    }

    fetchTasks();
  }, [selectedOrganizationId]);

  const updateNewTask = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssigneeChange = (keys) => {
    setNewTask((prev) => ({ ...prev, assignees: keys }));
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );

      const task = tasks.find((t) => t.id === taskId);
      if (task && currentUserId && selectedOrganizationId) {
        const assigneeIds = task.assignee_details?.map((a) => a.id) || [];
        await sendTaskNotification({
          orgId: selectedOrganizationId,
          userId: currentUserId,
          type: "task_status",
          title: `Task ${newStatus === "completed" ? "Completed" : newStatus === "incomplete" ? "Marked Incomplete" : "Updated"}`,
          message: `"${task.title}" status changed to ${newStatus}`,
          taskId,
          assigneeIds,
        });
      }
    }
  };

  const handleCreate = async () => {
    if (!newTask.title || !selectedOrganizationId) return;

    setCreating(true);
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) return;

      const { data: taskData, error } = await supabase
        .from("tasks")
        .insert({
          org_id: selectedOrganizationId,
          created_by: userData.id,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          start_date: newTask.start_date || null,
          end_date: newTask.end_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (newTask.assignees.size > 0 && taskData) {
        const assigneeRows = Array.from(newTask.assignees).map((userId) => ({
          task_id: taskData.id,
          user_id: userId,
        }));

        await supabase.from("task_assignees").insert(assigneeRows);
      }

      setTasks((prev) => [{ ...taskData, assignee_details: [] }, ...prev]);
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        start_date: "",
        end_date: "",
        assignees: new Set(),
      });
      setCreateModalOpen(false);

      const assigneeIds = Array.from(newTask.assignees);
      await sendTaskNotification({
        orgId: selectedOrganizationId,
        userId: userData.id,
        type: "task_created",
        title: "New Task Assigned",
        message: `"${newTask.title}" has been created${assigneeIds.length > 0 ? ` and assigned to ${assigneeIds.length} member(s)` : ""}`,
        taskId: taskData.id,
        assigneeIds,
      });
    } catch (err) {
      console.error("Create task error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!taskId) return;
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const taskToDelete = tasks.find((t) => t.id === taskId);

      await supabase.from("task_assignees").delete().eq("task_id", taskId);

      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      if (taskToDelete && currentUserId && selectedOrganizationId) {
        const assigneeIds = taskToDelete.assignee_details?.map((a) => a.id) || [];
        await sendTaskNotification({
          orgId: selectedOrganizationId,
          userId: currentUserId,
          type: "task_deleted",
          title: "Task Deleted",
          message: `"${taskToDelete.title}" has been deleted`,
          taskId,
          assigneeIds,
        });
      }
    } catch (err) {
      console.error("Delete task error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const searchMatch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(search.toLowerCase()));
    return statusMatch && searchMatch;
  });

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Tasks</h1>
        <p className="text-sm text-muted">
          Track progress and manage deliverables across your workflow
        </p>
      </div>

      {!selectedOrganizationId && (
        <Alert color="warning">
          Select an organization from the header to view tasks.
        </Alert>
      )}

      <div className="mb-8 flex justify-between gap-4 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-fit"
          />
        </InputGroup>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            className="w-45"
            placeholder="Select status"
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const value = keys instanceof Set ? Array.from(keys)[0] : keys;
              setStatusFilter(value || "all");
            }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All Status">
                  All Status
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="pending" textValue="Pending">
                  Pending
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="completed" textValue="Completed">
                  Completed
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="incomplete" textValue="Incomplete">
                  Incomplete
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          {isAdmin && (
            <Modal open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <Button>
                <Plus className="size-4" />
                Create
              </Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Create Task</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-3">
                        <TextField>
                          <Label>Title *</Label>
                          <Input
                            placeholder="Task title"
                            fullWidth
                            value={newTask.title}
                            onChange={(e) =>
                              updateNewTask("title", e.target.value)
                            }
                          />
                        </TextField>
                        <TextField>
                          <Label>Description</Label>
                          <TextArea
                            placeholder="Task description"
                            rows={3}
                            fullWidth
                            value={newTask.description}
                            onChange={(e) =>
                              updateNewTask("description", e.target.value)
                            }
                          />
                        </TextField>
                        <div className="grid grid-cols-3 gap-3">
                          <TextField>
                            <Label>Status</Label>
                            <Select
                              placeholder="Select status"
                              selectedKeys={[newTask.status]}
                              onSelectionChange={(keys) => {
                                const value =
                                  keys instanceof Set
                                    ? Array.from(keys)[0]
                                    : keys;
                                updateNewTask("status", value || "pending");
                              }}
                            >
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  <ListBox.Item
                                    id="pending"
                                    textValue="Pending"
                                  >
                                    Pending
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                  <ListBox.Item
                                    id="completed"
                                    textValue="Completed"
                                  >
                                    Completed
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                  <ListBox.Item
                                    id="incomplete"
                                    textValue="Incomplete"
                                  >
                                    Incomplete
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </TextField>
                          <TextField>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              fullWidth
                              value={newTask.start_date}
                              onChange={(e) =>
                                updateNewTask("start_date", e.target.value)
                              }
                            />
                          </TextField>
                          <TextField>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              fullWidth
                              value={newTask.end_date}
                              onChange={(e) =>
                                updateNewTask("end_date", e.target.value)
                              }
                            />
                          </TextField>
                        </div>
                        <div>
                          <Label className="mb-2 block">Assignees</Label>
                          <Surface className="rounded-2xl">
                            <ListBox
                              aria-label="Assign members"
                              selectionMode="multiple"
                              selectedKeys={newTask.assignees}
                              onSelectionChange={handleAssigneeChange}
                            >
                              {members.map((member) => {
                                const taskCount = memberTaskCounts[member.id] || 0;
                                return (
                                <ListBox.Item
                                  key={member.id}
                                  id={member.id}
                                  textValue={member.name || "Unknown"}
                                >
                                  <Avatar size="sm">
                                    {member.pic ? (
                                      <Avatar.Image
                                        src={member.pic}
                                        alt={member.name}
                                      />
                                    ) : null}
                                    <Avatar.Fallback>
                                      {member.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "?"}
                                    </Avatar.Fallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <Label>{member.name || "Unknown"}</Label>
                                    <Description className="text-xs">
                                      {member.email || ""}
                                      {taskCount > 0 && (
                                        <span className="ml-1 text-warning font-medium">· {taskCount} task{taskCount > 1 ? "s" : ""} assigned</span>
                                      )}
                                    </Description>
                                  </div>
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                );
                              })}
                            </ListBox>
                          </Surface>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreate}
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
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3"
            >
              <div className="h-5 w-40 bg-background-secondary rounded" />
              <div className="h-3 w-full bg-background-secondary rounded" />
              <div className="h-6 w-20 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Modal>
              <Modal.Trigger>
                <Card key={task.id}>
                  <Card.Header>
                    <Card.Title>{task.title}</Card.Title>
                  </Card.Header>
                  <Card.Content className="space-y-3">
                    {task.description && (
                      <div className="text-sm line-clamp-1">
                        {task.description}
                      </div>
                    )}
                    <div className="w-full flex gap-2 items-center flex-wrap">
                      <Chip
                        color={
                          task.status === "completed"
                            ? "success"
                            : task.status === "incomplete"
                              ? "danger"
                              : "accent"
                        }
                        size="sm"
                      >
                        {task.status}
                      </Chip>
                      {task.start_date && (
                        <Chip size="sm" variant="secondary">
                          {new Date(task.start_date).toLocaleDateString()}
                        </Chip>
                      )}
                      -
                      {task.end_date && (
                        <Chip size="sm" variant="secondary">
                          {new Date(task.end_date).toLocaleDateString()}
                        </Chip>
                      )}
                    </div>
                  </Card.Content>
                  <Card.Footer className="flex flex-col items-start gap-2">
                    {task.assignee_details?.length > 0 && (
                      <div className="flex items-center gap-1">
                        {task.assignee_details
                          .slice(0, 3)
                          .map((assignee, idx) => (
                            <Avatar key={idx} size="sm" className="size-6">
                              {assignee.pic ? (
                                <Avatar.Image
                                  src={assignee.pic}
                                  alt={assignee.name}
                                />
                              ) : null}
                              <Avatar.Fallback className="text-[10px]">
                                {assignee.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "?"}
                              </Avatar.Fallback>
                            </Avatar>
                          ))}
                        {task.assignee_details.length > 3 && (
                          <span className="text-xs text-muted">
                            +{task.assignee_details.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="text-xs text-muted">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </Card.Footer>
                </Card>
              </Modal.Trigger>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>{task.title}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p>{task.description}</p>
                      <div className="w-full flex gap-2 items-center flex-wrap">
                        <Chip
                          color={
                            task.status === "completed"
                              ? "success"
                              : task.status === "incomplete"
                                ? "danger"
                                : "accent"
                          }
                          variant="soft"
                          size="sm"
                        >
                          {task.status}
                        </Chip>
                        {task.start_date && (
                          <Chip size="sm" variant="secondary">
                            {new Date(task.start_date).toLocaleDateString()}
                          </Chip>
                        )}
                        -
                        {task.end_date && (
                          <Chip size="sm" variant="secondary">
                            {new Date(task.end_date).toLocaleDateString()}
                          </Chip>
                        )}
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      {isAdmin && (
                        <Button
                          variant="danger-soft"
                          onClick={() => handleDelete(task.id)}
                        >
                          Delete
                        </Button>
                      )}
                      {currentUserId &&
                        task.task_assignees?.some(
                          (ta) => ta.user_id === currentUserId,
                        ) && (
                          <Select
                            className="w-40"
                            placeholder="Status"
                            selectedKeys={[task.status]}
                            onSelectionChange={(keys) => {
                              const value =
                                keys instanceof Set
                                  ? Array.from(keys)[0]
                                  : keys;
                              if (value) handleStatusChange(task.id, value);
                            }}
                          >
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBox.Item id="pending" textValue="Pending">
                                  Pending
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item
                                  id="completed"
                                  textValue="Completed"
                                >
                                  Completed
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item
                                  id="incomplete"
                                  textValue="Incomplete"
                                >
                                  Incomplete
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        )}
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          ))}
          {filteredTasks.length === 0 && (
            <p className="col-span-3 text-center text-muted py-12">
              No tasks found.
            </p>
          )}
        </div>
      )}

    </div>
  );
}
