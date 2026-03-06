import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Settings2, ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Settings2,
      title: t("landing_feature_milling"),
      desc: t("landing_feature_milling_desc"),
      gradient: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: Package,
      title: t("landing_feature_shop"),
      desc: t("landing_feature_shop_desc"),
      gradient: "from-success/20 to-success/5",
      iconBg: "bg-success/10 text-success",
    },
    {
      icon: BarChart3,
      title: t("landing_feature_reports"),
      desc: t("landing_feature_reports_desc"),
      gradient: "from-warning/20 to-warning/5",
      iconBg: "bg-warning/10 text-warning",
    },
  ];

  const stats = [
    { icon: TrendingUp, label: t("landing_stat_track"), value: t("landing_stat_track_desc") },
    { icon: Shield, label: t("landing_stat_secure"), value: t("landing_stat_secure_desc") },
    { icon: Zap, label: t("landing_stat_fast"), value: t("landing_stat_fast_desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <span className="text-xl font-bold tracking-tight">🏪 Biashara Bora</span>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">{t("sign_in")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth?mode=signup">{t("sign_up")}</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-8 relative">
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-success/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="h-3.5 w-3.5" />
            {t("landing_badge")}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            {t("landing_hero_title")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            {t("landing_hero_desc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button asChild size="lg" className="gap-2 px-8 text-base">
              <Link to="/auth?mode=signup">
                {t("sign_up")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/auth">{t("sign_in")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            {t("landing_features_heading")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("landing_features_sub")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card
              key={f.title}
              className={`group relative overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${f.gradient}`}
            >
              <CardContent className="p-6 flex flex-col gap-4">
                <div className={`h-12 w-12 rounded-xl ${f.iconBg} flex items-center justify-center`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center bg-primary/5 border border-primary/10 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-3">{t("landing_cta_title")}</h2>
          <p className="text-muted-foreground mb-6">{t("landing_cta_desc")}</p>
          <Button asChild size="lg" className="gap-2 px-8">
            <Link to="/auth?mode=signup">
              {t("landing_cta_button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} Biashara Bora. All rights reserved.
      </footer>
    </div>
  );
}
