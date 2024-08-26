import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "./navbar";
import TopBarCollapseButton from "./topbar-collapse-button";

const TopBar = () => {
  return (
    <div className="bg-slate-700 w-full h-[76px] flex flex-row fixed inset-y-0 z-50">
      <div className="flex flex-row h-full gap-2 w-16 md:w-64 items-center ">
        <TopBarCollapseButton />
        <div className="h-full w-full hidden md:block">
          <Button
            className="h-full w-full rounded-none text-white hover:text-red-700"
            variant={"ghost"}
          >
            <Link href={"/"} className="text-xl font-bold font-sans ">
              Honorarium
            </Link>
          </Button>
        </div>
      </div>
      <div className="w-full p-2 md:p-0">
        <Navbar />
      </div>
    </div>
  );
};

export default TopBar;
