import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Camera, ArrowLeft, MapPin, Brain } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
export default function ResultCard({ result, onClose, onScanAgain }) {
    const [typewriterText, setTypewriterText] = useState("");
    const [priceAnimationComplete, setPriceAnimationComplete] = useState(false);
    const [showSkeletons, setShowSkeletons] = useState(false);
    // Show skeletons after 400ms if data is still loading
    useEffect(() => {
        const timer = setTimeout(() => setShowSkeletons(true), 400);
        return () => clearTimeout(timer);
    }, []);
    const isOverpriced = result.overpricePercentage > 20;
    const isFairDeal = result.overpricePercentage <= 20 && result.overpricePercentage >= -10;
    const isUnderpriced = result.overpricePercentage < -10;
    // Typewriter effect for item name
    useEffect(() => {
        let index = 0;
        const text = result.name;
        setTypewriterText("");
        const timer = setInterval(() => {
            setTypewriterText(text.slice(0, index + 1));
            index++;
            if (index >= text.length) {
                clearInterval(timer);
            }
        }, 40);
        return () => clearInterval(timer);
    }, [result.name]);
    const getStatusConfig = () => {
        if (isUnderpriced) {
            return {
                icon: "✅",
                text: "Great Deal",
                bgColor: "bg-emerald-50",
                textColor: "text-emerald-700",
                borderColor: "border-emerald-200"
            };
        }
        else if (isFairDeal) {
            return {
                icon: "✅",
                text: "Fair Deal",
                bgColor: "bg-green-50",
                textColor: "text-green-700",
                borderColor: "border-green-200"
            };
        }
        else {
            return {
                icon: "⚠️",
                text: "Overpriced",
                bgColor: "bg-orange-50",
                textColor: "text-orange-700",
                borderColor: "border-orange-200"
            };
        }
    };
    const getEmotionalLabel = () => {
        if (isUnderpriced) {
            return "Excellent find — local insider price 🎯";
        }
        else if (isFairDeal) {
            return "Right on target — street smart 🧠";
        }
        else {
            return "Tourist pricing detected — negotiate down ⚡";
        }
    };
    const getCulturalInsight = () => {
        const baseInsight = result.insight || "Local market analysis";
        const locationSpecific = {
            "Mumbai": `Street vendors in Colaba charge ${result.currency}${Math.round(result.localPrice * 0.9)}–${result.currency}${Math.round(result.localPrice * 1.1)}`,
            "Goa": `Vendors near Anjuna charge ${result.currency}${Math.round(result.localPrice * 0.85)}–${result.currency}${Math.round(result.localPrice * 1.05)}`,
            "Bangkok": `Local street stalls price this at ${result.currency}${Math.round(result.localPrice * 0.9)}–${result.currency}${Math.round(result.localPrice * 1.1)}`,
            "Jaipur": `Bazaar vendors typically ask ${result.currency}${Math.round(result.localPrice * 0.8)}–${result.currency}${Math.round(result.localPrice * 1.2)}`,
            "Varanasi": `Near the ghats, locals pay ${result.currency}${Math.round(result.localPrice * 0.9)}–${result.currency}${Math.round(result.localPrice * 1.1)}`
        };
        return locationSpecific[result.region] || baseInsight;
    };
    const status = getStatusConfig();
    // Calculate price bar positions
    const minPrice = Math.round(result.localPrice * 0.7);
    const maxPrice = Math.round(result.localPrice * 1.5);
    const range = maxPrice - minPrice;
    const localPosition = ((result.localPrice - minPrice) / range) * 100;
    const userPosition = ((result.detectedPrice - minPrice) / range) * 100;
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "min-h-screen bg-black/40 backdrop-blur-md flex items-center justify-center p-4 relative", children: [_jsx(motion.button, { className: "absolute top-12 right-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors z-20 shadow-lg", onClick: onClose, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2 }, children: _jsx(X, { className: "w-5 h-5" }) }), _jsx(motion.div, { initial: { y: 50, opacity: 0, scale: 0.95 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: 50, opacity: 0, scale: 0.95 }, transition: { type: "spring", damping: 25, stiffness: 400 }, className: "w-full max-w-sm", children: _jsx(Card, { className: "bg-white shadow-2xl overflow-hidden border-0", children: _jsxs(CardContent, { className: "p-8", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "text-center mb-4", children: [_jsx("div", { className: "text-4xl mb-3", children: result.emoji }), _jsxs("h2", { className: "text-2xl font-bold text-gray-900 min-h-[32px]", children: [typewriterText, _jsx(motion.span, { animate: { opacity: [1, 0] }, transition: { duration: 0.8, repeat: Infinity }, className: "text-blue-500 ml-1", children: "|" })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "text-center mb-6", children: _jsxs("div", { className: "flex items-center justify-center gap-2 text-gray-600 text-sm", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsxs("span", { children: ["Based on local street prices in ", result.region] })] }) }), _jsx(motion.div, { initial: { y: -30, opacity: 0, scale: 1.3 }, animate: { y: 0, opacity: 1, scale: 1 }, transition: {
                                    delay: 0.8,
                                    type: "spring",
                                    damping: 15,
                                    stiffness: 300,
                                    onComplete: () => setPriceAnimationComplete(true)
                                }, className: "text-center mb-5", children: showSkeletons ? (_jsxs("div", { className: "text-7xl font-black text-gray-900 tracking-tight", children: [result.currency, result.detectedPrice] })) : (_jsx("div", { className: "h-20 bg-gray-200 rounded-lg animate-pulse" })) }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 1.2 }, className: "flex justify-center mb-5", children: _jsxs("div", { className: `inline-flex items-center gap-2 px-4 py-2 rounded-full border ${status.bgColor} ${status.textColor} ${status.borderColor} font-semibold text-lg`, children: [_jsx("span", { className: "text-xl", children: status.icon }), status.text] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.4 }, className: "text-center mb-6", children: _jsx("p", { className: "text-gray-700 text-sm leading-relaxed", children: getCulturalInsight() }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.6 }, className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center text-xs text-gray-600 mb-2", children: [_jsx("span", { className: "font-medium", children: "Price Range" }), _jsxs("span", { className: "text-gray-500", children: [result.currency, minPrice, " - ", result.currency, maxPrice] })] }), _jsx("div", { className: "relative h-6 bg-gray-100 rounded-full overflow-hidden", children: showSkeletons ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200" }), _jsx(motion.div, { className: "absolute top-1 bottom-1 bg-green-400 rounded-full opacity-80", style: {
                                                        left: `${Math.max(localPosition - 8, 2)}%`,
                                                        width: `16%`
                                                    }, initial: { width: 0 }, animate: { width: "16%" }, transition: { delay: 1.8, duration: 0.8 } }), _jsx(motion.div, { className: `absolute top-0 bottom-0 w-1 ${isOverpriced ? 'bg-orange-600' : isUnderpriced ? 'bg-emerald-600' : 'bg-green-600'} rounded-full`, style: { left: `${Math.min(Math.max(userPosition, 1), 99)}%` }, initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 2.0, type: "spring" }, children: _jsx("div", { className: `absolute -top-2 -left-2 w-5 h-10 ${isOverpriced ? 'bg-orange-600' : isUnderpriced ? 'bg-emerald-600' : 'bg-green-600'} rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg`, children: isOverpriced ? '⚠️' : '✅' }) })] })) : (_jsx("div", { className: "absolute inset-0 bg-gray-200 animate-pulse" })) }), _jsx("div", { className: "flex justify-between text-xs text-gray-500 mt-2", children: showSkeletons ? (_jsxs(_Fragment, { children: [_jsxs("span", { children: ["\uD83D\uDC65 Local: ", result.currency, result.localPrice] }), _jsxs("span", { children: ["\uD83D\uDCCD You: ", result.currency, result.detectedPrice] })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-4 w-20 bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-4 w-20 bg-gray-200 rounded animate-pulse" })] })) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 2.2 }, className: "text-center mb-8", children: _jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-gray-700 font-medium text-sm", children: [_jsx(Brain, { className: "w-4 h-4" }), getEmotionalLabel()] }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 2.4 }, className: "space-y-3", children: [_jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsxs(Button, { onClick: onScanAgain, className: "w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg", children: [_jsx(Camera, { className: "w-5 h-5 mr-2" }), "Scan Another Item"] }) }), _jsxs(Button, { onClick: onClose, className: "w-full h-12 text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Map"] }), _jsxs(Button, { disabled: true, className: "w-full h-10 text-gray-400 rounded-xl cursor-not-allowed opacity-50", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), "\uD83D\uDCCD Nearby Prices"] })] })] }) }) })] }, "result"));
}
