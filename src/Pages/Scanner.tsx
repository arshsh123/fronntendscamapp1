// src/Pages/Scanner.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Upload } from "lucide-react";
import GlobeComponent from "@/Components/scanner/GlobeComponent";
import CameraView from "@/Components/scanner/CameraView";
import ResultCard from "@/Components/scanner/ResultCard";
import { useResponsiveSize } from "@/lib/useResponsiveSize";

/* ---------------------------- Types ---------------------------- */
interface Location { lat: number; lng: number; }
interface ScanItem {
  name: string; emoji: string; detectedPrice: number; localPrice: number;
  currency: string; localRange: string; overpricePercentage: number;
  insight: string; region: string;
}

/* ----------------------- Inline API calls ---------------------- */
// Uses Vite proxy: '/api' -> http://127.0.0.1:8001  (set in vite.config.ts)
async function ping() {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error(`Health failed: ${res.status}`);
  return res.json();
}

async function scanImage(file: File, loc: Location) {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("location", `${loc.lat},${loc.lng}`);

  const res = await fetch("/api/scan", { method: "POST", body: fd });
  let body: any = null;
  try { body = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = body?.detail || JSON.stringify(body) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

/* --------------------------- Component ------------------------- */
export default function Scanner() {
  const [currentView, setCurrentView] = useState<"globe" | "camera" | "result">("globe");
  const [scanResult, setScanResult]   = useState<ScanItem | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitiatingScan, setIsInitiatingScan] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied">("loading");
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "unknown">("unknown");
  const [showUI, setShowUI] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Prove wire on mount */
  useEffect(() => {
    (async () => {
      try {
        const h = await ping();
        console.log("API HEALTH →", h);
      } catch (e) {
        console.error("API HEALTH FAIL →", e);
      }
    })();
  }, []);

  /* Geolocation */
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 26.9124, lng: 75.7873 });
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => {
        setUserLocation({ lat: 26.9124, lng: 75.7873 });
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const handleScanNow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCameraPermission("granted");
      setIsInitiatingScan(true);
      setShowUI(false);
    } catch {
      setCameraPermission("denied");
    }
  };

  const handleUploadPhoto = () => fileInputRef.current?.click();

  // REAL upload → backend scan
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loc = userLocation ?? { lat: 26.9124, lng: 75.7873 };

    try {
      setIsScanning(true);
      console.log("UPLOAD →", file.name, "→ /api/scan");

      const data = await scanImage(file, loc);
      console.log("SCAN RESULT →", data);

      const result: ScanItem = {
        name: data?.detected_item ?? "Detected Item",
        emoji: "🛍️",
        detectedPrice: Number(data?.chatgpt_price_estimate_value ?? data?.detectedPrice ?? 0),
        localPrice: Number(data?.local_price_estimate_value ?? data?.localPrice ?? 0),
        currency: data?.currency_symbol ?? data?.currency ?? "₹",
        localRange: data?.local_range ?? data?.localRange ?? "—",
        overpricePercentage: Number(data?.overpricePercentage ?? 0),
        insight: data?.insight ?? "AI analysis",
        region: data?.region ?? "Local Market",
      };

      setScanResult(result);
      setCurrentView("result");
    } catch (err: any) {
      console.error("UPLOAD/SCAN ERROR →", err);
      alert(`Scan failed: ${err?.message || err}`);
    } finally {
      setIsScanning(false);
      event.target.value = ""; // allow same file again
    }
  };

  const handleZoomComplete = () => {
    setCurrentView("camera");
    setTimeout(() => setIsScanning(true), 500);
    setIsInitiatingScan(false);
  };

  const handleScanComplete = (result: ScanItem) => {
    setScanResult(result);
    setCurrentView("result");
    setIsScanning(false);
  };

  const resetToGlobe = () => {
    setCurrentView("globe");
    setScanResult(null);
    setIsScanning(false);
    setIsInitiatingScan(false);
    setCameraPermission("unknown");
    setTimeout(() => setShowUI(true), 300);
  };

  const handleScanAgain = () => {
    setCurrentView("camera");
    setScanResult(null);
    setTimeout(() => setIsScanning(true), 500);
  };

  const handleTryAgain = () => {
    setCameraPermission("unknown");
    handleScanNow();
  };

  const { globe, dpr } = useResponsiveSize();

  return (
    <div className="min-h-[100svh] w-full max-w-md mx-auto px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col items-center justify-center gap-5 short:gap-4 xshort:gap-3 xshort:pt-0 xshort:pb-1">
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dev Debug Info */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur text-white text-xs p-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              locationStatus === 'granted' ? 'bg-green-500' :
              locationStatus === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            {locationStatus}
          </div>
          {userLocation && (
            <div className="mt-1 font-mono">
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {currentView === "globe" && (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* Header */}
            <AnimatePresence>
              {showUI && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-center">
                  <motion.h1
                    className="text-center font-extrabold tracking-tight text-white xxs:text-[28px] xs:text-[30px] sm:text-[34px] md:text-[40px] leading-[1.05]"
                    style={{ fontSize: 'clamp(24px, 6vw, 40px)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    Scan anything.<br />Get a fair<br />local price.
                  </motion.h1>
                  <motion.p
                    className="text-center text-white/70 text-[clamp(12px,3.5vw,16px)] max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    Point your camera at a product or menu. We estimate what locals actually pay—fast.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Globe */}
            <AnimatePresence>
              {showUI && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-1 mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-center"
                  style={{ width: globe, height: globe }}
                >
                  <GlobeComponent
                    size={globe} dpr={dpr} className="w-full h-full"
                    zoom={isInitiatingScan} onZoomComplete={handleZoomComplete}
                    allowUserRotate={!isInitiatingScan} showStars={true} forceSolid={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <AnimatePresence>
              {showUI && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="w-full max-w-[520px] flex flex-col gap-2 short:gap-2"
                >
                  <button
                    onClick={handleScanNow} disabled={isInitiatingScan}
                    className="w-full h-14 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 bg-[#3B82F6] text-white shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                    aria-label="Scan Now"
                  >
                    <Scan className="w-5 h-5" /> Scan Now
                  </button>

                  <button
                    onClick={handleUploadPhoto}
                    className="w-full h-14 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 hover:bg-white/7 transition-all"
                    aria-label="Upload Photo"
                  >
                    <Upload className="w-5 h-5" /> Upload Photo
                  </button>

                  {import.meta.env.DEV && (
                    <button
                      onClick={() => ping().then(d => console.log("Ping:", d)).catch(e => console.error(e))}
                      className="text-xs text-white/60 underline self-center mt-1"
                    >
                      Test API
                    </button>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs text-white/60 text-center">We only use your camera for the scan.</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div className="px-3 h-8 text-xs rounded-full border border-white/10 bg-white/5 text-white/90">2–3s estimate</div>
                      <div className="px-3 h-8 text-xs rounded-full border border-white/10 bg-white/5 text-white/90">Crowd-checked</div>
                      <div className="px-3 h-8 text-xs rounded-full border border-white/10 bg-white/5 text-white/90">Local pricing focus</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Camera Permission Fallback */}
        {currentView === "globe" && cameraPermission === "denied" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-xl">
              <h3 className="text-white text-lg font-semibold mb-2">Camera is blocked</h3>
              <p className="text-white/70 text-sm mb-4">
                To scan instantly, allow camera access in your browser settings or upload a photo instead.
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleTryAgain} className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">Try Again</button>
                <button onClick={handleUploadPhoto} className="h-12 bg-black/20 border border-white/20 hover:bg-black/30 text-white font-semibold rounded-xl">Upload Photo</button>
              </div>
            </div>
          </motion.div>
        )}

        {currentView === "camera" && (
          <motion.div key="camera" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="w-full h-full">
            <CameraView isScanning={isScanning} onScanComplete={handleScanComplete} onBack={resetToGlobe} userLocation={userLocation} />
          </motion.div>
        )}

        {currentView === "result" && scanResult && (
          <motion.div key="result" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="w-full h-full">
            <ResultCard result={scanResult} onClose={resetToGlobe} onScanAgain={handleScanAgain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
