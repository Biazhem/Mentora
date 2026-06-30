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
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { ProgressBar } from "@heroui/react";
import { Modal } from "@heroui/react";
import { CheckCheck } from "lucide-react";
import { Table } from "@heroui/react";

export default function Page() {
  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Team TT</h1>
        <p className="text-sm text-muted">Manage tasks accros teams jsk.</p>
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
          <Button variant="secondary">
            <SlidersHorizontal />
            Filter
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Modal>
          <Modal.Trigger>
            <Card>
              <Card.Header>
                <Card.Title>Go Home</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-3">
                <div className="text-sm line-clamp-1">soji</div>
                <div className="w-full flex gap-2 items-center flex-wrap">
                  <Chip color={"accent"} size="sm">
                    completed
                  </Chip>
                  <Chip size="sm" variant="secondary">
                    {new Date().toLocaleDateString()}
                  </Chip>
                  -
                  <Chip size="sm" variant="secondary">
                    {new Date().toLocaleDateString()}
                  </Chip>
                </div>
              </Card.Content>
              <Card.Footer className="flex flex-col items-start gap-2">
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
                <span className="text-xs text-muted">
                  Created {new Date().toLocaleDateString()}
                </span>
              </Card.Footer>
            </Card>
          </Modal.Trigger>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Icon className="bg-default text-foreground">
                    <CheckCheck />
                  </Modal.Icon>
                  <Modal.Heading>Go Home</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="space-y-2">
                  <p>
                    This modal uses the <code>hell</code> size variant. On
                    mobile devices, all sizes adapt to near full-width for
                    optimal viewing. On desktop, each size provides a different
                    maximum width to suit various content needs.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label>Tasks</Label>
                    <Table>
                      <Table.ScrollContainer>
                        <Table.Content aria-label="Example table">
                          <Table.Header>
                            <Table.Column>Name</Table.Column>
                            <Table.Column>Status</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            <Table.Row>
                              <Table.Cell>Kate Moore</Table.Cell>
                              <Table.Cell>
                                <Chip variant="soft" color="success">
                                  completed
                                </Chip>
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>John</Table.Cell>
                              <Table.Cell>
                                <Chip variant="soft" color="warning">
                                  pending
                                </Chip>
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table.Content>
                      </Table.ScrollContainer>
                    </Table>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">
                    Cancel
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
    </div>
  );
}
