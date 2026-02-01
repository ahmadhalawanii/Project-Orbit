"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SPACE_STAGES } from "@/lib/space-stages";
import type { StageId } from "@/lib/space-stages";

const PLANET_SPACING = 14;
const PLANET_RADIUS = 3;
const CAM_START_Z = 10;
/** Distance in front of planet center when idle/transition end (clear view of planet, not clipping). */
const PLANET_VIEW_DISTANCE = 8;
const CAM_END_Z = -PLANET_SPACING + 8; // fallback when not transitioning

/** Ease-in-out cubic */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Arc offset: slight yaw/pitch when passing the limb (0 at 0 and 1, peak ~0.15 at 0.5) */
function arcOffset(progress: number): { yaw: number; pitch: number } {
  const peak = 0.5;
  const spread = 0.25;
  const x = (progress - peak) / spread;
  const gauss = Math.exp(-x * x);
  return { yaw: gauss * 0.12, pitch: gauss * -0.08 };
}

interface SceneContentProps {
  currentStageIndex: number;
  toStageIndex: number;
  transitionProgress: number;
  reducedMotion: boolean;
}

const SKYBOX_RADIUS = 400;
const GALAXY_STARS_URL = "/space/galaxy-stars.png";

/** Creates soft round glow texture for stars (glowing orbs, not square specs). */
function useStarGlowTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.9)");
    g.addColorStop(0.5, "rgba(255,252,240,0.4)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/** Dark space feel: natural exposure so galaxy and stars read, not blown out. */
function SceneBrightness() {
  const { gl } = useThree();
  useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
  }, [gl]);
  return null;
}

/** Galaxy background: image on skybox. Use 2K+ image (e.g. 2048×1365) for crisp full-screen. */
function GalaxySkybox() {
  const { gl } = useThree();
  const map = useTexture(GALAXY_STARS_URL);
  useMemo(() => {
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 16;
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.generateMipmaps = false;
  }, [map, gl]);
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[SKYBOX_RADIUS, 128, 128]} />
      <meshBasicMaterial
        map={map}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/** Dense procedural starfield: loads of stars so the sky feels full. */
function Starfield() {
  const count = 8000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 50 + Math.random() * 150;
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        color="#ffffff"
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Brighter, larger “hero” stars so stars are clearly noticeable. */
function BrightStars() {
  const count = 600;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 70 + Math.random() * 130;
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.7}
        color="#fffef0"
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** One layer of many stars with soft glow (not specs). */
function StarLayer({
  count,
  size,
  color,
  radiusMin,
  radiusMax,
  starTexture,
}: {
  count: number;
  size: number;
  color: string;
  radiusMin: number;
  radiusMax: number;
  starTexture: THREE.CanvasTexture | null;
}) {
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = radiusMin + Math.random() * (radiusMax - radiusMin);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, [count, radiusMin, radiusMax]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        size={size}
        color={color}
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Stars only: galaxy + stars, space feel – no rays, no blow-out. */
function StarfieldLayers() {
  const starTexture = useStarGlowTexture();
  return (
    <>
      <StarLayer count={5000} size={0.22} color="#e8e6e3" radiusMin={50} radiusMax={180} starTexture={starTexture} />
      <StarLayer count={1200} size={0.5} color="#fffef8" radiusMin={60} radiusMax={160} starTexture={starTexture} />
    </>
  );
}

/** Fallback when galaxy texture fails to load */
function StarfieldOnly() {
  const count = 3500;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 200;
      p[i * 3 + 1] = (Math.random() - 0.5) * 200;
      p[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return p;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#e8e6e3" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/** Planet as a simple colored 3D sphere (no textures) – reliable and always visible. */
function PlanetSphere({
  stageId,
  position,
  rotation,
  hasRing,
  hasAtmosphere,
}: {
  stageId: StageId;
  position: [number, number, number];
  rotation: [number, number, number];
  hasRing?: boolean;
  hasAtmosphere?: boolean;
}) {
  const config = SPACE_STAGES.find((s) => s.id === stageId);
  const scene3d = config?.scene3d ?? { color: "#94a3b8", roughness: 0.8, metalness: 0 };
  const color = new THREE.Color(scene3d.color);
  const emissive = scene3d.emissive ? new THREE.Color(scene3d.emissive) : undefined;
  const roughness = scene3d.roughness ?? 0.8;
  const metalness = scene3d.metalness ?? 0;

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          emissive={emissive}
          emissiveIntensity={emissive ? 0.15 : 0}
          envMapIntensity={0.3}
        />
      </mesh>
      {hasAtmosphere && (
        <mesh>
          <sphereGeometry args={[PLANET_RADIUS * 1.02, 32, 32]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[PLANET_RADIUS * 1.4, PLANET_RADIUS * 2.2, 64]} />
          <meshBasicMaterial
            color="#fcd34d"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

/** Compute world position for planet at stack index (0 = current, 1 = next, …) using POV. */
function getPlanetPosition(stageIndex: number): [number, number, number] {
  const config = SPACE_STAGES[stageIndex];
  const pov = config?.scene3d?.pov;
  const baseZ = -stageIndex * PLANET_SPACING;
  if (!pov) return [0, 0, baseZ];
  return [pov.positionOffset[0], pov.positionOffset[1], baseZ + pov.positionOffset[2]];
}

/** Rotation for planet at stageIndex from POV, or zero. */
function getPlanetRotation(stageIndex: number): [number, number, number] {
  const config = SPACE_STAGES[stageIndex];
  const pov = config?.scene3d?.pov;
  return pov?.rotation ?? [0, 0, 0];
}

function SceneContent({
  currentStageIndex,
  toStageIndex,
  transitionProgress,
  reducedMotion,
}: SceneContentProps) {
  const { camera } = useThree();
  const isTransitioning = transitionProgress > 0 && transitionProgress < 1;
  const isBackward = toStageIndex < currentStageIndex;

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam) return;

    const currentPos = getPlanetPosition(currentStageIndex);
    const nextPos = getPlanetPosition(toStageIndex);

    const farZ = CAM_START_Z;
    const closeZ = nextPos[2] + PLANET_VIEW_DISTANCE;
    /** When idle or done, camera sits in front of the current planet so that planet fills the view (not Pluto). */
    const idleCamZ = currentPos[2] + PLANET_VIEW_DISTANCE;
    const doneCamZ = nextPos[2] + PLANET_VIEW_DISTANCE;

    if (reducedMotion || transitionProgress <= 0) {
      cam.position.set(0, 0, idleCamZ);
      cam.lookAt(currentPos[0], currentPos[1], currentPos[2]);
      return;
    }

    if (transitionProgress >= 1) {
      cam.position.set(0, 0, doneCamZ);
      cam.lookAt(nextPos[0], nextPos[1], nextPos[2]);
      return;
    }

    const t = easeInOutCubic(transitionProgress);
    const arc = arcOffset(transitionProgress);

    /** Start from current planet's close position, end at next planet's close position (one planet hop). */
    const fromZ = currentPos[2] + PLANET_VIEW_DISTANCE;
    const toZ = nextPos[2] + PLANET_VIEW_DISTANCE;
    const camZ = isBackward
      ? fromZ + (toZ - fromZ) * (1 - t)
      : fromZ + (toZ - fromZ) * t;
    cam.position.set(0, 0, camZ);

    const lookX = currentPos[0] + (nextPos[0] - currentPos[0]) * t + arc.yaw * 20;
    const lookY = currentPos[1] + (nextPos[1] - currentPos[1]) * t + arc.pitch * 20;
    const lookZ = currentPos[2] + (nextPos[2] - currentPos[2]) * t;
    cam.lookAt(lookX, lookY, lookZ);
  });

  return (
    <>
      <SceneBrightness />
      <Suspense fallback={<StarfieldOnly />}>
        <GalaxySkybox />
      </Suspense>
      <StarfieldLayers />
      <ambientLight intensity={0.25} />
      <directionalLight position={[20, 15, 20]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -5, 10]} intensity={0.3} />
      {SPACE_STAGES.map((stage, index) => (
        <PlanetSphere
          key={stage.id}
          stageId={stage.id as StageId}
          position={getPlanetPosition(index)}
          rotation={getPlanetRotation(index)}
          hasRing={stage.scene3d?.ring}
          hasAtmosphere={stage.scene3d?.atmosphere}
        />
      ))}
    </>
  );
}

export interface PlanetScene3DProps {
  currentStageIndex: number;
  toStageIndex: number;
  transitionProgress: number;
  reducedMotion: boolean;
  className?: string;
}

export function PlanetScene3D({
  currentStageIndex,
  toStageIndex,
  transitionProgress,
  reducedMotion,
  className,
}: PlanetScene3DProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: "#0a0a0f" }}>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, CAM_START_Z], fov: 50, near: 0.1, far: 500 }}
        dpr={[2, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent
            currentStageIndex={currentStageIndex}
            toStageIndex={toStageIndex}
            transitionProgress={transitionProgress}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export { PLANET_SPACING, CAM_START_Z, CAM_END_Z, easeInOutCubic, arcOffset };
