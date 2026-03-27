import { Suspense } from "react";
import RacePredictionsClient from "./race-predictions-client";

export default function Page() {
  return (
    <Suspense fallback={<main style={{ maxWidth: 720 }}><h1>Alle voorspellingen</h1><p>Laden…</p></main>}>
      <RacePredictionsClient />
    </Suspense>
  );
}