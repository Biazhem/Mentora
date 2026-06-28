"use client";

import { Avatar } from "@heroui/react";
import { Description } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Button, Card, Drawer } from "@heroui/react";
import Link from "next/link"

export function JobDrawer({ job, showImage = true, showDesc = false }) {
  const isExpired = job.expires_at && new Date(job.expires_at) < new Date();

  return (
    <Drawer>
      <Drawer.Trigger className="text-left">
        <Card className="w-full items-stretch transition hover:shadow-lg md:flex-row">
          {showImage && (
            <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-xl md:w-[120px]">
              <img
                src={job.image}
                alt={job.company}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-1 flex-col">
            <Card.Header className="mb-1 p-0">
              <Card.Title className="text-lg">{job.title}</Card.Title>
              <Card.Description>
                {job.location}
              </Card.Description>
            </Card.Header>

            <p className="mb-3 text-left text-sm text-foreground line-clamp-1">
              {job.description}
            </p>

            <Card.Footer className="mt-auto p-0 flex gap-2">
              <Chip variant="primary" color="accent">
                {job.type}
              </Chip>
              {isExpired && (
                <Chip color="danger" variant="soft">
                  Expired
                </Chip>
              )}
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
              <div className="flex gap-2 items-center">
                <Avatar size="lg">
                  {job.org_image ? (
                    <Avatar.Image src={job.org_image} alt={job.company} />
                  ) : null}
                  <Avatar.Fallback>{job.company?.[0]?.toUpperCase() || "O"}</Avatar.Fallback>
                </Avatar>
                <div>
                <p className="text-sm text-foreground">Organization</p>
                <p className="font-medium">{job.company}</p>
                </div>
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
                <Description className="text-foreground">{job.description}</Description>
              </div>
              <div>
                <p className="text-sm text-foreground">Requirements</p>
                <Description className="text-foreground">{job.requirements}</Description>
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Close
              </Button>
              <Link href={isExpired ? "#" : `/job/${job.id}`}>
              <Button slot="close" isDisabled={isExpired}>
                {isExpired ? "Expired" : "Apply"}
              </Button>
              </Link>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
