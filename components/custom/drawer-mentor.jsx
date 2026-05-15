"use client";

import { Avatar, Button, Card, Chip, Drawer } from "@heroui/react";

export function MentorDrawer({ mentor }) {
  return (
    <Drawer>
      <Drawer.Trigger className="text-left">
        <Card className="flex cursor-pointer flex-col transition hover:shadow-sm">
          <Card.Header className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <Avatar.Image src={mentor.picture} alt={mentor.name} />
                <Avatar.Fallback>{mentor.name.charAt(0)}</Avatar.Fallback>
              </Avatar>
              <div>
                <Card.Title className="text-lg">{mentor.name}</Card.Title>
                <Card.Description className="text-xs">{mentor.bio}</Card.Description>
              </div>
            </div>
          </Card.Header>

          <Card.Content className="flex-1">
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-foreground">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill, idx) => (
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
                  <Avatar.Image src={mentor.picture} alt={mentor.name} />
                  <Avatar.Fallback>{mentor.name.charAt(0)}</Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="text-sm text-foreground">Bio</p>
                  <p className="font-medium">{mentor.bio}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-foreground">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, idx) => (
                    <Chip key={idx} size="sm" variant="secondary">
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-foreground">Experience</p>
                <div className="space-y-2">
                  {mentor.experience.map((item, idx) => (
                    <div key={idx} className="rounded-md border p-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted">{item.institute}</p>
                      <p className="text-sm">{item.years} years</p>
                    </div>
                  ))}
                </div>
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
