"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RaceRow = { id: number; name: string; lock_at: string };
type DriverRow = { id: number; name: string };
type ProfileRow = { id: string; display_name: string | null };
type PredictionRow = {
  user_id: string;
  pole_driver_id: number | null;
  p1_driver_id: number | null;
  p2_driver_id: number | null;
  p3_driver_id: number | null;
};

function nameById(drivers: DriverRow[], id: number | null | undefined) {
  if (!id) return "-";
  return drivers.find((d) => d.id === id)?.name ?? "-";
}

export default function RacePredictionsPage() {
  const sp = useSearchParams();
  const raceParam = sp.get("race");
  const raceId = useMemo(() => parseInt(raceParam ?? "", 10), [raceParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [race, setRace] = useState<RaceRow | null>(null);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileRow>>(new Map());

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);

      if (Number.isNaN(raceId)) {
        setError("Ongeldige race.");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/race-predictions?race=${raceId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Fout bij ophalen.");
        setLoading(false);
        return;
      }

      const j = await res.json();

      setRace(j.race ?? null);
      setDrivers(j.drivers ?? []);
      setPredictions(j.predictions ?? []);

      const map = new Map<string, ProfileRow>();
      for (const p of (j.profiles ?? []) as ProfileRow[]) map.set(p.id, p);
      setProfiles(map);

      setLoading(false);
    }

    run();
  }, [raceId]);

  if (loading) {
    return (
      <main style={{ maxWidth: 720 }}>
        <h1>Alle voorspellingen</h1>
        <p>Laden…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: 720 }}>
        <h1>Alle voorspellingen</h1>
        <p>{error}</p>
        <p style={{ marginTop: 12 }}>
          <Link href="/">← Terug</Link>
        </p>
      </main>
    );
  }

  const nlLock = race
    ? new Date(race.lock_at).toLocaleString("nl-NL", {
        timeZone: "Europe/Amsterdam",
      })
    : "";

  return (
    <main style={{ maxWidth: 720 }}>
      <h1>Alle voorspellingen</h1>
      {race && (
        <p style={{ opacity: 0.8 }}>
          {race.name} — Lock: {nlLock}
        </p>
      )}

      {predictions.length === 0 ? (
        <p>Te vroeg! Deze zie je pas na de lock.</p>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {predictions.map((p) => {
            const dn = profiles.get(p.user_id)?.display_name;
            const label = dn || p.user_id.slice(0, 8);

            return (
              <li key={p.user_id} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  Pole: {nameById(drivers, p.pole_driver_id)}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  P1: {nameById(drivers, p.p1_driver_id)}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  P2: {nameById(drivers, p.p2_driver_id)}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  P3: {nameById(drivers, p.p3_driver_id)}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/">← Terug</Link>
      </p>
    </main>
  );
}