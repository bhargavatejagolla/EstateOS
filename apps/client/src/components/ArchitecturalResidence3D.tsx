import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { Building2, Key, Shield, Sparkles, CheckCircle2 } from "lucide-react";

interface ArchitecturalResidence3DProps {
  role: "OWNER" | "RENTER";
  className?: string;
}

export function ArchitecturalResidence3D({
  role,
  className = "",
}: ArchitecturalResidence3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef(role);
  roleRef.current = role;

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    reqId: 0,
    towerGroup: null as THREE.Group | null,
    tenantHighlightMesh: null as THREE.Mesh | null,
    keyMesh: null as THREE.Mesh | null,
    beaconGroup: null as THREE.Group | null,
    pointerX: 0,
    pointerY: 0,
    targetRotY: 0.4,
    targetRotX: 0.15,
    currentRotY: 0.4,
    currentRotX: 0.15,
  });

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    stateRef.current.pointerX = nx;
    stateRef.current.pointerY = ny;
    stateRef.current.targetRotY = 0.4 + nx * 0.55;
    stateRef.current.targetRotX = 0.15 + ny * 0.25;
  }, []);

  const handlePointerLeave = useCallback(() => {
    stateRef.current.targetRotY = 0.4;
    stateRef.current.targetRotX = 0.15;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const state = stateRef.current;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    // 1. Scene
    const scene = new THREE.Scene();
    state.scene = scene;

    // 2. Camera (Isometric Architectural Perspective)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 1.2, 0);
    state.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    state.renderer = renderer;

    container.appendChild(renderer.domElement);

    // 4. Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x06b6d4, 2.5); // Cool cyan architectural rim
    sunLight.position.set(12, 16, 10);
    scene.add(sunLight);

    const warmLight = new THREE.DirectionalLight(0xf59e0b, 1.5); // Warm residential glow
    warmLight.position.set(-8, 6, -8);
    scene.add(warmLight);

    const towerGroup = new THREE.Group();
    scene.add(towerGroup);
    state.towerGroup = towerGroup;

    // ----------------------------------------------------
    // 5. Build Architectural Modern Residence Tower
    // ----------------------------------------------------
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // Ground Platform with Architectural Grid
    const groundGeo = new THREE.BoxGeometry(6.5, 0.3, 6.5);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -2.2;
    towerGroup.add(groundMesh);
    geometriesToDispose.push(groundGeo);
    materialsToDispose.push(groundMat);

    // Subtle Ground Grid lines
    const gridHelper = new THREE.GridHelper(6.5, 12, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2.04;
    towerGroup.add(gridHelper);

    // Modern Podium / Double-Height Lobby (Floors 1-2)
    const lobbyGeo = new THREE.BoxGeometry(4.0, 1.0, 4.0);
    const lobbyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.8,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
    });
    const lobbyMesh = new THREE.Mesh(lobbyGeo, lobbyMat);
    lobbyMesh.position.y = -1.5;
    towerGroup.add(lobbyMesh);
    geometriesToDispose.push(lobbyGeo);
    materialsToDispose.push(lobbyMat);

    // Interior Lobby Core
    const lobbyCoreGeo = new THREE.BoxGeometry(2.2, 0.9, 2.2);
    const lobbyCoreMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const lobbyCoreMesh = new THREE.Mesh(lobbyCoreGeo, lobbyCoreMat);
    lobbyCoreMesh.position.y = -1.5;
    towerGroup.add(lobbyCoreMesh);
    geometriesToDispose.push(lobbyCoreGeo);
    materialsToDispose.push(lobbyCoreMat);

    // Residential Tower Slabs & Glass Floors (Floors 3 to 10)
    const floorCount = 8;
    const floorHeight = 0.48;
    const towerWidth = 3.2;

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    materialsToDispose.push(slabMat);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.75,
      opacity: 0.7,
      transparent: true,
      roughness: 0.15,
      metalness: 0.1,
    });
    materialsToDispose.push(glassMat);

    const interiorWarmMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
    });
    materialsToDispose.push(interiorWarmMat);

    // Specific highlight material for the Tenant Suite
    const tenantHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    materialsToDispose.push(tenantHighlightMat);

    let tenantMesh: THREE.Mesh | null = null;

    for (let i = 0; i < floorCount; i++) {
      const y = -0.8 + i * floorHeight;

      // Concrete / Steel Floor Slab
      const slabGeo = new THREE.BoxGeometry(towerWidth + 0.25, 0.08, towerWidth + 0.25);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = y;
      towerGroup.add(slab);
      geometriesToDispose.push(slabGeo);

      // Floor Glass Enclosure
      const glassGeo = new THREE.BoxGeometry(towerWidth, floorHeight - 0.08, towerWidth);
      const isTenantFloor = i === 5; // Floor 7: Penthouse Suite

      const floorMesh = new THREE.Mesh(
        glassGeo,
        isTenantFloor ? tenantHighlightMat : glassMat
      );
      floorMesh.position.y = y + floorHeight * 0.5;
      towerGroup.add(floorMesh);
      geometriesToDispose.push(glassGeo);

      if (isTenantFloor) {
        tenantMesh = floorMesh;
      }

      // Interior Core Room with warm light
      const roomGeo = new THREE.BoxGeometry(towerWidth * 0.65, floorHeight - 0.12, towerWidth * 0.65);
      const room = new THREE.Mesh(roomGeo, interiorWarmMat);
      room.position.y = y + floorHeight * 0.5;
      towerGroup.add(room);
      geometriesToDispose.push(roomGeo);

      // Architectural Balcony Projection on alternate floors
      if (i % 2 === 0) {
        const balconyGeo = new THREE.BoxGeometry(0.8, 0.06, 1.4);
        const balcony = new THREE.Mesh(balconyGeo, slabMat);
        balcony.position.set(towerWidth * 0.5 + 0.3, y + 0.04, 0);
        towerGroup.add(balcony);
        geometriesToDispose.push(balconyGeo);
      }
    }

    state.tenantHighlightMesh = tenantMesh;

    // Rooftop Sky Terrace & Infinity Pool (Top Floor)
    const roofY = -0.8 + floorCount * floorHeight;
    const roofGeo = new THREE.BoxGeometry(towerWidth + 0.4, 0.15, towerWidth + 0.4);
    const roofMesh = new THREE.Mesh(roofGeo, slabMat);
    roofMesh.position.y = roofY;
    towerGroup.add(roofMesh);
    geometriesToDispose.push(roofGeo);

    // Glowing Cyan Infinity Pool on Roof
    const poolGeo = new THREE.BoxGeometry(1.4, 0.06, 1.4);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.65,
    });
    const poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.position.set(0.6, roofY + 0.1, 0.6);
    towerGroup.add(poolMesh);
    geometriesToDispose.push(poolGeo);
    materialsToDispose.push(poolMat);

    // Rooftop Pergola Canopy
    const pergolaGeo = new THREE.BoxGeometry(1.2, 0.6, 1.2);
    const pergolaMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const pergolaMesh = new THREE.Mesh(pergolaGeo, pergolaMat);
    pergolaMesh.position.set(-0.6, roofY + 0.35, -0.6);
    towerGroup.add(pergolaMesh);
    geometriesToDispose.push(pergolaGeo);
    materialsToDispose.push(pergolaMat);

    // ----------------------------------------------------
    // 6. Interactive Floating 3D Smart Key for Tenant
    // ----------------------------------------------------
    const keyGroup = new THREE.Group();
    const keyGeo = new THREE.OctahedronGeometry(0.35, 0);
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      metalness: 0.8,
      roughness: 0.2,
    });
    const keyMesh = new THREE.Mesh(keyGeo, keyMat);
    keyGroup.add(keyMesh);
    geometriesToDispose.push(keyGeo);
    materialsToDispose.push(keyMat);

    // Orbiting Key Ring
    const keyRingGeo = new THREE.TorusGeometry(0.6, 0.02, 16, 64);
    const keyRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.7 });
    const keyRingMesh = new THREE.Mesh(keyRingGeo, keyRingMat);
    keyRingMesh.rotation.x = Math.PI / 3;
    keyGroup.add(keyRingMesh);
    geometriesToDispose.push(keyRingGeo);
    materialsToDispose.push(keyRingMat);

    keyGroup.position.set(2.4, -0.8 + 5 * floorHeight + 0.24, 1.8);
    towerGroup.add(keyGroup);
    state.keyMesh = keyMesh;

    // ----------------------------------------------------
    // 7. Rooftop Escrow Asset Beacon for Owner
    // ----------------------------------------------------
    const beaconGroup = new THREE.Group();
    const beaconPinGeo = new THREE.ConeGeometry(0.2, 0.7, 8);
    const beaconPinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });
    const beaconPin = new THREE.Mesh(beaconPinGeo, beaconPinMat);
    beaconPin.rotation.x = Math.PI;
    beaconPin.position.y = roofY + 0.8;
    beaconGroup.add(beaconPin);
    geometriesToDispose.push(beaconPinGeo);
    materialsToDispose.push(beaconPinMat);

    // Orbiting Golden Escrow Ring
    const beaconRingGeo = new THREE.TorusGeometry(0.65, 0.025, 16, 64);
    const beaconRingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 });
    const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
    beaconRing.position.y = roofY + 0.8;
    beaconRing.rotation.x = Math.PI / 4;
    beaconGroup.add(beaconRing);
    geometriesToDispose.push(beaconRingGeo);
    materialsToDispose.push(beaconRingMat);

    towerGroup.add(beaconGroup);
    state.beaconGroup = beaconGroup;

    // ----------------------------------------------------
    // 8. Responsive Resize Observer
    // ----------------------------------------------------
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && camera && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // ----------------------------------------------------
    // 9. Animation Loop
    // ----------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      state.reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera / building rotation
      state.currentRotY += (state.targetRotY - state.currentRotY) * 0.05;
      state.currentRotX += (state.targetRotX - state.currentRotX) * 0.05;

      towerGroup.rotation.y = state.currentRotY + Math.sin(elapsed * 0.25) * 0.08;
      towerGroup.rotation.x = state.currentRotX;

      const isOwnerActive = roleRef.current === "OWNER";

      // Owner Mode: Beacon active, key inactive
      if (beaconGroup) {
        beaconGroup.visible = isOwnerActive;
        beaconGroup.rotation.y = elapsed * 1.2;
        beaconPin.position.y = roofY + 0.8 + Math.sin(elapsed * 2) * 0.08;
      }

      // Tenant Mode: Key active, tenant floor pulsing
      if (keyGroup && keyMesh) {
        keyGroup.visible = !isOwnerActive;
        keyMesh.rotation.y = elapsed * 1.5;
        keyMesh.rotation.x = elapsed * 0.8;
        keyRingMesh.rotation.z = elapsed * 1.0;
        keyGroup.position.y = -0.8 + 5 * floorHeight + 0.24 + Math.sin(elapsed * 2.5) * 0.06;
      }

      if (tenantHighlightMat) {
        tenantHighlightMat.emissiveIntensity = isOwnerActive ? 0.2 : 0.6 + Math.sin(elapsed * 3) * 0.3;
      }

      renderer.render(scene, camera);
    };

    state.reqId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(state.reqId);
      resizeObserver.disconnect();

      for (const geo of geometriesToDispose) geo.dispose();
      for (const mat of materialsToDispose) mat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  const isOwner = role === "OWNER";

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-[240px] sm:h-[270px] rounded-2xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing border border-white/10 bg-gradient-to-b from-slate-950/90 via-black to-slate-950/90 shadow-xl backdrop-blur-xl group select-none ${className}`}
    >
      {/* Background Soft Glow */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-700 blur-3xl opacity-25 ${
          isOwner
            ? "bg-gradient-to-tr from-cyan-500/30 to-amber-500/20"
            : "bg-gradient-to-tr from-emerald-500/30 to-purple-500/20"
        }`}
      />

      {/* Top Header Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-md">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOwner ? "bg-cyan-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isOwner ? "bg-cyan-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="text-[10px] font-mono tracking-wider text-slate-300 font-bold uppercase">
            {isOwner ? "Asset Node: The Obsidian Tower" : "Smart Residence: Penthouse 14B"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[9px] font-mono text-cyan-300 backdrop-blur-md">
          <Building2 className="h-3 w-3 text-cyan-400" />
          <span>3D ARCHITECTURAL TWIN</span>
        </div>
      </div>

      {/* Bottom Live Metrics */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {isOwner ? (
          <>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono backdrop-blur-md">
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>48 SMART UNITS • ESCROW VERIFIED</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 border border-amber-500/30 text-amber-300 text-[10px] font-mono backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>11.4% APY YIELD</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono backdrop-blur-md">
              <Key className="h-3 w-3 text-emerald-400" />
              <span>SUITE 14B • 1-CLICK SMART KEY</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 border border-purple-500/30 text-purple-300 text-[10px] font-mono backdrop-blur-md">
              <CheckCircle2 className="h-3 w-3 text-purple-400" />
              <span>ZERO BROKERAGE HANDSHAKE</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
