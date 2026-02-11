"use client";

import { useState, useRef } from "react";
import { uploadCv } from "@/lib/api";

const ACCEPT =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx";
const MAX_SIZE_MB = 10;

interface PlutoStageProps {
  applicationId: string;
  hasCv: boolean;
  onCvUploaded: () => void;
  onComplete: () => void;
}

export function PlutoStage({ applicationId, hasCv, onCvUploaded, onComplete }: PlutoStageProps) {
  const [consent, setConsent] = useState(false);
  const [aiNotice, setAiNotice] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedName(file.name);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File must be under ${MAX_SIZE_MB} MB`);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      await uploadCv(applicationId, file);
      onCvUploaded();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const canContinue = consent && aiNotice && hasCv;

  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        Welcome to Orbit. This process is AI-assisted: we use your CV and conversation to build
        your Candidate Portfolio. A human will always review your portfolio before any hiring
        decision.
      </p>

      {/* CV upload */}
      <div className="rounded-lg border border-[#e8e6e3]/20 bg-[#0a0a0f]/50 p-4 space-y-3">
        <h3 className="font-medium text-[#e8e6e3]">Upload your CV</h3>
        <p className="text-sm text-[#e8e6e3]/70">
          PDF, DOC or DOCX (max {MAX_SIZE_MB} MB). We use it to personalise later steps and so
          recruiters can review your profile.
        </p>
        {hasCv ? (
          <div className="flex items-center gap-3 text-sm text-[#22d3ee]">
            <span className="font-medium">CV uploaded</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-[#e8e6e3]/80 hover:underline disabled:opacity-50"
            >
              Replace
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onMouseDown={() => setSelectedName(null)}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-lg border border-[#e8e6e3]/40 text-[#e8e6e3] text-sm font-medium hover:bg-[#e8e6e3]/10 disabled:opacity-50 transition"
            >
              {uploading ? "Uploading…" : "Choose file"}
            </button>
          </div>
        )}
        {selectedName && !hasCv && !uploading && (
          <p className="text-xs text-[#e8e6e3]/70">Selected: {selectedName}</p>
        )}
        {uploadError && (
          <p className="text-sm text-[#f97316]">{uploadError}</p>
        )}
      </div>

      <div className="rounded-lg border border-[#e8e6e3]/20 bg-[#0a0a0f]/50 p-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={aiNotice}
            onChange={(e) => setAiNotice(e.target.checked)}
            className="mt-1 rounded border-[#e8e6e3]/40 focus:ring-[#22d3ee]"
          />
          <span>
            I understand that AI helps extract and structure my answers into a portfolio. I&apos;ve
            read the human-review statement.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 rounded border-[#e8e6e3]/40 focus:ring-[#22d3ee]"
          />
          <span>I consent to data processing for this application.</span>
        </label>
      </div>
      <button
        type="button"
        onClick={onComplete}
        disabled={!canContinue}
        className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Continue to Ignition
      </button>
    </div>
  );
}
