"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { formatDateTime, cn } from "@/lib/utils";
import { CalendarBlankIcon, TagIcon, TicketIcon } from "@phosphor-icons/react";
import {
  Event,
  UpdateEventRequest,
  TierTemplate,
  EventTier,
} from "@/types/event";
import { EventFormData } from "@/lib/validation";
import { HtmlRenderer } from "@/components/ui/html-renderer";
import { parseBoolean } from "@/lib/eventFormUtils";

interface EventChangesViewerProps {
  initialData: Event;
  currentValues: EventFormData;
  changedFields: UpdateEventRequest;
  tierTemplates: TierTemplate[];
  imagePreview: string;
}

export function EventChangesViewer({
  initialData,
  currentValues,
  changedFields,
  tierTemplates,
  imagePreview,
}: EventChangesViewerProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Helper to parse categories
  const parseCategoriesLocal = (
    cat: string | string[] | undefined,
  ): string[] => {
    const raw = Array.isArray(cat)
      ? cat
      : typeof cat === "string"
        ? cat.split(",")
        : [];
    return raw
      .map((tag) => tag.trim().replace(/^[{"]+|[}"]+$/g, ""))
      .filter(Boolean);
  };

  const getTierNameLocal = (
    tier:
      | EventTier
      | {
          name?: string;
          tier_template_id?: string;
          template_id?: string;
          price?: number;
          quantity?: number;
        },
  ) => {
    const templateId =
      ("tier_template_id" in tier ? tier.tier_template_id : undefined) ||
      ("template_id" in tier ? tier.template_id : undefined);
    const template = tierTemplates.find((temp) => temp.id === templateId);
    return (
      template?.template_name ||
      ("tier_name" in tier ? tier.tier_name : undefined) ||
      ("name" in tier ? tier.name : undefined) ||
      t("event.confirm.unknownTier", "Standard Tier")
    );
  };

  const getCountryName = (code: string | undefined) => {
    if (!code) return "-";
    try {
      const countryDisplayNames = new Intl.DisplayNames([locale], { type: "region" });
      return countryDisplayNames.of(code.toUpperCase()) || code;
    } catch (error) {
      return code;
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");
  };

  const formatEventType = (type: string | undefined) => {
    if (!type) return "-";
    const translated = t(`event.eventType.${type.toLowerCase()}`, type);
    return toTitleCase(translated);
  };

  // Identify changed fields
  const hasTitleChanged = changedFields.title !== undefined;
  const hasDescriptionChanged = changedFields.description !== undefined;
  const hasEventTypeChanged = changedFields.event_type !== undefined;
  const hasCountryChanged = changedFields.country !== undefined;
  const hasDatesChanged =
    changedFields.start_date !== undefined ||
    changedFields.end_date !== undefined;
  const hasVenueChanged =
    changedFields.venue_name !== undefined ||
    changedFields.address !== undefined;
  const hasCapacityChanged = changedFields.capacity !== undefined;
  const hasRefundableChanged = changedFields.is_refundable !== undefined;
  const hasCategoryChanged = changedFields.category !== undefined;
  const hasTiersChanged = changedFields.tiers !== undefined;
  const hasImageChanged = changedFields.banner_image !== undefined;

  // Render a section group card
  const renderSectionPanel = ({
    title,
    icon: Icon,
    rows,
  }: {
    title: string;
    icon: React.ElementType;
    rows: React.ReactNode[];
  }) => {
    return (
      <div className="border border-gray-200/90 rounded-xl overflow-hidden shadow-xs bg-white">
        {/* Section Header */}
        <div className="bg-gray-50/90 px-4 py-3 border-b border-gray-200/80 flex items-center gap-2">
          <Icon
            weight="duotone"
            className="w-4.5 h-4.5 text-gray-500 shrink-0"
          />
          <h4 className="font-semibold text-gray-800 text-xs md:text-sm tracking-normal">
            {toTitleCase(title)}
          </h4>
        </div>
        {/* Rows */}
        <div className="divide-y divide-gray-150">{rows}</div>
      </div>
    );
  };

  // Render a table-like row comparing Original vs Proposed side-by-side
  const renderTableRow = ({
    label,
    isChanged,
    originalNode,
    proposedNode,
  }: {
    label: string;
    isChanged: boolean;
    originalNode: React.ReactNode;
    proposedNode: React.ReactNode;
  }) => {
    const formattedLabel = toTitleCase(label);
    return (
      <div className="grid grid-cols-2 divide-x divide-gray-200/80 last:border-b-0">
        {/* Left side: Original */}
        <div
          className={cn(
            "p-3.5 md:p-4 text-xs md:text-sm transition-colors min-h-[60px] flex flex-col justify-start",
            isChanged ? "bg-gray-50/70" : "bg-white",
          )}
        >
          <div className="text-xs font-semibold text-gray-500 mb-1.5">
            {formattedLabel}
          </div>
          <div
            className={cn(
              "text-gray-700 leading-relaxed",
              isChanged && "text-gray-500",
            )}
          >
            {originalNode}
          </div>
        </div>

        {/* Right side: Proposed */}
        <div
          className={cn(
            "p-3.5 md:p-4 text-xs md:text-sm transition-colors min-h-[60px] flex flex-col justify-start",
            isChanged ? "bg-blue-50/40" : "bg-white",
          )}
        >
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div
              className={cn(
                "text-xs font-semibold",
                isChanged ? "text-blue-700 font-bold" : "text-gray-600",
              )}
            >
              {formattedLabel}
            </div>
            {isChanged && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                {t("event.confirm.badgeChanged", "Changed")}
              </Badge>
            )}
          </div>
          <div
            className={cn(
              "text-gray-900 leading-relaxed",
              isChanged ? "text-blue-950 font-semibold" : "font-normal",
            )}
          >
            {proposedNode}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Column Header Bar */}
      <div className="grid grid-cols-2 bg-gray-100/90 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 overflow-hidden divide-x divide-gray-200">
        <div className="px-4 py-2.5 flex items-center gap-1.5 text-gray-600">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          {t("event.confirm.originalDetails", "Original Details")}
        </div>
        <div className="px-4 py-2.5 flex items-center justify-between gap-1.5 text-blue-700 bg-blue-50/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            {t("event.confirm.proposedChanges", "Proposed Changes")}
          </div>
        </div>
      </div>
      {/* Group 1: Event Details */}
      {renderSectionPanel({
        title: t("event.section.eventDetails", "Event Details"),
        icon: TagIcon,
        rows: [
          renderTableRow({
            label: t("event.field.bannerImage", "Banner Image"),
            isChanged: hasImageChanged,
            originalNode: (
              <div className="relative aspect-16/10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-w-[200px] shadow-sm">
                <Image
                  src={initialData.banner_image || "/placeholder.png"}
                  alt="Original Banner"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ),
            proposedNode: (
              <div className="relative aspect-16/10 rounded-lg overflow-hidden border border-primary/20 bg-primary/[0.01] max-w-[200px] shadow-sm">
                <Image
                  src={imagePreview || "/placeholder.png"}
                  alt="Proposed Banner"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ),
          }),
          renderTableRow({
            label: t("event.field.eventName", "Event Name"),
            isChanged: hasTitleChanged,
            originalNode: <span>{initialData.title}</span>,
            proposedNode: <span>{currentValues.name}</span>,
          }),
          renderTableRow({
            label: t("event.field.eventDescription", "Description"),
            isChanged: hasDescriptionChanged,
            originalNode: (
              <HtmlRenderer
                html={initialData.description || ""}
                className="text-gray-500 text-xs md:text-sm max-h-[120px] overflow-y-auto"
              />
            ),
            proposedNode: (
              <HtmlRenderer
                html={currentValues.description || ""}
                className="text-gray-900 text-xs md:text-sm max-h-[120px] overflow-y-auto"
              />
            ),
          }),
          renderTableRow({
            label: t("event.field.categoryTags", "Category Tags"),
            isChanged: hasCategoryChanged,
            originalNode: (
              <div className="flex flex-wrap gap-1.5">
                {parseCategoriesLocal(initialData.category || []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal rounded-xl bg-gray-50 border-gray-200 text-gray-500"
                  >
                    {tag}
                  </Badge>
                ))}
                {parseCategoriesLocal(initialData.category || []).length ===
                  0 && <span className="text-sm text-gray-400">-</span>}
              </div>
            ),
            proposedNode: (
              <div className="flex flex-wrap gap-1.5">
                {currentValues.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-semibold rounded-xl bg-primary/[0.03] border-primary/25 text-primary shadow-sm"
                  >
                    {tag}
                  </Badge>
                ))}
                {currentValues.tags.length === 0 && (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
            ),
          }),
          renderTableRow({
            label: t("event.field.capacity", "Capacity"),
            isChanged: hasCapacityChanged,
            originalNode: (
              <span>{initialData.capacity?.toLocaleString() || "-"}</span>
            ),
            proposedNode: (
              <span>{currentValues.capacity?.toLocaleString() || "-"}</span>
            ),
          }),
          renderTableRow({
            label: t("event.field.refundable", "Refundable"),
            isChanged: hasRefundableChanged,
            originalNode: (
              <span>
                {parseBoolean(initialData.is_refundable)
                  ? t("common.yes", "Yes")
                  : t("common.no", "No")}
              </span>
            ),
            proposedNode: (
              <span>
                {parseBoolean(currentValues.is_refundable)
                  ? t("common.yes", "Yes")
                  : t("common.no", "No")}
              </span>
            ),
          }),
          renderTableRow({
            label: t("event.field.eventType", "Event Type"),
            isChanged: hasEventTypeChanged,
            originalNode: <span>{formatEventType(initialData.event_type)}</span>,
            proposedNode: <span>{formatEventType(currentValues.event_type)}</span>,
          }),
          renderTableRow({
            label: t("event.field.country", "Country"),
            isChanged: hasCountryChanged,
            originalNode: <span>{getCountryName(initialData.country)}</span>,
            proposedNode: <span>{getCountryName(currentValues.country)}</span>,
          }),
        ],
      })}

      {/* Group 2: Venue & Schedule */}
      {renderSectionPanel({
        title: t("event.section.venueSchedule", "Venue & Schedule"),
        icon: CalendarBlankIcon,
        rows: [
          renderTableRow({
            label: t("event.field.eventSchedule", "Event Schedule"),
            isChanged: hasDatesChanged,
            originalNode: (
              <div className="space-y-1">
                <div className="font-medium text-gray-500">
                  {initialData.start_date
                    ? formatDateTime(initialData.start_date, { timezone: initialData.timezone })
                    : "-"}{" "}
                  -{" "}
                  {initialData.end_date
                    ? formatDateTime(initialData.end_date, { timezone: initialData.timezone })
                    : "-"}
                </div>
                <div className="text-xs text-gray-400">
                  ({initialData.timezone})
                </div>
              </div>
            ),
            proposedNode: (
              <div className="space-y-1">
                <div className="font-bold">
                  {currentValues.startDate
                    ? formatDateTime(currentValues.startDate, { timezone: currentValues.timezone })
                    : "-"}{" "}
                  -{" "}
                  {currentValues.endDate
                    ? formatDateTime(currentValues.endDate, { timezone: currentValues.timezone })
                    : "-"}
                </div>
                <div className="text-xs text-primary/80">
                  ({currentValues.timezone})
                </div>
              </div>
            ),
          }),
          renderTableRow({
            label: t("event.field.venue", "Venue & Location"),
            isChanged: hasVenueChanged,
            originalNode: (
              <div className="space-y-0.5 text-gray-500">
                <div className="font-semibold">{initialData.venue_name}</div>
                <div className="text-xs break-all">{initialData.address}</div>
              </div>
            ),
            proposedNode: (
              <div className="space-y-0.5">
                <div className="font-bold">{currentValues.venue}</div>
                <div className="text-xs break-all">
                  {currentValues.venueAddress}
                </div>
              </div>
            ),
          }),
        ],
      })}

      {/* Group 3: Ticketing */}
      {renderSectionPanel({
        title: t("event.field.ticketTiers", "Ticketing"),
        icon: TicketIcon,
        rows: [
          renderTableRow({
            label: t("event.field.ticketTiers", "Ticket Tiers"),
            isChanged: hasTiersChanged,
            originalNode: (
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {initialData.tiers?.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs text-gray-500 bg-gray-50/50 p-2.5 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                      <span className="font-semibold truncate">
                        {getTierNameLocal(tier)}
                      </span>
                      {tier.sales_start && (
                        <div className="text-[10px] text-gray-400 flex flex-col gap-0.5 mt-0.5 whitespace-normal">
                          <span>
                            {t("event.field.salesStart", "Sales Start")}: {formatDateTime(tier.sales_start, { timezone: initialData.timezone })}
                          </span>
                          {tier.sales_end && (
                            <span>
                              {t("event.field.salesEnd", "Sales End")}: {formatDateTime(tier.sales_end, { timezone: initialData.timezone })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-450 shrink-0">
                      {tier.quantity} x {initialData.currency} {tier.price}
                    </span>
                  </div>
                ))}
                {(!initialData.tiers || initialData.tiers.length === 0) && (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
            ),
            proposedNode: (
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {currentValues.tickets.map(
                  (
                    ticket: { name: string; quantity: number; price: number; salesStart?: string; salesEnd?: string },
                    idx: number,
                  ) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs bg-primary/[0.02] border-primary/25 text-gray-900 p-2.5 rounded-lg border shadow-sm font-medium"
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                        <span className="font-bold truncate text-primary">
                          {ticket.name}
                        </span>
                        {ticket.salesStart && (
                          <div className="text-[10px] text-primary/70 flex flex-col gap-0.5 mt-0.5 whitespace-normal">
                            <span>
                              {t("event.field.salesStart", "Sales Start")}: {formatDateTime(ticket.salesStart, { timezone: currentValues.timezone })}
                            </span>
                            {ticket.salesEnd && (
                              <span>
                                {t("event.field.salesEnd", "Sales End")}: {formatDateTime(ticket.salesEnd, { timezone: currentValues.timezone })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="font-semibold shrink-0">
                        {ticket.quantity} x {currentValues.currency}{" "}
                        {ticket.price}
                      </span>
                    </div>
                  ),
                )}
              </div>
            ),
          }),
        ],
      })}
    </div>
  );
}
