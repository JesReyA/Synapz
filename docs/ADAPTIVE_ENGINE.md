# Motor adaptativo PISA

Mide cada partida de **Retos**, estima la habilidad del alumno por dominio con Teoría de Respuesta al Ítem (TRI) y adapta la dificultad y la interfaz. No usa IA: todo son reglas y fórmulas. El contrato está en `API_CONTRACT.md` §2.17 y las tablas en §1.

## 1. Flujo

```
Juego abierto (RetosPage)
  └─ AdaptiveGameBoundary ── GET /api/adaptive/difficulty/{game_id} ──► nivel recomendado + banderas de UX
        │                       (si falla o tarda más de 1.5 s, el juego arranca como siempre)
        ├─ useGameTelemetry: primera acción, inactividad, foco perdido, pistas, reinicios
        └─ el hook del juego llama a useReportOutcome al terminar
              └─ POST /api/adaptive/game-attempts ──► θ nuevo + banderas de UX actualizadas
```

El frontend no conoce PISA. Solo envía métricas crudas; el servidor calcula puntaje, β, θ y niveles.

## 2. Mapa de juegos

Los ids son los de `frontend/web/src/types/games.ts`. El mapa vive en `backend/app/services/pisa_catalog.py`.

| Juego (`game_id`) | Dominio | Proceso | β por nivel | Tiempo mínimo válido |
|---|---|---|---|---|
| Sudoku (`sudoku`) | MATH | `MATH_EMPLOY` | fácil −1.5 · medio 0.2 · difícil 1.8 | 20 s |
| Memorama (`memorama`) | READ | `READ_LOCALIZE` | fácil −1.2 · medio 0.1 · difícil 1.5 | 8 s |
| Buscaminas (`buscaminas`) | SCIE | `SCIE_INTERPRET` | fácil −1.2 · medio 0.4 · difícil 2.0 | 3 s |
| Juego del 15 (`quince`) | MATH | `MATH_EMPLOY` | 0.0 | 5 s |
| Tangram (`tangram`) | MATH | `MATH_SPATIAL` | 1.5 (siempre usa 7 piezas) | 8 s |
| Tetris (`tetris`) | COMP | `COMP_THINK_REALTIME` | 0.0 | 15 s |
| Cálculo mental (`calculo`) | MATH | `MATH_EMPLOY_QUANTITY` | nivel 1…5: −1.2, −0.6, 0.0, 0.9, 1.8 | ráfaga |
| Batalla rápida (`batalla`) | MATH | `MATH_EMPLOY` | 0.0 | ráfaga |
| Ajedrez (`ajedrez`) | COMP | `COMP_THINK` | no se mide | n/a |

Los β y los tiempos son puntos de partida tomados de `integración-pisa-en-minijuegos`. Hay que calibrarlos con datos reales. Batalla rápida se asigna a MATH porque hoy sus preguntas son operaciones y temas del aula (`QuickGameQuestion.source`), no lectura ni ciencias.

## 3. Reglas

### 3.1 Puntaje (`scoring.py`)
Cada juego se reduce a `score_ratio` ∈ [0, 1]. La tabla está en `API_CONTRACT.md` §2.17. Constantes ajustables: `SUDOKU_ERROR_PENALTY`, `SUDOKU_MAX_PENALTY`, `TETRIS_LINES_FOR_FULL_SCORE`.

### 3.2 Adivinación rápida (`telemetry_validator.py`)
- Juegos de ráfaga (`calculo`, `batalla`): tiempo medio de respuesta < 800 ms **y** precisión < 50 %.
- Resto: duración total menor que el tiempo mínimo válido del juego.
- Efecto: el intento se guarda con `is_rapid_guess = true`, θ no cambia, `items_completed` no sube, y bajan perseverancia (−0.12) y metacognición (−0.10).

### 3.3 Habilidad θ (`irt.py`)
- Probabilidad 2PL: `P = 1 / (1 + e^(−α(θ−β)))`, con α = 1.
- Actualización: `θ' = θ + paso · α · (S − P)`, con `paso = max(0.15, 0.60 / (1 + 0.05·N))`, `N` = intentos válidos del dominio.
- `S` = `score_ratio` menos 0.15 por pista pedida. θ se limita a [−3.5, +3.5].

### 3.4 Escala PISA (`pisa_scale.py`)
Puntaje = `500 + 100·θ`. Es la **única** tabla de niveles del proyecto:

| Puntaje | Nivel | Puntaje | Nivel |
|---|---|---|---|
| ≥ 669 | 6 | 387–447 | 2 (competencia básica) |
| 571–668 | 5 | 326–386 | 1a |
| 510–570 | 4 | < 326 | 1b/1c |
| 448–509 | 3 | | |

`reference_level` del perfil es el nivel del θ medio de los dominios con intentos válidos. Tiene la misma forma que `ReferenceLevel` de `GET /api/progress/me`.

### 3.5 Índices socioemocionales (`socioemotional.py`)
Un intento es **fallo** si `score_ratio < 0.5` y no es adivinación rápida.

| Evento | Efecto |
|---|---|
| Éxito | autoeficacia +0.08, ansiedad −0.06; si venía de fallos, perseverancia +0.10 |
| Fallo con ≥ 2 fallos seguidos previos | ansiedad +0.15 |
| Fallo con β ≤ θ y ≥ 1 fallo previo | autoeficacia −0.10 |
| Cualquier intento válido | perseverancia y metacognición +0.03 |

Banderas: `hide_timers` si ansiedad ≥ 0.75; `auto_enable_scaffolding` si autoeficacia ≤ −0.60. Los índices se limitan a ±3.

### 3.6 Dificultad recomendada (`difficulty_planner.py`)
Objetivo `β = θ + 0.25`. Se elige el nivel del juego con β más cercano (el más fácil gana empates). Solo Sudoku, Memorama y Buscaminas la aplican: sus hooks leen `recommendedLevel` como nivel inicial. El resto de los juegos no tiene selector de nivel en la partida.

## 4. Qué hace la interfaz con las banderas

| Bandera | Efecto hoy |
|---|---|
| `hide_timers` | `GameShell` oculta el reloj (Buscaminas, Memorama, Juego del 15, Tangram, Tetris). El Sudoku oculta su cronómetro. Batalla rápida y Cálculo mental ocultan los segundos numéricos; su barra de tiempo se queda porque el límite es parte del juego. |
| `auto_enable_scaffolding` | Disponible en `useGameSession().autoScaffolding`. Ningún juego tiene pistas todavía, así que nada lo consume. |

## 5. Decisiones frente a los documentos fuente

Los tres documentos PISA no coinciden entre sí. Se resolvió así:

1. **Niveles PISA:** gana la tabla del documento de marco (steering). Su columna de θ da 633 para el Nivel 6, pero su columna de puntajes da 669; se usa 669 (coincide con PISA). Cambiarlo es editar `_LEVELS` en `pisa_scale.py`.
2. **Rango de θ:** ±3.5.
3. **Andamiaje:** solo por autoeficacia (steering). La ansiedad solo oculta relojes.
4. **Adivinación rápida:** se aplican las dos reglas, según el tipo de juego (§3.2).
5. **Errores de los fragmentos de código fuente:** `scalar_one()` fallaba con un alumno nuevo (aquí se usan valores por defecto); el `attempt_id` en claro permitía enviar intentos ajenos (aquí el alumno sale del JWT y cada intento nace en el servidor).

## 6. Fuera de alcance (a propósito)

- **Banco de reactivos `pisa_items`, rúbricas de crédito parcial y andamiaje por ítem:** los juegos generan su contenido localmente y el banco choca con la Regla de Oro (el contenido sale del material del docente). Es Fase 2.
- **Bonos del documento de minijuegos** (+0.20 `RETRIEVAL_SPEED`, +0.30 θ por notas en Sudoku): requieren métricas que los juegos no capturan (multiplicador, notas en pencil) y una dimensión que el modelo no tiene.
- **Ajedrez:** no se mide.
- **Partidas abandonadas:** no se envía nada si el alumno sale a mitad de una partida.
- **Carreras de escritura:** θ se lee y se escribe sin transacción. Es aceptable mientras un alumno juega una partida a la vez.
- **Lectura por el docente:** las tablas solo tienen política de lectura para el propio alumno.
- **Cliente HTTP real:** `services/mockAdaptive.ts` es un mock con la firma definitiva. No hay token de Supabase en el frontend todavía (`services/auth.ts` es una simulación), así que el reemplazo llega junto con el login real.

## 7. Añadir un juego o una métrica

1. Añadir su `GameSpec` en `pisa_catalog.py` (dominio, proceso, β, métricas obligatorias, tiempo mínimo) y su regla en `scoring.score_ratio` si no encaja en un `ScoringKind` existente.
2. Añadir el id al `check` de `game_attempts.game_id` en una migración nueva.
3. En el hook del juego, llamar a `useReportOutcome(done, () => ({ level, completed, metrics }))`.
4. Envolver el juego con `withAdaptiveGame` en `gameRegistry.ts`.

## 8. Pruebas

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Las pruebas cubren las funciones puras, el servicio (con un repositorio en memoria) y el router (JWT y errores). No necesitan Supabase.
