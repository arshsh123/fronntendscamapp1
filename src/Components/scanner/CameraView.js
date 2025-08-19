import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/Components/scanner/CameraView.tsx
// DIAGNOSTIC VERSION - Shows what's happening
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/Components/ui/button";
export default function CameraView({ isScanning, onScanComplete, onBack, userLocation }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [status, setStatus] = useState('initializing');
    const [debugInfo, setDebugInfo] = useState([]);
    const [videoInfo, setVideoInfo] = useState('');
    const addDebug = (message) => {
        console.log(message);
        setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
    };
    const initCamera = async () => {
        try {
            setStatus('requesting_permission');
            addDebug('🎥 Requesting camera access...');
            // Check if camera API exists
            if (!navigator.mediaDevices) {
                throw new Error('MediaDevices API not supported');
            }
            // Simple constraints
            const constraints = {
                video: true,
                audio: false
            };
            addDebug('📱 Getting user media...');
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            addDebug(`✅ Stream obtained: ${stream.getTracks().length} tracks`);
            stream.getTracks().forEach(track => {
                addDebug(`   - ${track.kind}: ${track.label} (${track.readyState})`);
            });
            if (!videoRef.current) {
                throw new Error('Video element not found');
            }
            setStatus('setting_stream');
            addDebug('📺 Setting video stream...');
            const video = videoRef.current;
            video.srcObject = stream;
            // Wait for metadata
            video.onloadedmetadata = () => {
                addDebug(`📐 Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
                setVideoInfo(`${video.videoWidth}x${video.videoHeight}`);
                video.play()
                    .then(() => {
                    addDebug('▶️ Video playing successfully!');
                    setStatus('ready');
                })
                    .catch(error => {
                    addDebug(`❌ Play failed: ${error.message}`);
                    setStatus('play_error');
                });
            };
            video.onerror = (error) => {
                addDebug(`❌ Video error: ${error}`);
                setStatus('video_error');
            };
            // Force load
            video.load();
            // Backup check
            setTimeout(() => {
                if (video.videoWidth > 0) {
                    addDebug('✅ Video working (backup check)');
                    setStatus('ready');
                    setVideoInfo(`${video.videoWidth}x${video.videoHeight}`);
                }
                else if (status !== 'ready') {
                    addDebug('⚠️ Video not showing after 5s');
                    setStatus('timeout');
                }
            }, 5000);
        }
        catch (error) {
            addDebug(`❌ Camera failed: ${error.message}`);
            setStatus('error');
        }
    };
    const takePhoto = () => {
        if (status !== 'ready')
            return;
        // Simple mock result for now
        onScanComplete({
            name: "Test Item",
            emoji: "🏷️",
            detectedPrice: 150,
            localPrice: 100,
            currency: "₹",
            localRange: "₹80-120",
            overpricePercentage: 50,
            insight: "Camera working! This is a test result.",
            region: "Test Location"
        });
    };
    useEffect(() => {
        addDebug('🚀 Component mounted, initializing camera...');
        initCamera();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                addDebug('🛑 Camera stopped');
            }
        };
    }, []);
    // Auto scan when ready
    useEffect(() => {
        if (isScanning && status === 'ready') {
            setTimeout(takePhoto, 2000);
        }
    }, [isScanning, status]);
    return (_jsxs("div", { className: "relative min-h-screen bg-black text-white", children: [_jsxs("div", { className: "absolute top-4 left-4 right-4 z-30 bg-black/80 p-4 rounded text-xs font-mono", children: [_jsxs("div", { className: "text-green-400 mb-2", children: ["Status: ", _jsx("span", { className: "text-white", children: status }), videoInfo && _jsxs("span", { className: "ml-4", children: ["Video: ", videoInfo] })] }), _jsx("div", { className: "space-y-1", children: debugInfo.map((info, i) => (_jsx("div", { className: "text-gray-300", children: info }, i))) }), _jsxs("div", { className: "mt-2 text-yellow-400", children: ["URL: ", window.location.href] })] }), _jsx("div", { className: "absolute inset-0 bg-gray-900", children: _jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        backgroundColor: 'red' // Will show red if video not working
                    } }) }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center z-10", children: status !== 'ready' && (_jsxs("div", { className: "bg-black/80 p-8 rounded-lg text-center", children: [_jsx("div", { className: "w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4", children: status === 'error' ? (_jsx(AlertCircle, { className: "w-8 h-8 text-red-400" })) : (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity }, children: _jsx(Camera, { className: "w-8 h-8" }) })) }), _jsxs("p", { className: "text-lg", children: [status === 'initializing' && 'Initializing...', status === 'requesting_permission' && 'Requesting Permission...', status === 'setting_stream' && 'Setting Up Camera...', status === 'play_error' && 'Play Error', status === 'video_error' && 'Video Error', status === 'timeout' && 'Camera Timeout', status === 'error' && 'Camera Error'] }), (status === 'error' || status === 'timeout') && (_jsx(Button, { onClick: initCamera, className: "mt-4 bg-blue-600 hover:bg-blue-700", children: "Try Again" }))] })) }), _jsx("button", { onClick: onBack, className: "absolute top-20 left-4 z-40 w-12 h-12 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50", children: _jsx(ArrowLeft, { className: "w-6 h-6" }) }), status === 'ready' && (_jsx("div", { className: "absolute bottom-12 left-4 right-4 z-20", children: _jsxs(Button, { onClick: takePhoto, className: "w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50", children: [_jsx(Camera, { className: "w-6 h-6 mr-2" }), "\uD83D\uDCF8 Take Photo (Camera Working!)"] }) }))] }));
}
