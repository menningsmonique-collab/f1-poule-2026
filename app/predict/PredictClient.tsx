"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DriverRow = { id: number; name: string };
type PredictionRow = {
  pole_driver_id: number | null;
  p1_driver_id: number | null;
  p2_driver_id: number | null;
  p3_driver_id: number | null;
  fastest_lap_driver_id: number | null;
};

export default function PredictClient({
  raceId,
  isLocked,
  drivers,
  initialPrediction,
}: {
  raceId: number;
  isLocked: boolean;
  drivers: DriverRow[];
  initialPrediction: PredictionRow | null;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [pole, setPole] = useState<number | "">(initialPrediction?.pole_driver_id ?? "");
  const [p1, setP1] = useState<number | "">(initialPrediction?.p1_driver_id ?? "");
  const [p2, setP2] = useState<number | "">(initialPrediction?.p2_driver_id ?? "");
  const [p3, setP3] = useState<number | "">(initialPrediction?.p3_driver_id ?? "");
  const [fastestLap, setFastestLap] = useState<number | "">(
    initialPrediction?.fastest_lap_driver_id ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setSaving(false);
      setMsg("Niet ingelogd.");
      return;
    }

    const payload = {
      race_id: raceId,
      user_id: user.id,
      pole_driver_id: pole === "" ? null : pole,
      p1_driver_id: p1 === "" ? null : p1,
      p2_driver_id: p2 === "" ? null : p2,
      p3_driver_id: p3 === "" ? null : p3,
      fastest_lap_driver_id: fastestLap === "" ? null : fastestLap,
    };

    const { error } = await supabase
      .from("predictions")
      .upsert(payload, { onConflict: "race_id,user_id" });

    setSaving(false);
    setMsg(error ? `Opslaan mislukt: ${error.message}` : "✅ Opgeslagen!");
  }

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    marginTop: 6,
  };

  const btnRed: React.CSSProperties = {
    background: "#e10600",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  };

  const btnGray: React.CSSProperties = {
    background: "#666",
    color: "#ccc",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 600,
    opacity: 0.7,
  };

  return (
    <section style={{ marginTop: 18 }}>
      <h3>Jouw voorspelling aanpassen</h3>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <label>
          Pole
          <select
            disabled={isLocked}
            value={pole}
            onChange={(e) => setPole(e.target.value ? Number(e.target.value) : "")}
            style={selectStyle}
          >
            <option value="">-</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          P1
          <select
            disabled={isLocked}
            value={p1}
            onChange={(e) => setP1(e.target.value ? Number(e.target.value) : "")}
            style={selectStyle}
          >
            <option value="">-</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          P2
          <select
            disabled={isLocked}
            value={p2}
            onChange={(e) => setP2(e.target.value ? Number(e.target.value) : "")}
            style={selectStyle}
          >
            <option value="">-</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          P3
          <select
            disabled={isLocked}
            value={p3}
            onChange={(e) => setP3(e.target.value ? Number(e.target.value) : "")}
            style={selectStyle}
          >
            <option value="">-</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Snelste ronde
          <select
            disabled={isLocked}
            value={fastestLap}
            onChange={(e) => setFastestLap(e.target.value ? Number(e.target.value) : "")}
            style={selectStyle}
          >
            <option value="">-</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        {isLocked ? (
          <button disabled style={btnGray}>
            🔒 Vergrendeld
          </button>
        ) : (
          <button onClick={save} disabled={saving} style={btnRed}>
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        )}

        {msg ? <p style={{ fontSize: 12, opacity: 0.85 }}>{msg}</p> : null}
      </div>
    </section>
  );
}