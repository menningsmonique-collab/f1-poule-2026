import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { logout } from "./logout/action";

type RaceRow = {
  id: number;
  name: string;
  race_start: string;
  lock_at: string;
};

type DriverRow = {
  id: number;
  name: string;
};

type PredictionRow = {
  pole_driver_id: number | null;
  p1_driver_id: number | null;
  p2_driver_id: number | null;
  p3_driver_id: number | null;
};

function nameById(drivers: DriverRow[], id: number | null | undefined) {
  if (!id) return "-";
  return drivers.find((d) => d.id === id)?.name ?? "-";
}

export default async function Home() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  const { data: nextRace } = await supabase
  .from("races")
  .select("id,name,race_start,lock_at")
  .gt("lock_at", new Date().toISOString())
  .order("lock_at", { ascending: true })
  .maybeSingle();

  const nextRace = (races?.[0] as RaceRow | undefined) ?? null;

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id,name")
    .eq("active", true)
    .order("name", { ascending: true });

  const { data: prediction } =
    user && nextRace
      ? await supabase
          .from("predictions")
          .select("pole_driver_id,p1_driver_id,p2_driver_id,p3_driver_id")
          .eq("race_id", nextRace.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null as PredictionRow | null };

  const isLocked = nextRace
    ? new Date() >= new Date(nextRace.lock_at)
    : false;

  return (
    <main style={{ maxWidth: 720 }}>
      <h1>Redbulletjes F1 2026</h1>

      {user ? (
        <>
          <p>Ingelogd als: {user.email}</p>

          {/* Top knoppen */}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <Link href="/leaderboard">
              <button
                style={{
                  background: "#e10600",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🏆 Leaderboard
              </button>
            </Link>

            <Link href="/races">
              <button
                style={{
                  background: "#e10600",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🏁 Races
              </button>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                style={{
                  background: "#e10600",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Uitloggen
              </button>
            </form>
          </div>

          {/* Eerstvolgende race */}
          <section style={{ marginTop: 30 }}>
            <h2>Eerstvolgende race</h2>

            {nextRace ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>
                    {nextRace.name}
                  </div>

                  <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                    GP datum:{" "}
                    {new Date(nextRace.race_start).toLocaleString("nl-NL", {
                      timeZone: "Europe/Amsterdam",
                    })}
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
                    Lock:{" "}
                    {new Date(nextRace.lock_at).toLocaleString("nl-NL", {
                      timeZone: "Europe/Amsterdam",
                    })}
                  </div>
                </div>

                <h3>Jouw voorspelling</h3>

                {prediction ? (
                  <ul>
                    <li>
                      Pole:{" "}
                      {nameById(drivers ?? [], prediction.pole_driver_id)}
                    </li>
                    <li>
                      P1: {nameById(drivers ?? [], prediction.p1_driver_id)}
                    </li>
                    <li>
                      P2: {nameById(drivers ?? [], prediction.p2_driver_id)}
                    </li>
                    <li>
                      P3: {nameById(drivers ?? [], prediction.p3_driver_id)}
                    </li>
                  </ul>
                ) : (
                  <p>Nog niks ingevuld.</p>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  {isLocked ? (
  <button
    disabled
    style={{
      background: "#666",
      color: "#ccc",
      border: "none",
      padding: "10px 16px",
      borderRadius: 8,
      cursor: "not-allowed",
      fontWeight: 600,
      opacity: 0.7,
    }}
  >
    🔒 Te laat Vergrendeld
  </button>
) : (
  <Link href={nextRace ? `/predict?race=${nextRace.id}` : "/races"}>
    <button
      style={{
        background: "#e10600",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      Voorspelling invullen / aanpassen
    </button>
  </Link>
)}

                  {isLocked && (
                    <Link
                      href={`/race-predictions?race=${nextRace.id}`}
                    >
                      <button
                        style={{
                          background: "#e10600",
                          color: "white",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        👀 Voorspellingen medespelers
                      </button>
                    </Link>
                  )}
                </div>

                {!isLocked && (
                  <p style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>
                    Na de lock zie je hier alle voorspellingen van de groep.
                  </p>
                )}
              </>
            ) : (
              <p>Geen races gevonden.</p>
            )}
          </section>
        </>
      ) : (
        <>
          <p>Niet ingelogd</p>
          <Link href="/login">Ga naar login</Link>
        </>
      )}
    </main>
  );
}