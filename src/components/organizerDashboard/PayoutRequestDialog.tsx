"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CurrencyDollarIcon,
  PencilSimpleIcon,
  LockIcon,
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { useCreatePayoutRequest } from "@/hooks/usePayouts";
import { useEventAnalytics } from "@/hooks/useOrganizerEvents";
import { OrganizerEventSelectField } from "@/components/organizerDashboard/OrganizerEventSelectField";

// Schema — request_type is always "event_payout" so it's not a form field
const PayoutRequestFormSchema = z.object({
  event_id: z.string().min(1, "Please select an event"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
});

type PayoutRequestFormValues = z.infer<typeof PayoutRequestFormSchema>;

interface PayoutRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEventId?: string;
}

export function PayoutRequestDialog({
  open,
  onOpenChange,
  defaultEventId,
}: PayoutRequestDialogProps) {
  const { t } = useTranslation();
  const createPayoutMutation = useCreatePayoutRequest();

  // Track whether the user wants to override the analytics-derived amount
  const [isManualAmount, setIsManualAmount] = useState(false);

  const form = useForm<PayoutRequestFormValues>({
    resolver: zodResolver(PayoutRequestFormSchema),
    defaultValues: {
      event_id: defaultEventId ?? "",
      amount: 0,
      description: "",
    },
  });

  const watchedEventId = form.watch("event_id");

  // Fetch analytics when an event is selected
  const { data: analytics, isFetching: isAnalyticsFetching } =
    useEventAnalytics(watchedEventId || undefined);

  // Auto-fill amount from analytics whenever it loads (and user hasn't opted to enter manually)
  useEffect(() => {
    if (analytics && !isManualAmount) {
      const revenue = analytics.total_revenue ?? 0;
      form.setValue("amount", revenue, { shouldValidate: true });
    }
  }, [analytics, isManualAmount, form]);

  // Reset everything when dialog opens / defaultEventId changes
  useEffect(() => {
    if (open) {
      setIsManualAmount(false);
      form.reset({
        event_id: defaultEventId ?? "",
        amount: 0,
        description: "",
      });
    }
  }, [open, defaultEventId, form]);

  // When a new event is selected, clear amount and reset manual flag
  const handleEventChange = (eventId: string) => {
    form.setValue("event_id", eventId, { shouldValidate: true });
    setIsManualAmount(false);
    form.setValue("amount", 0);
  };

  const handleManualToggle = () => {
    setIsManualAmount(true);
  };

  const onSubmit = (data: PayoutRequestFormValues) => {
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            {/* Event — first field, backed by /organizer/list-all */}
            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <OrganizerEventSelectField
                  value={field.value}
                  onChange={handleEventChange}
                  disabled={!!defaultEventId}
                  label={t("payouts.create.event", "Event")}
                  placeholder={t(
                    "payouts.create.eventPlaceholder",
                    "Select an event",
                  )}
                />
              )}
            />

            {/* Amount — auto-populated from analytics, lockable */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>
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
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-9 pr-9"
                        disabled={isAmountLocked || isAnalyticsFetching}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      {isAmountLocked && (
                        <LockIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  {isAnalyticsFetching && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                      {t(
                        "payouts.create.loadingAnalytics",
                        "Fetching event revenue…",
                      )}
                    </p>
                  )}
                  {analytics && !isManualAmount && (
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "payouts.create.analyticsNote",
                        "Pre-filled from event total revenue.",
                      )}{" "}
                      <Badge variant="secondary" className="text-xs">
                        {analytics.sold_seats}/{analytics.total_seats}{" "}
                        {t("payouts.create.ticketsSold", "tickets sold")}
                      </Badge>
                    </p>
                  )}
                  <FormMessage />
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
                    {t(
                      "payouts.create.descriptionLabel",
                      "Description (Optional)",
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "payouts.create.descriptionPlaceholder",
                        "Add notes…",
                      )}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("payouts.create.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createPayoutMutation.isPending || isAnalyticsFetching}
              >
                {createPayoutMutation.isPending
                  ? t("common.processing", "Processing…")
                  : t("payouts.create.submit", "Submit Request")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
