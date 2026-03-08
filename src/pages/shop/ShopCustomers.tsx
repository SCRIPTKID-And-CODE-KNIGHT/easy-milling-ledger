import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchCustomers, upsertCustomer, deleteCustomer, type Customer } from "@/lib/customerQueries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const emptyCustomer = { name: "", phone: "", notes: "" };

const ShopCustomers = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Customer> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  const saveMutation = useMutation({
    mutationFn: (c: Partial<Customer> & { name: string }) => upsertCustomer(c),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: t("customer_saved") });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast({ title: t("error"), description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: t("customer_deleted") });
      setDeleteTarget(null);
    },
    onError: (e: any) => toast({ title: t("error"), description: e.message, variant: "destructive" }),
  });

  const openNew = () => { setEditing({ ...emptyCustomer }); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditing({ ...c }); setDialogOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("customers")}</h2>
            <p className="text-muted-foreground">{t("manage_customers_desc")}</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />{t("add_customer")}</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("customer_name")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead>{t("notes")}</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">{t("no_customers")}</TableCell></TableRow>
                  ) : customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{c.notes || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link to={`/shop/customers/${c.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? t("edit_customer") : t("add_customer")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("customer_name")}</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} /></div>
            <div><Label>{t("phone")}</Label><Input value={editing?.phone ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, phone: e.target.value }))} /></div>
            <div><Label>{t("notes")}</Label><Input value={editing?.notes ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => editing?.name && saveMutation.mutate(editing as any)} disabled={saveMutation.isPending || !editing?.name}>
              {saveMutation.isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("delete_customer")}</DialogTitle></DialogHeader>
          <p>{t("delete_customer_confirm")} "{deleteTarget?.name}"? {t("cannot_undo")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ShopCustomers;
