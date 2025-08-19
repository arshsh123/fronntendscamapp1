import React, { useEffect, useState } from "react";
import GlobeComponent from "@/Components/scanner/GlobeComponent";
import CameraView from "@/Components/scanner/CameraView"; // <-- adjust path if different

type Mode = "globe" | "zooming" | "camera";

export default function HeroGlobe() {
  const [mode, setMode] = useState<Mode>("globe");

  // Optional: allow other parts of the app to trigger scan
  useEffect(() => {
    const handler = () => setMode("zooming");
    window.addEventListener("fairlo:start-scan", handler as EventListener);
    return () => window.removeEventListener("fairlo:start-scan", handler as EventListener);
  }, []);

  const startScan = () => setMode("zooming");

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-[#0a0f1a]">
      {/* Globe / Camera layer */}
      <div className="absolute inset-0">
        {mode === "camera" ? (
          <CameraView />
        ) : (
          <div className="relative w-full h-[70svh] mt-24">
            <GlobeComponent
              className="absolute inset-0"
              zoom={mode === "zooming"}
              onZoomComplete={() => setMode("camera")}
              allowUserRotate
              // flip this to false once textures are fixed
              // or remove the prop entirely
              // @ts-ignore - prop exists in our version
              forceSolid
            />
            {/* Subtle vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_80%)]" />
          </div>
        )}
      </div>

      {/* UI content */}
      <div className="relative z-10 max-w-[800px] mx-auto px-6 pt-10 md:pt-16">
        <div className="flex flex-col items-center text-center">
          <div className="text-rose-400/90 text-sm mb-1">Location: granted</div>
          <div className="text-slate-400/80 text-xs mb-8">40.7142, -74.0393</div>

          <h1 className="text-5xl md:text-6xl font-semibold text-white">Fairlo</h1>
          <p className="mt-3 text-lg text-slate-300/90">Know the Real Price</p>
        </div>
      </div>

      {/* CTA */}
      {mode !== "camera" && (
        <div className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-transparent">
          <div className="max-w-[900px] mx-auto">
            <button
              className="w-full md:w-auto md:px-8 px-6 py-4 rounded-2xl bg-[#2e63ff] text-white text-lg font-medium shadow-lg shadow-[#2e63ff]/30 hover:opacity-95 transition"
              onClick={startScan}
            >
              Scan Now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
