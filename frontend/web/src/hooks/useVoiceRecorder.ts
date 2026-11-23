import { useCallback, useEffect, useRef, useState } from "react";
import type { RecorderStatus, RecordingResult } from "../types/learning.ts";

/** Límites de API_CONTRACT.md §2.4: 3 minutos y 10 MB. */
export const MAX_RECORDING_SECONDS = 180;
const MAX_RECORDING_BYTES = 10 * 1024 * 1024;

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
}

interface Options {
  onFinished?: (result: RecordingResult) => void;
}

/**
 * Graba con `getUserMedia` + `MediaRecorder`. Si el navegador o el equipo no tiene micrófono,
 * pasa a un modo de simulación (solo cronómetro) para poder probar el flujo.
 */
export function useVoiceRecorder({ onFinished }: Options = {}) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [simulated, setSimulated] = useState(false);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const simulatedRef = useRef(false);
  const urlRef = useRef<string | null>(null);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (result: RecordingResult) => {
      setRecording(result);
      setStatus("stopped");
      onFinishedRef.current?.(result);
    },
    [],
  );

  const stop = useCallback(() => {
    clearTimer();
    const seconds = Math.min(MAX_RECORDING_SECONDS, Math.round((Date.now() - startedAtRef.current) / 1000));
    setElapsed(seconds);
    if (simulatedRef.current) {
      finish({ blob: null, url: null, duration_sec: seconds, simulated: true });
      return;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, [clearTimer, finish]);

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsed(s);
      if (s >= MAX_RECORDING_SECONDS) stop();
    }, 250);
  }, [stop]);

  const startSimulated = useCallback(() => {
    simulatedRef.current = true;
    setSimulated(true);
    setError(null);
    setRecording(null);
    setStatus("recording");
    startTimer();
  }, [startTimer]);

  const start = useCallback(async () => {
    setError(null);
    setRecording(null);
    revokeUrl();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      startSimulated();
      return;
    }
    setStatus("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
      } else {
        startSimulated(); // sin micrófono conectado u otro fallo de dispositivo
      }
      return;
    }

    simulatedRef.current = false;
    setSimulated(false);
    streamRef.current = stream;
    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      clearTimer();
      releaseStream();
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
      const seconds = Math.min(MAX_RECORDING_SECONDS, Math.round((Date.now() - startedAtRef.current) / 1000));
      if (blob.size > MAX_RECORDING_BYTES) {
        setError("La grabación pesa más de 10 MB. Graba una lectura más corta.");
        setStatus("idle");
        return;
      }
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      finish({ blob, url, duration_sec: seconds, simulated: false });
    };
    recorder.start();
    setStatus("recording");
    startTimer();
  }, [clearTimer, finish, releaseStream, revokeUrl, startSimulated, startTimer]);

  const reset = useCallback(() => {
    clearTimer();
    releaseStream();
    revokeUrl();
    recorderRef.current = null;
    setRecording(null);
    setElapsed(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer, releaseStream, revokeUrl]);

  useEffect(
    () => () => {
      clearTimer();
      releaseStream();
      revokeUrl();
    },
    [clearTimer, releaseStream, revokeUrl],
  );

  return { status, elapsed, simulated, recording, error, start, stop, reset, startSimulated };
}
