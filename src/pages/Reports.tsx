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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchMonthRecords, fetchYearRecords, deleteRecord, type DailyRecord } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Reports = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [deleteTarget, setDeleteTarget] = useState<DailyRecord | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monthRecords = [], isLoading: loadingMonth } = useQuery({
    queryKey: ["monthRecords", year, month],
    queryFn: () => fetchMonthRecords(year, month),
  });

  const { data: yearRecords = [], isLoading: loadingYear } = useQuery({
    queryKey: ["yearRecords", year],
    queryFn: () => fetchYearRecords(year),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["yearRecords"] });
      queryClient.invalidateQueries({ queryKey: ["todayRecord"] });
      toast({ title: "Record deleted" });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const chartData = (records: DailyRecord[]) =>
    records.map((r) => ({
      date: format(new Date(r.date + "T00:00:00"), "MMM d"),
      Earnings: r.money_earned,
      Expenses: r.food_expense + r.repair_expense + r.other_expense,
      Profit: r.profit,
    }));

  const RecordsTable = ({ records }: { records: DailyRecord[] }) => (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Earned</TableHead>
            <TableHead className="text-right">Expenses</TableHead>
            <TableHead className="text-right">Debt</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Elec.</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No records found</TableCell></TableRow>
          ) : records.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{format(new Date(r.date + "T00:00:00"), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right font-mono">${r.money_earned}</TableCell>
              <TableCell className="text-right font-mono">${r.food_expense + r.repair_expense + r.other_expense}</TableCell>
              <TableCell className="text-right font-mono">${r.debt}</TableCell>
              <TableCell className={cn("text-right font-mono font-semibold", r.profit >= 0 ? "text-success" : "text-destructive")}>
                ${r.profit}
              </TableCell>
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
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Monthly and yearly performance</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Earnings vs Expenses — {months[month - 1]} {year}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData(monthRecords)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="Earnings" fill="hsl(215, 80%, 48%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Profit" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Records — {months[month - 1]} {year}</CardTitle></CardHeader>
              <CardContent><RecordsTable records={monthRecords} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Profit Trend — {year}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData(yearRecords)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Profit" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Earnings" stroke="hsl(215, 80%, 48%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">All Records — {year}</CardTitle></CardHeader>
              <CardContent><RecordsTable records={yearRecords} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Record</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the record for {deleteTarget ? format(new Date(deleteTarget.date + "T00:00:00"), "MMMM d, yyyy") : ""}? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Reports;
