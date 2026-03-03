import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { fetchTodayRecord, fetchLatestRecord } from "@/lib/queries";
import { DollarSign, TrendingDown, TrendingUp, Zap, PlusCircle, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { t } = useLanguage();
  const { data: todayRecord, isLoading: loadingToday } = useQuery({
    queryKey: ["todayRecord"],
    queryFn: fetchTodayRecord,
  });

  const { data: latestRecord } = useQuery({
    queryKey: ["latestRecord"],
    queryFn: fetchLatestRecord,
  });

  const record = todayRecord || null;
  const earnings = record?.money_earned ?? 0;
  const totalExpenses = (record?.food_expense ?? 0) + (record?.repair_expense ?? 0) + (record?.other_expense ?? 0);
  const profit = record?.profit ?? 0;
  const elecRemaining = record?.electricity_remaining ?? latestRecord?.electricity_remaining ?? 0;
  const elecMax = 1000;
  const elecPercent = Math.min((elecRemaining / elecMax) * 100, 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h2>
          <p className="text-muted-foreground">{t("todays_overview")}</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("earnings")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {loadingToday ? "..." : `Tsh ${earnings.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">{t("todays_income")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("expenses")}</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">
                {loadingToday ? "..." : `Tsh ${totalExpenses.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">{t("food_repairs_other")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("profit")}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-success" : "text-destructive"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                {loadingToday ? "..." : `Tsh ${profit.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">{t("earnings_minus")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("electricity")}</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {loadingToday ? "..." : `${elecRemaining} ${t("units")}`}
              </div>
              <Progress value={elecPercent} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{t("remaining_capacity")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/add-record">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t("add_daily_record")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/reports">
              <BarChart3 className="mr-2 h-5 w-5" />
              {t("view_reports")}
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
