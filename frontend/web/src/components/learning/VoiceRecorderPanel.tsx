import { Loader2, Mic, MicOff, Square, FlaskConical } from "lucide-react";
import { MAX_RECORDING_SECONDS } from "../../hooks/useVoiceRecorder.ts";
import type { RecorderStatus, RecordingResult } from "../../types/learning.ts";
import { INNER_CARD, OUTLINE_BUTTON, formatClock } from "./styles.ts";

interface VoiceRecorderPanelProps {
  status: RecorderStatus;
  elapsed: number;
  simulated: boolean;
  recording: RecordingResult | null;
  error: string | null;
  evaluating: boolean;
  onStart: () => void;
  onStop: () => void;
  onSimulate: () => void;
}

export function VoiceRecorderPanel({
  status,
  elapsed,
  simulated,
  recording,
  error,
  evaluating,
  onStart,
  onStop,
  onSimulate,
}: VoiceRecorderPanelProps) {
  const isRecording = status === "recording";
  const busy = status === "requesting" || evaluating;

  return (
    <div className={`${INNER_CARD} flex flex-col items-center gap-3 text-center`}>
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        disabled={busy}
        aria-label={isRecording ? "Detener grabación" : "Empezar a grabar"}
        className={`relative grid size-20 place-items-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 dark:focus-visible:ring-offset-[#161E30] ${
          isRecording
            ? "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-400 dark:text-slate-900"
            : "bg-amber-400 text-slate-900 hover:bg-amber-300"
        }`}
      >
        {isRecording && (
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40 dark:bg-rose-400/40" aria-hidden="true" />
        )}
        {busy ? (
          <Loader2 className="size-8 animate-spin" strokeWidth={2} />
        ) : isRecording ? (
          <Square className="relative size-7 fill-current" />
        ) : (
          <Mic className="size-8" strokeWidth={1.75} />
        )}
      </button>

      <p className="text-2xl font-bold text-slate-900 tabular-nums dark:text-white" role="timer" aria-label="Tiempo de grabación">
        {formatClock(elapsed)}
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400"> / {formatClock(MAX_RECORDING_SECONDS)}</span>
      </p>

      <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
        {status === "idle" && "Pulsa el micrófono y lee el texto en voz alta."}
        {status === "requesting" && "Esperando permiso del micrófono…"}
        {isRecording && "Grabando… pulsa el cuadro cuando termines."}
        {status === "stopped" && evaluating && "Feyn está escuchando tu lectura…"}
        {status === "stopped" && !evaluating && "Grabación lista."}
      </p>

      {simulated && (status === "recording" || status === "stopped") && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
          <FlaskConical className="size-3.5" strokeWidth={2} />
          Modo simulación: no se grabó audio real
        </p>
      )}

      {recording?.url && <audio controls src={recording.url} className="w-full max-w-sm" aria-label="Escucha tu grabación" />}

      {error && (
        <p role="alert" className="rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
          {error}
        </p>
      )}

      {status === "denied" && (
        <div role="alert" className="flex flex-col items-center gap-2 rounded-2xl bg-orange-100 p-4 text-left text-sm text-orange-900 dark:bg-amber-900/40 dark:text-amber-100">
          <p className="flex items-center gap-2 font-semibold">
            <MicOff className="size-4 shrink-0" strokeWidth={1.75} />
            No tenemos permiso para usar tu micrófono
          </p>
          <ol className="list-decimal pl-5 text-xs leading-relaxed">
            <li>Haz clic en el candado junto a la dirección de la página.</li>
            <li>Abre «Permisos» y cambia «Micrófono» a «Permitir».</li>
            <li>Recarga la página y vuelve a pulsar el micrófono.</li>
          </ol>
          <button type="button" onClick={onSimulate} className={OUTLINE_BUTTON}>
            Practicar en modo simulación
          </button>
        </div>
      )}
    </div>
  );
}
