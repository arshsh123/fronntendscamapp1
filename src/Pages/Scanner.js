import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/Pages/Scanner.tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Upload } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { tokens } from "@/lib/ui";
import GlobeComponent from "@/Components/scanner/GlobeComponent";
import CameraView from "@/Components/scanner/CameraView";
import ResultCard from "@/Components/scanner/ResultCard";
export default function Scanner() {
    const [currentView, setCurrentView] = useState("globe");
    const [scanResult, setScanResult] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isInitiatingScan, setIsInitiatingScan] = useState(false);
    const [locationStatus, setLocationStatus] = useState("loading");
    const [cameraPermission, setCameraPermission] = useState("unknown");
    const [showUI, setShowUI] = useState(true);
    const fileInputRef = useRef(null);
    useEffect(() => {
        if (!navigator.geolocation) {
            setUserLocation({ lat: 26.9124, lng: 75.7873 });
            setLocationStatus("denied");
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationStatus("granted");
        }, () => {
            setUserLocation({ lat: 26.9124, lng: 75.7873 });
            setLocationStatus("denied");
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
    }, []);
    const handleScanNow = async () => {
        try {
            // Check camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setCameraPermission("granted");
            setIsInitiatingScan(true);
            setShowUI(false);
        }
        catch (error) {
            setCameraPermission("denied");
        }
    };
    const handleUploadPhoto = () => {
        fileInputRef.current?.click();
    };
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create a mock result for the uploaded file (same as camera flow)
            const mockResult = {
                name: "Uploaded Item",
                emoji: "📷",
                detectedPrice: 120,
                localPrice: 100,
                currency: "₹",
                localRange: "₹80-120",
                overpricePercentage: 20,
                insight: "Analysis based on uploaded image",
                region: "Local Market"
            };
            setScanResult(mockResult);
            setCurrentView("result");
        }
    };
    const handleZoomComplete = () => {
        setCurrentView("camera");
        setTimeout(() => setIsScanning(true), 500);
        setIsInitiatingScan(false);
    };
    const handleScanComplete = (result) => {
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
    return (_jsxs("div", { className: "min-h-screen bg-black overflow-hidden relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]", children: [_jsxs("div", { className: "fixed inset-0 -z-20 pointer-events-none", children: [_jsx("div", { className: "premium-bg-primary absolute inset-0" }), _jsx("div", { className: "premium-bg-secondary absolute inset-0" }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" })] }), _jsx("div", { className: "fixed inset-0 -z-10 pointer-events-none overflow-hidden", children: [...Array(20)].map((_, i) => (_jsx(motion.div, { className: "absolute w-1 h-1 bg-blue-500/20 rounded-full", style: {
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }, animate: {
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.5, 1, 0.5],
                    }, transition: {
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    } }, i))) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileSelect, className: "hidden" }), import.meta.env.DEV && (_jsxs("div", { className: "fixed top-4 right-4 z-50 bg-black/80 backdrop-blur text-white text-xs p-3 rounded-lg border border-white/10", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${locationStatus === 'granted' ? 'bg-green-500' :
                                    locationStatus === 'denied' ? 'bg-red-500' : 'bg-yellow-500'}` }), locationStatus] }), userLocation && (_jsxs("div", { className: "mt-1 font-mono", children: [userLocation.lat.toFixed(4), ", ", userLocation.lng.toFixed(4)] }))] })), _jsxs(AnimatePresence, { mode: "wait", initial: false, children: [currentView === "globe" && (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18 }, className: "relative z-10 min-h-screen flex flex-col", children: [_jsxs("div", { className: "max-w-5xl mx-auto px-4 md:px-6 lg:px-8 flex-1 flex flex-col", children: [_jsx(AnimatePresence, { children: showUI && (_jsx(motion.div, { className: "pt-12 pb-6", initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -50, opacity: 0 }, transition: { duration: 0.5, ease: "easeOut" }, children: _jsxs("div", { className: "text-center", children: [_jsx(motion.h1, { className: "text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3", initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.2, duration: 0.6 }, children: "Scan anything. Get a fair local price." }), _jsx(motion.p, { className: "text-base/6 md:text-lg text-white/70 mt-2", initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.4, duration: 0.6 }, children: "Point your camera at a product or menu. We estimate what locals actually pay\u2014fast." })] }) })) }), _jsxs("div", { className: "flex-1 flex flex-col md:grid md:grid-cols-2 md:gap-8 items-center justify-center py-8", children: [_jsx("div", { className: "order-2 md:order-1 space-y-6", children: _jsx(AnimatePresence, { children: showUI && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 }, transition: { delay: 0.6, duration: 0.5 }, className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-2 md:gap-3", children: [_jsxs(Button, { onClick: handleScanNow, disabled: isInitiatingScan, className: `h-12 px-6 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 text-white ${tokens.ring}`, "aria-label": "Scan Now", children: [_jsx(Scan, { className: "w-5 h-5 mr-2" }), "Scan Now"] }), _jsxs(Button, { onClick: handleUploadPhoto, className: `h-12 px-6 rounded-2xl font-semibold text-white hover:bg-white/10 ${tokens.ring}`, "aria-label": "Upload Photo", children: [_jsx(Upload, { className: "w-5 h-5 mr-2" }), "Upload Photo"] })] }), _jsx("p", { className: "text-xs text-white/60", children: "We only use your camera for the scan." }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("div", { className: tokens.chip, children: "2\u20133s estimate" }), _jsx("div", { className: tokens.chip, children: "Crowd\u2011checked" }), _jsx("div", { className: tokens.chip, children: "Local pricing focus" })] })] })) }) }), _jsx("div", { className: "order-1 md:order-2 w-full max-w-md mx-auto", children: _jsx(AnimatePresence, { children: showUI && (_jsx(motion.div, { initial: { scale: 0.8, opacity: 0, rotateY: -15 }, animate: { scale: 1, opacity: 1, rotateY: 0 }, exit: { scale: 0.8, opacity: 0, rotateY: 15 }, transition: { delay: 0.3, duration: 0.8, ease: "easeOut" }, className: "relative", children: _jsx("div", { className: `${tokens.panel} ${tokens.softShadow} p-3 md:p-4`, children: _jsx(GlobeComponent, { className: "w-full aspect-square", zoom: isInitiatingScan, onZoomComplete: handleZoomComplete, allowUserRotate: !isInitiatingScan, showStars: true }) }) })) }) })] })] }), cameraPermission === "denied" && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pb-8", children: _jsx(Card, { className: `${tokens.panel} ${tokens.softShadow} border-red-500/20`, children: _jsxs(CardContent, { className: "space-y-4", children: [_jsx("h3", { className: "text-white text-lg font-semibold", children: "Camera is blocked" }), _jsx("p", { className: "text-white/70 text-sm", children: "To scan instantly, allow camera access in your browser settings or upload a photo instead." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [_jsx(Button, { onClick: handleTryAgain, className: "h-10 px-4 rounded-xl font-medium", children: "Try Again" }), _jsx(Button, { onClick: handleUploadPhoto, className: "h-10 px-4 rounded-xl font-medium border border-white/20 text-white hover:bg-white/10", children: "Upload Photo" })] })] }) }) }))] }, "globe")), currentView === "camera" && (_jsx(motion.div, { initial: { opacity: 0, scale: 1.02 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 }, transition: { duration: 0.18 }, children: _jsx(CameraView, { isScanning: isScanning, onScanComplete: handleScanComplete, onBack: resetToGlobe, userLocation: userLocation }) }, "camera")), currentView === "result" && scanResult && (_jsx(motion.div, { initial: { opacity: 0, scale: 1.02 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 }, transition: { duration: 0.18 }, children: _jsx(ResultCard, { result: scanResult, onClose: resetToGlobe, onScanAgain: handleScanAgain }) }, "result"))] })] }));
}
