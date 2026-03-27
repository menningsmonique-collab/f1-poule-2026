import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { saveResult } from "./actions";

type Race = {
  id: number;
  name: string;
  lock_at: string;
};

type Driver = {
  id: number;
  name: string;
};

export default async function AdminResultsPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin: Uitslag invoeren</h1>
        <p>Niet ingelogd.</p>
        <Link href="/login">Ga naar login</Link>
      </main>
    );
  }

  if (data.user.email !== "mennings.monique@gmail.com") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin: Uitslag invoeren</h1>
        <p>Geen toegang.</p>
        <Link href="/">← Terug</Link>
      </main>
    );
  }

  const { data: races } = await supabase
    .from("races")
    .select("id,name,lock_at")
    .order("lock_at", { ascending: true });

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id,name")
    .eq("active", true)
    .order("name", { ascending: true });

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Admin: Uitslag invoeren</h1>

      <p style={{ opacity: 0.85 }}>
        Kies race → vul Pole/P1/P2/P3 + Snelste ronde → opslaan.
      </p>

      <form
        action={saveResult}
        style={{ display: "grid", gap: 10, marginTop: 16 }}
      >
        <label>
          Race
          <select
            name="race_id"
            required
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 4,
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Kies race…
            </option>
            {races?.map((r: Race) => (
              <option key={r.id} value={r.id}>
                {r.name} (lock {new Date(r.lock_at).toLocaleString()})
              </option>
            ))}
          </select>
        </label>

        {(
          [
            "pole_driver_id",
            "p1_driver_id",
            "p2_driver_id",
            "p3_driver_id",
          ] as const
        ).map((field) => (
          <label key={field}>
            {field === "pole_driver_id"
              ? "Pole"
              : field.toUpperCase().replace("_DRIVER_ID", "")}
            <select
              name={field}
              required
              style={{
                display: "block",
                width: "100%",
                padding: 8,
                marginTop: 4,
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Kies coureur…
              </option>
              {drivers?.map((d: Driver) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        ))}

        {/* Snelste ronde (niet verplicht) */}
        <label>
          Snelste ronde
          <select
            name="fastest_lap_driver_id"
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 4,
            }}
            defaultValue=""
          >
            <option value="">— (optioneel)</option>
            {drivers?.map((d: Driver) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" style={{ padding: 10 }}>
          Uitslag opslaan
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href="/">← Terug naar home</Link>
      </p>
    </main>
  );
}