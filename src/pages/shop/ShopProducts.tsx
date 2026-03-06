import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchProducts, upsertProduct, deleteProduct, restockProduct, type ShopProduct } from "@/lib/shopQueries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Plus, Pencil, Trash2, PackagePlus } from "lucide-react";

const emptyProduct = { name: "", buying_price: 0, selling_price: 0, stock_quantity: 0, unit: "piece" };

const ShopProducts = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ShopProduct> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShopProduct | null>(null);
  const [restockTarget, setRestockTarget] = useState<ShopProduct | null>(null);
  const [restockQty, setRestockQty] = useState(0);

  const { data: products = [] } = useQuery({ queryKey: ["shopProducts"], queryFn: fetchProducts });

  const saveMutation = useMutation({
    mutationFn: (p: Partial<ShopProduct> & { name: string }) => upsertProduct(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopProducts"] });
      toast({ title: t("product_saved") });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast({ title: t("error"), description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopProducts"] });
      toast({ title: t("product_deleted") });
      setDeleteTarget(null);
    },
    onError: (e: any) => toast({ title: t("error"), description: e.message, variant: "destructive" }),
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => restockProduct(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopProducts"] });
      toast({ title: t("stock_updated") });
      setRestockTarget(null);
      setRestockQty(0);
    },
    onError: (e: any) => toast({ title: t("error"), description: e.message, variant: "destructive" }),
  });

  const openNew = () => { setEditing({ ...emptyProduct }); setDialogOpen(true); };
  const openEdit = (p: ShopProduct) => { setEditing({ ...p }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing?.name) return;
    saveMutation.mutate(editing as any);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("products")}</h2>
            <p className="text-muted-foreground">{t("manage_inventory")}</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />{t("add_product")}</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("product_name")}</TableHead>
                    <TableHead className="text-right">{t("buying_price")}</TableHead>
                    <TableHead className="text-right">{t("selling_price")}</TableHead>
                    <TableHead className="text-right">{t("stock")}</TableHead>
                    <TableHead>{t("unit")}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("no_products")}</TableCell></TableRow>
                  ) : products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right font-mono">Tsh {p.buying_price.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">Tsh {p.selling_price.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-mono ${p.stock_quantity <= 5 ? "text-warning font-semibold" : ""}`}>{p.stock_quantity}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setRestockTarget(p); setRestockQty(0); }} title={t("restock")}><PackagePlus className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <DialogTitle>{editing?.id ? t("edit_product") : t("add_product")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("product_name")}</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("buying_price")}</Label><Input type="number" min="0" value={editing?.buying_price ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, buying_price: +e.target.value }))} /></div>
              <div><Label>{t("selling_price")}</Label><Input type="number" min="0" value={editing?.selling_price ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, selling_price: +e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("stock")}</Label><Input type="number" min="0" value={editing?.stock_quantity ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, stock_quantity: +e.target.value }))} /></div>
              <div>
                <Label>{t("unit")}</Label>
                <Select value={editing?.unit ?? "piece"} onValueChange={(v) => setEditing((p) => ({ ...p!, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">{t("piece")}</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="litre">{t("litre")}</SelectItem>
                    <SelectItem value="pack">{t("pack")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>{saveMutation.isPending ? t("saving") : t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("delete_product")}</DialogTitle></DialogHeader>
          <p>{t("delete_product_confirm")} "{deleteTarget?.name}"? {t("cannot_undo")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Restock Dialog */}
      <Dialog open={!!restockTarget} onOpenChange={() => { setRestockTarget(null); setRestockQty(0); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("restock")} — {restockTarget?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("current_stock")}: <span className="font-mono font-semibold">{restockTarget?.stock_quantity}</span></p>
          <div>
            <Label>{t("quantity_to_add")}</Label>
            <Input type="number" min="1" value={restockQty || ""} onChange={(e) => setRestockQty(Math.max(0, +e.target.value))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockTarget(null)}>{t("cancel")}</Button>
            <Button onClick={() => restockTarget && restockQty > 0 && restockMutation.mutate({ id: restockTarget.id, qty: restockQty })} disabled={restockMutation.isPending || restockQty <= 0}>
              {restockMutation.isPending ? t("saving") : t("restock")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ShopProducts;
