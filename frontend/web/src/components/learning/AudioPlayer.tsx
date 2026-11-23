import type { LucideIcon } from "lucide-react";
import { Pause, Play, Square } from "lucide-react";
import { useSpeech } from "../../hooks/useSpeech.ts";
import { INNER_CARD } from "./styles.ts";

interface AudioPlayerProps {
  title: string;
  text: string;
  icon: LucideIcon;
  /** Muestra el texto línea por línea (letra de canción). */
  asLyrics?: boolean;
}

/** Reproductor de narración con la voz del navegador. Debe montarse con `key={text}`. */
export function AudioPlayer({ title, text, icon: Icon, asLyrics = false }: AudioPlayerProps) {
  const { supported, status, progress, play, pause, resume, stop } = useSpeech(text);
  const playing = status === "playing";

  function toggle() {
    if (status === "idle") play();
    else if (playing) pause();
    else resume();
  }

  return (
    <div className={INNER_CARD}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!supported}
          aria-label={playing ? `Pausar ${title}` : `Reproducir ${title}`}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-900 transition-colors hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:focus-visible:ring-offset-[#161E30]"
        >
          {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <Icon className="size-4 text-blue-500 dark:text-blue-300" strokeWidth={1.75} />
            {title}
          </h3>
          <div
            role="progressbar"
            aria-label={`Avance de ${title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-[#2A3347]"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-200 dark:bg-emerald-400"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={stop}
          disabled={!supported || status === "idle"}
          aria-label={`Detener ${title}`}
          className="grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/5"
        >
          <Square className="size-4 fill-current" />
        </button>
      </div>

      {!supported && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Tu navegador no tiene voz integrada. Puedes leer el texto de abajo.
        </p>
      )}

      {asLyrics ? (
        <p className="mt-3 border-l-2 border-amber-400 pl-3 text-sm leading-relaxed whitespace-pre-line text-slate-700 italic dark:text-slate-200">
          {text.split("\n").map((line) => `♪ ${line}`).join("\n")}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
      )}
    </div>
  );
}
