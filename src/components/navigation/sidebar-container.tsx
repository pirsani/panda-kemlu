import SidebarItems from "./sidebar-items";

// TODO
// Implement route from some settings

const SidebarContariner = () => {
  const routes = [
    {
      name: "Dashboard",
      icon: "home",
      href: "/",
    },
    {
      name: "Profile",
      icon: "user",
      href: "/profile",
    },
    {
      name: "Settings",
      icon: "settings",
      href: "/settings",
    },
  ];
  return (
    <div className="h-full bg-gray-100">
      <div className="h-full overflow-y-auto">
        <SidebarItems routes={routes} />
      </div>
    </div>
  );
};

export default SidebarContariner;
