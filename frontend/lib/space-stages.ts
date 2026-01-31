/** Single source of truth for mission stages: labels, copy, order. */

/** 3D scene params for planet stacking and materials */
export interface StageScene3D {
  /** Base color (hex or CSS color) */
  color: string;
  /** Roughness 0–1 */
  roughness?: number;
  /** Metalness 0–1 */
  metalness?: number;
  /** Slight emissive for glow */
  emissive?: string;
  /** Rim/atmosphere (e.g. Earth) */
  atmosphere?: boolean;
  /** Ring (Saturn) */
  ring?: boolean;
}

export interface StageConfig {
  id: string;
  name: string;
  /** Short label for stepper (e.g. "The Gate") */
  short: string;
  /** Full title "Planet — Phase" */
  phaseTitle: string;
  microcopy: string;
  order: number;
  /** For "Traveling to [label]…" during transition */
  travelLabel: string;
  /** 3D scene: material and lighting */
  scene3d?: StageScene3D;
}

export const SPACE_STAGES: readonly StageConfig[] = [
  {
    id: "pluto",
    name: "Pluto",
    short: "The Gate",
    phaseTitle: "Pluto — The Gate",
    microcopy: "Consent and ground rules before we begin.",
    order: 1,
    travelLabel: "Pluto",
    scene3d: { color: "#94a3b8", roughness: 0.9, metalness: 0 },
  },
  {
    id: "mercury",
    name: "Mercury",
    short: "Ignition",
    phaseTitle: "Mercury — Ignition",
    microcopy: "Start your story. Tell us what brought you here.",
    order: 2,
    travelLabel: "Mercury",
    scene3d: { color: "#f59e0b", roughness: 0.7, metalness: 0.1, emissive: "#fbbf24" },
  },
  {
    id: "asteroid_belt",
    name: "Asteroid Belt",
    short: "Evidence Field",
    phaseTitle: "Asteroid Belt — Evidence Field",
    microcopy: "Portfolio and artifacts. Add links and evidence.",
    order: 3,
    travelLabel: "Asteroid Belt",
    scene3d: { color: "#78716c", roughness: 0.95, metalness: 0 },
  },
  {
    id: "mars",
    name: "Mars",
    short: "The Trial",
    phaseTitle: "Mars — The Trial",
    microcopy: "Skills challenge. Show what you can do.",
    order: 4,
    travelLabel: "Mars",
    scene3d: { color: "#b91c1c", roughness: 0.85, metalness: 0 },
  },
  {
    id: "saturn",
    name: "Saturn",
    short: "Crew Ring",
    phaseTitle: "Saturn — Crew Ring",
    microcopy: "Collaboration. Work with the crew.",
    order: 5,
    travelLabel: "Saturn",
    scene3d: { color: "#fcd34d", roughness: 0.6, metalness: 0, ring: true },
  },
  {
    id: "earth",
    name: "Earth",
    short: "Landing",
    phaseTitle: "Earth — Landing",
    microcopy: "Review and submit. Your outcome awaits.",
    order: 6,
    travelLabel: "Earth",
    scene3d: { color: "#0ea5e9", roughness: 0.4, metalness: 0, atmosphere: true },
  },
];

export type StageId = (typeof SPACE_STAGES)[number]["id"];

export function getStageOrder(stageId: string): number {
  const s = SPACE_STAGES.find((x) => x.id === stageId);
  return s ? s.order : 0;
}

export function getNextStage(currentStageId: string): StageId | null {
  const idx = SPACE_STAGES.findIndex((x) => x.id === currentStageId);
  if (idx < 0 || idx >= SPACE_STAGES.length - 1) return null;
  return SPACE_STAGES[idx + 1].id as StageId;
}

export function getPrevStage(currentStageId: string): StageId | null {
  const idx = SPACE_STAGES.findIndex((x) => x.id === currentStageId);
  if (idx <= 0) return null;
  return SPACE_STAGES[idx - 1].id as StageId;
}

export function getStageById(stageId: string): StageConfig | undefined {
  return SPACE_STAGES.find((x) => x.id === stageId);
}

/** Map legacy stage ids to new ids so existing data still works */
const LEGACY_STAGE_MAP: Record<string, StageId> = {
  launchpad: "mercury",
  spacewalk: "mars",
  docking_station: "saturn",
  mission_control: "earth",
};

export function normalizeStageId(stageId: string): StageId {
  return (LEGACY_STAGE_MAP[stageId] ?? stageId) as StageId;
}
