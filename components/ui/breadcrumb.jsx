import { Breadcrumbs } from "@heroui/react";

function Breadcrumb({ className, ...props }) {
  return <Breadcrumbs className={className} {...props} />;
}

function BreadcrumbList({ className, ...props }) {
  return <div className={className} role="list" {...props} />;
}

function BreadcrumbItem({ className, ...props }) {
  return <Breadcrumbs.Item className={className} {...props} />;
}

function BreadcrumbLink({ href, className, ...props }) {
  return <Breadcrumbs.Item href={href} className={className} {...props} />;
}

function BreadcrumbPage({ className, ...props }) {
  return <Breadcrumbs.Item className={className} {...props} />;
}

function BreadcrumbSeparator({ className, ...props }) {
  return (
    <span className={className} role="separator" aria-hidden="true" {...props}>
      /
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
