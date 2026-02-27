import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { fetchTodayRecord, fetchLatestRecord } from "@/lib/queries";
import { DollarSign, TrendingDown, TrendingUp, Zap, PlusCircle, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

const Index = () => {
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
  const elecMax = 1000; // assume max units
  const elecPercent = Math.min((elecRemaining / elecMax) * 100, 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Today's overview at a glance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {loadingToday ? "..." : `$${earnings.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">Today's total income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">
                {loadingToday ? "..." : `$${totalExpenses.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">Food, repairs & other</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-success" : "text-destructive"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                {loadingToday ? "..." : `$${profit.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">Earnings − expenses − debt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Electricity</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {loadingToday ? "..." : `${elecRemaining} units`}
              </div>
              <Progress value={elecPercent} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">Remaining capacity</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/add-record">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Daily Record
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/reports">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
