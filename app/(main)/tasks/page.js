"use client";

import { useState } from "react";
import {
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Avatar,
} from "@/components/ui/avatar";
import { Label, ListBox, Select } from "@heroui/react";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { tasks } from "@/config/data";
import { Search, SlidersHorizontal, Trash } from "lucide-react";

import { Card, Chip, Button, InputGroup } from "@heroui/react";

import { DateRangePicker, DateField, RangeCalendar } from "@heroui/react";

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // HeroUI format
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  const tasksData = tasks;

  // Filter logic
  const filteredTasks = tasksData.filter((task) => {
    const taskStart = new Date(task.startDate);

    const statusMatch = statusFilter === "all" || task.status === statusFilter;

    const rangeMatch =
      !dateRange?.start ||
      !dateRange?.end ||
      (taskStart >= dateRange.start && taskStart <= dateRange.end);
    const searchMatch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

    return statusMatch && rangeMatch && searchMatch;
  });

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Tasks</h1>
        <p className="text-sm text-muted">
          Track progress and manage deliverables across your workflow
        </p>
      </div>

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

        <div className="flex justify-between items-center gap-4 flex-wrap">
          <Button variant="secondary">
            <SlidersHorizontal />
            Filter
          </Button>
          

        {/* Status Filter */}
          <Select
            className="w-45"
            placeholder="Select status"
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];
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

                <ListBox.Item id="Pending" textValue="Pending">
                  Pending
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item id="In Progress" textValue="In Progress">
                  In Progress
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item id="Completed" textValue="Completed">
                  Completed
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          {/* Date Range Filter (HeroUI) */}
          <div className="flex gap-2 items-center">
            <DateRangePicker value={dateRange} onChange={setDateRange}>
              <DateField.Group>
                <DateField.InputContainer>
                  <DateField.Input slot="start">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>

                  <DateRangePicker.RangeSeparator />

                  <DateField.Input slot="end">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                </DateField.InputContainer>

                <DateField.Suffix>
                  <DateRangePicker.Trigger>
                    <DateRangePicker.TriggerIndicator />
                  </DateRangePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>

              <DateRangePicker.Popover>
                <RangeCalendar aria-label="Filter tasks by date range">
                  <RangeCalendar.Header>
                    <RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.YearPickerTriggerHeading />
                      <RangeCalendar.YearPickerTriggerIndicator />
                    </RangeCalendar.YearPickerTrigger>

                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>

                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day) => (
                        <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                      )}
                    </RangeCalendar.GridHeader>

                    <RangeCalendar.GridBody>
                      {(date) => <RangeCalendar.Cell date={date} />}
                    </RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                </RangeCalendar>
              </DateRangePicker.Popover>
            </DateRangePicker>

            {/* Clear Button */}
            {dateRange?.start && (
              <Button
                variant="danger-soft"
                onClick={() => setDateRange({ start: null, end: null })}
              >
                <X />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id}>
            <Card.Header>
              <Card.Title>{task.title}</Card.Title>
            </Card.Header>

            <Card.Content className="space-y-3">
              <div className="text-sm line-clamp-1">{task.description}</div>

              <div className="w-full flex gap-2 items-center">
                <Chip
                  color={
                    task.status === "Completed"
                      ? "success"
                      : task.status === "In Progress"
                        ? "default"
                        : "danger"
                  }
                  size="sm"
                >
                  {task.status}
                </Chip>
                <Separator orientation="vertical" />
                <Chip>{task.startDate}</Chip> - <Chip>{task.dueDate}</Chip>
              </div>
            </Card.Content>

            <Card.Footer className="flex flex-col items-start gap-2">
              <span>Assignees</span>

              <AvatarGroup>
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
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}
