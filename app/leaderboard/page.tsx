import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

type ScoreRow = {
  user_id: string;
  points: number;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

export default async function LeaderboardPage() {
  const supabase = await createServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <main>
        <h1>Leaderboard</h1>
        <p>Je bent niet ingelogd.</p>
        <Link href="/login">Ga naar login</Link>
      </main>
    );
  }

  // 🔹 1. Alle profiles ophalen (iedereen tonen)
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, display_name");

  if (profErr) {
    return (
      <main>
        <h1>Leaderboard</h1>
        <p>Kon profielen niet ophalen: {profErr.message}</p>
        <Link href="/">← Terug</Link>
      </main>
    );
  }

  // 🔹 2. Scores ophalen (kan leeg zijn)
  const { data: scores } = await supabase
    .from("scores")
    .select("user_id, points");

  // 🔹 3. Punten optellen per user
  const totals = new Map<string, number>();
  for (const s of (scores ?? []) as ScoreRow[]) {
    totals.set(s.user_id, (totals.get(s.user_id) ?? 0) + (s.points ?? 0));
  }

  // 🔹 4. Leaderboard maken
  const leaderboard = (profiles ?? [])
    .map((p: ProfileRow) => ({
      id: p.id,
      name: p.display_name || p.id.slice(0, 8),
      points: totals.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <main style={{ maxWidth: 720 }}>
      <h1>Leaderboard</h1>

      {leaderboard.length === 0 ? (
        <p>Nog geen gebruikers gevonden.</p>
      ) : (
        <section>
          <ol style={{ marginTop: 14, paddingLeft: 18 }}>
            {leaderboard.map((u, idx) => (
              <li key={u.id} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <b>
                      {u.name}
                    </b>
                  </div>
                  <div style={{ fontVariantNumeric: "tabular-nums" }}>
                    {u.points} pt
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p style={{ marginTop: 16 }}>
        <Link href="/">← Terug naar home</Link>
      </p>
    </main>
  );
}