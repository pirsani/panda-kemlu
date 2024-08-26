import { UserButton } from "@/components/user/user-button";
import Search from "./search";

const Navbar = () => {
  return (
    <nav className="p-2 flex items-center gap-2">
      <div className="w-full">
        <Search />
      </div>
      <div className="pr-2">
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
