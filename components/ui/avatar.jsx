import { Avatar as HeroAvatar } from "@heroui/react";

function Avatar({ className, ...props }) {
  return <HeroAvatar className={className} {...props} />;
}

function AvatarImage({ className, ...props }) {
  return <HeroAvatar.Image className={className} {...props} />;
}

function AvatarFallback({ className, ...props }) {
  return <HeroAvatar.Fallback className={className} {...props} />;
}

export { Avatar, AvatarImage, AvatarFallback };
