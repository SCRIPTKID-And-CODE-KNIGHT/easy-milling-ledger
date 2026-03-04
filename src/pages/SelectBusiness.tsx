import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBusinessType } from "@/hooks/useBusinessType";
import { useLanguage } from "@/hooks/useLanguage";
import { Cog, ShoppingBag } from "lucide-react";
import { useState } from "react";

const SelectBusiness = () => {
  const { setBusinessType } = useBusinessType();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (type: "milling" | "shop") => {
    setLoading(true);
    try {
      await setBusinessType(type);
      navigate(type === "milling" ? "/" : "/shop");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🏪 Biashara Bora System</h1>
          <p className="text-muted-foreground mt-2">{t("select_business_desc")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => !loading && handleSelect("milling")}
          >
            <CardHeader className="text-center pb-2">
              <Cog className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="text-lg">{t("milling_machine")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">{t("milling_desc")}</CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => !loading && handleSelect("shop")}
          >
            <CardHeader className="text-center pb-2">
              <ShoppingBag className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="text-lg">{t("shop_business")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">{t("shop_desc")}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelectBusiness;
