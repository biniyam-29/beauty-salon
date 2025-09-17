import type { FC } from "react";
import { cn } from "../../services/utils";

interface AvatarPlaceholderProps {
  name: string;
  className?: string;
}

export const AvatarPlaceholder: FC<AvatarPlaceholderProps> = ({ name, className }) => (
  <div
    className={cn(
      "flex-shrink-0 flex items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold",
      className
    )}
  >
    <span>{name?.charAt(0).toUpperCase() || "?"}</span>
  </div>
);