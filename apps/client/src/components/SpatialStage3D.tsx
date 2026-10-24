import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

export type ViewMode = "isometric" | "street" | "wireframe";

interface SpatialStage3DProps {
  className?: string;
  interactive?: boolean;
  onBuildingSelect?: (buildingId: number, data: any) => void;
  accentColor?: string;
}

export function SpatialStage3D({
  className = "",
  interactive = true,
  onBuildingSelect,
}: SpatialStage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("isometric");
  const [selectedBuilding, setSelectedBuilding] = useState<{
    id: number;
    name: string;
    yield: string;
    status: string;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // References to keep animation loop clean
  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    reqId: 0,
    mouseX: 0,
    mouseY: 0,
    targetRotationY: 0,
    targetRotationX: 0,
    currentRotationY: 0,
    currentRotationX: 0,
    viewMode: "isometric" as ViewMode,
    autoRotate: true,
    buildings: [] as THREE.Mesh[],
    beaconMeshes: [] as THREE.Mesh[],
    particles: null as THREE.Points | null,
    gridHelper: null as THREE.GridHelper | null,
  });

  stateRef.current.viewMode = viewMode;
  stateRef.current.autoRotate = autoRotate;

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    stateRef.current.mouseX = nx;
    stateRef.current.mouseY = ny;
    stateRef.current.targetRotationY = nx * 0.45;
    stateRef.current.targetRotationX = ny * 0.25;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const state = stateRef.current;

    // Check WebGL availability
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported on this device.");
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);
    stateRef.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(24, 20, 28);
    camera.lookAt(0, 2, 0);
    stateRef.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // 4. City Root Group
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // 5. Ground Cyber-Grid
    const gridSize = 70;
    const gridDivisions = 40;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);
    stateRef.current.gridHelper = gridHelper;

    // Luminous Concentric Floor Rings
    const ringGeo = new THREE.RingGeometry(8, 8.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const outerRingGeo = new THREE.RingGeometry(18, 18.2, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // 6. Procedural Buildings (EstateOS Architectural Blocks)
    const buildingMeshes: THREE.Mesh[] = [];
    const beaconMeshes: THREE.Mesh[] = [];
    const layout = [
      // Core District (High-Rises)
      { x: -6, z: -6, w: 3, d: 3, h: 14, name: "EstateOS Horizon Tower", yield: "9.8%", status: "Smart Lease Active" },
      { x: 0, z: -6, w: 3.5, d: 3.5, h: 19, name: "Apex Financial Center", yield: "10.4%", status: "Fully Leased (100%)" },
      { x: 6, z: -6, w: 3, d: 3, h: 12, name: "Indiranagar Sovereign", yield: "8.9%", status: "Verified Digital Twin" },

      // Mid District
      { x: -7, z: 0, w: 3.2, d: 2.8, h: 10, name: "Koramangala Tech Loft", yield: "9.2%", status: "Escrow Ready" },
      { x: -1.5, z: 0, w: 2.5, d: 2.5, h: 7, name: "Metro Station Plaza", yield: "7.8%", status: "Instant Booking" },
      { x: 4, z: 0, w: 3, d: 3, h: 13, name: "Whitefield Solaris", yield: "11.1%", status: "AI Recommended" },

      // South District (Villas & Studios)
      { x: -6, z: 6, w: 2.8, d: 3.2, h: 8, name: "Lavelle Penthouse Suites", yield: "8.5%", status: "Zero Brokerage" },
      { x: 0, z: 6, w: 3.5, d: 2.8, h: 11, name: "HSR Sector 2 Residency", yield: "9.6%", status: "Yield Optimized" },
      { x: 6, z: 6, w: 3, d: 3, h: 9, name: "Palm Meadows Villa Node", yield: "10.1%", status: "Smart Maintenance" },

      // Outer Perimeter Nodes
      { x: -12, z: -4, w: 2.5, d: 2.5, h: 6, name: "Sarjapur Green Valley", yield: "8.2%", status: "Active" },
      { x: 12, z: -3, w: 2.5, d: 2.5, h: 7, name: "Bellandur Silicon Park", yield: "9.9%", status: "Active" },
      { x: -11, z: 5, w: 2.2, d: 2.2, h: 5, name: "Richmond Luxury Flat", yield: "8.7%", status: "Active" },
      { x: 11, z: 6, w: 2.6, d: 2.6, h: 6.5, name: "Hebbal Lakeview Heights", yield: "9.4%", status: "Active" },
    ];

    layout.forEach((item, idx) => {
      // Building Body
      const geo = new THREE.BoxGeometry(item.w, item.h, item.d);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x091326,
        roughness: 0.15,
        metalness: 0.85,
        transmission: 0.35,
        transparent: true,
        opacity: 0.85,
        reflectivity: 0.9,
        clearcoat: 0.5,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(item.x, item.h / 2, item.z);
      mesh.userData = { id: idx, ...item };
      cityGroup.add(mesh);
      buildingMeshes.push(mesh);

      // Glowing Architectural Wireframe Edges
      const edges = new THREE.EdgesGeometry(geo);
      const edgeColor = idx % 2 === 0 ? 0x38bdf8 : 0x10b981;
      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.75,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      mesh.add(wireframe);

      // Rooftop Floating Holographic Beacon on top towers
      if (item.h >= 10) {
        const beaconGeo = new THREE.OctahedronGeometry(0.65, 0);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: idx % 2 === 0 ? 0x00f0ff : 0x34d399,
          wireframe: true,
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(item.x, item.h + 1.2, item.z);
        beacon.userData = { baseBuilding: idx, initialY: item.h + 1.2 };
        cityGroup.add(beacon);
        beaconMeshes.push(beacon);
      }
    });

    stateRef.current.buildings = buildingMeshes;
    stateRef.current.beaconMeshes = beaconMeshes;

    // 7. Ambient Particle Energy Stream
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = Math.random() * 25;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      particleSpeeds[i] = 0.02 + Math.random() * 0.04;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    stateRef.current.particles = particles;

    // 8. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.8);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight2.position.set(-20, 25, -20);
    scene.add(dirLight2);

    const centerPointLight = new THREE.PointLight(0x10b981, 3.5, 40);
    centerPointLight.position.set(0, 12, 0);
    scene.add(centerPointLight);

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let angle = 0;

    const animate = () => {
      stateRef.current.reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation based on mouse + view mode
      const { targetRotationX, targetRotationY, viewMode: currentVM, autoRotate: isAuto } = stateRef.current;
      stateRef.current.currentRotationX += (targetRotationX - stateRef.current.currentRotationX) * 0.06;
      stateRef.current.currentRotationY += (targetRotationY - stateRef.current.currentRotationY) * 0.06;

      if (isAuto) {
        angle += 0.0025;
      }

      // Camera view configuration
      let targetCamX = 24 * Math.cos(angle) + stateRef.current.currentRotationY * 12;
      let targetCamZ = 24 * Math.sin(angle) + stateRef.current.currentRotationX * 12;
      let targetCamY = 18;

      if (currentVM === "street") {
        targetCamX = 14 * Math.cos(angle * 1.2);
        targetCamZ = 14 * Math.sin(angle * 1.2);
        targetCamY = 5.5 + Math.sin(elapsedTime * 0.5) * 1.2;
      } else if (currentVM === "wireframe") {
        targetCamX = 28 * Math.cos(angle * 0.5);
        targetCamZ = 28 * Math.sin(angle * 0.5);
        targetCamY = 28;
      }

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;
      camera.lookAt(0, currentVM === "street" ? 4 : 2, 0);

      // Rotate beacon diamonds
      beaconMeshes.forEach((beacon, i) => {
        beacon.rotation.y += 0.03;
        beacon.rotation.x += 0.015;
        const initialY = beacon.userData.initialY || 10;
        beacon.position.y = initialY + Math.sin(elapsedTime * 2.5 + i) * 0.45;
      });

      // Pulse Floor Rings
      ring.scale.setScalar(1 + Math.sin(elapsedTime * 1.5) * 0.04);
      outerRing.scale.setScalar(1 - Math.sin(elapsedTime * 1.2) * 0.03);

      // Animate Particles
      if (particles) {
        const posAttr = particleGeo.getAttribute("position");
        if (posAttr) {
          const positions = posAttr.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const idx = i * 3 + 1;
            const currentY = positions[idx];
            if (typeof currentY === "number") {
              const speed = particleSpeeds[i] ?? 0.02;
              const nextY = currentY + speed;
              positions[idx] = nextY > 26 ? 0.1 : nextY;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Raycaster for building interaction
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    let lastHoveredMesh: THREE.Mesh | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container || !camera) return;
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes);

      if (intersects.length > 0 && intersects[0]) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit !== lastHoveredMesh) {
          if (lastHoveredMesh && "emissive" in lastHoveredMesh.material) {
            (lastHoveredMesh.material as THREE.MeshPhysicalMaterial).emissive.setHex(0x000000);
          }
          lastHoveredMesh = hit;
          if (hit && "emissive" in hit.material) {
            (hit.material as THREE.MeshPhysicalMaterial).emissive.setHex(0x083344);
          }
        }
      } else {
        if (lastHoveredMesh && "emissive" in lastHoveredMesh.material) {
          (lastHoveredMesh.material as THREE.MeshPhysicalMaterial).emissive.setHex(0x000000);
          lastHoveredMesh = null;
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!container || !camera) return;
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes);

      if (intersects.length > 0 && intersects[0]) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit?.userData as { id: number; name: string; yield: string; status: string } | undefined;
        if (data) {
          setSelectedBuilding({
            id: data.id,
            name: data.name,
            yield: data.yield,
            status: data.status,
          });
          if (onBuildingSelect) {
            onBuildingSelect(data.id, data);
          }
        }

        // Pulse highlight effect on hit mesh
        if (hit && hit.material && "color" in hit.material) {
          const mat = hit.material as THREE.MeshPhysicalMaterial;
          const origColor = mat.color.getHex();
          mat.color.setHex(0x00f0ff);
          setTimeout(() => {
            mat.color.setHex(origColor);
          }, 600);
        }
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      cancelAnimationFrame(state.reqId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js memory cleanly
      scene.clear();
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
    };
  }, [onBuildingSelect]);

  return (
    <div
      ref={containerRef}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full min-h-[500px] overflow-hidden select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* 3D Stage Overlay Controls (Glassmorphic Floating HUD) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-xl shadow-xl">
          <button
            type="button"
            onClick={() => setViewMode("isometric")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "isometric"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Spatial Twin
          </button>
          <button
            type="button"
            onClick={() => setViewMode("street")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "street"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Street Flythrough
          </button>
          <button
            type="button"
            onClick={() => setViewMode("wireframe")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "wireframe"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Blueprint CAD
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl text-xs font-medium border backdrop-blur-xl transition-all ${
            autoRotate
              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
              : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
          }`}
          title={autoRotate ? "Pause Auto-Orbit" : "Resume Auto-Orbit"}
        >
          <svg
            className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`}
            style={{ animationDuration: "8s" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Interactive Selected Property Card (Floating in 3D HUD) */}
      {selectedBuilding && (
        <div className="absolute top-4 right-4 z-20 max-w-xs p-4 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {selectedBuilding.status}
              </span>
              <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                {selectedBuilding.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Projected Yield</span>
              <span className="text-cyan-400 font-extrabold text-sm">{selectedBuilding.yield}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Inspection Status</span>
              <span className="text-emerald-400 font-medium text-xs">Verified 3D Scan</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Spatial Watermark & Coordinate Indicator */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-3 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800/80">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          REAL-TIME 3D DIGITAL TWIN
        </span>
        <span className="hidden sm:inline-block px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800/80">
          PARALLAX: {isHovered ? "TRACKING CURSOR" : "ORBITAL CRUISE"}
        </span>
      </div>

      {/* Hint Badge */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-[11px] font-medium text-slate-400 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800/80 hidden sm:flex items-center gap-2">
        <span>Click any tower to inspect asset node</span>
        <span className="text-cyan-400">✦</span>
      </div>
    </div>
  );
}

export default SpatialStage3D;
