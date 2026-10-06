/* eslint-disable @next/next/no-img-element -- remote user photos served by the API */
import { cn } from "@/lib/utils";
import { initials } from "@/lib/applicant/session";
import type { User } from "@/types";

interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 32, className }: UserAvatarProps) {
  const photo = (user?.photo_url as string | null | undefined) || (user?.photo as string | null | undefined);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
    >
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials(user)}
    </span>
  );
}
