import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  fetchCustomers,
  fetchCustomerTransactions,
  addCustomerTransaction,
  deleteCustomerTransaction,
  calculateBalance,
  type CustomerTransaction,
} from "@/lib/customerQueries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newTx, setNewTx] = useState({ amount: 0, type: "debt", description: "", date: format(new Date(), "yyyy-MM-dd") });

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const customer = customers.find((c) => c.id === id);

  const { data: transactions = [] } = useQuery({
    queryKey: ["customerTransactions", id],
    queryFn: () => fetchCustomerTransactions(id!),
    enabled: !!id,
  });

  const balance = calculateBalance(transactions);

  const addMutation = useMutation({
    mutationFn: () => addCustomerTransaction({ customer_id: id!, ...newTx }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerTransactions", id] });
      toast({ title: t("transaction_added") });
      setAddOpen(false);
      setNewTx({ amount: 0, type: "debt", description: "", date: format(new Date(), "yyyy-MM-dd") });
    },
    onError: (e: any) => toast({ title: t("error"), description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (txId: string) => deleteCustomerTransaction(txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerTransactions", id] });
      toast({ title: t("transaction_deleted") });
    },
  });

  if (!customer) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">{t("customer_not_found")}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link to="/shop/customers"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
            <p className="text-muted-foreground">{customer.phone || t("no_phone")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("outstanding_balance")}</CardTitle></CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-bold font-mono", balance > 0 ? "text-destructive" : "text-success")}>
                Tsh {Math.abs(balance).toLocaleString()}
                {balance > 0 && <span className="text-sm ml-2 font-normal">({t("owes_you")})</span>}
                {balance < 0 && <span className="text-sm ml-2 font-normal">({t("overpaid")})</span>}
                {balance === 0 && <span className="text-sm ml-2 font-normal text-muted-foreground">({t("settled")})</span>}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("total_transactions")}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold font-mono">{transactions.length}</p></CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("transaction_history")}</h3>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" />{t("add_transaction")}</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("type")}</TableHead>
                    <TableHead className="text-right">{t("amount")}</TableHead>
                    <TableHead>{t("description")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("no_transactions")}</TableCell></TableRow>
                  ) : transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date + "T00:00:00"), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "debt" ? "destructive" : "default"} className={tx.type === "payment" ? "bg-success text-success-foreground" : ""}>
                          {tx.type === "debt" ? t("debt") : t("payment")}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-right font-mono font-semibold", tx.type === "debt" ? "text-destructive" : "text-success")}>
                        {tx.type === "debt" ? "+" : "−"} Tsh {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.description || "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(tx.id)}>
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
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("add_transaction")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("type")}</Label>
              <Select value={newTx.type} onValueChange={(v) => setNewTx((p) => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debt">{t("debt")}</SelectItem>
                  <SelectItem value="payment">{t("payment")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t("amount")}</Label><Input type="number" min="0" value={newTx.amount || ""} onChange={(e) => setNewTx((p) => ({ ...p, amount: +e.target.value }))} /></div>
            <div><Label>{t("date")}</Label><Input type="date" value={newTx.date} onChange={(e) => setNewTx((p) => ({ ...p, date: e.target.value }))} /></div>
            <div><Label>{t("description")}</Label><Input value={newTx.description} onChange={(e) => setNewTx((p) => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => newTx.amount > 0 && addMutation.mutate()} disabled={addMutation.isPending || newTx.amount <= 0}>
              {addMutation.isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CustomerDetail;
