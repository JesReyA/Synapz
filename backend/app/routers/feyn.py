from fastapi import APIRouter, HTTPException
from app.schemas.feyn import FeynChatRequest, FeynChatResponse
from app.services.gemini_service import evaluate_feyn_explanation


router = APIRouter(prefix="/api/feyn", tags=["Feyn AI"])

@router.post("/chat", response_model=FeynChatResponse)
def chat_with_feyn(payload: FeynChatRequest)-> FeynChatResponse:
    try:
        result = evaluate_feyn_explanation(
            topic= payload.topic_title,
            material= payload.teacher_material,
            explanation= payload.student_explanation,
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar con Feyn: {str(e)}")