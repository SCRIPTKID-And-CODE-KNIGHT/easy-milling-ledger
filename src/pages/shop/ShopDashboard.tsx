import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchShopTodayRecord, fetchProducts } from "@/lib/shopQueries";
import { DollarSign, TrendingUp, Package, PlusCircle, BarChart3, ShoppingCart, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";

const ShopDashboard = () => {
  const { t } = useLanguage();
  const { data: todayRecord, isLoading } = useQuery({
    queryKey: ["shopTodayRecord"],
    queryFn: fetchShopTodayRecord,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["shopProducts"],
    queryFn: fetchProducts,
  });

  const sales = todayRecord?.total_sales ?? 0;
  const profit = todayRecord?.profit ?? 0;
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock_quantity <= (p.low_stock_threshold ?? 5));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("shop_dashboard")}</h2>
          <p className="text-muted-foreground">{t("todays_overview")}</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("todays_sales")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {isLoading ? "..." : `Tsh ${sales.toLocaleString()}`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("profit")}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-success" : "text-destructive"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                {isLoading ? "..." : `Tsh ${profit.toLocaleString()}`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("total_products")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("low_stock")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{lowStock.length}</div>
              {lowStock.length > 0 && (
                <p className="text-xs text-warning mt-1">{lowStock.map((p) => p.name).join(", ")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/shop/add-record">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t("add_shop_record")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/shop/products">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {t("manage_products")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/shop/reports">
              <BarChart3 className="mr-2 h-5 w-5" />
              {t("view_reports")}
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShopDashboard;
