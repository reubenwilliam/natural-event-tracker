import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex w-full",
        {
          "flex-row items-center": !vertical,
          "flex-col items-start": vertical,
        },
        className,
      )}
    >
      <Badge
        className="shrink-0 text-[11px] gap-2 flex items-center font-heading"
        variant="ghost"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="text-primary">EVENTS</span>
      </Badge>
      <div
        className={cn(
          "flex flex-1 overflow-hidden gap-(--gap) p-2 [--duration:5s] [--gap:1rem]",
          {
            "flex-row items-center mask-[linear-gradient(to_right,transparent,black_10%,black_100%)]":
              !vertical,
            "flex-col mask-[linear-gradient(to_bottom,transparent,black_10%,black_100%)]":
              vertical,
          },
        )}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={cn("flex shrink-0 justify-around gap-(--gap)", {
                "animate-marquee flex-row": !vertical,
                "animate-marquee-vertical flex-col": vertical,
                "group-hover:paused": pauseOnHover,
                "direction-[reverse]": reverse,
              })}
            >
              {children}
            </div>
          ))}
      </div>
    </div>
  );
}
