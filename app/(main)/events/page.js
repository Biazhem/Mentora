"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Trash } from "lucide-react";
import { data } from "@/config/data";
import { ArrowUpRight } from "lucide-react";
import {
  Modal,
  Description,
  Separator,
  Chip,
  InputGroup,
  ListBox,
  Select,
  Button,
  Card,
  CloseButton,
  Avatar,
  Label,
} from "@heroui/react";
import { Surface } from "@heroui/react";
import { FacebookLogoIcon, GlobeIcon, InstagramLogoIcon, TwitterLogoIcon } from "@phosphor-icons/react";
import { MarkdownRenderer } from "@/components/custom/MarkdownRenderer";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Transform mock data to match component structure
  const organization = data.organizations.map((org) => ({
    image: org.logo,
    title: org.name,
  }));

  const events = data.events.map((event, idx) => ({
    id: idx + 1,
    org_id: event.org_index,
    title: event.title,
    date: new Date(event.start_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    location: event.location,
    description: event.description,
    status: "Upcoming",
    type: event.type,
    startDate: event.start_date,
    endDate: event.end_date,
    content: event.content,
  }));
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || event.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="py-12">
      <div className="mb-4 px-4">
        <h1 className="text-2xl font-semibold text-left">Events</h1>
        <p className="text-sm text-muted">
          Learn, connect, and grow with Mentora events
        </p>
      </div>

      <div className="px-4 mb-8 flex justify-between gap-3 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-fit"
          />
        </InputGroup>

        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary">
            <SlidersHorizontal />
            Filter
          </Button>
          <Button
            isIconOnly
            variant="danger-soft"
            onPress={() => setTypeFilter("all")}
          >
            <Trash />
          </Button>
          <Select
            onValueChange={setTypeFilter}
            defaultValue="all"
            className="min-w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item value="all">All Types</ListBox.Item>
                <ListBox.Item value="Hackathon">Hackathon</ListBox.Item>
                <ListBox.Item value="Webinar">Webinar</ListBox.Item>
                <ListBox.Item value="Workshop">Workshop</ListBox.Item>
                <ListBox.Item value="Meetup">Meetup</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Link href="/events/create">
            <Button>
              <Plus />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 grid gap-6 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <Modal>
            <Modal.Trigger>
              <Card
                key={event.id}
                className="w-full items-stretch md:flex-row cursor-pointer"
              >
                <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                  <img
                    alt="alts"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                    src={organization[event.org_id].image}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <Card.Header className="gap-1">
                    <Card.Title className="pr-8">{event.title}</Card.Title>
                    <Card.Description>{event.description}</Card.Description>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      {organization[event.org_id].title}
                      <ArrowUpRight />
                    </Button>
                  </Card.Header>
                  <Card.Footer className="mt-auto flex gap-1">
                    <Chip>{event.type}</Chip>
                    <Chip>{event.location}</Chip>-
                    <Chip>
                      {" "}
                      {event.startDate.split(" ")[0].replaceAll("-", "/")}{" "}
                    </Chip>
                    <Chip>
                      {" "}
                      {event.endDate.split(" ")[0].replaceAll("-", "/")}{" "}
                    </Chip>
                  </Card.Footer>
                </div>
              </Card>
            </Modal.Trigger>
            <Modal.Backdrop>
              <Modal.Container size="cover">
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Body>
                    <div className="flex flex-row gap-2 items-start justify-between">
                      <div className="flex flex-row gap-3">
                        <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                          <img
                            alt="alts"
                            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                            src={organization[event.org_id].image}
                          />
                        </div>
                        <div className="py-2 flex flex-col gap-1">
                          <Modal.Heading className="text-xl">
                            {event.title}
                          </Modal.Heading>
                          <Description>{event.description}</Description>
                          <div className="flex flex-row gap-1">
                            <Chip>{event.startDate}</Chip> -
                            <Chip variant="primary" color="accent">
                              {event.endDate}
                            </Chip>
                          </div>
                          <div className="flex flex-row gap-1">
                            <Chip variant="primary" color="accent">
                              {event.location}
                            </Chip>{" "}
                            -<Chip>{event.type}</Chip>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Modal.Heading level={2} className="mt-3 text-lg">
                      About
                    </Modal.Heading>
                    <Separator className="my-3" />
                    <div className="flex gap-2 w-full">
                      <div className="w-full">
                        <MarkdownRenderer content={event.content} />
                      </div>
                      <div className="w-lg space-y-2">
                        <Surface
                          className="flex min-w-[320px] flex-col gap-1 rounded-3xl p-3"
                          variant="secondary"
                        >
                          <h3 className="text-base font-semibold text-foreground">
                            Guests
                          </h3>
                          <div className="flex gap-2 items-center">
                            <Avatar variant="soft" color="accent">
                              <Avatar.Fallback>AC</Avatar.Fallback>
                            </Avatar>
                            <Avatar variant="soft" color="accent">
                              <Avatar.Fallback>HB</Avatar.Fallback>
                            </Avatar>
                            <Avatar variant="soft" color="accent">
                              <Avatar.Fallback>IC</Avatar.Fallback>
                            </Avatar>
                          </div>
                        </Surface>
                        <Surface
                          className="flex min-w-[320px] flex-col gap-0 rounded-3xl p-3"
                          variant="secondary"
                        >
                          <h3 className="text-base font-semibold text-foreground">
                            Location
                          </h3>
                          <div className="flex gap-2 items-center">
                            <p className="text-sm">Virtual, Google Meet</p>
                          </div>
                        </Surface>
                        <Surface
                          className="flex min-w-[320px] flex-col gap-0 rounded-3xl p-3"
                          variant="secondary"
                        >
                          <h3 className="text-base font-semibold text-foreground">
                            Contact Us
                          </h3>
                          <div className="flex gap-2 items-center">
                            <Button size="lg" isIconOnly>
                              <InstagramLogoIcon />
                            </Button>
                            <Button size="lg" isIconOnly>
                              <TwitterLogoIcon />
                            </Button>
                            <Button size="lg" isIconOnly>
                              <FacebookLogoIcon />
                            </Button>
                            <Button size="lg" isIconOnly>
                              <GlobeIcon isIconOnly />
                            </Button>
                          </div>
                        </Surface>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" variant="secondary">
                      Cancel
                    </Button>
                    <Button>Save</Button>
                    <Button slot="close">Apply</Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        ))}
      </div>
    </div>
  );
}
