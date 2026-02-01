

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

