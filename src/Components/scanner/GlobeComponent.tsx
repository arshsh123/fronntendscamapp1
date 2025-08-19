import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Stars } from "@react-three/drei";

/* ----------------------------- Enhanced Atmosphere Glow ----------------------------- */
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
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
      }),
    []
  );

  return (
    <mesh scale={1.06}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ----------------------------- Subtle Starfield Background ----------------------------- */
function StarField() {
  return (
    <Stars
      radius={300}
      depth={60}
      count={800}
      factor={3}
      saturation={0}
      fade={true}
      speed={0.3}
    />
  );
}

/* --------------------------------- Enhanced Earth ---------------------------------- */
function EarthMesh({
  autoRotate = true,
  globeScale = 1.0,
  forceSolid = false,
  rotationSpeed = 0.02,
}: {
  autoRotate?: boolean;
  globeScale?: number;
  forceSolid?: boolean;
  rotationSpeed?: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  
  const [colorMap, normalMap, roughnessMap, cloudsMap] = useTexture([
    "/earth/earth_albedo_4k.jpg",
    "/earth/earth_normal_4k.jpg", 
    "/earth/earth_roughness_4k.jpg",
    "/earth/earth_clouds_4k.png",
  ]) as unknown as THREE.Texture[];
  
  const texturesLoaded = !!(colorMap && normalMap && roughnessMap);

  // Enhanced texture settings for premium quality
  [colorMap, normalMap, roughnessMap, cloudsMap]?.forEach?.((texture: THREE.Texture) => {
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

  return (
    <group 
      ref={group} 
      scale={globeScale}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      // Center the group at origin
      position={[0, 0, 0]}
    >
      {/* Enhanced Cloud Layer */}
      {!forceSolid && texturesLoaded && cloudsMap && (
        <mesh ref={cloudsRef} scale={1.012}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            map={cloudsMap} 
            transparent 
            opacity={0.8}
            depthWrite={false}
            alphaTest={0.1}
          />
        </mesh>
      )}

      {/* Main Earth Sphere */}
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />
        {forceSolid ? (
          <meshStandardMaterial 
            color="#2563EB" 
            roughness={0.8} 
            metalness={0.1}
            emissive="#001122"
            emissiveIntensity={0.1}
          />
        ) : texturesLoaded ? (
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
            roughness={0.9}
            metalness={0.05}
            normalScale={new THREE.Vector2(1.2, 1.2)}
          />
        ) : (
          <meshStandardMaterial 
            color="#2563EB" 
            roughness={0.8} 
            metalness={0.1}
            emissive="#001122"
            emissiveIntensity={0.1}
          />
        )}
      </mesh>

      {/* Enhanced Atmosphere only when textures loaded */}
      {!forceSolid && texturesLoaded && <Atmosphere />}
    </group>
  );
}

/* ---------------------------- Smooth Zoom-to-Scan Controller -------------------------- */
function ZoomController({
  zoom,
  onDone,
  startZ = 3.0,
  endZ = 1.5,
  duration = 0.6,
}: {
  zoom: boolean;
  onDone?: () => void;
  startZ?: number;
  endZ?: number;
  duration?: number;
}) {
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
    if (!active) return;
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
  const { gl, scene, camera, size } = useThree();
  
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
  return (
    <>
      {/* Key light - simulates sun */}
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light - softer ambient */}
      <ambientLight intensity={0.4} />
      
      {/* Rim light for atmosphere enhancement */}
      <pointLight 
        position={[-5, -3, -5]} 
        intensity={0.3}
        color="#60A5FA"
      />
    </>
  );
}

/* ------------------------------ Main Enhanced Component ----------------------------- */
export default function GlobeComponent({
  className = "",
  zoom = false,
  onZoomComplete,
  allowUserRotate = true,
  forceSolid = false,
  debugBasic = false,
  showStars = true,
  size,
  dpr,
}: {
  className?: string;
  zoom?: boolean;
  onZoomComplete?: () => void;
  allowUserRotate?: boolean;
  forceSolid?: boolean;
  debugBasic?: boolean;
  showStars?: boolean;
  size?: number;
  dpr?: [number, number];
}) {
  const [webglOK, setWebglOK] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglOK(false);
      }
    } catch {
      setWebglOK(false);
    }
    
    // Simulate loading time for smoother experience
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

     if (!webglOK) {
     return (
       <div className={`w-full h-full relative flex items-center justify-center ${className}`}>
         <div 
           className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/30 shadow-lg flex items-center justify-center"
           style={{
             background: 'radial-gradient(circle at 30% 30%, #3B82F6, #1E40AF)',
           }}
         >
           <div className="text-white/60 text-center">
             <div className="text-2xl mb-2">🌍</div>
             <div className="text-sm">WebGL not supported</div>
           </div>
         </div>
       </div>
     );
   }

    return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
        }}
        dpr={dpr ?? [1, 2]}
        resize={{ scroll: false, debounce: 0 }}
        camera={{ 
          position: [0, 0, 3.0], 
          fov: 45, 
          near: 0.1, 
          far: 1000
        }}
        style={{
          display: 'block',
          width: size ?? '100%',
          height: size ?? '100%',
        }}
      >
        <RendererTweak />
        
        <Suspense 
          fallback={
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#2563EB" wireframe />
            </mesh>
          }
        >
          {debugBasic ? (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial wireframe color="#60A5FA" />
            </mesh>
          ) : (
            <>
              {showStars && <StarField />}
              <LightingRig />
              
              <EarthMesh 
                autoRotate={!zoom} 
                globeScale={1.0} 
                forceSolid={forceSolid}
                rotationSpeed={0.02}
              />
              
              <ZoomController 
                zoom={zoom} 
                onDone={onZoomComplete}
                startZ={3.0}
                endZ={1.5}
                duration={0.6}
              />
            </>
          )}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={allowUserRotate && !zoom}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            minDistance={1.5}
            maxDistance={8}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.8}
            // Ensure controls are centered
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-white/70 text-sm">Loading globe...</div>
          </div>
        </div>
      )}
    </div>
  );
}