"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CurrencyDollarIcon } from "@phosphor-icons/react";
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
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { PayoutRequestCreateSchema } from "@/types/payout";

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
  const { events } = useOrganizerEvents({ limit: 100 });
  const createPayoutMutation = useCreatePayoutRequest();

  const form = useForm<z.infer<typeof PayoutRequestCreateSchema>>({
    resolver: zodResolver(PayoutRequestCreateSchema),
    defaultValues: {
      amount: 0,
      request_type: defaultEventId ? "event_payout" : "event_payout",
      event_id: defaultEventId,
      description: "",
    },
  });

  // Reset form when dialog opens or defaultEventId changes
  useEffect(() => {
    if (open) {
      form.reset({
        amount: 0,
        request_type: defaultEventId ? "event_payout" : "event_payout",
        event_id: defaultEventId,
        description: "",
      });
    }
  }, [open, defaultEventId, form]);

  const onSubmit = (data: z.infer<typeof PayoutRequestCreateSchema>) => {
    createPayoutMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-gray-900">
        <DialogHeader>
          <DialogTitle>{t("payouts.create.title", "Create Payout Request")}</DialogTitle>
          <DialogDescription>
            {t("payouts.create.description", "Submit a request to withdraw your earnings.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("payouts.create.amount", "Amount")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="request_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("payouts.create.type", "Request Type")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!defaultEventId} // Disable type selection if pre-filled with event
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("payouts.create.typePlaceholder", "Select type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="event_payout">{t("payouts.type.event_payout", "Event Payout")}</SelectItem>
                        <SelectItem value="bulk_payout">{t("payouts.type.bulk_payout", "Bulk Payout")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("request_type") === "event_payout" && (
              <FormField
                control={form.control}
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("payouts.create.event", "Event (Optional)")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!defaultEventId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("payouts.create.eventPlaceholder", "Select event")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events?.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payouts.create.descriptionLabel", "Description (Optional)")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("payouts.create.descriptionPlaceholder", "Add notes...")}
                      className="resize-none"
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
                disabled={createPayoutMutation.isPending}
              >
                {createPayoutMutation.isPending ? t("common.processing", "Processing...") : t("payouts.create.submit", "Submit Request")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
