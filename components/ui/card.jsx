import { Card as HeroCard } from "@heroui/react";

function Card({ className, ...props }) {
  return <HeroCard className={className} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <HeroCard.Header className={className} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <HeroCard.Title className={className} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <HeroCard.Description className={className} {...props} />;
}

function CardContent({ className, ...props }) {
  return <HeroCard.Content className={className} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <HeroCard.Footer className={className} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
