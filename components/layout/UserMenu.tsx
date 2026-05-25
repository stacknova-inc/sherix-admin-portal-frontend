"use client";

import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/store/use-ui-store";

export function UserMenu() {
  const user = useUiStore((state) => state.user);
  const signOut = useUiStore((state) => state.signOut);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-2 pr-3" aria-label="Open admin menu">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{user?.initials ?? "AD"}</AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-bold sm:inline">{user?.name ?? "Admin"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-bold">{user?.name ?? "Admin"}</p>
          <p className="text-xs font-normal text-muted-foreground">{user?.email ?? "admin@sherix.com"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut} className="text-primary">
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
