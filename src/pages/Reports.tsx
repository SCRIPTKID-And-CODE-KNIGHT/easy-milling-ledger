import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchMonthRecords, fetchYearRecords, deleteRecord, type DailyRecord } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { getMonthName } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const Reports = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [deleteTarget, setDeleteTarget] = useState<DailyRecord | null>(null);
  const [elecPricePerUnit, setElecPricePerUnit] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: monthRecords = [] } = useQuery({
    queryKey: ["monthRecords", year, month],
    queryFn: () => fetchMonthRecords(year, month),
  });

  const { data: yearRecords = [] } = useQuery({
    queryKey: ["yearRecords", year],
    queryFn: () => fetchYearRecords(year),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["yearRecords"] });
      queryClient.invalidateQueries({ queryKey: ["todayRecord"] });
      toast({ title: t("record_deleted") });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    },
  });

  const chartData = (records: DailyRecord[]) =>
    records.map((r) => ({
      date: format(new Date(r.date + "T00:00:00"), "MMM d"),
      [t("earnings")]: r.money_earned,
      [t("expenses")]: r.food_expense + r.repair_expense + r.other_expense,
      [t("profit")]: r.profit,
    }));

  const monthName = getMonthName(month - 1, language);

  const RecordsTable = ({ records }: { records: DailyRecord[] }) => (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("date")}</TableHead>
            <TableHead className="text-right">{t("earned")}</TableHead>
            <TableHead className="text-right">{t("expenses")}</TableHead>
            <TableHead className="text-right">{t("debt")}</TableHead>
            <TableHead className="text-right">{t("profit")}</TableHead>
            <TableHead className="text-right">{t("elec_cost")}</TableHead>
            <TableHead className="text-right">{t("elec_rem")}</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{t("no_records")}</TableCell></TableRow>
          ) : records.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{format(new Date(r.date + "T00:00:00"), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right font-mono">Tsh {r.money_earned.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono">Tsh {(r.food_expense + r.repair_expense + r.other_expense).toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono">Tsh {r.debt.toLocaleString()}</TableCell>
              <TableCell className={cn("text-right font-mono font-semibold", r.profit >= 0 ? "text-success" : "text-destructive")}>
                Tsh {r.profit.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono">Tsh {r.electricity_cost.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono">{r.electricity_remaining}</TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link to={`/add-record?date=${r.date}`}><Pencil className="h-3.5 w-3.5" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(r)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("reports")}</h2>
          <p className="text-muted-foreground">{t("monthly_yearly_perf")}</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>{getMonthName(i, language)}</SelectItem>
            ))}</SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const headers = [t("date"), t("earned"), t("expenses"), t("debt"), t("profit"), t("elec_cost"), t("elec_rem")];
              const keys = ["date", "earned", "expenses", "debt", "profit", "elec_cost", "elec_rem"];
              const rows = monthRecords.map((r) => ({
                date: format(new Date(r.date + "T00:00:00"), "MMM d, yyyy"),
                earned: r.money_earned,
                expenses: r.food_expense + r.repair_expense + r.other_expense,
                debt: r.debt,
                profit: r.profit,
                elec_cost: r.electricity_cost,
                elec_rem: r.electricity_remaining,
              }));
              exportToPDF(`${t("reports")} — ${monthName} ${year}`, `milling-${year}-${month}`, headers, rows, keys);
            }}>
              <FileDown className="mr-2 h-4 w-4" />{t("export_pdf")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const headers = [t("date"), t("earned"), t("expenses"), t("debt"), t("profit"), t("elec_cost"), t("elec_rem")];
              const keys = ["date", "earned", "expenses", "debt", "profit", "elec_cost", "elec_rem"];
              const rows = monthRecords.map((r) => ({
                date: format(new Date(r.date + "T00:00:00"), "MMM d, yyyy"),
                earned: r.money_earned,
                expenses: r.food_expense + r.repair_expense + r.other_expense,
                debt: r.debt,
                profit: r.profit,
                elec_cost: r.electricity_cost,
                elec_rem: r.electricity_remaining,
              }));
              exportToCSV(`milling-${year}-${month}`, headers, rows, keys);
            }}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />{t("export_csv")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
            <TabsTrigger value="yearly">{t("yearly")}</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            {(() => {
              const totalUnitsUsed = monthRecords.reduce((sum, r) => sum + r.electricity_used, 0);
              const totalUnitsBought = monthRecords.reduce((sum, r) => sum + r.electricity_units_bought, 0);
              const totalElecCost = monthRecords.reduce((sum, r) => sum + r.electricity_cost, 0);
              const totalEarnings = monthRecords.reduce((sum, r) => sum + r.money_earned, 0);
              const totalExpenses = monthRecords.reduce((sum, r) => sum + r.food_expense + r.repair_expense + r.other_expense + r.debt, 0);
              const priceNum = parseFloat(elecPricePerUnit) || 0;
              const elecCostCalc = priceNum > 0 ? totalUnitsUsed * priceNum : totalElecCost;
              const finalProfit = totalEarnings - totalExpenses - elecCostCalc;
              return (
                <Card>
                  <CardHeader><CardTitle className="text-base">{t("elec_profit_summary")} — {monthName} {year}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("total_units_used")}</p>
                        <p className="text-lg font-bold font-mono">{totalUnitsUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("total_units_bought")}</p>
                        <p className="text-lg font-bold font-mono">{totalUnitsBought.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("total_earnings")}</p>
                        <p className="text-lg font-bold font-mono">Tsh {totalEarnings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("total_expenses_excl")}</p>
                        <p className="text-lg font-bold font-mono">Tsh {totalExpenses.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-end border-t pt-4">
                      <div className="space-y-1.5 w-full sm:w-auto">
                        <Label htmlFor="elecPrice" className="text-xs">{t("price_per_unit")}</Label>
                        <Input id="elecPrice" type="number" placeholder="e.g. 350" value={elecPricePerUnit} onChange={(e) => setElecPricePerUnit(e.target.value)} className="w-full sm:w-[160px]" />
                        <p className="text-[10px] text-muted-foreground">{t("leave_empty")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("electricity_cost")}</p>
                        <p className="text-lg font-bold font-mono">Tsh {elecCostCalc.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("final_profit")}</p>
                        <p className={cn("text-xl font-bold font-mono", finalProfit >= 0 ? "text-success" : "text-destructive")}>
                          Tsh {finalProfit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            <Card>
              <CardHeader><CardTitle className="text-base">{t("earnings_vs_expenses")} — {monthName} {year}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData(monthRecords)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey={t("earnings")} fill="hsl(215, 80%, 48%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t("expenses")} fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t("profit")} fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("records")} — {monthName} {year}</CardTitle></CardHeader>
              <CardContent><RecordsTable records={monthRecords} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("profit_trend")} — {year}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData(yearRecords)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey={t("profit")} stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey={t("earnings")} stroke="hsl(215, 80%, 48%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("all_records")} — {year}</CardTitle></CardHeader>
              <CardContent><RecordsTable records={yearRecords} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("delete_record")}</DialogTitle>
              <DialogDescription>
                {t("delete_confirm")} {deleteTarget ? format(new Date(deleteTarget.date + "T00:00:00"), "MMMM d, yyyy") : ""}? {t("cannot_undo")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("cancel")}</Button>
              <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? t("deleting") : t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Reports;
