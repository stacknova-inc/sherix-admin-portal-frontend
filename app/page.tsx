"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/use-ui-store";

export default function HomePage() {
  const router = useRouter();
  const user = useUiStore((state) => state.user);

  useEffect(() => {
    router.replace(user ? "/dashboard" : "/sign-in");
  }, [router, user]);

  return null;
}
