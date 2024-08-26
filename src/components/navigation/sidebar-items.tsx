"use client";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Gauge,
  Home,
  Hourglass,
  LucideIcon,
  Settings,
  User,
} from "lucide-react";
import SidebarGroupHeader from "./sidebar-group-header";
import SidebarItem from "./sidebar-item";

const iconMap: { [key: string]: LucideIcon } = {
  home: Home,
  user: User,
  settings: Settings,
  warning: AlertTriangle,
};

interface SidebarItemProps {
  routes: { name: string; icon: string; href: string }[];
}

const SidebarItems = ({ routes }: SidebarItemProps) => {
  const { toggle, collapsed } = useToggleSidebar();

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-0 sm:w-16" : "w-44 sm:w-56"
      )}
    >
      <SidebarItem
        href="/"
        title="Dashboard"
        icon={Gauge}
        collapsed={collapsed}
      />
      <SidebarItem
        href="/pending"
        title="Pending"
        icon={Hourglass}
        collapsed={collapsed}
      />

      <SidebarGroupHeader />
      {routes.map((route) => {
        const Icon = iconMap[route.icon] || AlertTriangle; // Map the icon string to the actual icon component
        return (
          <SidebarItem
            href={route.href}
            collapsed={collapsed}
            key={route.name}
            title={route.name}
            icon={Icon}
          />
        );
      })}
    </div>
  );
};

export default SidebarItems;
