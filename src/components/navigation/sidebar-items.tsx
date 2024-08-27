"use client";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { cn } from "@/lib/utils";
import { RouteItem } from "@/route";
import {
  AlertTriangle,
  Banknote,
  BrickWall,
  CheckCircle2,
  Circle,
  Coins,
  CreditCard,
  FileBadge,
  Flag,
  Gauge,
  GraduationCap,
  Home,
  Hourglass,
  Key,
  List,
  ListChecks,
  LucideIcon,
  MapPinned,
  Milestone,
  Settings,
  Settings2,
  Signature,
  Table,
  User,
  User2,
  UserCog,
  Users,
} from "lucide-react";
import SidebarGroupHeader from "./sidebar-group-header";
import SidebarItem from "./sidebar-item";

const iconMap: { [key: string]: LucideIcon } = {
  home: Home,
  user: User,
  settings: Settings,
  warning: AlertTriangle,
  key: Key,
  "square-asterisk": Hourglass,
  "settings-2": Settings2,
  milestone: Milestone,
  "list-checks": ListChecks,
  "checkmark-circle-2": CheckCircle2,
  "credit-card": CreditCard,
  table: Table,
  circle: Circle,
  list: List,
  "graduation-cap": GraduationCap,
  banknote: Banknote,
  coins: Coins,
  signature: Signature,
  "user-cog": UserCog,
  users: Users,
  "brick-wall": BrickWall,
  "file-badge": FileBadge,
  "map-pinned": MapPinned,
  flag: Flag,
};

interface SidebarItemProps {
  //routes: { name: string; icon: string; href: string }[];
  routes: RouteItem[];
  groupTitle?: string;
}

const SidebarItems = ({ routes, groupTitle }: SidebarItemProps) => {
  const { toggle, collapsed } = useToggleSidebar();

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-0 sm:w-16" : "w-44 sm:w-56"
      )}
    >
      {!collapsed && groupTitle && <SidebarGroupHeader title={groupTitle} />}
      {routes.map((route) => {
        if (route.displayAsMenu === false) {
          return null;
        }
        const Icon = iconMap[route.icon] || AlertTriangle; // Map the icon string to the actual icon component
        return (
          <SidebarItem
            href={route.href}
            collapsed={collapsed}
            key={route.name}
            title={route.title}
            icon={Icon}
          />
        );
      })}
    </div>
  );
};

export default SidebarItems;
