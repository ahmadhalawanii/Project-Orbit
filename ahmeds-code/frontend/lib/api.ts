const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface MissionPack {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  schema_json: Record<string, unknown>;
  is_active: boolean;
}

export async function getMissionPacks() {
  return request<MissionPack[]>("/mission-packs");
}

export async function demoLogin(email: string, role: "applicant" | "recruiter") {
  return request<{ token: string; user_id: string; email: string; role: string }>(
    "/auth/demo-login",
    { method: "POST", body: JSON.stringify({ email, role }) }
  );
}

export interface Applicant {
  id: string;
  user_id: string;
  display_name: string | null;
}

export async function createApplicant(userId: string, displayName?: string) {
  return request<Applicant>("/applicants/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, display_name: displayName }),
  });
}

export async function getApplicantByUser(userId: string) {
  return request<Applicant>(`/applicants/by-user/${userId}`);
}

export interface Application {
  id: string;
  applicant_id: string;
  mission_pack_id: string;
  status: string;
  current_stage: string;
  role_title?: string | null;
}

export async function createApplication(
  applicantId: string,
  missionPackId: string,
  roleTitle?: string
) {
  return request<Application>("/applications/", {
    method: "POST",
    body: JSON.stringify({
      applicant_id: applicantId,
      mission_pack_id: missionPackId,
      role_title: roleTitle,
    }),
  });
}

export interface ApplicationListItem {
  id: string;
  applicant_id: string;
  mission_pack_id: string;
  status: string;
  current_stage: string;
  role_title: string | null;
  applicant_email: string | null;
}

export async function listApplications() {
  return request<ApplicationListItem[]>("/applications/");
}

export async function getApplication(applicationId: string) {
  return request<Application>(`/applications/${applicationId}`);
}

export async function updateApplication(
  applicationId: string,
  data: { status?: string; current_stage?: string }
) {
  return request<Application>(`/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Portfolio (recruiter)
export interface Portfolio {
  id: string;
  application_id: string;
  summary: string | null;
  structured_json: Record<string, unknown> | null;
}

export async function getPortfolio(applicationId: string) {
  return request<Portfolio>(`/applications/${applicationId}/portfolio`);
}

export async function generatePortfolio(applicationId: string) {
  return request<Portfolio>(`/applications/${applicationId}/portfolio`, {
    method: "POST",
  });
}

// Evidence (recruiter)
export interface Evidence {
  id: string;
  application_id: string;
  kind: string;
  title: string | null;
  url_or_path: string | null;
}

export async function listEvidence(applicationId: string) {
  return request<Evidence[]>(`/applications/${applicationId}/evidence`);
}

export async function addEvidence(
  applicationId: string,
  data: { kind?: string; title?: string | null; url_or_path?: string | null }
) {
  return request<Evidence>(`/applications/${applicationId}/evidence`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Rubric score (recruiter)
export interface RubricScore {
  id: string;
  application_id: string;
  overall_score: string | null;
  criteria_scores: Array<{ name: string; score: number; max: number }> | null;
  scored_at: string | null;
}

export async function getScore(applicationId: string) {
  return request<RubricScore>(`/applications/${applicationId}/score`);
}

export async function calculateScore(applicationId: string) {
  return request<RubricScore>(`/applications/${applicationId}/score`, {
    method: "POST",
    body: "{}",
  });
}

export interface ChatResponse {
  answer: string;
  citations: Array<{
    doc_id: string;
    title: string;
    chunk_id: string;
    snippet: string;
  }>;
  followups: string[];
}

export async function chatApplication(applicationId: string, message: string) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ application_id: applicationId, message, mode: "apply" }),
  });
}
