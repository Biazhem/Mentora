"use client";

import { Button, Card, Drawer } from "@heroui/react";

export function JobDrawer({ job }) {
  return (
    <Drawer>
      <Drawer.Trigger className="text-left">
        <Card className="w-full items-stretch transition hover:shadow-lg md:flex-row">
          <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-xl md:w-[120px]">
            <img
              src={job.image}
              alt={job.company}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col p-4">
            <Card.Header className="mb-1 p-0">
              <Card.Title className="text-lg">{job.title}</Card.Title>
              <Card.Description>
                {job.company}, {job.location}
              </Card.Description>
            </Card.Header>

            <p className="mb-3 text-left text-sm text-foreground line-clamp-1">{job.description}</p>

            <Card.Footer className="mt-auto p-0">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">{job.type}</span>
            </Card.Footer>
          </div>
        </Card>
      </Drawer.Trigger>

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>{job.title}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                <img src={job.image} alt={job.company} className="h-40 w-full object-cover" />
              </div>
              <div>
                <p className="text-sm text-foreground">Organization</p>
                <p className="font-medium">{job.company}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-foreground">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Type</p>
                  <p className="font-medium">{job.type}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground">Timing</p>
                <p className="font-medium">{job.timing}</p>
              </div>
              <div>
                <p className="text-sm text-foreground">Description</p>
                <p className="text-foreground">{job.description}</p>
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Close
              </Button>
              <Button slot="close">Apply</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
