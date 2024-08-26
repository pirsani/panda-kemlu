import LoadingIndicator from "@/components/loading";
import SidebarContariner from "@/components/navigation/sidebar-container";
import TopBar from "@/components/navigation/top-bar";
import { Suspense } from "react";

const RouteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <TopBar />
      <div className="flex flex-row pt-[76px]  h-full">
        <div>
          <SidebarContariner />
        </div>
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
};

export default RouteLayout;
