"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createServerActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}