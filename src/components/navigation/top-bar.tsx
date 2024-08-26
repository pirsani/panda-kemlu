import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "./navbar";
import TopBarCollapseButton from "./topbar-collapse-button";

const TopBar = () => {
  return (
    <div className="bg-gray-100 w-full h-[76px] flex flex-row fixed inset-y-0 z-50">
      <div className="flex flex-row h-full gap-2 w-16 md:w-56 items-center ">
        <TopBarCollapseButton />
        <div className="h-full w-full hidden md:block">
          <Link
            href={"/"}
            className="text-xl font-bold font-sans h-full flex items-center justify-center text-primary"
            type="button"
          >
            Honorarium
          </Link>
        </div>
      </div>
      <div className="w-full p-2 md:p-0">
        <Navbar />
      </div>
    </div>
  );
};

export default TopBar;
