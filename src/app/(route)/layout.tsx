import TopBar from "@/components/navigation/top-bar";

const RouteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <TopBar />
      <div>{children}</div>
    </div>
  );
};

export default RouteLayout;
