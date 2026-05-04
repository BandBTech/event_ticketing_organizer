"use client";

import { useState, useMemo } from "react";
import Footer from "@/components/layout/footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Event, EventAnalyticsResponse, SalesAction } from "@/types/event";
import { eventService } from "@/services/eventService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stopSalesSchema,
  type StopSalesFormData,
  cancelEventSchema,
  type CancelEventFormData,
} from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  formatDateTimeLong,
  formatCurrency,
} from "@/lib/utils";
import { HtmlRenderer } from "@/components/ui/html-renderer";
import { queryKeys } from "@/lib/queryKeys";
import StatusHistorySidebar from "./StatusHistorySidebar";

import { SalesStatusBadge } from "./SalesStatusBadge";
import { EventStatusBadge } from "./EventStatusBadge";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { format, isValid } from "date-fns";
import {
  CalendarBlankIcon,
  ClockIcon,
  FireIcon,
  MapPinIcon,
  PauseIcon,
  PencilSimpleLineIcon,
  PlayIcon,
  ShieldCheckIcon,
  StopIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Loader2 } from "lucide-react";
import StatusHistoryFetcher from "./StatusHistoryFetcher";
import { Suspense } from "react";
import { PayoutRequestDialog } from "@/components/organizerDashboard/payouts/PayoutRequestDialog";
import { usePayoutSummary } from "@/hooks/usePayouts";
import { Separator } from "../ui/separator";
import FeaturedBadge from "./FeaturedBadge";
import { MoneyIcon } from "@phosphor-icons/react";

interface EventDetailsProps {
  event: Event;
  analytics?: EventAnalyticsResponse;
}

export default function EventDetails({ event, analytics }: EventDetailsProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const { currency: storedCurrency } = useCurrencyStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [salesAction, setSalesAction] = useState<SalesAction | null>(null);
  const [stopSalesReason, setStopSalesReason] = useState<string | undefined>(
    undefined,
  );
  const [stopSalesConfirmOpen, setStopSalesConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | undefined>(
    undefined,
  );
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const { data: payoutSummary } = usePayoutSummary();

  const totalTicketsSold =
    analytics?.sold_seats ??
    (event.tiers?.reduce((sum, ticket) => sum + (ticket.sold || 0), 0) || 0);
  const totalCapacity =
    analytics?.total_seats ??
    (event.tiers?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0);
  const totalRevenue =
    analytics?.total_revenue ??
    (event.tiers?.reduce(
      (sum, ticket) => sum + (ticket.sold || 0) * ticket.price,
      0,
    ) ||
      0);

  // Check if all ticket tiers have 0 sales
  // const hasZeroTicketSales = useMemo(() => {
  //   if (!event.tiers || event.tiers.length === 0) return true;
  //   return event.tiers.every((tier) => !tier.sold || tier.sold === 0);
  // }, [event.tiers]);

  const salesControlMutation = useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: SalesAction;
      reason?: string;
    }) => eventService.controlEventSales(event.id, { action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(event.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.analytics(event.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.statusHistory(event.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      setSalesDialogOpen(false);
      setStopSalesConfirmOpen(false);
      form.reset();
      setStopSalesReason(undefined);
      setSalesAction(null);
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: (reason: string) =>
      eventService.cancelEvent(event.id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(event.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.analytics(event.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.statusHistory(event.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      setCancelDialogOpen(false);
      setCancelConfirmOpen(false);
      cancelForm.reset();
      setCancelReason(undefined);
    },
  });

  const salesSchema = useMemo(() => stopSalesSchema(t), [t]);
  const form = useForm<StopSalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      reason: "",
    },
    mode: "onChange",
  });

  const cancelSchema = useMemo(() => cancelEventSchema(t), [t]);
  const cancelForm = useForm<CancelEventFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: "",
    },
    mode: "onChange",
  });

  const onSubmitCancel = (data: CancelEventFormData) => {
    setCancelReason(data.reason);
    setCancelConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    setCancelConfirmOpen(false);
    if (cancelReason) {
      cancelEventMutation.mutate(cancelReason);
    }
  };

  const onSubmitSales = (data: StopSalesFormData) => {
    if (salesAction) {
      // Store the reason and open confirmation dialog
      setStopSalesReason(data.reason);
      setStopSalesConfirmOpen(true);
    }
  };

  const handleStopSalesConfirm = () => {
    setStopSalesConfirmOpen(false);
    if (salesAction) {
      salesControlMutation.mutate({
        action: salesAction,
        reason: stopSalesReason,
      });
    }
  };

  const handleSalesAction = (action: SalesAction) => {
    setSalesAction(action);
    if (action === "stop") {
      setSalesDialogOpen(true);
    } else {
      salesControlMutation.mutate({ action });
    }
  };

  const salesStatus = analytics?.sales_status || "active";
  const isEventCancelled = event.status === "cancelled";
  const canControlSales =
    (event.status === "on_sale" || event.status === "hold") &&
    !isEventCancelled;
  const canEdit =
    event.status === "pending" ||
    event.status === "draft" ||
    event.status === "rejected";

  const progress =
    totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

  return (
    <>
      <div className="flex flex-col min-h-dvh bg-gray-50/50 text-gray-700">
        <div className="grow p-6 space-y-6 container mx-auto max-w-7xl">
          <div className="flex flex-col flex-wrap gap-4 md:items-start md:justify-between lg:flex-row">
            <div className="space-y-3">
              <h1 className="text-3xl text-gray-900 font-bold tracking-tight">
                {event.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                {/* {salesStatus === "stopped" &&
                !["completed", "cancelled"].includes(event.status) ? (
                  <SalesStatusBadge status={salesStatus} />
                ) : (
                  <EventStatusBadge status={event.status} />
                )} */}
                <EventStatusBadge status={event.status} />

                <div className="flex gap-4 flex-wrap ml-2">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CalendarBlankIcon weight="duotone" size={16} />
                    <span suppressHydrationWarning>
                      {isValid(new Date(event.start_date))
                        ? format(
                            new Date(event.start_date),
                            "MMM dd, yyyy h:mm a",
                          )
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPinIcon weight="duotone" size={16} />
                    <span>
                      {/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(
                        event.address?.trim() || "",
                      )
                        ? event.venue_name
                        : event.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {canControlSales && (
                <>
                  {salesStatus === "active" && event.status !== "hold" && (
                    <Button
                      onClick={() => handleSalesAction("pause")}
                      disabled={salesControlMutation.isPending}
                      variant="outline"
                      className="gap-2"
                    >
                      {salesControlMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <PauseIcon weight="duotone" size={18} />
                      )}
                      {t("event.button.pauseSales", "Pause Sales")}
                    </Button>
                  )}
                  {event.status === "hold" && (
                    <Button
                      onClick={() => handleSalesAction("resume")}
                      disabled={salesControlMutation.isPending}
                      variant="outline"
                      className="gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-100"
                    >
                      {salesControlMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <PlayIcon weight="duotone" size={18} />
                      )}
                      {t("event.button.resumeSales", "Resume Sales")}
                    </Button>
                  )}
                  {salesStatus !== "stopped" && (
                    <Button
                      onClick={() => handleSalesAction("stop")}
                      disabled={salesControlMutation.isPending}
                      variant="outline"
                      className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                    >
                      <StopIcon weight="duotone" size={18} />
                      {t("event.button.stopSales", "Stop Sales")}
                    </Button>
                  )}
                </>
              )}

              {canEdit && (
                <Link href={`/organizerDashboard/event/edit?id=${event.id}`}>
                  <Button variant="outline" className="gap-2 w-full">
                    <PencilSimpleLineIcon weight="duotone" size={16} />{" "}
                    {t("event.button.editEvent", "Edit Event")}
                  </Button>
                </Link>
              )}
              {/* {!isEventCancelled && event.status !== "rejected" && event.status !== "completed" && event.status !== "active" && ( */}
              {!isEventCancelled &&
                [
                  "pending",
                  "scheduled",
                  "on_sale",
                  "on_hold",
                  "sales_upcoming",
                  "sales_ended",
                ].includes(event.status) && (
                  // hasZeroTicketSales && (
                  <Button
                    onClick={() => setCancelDialogOpen(true)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <XCircleIcon weight="duotone" size={16} />{" "}
                    {t("common.cancel", "Cancel")}
                  </Button>
                )}
            </div>
          </div>

          {event.admin_remark && (
            <div
              className={`p-4 rounded-xl border ${
                event.status === "approved"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : event.status === "rejected"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-gray-50 border-gray-200 text-gray-800"
              }`}
            >
              <h3 className="font-semibold mb-1 flex items-center gap-2 text-gray-900">
                <ShieldCheckIcon weight="duotone" size={16} />
                {t("event.section.adminNotes", "Admin Notes")}
              </h3>
              <p className="text-sm opacity-90">{event.admin_remark}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card-lowest rounded-2xl overflow-hidden relative bg-gray-100 aspect-16/10">
                <Image
                  src={event.banner_image || "/placeholder.png"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />

                {event.is_featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <FeaturedBadge />
                  </div>
                )}
              </div>

              <div className="glass-card-lowest rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6 bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("event.field.eventDescription", "Event Description")}
                  </h3>
                  <div className="prose prose-gray max-w-none text-gray-600">
                    <HtmlRenderer html={event.description || ""} />
                  </div>
                </div>

                {event.category &&
                  (Array.isArray(event.category)
                    ? event.category.length > 0
                    : !!event.category) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {t("event.field.tags", "Tags")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {/* Category parsing logic same as EventCard or similar utility */}
                        {(Array.isArray(event.category)
                          ? (event.category as string[])
                          : typeof event.category === "string"
                            ? (event.category as string).split(",")
                            : []
                        )
                          .map((tag) =>
                            tag.trim().replace(/^[{"]+|[}"]+$/g, ""),
                          )
                          .filter(Boolean)
                          .map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    {t("event.field.venueName", "Venue Name")}
                  </h4>
                  <p className="font-medium text-gray-900 break-words">
                    {event.venue_name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    {t("event.field.location", "Location")}
                  </h4>
                  <p className="font-medium text-gray-900 break-words">
                    {/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(
                      event.address?.trim() || "",
                    )
                      ? event.venue_name
                      : event.address}
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 py-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    {t("events.eventDetails.eventDuration", "Event Duration")}
                  </h4>
                  <div className="flex col-span-2 flex-wrap gap-x-2 gap-y-2 text-gray-500">
                    <span className="text-gray-900 font-medium">
                      {event.start_date && isValid(new Date(event.start_date))
                        ? format(
                            new Date(event.start_date),
                            "MMM dd, yyyy h:mm a",
                          )
                        : "—"}
                    </span>
                    -
                    <span className="text-gray-900 font-medium">
                      {event.end_date && isValid(new Date(event.end_date))
                        ? format(
                            new Date(event.end_date),
                            "MMM dd, yyyy h:mm a",
                          )
                        : "—"}
                    </span>
                  </div>
                </div>

                {event.tiers && event.tiers.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      {t(
                        "events.sections.ticketSalesDuration",
                        "Ticket Sales Duration",
                      )}
                    </h4>
                    <div className="gap-6">
                      {event.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="grid sm:grid-cols-3 gap-2 py-2"
                        >
                          <span className="font-medium text-gray-900 lg:max-w-[200px] break-words">
                            {tier.tier_name}
                          </span>
                          <div className="flex col-span-2 flex-wrap gap-x-2 gap-y-2 text-gray-500">
                            <span className="text-gray-900 font-medium">
                              {tier.sales_start &&
                              isValid(new Date(tier.sales_start))
                                ? format(
                                    new Date(tier.sales_start),
                                    "MMM dd, yyyy h:mm a",
                                  )
                                : "—"}
                            </span>
                            -
                            <span className="text-gray-900 font-medium">
                              {tier.sales_end &&
                              isValid(new Date(tier.sales_end))
                                ? format(
                                    new Date(tier.sales_end),
                                    "MMM dd, yyyy h:mm a",
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card-lowest rounded-2xl p-6 shadow-sm border border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between gap-2">
                  <span>
                    {t("event.analytics.ticketAnalytics", "Ticket Analytics")}
                  </span>
                  <Link
                    href={`/organizerDashboard/event/tickets?id=${event.id}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
                    >
                      {t("event.button.viewTickets", "View All Tickets")}
                    </Button>
                  </Link>
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {t("events.analytics.progress", "Sales Progress")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">
                        {t("event.label.totalSold", "Total Sold")}
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {totalTicketsSold}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-600 mb-1">
                        {t("event.label.totalRevenue", "Revenue")}
                      </p>
                      <p className="text-lg font-bold text-emerald-700">
                        {formatCurrency(totalRevenue)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">
                      {t("event.section.ticketTiers", "Ticket Tiers")}
                    </h3>
                    {analytics?.tiers
                      ? analytics.tiers.map((tier) => {
                          const soldPercent =
                            tier.total_seats > 0
                              ? (tier.sold_seats / tier.total_seats) * 100
                              : 0;
                          return (
                            <div
                              key={tier.tier_id}
                              className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900 wrap-anywhere">
                                    {tier.tier_name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-emerald-600">
                                    {formatCurrency(tier.revenue)}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{
                                      width: `${Math.min(soldPercent, 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                  <span>
                                    {tier.sold_seats} / {tier.total_seats}{" "}
                                    {t("common.sold", "sold")}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {formatCurrency(tier.price)}
                                    {t("common.ticket", "ticket")}
                                  </p>
                                </div>
                                {(() => {
                                  if (!tier.sales_start && !tier.sales_end)
                                    return null;

                                  const now = new Date();
                                  const salesStart = tier.sales_start
                                    ? new Date(tier.sales_start)
                                    : null;
                                  const salesEnd = tier.sales_end
                                    ? new Date(tier.sales_end)
                                    : null;

                                  let displayText = null;
                                  let displayDate = null;

                                  if (
                                    salesStart &&
                                    isValid(salesStart) &&
                                    salesStart > now
                                  ) {
                                    displayText = t(
                                      "event.field.salesStartsOn",
                                      "Sales starts on",
                                    );
                                    displayDate = salesStart;
                                  } else if (
                                    salesStart &&
                                    isValid(salesStart) &&
                                    salesStart < now &&
                                    salesEnd &&
                                    isValid(salesEnd) &&
                                    salesEnd > now
                                  ) {
                                    displayText = t(
                                      "event.field.salesEndsOn",
                                      "Sales ends on",
                                    );
                                    displayDate = salesEnd;
                                  }

                                  if (!displayText || !displayDate) return null;

                                  return (
                                    <div className="flex flex-col gap-0.5 mt-2 text-xs text-gray-500 pt-1">
                                      <div className="flex items-start gap-1">
                                        <ClockIcon
                                          size={12}
                                          weight="duotone"
                                          className="mt-0.5"
                                        />
                                        <span>
                                          {displayText}:{" "}
                                          <span className="font-medium text-gray-600">
                                            {formatDateTime(displayDate)}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })
                      : event.tiers?.map((tier) => {
                          const sold = tier.sold || 0;
                          const soldPercent =
                            tier.quantity > 0
                              ? (sold / tier.quantity) * 100
                              : 0;
                          const tierRevenue = sold * tier.price;
                          return (
                            <div
                              key={tier.id}
                              className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {tier.tier_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatCurrency(tier.price)} /{" "}
                                    {t("common.ticket", "ticket")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-emerald-600">
                                    {formatCurrency(tierRevenue)}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-end text-xs text-gray-600">
                                  <span>
                                    {sold} / {tier.quantity}{" "}
                                    {t("common.sold", "sold")}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{
                                      width: `${Math.min(soldPercent, 100)}%`,
                                    }}
                                  />
                                </div>
                                {(() => {
                                  if (!tier.sales_start && !tier.sales_end)
                                    return null;

                                  const now = new Date();
                                  const salesStart = tier.sales_start
                                    ? new Date(tier.sales_start)
                                    : null;
                                  const salesEnd = tier.sales_end
                                    ? new Date(tier.sales_end)
                                    : null;

                                  let displayText = null;
                                  let displayDate = null;

                                  if (
                                    salesStart &&
                                    isValid(salesStart) &&
                                    salesStart > now
                                  ) {
                                    displayText = t(
                                      "event.field.salesStartsOn",
                                      "Sales starts on",
                                    );
                                    displayDate = salesStart;
                                  } else if (
                                    salesStart &&
                                    isValid(salesStart) &&
                                    salesStart < now &&
                                    salesEnd &&
                                    isValid(salesEnd) &&
                                    salesEnd > now
                                  ) {
                                    displayText = t(
                                      "event.field.salesEndsOn",
                                      "Sales ends on",
                                    );
                                    displayDate = salesEnd;
                                  }

                                  if (!displayText || !displayDate) return null;

                                  return (
                                    <div className="flex flex-col gap-0.5 mt-2 text-xs text-gray-500 pt-1">
                                      <div className="flex items-start gap-1">
                                        <ClockIcon
                                          size={12}
                                          weight="duotone"
                                          className="mt-0.5"
                                        />
                                        <span>
                                          {displayText}:{" "}
                                          <span className="font-medium text-gray-600">
                                            {formatDateTime(displayDate)}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              </div>

              {event.commission_rate != null &&
                ["on_sale", "hold", "completed", "live"].includes(
                  event.status,
                ) && (
                  <div className="glass-card-lowest rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t(
                        "event.section.organizerEarnings",
                        "Organizer Earnings",
                      )}
                    </h3>
                    {(() => {
                      const commissionRate = event.commission_rate!;
                      const commissionAmount =
                        totalRevenue * (commissionRate / 100);
                      const organizerEarnings = totalRevenue - commissionAmount;
                      const currency =
                        event.tiers?.[0]?.currency || storedCurrency;
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              {t("event.label.grossRevenue", "Gross Revenue")}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(totalRevenue)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              {t(
                                "event.label.commissionRate",
                                "Commission Rate",
                              )}
                            </span>
                            <span className="font-medium text-orange-600">
                              {commissionRate}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              {t("event.label.commissionAmount", "Commission")}
                            </span>
                            <span className="font-medium text-red-500">
                              − {formatCurrency(commissionAmount)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">
                              {t(
                                "event.label.organizerEarnings",
                                "Your Earnings",
                              )}
                            </span>
                            <span className="font-bold text-emerald-600 text-lg">
                              {formatCurrency(organizerEarnings)}
                            </span>
                          </div>
                          {(() => {
                            if (event.status !== "completed") return null;
                            const eventPayoutInfo = payoutSummary?.events?.find(
                              (e) => e.event_id === event.id,
                            );
                            if (!eventPayoutInfo) return null;
                            const hasRequestedPayout =
                              eventPayoutInfo.pending_requests > 0 ||
                              eventPayoutInfo.approved_requests > 0 ||
                              eventPayoutInfo.paid_requests > 0;
                            if (hasRequestedPayout) return null;
                            return (
                              <Button
                                onClick={() => setPayoutDialogOpen(true)}
                                variant="outline"
                                className="gap-2 w-full mt-2"
                              >
                                <MoneyIcon weight="duotone" size={18} />
                                {t("payouts.requestPayout", "Request Payout")}
                              </Button>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* <div className="glass-card-lowest rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("event.section.promoCodes", "Promo/Discount Codes")}
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  {t(
                    "event.text.noPromoCodes",
                    "No promo codes configured for this event.",
                  )}
                </p>
                </div> */}

              <Suspense
                fallback={
                  <StatusHistorySidebar history={[]} isLoading={true} />
                }
              >
                <StatusHistoryFetcher eventId={event.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            cancelForm.reset();
            setCancelReason(undefined);
          }
        }}
      >
        <DialogContent className="text-gray-900">
          <Form {...cancelForm}>
            <form onSubmit={cancelForm.handleSubmit(onSubmitCancel)}>
              <DialogHeader>
                <DialogTitle>
                  {t("event.dialog.cancelEvent.title", "Cancel Event")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField
                  control={cancelForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          "event.label.cancellationReason",
                          "Reason for cancellation (minimum 10 characters)",
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            "event.placeholder.cancellationReason",
                            "Please provide a reason for cancelling this event...",
                          )}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-start mt-1">
                        <FormMessage />
                        <div className="text-xs text-gray-500 text-right grow">
                          {field.value?.length || 0}/500{" "}
                          {t("common.characters", "characters")}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                >
                  {t("event.button.keepEvent", "Keep Event")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelEventMutation.isPending}
                >
                  {cancelEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.canceling", "Canceling...")}
                    </>
                  ) : (
                    t("event.dialog.cancelEvent.title", "Cancel Event")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                "event.dialog.cancelEvent.confirmTitle",
                "Confirm Cancel Event",
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "event.dialog.cancelEvent.confirmDescription",
                "Are you sure you want to cancel this event? This action cannot be undone.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 font-semibold"
            >
              {t("event.dialog.cancelEvent.title", "Cancel Event")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={salesDialogOpen}
        onOpenChange={(open) => {
          setSalesDialogOpen(open);
          if (open) form.reset();
        }}
      >
        <DialogContent className="text-gray-900">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitSales)}>
              <DialogHeader>
                <DialogTitle>
                  {t("event.dialog.stopSales.title", "Stop Event Sales")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("event.label.stopSalesReason", "Reason")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            "event.placeholder.stopSalesReason",
                            "Provide a reason for stopping sales...",
                          )}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-start mt-1">
                        <FormMessage />
                        <div className="text-xs text-gray-500 text-right grow">
                          {field.value?.length || 0}/500{" "}
                          {t("common.characters", "characters")}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSalesDialogOpen(false)}
                >
                  {t("common.cancelButton", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={salesControlMutation.isPending}
                >
                  {salesControlMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.processing", "Processing...")}
                    </>
                  ) : (
                    t("event.button.stopSales", "Stop Sales")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={stopSalesConfirmOpen}
        onOpenChange={setStopSalesConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("event.dialog.stopSales.confirmTitle", "Confirm Stop Sales")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "event.dialog.stopSales.confirmDescription",
                "Are you sure you want to stop sales for this event? This action will prevent all future ticket sales.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStopSalesConfirm}
              className="bg-red-600 hover:bg-red-700 font-semibold"
            >
              {t("event.button.stopSales", "Stop Sales")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PayoutRequestDialog
        open={payoutDialogOpen}
        onOpenChange={setPayoutDialogOpen}
        defaultEventId={event.id}
        events={payoutSummary?.events}
      />
    </>
  );
}
