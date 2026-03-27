import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import PredictClient from "./PredictClient";

type DriverRow = { id: number; name: string };

export default async function PredictPage({
  searchParams,
}: {
  searchParams: Promise<{ race?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return (
      <main style={{ maxWidth: 720 }}>
        <h1>Voorspelling</h1>
        <p>Je bent niet ingelogd.</p>
        <Link href="/login">Ga naar login</Link>
      </main>
    );
  }

  const raceId = parseInt(sp.race ?? "", 10);
  if (Number.isNaN(raceId)) {
    return (
      <main style={{ maxWidth: 720 }}>
        <h1>Voorspelling</h1>
        <p>Ongeldige race.</p>
        <Link href="/">← Home</Link>
      </main>
    );
  }

  const { data: race } = await supabase
    .from("races")
    .select("id,name,lock_at")
    .eq("id", raceId)
    .single();

  if (!race) {
    return (
      <main style={{ maxWidth: 720 }}>
        <h1>Voorspelling</h1>
        <p>Race niet gevonden.</p>
        <Link href="/">← Home</Link>
      </main>
    );
  }

  const isLocked = new Date() >= new Date(race.lock_at);

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id,name")
    .eq("active", true)
    .order("name", { ascending: true });

  const { data: prediction } = await supabase
    .from("predictions")
    .select("pole_driver_id,p1_driver_id,p2_driver_id,p3_driver_id,fastest_lap_driver_id")
.eq("race_id", raceId)
.eq("user_id", user.id)
.maybeSingle();

  return (
    <main style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Voorspelling</h1>
        <Link href="/">← Home</Link>
      </div>

      <p style={{ marginTop: 10 }}>
        <b>{race.name}</b>
      </p>

      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Lock:{" "}
        {new Date(race.lock_at).toLocaleString("nl-NL", {
          timeZone: "Europe/Amsterdam",
        })}
      </p>

      {isLocked ? (
        <p style={{ marginTop: 12 }}>🔒 Te laat — deze race is vergrendeld.</p>
      ) : null}

      <PredictClient
        raceId={raceId}
        isLocked={isLocked}
        drivers={(drivers ?? []) as DriverRow[]}
        initialPrediction={prediction ?? null}
      />

      <p style={{ marginTop: 18 }}>
        <Link href="/races">🏁 Naar races</Link>
      </p>
    </main>
  );
}