import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { upsertRecord, fetchRecordByDate, fetchLatestRecord } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

const schema = z.object({
  date: z.date({ required_error: "Date is required" }),
  money_earned: z.coerce.number().min(0, "Must be 0 or more"),
  food_expense: z.coerce.number().min(0, "Must be 0 or more"),
  repair_expense: z.coerce.number().min(0, "Must be 0 or more"),
  other_expense: z.coerce.number().min(0, "Must be 0 or more"),
  debt: z.coerce.number().min(0, "Must be 0 or more"),
  electricity_used: z.coerce.number().min(0, "Must be 0 or more"),
  electricity_remaining: z.coerce.number().min(0, "Must be 0 or more"),
});

type FormValues = z.infer<typeof schema>;

const FieldWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-1.5">
    <span>{label}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent><p className="max-w-[200px] text-xs">{tooltip}</p></TooltipContent>
    </Tooltip>
  </div>
);

const AddRecord = () => {
  const [searchParams] = useSearchParams();
  const editDate = searchParams.get("date");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: editDate ? new Date(editDate + "T00:00:00") : new Date(),
      money_earned: 0, food_expense: 0, repair_expense: 0,
      other_expense: 0, debt: 0, electricity_used: 0, electricity_remaining: 0,
    },
  });

  const selectedDate = form.watch("date");
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const { data: existingRecord } = useQuery({
    queryKey: ["record", dateStr],
    queryFn: () => fetchRecordByDate(dateStr),
    enabled: !!dateStr,
  });

  const { data: latestRecord } = useQuery({
    queryKey: ["latestRecord"],
    queryFn: fetchLatestRecord,
  });

  useEffect(() => {
    if (existingRecord) {
      form.reset({
        date: new Date(existingRecord.date + "T00:00:00"),
        money_earned: existingRecord.money_earned,
        food_expense: existingRecord.food_expense,
        repair_expense: existingRecord.repair_expense,
        other_expense: existingRecord.other_expense,
        debt: existingRecord.debt,
        electricity_used: existingRecord.electricity_used,
        electricity_remaining: existingRecord.electricity_remaining,
      });
    } else if (latestRecord && !existingRecord) {
      form.setValue("electricity_remaining", latestRecord.electricity_remaining);
    }
  }, [existingRecord, latestRecord]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      upsertRecord({
        date: format(values.date, "yyyy-MM-dd"),
        money_earned: values.money_earned, food_expense: values.food_expense,
        repair_expense: values.repair_expense, other_expense: values.other_expense,
        debt: values.debt, electricity_used: values.electricity_used,
        electricity_remaining: values.electricity_remaining,
        electricity_units_bought: 0, electricity_cost: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayRecord"] });
      queryClient.invalidateQueries({ queryKey: ["latestRecord"] });
      queryClient.invalidateQueries({ queryKey: ["record"] });
      toast({ title: t("record_saved"), description: t("record_saved_desc") });
      navigate("/");
    },
    onError: (err: any) => {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    },
  });

  const watched = form.watch();
  const calcProfit = (watched.money_earned || 0) - (watched.food_expense || 0) - (watched.repair_expense || 0) - (watched.other_expense || 0) - (watched.debt || 0);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {existingRecord ? t("edit_record") : t("add_daily_record")}
          </h2>
          <p className="text-muted-foreground">{t("fill_todays_data")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("record_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("date")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : t("pick_date")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="money_earned" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("money_earned")} tooltip={t("money_earned_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="food_expense" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("food_expense")} tooltip={t("food_expense_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="repair_expense" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("repair_expense")} tooltip={t("repair_expense_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="other_expense" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("other_expense")} tooltip={t("other_expense_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="debt" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("debt")} tooltip={t("debt_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="electricity_used" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("electricity_used")} tooltip={t("electricity_used_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="electricity_remaining" render={({ field }) => (
                    <FormItem>
                      <FormLabel><FieldWithTooltip label={t("electricity_remaining")} tooltip={t("electricity_remaining_tip")} /></FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormDescription className="text-xs">{t("prefilled_last_record")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className={cn(
                  "rounded-lg border p-4 text-center",
                  calcProfit >= 0 ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
                )}>
                  <p className="text-sm text-muted-foreground">{t("calculated_profit")}</p>
                  <p className={cn("text-3xl font-bold font-mono", calcProfit >= 0 ? "text-success" : "text-destructive")}>
                    Tsh {calcProfit.toLocaleString()}
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? t("saving") : existingRecord ? t("update_record") : t("save_record")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddRecord;
