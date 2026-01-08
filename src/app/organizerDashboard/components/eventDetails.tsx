"use client";

import { useState, useMemo } from "react";
import Footer from "@/components/layout/footer";
import {
  MapPin,
  Calendar,
  XCircle,
  PauseCircle,
  PlayCircle,
  StopCircle,
  PencilLine,
  CircleDot,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stopSalesSchema, type StopSalesFormData, cancelEventSchema, type CancelEventFormData } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { HtmlRenderer } from "@/components/ui/html-renderer";
import { queryKeys } from "@/lib/queryKeys";
import StatusHistorySidebar from "./StatusHistorySidebar";
import { useQuery } from "@tanstack/react-query";
import { SalesStatusBadge } from "./SalesStatusBadge";

interface EventDetailsProps {
  event: Event;
  analytics?: EventAnalyticsResponse;
}

import { useTranslation } from "@/hooks/useTranslation";

export default function EventDetailsPage({ event, analytics }: EventDetailsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch status history
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: queryKeys.events.statusHistory(event.id),
    queryFn: () => eventService.getStatusHistory(event.id),
  });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  // const [cancelReason, setCancelReason] = useState(""); // Removed in favor of hook form
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  const [salesAction, setSalesAction] = useState<SalesAction | null>(null);
  // const [salesReason, setSalesReason] = useState(""); // Removed in favor of hook form

  // Use analytics data if available, otherwise fall back to event tiers
  const totalTicketsSold = analytics?.sold_seats ??
    (event.tiers?.reduce((sum, ticket) => sum + (ticket.sold || 0), 0) || 0);
  const totalCapacity = analytics?.total_seats ??
    (event.tiers?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0);
  const totalRevenue = analytics?.total_revenue ??
    (event.tiers?.reduce((sum, ticket) => sum + ((ticket.sold || 0) * ticket.price), 0) || 0);

  // Sales control mutation
  const salesControlMutation = useMutation({
    mutationFn: ({ action, reason }: { action: SalesAction; reason?: string }) =>
      eventService.controlEventSales(event.id, { action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(event.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.analytics(event.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(event.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      setSalesDialogOpen(false);
      form.reset();
      setSalesAction(null);
    },
  });

  // Cancel event mutation
  const cancelEventMutation = useMutation({
    mutationFn: (reason: string) => eventService.cancelEvent(event.id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(event.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.analytics(event.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(event.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      setCancelDialogOpen(false);
      cancelForm.reset();
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
    cancelEventMutation.mutate(data.reason);
  };

  const onSubmitSales = (data: StopSalesFormData) => {
    if (salesAction) {
      salesControlMutation.mutate({ action: salesAction, reason: data.reason });
    }
  };

  const handleSalesAction = (action: SalesAction) => {
    setSalesAction(action);
    if (action === 'stop') {
      // Stop requires confirmation dialog
      setSalesDialogOpen(true);
    } else {
      // Pause/Resume can be done directly
      salesControlMutation.mutate({ action });
    }
  };

  // const confirmSalesAction = () => { // Removed as we use form submit now
  //   if (salesAction) {
  //     salesControlMutation.mutate({ action: salesAction, reason: salesReason });
  //   }
  // };

  // const handleCancelEvent = () => { // Removed in favor of form
  //   if (cancelReason.length >= 10) {
  //     cancelEventMutation.mutate(cancelReason);
  //   }
  // };

  // Determine sales status for button display
  const salesStatus = analytics?.sales_status || 'active';
  const isEventCancelled = event.status === 'cancelled';
  const canControlSales = event.status === 'approved' && !isEventCancelled;
  const canEdit = event.status === 'pending' || event.status === 'draft';

  // Get the first tier's sales dates if available
  const firstTier = event.tiers?.[0];
  const salesStartDate = firstTier?.sales_start
    ? formatDateTime(firstTier.sales_start)
    : 'Not set';
  const salesEndDate = firstTier?.sales_end
    ? formatDateTime(firstTier.sales_end)
    : 'Not set';

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="grow p-6 space-y-6 @container">
          {/* Event Title + Actions */}
          <div className="flex flex-col flex-wrap gap-4 md:items-start md:justify-between @min-4xl:flex-row">
            <div className="space-y-2">
              <h2 className="text-3xl text-gray-700 font-bold">
                {event.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                <Badge
                  className={`flex items-center gap-1 capitalize ${event.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-500' :
                    event.status === 'pending' ? 'bg-amber-500 hover:bg-amber-500' :
                      event.status === 'cancelled' ? 'bg-red-500 hover:bg-red-500' :
                        event.status === 'draft' ? 'bg-gray-500 hover:bg-gray-500' :
                          event.status === 'rejected' ? 'bg-red-500 hover:bg-red-500' :
                            'bg-blue-500 hover:bg-blue-500'
                    }`}
                >
                  <CircleDot className="w-3 h-3" />
                  {t(`event.status.${event.status}`, event.status)}
                </Badge>
                {event.status === 'approved' && (
                  <SalesStatusBadge status={analytics?.sales_status || 'active'} />
                )}
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-gray-700 ">
                    <Calendar size={14} /> {new Date(event.start_date).toLocaleDateString()} {new Date(event.start_date).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-1 text-gray-700 ">
                    <MapPin size={14} />{event.address}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {canControlSales && (
                <>
                  {salesStatus === 'active' && (
                    <button
                      onClick={() => handleSalesAction('pause')}
                      disabled={salesControlMutation.isPending}
                      className="flex whitespace-nowrap items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                      {salesControlMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <PauseCircle size={16} />
                      )}
                      {t("event.button.pauseSales", "Pause Sales")}
                    </button>
                  )}
                  {salesStatus === 'paused' && (
                    <button
                      onClick={() => handleSalesAction('resume')}
                      disabled={salesControlMutation.isPending}
                      className="flex whitespace-nowrap items-center gap-2 px-4 py-2 border border-green-400 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      {salesControlMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <PlayCircle size={16} />
                      )}
                      {t("event.button.resumeSales", "Resume Sales")}
                    </button>
                  )}
                  {salesStatus !== 'stopped' && (
                    <button
                      onClick={() => handleSalesAction('stop')}
                      disabled={salesControlMutation.isPending}
                      className="flex whitespace-nowrap items-center gap-2 px-4 py-2 border border-orange-400 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                    >
                      <StopCircle size={16} />
                      {t("event.button.stopSales", "Stop Sales")}
                    </button>
                  )}
                </>
              )}
              {canEdit && (
                <Link
                  href={`/organizerDashboard/pages/createevents?id=${event.id}&edit=true`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <PencilLine size={16} /> {t("event.button.editEvent", "Edit Event")}
                </Link>
              )}
              {!isEventCancelled && event.status !== 'rejected' && (
                <button
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg border border-red-400 bg-red-200 text-red-500 hover:bg-red-300"
                >
                  <XCircle size={16} /> {t("common.button.cancel", "Cancel")}
                </button>
              )}
            </div>
          </div>

          {/* Admin Remark Section */}
          {event.admin_remark && (
            <div className={`p-4 rounded-xl ${event.status === 'approved' ? 'bg-green-50 border border-green-200' : event.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`font-semibold mb-0 ${event.status === 'approved' ? 'text-green-700' : event.status === 'rejected' ? 'text-red-700' : 'text-gray-700'}`}>
                {t("event.section.adminNotes", "Admin Notes")}
              </h3>
              <p className="text-gray-600">{event.admin_remark}</p>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid @3xl:grid-cols-3 gap-6">
            {/* Banner */}
            <div className="@3xl:col-span-2 space-y-6">
              <div className="rounded-xl overflow-hidden relative h-64 md:h-80 lg:h-96">
                <Image
                  src={event.banner_image || "/placeholder.png"}
                  alt={event.title}
                  fill={true}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Description */}
              <div className="rounded-xl bg-white  p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 ">
                  {t("event.section.description", "Event description")}
                </h3>
                <HtmlRenderer html={event.description || ""} />
                <div className="flex flex-wrap gap-2 ">
                  <h3 className="w-full text-lg font-semibold text-gray-700 mb-2">{t("event.field.tags", "Tags")}</h3>
                  {(Array.isArray(event.category)
                    ? (event.category as string[])
                    : typeof event.category === "string"
                      ? (event.category as string).split(",")
                      : []
                  )
                    .map((tag) => tag.trim().replace(/^[{"]+|[}"]+$/g, ""))
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm break-all"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">{t("event.field.venue", "Venue")}</h3>
                    <p className="font-medium text-gray-500">
                      {event.venue_name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold ">{t("event.field.location", "Location")}</h3>
                    <p className="font-medium text-gray-500">{event.address}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold ">{t("event.field.eventStartsOn", "Event Starts On")}</h3>
                    <p className="font-medium text-gray-500">
                      {formatDateTime(event.start_date)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold ">{t("event.field.eventEndsOn", "Event Ends On")}</h3>
                    <p className="font-medium text-gray-500">
                      {formatDateTime(event.end_date)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("event.field.ticketSalesStartsOn", "Ticket Sales Starts On")}</h3>
                    <p className="font-medium text-gray-500">
                      {salesStartDate}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("event.field.ticketSalesEndsOn", "Ticket Sales Ends On")}</h3>
                    <p className="font-medium text-gray-500">
                      {salesEndDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Ticket Sales */}
            <div className="space-y-6 text-gray-700">
              {/* Ticket Tiers */}
              <div className="rounded-xl  bg-white p-6 shadow-sm space-y-4 @container">
                <h3 className="text-lg font-semibold">{t("event.section.ticketTiers", "Ticket Tiers")}</h3>
                {/* Use analytics tiers if available, otherwise fall back to event tiers */}
                {analytics?.tiers ? (
                  analytics.tiers.map((tier, index) => {
                    const colors = [
                      { labelClass: "text-gray-700", barClass: "bg-gray-500", cardClass: "bg-gray-50" },
                      { labelClass: "text-amber-700", barClass: "bg-amber-500", cardClass: "bg-amber-50" },
                      { labelClass: "text-orange-700", barClass: "bg-orange-500", cardClass: "bg-orange-50" },
                      { labelClass: "text-purple-700", barClass: "bg-purple-500", cardClass: "bg-purple-50" },
                    ];
                    const color = colors[index % colors.length];
                    const soldPercent = tier.total_seats > 0
                      ? (tier.sold_seats / tier.total_seats) * 100
                      : 0;

                    return (
                      <div key={tier.tier_id} className={`space-y-2 p-3 rounded-lg shadow-sm ${color.cardClass}`}>
                        <div className="flex justify-between text-sm @sm:flex-row flex-col">
                          <p className={`font-semibold ${color.labelClass}`}>{tier.tier_name}</p>
                          <p className="text-gray-600">{tier.currency || 'NPR'} {tier.price}/{t("event.text.ticket", "ticket")}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${color.barClass} h-2 rounded-full`}
                            style={{ width: `${Math.min(soldPercent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm @sm:flex-row flex-col">
                          <span>{tier.sold_seats}/{tier.total_seats} {t("event.text.sold", "sold")}</span>
                          <span className="text-green-600 font-medium">
                            {tier.currency || 'NPR'} {tier.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  event.tiers?.map((ticket, index) => {
                    const colors = [
                      { labelClass: "text-gray-700", barClass: "bg-gray-500", cardClass: "bg-gray-50" },
                      { labelClass: "text-amber-700", barClass: "bg-amber-500", cardClass: "bg-amber-50" },
                      { labelClass: "text-orange-700", barClass: "bg-orange-500", cardClass: "bg-orange-50" },
                      { labelClass: "text-purple-700", barClass: "bg-purple-500", cardClass: "bg-purple-50" },
                    ];
                    const color = colors[index % colors.length];
                    const sold = ticket.sold || 0;
                    const soldPercent = ticket.quantity > 0 ? (sold / ticket.quantity) * 100 : 0;

                    return (
                      <div key={ticket.id} className={`space-y-2 p-3 rounded-lg shadow-sm ${color.cardClass}`}>
                        <div className="flex justify-between text-sm @sm:flex-row flex-col">
                          <p className={`font-semibold ${color.labelClass}`}>{ticket.tier_name}</p>
                          <p className="text-gray-600">NPR {ticket.price}/{t("event.text.ticket", "ticket")}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${color.barClass} h-2 rounded-full`}
                            style={{ width: `${Math.min(soldPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{sold}/{ticket.quantity} {t("event.text.sold", "sold")}</span>
                      </div>
                    );
                  })
                )}
                <div className="grid @sm:grid-cols-2 border-t p-2 gap-2">
                  <div>
                    <p className="font-semibold">{t("event.label.totalSales", "Total Sales")}</p>
                    <p className="font-semibold">{totalTicketsSold}/{totalCapacity}</p>
                  </div>
                  <div className="@sm:justify-items-end">
                    <p className="font-semibold">{t("event.label.totalRevenue", "Total Revenue")}</p>
                    <p className="font-semibold text-green-600">NPR {totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Promo Codes */}
              <div className="rounded-xl  bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold">{t("event.section.promoCodes", "Promo/Discount Codes")}</h3>
                <p className="text-gray-500 text-sm">{t("event.text.noPromoCodes", "No promo codes configured for this event.")}</p>
              </div>

              {/* Status History */}
              <StatusHistorySidebar history={history} isLoading={isLoadingHistory} />
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Event Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={(open) => {
        setCancelDialogOpen(open);
        if (open) cancelForm.reset();
      }}>
        <DialogContent>
          <Form {...cancelForm}>
            <form onSubmit={cancelForm.handleSubmit(onSubmitCancel)}>
              <DialogHeader>
                <DialogTitle>{t("event.dialog.cancelEvent.title", "Cancel Event")}</DialogTitle>
                <DialogDescription>
                  {t("event.dialog.cancelEvent.description", "Are you sure you want to cancel this event? This action cannot be undone. All ticket holders will be notified.")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField
                  control={cancelForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.label.cancellationReason", "Reason for cancellation (minimum 10 characters)")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("event.placeholder.cancellationReason", "Please provide a reason for cancelling this event...")}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-start mt-1">
                        <FormMessage />
                        <div className="text-xs text-gray-500 text-right grow">
                          {field.value?.length || 0}/500 characters
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
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
                      Cancelling...
                    </>
                  ) : (
                    t("event.button.cancelEvent", "Cancel Event")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stop Sales Confirmation Dialog */}
      <Dialog open={salesDialogOpen} onOpenChange={(open) => {
        setSalesDialogOpen(open);
        if (open) form.reset();
      }}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitSales)}>
              <DialogHeader>
                <DialogTitle>{t("event.dialog.stopSales.title", "Stop Event Sales")}</DialogTitle>
                <DialogDescription>
                  {t("event.dialog.stopSales.description", "Are you sure you want to stop sales for this event? This will prevent any new ticket purchases.")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("event.label.stopSalesReason", "Reason (optional)")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("event.placeholder.stopSalesReason", "Provide a reason for stopping sales...")}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-start mt-1">
                        <FormMessage />
                        <div className="text-xs text-gray-500 text-right grow">
                          {field.value?.length || 0}/500 characters
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSalesDialogOpen(false)}>
                  {t("common.button.cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={salesControlMutation.isPending}
                >
                  {salesControlMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
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

      {/* Footer */}
      <Footer />
    </>
  );
}
