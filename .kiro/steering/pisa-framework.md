---
inclusion: fileMatch
fileMatchPattern: "backend/app/**/*{adaptive,irt,pisa,scoring,socioemotional,telemetry}*.py"
---

# Marco PISA para el motor adaptativo

Resumen operativo. El diseño completo está en `docs/ADAPTIVE_ENGINE.md` y el contrato en `API_CONTRACT.md` §2.17.

- PISA mide aplicar lo aprendido en situaciones reales, no memorizar. Todo reactivo nuevo se ancla a un proceso: `MATH_FORMULATE`, `MATH_EMPLOY`, `MATH_INTERPRET`, `READ_LOCALIZE`, `READ_UNDERSTAND`, `READ_EVALUATE`, `SCIE_EXPLAIN`, `SCIE_DESIGN`, `SCIE_INTERPRET`, `COMP_DECOMPOSE`, `COMP_PATTERN`, `COMP_ABSTRACTION`, `COMP_ALGORITHM`.
- Dominios: `MATH`, `READ`, `SCIE`, `COMP`.
- Escala: puntaje = 500 + 100·θ, con θ en [−3.5, +3.5]. La única tabla de niveles es `_LEVELS` en `services/pisa_scale.py`.
- Modelo 2PL: `P = 1/(1+e^(−α(θ−β)))`. Paso adaptativo `K/(1+0.05·N)` con K = 0.60 y mínimo 0.15.
- Todo reactivo lleva una dificultad β acorde a su nivel PISA.
- Índices WLE: ansiedad ≥ 0.75 oculta relojes; autoeficacia ≤ −0.60 activa el andamiaje; adivinación rápida congela θ y baja perseverancia y metacognición.
- Las constantes se cambian solo en su módulo (`irt.py`, `socioemotional.py`, `scoring.py`, `pisa_catalog.py`). No duplicarlas.
- Regla de Oro: el contenido del curso sale del material del docente. Los reactivos de PISA solo guían la forma de medir.
