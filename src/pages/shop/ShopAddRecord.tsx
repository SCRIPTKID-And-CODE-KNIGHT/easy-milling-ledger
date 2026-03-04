import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchProducts, upsertShopRecord, recordSale, type ShopProduct } from "@/lib/shopQueries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

type SaleEntry = { product_id: string; quantity: number; price: number };

const ShopAddRecord = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date>(new Date());
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [foodExpense, setFoodExpense] = useState(0);
  const [rentExpense, setRentExpense] = useState(0);
  const [otherExpense, setOtherExpense] = useState(0);
  const [debt, setDebt] = useState(0);
  const [saving, setSaving] = useState(false);

  const { data: products = [] } = useQuery({ queryKey: ["shopProducts"], queryFn: fetchProducts });

  const addSaleRow = () => setSales([...sales, { product_id: "", quantity: 0, price: 0 }]);
  const updateSale = (i: number, field: string, value: any) => {
    const updated = [...sales];
    (updated[i] as any)[field] = value;
    // Auto-fill price from product
    if (field === "product_id") {
      const prod = products.find((p) => p.id === value);
      if (prod) updated[i].price = prod.selling_price;
    }
    setSales(updated);
  };
  const removeSale = (i: number) => setSales(sales.filter((_, idx) => idx !== i));

  const totalSales = sales.reduce((s, e) => s + e.quantity * e.price, 0);
  const totalCost = sales.reduce((s, e) => {
    const prod = products.find((p) => p.id === e.product_id);
    return s + e.quantity * (prod?.buying_price ?? 0);
  }, 0);
  const calcProfit = totalSales - totalCost - foodExpense - rentExpense - otherExpense - debt;

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      // Save daily record
      await upsertShopRecord({
        date: dateStr,
        total_sales: totalSales,
        total_cost_of_goods: totalCost,
        food_expense: foodExpense,
        rent_expense: rentExpense,
        other_expense: otherExpense,
        debt,
      });
      // Record individual sales
      for (const sale of sales) {
        if (sale.product_id && sale.quantity > 0) {
          await recordSale({
            date: dateStr,
            product_id: sale.product_id,
            quantity_sold: sale.quantity,
            sale_price: sale.price,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["shopTodayRecord"] });
      queryClient.invalidateQueries({ queryKey: ["shopProducts"] });
      toast({ title: t("record_saved"), description: t("record_saved_desc") });
      navigate("/shop");
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("add_shop_record")}</h2>
          <p className="text-muted-foreground">{t("record_daily_shop_data")}</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t("date")}</CardTitle></CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  {format(date, "PPP")}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("sales")}</CardTitle>
            <Button size="sm" onClick={addSaleRow}>{t("add_sale")}</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sales.length === 0 && <p className="text-sm text-muted-foreground">{t("no_sales_added")}</p>}
            {sales.map((sale, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {i === 0 && <Label className="text-xs">{t("product")}</Label>}
                  <Select value={sale.product_id} onValueChange={(v) => updateSale(i, "product_id", v)}>
                    <SelectTrigger><SelectValue placeholder={t("select_product")} /></SelectTrigger>
                    <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-xs">{t("qty")}</Label>}
                  <Input type="number" min="0" value={sale.quantity} onChange={(e) => updateSale(i, "quantity", +e.target.value)} />
                </div>
                <div className="col-span-3">
                  {i === 0 && <Label className="text-xs">{t("price")}</Label>}
                  <Input type="number" min="0" value={sale.price} onChange={(e) => updateSale(i, "price", +e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Button variant="ghost" size="sm" className="text-destructive w-full" onClick={() => removeSale(i)}>✕</Button>
                </div>
              </div>
            ))}
            {sales.length > 0 && (
              <div className="text-right font-mono font-semibold border-t pt-2">
                {t("total")}: Tsh {totalSales.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t("expenses")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>{t("food_expense")}</Label><Input type="number" min="0" value={foodExpense} onChange={(e) => setFoodExpense(+e.target.value)} /></div>
              <div><Label>{t("rent_expense")}</Label><Input type="number" min="0" value={rentExpense} onChange={(e) => setRentExpense(+e.target.value)} /></div>
              <div><Label>{t("other_expense")}</Label><Input type="number" min="0" value={otherExpense} onChange={(e) => setOtherExpense(+e.target.value)} /></div>
              <div><Label>{t("debt")}</Label><Input type="number" min="0" value={debt} onChange={(e) => setDebt(+e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <div className={cn(
          "rounded-lg border p-4 text-center",
          calcProfit >= 0 ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
        )}>
          <p className="text-sm text-muted-foreground">{t("calculated_profit")}</p>
          <p className={cn("text-3xl font-bold font-mono", calcProfit >= 0 ? "text-success" : "text-destructive")}>
            Tsh {calcProfit.toLocaleString()}
          </p>
        </div>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("save_record")}
        </Button>
      </div>
    </AppLayout>
  );
};

export default ShopAddRecord;
