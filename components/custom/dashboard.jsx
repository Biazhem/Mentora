"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CoreUI({ children }) {
  const pathname = usePathname() || "/";

  // Split URL and remove empty segments
  const segments = pathname.split("/").filter((seg) => seg.length > 0);

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const isLast = index === segments.length - 1;
    return { name, href, isLast };
  });
  const { isMobile } = useIsMobile();

  if (pathname === "/") {
    return <main className="w-full">{children}</main>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1 text-black" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              {breadcrumbs.map((bc, idx) => (
                <BreadcrumbItem key={idx}>
                  {bc.isLast ? (
                    <BreadcrumbPage>{bc.name}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink href={bc.href}>{bc.name}</BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
