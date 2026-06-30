"use client";

import { Description, Label } from "@heroui/react";
import { Surface } from "@heroui/react";
import { Avatar, Button, Card, Chip, Drawer } from "@heroui/react";
import Link from "next/link";

export function MentorDrawer({ mentor }) {
  const expertiseList = mentor.expertise
    ? mentor.expertise.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const experiences = Array.isArray(mentor.experiences) ? mentor.experiences : [];
  const displayName = mentor.displayName || mentor.name || "Unknown";

  return (
    <Drawer>
      <Drawer.Trigger className="text-left">
        <Card className="flex cursor-pointer flex-col transition hover:shadow-sm">
          <Card.Header className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {mentor.picture ? (
                  <Avatar.Image src={mentor.picture} alt={displayName} />
                ) : null}
                <Avatar.Fallback>{displayName?.charAt(0) || "?"}</Avatar.Fallback>
              </Avatar>
              <div>
                <Card.Title className="text-lg">{displayName}</Card.Title>
                <Card.Description className="text-xs">{mentor.bio}</Card.Description>
              </div>
            </div>
          </Card.Header>

          <Card.Content className="flex-1">
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-foreground">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {expertiseList.map((skill, idx) => (
                  <Chip key={idx} size="sm" variant="secondary">{skill}</Chip>
                ))}
              </div>
            </div>
            {mentor.field && (
              <div className="flex gap-2 items-center text-sm text-muted">
                <span>{mentor.field}</span>
                {mentor.institute && <span>at {mentor.institute}</span>}
              </div>
            )}
          </Card.Content>
        </Card>
      </Drawer.Trigger>

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>{displayName}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  {mentor.picture ? (
                    <Avatar.Image src={mentor.picture} alt={displayName} />
                  ) : null}
                  <Avatar.Fallback>{displayName?.charAt(0) || "?"}</Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="text-sm text-foreground">Field</p>
                  <p className="font-medium">{mentor.field || "Not specified"}</p>
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <p className="font-medium">{mentor.bio || "No bio provided"}</p>
              </div>

              <div>
                <p className="mb-2 text-sm text-foreground">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {expertiseList.map((skill, idx) => (
                    <Chip key={idx} size="sm" variant="secondary">{skill}</Chip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm text-foreground">Institute</p>
                  <p className="font-medium">{mentor.institute || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Phone</p>
                  <p className="font-medium">{mentor.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Email</p>
                  <p className="font-medium">{mentor.email || "Not provided"}</p>
                </div>
                {mentor.gender && (
                  <div>
                    <p className="text-sm text-foreground">Gender</p>
                    <p className="font-medium">{mentor.gender}</p>
                  </div>
                )}
              </div>

              {experiences.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-foreground">Experience</p>
                  <div className="space-y-2">
                    {experiences.map((exp, idx) => (
                      <Surface
                        key={idx}
                        variant="secondary"
                        className="flex flex-col rounded-lg w-full px-2 py-1"
                      >
                        <div className="flex gap-2 items-center">
                          <Label>{exp.title || exp.role || ""}</Label>
                          {exp.type && (
                            <Chip variant="primary" color="accent">{exp.type}</Chip>
                          )}
                        </div>
                        {exp.company && <Label className="text-sm">At {exp.company}</Label>}
                        {exp.description && <Description>{exp.description}</Description>}
                      </Surface>
                    ))}
                  </div>
                </div>
              )}

              {mentor.mentoring_style && (
                <div>
                  <Label>Mentoring Style</Label>
                  <p className="text-sm">{mentor.mentoring_style}</p>
                </div>
              )}

              {mentor.availability && (
                <div>
                  <Label>Availability</Label>
                  <p className="text-sm">{mentor.availability}</p>
                </div>
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">Close</Button>
              <Link href={`/profile/mentor/${mentor.id}`}>
                <Button slot="close">Request Mentorship</Button>
              </Link>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
