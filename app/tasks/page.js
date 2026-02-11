"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { AvatarFallback, AvatarGroup, AvatarImage, Avatar } from "@/components/ui/avatar";

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
  const [dateRange, setDateRange] = useState();

  // ✅ Filter Logic
  const filteredTasks = tasksData.filter((task) => {
    const taskStart = new Date(task.startDate);

    const statusMatch = statusFilter === "all" || task.status === statusFilter;

    const rangeMatch =
      !dateRange?.from ||
      (taskStart >= dateRange.from &&
        taskStart <= (dateRange.to || dateRange.from));

    return statusMatch && rangeMatch;
  });

  return (
    <div className="py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Tasks</h1>

      {/* Filters */}
      <div className="flex justify-between mb-8 gap-4 flex-wrap">
        {/* Status Filter */}
        <Select onValueChange={setStatusFilter} defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {dateRange.from.toDateString()} -{" "}
                      {dateRange.to.toDateString()}
                    </>
                  ) : (
                    dateRange.from.toDateString()
                  )
                ) : (
                  "Select Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={dateRange}
                onSelect={setDateRange}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Button */}
          {dateRange && (
            <Button
              variant="destructive"
              onClick={() => setDateRange(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
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
                    ? "default"
                    : task.status === "In Progress"
                      ? "secondary"
                      : "destructive"
                }
              >
                {task.status}
              </Badge>
            </CardContent>
            <CardFooter className={"flex flex-col items-start justify-start gap-2"}>
              <span>Assignees</span>
              <AvatarGroup >
                <Avatar size="sm">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar size="sm">
                  <AvatarImage
                    src="https://github.com/maxleiter.png"
                    alt="@maxleiter"
                  />
                  <AvatarFallback>LR</AvatarFallback>
                </Avatar>
                <Avatar size="sm">
                  <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt="@evilrabbit"
                  />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
              </AvatarGroup>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
