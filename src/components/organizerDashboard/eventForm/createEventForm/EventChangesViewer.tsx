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
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {/* Section Header */}
        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Icon
            weight="duotone"
            className="w-4.5 h-4.5 text-gray-500 shrink-0"
          />
          <h4 className="font-bold text-gray-700 text-xs md:text-sm uppercase tracking-wider">
            {title}
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
    return (
      <div className="grid grid-cols-2 divide-x divide-gray-150 last:border-b-0">
        {/* Left side: Original */}
        <div
          className={cn(
            "p-4 text-xs md:text-sm transition-colors min-h-[60px] flex flex-col justify-start",
            isChanged ? "bg-gray-50/50" : "bg-white",
          )}
        >
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {label}
          </div>
          <div
            className={cn(
              "text-gray-600 leading-relaxed",
              isChanged && " text-gray-400/80",
            )}
          >
            {originalNode}
          </div>
        </div>

        {/* Right side: Proposed */}
        <div
          className={cn(
            "p-4 text-xs md:text-sm transition-colors min-h-[60px] flex flex-col justify-start",
            isChanged ? "bg-primary/5" : "bg-white",
          )}
        >
          <div className="flex items-center justify-between mb-1 gap-2">
            <div
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isChanged ? "text-primary font-bold" : "text-gray-450",
              )}
            >
              {label}
            </div>
            {isChanged && (
              <Badge className="bg-primary hover:bg-primary/95 text-white font-semibold text-[9px] px-1.5 py-0.5 rounded-full h-4 shrink-0">
                {t("event.confirm.badgeChanged", "Changed")}
              </Badge>
            )}
          </div>
          <div
            className={cn(
              "text-gray-900 leading-relaxed",
              isChanged ? "text-primary font-semibold" : "font-normal",
            )}
          >
            {proposedNode}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
                {initialData.is_refundable
                  ? t("common.yes", "Yes")
                  : t("common.no", "No")}
              </span>
            ),
            proposedNode: (
              <span>
                {currentValues.is_refundable
                  ? t("common.yes", "Yes")
                  : t("common.no", "No")}
              </span>
            ),
          }),
          renderTableRow({
            label: t("event.field.eventType", "Event Type"),
            isChanged: hasEventTypeChanged,
            originalNode: <span>{initialData.event_type || "-"}</span>,
            proposedNode: <span>{currentValues.event_type || "-"}</span>,
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
