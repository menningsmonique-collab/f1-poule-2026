import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

type RaceRow = {
  id: number;
  name: string;
  race_start: string;
  lock_at: string;
};

const btnRed: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e10600",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  textDecoration: "none",
};

const btnGray: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#666",
  color: "#ccc",
  padding: "8px 14px",
  borderRadius: 8,
  fontWeight: 600,
  opacity: 0.7,
};

export default async function RacesPage() {
  const supabase = await createServerClient();

  const { data: races } = await supabase
    .from("races")
    .select("id,name,race_start,lock_at")
    .order("lock_at", { ascending: true });

  return (
    <main style={{ maxWidth: 720 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Races</h1>

        <Link href="/" style={{ ...btnRed, padding: "6px 12px" }}>
          ← Home
        </Link>
      </div>

      <ul style={{ marginTop: 16 }}>
        {(races ?? []).map((r: RaceRow) => {
          const isLocked = new Date() >= new Date(r.lock_at);

          return (
            <li key={r.id} style={{ marginBottom: 22 }}>
              <b>{r.name}</b>

              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Lock:{" "}
                {new Date(r.lock_at).toLocaleString("nl-NL", {
                  timeZone: "Europe/Amsterdam",
                })}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
               

                {isLocked ? (
                  <Link href={`/race-predictions?race=${r.id}`} style={btnRed}>
                    👀 Voorspellingen medespelers
                  </Link>
                ) : (
                  <span style={btnGray}>🔒 Na lock zichtbaar</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}