import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { Shield, Sparkles, Building2, Key, Zap, Cpu } from "lucide-react";

interface QuantumPersonaCoreProps {
  role: "OWNER" | "RENTER";
  className?: string;
}

export function QuantumPersonaCore({
  role,
  className = "",
}: QuantumPersonaCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef(role);
  roleRef.current = role;

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    reqId: 0,
    ownerGroup: null as THREE.Group | null,
    renterGroup: null as THREE.Group | null,
    ringsOwner: [] as THREE.Mesh[],
    ringsRenter: [] as THREE.Mesh[],
    particlesOwner: null as THREE.Points | null,
    particlesRenter: null as THREE.Points | null,
    pointerX: 0,
    pointerY: 0,
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
  });

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    stateRef.current.pointerX = nx;
    stateRef.current.pointerY = ny;
    stateRef.current.targetRotY = nx * 0.45;
    stateRef.current.targetRotX = ny * 0.35;
  }, []);

  const handlePointerLeave = useCallback(() => {
    stateRef.current.targetRotX = 0;
    stateRef.current.targetRotY = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const state = stateRef.current;

    // Canvas WebGL initialization
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    state.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);
    state.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    state.renderer = renderer;

    container.appendChild(renderer.domElement);

    // Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 3.5); // Cyan
    dirLight1.position.set(6, 8, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 2.5); // Emerald
    dirLight2.position.set(-6, -6, 6);
    scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0x38bdf8, 4, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // ----------------------------------------------------
    // 1. OWNER MESH GROUP (Crystalline Skyscraper Spire)
    // ----------------------------------------------------
    const ownerGroup = new THREE.Group();
    ownerGroup.scale.set(roleRef.current === "OWNER" ? 1 : 0.001, roleRef.current === "OWNER" ? 1 : 0.001, roleRef.current === "OWNER" ? 1 : 0.001);
    scene.add(ownerGroup);
    state.ownerGroup = ownerGroup;

    // Central Spire Crystal
    const spireGeo = new THREE.CylinderGeometry(0.1, 1.4, 4.4, 6);
    const spireMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      metalness: 0.2,
      roughness: 0.15,
      transmission: 0.85,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    const spireMesh = new THREE.Mesh(spireGeo, spireMat);
    ownerGroup.add(spireMesh);

    // Inner Wireframe Spire Matrix
    const wireSpireGeo = new THREE.CylinderGeometry(0.12, 1.45, 4.45, 6);
    const wireSpireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber gold energy skeleton
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const wireSpireMesh = new THREE.Mesh(wireSpireGeo, wireSpireMat);
    ownerGroup.add(wireSpireMesh);

    // Base Tier Flange
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.1, 0.6, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -2.4;
    ownerGroup.add(baseMesh);

    // Orbiting Spire Rings
    const ringsOwner: THREE.Mesh[] = [];
    const ring1Geo = new THREE.TorusGeometry(2.6, 0.035, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    ownerGroup.add(ring1);
    ringsOwner.push(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.3, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.75 }); // Gold telemetry ring
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    ownerGroup.add(ring2);
    ringsOwner.push(ring2);

    // Floating data nodes on Owner ring
    const nodeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
    for (let i = 0; i < 4; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / 4) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 3.3, 0, Math.sin(angle) * 3.3);
      ring2.add(node);
    }
    state.ringsOwner = ringsOwner;

    // Ascending Liquid Yield Particles for Owner
    const partCountOwner = 180;
    const partOwnerGeo = new THREE.BufferGeometry();
    const partOwnerPositions = new Float32Array(partCountOwner * 3);
    const partOwnerVelocities: number[] = [];

    for (let i = 0; i < partCountOwner; i++) {
      partOwnerPositions[i * 3] = (Math.random() - 0.5) * 3.5;
      partOwnerPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      partOwnerPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      partOwnerVelocities.push(0.015 + Math.random() * 0.025);
    }
    partOwnerGeo.setAttribute("position", new THREE.BufferAttribute(partOwnerPositions, 3));
    const partOwnerMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });
    const particlesOwner = new THREE.Points(partOwnerGeo, partOwnerMat);
    ownerGroup.add(particlesOwner);
    state.particlesOwner = particlesOwner;

    // ----------------------------------------------------
    // 2. RENTER MESH GROUP (Smart Shield Hypercube)
    // ----------------------------------------------------
    const renterGroup = new THREE.Group();
    renterGroup.scale.set(roleRef.current === "RENTER" ? 1 : 0.001, roleRef.current === "RENTER" ? 1 : 0.001, roleRef.current === "RENTER" ? 1 : 0.001);
    scene.add(renterGroup);
    state.renterGroup = renterGroup;

    // Outer Faceted Crystal Box
    const outerCubeGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
    const outerCubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.7,
      transparent: true,
      opacity: 0.6,
    });
    const outerCube = new THREE.Mesh(outerCubeGeo, outerCubeMat);
    renterGroup.add(outerCube);

    // Inner Glowing Wireframe Cube
    const innerCubeGeo = new THREE.BoxGeometry(1.7, 1.7, 1.7);
    const innerCubeMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc, // Cyber violet
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const innerCube = new THREE.Mesh(innerCubeGeo, innerCubeMat);
    renterGroup.add(innerCube);

    // Floating Central Octahedron Core Key
    const octaGeo = new THREE.OctahedronGeometry(0.85, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      metalness: 0.8,
      roughness: 0.2,
    });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    renterGroup.add(octaMesh);

    // Orbiting Shield Rings for Renter
    const ringsRenter: THREE.Mesh[] = [];
    const rRing1Geo = new THREE.TorusGeometry(3.0, 0.04, 16, 100);
    const rRing1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
    const rRing1 = new THREE.Mesh(rRing1Geo, rRing1Mat);
    rRing1.rotation.x = Math.PI / 4;
    renterGroup.add(rRing1);
    ringsRenter.push(rRing1);

    const rRing2Geo = new THREE.TorusGeometry(3.6, 0.03, 16, 100);
    const rRing2Mat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.75 });
    const rRing2 = new THREE.Mesh(rRing2Geo, rRing2Mat);
    rRing2.rotation.y = Math.PI / 3;
    rRing2.rotation.z = Math.PI / 5;
    renterGroup.add(rRing2);
    ringsRenter.push(rRing2);

    state.ringsRenter = ringsRenter;

    // Shield Swarm Particles for Renter
    const partCountRenter = 220;
    const partRenterGeo = new THREE.BufferGeometry();
    const partRenterPositions = new Float32Array(partCountRenter * 3);
    for (let i = 0; i < partCountRenter; i++) {
      const radius = 2.4 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      partRenterPositions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
      partRenterPositions[i * 3 + 1] = radius * Math.sin(phi);
      partRenterPositions[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }
    partRenterGeo.setAttribute("position", new THREE.BufferAttribute(partRenterPositions, 3));
    const partRenterMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
    });
    const particlesRenter = new THREE.Points(partRenterGeo, partRenterMat);
    renterGroup.add(particlesRenter);
    state.particlesRenter = particlesRenter;

    // ----------------------------------------------------
    // Responsive Resize Observer
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
    // Animation Loop
    // ----------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      state.reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera / group parallax
      state.currentRotX += (state.targetRotX - state.currentRotX) * 0.06;
      state.currentRotY += (state.targetRotY - state.currentRotY) * 0.06;

      // Morphing interpolation between OWNER and RENTER states
      const isOwnerActive = roleRef.current === "OWNER";
      const targetOwnerScale = isOwnerActive ? 1.0 : 0.0001;
      const targetRenterScale = isOwnerActive ? 0.0001 : 1.0;

      ownerGroup.scale.lerp(new THREE.Vector3(targetOwnerScale, targetOwnerScale, targetOwnerScale), 0.09);
      renterGroup.scale.lerp(new THREE.Vector3(targetRenterScale, targetRenterScale, targetRenterScale), 0.09);

      // Rotate Spire & Rings (Owner)
      if (ownerGroup.scale.x > 0.05) {
        ownerGroup.rotation.y = elapsed * 0.4 + state.currentRotY;
        ownerGroup.rotation.x = state.currentRotX * 0.5;
        spireMesh.rotation.y = elapsed * 0.3;
        wireSpireMesh.rotation.y = -elapsed * 0.4;
        ring1.rotation.z += 0.015;
        ring2.rotation.y -= 0.01;

        // Ascend particles
        const posAttr = partOwnerGeo.getAttribute("position") as THREE.BufferAttribute | undefined;
        if (posAttr && posAttr.array) {
          const positions = posAttr.array as Float32Array;
          for (let i = 0; i < partCountOwner; i++) {
            const vy = partOwnerVelocities[i] ?? 0.02;
            positions[i * 3 + 1] = (positions[i * 3 + 1] ?? 0) + vy;
            if ((positions[i * 3 + 1] ?? 0) > 2.8) {
              positions[i * 3 + 1] = -2.4;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // Rotate Hypercube & Rings (Renter)
      if (renterGroup.scale.x > 0.05) {
        renterGroup.rotation.y = elapsed * 0.35 + state.currentRotY;
        renterGroup.rotation.x = state.currentRotX * 0.6;
        outerCube.rotation.x = elapsed * 0.4;
        outerCube.rotation.y = elapsed * 0.5;
        innerCube.rotation.x = -elapsed * 0.5;
        innerCube.rotation.z = elapsed * 0.3;
        octaMesh.rotation.y = elapsed * 0.8;
        rRing1.rotation.z += 0.012;
        rRing2.rotation.x -= 0.014;
        particlesRenter.rotation.y = elapsed * 0.15;
      }

      // Dynamic light pulse
      coreLight.intensity = 3.5 + Math.sin(elapsed * 3) * 1.0;

      renderer.render(scene, camera);
    };

    state.reqId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(state.reqId);
      resizeObserver.disconnect();

      // Dispose Geometries & Materials
      spireGeo.dispose();
      spireMat.dispose();
      wireSpireGeo.dispose();
      wireSpireMat.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      partOwnerGeo.dispose();
      partOwnerMat.dispose();

      outerCubeGeo.dispose();
      outerCubeMat.dispose();
      innerCubeGeo.dispose();
      innerCubeMat.dispose();
      octaGeo.dispose();
      octaMat.dispose();
      rRing1Geo.dispose();
      rRing1Mat.dispose();
      rRing2Geo.dispose();
      rRing2Mat.dispose();
      partRenterGeo.dispose();
      partRenterMat.dispose();

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
      className={`relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing border border-white/10 bg-radial from-slate-950/80 via-black to-black shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl group select-none ${className}`}
    >
      {/* Dynamic Ambient Glow Behind Core */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-700 blur-[80px] opacity-35 ${
          isOwner
            ? "bg-radial from-cyan-500/40 via-amber-500/20 to-transparent"
            : "bg-radial from-emerald-500/40 via-purple-500/20 to-transparent"
        }`}
      />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-lg">
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
          <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase">
            {isOwner ? "Asset Operator Spire" : "Smart Resident Core"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-400">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>3D TELEMETRY</span>
        </div>
      </div>

      {/* Bottom Floating Telemetry Pills */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {isOwner ? (
          <>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono shadow-md shadow-cyan-500/10 backdrop-blur-md">
              <Building2 className="h-3 w-3 text-cyan-400" />
              <span>ESCROW PROTOCOL ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-amber-500/30 text-amber-300 text-[10px] font-mono shadow-md shadow-amber-500/10 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>PROJECTED YIELD: 14.8% APY</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono shadow-md shadow-emerald-500/10 backdrop-blur-md">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>ZERO-BROKERAGE SHIELD</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-purple-500/30 text-purple-300 text-[10px] font-mono shadow-md shadow-purple-500/10 backdrop-blur-md">
              <Key className="h-3 w-3 text-purple-400" />
              <span>INSTANT DIGITAL LEASE</span>
            </div>
          </>
        )}
      </div>

      {/* Center Subtle Grid Rings overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
        <div className="w-56 h-56 rounded-full border border-dashed border-cyan-400/40 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-72 h-72 rounded-full border border-dotted border-white/20 animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Interactive Helper Text */}
      <div className="absolute bottom-12 text-[9px] font-mono uppercase tracking-widest text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
        <Zap className="h-2.5 w-2.5 text-cyan-400" />
        <span>Drag / Hover to orbit core</span>
      </div>
    </div>
  );
}
