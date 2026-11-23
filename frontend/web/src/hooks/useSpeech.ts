import { useCallback, useEffect, useState } from "react";

export type SpeechStatus = "idle" | "playing" | "paused";

const supported = typeof window !== "undefined" && "speechSynthesis" in window;

/** Lee un texto en voz alta con la Web Speech API (voz en español si existe). */
export function useSpeech(text: string) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel();
    },
    [text],
  );

  const play = useCallback(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("es"));
    if (voice) utterance.voice = voice;
    utterance.onboundary = (e) => setProgress(Math.min(1, e.charIndex / Math.max(1, text.length)));
    utterance.onend = () => {
      setProgress(1);
      setStatus("idle");
    };
    utterance.onerror = () => setStatus("idle");
    setProgress(0);
    setStatus("playing");
    synth.speak(utterance);
  }, [text]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus("playing");
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setProgress(0);
    setStatus("idle");
  }, []);

  return { supported, status, progress, play, pause, resume, stop };
}
