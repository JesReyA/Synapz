from pydantic import BaseModel, Field

# Define lo que recibirá el modelo
class FeynChatRequest(BaseModel):
    #Titulo del tema
    topic_title: str

    #Material que subio el profesor
    teacher_material: str

    #Explicación del profesor
    student_explanation: str

# Indica lo que se debe recibir del modelo, se explica como este debe comportarse
class FeynChatResponse(BaseModel):
    #Respuesta del modelo y como debe responder
    reply: str = Field(description="Respuesta socrática de Feyn fingiendo duda por si falta algo.")
    
    #Porcentaje o puntución que se genera dependiendo del conoceimiento que se presenta de tema
    mastery_score: str = Field(ge=0, le=100, description="Porcentaje de dominio demostrado (0-100).")
    
    #Lista de conceptos que el alumno no explicó
    missing_concepts: list[str] = Field(description="Conceptos clave del profesor que el alumno no explicó.")
