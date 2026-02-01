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
  cv_file_path?: string | null;
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

/** Upload CV for an application (Pluto stage). Accepts PDF, DOC, DOCX. */
export async function uploadCv(applicationId: string, file: File): Promise<{ cv_file_path: string; has_extracted_text: boolean }> {
  const url = `${API_BASE}/api/v1/applications/${applicationId}/cv`;
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json();
}

/** URL to download/view CV (for HR or applicant). */
export function getCvUrl(applicationId: string): string {
  const base = API_BASE.replace(/\/$/, "");
  return `${base}/api/v1/applications/${applicationId}/cv`;
}

export interface ConversationMessage {
  role: string;
  content: string;
}

export async function appendConversationMessages(
  applicationId: string,
  messages: ConversationMessage[]
) {
  return request<{ id: string; application_id: string; messages_json: ConversationMessage[] }>(
    `/applications/${applicationId}/conversation`,
    {
      method: "POST",
      body: JSON.stringify({ messages }),
    }
  );
}

export interface ChatCitation {
  doc_id: string;
  title: string;
  chunk_id: string;
  snippet: string;
}

export interface ChatResponse {
  answer: string;
  citations: ChatCitation[];
  followups: string[];
}

export async function sendChat(applicationId: string, message: string) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ application_id: applicationId, message }),
  });
}

export async function createSaturnAnswer(applicationId: string, sdp: string) {
  return request<{ answer_sdp: string }>("/saturn/webrtc", {
    method: "POST",
    body: JSON.stringify({ application_id: applicationId, sdp }),
  });
}

export async function finalizeSaturnDecisionPack(applicationId: string, transcript?: string) {
  return request<{ id: string; application_id: string; decision_json: Record<string, unknown> }>(
    "/saturn/decision-pack",
    {
      method: "POST",
      body: JSON.stringify({ application_id: applicationId, transcript }),
    }
  );
}

export async function getSaturnDecisionPack(applicationId: string) {
  return request<{
    id: string;
    application_id: string;
    decision_json: Record<string, unknown>;
    transcript_text?: string | null;
    created_at: string;
  }>(`/saturn/decision-pack/${applicationId}`);
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
