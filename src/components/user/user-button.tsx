import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

// import { auth } from "@/app/(auth)/auth";
import Link from "next/link";
import UserButtonDropdown from "./user-button-dropdown";

export const UserButton = async () => {
  //const session = await auth();
  const session = null as any;
  //const session: { user?: any } = {};

  if (!session || !session.user) {
    return <UserButton.Login />;
  }

  const user = session?.user;

  return <UserButtonDropdown user={user} />;
};

UserButton.Login = function UserButtonLogin() {
  return (
    <Button variant={"ghost"}>
      <Link href="/login" className="flex items-center gap-x-2 rounded-md">
        <User size={16} />
        <span>Login</span>
      </Link>
    </Button>
  );
};

UserButton.Skeleton = function UserButtonSkeleton() {
  return (
    <div className="flex items-center gap-x-2">
      <Skeleton className="w-16 h-16 rounded-full" />
    </div>
  );
};
