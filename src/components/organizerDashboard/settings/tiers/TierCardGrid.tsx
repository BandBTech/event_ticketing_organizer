"use client";

import { TierTemplate } from "@/services/tierService";
import { TierTemplateCard } from "@/components/organizerDashboard/settings/tiers/TierTemplateCard";
import { Skeleton } from "@/components/ui/skeleton";

interface TierCardGridProps {
  templates: TierTemplate[];
  isLoading?: boolean;
  onEdit: (template: TierTemplate, e?: React.MouseEvent) => void;
  onDelete: (template: TierTemplate, e?: React.MouseEvent) => void;
  onRowClick: (template: TierTemplate) => void;
}

function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TierCardGrid({
  templates,
  isLoading = false,
  onEdit,
  onDelete,
  onRowClick,
}: TierCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TierTemplateCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onRowClick}
        />
      ))}
    </div>
  );
}
