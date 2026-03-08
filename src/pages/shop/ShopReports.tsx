import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchShopMonthRecords, fetchShopYearRecords, deleteShopRecord, type ShopDailyRecord } from "@/lib/shopQueries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { getMonthName } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const ShopReports = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [deleteTarget, setDeleteTarget] = useState<ShopDailyRecord | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: monthRecords = [] } = useQuery({
    queryKey: ["shopMonthRecords", year, month],
    queryFn: () => fetchShopMonthRecords(year, month),
  });

  const { data: yearRecords = [] } = useQuery({
    queryKey: ["shopYearRecords", year],
    queryFn: () => fetchShopYearRecords(year),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopMonthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["shopYearRecords"] });
      toast({ title: t("record_deleted") });
      setDeleteTarget(null);
    },
  });

  const chartData = (records: ShopDailyRecord[]) =>
    records.map((r) => ({
      date: format(new Date(r.date + "T00:00:00"), "MMM d"),
      [t("sales")]: r.total_sales,
      [t("expenses")]: r.food_expense + r.rent_expense + r.other_expense,
      [t("profit")]: r.profit,
    }));

  const monthName = getMonthName(month - 1, language);

  const totalSales = monthRecords.reduce((s, r) => s + r.total_sales, 0);
  const totalExpenses = monthRecords.reduce((s, r) => s + r.food_expense + r.rent_expense + r.other_expense + r.debt, 0);
  const totalProfit = monthRecords.reduce((s, r) => s + (r.profit ?? 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("shop_reports")}</h2>
          <p className="text-muted-foreground">{t("monthly_yearly_perf")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("total_sales_month")}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold font-mono">Tsh {totalSales.toLocaleString()}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("total_expenses")}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold font-mono text-destructive">Tsh {totalExpenses.toLocaleString()}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("total_profit")}</CardTitle></CardHeader>
            <CardContent><p className={cn("text-2xl font-bold font-mono", totalProfit >= 0 ? "text-success" : "text-destructive")}>Tsh {totalProfit.toLocaleString()}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
            <TabsTrigger value="yearly">{t("yearly")}</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("sales_vs_expenses")} — {monthName} {year}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData(monthRecords)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey={t("sales")} fill="hsl(215, 80%, 48%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t("expenses")} fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t("profit")} fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("records")} — {monthName} {year}</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("date")}</TableHead>
                        <TableHead className="text-right">{t("sales")}</TableHead>
                        <TableHead className="text-right">{t("expenses")}</TableHead>
                        <TableHead className="text-right">{t("profit")}</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthRecords.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("no_records")}</TableCell></TableRow>
                      ) : monthRecords.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{format(new Date(r.date + "T00:00:00"), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right font-mono">Tsh {r.total_sales.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">Tsh {(r.food_expense + r.rent_expense + r.other_expense).toLocaleString()}</TableCell>
                          <TableCell className={cn("text-right font-mono font-semibold", (r.profit ?? 0) >= 0 ? "text-success" : "text-destructive")}>
                            Tsh {(r.profit ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(r)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
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
                    <Line type="monotone" dataKey={t("sales")} stroke="hsl(215, 80%, 48%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
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

export default ShopReports;
