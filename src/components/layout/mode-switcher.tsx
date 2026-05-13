"use client";

import { useMetaColor } from "@/hooks/use-meta-color";
import { useMounted } from "@mantine/hooks";
import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";
import { Button } from "../ui/button";

export function ModeSwitcher() {
  const isMounted = useMounted();
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor, metaColor } = useMetaColor();

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-0 border border-primary opacity-50">
        <Button variant="ghost" disabled>
          <span className="text-xs font-number tracking-widest uppercase">
            DARK
          </span>
        </Button>
        <Button variant="ghost" disabled>
          <span className="text-xs font-number tracking-widest uppercase">
            LIGHT
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 border border-primary">
      <Button
        variant={resolvedTheme === "light" ? "ghost" : "default"}
        onClick={() => resolvedTheme === "light" && toggleTheme()}
        disabled={resolvedTheme === "dark"}
        className="disabled:opacity-100"
      >
        {resolvedTheme === "dark" && (
          <span className="h-2 w-2 bg-primary-foreground rounded-full shrink-0" />
        )}
        <span className="text-xs font-number tracking-widest uppercase">
          DARK
        </span>
      </Button>
      <Button
        variant={resolvedTheme === "dark" ? "ghost" : "default"}
        onClick={() => resolvedTheme === "dark" && toggleTheme()}
        disabled={resolvedTheme === "light"}
        className="disabled:opacity-100"
      >
        {resolvedTheme === "light" && (
          <span className="h-2 w-2 bg-primary-foreground rounded-full shrink-0" />
        )}
        <span className="text-xs font-number tracking-widest uppercase">
          LIGHT
        </span>
      </Button>
    </div>
  );
}
