"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/store/use-ui-store";

function displayRole(role?: string | null) {
  if (!role) return "Administrator";
  return role
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function UserMenu() {
  const router = useRouter();
  const user = useUiStore((state) => state.user);
  const signOut = useUiStore((state) => state.signOut);
  const adminName = user?.fullName ?? user?.name ?? "Admin";
  const adminEmail = user?.email ?? "admin@sherix.com";
  const adminRole = displayRole(user?.role);

  function logout() {
    signOut();
    router.replace("/sign-in");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-2 pr-3" aria-label="Open admin menu">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{user?.initials ?? "AD"}</AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-bold sm:inline">{adminName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <p className="font-bold">{adminName}</p>
          <p className="text-xs font-normal text-muted-foreground">{adminEmail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="items-start gap-3">
          <User className="h-4 w-4" />
          <span className="grid gap-1">
            <span className="text-sm font-semibold">Profile</span>
            <span className="text-xs text-muted-foreground">{adminRole}</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="text-primary">
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
