"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const tasksData = [
  {
    id: 1,
    title: "Build Login Page",
    status: "In Progress",
    startDate: "2026-02-01",
    dueDate: "2026-02-10",
  },
  {
    id: 2,
    title: "Resume Analyzer Integration",
    status: "Pending",
    startDate: "2026-02-05",
    dueDate: "2026-02-15",
  },
  {
    id: 3,
    title: "Final Project Report",
    status: "Completed",
    startDate: "2026-01-10",
    dueDate: "2026-01-25",
  },
];

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState();
  const [dueDate, setDueDate] = useState();

  const filteredTasks = tasksData.filter((task) => {
    return statusFilter === "all" || task.status === statusFilter;
  });

  return (
    <div className="max-w-6xl py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Tasks</h1>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Select onValueChange={setStatusFilter} defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Start Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {startDate ? startDate.toDateString() : "Select Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
          </PopoverContent>
        </Popover>

        {/* Due Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dueDate ? dueDate.toDateString() : "Select Due Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tasks List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Start:</span>
                <span>{task.startDate}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Due:</span>
                <span>{task.dueDate}</span>
              </div>

              <Badge
                variant={
                  task.status === "Completed"
                    ? "success"
                    : task.status === "In Progress"
                    ? "default"
                    : "secondary"
                }
              >
                {task.status}
              </Badge>

              {/* File Upload */}
              <Input type="file" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
