import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Settings2 } from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Settings2,
      title: t("landing_feature_milling"),
      desc: t("landing_feature_milling_desc"),
    },
    {
      icon: Package,
      title: t("landing_feature_shop"),
      desc: t("landing_feature_shop_desc"),
    },
    {
      icon: BarChart3,
      title: t("landing_feature_reports"),
      desc: t("landing_feature_reports_desc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 gap-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          🏪 Biashara Bora
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
          {t("landing_hero_desc")}
        </p>
        <div className="flex gap-3 mt-4">
          <Button asChild size="lg">
            <Link to="/auth">{t("sign_in")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth?mode=signup">{t("sign_up")}</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-center mb-8">
          {t("landing_hero_title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="text-center">
              <CardHeader className="items-center">
                <f.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} Biashara Bora. All rights reserved.
      </footer>
    </div>
  );
}
