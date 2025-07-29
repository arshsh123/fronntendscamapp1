// src/Components/scanner/CameraView.tsx
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Scan, Zap, Camera } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface Props {
  isScanning: boolean;
  onScanComplete: (result: any) => void;
  onBack: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function CameraView({ isScanning, onScanComplete, onBack, userLocation }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [scanningTarget, setScanningTarget] = useState({ x: 50, y: 50 });

  const scanTimeout = useRef<NodeJS.Timeout | null>(null);
  const jitterInterval = useRef<NodeJS.Timeout | null>(null);

  /* ───────────────────────── IMPROVED CAMERA CONTROL ───────────────────────── */
  const startCamera = async () => {
    console.log("🎥 Starting camera...");
    try {
      // Stop any existing stream first
      await stopCamera();
      
      const constraints = {
        video: {
          facingMode: { ideal: "environment" }, // Prefer back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log("✅ Video playing");
                setHasCamera(true);
                setCameraError("");
              })
              .catch((playError) => {
                console.error("❌ Video play error:", playError);
                setCameraError("Failed to start video playback");
              });
          }
        };

        // Error handling
        videoRef.current.onerror = (error) => {
          console.error("❌ Video error:", error);
          setCameraError("Video stream error");
          setHasCamera(false);
        };
        
        // Backup timeout
        setTimeout(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            console.log("✅ Video ready via timeout check");
            setHasCamera(true);
            setCameraError("");
          }
        }, 2000);
      }
      
    } catch (err: any) {
      console.error("❌ Camera access error:", err);
      let errorMsg = "Camera access denied";
      
      if (err.name === 'NotAllowedError') {
        errorMsg = "Camera permission denied. Please allow camera access.";
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMsg = "Camera is being used by another application.";
      }
      
      setCameraError(errorMsg);
      setHasCamera(false);
    }
  };

  const stopCamera = async () => {
    console.log("🛑 Stopping camera...");
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setHasCamera(false);
  };

  /* ───────────────────────── IMPROVED IMAGE CAPTURE ───────────────────────── */
  const captureImage = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !hasCamera || videoRef.current.videoWidth === 0) {
        console.error("❌ Cannot capture: video not ready");
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("❌ Cannot get canvas context");
        resolve(null);
        return;
      }

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob with good quality
      canvas.toBlob((blob) => {
        if (blob) {
          console.log("✅ Image captured:", {
            size: blob.size,
            type: blob.type,
            dimensions: `${canvas.width}x${canvas.height}`
          });
        }
        resolve(blob);
      }, 'image/jpeg', 0.85);
    });
  };

  /* ───────────────────────── BACKEND INTEGRATION ───────────────────────── */
  const sendToBackend = async (imageBlob: Blob): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'photo.jpg');
    
    // Use provided location or fallback
    const locationString = userLocation 
      ? `${userLocation.lat},${userLocation.lng}`
      : "26.9124,75.7873"; // Jaipur fallback
    
    formData.append('location', locationString);

    console.log('🚀 Sending to backend:', {
      imageSize: `${(imageBlob.size / 1024).toFixed(1)}KB`,
      location: locationString,
      endpoint: 'http://127.0.0.1:8001/scan'
    });

    try {
      const response = await fetch('http://127.0.0.1:8001/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Backend error:', error);
      
      // More specific error handling
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to backend server. Is it running on port 8001?');
      }
      
      throw error;
    }
  };

  /* ───────────────────────── PHOTO CAPTURE & ANALYSIS ───────────────────────── */
  const takePhoto = async () => {
    if (!hasCamera || isProcessing) {
      console.warn("⚠️ Cannot take photo: camera not ready or already processing");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("📸 Taking photo...");
      
      // Capture image from video stream
      const imageBlob = await captureImage();
      if (!imageBlob) {
        throw new Error('Failed to capture image from camera');
      }

      console.log("🤖 Sending to AI for analysis...");
      
      // Send to backend for AI analysis
      const backendResult = await sendToBackend(imageBlob);
      
      // Transform result for UI
      const transformedResult = transformBackendResult(backendResult);
      
      // Return to parent component
      onScanComplete(transformedResult);

    } catch (error: any) {
      console.error('❌ Photo capture failed:', error);
      
      // Show error to user with fallback
      const errorResult = {
        name: "Analysis Failed",
        emoji: "⚠️",
        detectedPrice: 0,
        localPrice: 0,
        currency: "₹",
        localRange: "Unable to determine",
        overpricePercentage: 0,
        insight: error.message || "Something went wrong during analysis",
        region: "Unknown"
      };
      
      onScanComplete(errorResult);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ───────────────────────── RESULT TRANSFORMATION ───────────────────────── */
  const transformBackendResult = (backendData: any) => {
    console.log("🔄 Transforming backend data:", backendData);
    
    // Handle your backend response format
    const itemName = backendData.detected_item || backendData.item || "Unknown Item";
    const location = backendData.location || "Unknown Location";
    const priceEstimate = backendData.chatgpt_price_estimate || 
                         backendData.local_price_estimate || 
                         "Price unavailable";
    
    // Extract currency (you might need to adjust this based on your backend)
    const currency = backendData.currency_symbol || "₹";
    
    // Simple price parsing (adjust based on your backend format)
    let detectedPrice = 100;
    let localPrice = 80;
    
    try {
      // Try to extract numbers from price estimate
      const numbers = priceEstimate.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        localPrice = parseInt(numbers[0]);
        detectedPrice = parseInt(numbers[1]);
      } else if (numbers && numbers.length === 1) {
        localPrice = parseInt(numbers[0]);
        detectedPrice = Math.round(localPrice * 1.3); // assume 30% markup
      }
    } catch (e) {
      console.warn("Could not parse prices from:", priceEstimate);
    }

    const overpricePercentage = localPrice > 0 
      ? Math.round(((detectedPrice - localPrice) / localPrice) * 100)
      : 0;
    
    // Get emoji based on item
    const getItemEmoji = (itemName: string) => {
      const name = itemName.toLowerCase();
      if (name.includes('elephant')) return '🐘';
      if (name.includes('coconut')) return '🥥';
      if (name.includes('food') || name.includes('biryani')) return '🥘';
      if (name.includes('scarf') || name.includes('textile')) return '🧣';
      if (name.includes('bag') || name.includes('leather')) return '👜';
      if (name.includes('jewelry') || name.includes('jewel')) return '💎';
      if (name.includes('wooden')) return '🪵';
      if (name.includes('statue') || name.includes('figurine')) return '🗿';
      return '🏷️';
    };

    return {
      name: itemName,
      emoji: getItemEmoji(itemName),
      detectedPrice,
      localPrice,
      currency,
      localRange: priceEstimate,
      overpricePercentage,
      insight: `AI detected: ${itemName}. ${priceEstimate}`,
      region: location
    };
  };

  /* ────────────────────────── EFFECTS ───────────────────────────── */
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (jitterInterval.current) clearInterval(jitterInterval.current);
    };
  }, []);

  // Handle automatic scanning when isScanning prop changes
  useEffect(() => {
    if (!isScanning) {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (jitterInterval.current) clearInterval(jitterInterval.current);
      return;
    }

    // Start scan animation
    jitterInterval.current = setInterval(() => {
      setScanningTarget({
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40,
      });
    }, 200);

    // Automatically take photo after animation
    scanTimeout.current = setTimeout(() => {
      takePhoto();
    }, 2000);

    return () => {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (jitterInterval.current) clearInterval(jitterInterval.current);
    };
  }, [isScanning, hasCamera]);

  /* ─────────────────────────── RENDER ─────────────────────────────── */
  return (
    <motion.div
      key="camera"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Hidden canvas for captures */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Feed */}
      <div className="absolute inset-0">
        {hasCamera ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror for better UX
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center p-6">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {cameraError ? (
                  <span className="text-2xl">⚠️</span>
                ) : (
                  <Camera className="w-10 h-10" />
                )}
              </div>
              <p className="text-lg font-medium mb-2">
                {cameraError || "Camera Loading..."}
              </p>
              {cameraError && (
                <Button 
                  onClick={startCamera}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Back button */}
      <motion.div
        className="absolute top-12 left-6 z-20"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Scan overlay with animation */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          className="relative w-64 h-64 border-2 border-white/50 rounded-3xl"
          animate={{
            borderColor: isScanning || isProcessing
              ? ["rgba(255,255,255,0.5)", "rgba(59,130,246,0.8)", "rgba(255,255,255,0.5)"]
              : "rgba(255,255,255,0.5)",
          }}
          transition={{ duration: 1, repeat: (isScanning || isProcessing) ? Infinity : 0 }}
        >
          {/* Corner indicators */}
          {[
            "-top-1 -left-1 border-l-4 border-t-4 rounded-tl-lg",
            "-top-1 -right-1 border-r-4 border-t-4 rounded-tr-lg", 
            "-bottom-1 -left-1 border-l-4 border-b-4 rounded-bl-lg",
            "-bottom-1 -right-1 border-r-4 border-b-4 rounded-br-lg",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
          ))}

          {/* Scanning effects */}
          {(isScanning || isProcessing) && (
            <>
              {/* Sweeping line */}
              <motion.div className="absolute inset-0 overflow-hidden rounded-3xl">
                <motion.div
                  className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  animate={{ y: [0, 250] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>

              {/* Moving target dot */}
              <motion.div
                className="absolute w-4 h-4 bg-blue-400 rounded-full shadow-lg"
                style={{ 
                  left: `${scanningTarget.x}%`, 
                  top: `${scanningTarget.y}%`, 
                  transform: "translate(-50%, -50%)" 
                }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping" />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Status message */}
      <motion.div
        className="absolute bottom-32 left-0 right-0 text-center z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-black/60 backdrop-blur-sm mx-6 py-4 px-6 rounded-2xl">
          {isProcessing ? (
            <div className="flex items-center justify-center gap-3 text-white">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Zap className="w-5 h-5 text-blue-400" />
              </motion.div>
              <span className="text-lg font-medium">Analyzing with AI...</span>
            </div>
          ) : isScanning ? (
            <div className="flex items-center justify-center gap-3 text-white">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Scan className="w-5 h-5 text-blue-400" />
              </motion.div>
              <span className="text-lg font-medium">Scanning item...</span>
            </div>
          ) : (
            <div className="text-white">
              <p className="text-lg font-medium mb-1">Point camera at any item</p>
              <p className="text-gray-300 text-sm">Tap the button below to analyze</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Take Photo Button */}
      {hasCamera && !isProcessing && (
        <motion.div
          className="absolute bottom-12 left-0 right-0 px-6 z-10"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            onClick={takePhoto} 
            disabled={isScanning || isProcessing}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-lg font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6" />
            {isScanning ? "Scanning..." : "📸 Take Photo & Analyze"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}