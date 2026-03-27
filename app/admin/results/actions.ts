"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function calcPoints(result: any, pred: any) {
  let points = 0;
  const breakdown: any = {};

  // pole
  if (pred.pole_driver_id && pred.pole_driver_id === result.pole_driver_id) {
    points += 5;
    breakdown.pole = 5;
  } else breakdown.pole = 0;

  // p1
  if (pred.p1_driver_id && pred.p1_driver_id === result.p1_driver_id) {
    points += 10;
    breakdown.p1 = 10;
  } else breakdown.p1 = 0;

  // p2
  if (pred.p2_driver_id && pred.p2_driver_id === result.p2_driver_id) {
    points += 8;
    breakdown.p2 = 8;
  } else breakdown.p2 = 0;

  // p3
  if (pred.p3_driver_id && pred.p3_driver_id === result.p3_driver_id) {
    points += 6;
    breakdown.p3 = 6;
  } else breakdown.p3 = 0;

  // fastest lap (bijv. 3 punten)
  if (
    pred.fastest_lap_driver_id &&
    pred.fastest_lap_driver_id === result.fastest_lap_driver_id
  ) {
    points += 3;
    breakdown.fastest_lap = 3;
  } else breakdown.fastest_lap = 0;

  breakdown.total = points;
  return { points, breakdown };
}

export async function saveResult(formData: FormData) {
  const raceId = Number(formData.get("race_id"));
  const pole = Number(formData.get("pole_driver_id"));
  const p1 = Number(formData.get("p1_driver_id"));
  const p2 = Number(formData.get("p2_driver_id"));
  const p3 = Number(formData.get("p3_driver_id"));
  const fastestLap = Number(formData.get("fastest_lap_driver_id"));

  const supabase = await createServerActionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  // Alleen jij
  if (data.user.email !== "mennings.monique@gmail.com") return;

  if (!raceId || !pole || !p1 || !p2 || !p3) return;

  // fastestLap mag leeg zijn in admin (0 / NaN) -> dan null
  const fastestLapValue = Number.isFinite(fastestLap) && fastestLap > 0 ? fastestLap : null;

  // 1) Uitslag opslaan
  await supabase.from("results").upsert(
    {
      race_id: raceId,
      pole_driver_id: pole,
      p1_driver_id: p1,
      p2_driver_id: p2,
      p3_driver_id: p3,
      fastest_lap_driver_id: fastestLapValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "race_id" }
  );

  // 2) Uitslag ophalen
  const { data: result } = await supabase
    .from("results")
    .select("race_id,pole_driver_id,p1_driver_id,p2_driver_id,p3_driver_id,fastest_lap_driver_id")
    .eq("race_id", raceId)
    .single();

  // 3) Alle predictions voor deze race ophalen
  const { data: preds } = await supabase
    .from("predictions")
    .select("user_id,pole_driver_id,p1_driver_id,p2_driver_id,p3_driver_id,fastest_lap_driver_id")
    .eq("race_id", raceId);

  // 4) Scores berekenen en upserten
  if (result && preds && preds.length > 0) {
    const rows = preds.map((pred: any) => {
      const { points, breakdown } = calcPoints(result, pred);
      return {
        race_id: raceId,
        user_id: pred.user_id,
        points,
        breakdown,
        updated_at: new Date().toISOString(),
      };
    });

    await supabase.from("scores").upsert(rows, { onConflict: "race_id,user_id" });
  }

  revalidatePath("/admin/results");
  revalidatePath("/");
}