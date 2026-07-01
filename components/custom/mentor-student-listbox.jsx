"use client";

import { Avatar, Description, Label, ListBox, Surface } from "@heroui/react";

function normalizeSelection(keys, items) {
  if (keys === "all") {
    return new Set(items.map((item) => item.id));
  }

  if (keys instanceof Set) {
    return keys;
  }

  return new Set(keys ? Array.from(keys) : []);
}

export function MentorStudentListBox({
  ariaLabel,
  students = [],
  selectedKeys = new Set(),
  onSelectionChange,
  emptyMessage = "No approved students available.",
}) {
  const selection = normalizeSelection(selectedKeys, students);

  return (
    <div className="space-y-2">
      <Surface className="rounded-2xl border border-default-100 bg-background">
        {students.length > 0 ? (
          <ListBox
            aria-label={ariaLabel}
            selectionMode="multiple"
            selectedKeys={selection}
            onSelectionChange={(keys) => {
              if (onSelectionChange) {
                onSelectionChange(normalizeSelection(keys, students));
              }
            }}
          >
            {students.map((student) => (
              <ListBox.Item
                key={student.id}
                id={student.id}
                textValue={student.name || "Unknown"}
              >
                <Avatar size="sm">
                  {student.pic ? (
                    <Avatar.Image src={student.pic} alt={student.name} />
                  ) : null}
                  <Avatar.Fallback>
                    {student.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "?"}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <Label className="truncate">
                    {student.name || "Unknown"}
                  </Label>
                  <Description className="truncate text-xs">
                    {student.university || student.email || "No details available"}
                  </Description>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        ) : (
          <div className="px-4 py-6">
            <Description className="text-sm">{emptyMessage}</Description>
          </div>
        )}
      </Surface>

      <Description className="text-xs">
        {selection.size > 0
          ? `${selection.size} student${selection.size === 1 ? "" : "s"} selected`
          : "Choose one or more approved students."}
      </Description>
    </div>
  );
}
