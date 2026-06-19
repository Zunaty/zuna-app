"use client";

import dynamic from "next/dynamic";

import { MapboxUnavailableNotice } from "@/components/maps/mapbox-unavailable-notice";

const AviationFlightMap = dynamic(
  () => import("@/components/maps/aviation-flight-map").then((module) => module.AviationFlightMap),
  {
    ssr: false,
    loading: () => <MapboxUnavailableNotice message="Loading flight map…" className="min-h-[320px]" />,
  },
);

export function AviationFlightMapSection() {
  return (
    <section className="mt-14">
      <h2 className="mb-2 text-xl font-semibold">Flight history</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Most of my PIC (Pilot in Command) time radiated out of Salt Lake — IFR (Instrument Flight Rules) training and
        cross-countries around Utah.
      </p>
      <div className="overflow-hidden rounded-xl border bg-card shadow">
        <AviationFlightMap />
      </div>
    </section>
  );
}
