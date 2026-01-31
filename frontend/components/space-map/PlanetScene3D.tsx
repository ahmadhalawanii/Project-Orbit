"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SPACE_STAGES } from "@/lib/space-stages";
import type { StageId } from "@/lib/space-stages";

const PLANET_SPACING = 14;
const PLANET_RADIUS = 3;
const CAM_START_Z = 10;
const CAM_END_Z = -PLANET_SPACING + 8;

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
  transitionProgress: number;
  reducedMotion: boolean;
}

function Starfield() {
  const points = useRef<THREE.Points>(null);
  const count = 800;
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
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#e8e6e3"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function PlanetSphere({
  stageId,
  position,
  hasRing,
  hasAtmosphere,
}: {
  stageId: StageId;
  position: [number, number, number];
  hasRing?: boolean;
  hasAtmosphere?: boolean;
}) {
  const config = SPACE_STAGES.find((s) => s.id === stageId);
  const scene3d = config?.scene3d ?? { color: "#94a3b8", roughness: 0.8, metalness: 0 };
  const color = new THREE.Color(scene3d.color);
  const emissive = scene3d.emissive ? new THREE.Color(scene3d.emissive) : undefined;

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={scene3d.roughness ?? 0.8}
          metalness={scene3d.metalness ?? 0}
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

function SceneContent({
  currentStageIndex,
  transitionProgress,
  reducedMotion,
}: SceneContentProps) {
  const { camera } = useThree();

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam) return;

    if (reducedMotion || transitionProgress <= 0) {
      cam.position.set(0, 0, CAM_START_Z);
      cam.lookAt(0, 0, 0);
      return;
    }

    if (transitionProgress >= 1) {
      cam.position.set(0, 0, CAM_START_Z);
      cam.lookAt(0, 0, 0);
      return;
    }

    const t = easeInOutCubic(transitionProgress);
    const arc = arcOffset(transitionProgress);

    const fromZ = CAM_START_Z;
    const toZ = CAM_END_Z;
    const camZ = fromZ + (toZ - fromZ) * t;
    cam.position.set(0, 0, camZ);

    const lookZ = t < 0.5 ? 0 : -PLANET_SPACING;
    const lookAt = new THREE.Vector3(arc.yaw * 20, arc.pitch * 20, lookZ);
    cam.lookAt(lookAt);
  });

  const currentId = SPACE_STAGES[currentStageIndex]?.id as StageId | undefined;
  const nextId = SPACE_STAGES[currentStageIndex + 1]?.id as StageId | undefined;
  const nextNextId = SPACE_STAGES[currentStageIndex + 2]?.id as StageId | undefined;

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[20, 15, 20]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -5, 10]} intensity={0.3} />
      <Starfield />
      {currentId && (
        <PlanetSphere
          stageId={currentId}
          position={[0, 0, 0]}
          hasRing={SPACE_STAGES[currentStageIndex]?.scene3d?.ring}
          hasAtmosphere={SPACE_STAGES[currentStageIndex]?.scene3d?.atmosphere}
        />
      )}
      {nextId && (
        <PlanetSphere
          stageId={nextId}
          position={[0, 0, -PLANET_SPACING]}
          hasRing={SPACE_STAGES[currentStageIndex + 1]?.scene3d?.ring}
          hasAtmosphere={SPACE_STAGES[currentStageIndex + 1]?.scene3d?.atmosphere}
        />
      )}
      {nextNextId && (
        <PlanetSphere
          stageId={nextNextId}
          position={[0, 0, -PLANET_SPACING * 2]}
          hasRing={SPACE_STAGES[currentStageIndex + 2]?.scene3d?.ring}
          hasAtmosphere={SPACE_STAGES[currentStageIndex + 2]?.scene3d?.atmosphere}
        />
      )}
    </>
  );
}

export interface PlanetScene3DProps {
  currentStageIndex: number;
  transitionProgress: number;
  reducedMotion: boolean;
  className?: string;
}

export function PlanetScene3D({
  currentStageIndex,
  transitionProgress,
  reducedMotion,
  className,
}: PlanetScene3DProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: "#0a0a0f" }}>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, CAM_START_Z], fov: 50, near: 0.1, far: 500 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent
            currentStageIndex={currentStageIndex}
            transitionProgress={transitionProgress}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export { PLANET_SPACING, CAM_START_Z, CAM_END_Z, easeInOutCubic, arcOffset };
