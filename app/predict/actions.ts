"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePrediction(formData: FormData) {
  const raceId = Number(formData.get("race_id"));
  const pole = Number(formData.get("pole_driver_id"));
  const p1 = Number(formData.get("p1_driver_id"));
  const p2 = Number(formData.get("p2_driver_id"));
  const p3 = Number(formData.get("p3_driver_id"));

  const supabase = await createServerActionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  // simpele validatie
  if (!raceId || !pole || !p1 || !p2 || !p3) return;

  // upsert: per user per race 1 prediction
  await supabase.from("predictions").upsert(
    {
      race_id: raceId,
      user_id: data.user.id,
      pole_driver_id: pole,
      p1_driver_id: p1,
      p2_driver_id: p2,
      p3_driver_id: p3,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "race_id,user_id" }
  );

  revalidatePath("/predict");
  revalidatePath("/");
}