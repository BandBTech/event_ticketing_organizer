"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CurrencyDollarIcon,
  PencilSimpleIcon,
  LockIcon,
  CalendarBlankIcon,
  CashRegisterIcon,
} from "@phosphor-icons/react";
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
  TranslatedFormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useCreatePayoutRequest } from "@/hooks/usePayouts";
import { PayoutSummaryEvent } from "@/types/payout";
import { createPayoutRequestSchema, PayoutRequestFormData } from "@/lib/validation";
import { queryKeys } from "@/lib/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface PayoutRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEventId?: string;
  events?: PayoutSummaryEvent[];
}

export function PayoutRequestDialog({
  open,
  onOpenChange,
  defaultEventId,
  events = [],
}: PayoutRequestDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const payoutRequestFormSchema = useMemo(() => createPayoutRequestSchema(t), [t]);
  const createPayoutMutation = useCreatePayoutRequest();

  // Track whether the user wants to override the analytics-derived amount
  const [isManualAmount, setIsManualAmount] = useState(false);

  const form = useForm<PayoutRequestFormData>({
    resolver: zodResolver(payoutRequestFormSchema) as Resolver<PayoutRequestFormData>,
    defaultValues: {
      event_id: defaultEventId ?? "",
      amount: 0,
      description: "",
    },
  });

  const watchedEventId = form.watch("event_id");
  const safeEvents = useMemo(() => {
    return (events || []).filter(
      (e) =>
        e.pending_requests === 0 &&
        e.approved_requests === 0 &&
        e.paid_requests === 0
    );
  }, [events]);

  // Find the selected event's summary data
  const selectedEventInfo = safeEvents.find(
    (e) => e.event_id === watchedEventId,
  );

  // Auto-fill amount from event data whenever it changes (and user hasn't opted to enter manually)
  useEffect(() => {
    if (selectedEventInfo && !isManualAmount) {
      const revenue = selectedEventInfo.due_amount ?? 0;
      form.setValue("amount", revenue, { shouldValidate: true });
    }
  }, [selectedEventInfo, isManualAmount, form]);

  // Reset everything when dialog opens / defaultEventId changes
  useEffect(() => {
    if (open) {
      setIsManualAmount(false);
      // If a default event is provided and we already have its summary data,
      // pre-fill the amount immediately so the user sees it on open.
      const defaultEvent = defaultEventId
        ? safeEvents.find((e) => e.event_id === defaultEventId)
        : undefined;
      form.reset({
        event_id: defaultEventId ?? "",
        amount: defaultEvent?.due_amount ?? 0,
        description: "",
      });
    }
  }, [open, defaultEventId, form, safeEvents]);

  // When a new event is selected, clear amount and reset manual flag
  const handleEventChange = (eventId: string) => {
    form.setValue("event_id", eventId, { shouldValidate: true });
    setIsManualAmount(false);
    form.setValue("amount", 0);
  };

  const handleManualToggle = () => {
    setIsManualAmount(true);
  };

  const onSubmit = (data: PayoutRequestFormData) => {
    createPayoutMutation.mutate(
      {
        amount: data.amount,
        request_type: "event_payout",
        event_id: data.event_id,
        description: data.description,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setIsManualAmount(false);
          queryClient.invalidateQueries({ queryKey: queryKeys.payouts.summary });
        },
      },
    );
  };

  // Amount is auto-filled from analytics → disable unless user opts to enter manually
  const isAmountLocked = !!watchedEventId && !isManualAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-gray-900">
        <DialogHeader>
          <DialogTitle>
            {t("payouts.create.title", "Create Payout Request")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "payouts.create.description",
              "Submit a request to withdraw your earnings.",
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Event — first field, backed by summary events */}
              <FormField
                control={form.control}
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t("payouts.create.event", "Event")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={handleEventChange}
                        value={field.value}
                        disabled={!!defaultEventId}
                      >
                        <SelectTrigger
                          id="payout-event-id"
                          title={
                            field.value
                              ? safeEvents.find(
                                (e) => e.event_id === field.value,
                              )?.event_title
                              : undefined
                          }
                        >
                          <SelectValue
                            placeholder={t(
                              "payouts.create.eventPlaceholder",
                              "Select an event",
                            )}
                          >
                            {field.value
                              ? (safeEvents.find((e) => e.event_id === field.value)
                                ?.event_title ??
                                t(
                                  "payouts.create.eventPlaceholder",
                                  "Select an event",
                                ))
                              : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {safeEvents.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                              <CalendarBlankIcon className="h-5 w-5" />
                              <span>
                                {t("event.noEventsFound", "No events found")}
                              </span>
                            </div>
                          ) : (
                            safeEvents.map((event) => (
                              <SelectItem
                                key={event.event_id}
                                value={event.event_id}
                                title={event.event_title}
                                className="max-w-[390px] truncate line-clamp-1 cursor-pointer"
                              >
                                {event.event_title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />

              {/* Amount — auto-populated from analytics, lockable */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel required>
                        {t("payouts.create.amount", "Amount")}
                      </FormLabel>
                      {isAmountLocked && (
                        <button
                          type="button"
                          onClick={handleManualToggle}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <PencilSimpleIcon className="h-3.5 w-3.5" />
                          {t("payouts.create.enterManually", "Enter manually")}
                        </button>
                      )}
                    </div>
                    <FormControl>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="payout-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9 pr-3"
                          disabled={isAmountLocked}
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              field.onChange("");
                              return;
                            }
                            const num = Number(val);
                            if (isNaN(num)) return;
                            field.onChange(num);
                          }}
                        />
                        {isAmountLocked && (
                          <LockIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </FormControl>
                    {selectedEventInfo && !isManualAmount && (
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "payouts.create.analyticsNote",
                          "Pre-filled from event due amount.",
                        )}
                      </p>
                    )}
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("payouts.create.descriptionLabel", "Description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="payout-description"
                        placeholder={t(
                          "payouts.create.descriptionPlaceholder",
                          "Add notes…",
                        )}
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={createPayoutMutation.isPending}>
                {createPayoutMutation.isPending
                  ? t("common.processing", "Processing…")
                  : t("common.submit", "Submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
