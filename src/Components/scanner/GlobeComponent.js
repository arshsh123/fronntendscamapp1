import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Stars } from "@react-three/drei";
/* ----------------------------- Enhanced Atmosphere Glow ----------------------------- */
function Atmosphere() {
    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
    }), []);
    return (_jsxs("mesh", { scale: 1.06, children: [_jsx("sphereGeometry", { args: [1, 64, 64] }), _jsx("primitive", { object: material, attach: "material" })] }));
}
/* ----------------------------- Subtle Starfield Background ----------------------------- */
function StarField() {
    return (_jsx(Stars, { radius: 300, depth: 60, count: 800, factor: 3, saturation: 0, fade: true, speed: 0.3 }));
}
/* --------------------------------- Enhanced Earth ---------------------------------- */
function EarthMesh({ autoRotate = true, globeScale = 1.0, forceSolid = false, rotationSpeed = 0.02, }) {
    const group = useRef(null);
    const cloudsRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isDocumentHidden, setIsDocumentHidden] = useState(false);
    const [colorMap, normalMap, roughnessMap, cloudsMap] = useTexture([
        "/earth/earth_albedo_4k.jpg",
        "/earth/earth_normal_4k.jpg",
        "/earth/earth_roughness_4k.jpg",
        "/earth/earth_clouds_4k.png",
    ]);
    const texturesLoaded = !!(colorMap && normalMap && roughnessMap);
    // Enhanced texture settings for premium quality
    [colorMap, normalMap, roughnessMap, cloudsMap]?.forEach?.((texture) => {
        if (texture) {
            texture.anisotropy = 16; // Higher anisotropy for sharper detail
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
        }
    });
    // Pause animation when document is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsDocumentHidden(document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);
    useFrame((_, dt) => {
        if (autoRotate && group.current && !isHovered && !isDocumentHidden) {
            group.current.rotation.y += dt * rotationSpeed;
            // Subtle independent cloud rotation for realism
            if (cloudsRef.current) {
                cloudsRef.current.rotation.y += dt * (rotationSpeed * 1.05);
            }
        }
    });
    return (_jsxs("group", { ref: group, scale: globeScale, onPointerEnter: () => setIsHovered(true), onPointerLeave: () => setIsHovered(false), children: [!forceSolid && texturesLoaded && cloudsMap && (_jsxs("mesh", { ref: cloudsRef, scale: 1.012, children: [_jsx("sphereGeometry", { args: [1, 64, 64] }), _jsx("meshStandardMaterial", { map: cloudsMap, transparent: true, opacity: 0.8, depthWrite: false, alphaTest: 0.1 })] })), _jsxs("mesh", { children: [_jsx("sphereGeometry", { args: [1, 128, 128] }), forceSolid ? (_jsx("meshStandardMaterial", { color: "#2563EB", roughness: 0.8, metalness: 0.1, emissive: "#001122", emissiveIntensity: 0.1 })) : texturesLoaded ? (_jsx("meshStandardMaterial", { map: colorMap, normalMap: normalMap, roughnessMap: roughnessMap, roughness: 0.9, metalness: 0.05, normalScale: new THREE.Vector2(1.2, 1.2) })) : (_jsx("meshStandardMaterial", { color: "#2563EB", roughness: 0.8, metalness: 0.1, emissive: "#001122", emissiveIntensity: 0.1 }))] }), !forceSolid && texturesLoaded && _jsx(Atmosphere, {})] }));
}
/* ---------------------------- Smooth Zoom-to-Scan Controller -------------------------- */
function ZoomController({ zoom, onDone, startZ = 3.5, endZ = 1.9, duration = 0.6, }) {
    const { camera } = useThree();
    const tRef = useRef(0);
    const [active, setActive] = useState(false);
    useEffect(() => {
        if (zoom) {
            setActive(true);
            tRef.current = 0;
            camera.position.set(0, 0, startZ);
        }
    }, [zoom, camera, startZ]);
    useFrame((_, dt) => {
        if (!active)
            return;
        tRef.current += dt;
        const t = Math.min(tRef.current / duration, 1);
        // Enhanced easing curve for cinematic feel
        const eased = t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        camera.position.z = THREE.MathUtils.lerp(startZ, endZ, eased);
        camera.lookAt(0, 0, 0);
        if (t >= 1) {
            setActive(false);
            onDone?.();
        }
    });
    return null;
}
/* ------------------------------ Enhanced Renderer & Environment ---------------------------- */
function RendererTweak() {
    const { gl, scene } = useThree();
    useEffect(() => {
        // Enhanced renderer settings for premium quality
        gl.setClearColor(0x000000, 0);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        // Add subtle fog for depth
        scene.fog = new THREE.Fog(0x000000, 8, 15);
        scene.background = null;
    }, [gl, scene]);
    return null;
}
/* ----------------------------- Enhanced Lighting Setup ----------------------------- */
function LightingRig() {
    return (_jsxs(_Fragment, { children: [_jsx("directionalLight", { position: [5, 3, 5], intensity: 1.2, castShadow: true, "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("ambientLight", { intensity: 0.4 }), _jsx("pointLight", { position: [-5, -3, -5], intensity: 0.3, color: "#60A5FA" })] }));
}
/* ------------------------------ Main Enhanced Component ----------------------------- */
export default function GlobeComponent({ className = "", zoom = false, onZoomComplete, allowUserRotate = true, forceSolid = false, debugBasic = false, showStars = true, }) {
    const [webglOK, setWebglOK] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!gl) {
                setWebglOK(false);
            }
        }
        catch {
            setWebglOK(false);
        }
        // Simulate loading time for smoother experience
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    if (!webglOK) {
        return (_jsxs("div", { className: `w-full h-full relative ${className}`, children: [_jsx("img", { src: "/earth/earth_albedo_4k.jpg", alt: "Earth", className: "w-full h-full object-cover rounded-xl" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" })] }));
    }
    return (_jsxs("div", { className: `w-full h-full relative ${className}`, children: [_jsxs(Canvas, { gl: {
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                }, dpr: [1, 2], camera: {
                    position: [0, 0, 3.5],
                    fov: 45,
                    near: 0.1,
                    far: 1000
                }, children: [_jsx(RendererTweak, {}), _jsxs(Suspense, { fallback: _jsxs("mesh", { children: [_jsx("sphereGeometry", { args: [1, 32, 32] }), _jsx("meshBasicMaterial", { color: "#2563EB", wireframe: true })] }), children: [debugBasic ? (_jsxs("mesh", { children: [_jsx("sphereGeometry", { args: [1, 32, 32] }), _jsx("meshBasicMaterial", { wireframe: true, color: "#60A5FA" })] })) : (_jsxs(_Fragment, { children: [showStars && _jsx(StarField, {}), _jsx(LightingRig, {}), _jsx(EarthMesh, { autoRotate: !zoom, globeScale: 1.0, forceSolid: forceSolid, rotationSpeed: 0.03 }), _jsx(ZoomController, { zoom: zoom, onDone: onZoomComplete, duration: 0.6 })] })), _jsx(OrbitControls, { enableZoom: false, enablePan: false, enableRotate: allowUserRotate && !zoom, enableDamping: true, dampingFactor: 0.05, rotateSpeed: 0.5, minDistance: 1.5, maxDistance: 8, minPolarAngle: Math.PI * 0.2, maxPolarAngle: Math.PI * 0.8 })] })] }), isLoading && (_jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl", children: _jsx("div", { className: "w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" }) }))] }));
}
