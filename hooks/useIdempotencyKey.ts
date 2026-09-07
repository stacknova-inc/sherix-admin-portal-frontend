"use client";

import * as React from "react";
import { generateIdempotencyKey } from "@/lib/api";


export function useIdempotencyKey(resetKey: unknown): string {
  const stored = React.useRef<{ for: unknown; value: string }>(undefined);

  if (!stored.current || !Object.is(stored.current.for, resetKey)) {
    stored.current = { for: resetKey, value: generateIdempotencyKey() };
  }

  return stored.current.value;
}
