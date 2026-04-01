"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CurrencyDollarIcon,
  PencilSimpleIcon,
  LockIcon,
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
import { EventSelect, EventOption } from "@/components/ui/EventSelect";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useCreatePayoutRequest } from "@/hooks/usePayouts";
import { PayoutSummaryEvent } from "@/types/payout";
import {
  createPayoutRequestSchema,
  PayoutRequestFormData,
  BUSINESS_DESC_MAX,
} from "@/lib/validation";
import { queryKeys } from "@/lib/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageStore } from "@/store/languageStore";

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
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();
  const payoutRequestFormSchema = useMemo(
    () => createPayoutRequestSchema(t),
    [t],
  );
  const createPayoutMutation = useCreatePayoutRequest();

  const form = useForm<PayoutRequestFormData>({
    resolver: zodResolver(
      payoutRequestFormSchema,
    ) as Resolver<PayoutRequestFormData>,
    defaultValues: {
      event_id: defaultEventId ?? "",
      amount: 0,
      description: "",
    },
  });

  const watchedEventId = form.watch("event_id");
  const safeEvents = useMemo(() => {
    return (events || [])
      .filter(
        (e) =>
          e.pending_requests === 0 &&
          e.approved_requests === 0 &&
          e.paid_requests === 0,
      )
      .sort((a, b) => a.event_title.localeCompare(b.event_title));
  }, [events]);

  // Find the selected event's summary data — memoized for stable reference
  const selectedEventInfo = useMemo(
    () => safeEvents.find((e) => e.event_id === watchedEventId),
    [safeEvents, watchedEventId],
  );

  // Auto-fill amount from event data whenever it changes
  useEffect(() => {
    if (selectedEventInfo) {
      const revenue = selectedEventInfo.due_amount ?? 0;
      form.setValue("amount", revenue);
    }
  }, [selectedEventInfo, form]);

  // Reset everything when dialog opens / defaultEventId changes
  useEffect(() => {
    if (open) {
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

  // When a new event is selected, clear amount
  const handleEventChange = (eventId: string) => {
    form.setValue("event_id", eventId, { shouldValidate: true });
    form.setValue("amount", 0);
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
          queryClient.invalidateQueries({
            queryKey: queryKeys.payouts.summary,
          });
        },
      },
    );
  };

  // Amount is auto-filled from analytics and cannot be changed manually
  const isAmountLocked = !!watchedEventId;

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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-4">
              {/* Event — first field, backed by summary events */}
              <FormField
                control={form.control}
                name="event_id"
                render={({ field }) => {
                  // Convert PayoutSummaryEvent to EventOption
                  const eventOptions: EventOption[] = safeEvents.map((e) => ({
                    id: e.event_id,
                    title: e.event_title,
                  }));

                  return (
                    <FormItem>
                      <FormLabel required>
                        {t("payouts.create.event", "Event")}
                      </FormLabel>
                      <FormControl>
                        <EventSelect
                          id="payout-event-id"
                          value={field.value}
                          onValueChange={handleEventChange}
                          events={eventOptions}
                          disabled={!!defaultEventId}
                          triggerWidth="max-w-100"
                          placeholder={t(
                            "payouts.create.eventPlaceholder",
                            "Select an event",
                          )}
                        />
                      </FormControl>
                      <TranslatedFormMessage t={t} />
                    </FormItem>
                  );
                }}
              />

              {/* Commission Rate - info display */}
              <AnimatePresence>
                {selectedEventInfo &&
                  selectedEventInfo.commission_rate !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                          <span className="text-muted-foreground">
                            {t(
                              "payouts.create.commissionRate",
                              "Commission Rate",
                            )}
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedEventInfo.commission_rate}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Amount — auto-populated from analytics, locked */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel required>
                        {t("payouts.create.amount", "Amount")}
                      </FormLabel>
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
                      </div>
                    </FormControl>
                    {selectedEventInfo && (
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
                        className="resize-none md:max-w-[398px]"
                        maxLength={BUSINESS_DESC_MAX}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-1 min-h-5">
                      <TranslatedFormMessage t={t} className="mt-0" />
                      <div className="text-xs text-muted-foreground ml-auto">
                        {field.value?.length || 0}/{BUSINESS_DESC_MAX}{" "}
                        {t("common.characters", "characters")}
                      </div>
                    </div>
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
