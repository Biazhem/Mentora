"use client";

import {
  Button,
  InputGroup,
  Select,
  Label,
  ListBox,
  Description,
  Avatar,
} from "@heroui/react";
import Link from "next/link";
import { SlidersHorizontal, Trash, Search } from "lucide-react";
import { Card, Typography } from "@heroui/react";
import { Chip } from "@heroui/react";
import { ProgressBar } from "@heroui/react";

export default function Page() {
  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">My Workspace</h1>
        <p className="text-sm text-muted">
          Manage tasks, teams and learn from mentors in worspace
        </p>
      </div>

      <div className="mb-8 flex justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <InputGroup>
            <InputGroup.Prefix>
              <Search className="size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="Search mentors by name, bio, field, or institute"
              className="w-fit"
            />
          </InputGroup>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Select placeholder="Select organization">
            <Select.Trigger>
              <Select.Value className={"flex items-center gap-2 "} />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item>
                  <Avatar size="sm">
                    <Avatar.Fallback>AB</Avatar.Fallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Label>Ali</Label>
                    <Description>Full Stack Eng..</Description>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Button variant="secondary">
            <SlidersHorizontal />
            Filter
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/mentors/workspace/teams/id">
          <Card className="min-w-sm">
            <Card.Header>
              <div className="flex justify-between items-center">
                <Card.Title>Team Backend</Card.Title>
                <div className="flex items-center -space-x-4 *:ring-2 *:ring-background">
                  <Avatar size="sm">
                    <Avatar.Fallback>AB</Avatar.Fallback>
                  </Avatar>
                  <Avatar size="sm">
                    <Avatar.Fallback>CD</Avatar.Fallback>
                  </Avatar>
                  <Avatar size="sm">
                    <Avatar.Fallback>+6</Avatar.Fallback>
                  </Avatar>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="flex flex-col">
              <Description>team for backend engineer students</Description>
            </Card.Content>
            <Card.Footer className="flex flex-col items-start gap-2">
              <ProgressBar
                aria-label="Revenue"
                className="w-full"
                maxValue={100}
                minValue={0}
                value={34}
              >
                <div className="flex items-center gap-1">
                  <Label>Tasks</Label>
                  <Chip size="sm">12/35</Chip>
                </div>
                <ProgressBar.Output />
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            </Card.Footer>
          </Card>
        </Link>
      </div>
      <div className="mt-4">
        <Typography.Heading level={3}>Students</Typography.Heading>
        {/* Table for students */}
      </div>
    </div>
  );
}
