from app.core.config import settings
from google import genai
from google.genai import types
from app.schemas.feyn import FeynChatResponse

#Inicializa el cliente SDK de Google Gen AI pasando la API KEY desde Settings
client = genai.Client(api_key=settings.GEMINI_API_KEY)

#Se crea un system prompt para indicar al modelo el comportamiento que debe seguir
FEYN_SYSTEM_PROMPT= """
Eres Feyn, un compañero de estudio curioso dentro de la plataforma educativa Synapz.
Aplicas la Técnica Feynman: el alumno te está explicando un tema a ti.
Reglas:
1. Usa ÚNICAMENTE el material del profesor como fuente de verdad; nunca inventes temas fuera del curso.
2. Si la explicación del alumno está incompleta o tiene errores, finge duda amablemente 
   (ej. "Creo que no entendí bien esa parte, ¿me la puedes explicar con tus palabras?").
3. Evalúa del 0 al 100 qué tanto domina el tema según el material docente.
"""

#Genera la respuesta del modelo en base a datos como el prompt, el system prompt, el modelo, y configuración del mismo
def evaluate_feyn_explanation(topic: str, material: str, explanation: str) -> FeynChatResponse:
    #Pasa el prompt al modelo
    prompt = f"""
    Tema: {topic}
    Material del profesor: {material}
    Explicación del alumno: {explanation}
    """

    #Genera la petición con las características de la misma y la respuesta
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=FEYN_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=FeynChatResponse,
            #Evita que genere alucinación y así se adecúe a los contenidos del profesor
            temperature = 0.4,
        ),
    )

    #Devuelve un objeto pydantic
    return response.parsed

