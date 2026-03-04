import { LayoutDashboard, PlusCircle, BarChart3, LogOut, Languages, Package, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useBusinessType } from "@/hooks/useBusinessType";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { businessType, setBusinessType } = useBusinessType();
  const navigate = useNavigate();

  const millingItems = [
    { title: t("dashboard"), url: "/", icon: LayoutDashboard },
    { title: t("add_record"), url: "/add-record", icon: PlusCircle },
    { title: t("reports"), url: "/reports", icon: BarChart3 },
  ];

  const shopItems = [
    { title: t("shop_dashboard"), url: "/shop", icon: LayoutDashboard },
    { title: t("products"), url: "/shop/products", icon: Package },
    { title: t("add_shop_record"), url: "/shop/add-record", icon: PlusCircle },
    { title: t("shop_reports"), url: "/shop/reports", icon: BarChart3 },
  ];

  const items = businessType === "shop" ? shopItems : millingItems;

  const handleSwitch = async () => {
    const newType = businessType === "shop" ? "milling" : "shop";
    await setBusinessType(newType);
    navigate(newType === "shop" ? "/shop" : "/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-xs">
            {!collapsed && t("mill_manager")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/" || item.url === "/shop"}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {!collapsed && user && (
          <p className="text-xs text-sidebar-foreground/50 truncate px-2 mb-1">{user.email}</p>
        )}
        <Button variant="ghost" size="sm" onClick={handleSwitch} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          {!collapsed && t("switch_business")}
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleLanguage} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <Languages className="mr-2 h-4 w-4" />
          {!collapsed && (language === "en" ? "Swahili" : "English")}
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && t("sign_out")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
