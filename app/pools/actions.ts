"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPool(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) return;

  const supabase = await createServerActionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase.from("pools").insert({
    name,
    description,
    owner_id: data.user.id,
  });

  revalidatePath("/");
}