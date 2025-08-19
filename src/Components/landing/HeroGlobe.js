import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import GlobeComponent from "@/Components/scanner/GlobeComponent";
import CameraView from "@/Components/scanner/CameraView"; // <-- adjust path if different
export default function HeroGlobe() {
    const [mode, setMode] = useState("globe");
    // Optional: allow other parts of the app to trigger scan
    useEffect(() => {
        const handler = () => setMode("zooming");
        window.addEventListener("fairlo:start-scan", handler);
        return () => window.removeEventListener("fairlo:start-scan", handler);
    }, []);
    const startScan = () => setMode("zooming");
    return (_jsxs("section", { className: "relative w-full min-h-[100svh] overflow-hidden bg-[#0a0f1a]", children: [_jsx("div", { className: "absolute inset-0", children: mode === "camera" ? (_jsx(CameraView, {})) : (_jsxs("div", { className: "relative w-full h-[70svh] mt-24", children: [_jsx(GlobeComponent, { className: "absolute inset-0", zoom: mode === "zooming", onZoomComplete: () => setMode("camera"), allowUserRotate: true, 
                            // flip this to false once textures are fixed
                            // or remove the prop entirely
                            // @ts-ignore - prop exists in our version
                            forceSolid: true }), _jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_80%)]" })] })) }), _jsx("div", { className: "relative z-10 max-w-[800px] mx-auto px-6 pt-10 md:pt-16", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "text-rose-400/90 text-sm mb-1", children: "Location: granted" }), _jsx("div", { className: "text-slate-400/80 text-xs mb-8", children: "40.7142, -74.0393" }), _jsx("h1", { className: "text-5xl md:text-6xl font-semibold text-white", children: "Fairlo" }), _jsx("p", { className: "mt-3 text-lg text-slate-300/90", children: "Know the Real Price" })] }) }), mode !== "camera" && (_jsx("div", { className: "absolute bottom-0 left-0 right-0 py-4 px-6 bg-transparent", children: _jsx("div", { className: "max-w-[900px] mx-auto", children: _jsx("button", { className: "w-full md:w-auto md:px-8 px-6 py-4 rounded-2xl bg-[#2e63ff] text-white text-lg font-medium shadow-lg shadow-[#2e63ff]/30 hover:opacity-95 transition", onClick: startScan, children: "Scan Now" }) }) }))] }));
}
