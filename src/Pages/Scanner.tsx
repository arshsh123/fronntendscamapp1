// src/Pages/Scanner.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan } from "lucide-react";
import { Button } from "@/Components/ui/button";

import GlobeComponent from "@/Components/scanner/GlobeComponent";
import CameraView   from "@/Components/scanner/CameraView";
import ResultCard   from "@/Components/scanner/ResultCard";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */
interface Location {
  lat: number;
  lng: number;
}

interface ScanItem {
  name: string;
  emoji: string;
  detectedPrice: number;
  localPrice: number;
  currency: string;
  localRange: string;
  overpricePercentage: number;
  insight: string;
  region: string;
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function Scanner() {
  const [currentView,        setCurrentView]        = useState<"globe" | "camera" | "result">("globe");
  const [scanResult,         setScanResult]         = useState<ScanItem | null>(null);
  const [userLocation,       setUserLocation]       = useState<Location | null>(null);
  const [isScanning,         setIsScanning]         = useState(false);
  const [isInitiatingScan,   setIsInitiatingScan]   = useState(false);
  const [locationStatus,     setLocationStatus]     = useState<"loading" | "granted" | "denied">("loading");

  /* ----------------------------- GEO ------------------------------ */
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported, using fallback location");
      setUserLocation({ lat: 26.9124, lng: 75.7873 }); // Jaipur fallback
      setLocationStatus("denied");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        console.log("📍 User location obtained:", location);
        setUserLocation(location);
        setLocationStatus("granted");
      },
      (error) => {
        console.warn("Geolocation denied or failed:", error.message);
        // Use fallback location (Jaipur coordinates)
        setUserLocation({ lat: 26.9124, lng: 75.7873 });
        setLocationStatus("denied");
      },
      options
    );
  }, []);

  /* --------------------------- HANDLERS --------------------------- */
  const handleScanNow = () => {
    console.log("🚀 Starting scan process...");
    setIsInitiatingScan(true);
  };

  const handleZoomComplete = () => {
    console.log("🌍 Globe zoom complete, switching to camera");
    setCurrentView("camera");
    setTimeout(() => {
      console.log("📷 Starting camera scan");
      setIsScanning(true);
    }, 500);
    setIsInitiatingScan(false);
  };

  // NEW: Handle real scan results from backend
  const handleScanComplete = (result: ScanItem) => {
    console.log("✅ Scan completed with result:", result);
    setScanResult(result);
    setCurrentView("result");
    setIsScanning(false);
  };

  // Keep the old simulate function as fallback (you can remove this later)
  const simulateScan = () => {
    console.log("🎭 Using simulated scan (fallback)");
    const items: ScanItem[] = [
      { 
        name: "Veg Biryani Plate", 
        emoji: "🥘", 
        detectedPrice: 180, 
        localPrice: 160,
        currency: "₹", 
        localRange: "₹140–₹180", 
        overpricePercentage: 13,
        insight: "This is what you'd pay at a local dhaba", 
        region: "Mumbai" 
      },
      { 
        name: "Wooden Elephant Figurine", 
        emoji: "🐘", 
        detectedPrice: 300, 
        localPrice: 150,
        currency: "₹", 
        localRange: "₹100–₹160", 
        overpricePercentage: 100,
        insight: "Slightly above market — maybe a touristy spot", 
        region: "Jaipur" 
      },
      { 
        name: "Fresh Coconut Water", 
        emoji: "🥥", 
        detectedPrice: 40, 
        localPrice: 35,
        currency: "₹", 
        localRange: "₹30–₹40", 
        overpricePercentage: 14,
        insight: "Vendors charge more during festivals", 
        region: "Goa" 
      }
    ];

    const randomItem = items[Math.floor(Math.random() * items.length)];

    setTimeout(() => {
      setScanResult(randomItem);
      setCurrentView("result");
      setIsScanning(false);
    }, 2000);
  };

  const resetToGlobe = () => {
    console.log("🔄 Resetting to globe view");
    setCurrentView("globe");
    setScanResult(null);
    setIsScanning(false);
    setIsInitiatingScan(false);
  };

  const handleScanAgain = () => {
    console.log("🔄 Starting new scan");
    setCurrentView("camera");
    setScanResult(null);
    setTimeout(() => setIsScanning(true), 500);
  };

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* radial aura bg */}
      <div
        className="fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(38,70,145,0.2) 0%, transparent 60%)",
        }}
      />

      {/* Debug location status (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded">
          📍 Location: {locationStatus === "loading" ? "Loading..." : locationStatus}
          {userLocation && (
            <div>
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ───────── GLOBE VIEW ───────── */}
        {currentView === "globe" && (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6"
          >
            {/* header */}
            <motion.div
              className="absolute top-16 text-center"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">Fairlo</h1>
              <p className="text-gray-300 text-lg">Know the Real Price</p>
              {locationStatus === "denied" && (
                <p className="text-yellow-400 text-sm mt-2">
                  📍 Using default location - enable GPS for better results
                </p>
              )}
            </motion.div>

            {/* globe + rings */}
            <div className="flex-1 flex items-center justify-center w-full max-w-lg relative">
              <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-blue-400/20 rounded-full"
                    style={{
                      animation:
                        "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
                      animationDelay: `${i * 1.3}s`,
                      width: `${320 + i * 80}px`,
                      height: `${320 + i * 80}px`,
                    }}
                  />
                ))}
              </div>

              <GlobeComponent
                userLocation={userLocation}
                isZooming={isInitiatingScan}
                onZoomComplete={handleZoomComplete}
              />
            </div>

            {/* scan btn */}
            <motion.div
              className="absolute bottom-12 w-full px-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                onClick={handleScanNow}
                disabled={isInitiatingScan}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Scan className="w-6 h-6 mr-3" />
                {isInitiatingScan ? "Locating..." : "Scan Now"}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ───────── CAMERA VIEW ───────── */}
        {currentView === "camera" && (
          <CameraView
            isScanning={isScanning}
            onScanComplete={handleScanComplete} // NOW USING REAL BACKEND!
            onBack={resetToGlobe}
            userLocation={userLocation} // Pass location to camera
          />
        )}

        {/* ───────── RESULT CARD ───────── */}
        {currentView === "result" && scanResult && (
          <ResultCard
            result={scanResult}
            onClose={resetToGlobe}
            onScanAgain={handleScanAgain} // Updated to use real scan
          />
        )}
      </AnimatePresence>

      {/* pulse keyframes */}
      <style>{`
        @keyframes pulse {
          0%,100% {opacity: 0; transform: scale(0.9);}
          50%     {opacity: 1; transform: scale(1.05);}
        }
      `}</style>
    </div>
  );
}