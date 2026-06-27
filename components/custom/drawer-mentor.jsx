"use client";

import { Description } from "@heroui/react";
import { Surface } from "@heroui/react";
import { Avatar, Button, Card, Chip, Drawer, Label } from "@heroui/react";

export function MentorDrawer({ mentor }) {
  const expertiseList = mentor.expertise
    ? mentor.expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const experiences = Array.isArray(mentor.experiences)
    ? mentor.experiences
    : [];

  return (
    <Drawer>
      <Drawer.Trigger className="text-left">
        <Card className="flex cursor-pointer flex-col transition hover:shadow-sm">
          <Card.Header className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {mentor.picture ? (
                  <Avatar.Image src={mentor.picture} alt={mentor.name} />
                ) : null}
                <Avatar.Fallback>
                  {mentor.name?.charAt(0) || "?"}
                </Avatar.Fallback>
              </Avatar>
              <div>
                <Card.Title className="text-lg">{mentor.name}</Card.Title>
                <Card.Description className="text-xs">
                  {mentor.bio}
                </Card.Description>
              </div>
            </div>
          </Card.Header>

          <Card.Content className="flex-1">
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Expertise
              </p>
              <div className="flex flex-wrap gap-2">
                {expertiseList.map((skill, idx) => (
                  <Chip key={idx} size="sm" variant="secondary">
                    {skill}
                  </Chip>
                ))}
              </div>
            </div>
          </Card.Content>
        </Card>
      </Drawer.Trigger>

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>{mentor.name}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  {mentor.picture ? (
                    <Avatar.Image src={mentor.picture} alt={mentor.name} />
                  ) : null}
                  <Avatar.Fallback>
                    {mentor.name?.charAt(0) || "?"}
                  </Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="text-sm text-foreground">Headline</p>
                  <p className="font-medium">{"any"}</p>
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <p className="font-medium">{mentor.bio}</p>
              </div>

              <div>
                <p className="mb-2 text-sm text-foreground">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {expertiseList.map((skill, idx) => (
                    <Chip key={idx} size="sm" variant="secondary">
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm text-foreground">Field</p>
                  <p className="font-medium">{mentor.field}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Institute</p>
                  <p className="font-medium">{mentor.institute}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Phone</p>
                  <p className="font-medium">{mentor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Email</p>
                  <p className="font-medium">{mentor.email}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-foreground">Experience</p>
                <div className="space-y-2">
                  <Surface
                    variant="secondary"
                    className="flex flex-col rounded-lg w-full px-2 py-1"
                  >
                    <div className="flex gap-2 items-center">
                      <Label>Full Stack Engineer</Label>
                      <Chip variant="primary" color="accent">
                        On Site
                      </Chip>
                    </div>
                    <Label className="text-sm">At Company</Label>
                    <Description>Hload d csa</Description>
                  </Surface>
                </div>
              </div>

              <div>
                <Label>
                  Mentoring Style
                </Label>
                <p className="text-sm">bla bla</p>
              </div>

              <div>
                <Label>Availability</Label>
                <p className="text-sm">24 June</p>
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Close
              </Button>
              <Button slot="close">Request Mentorship</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
