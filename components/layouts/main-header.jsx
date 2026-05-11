"use client";

import {
  Avatar,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Popover,
  ListBox,
  Label,
  Description,
  Select,
} from "@heroui/react";
import { FabButton } from "../custom/drawer";
import { ThemeSwitch } from "../theme/theme-switcher";
import { Settings } from "lucide-react";
import Image from "next/image";
import { data } from "@/config/data";
import { usePathname } from "next/navigation";

export default function MainHeader({
  fullName,
  fallbackInitials,
  imageUrl,
  isLoaded,
  emailAddress,
}) {
  const organization = data.organizations;
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return { href, label };
  });

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return <Breadcrumbs.Item key={item.href}>{item.label}</Breadcrumbs.Item>;
          }

          return (
            <Breadcrumbs.Item key={item.href} href={item.href}>
              {item.label}
            </Breadcrumbs.Item>
          );
        })}
      </Breadcrumbs>
      <div className="flex items-center justify-between gap-2">
        <Select
          className="w-56"
          placeholder="Select member"
          defaultValue={1}
        >
          <Select.Trigger>
            <Select.Value className={"flex items-center gap-2 "} />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {organization.slice(0, 3).map((itm) => (
                <ListBox.Item key={itm.id} id={itm.id} textValue={itm.name}>
                  <Avatar size="sm">
                    <Avatar.Image
                      alt={itm.name}
                      src={itm.logo}
                      className="object-cover "
                    />
                    <Avatar.Fallback>{itm.name[0].toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Label>{itm.name}</Label>
                    <Description>{itm.description.slice(0,18)}...</Description>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <ButtonGroup>
          <Button isIconOnly size="lg" variant="tertiary">
            <Settings />
          </Button>
        </ButtonGroup>
        <ThemeSwitch />
        <Popover>
          <Button isIconOnly>
            <Avatar color="accent">
              <Avatar.Image src={imageUrl} alt={fullName} />
              <Avatar.Fallback className="bg-accent text-background">
                {fallbackInitials}
              </Avatar.Fallback>
            </Avatar>
          </Button>
          <Popover.Content className="w-[320px] mt-3" placement="left">
            <Popover.Dialog>
              <Popover.Arrow />
              <Popover.Heading>
                <div className="flex items-center justify-between">
                  <div className="flex items-start flex-col">
                    <div className="rounded-lg h-12 overflow-hidden">
                      <img
                        className="object-cover object-top w-full backdrop:blur-3xl"
                        src={imageUrl}
                        alt={fullName}
                        width={320}
                        height={48}
                      />
                    </div>
                    <Avatar size="lg" className="-mt-6 ml-4 ring-2 ring-white">
                      <Avatar.Image alt={fullName} src={imageUrl} />
                      <Avatar.Fallback>{fallbackInitials}</Avatar.Fallback>
                    </Avatar>
                    <div className="mt-2">
                      <p className="text-base">
                        {isLoaded ? fullName : "Loading..."}
                      </p>
                      <p className="text-muted text-sm">
                        {isLoaded ? emailAddress : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </Popover.Heading>
              {/* <p className="mt-3 text-sm text-muted">
                    Product designer and creative director. Building beautiful
                    experiences that matter.
                  </p>
                  <div className="mt-2 flex justify-end">
                    <ButtonGroup variant="secondary">
                      <Button isIconOnly>
                        <DribbbleLogoIcon />
                      </Button>
                      <Button isIconOnly>
                        <ThreadsLogoIcon />
                      </Button>
                    </ButtonGroup>
                  </div> */}
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
      <FabButton />
    </div>
  );
}
