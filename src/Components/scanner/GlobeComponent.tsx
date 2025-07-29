import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  userLocation: { lat: number; lng: number } | null;
  isZooming: boolean;
  onZoomComplete: () => void;
}

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z =   radius * Math.sin(phi) * Math.sin(theta);
  const y =   radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function GlobeComponent({ userLocation, isZooming, onZoomComplete }: Props) {
  /* Refs */
  const mountRef     = useRef<HTMLDivElement | null>(null);
  const globeRef     = useRef<THREE.Mesh | null>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const animationId  = useRef<number | null>(null);

  /* Textures  – replace these with local imports if you bundle assets */
  const textureLoader   = useMemo(() => new THREE.TextureLoader(), []);
  const earthTexture    = useMemo(() => textureLoader.load("https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"), [textureLoader]);
  const bumpTexture     = useMemo(() => textureLoader.load("https://threejs.org/examples/textures/earth_bump.jpg"),               [textureLoader]);
  const specularTexture = useMemo(() => textureLoader.load("https://threejs.org/examples/textures/water.png"),                    [textureLoader]);

  /* ------------------------------ SCENE SETUP ------------------------------ */
  useEffect(() => {
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3.5;
    cameraRef.current = camera;

    /* renderer – responsive size */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const setRendererSize = () => {
      const SIZE = Math.min(window.innerWidth * 0.9, 360); // 90 % of vw, max 360 px
      renderer.setSize(SIZE, SIZE);
      camera.aspect = 1;  // square canvas keeps math simple
      camera.updateProjectionMatrix();
    };
    setRendererSize();
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    /* stars */
    const starVertices: number[] = [];
    for (let i = 0; i < 10_000; i++) {
      starVertices.push(
        THREE.MathUtils.randFloatSpread(200),
        THREE.MathUtils.randFloatSpread(200),
        THREE.MathUtils.randFloatSpread(200)
      );
    }
    const stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3)),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.8, transparent: true })
    );
    scene.add(stars);

    /* earth */
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.02,
        specularMap: specularTexture,
        specular: new THREE.Color("grey"),
        shininess: 10,
      })
    );
    scene.add(globe);
    globeRef.current = globe;

    /* atmosphere */
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.04, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vNormal; void main(){float i=pow(0.6-dot(vNormal,vec3(0,0,1)),2.0); gl_FragColor=vec4(0.3,0.6,1.0,1.0)*i;}`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
      })
    );
    scene.add(atmosphere);

    /* user marker */
    if (userLocation) {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x00aaff })
      );
      marker.position.copy(latLonToVector3(userLocation.lat, userLocation.lng, 1.01));
      globe.add(marker);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    /* animation loop */
    const animate = () => {
      animationId.current = requestAnimationFrame(animate);
      if (!isZooming) {
        globe.rotation.y += 0.0008;
        stars.rotation.y += 0.0001;
      }
      renderer.render(scene, camera);
    };
    animate();

    /* resize listener */
    window.addEventListener("resize", setRendererSize);

    /* cleanup */
    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      window.removeEventListener("resize", setRendererSize);
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [earthTexture, bumpTexture, specularTexture, userLocation, isZooming]);

  /* ------------------------------ ZOOM LOGIC ------------------------------- */
  useEffect(() => {
    if (!isZooming || !userLocation || !globeRef.current || !cameraRef.current) return;

    const globe  = globeRef.current;
    const camera = cameraRef.current;

    const targetPos = latLonToVector3(userLocation.lat, userLocation.lng, 1);
    const temp     = new THREE.Object3D();
    temp.position.copy(targetPos);
    temp.lookAt(new THREE.Vector3());
    const targetRotation = new THREE.Quaternion().setFromRotationMatrix(temp.matrix)
                                .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI));

    const startRotation  = globe.quaternion.clone();
    const startCamZ      = camera.position.z;
    const duration       = 2000;
    const startTime      = Date.now();

    const zoom = () => {
      const t   = Math.min((Date.now() - startTime) / duration, 1);
      const e   = 1 - Math.pow(1 - t, 5); // easeOutQuint

      globe.quaternion.slerpQuaternions(startRotation, targetRotation, e);
      camera.position.z = startCamZ - 2.5 * e;
      camera.fov        = 45 - 30 * e;
      camera.updateProjectionMatrix();

      if (t < 1) {
        animationId.current = requestAnimationFrame(zoom);
      } else {
        setTimeout(onZoomComplete, 300);
      }
    };

    if (animationId.current) cancelAnimationFrame(animationId.current);
    zoom();
  }, [isZooming, userLocation, onZoomComplete]);

  return <div ref={mountRef} className="mx-auto" />;
}
