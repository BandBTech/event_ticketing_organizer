---
name: ui_dumb_component
description: Guidelines for creating stateless, reusable, and aesthetically rich UI components.
---

# UI Dumb Component Skill

This skill enforces the creation of "dumb" (presentational) components. These components should focus solely on how things look, receiving data and callbacks via props.

## Core Rules

1.  **Statelessness:** Dumb components should generally not have internal state (except for trivial UI state like hover or open/close if self-contained).
2.  **No Side Effects:** **NEVER** import services, `useQuery`, or `useMutation` inside a dumb component.
3.  **Props Interface:** **ALWAYS** export a typed `interface Props` or `type Props` (or `{CompName}Props`).
4.  **Rich Aesthetics:** Use Tailwind CSS 4 to create premium, polished designs (glassmorphism, shadows, transitions).
5.  **Shadcn/Radix:** Prioritize using existing `src/components/ui/` primitives over writing raw HTML div soup.

## Blueprint

```tsx
// src/components/domain/EntityCard.tsx

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import type { Entity } from "@/types/entity"; // Import TYPE ONLY

interface EntityCardProps {
  entity: Entity;
  variant?: "default" | "compact";
  onClick?: (id: string) => void;
  className?: string;
  actionLabel?: string;
}

export function EntityCard({
  entity,
  variant = "default",
  onClick,
  className,
  actionLabel = "View Details"
}: EntityCardProps) {
  // 1. Logic: Derived state only
  const isCompact = variant === "compact";

  // 2. Render
  return (
    <div
      className={cn(
        // Base styles: Glassmorphism, Rounded, Border, Transition
        "group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-primary/5",
        isCompact ? "p-3" : "p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {entity.title}
        </h3>
        <Badge variant={entity.isActive ? "default" : "secondary"}>
          {entity.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{new Date(entity.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{entity.location}</span>
        </div>
      </div>

      {/* Actions */}
      {onClick && (
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={() => onClick(entity.id)}
            variant="ghost"
            className="hover:bg-primary/10 hover:text-primary"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Checklist before saving

*   [ ] Did I export the Props interface?
*   [ ] Is the component generic enough to be reused?
*   [ ] Did I use `cn()` for class merging?
*   [ ] Are icons from `phosphor-icons` (as per project)?
*   [ ] Am I using `src/components/ui` primitives (Button, Card, Badge) where possible?
*   [ ] Is there any accidental API calling code? (If yes, DELETE IT).
