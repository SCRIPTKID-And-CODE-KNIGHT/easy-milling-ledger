import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type BusinessType = "milling" | "shop" | null;

type BusinessTypeContextType = {
  businessType: BusinessType;
  loading: boolean;
  setBusinessType: (type: "milling" | "shop") => Promise<void>;
};

const BusinessTypeContext = createContext<BusinessTypeContextType>({
  businessType: null,
  loading: true,
  setBusinessType: async () => {},
});

export function BusinessTypeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businessType, setBusinessTypeState] = useState<BusinessType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBusinessTypeState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_business_type" as any)
      .select("business_type")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        setBusinessTypeState(data?.business_type ?? null);
        setLoading(false);
      });
  }, [user]);

  const setBusinessType = useCallback(async (type: "milling" | "shop") => {
    if (!user) return;
    const { error } = await (supabase.from("user_business_type" as any) as any).upsert(
      { user_id: user.id, business_type: type },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    setBusinessTypeState(type);
  }, [user]);

  return (
    <BusinessTypeContext.Provider value={{ businessType, loading, setBusinessType }}>
      {children}
    </BusinessTypeContext.Provider>
  );
}

export const useBusinessType = () => useContext(BusinessTypeContext);
