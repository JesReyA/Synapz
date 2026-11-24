# requirements.md — Synapz + Feyn

Requerimientos funcionales como historias de usuario con criterios de aceptación (CA).
Etiquetas: **[MVP - HACKATHON]** se construye ahora. **[FASE 2 - POST-HACKATHON]** queda fuera del alcance de la entrega.
Roles: `teacher` (profesor) y `student` (alumno). Regla transversal: todo contenido de IA se ancla al material del profesor (ver `ARCHITECTURE.md` §5).

---

## A. Módulo Profesor [MVP - HACKATHON]

### A1. Crear aulas e invitar alumnos
Como profesor, quiero crear aulas por grupo y materia y generar un código de invitación para que mis alumnos se unan.
- CA1: Puedo crear un aula con nombre, materia y grupo.
- CA2: Al crearla se genera un código único de 6 caracteres alfanuméricos. Puedo regenerarlo, y el anterior deja de funcionar.
- CA3: Un alumno que ingresa un código válido queda como miembro del aula. Un código inválido muestra un error claro.
- CA4: Veo la lista de alumnos del aula.

### A2. Plan de estudios y material
Como profesor, quiero cargar el plan de estudios y adjuntar material por tema para que Feyn se base en mi curso.
- CA1: Puedo crear temas del ciclo y marcar temas previos necesarios (prerrequisitos) para detectar rezago.
- CA2: Cada tema tiene una fecha en un calendario editable (cambiar fecha, reordenar, eliminar).
- CA3: Puedo adjuntar PDF, PPTX o notas de texto a un tema (máx. 20 MB por archivo).
- CA4: El sistema extrae el texto del archivo y me muestra cuántos caracteres se extrajeron. Si el archivo no tiene texto extraíble, me avisa.
- CA5: Un tema sin material no genera lecciones ni evaluaciones de IA y el sistema me lo indica.

### A3. Reportes grupales e individuales
Como profesor, quiero ver reportes para actuar contra el rezago.
- CA1: Reporte grupal: evolución del promedio por tema en el tiempo.
- CA2: Reporte grupal: lista de temas con mayor dificultad y mayor facilidad, ordenada por desempeño.
- CA3: Reporte individual: desempeño por tema, resultado del diagnóstico, lecturas y puntaje de cálculo mental.
- CA4: El sistema sugiere recomendaciones contra el rezago, basadas en los temas con bajo desempeño y sus prerrequisitos.
- CA5: Puedo registrar una estrategia aplicada (fecha y descripción) y el reporte marca el **punto de inflexión**: el cambio de tendencia en el desempeño antes y después de esa fecha.
- CA6: Los reportes marcan los diagnósticos con eventos anti-trampa.

### A4. Temas pendientes y repaso
Como profesor, quiero ver qué temas faltan por impartir o repasar para llegar a la lección rápido.
- CA1: La vista lista los temas por estado: pendiente, impartido, a repasar.
- CA2: Cada tema tiene un acceso directo a su lección y material.
- CA3: Un tema pasa a "a repasar" cuando el desempeño del grupo queda bajo un umbral configurable (por defecto 60 %).

### A5. Puntos extra en el ranking
Como profesor, quiero otorgar puntos extra en el ranking del juego rápido.
- CA1: Puedo sumar puntos a un alumno con un motivo.
- CA2: El ranking se actualiza en vivo para todos los miembros del aula.

---

## B. Onboarding y Diagnóstico Anti-Trampa [MVP - HACKATHON]

### B1. Cuestionario de contexto personal
Como alumno que se une a una clase, quiero contar mis gustos para que las lecciones me resulten cercanas.
- CA1: El cuestionario pregunta: gustos, pasatiempos, actividades diarias, aspiraciones, estilo de aprendizaje preferido (visual, lectura, auditivo) y áreas donde siento que necesito mejorar.
- CA2: No puedo entrar al resto de la app sin completarlo, pero puedo editarlo después.
- CA3: Las respuestas se guardan en mi perfil y se usan en lecciones y lecturas.

### B2. Evaluación diagnóstica cronometrada
Como profesor, quiero un diagnóstico de conocimientos previos para detectar el rezago.
- CA1: El diagnóstico se genera con los temas previos declarados por el profesor.
- CA2: Cada tipo de pregunta (opción múltiple, numérica, abierta corta) tiene su propio tiempo límite visible. Al agotarse, la pregunta se marca sin respuesta y se avanza.
- CA3: Se detectan cambios de pestaña o ventana (`visibilitychange` y `blur`) y se registra cada evento con hora.
- CA4: Al primer evento se muestra una advertencia. Al segundo se invalida el intento y se registra.
- CA5: Se bloquean copiar, pegar, clic derecho y atajos de captura detectables (`PrintScreen`). Se acepta que una captura externa del sistema no se puede impedir: queda como limitación documentada.
- CA6: Al terminar, el resultado muestra los temas previos en los que el alumno tiene rezago.

---

## C. Comprensión Lectora y Coach de Voz [MVP - HACKATHON]

### C1. Lecturas personalizadas
Como alumno, quiero lecturas sobre mis intereses para practicar comprensión.
- CA1: La lectura se genera a partir de mis pasatiempos y del tema o vocabulario del curso.
- CA2: Modalidad **preguntas de comprensión**: 4 a 6 preguntas sobre el texto, con retroalimentación.
- CA3: Modalidad **palabras faltantes**: el texto oculta palabras y yo las completo.
- CA4: La dificultad de la lectura se adapta al nivel detectado en el diagnóstico.

### C2. Lectura en voz alta
Como alumno, quiero leer en voz alta y recibir una calificación para mejorar mi dicción.
- CA1: Puedo grabar mi voz desde el navegador, escucharla y enviarla. El navegador pide permiso de micrófono y, si lo niego, muestra instrucciones.
- CA2: Gemini evalúa el audio: verifica que leí el texto, detecta palabras omitidas o mal pronunciadas y fallos de puntuación (pausas), y asigna una calificación de 0 a 100.
- CA3: Veo la lista de errores con la palabra y la sugerencia.
- CA4: Puedo repetir. Se guarda el mejor puntaje y el historial de intentos.
- CA5: El audio se limita a 10 MB y a 3 minutos.

---

## D. Matemáticas, Explicaciones Adaptativas y Feyn [MVP - HACKATHON]

### D1. Diagnóstico de cálculo mental
Como alumno, quiero una prueba de cálculo mental para conocer mi fluidez.
- CA1: La prueba inicial usa sumas, y el diseño admite añadir otras operaciones.
- CA2: La dificultad sube por nivel y el tiempo por pregunta baja en cada nivel.
- CA3: Se mide exactitud y tiempo de respuesta por pregunta.
- CA4: El resultado incluye consejos y ejemplos cotidianos acordes al desempeño.
- CA5: El resultado queda guardado y visible para el profesor.

### D2. Explicaciones personalizadas multimodales
Como alumno, quiero que me expliquen un tema con mis gustos y en mi formato preferido.
- CA1: Aplica a temas del ciclo y a temas de rezago.
- CA2: La explicación usa mis gustos en los ejemplos (por ejemplo, mecánicas o atributos de *mobs* de Minecraft para programación o matemáticas) sin cambiar el contenido del profesor.
- CA3: Formatos: visual (esquemas o pasos con descripción de imagen), lectura (texto) y auditivo (guion de narración y una canción mnemotécnica).
- CA4: Un botón "Explicar de otra forma" regenera el mismo tema en otro formato.
- CA5: Cada explicación muestra de qué parte del material del profesor proviene.

### D3. Chat conversacional con Feyn (Técnica Feynman)
Como alumno, quiero explicarle el tema a Feyn con mis palabras para comprobar si lo entiendo.
- CA1: Feyn me pide que le explique el tema activo.
- CA2: Feyn compara mi explicación con los apuntes del profesor.
- CA3: Si falta algo o es incorrecto, Feyn finge duda ("Creo que no he entendido muy bien, ¿puedes explicarme tal parte directamente?") y me guía con preguntas, sin dar la respuesta de inmediato.
- CA4: Puedo decir qué se me dificulta y Feyn adapta la guía.
- CA5: Cuando mi explicación cubre los conceptos clave, Feyn lo reconoce y la sesión se marca como dominada.
- CA6: Si pregunto algo fuera del temario, Feyn lo indica y me redirige al tema.
- CA7: La sesión se guarda y alimenta el reporte del profesor.

### D4. Juego rápido y retos de lógica
Como alumno, quiero jugar contra el reloj y competir con mi grupo.
- CA1: El juego muestra preguntas con 2 opciones, con operaciones básicas y temas vistos en clase, contra un reloj por partida.
- CA2: Al terminar, mi puntaje se guarda y el ranking del aula se actualiza en vivo (Realtime) sin recargar.
- CA3: El ranking muestra posición, nombre y puntos (incluidos los extra del profesor).
- CA4: Sección recreativa de **rachas entre amigos** (estilo TikTok): días consecutivos de actividad y comparación con compañeros del aula.
- CA5: **Sudoku** 9x9 en niveles fácil, medio y difícil, con validación de errores y temporizador. Los números son de colores: al elegir un número se resaltan sus iguales en el tablero, y se coloca o se quita tocando las casillas (sin botón de borrar). Las pistas iniciales no se modifican.
- CA6: **Entrada a Retos en cuadrícula Masonry.** Al abrir Retos veo una tarjeta por juego (Batalla rápida, Cálculo mental, Sudoku, Ajedrez, Juego del 15, Buscaminas, Tangram, Tetris y Memorama). Al elegir una se abre solo ese juego, con un botón "Volver a Retos". El ranking del aula y las rachas con los puntos de la semana se ven siempre a la derecha (debajo del contenido en pantallas pequeñas), con la cuadrícula y con cualquier juego abierto.
- CA7: **Ajedrez** para dos jugadores en el mismo dispositivo, con todas las reglas: movimiento de cada pieza, enroque, captura al paso y promoción (elijo la pieza). Marca el jaque y detecta jaque mate, ahogado y tablas por material insuficiente. Solo permite movimientos legales y muestra el historial en notación algebraica.
- CA8: **Juego del 15**: tablero 4×4 mezclado siempre resoluble. Muevo las fichas adyacentes al hueco con clic, toque o flechas del teclado. Muestra el contador de movimientos y el tiempo, y avisa al resolverlo.
- CA9: **Buscaminas** en tres dificultades (fácil 8×8 con 10 minas, medio 10×10 con 20 y difícil 12×12 con 30). El primer clic nunca es una mina, las casillas sin minas cercanas se expanden solas y puedo marcar banderas (clic derecho o modo bandera en pantallas táctiles). Se gana al revelar todas las casillas sin mina y se pierde al pisar una.
- CA10: **Tangram** con las 7 piezas y al menos 4 figuras objetivo. Arrastro las piezas, las giro en pasos de 45° y volteo el paralelogramo. Cada pieza bien colocada se marca y la figura se completa cuando las 7 coinciden con la silueta.
- CA11: **Tetris** con tablero de 10×20, siete tipos de pieza, sombra de caída y las dos piezas siguientes. Las líneas completas se eliminan y suman puntos (100, 300, 500 y 800 por 1, 2, 3 y 4 líneas, por el nivel), el nivel sube cada 10 líneas y la caída se acelera. La partida termina cuando una pieza nueva no cabe. Se juega con teclado o con botones táctiles, y tiene pausa.
- CA12: **Memorama** en tres niveles (6, 8 y 12 parejas). Al voltear dos cartas, si coinciden quedan descubiertas y si no se ocultan solas tras un breve momento, sin permitir más volteos mientras tanto. Cuenta intentos y tiempo, y avisa al encontrar todas las parejas.

---

## E. Continuidad Inter-Ciclo [FASE 2 - POST-HACKATHON]

### E1. Prueba final de nivel de salida
Como profesor, quiero una prueba de salida al cierre del ciclo.
- CA1: Se genera con los temas del ciclo y sus prerrequisitos.
- CA2: El resultado se guarda por alumno.

### E2. Reporte de transición
Como profesor del siguiente grado, quiero un reporte del nivel con el que llega cada alumno.
- CA1: El reporte resume fortalezas, rezagos y recomendaciones por alumno y por grupo.
- CA2: El profesor actual puede compartirlo con el profesor del siguiente ciclo.

### E3. Repaso en vacaciones
Como alumno, quiero ejercicios opcionales de repaso durante las vacaciones.
- CA1: Los ejercicios se generan con el temario del próximo profesor.
- CA2: Son opcionales y su avance se muestra al nuevo profesor.

---

## F. Requisitos no funcionales

- Seguridad: autenticación con Supabase Auth, RLS en todas las tablas, control de acceso por rol.
- Privacidad: los alumnos son menores de edad. Se guarda el mínimo de datos personales y el audio solo se conserva para el historial del propio alumno y su profesor.
- Rendimiento: respuestas de Gemini en menos de 15 s. La interfaz muestra estado de carga.
- Idioma: interfaz y contenido generado en español.
- Accesibilidad: contraste AA, navegación con teclado, soporte de modo claro y oscuro.
- Diseño: el frontend sigue `frontend/web/DESIGN.md`.
