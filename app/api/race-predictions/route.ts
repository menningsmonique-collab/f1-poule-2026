import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createServerClient();

  const url = new URL(req.url);
  const raceRaw = url.searchParams.get("race");
  const raceId = parseInt(raceRaw ?? "", 10);

  if (!raceRaw || Number.isNaN(raceId)) {
    return NextResponse.json({ error: "invalid_race" }, { status: 400 });
  }

  const { data: race, error: raceErr } = await supabase
    .from("races")
    .select("id,name,lock_at")
    .eq("id", raceId)
    .single();

  if (raceErr || !race) {
    return NextResponse.json({ error: "race_not_found" }, { status: 404 });
  }

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id,name")
    .eq("active", true)
    .order("name", { ascending: true });

  const { data: preds, error: predErr } = await supabase
    .from("predictions")
    .select("user_id,pole_driver_id,p1_driver_id,p2_driver_id,p3_driver_id")
    .eq("race_id", raceId);

  if (predErr) {
    return NextResponse.json({ error: predErr.message }, { status: 500 });
  }

  const userIds = Array.from(new Set((preds ?? []).map((p) => p.user_id)));

  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds)
    : { data: [] };

  return NextResponse.json({
    race,
    drivers: drivers ?? [],
    predictions: preds ?? [],
    profiles: profiles ?? [],
  });
}