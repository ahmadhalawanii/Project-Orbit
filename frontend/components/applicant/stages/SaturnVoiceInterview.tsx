"use client";

import { useEffect, useRef, useState } from "react";
import { createSaturnAnswer, finalizeSaturnDecisionPack } from "@/lib/api";

type Status = "idle" | "connecting" | "live" | "ended" | "error";

interface SaturnVoiceInterviewProps {
  applicationId: string;
  onEnded?: () => void;
}

export function SaturnVoiceInterview({ applicationId, onEnded }: SaturnVoiceInterviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stop();
    };
    // We intentionally run this cleanup only on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    setStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      transcriptRef.current = "";

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
        }
      };

      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }

      const eventsChannel = pc.createDataChannel("oai-events");
      eventsChannel.onmessage = (event) => {
        const text = extractTranscript(event.data);
        if (text) {
          transcriptRef.current = `${transcriptRef.current} ${text}`.trim();
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);
      const localSdp = pc.localDescription?.sdp;
      if (!localSdp) {
        throw new Error("Failed to generate WebRTC SDP offer.");
      }

      const response = await createSaturnAnswer(applicationId, localSdp);
      await pc.setRemoteDescription({ type: "answer", sdp: response.answer_sdp });

      setStatus("live");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to start voice interview.");
      stop();
    }
  }

  function stop() {
    pcRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (status !== "error") {
      setStatus("ended");
      const transcript = transcriptRef.current.trim() || undefined;
      void finalizeSaturnDecisionPack(applicationId, transcript).catch(() => null);
      onEnded?.();
    }
  }

  function extractTranscript(data: unknown): string | null {
    if (typeof data !== "string") return null;
    try {
      const payload = JSON.parse(data);
      if (!payload || typeof payload !== "object") return null;
      if (typeof payload.text === "string") return payload.text;
      if (typeof payload.transcript === "string") return payload.transcript;
      const type = typeof payload.type === "string" ? payload.type : "";
      if (typeof payload.delta === "string" && type.includes("transcript")) return payload.delta;
      if (typeof payload.delta === "string" && type.includes("output_text")) return payload.delta;
    } catch {
      return null;
    }
    return null;
  }

  function waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
    if (pc.iceGatheringState === "complete") {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        pc.removeEventListener("icegatheringstatechange", handleStateChange);
        resolve();
      }, 1500);
      const handleStateChange = () => {
        if (pc.iceGatheringState === "complete") {
          window.clearTimeout(timeoutId);
          pc.removeEventListener("icegatheringstatechange", handleStateChange);
          resolve();
        }
      };
      pc.addEventListener("icegatheringstatechange", handleStateChange);
    });
  }

  return (
    <div className="space-y-3">
      <audio ref={audioRef} autoPlay />
      {status !== "live" ? (
        <button
          type="button"
          onClick={start}
          className="px-4 py-2 rounded-lg bg-[#22d3ee] text-[#0a0a0f] font-medium hover:bg-[#22d3ee]/90 transition"
          disabled={status === "connecting"}
        >
          {status === "connecting" ? "Connecting..." : "Start voice interview"}
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="px-4 py-2 rounded-lg bg-[#f97316] text-white font-medium hover:bg-[#f97316]/90 transition"
        >
          End interview
        </button>
      )}
      <p className="text-xs text-[#e8e6e3]/70">Status: {status}</p>
      {error && <p className="text-sm text-[#f97316]">{error}</p>}
    </div>
  );
}
